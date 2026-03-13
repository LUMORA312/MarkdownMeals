import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PrimaryTaste, PRIMARY_TASTES, TASTE_ICONS,
  PriceRange, PRICE_RANGE_ICONS, PRICE_RANGE_MAX,
  EatingStyle, EATING_STYLES, EATING_STYLE_ICONS,
  DealType, Restaurant, Feeds, Category,
} from '@/types/food';
import { RestaurantCard } from '@/components/RestaurantCard';
import { Footer } from '@/components/Footer';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useRestaurants, useFavorites, useToggleFavorite } from '@/hooks/use-api';
import { Search, X, ArrowUpDown, Heart, Loader2, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';

type SortOption = 'default' | 'alpha' | 'dishes';
const PAGE_SIZE = 12;

const FEEDS_ESTIMATE: Record<Feeds, number> = {
  '3–4': 3.5,
  '5–7': 6,
  '8–10': 9,
  '10+': 10,
};

const FEEDS_RANK: Record<Feeds, number> = {
  '3–4': 1,
  '5–7': 2,
  '8–10': 3,
  '10+': 4,
};

function getLowestPrice(r: Restaurant): number {
  if (r.dishes.length === 0) return Infinity;
  return Math.min(...r.dishes.map((d) => d.price));
}

function getBestValueScore(r: Restaurant): number {
  if (r.dishes.length === 0) return Infinity;
  return Math.min(
    ...r.dishes.map((d) => d.price / FEEDS_ESTIMATE[d.feeds])
  );
}

function getHighestFeedsRank(r: Restaurant): number {
  if (r.dishes.length === 0) return 0;
  return Math.max(...r.dishes.map((d) => FEEDS_RANK[d.feeds]));
}

function sortByPriceRange(restaurants: Restaurant[], priceRange: PriceRange): Restaurant[] {
  const sorted = [...restaurants];
  if (priceRange === 'Best Value') {
    sorted.sort((a, b) => {
      const scoreA = getBestValueScore(a);
      const scoreB = getBestValueScore(b);
      if (scoreA !== scoreB) return scoreA - scoreB;
      if (a.distance !== b.distance) return a.distance - b.distance;
      return getLowestPrice(a) - getLowestPrice(b);
    });
  } else if (priceRange === 'Family Feast') {
    sorted.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      const priceA = getLowestPrice(a);
      const priceB = getLowestPrice(b);
      if (priceA !== priceB) return priceA - priceB;
      return getHighestFeedsRank(b) - getHighestFeedsRank(a);
    });
  } else {
    sorted.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      return getLowestPrice(a) - getLowestPrice(b);
    });
  }
  return sorted;
}

