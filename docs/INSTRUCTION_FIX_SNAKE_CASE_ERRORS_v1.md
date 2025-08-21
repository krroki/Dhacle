# 🚨 긴급 수정 지시서: snake_case 마이그레이션 오류 복구 및 경계 변환 시스템 구축

## 🚀 추천 실행 명령어
```bash
# 복잡도: Complex (긴급 핫픽스 + 시스템 재설계)
/sc:troubleshoot --seq --ultrathink --validate --c7
"이 지시서를 읽고 snake_case 마이그레이션으로 인한 displayName 등 라이브러리 필드 오류를 즉시 복구하고 경계 변환 시스템을 구축하세요"

# 빠른 핫픽스만 (긴급)
/sc:troubleshoot --seq --validate
"Step 2의 즉시 조치만 먼저 실행하여 displayName 오류 복구"
```

## 📚 온보딩 섹션 (필수)
### 필수 읽기 문서
- [ ] `/CLAUDE.md` 143-302행 - TypeScript 타입 관리 시스템 (snake/camel 변환 이해)
- [ ] `/CLAUDE.md` 54-71행 - 절대 금지사항 (any 타입 금지 등)
- [ ] `/docs/PROJECT.md` - 현재 snake_case 마이그레이션 이슈 확인
- [ ] `/docs/DATA_MODEL.md` - 데이터베이스 스키마와 타입 매핑 확인

### 프로젝트 컨텍스트
```bash
# 현재 상태 파악
grep -r "\.display_name\b" src --include="*.tsx" --include="*.ts" | wc -l  # 오염 파일 수
grep -r "class_name\|html_for\|on_click" src --include="*.tsx" | wc -l     # JSX 오염 확인

# 기술 스택 확인
cat package.json | grep "@radix-ui\|shadcn"  # UI 라이브러리 확인
cat tsconfig.json | grep "strict"            # TypeScript 설정 확인

# 영향 범위 파악
find src/components/ui -name "*.tsx" | wc -l  # shadcn 컴포넌트 수
find src -name "*.tsx" -exec grep -l "displayName" {} \; | wc -l  # 원래 displayName 사용 파일
```

### 작업 관련 핵심 정보
- 프레임워크: Next.js 14 (App Router), React 18
- UI 라이브러리: shadcn/ui (Radix UI 기반)
- 타입 시스템: TypeScript strict mode
- **문제**: 전역 snake_case 변환이 React/라이브러리 필드까지 변경
- **영향**: displayName, htmlFor, className 등 예약 필드 손상

## 📌 목적
DB/API 통신을 위한 snake_case 통일 과정에서 잘못 변경된 React/라이브러리 필드를 복구하고, 향후 재발 방지를 위한 경계 변환 시스템을 구축

## 🤖 실행 AI 역할
1. 긴급 복구 전문가: 손상된 라이브러리 필드 즉시 원복
2. 시스템 설계자: API 경계 변환 레이어 구축
3. 품질 보증자: ESLint 규칙 및 CI 검증 추가

---

## Step 1: 문제 진단 및 영향 범위 파악

### 1.1 오염된 파일 목록 생성
```bash
# displayName 오염 파일 찾기
grep -r "\.display_name\b" src --include="*.tsx" --include="*.ts" -l > /tmp/display_name_files.txt

# JSX 예약 속성 오염 파일 찾기
grep -r "class_name\|html_for\|on_click\|on_change\|default_value" src --include="*.tsx" -l > /tmp/jsx_polluted_files.txt

# 서드파티 타입 오염 확인
grep -r "error_code\|content_type\|is_active" src/types --include="*.ts" -l > /tmp/type_polluted_files.txt
```

### 1.2 영향 범위 확인
```bash
# 총 영향 파일 수
cat /tmp/display_name_files.txt /tmp/jsx_polluted_files.txt /tmp/type_polluted_files.txt | sort -u | wc -l

# shadcn 컴포넌트 영향 확인
grep -r "display_name" src/components/ui --include="*.tsx" -l | head -10
```

---

## Step 2: 즉시 조치 (핫픽스) - 최우선 실행 ⚡

