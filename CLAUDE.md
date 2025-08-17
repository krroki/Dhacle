# 📋 Claude AI 작업 지침서

*목적: AI가 디하클(Dhacle) 프로젝트 작업 시 따라야 할 규칙과 프로세스*
*업데이트: 새로운 작업 패턴이나 금지사항 발견 시에만*

> **관련 문서**:
> - 프로젝트 현황: `/docs/PROJECT.md`
> - 프로젝트 구조: `/docs/CODEMAP.md`

---

## ✅ 필수 행동 지침

### 1. 작업 전 확인사항
- **반드시** 기존 파일을 Read로 먼저 읽기
- 작업 지시사항 **정확히** 파악하기
- 사용자와 협의 없이 **임의로** 파일 생성/수정 금지
- **중복 체크 필수**: 새 컴포넌트/요소 생성 전 기존 파일 확인
- **생성 이유 설명**: 새로운 요소 생성 시 반드시 사용자에게 이유와 목적 설명

### 2. 코드 작성 규칙
- **컴포넌트**: shadcn/ui 컴포넌트 우선 사용
- **스타일링**: Tailwind CSS 클래스만 사용 (인라인 스타일 금지)
- **타입**: TypeScript strict mode 준수, any 타입 절대 금지
- **구조**: Server Component 기본, 필요시만 'use client'

### 3. 파일 작업 규칙
- 새 파일 생성보다 기존 파일 수정 우선
- 문서 파일(*.md, README) 임의 생성 금지
- 환경 변수 하드코딩 금지
- **폴더 구조 준수**: `/docs/CODEMAP.md` 참조
- **파일명 규칙**: 컴포넌트는 PascalCase, 기타 파일은 kebab-case

---

## 🚫 절대 금지 사항

### 1. 임의 작업 금지
- ❌ layout.tsx, page.tsx 사용자 협의 없이 생성
- ❌ 폴더 구조 임의 변경
- ❌ 패키지 임의 추가/삭제
- ❌ Git 자동 커밋

### 2. 기술 제약
- ❌ styled-components 사용 (완전 제거됨)
- ❌ any 타입 사용
- ❌ CSS 모듈, 인라인 스타일
- ❌ 더미/테스트/목업 데이터 사용

### 3. 보안 관련
- ❌ 환경 변수 하드코딩
- ❌ 민감 정보 로깅
- ❌ 보안 키/토큰 코드 포함

---

## 📁 기본 프로젝트 구조

```
src/
├── app/                    # App Router
│   ├── (pages)/           # 페이지 그룹
│   ├── api/               # API Routes
│   └── auth/              # 인증 관련
├── components/            
│   ├── ui/                # shadcn/ui 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트
│   └── features/          # 기능별 컴포넌트
└── lib/
    ├── supabase/          # Supabase 클라이언트
    └── utils.ts           # 유틸리티 함수
```
*상세 구조는 `/docs/CODEMAP.md` 참조*

---

## 🎨 템플릿 기반 개발 프로세스

### Phase 1: 템플릿 검색 및 선택
1. **자동 템플릿 검색**: 요구사항 분석 후 적합한 무료 템플릿 3-5개 검색
2. **일치도 평가**:
   - 90-100%: 즉시 사용 가능, 최소 수정
   - 70-89%: 적합, 일부 수정 필요
   - 50-69%: 사용 가능, 상당한 수정 필요
3. **필수 체크**: Next.js 15.4.6, TypeScript, Tailwind CSS, shadcn/ui 호환성

### Phase 2: 템플릿 적용
1. 선택된 템플릿 기반 구조 생성
2. 프로젝트 요구사항에 맞게 수정
3. 한국어 텍스트 변경, Supabase 연동
4. 불필요한 기능 제거

---

## 💻 SuperClaude 명령어 체계

### 기본 명령어
```bash
/sc:implement --seq --validate --c7
```

### 복잡도별 추천 플래그
- **simple**: `--validate`
- **moderate**: `--seq --validate --c7`
- **complex**: `--seq --validate --evidence --think-hard --c7`
- **enterprise**: `--seq --validate --evidence --ultrathink --delegate files --c7 --magic`

---

## 🔧 작업 프로세스

### 1. 기능 구현 시
1. 요구사항 명확히 확인
2. 기존 코드/패턴 분석
3. shadcn/ui 컴포넌트 활용 방안 검토
4. 구현 후 타입 체크
5. 빌드 테스트

### 2. 문제 해결 시
1. 에러 메시지 정확히 분석
2. 관련 파일 Read로 확인
3. 최소한의 수정으로 해결
4. 부수 효과 확인

### 3. 빌드 전 체크리스트
- [ ] **마이그레이션 검증**: `npm run supabase:validate`
- [ ] `npm run build` 성공 확인
- [ ] TypeScript 에러 0개 (`npx tsc --noEmit`)
- [ ] ESLint 에러 0개 (`npm run lint`)
- [ ] 콘솔 에러 없음

