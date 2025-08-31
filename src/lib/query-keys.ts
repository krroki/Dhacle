/**
 * Centralized query key factory for React Query
 * Ensures consistent key structure across the application
 */

import type { FilterParams } from '@/types';
import type { QueryClient } from '@tanstack/react-query';

export const queryKeys = {
  // Root keys
  all: ['all'] as const,
  
  // YouTube module
  youtube: {
    all: ['youtube'] as const,
    search: (term: string) => ['youtube', 'search', term] as const,
    popular: () => ['youtube', 'popular'] as const,
    favorites: () => ['youtube', 'favorites'] as const,
    folders: () => ['youtube', 'folders'] as const,
    folder: (id: string) => ['youtube', 'folders', id] as const,
    collections: () => ['youtube', 'collections'] as const,
    collection: (id: string) => ['youtube', 'collections', id] as const,
    subscriptions: () => ['youtube', 'subscriptions'] as const,
    analytics: (videoId: string) => ['youtube', 'analytics', videoId] as const,
  },
  
  // User module
  user: {
    all: ['user'] as const,
    profile: (id?: string) => ['user', 'profile', id] as const,
    settings: () => ['user', 'settings'] as const,
    apiKeys: () => ['user', 'api-keys'] as const,
  },
  
  
  // Notifications module
  notifications: {
    all: ['notifications'] as const,
    list: () => ['notifications', 'list'] as const,
    unread: () => ['notifications', 'unread'] as const,
    preferences: () => ['notifications', 'preferences'] as const,
  },
  
  
  // Admin module
  admin: {
    all: ['admin'] as const,
    users: (filters?: FilterParams) => ['admin', 'users', filters] as const,
    user: (id: string) => ['admin', 'user', id] as const,
    stats: () => ['admin', 'stats'] as const,
    logs: (filters?: FilterParams) => ['admin', 'logs', filters] as const,
    channels: (filters?: FilterParams) => ['admin', 'channels', filters] as const,
    channelStats: () => ['admin', 'channel-stats'] as const,
    approvalLogs: (channelId: string) => ['admin', 'approval-logs', channelId] as const,
    categories: () => ['admin', 'categories'] as const,
  },
};

/**
 * Helper to invalidate all queries under a specific module
 * Usage: invalidateModule(queryClient, 'youtube')
 */
export function invalidateModule(
  queryClient: QueryClient,
  module: keyof typeof queryKeys
) {
  const moduleKeys = queryKeys[module];
  if (typeof moduleKeys === 'object' && 'all' in moduleKeys) {
    queryClient.invalidateQueries({ queryKey: moduleKeys.all });
  }
}

/**
 * Helper to remove all queries under a specific module
 * Usage: removeModule(queryClient, 'youtube')
 */
export function removeModule(
  queryClient: QueryClient,
  module: keyof typeof queryKeys
) {
  const moduleKeys = queryKeys[module];
  if (typeof moduleKeys === 'object' && 'all' in moduleKeys) {
    queryClient.removeQueries({ queryKey: moduleKeys.all });
  }
}

/**
 * Helper to prefetch multiple queries at once
 * Usage: prefetchQueries(queryClient, [
 *   { key: queryKeys.youtube.popular(), fn: fetchPopular },
 *   { key: queryKeys.user.profile(), fn: fetchProfile }
 * ])
 */
export async function prefetchQueries<T = unknown>(
  queryClient: QueryClient,
  queries: Array<{
    key: readonly unknown[];
    fn: () => Promise<T>;
    staleTime?: number;
  }>
) {
  await Promise.all(
    queries.map(({ key, fn, staleTime }) =>
      queryClient.prefetchQuery({
        queryKey: key,
        queryFn: fn,
        staleTime,
      })
    )
  );
}

