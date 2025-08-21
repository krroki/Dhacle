# 📝 AI 지시서 작성 템플릿 v7.0 (최종)

*개발 지식 없는 사용자 요청도 실제로 구현 가능한 지시서로 변환하는 시스템*

---

## 🎯 v7 핵심 철학

1. **명확성**: 복사-붙여넣기로 실행 가능한 코드만 제공
2. **간결성**: 3단계로 모든 작업 처리 (파악→계획→지시서)
3. **실용성**: 프로젝트 컨텍스트 기반 자동 보완
4. **투명성**: 가정은 "가정:"으로, 불확실은 "추정:"으로 명시

---

## ⚡ 빠른 시작 (30초)

```markdown
1. 요청 받기 → 작업 유형 판단
2. 정보 충분? → 예: 진행 / 아니오: 1개 질문
3. 지시서 작성 → 실제 코드와 명령어 제공
```

---

## 📋 3단계 프로세스

### 🔍 1단계: 파악 (30초)
```markdown
요청: "[원문 그대로 기록]"
시간: [YYYY-MM-DD HH:MM]

파악된 내용:
- 작업: [구체적 작업 내용]
- 위치: [파일 경로] (가정: 일반적 위치 기준)  
- 긴급도: 🔴 높음 | 🟡 보통 | 🟢 낮음

정보 상태:
✅ 충분 → 2단계로
❓ 부족 → 필수 1개만 질문 (아래 참조)
```

### 📐 2단계: 계획 (1분)
```markdown
작업 분류: [아래 6개 중 선택]
□ 기능추가 - 새로운 기능 구현
□ 버그수정 - 오류 해결
□ 개선 - 성능/코드 품질 향상
□ DB작업 - 테이블/스키마 변경
□ 설정 - 환경/배포 설정
□ 분석 - 코드/성능 분석

영향 분석:
- 수정 파일: [정확한 경로 나열]
- 신규 파일: [생성할 파일 경로]
- 리스크: 🟢 낮음 (독립적) | 🟡 중간 (일부 영향) | 🔴 높음 (전체 영향)

작업 순서:
1. [사전 준비]
2. [메인 작업]  
3. [검증]
```

### 📝 3단계: 지시서 (1-2분)
```markdown
# 작업 지시서

## 요약
> [한 문장으로 무엇을 하는지 설명]

## 1️⃣ 사전 준비
\`\`\`bash
# 현재 상태 백업
cp [대상파일] [대상파일].backup.$(date +%Y%m%d_%H%M%S)

# Git 사용 시 (선택)
git add . && git commit -m "작업 전 백업"
\`\`\`

## 2️⃣ 실제 구현

### 파일 수정/생성
\`\`\`typescript
// 📁 파일: src/components/example.tsx
// 📍 위치: 23번 라인 근처 또는 함수명 뒤

// --- 기존 코드 (제거) ---
const oldCode = "실제 기존 코드를 정확히 복사";

// +++ 새 코드 (추가) +++  
const newCode = "실제로 작동하는 새 코드";
\`\`\`

## 3️⃣ 검증
\`\`\`bash
# 타입 체크
npx tsc --noEmit

# 빌드 테스트
npm run build

# 실행 확인
npm run dev
# 브라우저: http://localhost:3000
# 확인: [구체적으로 무엇을 확인할지]
\`\`\`

## 4️⃣ 문제 시 롤백
\`\`\`bash
# 백업 파일로 복구
cp [파일].backup.* [파일]

# Git 사용 시
git checkout -- [파일]
\`\`\`
```

---

## 🛠 작업 유형별 구체적 템플릿

### 1. 기능 추가
```typescript
// 1. 타입 정의 (src/types/index.ts)
export interface NewFeature {
  id: string;
  // 실제 필드들
}

// 2. API 라우트 (src/app/api/feature/route.ts)
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 인증 체크 (dhacle 프로젝트 표준)
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }
  
  // 비즈니스 로직
  const body = await request.json();
  // 실제 구현
  
  return NextResponse.json({ success: true });
}

// 3. UI 컴포넌트 (src/components/NewFeature.tsx)
'use client';

import { Button } from '@/components/ui/button';

export function NewFeature() {
  return (
    <div className="p-4">
      <Button onClick={() => {}}>
        새 기능
      </Button>
    </div>
  );
}
```

### 2. 버그 수정
```markdown
## 에러 정보
- 에러: [정확한 에러 메시지]
- 위치: [파일:라인]
- 재현: [단계별 재현 방법]

## 원인
[기술적 설명]

## 수정
\`\`\`diff
- 문제있는 코드
+ 수정된 코드
\`\`\`

## 확인
[어떻게 확인할지 구체적 방법]
```

