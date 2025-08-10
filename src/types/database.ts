/**
 * Database Type Definitions for Dhacle Platform
 * Generated from Supabase Schema
 * Version: 001
 * Date: 2025-01-09
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
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          channel_name: string | null
          channel_url: string | null
          total_revenue: number
          is_active: boolean
          role: 'user' | 'instructor' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          channel_name?: string | null
          channel_url?: string | null
          total_revenue?: number
          is_active?: boolean
          role?: 'user' | 'instructor' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          channel_name?: string | null
          channel_url?: string | null
          total_revenue?: number
          is_active?: boolean
          role?: 'user' | 'instructor' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          instructor_id: string | null
          price: number
          discount_rate: number
          thumbnail_url: string | null
          video_url: string | null
          duration_minutes: number | null
          difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null
          category: 'shorts' | 'marketing' | 'editing' | 'monetization' | 'analytics' | null
          rating: number
          student_count: number
          is_published: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          instructor_id?: string | null
          price?: number
          discount_rate?: number
          thumbnail_url?: string | null
          video_url?: string | null
          duration_minutes?: number | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | null
          category?: 'shorts' | 'marketing' | 'editing' | 'monetization' | 'analytics' | null
          rating?: number
          student_count?: number
          is_published?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          instructor_id?: string | null
          price?: number
          discount_rate?: number
          thumbnail_url?: string | null
          video_url?: string | null
          duration_minutes?: number | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | null
          category?: 'shorts' | 'marketing' | 'editing' | 'monetization' | 'analytics' | null
          rating?: number
          student_count?: number
          is_published?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          enrolled_at: string
          completed_at: string | null
          progress_percentage: number
          is_completed: boolean
          rating: number | null
          review_text: string | null
          review_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          enrolled_at?: string
          completed_at?: string | null
          progress_percentage?: number
          is_completed?: boolean
          rating?: number | null
          review_text?: string | null
          review_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          enrolled_at?: string
          completed_at?: string | null
          progress_percentage?: number
          is_completed?: boolean
          rating?: number | null
          review_text?: string | null
          review_date?: string | null
        }
      }
      revenue_certifications: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: 'KRW' | 'USD'
          screenshot_url: string
          platform: 'youtube' | 'blog' | 'tiktok' | 'instagram' | 'other' | null
          period_start: string
          period_end: string
          description: string | null
          is_verified: boolean
          verified_by: string | null
          verified_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: 'KRW' | 'USD'
          screenshot_url: string
          platform?: 'youtube' | 'blog' | 'tiktok' | 'instagram' | 'other' | null
          period_start: string
          period_end: string
          description?: string | null
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: 'KRW' | 'USD'
          screenshot_url?: string
          platform?: 'youtube' | 'blog' | 'tiktok' | 'instagram' | 'other' | null
          period_start?: string
          period_end?: string
          description?: string | null
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rankings: {
        Row: {
          id: string
          user_id: string
          period_type: 'weekly' | 'monthly' | 'yearly' | 'all-time'
          period_date: string
          rank: number
          total_revenue: number
          change_from_previous: number
          percentile: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          period_type: 'weekly' | 'monthly' | 'yearly' | 'all-time'
          period_date: string
          rank: number
          total_revenue: number
          change_from_previous?: number
          percentile?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          period_type?: 'weekly' | 'monthly' | 'yearly' | 'all-time'
          period_date?: string
          rank?: number
          total_revenue?: number
          change_from_previous?: number
          percentile?: number | null
          created_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          category: 'notice' | 'free' | 'success' | 'qna' | 'tips' | 'resources' | null
          tags: string[] | null
          view_count: number
          like_count: number
          comment_count: number
          is_pinned: boolean
          is_locked: boolean
          is_deleted: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          category?: 'notice' | 'free' | 'success' | 'qna' | 'tips' | 'resources' | null
          tags?: string[] | null
          view_count?: number
          like_count?: number
          comment_count?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          category?: 'notice' | 'free' | 'success' | 'qna' | 'tips' | 'resources' | null
          tags?: string[] | null
          view_count?: number
          like_count?: number
          comment_count?: number
          is_pinned?: boolean
          is_locked?: boolean
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          parent_comment_id: string | null
          content: string
          like_count: number
          is_edited: boolean
          is_deleted: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          parent_comment_id?: string | null
          content: string
          like_count?: number
          is_edited?: boolean
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          parent_comment_id?: string | null
          content?: string
          like_count?: number
          is_edited?: boolean
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tools: {
        Row: {
          id: string
          user_id: string
          tool_type: 'subtitle_generator' | 'thumbnail_analyzer' | 'title_optimizer' | 'tag_generator'
          input_data: Json | null
          output_data: Json | null
          processing_time_ms: number | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | null
          error_message: string | null
          file_url: string | null
          credits_used: number
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          tool_type: 'subtitle_generator' | 'thumbnail_analyzer' | 'title_optimizer' | 'tag_generator'
          input_data?: Json | null
          output_data?: Json | null
          processing_time_ms?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | null
          error_message?: string | null
          file_url?: string | null
          credits_used?: number
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          tool_type?: 'subtitle_generator' | 'thumbnail_analyzer' | 'title_optimizer' | 'tag_generator'
          input_data?: Json | null
          output_data?: Json | null
          processing_time_ms?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | null
          error_message?: string | null
          file_url?: string | null
          credits_used?: number
          created_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'instructor' | 'admin'
      course_difficulty: 'beginner' | 'intermediate' | 'advanced'
      course_category: 'shorts' | 'marketing' | 'editing' | 'monetization' | 'analytics'
      community_category: 'notice' | 'free' | 'success' | 'qna' | 'tips' | 'resources'
      platform_type: 'youtube' | 'blog' | 'tiktok' | 'instagram' | 'other'
      period_type: 'weekly' | 'monthly' | 'yearly' | 'all-time'
      tool_type: 'subtitle_generator' | 'thumbnail_analyzer' | 'title_optimizer' | 'tag_generator'
      tool_status: 'pending' | 'processing' | 'completed' | 'failed'
      currency: 'KRW' | 'USD'
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type User = Tables<'users'>
export type Course = Tables<'courses'>
export type Enrollment = Tables<'enrollments'>
export type RevenueCertification = Tables<'revenue_certifications'>
export type Ranking = Tables<'rankings'>
export type Community = Tables<'communities'>
export type Comment = Tables<'comments'>
export type Tool = Tables<'tools'>

// Insert types
export type UserInsert = Insertable<'users'>
export type CourseInsert = Insertable<'courses'>
export type EnrollmentInsert = Insertable<'enrollments'>
export type RevenueCertificationInsert = Insertable<'revenue_certifications'>
export type RankingInsert = Insertable<'rankings'>
export type CommunityInsert = Insertable<'communities'>
export type CommentInsert = Insertable<'comments'>
export type ToolInsert = Insertable<'tools'>

// Update types
export type UserUpdate = Updatable<'users'>
export type CourseUpdate = Updatable<'courses'>
export type EnrollmentUpdate = Updatable<'enrollments'>
export type RevenueCertificationUpdate = Updatable<'revenue_certifications'>
export type RankingUpdate = Updatable<'rankings'>
export type CommunityUpdate = Updatable<'communities'>
export type CommentUpdate = Updatable<'comments'>
export type ToolUpdate = Updatable<'tools'>

// Enums as const objects for runtime usage
export const UserRole = {
  USER: 'user',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin'
} as const

export const CourseDifficulty = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
} as const

export const CourseCategory = {
  SHORTS: 'shorts',
  MARKETING: 'marketing',
  EDITING: 'editing',
  MONETIZATION: 'monetization',
  ANALYTICS: 'analytics'
} as const

export const CommunityCategory = {
  NOTICE: 'notice',
  FREE: 'free',
  SUCCESS: 'success',
  QNA: 'qna',
  TIPS: 'tips',
  RESOURCES: 'resources'
} as const

export const Platform = {
  YOUTUBE: 'youtube',
  BLOG: 'blog',
  TIKTOK: 'tiktok',
  INSTAGRAM: 'instagram',
  OTHER: 'other'
} as const

export const PeriodType = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  ALL_TIME: 'all-time'
} as const

export const ToolType = {
  SUBTITLE_GENERATOR: 'subtitle_generator',
  THUMBNAIL_ANALYZER: 'thumbnail_analyzer',
  TITLE_OPTIMIZER: 'title_optimizer',
  TAG_GENERATOR: 'tag_generator'
} as const

export const ToolStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const

export const Currency = {
  KRW: 'KRW',
  USD: 'USD'
} as const