import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { PriceRange, PRICE_RANGES, PRICE_RANGE_ICONS, PrimaryTaste, PRIMARY_TASTES, DealType, DEAL_TYPES, DEAL_ICONS, Feeds, FEEDS_OPTIONS, EatingStyle, EATING_STYLES, EATING_STYLE_ICONS } from '@/types/food';
import { TasteTile } from '@/components/TasteTile';
import { Footer } from '@/components/Footer';
import { UtensilsCrossed, Search, Moon, Sun, ArrowRight, ChevronDown, MapPin, Users, Check, X } from 'lucide-react';

const FLOATING_CARDS = [
  { image: '/images/burger.jpg', label: '$7.99', x: '10%', y: '10%', rotate: -8, delay: 0.3 },
  { image: '/images/pizza.jpg', label: 'BOGO', x: '78%', y: '7%', rotate: 6, delay: 0.5 },
  { image: '/images/tacos.jpg', label: '$6.99', x: '8%', y: '49%', rotate: 12, delay: 0.7 },
  { image: '/images/poke-bowl.jpg', label: '50% Off', x: '80%', y: '42%', rotate: -5, delay: 0.4 },
  { image: '/images/salmon.jpg', label: '$14.99', x: '18%', y: '70%', rotate: 8, delay: 0.6 },
  { image: '/images/chocolate-cake.jpg', label: 'BOGO', x: '73%', y: '70%', rotate: -12, delay: 0.8 },
];

const PRICE_DESCRIPTIONS: Record<PriceRange, string> = {
  'Under $10': 'Quick bites that won\'t break the bank',
  'Under $15': 'Great meals at great prices',
  'Under $20': 'Premium specials, still affordable',
  'Best Value': 'Best bang for your buck',
  'Family Feast': 'Feed the whole crew for less',
};

