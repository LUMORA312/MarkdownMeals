import { motion } from 'framer-motion';
import { Dish, DEAL_ICONS } from '@/types/food';
import { Clock } from 'lucide-react';
import { resolveImageUrl } from '@/lib/api';

interface DishCardProps {
  dish: Dish;
  onTap: () => void;
}

function formatExpiry(expiresAt: number): string | null {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

export function DishCard({ dish, onTap }: DishCardProps) {
  const timeLeft = formatExpiry(dish.dealExpiresAt);
  const isUrgent = dish.dealExpiresAt - Date.now() < 3600000;

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onTap}
      className="w-full rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group text-left bg-orange-50 border border-orange-200 shadow-card hover:shadow-food transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={resolveImageUrl(dish.image)}
          alt={dish.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Price badge — always visible */}
        <div className="absolute top-2 right-2">
          <div className="px-2.5 py-1 rounded-full bg-accent/95 backdrop-blur-sm shadow-md">
            <span className="text-sm font-body font-extrabold text-accent-foreground">
              ${dish.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Deal type tag */}
        {dish.dealType && (
          <div className="absolute top-2 left-2 flex items-center gap-0.5 px-2 py-1 rounded-full bg-destructive/90 backdrop-blur-sm">
            <span className="text-xs">{DEAL_ICONS[dish.dealType]}</span>
            <span className="text-[10px] font-body font-bold text-destructive-foreground">{dish.dealType}</span>
          </div>
        )}

        {/* Urgency pulse */}
        {isUrgent && timeLeft && !dish.dealType && (
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-destructive animate-pulse" />
        )}
      </div>

      {/* Info section below image */}
      <div className="p-2.5 sm:p-3">
        <p className="text-sm sm:text-base font-body font-semibold text-foreground leading-tight line-clamp-2">
          {dish.name}
        </p>

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {/* Feeds */}
          <span className="flex items-center gap-0.5 text-xs font-body text-muted-foreground">
            <span className="text-xs">👥</span> {dish.feeds}
          </span>

          {/* Expiry */}
          {timeLeft && (
            <span className={`flex items-center gap-0.5 text-xs font-body font-medium ${
              isUrgent ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              <Clock className="w-3 h-3" />
              {timeLeft}
            </span>
          )}

          {/* Modifiers */}
          {dish.modifiers.map((m) => (
            <span key={m} className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 border border-sky-200 text-sky-700 font-body font-medium">
              {m}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}
