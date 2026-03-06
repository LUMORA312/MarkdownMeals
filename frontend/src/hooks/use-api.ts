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
} from '@/lib/api';
import { PrimaryTaste, DealType, EmojiRating, RatingTag } from '@/types/food';

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
