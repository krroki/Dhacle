// revenue-proof.ts
// 수익인증 API 클라이언트 함수

import { ApiError, apiDelete, apiGet, apiPost, apiPut } from '@/lib/api-client';
import type { CreateProofInput } from '@/lib/validations/revenue-proof';
import type { RevenueProof } from '@/types/revenue-proof';

// API 기본 URL
const API_BASE = '/api/revenue-proof';

// 인증 목록 조회
export async function getRevenueProofs(params?: {
  platform?: string;
  filter?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: RevenueProof[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}> {
  const searchParams = new URLSearchParams();

  if (params?.platform) searchParams.append('platform', params.platform);
  if (params?.filter) searchParams.append('filter', params.filter);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  try {
    return await apiGet<{
      data: RevenueProof[];
      pagination: {
        page: number;
        totalPages: number;
        total: number;
      };
    }>(`${API_BASE}?${searchParams.toString()}`);
  } catch (error) {
    console.error('Revenue proofs fetch error:', error);
    throw error;
  }
}

// 인증 상세 조회
export async function getRevenueProof(id: string) {
  return await apiGet(`${API_BASE}/${id}`);
}

// 인증 생성
export async function createRevenueProof(data: CreateProofInput) {
  const formData = new FormData();

  formData.append('title', data.title);
  formData.append('amount', data.amount.toString());
  formData.append('platform', data.platform);
  formData.append('content', data.content);
  formData.append('signature', data.signature);
  formData.append('screenshot', data.screenshot);

  const response = await fetch(API_BASE, {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
  });

  const result = await response.json();

  if (!response.ok) {
    return { error: result.error || 'Failed to create revenue proof', data: null };
  }

  return { error: null, data: result };
}

// 인증 수정 (24시간 내)
export async function updateRevenueProof(
  id: string,
  data: {
    title?: string;
    content?: string;
  }
) {
  return await apiPut(`${API_BASE}/${id}`, data);
}

// 인증 삭제
export async function deleteRevenueProof(id: string) {
  return await apiDelete(`${API_BASE}/${id}`);
}

// 좋아요 토글
export async function toggleLike(proofId: string) {
  return await apiPost(`${API_BASE}/${proofId}/like`);
}

// 댓글 작성
export async function createComment(
  proofId: string,
  content: string
): Promise<{
  id: string;
  proof_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}> {
  return await apiPost<{
    id: string;
    proof_id: string;
    user_id: string;
    content: string;
    created_at: string;
    user?: {
      id: string;
      username: string;
      avatar_url?: string;
    };
  }>(`${API_BASE}/${proofId}/comment`, { content });
}

// 신고하기
export async function reportProof(
  proofId: string,
  data: {
    reason: string;
    details?: string;
    acknowledged: boolean;
  }
) {
  return await apiPost(`${API_BASE}/${proofId}/report`, data);
}

// 랭킹 조회
export async function getRankings(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<{
  rankings: Array<{
    id: string;
    user_id: string;
    username: string;
    avatar_url?: string;
    total_amount: number;
    rank: number;
  }>;
}> {
  return await apiGet<{
    rankings: Array<{
      id: string;
      user_id: string;
      username: string;
      avatar_url?: string;
      total_amount: number;
      rank: number;
    }>;
  }>(`${API_BASE}/ranking?period=${period}`);
}

// 내 인증 목록
export async function getMyProofs() {
  return await apiGet(`${API_BASE}/my`);
}

// 이미지 업로드 헬퍼 함수
export async function uploadImage(
  file: File,
  bucket = 'revenue-proofs'
): Promise<{
  url: string;
  thumbnailUrl: string;
  blurDataUrl: string;
  path: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.error || 'Failed to upload image', 400);
  }

  return response.json();
}

// 이미지 삭제 헬퍼 함수
export async function deleteImage(path: string, bucket = 'revenue-proofs') {
  const params = new URLSearchParams({
    path,
    bucket,
  });

  const response = await fetch(`/api/upload?${params.toString()}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.error || 'Failed to delete image', 400);
  }

  return response.json();
}
