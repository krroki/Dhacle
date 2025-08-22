/**
 * Course System Type Definitions for Dhacle Platform
 * Version: 1.0
 * Date: 2025-01-11
 */

import type { Json } from './database.generated';

// =====================================================
// Course System Table Types
// =====================================================

export interface CourseSystemDatabase {
  public: {
    Tables: {
      // New courses table (replacing old one)
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          instructor_name: string;
          thumbnail_url: string | null;
          badgeIconUrl: string | null;
          durationWeeks: number;
          price: number;
          isPremium: boolean;
          chatRoomUrl: string | null;
          launchDate: string;
          status: 'upcoming' | 'active' | 'completed';
          maxStudents: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          instructor_name: string;
          thumbnail_url?: string | null;
          badgeIconUrl?: string | null;
          durationWeeks: number;
          price?: number;
          isPremium?: boolean;
          chatRoomUrl?: string | null;
          launchDate: string;
          status?: 'upcoming' | 'active' | 'completed';
          maxStudents?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          instructor_name?: string;
          thumbnail_url?: string | null;
          badgeIconUrl?: string | null;
          durationWeeks?: number;
          price?: number;
          isPremium?: boolean;
          chatRoomUrl?: string | null;
          launchDate?: string;
          status?: 'upcoming' | 'active' | 'completed';
          maxStudents?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      courseWeeks: {
        Row: {
          id: string;
          course_id: string;
          weekNumber: number;
          title: string;
          description: string | null;
          video_url: string;
          video_duration: number | null;
          downloadMaterials: Json;
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          weekNumber: number;
          title: string;
          description?: string | null;
          video_url: string;
          video_duration?: number | null;
          downloadMaterials?: Json;
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          weekNumber?: number;
          title?: string;
          description?: string | null;
          video_url?: string;
          video_duration?: number | null;
          downloadMaterials?: Json;
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // New enrollments table (replacing old one)
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          payment_id: string | null;
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          paymentAmount: number | null;
          payment_method: string | null;
          enrolledAt: string;
          completed_at: string | null;
          certificateIssued: boolean;
          certificateIssuedAt: string | null;
          certificateUrl: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          payment_id?: string | null;
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          paymentAmount?: number | null;
          payment_method?: string | null;
          enrolledAt?: string;
          completed_at?: string | null;
          certificateIssued?: boolean;
          certificateIssuedAt?: string | null;
          certificateUrl?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          payment_id?: string | null;
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
          paymentAmount?: number | null;
          payment_method?: string | null;
          enrolledAt?: string;
          completed_at?: string | null;
          certificateIssued?: boolean;
          certificateIssuedAt?: string | null;
          certificateUrl?: string | null;
          is_active?: boolean;
        };
      };

      progress: {
        Row: {
          id: string;
          enrollmentId: string;
          weekNumber: number;
          watchedSeconds: number;
          totalSeconds: number | null;
          lastPosition: number;
          completed: boolean;
          completed_at: string | null;
          watchCount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          enrollmentId: string;
          weekNumber: number;
          watchedSeconds?: number;
          totalSeconds?: number | null;
          lastPosition?: number;
          completed?: boolean;
          completed_at?: string | null;
          watchCount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          enrollmentId?: string;
          weekNumber?: number;
          watchedSeconds?: number;
          totalSeconds?: number | null;
          lastPosition?: number;
          completed?: boolean;
          completed_at?: string | null;
          watchCount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      courseQna: {
        Row: {
          id: string;
          course_id: string;
          user_id: string;
          parent_id: string | null;
          title: string | null;
          content: string;
          isAnswer: boolean;
          is_pinned: boolean;
          is_resolved: boolean;
          view_count: number;
          like_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          user_id: string;
          parent_id?: string | null;
          title?: string | null;
          content: string;
          isAnswer?: boolean;
          is_pinned?: boolean;
          isResolved?: boolean;
          view_count?: number;
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          user_id?: string;
          parent_id?: string | null;
          title?: string | null;
          content?: string;
          isAnswer?: boolean;
          is_pinned?: boolean;
          isResolved?: boolean;
          view_count?: number;
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      userBadges: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          badgeType: 'completion' | 'perfect' | 'early_bird' | 'special';
          earnedAt: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          badgeType?: 'completion' | 'perfect' | 'early_bird' | 'special';
          earnedAt?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          badgeType?: 'completion' | 'perfect' | 'early_bird' | 'special';
          earnedAt?: string;
          metadata?: Json;
        };
      };

      courseAnnouncements: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          content: string;
          isImportant: boolean;
          createdBy: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          content: string;
          isImportant?: boolean;
          createdBy?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          content?: string;
          isImportant?: boolean;
          createdBy?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      qnaLikes: {
        Row: {
          id: string;
          qnaId: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          qnaId: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          qnaId?: string;
          user_id?: string;
          created_at?: string;
        };
      };

      userRoles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'instructor' | 'student';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'admin' | 'instructor' | 'student';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'admin' | 'instructor' | 'student';
          created_at?: string;
        };
      };
    };

    Enums: {
      courseStatus: 'upcoming' | 'active' | 'completed';
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
      badgeType: 'completion' | 'perfect' | 'early_bird' | 'special';
      userRoleType: 'admin' | 'instructor' | 'student';
    };
  };
}

