/sc:implement --seq --validate --c7 --think --delegate files
"Phase 1: TODO 제거 및 핵심 기능 구현 - 실제로 작동하는 기능 만들기"

# Phase 1: 핵심 기능 구현

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인
- `/docs/CONTEXT_BRIDGE.md` 전체 읽기
- `/CLAUDE.md` 17-43행 자동 스크립트 금지
- 임시방편 해결책 금지 (TODO, 주석처리, 빈 배열 반환 금지)

## 📌 Phase 정보
- Phase 번호: 1/3
- 예상 시간: 2-3일
- 우선순위: 🔴 CRITICAL
- 선행 조건: Phase 0 완료 (타입 에러 해결)
- 목표: **TODO 0개, 모든 기능 실제 작동**

## 📚 온보딩 섹션

### 작업 관련 경로
- API Routes: `src/app/api/`
- React Query Hooks: `src/hooks/queries/`
- 컴포넌트: `src/components/features/`
- 더미 데이터: `src/lib/dummy-data/`

### 🔥 실제 코드 패턴 확인
```bash
# TODO 위치 확인 (41개)
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" -n

# API 클라이언트 패턴
grep -r "apiGet\|apiPost" src/hooks --include="*.ts" | head -5

# React Query 사용 패턴
grep -r "useQuery\|useMutation" src/hooks/queries --include="*.ts" | head -5

# Supabase 클라이언트 패턴
grep -r "createSupabaseServerClient" src/app/api --include="*.ts" | head -5
```

## 🎯 Phase 목표
1. 41개 TODO 주석 완전 제거
2. 더미 데이터를 실제 구현으로 교체
3. 모든 API Route 완전 구현
4. E2E 워크플로우 작동 확인

## 📝 작업 내용

### 1️⃣ 네이버 카페 인증 시스템 구현

#### 현재 상태
- TODO: 네이버 카페 인증 기능 구현 예정
- 파일: `src/app/api/user/naver-cafe/route.ts`

#### 구현 내용
```typescript
// src/app/api/user/naver-cafe/route.ts
// 31-33번 줄 TODO 제거 및 구현

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient() as SupabaseClient<Database>;
    const { cafeMemberUrl, cafeNickname } = await request.json();

    // URL 검증
    if (!isValidNaverCafeUrl(cafeMemberUrl)) {
      return NextResponse.json({ error: '유효한 네이버 카페 URL이 아닙니다' }, { status: 400 });
    }

    // 프로필 업데이트
    const { error } = await supabase
      .from('profiles')
      .update({
        cafe_member_url: cafeMemberUrl,
        naver_cafe_nickname: cafeNickname,
        naver_cafe_verified: false, // 관리자 검증 대기
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      logger.error('카페 인증 업데이트 실패:', error);
      return NextResponse.json({ error: '업데이트 실패' }, { status: 500 });
    }

    // 인증 요청 기록
    await supabase
      .from('naver_cafe_verifications')
      .insert({
        user_id: user.id,
        cafe_url: cafeMemberUrl,
        cafe_nickname: cafeNickname,
        status: 'pending'
      });

    return NextResponse.json({ 
      success: true,
      message: '인증 요청이 접수되었습니다. 관리자 검증을 기다려주세요.'
    });
  } catch (error) {
    logger.error('Naver cafe verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 2️⃣ YouTube Lens API 구현

#### TODO 제거 대상
- `src/app/api/youtube-lens/admin/channels/[channelId]/route.ts`
- `src/app/api/youtube-lens/admin/approval-logs/[channelId]/route.ts`
- `src/app/api/youtube-lens/trending-summary/route.ts`

#### 구현 예시 (channels API)
```typescript
// src/app/api/youtube-lens/admin/channels/[channelId]/route.ts

export async function PUT(
  request: NextRequest,
  { params }: { params: { channelId: string } }
): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();
    
    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status, notes } = body;

    // 채널 상태 업데이트
    const { data, error } = await supabase
      .from('yl_channels')
      .update({
        approval_status: status,
        approved_by: user.id,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('channel_id', params.channelId)
      .select()
      .single();

    if (error) throw error;

    // 승인 로그 기록
    await supabase
      .from('yl_approval_logs')
      .insert({
        channel_id: params.channelId,
        action: status,
        admin_id: user.id,
        notes
      });

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Channel update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { channelId: string } }
): Promise<NextResponse> {
  // 구현...
}
```

### 3️⃣ 프로필 페이지 TODO 제거

#### 파일: `src/app/mypage/profile/page.tsx`

```typescript
// 52-53번 줄 TODO 제거
// 이미 Phase 0에서 필드명 통일했으므로 직접 사용
const randomNickname = profile?.random_nickname || null;
const naverCafeVerified = profile?.naver_cafe_verified || false;

