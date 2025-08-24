import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateModule, invalidateRelated } from '@/lib/query-keys';

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
    
    // Community module invalidations
    invalidateCommunityPosts: (filters?: any) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.posts(filters) 
      });
    },
    
    invalidateCommunityPost: (postId: string) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.post(postId) 
      });
      // Also invalidate comments for this post
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.comments(postId) 
      });
    },
    
    invalidateAllCommunity: () => {
      invalidateModule(queryClient, 'community');
    },
    
    // Revenue Proof module invalidations
    invalidateRevenueProofs: (filters?: any) => {
      if (filters) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.revenueProof.list(filters) 
        });
      } else {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.revenueProof.lists() 
        });
      }
    },
    
    invalidateRevenueProofDetail: (id: string) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.revenueProof.detail(id) 
      });
      // Also invalidate comments
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.revenueProof.comments(id) 
      });
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
    
    // Course module invalidations
    invalidateCourses: (filters?: any) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.list(filters) 
      });
    },
    
    invalidateCourseProgress: (courseId: string) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.progress(courseId) 
      });
    },
    
    // Admin module invalidations
    invalidateAdminStats: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.stats() 
      });
    },
    
    invalidateAdminChannels: (status?: string) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.channels(status) 
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
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.courses.enrolled() 
      });
    },
    
    invalidateAfterLogout: () => {
      // Clear all user-specific caches
      queryClient.clear();
    },
    
    invalidateAfterProfileUpdate: () => {
      // Invalidate profile and related data
      invalidateModule(queryClient, 'user');
      // Profile changes might affect displayed names in posts/comments
      invalidateModule(queryClient, 'community');
    },
    
    invalidateAfterContentCreation: (type: 'post' | 'proof' | 'comment') => {
      switch (type) {
        case 'post':
          invalidateModule(queryClient, 'community');
          break;
        case 'proof':
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.revenueProof.lists() 
          });
          break;
        case 'comment':
          // Comments affect multiple modules
          invalidateRelated(queryClient, 'community', ['posts']);
          invalidateRelated(queryClient, 'revenueProof', ['lists']);
          break;
      }
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
        updater: (old: any) => any;
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