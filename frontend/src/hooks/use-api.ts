import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRestaurants,
  fetchRestaurant,
  fetchFavorites,
  toggleFavorite as toggleFavoriteApi,
  createToken,
  fetchToken,
  submitRating,
  fetchRatings,
  submitReview,
  fetchDishReviews,
  fetchDishReviewSummary,
  fetchPartnerDashboard,
  fetchPartnerRestaurants,
  createPartnerRestaurant,
  fetchPartnerDeals,
  createPartnerDeal,
  updatePartnerDeal,
  togglePartnerDeal,
  deletePartnerDeal,
  fetchPartnerReviews,
  fetchAdminStats,
  fetchAdminMostViewed,
  fetchAdminMostActivePartners,
  fetchAdminNewestDeals,
  fetchAdminByCategory,
  fetchAdminTrend,
  fetchAdminPartners,
  fetchAdminDeals,
  deleteAdminDeal,
  fetchAdminReviews,
  deleteAdminReview,
  getAuthToken,
} from '@/lib/api';
import { PrimaryTaste, DealType, EmojiRating, RatingTag, ReviewBadge } from '@/types/food';

export function useRestaurants(params?: {
  tastes?: PrimaryTaste[];
  deals?: DealType[];
  search?: string;
}) {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => fetchRestaurants(params),
  });
}

export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => fetchRestaurant(id!),
    enabled: !!id,
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (restaurantId: string) => toggleFavoriteApi(restaurantId),
    onMutate: async (restaurantId) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previous = queryClient.getQueryData<string[]>(['favorites']) || [];
      const next = previous.includes(restaurantId)
        ? previous.filter((id) => id !== restaurantId)
        : [...previous, restaurantId];
      queryClient.setQueryData(['favorites'], next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['favorites'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useCreateToken() {
  return useMutation({
    mutationFn: ({ restaurantId, dishIds }: { restaurantId: string; dishIds: string[] }) =>
      createToken(restaurantId, dishIds),
  });
}

export function useToken(tokenId: string | undefined) {
  return useQuery({
    queryKey: ['token', tokenId],
    queryFn: () => fetchToken(tokenId!),
    enabled: !!tokenId,
  });
}

export function useRatings(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['ratings', restaurantId],
    queryFn: () => fetchRatings(restaurantId!),
    enabled: !!restaurantId,
  });
}

export function useSubmitRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tokenId, emoji, tags }: { tokenId: string; emoji: EmojiRating; tags: RatingTag[] }) =>
      submitRating(tokenId, emoji, tags),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['token', variables.tokenId] });
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
  });
}

// --- Reviews ---

export function useDishReviews(dishId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', dishId],
    queryFn: () => fetchDishReviews(dishId!),
    enabled: !!dishId,
  });
}

export function useDishReviewSummary(dishId: string | undefined) {
  return useQuery({
    queryKey: ['reviewSummary', dishId],
    queryFn: () => fetchDishReviewSummary(dishId!),
    enabled: !!dishId,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, badge, dishId, restaurantId, comment }: {
      email: string;
      badge: ReviewBadge;
      dishId: string;
      restaurantId: string;
      comment?: string;
    }) => submitReview(email, badge, dishId, restaurantId, comment),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.dishId] });
      queryClient.invalidateQueries({ queryKey: ['reviewSummary', variables.dishId] });
    },
  });
}

// --- Partner hooks ---

export function usePartnerDashboard() {
  return useQuery({
    queryKey: ['partner', 'dashboard'],
    queryFn: fetchPartnerDashboard,
    enabled: !!getAuthToken(),
  });
}

export function usePartnerRestaurants() {
  return useQuery({
    queryKey: ['partner', 'restaurants'],
    queryFn: fetchPartnerRestaurants,
    enabled: !!getAuthToken(),
  });
}

export function useCreatePartnerRestaurant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPartnerRestaurant,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['partner'] });
    },
  });
}

export function usePartnerDeals(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['partner', 'deals', restaurantId],
    queryFn: () => fetchPartnerDeals(restaurantId!),
    enabled: !!restaurantId && !!getAuthToken(),
  });
}

export function useCreatePartnerDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ restaurantId, data }: { restaurantId: string; data: Record<string, unknown> }) =>
      createPartnerDeal(restaurantId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['partner'] });
    },
  });
}

export function useUpdatePartnerDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dealId, data }: { dealId: string; data: Record<string, unknown> }) =>
      updatePartnerDeal(dealId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['partner'] });
    },
  });
}

export function useTogglePartnerDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: togglePartnerDeal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['partner'] });
    },
  });
}

export function useDeletePartnerDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePartnerDeal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['partner'] });
    },
  });
}

export function usePartnerReviews() {
  return useQuery({
    queryKey: ['partner', 'reviews'],
    queryFn: fetchPartnerReviews,
    enabled: !!getAuthToken(),
  });
}

// --- Admin hooks ---

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
    enabled: !!getAuthToken(),
  });
}

export function useAdminMostViewed() {
  return useQuery({
    queryKey: ['admin', 'most-viewed'],
    queryFn: fetchAdminMostViewed,
    enabled: !!getAuthToken(),
  });
}

export function useAdminMostActivePartners() {
  return useQuery({
    queryKey: ['admin', 'most-active-partners'],
    queryFn: fetchAdminMostActivePartners,
    enabled: !!getAuthToken(),
  });
}

export function useAdminNewestDeals() {
  return useQuery({
    queryKey: ['admin', 'newest-deals'],
    queryFn: fetchAdminNewestDeals,
    enabled: !!getAuthToken(),
  });
}

export function useAdminByCategory() {
  return useQuery({
    queryKey: ['admin', 'by-category'],
    queryFn: fetchAdminByCategory,
    enabled: !!getAuthToken(),
  });
}

export function useAdminTrend() {
  return useQuery({
    queryKey: ['admin', 'trend'],
    queryFn: fetchAdminTrend,
    enabled: !!getAuthToken(),
  });
}

export function useAdminPartners() {
  return useQuery({
    queryKey: ['admin', 'partners'],
    queryFn: fetchAdminPartners,
    enabled: !!getAuthToken(),
  });
}

export function useAdminDeals(page = 1) {
  return useQuery({
    queryKey: ['admin', 'deals', page],
    queryFn: () => fetchAdminDeals(page),
    enabled: !!getAuthToken(),
  });
}

export function useDeleteAdminDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminDeal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}

export function useAdminReviews(page = 1) {
  return useQuery({
    queryKey: ['admin', 'reviews', page],
    queryFn: () => fetchAdminReviews(page),
    enabled: !!getAuthToken(),
  });
}

export function useDeleteAdminReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}
