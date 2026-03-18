import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRestaurant, useCreateToken, useDishReviewSummary } from '@/hooks/use-api';
import { DEAL_ICONS, REVIEW_BADGE_ICONS, ReviewBadge, REVIEW_BADGES } from '@/types/food';
import { ReviewFlow } from '@/components/ReviewFlow';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Clock, ExternalLink, Loader2, Tag, MapPin } from 'lucide-react';
import { resolveImageUrl } from '@/lib/api';
import { LoadingScreen } from '@/components/LoadingScreen';

function formatExpiry(expiresAt: number): string | null {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

export default function DealDetail() {
  const { restaurantId, dishId } = useParams<{ restaurantId: string; dishId: string }>();
  const navigate = useNavigate();
  const { data: restaurant, isLoading } = useRestaurant(restaurantId);
  const createTokenMutation = useCreateToken();
  const { data: reviewSummary } = useDishReviewSummary(dishId);
  const [redirecting, setRedirecting] = useState(false);

  const dish = restaurant?.dishes.find((d) => d.id === dishId);
  const timeLeft = dish ? formatExpiry(dish.dealExpiresAt) : null;
  const isUrgent = dish ? dish.dealExpiresAt - Date.now() < 3600000 : false;

  const handleGetDeal = async () => {
    if (!restaurant || !dish || redirecting) return;
    setRedirecting(true);
    try {
      await createTokenMutation.mutateAsync({
        restaurantId: restaurant.id,
        dishIds: [dish.id],
      });
      const url = dish.destinationUrl || restaurant.redirectUrl;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to log redirect:', err);
    } finally {
      setRedirecting(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading deal..." />;
  }

  if (!restaurant || !dish) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center">
          <Tag className="w-8 h-8 text-amber-400" />
        </div>
        <p className="text-base text-muted-foreground font-body text-center">Deal not found.</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="text-base font-body font-medium text-accent hover:text-accent/80 underline underline-offset-2 cursor-pointer py-2 transition-colors"
        >
          Go back
        </motion.button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background safe-bottom">
      {/* Full-page background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/pad-thai.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'multiply',
          opacity: 0.06,
        }}
      />

      {/* Hero image */}
      <div className="relative h-44 sm:h-52 overflow-hidden">
        <img
          src={resolveImageUrl(dish.image)}
          alt={dish.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

        {/* Back button */}
        <div className="absolute top-0 left-0 px-4 pt-8 safe-top">
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center cursor-pointer shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-accent-foreground" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Price badge */}
        <div className="absolute top-0 right-0 px-4 pt-8 safe-top">
          <div className="px-4 py-2 rounded-full bg-accent/95 backdrop-blur-sm shadow-md">
            <span className="text-lg font-body font-extrabold text-accent-foreground">
              ${dish.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Deal type tag */}
        {dish.dealType && (
          <div className="absolute bottom-16 left-4">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-destructive/90 backdrop-blur-sm">
              <span className="text-sm">{DEAL_ICONS[dish.dealType]}</span>
              <span className="text-xs font-body font-bold text-destructive-foreground">{dish.dealType}</span>
            </div>
          </div>
        )}

        {/* Dish name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <h1 className="text-2xl sm:text-3xl font-display text-primary-foreground leading-tight drop-shadow-md">
            {dish.name}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-5 max-w-2xl mx-auto">
        {/* Restaurant info */}
        <div className="flex items-center gap-2 mb-4">
          <img
            src={resolveImageUrl(restaurant.coverImage)}
            alt={restaurant.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-amber-300"
          />
          <div>
            <p className="text-sm font-body font-semibold text-foreground">{restaurant.name}</p>
            <div className="flex items-center gap-2">
              {restaurant.distance > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground font-body">
                  <MapPin className="w-3 h-3" />
                  {restaurant.distance.toFixed(1)} mi
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Deal details */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {/* Category */}
          <span className="text-xs px-2.5 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-700 font-body font-medium">
            {dish.category}
          </span>

          {/* Taste */}
          <span className="text-xs px-2.5 py-1 rounded-full bg-violet-100 border border-violet-200 text-violet-700 font-body font-medium">
            {dish.primaryTaste}
          </span>

          {/* Feeds */}
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-700 font-body font-medium">
            Feeds {dish.feeds}
          </span>

          {/* Modifiers */}
          {dish.modifiers.map((m) => (
            <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 font-body font-medium">
              {m}
            </span>
          ))}

          {/* Expiry */}
          {timeLeft && (
            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-body font-medium ${
              isUrgent
                ? 'bg-rose-100 border border-rose-300 text-rose-700'
                : 'bg-gray-100 border border-gray-200 text-gray-600'
            }`}>
              <Clock className="w-3 h-3" />
              {timeLeft}
            </span>
          )}
        </div>

        {/* Review summary badges — show if any reviews exist */}
        {reviewSummary && reviewSummary.total > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-5">
            {REVIEW_BADGES.filter((b) => reviewSummary.badges[b]).map((badge) => (
              <span
                key={badge}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-pink-100 border border-pink-200 text-pink-700 font-body font-medium"
              >
                <span>{REVIEW_BADGE_ICONS[badge as ReviewBadge]}</span>
                {reviewSummary.badges[badge]}
              </span>
            ))}
            <span className="text-xs text-muted-foreground font-body">
              {reviewSummary.total} review{reviewSummary.total !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Get Deal button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.01 }}
          onClick={handleGetDeal}
          disabled={redirecting}
          className="btn-shine btn-glow icon-bounce flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-gradient-to-r from-accent via-accent/90 to-accent/70 text-accent-foreground font-body font-extrabold text-lg tracking-wide cursor-pointer transition-all disabled:opacity-50 mb-6"
        >
          {redirecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Opening deal...
            </>
          ) : (
            <>
              <ExternalLink className="w-5 h-5" strokeWidth={2.5} />
              Get Deal
            </>
          )}
        </motion.button>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />

        {/* Review section */}
        <ReviewFlow dishId={dish.id} restaurantId={restaurant.id} />
      </div>

      {/* Redirect overlay */}
      <AnimatePresence>
        {redirecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-foreground/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 px-8 py-6 rounded-2xl bg-white border border-amber-200 shadow-elevated"
            >
              <Loader2 className="w-7 h-7 text-accent animate-spin" />
              <p className="text-base font-body font-medium text-foreground">Opening deal...</p>
              <div className="w-48 h-1.5 rounded-full bg-amber-100 overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                  className="h-full rounded-full bg-accent"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
