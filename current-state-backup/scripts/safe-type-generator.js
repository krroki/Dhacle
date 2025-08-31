#!/usr/bin/env node
/**
 * 안전한 Supabase 타입 생성 스크립트
 * - 에러 처리
 * - Service Role Key 사용
 * - 실패 시 기본 타입 생성
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_FILE = path.join(__dirname, '../src/types/database.generated.ts');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://golbwnsytwbyoneucunx.supabase.co';
const PROJECT_ID = 'golbwnsytwbyoneucunx';

async function generateTypes() {
  console.log('🚀 Supabase 타입 생성 시작...');

  try {
    // 방법 1: Supabase CLI 사용
    console.log('📝 Supabase CLI로 타입 생성 중...');
    const types = execSync(
      `npx supabase gen types typescript --project-id ${PROJECT_ID} --schema public`,
      { 
        encoding: 'utf8',
        env: {
          ...process.env,
          SUPABASE_ACCESS_TOKEN: SERVICE_ROLE_KEY
        }
      }
    );

    // 성공적으로 생성되었는지 확인
    if (types && !types.includes('error') && !types.includes('failed')) {
      fs.writeFileSync(OUTPUT_FILE, types);
      console.log('✅ 타입 생성 성공!');
      return true;
    }

    throw new Error('타입 생성 실패');
  } catch (error) {
    console.log('⚠️ Supabase CLI 실패, 대체 방법 시도 중...');
    console.error('에러:', error.message);
    
    // 방법 2: 기본 타입 구조 생성
    generateFallbackTypes();
  }
}

function generateFallbackTypes() {
  console.log('📝 기본 타입 구조 생성 중...');
  
  const fallbackTypes = `/**
 * Supabase Database Types
 * Auto-generated fallback types
 * Generated at: ${new Date().toISOString()}
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          username: string | null
          avatar_url: string | null
          is_premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      revenue_proofs: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          amount: number
          platform: string
          screenshot_url: string | null
          screenshot_blur: string | null
          likes_count: number
          comments_count: number
          is_featured: boolean
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['revenue_proofs']['Row'], 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count'> & {
          id?: string
          created_at?: string
          updated_at?: string
          likes_count?: number
          comments_count?: number
        }
        Update: Partial<Database['public']['Tables']['revenue_proofs']['Insert']>
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: string
          tags: string[] | null
          views: number
          likes: number
          comments_count: number
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['community_posts']['Row'], 'id' | 'created_at' | 'updated_at' | 'views' | 'likes' | 'comments_count'> & {
          id?: string
          created_at?: string
          updated_at?: string
          views?: number
          likes?: number
          comments_count?: number
        }
        Update: Partial<Database['public']['Tables']['community_posts']['Insert']>
      }
      community_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          parent_id: string | null
          content: string
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['community_comments']['Row'], 'id' | 'created_at' | 'updated_at' | 'likes'> & {
          id?: string
          created_at?: string
          updated_at?: string
          likes?: number
        }
        Update: Partial<Database['public']['Tables']['community_comments']['Insert']>
      }
      community_likes: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          comment_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['community_likes']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['community_likes']['Insert']>
      }
      user_api_keys: {
        Row: {
          id: string
          user_id: string
          youtube_api_key: string | null
          naver_api_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_api_keys']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['user_api_keys']['Insert']>
      }
      youtube_lens_videos: {
        Row: {
          id: string
          video_id: string
          title: string
          description: string | null
          channel_id: string
          channel_title: string
          published_at: string
          view_count: number
          like_count: number
          comment_count: number
          thumbnail_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['youtube_lens_videos']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['youtube_lens_videos']['Insert']>
      }
      youtube_lens_channels: {
        Row: {
          id: string
          channel_id: string
          title: string
          description: string | null
          subscriber_count: number
          video_count: number
          view_count: number
          thumbnail_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['youtube_lens_channels']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['youtube_lens_channels']['Insert']>
      }
      naver_cafe_verifications: {
        Row: {
          id: string
          user_id: string
          cafe_nickname: string | null
          cafe_member_url: string | null
          verification_status: string
          verified_by: string | null
          rejection_reason: string | null
          created_at: string
          verified_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['naver_cafe_verifications']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['naver_cafe_verifications']['Insert']>
      }
    }
    Views: {
      profiles: {
        Row: {
          id: string
          email: string | null
          username: string | null
          avatar_url: string | null
          is_premium: boolean
          naver_cafe_nickname: string | null
          naver_cafe_verified: boolean
          naver_cafe_member_url: string | null
          naver_cafe_verified_at: string | null
          created_at: string
          updated_at: string
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']
`;

  fs.writeFileSync(OUTPUT_FILE, fallbackTypes);
  console.log('✅ 기본 타입 구조 생성 완료!');
  console.log('⚠️ 주의: 실제 DB 스키마와 다를 수 있습니다.');
  console.log('💡 권장: Supabase Dashboard에서 실제 타입을 가져오세요.');
}

// 실행
generateTypes().catch(console.error);