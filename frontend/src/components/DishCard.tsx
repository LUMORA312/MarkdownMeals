import { motion, AnimatePresence } from 'framer-motion';
import { Dish, DEAL_ICONS } from '@/types/food';
import { Clock } from 'lucide-react';

interface DishCardProps {
  dish: Dish;
  rank: number | null;
  onTap: () => void;
}

const RANK_COLORS = [
  'bg-primary',
  'bg-primary/85',
  'bg-primary/70',
  'bg-primary/55',
  'bg-primary/40',
];

function formatTimeLeft(expiresAt: number): string | null {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function DishCard({ dish, rank, onTap }: DishCardProps) {
  const isExpired = dish.dealExpiresAt ? dish.dealExpiresAt <= Date.now() : false;
  const timeLeft = dish.dealExpiresAt ? formatTimeLeft(dish.dealExpiresAt) : null;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onTap}
      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group ${isExpired && dish.dealType ? 'opacity-50' : ''}`}
    >
      <img
        src={dish.image}
        alt={dish.name}
        className={`w-full h-full object-cover transition-all duration-300 ${rank ? 'brightness-75' : 'group-hover:scale-105'}`}
        loading="lazy"
      />
      
      {/* Deal type tag */}
      {dish.dealType && !isExpired && (
        <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-destructive/90 backdrop-blur-sm">
          <span className="text-[9px]">{DEAL_ICONS[dish.dealType]}</span>
          <span className="text-[9px] font-body font-bold text-destructive-foreground">{dish.dealType}</span>
        </div>
      )}

      {/* Expired badge */}
      {dish.dealType && isExpired && (
        <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-muted-foreground/80 backdrop-blur-sm">
          <Clock className="w-2.5 h-2.5 text-primary-foreground" />
          <span className="text-[9px] font-body font-bold text-primary-foreground">Expired</span>
        </div>
      )}

      {/* Price badge */}
      {dish.price && (
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-card/90 backdrop-blur-sm">
          {dish.originalPrice && (
            <span className="text-[9px] font-body text-muted-foreground line-through">${dish.originalPrice.toFixed(0)}</span>
          )}
          <span className="text-[10px] font-body font-bold text-foreground">${dish.price.toFixed(2)}</span>
        </div>
      )}

      {/* Name overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-2">
        <p className="text-xs font-body font-medium text-primary-foreground truncate">{dish.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          {dish.modifiers.length > 0 && dish.modifiers.map((m) => (
            <span key={m} className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/80 text-accent-foreground">
              {m}
            </span>
          ))}
          {/* Expiry countdown */}
          {timeLeft && (
            <span className="flex items-center gap-0.5 text-[9px] text-primary-foreground/70">
              <Clock className="w-2 h-2" />
              {timeLeft}
            </span>
          )}
        </div>
      </div>

      {/* Rank badge */}
      <AnimatePresence>
        {rank && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={`absolute top-8 right-2 w-8 h-8 rounded-full ${RANK_COLORS[rank - 1]} flex items-center justify-center`}
          >
            <span className="text-sm font-bold text-primary-foreground">#{rank}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
