# ⚡ 30초 프로젝트 파악 - 새 AI 시작 가이드

## 📌 문서 관리 지침
**목적**: 새 AI 세션이 30초 내에 프로젝트 전체 상황을 파악하고 즉시 실수 없는 작업 시작  
**대상**: 모든 AI 어시스턴트 (Claude, GPT 등)  
**범위**: 프로젝트 현황, 핵심 규칙, 필수 명령어만 포함  
**업데이트 기준**: npm run verify:parallel 결과 변경 시 즉시 업데이트  
**최대 길이**: 3000 토큰 (현재 약 2500 토큰)  
**연관 문서**: [프로젝트 현황](../reference/project-status.md), [실수 패턴](../explanation/mistake-patterns.md)

## ⚠️ 금지사항
- 상세한 기술 스펙 추가 금지 (→ reference/ 문서로 이관)
- 튜토리얼 단계 확장 금지 (→ how-to/ 문서로 분리)
- 프로젝트 히스토리 추가 금지 (→ explanation/ 문서로 이관)

---

*30초 내에 디하클 프로젝트를 완전히 파악하고 실수 없이 작업 시작*

**프로젝트**: 디하클(Dhacle) - YouTube 크리에이터 도구  
**현재 상태**: Recovery Phase - 품질 개선 중 (검증 50% 성공)  
**기술 스택**: Next.js 15, Supabase, TypeScript  
**품질 현황**: 18% (136개 자산, API 18개 오류, Type 2개 오류)

---

## 🔥 절대 규칙 3가지 (위반 = 프로젝트 파괴)

### 1️⃣ any 타입 절대 금지
```typescript
❌ const data: any = response;
✅ const data: User[] = response;
```

### 2️⃣ TODO 주석 절대 금지  
```typescript
❌ // TODO: 나중에 구현
✅ // 완전 구현하거나 삭제
```

### 3️⃣ 임시방편 코드 절대 금지
```typescript
❌ return []; // 임시 데이터
✅ // 실제 로직 구현 또는 함수 삭제
```

**핵심 원칙**: `"대충 처리 = 2주간 에러 디버깅"`

---

## ⚡ 3단계 작업 프로세스 (필수)

```bash
1. STOP - 문제 발견 시 즉시 중단
2. FIX - 완전한 해결 (임시방편 금지)  
3. VERIFY - 실제 작동 확인
   npm run verify:parallel
   npm run types:check
```

---

## 🤖 16개 서브에이전트 시스템

**자동 활성화**: Edit/Write/MultiEdit 작업 시 파일 패턴으로 자동 활성화
- **API Route Agent**: `src/app/api/**` 작업 시
- **Component Agent**: `src/components/**` 작업 시  
- **Type Agent**: `*.ts, *.tsx` 작업 시
- **기타 13개**: 각 영역별 전문 에이전트 자동 차단/강제 적용

**즉시 차단**: any 타입, 임시방편, TODO 주석, 빈 함수

---

## 📋 첫 작업 시작 방법

### 1단계: 필수 검증
```bash
npm run verify:parallel
```
**예상 결과**: ❌ API 18개 오류, ❌ Types 2개 오류 (정상)

### 2단계: 작업 전 필수 확인
1. **실수 방지**: [explanation/mistake-patterns.md](../explanation/mistake-patterns.md) 확인
2. **현재 상태**: [reference/project-status.md](../reference/project-status.md) 확인  
3. **작업 가이드**: [how-to/api-development/create-new-route.md](../how-to/api-development/create-new-route.md) 등

### 3단계: 작업 시작
- **API 작업**: 인증 패턴 (`getUser()`) 필수
- **컴포넌트**: shadcn/ui 우선, Server Component 기본
- **테이블 생성**: RLS 정책 즉시 추가 필수
- **타입 정의**: `@/types`에서만 import

---

## ⚠️ 절대 하지 말 것

| ❌ 절대 금지 | 이유 | ✅ 올바른 방법 |
|-------------|------|--------------|
| `getSession()` 사용 | 프로젝트에 없는 함수 | `getUser()` 패턴 |
| `process.env.VAR` | 타입 안전하지 않음 | `env.ts` 사용 |
| `<button>` 직접 사용 | 일관성 부족 | `shadcn/ui` 컴포넌트 |
| `any` 타입 사용 | biome 에러 발생 | 구체적 타입 정의 |
| 자동 스크립트 생성 | "에러 지옥" 경험 | 수동 수정만 |

---

## 🎯 다음 단계

**작업 완료 후 반드시**:
```bash
npm run verify:parallel  # 검증 통과 필수
npm run types:check      # 타입 체크
```

**더 자세한 내용**:
- 🚨 **실수 방지**: [mistake-patterns.md](../explanation/mistake-patterns.md)
- 📊 **프로젝트 현황**: [project-status.md](../reference/project-status.md)  
- 🛠️ **실무 가이드**: [how-to 섹션](../how-to/)
- 📚 **기술 참조**: [reference 섹션](../reference/)

---

**🎉 준비 완료! 이제 실수 없는 작업을 시작하세요!**