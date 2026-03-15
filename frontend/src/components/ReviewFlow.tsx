import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReviewBadge, REVIEW_BADGES, REVIEW_BADGE_ICONS } from '@/types/food';
import { useSubmitReview } from '@/hooks/use-api';
import { Mail, Send, CheckCircle } from 'lucide-react';

interface ReviewFlowProps {
  dishId: string;
  restaurantId: string;
}

const EMAIL_KEY = 'foodman_review_email';

function getStoredEmail(): string {
  return sessionStorage.getItem(EMAIL_KEY) || '';
}

function storeEmail(email: string) {
  sessionStorage.setItem(EMAIL_KEY, email);
}

export function ReviewFlow({ dishId, restaurantId }: ReviewFlowProps) {
  const [selectedBadge, setSelectedBadge] = useState<ReviewBadge | null>(null);
  const [email, setEmail] = useState(getStoredEmail());
  const [needsEmail, setNeedsEmail] = useState(!getStoredEmail());
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submitReview = useSubmitReview();

  const handleBadgeTap = (badge: ReviewBadge) => {
    setSelectedBadge(badge);
    if (!getStoredEmail()) {
      setNeedsEmail(true);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      storeEmail(email.trim());
      setNeedsEmail(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedBadge) return;
    const storedEmail = getStoredEmail();
    if (!storedEmail) return;

    try {
      await submitReview.mutateAsync({
        email: storedEmail,
        badge: selectedBadge,
        dishId,
        restaurantId,
        comment: comment.trim() || undefined,
      });
      setSubmitted(true);
    } catch {
      // Error handled by mutation state
    }
  };

  // Success state
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 py-6"
      >
        <CheckCircle className="w-10 h-10 text-green-500" />
        <p className="text-base font-body font-semibold text-foreground">Thanks for your feedback!</p>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
          <span className="text-xl">{REVIEW_BADGE_ICONS[selectedBadge!]}</span>
          <span className="text-sm font-body font-semibold text-accent">{selectedBadge}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Badge label */}
      <p className="text-sm font-body font-semibold text-foreground/70 text-center">
        How was this deal?
      </p>

      {/* Badge grid */}
      <div className="grid grid-cols-3 gap-2">
        {REVIEW_BADGES.map((badge, i) => {
          const isActive = selectedBadge === badge;
          return (
            <motion.button
              key={badge}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleBadgeTap(badge)}
              className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-accent bg-accent/15 shadow-sm ring-1 ring-accent/30'
                  : 'border-border bg-card hover:border-accent/40 hover:bg-accent/5'
              }`}
            >
              <span className="text-2xl">{REVIEW_BADGE_ICONS[badge]}</span>
              <span className="text-xs font-body font-semibold text-foreground leading-tight text-center">
                {badge}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Email prompt — shown when badge selected but no email stored */}
      <AnimatePresence>
        {selectedBadge && needsEmail && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleEmailSubmit}
            className="flex flex-col gap-3 overflow-hidden"
          >
            <p className="text-xs font-body text-muted-foreground text-center">
              Enter your email to submit your review
            </p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.93 }}
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent/80 text-accent-foreground font-body font-bold text-sm cursor-pointer shadow-sm hover:shadow-accent/30 transition-shadow"
              >
                Go
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Comment + Submit — shown when badge selected and email captured */}
      <AnimatePresence>
        {selectedBadge && !needsEmail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share a quick thought (optional)"
              maxLength={200}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent resize-none"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.01 }}
              onClick={handleSubmitReview}
              disabled={submitReview.isPending}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-accent to-accent/80 text-accent-foreground font-body font-bold text-sm cursor-pointer shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-shadow disabled:opacity-50"
            >
              {submitReview.isPending ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" strokeWidth={2.5} />
                  Submit Review
                </>
              )}
            </motion.button>
            {submitReview.isError && (
              <p className="text-xs font-body text-destructive text-center">
                Something went wrong. Please try again.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
