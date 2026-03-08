import { motion } from 'framer-motion';
import { Dish, DEAL_ICONS } from '@/types/food';
import { Clock, ExternalLink } from 'lucide-react';

interface DishCardProps {
  dish: Dish;
  onTap: () => void;
}

function formatExpiry(expiresAt: number): string | null {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h left`;
  return `${mins}m left`;
}

export function DishCard({ dish, onTap }: DishCardProps) {
  const timeLeft = formatExpiry(dish.dealExpiresAt);
  const isUrgent = dish.dealExpiresAt - Date.now() < 3600000;

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onTap}
      className="relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer group text-left"
    >
      <img
        src={dish.image}
        alt={dish.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Deal type tag */}
      {dish.dealType && (
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/90 backdrop-blur-sm shadow-sm">
          <span className="text-xs">{DEAL_ICONS[dish.dealType]}</span>
          <span className="text-[10px] sm:text-xs font-body font-bold text-destructive-foreground">{dish.dealType}</span>
        </div>
      )}

      {/* Price & feeds badges */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/95 backdrop-blur-sm shadow-md"
        >
          <span className="text-sm font-body font-extrabold text-accent-foreground">${dish.price.toFixed(2)}</span>
        </motion.div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-card/90 backdrop-blur-sm">
          <span className="text-[10px]">👥</span>
          <span className="text-[10px] font-body font-bold text-foreground">{dish.feeds}</span>
        </div>
      </div>

      {/* Name + expiry overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/85 via-foreground/40 to-transparent p-3 pt-10">
        <p className="text-sm font-body font-semibold text-primary-foreground truncate">{dish.name}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {dish.modifiers.length > 0 && dish.modifiers.map((m) => (
            <span key={m} className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/80 text-accent-foreground">
              {m}
            </span>
          ))}
          {timeLeft && (
            <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-body font-medium ${
              isUrgent ? 'text-destructive-foreground' : 'text-primary-foreground/90'
            }`}>
              <Clock className="w-3 h-3" />
              {timeLeft}
            </span>
          )}
        </div>

        {/* Tap hint on hover */}
        <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-3 h-3 text-primary-foreground/60" />
          <span className="text-[10px] font-body text-primary-foreground/60">Tap to claim</span>
        </div>
      </div>

      {/* Urgent pulse indicator */}
      {isUrgent && timeLeft && (
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-destructive animate-pulse" />
      )}
    </motion.button>
  );
}
