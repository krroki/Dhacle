/sc:implement --seq --validate --think-hard --c7 --delegate files --wave-mode
"Phase별 100개 TypeScript 에러 체계적 해결 및 실제 작동 사이트 구현"

# 🚨 Dhacle 프로젝트 100개 에러 완전 해결 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 🔥🔥🔥 최우선 프로젝트 특화 규칙 (모든 지시서 필수) 🔥🔥🔥

### ⚠️ 경고: 이 섹션 미확인 시 프로젝트 파괴 가능성 90%

#### 📌 필수 확인 문서 체크리스트
```markdown
- [ ] `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 (전체 읽기 필수)
- [ ] `/CLAUDE.md` 17-43행 - 자동 스크립트 절대 금지
- [ ] `/CLAUDE.md` 352-410행 - Supabase 클라이언트 패턴
- [ ] `/CLAUDE.md` 54-71행 - 절대 금지사항 목록
- [ ] `/docs/ERROR_BOUNDARY.md` - 에러 처리 표준 패턴
```

#### 🚫 프로젝트 금지사항 (절대 위반 불가)
```markdown
- [ ] 자동 변환 스크립트 생성 금지 (38개 스크립트 재앙 경험)
- [ ] 구식 Supabase 패턴 사용 금지 (createServerComponentClient 등)
- [ ] database.generated.ts 직접 import 금지
- [ ] any 타입 사용 금지
- [ ] fetch() 직접 호출 금지
- [ ] getSession() 사용 금지 (getUser() 사용)
- [ ] 임시방편 해결책 사용 금지 (주석 처리, TODO, 빈 배열 반환 등)
- [ ] 에러 발생 시 작업 진행 금지 (완전 해결 후 진행)
- [ ] 실제 테스트 없이 완료 보고 금지
```

---

## 📚 온보딩 섹션

### 작업 관련 경로
```bash
# TypeScript 에러 집중 영역
- API Routes: `src/app/api/**/*.ts`
- Pages: `src/app/(pages)/**/*.tsx`
- Components: `src/components/**/*.tsx`
- Hooks: `src/hooks/**/*.ts`
- Types: `src/types/index.ts`
```

### 프로젝트 컨텍스트 확인
```bash
# 기술 스택 확인
cat package.json | grep -A 20 "dependencies"

# 현재 에러 수 확인 (목표: 100개 → 0개)
cd /c/My_Claude_Project/9.Dhacle
npm run types:check 2>&1 | grep -c "error TS"

# 프로젝트 구조 확인
ls -la src/
```

### 🔥 실제 코드 패턴 확인 (v17.0 신규)
```bash
# Supabase 패턴 확인
grep -r "createSupabaseRouteHandlerClient" src/ --include="*.ts" | head -5

# API 클라이언트 패턴 확인
grep -r "apiClient\." src/ --include="*.ts" --include="*.tsx" | head -5

# 금지 패턴 검사
grep -r "createServerComponentClient" src/ --include="*.ts" | wc -l  # 0이어야 함
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l     # 0이어야 함
```

---

## 📌 목적

현재 Dhacle 프로젝트에 존재하는 100개의 TypeScript 에러를 체계적으로 해결하여 실제 작동하는 사이트를 완성한다. 단순히 빌드 성공이 아닌, 모든 기능이 실제로 작동하는 것이 목표다.

---

## 🤖 실행 AI 역할

1. TypeScript 에러 분석 및 카테고리화 전문가
2. Next.js 15 App Router 마이그레이션 전문가
3. React Query v5 타입 시스템 전문가
4. Supabase 클라이언트 패턴 전문가
5. 실제 작동 검증 전문가

---

## 🔍 Phase 0: 현황 정밀 진단 (30분)

### 진단 명령어 시퀀스
```bash
# 1. 정확한 에러 수 파악
cd /c/My_Claude_Project/9.Dhacle
npm run types:check 2>&1 | grep "error TS" | wc -l

