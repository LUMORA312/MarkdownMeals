import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DishCard } from '@/components/DishCard';
import { useRestaurant, useCreateToken } from '@/hooks/use-api';
import { Feeds, PRICE_RANGE_MAX, PriceRange } from '@/types/food';
import { ArrowLeft, Tag, Loader2, ExternalLink, Check } from 'lucide-react';

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
      <div className="relative h-32 sm:h-36 overflow-hidden">
        <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center cursor-pointer safe-top"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>

        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/90 backdrop-blur-sm">
          <Tag className="w-3 h-3 text-destructive-foreground" />
          <span className="text-xs font-body font-bold text-destructive-foreground">{activeDealCount} deal{activeDealCount !== 1 ? 's' : ''}</span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-4">
          <h1 className="text-xl sm:text-2xl font-display text-primary-foreground leading-tight">{restaurant.name}</h1>
          <div className="flex gap-1 mt-1">
            {restaurant.categories.map((c) => (
              <span key={c} className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Instruction */}
      <div className="px-4 py-3">
        <p className="text-sm text-muted-foreground font-body text-center flex items-center justify-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5" />
          Tap a deal to claim it
        </p>
      </div>

      {/* Claimed toast */}
      <AnimatePresence>
        {claimedDishId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground shadow-elevated font-body text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            Opening deal...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dish Grid */}
      <div className="px-3 sm:px-4 pb-8 max-w-lg mx-auto">
        {activeDishes.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {activeDishes.map((dish, i) => (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
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
