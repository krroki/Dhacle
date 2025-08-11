/**
 * Course Detail Page Type Definitions
 * FastCampus/인프런 스타일 강의 상세 페이지를 위한 타입
 */

// 콘텐츠 블록 타입
export type ContentBlockType = 
  | 'heading' 
  | 'text' 
  | 'image' 
  | 'video' 
  | 'gif'
  | 'grid' 
  | 'divider' 
  | 'button' 
  | 'html' 
  | 'accordion';

// 기본 콘텐츠 블록
export interface BaseContentBlock {
  id: string;
  type: ContentBlockType;
  style?: Record<string, any>;
}

// 텍스트 블록
export interface TextBlock extends BaseContentBlock {
  type: 'heading' | 'text';
  content: string;
}

// 미디어 블록
export interface MediaBlock extends BaseContentBlock {
  type: 'image' | 'video' | 'gif';
  url: string;
  alt?: string;
  thumbnail?: string;
}

// 그리드 블록
export interface GridBlock extends BaseContentBlock {
  type: 'grid';
  columns: ContentBlock[][];
}

// 구분선 블록
export interface DividerBlock extends BaseContentBlock {
  type: 'divider';
}

// 버튼 블록
export interface ButtonBlock extends BaseContentBlock {
  type: 'button';
  content: string;
  url: string;
  variant?: 'primary' | 'secondary' | 'gradient';
}

// HTML 블록 (임베드용)
export interface HtmlBlock extends BaseContentBlock {
  type: 'html';
  content: string;
}

// 아코디언 아이템
export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

// 아코디언 블록
export interface AccordionBlock extends BaseContentBlock {
  type: 'accordion';
  items: AccordionItem[];
}

// 통합 콘텐츠 블록 타입
export type ContentBlock = 
  | TextBlock 
  | MediaBlock 
  | GridBlock 
  | DividerBlock 
  | ButtonBlock 
  | HtmlBlock 
  | AccordionBlock;

// 강의 레벨
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

// 확장된 강의 타입
export interface EnhancedCourse {
  id: string;
  title: string;
  description: string | null;
  instructor_name: string;
  thumbnail_url: string | null;
  badge_icon_url: string | null;
  duration_weeks: number;
  price: number;
  original_price: number | null;
  discount_rate: number;
  is_premium: boolean;
  chat_room_url: string | null;
  launch_date: string;
  status: 'upcoming' | 'active' | 'completed';
  max_students: number | null;
  
  // 새로운 필드들
  content_blocks: ContentBlock[];
  rating: number;
  student_count: number;
  category: string | null;
  level: CourseLevel | null;
  preview_video_url: string | null;
  learning_goals: string[];
  requirements: string[];
  tags: string[];
  
  created_at: string;
  updated_at: string;
}

// 리뷰 타입
export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  
  // 조인된 사용자 정보
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

// 탭 타입
export type CourseTab = 'intro' | 'curriculum' | 'reviews' | 'qna';

// 구매 정보 타입
export interface PurchaseInfo {
  price: number;
  original_price: number | null;
  discount_rate: number;
  benefits: string[];
  is_enrolled: boolean;
  enrollment_count: number;
  refund_policy: string;
}