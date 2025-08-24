import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';

export interface Channel {
  id: string;
  channelId: string;
  title: string;
  thumbnail: string;
  subscriberCount?: string;
  videoCount?: number;
  description?: string;
  customUrl?: string;
  country?: string;
  publishedAt?: string;
}

export interface ChannelFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  channels: Channel[];
  channelCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  folders: ChannelFolder[];
  folderCount: number;
  totalChannels: number;
  isPublic: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Query key factory
export const channelKeys = {
  all: ['channel-folders'] as const,
  folders: () => [...channelKeys.all, 'folders'] as const,
  folder: (id: string) => [...channelKeys.folders(), id] as const,
  collections: () => [...channelKeys.all, 'collections'] as const,
  collection: (id: string) => [...channelKeys.collections(), id] as const,
  search: (query: string) => [...channelKeys.all, 'search', query] as const,
};

// Fetch all channel folders
export function useChannelFolders() {
  return useQuery({
    queryKey: channelKeys.folders(),
    queryFn: async () => {
      const data = await apiGet<ChannelFolder[]>('/api/youtube/folders');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single folder
export function useChannelFolder(id: string) {
  return useQuery({
    queryKey: channelKeys.folder(id),
    queryFn: async () => {
      const data = await apiGet<ChannelFolder>(`/api/youtube/folders/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Create new folder
export function useCreateChannelFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (folder: {
      name: string;
      description?: string;
      color?: string;
      icon?: string;
      isPublic?: boolean;
    }) => {
      return apiPost<ChannelFolder>('/api/youtube/folders', folder);
    },
    
    onSuccess: (newFolder) => {
      // Add to folders list
      queryClient.setQueryData<ChannelFolder[]>(channelKeys.folders(), (old) => 
        old ? [...old, newFolder] : [newFolder]
      );
    },
  });
}

// Update folder
export function useUpdateChannelFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ChannelFolder> & { id: string }) => {
      return apiPut<ChannelFolder>(`/api/youtube/folders/${id}`, data);
    },
    
    onSuccess: (updatedFolder) => {
      // Update specific folder
      queryClient.setQueryData(channelKeys.folder(updatedFolder.id), updatedFolder);
      
      // Update in folders list
      queryClient.setQueryData<ChannelFolder[]>(channelKeys.folders(), (old) =>
        old?.map(f => f.id === updatedFolder.id ? updatedFolder : f) ?? []
      );
    },
  });
}

// Delete folder
export function useDeleteChannelFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete(`/api/youtube/folders/${id}`);
    },
    
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: channelKeys.folder(id) });
      
      // Remove from folders list
      queryClient.setQueryData<ChannelFolder[]>(channelKeys.folders(), (old) =>
        old?.filter(f => f.id !== id) ?? []
      );
    },
  });
}

// Add channel to folder
export function useAddChannelToFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ folderId, channel }: { folderId: string; channel: Channel }) => {
      return apiPost<ChannelFolder>(`/api/youtube/folders/${folderId}/channels`, channel);
    },
    
    // Optimistic update
    onMutate: async ({ folderId, channel }) => {
      await queryClient.cancelQueries({ queryKey: channelKeys.folder(folderId) });
      
      const previousFolder = queryClient.getQueryData<ChannelFolder>(
        channelKeys.folder(folderId)
      );
      
      if (previousFolder) {
        queryClient.setQueryData<ChannelFolder>(channelKeys.folder(folderId), {
          ...previousFolder,
          channels: [...previousFolder.channels, channel],
          channelCount: previousFolder.channelCount + 1,
        });
      }
      
      return { previousFolder };
    },
    
    onError: (_err, variables, context) => {
      if (context?.previousFolder) {
        queryClient.setQueryData(
          channelKeys.folder(variables.folderId),
          context.previousFolder
        );
      }
    },
    
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: channelKeys.folder(variables.folderId) });
      queryClient.invalidateQueries({ queryKey: channelKeys.folders() });
    },
  });
}

// Remove channel from folder
export function useRemoveChannelFromFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ folderId, channelId }: { folderId: string; channelId: string }) => {
      return apiDelete(`/api/youtube/folders/${folderId}/channels/${channelId}`);
    },
    
    // Optimistic update
    onMutate: async ({ folderId, channelId }) => {
      await queryClient.cancelQueries({ queryKey: channelKeys.folder(folderId) });
      
      const previousFolder = queryClient.getQueryData<ChannelFolder>(
        channelKeys.folder(folderId)
      );
      
      if (previousFolder) {
        queryClient.setQueryData<ChannelFolder>(channelKeys.folder(folderId), {
          ...previousFolder,
          channels: previousFolder.channels.filter(c => c.channelId !== channelId),
          channelCount: previousFolder.channelCount - 1,
        });
      }
      
      return { previousFolder };
    },
    
    onError: (_err, variables, context) => {
      if (context?.previousFolder) {
        queryClient.setQueryData(
          channelKeys.folder(variables.folderId),
          context.previousFolder
        );
      }
    },
    
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: channelKeys.folder(variables.folderId) });
      queryClient.invalidateQueries({ queryKey: channelKeys.folders() });
    },
  });
}

// Search channels
export function useSearchChannels(query: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: channelKeys.search(query),
    queryFn: async () => {
      const params = new URLSearchParams({ q: query });
      const data = await apiGet<Channel[]>(`/api/youtube/channels/search?${params}`);
      return data;
    },
    enabled: (options?.enabled ?? true) && query.length > 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Create collection
export function useCreateCollection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (collection: {
      name: string;
      description?: string;
      folderIds: string[];
      isPublic?: boolean;
      tags?: string[];
    }) => {
      return apiPost<Collection>('/api/youtube/collections', collection);
    },
    
    onSuccess: (newCollection) => {
      queryClient.setQueryData<Collection[]>(channelKeys.collections(), (old) =>
        old ? [...old, newCollection] : [newCollection]
      );
    },
  });
}

// Get collections
export function useCollections() {
  return useQuery({
    queryKey: channelKeys.collections(),
    queryFn: async () => {
      const data = await apiGet<Collection[]>('/api/youtube/collections');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Move channel between folders (drag and drop)
export function useMoveChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      channelId,
      fromFolderId,
      toFolderId,
    }: {
      channelId: string;
      fromFolderId: string;
      toFolderId: string;
    }) => {
      return apiPost('/api/youtube/folders/move-channel', {
        channelId,
        fromFolderId,
        toFolderId,
      });
    },
    
    onSuccess: () => {
      // Invalidate both folders
      queryClient.invalidateQueries({ queryKey: channelKeys.folders() });
    },
  });
}