### 2.1 displayName 전역 복구
```bash
# 백업 생성 (필수!)
git stash
git checkout -b hotfix/restore-display-names

# displayName 복구 스크립트 생성 및 실행
cat > /tmp/fix-display-names.sh << 'EOF'
#!/bin/bash
# displayName 복구 스크립트

echo "🔧 displayName 복구 시작..."

# src/components 내 모든 파일에서 display_name을 displayName으로 복구
find src/components -name "*.tsx" -o -name "*.ts" | while read -r file; do
  if grep -q "\.display_name\b" "$file"; then
    echo "수정 중: $file"
    # macOS
    sed -i '' 's/\.display_name\b/.displayName/g' "$file"
    # Linux: sed -i 's/\.display_name\b/.displayName/g' "$file"
  fi
done

echo "✅ displayName 복구 완료"
EOF

chmod +x /tmp/fix-display-names.sh
/tmp/fix-display-names.sh
```

### 2.2 JSX 예약 속성 복구
```bash
# JSX 속성 복구 스크립트
cat > /tmp/fix-jsx-attrs.sh << 'EOF'
#!/bin/bash
# JSX 예약 속성 복구

declare -A replacements=(
  ["class_name"]="className"
  ["html_for"]="htmlFor"
  ["on_click"]="onClick"
  ["on_change"]="onChange"
  ["on_submit"]="onSubmit"
  ["default_value"]="defaultValue"
  ["default_checked"]="defaultChecked"
)

for old in "${!replacements[@]}"; do
  new="${replacements[$old]}"
  echo "🔄 $old → $new 변환 중..."
  
  find src -name "*.tsx" | while read -r file; do
    if grep -q "\b$old\b" "$file"; then
      echo "  수정: $file"
      # macOS
      sed -i '' "s/\b$old\b/$new/g" "$file"
      # Linux: sed -i "s/\b$old\b/$new/g" "$file"
    fi
  done
done

echo "✅ JSX 속성 복구 완료"
EOF

chmod +x /tmp/fix-jsx-attrs.sh
/tmp/fix-jsx-attrs.sh
```

### 2.3 컴포넌트 정적 필드 검증 및 수정

**대상 파일들** (특히 주의):
- `src/components/ui/accordion.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/tabs.tsx`

각 파일에서 다음 패턴 확인 및 수정:
```typescript
// ❌ 잘못된 패턴
AccordionTrigger.display_name = "AccordionTrigger"

// ✅ 올바른 패턴
AccordionTrigger.displayName = "AccordionTrigger"
```

---

## Step 3: 단기 조치 - 경계 변환 레이어 구축

### 3.1 변환 유틸리티 생성
파일: `src/lib/utils/case-converter.ts` (새 파일)
```typescript
/**
 * API 경계에서만 사용하는 snake/camel 변환 유틸리티
 * 주의: 컴포넌트나 라이브러리 코드에서는 절대 사용 금지!
 */

// 예약어 및 변환 제외 목록
const RESERVED_KEYS = new Set([
  'displayName',
  'className',
  'htmlFor',
  'onClick',
  'onChange',
  'onSubmit',
  'defaultValue',
  'defaultChecked',
  'aria-label',
  'data-testid'
]);

export const snakeToCamel = (obj: unknown): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj instanceof Date) return obj;
  
  if (typeof obj === 'object') {
    return Object.entries(obj as Record<string, any>).reduce((acc, [key, value]) => {
      // snake_case를 camelCase로 변환
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      acc[camelKey] = snakeToCamel(value);
      return acc;
    }, {} as Record<string, any>);
  }
  
  return obj;
};

export const camelToSnake = (obj: unknown): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (obj instanceof Date) return obj.toISOString();
  
  if (typeof obj === 'object') {
    return Object.entries(obj as Record<string, any>).reduce((acc, [key, value]) => {
      // 예약어는 변환하지 않음
      if (RESERVED_KEYS.has(key)) {
        acc[key] = value;
        return acc;
      }
      
      // camelCase를 snake_case로 변환
      const snakeKey = key
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '');
      
      acc[snakeKey] = camelToSnake(value);
      return acc;
    }, {} as Record<string, any>);
  }
  
  return obj;
};
```

### 3.2 API 클라이언트 수정
파일: `src/lib/api-client.ts`
```typescript
import { snakeToCamel, camelToSnake } from '@/lib/utils/case-converter';

// 기존 apiGet 함수 수정 (예시)
export async function apiGet<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  // API 응답을 camelCase로 변환
  return snakeToCamel(data) as T;
}

// apiPost 수정 (예시)
export async function apiPost<T = any>(
  endpoint: string,
  body?: any,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    // 요청 데이터를 snake_case로 변환
    body: body ? JSON.stringify(camelToSnake(body)) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return snakeToCamel(data) as T;
}
```

