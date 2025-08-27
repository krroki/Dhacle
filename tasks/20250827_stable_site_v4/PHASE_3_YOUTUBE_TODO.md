/sc:implement --seq --validate --evidence --db-first --e2e
"Phase 3: YouTube Lens TODO 10개 해결 - 핵심 기능 작동"

# Phase 3: YouTube Lens TODO (10개)

## ⚠️ 3-Strike Rule
같은 파일 3번 수정 = 즉시 중단 → 근본 원인 파악 필수

## 🎯 목표
YouTube Lens 검색 → 분석 → 알림 설정까지 완전 작동

---

## 📋 TODO 목록 (우선순위순)

### 현재 TODO 파악
```bash
# YouTube Lens 관련 TODO 찾기
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | grep -i "youtube\|lens\|channel\|alert\|trending"
```

### 우선순위 TODO 10개
1. **YouTube 검색 API** (src/app/api/youtube/search/route.ts)
2. **채널 정보 조회** (src/app/api/youtube-lens/channels/route.ts)
3. **채널 승인 관리** (src/app/api/youtube-lens/admin/channels/[channelId]/route.ts)
4. **알림 규칙 설정** (src/app/api/youtube-lens/alert-rules/route.ts)
5. **트렌딩 요약** (src/app/api/youtube-lens/trending-summary/route.ts)
6. **즐겨찾기 관리** (src/app/api/youtube/favorites/route.ts)
7. **분석 로그 저장** (src/app/api/youtube-lens/analytics/route.ts)
8. **승인 로그 기록** (src/app/api/youtube-lens/admin/approval-logs/route.ts)
9. **AlertRules 컴포넌트** (src/components/features/tools/youtube-lens/AlertRules.tsx)
10. **YouTube Lens 페이지** (src/app/(pages)/tools/youtube-lens/page.tsx)

---

## 🔍 TODO 1: YouTube 검색 API

### 🎬 사용자 시나리오
```
1. 사용자가 검색어 입력: "프로그래밍"
2. → "검색" 버튼 클릭
3. → YouTube API 호출
4. → 결과 리스트 표시
5. → 채널 클릭 → 상세 정보
```

### ✅ 진행 조건
- [ ] YouTube API Key 확인
- [ ] yl_channels 테이블 확인
- [ ] 검색 결과 캐싱 전략

### 🔧 작업

#### Step 1: DB 구조 확인
```bash
# YouTube Lens 테이블들 확인
grep -n "yl_channels\|yl_alert_rules\|yl_trending" src/types/database.generated.ts
```

