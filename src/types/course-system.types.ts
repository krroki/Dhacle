/**
 * Course System Type Definitions for Dhacle Platform
 * Version: 1.0
 * Date: 2025-01-11
 */

import { Json } from './database'

// =====================================================
// Course System Table Types
// =====================================================

export interface CourseSystemDatabase {
  public: {
    Tables: {
      // New courses table (replacing old one)
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          instructor_name: string
          thumbnail_url: string | null
          badge_icon_url: string | null
          duration_weeks: number
          price: number
          is_premium: boolean
          chat_room_url: string | null
          launch_date: string
          status: 'upcoming' | 'active' | 'completed'
          max_students: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          instructor_name: string
          thumbnail_url?: string | null
          badge_icon_url?: string | null
          duration_weeks: number
          price?: number
          is_premium?: boolean
          chat_room_url?: string | null
          launch_date: string
          status?: 'upcoming' | 'active' | 'completed'
          max_students?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          instructor_name?: string
          thumbnail_url?: string | null
          badge_icon_url?: string | null
          duration_weeks?: number
          price?: number
          is_premium?: boolean
          chat_room_url?: string | null
          launch_date?: string
          status?: 'upcoming' | 'active' | 'completed'
          max_students?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      
      course_weeks: {
        Row: {
          id: string
          course_id: string
          week_number: number
          title: string
          description: string | null
          video_url: string
          video_duration: number | null
          download_materials: Json
          is_published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          week_number: number
          title: string
          description?: string | null
          video_url: string
          video_duration?: number | null
          download_materials?: Json
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          week_number?: number
          title?: string
          description?: string | null
          video_url?: string
          video_duration?: number | null
          download_materials?: Json
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      // New enrollments table (replacing old one)
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          payment_id: string | null
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          payment_amount: number | null
          payment_method: string | null
          enrolled_at: string
          completed_at: string | null
          certificate_issued: boolean
          certificate_issued_at: string | null
          certificate_url: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          payment_id?: string | null
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          payment_amount?: number | null
          payment_method?: string | null
          enrolled_at?: string
          completed_at?: string | null
          certificate_issued?: boolean
          certificate_issued_at?: string | null
          certificate_url?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          payment_id?: string | null
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          payment_amount?: number | null
          payment_method?: string | null
          enrolled_at?: string
          completed_at?: string | null
          certificate_issued?: boolean
          certificate_issued_at?: string | null
          certificate_url?: string | null
          is_active?: boolean
        }
      }
      
      progress: {
        Row: {
          id: string
          enrollment_id: string
          week_number: number
          watched_seconds: number
          total_seconds: number | null
          last_position: number
          completed: boolean
          completed_at: string | null
          watch_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          enrollment_id: string
          week_number: number
          watched_seconds?: number
          total_seconds?: number | null
          last_position?: number
          completed?: boolean
          completed_at?: string | null
          watch_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enrollment_id?: string
          week_number?: number
          watched_seconds?: number
          total_seconds?: number | null
          last_position?: number
          completed?: boolean
          completed_at?: string | null
          watch_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      
      course_qna: {
        Row: {
          id: string
          course_id: string
          user_id: string
          parent_id: string | null
          title: string | null
          content: string
          is_answer: boolean
          is_pinned: boolean
          is_resolved: boolean
          view_count: number
          like_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id: string
          parent_id?: string | null
          title?: string | null
          content: string
          is_answer?: boolean
          is_pinned?: boolean
          is_resolved?: boolean
          view_count?: number
          like_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          parent_id?: string | null
          title?: string | null
          content?: string
          is_answer?: boolean
          is_pinned?: boolean
          is_resolved?: boolean
          view_count?: number
          like_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      
      user_badges: {
        Row: {
          id: string
          user_id: string
          course_id: string
          badge_type: 'completion' | 'perfect' | 'early_bird' | 'special'
          earned_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          badge_type?: 'completion' | 'perfect' | 'early_bird' | 'special'
          earned_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          badge_type?: 'completion' | 'perfect' | 'early_bird' | 'special'
          earned_at?: string
          metadata?: Json
        }
      }
      
      course_announcements: {
        Row: {
          id: string
          course_id: string
          title: string
          content: string
          is_important: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          content: string
          is_important?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          content?: string
          is_important?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      qna_likes: {
        Row: {
          id: string
          qna_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          qna_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          qna_id?: string
          user_id?: string
          created_at?: string
        }
      }
      
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'instructor' | 'student'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'instructor' | 'student'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'instructor' | 'student'
          created_at?: string
        }
      }
    }
    
    Enums: {
      course_status: 'upcoming' | 'active' | 'completed'
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
      badge_type: 'completion' | 'perfect' | 'early_bird' | 'special'
      user_role_type: 'admin' | 'instructor' | 'student'
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof CourseSystemDatabase['public']['Tables']> = 
  CourseSystemDatabase['public']['Tables'][T]['Row']
export type Insertable<T extends keyof CourseSystemDatabase['public']['Tables']> = 
  CourseSystemDatabase['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof CourseSystemDatabase['public']['Tables']> = 
  CourseSystemDatabase['public']['Tables'][T]['Update']

// Specific table types
export type Course = Tables<'courses'>
export type CourseWeek = Tables<'course_weeks'>
export type Enrollment = Tables<'enrollments'>
export type Progress = Tables<'progress'>
export type CourseQna = Tables<'course_qna'>
export type UserBadge = Tables<'user_badges'>
export type CourseAnnouncement = Tables<'course_announcements'>
export type QnaLike = Tables<'qna_likes'>
export type UserRole = Tables<'user_roles'>

// Insert types
export type CourseInsert = Insertable<'courses'>
export type CourseWeekInsert = Insertable<'course_weeks'>
export type EnrollmentInsert = Insertable<'enrollments'>
export type ProgressInsert = Insertable<'progress'>
export type CourseQnaInsert = Insertable<'course_qna'>
export type UserBadgeInsert = Insertable<'user_badges'>
export type CourseAnnouncementInsert = Insertable<'course_announcements'>
export type QnaLikeInsert = Insertable<'qna_likes'>
export type UserRoleInsert = Insertable<'user_roles'>

// Update types
export type CourseUpdate = Updatable<'courses'>
export type CourseWeekUpdate = Updatable<'course_weeks'>
export type EnrollmentUpdate = Updatable<'enrollments'>
export type ProgressUpdate = Updatable<'progress'>
export type CourseQnaUpdate = Updatable<'course_qna'>
export type UserBadgeUpdate = Updatable<'user_badges'>
export type CourseAnnouncementUpdate = Updatable<'course_announcements'>
export type QnaLikeUpdate = Updatable<'qna_likes'>
export type UserRoleUpdate = Updatable<'user_roles'>

// Enums as const objects for runtime usage
export const CourseStatus = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed'
} as const

export const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const

export const BadgeType = {
  COMPLETION: 'completion',
  PERFECT: 'perfect',
  EARLY_BIRD: 'early_bird',
  SPECIAL: 'special'
} as const

export const UserRoleType = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student'
} as const

// Download material type
export interface DownloadMaterial {
  name: string
  url: string
  size?: number
  type?: string
}

// Badge metadata type
export interface BadgeMetadata {
  score?: number
  rank?: number
  completion_rate?: number
  [key: string]: unknown
}