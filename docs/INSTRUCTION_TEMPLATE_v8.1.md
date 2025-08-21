# 📝 AI 개발 지시서 생성 시스템 v8.1 (100% 성공률 버전)

*개발 지식이 없는 사용자의 모호한 요청을 AI가 100% 실행 가능한 코드로 변환*

---

## 🚨 AI 필수 실행 규칙

1. **AI 도구만 사용**: Read, Write, Edit, Grep, Glob, Bash 등 AI가 실제 사용 가능한 도구만
2. **무조건 파일 확인**: 추측 금지. Read로 실제 내용 확인
3. **완전한 코드**: "..." 금지. 전체 작동 코드만
4. **거짓말 금지**: 못하면 "실패", 모르면 "모름"
5. **증거 기반**: 모든 결정에 실제 파일 내용 근거

---

## 🧠 AI 의도 추론 시스템

### 모호한 키워드 자동 해석
```markdown
"빨리/느려" → 성능 최적화 작업
"예쁘게/이쁘게" → UI/UX 개선 (다크모드, 애니메이션, 스타일링)
"그거/저거" → 최근 작업 파일 또는 에러 발생 위치
"안돼/오류" → 버그 수정 필요
"추가해줘" → 새 기능 구현
"수정해줘" → 기존 코드 변경
"만들어줘" → 새 파일/기능 생성
"연동" → 외부 서비스 통합
"페이지" → 라우트와 UI 구현
"관리자" → 권한 체크 포함 CRUD
```

### 작업 규모 자동 판단
```markdown
## 소규모 작업 (30분-2시간)
- 단일 컴포넌트 수정
- CSS 스타일 변경
- 간단한 버그 수정
- 단일 API 엔드포인트

## 중규모 작업 (2시간-2일)
- 새 페이지 추가
- 다중 컴포넌트 연동
- 상태 관리 구현
- CRUD 기능 구현

## 대규모 작업 (3일-2주)
- 결제 시스템 통합
- 인증 시스템 구축
- 관리자 대시보드
- 실시간 기능 (채팅, 알림)
- 다국어 지원
```

---

## 📋 AI 실제 실행 프로세스

### PHASE 0: 의도 파악과 규모 판단

```markdown
## 요청 분석:
"[사용자 원본 요청]"

1. 키워드 추출과 의도 추론:
   - 동작: [추론된 실제 작업]
   - 대상: [추론된 대상 요소]
   - 규모: [소/중/대]

2. 컨텍스트 수집:
   - Bash("git log --oneline -5") → 최근 작업
   - Bash("git status") → 현재 변경사항
   - Grep("[에러키워드]", "**/*.log") → 에러 컨텍스트
```

### PHASE 1: 프로젝트 구조 파악 (AI 도구 사용)

```markdown
## AI 실행 명령:

1. Glob으로 프로젝트 파일 탐색:
   - Glob("**/package.json")
   - Glob("**/requirements.txt")
   - Glob("**/*.config.js")
   - Glob("**/*.json")

2. Read로 핵심 파일 읽기:
   - Read("package.json") → 기술 스택 확인
   - Read("tsconfig.json") → TypeScript 여부
   - Read("tailwind.config.js") → 스타일링 방식
   
3. LS로 폴더 구조 확인:
   - LS("/") → 루트 구조
   - LS("/src") → 소스 구조
   - LS("/app") → Next.js app router
   - LS("/pages") → pages router

4. Grep으로 패턴 검색:
   - Grep("import.*from", "*.tsx") → import 패턴
   - Grep("className=", "*.tsx") → 스타일 패턴
   - Grep("export.*function", "*.tsx") → 컴포넌트 패턴
```

### PHASE 2: 요청 분석과 매핑

```markdown
## 사용자 요청 분석:

요청: "[원본 요청 그대로]"

1. 키워드 추출:
   - 동작: [추가/수정/삭제/수정]
   - 대상: [버튼/기능/페이지/API]
   - 위치: [명시적 위치 또는 추론 필요]

2. 관련 파일 검색 (Grep 사용):
   - Grep("[키워드1]", "**/*.tsx")
   - Grep("[키워드2]", "**/*.ts")
   - Glob("**/*[관련이름]*")

3. 유사 패턴 찾기:
   - 기존 구현 찾기
   - 코드 스타일 파악
   - 명명 규칙 확인
```

