import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryTaste, DealType, DEAL_ICONS, PriceRange, PRICE_RANGE_ICONS, PRICE_RANGE_MAX, Restaurant, Feeds } from '@/types/food';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useRestaurants, useFavorites, useToggleFavorite } from '@/hooks/use-api';
import { Search, X, ArrowUpDown, Heart, Tag, Loader2, ArrowLeft, SlidersHorizontal } from 'lucide-react';

type SortOption = 'default' | 'alpha' | 'dishes';

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
  const [searchParams] = useSearchParams();
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [isSearchSticky, setIsSearchSticky] = useState(false);

  const tastes = (searchParams.get('tastes')?.split(',').filter(Boolean) || []) as PrimaryTaste[];
  const deals = (searchParams.get('deals')?.split(',').filter(Boolean) || []) as DealType[];
  const priceFilter = searchParams.get('price') as PriceRange | null;
  const priceMax = priceFilter ? PRICE_RANGE_MAX[priceFilter] : null;
  const feedsFilter = searchParams.get('feeds') as Feeds | null;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { data: restaurants = [], isLoading } = useRestaurants({ tastes, deals, search: searchQuery });
  const { data: favoriteIds = [] } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();

  const favorites = new Set(favoriteIds);

  const toggleFavorite = (id: string) => {
    toggleFavoriteMutation.mutate(id);
  };

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

  const activeFilterCount = (priceFilter ? 1 : 0) + tastes.length + deals.length + (feedsFilter ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background safe-bottom"
    >
      <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </motion.button>
            <div>
              <h2 className="text-xl sm:text-2xl font-display text-foreground leading-tight">Markdowns</h2>
              {!isLoading && (
                <p className="text-xs text-muted-foreground font-body">
                  {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm font-body text-muted-foreground px-3 py-1.5 rounded-full border border-border hover:bg-muted/60 cursor-pointer transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold px-1">
                {activeFilterCount}
              </span>
            )}
          </button>
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
              className="bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 rounded-full hover:bg-accent/20 cursor-pointer shrink-0">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Active filters */}
        {(priceFilter || deals.length > 0 || feedsFilter || tastes.length > 0) && (
          <div className="flex gap-2 mt-3 mb-3 overflow-x-auto scrollbar-hide scroll-touch pb-0.5">
            {priceFilter && (
              <span className="flex-shrink-0 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs sm:text-sm font-body font-bold flex items-center gap-1">
                {PRICE_RANGE_ICONS[priceFilter]} {priceFilter}
              </span>
            )}
            {feedsFilter && (
              <span className="flex-shrink-0 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs sm:text-sm font-body font-medium flex items-center gap-1">
                👥 {feedsFilter}
              </span>
            )}
            {deals.map((d) => (
              <span key={d} className="flex-shrink-0 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs sm:text-sm font-body font-medium flex items-center gap-1">
                {DEAL_ICONS[d]} {d}
              </span>
            ))}
            {tastes.map((t) => (
              <span key={t} className="flex-shrink-0 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs sm:text-sm font-body font-medium">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Sort options */}
        <div className="flex items-center gap-1.5 my-3 overflow-x-auto scrollbar-hide">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {([
            { value: 'default' as SortOption, label: 'Relevance' },
            { value: 'alpha' as SortOption, label: 'A-Z' },
            { value: 'dishes' as SortOption, label: 'Most specials' },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all cursor-pointer whitespace-nowrap ${
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
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all cursor-pointer whitespace-nowrap ${
              showFavoritesOnly
                ? 'bg-destructive/15 text-destructive shadow-sm ring-1 ring-destructive/30'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <Heart className={`w-3 h-3 ${showFavoritesOnly ? 'fill-destructive' : ''}`} />
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

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-sm text-muted-foreground font-body">Finding deals near you...</p>
          </div>
        )}

        {/* Restaurant Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {(() => {
              let list = [...restaurants].filter((r) => {
                if (showFavoritesOnly && !favorites.has(r.id)) return false;
                if (priceMax) {
                  const hasMatchingDish = r.dishes.some((d) => d.price <= priceMax);
                  if (!hasMatchingDish) return false;
                }
                if (feedsFilter) {
                  const hasMatchingFeeds = r.dishes.some((d) => d.feeds === feedsFilter);
                  if (!hasMatchingFeeds) return false;
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
                if (feedsFilter) {
                  filteredDishes = filteredDishes.filter((d) => d.feeds === feedsFilter);
                }
                if (priceMax) {
                  filteredDishes = filteredDishes.filter((d) => d.price <= priceMax);
                }
                return filteredDishes.length !== r.dishes.length
                  ? { ...r, dishes: filteredDishes }
                  : r;
              });
            })()
              .map((restaurant, i) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} index={i} favorited={favorites.has(restaurant.id)} onToggleFavorite={toggleFavorite} />
              ))}
          </div>
        )}

        {!isLoading && (() => {
          const displayedRestaurants = [...restaurants].filter((r) => {
            if (showFavoritesOnly && !favorites.has(r.id)) return false;
            if (priceMax) {
              const hasMatchingDish = r.dishes.some((d) => d.price <= priceMax);
              if (!hasMatchingDish) return false;
            }
            return true;
          });
          return displayedRestaurants.length === 0 ? (
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
                <h3 className="text-lg font-display text-foreground">
                  {showFavoritesOnly ? 'No favorites yet' : 'No markdowns found'}
                </h3>
                <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto">
                  {showFavoritesOnly
                    ? 'Tap the heart icon on a restaurant card to save it here.'
                    : searchQuery.trim()
                      ? `No results for "${searchQuery}". Try a different name.`
                      : 'No restaurants match your selected filters. Try changing your preferences.'}
                </p>
              </div>
              {showFavoritesOnly ? (
                <button
                  onClick={() => setShowFavoritesOnly(false)}
                  className="text-sm font-body font-medium text-accent hover:text-accent/80 underline underline-offset-2 cursor-pointer transition-colors py-2"
                >
                  Show all markdowns
                </button>
              ) : searchQuery.trim() ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm font-body font-medium text-accent hover:text-accent/80 underline underline-offset-2 cursor-pointer transition-colors py-2"
                >
                  Clear search
                </button>
              ) : (
                <button
                  onClick={() => navigate('/')}
                  className="text-sm font-body font-medium text-accent hover:text-accent/80 underline underline-offset-2 cursor-pointer transition-colors py-2"
                >
                  Change filters
                </button>
              )}
            </motion.div>
          ) : null;
        })()}
      </div>
    </motion.div>
  );
}
