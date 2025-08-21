# 🎯 AI 개발 지시서 작성 가이드 v12.2

**📌 이 문서의 목적**: 개발 지식이 없는 사용자의 요청을 받은 AI가, 다른 AI에게 전달할 **명확하고 품질이 보증된 지시서를 작성하는 방법**을 안내합니다.

**🤖 당신(AI)의 역할**: 
1. 사용자의 의도를 정확히 파악
2. 프로젝트 구조를 이해
3. 필요한 파일과 정보를 찾아서
4. 실행 AI가 100% 의도대로 구현할 수 있는 지시서 작성
5. **🆕 사용자 경험을 검증할 수 있는 테스트 시나리오 포함**

---

## 🆕 지시서 표준 템플릿 (v12.1 필수 구조)

**모든 지시서는 다음 구조를 필수로 포함해야 합니다:**

```markdown
# [지시서 제목]

## 🚀 추천 실행 명령어
```bash
# 복잡도: [Simple/Moderate/Complex]
/sc:[command] --[flags]
"[구체적 실행 지시]"

# 빠른 실행 (선택)
/sc:[alt-command] --[간단플래그]
```

## 📚 온보딩 섹션 (필수)
### 필수 읽기 문서
- [ ] `/CLAUDE.md` - AI 작업 지침 (15-30행, 54-71행 필수)
- [ ] `/docs/[관련문서].md` - [읽어야 할 이유]
- [ ] 실제 파일 경로와 행 번호 명시

### 프로젝트 컨텍스트
```bash
# 기술 스택 확인
cat package.json | grep -A 5 "dependencies"

# 프로젝트 구조 확인
ls -la src/
```

### 작업 관련 핵심 정보
- 프레임워크: Next.js 14 (App Router)
- 데이터베이스: Supabase
- 스타일링: Tailwind CSS
- [작업에 필요한 추가 정보]

## 📌 목적
[지시서의 목적 설명]

## 🤖 실행 AI 역할
[AI가 수행할 역할 명세]

[이하 6단계 프로세스...]
```

---

## 🚫 절대 금지사항 (Claude Code 나쁜 습관)

1. **추측하지 마세요** → 실제 파일을 확인하고 작성하세요
2. **대충 넘기지 마세요** → 모든 단계를 구체적으로 작성하세요
3. **추상적으로 쓰지 마세요** → "[파일 경로]"가 아니라 실제 경로를 찾아 쓰세요
4. **생략하지 마세요** → "..." 대신 전체 코드를 포함하세요
5. **거짓말하지 마세요** → 모르면 "확인 필요"라고 쓰세요

---

## 📋 지시서 작성 7단계 프로세스 (v12.1 강화)

### Step 0: SuperClaude 명령어 결정 & 프로젝트 학습 (v12.1 신규)

#### 0.1 작업 유형별 명령어 매핑
```markdown
| 작업 유형 | 추천 명령어 | 필수 플래그 | 선택 플래그 |
|---------|------------|------------|------------|
| 버그 수정 | /sc:troubleshoot | --seq --validate | --think |
| UI 개선 | /sc:improve | --magic --c7 | --validate |
| 기능 추가 | /sc:implement | --seq --validate | --c7 --think |
| 검증/감사 | /sc:analyze | --seq --validate | --ultrathink --delegate |
| 리팩토링 | /sc:improve | --seq --think | --validate |
| 문서 작성 | /sc:document | --persona-scribe | --c7 |

**복잡도 기반 플래그 선택:**
- Simple (< 3 파일): `--validate`
- Moderate (3-10 파일): `--seq --think --validate`
- Complex (> 10 파일): `--seq --ultrathink --delegate files --validate`
- Enterprise (전체 시스템): `--seq --ultrathink --all-mcp --wave-mode`
```

#### 0.2 프로젝트 컨텍스트 학습 (필수)
```bash
# 1. 핵심 문서 확인
cat /CLAUDE.md | head -100  # AI 작업 지침
cat /docs/PROJECT.md | grep -A 10 "현재"  # 프로젝트 현황
cat /docs/CODEMAP.md | head -50  # 프로젝트 구조

# 2. 기술 스택 파악
cat package.json | grep -A 10 "dependencies"
cat tsconfig.json | grep -A 5 "compilerOptions"

# 3. 작업 영역 구조 확인
ls -la src/app/(pages)/[작업영역]/
ls -la src/components/[관련폴더]/
ls -la src/app/api/[관련API]/

# 4. 타입 시스템 확인
cat src/types/index.ts | grep "export"
```

#### 0.3 온보딩 섹션 자동 생성
```markdown
## 📚 온보딩 섹션 (실행 AI 필수 학습)

### 필수 읽기 문서
- [ ] `/CLAUDE.md` 10-71행 - AI 필수 수칙 및 금지사항
- [ ] `/CLAUDE.md` 143-302행 - TypeScript 타입 관리 시스템
- [ ] `/docs/PROJECT.md` - 현재 이슈 및 주의사항
- [ ] `/docs/[작업관련].md` - [구체적 이유]

### 작업 전 필수 확인
```bash
# 1. 빌드 상태 확인
npm run build

# 2. 타입 체크
npm run types:check

# 3. 관련 테이블 확인
node scripts/verify-with-service-role.js | grep [테이블명]
```

### 작업 관련 경로
- 페이지: `src/app/(pages)/[경로]/page.tsx`
- 컴포넌트: `src/components/[경로]/`
- API: `src/app/api/[경로]/route.ts`
- 타입: `src/types/index.ts`
```

### Step 1: 사용자 요청 분석 (Understanding)

**이렇게 분석하세요:**
```markdown
사용자 요청: "배포 사이트 /tools/youtube-lens 컬렉션 버그"

분석 결과:
- 문제 위치: /tools/youtube-lens 페이지
- 문제 기능: 컬렉션 (collections)
- 문제 유형: 버그 (동작 오류)
- 추가 정보 필요: 구체적인 버그 증상
```