# 2. 에러 타입별 분류
npm run types:check 2>&1 | grep "error TS" | cut -d: -f4 | sort | uniq -c | sort -rn

# 3. 파일별 에러 분포
npm run types:check 2>&1 | grep "error TS" | cut -d: -f1 | sort | uniq -c | sort -rn | head -20

# 4. 에러 상세 내용 저장
npm run types:check 2>&1 > error_report.txt

# 5. TODO 현황
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | wc -l
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | head -10

# 6. any 타입 사용 현황
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l
grep -r "as any" src/ --include="*.ts" --include="*.tsx" | wc -l

# 7. 빌드 가능 여부
npm run build 2>&1 | tail -50
```

### 에러 카테고리 분석
```bash
# Category 1: Route Parameter 에러 (Next.js 15 관련)
grep "error TS2344\|error TS2345" error_report.txt | grep -E "route|Route|params" | wc -l

# Category 2: Database Column 에러
grep "error TS2339" error_report.txt | grep -E "Property.*does not exist" | wc -l

# Category 3: Type Mismatch 에러
grep "error TS2769" error_report.txt | grep "No overload matches" | wc -l

# Category 4: Unused Variable 에러
grep "error TS6133" error_report.txt | wc -l

# Category 5: Import/Export 에러
grep "error TS2304" error_report.txt | grep "Cannot find name" | wc -l
```

---

## 📝 Phase 1: Critical Build Blockers 해결 (Day 1)

### 목표
- 빌드를 막는 치명적 에러 우선 해결
- npm run build 성공

### 작업 내용

#### 1.1 Route Parameter 타입 수정
```typescript
// src/app/api/certificates/[id]/route.ts 수정
// 49행 에러 해결
export async function GET(
  request: Request,
  { params }: { params: { id: string } }  // Promise<{id: string}> 아님!
): Promise<NextResponse> {
  const { id } = params; // await 제거
  // ... 나머지 코드
}
```

#### 1.2 Database Column 매핑 수정
```typescript
// src/app/api/user/init-profile/route.ts 수정
// 91행 에러 해결
const { data: profile } = await supabase
  .from('profiles')
  .select('id, random_nickname')  // randomnickname → random_nickname
  .eq('user_id', user.id)
  .single();
```

#### 1.3 Missing Import 수정
```typescript
// src/components/layout/Header.tsx 수정
// 264행 에러 해결
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
// createBrowserClient 제거
```

### 검증 명령
```bash
# Phase 1 검증
npm run types:check 2>&1 | grep -c "error TS"  # 70개 이하 목표
npm run build  # 성공해야 함
```

---

## 📝 Phase 2: Core Functionality 복구 (Day 2-3)

### 목표
- 핵심 기능 동작 확인
- 사용자가 실제 사용 가능한 상태

### 작업 내용

#### 2.1 Authentication Flow 수정
```bash
# 모든 API route 세션 체크 확인
grep -r "getUser()" src/app/api --include="*.ts" | wc -l  # 모든 route
grep -r "getSession()" src/app/api --include="*.ts" | wc -l  # 0이어야 함
```

#### 2.2 React Query v5 타입 수정
```typescript
// src/app/certificates/[id]/page.tsx 수정
// 20행 에러 해결
const certificate = data as UserCertificate | null;  // undefined 처리
```

#### 2.3 Component Props 타입 정의
```typescript
// src/app/learn/[courseId]/[lessonId]/page.tsx 수정
// 타입 guard 추가
if (!progress_data) {
  return <div>Loading...</div>;
}

// Type assertion with proper typing
const typedProgress = progress_data as CourseProgress[];
setProgress(typedProgress);
```

### 실제 기능 테스트
```bash
# 개발 서버 실행
npm run dev

