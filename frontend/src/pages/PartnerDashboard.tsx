import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  usePartnerDashboard,
  usePartnerRestaurants,
  usePartnerDeals,
  useCreatePartnerDeal,
  useTogglePartnerDeal,
  useDeletePartnerDeal,
  usePartnerReviews,
  useCreatePartnerRestaurant,
} from '@/hooks/use-api';
import { getAuthToken, getStoredUser, clearAuth, uploadDealImage, resolveImageUrl } from '@/lib/api';
import { REVIEW_BADGE_ICONS } from '@/types/food';
import {
  LayoutDashboard, Tag, MessageSquare, Plus, Trash2, Pause, Play,
  LogOut, Loader2, Upload, Building2, X, ChevronDown, Image as ImageIcon,
} from 'lucide-react';
import { LoadingScreen } from '@/components/LoadingScreen';

type Tab = 'overview' | 'deals' | 'reviews';

const CATEGORIES = ['Handheld', 'Pizza', 'Bowls & Plates', 'Comfort', 'Fresh & Light', 'Snacky'];
const MEAL_TYPES = ['Lunch Special', 'Late Night', 'BOGO', 'Under $10'];
const TASTES = ['Crispy', 'Cheesy', 'Spicy', 'Fresh', 'Indulgence', 'Saucy'];
const FEEDS_OPTIONS = ['1–2', '3–4', '5–7', '8–10', '10+'];
const DIETARY_TAGS = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Halal'];
const SPICE_LEVELS = ['Mild', 'Medium', 'Hot', 'Extra Hot'];
const POPULARITY_OPTIONS = ['New', 'Trending', 'Best Seller', 'Staff Pick'];

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [showDealForm, setShowDealForm] = useState(false);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) navigate('/partner/login');
  }, [navigate]);

  const user = getStoredUser();
  const { data: dashboard, isLoading: dashLoading } = usePartnerDashboard();
  const { data: restaurants } = usePartnerRestaurants() as { data: Array<{ id: string; name: string; coverImage: string }> | undefined };
  const { data: deals } = usePartnerDeals(selectedRestaurant || undefined) as { data: Array<Record<string, unknown>> | undefined };
  const { data: reviews } = usePartnerReviews() as { data: Array<Record<string, unknown>> | undefined };

  useEffect(() => {
    if (restaurants?.length && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurant]);

  const handleLogout = () => {
    clearAuth();
    navigate('/partner/login');
  };

  const tabs: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'deals', label: 'Deals', icon: <Tag className="w-4 h-4" /> },
    { key: 'reviews', label: 'Reviews', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  if (dashLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent">
              <Building2 className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-display text-foreground">{user?.businessName || 'Partner'}</h1>
              <p className="text-xs font-body text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-[61px] z-20 bg-background border-b border-border">
        <div className="max-w-5xl mx-auto flex">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-body font-medium border-b-2 transition-colors cursor-pointer ${
                tab === t.key
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Quick add button — always visible */}
        <div className="flex gap-2 mb-6">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowDealForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-body font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Deal
          </motion.button>
          {(!restaurants || restaurants.length === 0) && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowRestaurantForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background font-body font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Building2 className="w-4 h-4" /> Add Restaurant
            </motion.button>
          )}
        </div>

        {tab === 'overview' && dashboard && <OverviewTab stats={dashboard.stats} />}

        {tab === 'deals' && (
          <DealsTab
            restaurants={restaurants || []}
            selectedRestaurant={selectedRestaurant}
            setSelectedRestaurant={setSelectedRestaurant}
            deals={deals || []}
          />
        )}

        {tab === 'reviews' && <ReviewsTab reviews={reviews || []} />}
      </div>

      {/* Deal form modal */}
      <AnimatePresence>
        {showDealForm && (
          <DealFormModal
            restaurants={restaurants || []}
            onClose={() => setShowDealForm(false)}
            onNeedRestaurant={() => { setShowDealForm(false); setShowRestaurantForm(true); }}
          />
        )}
      </AnimatePresence>

      {/* Restaurant form modal */}
      <AnimatePresence>
        {showRestaurantForm && (
          <RestaurantFormModal onClose={() => setShowRestaurantForm(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Overview Tab ──
function OverviewTab({ stats }: { stats: { totalDeals: number; activeDeals: number; totalViews: number; totalRatings: number; totalReviews: number } }) {
  const cards = [
    { label: 'Active Deals', value: stats.activeDeals, color: 'bg-green-500/10 text-green-700' },
    { label: 'Total Deals', value: stats.totalDeals, color: 'bg-accent/10 text-accent' },
    { label: 'Total Ratings', value: stats.totalRatings, color: 'bg-amber-500/10 text-amber-700' },
    { label: 'Total Reviews', value: stats.totalReviews, color: 'bg-purple-500/10 text-purple-700' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className={`flex flex-col gap-1 p-4 rounded-xl border border-border ${c.color}`}>
          <span className="text-2xl font-display">{c.value}</span>
          <span className="text-xs font-body font-medium opacity-80">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Deals Tab ──
function DealsTab({
  restaurants,
  selectedRestaurant,
  setSelectedRestaurant,
  deals,
}: {
  restaurants: Array<{ id: string; name: string }>;
  selectedRestaurant: string;
  setSelectedRestaurant: (id: string) => void;
  deals: Array<Record<string, unknown>>;
}) {
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toggleDeal = useTogglePartnerDeal();
  const deleteDeal = useDeletePartnerDeal();

  return (
    <div className="flex flex-col gap-4">
      {/* Restaurant selector */}
      <AnimatedSelect
        value={selectedRestaurant}
        onChange={setSelectedRestaurant}
        options={restaurants.map((r) => ({ value: r.id, label: r.name }))}
        className="w-full sm:w-64"
      />

      {/* Deals list */}
      {deals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <Tag className="w-10 h-10 opacity-40" />
          <p className="text-sm font-body">No deals yet. Add your first deal!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {deals.map((deal: Record<string, unknown>) => {
            const isActive = new Date(deal.dealExpiresAt as string) > new Date();
            return (
              <div
                key={deal.id as string}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
              >
                <img
                  src={resolveImageUrl(deal.image as string)}
                  alt={deal.name as string}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-semibold text-foreground truncate">{deal.name as string}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-body text-muted-foreground">${(deal.price as number)?.toFixed(2)}</span>
                    <span className={`text-xs font-body font-medium px-2 py-0.5 rounded-full ${isActive ? 'bg-green-500/10 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {isActive ? 'Active' : 'Expired'}
                    </span>
                    <span className="text-xs font-body text-muted-foreground">{deal.views as number || 0} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setTogglingId(deal.id as string);
                      toggleDeal.mutate(deal.id as string, { onSettled: () => setTogglingId(null) });
                    }}
                    disabled={togglingId === (deal.id as string)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                    title={isActive ? 'Pause' : 'Activate'}
                  >
                    {togglingId === (deal.id as string) ? (
                      <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                    ) : isActive ? (
                      <Pause className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Play className="w-4 h-4 text-green-600" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this deal?')) {
                        setDeletingId(deal.id as string);
                        deleteDeal.mutate(deal.id as string, { onSettled: () => setDeletingId(null) });
                      }
                    }}
                    disabled={deletingId === (deal.id as string)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === (deal.id as string) ? (
                      <Loader2 className="w-4 h-4 text-destructive animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-destructive" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Reviews Tab ──
function ReviewsTab({ reviews }: { reviews: Array<Record<string, unknown>> }) {
  // Aggregate badge counts
  const badgeCounts: Record<string, number> = {};
  for (const r of reviews) {
    const badge = r.badge as string;
    badgeCounts[badge] = (badgeCounts[badge] || 0) + 1;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Badge summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(badgeCounts).map(([badge, count]) => (
          <div key={badge} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 border border-accent/20">
            <span className="text-lg">{REVIEW_BADGE_ICONS[badge as keyof typeof REVIEW_BADGE_ICONS] || ''}</span>
            <span className="text-sm font-body font-semibold text-accent">{badge}</span>
            <span className="text-xs font-body text-accent/70 ml-1">{count}</span>
          </div>
        ))}
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <MessageSquare className="w-10 h-10 opacity-40" />
          <p className="text-sm font-body">No reviews yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {reviews.map((r: Record<string, unknown>) => {
            const dish = r.dish as Record<string, unknown> | undefined;
            const restaurant = r.restaurant as Record<string, unknown> | undefined;
            return (
              <div key={r.id as string} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card">
                {dish?.image && (
                  <img src={resolveImageUrl(dish.image as string)} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{REVIEW_BADGE_ICONS[r.badge as keyof typeof REVIEW_BADGE_ICONS] || ''}</span>
                    <span className="text-sm font-body font-semibold text-foreground">{r.badge as string}</span>
                  </div>
                  {r.comment && (
                    <p className="text-xs font-body text-muted-foreground mt-1">{r.comment as string}</p>
                  )}
                  <p className="text-xs font-body text-muted-foreground/60 mt-1">
                    {dish?.name as string} &middot; {restaurant?.name as string}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Deal Form Modal (Upload Flow) ──
function DealFormModal({
  restaurants,
  onClose,
  onNeedRestaurant,
}: {
  restaurants: Array<{ id: string; name: string }>;
  onClose: () => void;
  onNeedRestaurant: () => void;
}) {
  const createDeal = useCreatePartnerDeal();
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id || '');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [dealType, setDealType] = useState(MEAL_TYPES[0]);
  const [primaryTaste, setPrimaryTaste] = useState(TASTES[0]);
  const [price, setPrice] = useState('');
  const [feeds, setFeeds] = useState(FEEDS_OPTIONS[0]);
  const [modifiers, setModifiers] = useState<string[]>([]);
  const [spiceLevel, setSpiceLevel] = useState('');
  const [popularity, setPopularity] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = useCallback((file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageChange(file);
  }, [handleImageChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) { onNeedRestaurant(); return; }
    if (!imageFile) { setError('Please upload a photo'); return; }
    setError('');
    setUploading(true);
    try {
      const { url } = await uploadDealImage(imageFile);
      await createDeal.mutateAsync({
        restaurantId,
        data: {
          name,
          image: url,
          category,
          primaryTaste,
          price: parseFloat(price),
          feeds,
          dealType,
          dealExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          modifiers,
          spiceLevel: spiceLevel || undefined,
          popularity: popularity || undefined,
        },
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create deal');
    } finally {
      setUploading(false);
    }
  };

  if (restaurants.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-card rounded-2xl p-6 w-full max-w-md shadow-elevated"
        >
          <p className="text-sm font-body text-foreground text-center mb-4">
            You need to create a restaurant first before adding deals.
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-body cursor-pointer">Cancel</button>
            <button onClick={onNeedRestaurant} className="flex-1 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-body font-bold cursor-pointer">Add Restaurant</button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm overflow-y-auto p-4 pt-8 pb-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-card rounded-2xl w-full max-w-lg shadow-elevated"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-xl font-display text-foreground">Add New Deal</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {/* Restaurant */}
          <div>
            <label className="text-xs font-body font-semibold text-foreground/70 uppercase tracking-wider mb-1.5 block">Restaurant</label>
            <AnimatedSelect
              value={restaurantId}
              onChange={setRestaurantId}
              options={restaurants.map((r) => ({ value: r.id, label: r.name }))}
            />
          </div>

          {/* Deal Title */}
          <div>
            <label className="text-xs font-body font-semibold text-foreground/70 uppercase tracking-wider mb-1.5 block">Deal Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BBQ Bacon Burger Combo"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>

          {/* Deal Setup dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            <DropdownField label="Category" value={category} onChange={setCategory} options={CATEGORIES} />
            <DropdownField label="Meal Type" value={dealType} onChange={setDealType} options={MEAL_TYPES} />
            <DropdownField label="Taste" value={primaryTaste} onChange={setPrimaryTaste} options={TASTES} />
            <DropdownField label="Feeds" value={feeds} onChange={setFeeds} options={FEEDS_OPTIONS} />
          </div>

          {/* Price */}
          <div>
            <label className="text-xs font-body font-semibold text-foreground/70 uppercase tracking-wider mb-1.5 block">Deal Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="9.99"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="text-xs font-body font-semibold text-foreground/70 uppercase tracking-wider mb-1.5 block">Photo</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-accent/40 transition-colors cursor-pointer bg-background"
              onClick={() => document.getElementById('deal-image-input')?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                  <p className="text-xs font-body text-muted-foreground text-center">
                    Drag & drop or tap to upload
                  </p>
                </>
              )}
              <input
                id="deal-image-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
                className="hidden"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-body font-semibold text-foreground/70 uppercase tracking-wider mb-1.5 block">Dietary Tags</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setModifiers((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
                  className={`px-3 py-1.5 rounded-full text-xs font-body font-medium border cursor-pointer transition-all ${
                    modifiers.includes(tag)
                      ? 'border-accent bg-accent/15 text-accent'
                      : 'border-border bg-background text-muted-foreground hover:border-accent/40'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DropdownField label="Spice Level" value={spiceLevel} onChange={setSpiceLevel} options={['', ...SPICE_LEVELS]} placeholder="Select..." />
            <DropdownField label="Popularity" value={popularity} onChange={setPopularity} options={['', ...POPULARITY_OPTIONS]} placeholder="Select..." />
          </div>

          {error && <p className="text-sm font-body text-destructive text-center">{error}</p>}

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={uploading}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent text-accent-foreground font-body font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Creating...' : 'Create Deal'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Restaurant Form Modal ──
function RestaurantFormModal({ onClose }: { onClose: () => void }) {
  const createRestaurant = useCreatePartnerRestaurant();
  const [name, setName] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createRestaurant.mutateAsync({
        name,
        coverImage: coverImage || '/images/pad-thai.jpg',
        redirectUrl,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create restaurant');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-card rounded-2xl w-full max-w-md shadow-elevated"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-xl font-display text-foreground">Add Restaurant</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Restaurant Name"
            required
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="Cover Image URL (optional)"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <input
            type="url"
            value={redirectUrl}
            onChange={(e) => setRedirectUrl(e.target.value)}
            placeholder="Website / Order URL"
            required
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          {error && <p className="text-sm font-body text-destructive text-center">{error}</p>}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={createRestaurant.isPending}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent text-accent-foreground font-body font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {createRestaurant.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
            {createRestaurant.isPending ? 'Creating...' : 'Create Restaurant'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Animated Select (for id/label pairs) ──
function AnimatedSelect({
  value,
  onChange,
  options,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between pl-3 pr-3 py-2.5 rounded-xl border border-border bg-card text-sm font-body text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
      >
        <span>{selected?.label || 'Select...'}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ transformOrigin: 'top' }}
            className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card shadow-elevated py-1"
          >
            {options.map((o, i) => (
              <motion.li
                key={o.value}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025, duration: 0.12 }}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`px-3 py-2 text-sm font-body cursor-pointer transition-colors ${
                  o.value === value
                    ? 'bg-accent/15 text-accent font-semibold'
                    : 'text-foreground hover:bg-accent/10'
                }`}
              >
                {o.label}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Reusable Animated Dropdown ──
function DropdownField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const display = value || placeholder || 'Select...';
  const filtered = options.filter(Boolean);

  return (
    <div>
      <label className="text-xs font-body font-semibold text-foreground/70 uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between pl-3 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm font-body cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors"
        >
          <span className={value ? 'text-foreground' : 'text-muted-foreground'}>{display}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </button>
        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{ transformOrigin: 'top' }}
              className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card shadow-elevated py-1"
            >
              {placeholder && (
                <motion.li
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 }}
                  onClick={() => { onChange(''); setOpen(false); }}
                  className="px-3 py-2 text-sm font-body text-muted-foreground cursor-pointer hover:bg-accent/10 transition-colors"
                >
                  {placeholder}
                </motion.li>
              )}
              {filtered.map((o, i) => (
                <motion.li
                  key={o}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025, duration: 0.12 }}
                  onClick={() => { onChange(o); setOpen(false); }}
                  className={`px-3 py-2 text-sm font-body cursor-pointer transition-colors ${
                    o === value
                      ? 'bg-accent/15 text-accent font-semibold'
                      : 'text-foreground hover:bg-accent/10'
                  }`}
                >
                  {o}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