export default function RestaurantList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchBarRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const priceFilter = searchParams.get('price') as PriceRange | null;
  const priceMax = priceFilter ? PRICE_RANGE_MAX[priceFilter] : null;
  const zipCode = searchParams.get('zip') || localStorage.getItem('foodman_zip') || '';

  // Read initial filter values from URL params (passed from Index page)
  const initialTastes = searchParams.get('tastes');
  const initialDeals = searchParams.get('deals');
  const initialFeeds = searchParams.get('feeds') as Feeds | null;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [eatingStyle, setEatingStyle] = useState<EatingStyle | null>(null);
  const [tasteTags, setTasteTags] = useState<PrimaryTaste[]>(
    () => initialTastes ? initialTastes.split(',').filter((t): t is PrimaryTaste => PRIMARY_TASTES.includes(t as PrimaryTaste)) as PrimaryTaste[] : []
  );
  const [dealFilters, setDealFilters] = useState<string[]>(
    () => initialDeals ? initialDeals.split(',') : []
  );
  const [feedsFilter, setFeedsFilter] = useState<Feeds | null>(initialFeeds);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: restaurants = [], isLoading } = useRestaurants({
    search: searchQuery,
    tastes: tasteTags.length > 0 ? tasteTags : undefined,
    deals: dealFilters.length > 0 ? dealFilters as DealType[] : undefined,
  });
  const { data: favoriteIds = [] } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();

  const favorites = new Set(favoriteIds);

  const toggleFavorite = (id: string) => {
    toggleFavoriteMutation.mutate(id);
  };

  const toggleTasteTag = (taste: PrimaryTaste) => {
    setTasteTags((prev) => {
      if (prev.includes(taste)) return prev.filter((t) => t !== taste);
      if (prev.length >= 2) return prev;
      return [...prev, taste];
    });
    setVisibleCount(PAGE_SIZE);
  };

  const selectEatingStyle = (style: EatingStyle) => {
    setEatingStyle((prev) => (prev === style ? null : style));
    setVisibleCount(PAGE_SIZE);
  };

  // Keep URL params in sync with current filter state
  useEffect(() => {
    const params = new URLSearchParams();
    if (priceFilter) params.set('price', priceFilter);
    if (tasteTags.length > 0) params.set('tastes', tasteTags.join(','));
    if (dealFilters.length > 0) params.set('deals', dealFilters.join(','));
    if (feedsFilter) params.set('feeds', feedsFilter);
    if (zipCode) params.set('zip', zipCode);
    if (eatingStyle) params.set('style', eatingStyle);
    setSearchParams(params, { replace: true });
  }, [priceFilter, tasteTags, dealFilters, feedsFilter, zipCode, eatingStyle, setSearchParams]);

  // Sticky search bar detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsSearchSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );
    const el = searchBarRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);

  // Build filtered + sorted list
  const filteredList = useMemo(() => {
    let list = [...restaurants].filter((r) => {
      if (showFavoritesOnly && !favorites.has(r.id)) return false;
      if (priceMax) {
        if (!r.dishes.some((d) => d.price <= priceMax)) return false;
      }
      if (eatingStyle) {
        if (!r.dishes.some((d) => d.category === (eatingStyle as Category))) return false;
      }
      if (tasteTags.length > 0) {
        if (!r.dishes.some((d) => tasteTags.includes(d.primaryTaste))) return false;
      }
      if (dealFilters.length > 0) {
        if (!r.dishes.some((d) => d.dealType && dealFilters.includes(d.dealType))) return false;
      }
      if (feedsFilter) {
        if (!r.dishes.some((d) => d.feeds === feedsFilter)) return false;
      }
      return true;
    });

    if (sortBy === 'default' && priceFilter) {
      list = sortByPriceRange(list, priceFilter);
    } else if (sortBy === 'alpha') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'dishes') {
      list.sort((a, b) => b.dishes.length - a.dishes.length);
    }

    return list.map((r) => {
      let filteredDishes = r.dishes;
      if (priceMax) {
        filteredDishes = filteredDishes.filter((d) => d.price <= priceMax);
      }
      if (eatingStyle) {
        filteredDishes = filteredDishes.filter((d) => d.category === (eatingStyle as Category));
      }
      if (tasteTags.length > 0) {
        filteredDishes = filteredDishes.filter((d) => tasteTags.includes(d.primaryTaste));
      }
      if (dealFilters.length > 0) {
        filteredDishes = filteredDishes.filter((d) => d.dealType && dealFilters.includes(d.dealType));
      }
      if (feedsFilter) {
        filteredDishes = filteredDishes.filter((d) => d.feeds === feedsFilter);
      }
      return filteredDishes.length !== r.dishes.length
        ? { ...r, dishes: filteredDishes }
        : r;
    });
  }, [restaurants, showFavoritesOnly, favorites, priceMax, eatingStyle, tasteTags, dealFilters, feedsFilter, sortBy, priceFilter]);

  const visibleList = filteredList.slice(0, visibleCount);
  const hasMore = visibleCount < filteredList.length;

  // Infinite scroll — load more when sentinel enters viewport
  const loadMore = useCallback(() => {
    if (hasMore) setVisibleCount((prev) => prev + PAGE_SIZE);
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

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, sortBy, showFavoritesOnly, priceFilter]);

  const hasSecondaryFilters = eatingStyle || tasteTags.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen bg-background safe-bottom"
    >
      {/* Full-page background image */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: 'url(/images/pad-thai.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply', opacity: 0.06 }}
      />

      <div className="relative z-10">
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-6 sm:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full bg-accent flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-accent-foreground" />
            </motion.button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground leading-tight">
                {priceFilter || 'All Markdowns'}
              </h2>
              {!isLoading && (
                <p className="text-sm text-muted-foreground font-body">
                  {filteredList.length} deal{filteredList.length !== 1 ? 's' : ''} found
                  {zipCode && <span> near {zipCode}</span>}
                </p>
              )}
            </div>
          </div>
          {priceFilter && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-base font-body font-bold">
              {PRICE_RANGE_ICONS[priceFilter]} {priceFilter}
            </span>
          )}
        </div>

        {/* Sentinel for sticky detection */}
        <div ref={searchBarRef} />

        {/* Search bar — becomes sticky */}
        <div className={`${isSearchSticky ? 'sticky top-0 z-30 -mx-4 px-4 py-2 bg-background/90 backdrop-blur-md border-b border-border/50' : ''} transition-all`}>
          <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2.5 border border-border focus-within:border-accent/40 focus-within:bg-card transition-all">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants..."
              className="bg-transparent text-base font-body text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 rounded-full hover:bg-accent/20 cursor-pointer shrink-0">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary filters — Eating Style + Taste Tags */}
        <div className="mt-3 space-y-3">
          {/* Eating Style (choose one) */}
          <div>
            <p className="text-xs sm:text-sm font-body font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Eating Style</p>
            <div className="flex flex-wrap gap-1.5 pb-0.5">
              {EATING_STYLES.map((style) => {
                const isActive = eatingStyle === style;
                return (
                  <button
                    key={style}
                    onClick={() => selectEatingStyle(style)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-body font-medium whitespace-nowrap cursor-pointer transition-all ${
                      isActive
                        ? 'border-accent bg-accent/15 text-foreground ring-1 ring-accent/30'
                        : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-base">{EATING_STYLE_ICONS[style]}</span>
                    {style}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Taste Tags (max two) */}
          <div>
            <p className="text-xs sm:text-sm font-body font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Taste {tasteTags.length > 0 && <span className="text-accent">({tasteTags.length}/2)</span>}
            </p>
            <div className="flex flex-wrap gap-1.5 pb-0.5">
              {PRIMARY_TASTES.map((taste) => {
                const isActive = tasteTags.includes(taste);
                const atMax = tasteTags.length >= 2 && !isActive;
                return (
                  <button
                    key={taste}
                    onClick={() => !atMax && toggleTasteTag(taste)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-body font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'border-accent bg-accent/15 text-foreground ring-1 ring-accent/30 cursor-pointer'
                        : atMax
                          ? 'border-border bg-muted/20 text-muted-foreground/40 cursor-not-allowed'
                          : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted cursor-pointer'
                    }`}
                  >
                    <span className="text-base">{TASTE_ICONS[taste]}</span>
                    {taste}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear secondary filters */}
          {hasSecondaryFilters && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
              <button
                onClick={() => { setEatingStyle(null); setTasteTags([]); }}
                className="text-sm font-body font-medium text-destructive/80 hover:text-destructive px-3 py-1 rounded-full border border-destructive/30 hover:border-destructive/60 hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </div>

        {/* Sort + Favorites row */}
        <div className="flex items-center gap-1.5 my-3 overflow-x-auto scrollbar-hide">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
          {([
            { value: 'default' as SortOption, label: 'Relevance' },
            { value: 'alpha' as SortOption, label: 'A-Z' },
            { value: 'dishes' as SortOption, label: 'Most specials' },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-3.5 py-2 rounded-full text-sm font-body font-medium transition-all cursor-pointer whitespace-nowrap ${
                sortBy === opt.value
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-0.5 shrink-0" />
          <button
            onClick={() => setShowFavoritesOnly((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-body font-medium transition-all cursor-pointer whitespace-nowrap ${
              showFavoritesOnly
                ? 'bg-destructive/15 text-destructive shadow-sm ring-1 ring-destructive/30'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-destructive' : ''}`} />
            Favorites
            <AnimatePresence mode="wait">
              {favorites.size > 0 && (
                <motion.span
                  key={favorites.size}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                    showFavoritesOnly
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-accent text-accent-foreground'
                  }`}
                >
                  {favorites.size}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Loading state */}
        {isLoading && <LoadingScreen message="Finding deals near you..." />}

        {/* Restaurant Grid */}
        {!isLoading && visibleList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {visibleList.map((restaurant, i) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.45,
                  delay: (i % PAGE_SIZE) * 0.06,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <RestaurantCard
                  restaurant={restaurant}
                  index={i}
                  favorited={favorites.has(restaurant.id)}
                  onToggleFavorite={toggleFavorite}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Load more sentinel */}
        {hasMore && !isLoading && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredList.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted flex items-center justify-center">
              {showFavoritesOnly ? (
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/50" />
              ) : (
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/50" />
              )}
            </div>
            <div className="text-center space-y-1 px-4">
              <h3 className="text-xl sm:text-2xl font-display text-foreground">
                {showFavoritesOnly ? 'No favorites yet' : 'No markdowns found'}
              </h3>
              <p className="text-base text-muted-foreground font-body max-w-xs mx-auto">
                {showFavoritesOnly
                  ? 'Tap the heart icon on a restaurant card to save it here.'
                  : searchQuery.trim()
                    ? `No results for "${searchQuery}". Try a different name.`
                    : 'No restaurants match your filters. Try adjusting your preferences.'}
              </p>
            </div>
            {showFavoritesOnly ? (
              <button
                onClick={() => setShowFavoritesOnly(false)}
                className="text-base font-body font-medium text-accent hover:text-accent/80 underline underline-offset-2 cursor-pointer transition-colors py-2"
              >
                Show all markdowns
              </button>
            ) : hasSecondaryFilters ? (
              <button
                onClick={() => { setEatingStyle(null); setTasteTags([]); }}
                className="text-base font-body font-medium text-accent hover:text-accent/80 underline underline-offset-2 cursor-pointer transition-colors py-2"
              >
                Clear filters
              </button>
            ) : searchQuery.trim() ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-base font-body font-medium text-accent hover:text-accent/80 underline underline-offset-2 cursor-pointer transition-colors py-2"
              >
                Clear search
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="text-base font-body font-medium text-accent hover:text-accent/80 underline underline-offset-2 cursor-pointer transition-colors py-2"
              >
                Change price range
              </button>
            )}
          </motion.div>
        )}
      </div>
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
        ) : filteredList.length > 0 ? (
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

      {!isLoading && <Footer />}
    </motion.div>
  );
}