#### Step 2: 검색 API 구현
```typescript
// src/app/api/youtube/search/route.ts
// TODO 제거하고 실제 구현

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }
    
    // YouTube API 호출 (또는 모킹)
    const apiKey = process.env.YOUTUBE_API_KEY;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=channel&key=${apiKey}`
    );
    
    const data = await response.json();
    
    // DB에 저장 (선택)
    const supabase = await createSupabaseServerClient();
    
    return NextResponse.json({
      success: true,
      data: data.items || []
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 🧪 검증
```bash
# 브라우저 테스트
- [ ] YouTube Lens 페이지 접속
- [ ] 검색어 입력: "프로그래밍"
- [ ] 검색 버튼 클릭
- [ ] 결과 표시 확인
- [ ] Network 탭 확인
```

---

## 🔍 TODO 2: 채널 정보 조회

### 🎬 사용자 시나리오
```
1. 검색 결과에서 채널 클릭
2. → 채널 상세 정보 표시
3. → 구독자 수, 비디오 수 표시
4. → "분석 시작" 버튼 활성화
```

### 🔧 작업
```typescript
// src/app/api/youtube-lens/channels/route.ts
// TODO 제거하고 실제 구현

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    const { channelId, channelData } = await request.json();
    
    const supabase = await createSupabaseServerClient();
    
    // yl_channels 테이블에 저장
    const { data, error } = await supabase
      .from('yl_channels')
      .upsert({
        channel_id: channelId,
        channel_name: channelData.title,
        channel_handle: channelData.customUrl,
        subscriber_count: channelData.subscriberCount,
        video_count: channelData.videoCount,
        user_id: user.id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## 🔍 TODO 3: 채널 승인 관리 (관리자)

### 🎬 사용자 시나리오
```
1. 관리자 대시보드에서 채널 목록 확인
2. → "승인" 또는 "거절" 버튼 클릭
3. → approval_status 업데이트
4. → 승인 로그 기록
```

### 🔧 작업
```typescript
// src/app/api/youtube-lens/admin/channels/[channelId]/route.ts
// TODO 제거하고 실제 구현

export async function PUT(
  request: NextRequest,
  { params }: { params: { channelId: string } }
): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    const isAdmin = await checkAdminRole(user?.id);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { status, notes } = await request.json();
    const supabase = await createSupabaseServerClient();
    
    // 채널 상태 업데이트
    const { data, error } = await supabase
      .from('yl_channels')
      .update({
        approval_status: status,
        approved_by: user.id,
        approved_at: new Date().toISOString()
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
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## 🔍 TODO 4: 알림 규칙 설정

### 🎬 사용자 시나리오
```
1. 채널 선택 후 "알림 설정" 클릭
2. → 규칙 선택: "구독자 1000명 증가"
3. → 저장
4. → 규칙 목록에 표시
```

### 🔧 작업
```typescript
// src/app/api/youtube-lens/alert-rules/route.ts
// 알림 규칙 CRUD

// src/components/features/tools/youtube-lens/AlertRules.tsx
// UI 컴포넌트 완성
```

---

## 🔍 TODO 5-10: 나머지 기능

### 빠른 구현 체크리스트

#### TODO 5: 트렌딩 요약
```typescript
// 인기 채널 요약 데이터
// 캐싱 적용
```

#### TODO 6: 즐겨찾기
```typescript
// yl_favorites 테이블
// 사용자별 즐겨찾기
```

#### TODO 7: 분석 로그
```typescript
// yl_analytics 테이블
// 사용 패턴 추적
```

#### TODO 8: 승인 로그
```typescript
// yl_approval_logs 테이블
// 관리자 활동 기록
```

#### TODO 9: AlertRules 컴포넌트
```typescript
// 타입 에러 수정
// channel_id null 처리
```

#### TODO 10: 메인 페이지
```typescript
// 전체 플로우 통합
// 상태 관리
```

---

## ⛔ 즉시 중단 신호

1. **YouTube API Key 없음** → 모킹 데이터 사용
2. **테이블 없음** → SQL 작성 & 실행
3. **권한 오류** → RLS 정책 확인
4. **타입 불일치** → database.generated.ts 재생성

---

## 📋 Phase 3 완료 조건

```yaml
TODO_해결:
  - [ ] YouTube 검색 작동
  - [ ] 채널 정보 저장
  - [ ] 관리자 승인 프로세스
  - [ ] 알림 규칙 설정
  - [ ] 트렌딩 요약
  - [ ] 즐겨찾기 기능
  - [ ] 분석 로그 저장
  - [ ] 승인 로그 기록
  - [ ] AlertRules 컴포넌트
  - [ ] 메인 페이지 통합

E2E_테스트:
  - [ ] 검색 → 결과 → 상세
  - [ ] 알림 설정 → 저장
  - [ ] 관리자 승인 플로우
  - [ ] 즐겨찾기 추가/제거

증거:
  - [ ] 검색 결과 스크린샷
  - [ ] 알림 규칙 설정 영상
  - [ ] DB 데이터 확인
```

---

## → 다음 Phase

```bash
# Phase 3 완료 확인
- YouTube Lens TODO: 10개 해결
- 실제 작동: 확인됨

# Phase 4로 진행
cat PHASE_4_PAYMENT_TODO.md
```

---

*Phase 3: YouTube Lens TODO*
*핵심: 검색부터 알림까지 완전 작동*
*시간: 5시간 예상*