### Step 2: 프로젝트 구조 파악 (Discovery)

**이렇게 찾으세요:**
```bash
# 1. 페이지 파일 찾기
ls -la src/app/(pages)/tools/youtube-lens/
# → page.tsx, layout.tsx 등 확인

# 2. 관련 컴포넌트 찾기
grep -r "collection" src/app/(pages)/tools/youtube-lens/ --include="*.tsx"
# → CollectionList.tsx, CollectionCard.tsx 등 발견

# 3. API 라우트 찾기
ls -la src/app/api/youtube/
# → collections/route.ts 확인

# 4. 타입 정의 찾기
grep -r "Collection" src/types/ --include="*.ts"
# → Collection 타입 정의 위치 확인
```

### Step 3: 필수 확인 사항 정리 (Gathering)

**이렇게 정리하세요:**
```markdown
필수 확인 파일 (실제 경로):
1. 페이지: src/app/(pages)/tools/youtube-lens/page.tsx
2. 컴포넌트: src/components/youtube/CollectionList.tsx
3. API: src/app/api/youtube/collections/route.ts
4. 타입: src/types/index.ts (Collection 타입)
5. 에러 처리: docs/ERROR_BOUNDARY.md 45-67행 (401 처리)
```

### Step 4: 실행 단계 작성 (Planning)

**이렇게 작성하세요:**
```markdown
실행 단계 (구체적 행동):

1. 버그 재현 및 확인
   - 파일: src/app/(pages)/tools/youtube-lens/page.tsx
   - 확인: 72-85행의 useEffect에서 컬렉션 데이터 로드
   - 문제: 401 에러 시 로그인 페이지로 리다이렉트

2. 원인 수정
   - 파일: src/components/youtube/CollectionList.tsx  
   - 수정: 34행의 에러 처리 로직
   - 변경 전: if (error.status === 401) router.push('/login')
   - 변경 후: if (error.status === 401) setShowLoginModal(true)

3. API 응답 확인
   - 파일: src/app/api/youtube/collections/route.ts
   - 확인: 15-23행의 인증 체크 로직
   - 수정: 인증 실패 시 적절한 에러 메시지 반환
```

### Step 5: 검증 기준 작성 (Validation)

**이렇게 작성하세요:**
```markdown
성공 기준 (구체적 테스트):
1. 로그인 상태: 컬렉션 목록이 정상 표시
2. 로그아웃 상태: 로그인 모달 표시 (페이지 이동 X)
3. API 테스트: curl http://localhost:3000/api/youtube/collections
4. 콘솔 에러: 없음
```

### Step 6: QA 테스트 시나리오 작성 (User Experience Testing) 🆕

**이렇게 작성하세요:**

#### 6.1 사용자 플로우 테스트

```markdown
## 핵심 사용자 시나리오

### 정상 플로우 (Happy Path)
1. **시작 상태**: 로그인 완료
2. **사용자 행동 순서**:
   - Step 1: /tools/youtube-lens 페이지 접속
   - Step 2: 컬렉션 탭 클릭
   - Step 3: 새 컬렉션 생성 버튼 클릭
   - Step 4: 컬렉션 이름 입력 "테스트 컬렉션"
   - Step 5: 저장 버튼 클릭
3. **검증 포인트**:
   ✅ 컬렉션 목록에 새 항목 표시
   ✅ 성공 토스트 메시지 표시
   ✅ 3초 이내 응답

### 실패 시나리오 테스트
1. **세션 만료**: 401 에러 → 로그인 모달 표시
2. **네트워크 장애**: 타임아웃 → 재시도 버튼 표시
3. **중복 이름**: 409 에러 → "이미 존재하는 이름" 알림
```

#### 6.2 엣지 케이스 체크리스트

```markdown
### 입력값 경계 테스트
| 테스트 항목 | 입력값 | 예상 결과 | 실제 결과 |
|------------|--------|-----------|-----------|
| 빈 입력 | "" | "필수 입력" 에러 | ☐ |
| 최소 길이 | 1자 | 통과 | ☐ |
| 최대 길이 | 255자 | 통과 | ☐ |
| 초과 길이 | 256자 | "길이 초과" 에러 | ☐ |
| 특수문자 | <script> | XSS 방지 처리 | ☐ |
| 이모지 | 😀 | 정상 저장 | ☐ |
| SQL Injection | '; DROP TABLE-- | 정화 처리 | ☐ |

### 동시성 테스트
☐ 더블 클릭 방지 (디바운싱)
☐ 연속 API 요청 중복 방지
☐ 다중 탭 세션 동기화
☐ 동시 수정 충돌 해결
```

#### 6.3 성능 & 접근성 기준 (업계 표준)

```markdown
### 성능 벤치마크 (Core Web Vitals)
⚡ LCP (Largest Contentful Paint): < 2.5s
⚡ FID (First Input Delay): < 100ms  
⚡ CLS (Cumulative Layout Shift): < 0.1
⚡ API 응답 시간: < 500ms (p95)

### 접근성 체크 (WCAG 2.1 AA)
♿ 키보드 네비게이션: Tab 순서 논리적
♿ 스크린 리더: ARIA 레이블 완성도 100%
♿ 색상 대비: 4.5:1 이상 (일반 텍스트)
♿ 포커스 표시: 명확한 시각적 피드백

### 크로스 브라우저 테스트
| 브라우저 | Windows | Mac | Mobile |
|---------|---------|-----|--------|
| Chrome 120+ | ☐ | ☐ | ☐ |
| Safari 17+ | N/A | ☐ | ☐ |
| Firefox 120+ | ☐ | ☐ | N/A |
| Edge 120+ | ☐ | ☐ | N/A |
```

#### 6.4 회귀 테스트 범위

