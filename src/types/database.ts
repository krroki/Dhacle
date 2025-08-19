/**
 * Database Type Definitions for Dhacle Platform
 * Generated from Supabase Schema
 * Version: 001
 * Date: 2025-01-09
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          fullName: string | null;
          avatar_url: string | null;
          channel_name: string | null;
          channelUrl: string | null;
          totalRevenue: number;
          is_active: boolean;
          role: 'user' | 'instructor' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          fullName?: string | null;
          avatar_url?: string | null;
          channel_name?: string | null;
          channelUrl?: string | null;
          totalRevenue?: number;
          is_active?: boolean;
          role?: 'user' | 'instructor' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          fullName?: string | null;
          avatar_url?: string | null;
          channel_name?: string | null;
          channelUrl?: string | null;
          totalRevenue?: number;
          is_active?: boolean;
          role?: 'user' | 'instructor' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          instructorId: string | null;
          price: number;
          discountRate: number;
          thumbnail_url: string | null;
          videoUrl: string | null;
          durationMinutes: number | null;
          difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | null;
          category: 'shorts' | 'marketing' | 'editing' | 'monetization' | 'analytics' | null;
          rating: number;
          studentCount: number;
          isPublished: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          instructorId?: string | null;
          price?: number;
          discountRate?: number;
          thumbnail_url?: string | null;
          videoUrl?: string | null;
          durationMinutes?: number | null;
          difficultyLevel?: 'beginner' | 'intermediate' | 'advanced' | null;
          category?: 'shorts' | 'marketing' | 'editing' | 'monetization' | 'analytics' | null;
          rating?: number;
          studentCount?: number;
          isPublished?: boolean;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          instructorId?: string | null;
          price?: number;
          discountRate?: number;
          thumbnail_url?: string | null;
          videoUrl?: string | null;
          durationMinutes?: number | null;
          difficultyLevel?: 'beginner' | 'intermediate' | 'advanced' | null;
          category?: 'shorts' | 'marketing' | 'editing' | 'monetization' | 'analytics' | null;
          rating?: number;
          studentCount?: number;
          isPublished?: boolean;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrolledAt: string;
          completedAt: string | null;
          progressPercentage: number;
          isCompleted: boolean;
          rating: number | null;
          reviewText: string | null;
          reviewDate: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrolledAt?: string;
          completedAt?: string | null;
          progressPercentage?: number;
          isCompleted?: boolean;
          rating?: number | null;
          reviewText?: string | null;
          reviewDate?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          enrolledAt?: string;
          completedAt?: string | null;
          progressPercentage?: number;
          isCompleted?: boolean;
          rating?: number | null;
          reviewText?: string | null;
          reviewDate?: string | null;
        };
      };
      revenueCertifications: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          currency: 'KRW' | 'USD';
          screenshot_url: string;
          platform: 'youtube' | 'blog' | 'tiktok' | 'instagram' | 'other' | null;
          periodStart: string;
          periodEnd: string;
          description: string | null;
          is_verified: boolean;
          verifiedBy: string | null;
          verifiedAt: string | null;
          rejectionReason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          currency?: 'KRW' | 'USD';
          screenshot_url: string;
          platform?: 'youtube' | 'blog' | 'tiktok' | 'instagram' | 'other' | null;
          periodStart: string;
          periodEnd: string;
          description?: string | null;
          is_verified?: boolean;
          verifiedBy?: string | null;
          verifiedAt?: string | null;
          rejectionReason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          currency?: 'KRW' | 'USD';
          screenshot_url?: string;
          platform?: 'youtube' | 'blog' | 'tiktok' | 'instagram' | 'other' | null;
          periodStart?: string;
          periodEnd?: string;
          description?: string | null;
          is_verified?: boolean;
          verifiedBy?: string | null;
          verifiedAt?: string | null;
          rejectionReason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rankings: {
        Row: {
          id: string;
          user_id: string;
          periodType: 'weekly' | 'monthly' | 'yearly' | 'all-time';
          periodDate: string;
          rank: number;
          totalRevenue: number;
          changeFromPrevious: number;
          percentile: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          periodType: 'weekly' | 'monthly' | 'yearly' | 'all-time';
          periodDate: string;
          rank: number;
          totalRevenue: number;
          changeFromPrevious?: number;
          percentile?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          periodType?: 'weekly' | 'monthly' | 'yearly' | 'all-time';
          periodDate?: string;
          rank?: number;
          totalRevenue?: number;
          changeFromPrevious?: number;
          percentile?: number | null;
          created_at?: string;
        };
      };
      communities: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          category: 'notice' | 'free' | 'success' | 'qna' | 'tips' | 'resources' | null;
          tags: string[] | null;
          view_count: number;
          like_count: number;
          comment_count: number;
          isPinned: boolean;
          isLocked: boolean;
          is_deleted: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          category?: 'notice' | 'free' | 'success' | 'qna' | 'tips' | 'resources' | null;
          tags?: string[] | null;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          isPinned?: boolean;
          isLocked?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          category?: 'notice' | 'free' | 'success' | 'qna' | 'tips' | 'resources' | null;
          tags?: string[] | null;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          isPinned?: boolean;
          isLocked?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          parentCommentId: string | null;
          content: string;
          like_count: number;
          isEdited: boolean;
          is_deleted: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          parentCommentId?: string | null;
          content: string;
          like_count?: number;
          isEdited?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          parentCommentId?: string | null;
          content?: string;
          like_count?: number;
          isEdited?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tools: {
        Row: {
          id: string;
          user_id: string;
          toolType:
            | 'subtitle_generator'
            | 'thumbnail_analyzer'
            | 'title_optimizer'
            | 'tag_generator';
          inputData: Json | null;
          outputData: Json | null;
          processingTimeMs: number | null;
          status: 'pending' | 'processing' | 'completed' | 'failed' | null;
          errorMessage: string | null;
          fileUrl: string | null;
          creditsUsed: number;
          created_at: string;
          completedAt: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          toolType:
            | 'subtitle_generator'
            | 'thumbnail_analyzer'
            | 'title_optimizer'
            | 'tag_generator';
          inputData?: Json | null;
          outputData?: Json | null;
          processingTimeMs?: number | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
          errorMessage?: string | null;
          fileUrl?: string | null;
          creditsUsed?: number;
          created_at?: string;
          completedAt?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          toolType?:
            | 'subtitle_generator'
            | 'thumbnail_analyzer'
            | 'title_optimizer'
            | 'tag_generator';
          inputData?: Json | null;
          outputData?: Json | null;
          processingTimeMs?: number | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
          errorMessage?: string | null;
          fileUrl?: string | null;
          creditsUsed?: number;
          created_at?: string;
          completedAt?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      userRole: 'user' | 'instructor' | 'admin';
      courseDifficulty: 'beginner' | 'intermediate' | 'advanced';
      courseCategory: 'shorts' | 'marketing' | 'editing' | 'monetization' | 'analytics';
      communityCategory: 'notice' | 'free' | 'success' | 'qna' | 'tips' | 'resources';
      platformType: 'youtube' | 'blog' | 'tiktok' | 'instagram' | 'other';
      periodType: 'weekly' | 'monthly' | 'yearly' | 'all-time';
      toolType: 'subtitle_generator' | 'thumbnail_analyzer' | 'title_optimizer' | 'tag_generator';
      toolStatus: 'pending' | 'processing' | 'completed' | 'failed';
      currency: 'KRW' | 'USD';
    };
  };
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Specific table types
export type User = Tables<'users'>;
export type Course = Tables<'courses'>;
export type Enrollment = Tables<'enrollments'>;
export type RevenueCertification = Tables<'revenueCertifications'>;
export type Ranking = Tables<'rankings'>;
export type Community = Tables<'communities'>;
export type Comment = Tables<'comments'>;
export type Tool = Tables<'tools'>;

// Insert types
export type UserInsert = Insertable<'users'>;
export type CourseInsert = Insertable<'courses'>;
export type EnrollmentInsert = Insertable<'enrollments'>;
export type RevenueCertificationInsert = Insertable<'revenueCertifications'>;
export type RankingInsert = Insertable<'rankings'>;
export type CommunityInsert = Insertable<'communities'>;
export type CommentInsert = Insertable<'comments'>;
export type ToolInsert = Insertable<'tools'>;

// Update types
export type UserUpdate = Updatable<'users'>;
export type CourseUpdate = Updatable<'courses'>;
export type EnrollmentUpdate = Updatable<'enrollments'>;
export type RevenueCertificationUpdate = Updatable<'revenueCertifications'>;
export type RankingUpdate = Updatable<'rankings'>;
export type CommunityUpdate = Updatable<'communities'>;
export type CommentUpdate = Updatable<'comments'>;
export type ToolUpdate = Updatable<'tools'>;

// Enums as const objects for runtime usage
export const UserRole = {
  USER: 'user',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
} as const;

export const CourseDifficulty = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export const CourseCategory = {
  SHORTS: 'shorts',
  MARKETING: 'marketing',
  EDITING: 'editing',
  MONETIZATION: 'monetization',
  ANALYTICS: 'analytics',
} as const;

export const CommunityCategory = {
  NOTICE: 'notice',
  FREE: 'free',
  SUCCESS: 'success',
  QNA: 'qna',
  TIPS: 'tips',
  RESOURCES: 'resources',
} as const;

export const Platform = {
  YOUTUBE: 'youtube',
  BLOG: 'blog',
  TIKTOK: 'tiktok',
  INSTAGRAM: 'instagram',
  OTHER: 'other',
} as const;

export const PeriodType = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  ALL_TIME: 'all-time',
} as const;

export const ToolType = {
  SUBTITLE_GENERATOR: 'subtitle_generator',
  THUMBNAIL_ANALYZER: 'thumbnail_analyzer',
  TITLE_OPTIMIZER: 'title_optimizer',
  TAG_GENERATOR: 'tag_generator',
} as const;

export const ToolStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const Currency = {
  KRW: 'KRW',
  USD: 'USD',
} as const;