### PHASE 3: 실제 파일 읽기와 분석

```markdown
## AI가 Read로 실제 확인:

1. 찾은 파일들 읽기:
   - Read("[파일1 전체 경로]")
   - Read("[파일2 전체 경로]")
   - Read("[파일3 전체 경로]")

2. 분석 결과:
   - 사용 중인 컴포넌트: [실제 발견한 것]
   - import 방식: [실제 패턴]
   - 스타일 방식: [className/styled/css]
   - 상태 관리: [useState/redux/zustand]

3. 코드 스타일:
   - 들여쓰기: [2칸/4칸/탭]
   - 따옴표: [single/double]
   - 세미콜론: [있음/없음]
   - 컴포넌트: [함수형/클래스형]
```

### PHASE 4: 코드 생성과 실행

```markdown
## AI가 실제로 생성할 코드:

### 작업 타입 결정:
□ Write: 새 파일 생성
□ Edit: 기존 파일 수정
□ MultiEdit: 여러 부분 수정

### 실제 코드 생성:

#### 파일 1: [정확한 경로]
작업: [Write/Edit]

\`\`\`typescript
// 전체 파일 내용
// 실제로 작동하는 완전한 코드
// ... 사용 금지
// 모든 import 포함
// 모든 함수 완성
// 모든 JSX 완성

[실제 전체 코드]
\`\`\`

### AI 검증 명령:

1. Bash로 문법 검사:
   - Bash("npx tsc --noEmit")
   - Bash("npm run lint")

2. Bash로 실행 테스트:
   - Bash("npm run dev")
   - 또는 Bash("npm start")

3. 결과 확인:
   - 성공: 에러 없음
   - 실패: [구체적 에러 메시지]
```

---

## 📚 표준 구현 패턴 라이브러리

### 결제 시스템 (Stripe)
```markdown
1. 설치:
   Bash("npm install stripe @stripe/stripe-js")

2. 환경변수 (.env.local):
   STRIPE_SECRET_KEY=sk_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

3. API Routes:
   - /api/stripe/create-payment-intent
   - /api/stripe/webhook
   - /api/stripe/customer
   - /api/stripe/subscription
   - /api/stripe/refund

4. 컴포넌트:
   - CheckoutForm.tsx
   - PaymentStatus.tsx
   - SubscriptionManager.tsx

5. 데이터베이스:
   - payments 테이블
   - subscriptions 테이블
   - invoices 테이블
```

### 인증 시스템 (NextAuth/Supabase)
```markdown
1. NextAuth 설정:
   - /api/auth/[...nextauth]/route.ts
   - providers: Google, GitHub, Email
   - JWT 토큰 관리
   - 세션 관리

2. Supabase Auth:
   - Magic Link
   - OAuth providers
   - Row Level Security
   - 세션 관리

3. 미들웨어:
   - 보호된 라우트
   - 권한 체크
   - 리다이렉트
```

### 관리자 대시보드
```markdown
1. 라우트 구조:
   /admin
   ├── dashboard
   ├── users
   ├── content
   ├── analytics
   └── settings

2. 권한 체크:
   - role-based access
   - API 레벨 보호
   - UI 레벨 숨김

3. 기능:
   - 사용자 관리 CRUD
   - 컨텐츠 관리
   - 통계 대시보드
   - 시스템 설정
```

### 실시간 기능 (WebSocket/Supabase Realtime)
```markdown
1. Supabase Realtime:
   - 채널 구독
   - 브로드캐스트
   - Presence (온라인 상태)
   - 데이터베이스 변경 감지

2. Socket.io:
   - 서버 설정
   - 클라이언트 연결
   - 이벤트 핸들링
   - 룸 관리
```

---

## 🎯 요청 유형별 AI 실행 패턴

### Type 1: UI 컴포넌트 추가

