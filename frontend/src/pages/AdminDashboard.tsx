import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  useAdminStats,
  useAdminMostViewed,
  useAdminMostActivePartners,
  useAdminNewestDeals,
  useAdminByCategory,
  useAdminTrend,
  useAdminPartners,
  useAdminDeals,
  useDeleteAdminDeal,
  useAdminReviews,
  useDeleteAdminReview,
} from '@/hooks/use-api';
import { getAuthToken, getStoredUser, clearAuth, resolveImageUrl } from '@/lib/api';
import { REVIEW_BADGE_ICONS } from '@/types/food';
import {
  Shield, LayoutDashboard, Tag, Users, MessageSquare, BarChart3,
  LogOut, Loader2, Trash2, ChevronLeft, ChevronRight, TrendingUp,
  Eye, Star, Clock,
} from 'lucide-react';
import { LoadingScreen } from '@/components/LoadingScreen';

type Tab = 'overview' | 'analytics' | 'deals' | 'partners' | 'reviews';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    if (!getAuthToken()) navigate('/admin/login');
  }, [navigate]);

  const user = getStoredUser();
  const { data: stats, isLoading } = useAdminStats();

  const handleLogout = () => {
    clearAuth();
    navigate('/admin/login');
  };

  const tabs: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2.5} /> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" strokeWidth={2.5} /> },
    { key: 'deals', label: 'Deals', icon: <Tag className="w-4 h-4" strokeWidth={2.5} /> },
    { key: 'partners', label: 'Partners', icon: <Users className="w-4 h-4" strokeWidth={2.5} /> },
    { key: 'reviews', label: 'Reviews', icon: <MessageSquare className="w-4 h-4" strokeWidth={2.5} /> },
  ];

  if (isLoading) {
    return <LoadingScreen message="Loading admin dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-foreground text-background px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <div>
              <h1 className="text-lg font-display">Admin Dashboard</h1>
              <p className="text-xs font-body opacity-70">{user?.email}</p>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.03 }} onClick={handleLogout} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-body font-semibold opacity-70 hover:opacity-100 hover:bg-background/15 cursor-pointer transition-all">
            <LogOut className="w-4 h-4" strokeWidth={2.5} /> Logout
          </motion.button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-[53px] z-20 bg-background border-b border-border overflow-x-auto scrollbar-hide">
        <div className="max-w-6xl mx-auto flex">
          {tabs.map((t) => (
            <motion.button
              key={t.key}
              onClick={() => setTab(t.key)}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-2 px-4 sm:px-5 py-3.5 text-sm font-body font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                tab === t.key
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className={`transition-transform ${tab === t.key ? 'scale-110' : ''}`}>{t.icon}</span>
              {t.label}
              {tab === t.key && (
                <motion.div
                  layoutId="admin-tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {tab === 'overview' && stats && <OverviewTab stats={stats} />}
        {tab === 'analytics' && <AnalyticsTab />}
        {tab === 'deals' && <DealsTab />}
        {tab === 'partners' && <PartnersTab />}
        {tab === 'reviews' && <ReviewsTab />}
      </div>
    </div>
  );
}

// ── Overview ──
function OverviewTab({ stats }: { stats: Record<string, number> }) {
  const cards = [
    { label: 'Total Partners', value: stats.totalPartners, icon: <Users className="w-5 h-5" />, color: 'bg-blue-500/10 text-blue-700', iconBg: 'bg-blue-500/20' },
    { label: 'Active Deals', value: stats.activeDeals, icon: <Tag className="w-5 h-5" />, color: 'bg-green-500/10 text-green-700', iconBg: 'bg-green-500/20' },
    { label: 'Total Deals', value: stats.totalDeals, icon: <Tag className="w-5 h-5" />, color: 'bg-accent/10 text-accent', iconBg: 'bg-accent/20' },
    { label: 'Total Views', value: stats.totalViews, icon: <Eye className="w-5 h-5" />, color: 'bg-purple-500/10 text-purple-700', iconBg: 'bg-purple-500/20' },
    { label: 'Total Ratings', value: stats.totalRatings, icon: <Star className="w-5 h-5" />, color: 'bg-amber-500/10 text-amber-700', iconBg: 'bg-amber-500/20' },
    { label: 'Total Reviews', value: stats.totalReviews, icon: <MessageSquare className="w-5 h-5" />, color: 'bg-pink-500/10 text-pink-700', iconBg: 'bg-pink-500/20' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`flex flex-col gap-2 p-4 rounded-2xl border border-border ${c.color}`}
        >
          <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center`}>
            {c.icon}
          </div>
          <span className="text-3xl font-display">{c.value}</span>
          <span className="text-xs font-body font-semibold uppercase tracking-wider opacity-70">{c.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ── Analytics ──
function AnalyticsTab() {
  const { data: mostViewed } = useAdminMostViewed() as { data: Array<Record<string, unknown>> | undefined };
  const { data: mostActive } = useAdminMostActivePartners() as { data: Array<Record<string, unknown>> | undefined };
  const { data: newest } = useAdminNewestDeals() as { data: Array<Record<string, unknown>> | undefined };
  const { data: byCategory } = useAdminByCategory();
  const { data: trend } = useAdminTrend();

  return (
    <div className="flex flex-col gap-6">
      {/* Trend chart (simple bar visualization) */}
      {trend && trend.length > 0 && (
        <div className="p-4 rounded-xl border border-border bg-card">
          <h3 className="text-base font-body font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" /> 30-Day Activity
          </h3>
          <div className="flex items-end gap-0.5 h-24">
            {trend.map((d) => {
              const maxVal = Math.max(...trend.map((t) => t.views + t.reviews), 1);
              const h = ((d.views + d.reviews) / maxVal) * 100;
              return (
                <div
                  key={d.date}
                  className="flex-1 bg-accent/60 rounded-t hover:bg-accent transition-colors"
                  style={{ height: `${Math.max(h, 2)}%` }}
                  title={`${d.date}: ${d.views} views, ${d.reviews} reviews`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] font-body text-muted-foreground">{trend[0]?.date}</span>
            <span className="text-[10px] font-body text-muted-foreground">{trend[trend.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Deals by category */}
      {byCategory && byCategory.length > 0 && (
        <div className="p-4 rounded-xl border border-border bg-card">
          <h3 className="text-base font-body font-semibold text-foreground mb-3">Deals by Category</h3>
          <div className="flex flex-col gap-2">
            {byCategory.map((c) => {
              const maxCount = Math.max(...byCategory.map((b) => b.count), 1);
              return (
                <div key={c.category} className="flex items-center gap-3">
                  <span className="text-sm font-body text-foreground w-28 truncate">{c.category}</span>
                  <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent/70"
                      style={{ width: `${(c.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-body font-semibold text-foreground w-8 text-right">{c.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Most viewed */}
        {mostViewed && (
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-base font-body font-semibold text-foreground mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-500" /> Most Viewed Deals
            </h3>
            <div className="flex flex-col gap-2">
              {mostViewed.map((d, i) => (
                <div key={d.id as string} className="flex items-center gap-2">
                  <span className="text-xs font-body text-muted-foreground w-5">{i + 1}.</span>
                  <img src={resolveImageUrl(d.image as string)} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium text-foreground truncate">{d.name as string}</p>
                    <p className="text-xs font-body text-muted-foreground">{d.restaurantName as string}</p>
                  </div>
                  <span className="text-sm font-body font-semibold text-foreground">{d.views as number}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most active partners */}
        {mostActive && (
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-base font-body font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Most Active Partners
            </h3>
            <div className="flex flex-col gap-2">
              {mostActive.map((p, i) => (
                <div key={p.id as string} className="flex items-center gap-2">
                  <span className="text-xs font-body text-muted-foreground w-5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium text-foreground truncate">{p.businessName as string}</p>
                    <p className="text-xs font-body text-muted-foreground">{p.email as string}</p>
                  </div>
                  <span className="text-sm font-body font-semibold text-foreground">{p.totalDeals as number} deals</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Newest deals */}
      {newest && (
        <div className="p-4 rounded-xl border border-border bg-card">
          <h3 className="text-base font-body font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-500" /> Newest Deals
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {newest.map((d) => (
              <div key={d.id as string} className="flex items-center gap-3 p-2 rounded-lg border border-border">
                <img src={resolveImageUrl(d.image as string)} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-foreground truncate">{d.name as string}</p>
                  <p className="text-xs font-body text-muted-foreground">{d.restaurantName as string} &middot; ${(d.price as number)?.toFixed(2)}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body font-medium">{d.category as string}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Deals management ──
function DealsTab() {
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data, isLoading } = useAdminDeals(page) as { data: { deals: Array<Record<string, unknown>>; total: number; totalPages: number } | undefined; isLoading: boolean };
  const deleteDeal = useDeleteAdminDeal();

  if (isLoading) {
    return <LoadingScreen message="Loading deals..." />;
  }

  const handleDelete = (dealId: string) => {
    if (!confirm('Delete this deal?')) return;
    setDeletingId(dealId);
    deleteDeal.mutate(dealId, {
      onSettled: () => setDeletingId(null),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {data?.deals.map((deal) => {
        const isActive = new Date(deal.dealExpiresAt as string) > new Date();
        const isDeleting = deletingId === (deal.id as string);
        return (
          <div key={deal.id as string} className={`relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card transition-opacity ${isDeleting ? 'opacity-50' : ''}`}>
            {isDeleting && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl z-10">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-accent" />
                  <span className="text-sm font-body text-muted-foreground">Deleting...</span>
                </div>
              </div>
            )}
            <img src={resolveImageUrl(deal.image as string)} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body font-semibold text-foreground truncate">{deal.name as string}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs font-body text-muted-foreground">{deal.restaurantName as string}</span>
                <span className="text-xs font-body text-muted-foreground">${(deal.price as number)?.toFixed(2)}</span>
                <span className={`text-xs font-body font-medium px-2 py-0.5 rounded-full ${isActive ? 'bg-green-500/10 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  {isActive ? 'Active' : 'Expired'}
                </span>
                <span className="text-xs font-body text-muted-foreground">{deal.views as number || 0} views</span>
                <span className="text-xs font-body text-muted-foreground">{deal.reviewCount as number || 0} reviews</span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => handleDelete(deal.id as string)}
              disabled={isDeleting}
              className="p-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 hover:ring-1 hover:ring-destructive/30 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 text-destructive" strokeWidth={2.5} />
            </motion.button>
          </div>
        );
      })}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2.5 rounded-xl border-2 border-border hover:bg-muted hover:border-accent/30 disabled:opacity-30 cursor-pointer shadow-sm hover:shadow-md transition-all"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
          <span className="text-sm font-body font-bold text-muted-foreground">
            Page {page} of {data.totalPages}
          </span>
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="p-2.5 rounded-xl border-2 border-border hover:bg-muted hover:border-accent/30 disabled:opacity-30 cursor-pointer shadow-sm hover:shadow-md transition-all"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
        </div>
      )}
    </div>
  );
}

// ── Partners list ──
function PartnersTab() {
  const { data: partners, isLoading } = useAdminPartners() as { data: Array<Record<string, unknown>> | undefined; isLoading: boolean };

  if (isLoading) {
    return <LoadingScreen message="Loading partners..." />;
  }

  return (
    <div className="flex flex-col gap-2">
      {partners?.map((p) => {
        const restaurants = (p.restaurants as Array<Record<string, unknown>>) || [];
        return (
          <div key={p.id as string} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body font-semibold text-foreground truncate">{p.businessName as string}</p>
              <p className="text-xs font-body text-muted-foreground">{p.email as string}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-body text-muted-foreground">{restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}</span>
              <span className="text-xs font-body text-muted-foreground/60">{p.phone as string || 'No phone'}</span>
            </div>
          </div>
        );
      })}
      {(!partners || partners.length === 0) && (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <Users className="w-10 h-10 opacity-40" />
          <p className="text-sm font-body">No partners registered yet.</p>
        </div>
      )}
    </div>
  );
}

// ── Reviews moderation ──
function ReviewsTab() {
  const [page, setPage] = useState(1);
  const { data } = useAdminReviews(page) as { data: { reviews: Array<Record<string, unknown>>; total: number; totalPages: number } | undefined };
  const deleteReview = useDeleteAdminReview();

  return (
    <div className="flex flex-col gap-2">
      {data?.reviews.map((r) => {
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
                {r.email as string} &middot; {dish?.name as string} &middot; {restaurant?.name as string}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => { if (confirm('Delete this review?')) deleteReview.mutate(r.id as string); }}
              className="p-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 hover:ring-1 hover:ring-destructive/30 shadow-sm hover:shadow-md transition-all cursor-pointer flex-shrink-0"
            >
              <Trash2 className="w-4 h-4 text-destructive" strokeWidth={2.5} />
            </motion.button>
          </div>
        );
      })}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.05 }} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
            className="p-2.5 rounded-xl border-2 border-border hover:bg-muted hover:border-accent/30 disabled:opacity-30 cursor-pointer shadow-sm hover:shadow-md transition-all">
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
          <span className="text-sm font-body font-bold text-muted-foreground">Page {page} of {data.totalPages}</span>
          <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.05 }} onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages}
            className="p-2.5 rounded-xl border-2 border-border hover:bg-muted hover:border-accent/30 disabled:opacity-30 cursor-pointer shadow-sm hover:shadow-md transition-all">
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
        </div>
      )}
    </div>
  );
}
