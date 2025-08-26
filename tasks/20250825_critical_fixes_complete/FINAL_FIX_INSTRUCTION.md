/sc:troubleshoot --seq --validate --think-hard
"Phase 3 미완료 이슈 완전 해결 - any 타입 제거, TypeScript 에러 수정, fetch 제거"

# 🚨 FINAL FIX: Phase 3 미완료 작업 완전 해결 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- API Routes: `src/app/api/certificates/`
- Hooks: `src/hooks/queries/useCertificates.ts`
- 타입 정의: `src/types/database.generated.ts`
- API 클라이언트: `src/lib/api-client.ts`

### 프로젝트 컨텍스트 확인
```bash
# 기술 스택 확인
cat package.json | grep -A 5 "dependencies"

# 프로젝트 구조 확인  
ls -la src/

# 최신 변경사항 확인
cat /docs/PROJECT.md | grep -A 10 "최근 변경"
```

### 🔥 실제 코드 패턴 확인 (필수 실행)
```bash
# API 클라이언트 패턴 확인
grep -r "apiGet\|apiPost" src/ --include="*.ts" --include="*.tsx" | head -5

# 현재 any 타입 위치 확인  
grep -r ": any" src/ --include="*.ts" --include="*.tsx"

# 직접 fetch 사용 확인
grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | grep -v "//"

# 테이블 타입 확인
grep -r "user_certificates" src/types/database.generated.ts
```

## 📌 목적
Phase 3에서 미완료된 작업들을 완전히 해결하여 빌드 성공 및 타입 안정성 확보

## 🤖 실행 AI 역할
TypeScript 전문가로서 모든 any 타입을 제거하고, 컴파일 에러를 해결하며, 직접 fetch 사용을 API Client로 대체

## 📝 작업 내용

### 🔴 필수 작업 1: any 타입 3개 제거

#### 1-1. src/app/api/certificates/route.ts (line 149)
```typescript
// ❌ 현재 코드
const updates: any = {};

// ✅ 수정할 코드  
interface CertificateUpdate {
  user_id?: string;
  course_id?: string;
  course_title?: string;
  student_name?: string;
  instructor_name?: string;
  issue_date?: string;
  certificate_hash?: string;
  is_public?: boolean;
  completion_percentage?: number;
  skills_acquired?: string[];
  verification_url?: string;
}
const updates: CertificateUpdate = {};
```

#### 1-2. src/hooks/queries/useCertificates.ts
```typescript
// ❌ 현재 코드 (2곳)
onError: (error: any) => {

// ✅ 수정할 코드
onError: (error: Error) => {
```

### 🔴 필수 작업 2: TypeScript 에러 해결

#### 2-1. @types/uuid 설치
```bash
npm install --save-dev @types/uuid
```

#### 2-2. user_certificates 테이블 타입 추가
`src/types/database.generated.ts`에 추가:
```typescript
user_certificates: {
  Row: {
    id: string;
    user_id: string;
    course_id: string;
    course_title: string;
    student_name: string;
    instructor_name?: string | null;
    issue_date: string;
    certificate_hash: string;
    is_public: boolean;
    completion_percentage?: number | null;
    skills_acquired?: string[] | null;
    verification_url?: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    user_id: string;
    course_id: string;
    course_title: string;
    student_name: string;
    instructor_name?: string | null;
    issue_date?: string;
    certificate_hash?: string;
    is_public?: boolean;
    completion_percentage?: number | null;
    skills_acquired?: string[] | null;
    verification_url?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    course_id?: string;
    course_title?: string;
    student_name?: string;
    instructor_name?: string | null;
    issue_date?: string;
    certificate_hash?: string;
    is_public?: boolean;
    completion_percentage?: number | null;
    skills_acquired?: string[] | null;
    verification_url?: string | null;
  };
  Relationships: [
    {
      foreignKeyName: "user_certificates_user_id_fkey";
      columns: ["user_id"];
      referencedRelation: "users";
      referencedColumns: ["id"];
    }
  ];
};
```

#### 2-3. courseProgressExtended 테이블 타입 추가
```typescript
courseProgressExtended: {
  Row: {
    id: string;
    user_id: string;
    course_id: string;
    lesson_id: string;
    progress_percentage: number;
    notes?: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    user_id: string;
    course_id: string;
    lesson_id: string;
    progress_percentage?: number;
    notes?: string | null;
  };
  Update: {
    user_id?: string;
    course_id?: string;
    lesson_id?: string;
    progress_percentage?: number;
    notes?: string | null;
  };
  Relationships: [];
};
```