# 브라우저 테스트 (http://localhost:3000)
# 1. 로그인 테스트
# 2. YouTube 검색 테스트
# 3. 수익 인증 생성 테스트
# 4. 커뮤니티 게시글 작성 테스트
```

---

## 📝 Phase 3: Type Safety 완성 (Day 4-5)

### 목표
- 모든 any 타입 제거
- TypeScript strict mode 준수
- 에러 0개 달성

### 작업 내용

#### 3.1 any 타입 전수 조사 및 제거
```bash
# any 타입 찾기
grep -rn ": any" src/ --include="*.ts" --include="*.tsx"
grep -rn "as any" src/ --include="*.ts" --include="*.tsx"
grep -rn "<any>" src/ --include="*.ts" --include="*.tsx"

# 각 파일 수동 수정 (자동 스크립트 금지!)
```

#### 3.2 Unused Variables 정리
```bash
# 사용하지 않는 변수 제거
npm run types:check 2>&1 | grep "TS6133" | cut -d: -f1-2 | sort -u

# 각 파일에서 해당 변수 제거 또는 _ prefix 추가
```

#### 3.3 Type Inference 최적화
```typescript
// 타입 추론 개선
// Before
const data: any = await response.json();

// After
interface ApiResponse {
  data: UserData[];
  error?: string;
}
const data = await response.json() as ApiResponse;
```

### 검증 명령
```bash
# Phase 3 최종 검증
npm run types:check  # 에러 0개 필수
npx biome check src/  # 포맷팅 체크
npm run verify:parallel  # 전체 검증
```

---

## 📝 Phase 4: Quality Assurance (Day 6-7)

### 목표
- 모든 TODO 구현
- 성능 최적화
- 프로덕션 준비 완료

### 작업 내용

#### 4.1 TODO 구현
```bash
# TODO 목록 추출
grep -rn "TODO" src/ --include="*.ts" --include="*.tsx" > todos.txt

# 각 TODO 구현 또는 제거
```

#### 4.2 성능 최적화
```bash
# Bundle 분석
npm run analyze

# Lighthouse 실행
npm run lighthouse
```

#### 4.3 보안 점검
```bash
# 보안 검증
npm run security:test

# 환경변수 누출 체크
grep -r "NEXT_PUBLIC_SUPABASE" src/ --include="*.ts" --include="*.tsx"
```

---

## ✅ 완료 조건

### 🔴 필수 검증 (하나라도 실패 시 미완료)
```bash
# 1. TypeScript 완벽
- [ ] npm run types:check → 에러 0개
- [ ] grep -r ": any" src/ → 결과 0개

# 2. 빌드 성공
- [ ] npm run build → 성공
- [ ] .next 폴더 생성 확인

# 3. 실제 작동
- [ ] npm run dev → 실행
- [ ] http://localhost:3000 → 접속 가능
- [ ] 로그인 → 성공
- [ ] YouTube 검색 → 결과 표시
- [ ] 수익 인증 생성 → DB 저장 확인
```

### 🟡 권장 검증
```bash
- [ ] npm run verify:parallel → 모든 검증 통과
- [ ] Lighthouse 점수 → 90점 이상
- [ ] Bundle size → 500KB 이하
```

---

## 📋 QA 테스트 시나리오

### 정상 플로우
```markdown
1. 회원가입
   - [ ] 카카오 로그인 클릭
   - [ ] OAuth 인증 완료
   - [ ] 프로필 생성 확인

2. YouTube Lens
   - [ ] 검색어 입력
   - [ ] 검색 버튼 클릭
   - [ ] 결과 리스트 표시
   - [ ] 상세 정보 모달 열기

3. 수익 인증
   - [ ] 생성 버튼 클릭
   - [ ] 폼 입력
   - [ ] 이미지 업로드
   - [ ] 저장 후 목록 확인

4. 커뮤니티
   - [ ] 게시글 작성
   - [ ] 댓글 추가
   - [ ] 좋아요 클릭
```

### 실패 시나리오
```markdown
1. 네트워크 오류
   - [ ] API 타임아웃 → 에러 메시지 표시
   - [ ] 재시도 버튼 → 정상 작동