### 3.3 타입 정의 정리
파일: `src/types/index.ts`
```typescript
// API/DB용 snake_case 타입과 앱 내부용 camelCase 타입 분리

// DB/API 타입 (snake_case)
export interface UserDTO {
  user_id: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
}

// 앱 내부 타입 (camelCase)
export interface User {
  userId: string;
  displayName: string;  // React 컴포넌트의 displayName과 다름!
  isActive: boolean;
  createdAt: string;
}

// 변환 함수 타입
export function toUser(dto: UserDTO): User {
  return {
    userId: dto.user_id,
    displayName: dto.display_name,
    isActive: dto.is_active,
    createdAt: dto.created_at
  };
}
```

---

## Step 4: 재발 방지 - 린팅 및 CI 설정

### 4.1 ESLint 규칙 추가
파일: `.eslintrc.js` 또는 `eslint.config.js`
```javascript
module.exports = {
  // ... 기존 설정
  rules: {
    // ... 기존 규칙
    
    // React 컴포넌트 displayName 강제
    'react/display-name': 'error',
    
    // 네이밍 컨벤션
    '@typescript-eslint/naming-convention': [
      'error',
      // 일반 변수는 camelCase
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE']
      },
      // 함수는 camelCase
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase']
      },
      // React 컴포넌트 정적 프로퍼티 예외
      {
        selector: 'property',
        filter: {
          regex: '^displayName$',
          match: true
        },
        format: ['camelCase']
      }
    ],
    
    // 금지 패턴 커스텀 규칙
    'no-restricted-syntax': [
      'error',
      {
        selector: 'MemberExpression[property.name="display_name"]',
        message: 'displayName을 display_name으로 쓰지 마세요!'
      },
      {
        selector: 'JSXAttribute[name.name="class_name"]',
        message: 'className을 class_name으로 쓰지 마세요!'
      }
    ]
  }
};
```

### 4.2 pre-commit 훅 추가
파일: `.husky/pre-commit`
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 금지 패턴 검사
echo "🔍 금지 패턴 검사 중..."

# display_name 검사
if grep -r "\.display_name\b" src --include="*.tsx" --include="*.ts" --quiet; then
  echo "❌ 오류: display_name 사용이 감지되었습니다. displayName을 사용하세요."
  exit 1
fi

# JSX 속성 검사
if grep -r "class_name\|html_for\|on_click" src --include="*.tsx" --quiet; then
  echo "❌ 오류: snake_case JSX 속성이 감지되었습니다."
  exit 1
fi

echo "✅ 패턴 검사 통과"

# 기존 검사들
npm run types:check
npm run lint
```

---

## Step 5: 검증 및 테스트

### 5.1 자동 검증 스크립트
파일: `scripts/verify-case-consistency.js` (새 파일)
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 케이스 일관성 검증 시작...\n');

let errors = [];

// React 컴포넌트 displayName 검사
const componentFiles = glob.sync('src/components/**/*.tsx');
componentFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('.display_name')) {
    errors.push({
      file,
      issue: 'display_name 사용 (displayName 사용 필요)',
      line: content.split('\n').findIndex(line => line.includes('.display_name')) + 1
    });
  }
});

// JSX 속성 검사
const jsxFiles = glob.sync('src/**/*.tsx');
const bannedAttrs = ['class_name', 'html_for', 'on_click', 'on_change'];

jsxFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  bannedAttrs.forEach(attr => {
    if (content.includes(attr)) {
      errors.push({
        file,
        issue: `${attr} 사용 금지`,
        line: content.split('\n').findIndex(line => line.includes(attr)) + 1
      });
    }
  });
});

// 결과 출력
if (errors.length > 0) {
  console.error('❌ 케이스 일관성 오류 발견:\n');
  errors.forEach(({file, issue, line}) => {
    console.error(`  ${file}:${line} - ${issue}`);
  });
  process.exit(1);
} else {
  console.log('✅ 모든 검사 통과!');
}
```

### 5.2 수동 검증 체크리스트
```markdown
## 검증 체크리스트

### React/UI 검증
- [ ] React DevTools에서 컴포넌트 displayName 정상 표시
- [ ] shadcn 컴포넌트 정상 렌더링
- [ ] Accordion, Dialog, Select 등 복잡한 컴포넌트 동작
- [ ] 폼 입력 필드 정상 동작

### API 통신 검증
- [ ] GET 요청: snake_case 응답 → camelCase 변환 확인
- [ ] POST 요청: camelCase 데이터 → snake_case 변환 확인
- [ ] 에러 응답 처리 정상

### TypeScript 검증
- [ ] 타입 체크 통과: `npm run types:check`
- [ ] 빌드 성공: `npm run build`
- [ ] 런타임 에러 없음
```

