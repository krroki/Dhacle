// 강의 시스템 타입 정의

export interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  instructor_id?: string;
  instructor_name: string;
  instructor?: InstructorProfile;
  thumbnail_url?: string;
  price: number;
  discount_price?: number;
  is_free: boolean;
  is_premium: boolean;
  content_blocks?: ContentBlock[] | string; // Can be JSON string or parsed array
  total_duration: number;
  student_count: number;
  average_rating: number;
  review_count: number;
  preview_video_url?: string;
  requirements?: string[];
  what_you_learn?: string[];
  target_audience?: string[];
  objectives?: string[]; // Learning objectives
  category?: string; // Course category
  level?: 'beginner' | 'intermediate' | 'advanced'; // Difficulty level
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; // Difficulty level (legacy)
  language?: string; // Course language
  tags?: string[]; // Course tags for categorization
  preview_enabled?: boolean; // Whether preview/trial is available
  status: 'upcoming' | 'active' | 'completed';
  launch_date: string;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration: number;
  order_index: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  course_id: string;
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string;
  amount: number;
  currency: string;
  coupon_id?: string;
  discount_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  refunded_at?: string;
  refund_reason?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  min_purchase_amount?: number;
  course_id?: string;
  usage_limit?: number;
  usage_count: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  progress: number; // 시청한 초
  completed: boolean;
  completed_at?: string;
  last_watched_at?: string;
  watch_count: number;
  notes?: string;
}

export interface CourseBadge {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  image_url?: string;
  type: 'completion' | 'perfect' | 'early_bird' | 'special' | 'milestone';
  completion_criteria: {
    type: string;
    value: number;
  };
  points: number;
  is_active: boolean;
}

export interface UserCertificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  certificate_url?: string;
  completion_rate: number;
  total_watch_time: number;
  metadata?: Record<string, unknown>;
}

export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface InstructorProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  specialty?: string;
  youtube_channel_url?: string;
  instagram_url?: string;
  total_students: number;
  average_rating: number;
  is_verified: boolean;
}

export interface ContentBlock {
  type: 'text' | 'image' | 'video' | 'code' | 'quote' | 'list';
  content: unknown;
  order: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  payment_id?: string;
  payment_status: string;
  payment_amount?: number;
  enrolled_at: string;
  completed_at?: string;
  certificate_issued: boolean;
  certificate_issued_at?: string;
  certificate_url?: string;
  is_active: boolean;
}

// API Response Types
export interface CourseListResponse {
  courses: Course[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CourseDetailResponse {
  course: Course;
  lessons: Lesson[];
  isEnrolled: boolean;
  isPurchased: boolean;
  progress?: CourseProgress[];
}

// Form Types
export interface CreateCourseInput {
  title: string;
  subtitle?: string;
  description: string;
  instructor_name: string;
  price: number;
  is_free: boolean;
  requirements: string[];
  what_you_learn: string[];
  target_audience: string[];
}

export interface CreateLessonInput {
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  duration: number;
  order_index: number;
  is_free: boolean;
}

// Filter Types
export interface CourseFilters {
  instructor?: string;
  price_range?: [number, number];
  is_free?: boolean;
  rating?: number;
  duration?: 'short' | 'medium' | 'long';
  status?: 'upcoming' | 'active' | 'completed';
  search?: string;
}

// Payment Types
export interface PaymentIntentInput {
  courseId: string;
  couponCode?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  discountAmount: number;
}