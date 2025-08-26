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
    achievements: () => ['user', 'achievements'] as const,
  },
  
  // Community module
  community: {
    all: ['community'] as const,
    posts: (filters?: FilterParams) => ['community', 'posts', filters] as const,
    post: (id: string) => ['community', 'post', id] as const,
    comments: (postId: string) => ['community', 'comments', postId] as const,
    categories: () => ['community', 'categories'] as const,
  },
  
  // Revenue Proof module
  revenueProof: {
    all: ['revenue-proof'] as const,
    lists: () => ['revenue-proof', 'list'] as const,
    list: (filters?: FilterParams) => ['revenue-proof', 'list', filters] as const,
    details: () => ['revenue-proof', 'detail'] as const,
    detail: (id: string) => ['revenue-proof', 'detail', id] as const,
    comments: (id: string) => ['revenue-proof', 'comments', id] as const,
  },
  
  // Notifications module
  notifications: {
    all: ['notifications'] as const,
    list: () => ['notifications', 'list'] as const,
    unread: () => ['notifications', 'unread'] as const,
    preferences: () => ['notifications', 'preferences'] as const,
  },
  
  // Course module
  courses: {
    all: ['courses'] as const,
    list: (filters?: FilterParams) => ['courses', 'list', filters] as const,
    detail: (id: string) => ['courses', 'detail', id] as const,
    progress: (courseId: string) => ['courses', 'progress', courseId] as const,
    enrolled: () => ['courses', 'enrolled'] as const,
  },
  
  // Certificates module
  certificates: {
    all: ['certificates'] as const,
    list: () => ['certificates', 'list'] as const,
    detail: (id: string) => ['certificates', 'detail', id] as const,
    byCourse: (courseId: string) => ['certificates', 'by-course', courseId] as const,
    public: (id: string) => ['certificates', 'public', id] as const,
  },
  
  // Admin module
  admin: {
    all: ['admin'] as const,
    users: (filters?: FilterParams) => ['admin', 'users', filters] as const,
    user: (id: string) => ['admin', 'user', id] as const,
    stats: () => ['admin', 'stats'] as const,
    logs: (filters?: FilterParams) => ['admin', 'logs', filters] as const,
    channels: (status?: string) => ['admin', 'channels', status] as const,
    approvalLogs: (channelId: string) => ['admin', 'approval-logs', channelId] as const,
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

/**
 * Helper to invalidate related queries after a mutation
 * Usage: invalidateRelated(queryClient, 'youtube', ['search', 'popular'])
 */
type ModuleKeysType = {
  [key: string]: (...args: unknown[]) => readonly unknown[];
};

export function invalidateRelated(
  queryClient: QueryClient,
  module: keyof typeof queryKeys,
  subKeys: string[]
) {
  const moduleKeys = queryKeys[module];
  if (typeof moduleKeys === 'object') {
    subKeys.forEach((subKey) => {
      if (subKey in moduleKeys) {
        const keyFunction = (moduleKeys as unknown as ModuleKeysType)[subKey];
        if (typeof keyFunction === 'function') {
          queryClient.invalidateQueries({ queryKey: keyFunction() });
        }
      }
    });
  }
}