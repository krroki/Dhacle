// revenue-proof.ts
// 수익인증 시스템 타입 정의

export interface RevenueProof {
  id: string;
  user_id: string;
  title: string;
  content: string; // TipTap JSON
  amount: number;
  platform: 'youtube' | 'instagram' | 'tiktok';
  screenshot_url: string;
  screenshot_blur?: string;
  signature_data: string;
  likes_count: number;
  comments_count: number;
  reports_count: number;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  likes?: ProofLike[];
  comments?: ProofComment[];
}

export interface ProofComment {
  id: string;
  proof_id: string;
  user_id: string;
  content: string;
  created_at: string;

  // Relations
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export interface ProofLike {
  id?: string;
  user_id: string;
  proof_id: string;
  created_at: string;
}

export interface ProofReport {
  id: string;
  proof_id: string;
  reporterId: string;
  reason: 'fake' | 'spam' | 'inappropriate' | 'copyright' | 'other';
  details?: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badgeType: string;
  badgeData?: Record<string, unknown>;
  earnedAt: string;
}

export interface MonthlyRanking {
  id: string;
  month: string;
  user_id: string;
  total_amount: number;
  rank: number;
  created_at: string;

  // Relations
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}