```markdown
### 영향 범위 분석
☑ 수정된 컴포넌트를 사용하는 다른 페이지
☑ 동일한 API를 호출하는 다른 기능
☑ 상태 관리에 의존하는 연관 기능
☑ 라우팅 로직 변경 영향

### 회귀 테스트 항목
1. 기존 컬렉션 CRUD 동작
2. 다른 인증 필요 기능들
3. 모달 시스템 전체
4. 에러 바운더리 동작
```

---

## 🎯 케이스별 상세 작성 가이드

### 1️⃣ 버그 수정 지시서 작성법

#### 사용자 요청 예시:
"컬렉션 클릭하면 로그인 페이지로 가버려"

#### 지시서 작성 과정:

**0. SuperClaude 명령어 결정 & 온보딩 준비 (v12.1):**
```bash
/sc:troubleshoot --seq --validate --think
"컬렉션 401 에러 처리 버그 수정"
```

```markdown
## 📚 온보딩 섹션
### 필수 읽기
- [ ] `/CLAUDE.md` 448-498행 - 인증 프로토콜
- [ ] `/docs/ERROR_BOUNDARY.md` - 401 에러 처리 패턴
```

**1. 먼저 관련 파일 찾기:**
```bash
# 컬렉션 관련 파일 모두 찾기
find src -name "*collection*" -o -name "*Collection*"

# 컬렉션 관련 코드 검색
grep -r "collection" src --include="*.tsx" --include="*.ts"

# API 라우트 확인
ls -la src/app/api/youtube/collections/
```

**2. 버그 위치 특정:**
```markdown
발견한 파일들:
- src/app/(pages)/tools/youtube-lens/page.tsx (메인 페이지)
- src/components/youtube/CollectionList.tsx (컬렉션 목록 컴포넌트)
- src/app/api/youtube/collections/route.ts (API)
```

**3. 완성된 지시서:**
```markdown
# 버그 수정 지시서: 컬렉션 401 에러 처리

## 🚀 추천 실행 명령어
```bash
# 복잡도: Moderate
/sc:troubleshoot --seq --validate --think
"이 지시서를 읽고 컬렉션 401 에러 처리 수정"
```

## 📚 온보딩 섹션
### 필수 읽기 문서
- [ ] `/CLAUDE.md` 448-498행 - 인증 프로토콜 v2.0
- [ ] `/CLAUDE.md` 54-71행 - 절대 금지사항
- [ ] `/docs/ERROR_BOUNDARY.md` - 401 에러 처리 표준

### 프로젝트 컨텍스트
```bash
# 기술 스택 확인
cat package.json | grep "@supabase"  # 인증 라이브러리

