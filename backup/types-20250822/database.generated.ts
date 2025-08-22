export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      alert_rules: {
        Row: {
          comparison_period: string | null
          condition: string
          cooldown_minutes: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          metric: string
          name: string
          notification_channels: Json | null
          rule_type: string
          target_id: string | null
          target_type: string | null
          threshold_max: number | null
          threshold_min: number | null
          threshold_value: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comparison_period?: string | null
          condition: string
          cooldown_minutes?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          metric: string
          name: string
          notification_channels?: Json | null
          rule_type: string
          target_id?: string | null
          target_type?: string | null
          threshold_max?: number | null
          threshold_min?: number | null
          threshold_value?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comparison_period?: string | null
          condition?: string
          cooldown_minutes?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          metric?: string
          name?: string
          notification_channels?: Json | null
          rule_type?: string
          target_id?: string | null
          target_type?: string | null
          threshold_max?: number | null
          threshold_min?: number | null
          threshold_value?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          message: string
          metric_data: Json | null
          read_at: string | null
          resolution_note: string | null
          resolved_at: string | null
          rule_id: string
          severity: string | null
          threshold_value: number | null
          title: string
          triggered_value: number | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message: string
          metric_data?: Json | null
          read_at?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          rule_id: string
          severity?: string | null
          threshold_value?: number | null
          title: string
          triggered_value?: number | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message?: string
          metric_data?: Json | null
          read_at?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          rule_id?: string
          severity?: string | null
          threshold_value?: number | null
          title?: string
          triggered_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          badge_level: string | null
          badge_type: string
          created_at: string | null
          description: string | null
          earned_at: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badge_level?: string | null
          badge_type: string
          created_at?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badge_level?: string | null
          badge_type?: string
          created_at?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      channel_subscriptions: {
        Row: {
          channel_id: string
          channel_name: string | null
          channel_thumbnail: string | null
          id: string
          subscribed_at: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          channel_name?: string | null
          channel_thumbnail?: string | null
          id?: string
          subscribed_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          channel_name?: string | null
          channel_thumbnail?: string | null
          id?: string
          subscribed_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      channels: {
        Row: {
          country: string | null
          created_at: string | null
          custom_url: string | null
          description: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          last_video_published_at: string | null
          published_at: string | null
          subscriber_count: number | null
          thumbnail_url: string | null
          title: string
          tracking_since: string | null
          updated_at: string | null
          uploads_playlist_id: string | null
          video_count: number | null
          view_count: number | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          id: string
          is_active?: boolean | null
          keywords?: string[] | null
          last_video_published_at?: string | null
          published_at?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          title: string
          tracking_since?: string | null
          updated_at?: string | null
          uploads_playlist_id?: string | null
          video_count?: number | null
          view_count?: number | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          last_video_published_at?: string | null
          published_at?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          title?: string
          tracking_since?: string | null
          updated_at?: string | null
          uploads_playlist_id?: string | null
          video_count?: number | null
          view_count?: number | null
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          added_by: string
          collection_id: string
          created_at: string | null
          id: string
          notes: string | null
          position: number | null
          video_id: string
        }
        Insert: {
          added_by: string
          collection_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          position?: number | null
          video_id: string
        }
        Update: {
          added_by?: string
          collection_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          position?: number | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          item_count: number | null
          name: string
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          item_count?: number | null
          name: string
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          item_count?: number | null
          name?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          parent_id: string | null
          post_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          parent_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          title: string
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string | null
          enrolled_at: string | null
          id: string
          last_accessed_at: string | null
          progress_percentage: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress_extended: {
        Row: {
          completed_lessons: number | null
          course_id: string
          created_at: string | null
          id: string
          last_position: number | null
          lesson_id: string | null
          notes: string | null
          total_lessons: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_lessons?: number | null
          course_id: string
          created_at?: string | null
          id?: string
          last_position?: number | null
          lesson_id?: string | null
          notes?: string | null
          total_lessons?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_lessons?: number | null
          course_id?: string
          created_at?: string | null
          id?: string
          last_position?: number | null
          lesson_id?: string | null
          notes?: string | null
          total_lessons?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_extended_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_progress_extended_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      course_qna: {
        Row: {
          content: string
          course_id: string | null
          created_at: string | null
          id: string
          is_answered: boolean | null
          is_instructor_answer: boolean | null
          likes_count: number | null
          parent_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          week_id: string | null
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_answered?: boolean | null
          is_instructor_answer?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          week_id?: string | null
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_answered?: boolean | null
          is_instructor_answer?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_qna_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_qna_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "course_qna"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_qna_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_qna_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_qna_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "course_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          content: string | null
          course_id: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      course_weeks: {
        Row: {
          assignments: string[] | null
          content: string | null
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          materials: Json | null
          title: string
          updated_at: string | null
          video_url: string | null
          week_number: number
        }
        Insert: {
          assignments?: string[] | null
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          materials?: Json | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          week_number: number
        }
        Update: {
          assignments?: string[] | null
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          materials?: Json | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_weeks_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          average_rating: number | null
          category: string | null
          created_at: string | null
          curriculum: Json | null
          description: string | null
          duration_weeks: number | null
          id: string
          instructor_id: string | null
          instructor_name: string
          is_free: boolean | null
          is_published: boolean | null
          level: string | null
          price: number
          requirements: string[] | null
          thumbnail_url: string | null
          title: string
          total_students: number | null
          updated_at: string | null
          what_youll_learn: string[] | null
        }
        Insert: {
          average_rating?: number | null
          category?: string | null
          created_at?: string | null
          curriculum?: Json | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          instructor_id?: string | null
          instructor_name: string
          is_free?: boolean | null
          is_published?: boolean | null
          level?: string | null
          price?: number
          requirements?: string[] | null
          thumbnail_url?: string | null
          title: string
          total_students?: number | null
          updated_at?: string | null
          what_youll_learn?: string[] | null
        }
        Update: {
          average_rating?: number | null
          category?: string | null
          created_at?: string | null
          curriculum?: Json | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          instructor_id?: string | null
          instructor_name?: string
          is_free?: boolean | null
          is_published?: boolean | null
          level?: string | null
          price?: number
          requirements?: string[] | null
          thumbnail_url?: string | null
          title?: string
          total_students?: number | null
          updated_at?: string | null
          what_youll_learn?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          certificate_url: string | null
          completed_at: string | null
          course_id: string | null
          enrolled_at: string | null
          id: string
          last_accessed_at: string | null
          progress: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          certificate_url?: string | null
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          certificate_url?: string | null
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      folder_channels: {
        Row: {
          added_at: string | null
          channel_id: string
          folder_id: string
          id: string
        }
        Insert: {
          added_at?: string | null
          channel_id: string
          folder_id: string
          id?: string
        }
        Update: {
          added_at?: string | null
          channel_id?: string
          folder_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folder_channels_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "source_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: Json | null
          content_type: string | null
          course_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_preview: boolean | null
          lesson_number: number
          resources: Json | null
          title: string
          updated_at: string | null
          video_url: string | null
          week_id: string | null
        }
        Insert: {
          content?: Json | null
          content_type?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          lesson_number: number
          resources?: Json | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          week_id?: string | null
        }
        Update: {
          content?: Json | null
          content_type?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          lesson_number?: number
          resources?: Json | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "course_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      naver_cafe_verifications: {
        Row: {
          cafe_member_url: string | null
          cafe_nickname: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          cafe_member_url?: string | null
          cafe_nickname: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          cafe_member_url?: string | null
          cafe_nickname?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          course_id: string | null
          created_at: string | null
          id: string
          lesson_id: string | null
          notes: string | null
          time_spent_minutes: number | null
          updated_at: string | null
          user_id: string | null
          week_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          notes?: string | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
          week_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          notes?: string | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string | null
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "course_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_comments: {
        Row: {
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          parent_id: string | null
          proof_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_id?: string | null
          proof_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_id?: string | null
          proof_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "proof_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_comments_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "revenue_proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_likes: {
        Row: {
          created_at: string | null
          id: string
          proof_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          proof_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          proof_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_likes_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "revenue_proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount: number
          coupon_id: string | null
          course_id: string | null
          final_amount: number
          id: string
          payment_data: Json | null
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          purchased_at: string | null
          refund_reason: string | null
          refunded_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          coupon_id?: string | null
          course_id?: string | null
          final_amount: number
          id?: string
          payment_data?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          purchased_at?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          coupon_id?: string | null
          course_id?: string | null
          final_amount?: number
          id?: string
          payment_data?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          purchased_at?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_certifications: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          period_end: string
          period_start: string
          platform: string
          screenshot_url: string | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          period_end: string
          period_start: string
          platform: string
          screenshot_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          period_end?: string
          period_start?: string
          platform?: string
          screenshot_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_certifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_certifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_certifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_certifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_proofs: {
        Row: {
          amount: number
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          is_hidden: boolean | null
          likes_count: number | null
          platform: string
          reports_count: number | null
          screenshot_blur: string | null
          screenshot_url: string
          signature_data: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_hidden?: boolean | null
          likes_count?: number | null
          platform: string
          reports_count?: number | null
          screenshot_blur?: string | null
          screenshot_url: string
          signature_data: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_hidden?: boolean | null
          likes_count?: number | null
          platform?: string
          reports_count?: number | null
          screenshot_blur?: string | null
          screenshot_url?: string
          signature_data?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_proofs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_proofs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      revenues: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          proof_type: string | null
          proof_url: string | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          proof_type?: string | null
          proof_url?: string | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          proof_type?: string | null
          proof_url?: string | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      source_folders: {
        Row: {
          channel_count: number | null
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel_count?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel_count?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_folders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_folders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_logs: {
        Row: {
          action: string
          channel_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          channel_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          channel_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      test_connection: {
        Row: {
          created_at: string
          id: number
          message: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          message?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          message?: string | null
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          api_key_masked: string
          created_at: string
          encrypted_key: string
          id: string
          is_active: boolean
          is_valid: boolean
          last_used_at: string | null
          metadata: Json | null
          service_name: string
          updated_at: string
          usage_count: number
          usage_date: string | null
          usage_today: number
          user_id: string
          validation_error: string | null
        }
        Insert: {
          api_key_masked: string
          created_at?: string
          encrypted_key: string
          id?: string
          is_active?: boolean
          is_valid?: boolean
          last_used_at?: string | null
          metadata?: Json | null
          service_name?: string
          updated_at?: string
          usage_count?: number
          usage_date?: string | null
          usage_today?: number
          user_id: string
          validation_error?: string | null
        }
        Update: {
          api_key_masked?: string
          created_at?: string
          encrypted_key?: string
          id?: string
          is_active?: boolean
          is_valid?: boolean
          last_used_at?: string | null
          metadata?: Json | null
          service_name?: string
          updated_at?: string
          usage_count?: number
          usage_date?: string | null
          usage_today?: number
          user_id?: string
          validation_error?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_level: string | null
          badge_type: string
          earned_at: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          badge_level?: string | null
          badge_type: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          badge_level?: string | null
          badge_type?: string
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          channel_name: string | null
          channel_url: string | null
          created_at: string | null
          current_income: string | null
          email: string
          experience_level: string | null
          full_name: string | null
          id: string
          job_category: string | null
          role: string | null
          target_income: string | null
          total_revenue: number | null
          updated_at: string | null
          username: string | null
          work_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          channel_name?: string | null
          channel_url?: string | null
          created_at?: string | null
          current_income?: string | null
          email: string
          experience_level?: string | null
          full_name?: string | null
          id: string
          job_category?: string | null
          role?: string | null
          target_income?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          username?: string | null
          work_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          channel_name?: string | null
          channel_url?: string | null
          created_at?: string | null
          current_income?: string | null
          email?: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          job_category?: string | null
          role?: string | null
          target_income?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          username?: string | null
          work_type?: string | null
        }
        Relationships: []
      }
      video_stats: {
        Row: {
          comment_count: number | null
          comment_delta: number | null
          created_at: string | null
          date: string
          id: string
          like_count: number | null
          like_delta: number | null
          video_id: string
          view_count: number | null
          view_delta: number | null
        }
        Insert: {
          comment_count?: number | null
          comment_delta?: number | null
          created_at?: string | null
          date: string
          id?: string
          like_count?: number | null
          like_delta?: number | null
          video_id: string
          view_count?: number | null
          view_delta?: number | null
        }
        Update: {
          comment_count?: number | null
          comment_delta?: number | null
          created_at?: string | null
          date?: string
          id?: string
          like_count?: number | null
          like_delta?: number | null
          video_id?: string
          view_count?: number | null
          view_delta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_stats_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          category_id: string | null
          channel_id: string
          comment_count: number | null
          created_at: string | null
          default_audio_language: string | null
          default_language: string | null
          description: string | null
          duration: string | null
          id: string
          is_live: boolean | null
          like_count: number | null
          live_broadcast_content: string | null
          made_for_kids: boolean | null
          privacy_status: string | null
          published_at: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          channel_id: string
          comment_count?: number | null
          created_at?: string | null
          default_audio_language?: string | null
          default_language?: string | null
          description?: string | null
          duration?: string | null
          id: string
          is_live?: boolean | null
          like_count?: number | null
          live_broadcast_content?: string | null
          made_for_kids?: boolean | null
          privacy_status?: string | null
          published_at?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          channel_id?: string
          comment_count?: number | null
          created_at?: string | null
          default_audio_language?: string | null
          default_language?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_live?: boolean | null
          like_count?: number | null
          live_broadcast_content?: string | null
          made_for_kids?: boolean | null
          privacy_status?: string | null
          published_at?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      profiles: {
        Row: {
          channel_name: string | null
          channel_url: string | null
          created_at: string | null
          current_income: string | null
          experience_level: string | null
          full_name: string | null
          id: string | null
          job_category: string | null
          target_income: string | null
          updated_at: string | null
          username: string | null
          work_type: string | null
        }
        Insert: {
          channel_name?: string | null
          channel_url?: string | null
          created_at?: string | null
          current_income?: string | null
          experience_level?: string | null
          full_name?: string | null
          id?: string | null
          job_category?: string | null
          target_income?: string | null
          updated_at?: string | null
          username?: string | null
          work_type?: string | null
        }
        Update: {
          channel_name?: string | null
          channel_url?: string | null
          created_at?: string | null
          current_income?: string | null
          experience_level?: string | null
          full_name?: string | null
          id?: string | null
          job_category?: string | null
          target_income?: string | null
          updated_at?: string | null
          username?: string | null
          work_type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      increment_api_key_usage: {
        Args: { p_service_name?: string; p_user_id: string }
        Returns: undefined
      }
      increment_view_count: {
        Args: { post_id: string }
        Returns: undefined
      }
      reset_daily_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
