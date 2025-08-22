// 수익인증 상세 페이지

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RevenueProofDetail } from '@/components/features/revenue-proof/RevenueProofDetail';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import type { RevenueProof } from '@/types';

// 동적 페이지로 설정 (빌드 시 정적 생성 방지)
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 서버 컴포넌트로 초기 데이터 페치
export default async function RevenueProofDetailPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // 수익인증 상세 데이터 조회
  const { data: proof, error } = await supabase
    .from('revenue_proofs')
    .select(`
      *,
      user:profiles(
        id,
        username,
        avatar_url
      ),
      comments:proof_comments(
        id,
        content,
        created_at,
        user:profiles(
          id,
          username,
          avatar_url
        )
      )
    `)
    .eq('id', id)
    .eq('is_hidden', false)
    .single();

  if (error || !proof) {
    notFound();
  }

  // 현재 사용자 정보
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const current_user_id = session?.user?.id;

  // 좋아요 여부 확인
  let is_liked = false;
  if (current_user_id) {
    const { data: like } = await supabase
      .from('proof_likes')
      .select('*')
      .eq('proof_id', id)
      .eq('user_id', current_user_id)
      .single();

    is_liked = !!like;
  }

  const proof_with_like: RevenueProof & { isLiked: boolean; currentUserId?: string } = {
    ...proof,
    isLiked: is_liked,
    currentUserId: current_user_id,
  };

  return (
    <div className="container-responsive py-8">
      <RevenueProofDetail initialData={proof_with_like} currentUserId={current_user_id} />
    </div>
  );
}

// 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: proof } = await supabase
    .from('revenue_proofs')
    .select('title, amount, platform')
    .eq('id', id)
    .single();

  if (!proof) {
    return {
      title: '수익 인증 상세',
      description: '디하클 수익 인증 상세 페이지',
    };
  }

  const platform_map: Record<string, string> = {
    youtube: 'YouTube',
    instagram: 'Instagram',
    tiktok: 'TikTok',
  };

  return {
    title: proof.title,
    description: `${platform_map[proof.platform] || proof.platform} 수익 ${proof.amount.toLocaleString()}원 인증`,
  };
}
