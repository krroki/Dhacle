import { createBrowserClient } from '@/lib/supabase/browser-client';
import type { Collection, CollectionItem, Video, DBCollection } from '@/types';
// import { snakeToCamelCase } from '@/types';

/**
 * CollectionManager - YouTube Lens 컬렉션 관리 클래스
 * 비디오 컬렉션의 CRUD 작업을 담당
 */
export class CollectionManager {
  private supabase;

  constructor() {
    this.supabase = createBrowserClient();
  }

  /**
   * 새 컬렉션 생성
   */
  async createCollection(data: {
    name: string;
    description?: string;
    is_public?: boolean;
    tags?: string[];
    coverImage?: string;
  }): Promise<{ data: Collection | null; error: Error | null }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      const { data: collection, error } = await this.supabase
        .from('collections')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description || null,
          is_public: data.is_public || false,
          tags: data.tags || null,
          cover_image_url: data.coverImage || null,
          item_count: 0,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // Convert snake_case to camelCase
      const convertedCollection = {
        id: collection.id,
        user_id: collection.user_id,
        name: collection.name,
        description: collection.description,
        is_public: collection.is_public ?? false,
        tags: collection.tags,
        cover_image_url: collection.cover_image_url,
        itemCount: collection.item_count ?? 0,
        metadata: collection.metadata || {},
        type: collection.type || 'user',
        created_at: collection.created_at || new Date().toISOString(),
        updated_at: collection.updated_at || new Date().toISOString()
      };