# 현재 인증 패턴 확인
grep -r "createRouteHandlerClient" src/app/api --include="*.ts"
```

### 문제 상황
- 위치: /tools/youtube-lens 페이지의 컬렉션 섹션
- 증상: 로그아웃 상태에서 컬렉션 클릭 시 로그인 페이지로 강제 이동
- 원인: 401 에러 처리가 페이지 리다이렉트로 구현됨

### 수정 파일 및 내용

1. **src/components/youtube/CollectionList.tsx**
   - 34행: 에러 처리 수정
   ```typescript
   // 수정 전
   if (error.status === 401) {
     router.push('/login');
   }
   
   // 수정 후  
   if (error.status === 401) {
     setShowLoginModal(true); // 모달 표시로 변경
   }
   ```

2. **src/app/(pages)/tools/youtube-lens/page.tsx**
   - 12행: 로그인 모달 상태 추가
   ```typescript
   const [showLoginModal, setShowLoginModal] = useState(false);
   ```
   - 156행: 모달 컴포넌트 추가
   ```typescript
   {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
   ```

### QA 테스트 시나리오

#### 사용자 플로우 테스트
1. 로그아웃 상태로 /tools/youtube-lens 접속
2. 컬렉션 섹션 클릭
3. **예상**: 로그인 모달 표시 (페이지 이동 ❌)
4. 로그인 진행
5. **예상**: 원래 작업 계속 가능

#### 엣지 케이스
- 로그인 중 취소 → 모달만 닫힘
- 잘못된 인증 → 에러 메시지 표시
- 세션 만료 중간 → 자동 감지 및 모달 표시

#### 회귀 테스트
☑ 로그인 상태에서 정상 동작
☑ 다른 401 처리 영향 없음
☑ 페이지 라우팅 정상

### 성공 기준
☑ 로그인 모달 정상 표시
☑ 페이지 이동 없음
☑ 로그인 후 컬렉션 정상 접근
☑ 성능: 모달 표시 < 100ms
```

---

### 2️⃣ UI 개선 지시서 작성법

#### 사용자 요청 예시:
"메인 페이지 캐러셀 크기를 Fast Campus 사이트처럼 개선해줘"

#### 지시서 작성 과정:

**0. SuperClaude 명령어 & 온보딩 (v12.1):**
```bash
/sc:improve --magic --c7 --validate
"메인 캐러셀 크기 Fast Campus 스타일로 개선"
```

**1. 현재 구현 확인:**
```bash
# 메인 페이지 찾기
cat src/app/page.tsx | grep -A 10 -B 10 "carousel"

# 캐러셀 컴포넌트 찾기
find src/components -name "*carousel*" -o -name "*Carousel*"
```

**2. 참조 사이트 분석 방법 안내:**
```markdown
Fast Campus 사이트 분석:
1. https://fastcampus.co.kr 접속
2. 개발자 도구 (F12) 열기
3. 메인 캐러셀 요소 검사
4. 크기 확인: height: 480px, aspect-ratio: 16/9
```

**3. 완성된 지시서:**
```markdown
# UI 개선 지시서: 메인 캐러셀 크기 조정

## 🚀 추천 실행 명령어
```bash
# 복잡도: Simple
/sc:improve --magic --c7 --validate
"메인 캐러셀 크기 Fast Campus 스타일로 개선"
```

## 📚 온보딩 섹션
### 필수 읽기 문서
- [ ] `/CLAUDE.md` 68-71행 - 스타일링 규칙 (Tailwind CSS)
- [ ] `/docs/COMPONENT_INVENTORY.md` - 기존 캐러셀 컴포넌트

### 프로젝트 컨텍스트
```bash
# 현재 캐러셀 구현 확인
cat src/components/HeroCarousel.tsx | head -50

# Tailwind 설정 확인
cat tailwind.config.js | grep -A 5 "theme"
```

### 개선 목표
- 현재: height: 300px (너무 작음)
- 목표: height: 480px, aspect-ratio: 16/9 (Fast Campus 스타일)

### 수정 파일 및 내용

1. **src/components/HeroCarousel.tsx**
   - 23행: 높이 스타일 수정
   ```typescript
   // 수정 전
   <div className="h-[300px] w-full">
   
   // 수정 후
   <div className="h-[480px] w-full aspect-video">
   ```

2. **src/app/page.tsx**
   - 45행: 캐러셀 섹션 패딩 조정
   ```typescript
   // 수정 전
   <section className="py-8">
   
   // 수정 후
   <section className="py-12">
   ```

### 반응형 처리
```typescript
// src/components/HeroCarousel.tsx 25행 추가
<div className="h-[320px] md:h-[400px] lg:h-[480px] w-full aspect-video">
```

### QA 테스트 시나리오

#### 반응형 테스트
| 해상도 | 높이 | 레이아웃 | 성능 |
|--------|------|----------|------|
| 320px (Mobile) | 320px | ☐ 정상 | ☐ < 3s |
| 768px (Tablet) | 400px | ☐ 정상 | ☐ < 2s |
| 1920px (Desktop) | 480px | ☐ 정상 | ☐ < 1s |

#### 크로스 브라우저
☐ Chrome: 애니메이션 부드러움
☐ Safari: 이미지 렌더링 정상
☐ Firefox: 종횡비 유지

#### 성능 측정
- LCP: < 2.5초 (이미지 로딩)
- CLS: < 0.1 (레이아웃 시프트 없음)
- 메모리: < 50MB 증가

### 성공 기준
☑ 모든 해상도에서 적절한 크기
☑ 이미지 비율 유지
☑ 부드러운 전환 애니메이션
☑ 성능 저하 없음
```

---

### 3️⃣ 기능 추가 지시서 작성법

#### 사용자 요청 예시:
"마이페이지에 활동 내역 섹션 추가해줘"

#### 지시서 작성 과정:

**0. SuperClaude 명령어 & 온보딩 (v12.1):**
```bash
/sc:implement --seq --validate --c7 --think
"마이페이지 활동 내역 기능 구현"
```

**1. 기존 구조 파악:**
```bash
# 마이페이지 구조 확인
ls -la src/app/(pages)/mypage/

# 유사 기능 찾기 (참고용)
grep -r "activity" src --include="*.tsx"
grep -r "history" src --include="*.tsx"
```

**2. 필요한 요소 정리:**
```markdown
필요한 작업:
1. DB 테이블: user_activities (없으면 생성)
2. API 엔드포인트: /api/user/activities
3. 컴포넌트: ActivityHistory.tsx
4. 타입 정의: UserActivity
```

**3. 완성된 지시서:**
```markdown
# 기능 추가 지시서: 마이페이지 활동 내역

## 🚀 추천 실행 명령어
```bash
# 복잡도: Moderate
/sc:implement --seq --validate --c7 --think
"마이페이지 활동 내역 기능 구현"
```

## 📚 온보딩 섹션
### 필수 읽기 문서
- [ ] `/CLAUDE.md` 143-302행 - TypeScript 타입 관리 시스템
- [ ] `/CLAUDE.md` 303-371행 - 보안 자동 적용 규칙
- [ ] `/docs/DATA_MODEL.md` - 데이터베이스 구조

### 프로젝트 컨텍스트
```bash
# DB 테이블 확인
node scripts/verify-with-service-role.js | grep activities

# 타입 시스템 확인
cat src/types/index.ts | grep -A 5 "Activity"

# API 패턴 확인
cat src/app/api/user/profile/route.ts | head -30
```

### 작업 전 확인
- [ ] user_activities 테이블 존재 여부
- [ ] 기존 활동 관련 컴포넌트
- [ ] 인증 체크 패턴

### 추가할 기능
- 위치: /mypage 페이지
- 내용: 사용자의 최근 활동 내역 표시 (게시글, 댓글, 좋아요)

### 구현 단계

1. **타입 정의 추가**
   파일: src/types/index.ts
   ```typescript
   export interface UserActivity {
     id: string;
     type: 'post' | 'comment' | 'like';
     title: string;
     createdAt: string;
     targetId: string;
     targetTitle: string;
   }
   ```

2. **API 라우트 생성**
   파일: src/app/api/user/activities/route.ts (새 파일)
   ```typescript
   import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
   import { cookies } from 'next/headers';
   import { NextResponse } from 'next/server';

   export async function GET() {
     const supabase = createRouteHandlerClient({ cookies });
     const { data: { user } } = await supabase.auth.getUser();
     
     if (!user) {
       return NextResponse.json(
         { error: 'User not authenticated' },
         { status: 401 }
       );
     }

     // 활동 내역 조회 로직
     const { data, error } = await supabase
       .from('user_activities')
       .select('*')
       .eq('user_id', user.id)
       .order('created_at', { ascending: false })
       .limit(20);

     if (error) {
       return NextResponse.json({ error: error.message }, { status: 500 });
     }

     return NextResponse.json({ activities: data });
   }
   ```

3. **컴포넌트 생성**
   파일: src/components/mypage/ActivityHistory.tsx (새 파일)
   ```typescript
   'use client';

   import { useEffect, useState } from 'react';
   import { apiGet } from '@/lib/api-client';
   import { UserActivity } from '@/types';
   import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

   export function ActivityHistory() {
     const [activities, setActivities] = useState<UserActivity[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       const fetchActivities = async () => {
         try {
           const data = await apiGet<{ activities: UserActivity[] }>('/api/user/activities');
           setActivities(data.activities);
         } catch (error) {
           console.error('Failed to fetch activities:', error);
         } finally {
           setLoading(false);
         }
       };

       fetchActivities();
     }, []);

     if (loading) {
       return <div>활동 내역을 불러오는 중...</div>;
     }

     return (
       <Card>
         <CardHeader>
           <CardTitle>최근 활동</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             {activities.map((activity) => (
               <div key={activity.id} className="flex items-center justify-between">
                 <div>
                   <p className="font-medium">{activity.title}</p>
                   <p className="text-sm text-gray-500">{activity.createdAt}</p>
                 </div>
                 <span className="text-sm">{activity.type}</span>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
     );
   }
   ```

4. **마이페이지에 추가**
   파일: src/app/(pages)/mypage/page.tsx
   - import 추가 (상단):
   ```typescript
   import { ActivityHistory } from '@/components/mypage/ActivityHistory';
   ```
   - 컴포넌트 추가 (적절한 위치):
   ```typescript
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
     <ProfileSection />
     <ActivityHistory /> {/* 새로 추가 */}
   </div>
   ```

### DB 마이그레이션 (필요시)
파일: supabase/migrations/[timestamp]_user_activities.sql
```sql
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  target_id UUID,
  target_title VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" ON user_activities
  FOR SELECT USING (user_id = auth.uid());
```

### QA 테스트 시나리오

#### 기능 테스트
1. **빈 데이터**: 활동 없음 → "활동 내역이 없습니다" 표시
2. **데이터 로딩**: 스켈레톤 UI → 실제 데이터
3. **페이지네이션**: 20개 이상 → "더 보기" 버튼
4. **실시간 업데이트**: 새 활동 → 자동 갱신

#### 성능 테스트
| 데이터 개수 | 로딩 시간 | 메모리 사용 |
|------------|-----------|-------------|
| 0개 | < 100ms | 기준값 |
| 20개 | < 500ms | +5MB |
| 100개 | < 1s | +10MB |
| 1000개 | < 2s | +20MB |

#### 보안 테스트
☑ 타 사용자 데이터 접근 불가
☑ SQL Injection 방어
☑ XSS 방어
☑ CSRF 토큰 검증

### 성공 기준
☑ 활동 내역 정상 표시
☑ 데이터 정확성 100%
☑ 응답 시간 < 500ms
☑ 에러 처리 완벽
```

---

## 🏢 Enterprise 레벨 가이드 (v12.2 신규)

### 🌊 Wave Mode 활용 가이드

#### Wave Mode란?
- **정의**: 대규모 시스템 작업을 여러 단계(Wave)로 나누어 체계적으로 진행하는 오케스트레이션 방식
- **활성화 조건**: 복잡도 ≥0.7 AND 파일 >20 AND 작업 타입 >2
- **목적**: 복잡한 작업의 체계적 관리와 품질 보증

#### Wave 전략 선택 가이드
```markdown
| 전략 | 사용 시나리오 | 특징 | 예시 |
|------|-------------|------|------|
| progressive | 점진적 개선 | 반복적 개선 | 성능 최적화, UX 개선 |
| systematic | 체계적 분석 | 철저한 검증 | 보안 감사, 코드 리뷰 |
| adaptive | 동적 대응 | 유연한 조정 | 레거시 마이그레이션 |
| enterprise | 대규모 작업 | 완전한 변환 | 시스템 재설계 |
```

#### Wave 구성 예시
```markdown
### Wave 1: Discovery & Analysis (발견 및 분석)
- 현재 상태 평가
- 문제점 식별
- 영향 범위 분석
- 리스크 평가

### Wave 2: Planning & Design (계획 및 설계)
- 솔루션 아키텍처
- 마이그레이션 전략
- 의존성 매핑
- 롤백 계획

### Wave 3: Implementation (구현)
- 핵심 기능 구현
- 점진적 롤아웃
- 단위 테스트 작성
- 통합 테스트

### Wave 4: Validation (검증)
- 성능 벤치마크
- 보안 스캔
- 사용자 수용 테스트
- 회귀 테스트

### Wave 5: Optimization (최적화)
- 성능 튜닝
- 리소스 최적화
- 모니터링 설정
- 문서화
```

### 📊 대규모 시스템 작업 예시

#### 1. 레거시 시스템 마이그레이션

```markdown
# 레거시 시스템 현대화 지시서

## 🚀 추천 실행 명령어
```bash
# 복잡도: Enterprise
/sc:analyze --seq --ultrathink --all-mcp --wave-mode --wave-strategy enterprise
"레거시 jQuery 시스템을 React 18로 마이그레이션"
```

## 📚 온보딩 섹션
### 필수 읽기 문서
- [ ] `/docs/LEGACY_SYSTEM.md` - 현재 시스템 구조
- [ ] `/docs/MIGRATION_PLAN.md` - 마이그레이션 전략
- [ ] `/CLAUDE.md` - AI 작업 지침

### 프로젝트 범위
- 파일 수: 200+ 파일
- 코드 라인: 50,000+ 줄
- 영향 범위: 전체 시스템
- 예상 기간: 4-6주

## Wave 실행 계획

### Wave 1: 시스템 분석 (--wave-mode --systematic-waves)
```bash
# 의존성 분석
find . -name "*.js" | xargs grep -h "require\|import" | sort | uniq > dependencies.txt

# jQuery 사용 패턴 분석
grep -r "\$(" --include="*.js" | wc -l  # jQuery 호출 횟수
grep -r "\.ajax(" --include="*.js" > ajax_calls.txt  # AJAX 패턴

# 컴포넌트 후보 식별
find . -name "*.html" | xargs grep -l "data-component" > components.txt
```

### Wave 2: 아키텍처 설계 (--wave-mode --adaptive-waves)
- React 컴포넌트 구조 설계
- 상태 관리 전략 (Redux/Context)
- 라우팅 전략
- API 레이어 설계

### Wave 3: 점진적 마이그레이션 (--wave-mode --progressive-waves)
1. **Phase 1**: 공통 컴포넌트
   - Header, Footer, Navigation
   - 공통 UI 요소
   
2. **Phase 2**: 독립 페이지
   - About, Contact 등 정적 페이지
   - 의존성 낮은 기능
   
3. **Phase 3**: 핵심 기능
   - 사용자 인증
   - 주요 비즈니스 로직

### Wave 4: 통합 테스트 (--wave-mode --wave-validation)
- E2E 테스트 작성
- 성능 비교 테스트
- 브라우저 호환성
- 접근성 검증

### Wave 5: 최적화 및 배포 (--wave-mode --enterprise-waves)
- 번들 최적화
- 코드 스플리팅
- CDN 설정
- 모니터링 구축
```

#### 2. 마이크로서비스 전환

```markdown
# 모놀리식 → 마이크로서비스 전환 지시서

## 🚀 추천 실행 명령어
```bash
# 복잡도: Enterprise
/sc:implement --seq --ultrathink --delegate folders --wave-mode --wave-strategy enterprise
"모놀리식 앱을 마이크로서비스로 분리"
```

## 📊 시스템 규모
- 현재: 단일 Node.js 앱 (300K LOC)
- 목표: 12개 마이크로서비스
- 영향: 500+ API 엔드포인트

## Wave 실행 전략

### Wave 1: 도메인 분리 분석
```bash
# 도메인별 코드 분석
/sc:analyze --seq --delegate folders --parallel-dirs
"src/ 폴더의 도메인 경계 식별"

# 결과
- User Service: 인증/인가
- Product Service: 상품 관리
- Order Service: 주문 처리
- Payment Service: 결제 처리
- Notification Service: 알림
```

### Wave 2: 서비스 경계 정의
- API Gateway 설계
- 서비스 간 통신 프로토콜
- 데이터 분리 전략
- 트랜잭션 관리

### Wave 3: 점진적 분리
```typescript
// Step 1: Interface 정의
interface UserService {
  createUser(data: CreateUserDTO): Promise<User>;
  getUser(id: string): Promise<User>;
  updateUser(id: string, data: UpdateUserDTO): Promise<User>;
}

// Step 2: 구현 분리
class UserServiceImpl implements UserService {
  // 기존 코드를 서비스로 래핑
}

// Step 3: 독립 배포
// Docker 컨테이너화 및 Kubernetes 배포
```

### Wave 4: 통합 및 테스트
- 서비스 메시 구성
- 분산 트레이싱
- 통합 테스트
- 카오스 엔지니어링

### Wave 5: 운영 최적화
- 오토스케일링 설정
- 서킷 브레이커
- 로그 집계
- 메트릭 대시보드
```

#### 3. 성능 최적화 캠페인

```markdown
# 전사적 성능 최적화 지시서

## 🚀 추천 실행 명령어
```bash
# 복잡도: Complex
/sc:improve --seq --think-hard --wave-mode --wave-strategy progressive --delegate files
"전체 시스템 성능 50% 개선"
```

## 📈 목표 메트릭
- 현재: LCP 4.5s, FID 250ms, CLS 0.3
- 목표: LCP 2.0s, FID 80ms, CLS 0.05

## Wave별 최적화 전략

### Wave 1: 성능 프로파일링
```bash
# Lighthouse CI 설정
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:3000

# 번들 분석
npm run build -- --analyze
npx source-map-explorer 'build/static/js/*.js'

# 런타임 프로파일링
Chrome DevTools > Performance > Record
```

### Wave 2: Critical Path 최적화
1. **이미지 최적화**
   ```bash
   # WebP 변환
   find . -name "*.jpg" -o -name "*.png" | \
     xargs -I {} cwebp {} -o {}.webp
   
   # Lazy Loading 구현
   <img loading="lazy" src="..." />
   ```

2. **JavaScript 최적화**
   ```typescript
   // Code Splitting
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   
   // Tree Shaking
   import { specific } from 'large-library';
   ```

3. **CSS 최적화**
   ```css
   /* Critical CSS 인라인 */
   <style>/* critical.css */</style>
   
   /* Non-critical CSS 지연 로딩 */
   <link rel="preload" href="styles.css" as="style">
   ```

### Wave 3: 네트워크 최적화
- HTTP/2 Push
- Resource Hints (prefetch, preconnect)
- CDN 구성
- 압축 (Brotli)

### Wave 4: 런타임 최적화
- React.memo 적용
- useMemo/useCallback 최적화
- Virtual Scrolling
- Web Workers 활용

### Wave 5: 모니터링 구축
- Real User Monitoring (RUM)
- Synthetic Monitoring
- Alert 설정
- Performance Budget
```

### 🔧 Enterprise 도구 체인

#### 대규모 분석 도구
```bash
# 코드베이스 분석
/sc:analyze --seq --ultrathink --delegate folders
"전체 코드베이스 아키텍처 분석"

# 의존성 그래프 생성
madge --image dependency-graph.svg src/

# 복잡도 분석
npx complexity-report-html src/**/*.js

# 기술 부채 측정
sonarqube-scanner
```

#### 자동화 오케스트레이션
```bash
# CI/CD 파이프라인 구성
/sc:implement --seq --wave-mode --wave-strategy systematic
"GitHub Actions CI/CD 파이프라인 구축"

# 테스트 자동화
/sc:test --seq --delegate files --parallel
"E2E 테스트 스위트 구축"
```

#### 품질 게이트 설정
```yaml
# .github/workflows/quality-gates.yml
quality_gates:
  code_coverage: ">= 80%"
  duplicated_lines: "< 3%"
  technical_debt_ratio: "< 5%"
  bugs: 0
  vulnerabilities: 0
  code_smells: "< 10"
  
wave_gates:
  wave_1_complete: "analysis_coverage == 100%"
  wave_2_complete: "design_approval == true"
  wave_3_complete: "test_coverage >= 80%"
  wave_4_complete: "performance_targets_met == true"
  wave_5_complete: "monitoring_active == true"
```

### 📋 Enterprise 체크리스트

#### 프로젝트 규모 평가
```markdown
### 규모 지표
☐ 파일 수: ___ 개
☐ 코드 라인: ___ LOC
☐ 팀 규모: ___ 명
☐ 예상 기간: ___ 주
☐ 영향 범위: ___ %

### 복잡도 평가
☐ 기술 스택 수: ___
☐ 외부 의존성: ___
☐ 통합 포인트: ___
☐ 데이터 마이그레이션: Yes/No
☐ 다운타임 허용: Yes/No

### Wave Mode 필요성
☐ 복잡도 점수: ___ (0.0-1.0)
☐ 파일 수 > 20: Yes/No
☐ 작업 타입 > 2: Yes/No
☐ → Wave Mode 추천: Yes/No
```

#### Wave 실행 템플릿
```markdown
## Wave [N]: [Wave 이름]

### 목표
- [ ] 구체적 목표 1
- [ ] 구체적 목표 2

### 실행 명령
```bash
/sc:[command] --wave-mode --[strategy] --[flags]
"[구체적 지시]"
```

### 입력
- 이전 Wave 산출물
- 필요 리소스
- 의존성

### 산출물
- [ ] 문서/보고서
- [ ] 코드/구현체
- [ ] 테스트 결과
- [ ] 메트릭

### 검증 기준
- [ ] 품질 게이트 통과
- [ ] 성능 목표 달성
- [ ] 보안 요구사항 충족

### 다음 Wave 조건
- 모든 검증 기준 통과
- 이해관계자 승인
- 리소스 준비 완료
```

### 🎯 Enterprise 작업 성공 요소

#### 1. 체계적 접근
- Wave 단위 계획 및 실행
- 각 Wave별 명확한 목표
- 점진적 검증 및 개선
- 롤백 계획 수립

#### 2. 자동화 우선
- CI/CD 파이프라인
- 자동화된 테스트
- 모니터링 및 알림
- 자동 롤백 메커니즘

#### 3. 팀 협업
- 명확한 역할 분담
- 정기적 진행 상황 공유
- 문서화 및 지식 전달
- 피드백 루프 구축

#### 4. 리스크 관리
- 조기 리스크 식별
- 완화 전략 수립
- 정기적 리스크 평가
- 컨틴전시 계획

#### 5. 품질 보증
- 각 Wave별 품질 게이트
- 자동화된 품질 검증
- 성능 벤치마크
- 보안 스캔

---

## 🔍 지시서 품질 검증 체크리스트

**지시서 작성 완료 후 확인하세요:**

### 필수 요소 체크
- ☐ **SC 명령어**: 상단에 실행 명령어 명시 (v12.1)
- ☐ **온보딩 섹션**: 필수 읽기 문서와 컨텍스트 (v12.1)
- ☐ **구체적 파일 경로**: "[파일 경로]"가 아닌 실제 경로 명시
- ☐ **행 번호**: 수정할 정확한 위치 명시
- ☐ **전체 코드**: "..." 없이 완전한 코드 제공
- ☐ **테스트 방법**: 구체적인 테스트 단계
- ☐ **성공 기준**: 명확한 완료 조건
- ☐ **Enterprise 가이드**: 대규모 작업 시 Wave Mode 활용 (v12.2) 🆕

### QA 요소 체크 🆕
- ☐ **사용자 플로우**: Happy Path + Edge Cases
- ☐ **성능 기준**: Core Web Vitals 충족
- ☐ **접근성**: WCAG 2.1 AA 준수
- ☐ **회귀 테스트**: 영향 범위 명시
- ☐ **크로스 환경**: 브라우저/디바이스 호환성

### Enterprise 요소 체크 (v12.2) 🆕
- ☐ **규모 평가**: 파일 수, LOC, 복잡도 평가
- ☐ **Wave 전략**: 적절한 Wave 전략 선택
- ☐ **Wave 구성**: 각 Wave별 목표와 산출물 명시
- ☐ **품질 게이트**: Wave별 검증 기준 설정
- ☐ **자동화**: CI/CD 및 테스트 자동화 계획

### 실행 가능성 체크
- ☐ 실행 AI가 파일을 찾을 수 있는가?
- ☐ 수정 내용이 명확한가?
- ☐ 테스트 방법이 구체적인가?
- ☐ 의존성이 모두 해결되는가?
- ☐ **테스트 자동화 가능한가?** 🆕
- ☐ **온보딩으로 충분한 컨텍스트를 제공하는가?** (v12.1)
- ☐ **대규모 작업 시 Wave Mode가 적절히 활용되는가?** (v12.2) 🆕

### 의도 전달 체크
- ☐ 사용자의 원래 의도가 반영되었는가?
- ☐ 실행 AI가 오해할 여지가 없는가?
- ☐ 예외 상황 처리가 포함되었는가?
- ☐ **사용자 경험이 개선되는가?** 🆕
- ☐ **Enterprise 규모 작업이 체계적으로 관리되는가?** (v12.2) 🆕

---

## 📊 업계 표준 참조 (v12 신규)

### Testing Library 우선순위
1. **getByRole**: 접근성 트리 기반 (최우선)
2. **getByLabelText**: 폼 필드 (권장)
3. **getByText**: 텍스트 콘텐츠
4. **getByTestId**: 최후의 수단

### Core Web Vitals 기준
- **LCP**: < 2.5초 (Good), < 4초 (Needs Improvement)
- **FID**: < 100ms (Good), < 300ms (Needs Improvement)
- **CLS**: < 0.1 (Good), < 0.25 (Needs Improvement)

### WCAG 2.1 AA 체크리스트
- 색상 대비: 4.5:1 (일반), 3:1 (큰 텍스트)
- 키보드 접근: 모든 기능 키보드로 가능
- 시간 제한: 조정 가능하거나 없음
- 대체 텍스트: 모든 이미지에 alt 속성

### ISTQB 테스트 프로세스
1. 테스트 계획 (Planning)
2. 테스트 설계 (Design)
3. 테스트 구현 (Implementation)
4. 테스트 실행 (Execution)
5. 테스트 완료 (Closure)

---

## 📝 지시서 작성 실패 시 응답

**정보가 부족하거나 불명확할 때:**

```markdown
## 추가 정보 필요

### 명확히 해주세요:
1. **정확한 문제 상황**
   - 어떤 페이지에서 발생하나요?
   - 어떤 동작을 했을 때 발생하나요?
   - 에러 메시지가 있다면 무엇인가요?

2. **예상 동작**
   - 어떻게 동작하기를 원하시나요?
   - 참고할 만한 다른 사이트가 있나요?

3. **프로젝트 정보**
   - 사용 중인 프레임워크는? (Next.js, React 등)
   - 데이터베이스는? (Supabase, Firebase 등)

4. **테스트 환경** 🆕
   - 지원해야 할 브라우저는?
   - 모바일 대응 필요한가요?
   - 성능 목표가 있나요?

5. **작업 규모** (v12.2) 🆕
   - 영향 받는 파일 수는?
   - 예상 작업 기간은?
   - 팀 규모와 역할은?

### 확인 방법:
```bash
# 프로젝트 구조 확인
ls -la src/

# 기술 스택 확인
cat package.json | grep -A 10 "dependencies"

# 테스트 도구 확인
cat package.json | grep -A 10 "devDependencies" | grep test

# 프로젝트 규모 확인 (v12.2)
find src -name "*.tsx" -o -name "*.ts" | wc -l  # 파일 수
cloc src/  # 코드 라인 수
```

위 정보 확인 후 다시 요청해 주세요.
```

---

## 🎯 핵심 원칙 (v12.2 강화)

1. **실행 AI는 당신의 지시서만 보고 작업합니다**
   - 프로젝트를 모릅니다
   - 파일 위치를 모릅니다
   - 구체적으로 알려주세요
   - **온보딩 섹션으로 필수 컨텍스트를 제공하세요** (v12.1)
   - **대규모 작업은 Wave Mode로 단계적으로 안내하세요** (v12.2) 🆕

2. **사용자의 의도를 100% 구현하는 것이 목표입니다**
   - "실행 가능"이 아닌 "의도대로 구현"
   - 사용자가 원하는 결과물이 나와야 합니다
   - **🆕 사용자가 만족하는 경험이 제공되어야 합니다**
   - **🆕 Enterprise 규모 작업도 체계적으로 완수되어야 합니다** (v12.2)

3. **친절하고 구체적으로 작성하세요**
   - 추상적 표현 금지
   - 실제 경로와 코드 제공
   - 단계별 설명 포함
   - **🆕 테스트 가능한 기준 제시**
   - **🆕 Wave별 명확한 목표 제시** (v12.2)

4. **품질을 보증하세요** 🆕
   - 기능 동작뿐만 아니라 사용자 경험 검증
   - 성능, 접근성, 보안 고려
   - 회귀 테스트로 부작용 방지
   - **Enterprise 수준의 품질 게이트 적용** (v12.2) 🆕

5. **지시서 작성 AI도 학습이 필요합니다** (v12.1 신규)
   - Step 0에서 프로젝트 컨텍스트 학습
   - 온보딩 섹션 작성으로 지식 전달
   - 작업별 필수 문서 파악 능력
   - **대규모 시스템 이해 능력** (v12.2) 🆕

6. **규모에 맞는 접근법을 선택하세요** (v12.2 신규) 🆕
   - Simple: 직접 실행
   - Moderate: 체계적 접근
   - Complex: 병렬 처리 및 위임
   - Enterprise: Wave Mode 오케스트레이션

---

## 🚀 v12.2 주요 개선사항

### 신규 추가 (v12.2)
- **Enterprise 레벨 가이드**: 대규모 시스템 작업 방법론
- **Wave Mode 활용법**: 복잡한 작업의 단계적 실행
- **대규모 작업 예시**: 레거시 마이그레이션, 마이크로서비스 전환, 성능 최적화
- **Enterprise 도구 체인**: 대규모 분석 및 자동화 도구
- **Wave 실행 템플릿**: 체계적인 Wave 구성 가이드

### v12.1 기능 계승 (모두 유지)
- **SuperClaude 통합**: 모든 지시서에 SC 명령어 필수 포함
- **온보딩 섹션 필수화**: 실행 AI의 컨텍스트 학습 보장
- **Step 0 강화**: 명령어 결정 + 프로젝트 학습 단계
- **지시서 작성 AI 학습**: 프로젝트 전체 이해 필수

### v12 기능 계승 (모두 유지)
- **Step 6**: QA 테스트 시나리오 섹션
- **업계 표준**: Testing Library, WCAG, Core Web Vitals
- **테스트 자동화**: 자동화 가능한 테스트 케이스
- **사용자 경험**: UX 중심 검증 프로세스

### Enterprise 특화 기능 (v12.2)
- Wave별 품질 게이트
- 대규모 병렬 처리
- 점진적 롤아웃 전략
- 자동화 오케스트레이션
- 리스크 관리 체계

### 확장성 개선 (v12.2)
- 10 파일 → 1000+ 파일 지원
- 단일 작업 → 다단계 캠페인
- 개인 프로젝트 → 팀 프로젝트
- 로컬 개발 → 분산 시스템

---

*v12.2 - 품질이 보증된 지시서 작성 가이드 + SuperClaude 통합 + 온보딩 필수화 + Enterprise 레벨 지원*
*AI가 AI를 위해 작성하는 완벽한 지시서 + 사용자 경험 검증 시스템 + 컨텍스트 학습 체계 + 대규모 시스템 오케스트레이션*