import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DishCard } from '@/components/DishCard';
import { useRestaurant, useCreateToken } from '@/hooks/use-api';
import { Feeds, PRICE_RANGE_MAX, PriceRange } from '@/types/food';
import { ArrowLeft, Tag, Loader2, Check, MapPin } from 'lucide-react';

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const feedsFilter = searchParams.get('feeds') as Feeds | null;
  const priceFilter = searchParams.get('price') as PriceRange | null;
  const priceMax = priceFilter ? PRICE_RANGE_MAX[priceFilter] : null;
  const { data: restaurant, isLoading } = useRestaurant(id);
  const createTokenMutation = useCreateToken();
  const [claimedDishId, setClaimedDishId] = useState<string | null>(null);

  const handleDealTap = async (dishId: string) => {
    if (!restaurant || createTokenMutation.isPending) return;

    try {
      await createTokenMutation.mutateAsync({
        restaurantId: restaurant.id,
        dishIds: [dishId],
      });
      setClaimedDishId(dishId);
      const dish = restaurant.dishes.find((d) => d.id === dishId);
      const url = dish?.destinationUrl || restaurant.redirectUrl;
      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
        setClaimedDishId(null);
      }, 400);
    } catch (err) {
      console.error('Failed to log redirect:', err);
      setClaimedDishId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-muted-foreground font-body">Loading deals...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Tag className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground font-body text-center">Restaurant not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-body text-accent underline underline-offset-2 cursor-pointer py-2"
        >
          Go back
        </button>
      </div>
    );
  }

  const activeDishes = restaurant.dishes.filter((d) => {
    if (d.dealExpiresAt <= Date.now()) return false;
    if (feedsFilter && d.feeds !== feedsFilter) return false;
    if (priceMax && d.price > priceMax) return false;
    return true;
  });
  const activeDealCount = activeDishes.length;

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Hero */}
      <div className="relative h-44 sm:h-52 overflow-hidden">
        <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/10" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 sm:p-4 safe-top">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card/70 backdrop-blur-md flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/90 backdrop-blur-sm">
            <Tag className="w-3 h-3 text-destructive-foreground" />
            <span className="text-xs font-body font-bold text-destructive-foreground">
              {activeDealCount} deal{activeDealCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Restaurant info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <h1 className="text-2xl sm:text-3xl font-display text-primary-foreground leading-tight drop-shadow-md">
            {restaurant.name}
          </h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {restaurant.categories.map((c) => (
              <span key={c} className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm font-body">
                {c}
              </span>
            ))}
            {restaurant.distance > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-primary-foreground/70 font-body">
                <MapPin className="w-3 h-3" />
                {restaurant.distance.toFixed(1)} mi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subheader with instruction */}
      <div className="px-4 py-4 border-b border-border/50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-base font-display text-foreground">Active Deals</h2>
            <p className="text-xs text-muted-foreground font-body mt-0.5">Tap any deal to claim it</p>
          </div>
          {activeDealCount > 0 && (
            <span className="text-xs font-body text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {activeDealCount} available
            </span>
          )}
        </div>
      </div>

      {/* Claimed toast */}
      <AnimatePresence>
        {claimedDishId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-elevated font-body text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            Opening deal...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dish Grid */}
      <div className="px-4 py-5 pb-10 max-w-2xl mx-auto">
        {activeDishes.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {activeDishes.map((dish, i) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <DishCard
                  dish={dish}
                  onTap={() => handleDealTap(dish.id)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 gap-3"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Tag className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground font-body text-center max-w-xs">
              No active deals match your filters right now. Check back soon!
            </p>
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-body text-accent underline underline-offset-2 cursor-pointer py-2"
            >
              Browse other restaurants
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
