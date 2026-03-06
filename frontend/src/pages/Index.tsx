import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryTaste, PRIMARY_TASTES, DealType, DEAL_TYPES, DEAL_ICONS } from '@/types/food';
import { TasteTile } from '@/components/TasteTile';
import { UtensilsCrossed, Search, Moon, Sun, ArrowRight, Tag } from 'lucide-react';

const FLOATING_CARDS = [
  { image: '/images/burger.jpg', label: '$7.99', x: '8%', y: '18%', rotate: -8, delay: 0.3 },
  { image: '/images/pizza.jpg', label: 'BOGO', x: '78%', y: '12%', rotate: 6, delay: 0.5 },
  { image: '/images/tacos.jpg', label: '$6.99', x: '5%', y: '62%', rotate: 12, delay: 0.7 },
  { image: '/images/poke-bowl.jpg', label: '50% Off', x: '82%', y: '55%', rotate: -5, delay: 0.4 },
  { image: '/images/salmon.jpg', label: '$14.99', x: '70%', y: '78%', rotate: 8, delay: 0.6 },
  { image: '/images/chocolate-cake.jpg', label: 'BOGO', x: '15%', y: '82%', rotate: -12, delay: 0.8 },
];

const Index = () => {
  const navigate = useNavigate();
  const [selectedTastes, setSelectedTastes] = useState<PrimaryTaste[]>([]);
  const [selectedDealTypes, setSelectedDealTypes] = useState<DealType[]>([]);
  const [showNav, setShowNav] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = document.getElementById('hero-section')?.offsetHeight || 480;
      setShowNav(window.scrollY > heroHeight - 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTaste = (taste: PrimaryTaste) => {
    setSelectedTastes((prev) => {
      if (prev.includes(taste)) return prev.filter((t) => t !== taste);
      if (prev.length >= 5) return prev;
      return [...prev, taste];
    });
  };

  const toggleDealType = (deal: DealType) => {
    setSelectedDealTypes((prev) =>
      prev.includes(deal) ? prev.filter((d) => d !== deal) : [...prev, deal]
    );
  };

  const goToRestaurants = () => {
    const params = new URLSearchParams();
    if (selectedTastes.length > 0) params.set('tastes', selectedTastes.join(','));
    if (selectedDealTypes.length > 0) params.set('deals', selectedDealTypes.join(','));
    const qs = params.toString();
    navigate(`/restaurants${qs ? `?${qs}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Nav */}
      <AnimatePresence>
        {showNav && (
          <motion.nav
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -70, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border shadow-sm"
          >
            <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
              >
                <div className="p-1.5 rounded-lg bg-accent">
                  <UtensilsCrossed className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="text-xl font-display text-foreground">FoodMan</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToRestaurants}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-body font-semibold cursor-pointer transition-transform hover:scale-105"
                >
                  <Search className="w-3.5 h-3.5" />
                  Find Deals
                </button>
                <button
                  onClick={() => {
                    const next = !isDark;
                    setIsDark(next);
                    document.documentElement.classList.toggle('dark', next);
                  }}
                  className="p-2 rounded-full bg-muted text-muted-foreground cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col"
      >
        {/* Full-bleed Hero */}
        <section id="hero-section" className="relative w-full h-[70vh] min-h-[480px] overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src="/images/steak.jpg"
              alt="Today's best food deals"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-background" />
          </div>

          {/* Floating food cards */}
          {FLOATING_CARDS.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: card.rotate }}
              transition={{ delay: card.delay, type: 'spring', stiffness: 200, damping: 15 }}
              className="absolute hidden md:block"
              style={{ left: card.x, top: card.y }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden shadow-elevated border-2 border-card/50 backdrop-blur-sm"
              >
                <img src={card.image} alt={card.label} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-destructive/90 px-1 py-0.5">
                  <p className="text-[9px] font-body font-bold text-destructive-foreground text-center">{card.label}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}

          {/* Hero content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="p-2 rounded-xl bg-accent/90 backdrop-blur-sm">
                <Tag className="w-8 h-8 text-accent-foreground" />
              </div>
              <h1 className="text-5xl md:text-7xl font-display text-primary-foreground drop-shadow-lg">
                FoodMan
              </h1>
            </motion.div>

            {/* Animated tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg md:text-2xl font-body font-medium text-primary-foreground/90 max-w-lg mb-2 drop-shadow-md"
            >
              Today's deals{' '}
              <motion.span
                animate={{ color: ['hsl(8,78%,58%)', 'hsl(42,90%,55%)', 'hsl(340,70%,55%)', 'hsl(8,78%,58%)'] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="font-bold"
              >
                near you
              </motion.span>
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm md:text-base text-primary-foreground/70 font-body mb-8 max-w-md drop-shadow"
            >
              Happy hour, BOGO, late night — find specials before they expire.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                document.getElementById('deal-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-accent-foreground font-body font-bold text-lg shadow-elevated cursor-pointer transition-shadow hover:shadow-food"
            >
              <Search className="w-5 h-5" />
              Find Deals Near Me
            </motion.button>
          </div>
        </section>

        {/* Deal Mode Filters (primary) */}
        <section id="deal-section" className="w-full bg-card border-b border-border overflow-hidden">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-body text-muted-foreground text-center mb-4 tracking-wide uppercase"
            >
              Browse by Deal
            </motion.p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
              {DEAL_TYPES.map((deal, i) => {
                const isActive = selectedDealTypes.includes(deal);
                return (
                  <motion.button
                    key={deal}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 * i, type: 'spring', stiffness: 300, damping: 20 }}
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleDealType(deal)}
                    className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl border transition-colors cursor-pointer min-w-[90px] group ${
                      isActive
                        ? 'border-accent bg-accent/15 shadow-md ring-1 ring-accent/30'
                        : 'border-border bg-muted/60 hover:bg-accent/10 hover:border-accent/40'
                    }`}
                  >
                    <span className="text-xl">{DEAL_ICONS[deal]}</span>
                    <span className={`text-xs font-body font-semibold whitespace-nowrap ${
                      isActive ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'
                    }`}>
                      {deal}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            {selectedDealTypes.length > 0 && (
              <div className="flex justify-center mt-3">
                <button
                  onClick={() => setSelectedDealTypes([])}
                  className="text-xs font-body font-medium text-destructive/80 hover:text-destructive px-2 py-0.5 rounded-full border border-destructive/30 hover:border-destructive/60 hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  Clear Deals
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Taste Selection Section (optional add-on) */}
        <section id="taste-section" className="flex flex-col items-center px-4 py-16 bg-background">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-2"
          >
            <span className="text-xs font-body font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">Optional</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display text-foreground mb-2"
          >
            Refine by taste
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-body text-center mb-10 max-w-sm"
          >
            Pick up to 5 tastes to narrow down deals.
          </motion.p>

          {/* Taste Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-md w-full mb-8">
            {PRIMARY_TASTES.map((taste, i) => (
              <motion.div
                key={taste}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 + i * 0.04 }}
              >
                <TasteTile
                  taste={taste}
                  selected={selectedTastes.includes(taste)}
                  onToggle={() => toggleTaste(taste)}
                />
              </motion.div>
            ))}
          </div>

          {/* Counter + Continue */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-body">
                {selectedTastes.length}/5 selected
              </span>
              {selectedTastes.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedTastes([])}
                  className="text-xs font-body font-medium text-destructive/80 hover:text-destructive px-2 py-0.5 rounded-full border border-destructive/30 hover:border-destructive/60 hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  Clear All
                </motion.button>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={goToRestaurants}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-accent text-accent-foreground font-body font-semibold text-base shadow-food transition-shadow hover:shadow-elevated cursor-pointer"
            >
              {selectedTastes.length === 0 && selectedDealTypes.length === 0 ? 'Browse All Deals' : 'Show Deals'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            {selectedTastes.length === 0 && selectedDealTypes.length === 0 && (
              <button
                onClick={goToRestaurants}
                className="text-sm text-muted-foreground underline underline-offset-2 font-body cursor-pointer"
              >
                Skip for now
              </button>
            )}
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default Index;
