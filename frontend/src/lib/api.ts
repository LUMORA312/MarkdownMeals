import { Restaurant, RedirectToken, EmojiRating, RatingTag } from '@/types/food';

// Simple persistent session ID
function getSessionId(): string {
  let id = localStorage.getItem('foodman_session_id');
  if (!id) {
    id = crypto.randomUUID?.() || Date.now().toString();
    localStorage.setItem('foodman_session_id', id);
  }
  return id;
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
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

// --- Favorites ---

export async function fetchFavorites(): Promise<string[]> {
  return apiFetch<string[]>('/api/favorites');
}

export async function toggleFavorite(restaurantId: string): Promise<{ favorited: boolean; restaurantId: string }> {
  return apiFetch<{ favorited: boolean; restaurantId: string }>(`/api/favorites/${restaurantId}`, {
    method: 'POST',
  });
}
