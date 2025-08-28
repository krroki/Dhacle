// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';

// GET: YouTube 카테고리 목록 조회
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(request);
  if (!user) {
    logger.warn('Unauthorized access attempt to YouTube Lens Categories API');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const supabase = await createSupabaseRouteHandlerClient();

  try {
    // yl_channels 테이블에서 사용 중인 카테고리들을 조회 (dynamic categories)
    const { data: channelData, error } = await supabase
      .from('yl_channels')
      .select('category')
      .not('category', 'is', null);

    if (error) throw error;

    // 고유한 카테고리 목록 생성
    const uniqueCategories = Array.from(
      new Set(channelData?.map(item => item.category).filter(Boolean))
    );

    // YouTube 기본 카테고리 + 채널에서 사용 중인 카테고리
    const defaultCategories = [
      { categoryId: '1', nameKo: '영화/애니메이션', nameEn: 'Film & Animation' },
      { categoryId: '2', nameKo: '자동차', nameEn: 'Autos & Vehicles' },
      { categoryId: '10', nameKo: '음악', nameEn: 'Music' },
      { categoryId: '15', nameKo: '반려동물', nameEn: 'Pets & Animals' },
      { categoryId: '17', nameKo: '스포츠', nameEn: 'Sports' },
      { categoryId: '19', nameKo: '여행/이벤트', nameEn: 'Travel & Events' },
      { categoryId: '20', nameKo: '게임', nameEn: 'Gaming' },
      { categoryId: '22', nameKo: '인물/블로그', nameEn: 'People & Blogs' },
      { categoryId: '23', nameKo: '코미디', nameEn: 'Comedy' },
      { categoryId: '24', nameKo: '엔터테인먼트', nameEn: 'Entertainment' },
      { categoryId: '25', nameKo: '뉴스/정치', nameEn: 'News & Politics' },
      { categoryId: '26', nameKo: '노하우/스타일', nameEn: 'Howto & Style' },
      { categoryId: '27', nameKo: '교육', nameEn: 'Education' },
      { categoryId: '28', nameKo: '과학기술', nameEn: 'Science & Technology' }
    ];

    // 기본 카테고리와 사용 중인 카테고리 병합
    const allCategories = [...defaultCategories];
    
    // 사용 중인 카테고리 중 기본 카테고리에 없는 것들 추가
    uniqueCategories.forEach(category => {
      if (category && !defaultCategories.find(def => def.nameKo === category || def.nameEn === category)) {
        allCategories.push({
          categoryId: `custom_${category}`,
          nameKo: category,
          nameEn: category
        });
      }
    });

    const categories = allCategories.map((category, index) => ({
      ...category,
      parentCategory: null,
      icon: null,
      color: null,
      displayOrder: index + 1,
      isActive: true,
    }));

    return NextResponse.json({ data: categories });
  } catch (error: unknown) {
    console.error('Categories GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}