// Helper types for easier usage
export type Tables<T extends keyof CourseSystemDatabase['public']['Tables']> =
  CourseSystemDatabase['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof CourseSystemDatabase['public']['Tables']> =
  CourseSystemDatabase['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof CourseSystemDatabase['public']['Tables']> =
  CourseSystemDatabase['public']['Tables'][T]['Update'];

// Specific table types
export type Course = Tables<'courses'>;
export type CourseWeek = Tables<'courseWeeks'>;
export type Enrollment = Tables<'enrollments'>;
export type Progress = Tables<'progress'>;
export type CourseQna = Tables<'courseQna'>;
export type UserBadge = Tables<'userBadges'>;
export type CourseAnnouncement = Tables<'courseAnnouncements'>;
export type QnaLike = Tables<'qnaLikes'>;
export type UserRole = Tables<'userRoles'>;

// Insert types
export type CourseInsert = Insertable<'courses'>;
export type CourseWeekInsert = Insertable<'courseWeeks'>;
export type EnrollmentInsert = Insertable<'enrollments'>;
export type ProgressInsert = Insertable<'progress'>;
export type CourseQnaInsert = Insertable<'courseQna'>;
export type UserBadgeInsert = Insertable<'userBadges'>;
export type CourseAnnouncementInsert = Insertable<'courseAnnouncements'>;
export type QnaLikeInsert = Insertable<'qnaLikes'>;
export type UserRoleInsert = Insertable<'userRoles'>;

// Update types
export type CourseUpdate = Updatable<'courses'>;
export type CourseWeekUpdate = Updatable<'courseWeeks'>;
export type EnrollmentUpdate = Updatable<'enrollments'>;
export type ProgressUpdate = Updatable<'progress'>;
export type CourseQnaUpdate = Updatable<'courseQna'>;
export type UserBadgeUpdate = Updatable<'userBadges'>;
export type CourseAnnouncementUpdate = Updatable<'courseAnnouncements'>;
export type QnaLikeUpdate = Updatable<'qnaLikes'>;
export type UserRoleUpdate = Updatable<'userRoles'>;

// Enums as const objects for runtime usage
export const CourseStatus = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

export const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const BadgeType = {
  COMPLETION: 'completion',
  PERFECT: 'perfect',
  EARLY_BIRD: 'early_bird',
  SPECIAL: 'special',
} as const;

export const UserRoleType = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
} as const;

// Download material type
export interface DownloadMaterial {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

// Badge metadata type
export interface BadgeMetadata {
  score?: number;
  rank?: number;
  completion_rate?: number;
  [key: string]: unknown;
}