---

## ❌ 실패 사례 & 안티패턴

### 이전 AI들의 실패 TOP 5
1. **className 직접 사용**: 955개나 생성해서 프로젝트 망침
2. **'use client' 남발**: 모든 페이지에 붙여서 SSR 이점 상실
3. **Simple* 중복 컴포넌트**: 같은 기능 여러 개 만들어 혼란
4. **100줄 넘는 거대 파일**: page.tsx에 비즈니스 로직 전부 작성
5. **any 타입 사용**: TypeScript 빌드 실패

### 절대 하지 말아야 할 코드 패턴
```typescript
// ❌❌❌ 절대 금지
className="bg-blue-500 text-white"  // Tailwind 직접 사용 금지
style={{ color: 'red' }}            // 인라인 스타일 금지
const data: any = {}                // any 타입 금지
'use client'                        // 페이지 최상단에 무조건 사용 금지

// ✅✅✅ 올바른 방법
<Button variant="primary">          // shadcn/ui 컴포넌트 사용
const data: CourseType = {}         // 명확한 타입 정의
// Server Component가 기본         // 필요한 곳만 Client Component
```

---

## 📝 Git 작업 규칙

**모든 git 명령은 사용자 확인 후 실행:**
- `git add` - 파일 추가 전 확인
- `git commit` - 커밋 메시지와 내용 확인
- `git push` - 원격 저장소 푸시 전 확인
- `git reset` - 되돌리기 전 반드시 확인

---

## 🔄 Supabase 마이그레이션 관리 (AI 필수 작업)

### 마이그레이션 실행 체계

#### 1. 새 세션 시작 시 검증
```bash
# Service Role Key로 정확한 테이블 검증 (권장)
node scripts/verify-with-service-role.js

# 기본 테이블 확인
npm run supabase:verify
```

#### 2. 마이그레이션 실행 (Service Role Key 설정됨)
```bash
# 완벽한 자동 마이그레이션 (최우선)
npm run supabase:migrate-complete

# 기존 자동화 스크립트
npm run supabase:auto-migrate
```

#### 3. 새 마이그레이션 추가 시
1. SQL 파일 생성: `supabase/migrations/YYYYMMDDHHMMSS_name.sql`
2. 즉시 적용: `npm run supabase:migrate-complete`
3. 검증: `node scripts/verify-with-service-role.js`

### 환경 설정 (모두 설정 완료 ✅)
```bash
# .env.local 필수 키
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # ✅ 설정됨
DATABASE_URL=postgresql://...      # ✅ 설정됨  
SUPABASE_DB_PASSWORD=skan...       # ✅ 설정됨
```

### AI 작업 규칙
- **검증 우선**: 작업 전 `node scripts/verify-with-service-role.js`
- **문제 해결**: `npm run supabase:migrate-complete` 실행
- **상태 확인**: 21개 핵심 테이블 모두 생성 완료됨

---

## 💬 커뮤니케이션

- 작업 전 의도 설명
- 중요 변경사항 사전 협의
- 에러 발생 시 즉시 보고
- 한국어로 명확한 소통

---

## 🧪 dhacle.com 사이트에서 실제 기능 테스트 할 때 반드시 참고 할 내용

### 배포 환경 정보
- **프로덕션 URL**: https://dhacle.com
- **호스팅**: Vercel (자동 배포 설정됨)
- **데이터베이스**: Supabase (golbwnsytwbyoneucunx)

### 테스트 계정 (카카오 로그인)
```
ID: glemfkcl@naver.com
PW: dhfl9909
```
*주의: 사용자의 실제 인증이 필요하므로 로그인 버튼 클릭후에는 잠시 대기해야함.

### YouTube Lens 테스트 절차
1. **프로덕션 사이트 접속**: https://dhacle.com
2. **카카오 로그인**: 위 테스트 계정 사용
3. **YouTube Lens 페이지**: `/tools/youtube-lens` 이동
4. **기능별 테스트**:
   - 인기 Shorts 조회
   - 채널 폴더 관리
   - 컬렉션 생성/조회
   - 비디오 저장

### 테스트 시 확인 사항
- [ ] 로컬 개발 환경 테스트 (`npm run dev`)
- [ ] 빌드 성공 확인 (`npm run build`)
- [ ] **프로덕션 배포 후 실제 사이트에서 테스트**
- [ ] 브라우저 콘솔 에러 확인
- [ ] Network 탭에서 API 응답 확인

---

## ⚠️ 주의사항

### 알려진 이슈
1. **보안**: auth/callback/route.ts의 하드코딩된 자격 증명 (환경 변수 이관 필요)
2. **구조**: 일부 layout.tsx, page.tsx 미구현 상황 있음 (사용자와 협의)
3. **클라이언트**: browser-client.ts Mock 반환 로직 불완전

---

*이 문서는 AI 작업 지침서입니다. 프로젝트 상태는 `/docs/PROJECT.md` 참조*