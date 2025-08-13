# 📍 메인 페이지 수익 인증 갤러리 통합 지시서

## 0️⃣ 프로젝트 컨텍스트

**프로젝트 정보**
- 프로젝트명: 디하클 (Dhacle)
- 프로젝트 경로: C:\My_Claude_Project\9.Dhacle
- 주요 기술: Next.js 15.4.6, TypeScript (strict mode), Supabase, Tailwind CSS, shadcn/ui
- 현재 Phase: 메인 페이지 구현 완료, 수익 인증 시스템 수정 중

**작업 범위**
- 위치: 메인 페이지 (`/`) 내 수익 인증 섹션
- 대체 대상: 현재 RevenueGallery 플레이스홀더 컴포넌트
- 통합 방식: 실제 수익 인증 시스템 연동

## 1️⃣ 작업 개요

### 작업 복잡도
- **작업 유형**: 컴포넌트 통합 및 API 연동
- **복잡도**: simple (2-3시간)
- **우선순위**: 🟡 중요 (메인 페이지 핵심 기능)

### SuperClaude 명령어
```bash
/sc:implement --seq --validate --c7
# 작업: 메인 페이지 수익 인증 갤러리 통합
# 위치: /app/page.tsx, /components/features/home/RevenueGallery
```

## 2️⃣ 현재 상태 분석

### 현재 파일 구조
```
src/app/page.tsx (메인 페이지)
├── HeroCarousel (28-43줄)
├── RevenueGallery (44-59줄) ← 수정 대상
├── FreeCoursesCarousel
├── FreeCoursesSchedule
├── NewCoursesCarousel
├── EbookSection
├── InstructorCategories
└── FAQSection
```

### 현재 RevenueGallery 컴포넌트
- 위치: `/components/features/home/RevenueGallery`
- 상태: 플레이스홀더 또는 더미 데이터 사용 중
- 문제: 실제 수익 인증 시스템과 연동되지 않음

## 3️⃣ 구현 명세

### Phase 1: RevenueGallery 컴포넌트 재구현

#### 1.1 새로운 RevenueGallery 컴포넌트
**`/components/features/home/RevenueGallery/index.tsx`**
```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, TrendingUp, Award, Users } from 'lucide-react';
import { getRevenueProofs } from '@/lib/api/revenue-proof';
import type { RevenueProof } from '@/types/revenue-proof';

export function RevenueGallery() {
  const [proofs, setProofs] = useState<RevenueProof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecentProofs();
  }, []);

  const loadRecentProofs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 최신 수익 인증 6개만 가져오기
      const result = await getRevenueProofs({
        filter: 'weekly', // 이번 주 인증만
        limit: 6,
        page: 1
      });
      
      if (result.data) {
        setProofs(result.data);
      }
    } catch (err) {
      console.error('Failed to load revenue proofs:', err);
      setError('수익 인증을 불러올 수 없습니다.');
      setProofs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 플랫폼 아이콘
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return '🎬';
      case 'instagram':
        return '📷';
      case 'tiktok':
        return '🎵';
      default:
        return '📱';
    }
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="container-responsive">
        {/* 섹션 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              실시간 수익 인증
            </h2>
            <p className="text-muted-foreground">
              투명한 수익 공개로 함께 성장하는 커뮤니티
            </p>
          </div>
          
          <Link href="/revenue-proof">
            <Button variant="outline" className="mt-4 sm:mt-0">
              전체 보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center p-4">
              <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">이번 주 총 수익</p>
                <p className="text-xl font-bold">
                  {formatAmount(proofs.reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <Award className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">최고 수익</p>
                <p className="text-xl font-bold">
                  {proofs.length > 0 
                    ? formatAmount(Math.max(...proofs.map(p => p.amount)))
                    : '₩0'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">참여자</p>
                <p className="text-xl font-bold">{proofs.length}명</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 수익 인증 그리드 */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-40 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">{error}</p>
              <Button 
                variant="outline" 
                onClick={loadRecentProofs}
                className="mt-4"
              >
                다시 시도
              </Button>
            </CardContent>
          </Card>
        ) : proofs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                아직 수익 인증이 없습니다
              </h3>
              <p className="text-muted-foreground mb-4">
                첫 번째 수익 인증자가 되어보세요!
              </p>
              <Link href="/revenue-proof/create">
                <Button>수익 인증하기</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {proofs.map((proof) => (
              <Link 
                key={proof.id} 
                href={`/revenue-proof/${proof.id}`}
                className="group"
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    {/* 스크린샷 썸네일 */}
                    <div className="relative aspect-video mb-4 overflow-hidden rounded-lg bg-muted">
                      {proof.screenshot_url ? (
                        <img
                          src={proof.screenshot_url}
                          alt={proof.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-4xl">
                            {getPlatformIcon(proof.platform)}
                          </span>
                        </div>
                      )}
                      
                      {/* 플랫폼 뱃지 */}
                      <Badge 
                        className="absolute top-2 left-2"
                        variant="secondary"
                      >
                        {proof.platform}
                      </Badge>
                    </div>

                    {/* 정보 */}
                    <h3 className="font-semibold line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                      {proof.title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-green-600">
                        {formatAmount(proof.amount)}
                      </span>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>❤️ {proof.likes_count || 0}</span>
                        <span>💬 {proof.comments_count || 0}</span>
                      </div>
                    </div>

                    {/* 작성자 정보 */}
                    {proof.user && (
                      <div className="mt-3 pt-3 border-t flex items-center gap-2">
                        {proof.user.avatar_url && (
                          <img
                            src={proof.user.avatar_url}
                            alt={proof.user.username}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {proof.user.username}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* 더보기 CTA */}
        {proofs.length > 0 && (
          <div className="text-center mt-8">
            <Link href="/revenue-proof">
              <Button size="lg" variant="outline">
                더 많은 수익 인증 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
```

