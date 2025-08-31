# 🤖 서브에이전트 지침 체계 재구성 가이드

*16개 전문 서브에이전트의 작업 지침을 통일된 구조로 완전 재정비*

**작성일**: 2025-08-31  
**목적**: 15개 CLAUDE.md 파일을 일관된 구조와 명확한 지침으로 재작성  
**대상**: 16개 서브에이전트 (pm-dhacle + 15개 전문 에이전트)

---

## 📋 **현재 서브에이전트 시스템 분석**

### **16개 서브에이전트 전체 목록**
```
조정자:
├── pm-dhacle - 프로젝트 관리 총괄 조정자

15개 전문 서브에이전트:  
├── api-route-agent - API Route 전문가
├── component-agent - React 컴포넌트 전문가
├── type-agent - TypeScript 타입 시스템 전문가
├── security-agent - 보안 및 RLS 정책 전문가  
├── database-agent - Supabase DB 전문가
├── query-agent - React Query 전문가 (15개 훅)
├── test-agent - E2E 테스팅 전문가
├── page-agent - Next.js 페이지 전문가
├── lib-agent - 라이브러리 관리 전문가
├── script-agent - 스크립트 관리 전문가 (verify만)
├── doc-agent - 14개 문서 체계 관리 전문가
├── frontend-developer - 프론트엔드 개발 전문가
├── statusline-setup - 상태줄 설정 전문가
├── output-style-setup - 출력 스타일 설정 전문가
└── general-purpose - 복잡한 분석과 다단계 작업용
```

### **현재 CLAUDE.md 파일 위치**
```
15개 CLAUDE.md 파일 (서브에이전트별 지침):
├── CLAUDE.md (루트) - 전체 가이드라인
├── src/app/api/CLAUDE.md - API Route Agent
├── src/components/CLAUDE.md - Component Agent
├── src/types/CLAUDE.md - Type Agent  
├── src/lib/security/CLAUDE.md - Security Agent
├── src/lib/supabase/CLAUDE.md - Database Agent (일부)
├── src/hooks/CLAUDE.md - Query Agent
├── tests/CLAUDE.md - Test Agent
├── src/app/(pages)/CLAUDE.md - Page Agent
├── src/lib/CLAUDE.md - Lib Agent
├── scripts/CLAUDE.md - Script Agent
├── docs/CLAUDE.md - Doc Agent
├── supabase/migrations/CLAUDE.md - Database Agent (일부)
├── src/types/CLAUDE.md - Type Agent (중복?)
└── current-state-backup/ 폴더들의 CLAUDE.md (삭제 대상)
```

---

## 🎯 **통일된 CLAUDE.md 구조 설계**

### **표준 템플릿 구조**
```markdown
# 🔧 [영역명] 개발 지침

*[영역별 한 줄 설명 - Next.js 15, TypeScript, 서브에이전트 특화]*

---

## 🛑 [영역명] 3단계 필수 규칙

### 1️⃣ STOP - 즉시 중단 신호
- **[영역별 구체적 중단 상황들]**
- **[영역별 치명적 실수 패턴들]**  
- **[영역별 절대 금지사항들]**

### 2️⃣ MUST - 필수 행동
```[language]
// [영역별 반드시 사용해야 할 코드 패턴]
// [영역별 필수 import 구문]
// [영역별 핵심 구현 패턴]
```

### 3️⃣ CHECK - 검증 필수
```bash
# [영역별 필수 검증 명령어]
# [영역별 실제 동작 확인 방법]
# [영역별 자동 테스트 실행 방법]
```

## 🚫 [영역명] any 타입 금지

### ❌ 발견된 문제: [실제 파일명과 라인]
```[language]
// ❌ 절대 금지 패턴
[실제 문제 코드 예시]

// ✅ 즉시 수정 방법  
[올바른 해결 코드]
```

### 🛡️ 예방책
- [영역별 any 타입 방지 방법]
- [영역별 타입 안전성 확보 방법]

## 🚨 [영역명] 필수 패턴

### 패턴 1: [핵심 패턴명]
```[language]
// [영역에서 가장 자주 쓰는 패턴]
```

### 패턴 2: [보안/검증 패턴]  
```[language]
// [영역별 보안이나 검증 관련 필수 패턴]
```

### 패턴 3: [에러 처리 패턴]
```[language] 
// [영역별 에러 처리 표준 패턴]
```

## 📋 [영역명] 검증 명령어

```bash
# 즉시 검증
[영역별 빠른 검증 명령어]

