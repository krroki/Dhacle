import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateModule } from '@/lib/query-keys';
import type { FilterParams } from '@/types';

/**
 * Hook for managing cache invalidation strategies
 * Provides methods to invalidate specific queries or groups of queries
 */
export function useCacheInvalidation() {
  const queryClient = useQueryClient();
  
  return {
    // YouTube module invalidations
    invalidateYouTubeSearch: (searchTerm?: string) => {
      if (searchTerm) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.youtube.search(searchTerm) 
        });
      } else {
        // Invalidate all search queries
        queryClient.invalidateQueries({ 
          queryKey: ['youtube', 'search'],
          exact: false 
        });
      }
    },
    
    invalidateYouTubePopular: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.youtube.popular() 
      });
    },
    
    invalidateYouTubeFavorites: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.youtube.favorites() 
      });
    },
    
    invalidateAllYouTube: () => {
      invalidateModule(queryClient, 'youtube');
    },
    
    // User module invalidations
    invalidateUserProfile: (userId?: string) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.profile(userId) 
      });
    },
    
    invalidateUserSettings: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.settings() 
      });
    },
    
    invalidateAllUser: () => {
      invalidateModule(queryClient, 'user');
    },
    
    
    // Notifications module invalidations
    invalidateNotifications: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.list() 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.unread() 
      });
    },
    
    
    // Admin module invalidations
    invalidateAdminStats: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.stats() 
      });
    },
    
    invalidateAdminChannels: (filters?: FilterParams) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.channels(filters) 
      });
    },
    
    // Batch invalidations for related data
    invalidateAfterLogin: () => {
      // Invalidate user-specific data after login
      invalidateModule(queryClient, 'user');
      invalidateModule(queryClient, 'notifications');
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.youtube.favorites() 
      });
    },
    
    invalidateAfterLogout: () => {
      // Clear all user-specific caches
      queryClient.clear();
    },
    
    invalidateAfterProfileUpdate: () => {
      // Invalidate profile and related data
      invalidateModule(queryClient, 'user');
    },
    
    
    // Utility methods
    clearAllCache: () => {
      queryClient.clear();
    },
    
    resetErrorBoundary: () => {
      // Reset queries that might have failed
      queryClient.resetQueries();
    },
    
    refetchFailedQueries: () => {
      // Refetch all queries that are in error state
      queryClient.refetchQueries({
        predicate: (query) => query.state.status === 'error',
      });
    },
  };
}

/**
 * Hook for selective cache updates
 * Use when you want to update specific cached data without refetching
 */
export function useCacheUpdater() {
  const queryClient = useQueryClient();
  
  return {
    // Update a specific item in a list
    updateListItem: <T extends { id: string }>(
      queryKey: readonly unknown[],
      itemId: string,
      updater: (item: T) => T
    ) => {
      queryClient.setQueryData<T[]>(queryKey, (old) => {
        if (!old) return old;
        return old.map((item) => (item.id === itemId ? updater(item) : item));
      });
    },
    
    // Add item to a list
    addToList: <T>(
      queryKey: readonly unknown[],
      newItem: T,
      position: 'start' | 'end' = 'start'
    ) => {
      queryClient.setQueryData<T[]>(queryKey, (old) => {
        if (!old) return [newItem];
        return position === 'start' ? [newItem, ...old] : [...old, newItem];
      });
    },
    
    // Remove item from a list
    removeFromList: <T extends { id: string }>(
      queryKey: readonly unknown[],
      itemId: string
    ) => {
      queryClient.setQueryData<T[]>(queryKey, (old) => {
        if (!old) return old;
        return old.filter((item) => item.id !== itemId);
      });
    },
    
    // Update a single cached value
    updateCache: <T>(queryKey: readonly unknown[], updater: (old: T | undefined) => T | undefined) => {
      queryClient.setQueryData<T>(queryKey, updater);
    },
    
    // Optimistically update multiple related caches
    optimisticUpdate: (
      updates: Array<{
        queryKey: readonly unknown[];
        updater: <T>(old: T) => T;
      }>
    ) => {
      const previousData = updates.map(({ queryKey }) => ({
        queryKey,
        data: queryClient.getQueryData(queryKey),
      }));
      
      updates.forEach(({ queryKey, updater }) => {
        queryClient.setQueryData(queryKey, updater);
      });
      
      return {
        rollback: () => {
          previousData.forEach(({ queryKey, data }) => {
            queryClient.setQueryData(queryKey, data);
          });
        },
      };
    },
  };
}