      return { data: convertedCollection as Collection, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * 사용자의 컬렉션 목록 조회
   */
  async getCollections(): Promise<{ data: Collection[] | null; error: Error | null }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      const { data: collections, error } = await this.supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error };
      }

      // Convert snake_case to camelCase
      const convertedCollections = (collections || []).map((col: DBCollection) => ({
        id: col.id,
        user_id: col.user_id,
        name: col.name,
        description: col.description,
        is_public: col.is_public ?? false,
        tags: col.tags,
        cover_image_url: col.cover_image_url,
        itemCount: col.item_count ?? 0,
        metadata: col.metadata || {},
        type: col.type || 'user',
        created_at: col.created_at || new Date().toISOString(),
        updated_at: col.updated_at || new Date().toISOString()
      } as Collection));

      return { data: convertedCollections, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * 특정 컬렉션 조회
   */
  async getCollection(
    collection_id: string
  ): Promise<{ data: Collection | null; error: Error | null }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      const { data: collection, error } = await this.supabase
        .from('collections')
        .select('*')
        .eq('id', collection_id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single();

      if (error) {
        return { data: null, error };
      }

      // Convert snake_case to camelCase
      const convertedCollection = {
        id: collection.id,
        user_id: collection.user_id,
        name: collection.name,
        description: collection.description,
        is_public: collection.is_public ?? false,
        tags: collection.tags,
        cover_image_url: collection.cover_image_url,
        itemCount: collection.item_count ?? 0,
        metadata: collection.metadata || {},
        type: collection.type || 'user',
        created_at: collection.created_at || new Date().toISOString(),
        updated_at: collection.updated_at || new Date().toISOString()
      };

      return { data: convertedCollection as Collection, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * 컬렉션에 비디오 추가
   */
  async addVideoToCollection(
    collection_id: string,
    video_id: string,
    notes?: string,
    _tags?: string[]
  ): Promise<{ data: CollectionItem | null; error: Error | null }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // 컬렉션 소유권 확인
      const { data: collection } = await this.getCollection(collection_id);
      if (!collection) {
        return { data: null, error: new Error('Collection not found or access denied') };
      }

      // 먼저 비디오가 videos 테이블에 있는지 확인
      const { data: video } = await this.supabase
        .from('videos')
        .select('video_id')
        .eq('video_id', video_id)
        .single();

      if (!video) {
        // 비디오가 없으면 먼저 저장해야 함
        return { data: null, error: new Error('Video must be saved to database first') };
      }

      // 최대 position 값 조회
      const { data: max_position_item } = await this.supabase
        .from('collection_items')
        .select('position')
        .eq('collection_id', collection_id)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      const next_position = max_position_item?.position !== null && max_position_item?.position !== undefined
        ? max_position_item.position + 1
        : 0;

      // 컬렉션 아이템 추가
      const { data: item, error } = await this.supabase
        .from('collection_items')
        .insert({
          collection_id: collection_id,
          video_id: video_id,
          notes: notes || null,
          position: next_position,
          added_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // itemCount 업데이트
      await this.supabase
        .from('collections')
        .update({
          item_count: collection.itemCount + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', collection_id);

      // Convert response to CollectionItem type
      const convertedItem = {
        id: item.id,
        collection_id: item.collection_id,
        video_id: item.video_id,
        notes: item.notes,
        position: item.position ?? 0,
        added_by: item.added_by,
        created_at: item.created_at || new Date().toISOString()
      };

      return { data: convertedItem as CollectionItem, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * 컬렉션에서 비디오 제거
   */
  async removeVideoFromCollection(
    collection_id: string,
    video_id: string
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: new Error('User not authenticated') };
      }

      // 컬렉션 소유권 확인
      const { data: collection } = await this.getCollection(collection_id);
      if (!collection) {
        return { success: false, error: new Error('Collection not found or access denied') };
      }

      // 아이템 삭제
      const { error } = await this.supabase
        .from('collection_items')
        .delete()
        .eq('collection_id', collection_id)
        .eq('video_id', video_id);

      if (error) {
        return { success: false, error };
      }

      // itemCount 업데이트
      await this.supabase
        .from('collections')
        .update({
          itemCount: Math.max(0, collection.itemCount - 1),
          updated_at: new Date().toISOString(),
        })
        .eq('id', collection_id);

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * 컬렉션의 비디오 목록 조회
   */
  async getCollectionVideos(
    collection_id: string
  ): Promise<{ data: (CollectionItem & { video: Video })[] | null; error: Error | null }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // 컬렉션 소유권 확인
      const { data: collection } = await this.getCollection(collection_id);
      if (!collection) {
        return { data: null, error: new Error('Collection not found or access denied') };
      }

      // 컬렉션 아이템과 비디오 정보 조인
      const { data: items, error } = await this.supabase
        .from('collection_items')
        .select('*, videos(*)')
        .eq('collection_id', collection_id)
        .order('position', { ascending: true });

      if (error) {
        return { data: null, error };
      }

      // Transform the data to match the expected type
      interface ItemWithVideo {
        id: string;
        collection_id: string;
        video_id: string;
        notes: string | null;
        position: number | null;
        added_by: string;
        created_at: string;
        videos: unknown;
      }
      
      const transformedItems = (items as ItemWithVideo[])?.map(item => ({
        id: item.id,
        collection_id: item.collection_id,
        video_id: item.video_id,
        notes: item.notes,
        position: item.position ?? 0,
        added_by: item.added_by,
        created_at: item.created_at || new Date().toISOString(),
        video: item.videos as Video       })) || [];

      return { data: transformedItems, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * 컬렉션 정보 업데이트
   */
  async updateCollection(
    collection_id: string,
    updates: Partial<{
      name: string;
      description: string;
      is_public: boolean;
      tags: string[];
      coverImage: string;
    }>
  ): Promise<{ data: Collection | null; error: Error | null }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // 컬렉션 소유권 확인
      const { data: existing_collection } = await this.getCollection(collection_id);
      if (!existing_collection) {
        return { data: null, error: new Error('Collection not found or access denied') };
      }

      const { data: collection, error } = await this.supabase
        .from('collections')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', collection_id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // Transform to match Collection type (has mixed naming)
      const transformedCollection: Collection = {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        user_id: collection.user_id,
        cover_image_url: collection.cover_image_url, // camelCase in type
        is_public: collection.is_public ?? false,
        itemCount: collection.item_count ?? 0,
        metadata: collection.metadata || {},
        type: collection.type || 'user', // camelCase in type
        tags: collection.tags || [],
        created_at: collection.created_at || new Date().toISOString(),
        updated_at: collection.updated_at || new Date().toISOString()
      };

      return { data: transformedCollection, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * 컬렉션 삭제 (소프트 삭제)
   */
  async deleteCollection(
    collection_id: string
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: new Error('User not authenticated') };
      }

      // 컬렉션 소유권 확인
      const { data: collection } = await this.getCollection(collection_id);
      if (!collection) {
        return { success: false, error: new Error('Collection not found or access denied') };
      }

      // 소프트 삭제
      const { error } = await this.supabase
        .from('collections')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', collection_id)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * 컬렉션 내 아이템 순서 변경
   */
  async reorderCollectionItems(
    collection_id: string,
    items: { video_id: string; position: number }[]
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: new Error('User not authenticated') };
      }

      // 컬렉션 소유권 확인
      const { data: collection } = await this.getCollection(collection_id);
      if (!collection) {
        return { success: false, error: new Error('Collection not found or access denied') };
      }

      // 각 아이템의 position 업데이트
      const update_promises = items.map((item) =>
        this.supabase
          .from('collection_items')
          .update({ position: item.position })
          .eq('collection_id', collection_id)
          .eq('video_id', item.video_id)
      );

      const results = await Promise.all(update_promises);
      const has_error = results.some((result) => result.error);

      if (has_error) {
        return { success: false, error: new Error('Failed to reorder some items') };
      }

      // 컬렉션 업데이트 시간 갱신
      await this.supabase
        .from('collections')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', collection_id);

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}