# 상세 검증  
[영역별 완전 검증 명령어]

# 실제 동작 확인
[영역별 실제 작동 테스트 방법]
```

## 🎯 [영역명] 성공 기준

- [ ] [영역별 완료 기준 1]
- [ ] [영역별 완료 기준 2] 
- [ ] [영역별 완료 기준 3]

## ⚠️ [영역명] 주의사항

### 자주 하는 실수
- [영역별 흔한 실수들]

### 함정 포인트
- [영역별 주의해야 할 함정들]

---

## 📁 관련 파일 및 참조

- [영역별 핵심 파일들]
- [영역별 참조 문서들]
- [영역별 예시 코드 위치]

---

*[영역명] 작업 시 이 지침을 우선 확인하세요.*
```

---

## 🔧 **영역별 구체적 재작성 가이드**

### **1. 루트 CLAUDE.md - 전체 가이드라인**

#### **새 역할 정의**
- **목적**: 전체 프로젝트 가이드라인 및 서브에이전트 조정
- **대상**: pm-dhacle 서브에이전트 + 새 AI 온보딩
- **범위**: 프로젝트 전반적 규칙 및 서브에이전트 연결

#### **핵심 내용 구성**
```markdown
# 📋 Dhacle 프로젝트 AI 작업 가이드라인

## 🛑 프로젝트 전체 3단계 필수 규칙
### 1️⃣ STOP - 즉시 중단 신호
- any 타입 발견 → 즉시 중단
- 테이블 없이 기능 구현 시도 → 즉시 중단  
- TODO 주석 또는 임시방편 코드 → 즉시 중단

### 2️⃣ MUST - 필수 행동
- 작업 전 tutorial/quick-start.md 확인 필수
- 해당 영역 CLAUDE.md 지침 확인 필수
- 모든 작업 후 npm run verify:parallel 실행 필수

### 3️⃣ CHECK - 검증 필수  
- 빌드 성공: npm run build
- 타입 검사: npm run types:check
- 전체 검증: npm run verify:parallel

## 🤖 16개 서브에이전트 시스템
[각 서브에이전트 역할과 담당 영역, 해당 CLAUDE.md 위치]

## 📋 작업 시작 전 체크리스트
[새 AI가 반드시 확인해야 할 순서]
```

### **2. src/app/api/CLAUDE.md - API Route Agent**

#### **특화 내용**
```markdown  
# 🔌 API Route 개발 지침

## 🛑 API Route 3단계 필수 규칙
### 1️⃣ STOP - 즉시 중단 신호
- 세션 체크 없는 API 발견 → 중단
- any 타입 사용 → 중단
- 빈 배열/null 임시 반환 → 중단

### 2️⃣ MUST - 필수 행동
```typescript
// 모든 API Route 인증 패턴 필수
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
const supabase = await createSupabaseRouteHandlerClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
}

// Response 타입 정의 필수
type ApiResponse = { data: UserData[] } | { error: string };
```

### 3️⃣ CHECK - 검증 필수
```bash
npm run types:check
curl -X GET http://localhost:3000/api/[endpoint]
```

## 🚨 API Route 필수 패턴
### 패턴 1: 인증 + snake_case 변환
### 패턴 2: 에러 처리 표준화
### 패턴 3: Response 타입 안전성
```

### **3. src/components/CLAUDE.md - Component Agent**

#### **특화 내용**
```markdown
# 🧩 Component 개발 지침

## 🛑 컴포넌트 3단계 필수 규칙  
### 1️⃣ STOP - 즉시 중단 신호
- Props에 any 타입 → 중단
- 'use client' 남발 → 중단
- <button>, <div> 직접 사용 → 중단 (shadcn/ui 우선)

### 2️⃣ MUST - 필수 행동
```typescript
// Props 타입 정의 필수
interface Props {
  data: UserData;  // any 금지
  onChange: (value: string) => void;
  children: React.ReactNode;
}

// shadcn/ui 컴포넌트 우선 사용
import { Button } from '@/components/ui/button';

