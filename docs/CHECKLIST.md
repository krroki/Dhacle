# ✅ 디하클(Dhacle) 프로젝트 체크리스트

*목적: 작업 완료 후 검증해야 할 항목들*
*업데이트: 새로운 검증 항목 추가 시*

> **관련 문서**:
> - 프로젝트 현황: `/docs/PROJECT.md`
> - 프로젝트 구조: `/docs/CODEMAP.md`
> - AI 작업 지침: `/CLAUDE.md`

---

## 🆕 새 파일 생성 시 보안 자동 적용 체크리스트

### API Route 생성 시 (필수)
- [ ] **세션 검사 코드 추가** (파일 최상단)
  ```typescript
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'User not authenticated' }),
      { status: 401 }
    );
  }
  ```
- [ ] **Zod 스키마 추가** (`/lib/security/validation-schemas.ts`)
- [ ] **입력 검증 적용**
- [ ] **에러 형식 통일** (`{ error: string }`)

### 새 테이블 생성 시 (필수)
- [ ] **RLS 즉시 활성화**
  ```sql
  ALTER TABLE 테이블명 ENABLE ROW LEVEL SECURITY;
  ```
- [ ] **기본 정책 4개 생성** (select, insert, update, delete)
- [ ] **user_id 컬럼 포함**
- [ ] **created_at, updated_at 추가**

### 사용자 입력 처리 시 (필수)
- [ ] **XSS 방지 적용**
  ```typescript
  import { sanitizeRichHTML } from '@/lib/security/sanitizer';
  const safeContent = sanitizeRichHTML(userInput);
  ```
- [ ] **입력 길이 제한**
- [ ] **특수문자 이스케이프**

---

## 🔧 개발 작업 체크리스트

### 기능 구현 후
- [ ] TypeScript 타입 체크: `npx tsc --noEmit`
- [ ] ESLint 검사: `npm run lint`
- [ ] 빌드 테스트: `npm run build`
- [ ] 콘솔 에러 없음 확인
- [ ] Network 탭 API 응답 확인

### TypeScript 빌드 체크리스트 (2025-01-30 추가)
- [ ] `any` 타입 사용 여부 검사
- [ ] API 함수 반환 타입 명시 확인
- [ ] ZodError.issues 사용 확인 (`.errors` 아님)
- [ ] unknown 타입 적절한 처리 (타입 가드 사용)
- [ ] npm run build 성공
- [ ] npm run lint 에러 없음

### API 작업 후
- [ ] 세션 검사 구현 (서버 라우트)
- [ ] 401 에러 표준 형식: `{ error: 'User not authenticated' }`
- [ ] api-client.ts 래퍼 사용 (클라이언트)
- [ ] Zod 스키마 검증 적용
- [ ] Rate Limiting 설정 확인

---

## 🔒 보안 체크리스트

### 코드 작성 시
- [ ] 환경 변수 하드코딩 없음
- [ ] any 타입 사용 없음
- [ ] 민감 정보 로깅 없음
- [ ] XSS 방지 (DOMPurify 사용)

### 보안 검증
```bash
# 비밀키 스캔
node scripts/security/scan-secrets.js

# RLS 정책 확인
npm run security:apply-rls-dry

# 보안 테스트 (목표: 100% 통과)
npm run security:test

# 현재 성공률: 38% (2025-01-29 기준)
# 필수 개선 항목: Rate Limiting, XSS 방지, 입력 검증
```

---

## 🔍 YouTube Lens 검증 체크리스트 (2025-01-29 추가)

### API 연결 확인
- [ ] API 키 설정 확인
- [ ] 인기 Shorts 조회 테스트
- [ ] 채널 폴더 기능 테스트
- [ ] 컴렉션 CRUD 테스트

### 오류 해결
- [ ] 400/404/500 에러 해결
- [ ] api-client.ts 사용 통일
- [ ] 세션 검사 적용 확인

---

## 🚀 배포 전 체크리스트

### 환경 설정
- [ ] `.env.local` 모든 필수 키 설정
- [ ] Vercel 환경 변수 설정
- [ ] `localhost` 사용 (127.0.0.1 금지)

### Supabase 검증
```bash
# 테이블 검증
node scripts/verify-with-service-role.js

# 누락된 테이블 확인
node scripts/check-missing-tables.js

# 마이그레이션 적용
npm run supabase:migrate-complete
node scripts/verify-with-service-role.js

# 마이그레이션 상태
npm run supabase:check
```

### 최종 테스트
- [ ] 로컬 개발 환경: `npm run dev`
- [ ] 프로덕션 빌드: `npm run build`
- [ ] 실제 사이트 테스트: https://dhacle.com

---

## 📝 Git 작업 체크리스트

### 커밋 전
- [ ] 변경사항 확인: `git status`
- [ ] 불필요한 파일 제외 (.gitignore)
- [ ] 커밋 메시지 규칙 준수

### 커밋 메시지 규칙
```
feat: 새로운 기능
fix: 버그 수정
refactor: 코드 개선
style: 스타일 변경
docs: 문서 수정
test: 테스트 추가
chore: 기타 작업
```

### PR 생성 전
- [ ] 브랜치명 규칙 준수
- [ ] 충돌 해결 완료
- [ ] 리뷰어 지정

---

## 📊 성능 체크리스트

### Core Web Vitals
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle Size < 200KB per route

### 최적화 확인
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 코드 스플리팅 적용
- [ ] 불필요한 re-render 방지

---

## 📋 문서 작업 체크리스트

### 문서 수정 시
- [ ] 기존 내용 함부로 삭제 금지
- [ ] 중복 내용 확인
- [ ] 관련 문서 참조 업데이트
- [ ] 문서 역할 준수 (DOCUMENT_GUIDE.md 참조)

### 새 기능 추가 시
- [ ] CODEMAP.md - 파일 위치 업데이트
- [ ] PROJECT.md - 최근 변경사항 추가
- [ ] CLAUDE.md - 새로운 규칙/금지사항 추가

---

*이 체크리스트는 작업 품질 보증을 위한 검증 도구입니다.*