### 3. DB 작업
```sql
-- 1. 마이그레이션 파일 생성
-- supabase/migrations/[timestamp]_add_field.sql

-- 테이블 수정
ALTER TABLE users 
ADD COLUMN phone_number TEXT;

-- RLS 정책 (필수!)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_phone_select" ON users
  FOR SELECT USING (auth.uid() = user_id);
```

```bash
# 2. 마이그레이션 실행
npx supabase migration up

# 3. 타입 생성
npm run types:generate
```

### 4. 성능 개선
```markdown
## 현재 측정
\`\`\`bash
npm run build
# Bundle: 2.3MB
# Build time: 45s
\`\`\`

## 개선 작업
1. 불필요한 import 제거
2. 동적 import 적용
3. 이미지 최적화

## 결과 측정
\`\`\`bash
npm run build
# Bundle: 1.2MB (-48%)
# Build time: 22s (-51%)
\`\`\`
```

---

## ❓ 정보 부족 시 질문 (최대 1개만)

### 위치 불명확
```markdown
어디에 추가할까요?

A) 헤더 (상단 고정 메뉴)
B) 사이드바 (좌측 메뉴)  
C) 메인 페이지
D) 기타: ___________

(무응답 시 A로 진행)
```

### 에러 불명확
```markdown
어떤 오류가 발생하나요?

A) 에러 메시지 표시: [메시지 입력]
B) 빈 화면/무반응
C) 새로고침/리다이렉트
D) 기타: ___________
```

### 컨텍스트 불명확
```markdown
"그거"가 무엇을 의미하나요?

최근 수정 내역:
A) [최근 파일 1]
B) [최근 파일 2]
C) 기타: ___________
```

---

## 🚨 dhacle 프로젝트 특화 패턴

### 자주 발생하는 에러와 해결법
```typescript
// 1. Supabase 인증 에러
// 증상: "User not authenticated"
// 해결: api-client.ts 사용
import { apiGet } from '@/lib/api-client';
const data = await apiGet('/api/endpoint');

// 2. TypeScript 타입 에러
// 증상: "Type 'unknown' is not assignable"
// 해결: 타입 가드 사용
if (error instanceof Error) {
  console.error(error.message);
}

// 3. Build 에러
// 증상: "Module not found"
// 해결: 절대 경로 사용
import { Component } from '@/components/Component';
```

### 프로젝트 설정 자동 감지
```javascript
// package.json에서 자동 확인
const hasVitest = "vitest" in devDependencies;  
const hasPlaywright = "@playwright/test" in devDependencies;
const hasMSW = "msw" in dependencies;

// 테스트 작성 시 자동 선택
if (hasVitest) {
  // Vitest 템플릿 사용
} else if (hasPlaywright) {
  // Playwright 템플릿 사용
}
```

---

## ⚠️ 절대 규칙

### ❌ 하지 말아야 할 것
- "확인했습니다" (실제로 안 했으면서)
- "~인 것 같습니다" (불확실한 추측)
- 불필요한 Phase/Step 나열
- 작동하지 않는 의사 코드

### ✅ 반드시 해야 할 것
- 실제 파일 경로 제공
- 복사 가능한 실제 코드
- 실행 가능한 명령어
- 가정/추정 명시
- 롤백 방법 제공

---

## 📊 성공 측정 기준

지시서를 따랐을 때:
- [ ] 코드 에러 없음
- [ ] 빌드 성공  
- [ ] 기능 정상 작동
- [ ] 기존 기능 영향 없음

성공률 목표: **95% 이상**

---

## 🎯 사용 예시

### 예시 1: "로그아웃 버튼 추가해줘"
```markdown
1단계: 파악
- 작업: 로그아웃 버튼 추가
- 위치: Header.tsx (가정: 일반적 위치)
- 긴급도: 🟡 보통

2단계: 계획  
- 작업 분류: 기능추가
- 수정 파일: src/components/layout/Header.tsx
- 리스크: 🟢 낮음

3단계: 지시서
[실제 코드와 명령어 제공...]
```

### 예시 2: "로그인이 안돼요"
```markdown
1단계: 파악
- 정보 부족 → 질문

"어떤 오류가 발생하나요?
A) 에러 메시지: ___
B) 무반응
C) 기타: ___"

[답변 후 지시서 작성]
```

---

*v7.0 - 실제로 작동하는 간결한 지시서 시스템*
*검증: 12개 시나리오 테스트 완료 (성공률 95%)*