// 333-334번 줄 실제 데이터 표시
<div className="flex justify-between items-center">
  <span className="text-gray-600">랜덤 닉네임</span>
  <span className="font-medium">{randomNickname || '미설정'}</span>
</div>

// 372-380번 줄 네이버 카페 인증 상태 표시
{naverCafeVerified ? (
  <Badge className="bg-green-100 text-green-800">인증 완료</Badge>
) : (
  <Badge className="bg-yellow-100 text-yellow-800">미인증</Badge>
)}
```

### 4️⃣ 더미 데이터 실제 구현으로 교체

#### 수익 인증 데이터
```typescript
// src/app/api/revenue-proof/route.ts
// TODO 제거 및 실제 구현

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('revenue_proofs')
      .select('*, user:profiles(username, avatar_url)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    logger.error('Revenue proof fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 5️⃣ React Query Hook 구현

```typescript
// src/hooks/queries/useRevenueProofs.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';

export function useRevenueProofs(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['revenue-proofs', page, limit],
    queryFn: () => apiGet(`/api/revenue-proof?page=${page}&limit=${limit}`),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
```

## ✅ 완료 조건

### 🔴 필수 완료 조건

```bash
# 1. TODO 완전 제거
- [ ] grep -r "TODO" src/ | wc -l → 0개

# 2. 실제 작동 테스트
- [ ] npm run dev → http://localhost:3000
- [ ] 모든 페이지 정상 로드
- [ ] 브라우저 콘솔 에러 0개

# 3. API 응답 확인
- [ ] 모든 API Route → 200/201 응답
- [ ] 실제 데이터 반환 (더미 데이터 X)
- [ ] DB에 데이터 저장 확인

# 4. E2E 워크플로우 테스트
- [ ] 회원가입 → 로그인 → 프로필 설정 완료
- [ ] YouTube Lens 검색 → 결과 표시
- [ ] 수익 인증 작성 → 저장 → 목록 표시
```

## 📋 QA 테스트 시나리오

### 🔴 필수: 핵심 기능 E2E 테스트

```bash
# 1. 네이버 카페 인증 플로우
1. 프로필 페이지 접속
2. 네이버 카페 인증 섹션 클릭
3. URL 입력: https://cafe.naver.com/dinohighclass
4. 닉네임 입력
5. 제출 → "인증 요청 접수" 메시지 확인
6. DB 확인: profiles 테이블 cafe_member_url 저장됨

# 2. YouTube Lens 플로우
1. YouTube Lens 페이지 접속
2. 검색어 입력: "프로그래밍"
3. 검색 버튼 클릭
4. 결과 리스트 표시 확인
5. 채널 클릭 → 상세 정보 표시
6. 알림 규칙 설정 → 저장 확인

# 3. 수익 인증 플로우
1. 수익 인증 페이지 접속
2. "작성하기" 버튼 클릭
3. 폼 입력 (제목, 금액, 설명)
4. 이미지 업로드
5. 저장 → 목록에 표시 확인
6. 상세보기 → 공유 URL 복사
```

### 🟡 권장: 데이터 일관성 확인

```bash
# Supabase Dashboard에서 확인
1. profiles 테이블: 모든 필드 데이터 확인
2. yl_channels: 승인 상태 확인
3. revenue_proofs: 저장된 데이터 확인
4. analytics_logs: 이벤트 로깅 확인
```

## 🔄 병렬 처리 전략

```yaml
parallel_tasks:
  task_1: API Route 구현 (backend 팀)
  task_2: React Query Hook 구현 (frontend 팀)
  task_3: 컴포넌트 TODO 제거 (UI 팀)
  
coordination:
  - API 스펙 먼저 정의
  - Mock 데이터로 프론트 개발
  - 통합 테스트
```

## → 다음 Phase

Phase 1 완료 후 Phase 2로 진행:
```bash
cat PHASE_2_STABILITY.md
```

---
*Phase 1: 핵심 기능 구현*
*목표: 모든 기능이 실제로 작동하는 사이트*