import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryTaste, DealType, DEAL_ICONS } from '@/types/food';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useRestaurants, useFavorites, useToggleFavorite } from '@/hooks/use-api';
import { Search, X, ArrowUpDown, Heart, Tag, Loader2, ArrowLeft } from 'lucide-react';

type SortOption = 'default' | 'alpha' | 'dishes';

export default function RestaurantList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tastes = (searchParams.get('tastes')?.split(',').filter(Boolean) || []) as PrimaryTaste[];
  const deals = (searchParams.get('deals')?.split(',').filter(Boolean) || []) as DealType[];

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

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen px-4 py-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <Tag className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-display text-foreground">Deals</h2>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-sm font-body text-muted-foreground underline underline-offset-2 cursor-pointer"
        >
          Change filters
        </button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2.5 mb-4 border border-border focus-within:border-accent/40 transition-colors">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search restaurants..."
          className="bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground outline-none w-full"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="p-0.5 rounded-full hover:bg-accent/20 cursor-pointer shrink-0">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Active deal filters */}
      {deals.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {deals.map((d) => (
            <span key={d} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-body font-medium flex items-center gap-1">
              {DEAL_ICONS[d]} {d}
            </span>
          ))}
        </div>
      )}

      {/* Selected tastes */}
      {tastes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tastes.map((t) => (
            <span key={t} className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-body font-medium">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Sort options */}
      <div className="flex items-center gap-1.5 mb-4">
        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
        {([
          { value: 'default' as SortOption, label: 'Relevance' },
          { value: 'alpha' as SortOption, label: 'A-Z' },
          { value: 'dishes' as SortOption, label: 'Most specials' },
        ]).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSortBy(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-body font-medium transition-colors cursor-pointer ${
              sortBy === opt.value
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        <button
          onClick={() => setShowFavoritesOnly((prev) => !prev)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body font-medium transition-colors cursor-pointer ${
            showFavoritesOnly
              ? 'bg-destructive/15 text-destructive shadow-sm ring-1 ring-destructive/30'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted'
          }`}
        >
          <Heart className={`w-3 h-3 ${showFavoritesOnly ? 'fill-destructive' : ''}`} />
          Favorites
          <AnimatePresence mode="wait">
            {favorites.size > 0 && (
              <motion.span
                key={favorites.size}
                initial={{ scale: 0.5, opacity: 0, y: -6 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: 6 }}
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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      )}

      {/* Restaurant Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...restaurants]
            .filter((r) => !showFavoritesOnly || favorites.has(r.id))
            .sort((a, b) => {
              if (sortBy === 'alpha') return a.name.localeCompare(b.name);
              if (sortBy === 'dishes') return b.dishes.length - a.dishes.length;
              return 0;
            })
            .map((restaurant, i) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} index={i} favorited={favorites.has(restaurant.id)} onToggleFavorite={toggleFavorite} />
            ))}
        </div>
      )}

      {!isLoading && (() => {
        const displayedRestaurants = [...restaurants].filter((r) => !showFavoritesOnly || favorites.has(r.id));
        return displayedRestaurants.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              {showFavoritesOnly ? (
                <Heart className="w-10 h-10 text-muted-foreground/50" />
              ) : (
                <Search className="w-10 h-10 text-muted-foreground/50" />
              )}
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-display text-foreground">
                {showFavoritesOnly ? 'No favorites yet' : 'No deals found'}
              </h3>
              <p className="text-sm text-muted-foreground font-body max-w-xs">
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
                className="text-sm font-body font-medium text-accent hover:text-accent/80 underline underline-offset-2 cursor-pointer transition-colors"
              >
                Show all deals
              </button>
            ) : searchQuery.trim() ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm font-body font-medium text-accent hover:text-accent/80 underline underline-offset-2 cursor-pointer transition-colors"
              >
                Clear search
              </button>
            ) : null}
          </motion.div>
        ) : null;
      })()}
    </motion.div>
  );
}