const Index = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const [selectedPrice, setSelectedPrice] = useState<PriceRange | null>(null);
  const [selectedTastes, setSelectedTastes] = useState<PrimaryTaste[]>([]);
  const [selectedDealTypes, setSelectedDealTypes] = useState<DealType[]>([]);
  const [selectedFeeds, setSelectedFeeds] = useState<Feeds | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<EatingStyle | null>(null);
  const [veganOnly, setVeganOnly] = useState(false);
  const [feedsOpen, setFeedsOpen] = useState(false);
  const [zipCode, setZipCode] = useState(() => localStorage.getItem('foodman_zip') || '');
  const [showNav, setShowNav] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = heroRef.current?.offsetHeight || 400;
      setShowNav(window.scrollY > heroHeight - 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const saveZip = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 5);
    setZipCode(clean);
    if (clean.length === 5) localStorage.setItem('foodman_zip', clean);
    else if (clean.length === 0) localStorage.removeItem('foodman_zip');
  };

  const toggleTaste = (taste: PrimaryTaste) => {
    setSelectedTastes((prev) => {
      if (prev.includes(taste)) return prev.filter((t) => t !== taste);
      if (prev.length >= 2) return prev;
      return [...prev, taste];
    });
  };

  const toggleDealType = (deal: DealType) => {
    setSelectedDealTypes((prev) =>
      prev.includes(deal) ? prev.filter((d) => d !== deal) : [...prev, deal]
    );
  };

  const goToRestaurants = (price?: PriceRange) => {
    const p = price || selectedPrice;
    const params = new URLSearchParams();
    if (p) params.set('price', p);
    if (selectedTastes.length > 0) params.set('tastes', selectedTastes.join(','));
    if (selectedDealTypes.length > 0) params.set('deals', selectedDealTypes.join(','));
    if (selectedFeeds) params.set('feeds', selectedFeeds);
    if (selectedStyle) params.set('style', selectedStyle);
    if (veganOnly) params.set('vegan', '1');
    if (zipCode.length === 5) params.set('zip', zipCode);
    const qs = params.toString();
    navigate(`/restaurants${qs ? `?${qs}` : ''}`);
  };

  const hasFilters = selectedPrice || selectedTastes.length > 0 || selectedDealTypes.length > 0 || selectedFeeds || selectedStyle || veganOnly;
  const filterCount = (selectedPrice ? 1 : 0) + selectedTastes.length + selectedDealTypes.length + (selectedFeeds ? 1 : 0) + (selectedStyle ? 1 : 0) + (veganOnly ? 1 : 0);

  return (
    <div className="relative min-h-screen bg-background safe-bottom">
      {/* Full-page background image — different from hero steak */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: 'url(/images/pad-thai.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply', opacity: 0.06 }}
      />

      {/* Sticky Nav */}
      <AnimatePresence>
        {showNav && (
          <motion.nav
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -70, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 glass safe-top"
          >
            <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-2.5">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
              >
                <div className="p-1.5 rounded-lg bg-accent">
                  <UtensilsCrossed className="w-4 h-4 text-accent-foreground" />
                </div>
                <span className="text-lg font-display text-foreground">FoodMan</span>
              </motion.button>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToRestaurants()}
                  className="btn-shine flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-accent to-accent/80 text-accent-foreground text-sm font-body font-bold cursor-pointer shadow-md shadow-accent/20 hover:shadow-accent/40 transition-shadow"
                >
                  <Search className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Find Markdowns</span>
                  <span className="sm:hidden">Go</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => {
                    const next = !isDark;
                    setIsDark(next);
                    document.documentElement.classList.toggle('dark', next);
                  }}
                  className="p-2.5 rounded-full bg-muted/80 text-muted-foreground cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? <Sun className="w-4 h-4" strokeWidth={2.5} /> : <Moon className="w-4 h-4" strokeWidth={2.5} />}
                </motion.button>
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
        <section ref={heroRef} id="hero-section" className="relative w-full h-[40vh] sm:h-[55vh] min-h-[280px] sm:min-h-[380px] overflow-hidden">
          {/* Parallax background — overflow-hidden only here */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
              <img
                src="/images/steak.jpg"
                alt="Today's best food markdowns"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/30 to-card" />
            </motion.div>
          </div>

          {/* Dark mode toggle — top right of hero */}
          <div className="absolute top-4 right-4 z-20 safe-top">
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => {
                const next = !isDark;
                setIsDark(next);
                document.documentElement.classList.toggle('dark', next);
              }}
              className="p-2.5 rounded-full bg-card/30 backdrop-blur-md text-primary-foreground cursor-pointer transition-colors hover:bg-card/50"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" strokeWidth={2.5} /> : <Moon className="w-5 h-5" strokeWidth={2.5} />}
            </motion.button>
          </div>

          {/* Hero content */}
          <motion.div
            className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center"
            style={{ opacity: heroOpacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-8"
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                className="relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-accent shadow-elevated"
              >
                <UtensilsCrossed className="w-10 h-10 sm:w-14 sm:h-14 text-accent-foreground" />
                <motion.div
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-destructive border-2 border-primary-foreground/30"
                />
              </motion.div>
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display text-primary-foreground drop-shadow-lg leading-none">
                FoodMan
              </h1>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground/90 mb-1.5 sm:mb-2 drop-shadow-md leading-tight whitespace-nowrap"
            >
              Local markdowns.{' '}
              <motion.span
                animate={{ color: ['hsl(8,78%,58%)', 'hsl(42,90%,55%)', 'hsl(340,70%,55%)', 'hsl(8,78%,58%)'] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="font-bold"
              >
                Real savings.
              </motion.span>
            </motion.h2>
            {/* Find Markdowns Near Me CTA */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => goToRestaurants()}
              className="btn-shine btn-glow icon-bounce flex items-center justify-center gap-2.5 mt-8 sm:mt-10 px-7 sm:px-10 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-accent via-accent/90 to-accent/70 text-accent-foreground font-body font-extrabold text-base sm:text-lg tracking-wide cursor-pointer transition-all"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
              Find Markdowns Near Me
            </motion.button>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 6, 0] }}
              transition={{ delay: 1.2, y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } }}
              className="absolute bottom-3 sm:bottom-5"
            >
              <ChevronDown className="w-5 h-5 text-primary-foreground/50" />
            </motion.div>

          {/* Floating food cards — inside hero */}
          {FLOATING_CARDS.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: card.rotate }}
              transition={{ delay: card.delay, type: 'spring', stiffness: 200, damping: 15 }}
              className="absolute hidden sm:block z-20"
              style={{ left: card.x, top: card.y, opacity: heroOpacity as unknown as number }}
            >
              <motion.button
                animate={{ y: [0, -10, 0], rotate: [0, -5, 5, -3, 0] }}
                transition={{
                  y: { duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 4 + i * 0.3, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' },
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => document.getElementById('price-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 rounded-xl sm:rounded-2xl shadow-elevated border-2 border-white/70 cursor-pointer overflow-visible"
              >
                <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden">
                  <img src={card.image} alt={card.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 rounded-b-xl sm:rounded-b-2xl bg-destructive/90 px-1 py-0.5 sm:py-1">
                    <p className="text-[8px] sm:text-[10px] lg:text-xs font-body font-bold text-destructive-foreground text-center">{card.label}</p>
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-destructive border-2 border-primary-foreground/50 z-10"
                />
              </motion.button>
            </motion.div>
          ))}
          </motion.div>
        </section>

        {/* Gradient divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

        {/* Price/Value Selection — first interaction */}
        <section id="price-section" className="w-full overflow-hidden">
          <div className="max-w-2xl mx-auto px-4 py-6 sm:py-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-5 sm:mb-8"
            >
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-1.5">
                Pick your price
              </h3>
              <p className="text-sm sm:text-base font-body text-muted-foreground">
                Tap any range to see matching deals instantly
              </p>
            </motion.div>

            {/* Zip code input */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mb-5 sm:mb-6 px-4 py-2.5 rounded-xl border border-border bg-muted/40 focus-within:border-accent/50 focus-within:bg-card transition-all max-w-xs mx-auto"
            >
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={zipCode}
                onChange={(e) => saveZip(e.target.value)}
                placeholder="Enter zip code"
                inputMode="numeric"
                maxLength={5}
                className="bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
              {zipCode && (
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => saveZip('')}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                </motion.button>
              )}
            </motion.div>
            <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
              {PRICE_RANGES.map((price, i) => {
                const isActive = selectedPrice === price;
                return (
                  <motion.button
                    key={price}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 * i, type: 'spring', stiffness: 300, damping: 22 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedPrice(isActive ? null : price);
                      if (!isActive) {
                        goToRestaurants(price);
                      }
                    }}
                    className={`flex items-center gap-3 sm:gap-5 w-full px-4 sm:px-7 py-3.5 sm:py-6 rounded-2xl border-2 transition-all cursor-pointer group ${
                      isActive
                        ? 'border-accent bg-accent/15 shadow-lg ring-2 ring-accent/40'
                        : 'border-border bg-card hover:bg-accent/10 hover:border-accent/50 shadow-card hover:shadow-food'
                    }`}
                  >
                    <span className="text-2xl sm:text-4xl">{PRICE_RANGE_ICONS[price]}</span>
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className={`text-sm sm:text-xl font-display font-bold truncate ${
                        isActive ? 'text-foreground' : 'text-foreground/90 group-hover:text-foreground'
                      }`}>
                        {price}
                      </span>
                      <span className="text-xs sm:text-base font-body text-muted-foreground truncate">
                        {PRICE_DESCRIPTIONS[price]}
                      </span>
                    </div>
                    <ArrowRight className={`w-5 h-5 shrink-0 transition-transform ${
                      isActive ? 'text-accent translate-x-1' : 'text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground'
                    }`} />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Smooth gradient divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        </section>

        {/* Optional Refinements */}
        <section id="refine-section" className="flex flex-col items-center px-4 py-10 sm:py-12">
          <div className="flex flex-col items-center w-full">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-2"
          >
            Refine your feed
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg font-body font-medium text-foreground/70 text-center mb-8 max-w-xs sm:max-w-md"
          >
            Mix and match vibes, styles, and dietary preferences to find your perfect meal.
          </motion.p>

          {/* Vibe / Taste */}
          <div className="w-full max-w-2xl mb-8">
            <p className="text-xl sm:text-2xl font-display font-bold text-foreground text-center mb-3 uppercase tracking-widest">Vibe / Taste</p>
            <div className="flex gap-2 sm:gap-3 justify-start sm:justify-center overflow-x-auto scrollbar-hide scroll-touch px-2 sm:px-0 pb-1">
              {PRIMARY_TASTES.map((taste, i) => (
                <motion.div
                  key={taste}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                  className="flex-shrink-0 w-[72px] sm:w-auto sm:flex-1 sm:max-w-[110px]"
                >
                  <TasteTile
                    taste={taste}
                    selected={selectedTastes.includes(taste)}
                    onToggle={() => toggleTaste(taste)}
                  />
                </motion.div>
              ))}
            </div>
            {selectedTastes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center justify-center gap-2 mt-3"
              >
                <span className="text-xs text-muted-foreground font-body">
                  {selectedTastes.length} selected
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedTastes([])}
                  className="text-xs font-body font-medium text-destructive/80 hover:text-destructive px-2.5 py-1 rounded-full border border-destructive/30 hover:border-destructive/60 hover:bg-destructive/10 transition-all cursor-pointer"
                >
                  Clear
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Eating Style */}
          <div className="w-full max-w-2xl mb-8">
            <p className="text-xl sm:text-2xl font-display font-bold text-foreground text-center mb-3 uppercase tracking-widest">Eating Style</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center px-2 sm:px-0 pb-1">
              {EATING_STYLES.map((style, i) => {
                const isActive = selectedStyle === style;
                return (
                  <motion.button
                    key={style}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.03 * i }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setSelectedStyle(isActive ? null : style)}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-full border transition-all cursor-pointer text-xs sm:text-sm font-body font-semibold whitespace-nowrap ${
                      isActive
                        ? 'border-accent bg-accent/15 text-foreground ring-1 ring-accent/30 shadow-sm'
                        : 'border-border bg-muted/50 text-foreground hover:bg-accent/10 hover:border-accent/40'
                    }`}
                  >
                    <span className="text-sm sm:text-base">{EATING_STYLE_ICONS[style]}</span>
                    {style}
                  </motion.button>
                );
              })}
              <div className="hidden sm:block w-px h-8 bg-border my-auto mx-0.5 shrink-0" />
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.03 * EATING_STYLES.length }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setVeganOnly((prev) => !prev)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-full border transition-all cursor-pointer text-xs sm:text-sm font-body font-semibold whitespace-nowrap ${
                  veganOnly
                    ? 'border-green-500 bg-green-500/15 text-green-700 ring-1 ring-green-500/30 shadow-sm'
                    : 'border-border bg-muted/50 text-foreground hover:bg-accent/10 hover:border-accent/40'
                }`}
              >
                <span className="text-base">🌱</span>
                Vegan
              </motion.button>
            </div>
            {(selectedStyle || veganOnly) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-2"
              >
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setSelectedStyle(null); setVeganOnly(false); }}
                  className="text-xs font-body font-medium text-destructive/80 hover:text-destructive px-2.5 py-1 rounded-full border border-destructive/30 hover:border-destructive/60 hover:bg-destructive/10 transition-all cursor-pointer"
                >
                  Clear
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Savings type */}
          <div className="w-full max-w-2xl mb-8">
            <p className="text-sm sm:text-base font-display font-bold text-foreground text-center mb-3 uppercase tracking-widest">Favorites</p>
            <div className="flex gap-2 justify-start sm:justify-center overflow-x-auto scrollbar-hide scroll-touch px-2 sm:px-0 pb-1">
              {DEAL_TYPES.map((deal, i) => {
                const isActive = selectedDealTypes.includes(deal);
                return (
                  <motion.button
                    key={deal}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.03 * i }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => toggleDealType(deal)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full border transition-all cursor-pointer text-sm font-body font-semibold whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'border-accent bg-accent/15 text-foreground ring-1 ring-accent/30 shadow-sm'
                        : 'border-border bg-muted/50 text-foreground hover:bg-accent/10 hover:border-accent/40'
                    }`}
                  >
                    <span className="text-base">{DEAL_ICONS[deal]}</span>
                    {deal}
                  </motion.button>
                );
              })}
            </div>
            {selectedDealTypes.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-2"
              >
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedDealTypes([])}
                  className="text-xs font-body font-medium text-destructive/80 hover:text-destructive px-2.5 py-1 rounded-full border border-destructive/30 hover:border-destructive/60 hover:bg-destructive/10 transition-all cursor-pointer"
                >
                  Clear
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Group size */}
          <div className="w-full max-w-sm mb-8">
            <p className="text-sm sm:text-base font-display font-bold text-foreground text-center mb-3 uppercase tracking-widest">Group size</p>

            {/* Mobile: horizontal pill buttons */}
            <div className="flex sm:hidden gap-2 justify-center overflow-x-auto scrollbar-hide scroll-touch px-2 pb-1">
              {FEEDS_OPTIONS.map((feeds) => {
                const isActive = selectedFeeds === feeds;
                const icons: Record<string, string> = { '3–4': '👥', '5–7': '👨‍👩‍👧', '8–10': '👨‍👩‍👧‍👦', '10+': '🎉' };
                return (
                  <motion.button
                    key={feeds}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setSelectedFeeds(isActive ? null : feeds)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border transition-all cursor-pointer text-sm font-body font-semibold whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'border-accent bg-accent/15 text-foreground ring-1 ring-accent/30 shadow-sm'
                        : 'border-border bg-muted/50 text-foreground'
                    }`}
                  >
                    <span className="text-sm">{icons[feeds]}</span>
                    {feeds}
                  </motion.button>
                );
              })}
            </div>

            {/* Desktop: dropdown */}
            <div className="hidden sm:block relative w-full max-w-xs mx-auto">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setFeedsOpen((prev) => !prev)}
                className={`flex items-center justify-between w-full px-5 py-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedFeeds
                    ? 'border-accent bg-accent/10 shadow-sm'
                    : 'border-border bg-muted/50 hover:border-accent/40'
                } ${feedsOpen ? 'ring-2 ring-accent/30 border-accent' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-5 h-5 ${selectedFeeds ? 'text-accent' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-body font-semibold ${selectedFeeds ? 'text-foreground' : 'text-foreground'}`}>
                    {selectedFeeds ? `Feeds ${selectedFeeds} people` : 'Select group size'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${feedsOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {feedsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute z-20 mt-2 w-full rounded-2xl border-2 border-border bg-card shadow-elevated overflow-hidden origin-top"
                  >
                    {FEEDS_OPTIONS.map((feeds) => {
                      const isActive = selectedFeeds === feeds;
                      const icons: Record<string, string> = { '3–4': '👥', '5–7': '👨‍👩‍👧', '8–10': '👨‍👩‍👧‍👦', '10+': '🎉' };
                      const labels: Record<string, string> = { '3–4': 'Small group', '5–7': 'Medium group', '8–10': 'Large group', '10+': 'Party size' };
                      return (
                        <motion.button
                          key={feeds}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedFeeds(isActive ? null : feeds);
                            setFeedsOpen(false);
                          }}
                          className={`flex items-center gap-3 w-full px-5 py-3.5 transition-colors cursor-pointer ${
                            isActive ? 'bg-accent/10' : 'hover:bg-muted/80'
                          }`}
                        >
                          <span className="text-lg">{icons[feeds]}</span>
                          <div className="flex flex-col items-start flex-1">
                            <span className={`text-sm font-body font-bold ${isActive ? 'text-accent' : 'text-foreground'}`}>
                              Feeds {feeds}
                            </span>
                            <span className="text-[11px] font-body text-muted-foreground">{labels[feeds]}</span>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-accent" />}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {feedsOpen && (
                <div className="fixed inset-0 z-10" onClick={() => setFeedsOpen(false)} />
              )}
            </div>
          </div>

          {/* Continue CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-3 w-full px-4"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => goToRestaurants()}
              className="btn-shine btn-glow flex items-center justify-center gap-2.5 w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-accent via-accent/90 to-accent/70 text-accent-foreground font-body font-extrabold text-base sm:text-lg tracking-wide cursor-pointer transition-all"
            >
              {hasFilters ? 'Show Markdowns' : 'Browse All Markdowns'}
              {filterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-foreground/20 text-[10px] font-bold">
                  {filterCount}
                </span>
              )}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
          </div>
        </section>



        <Footer />
      </motion.div>
    </div>
  );
};

export default Index;
