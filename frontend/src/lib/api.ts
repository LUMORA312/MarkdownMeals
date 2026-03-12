import { Restaurant, RedirectToken, EmojiRating, RatingTag, ReviewBadge } from '@/types/food';

// Simple persistent session ID
function getSessionId(): string {
  let id = localStorage.getItem('foodman_session_id');
  if (!id) {
    id = crypto.randomUUID?.() || Date.now().toString();
    localStorage.setItem('foodman_session_id', id);
  }
  return id;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/** Resolve image URLs — prepends API_BASE for backend-hosted uploads */
export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`;
  return url;
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': getSessionId(),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

// --- Restaurants ---

export async function fetchRestaurants(params?: {
  tastes?: string[];
  deals?: string[];
  search?: string;
}): Promise<Restaurant[]> {
  const query = new URLSearchParams();
  if (params?.tastes?.length) query.set('tastes', params.tastes.join(','));
  if (params?.deals?.length) query.set('deals', params.deals.join(','));
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return apiFetch<Restaurant[]>(`/api/restaurants${qs ? `?${qs}` : ''}`);
}

export async function fetchRestaurant(id: string): Promise<Restaurant> {
  return apiFetch<Restaurant>(`/api/restaurants/${id}`);
}

// --- Tokens ---

export interface TokenResponse {
  id: string;
  restaurantId: string;
  dishIds: string[];
  createdAt: number;
  ratingAvailableAt: number;
}

export interface TokenDetailResponse extends TokenResponse {
  restaurant: { id: string; name: string; categories: string[] };
  dishes: Array<{
    id: string;
    name: string;
    image: string;
    category: string;
    primaryTaste: string;
    modifiers: string[];
    price: number | null;
  }>;
  hasRating: boolean;
}

export async function createToken(restaurantId: string, dishIds: string[]): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/api/tokens', {
    method: 'POST',
    body: JSON.stringify({ restaurantId, dishIds }),
  });
}

export async function fetchToken(tokenId: string): Promise<TokenDetailResponse> {
  return apiFetch<TokenDetailResponse>(`/api/tokens/${tokenId}`);
}

// --- Ratings ---

export interface RatingResponse {
  id: string;
  emoji: string;
  tags: string[];
  restaurantId: string;
}

export async function submitRating(
  tokenId: string,
  emoji: EmojiRating,
  tags: RatingTag[]
): Promise<RatingResponse> {
  return apiFetch<RatingResponse>('/api/ratings', {
    method: 'POST',
    body: JSON.stringify({ tokenId, emoji, tags }),
  });
}

export interface RatingListItem {
  id: string;
  emoji: string;
  tags: string[];
  createdAt: number;
}

export async function fetchRatings(restaurantId: string): Promise<RatingListItem[]> {
  return apiFetch<RatingListItem[]>(`/api/ratings/restaurant/${restaurantId}`);
}

// --- Reviews ---

export interface ReviewResponse {
  id: string;
  email: string;
  badge: string;
  comment: string | null;
  dishId: string;
  restaurantId: string;
  createdAt: number;
}

export interface ReviewListItem {
  id: string;
  badge: string;
  comment: string | null;
  createdAt: number;
}

export interface ReviewSummary {
  total: number;
  badges: Record<string, number>;
}

export async function submitReview(
  email: string,
  badge: ReviewBadge,
  dishId: string,
  restaurantId: string,
  comment?: string,
): Promise<ReviewResponse> {
  return apiFetch<ReviewResponse>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({ email, badge, comment, dishId, restaurantId }),
  });
}

export async function fetchDishReviews(dishId: string): Promise<ReviewListItem[]> {
  return apiFetch<ReviewListItem[]>(`/api/reviews/dish/${dishId}`);
}

export async function fetchDishReviewSummary(dishId: string): Promise<ReviewSummary> {
  return apiFetch<ReviewSummary>(`/api/reviews/dish/${dishId}/summary`);
}

// --- Auth ---

const TOKEN_KEY = 'foodman_auth_token';
const USER_KEY = 'foodman_auth_user';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token: string, user: unknown) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function authFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

export interface AuthResponse {
  token: string;
  partner?: { id: string; email: string; businessName: string };
  admin?: { id: string; email: string; name: string };
}

export async function partnerSignup(data: {
  email: string;
  password: string;
  businessName: string;
  phone?: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/partner/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function partnerLogin(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/partner/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function adminLogin(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchMe(): Promise<{ role: string; user: Record<string, unknown> }> {
  return authFetch('/api/auth/me');
}

// --- Partner API ---

export interface PartnerDashboard {
  restaurants: Array<{ id: string; name: string; coverImage: string }>;
  stats: {
    totalDeals: number;
    activeDeals: number;
    totalViews: number;
    totalRatings: number;
    totalReviews: number;
  };
}

export async function fetchPartnerDashboard(): Promise<PartnerDashboard> {
  return authFetch('/api/partner/dashboard');
}

export async function fetchPartnerRestaurants(): Promise<unknown[]> {
  return authFetch('/api/partner/restaurants');
}

export async function createPartnerRestaurant(data: {
  name: string;
  coverImage: string;
  redirectUrl: string;
  categories?: string[];
}): Promise<unknown> {
  return authFetch('/api/partner/restaurants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchPartnerDeals(restaurantId: string): Promise<unknown[]> {
  return authFetch(`/api/partner/restaurants/${restaurantId}/deals`);
}

export async function createPartnerDeal(restaurantId: string, data: Record<string, unknown>): Promise<unknown> {
  return authFetch(`/api/partner/restaurants/${restaurantId}/deals`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePartnerDeal(dealId: string, data: Record<string, unknown>): Promise<unknown> {
  return authFetch(`/api/partner/deals/${dealId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function togglePartnerDeal(dealId: string): Promise<unknown> {
  return authFetch(`/api/partner/deals/${dealId}/toggle`, { method: 'PATCH' });
}

export async function deletePartnerDeal(dealId: string): Promise<void> {
  await authFetch(`/api/partner/deals/${dealId}`, { method: 'DELETE' });
}

export async function fetchPartnerReviews(): Promise<unknown[]> {
  return authFetch('/api/partner/reviews');
}

export async function uploadDealImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/api/partner/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

// --- Admin API ---

export interface AdminStats {
  totalPartners: number;
  totalRestaurants: number;
  totalDeals: number;
  activeDeals: number;
  totalViews: number;
  totalRatings: number;
  totalReviews: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  return authFetch('/api/admin/stats');
}

export async function fetchAdminMostViewed(): Promise<unknown[]> {
  return authFetch('/api/admin/analytics/most-viewed');
}

export async function fetchAdminMostActivePartners(): Promise<unknown[]> {
  return authFetch('/api/admin/analytics/most-active-partners');
}

export async function fetchAdminNewestDeals(): Promise<unknown[]> {
  return authFetch('/api/admin/analytics/newest-deals');
}

export async function fetchAdminByCategory(): Promise<Array<{ category: string; count: number }>> {
  return authFetch('/api/admin/analytics/by-category');
}

export async function fetchAdminTrend(): Promise<Array<{ date: string; views: number; reviews: number }>> {
  return authFetch('/api/admin/analytics/trend');
}

export async function fetchAdminPartners(): Promise<unknown[]> {
  return authFetch('/api/admin/partners');
}

export async function fetchAdminDeals(page = 1): Promise<{ deals: unknown[]; total: number; page: number; totalPages: number }> {
  return authFetch(`/api/admin/deals?page=${page}`);
}

export async function updateAdminDeal(dealId: string, data: Record<string, unknown>): Promise<unknown> {
  return authFetch(`/api/admin/deals/${dealId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminDeal(dealId: string): Promise<void> {
  await authFetch(`/api/admin/deals/${dealId}`, { method: 'DELETE' });
}

export async function fetchAdminReviews(page = 1): Promise<{ reviews: unknown[]; total: number; page: number; totalPages: number }> {
  return authFetch(`/api/admin/reviews?page=${page}`);
}

export async function deleteAdminReview(reviewId: string): Promise<void> {
  await authFetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' });
}

// --- Favorites ---

export async function fetchFavorites(): Promise<string[]> {
  return apiFetch<string[]>('/api/favorites');
}

export async function toggleFavorite(restaurantId: string): Promise<{ favorited: boolean; restaurantId: string }> {
  return apiFetch<{ favorited: boolean; restaurantId: string }>(`/api/favorites/${restaurantId}`, {
    method: 'POST',
  });
}
