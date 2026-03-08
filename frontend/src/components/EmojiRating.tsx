import { motion } from 'framer-motion';
import { EmojiRating as EmojiRatingType, RATING_TAGS, RatingTag } from '@/types/food';

const EMOJIS: EmojiRatingType[] = ['😍', '😋', '😊', '😐', '😕'];
const EMOJI_LABELS: Record<EmojiRatingType, string> = {
  '😍': 'Loved it',
  '😋': 'Yummy',
  '😊': 'Good',
  '😐': 'Okay',
  '😕': 'Meh',
};

interface EmojiRatingProps {
  selectedEmoji: EmojiRatingType | null;
  selectedTags: RatingTag[];
  onEmojiSelect: (emoji: EmojiRatingType) => void;
  onTagToggle: (tag: RatingTag) => void;
}

export function EmojiRatingComponent({ selectedEmoji, selectedTags, onEmojiSelect, onTagToggle }: EmojiRatingProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-body font-medium text-muted-foreground text-center mb-3">How was it?</p>
        <div className="flex justify-center gap-2 sm:gap-3">
          {EMOJIS.map((emoji) => {
            const isSelected = selectedEmoji === emoji;
            return (
              <motion.button
                key={emoji}
                whileTap={{ scale: 0.85 }}
                onClick={() => onEmojiSelect(emoji)}
                className={`flex flex-col items-center gap-1 p-2 sm:p-3 rounded-2xl transition-all cursor-pointer min-w-[56px] sm:min-w-[64px] ${
                  isSelected
                    ? 'bg-primary/15 ring-2 ring-primary shadow-sm'
                    : 'hover:bg-muted active:bg-muted/80'
                }`}
              >
                <span className={`text-3xl sm:text-4xl transition-transform ${isSelected ? 'scale-110' : ''}`}>
                  {emoji}
                </span>
                <span className={`text-[10px] sm:text-xs font-body font-medium ${
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {EMOJI_LABELS[emoji]}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      {selectedEmoji && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm font-body font-medium text-muted-foreground text-center mb-3">What stood out?</p>
          <div className="flex flex-wrap justify-center gap-2">
            {RATING_TAGS.map((tag) => (
              <motion.button
                key={tag}
                whileTap={{ scale: 0.93 }}
                onClick={() => onTagToggle(tag)}
                className={`px-3 py-2 rounded-full text-sm font-body transition-all cursor-pointer ${
                  selectedTags.includes(tag)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-secondary active:bg-secondary/80'
                }`}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
