// 수익인증 상세 페이지

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { RevenueProofDetail } from '@/components/features/revenue-proof/RevenueProofDetail';
import type { Metadata } from 'next';
import type { RevenueProof } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 서버 컴포넌트로 초기 데이터 페치
export default async function RevenueProofDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const supabase = createServerComponentClient({ cookies });

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
  const currentUserId = session?.user?.id;

  // 좋아요 여부 확인
  let isLiked = false;
  if (currentUserId) {
    const { data: like } = await supabase
      .from('proof_likes')
      .select('*')
      .eq('proof_id', id)
      .eq('user_id', currentUserId)
      .single();

    isLiked = !!like;
  }

  const proofWithLike: RevenueProof & { isLiked: boolean; currentUserId?: string } = {
    ...proof,
    isLiked,
    currentUserId,
  };

  return (
    <div className="container-responsive py-8">
      <RevenueProofDetail initialData={proofWithLike} currentUserId={currentUserId} />
    </div>
  );
}

// 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServerComponentClient({ cookies });

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

  const platformMap: Record<string, string> = {
    youtube: 'YouTube',
    instagram: 'Instagram',
    tiktok: 'TikTok',
  };

  return {
    title: proof.title,
    description: `${platformMap[proof.platform] || proof.platform} 수익 ${proof.amount.toLocaleString()}원 인증`,
  };
}
