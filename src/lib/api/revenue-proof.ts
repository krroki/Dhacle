// revenue-proof.ts
// 수익인증 API 클라이언트 함수

import { ApiError, apiDelete, apiGet, apiPost, apiPut, apiUpload } from '@/lib/api-client';
import type { CreateProofInput } from '@/lib/validations/revenue-proof';
import type { RevenueProof } from '@/types';

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
  const search_params = new URLSearchParams();

  if (params?.platform) {
    search_params.append('platform', params.platform);
  }
  if (params?.filter) {
    search_params.append('filter', params.filter);
  }
  if (params?.page) {
    search_params.append('page', params.page.toString());
  }
  if (params?.limit) {
    search_params.append('limit', params.limit.toString());
  }
  return await apiGet<{
    data: RevenueProof[];
    pagination: {
      page: number;
      totalPages: number;
      total: number;
    };
  }>(`${API_BASE}?${search_params.toString()}`);
}

// 인증 상세 조회
export async function getRevenueProof(id: string) {
  return await apiGet(`${API_BASE}/${id}`);
}

// 인증 생성
export async function createRevenueProof(data: CreateProofInput) {
  const form_data = new FormData();

  form_data.append('title', data.title);
  form_data.append('amount', data.amount.toString());
  form_data.append('platform', data.platform);
  form_data.append('content', data.content);
  form_data.append('signature', data.signature);
  form_data.append('screenshot', data.screenshot);

  try {
    const result = await apiUpload<RevenueProof>(API_BASE, form_data);
    return { error: null, data: result };
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message, data: null };
    }
    return { error: 'Failed to create revenue proof', data: null };
  }
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
export async function toggleLike(proof_id: string) {
  return await apiPost(`${API_BASE}/${proof_id}/like`);
}

// 댓글 작성
export async function createComment(
  proof_id: string,
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
  }>(`${API_BASE}/${proof_id}/comment`, { content });
}

// 신고하기
export async function reportProof(
  proof_id: string,
  data: {
    reason: string;
    details?: string;
    acknowledged: boolean;
  }
) {
  return await apiPost(`${API_BASE}/${proof_id}/report`, data);
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
  thumbnail_url: string;
  blurDataUrl: string;
  path: string;
}> {
  const form_data = new FormData();
  form_data.append('file', file);
  form_data.append('bucket', bucket);

  const result = await apiUpload<{
    url: string;
    path: string;
    bucket: string;
  }>('/api/upload', form_data);

  // 필수 필드 추가
  return {
    ...result,
    thumbnail_url: result.url,
    blurDataUrl: '',
  };
}

// 이미지 삭제 헬퍼 함수
export async function deleteImage(path: string, bucket = 'revenue-proofs') {
  const params = new URLSearchParams({
    path,
    bucket,
  });

  return await apiDelete(`/api/upload?${params.toString()}`);
}