---

## Step 6: QA 테스트 시나리오 🆕

### 6.1 핵심 사용자 시나리오

#### 정상 플로우 테스트
```markdown
1. **컴포넌트 렌더링 테스트**
   - Step 1: 메인 페이지 접속
   - Step 2: Accordion 컴포넌트 클릭하여 열기/닫기
   - Step 3: Dialog 모달 열기/닫기
   - Step 4: Select 드롭다운 선택
   
   **검증 포인트**:
   ✅ React DevTools에 컴포넌트 이름 정상 표시
   ✅ 콘솔 에러 없음
   ✅ 모든 인터랙션 정상 동작

2. **API 통신 테스트**
   - Step 1: 로그인 수행
   - Step 2: 프로필 데이터 로드
   - Step 3: 프로필 수정 및 저장
   
   **검증 포인트**:
   ✅ 네트워크 탭에서 snake_case 요청/응답 확인
   ✅ UI에서 camelCase 데이터 정상 표시
   ✅ 저장 후 데이터 일치
```

#### 엣지 케이스 테스트
```markdown
| 테스트 항목 | 시나리오 | 예상 결과 | 실제 결과 |
|------------|---------|-----------|----------|
| 중첩 객체 | API에서 깊은 중첩 데이터 수신 | 모든 레벨 변환 | ☐ |
| 배열 데이터 | 컬렉션 목록 조회 | 각 항목 변환 | ☐ |
| null 값 | null/undefined 필드 | 정상 처리 | ☐ |
| 특수 문자 키 | aria-label 등 | 변환 제외 | ☐ |
| Date 객체 | 날짜 필드 | ISO 문자열 변환 | ☐ |
```

### 6.2 성능 측정
```markdown
### 변환 오버헤드 측정
⚡ 100개 객체 변환: < 10ms
⚡ 1000개 객체 변환: < 100ms
⚡ 메모리 증가: < 5MB
```

### 6.3 회귀 테스트
```markdown
### 영향 범위 확인
☑ 모든 shadcn 컴포넌트 정상 동작
☑ 기존 API 엔드포인트 호환성
☑ TypeScript 타입 체크 통과
☑ 프로덕션 빌드 성공
```

---

## 성공 기준

### 즉시 목표 (Step 2 완료 시)
☑ displayName 오류 100% 해결
☑ JSX 속성 정상화
☑ 빌드 및 런타임 에러 제거
☑ React DevTools 정상 표시

### 단기 목표 (Step 3 완료 시)
☑ API 경계 변환 레이어 구축
☑ snake/camel 자동 변환 동작
☑ 타입 안정성 확보

### 장기 목표 (Step 4-5 완료 시)
☑ ESLint 자동 검증
☑ CI/CD 파이프라인 통합
☑ 재발 방지 시스템 구축

---

## 롤백 계획

만약 문제 발생 시:
```bash
# 변경사항 되돌리기
git stash
git checkout main

# 또는 커밋 했다면
git revert HEAD

# 긴급 배포 필요 시
git checkout -b emergency-fix main
# 최소한의 수정만 적용
```

---

## 🚨 주의사항

1. **절대 전역 치환 금지**: find/replace all 사용 금지
2. **API 경계에서만 변환**: 컴포넌트 내부에서 변환 함수 사용 금지
3. **라이브러리 코드 수정 금지**: node_modules나 외부 타입 수정 금지
4. **단계적 적용**: 핫픽스 먼저, 그 다음 시스템 개선
5. **백업 필수**: 작업 전 반드시 git stash 또는 브랜치 생성

---

## 커뮤니케이션 포인트

작업 진행 상황을 다음과 같이 보고하세요:
```markdown
## 진행 상황 보고

### ✅ 완료
- [ ] Step 2.1: displayName 복구 (X개 파일)
- [ ] Step 2.2: JSX 속성 복구 (Y개 파일)
- [ ] Step 2.3: 컴포넌트 검증

### 🔄 진행 중
- [ ] Step 3: 경계 변환 레이어 구축

### 📋 대기
- [ ] Step 4: ESLint 설정
- [ ] Step 5: 검증
- [ ] Step 6: QA 테스트

### 🚨 이슈
- (발견된 문제 기록)
```

---

*이 지시서는 snake_case 마이그레이션 오류를 체계적으로 해결하기 위한 완전한 가이드입니다.*
*우선순위: Step 2 (핫픽스) → Step 3 (시스템 개선) → Step 4-6 (품질 보증)*