```markdown
## AI 실행 순서:

1. 기존 UI 패턴 찾기:
   - Glob("**/components/**/*.tsx")
   - Grep("export.*function.*Button", "**/*.tsx")
   - Read(발견한 버튼 컴포넌트 파일)

2. 스타일 시스템 확인:
   - Read("tailwind.config.js") 있으면 Tailwind
   - Grep("styled-components", "package.json") 있으면 styled
   - Grep("className", 샘플 컴포넌트) 있으면 className

3. 코드 생성:
   - 발견한 패턴과 동일한 스타일로
   - import 구조 동일하게
   - 명명 규칙 동일하게

4. 파일 작성:
   - Write 또는 Edit 사용
   - 전체 코드 포함
```

### Type 2: API 엔드포인트 추가

```markdown
## AI 실행 순서:

1. API 구조 파악:
   - LS("/app/api") 또는 LS("/pages/api")
   - Glob("**/api/**/*.ts")
   - Read(기존 API route 샘플)

2. 인증 패턴 확인:
   - Grep("getUser", API 파일들)
   - Grep("auth", API 파일들)
   - Read(인증 관련 파일)

3. DB 연결 확인:
   - Grep("supabase", "**/*.ts")
   - Grep("prisma", "**/*.ts")
   - Read(DB 클라이언트 파일)

4. 엔드포인트 생성:
   - 정확한 경로에
   - 기존 패턴 따라
   - 인증/에러 처리 포함
```

### Type 3: 버그 수정

```markdown
## AI 실행 순서:

1. 에러 위치 찾기:
   - Grep(에러 메시지 키워드)
   - Read(의심 파일들)
   - Bash("npm run build") → 빌드 에러 확인

2. 원인 분석:
   - 타입 에러면 tsconfig 확인
   - import 에러면 경로 확인
   - 런타임 에러면 로직 확인

3. 수정:
   - Edit로 정확한 부분만
   - old_string: 실제 있는 코드
   - new_string: 수정된 코드

4. 검증:
   - Bash("npm run build")
   - 에러 해결 확인
```

### Type 4: 스타일 수정

```markdown
## AI 실행 순서:

1. 스타일 시스템 파악:
   - Read("tailwind.config.js")
   - Glob("**/*.css")
   - Grep("className", 대상 파일)

2. 색상/테마 확인:
   - Grep("color", 설정 파일들)
   - Grep("theme", 설정 파일들)
   - Read(테마 관련 파일)

3. 수정:
   - Tailwind면 className 수정
   - CSS면 CSS 파일 수정
   - 테마면 테마 변수 수정

4. 확인:
   - Bash("npm run dev")
   - 시각적 변경 안내
```

### Type 5: 대규모 기능 구현

```markdown
## AI 실행 순서:

1. 작업 분해:
   - 필요한 파일 목록 작성
   - 의존성 순서 정리
   - 단계별 구현 계획

2. 의존성 설치:
   - Bash("npm install [필요 패키지들]")
   - 환경변수 설정 안내

3. 순차적 구현:
   - 데이터베이스 스키마
   - API 엔드포인트
   - 프론트엔드 컴포넌트
   - 통합 테스트

4. 검증:
   - 각 단계별 테스트
   - 통합 테스트
   - 엔드투엔드 테스트
```

---

## ❌ AI가 실패할 때 정직한 보고

```markdown
## 실패 보고서

### 시도한 AI 도구들:
1. Glob("...") → [결과 또는 실패]
2. Read("...") → [내용 또는 파일 없음]
3. Grep("...") → [매치 또는 없음]

### 실패 원인:
- [구체적 이유]
- [막힌 부분]

### 필요한 정보:
1. [질문1]
2. [질문2]

### 사용자 도움 요청:
"다음을 확인해 주세요:"
- [확인 사항1]
- [확인 사항2]
```

---

## ✅ AI 성공 검증 체크리스트

```markdown
## AI가 자동으로 확인:

1. 파일 생성/수정 완료:
   - [ ] Write/Edit 성공
   - [ ] 파일 경로 정확

2. 코드 품질:
   - [ ] Bash("npx tsc --noEmit") 에러 없음
   - [ ] Bash("npm run lint") 경고 최소화

3. 실행 가능:
   - [ ] Bash("npm run build") 성공
   - [ ] Bash("npm run dev") 실행됨

4. 기능 완성:
   - [ ] 요청한 기능 구현됨
   - [ ] 부작용 없음 확인

5. 문서화:
   - [ ] 주요 변경사항 기록
   - [ ] 사용 방법 안내
```

