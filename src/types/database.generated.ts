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
      adminnotifications: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          message: string | null
          priority: string | null
          read_at: string | null
          resolution_note: string | null
          resolved_at: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message?: string | null
          priority?: string | null
          read_at?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message?: string | null
          priority?: string | null
          read_at?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      alert_rules: {
        Row: {
          channel_id: string | null
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
          threshold_value: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel_id?: string | null
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
          threshold_value?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string | null
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
          threshold_value?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      alert_rules_backup_20250826: {
        Row: {
          comparison_period: string | null
          condition: string | null
          cooldown_minutes: number | null
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          last_triggered_at: string | null
          metric: string | null
          name: string | null
          notification_channels: Json | null
          rule_type: string | null
          target_id: string | null
          target_type: string | null
          threshold_max: number | null
          threshold_min: number | null
          threshold_value: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comparison_period?: string | null
          condition?: string | null
          cooldown_minutes?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          last_triggered_at?: string | null
          metric?: string | null
          name?: string | null
          notification_channels?: Json | null
          rule_type?: string | null
          target_id?: string | null
          target_type?: string | null
          threshold_max?: number | null
          threshold_min?: number | null
          threshold_value?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comparison_period?: string | null
          condition?: string | null
          cooldown_minutes?: number | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          last_triggered_at?: string | null
          metric?: string | null
          name?: string | null
          notification_channels?: Json | null
          rule_type?: string | null
          target_id?: string | null
          target_type?: string | null
          threshold_max?: number | null
          threshold_min?: number | null
          threshold_value?: number | null
          updated_at?: string | null
          user_id?: string | null
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
      analytics_logs: {
        Row: {
          analysis_type: string
          config: Json | null
          created_at: string | null
          id: string
          processing_time_ms: number | null
          user_id: string
          video_count: number | null
        }
        Insert: {
          analysis_type: string
          config?: Json | null
          created_at?: string | null
          id?: string
          processing_time_ms?: number | null
          user_id: string
          video_count?: number | null
        }
        Update: {
          analysis_type?: string
          config?: Json | null
          created_at?: string | null
          id?: string
          processing_time_ms?: number | null
          user_id?: string
          video_count?: number | null
        }
        Relationships: []
      }
      analyticslogs: {
        Row: {
          analysis_type: string
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
          video_id: string | null
        }
        Insert: {
          analysis_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
          video_id?: string | null
        }
        Update: {
          analysis_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          created_at: string | null
          date: string | null
          endpoint: string
          id: string
          method: string
          quota_used: number | null
          response_time: number | null
          search_count: number | null
          status_code: number | null
          units_used: number | null
          user_id: string | null
          video_count: number | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          endpoint: string
          id?: string
          method: string
          quota_used?: number | null
          response_time?: number | null
          search_count?: number | null
          status_code?: number | null
          units_used?: number | null
          user_id?: string | null
          video_count?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          endpoint?: string
          id?: string
          method?: string
          quota_used?: number | null
          response_time?: number | null
          search_count?: number | null
          status_code?: number | null
          units_used?: number | null
          user_id?: string | null
          video_count?: number | null
        }
        Relationships: []
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
      channelsubscriptions: {
        Row: {
          channel_id: string
          channel_title: string | null
          created_at: string | null
          expires_at: string | null
          hub_callback_url: string | null
          hub_secret: string | null
          hub_topic: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channel_id: string
          channel_title?: string | null
          created_at?: string | null
          expires_at?: string | null
          hub_callback_url?: string | null
          hub_secret?: string | null
          hub_topic?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string
          channel_title?: string | null
          created_at?: string | null
          expires_at?: string | null
          hub_callback_url?: string | null
          hub_secret?: string | null
          hub_topic?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
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
          metadata: Json | null
          name: string
          tags: string[] | null
          type: string | null
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
          metadata?: Json | null
          name: string
          tags?: string[] | null
          type?: string | null
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
          metadata?: Json | null
          name?: string
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey"
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
      naver_cafe_members: {
        Row: {
          cafe_member_id: string
          created_at: string | null
          id: string
          nickname: string | null
          updated_at: string | null
          user_id: string | null
          verification_attempts: number | null
          verification_code: string | null
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          cafe_member_id: string
          created_at?: string | null
          id?: string
          nickname?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_attempts?: number | null
          verification_code?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          cafe_member_id?: string
          created_at?: string | null
          id?: string
          nickname?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_attempts?: number | null
          verification_code?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
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
      navercafeverifications: {
        Row: {
          cafe_nickname: string
          created_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
          verification_code: string
          verified_at: string | null
        }
        Insert: {
          cafe_nickname: string
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_code: string
          verified_at?: string | null
        }
        Update: {
          cafe_nickname?: string
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_code?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_name: string
          metric_value: number
          navigation_type: string | null
          page_url: string
          rating: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_name: string
          metric_value: number
          navigation_type?: string | null
          page_url: string
          rating?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_name?: string
          metric_value?: number
          navigation_type?: string | null
          page_url?: string
          rating?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          channel_name: string | null
          channel_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          randomnickname: string | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          channel_name?: string | null
          channel_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          randomnickname?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          channel_name?: string | null
          channel_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          randomnickname?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      rankings: {
        Row: {
          change_from_previous: number | null
          created_at: string | null
          id: string
          percentile: number | null
          period_date: string
          period_type: string | null
          rank: number
          total_revenue: number
          user_id: string | null
        }
        Insert: {
          change_from_previous?: number | null
          created_at?: string | null
          id?: string
          percentile?: number | null
          period_date: string
          period_type?: string | null
          rank: number
          total_revenue: number
          user_id?: string | null
        }
        Update: {
          change_from_previous?: number | null
          created_at?: string | null
          id?: string
          percentile?: number | null
          period_date?: string
          period_type?: string | null
          rank?: number
          total_revenue?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rankings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      subscriptionlogs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          error: string | null
          id: string
          status: string | null
          subscription_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          error?: string | null
          id?: string
          status?: string | null
          subscription_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          error?: string | null
          id?: string
          status?: string | null
          subscription_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          channel_id: string
          channel_thumbnail: string | null
          channel_title: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_checked: string | null
          notification_enabled: boolean | null
          subscribed_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channel_id: string
          channel_thumbnail?: string | null
          channel_title?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_checked?: string | null
          notification_enabled?: boolean | null
          subscribed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string
          channel_thumbnail?: string | null
          channel_title?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_checked?: string | null
          notification_enabled?: boolean | null
          subscribed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      tools: {
        Row: {
          completed_at: string | null
          created_at: string | null
          credits_used: number | null
          error_message: string | null
          file_url: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          processing_time_ms: number | null
          status: string | null
          tool_type: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          credits_used?: number | null
          error_message?: string | null
          file_url?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          processing_time_ms?: number | null
          status?: string | null
          tool_type: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          credits_used?: number | null
          error_message?: string | null
          file_url?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          processing_time_ms?: number | null
          status?: string | null
          tool_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tools_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_certificates: {
        Row: {
          certificate_number: string
          certificate_url: string | null
          completion_date: string
          course_id: string
          created_at: string
          grade: string | null
          id: string
          is_public: boolean | null
          issued_at: string
          metadata: Json | null
          score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certificate_number: string
          certificate_url?: string | null
          completion_date: string
          course_id: string
          created_at?: string
          grade?: string | null
          id?: string
          is_public?: boolean | null
          issued_at?: string
          metadata?: Json | null
          score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certificate_number?: string
          certificate_url?: string | null
          completion_date?: string
          course_id?: string
          created_at?: string
          grade?: string | null
          id?: string
          is_public?: boolean | null
          issued_at?: string
          metadata?: Json | null
          score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          cafe_member_url: string | null
          channel_name: string | null
          channel_url: string | null
          created_at: string | null
          current_income: string | null
          email: string
          experience_level: string | null
          full_name: string | null
          id: string
          job_category: string | null
          naver_cafe_nickname: string | null
          naver_cafe_verified: boolean | null
          naver_cafe_verified_at: string | null
          random_nickname: string | null
          randomnickname: string | null
          role: string | null
          target_income: string | null
          total_revenue: number | null
          updated_at: string | null
          username: string | null
          work_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          cafe_member_url?: string | null
          channel_name?: string | null
          channel_url?: string | null
          created_at?: string | null
          current_income?: string | null
          email: string
          experience_level?: string | null
          full_name?: string | null
          id: string
          job_category?: string | null
          naver_cafe_nickname?: string | null
          naver_cafe_verified?: boolean | null
          naver_cafe_verified_at?: string | null
          random_nickname?: string | null
          randomnickname?: string | null
          role?: string | null
          target_income?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          username?: string | null
          work_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          cafe_member_url?: string | null
          channel_name?: string | null
          channel_url?: string | null
          created_at?: string | null
          current_income?: string | null
          email?: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          job_category?: string | null
          naver_cafe_nickname?: string | null
          naver_cafe_verified?: boolean | null
          naver_cafe_verified_at?: string | null
          random_nickname?: string | null
          randomnickname?: string | null
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
          engagement_rate: number | null
          id: string
          like_count: number | null
          like_delta: number | null
          video_id: string
          view_count: number | null
          view_delta: number | null
          views_per_hour: number | null
          viral_score: number | null
        }
        Insert: {
          comment_count?: number | null
          comment_delta?: number | null
          created_at?: string | null
          date: string
          engagement_rate?: number | null
          id?: string
          like_count?: number | null
          like_delta?: number | null
          video_id: string
          view_count?: number | null
          view_delta?: number | null
          views_per_hour?: number | null
          viral_score?: number | null
        }
        Update: {
          comment_count?: number | null
          comment_delta?: number | null
          created_at?: string | null
          date?: string
          engagement_rate?: number | null
          id?: string
          like_count?: number | null
          like_delta?: number | null
          video_id?: string
          view_count?: number | null
          view_delta?: number | null
          views_per_hour?: number | null
          viral_score?: number | null
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
      videostats: {
        Row: {
          comments: number | null
          created_at: string | null
          dislikes: number | null
          favorites: number | null
          id: string
          likes: number | null
          recorded_at: string | null
          video_id: string
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string | null
          dislikes?: number | null
          favorites?: number | null
          id?: string
          likes?: number | null
          recorded_at?: string | null
          video_id: string
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string | null
          dislikes?: number | null
          favorites?: number | null
          id?: string
          likes?: number | null
          recorded_at?: string | null
          video_id?: string
          views?: number | null
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
      webhookevents: {
        Row: {
          channel_id: string | null
          created_at: string | null
          error: string | null
          event_type: string
          id: string
          payload: Json | null
          processed_at: string | null
          status: string | null
          video_id: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string | null
          error?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          processed_at?: string | null
          status?: string | null
          video_id?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string | null
          error?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          processed_at?: string | null
          status?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
      yl_approval_logs: {
        Row: {
          action: string
          channel_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          channel_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          channel_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      yl_batch_logs: {
        Row: {
          errors: string[] | null
          executed_at: string | null
          execution_time_ms: number | null
          function_name: string
          id: number
          processed_count: number | null
          success: boolean
        }
        Insert: {
          errors?: string[] | null
          executed_at?: string | null
          execution_time_ms?: number | null
          function_name: string
          id?: number
          processed_count?: number | null
          success: boolean
        }
        Update: {
          errors?: string[] | null
          executed_at?: string | null
          execution_time_ms?: number | null
          function_name?: string
          id?: number
          processed_count?: number | null
          success?: boolean
        }
        Relationships: []
      }
      yl_categories: {
        Row: {
          category_id: string
          color: string | null
          display_order: number | null
          icon: string | null
          is_active: boolean | null
          name_en: string
          name_ko: string
          parent_category: string | null
        }
        Insert: {
          category_id: string
          color?: string | null
          display_order?: number | null
          icon?: string | null
          is_active?: boolean | null
          name_en: string
          name_ko: string
          parent_category?: string | null
        }
        Update: {
          category_id?: string
          color?: string | null
          display_order?: number | null
          icon?: string | null
          is_active?: boolean | null
          name_en?: string
          name_ko?: string
          parent_category?: string | null
        }
        Relationships: []
      }
      yl_channel_daily_delta: {
        Row: {
          channel_id: string
          created_at: string
          date: string
          id: string
          subscriber_delta: number | null
          total_subscribers: number | null
          total_videos: number | null
          total_views: number | null
          video_delta: number | null
          view_delta: number | null
        }
        Insert: {
          channel_id: string
          created_at?: string
          date: string
          id?: string
          subscriber_delta?: number | null
          total_subscribers?: number | null
          total_videos?: number | null
          total_views?: number | null
          video_delta?: number | null
          view_delta?: number | null
        }
        Update: {
          channel_id?: string
          created_at?: string
          date?: string
          id?: string
          subscriber_delta?: number | null
          total_subscribers?: number | null
          total_videos?: number | null
          total_views?: number | null
          video_delta?: number | null
          view_delta?: number | null
        }
        Relationships: []
      }
      yl_channel_daily_snapshot: {
        Row: {
          avg_views_per_video: number | null
          channel_id: string
          created_at: string | null
          date: string
          shorts_count: number | null
          subscriber_count: number | null
          video_count: number | null
          view_count_total: number
        }
        Insert: {
          avg_views_per_video?: number | null
          channel_id: string
          created_at?: string | null
          date: string
          shorts_count?: number | null
          subscriber_count?: number | null
          video_count?: number | null
          view_count_total: number
        }
        Update: {
          avg_views_per_video?: number | null
          channel_id?: string
          created_at?: string | null
          date?: string
          shorts_count?: number | null
          subscriber_count?: number | null
          video_count?: number | null
          view_count_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "yl_channel_daily_snapshot_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "yl_channels"
            referencedColumns: ["channel_id"]
          },
        ]
      }
      yl_channels: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category: string | null
          channel_id: string
          country: string | null
          created_at: string | null
          description: string | null
          dominant_format: string | null
          format_stats: Json | null
          id: string
          language: string | null
          status: string | null
          subcategory: string | null
          subscriber_count: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_count: number | null
          view_count: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          channel_id: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          dominant_format?: string | null
          format_stats?: Json | null
          id?: string
          language?: string | null
          status?: string | null
          subcategory?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_count?: number | null
          view_count?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          channel_id?: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          dominant_format?: string | null
          format_stats?: Json | null
          id?: string
          language?: string | null
          status?: string | null
          subcategory?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_count?: number | null
          view_count?: number | null
        }
        Relationships: []
      }
      yl_trending_keywords: {
        Row: {
          channel_count: number | null
          count: number
          created_at: string | null
          date: string
          growth_rate: number | null
          keyword: string
          video_ids: string[] | null
        }
        Insert: {
          channel_count?: number | null
          count: number
          created_at?: string | null
          date: string
          growth_rate?: number | null
          keyword: string
          video_ids?: string[] | null
        }
        Update: {
          channel_count?: number | null
          count?: number
          created_at?: string | null
          date?: string
          growth_rate?: number | null
          keyword?: string
          video_ids?: string[] | null
        }
        Relationships: []
      }
      yl_user_follows: {
        Row: {
          channel_id: string
          created_at: string | null
          last_checked: string | null
          notification_enabled: boolean | null
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          last_checked?: string | null
          notification_enabled?: boolean | null
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          last_checked?: string | null
          notification_enabled?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yl_user_follows_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "yl_channels"
            referencedColumns: ["channel_id"]
          },
        ]
      }
      youtube_analysis_cache: {
        Row: {
          analysis_data: Json
          analysis_type: string
          channel_id: string | null
          confidence_score: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          metrics: Json | null
          processing_time: number | null
          updated_at: string | null
          video_id: string
        }
        Insert: {
          analysis_data: Json
          analysis_type: string
          channel_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metrics?: Json | null
          processing_time?: number | null
          updated_at?: string | null
          video_id: string
        }
        Update: {
          analysis_data?: Json
          analysis_type?: string
          channel_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metrics?: Json | null
          processing_time?: number | null
          updated_at?: string | null
          video_id?: string
        }
        Relationships: []
      }
      youtube_favorites: {
        Row: {
          channel_id: string | null
          channel_title: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
          video_description: string | null
          video_id: string
          video_thumbnail: string | null
          video_title: string | null
        }
        Insert: {
          channel_id?: string | null
          channel_title?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          video_description?: string | null
          video_id: string
          video_thumbnail?: string | null
          video_title?: string | null
        }
        Update: {
          channel_id?: string | null
          channel_title?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          video_description?: string | null
          video_id?: string
          video_thumbnail?: string | null
          video_title?: string | null
        }
        Relationships: []
      }
      youtube_search_history: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          query: string
          result_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          query: string
          result_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          query?: string
          result_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      schema_validation: {
        Row: {
          column_name: unknown | null
          data_type: string | null
          is_nullable: string | null
          table_name: string | null
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
