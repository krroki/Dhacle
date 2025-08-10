# 📍 PROJECT-INDEX - 디하클 프로젝트 문서 지도

## 🔴 필수: 새 세션 시작 체크리스트

**⚠️ 경고: 아래 문서들을 모두 확인하지 않으면 작업 진행 불가**

### 📋 반드시 확인해야 할 문서 (순서대로)
1. ☐ **이 문서** (`PROJECT-INDEX.md`) - 현재 상태와 문서 지도 파악
2. ☐ **`/CLAUDE.md`** - 프로젝트 규칙과 가이드라인
3. ☐ **`/docs/PM-AI-Framework.md`** - PM AI 운영 매뉴얼
4. ☐ **`/docs/site-architecture-plan.md`** - 사이트 구조와 기능 명세
5. ☐ **`/docs/component-visual-diagram.md`** - UI/UX 상세 스펙
6. ☐ **`/docs/development-workflow-guide.md`** - 개발 가이드
7. ☐ **`/docs/Visual-Verification-Protocol.md`** - UI 검증 프로토콜

---

## 🚨 현재 구현 상태 (2025-01-09)

### ⚠️ CRITICAL 문제 - 즉시 수정 필요
1. ~~**타입 안정성 붕괴**~~ ✅ 해결됨 (2025-01-09 PM AI 재검증 완료)
   - ✅ **browser-client.ts**: `Database` 타입 import (2번줄) + `<Database>` 제네릭 (33번줄)
   - ✅ **server-client.ts**: `Database` 타입 import (3번줄) + `<Database>` 제네릭 (24, 74번줄)
   - ✅ **client.ts**: `Database` 타입 import (2번줄) + `<Database>` 제네릭 (16번줄)
   - ✅ TypeScript 컴파일: Supabase 관련 any 타입 경고 0개
   - ✅ **PM AI 검증**: 모든 Supabase 클라이언트 파일 직접 확인 완료

2. **데이터베이스 스키마 문제**
   - ❌ 비즈니스 로직 트리거 누락 (수익인증 검증)
   - ❌ 랭킹 집계 함수 불완전
   - 📍 **작업 지시**: 별도 작업으로 진행 예정

### ✅ 완료된 작업
1. **Supabase 인증 시스템**
   - ✅ Supabase 클라이언트 구현 (`src/lib/supabase/browser-client.ts`)
   - ✅ Kakao OAuth 완전 구현 (`src/components/layout/Header.tsx`)
   - ✅ Auth callback 라우트 구현 (`src/app/auth/callback/route.ts`)
   - ✅ Mock 클라이언트로 개발 환경 지원
   - ⚠️ **필요**: `.env.local` 파일에 환경 변수 설정

2. **UI 컴포넌트**
   - ✅ Design System 구축 완료 (Stripe 스타일)
   - ✅ 모든 컴포넌트 토큰 시스템 적용
   - ✅ NavigationBar, PillButton, SearchBar, ExperienceCard 구현

3. **데이터베이스**
   - ✅ 8개 테이블 스키마 작성 (`src/lib/supabase/migrations/001_initial_schema.sql`)
   - ⚠️ 타입 통합 미완료 - TASK-2025-003 수행 필요

### ✅ 최근 완료 작업 (2025-01-09)
- ✅ FastCampus 스타일 UI 재설계 완료
  - TopBanner (프로모션 배너)
  - MainCarousel (메인 캐러셀 - Hero 대체)
  - CategoryGrid (10개 카테고리 그리드)
  - RevenueSlider (수익인증 슬라이더)

### 🔄 진행 중인 작업
- **TASK-2025-006**: UI 품질 개선 (작업 지시서 작성 완료)
  - 네비게이션 바 FastCampus 수준 개선
  - 캐러셀 링크 연결 기능
  - 불필요 요소 3개 제거

### ⏳ 진행 예정 작업
- 강의 시스템 구축 (Phase 3)
- 강의 목록 및 상세 페이지
- 수익인증 시스템 고도화
- 랭킹 시스템
- 도구 페이지 (TTS 커터 등)

---

## 🔴 2025-01-09 중요 업데이트 (v2)

### PM AI 작업 방식 개선
**문제**: 새 세션 Developer AI가 컨텍스트 부족으로 작업 실패
**해결**: 작업 지시서에 완전한 프로젝트 컨텍스트 포함

### 개선된 문서들
1. **task-template.md** - 필수 학습 문서 섹션 강화
2. **PM-AI-Framework.md** - 작업 지시서 필수 포함 사항 명시
3. **pm-ai-onboarding.md** - 작업 지시서 체크리스트 추가
4. **PM-AI-Quick-Start.md** - 5분 빠른 온보딩 가이드 생성

### 핵심 변경사항
- 모든 작업 지시서에 PROJECT-INDEX.md, CLAUDE.md, theme.deep.json 필수 포함
- 프로젝트 설명과 기술적 제약사항 명시 의무화
- 수정할 파일 전체 경로 명시 의무화

## 📚 핵심 문서 위치 및 용도

### 1. 프로젝트 설계 문서
- **`/docs/site-architecture-plan.md`** 
  - 용도: 전체 사이트 구조 및 기획
  - 언제 봐야 함: 새 기능 구현 시작할 때
  
- **`/docs/component-visual-diagram.md`** 
  - 용도: UI 컴포넌트 상세 명세
  - 언제 봐야 함: UI 컴포넌트 개발할 때
  
- **`/docs/development-workflow-guide.md`** 
  - 용도: 단계별 개발 가이드
  - 언제 봐야 함: 실제 코딩 작업할 때

### 2. 작업 관리 문서
- **`/docs/PM-AI-Framework.md`** 
  - 용도: PM AI 운영 매뉴얼
  - 언제 봐야 함: 작업 지시서 작성할 때
  