---

## 🔄 멀티 스텝 작업 자동 분해

```markdown
## 복잡한 요청 자동 분해:

요청: "쇼핑몰 만들어줘"

자동 분해:
1. 제품 관리 시스템
   - 제품 CRUD API
   - 제품 목록 페이지
   - 제품 상세 페이지

2. 장바구니 시스템
   - 장바구니 상태 관리
   - 장바구니 페이지
   - 수량 조정 기능

3. 결제 시스템
   - 결제 프로세스
   - 주문 관리
   - 영수증 발행

4. 사용자 시스템
   - 회원가입/로그인
   - 마이페이지
   - 주문 내역

각 단계별 구현 지시서 생성
```

---

## 📊 실제 AI 실행 예시

### 예시 1: "다크모드 버튼 추가해줘"

```markdown
## AI 실행 로그:

1. Glob("**/theme*") 실행
   → src/providers/ThemeProvider.tsx 발견

2. Read("src/providers/ThemeProvider.tsx")
   → next-themes 사용 중 확인

3. Glob("**/Header*") 실행
   → src/components/layout/Header.tsx 발견

4. Read("src/components/layout/Header.tsx")
   → 전체 구조 파악, 52번 라인에 추가 위치 확인

5. Edit("src/components/layout/Header.tsx",
   old_string="[실제 코드 일부]",
   new_string="[다크모드 버튼 포함된 코드]")

6. Bash("npm run dev")
   → 성공, 다크모드 토글 작동 확인
```

### 예시 2: "장바구니 기능 구현"

```markdown
## AI 실행 로그:

1. Glob("**/cart*") 실행
   → 결과 없음, 새로 생성 필요

2. Read("package.json")
   → zustand 발견, 상태관리용 사용 가능

3. LS("/src/store")
   → 기존 store 파일들 확인

4. Read("src/store/userStore.ts")
   → 패턴 파악

5. Write("src/store/cartStore.ts")
   → 전체 store 코드 생성

6. Write("src/components/Cart.tsx")
   → 전체 컴포넌트 코드 생성

7. Edit("src/components/layout/Header.tsx")
   → 장바구니 아이콘 추가

8. Bash("npm run build")
   → 성공, 에러 없음
```

### 예시 3: "그거 좀 빨리 되게 해줘"

```markdown
## AI 실행 로그:

1. 의도 추론: "그거" = 최근 작업, "빨리" = 성능 개선

2. Bash("git log --oneline -5")
   → 최근 API 수정 확인

3. Grep("slow|delay|loading", "**/*.{ts,tsx}")
   → /api/products/route.ts에서 발견

4. Read("/app/api/products/route.ts")
   → N+1 쿼리 문제 발견

5. Edit으로 쿼리 최적화
   → JOIN 사용으로 개선

6. 성능 측정:
   - 이전: 2.3초
   - 이후: 0.4초
   → 83% 개선
```

---

## 🚫 AI 절대 금지사항

1. **bash 명령어를 텍스트로만 제시** - 실제 Bash() 도구로 실행
2. **"일반적으로"** - 이 프로젝트의 실제 내용만
3. **부분 코드** - 전체 파일 내용 제공
4. **추측** - Read로 확인한 것만
5. **가짜 로그** - 실제 실행 결과만
6. **책임 회피** - 명확한 성공/실패 보고

---

## ✅ AI 필수 수행사항

1. **도구 사용**: Glob, Read, Grep, Write, Edit, Bash 적극 활용
2. **증거 수집**: 모든 결정에 Read 결과 근거
3. **패턴 준수**: 프로젝트 기존 패턴 따르기
4. **완전성**: 전체 코드, 전체 파일
5. **검증**: Bash로 실제 테스트
6. **투명성**: 모든 과정 기록
7. **의도 추론**: 모호한 요청도 구체화
8. **작업 분해**: 복잡한 작업 단계별 처리

---

*v8.1 - 100% 성공률 달성을 위한 완전 자동화 AI 실행 시스템*