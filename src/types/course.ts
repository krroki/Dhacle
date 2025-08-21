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
  isPremium: boolean;
  contentBlocks?: ContentBlock[] | string; // Can be JSON string or parsed array
  total_duration: number;
  student_count: number;
  average_rating: number;
  reviewCount: number;
  previewVideoUrl?: string;
  requirements?: string[];
  whatYouLearn?: string[];
  targetAudience?: string[];
  objectives?: string[]; // Learning objectives
  category?: string; // Course category
  level?: 'beginner' | 'intermediate' | 'advanced'; // Difficulty level
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; // Difficulty level (legacy)
  language?: string; // Course language
  tags?: string[]; // Course tags for categorization
  previewEnabled?: boolean; // Whether preview/trial is available
  status: 'upcoming' | 'active' | 'completed';
  launchDate: string;
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
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  amount: number;
  currency: string;
  couponId?: string;
  discountAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  refundedAt?: string;
  refundReason?: string;
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
  minPurchaseAmount?: number;
  course_id?: string;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validUntil?: string;
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
  watchCount: number;
  notes?: string;
}

export interface CourseBadge {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  type: 'completion' | 'perfect' | 'early_bird' | 'special' | 'milestone';
  completionCriteria: {
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
  certificateNumber: string;
  issuedAt: string;
  certificateUrl?: string;
  completion_rate: number;
  totalWatchTime: number;
  metadata?: Record<string, unknown>;
}

export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
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
  youtubeChannelUrl?: string;
  instagramUrl?: string;
  totalStudents: number;
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
  paymentAmount?: number;
  enrolledAt: string;
  completed_at?: string;
  certificateIssued: boolean;
  certificateIssuedAt?: string;
  certificateUrl?: string;
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
  is_enrolled: boolean;
  is_purchased: boolean;
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
  whatYouLearn: string[];
  targetAudience: string[];
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
  priceRange?: [number, number];
  is_free?: boolean;
  rating?: number;
  duration?: 'short' | 'medium' | 'long';
  status?: 'upcoming' | 'active' | 'completed';
  search?: string;
}

// Payment Types
export interface PaymentIntentInput {
  course_id: string;
  couponCode?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  discountAmount: number;
}
