/sc:implement --seq --validate --evidence --db-first --e2e
"Phase 5: 나머지 TODO 10개 해결 - 완전한 사이트 완성"

# Phase 5: 나머지 TODO (10개)

## ⚠️ 3-Strike Rule
같은 파일 3번 수정 = 즉시 중단 → 근본 원인 파악 필수

## 🎯 목표
모든 TODO 제거, 100% 기능 작동하는 사이트 완성

---

## 📋 TODO 목록 (우선순위순)

### 현재 TODO 파악
```bash
# 남은 TODO 전체 확인
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | grep -v "auth\|profile\|youtube\|payment" | wc -l

# 카테고리별 분류
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | cut -d':' -f1 | sort | uniq
```

### 우선순위 TODO 10개
1. **수익 인증 생성** (src/app/api/revenue-proof/route.ts)
2. **수익 인증 이미지 업로드** (src/app/api/revenue-proof/upload/route.ts)
3. **수익 인증 공유** (src/app/api/revenue-proof/share/route.ts)
4. **분석 로그 수집** (src/app/api/analytics/log/route.ts)
5. **통계 대시보드** (src/app/api/analytics/stats/route.ts)
6. **알림 센터** (src/components/notifications/NotificationCenter.tsx)
7. **다크 모드 토글** (src/components/theme/ThemeToggle.tsx)
8. **언어 선택** (src/components/locale/LanguageSelector.tsx)
9. **푸터 링크** (src/components/layout/Footer.tsx)
10. **메타데이터 설정** (src/app/layout.tsx)

---

## 🔍 TODO 1-3: 수익 인증 시스템

### 🎬 사용자 시나리오
```
1. "수익 인증 작성" 클릭
2. → 제목, 금액, 설명 입력
3. → 이미지 업로드
4. → 저장
5. → 공유 링크 생성
6. → SNS 공유
```

### ✅ 진행 조건
- [ ] revenue_proofs 테이블 확인
- [ ] Supabase Storage 설정
- [ ] 공유 URL 패턴 정의

### 🔧 작업

#### TODO 1: 수익 인증 생성
```typescript
// src/app/api/revenue-proof/route.ts
// TODO 제거하고 실제 구현

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = revenueProofSchema.parse(body);
    
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('revenue_proofs')
      .insert({
        ...validatedData,
        user_id: user.id,
        share_id: generateShareId(), // 공유용 ID
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data,
      shareUrl: `/revenue-proof/${data.share_id}`
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

#### TODO 2: 이미지 업로드
```typescript
// src/app/api/revenue-proof/upload/route.ts
// Supabase Storage 활용

export async function POST(request: NextRequest): Promise<NextResponse> {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Supabase Storage에 업로드
  const { data, error } = await supabase.storage
    .from('revenue-proofs')
    .upload(`${user.id}/${Date.now()}.png`, file);
    
  return NextResponse.json({ url: data.publicUrl });
}
```

#### TODO 3: 공유 기능
```typescript
// 공유 URL 생성
// OG 메타태그 설정
// 공개/비공개 설정
```

### 🧪 검증
```bash
# E2E 테스트
- [ ] 수익 인증 작성 페이지
- [ ] 이미지 업로드 → 미리보기
- [ ] 저장 → DB 확인
- [ ] 공유 링크 → 접속 가능
```

---

## 🔍 TODO 4-5: 분석 시스템

### 🎬 사용자 시나리오
```
1. 사용자 행동 자동 추적
2. → analytics_logs 테이블 저장
3. → 통계 대시보드 표시
4. → 인사이트 제공
```

### 🔧 작업
```typescript
// src/app/api/analytics/log/route.ts
// 이벤트 로깅

// src/app/api/analytics/stats/route.ts
// 통계 집계 & 반환
```

---

## 🔍 TODO 6-10: UI/UX 개선

### 빠른 구현 체크리스트

#### TODO 6: 알림 센터
```typescript
// 실시간 알림
// 읽음/안읽음 상태
// 알림 설정
```

#### TODO 7: 다크 모드
```typescript
// next-themes 활용
// 시스템 설정 연동
// localStorage 저장
```

#### TODO 8: 언어 선택
```typescript
// i18n 기본 설정
// 한국어/영어
// 쿠키 저장
```

#### TODO 9: 푸터 링크
```typescript
// 이용약관
// 개인정보처리방침
// 문의하기
```

#### TODO 10: 메타데이터
```typescript
// SEO 최적화
// OG 태그
// 구조화된 데이터
```

---

## ⛔ 즉시 중단 신호

1. **TODO 주석 남기기** → 완전히 구현
2. **더미 데이터 반환** → 실제 데이터 사용
3. **하드코딩 값** → 환경변수 사용
4. **테스트 없이 완료** → 각 기능 E2E 테스트

---

## 📋 Phase 5 완료 조건

```yaml
TODO_해결:
  - [ ] 수익 인증 CRUD 완성
  - [ ] 이미지 업로드 작동
  - [ ] 공유 기능 구현
  - [ ] 분석 로그 수집
  - [ ] 통계 대시보드
  - [ ] 알림 센터
  - [ ] 다크 모드
  - [ ] 언어 선택
  - [ ] 푸터 완성
  - [ ] 메타데이터 설정

최종_확인:
  - [ ] TODO 검색: 0개
  - [ ] any 타입: 0개
  - [ ] console.log: 0개 (프로덕션)
  - [ ] 환경변수: 모두 설정

E2E_테스트:
  - [ ] 전체 사용자 플로우
  - [ ] 모든 페이지 접속
  - [ ] 모든 기능 작동
  - [ ] 에러 없음

증거:
  - [ ] 전체 기능 데모 영상
  - [ ] Lighthouse 점수
  - [ ] 빌드 성공 로그
```

---

## 🎉 프로젝트 완료

### 최종 체크리스트
```bash
# 코드 품질
npm run types:check  # 0 errors
npm run lint        # 0 warnings
npm run build       # success

# 실제 작동
npm run dev
- 모든 페이지 정상
- 모든 기능 작동
- Console 에러 0개

# 성능
- Lighthouse > 80
- 로드 시간 < 3초
- 번들 크기 < 500KB
```

### 배포 준비
```bash
# 환경변수 확인
- [ ] 모든 API Key 설정
- [ ] Supabase URL/Key
- [ ] 결제 관련 Key

# 보안 확인
- [ ] RLS 정책 활성화
- [ ] Rate Limiting 설정
- [ ] XSS/CSRF 방지

# 모니터링
- [ ] 에러 트래킹
- [ ] 성능 모니터링
- [ ] 사용자 분석
```

---

## → 프로젝트 완료!

```bash
# 최종 상태
- TODO: 0개 (41개 → 0개)
- 타입 에러: 0개
- 실제 작동: 100%
- 사용자 만족: 100%

# 축하합니다! 🎉
"실제로 안정적이게 사용 가능한 사이트" 완성!
```

---

*Phase 5: 나머지 TODO*
*핵심: 모든 TODO 제거, 완전한 사이트*
*시간: 4시간 예상*