// Server Component 기본 (use client 최소화)
export default function ServerComponent() {
  return <Button>shadcn/ui 사용</Button>;
}
```

### 3️⃣ CHECK - 검증 필수
```bash
npm run types:check  
npm run dev  # 실제 렌더링 확인
```

## 🚨 컴포넌트 필수 패턴
### 패턴 1: shadcn/ui 우선 사용
### 패턴 2: Server Component 기본
### 패턴 3: 타입 안전 Props
```

### **4. src/types/CLAUDE.md - Type Agent**

#### **특화 내용**
```markdown
# 🔷 타입 시스템 개발 지침

## 🛑 타입 시스템 3단계 필수 규칙
### 1️⃣ STOP - 즉시 중단 신호
- any 타입 사용 → 즉시 중단 (biome 에러)
- database.generated 직접 import → 중단
- unknown 타입을 any로 캐스팅 → 중단

### 2️⃣ MUST - 필수 행동
```typescript
// @/types에서만 import (중앙화)
import { User, Post, snakeToCamelCase } from '@/types';

// 구체적 타입 정의 (any 대신)
interface YouTubeMetrics {
  viewCount: number;
  likeCount: number;
  channelTitle: string;
}

// 타입 가드 사용 (unknown 처리)
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

### 3️⃣ CHECK - 검증 필수
```bash
npm run types:check
npx biome check src/types/**/*.ts
```

## 🚨 타입 시스템 필수 패턴
### 패턴 1: @/types 중앙화
### 패턴 2: 구체적 타입 정의
### 패턴 3: 타입 가드 활용
```

---

## 📋 **전체 재작성 실행 계획**

### **Phase 1: 핵심 4개 CLAUDE.md 재작성** ⏰ 1시간
```
우선순위:
1. CLAUDE.md (루트) - 전체 가이드라인
2. src/app/api/CLAUDE.md - API Route Agent  
3. src/components/CLAUDE.md - Component Agent
4. src/types/CLAUDE.md - Type Agent
```

### **Phase 2: 나머지 11개 CLAUDE.md 재작성** ⏰ 1.5시간  
```
5. src/lib/security/CLAUDE.md - Security Agent
6. src/hooks/CLAUDE.md - Query Agent
7. tests/CLAUDE.md - Test Agent
8. src/app/(pages)/CLAUDE.md - Page Agent
9. src/lib/CLAUDE.md - Lib Agent
10. scripts/CLAUDE.md - Script Agent
11. docs/CLAUDE.md - Doc Agent
12. supabase/migrations/CLAUDE.md - Database Agent
13. current-state-backup 폴더들 정리 (삭제)
```

### **Phase 3: 검증 및 최종 확인** ⏰ 30분
```
- 모든 CLAUDE.md 3단계 구조 확인
- 서브에이전트별 역할 중복 없는지 확인
- 새 AI 관점에서 사용 가능한지 테스트
```

---

## ✅ **서브에이전트별 핵심 차단 규칙 정리**

### **공통 차단 규칙 (모든 서브에이전트)**
```
🔴 즉시 차단:
├── any 타입 사용 (biome 에러)
├── TODO 주석 또는 임시방편 코드  
├── Silent 에러 처리 (빈 catch 블록)
├── 실제 검증 없는 완료 선언
└── 테이블 없이 DB 작업 시작
```

### **서브에이전트별 특화 차단 규칙**
```
API Route Agent:
├── 🔴 세션 체크 없는 보호 API
├── 🔴 requireAuth() 함수 사용 (프로젝트에 없음)
├── 🔴 빈 배열/null 임시 반환
└── 🔴 snake_case 변환 누락

Component Agent:
├── 🔴 <button>, <div> 직접 사용 (shadcn/ui 우선)
├── 🔴 'use client' 남발 (Server Component 우선)
├── 🔴 Props any 타입
└── 🔴 이벤트 핸들러 any 타입

Type Agent:
├── 🔴 database.generated 직접 import
├── 🔴 any 타입 사용 (즉시 biome 에러)
├── 🔴 unknown을 any로 캐스팅
└── 🔴 @/types 중앙화 규칙 위반