### Phase 2: API 클라이언트 확인 및 수정

#### 2.1 API 클라이언트 생성 (없는 경우)
**`/lib/api/revenue-proof.ts`**
```typescript
import { createBrowserClient } from '@/lib/supabase/browser-client';
import type { RevenueProof } from '@/types/revenue-proof';

interface GetRevenueProofsParams {
  platform?: 'youtube' | 'instagram' | 'tiktok';
  filter?: 'all' | 'daily' | 'weekly' | 'monthly';
  page?: number;
  limit?: number;
}

interface GetRevenueProofsResponse {
  data: RevenueProof[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getRevenueProofs(
  params: GetRevenueProofsParams = {}
): Promise<GetRevenueProofsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.platform) searchParams.append('platform', params.platform);
  if (params.filter) searchParams.append('filter', params.filter);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  
  const response = await fetch(`/api/revenue-proof?${searchParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch revenue proofs');
  }
  
  return response.json();
}
```

### Phase 3: 메인 페이지 수정

#### 3.1 메인 페이지 업데이트
**`/app/page.tsx`** (변경 사항만)
```typescript
// 28-43줄: RevenueGallery 섹션 수정
{/* Revenue Gallery Section */}
<Suspense 
  fallback={
    <div className="py-12 bg-muted/30">
      <div className="container-responsive">
        <div className="mb-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  }
>
  <RevenueGallery />
</Suspense>
```

## 4️⃣ 테스트 시나리오

### 필수 테스트 체크리스트
```typescript
describe('메인 페이지 수익 인증 갤러리', () => {
  test('초기 로드 시 최신 6개 표시', async () => {
    // 메인 페이지 접속
    // RevenueGallery 섹션 확인
    // 수익 인증 카드 6개 이하 표시 확인
  });

  test('API 에러 시 에러 상태 표시', async () => {
    // API 실패 시뮬레이션
    // 에러 메시지 표시 확인
    // 재시도 버튼 작동 확인
  });

  test('데이터 없을 때 Empty State', async () => {
    // 빈 응답 시뮬레이션
    // "아직 수익 인증이 없습니다" 메시지 확인
    // "수익 인증하기" 버튼 확인
  });

  test('통계 카드 정확성', async () => {
    // 총 수익 합계 검증
    // 최고 수익 검증
    // 참여자 수 검증
  });

  test('전체 보기 링크 작동', async () => {
    // "전체 보기" 클릭
    // /revenue-proof 페이지로 이동 확인
  });
});
```

## 5️⃣ 성능 최적화

### 캐싱 전략
```typescript
// React Query 사용 시 (선택적)
const { data, error, isLoading } = useQuery({
  queryKey: ['revenue-proofs', 'home'],
  queryFn: () => getRevenueProofs({ filter: 'weekly', limit: 6 }),
  staleTime: 60 * 1000, // 1분
  cacheTime: 5 * 60 * 1000, // 5분
});
```

### 이미지 최적화
- lazy loading 적용
- blur placeholder 사용 (가능한 경우)
- 적절한 썸네일 크기 사용

## 6️⃣ 검증 체크리스트

### 기능 검증
- [ ] 실제 API 데이터 표시
- [ ] 로딩 상태 표시
- [ ] 에러 처리 및 재시도
- [ ] Empty state 표시
- [ ] 통계 카드 정확성
- [ ] 링크 작동 확인

### 코드 품질
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 없음
- [ ] 더미 데이터 미사용
- [ ] shadcn/ui 컴포넌트 사용

### 성능
- [ ] 초기 로드 < 1초
- [ ] 이미지 lazy loading
- [ ] 적절한 캐싱

## 7️⃣ 예상 결과

### 구현 후 효과
- ✅ 메인 페이지에 실시간 수익 인증 표시
- ✅ 실제 데이터 기반 동적 콘텐츠
- ✅ 사용자 참여 유도 (CTA)
- ✅ 커뮤니티 활성화 지표 표시

### 사용자 경험 개선
- 메인 페이지에서 즉시 수익 인증 확인
- 투명한 수익 공개 문화 강조
- 쉬운 참여 유도 (수익 인증하기 버튼)

---

**작업 담당자**: Developer AI
**예상 소요 시간**: 2-3시간
**우선순위**: 🟡 중요

*이 지시서는 메인 페이지의 수익 인증 갤러리 통합을 위한 것입니다.*
*실제 API 연동과 사용자 경험 최적화가 핵심입니다.*