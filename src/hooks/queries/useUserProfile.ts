import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '@/lib/api-client';
import { useUserStore } from '@/store/user';
import type { User } from '@/types';

// Fetch user profile
export function useUserProfile() {
  const setUser = useUserStore((state) => state.updateUser);
  
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const user = await apiGet<User>('/api/user/profile');
      // Also update Zustand store
      setUser(user);
      return user;
    },
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 1,
  });
}

// Update user profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUserStore = useUserStore((state) => state.updateUser);

  return useMutation({
    mutationFn: async (updates: Partial<User>) => {
      return apiPut<User>('/api/user/profile', updates);
    },
    onMutate: async (updates) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user', 'profile'] });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData<User>(['user', 'profile']);

      // Optimistically update to the new value
      if (previousUser) {
        const optimisticUser = { ...previousUser, ...updates };
        queryClient.setQueryData(['user', 'profile'], optimisticUser);
        updateUserStore(optimisticUser);
      }

      // Return a context object with the snapshotted value
      return { previousUser };
    },
    onError: (err, _newUser, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUser) {
        queryClient.setQueryData(['user', 'profile'], context.previousUser);
        updateUserStore(context.previousUser);
      }
      console.error('Failed to update profile:', err);
    },
    onSuccess: (updatedUser) => {
      // Update both React Query cache and Zustand store
      queryClient.setQueryData(['user', 'profile'], updatedUser);
      updateUserStore(updatedUser);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}

// Check username availability
export function useCheckUsername(username: string) {
  return useQuery({
    queryKey: ['user', 'check-username', username],
    queryFn: () => apiGet<{ available: boolean }>(`/api/user/check-username?username=${username}`),
    enabled: username.length >= 3, // Only check if username is at least 3 characters
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 60 * 1000, // Keep in cache for 1 minute
  });
}