Security Agent:
├── 🔴 RLS 정책 없는 테이블 생성
├── 🔴 process.env 직접 접근 (env.ts 사용 필수)
├── 🔴 innerHTML 직접 사용 (XSS 위험)
└── 🔴 하드코딩된 환경변수

Database Agent:
├── 🔴 22개 테이블 한번에 처리 (TypeScript 부하)
├── 🔴 RLS 없는 테이블 생성
├── 🔴 타입 생성 후 미실행 (npm run types:generate)
└── 🔴 service role 검증 미실행
```

---

## 🎯 **성공 기준 및 검증 방법**

### **각 CLAUDE.md 완성 기준**
- [ ] **구조 통일**: 표준 템플릿 구조 100% 준수
- [ ] **3단계 규칙**: STOP-MUST-CHECK 명확히 정의
- [ ] **any 타입 금지**: 서브에이전트별 구체적 사례 및 해결책
- [ ] **필수 패턴**: 해당 영역 핵심 패턴 3개 이상 코드로 제시
- [ ] **검증 명령어**: 실제 작동하는 검증 방법 제시
- [ ] **실행 가능성**: 가이드대로 따라하면 실제 작업 완료

### **전체 시스템 검증**
```bash
# 1. 모든 CLAUDE.md 3단계 구조 확인
grep -r "STOP\|MUST\|CHECK" */CLAUDE.md

# 2. any 타입 금지 섹션 확인  
grep -r "any 타입 금지" */CLAUDE.md

# 3. 필수 패턴 섹션 확인
grep -r "필수 패턴" */CLAUDE.md

# 4. 검증 명령어 섹션 확인
grep -r "검증 필수" */CLAUDE.md
```

### **새 AI 테스트 시나리오**
1. **루트 CLAUDE.md**로 전체 가이드라인 파악 가능
2. **영역별 CLAUDE.md**로 해당 작업 실수 없이 실행 가능
3. **16개 서브에이전트** 역할 구분 명확히 이해
4. **3단계 규칙** 적용하여 품질 높은 코드 작성

---

## 🚨 **주의사항 및 품질 보증**

### **절대 금지사항**
- ❌ 기존 CLAUDE.md 내용 복사-붙여넣기
- ❌ 서브에이전트별 특화 내용 누락
- ❌ 추상적 설명 (구체적 코드 예시 필수)  
- ❌ 검증되지 않은 명령어 포함

### **품질 보증 원칙**
- ✅ 모든 코드 예시는 실제 프로젝트에서 작동하는 것만
- ✅ 모든 검증 명령어는 실제 실행해서 확인된 것만
- ✅ 서브에이전트별 특화 내용 반드시 포함
- ✅ 새 AI 관점에서 이해 가능하도록 명확하게 작성

### **일관성 유지**
- 모든 CLAUDE.md 파일이 동일한 구조와 톤 유지
- 3단계 규칙의 표현 방식 통일
- any 타입 금지 섹션의 형식 통일
- 검증 명령어 섹션의 형식 통일

---

## 📋 **최종 체크리스트**

### **완료 확인사항**
- [ ] 15개 CLAUDE.md 파일 모두 새 구조로 재작성 완료
- [ ] 16개 서브에이전트 역할 명확히 구분 및 정의
- [ ] 모든 파일이 표준 템플릿 구조 준수
- [ ] 서브에이전트별 특화 차단 규칙 완전 정의
- [ ] 실제 작동하는 코드 예시 및 검증 명령어 포함
- [ ] 새 AI가 혼동하지 않을 정도로 명확하고 구체적 작성
- [ ] 기존 핵심 의도와 가치 100% 보존

### **성공 지표**
- 새 AI가 해당 CLAUDE.md만으로 영역별 작업 완벽 실행
- 16개 서브에이전트 자동 활성화 시 올바른 지침 적용  
- 3단계 규칙 적용으로 실수 패턴 반복 제로
- any 타입, TODO 주석, 임시방편 코드 생성 완전 차단

---

*이 가이드를 통해 16개 서브에이전트가 각자의 전문성을 발휘하면서도 일관된 품질 기준을 유지할 수 있도록 하세요. 각 CLAUDE.md는 해당 영역의 "완벽한 작업 매뉴얼"이 되어야 하며, 새 AI도 실수 없이 전문가 수준의 코드를 작성할 수 있어야 합니다.*