- **`/docs/Visual-Verification-Protocol.md`** 
  - 용도: UI 검증 프로토콜
  - 언제 봐야 함: UI 작업 완료 후 검증할 때
  
- **`/docs/tasks/`** - 작업 태스크 목록
- **`/docs/evidence/`** - 검증 리포트 및 증거 자료

### 3. 설정 파일
- **`/CLAUDE.md`** 
  - 용도: Claude Code 가이드라인
  - 언제 봐야 함: 코딩 시작 전 필수
  
- **`/theme.deep.json`** 
  - 용도: 디자인 시스템 토큰
  - 언제 봐야 함: 스타일링 작업할 때
  
- **`/.env.local.example`** 
  - 용도: 환경 변수 템플릿
  - 언제 봐야 함: 초기 설정할 때

---

## 🚀 빠른 시작 명령어

### 1. 개발 서버 시작
```bash
npm run dev
```

### 2. 환경 변수 설정 (필수!)
```bash
# .env.local 파일 생성
cp .env.local.example .env.local
# 파일 열어서 Supabase URL과 Key 입력
```

### 3. Supabase Dashboard 설정
1. Authentication → Providers → Kakao 활성화
2. Client ID와 Secret 입력
3. Redirect URL 설정

---

## 🔄 개발 진행 상태 (development-workflow-guide.md 기반)

### Phase 1: 기초 설정
- [x] Step 1-1: 프로젝트 초기화 및 환경 설정 (2025-01-08 PM AI 검증)
- [x] Step 1-2: Supabase 데이터베이스 설정 (2025-01-08 PM AI 검증)
- [x] Step 1-3: 카카오 인증 시스템 구현 (2025-01-09 PM AI 검증)

### Phase 2: 메인 페이지 구현
- [x] Step 2-1: 메인 페이지 기본 구조 (2025-01-09 PM AI 검증)
- [x] Step 2-2: ~~Hero 섹션 구현~~ → FastCampus UI로 대체 (2025-01-09)
- [x] Step 2-3: 실시간 수익인증 슬라이더 (2025-01-09 PM AI 검증)
- [x] Step 2-4: 카테고리 그리드 구현 (2025-01-09 PM AI 검증)

### Phase 3: 핵심 기능 구현
- [ ] Step 3-1: 강의 목록 페이지
- [ ] Step 3-2: 강의 상세 페이지
- [ ] Step 3-3: TTS 커터 도구
- [ ] Step 3-4: 수익인증 시스템
- [ ] Step 3-5: 랭킹 시스템

### Phase 4: 마무리 작업
- [ ] Step 4-1: 마이페이지
- [ ] Step 4-2: 관리자 대시보드
- [ ] Step 4-3: 최종 테스트 및 최적화

**업데이트 책임**: PM AI가 Developer AI 작업 검증 후 업데이트

---

## 💡 중요 참고사항

### Supabase & Kakao 인증
**이미 100% 구현 완료되어 있습니다!**
- 코드 수정 불필요
- 환경 변수만 설정하면 즉시 작동
- Mock 클라이언트로 개발 가능

### 디자인 시스템
- 모든 스타일링은 `theme.deep.json` 토큰 사용
- 하드코딩된 색상 절대 금지
- Design System 컴포넌트 우선 사용

### 프로젝트명
- 기존: "쇼츠 스튜디오" ❌
- 현재: **"디하클"** ✅

---

## 📊 문서 참조 워크플로우

### 🚀 새 세션 시작 시
```
1. PROJECT-INDEX.md 읽기 → 현재 상태 파악
2. CLAUDE.md 읽기 → 프로젝트 규칙 확인  
3. PM-AI-Framework.md 읽기 → 작업 방식 이해
4. 필요한 문서 선택적 읽기 → 작업 준비
```

### 💻 기능 구현 시
```
1. site-architecture-plan.md → 무엇을 만들지 확인
2. component-visual-diagram.md → 어떻게 보여야 하는지 확인
3. development-workflow-guide.md → 어떻게 구현하는지 확인
4. theme.deep.json → 스타일 토큰 참조
```

### ✅ 작업 전 체크리스트
```markdown
□ 새 세션 시작 체크리스트 완료했나?
□ PROJECT-INDEX.md 읽고 현재 상태 파악했나?
□ CLAUDE.md에서 디자인 시스템 규칙 확인했나?
□ site-architecture-plan.md에서 구현할 기능 확인했나?
□ 환경 변수(.env.local) 설정했나?
□ 토큰 시스템(theme.deep.json) 사용하고 있나?
```

---

## 🔥 자주 발생하는 문제와 해결

### 문제 1: "PM AI가 핵심 문서를 확인하지 않음"
**원인**: PROJECT-INDEX에 명시된 필수 문서들을 선택적으로 읽음
**해결**: 상단의 "새 세션 시작 체크리스트" 강제 확인

### 문제 2: "이미 구현된 기능을 다시 구현"
**원인**: 현재 구현 상태를 제대로 파악하지 않음
**해결**: Supabase/Kakao 인증은 완료됨 - 환경 변수만 설정 필요

### 문제 3: "프로젝트명 혼동"
**원인**: 구 문서에 "쇼츠 스튜디오" 잔재
**해결**: 모든 곳에서 "디하클" 사용

---

## 📞 연락처 및 지원

- **문서 업데이트**: 작업 진행 시 이 문서를 먼저 확인하고 업데이트
- **새 세션 시작**: 반드시 상단 체크리스트 완료 후 작업 시작
- **문제 발생 시**: "자주 발생하는 문제" 섹션 먼저 확인

*최종 업데이트: 2025-01-09*