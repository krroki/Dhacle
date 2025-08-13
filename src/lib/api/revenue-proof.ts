// revenue-proof.ts
// 수익인증 API 클라이언트 함수

import type { RevenueProof } from '@/types/revenue-proof';
import type { CreateProofInput } from '@/lib/validations/revenue-proof';

// API 기본 URL
const API_BASE = '/api/revenue-proof';

// 인증 목록 조회
export async function getRevenueProofs(params?: {
  platform?: string;
  filter?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  
  if (params?.platform) searchParams.append('platform', params.platform);
  if (params?.filter) searchParams.append('filter', params.filter);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const response = await fetch(`${API_BASE}?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch revenue proofs');
  }
  
  return response.json();
}

// 인증 상세 조회
export async function getRevenueProof(id: string) {
  const response = await fetch(`${API_BASE}/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch revenue proof');
  }
  
  return response.json();
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
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    return { error: result.error || 'Failed to create revenue proof', data: null };
  }
  
  return { error: null, data: result };
}

// 인증 수정 (24시간 내)
export async function updateRevenueProof(id: string, data: {
  title?: string;
  content?: string;
}) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update revenue proof');
  }
  
  return response.json();
}

// 인증 삭제
export async function deleteRevenueProof(id: string) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete revenue proof');
  }
  
  return response.json();
}

// 좋아요 토글
export async function toggleLike(proofId: string) {
  const response = await fetch(`${API_BASE}/${proofId}/like`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to toggle like');
  }
  
  return response.json();
}

// 댓글 작성
export async function createComment(proofId: string, content: string) {
  const response = await fetch(`${API_BASE}/${proofId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create comment');
  }
  
  return response.json();
}

// 신고하기
export async function reportProof(proofId: string, data: {
  reason: string;
  details?: string;
  acknowledged: boolean;
}) {
  const response = await fetch(`${API_BASE}/${proofId}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to report proof');
  }
  
  return response.json();
}

// 랭킹 조회
export async function getRankings(period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
  const response = await fetch(`${API_BASE}/ranking?period=${period}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch rankings');
  }
  
  return response.json();
}

// 내 인증 목록
export async function getMyProofs() {
  const response = await fetch(`${API_BASE}/my`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch my proofs');
  }
  
  return response.json();
}

// 이미지 업로드 헬퍼 함수
export async function uploadImage(file: File, bucket: string = 'revenue-proofs'): Promise<{
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
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }
  
  return response.json();
}

// 이미지 삭제 헬퍼 함수
export async function deleteImage(path: string, bucket: string = 'revenue-proofs') {
  const params = new URLSearchParams({
    path,
    bucket
  });
  
  const response = await fetch(`/api/upload?${params.toString()}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete image');
  }
  
  return response.json();
}