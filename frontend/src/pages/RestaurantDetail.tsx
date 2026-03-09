import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DishCard } from '@/components/DishCard';
import { useRestaurant, useCreateToken } from '@/hooks/use-api';
import { Feeds, PRICE_RANGE_MAX, PriceRange, PrimaryTaste, PRIMARY_TASTES, DealType, DEAL_TYPES, EatingStyle, Category } from '@/types/food';
import { ArrowLeft, Tag, Loader2, MapPin, ChevronUp, ChevronDown } from 'lucide-react';

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const feedsFilter = searchParams.get('feeds') as Feeds | null;
  const priceFilter = searchParams.get('price') as PriceRange | null;
  const priceMax = priceFilter ? PRICE_RANGE_MAX[priceFilter] : null;
  const tastesParam = searchParams.get('tastes');
  const tasteFilters = tastesParam ? tastesParam.split(',').filter((t): t is PrimaryTaste => PRIMARY_TASTES.includes(t as PrimaryTaste)) : [];
  const dealsParam = searchParams.get('deals');
  const dealFilters = dealsParam ? dealsParam.split(',').filter((d): d is DealType => DEAL_TYPES.includes(d as DealType)) : [];
  const styleFilter = searchParams.get('style') as EatingStyle | null;
  const { data: restaurant, isLoading } = useRestaurant(id);
  const createTokenMutation = useCreateToken();
  const [loadingDishId, setLoadingDishId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeDishes = restaurant?.dishes.filter((d) => {
    if (d.dealExpiresAt <= Date.now()) return false;
    if (feedsFilter && d.feeds !== feedsFilter) return false;
    if (priceMax && d.price > priceMax) return false;
    if (tasteFilters.length > 0 && !tasteFilters.includes(d.primaryTaste as PrimaryTaste)) return false;
    if (dealFilters.length > 0 && (!d.dealType || !dealFilters.includes(d.dealType as DealType))) return false;
    if (styleFilter && d.category !== (styleFilter as Category)) return false;
    return true;
  }) ?? [];
  const activeDealCount = activeDishes.length;
  const visibleDishes = activeDishes.slice(0, visibleCount);
  const hasMore = visibleCount < activeDishes.length;

  const loadMore = useCallback(() => {
    if (hasMore) setVisibleCount((prev) => prev + 10);
  }, [hasMore]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleDealTap = async (dishId: string) => {
    if (!restaurant || loadingDishId) return;

    setLoadingDishId(dishId);
    try {
      await createTokenMutation.mutateAsync({
        restaurantId: restaurant.id,
        dishIds: [dishId],
      });
      const dish = restaurant.dishes.find((d) => d.id === dishId);
      const url = dish?.destinationUrl || restaurant.redirectUrl;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to log redirect:', err);
    } finally {
      setLoadingDishId(null);
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

  return (
    <div className="relative min-h-screen bg-background safe-bottom">
      {/* Full-page background image */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: 'url(/images/pad-thai.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply', opacity: 0.06 }}
      />

      {/* Hero */}
      <div className="relative h-44 sm:h-52 overflow-hidden">
        <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-foreground/10" />

        {/* Top bar */}
        <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 pt-4 pb-3 sm:py-6 safe-top">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-accent flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-accent-foreground" />
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
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-display text-foreground">Active Deals</h2>
            {activeDealCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-accent text-accent-foreground text-xs font-body font-bold">
                {activeDealCount}
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs font-body font-semibold text-accent">
            <span className="text-sm">👆</span>
            Tap any deal to claim it
          </span>
        </div>
      </div>

      {/* Loading overlay on tapped card */}
      <AnimatePresence>
        {loadingDishId && (
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
              className="flex flex-col items-center gap-4 px-8 py-6 rounded-2xl bg-card shadow-elevated"
            >
              <Loader2 className="w-7 h-7 text-accent animate-spin" />
              <p className="text-sm font-body font-medium text-foreground">Opening deal...</p>
              <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
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

      {/* Dish Grid */}
      <div className="px-4 py-5 pb-10 max-w-2xl mx-auto">
        {activeDishes.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {visibleDishes.map((dish, i) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.45,
                    delay: (i % 10) * 0.06,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                >
                  <DishCard
                    dish={dish}
                    onTap={() => handleDealTap(dish.id)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Load more sentinel */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            )}
          </>
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

      {/* Scroll button — right side, swaps direction */}
      <AnimatePresence mode="wait">
        {showScrollTop ? (
          <motion.button
            key="scroll-up"
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-4 z-40 w-12 h-12 rounded-full bg-accent text-accent-foreground shadow-elevated flex items-center justify-center cursor-pointer"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        ) : activeDishes.length > 0 ? (
          <motion.button
            key="scroll-down"
            initial={{ opacity: 0, y: -20, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            className="fixed bottom-6 right-4 z-40 w-12 h-12 rounded-full bg-accent text-accent-foreground shadow-elevated flex items-center justify-center cursor-pointer"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
