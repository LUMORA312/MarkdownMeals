import { motion } from 'framer-motion';
import { PrimaryTaste, TASTE_ICONS } from '@/types/food';

const TASTE_BG: Record<PrimaryTaste, string> = {
  'Crispy': 'bg-amber-100 border-amber-300',
  'Cheesy': 'bg-yellow-100 border-yellow-300',
  'Spicy': 'bg-rose-100 border-rose-300',
  'Fresh': 'bg-emerald-100 border-emerald-300',
  'Sweet': 'bg-pink-100 border-pink-300',
};

const TASTE_BG_SELECTED: Record<PrimaryTaste, string> = {
  'Crispy': 'bg-taste-crispy border-taste-crispy shadow-md',
  'Cheesy': 'bg-taste-cheesy border-taste-cheesy shadow-md',
  'Spicy': 'bg-destructive border-destructive shadow-md',
  'Fresh': 'bg-taste-fresh border-taste-fresh shadow-md',
  'Sweet': 'bg-taste-sweet border-taste-sweet shadow-md',
};

interface TasteTileProps {
  taste: PrimaryTaste;
  selected: boolean;
  onToggle: () => void;
}

export function TasteTile({ taste, selected, onToggle }: TasteTileProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className={`
        flex flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-2xl border-2
        w-full aspect-square p-2 sm:p-3 transition-all cursor-pointer
        ${selected
          ? `${TASTE_BG_SELECTED[taste]} text-white`
          : `${TASTE_BG[taste]} text-foreground hover:shadow-sm`
        }
      `}
    >
      <span className="text-2xl sm:text-3xl leading-none">{TASTE_ICONS[taste]}</span>
      <span className="text-[10px] sm:text-xs font-semibold font-body leading-none">{taste}</span>
    </motion.button>
  );
}
