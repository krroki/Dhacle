/**
 * Filter type definitions for various API endpoints
 * These types replace any types in query-keys and hooks
 */

export interface CommunityPostFilter {
  category?: string;
  dateRange?: { 
    start: Date; 
    end: Date; 
  };
  status?: 'published' | 'draft' | 'archived';
  sortBy?: 'latest' | 'popular' | 'views' | 'comments';
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  tags?: string[];
}

export interface RevenueProofFilter {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  minAmount?: number;
  maxAmount?: number;
  verified?: boolean;
  userId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'amount' | 'date' | 'verified';
  page?: number;
  limit?: number;
}

export interface YouTubeSearchFilter {
  query?: string;
  channelId?: string;
  maxResults?: number;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'viewCount';
  publishedAfter?: string;
  publishedBefore?: string;
  videoDuration?: 'short' | 'medium' | 'long';
  type?: 'video' | 'channel' | 'playlist';
  regionCode?: string;
  pageToken?: string;
}

export interface CourseFilter {
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  price?: {
    min?: number;
    max?: number;
  };
  duration?: {
    min?: number;
    max?: number;
  };
  sortBy?: 'popular' | 'newest' | 'price' | 'rating';
  page?: number;
  limit?: number;
  search?: string;
  instructorId?: string;
  status?: 'active' | 'draft' | 'archived';
}

export interface AdminUserFilter {
  role?: 'admin' | 'user' | 'moderator';
  status?: 'active' | 'inactive' | 'banned';
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
  sortBy?: 'created' | 'lastActive' | 'name' | 'email';
  page?: number;
  limit?: number;
}

export interface AdminLogFilter {
  action?: string;
  userId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  level?: 'info' | 'warning' | 'error' | 'critical';
  category?: string;
  page?: number;
  limit?: number;
}

export interface YouTubeFolderFilter {
  userId?: string;
  search?: string;
  sortBy?: 'name' | 'created' | 'updated' | 'channelCount';
  page?: number;
  limit?: number;
}

export interface NotificationFilter {
  userId?: string;
  read?: boolean;
  type?: 'info' | 'warning' | 'error' | 'success';
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  page?: number;
  limit?: number;
}

// Generic pagination filter for common use
export interface PaginationFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Export all filter types as a union for generic usage
export type ApiFilter = 
  | CommunityPostFilter
  | RevenueProofFilter
  | YouTubeSearchFilter
  | CourseFilter
  | AdminUserFilter
  | AdminLogFilter
  | YouTubeFolderFilter
  | NotificationFilter
  | PaginationFilter;