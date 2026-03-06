import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Restaurant, DEAL_ICONS } from '@/types/food';
import { Tag, Heart, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

function formatTimeLeft(expiresAt: number): string | null {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m left`;
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
  const [burstKey, setBurstKey] = useState(0);

  const handleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!favorited) {
      setBurstKey((k) => k + 1);
    }
    onToggleFavorite?.(restaurant.id);
  }, [favorited, onToggleFavorite, restaurant.id]);

  // Find the best deal to feature
  const activeDeal = restaurant.dishes.find(
    (d) => d.dealType && d.price && (!d.dealExpiresAt || d.dealExpiresAt > Date.now())
  );
  const dealCount = restaurant.dishes.filter(
    (d) => d.dealType && (!d.dealExpiresAt || d.dealExpiresAt > Date.now())
  ).length;

  const lowestPrice = Math.min(
    ...restaurant.dishes.filter((d) => d.price).map((d) => d.price!)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
      className="cursor-pointer rounded-2xl overflow-hidden shadow-card bg-card group"
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        
        {/* Favorite button */}
        <div className="absolute top-3 left-3">
          <motion.button
            whileTap={{ scale: 1.3 }}
            onClick={handleFavorite}
            className="relative flex items-center justify-center w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm shadow-sm"
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
                  className={`w-4 h-4 transition-colors ${favorited ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`}
                />
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Deal count badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/90 backdrop-blur-sm shadow-sm">
          <Tag className="w-3 h-3 text-destructive-foreground" />
          <span className="text-xs font-body font-bold text-destructive-foreground">{dealCount} savings</span>
        </div>

        {/* Featured deal tag */}
        {activeDeal?.dealType && (
          <div className="absolute top-12 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/90 backdrop-blur-sm shadow-sm">
            <span className="text-[10px]">{DEAL_ICONS[activeDeal.dealType]}</span>
            <span className="text-[10px] font-body font-semibold text-accent-foreground">{activeDeal.dealType}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-display text-primary-foreground">{restaurant.name}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {restaurant.categories.slice(0, 2).map((cat) => (
              <span key={cat} className="text-xs px-2 py-0.5 rounded-full bg-primary-foreground/20 text-primary-foreground backdrop-blur-sm">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {restaurant.dishes.slice(0, 3).map((dish) => (
              <img
                key={dish.id}
                src={dish.image}
                alt={dish.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-card"
                loading="lazy"
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground font-body">{dealCount} specials</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Lowest price */}
          <span className="text-sm font-body font-bold text-foreground">
            from ${lowestPrice.toFixed(2)}
          </span>
          {/* Expiry countdown for featured deal */}
          {activeDeal?.dealExpiresAt && (
            (() => {
              const timeLeft = formatTimeLeft(activeDeal.dealExpiresAt);
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
