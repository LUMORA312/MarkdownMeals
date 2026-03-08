import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Restaurant, DEAL_ICONS } from '@/types/food';
import { Tag, Heart, Clock, MapPin } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PARTICLE_COUNT = 8;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * 360;
  const rad = (angle * Math.PI) / 180;
  const distance = 18 + Math.random() * 14;
  return {
    id: i,
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance,
    scale: 0.4 + Math.random() * 0.5,
    emoji: ['❤️', '💗', '✨', '💕'][i % 4],
  };
});

function formatExpiry(expiresAt: number): string | null {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h left`;
  return `${mins}m left`;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  index: number;
  favorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export function RestaurantCard({ restaurant, index, favorited = false, onToggleFavorite }: RestaurantCardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [burstKey, setBurstKey] = useState(0);

  const handleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!favorited) {
      setBurstKey((k) => k + 1);
    }
    onToggleFavorite?.(restaurant.id);
  }, [favorited, onToggleFavorite, restaurant.id]);

  const activeDishes = restaurant.dishes.filter((d) => d.dealExpiresAt > Date.now());
  const activeDeal = activeDishes.find((d) => d.dealType);
  const dealCount = activeDishes.length;

  const lowestPrice = activeDishes.length > 0
    ? Math.min(...activeDishes.map((d) => d.price))
    : Math.min(...restaurant.dishes.map((d) => d.price));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        const qs = searchParams.toString();
        navigate(`/restaurant/${restaurant.id}${qs ? `?${qs}` : ''}`);
      }}
      className="cursor-pointer rounded-2xl overflow-hidden shadow-card bg-card group active:shadow-sm transition-shadow"
    >
      <div className="aspect-[16/10] sm:aspect-[4/3] overflow-hidden relative">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

        {/* Favorite button */}
        <div className="absolute top-3 left-3">
          <motion.button
            whileTap={{ scale: 1.3 }}
            onClick={handleFavorite}
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm shadow-sm"
          >
            <AnimatePresence>
              {burstKey > 0 && PARTICLES.map((p) => (
                <motion.span
                  key={`${burstKey}-${p.id}`}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                  animate={{ opacity: 0, x: p.x, y: p.y, scale: p.scale }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute pointer-events-none text-[10px]"
                  style={{ left: '50%', top: '50%' }}
                >
                  {p.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div
                key={favorited ? 'filled' : 'empty'}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${favorited ? 'fill-destructive text-destructive' : 'text-foreground/70'}`}
                />
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Deal count badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/90 backdrop-blur-sm shadow-sm">
          <Tag className="w-3 h-3 text-destructive-foreground" />
          <span className="text-xs font-body font-bold text-destructive-foreground">{dealCount}</span>
        </div>

        {/* Featured deal tag */}
        {activeDeal?.dealType && (
          <div className="absolute top-12 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/90 backdrop-blur-sm shadow-sm">
            <span className="text-[10px]">{DEAL_ICONS[activeDeal.dealType]}</span>
            <span className="text-[10px] font-body font-semibold text-accent-foreground">{activeDeal.dealType}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-display text-primary-foreground leading-tight">{restaurant.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            {restaurant.categories.slice(0, 2).map((cat) => (
              <span key={cat} className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm">
                {cat}
              </span>
            ))}
            {restaurant.distance > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-primary-foreground/70 ml-auto">
                <MapPin className="w-2.5 h-2.5" />
                {restaurant.distance.toFixed(1)} mi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex -space-x-2 shrink-0">
            {restaurant.dishes.slice(0, 3).map((dish) => (
              <img
                key={dish.id}
                src={dish.image}
                alt={dish.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-card"
                loading="lazy"
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-muted-foreground font-body truncate">{dealCount} specials</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-body font-bold text-accent">
            from ${lowestPrice.toFixed(2)}
          </span>
          {activeDeal?.dealExpiresAt && (
            (() => {
              const timeLeft = formatExpiry(activeDeal.dealExpiresAt);
              return timeLeft ? (
                <span className="flex items-center gap-0.5 text-[10px] font-body text-muted-foreground">
                  <Clock className="w-2.5 h-2.5" />
                  {timeLeft}
                </span>
              ) : null;
            })()
          )}
        </div>
      </div>
    </motion.div>
  );
}
