import { createServerClient } from '@/lib/supabase/server';
import type { Collection, CollectionItem, Video } from '@/types';

interface DBCollection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean | null;
  cover_image_url: string | null;
  tags: string[] | null;
  item_count: number | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * DB 컬렉션 데이터를 Frontend Collection 타입으로 변환
 */
function mapDbCollectionToCollection(dbCollection: DBCollection): Collection {
  return {
    id: dbCollection.id,
    user_id: dbCollection.user_id,
    name: dbCollection.name,
    description: dbCollection.description,
    is_public: dbCollection.is_public ?? false,
    coverImage: dbCollection.cover_image_url,
    tags: dbCollection.tags,
    itemCount: dbCollection.item_count ?? 0,
    created_at: dbCollection.created_at ?? new Date().toISOString(),
    updated_at: dbCollection.updated_at ?? new Date().toISOString(),
    deleted_at: null,
  };
}

/**
 * ServerCollectionManager - 서버 사이드용 YouTube Lens 컬렉션 관리 클래스
 * API Route에서 사용하기 위한 서버 버전
 */
export class ServerCollectionManager {
  private async getSupabase() {
    return createServerClient();
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
      const supabase = await this.getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      const { data: collection, error } = await supabase
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

      return { data: collection ? mapDbCollectionToCollection(collection) : null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * 사용자의 컬렉션 목록 조회
   */
  async getCollections(): Promise<{ data: Collection[] | null; error: Error | null }> {
    try {
      const supabase = await this.getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      const { data: collections, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error };
      }

      return { data: collections ? collections.map(mapDbCollectionToCollection) : null, error: null };
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
      const supabase = await this.getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      const { data: collection, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collection_id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data: collection ? mapDbCollectionToCollection(collection) : null, error: null };
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
      const supabase = await this.getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // 컬렉션 소유권 확인
      const { data: collection } = await this.getCollection(collection_id);
      if (!collection) {
        return { data: null, error: new Error('Collection not found or access denied') };
      }

      // 먼저 비디오가 videos 테이블에 있는지 확인
      const { data: video } = await supabase
        .from('videos')
        .select('video_id')
        .eq('video_id', video_id)
        .single();

      if (!video) {
        // 비디오가 없으면 먼저 저장해야 함
        return { data: null, error: new Error('Video must be saved to database first') };
      }

      // 최대 position 값 조회
      const { data: maxPositionItem } = await supabase
        .from('collection_items')
        .select('position')
        .eq('collection_id', collection_id)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      const nextPosition = maxPositionItem ? (maxPositionItem.position || 0) + 1 : 0;

      // 컬렉션 아이템 추가
      const { data: item, error } = await supabase
        .from('collection_items')
        .insert({
          collection_id: collection_id,
          video_id: video_id,
          notes: notes || null,
          position: nextPosition,
          added_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // itemCount 업데이트
      await supabase
        .from('collections')
        .update({
          itemCount: collection.itemCount + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', collection_id);

      // Convert DB response to CollectionItem type
      const collectionItem = item ? {
        ...item,
        position: item.position || 0,
        tags: [],  // tags 필드가 DB에 없음
        addedAt: item.created_at || new Date().toISOString(),
        addedBy: item.added_by || user.id,
      } : null;
      
      return { data: collectionItem, error: null };
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
      const supabase = await this.getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: new Error('User not authenticated') };
      }

      // 컬렉션 소유권 확인
      const { data: collection } = await this.getCollection(collection_id);
      if (!collection) {
        return { success: false, error: new Error('Collection not found or access denied') };
      }

      // 아이템 삭제
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('collection_id', collection_id)
        .eq('video_id', video_id);

      if (error) {
        return { success: false, error };
      }

      // itemCount 업데이트
      await supabase
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
      const supabase = await this.getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // 컬렉션 소유권 확인
      const { data: collection } = await this.getCollection(collection_id);
      if (!collection) {
        return { data: null, error: new Error('Collection not found or access denied') };
      }

      // 컬렉션 아이템과 비디오 정보 조인
      const { data: items, error } = await supabase
        .from('collection_items')
        .select(`
          *,
          video:videos(*)
        `)
        .eq('collection_id', collection_id)
        .order('position', { ascending: true });

      if (error) {
        return { data: null, error };
      }

      // Convert DB response to CollectionItem type, filtering out invalid video joins
      const collectionItems = (items || [])
        .filter(item => {
          // Check if video is a proper object with required fields, not an error
          const video = item.video;
          return video && 
            typeof video === 'object' && 
            !('error' in video) &&
            'id' in video &&
            'video_id' in video;
        })
        .map(item => ({
          ...item,
          position: item.position || 0,
          tags: [],  // tags 필드가 DB에 없음
          addedAt: item.created_at || new Date().toISOString(),
          addedBy: item.added_by || '',
          video: item.video as any, // Cast to bypass the type error since we've validated it above
        }));
      
      return { data: collectionItems, error: null };
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
      const supabase = await this.getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      // 컬렉션 소유권 확인
      const { data: existingCollection } = await this.getCollection(collection_id);
      if (!existingCollection) {
        return { data: null, error: new Error('Collection not found or access denied') };
      }

      const { data: collection, error } = await supabase
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

      return { data: collection ? mapDbCollectionToCollection(collection) : null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * 컬렉션 삭제 (소프트 삭제)
   */
  async deleteCollection(collection_id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const supabase = await this.getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: new Error('User not authenticated') };
      }

      // 컬렉션 소유권 확인
      const { data: collection } = await this.getCollection(collection_id);
      if (!collection) {
        return { success: false, error: new Error('Collection not found or access denied') };
      }

      // 소프트 삭제
      const { error } = await supabase
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
      const supabase = await this.getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: new Error('User not authenticated') };
      }

      // 컬렉션 소유권 확인
      const { data: collection } = await this.getCollection(collection_id);
      if (!collection) {
        return { success: false, error: new Error('Collection not found or access denied') };
      }

      // 각 아이템의 position 업데이트
      const updatePromises = items.map((item) =>
        supabase
          .from('collection_items')
          .update({ position: item.position })
          .eq('collection_id', collection_id)
          .eq('video_id', item.video_id)
      );

      const results = await Promise.all(updatePromises);
      const hasError = results.some((result) => result.error);

      if (hasError) {
        return { success: false, error: new Error('Failed to reorder some items') };
      }

      // 컬렉션 업데이트 시간 갱신
      await supabase
        .from('collections')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', collection_id);

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}