### 🔴 필수 작업 3: 직접 fetch 제거

#### 3-1. src/app/api/admin/video/upload/route.ts
```typescript
// ❌ 현재 코드
const response = await fetch(...)

// ✅ YouTube API는 직접 호출 유지 (외부 API이므로)
// 단, 내부 API 호출은 수정 필요
```

#### 3-2. src/app/auth/callback/route.ts  
```typescript
// ❌ 현재 코드
const response = await fetch(`${request_url.origin}/api/user/init-profile`, {

// ✅ 수정할 코드 - 직접 Supabase 호출로 변경
const supabase = await createSupabaseRouteHandlerClient();
// init-profile 로직을 직접 구현
```

#### 3-3. src/lib/api-keys/index.ts
```typescript
// ❌ 현재 코드  
const response = await fetch(

// ✅ 수정할 코드
import { apiPost } from '@/lib/api-client';
const response = await apiPost('/api/user/api-keys', { ... });
```

### 🔴 필수 작업 4: 타입 에러 수정

#### 4-1. src/app/api/youtube/folders/route.ts (line 58)
```typescript
// null 체크 추가
.map((folder: FolderWithChannels) => ({
  ...folder,
  channelCount: folder.channel_count ?? 0,  // null 처리
  folderChannels: folder.folder_channels || []
}))
```

#### 4-2. src/app/api/youtube/metrics/route.ts (line 228)
```typescript
// null 체크 추가
.reduce((a: number, s: VideoStat) => a + (s.view_count ?? 0), 0)
```

#### 4-3. src/app/api/youtube/subscribe/route.ts
```typescript
// 파라미터 수정
line 32: generateToken(user.id)  // 파라미터 추가
line 125: verifyToken(token, expectedUserId)  // 두 번째 파라미터 추가
```

## ✅ 완료 조건

### 🔴 필수 완료 조건 (하나라도 미충족 시 미완료)
```bash
# 1. any 타입 완전 제거
- [ ] grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l
      → 결과: 0

# 2. TypeScript 에러 0개
- [ ] npm run types:check
      → 에러 0개

# 3. 빌드 성공
- [ ] npm run build
      → 성공

# 4. 실제 브라우저 테스트
- [ ] npm run dev → http://localhost:3000
- [ ] 인증서 페이지 정상 작동
- [ ] 콘솔 에러 0개
```

### 🟡 권장 완료 조건
- [ ] 직접 fetch 사용 최소화 (외부 API만 허용)
- [ ] 모든 테이블 타입 정의 완료
- [ ] API 응답 타입 안정성 확보

## 📋 QA 테스트 시나리오

### 🔴 필수: 실제 사용자 플로우 테스트
```markdown
# 1. 개발 서버 실행
npm run dev

# 2. 브라우저 테스트 (http://localhost:3000)
인증서 관련 기능:
- [ ] /certificates 페이지 접속 → 목록 표시
- [ ] 인증서 생성 → 저장 → DB 확인
- [ ] 인증서 수정 → 업데이트 확인
- [ ] 인증서 삭제 → 삭제 확인

# 3. 개발자 도구 확인
- [ ] Console: 에러 0개
- [ ] Network: API 200/201 응답
- [ ] TypeScript 에러 없음
```

## 🔄 롤백 계획
```bash
# 실패 시 롤백 명령어
git stash  # 현재 변경사항 임시 저장
npm run types:check  # 다시 확인
# 문제 지속 시 이전 커밋으로 롤백
git reset --hard HEAD~1
```

## ⚠️ 주의사항

1. **any 타입 절대 금지** - 구체적 타입 정의 필수
2. **임시방편 금지** - TODO, 주석 처리 금지
3. **테스트 필수** - 실제 브라우저에서 기능 확인
4. **타입 가드 활용** - null/undefined 체크 철저히

---

*이 지시서를 통해 Phase 3의 모든 미완료 작업을 완전히 해결하세요.*
*작업 완료 후 반드시 `npm run types:check`와 `npm run build`가 성공해야 합니다.*