2. 권한 체크
   - [ ] 로그인 안 함 → 401 리다이렉트
   - [ ] 타인 글 수정 시도 → 403 에러

3. 입력 검증
   - [ ] 빈 폼 제출 → 검증 메시지
   - [ ] 잘못된 형식 → 구체적 안내
```

---

## 🔄 롤백 계획

### 백업 생성
```bash
# 작업 전 백업
git add .
git commit -m "backup: before error resolution"
git branch backup-$(date +%Y%m%d-%H%M%S)
```

### 롤백 조건
- Phase 검증 실패 시
- 기존 기능 파괴 시
- 에러 수 증가 시

### 롤백 절차
```bash
# 현재 작업 저장
git stash

# 백업 브랜치로 복원
git checkout backup-[timestamp]

# 또는 특정 커밋으로 복원
git reset --hard [commit-hash]
```

---

## 📊 진행상황 추적

### Daily Checkpoint
```bash
# 매일 실행
echo "=== $(date) ==="
npm run types:check 2>&1 | grep -c "error TS"
npm run build && echo "Build: SUCCESS" || echo "Build: FAILED"
npm run dev &
sleep 5
curl -s http://localhost:3000 > /dev/null && echo "Server: RUNNING" || echo "Server: FAILED"
```

### Phase 완료 기준
| Phase | 목표 | 성공 지표 |
|-------|-----|----------|
| Phase 0 | 현황 파악 | 에러 카테고리 완성 |
| Phase 1 | 빌드 성공 | npm run build 성공 |
| Phase 2 | 기능 복구 | 4대 핵심 기능 작동 |
| Phase 3 | 타입 안정성 | 에러 0개 |
| Phase 4 | 품질 보증 | 모든 검증 통과 |

---

## ⚠️ 의사결정 가이드

### "임시 해결 vs 완전 해결"
```markdown
임시 해결 징후 발견 시:
- any 타입 사용 유혹 → 거부
- @ts-ignore 추가 유혹 → 거부
- TODO 남기고 넘어가기 → 거부
- 빈 배열 반환하기 → 거부

항상 완전 해결:
1. 근본 원인 파악
2. 타입 정의 수정
3. 테스트 후 커밋
```

### "에러 해결 우선순위"
```markdown
1. Build Blocker (빌드 실패) → 즉시
2. Runtime Crash (런타임 에러) → 긴급
3. Type Safety (타입 에러) → 중요
4. Unused Code (미사용 코드) → 일반
5. Code Style (스타일) → 낮음
```

---

## 📈 예상 타임라인

| 일차 | Phase | 예상 에러 감소 | 목표 상태 |
|-----|-------|--------------|----------|
| Day 0 | 진단 | 100 → 100 | 현황 파악 |
| Day 1 | Phase 1 | 100 → 70 | 빌드 성공 |
| Day 2-3 | Phase 2 | 70 → 30 | 기능 작동 |
| Day 4-5 | Phase 3 | 30 → 0 | 타입 완벽 |
| Day 6-7 | Phase 4 | 0 → 0 | 품질 보증 |

---

## 🎯 최종 성공 지표

```bash
# 성공 확인 스크립트
#!/bin/bash
echo "=== Dhacle Error Resolution Final Check ==="
echo -n "1. TypeScript Errors: "
npm run types:check 2>&1 | grep -c "error TS"

echo -n "2. Build Status: "
npm run build > /dev/null 2>&1 && echo "✅ SUCCESS" || echo "❌ FAILED"

echo -n "3. Any Types: "
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l

echo -n "4. TODOs: "
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | wc -l

echo "5. Server Test:"
npm run dev &
SERVER_PID=$!
sleep 10
curl -s http://localhost:3000 > /dev/null && echo "✅ Server Running" || echo "❌ Server Failed"
kill $SERVER_PID

echo "=== Complete! ==="
```

---

*이 지시서를 따라 체계적으로 진행하면 7일 내에 모든 에러를 해결하고 실제 작동하는 사이트를 완성할 수 있습니다.*