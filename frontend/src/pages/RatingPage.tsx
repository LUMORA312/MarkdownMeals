import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EmojiRatingComponent } from '@/components/EmojiRating';
import { EmojiRating, RatingTag } from '@/types/food';
import { useToken, useSubmitRating } from '@/hooks/use-api';
import { ArrowLeft, Clock, UtensilsCrossed, Check, Loader2, Star } from 'lucide-react';
import { resolveImageUrl } from '@/lib/api';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function RatingPage() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();
  const { data: token, isLoading } = useToken(tokenId);
  const submitRatingMutation = useSubmitRating();

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiRating | null>(null);
  const [selectedTags, setSelectedTags] = useState<RatingTag[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const now = Date.now();
    if (now >= token.ratingAvailableAt) {
      setIsAvailable(true);
    } else {
      setTimeLeft(token.ratingAvailableAt - now);
    }
    if (token.hasRating) {
      setSubmitted(true);
    }
  }, [token]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          setIsAvailable(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleEmojiSelect = (emoji: EmojiRating) => {
    setSelectedEmoji(emoji);
    setError(null);
  };

  const handleTagToggle = (tag: RatingTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setError(null);
  };

  const handleSubmit = async () => {
    if (!tokenId || !selectedEmoji) return;
    try {
      await submitRatingMutation.mutateAsync({
        tokenId,
        emoji: selectedEmoji,
        tags: selectedTags,
      });
      setSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit rating';
      if (message === 'Rating not yet available') {
        setError('Rating period hasn\u2019t started yet. Please wait for the timer to finish.');
      } else {
        setError(message);
      }
    }
  };

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <LoadingScreen message="Loading your experience..." />;
  }

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Star className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground font-body text-center">Rating link not found or expired.</p>
        <button
          onClick={() => navigate('/')}
          className="text-sm font-body text-accent underline underline-offset-2 cursor-pointer py-2"
        >
          Browse deals
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Check className="w-8 h-8 text-primary" />
        </motion.div>
        <h1 className="text-2xl font-display text-foreground">Thanks for rating!</h1>
        <p className="text-muted-foreground font-body text-center max-w-xs">
          Your verified review helps others discover great food.
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/')}
          className="mt-2 px-6 py-3 rounded-full bg-accent text-accent-foreground font-body font-semibold cursor-pointer shadow-food"
        >
          Explore More Deals
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <div className="max-w-md mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-accent flex items-center justify-center cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-accent-foreground" />
          </motion.button>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-display text-foreground leading-tight">Rate your experience</h2>
            <p className="text-sm text-muted-foreground font-body truncate">{token.restaurant.name}</p>
          </div>
        </div>

        {/* Selected dishes */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide scroll-touch pb-1">
          {token.dishes.map((dish) => (
            <div key={dish.id} className="flex-shrink-0 w-16 sm:w-18">
              <img src={resolveImageUrl(dish.image)} alt={dish.name} className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl object-cover shadow-sm" />
              <p className="text-[10px] text-muted-foreground font-body mt-1 truncate text-center">{dish.name}</p>
            </div>
          ))}
        </div>

        {/* Time gate */}
        {!isAvailable ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 sm:py-12 space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-display text-foreground">Rating unlocks soon</p>
            <p className="text-3xl font-body font-bold text-primary tabular-nums">{formatTime(timeLeft)}</p>
            <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto">
              To keep reviews authentic, you can rate after enjoying your meal.
            </p>
            <button
              onClick={() => setIsAvailable(true)}
              className="text-xs text-muted-foreground underline cursor-pointer mt-4 py-2"
            >
              (Demo: unlock now)
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <EmojiRatingComponent
              selectedEmoji={selectedEmoji}
              selectedTags={selectedTags}
              onEmojiSelect={handleEmojiSelect}
              onTagToggle={handleTagToggle}
            />

            {selectedEmoji && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={submitRatingMutation.isPending}
                  className="px-8 py-3 rounded-full bg-accent text-accent-foreground font-body font-semibold shadow-food cursor-pointer disabled:opacity-50 transition-opacity"
                >
                  {submitRatingMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  ) : null}
                  Submit Rating
                </motion.button>
              </motion.div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-center text-destructive font-body px-4"
              >
                {error}
              </motion.p>
            )}

            <p className="text-xs text-center text-muted-foreground font-body pb-4">
              <UtensilsCrossed className="w-3 h-3 inline mr-1" />
              Verified review — you visited this restaurant
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
