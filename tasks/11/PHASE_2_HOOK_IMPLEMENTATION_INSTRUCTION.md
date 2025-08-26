/sc:implement --seq --validate --c7 --evidence --safe-mode

# Claude Code Hook System Phase 2 구현 지시서

## 🎯 목표
Phase 1에서 구현한 3개 핵심 Hook(no-any-type, no-todo-comments, no-empty-catch)에 이어, Phase 2 우선순위 Hook 3개를 추가 구현하여 Dhacle 프로젝트의 코드 품질을 강화한다.

## 📋 구현 대상 Hook (우선순위 순)

### 1. no-console-log Hook
- **목적**: 프로덕션 코드에서 console.log 제거
- **현재 상태**: 63개 console.log 발견됨
- **예상 효과**: 성능 개선, 보안 강화

### 2. require-session-check Hook  
- **목적**: API Route에서 세션 체크 강제
- **현재 상태**: requireAuth 미사용 API Route 존재
- **예상 효과**: 보안 취약점 예방

### 3. no-snake-case Hook
- **목적**: snake_case 변수명 차단
- **현재 상태**: middleware.ts 등에서 사용 중
- **예상 효과**: 일관된 코딩 스타일

## 🛑 프로젝트 특수 규칙

### 절대 준수 사항
1. **임시방편 금지**: TODO, FIXME 주석 절대 금지
2. **any 타입 금지**: TypeScript any 타입 사용 금지  
3. **빈 catch 금지**: 에러 처리 없는 catch 블록 금지
4. **실제 작동 검증**: 구현 후 실제 테스트 필수

### Hook 시스템 특수 규칙
1. **JSON 통신**: stdin/stdout JSON 프로토콜 사용
2. **Exit Code 2**: 작업 차단 시 exit(2) 반환
3. **Whitelist**: @allow-* 주석으로 예외 허용
4. **Emergency Disable**: CLAUDE_HOOKS_ENABLED=false로 비활성화

## 📁 프로젝트 구조

```
.claude/
├── hooks/
│   ├── validators/
│   │   ├── no-any-type.js         ✅ (구현완료)
│   │   ├── no-todo-comments.js    ✅ (구현완료)
│   │   ├── no-empty-catch.js      ✅ (구현완료)
│   │   ├── no-console-log.js      🔄 (Phase 2-1)
│   │   ├── require-session-check.js 🔄 (Phase 2-2)
│   │   └── no-snake-case.js       🔄 (Phase 2-3)
│   ├── main-validator.js          ✅ (구현완료)
│   ├── test-hooks.js              ✅ (구현완료)
│   └── emergency-disable.js       ✅ (구현완료)
└── settings.json                   ✅ (구성완료)
```

## 🔍 현재 코드베이스 분석 결과

### console.log 사용 현황 (63개)
```javascript
// 주요 파일들
src/app/api/youtube-lens/admin/channels/route.ts: 4개
src/app/api/revenue-proof/route.ts: 3개
src/app/api/youtube/search/route.ts: 2개
// ... 기타 API Route들
```

### snake_case 변수 현황
```typescript
// middleware.ts
const cors_options = {...}
const rate_limit_config = {...}
const security_headers = {...}
```

### API Route 세션 체크 누락
```typescript
// 세션 체크 없는 API Route 예시
export async function GET(request: NextRequest) {
  // requireAuth 없이 직접 처리
  const data = await fetchData();
  return NextResponse.json(data);
}
```

## 💻 구현 상세

### Phase 2-1: no-console-log.js

```javascript
#!/usr/bin/env node

const fs = require('fs');

// Console 메서드 패턴
const CONSOLE_PATTERNS = [
  {
    pattern: /console\.(log|warn|error|info|debug|trace|table|time|timeEnd)\s*\(/g,
    type: 'method-call'
  }
];

// Whitelist 패턴  
const WHITELIST = {
  patterns: [
    /\.test\.[jt]sx?$/,
    /\.spec\.[jt]sx?$/,
    /scripts\//,
    /test-/
  ],
  markers: [
    /@allow-console/i,
    /@keep-console/i,
    /@dev-only/i
  ]
};

function findConsoleUsage(content, filePath) {
  // Development 파일 제외
  if (WHITELIST.patterns.some(p => p.test(filePath))) {
    return [];
  }
  
  const violations = [];
  const lines = content.split('\n');
  
  for (const { pattern, type } of CONSOLE_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    
    while ((match = pattern.exec(content)) !== null) {
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      const lineIndex = lineNumber - 1;
      
      // Whitelist 체크
      if (WHITELIST.markers.some(m => m.test(lines[lineIndex]))) {
        continue;
      }
      
      // 이전 라인에서도 whitelist 체크
      if (lineIndex > 0 && WHITELIST.markers.some(m => m.test(lines[lineIndex - 1]))) {
        continue;
      }
      
      violations.push({
        line: lineNumber,
        method: match[0],
        text: lines[lineIndex].trim()
      });
    }
  }
  
  return violations;
}

function validateContent(input) {
  const { tool_name, tool_input } = input;
  
  if (!['Write', 'Edit', 'MultiEdit'].includes(tool_name)) {
    return { pass: true };
  }
  
  let content = '';
  let filePath = '';
  
  if (tool_name === 'Write' || tool_name === 'Edit') {
    content = tool_input.content || tool_input.new_string || '';
    filePath = tool_input.file_path || '';
  } else if (tool_name === 'MultiEdit') {
    const allViolations = [];
    filePath = tool_input.file_path || '';
    
    for (const edit of (tool_input.edits || [])) {
      const violations = findConsoleUsage(edit.new_string || '', filePath);
      allViolations.push(...violations);
    }
    
    if (allViolations.length > 0) {
      return { pass: false, violations: allViolations, filePath };
    }
    return { pass: true };
  }
  
  const violations = findConsoleUsage(content, filePath);
  
  if (violations.length > 0) {
    return { pass: false, violations, filePath };
  }
  
  return { pass: true };
}

// Main execution
if (require.main === module) {
  let input;
  
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf-8'));
  } catch (error) {
    console.error('Failed to parse input:', error.message);
    process.exit(1);
  }
  
  const result = validateContent(input);
  
  if (!result.pass) {
    const output = {
      decision: "block",
      reason: `🚫 console.* statements detected in ${result.filePath}

Found ${result.violations.length} console usage(s):
${result.violations.slice(0, 3).map(v => 
  `  Line ${v.line}: ${v.method}`
).join('\n')}${result.violations.length > 3 ? `\n  ... and ${result.violations.length - 3} more` : ''}

✅ Solutions:
1. Use proper logging library (winston, pino)
2. Remove debug statements before commit
3. Add @allow-console if necessary for development
4. Use environment-based logging

💡 For production logging, use:
- Error tracking: Sentry
- Analytics: PostHog
- Server logs: Structured logging`
    };
    
    console.log(JSON.stringify(output));
    process.exit(0);
  }
  
  process.exit(0);
}

module.exports = { validateContent, findConsoleUsage };
```

### Phase 2-2: require-session-check.js

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// API Route 파일 패턴
const API_ROUTE_PATTERN = /src[\\\/]app[\\\/]api[\\\/].*route\.(ts|js|tsx|jsx)$/;

// Public endpoints whitelist
const PUBLIC_ENDPOINTS = [
  '/api/auth/callback',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/webhook',
  '/api/public'
];

// Session check 패턴
const SESSION_CHECK_PATTERNS = [
  /requireAuth\s*\(/,
  /getServerSession\s*\(/,
  /supabase\.auth\.getUser\s*\(/,
  /supabase\.auth\.getSession\s*\(/,
  /@public/i  // Public API 마커
];

function isPublicEndpoint(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return PUBLIC_ENDPOINTS.some(endpoint => 
    normalizedPath.includes(endpoint.replace(/^\/api/, ''))
  );
}

function hasSessionCheck(content) {
  return SESSION_CHECK_PATTERNS.some(pattern => pattern.test(content));
}

function validateApiRoute(content, filePath) {
  // Public endpoint는 제외
  if (isPublicEndpoint(filePath)) {
    return [];
  }
  
  // 세션 체크 있으면 통과
  if (hasSessionCheck(content)) {
    return [];
  }
  
  // HTTP 메서드 찾기
  const methodPattern = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s*\(/g;
  const violations = [];
  let match;
  
  while ((match = methodPattern.exec(content)) !== null) {
    const beforeMatch = content.substring(0, match.index);
    const lineNumber = beforeMatch.split('\n').length;
    
    violations.push({
      line: lineNumber,
      method: match[1],
      text: `${match[1]} handler without session check`
    });
  }
  
  return violations;
}

function validateContent(input) {
  const { tool_name, tool_input } = input;
  
  if (!['Write', 'Edit', 'MultiEdit'].includes(tool_name)) {
    return { pass: true };
  }
  
  const filePath = tool_input.file_path || '';
  
  // API Route 파일인지 체크
  if (!API_ROUTE_PATTERN.test(filePath)) {
    return { pass: true };
  }
  
  let content = '';
  
  if (tool_name === 'Write') {
    content = tool_input.content || '';
  } else if (tool_name === 'Edit') {
    // Edit의 경우 전체 파일 컨텍스트가 필요
    // 부분 수정만 체크하면 false positive 가능
    return { pass: true };  // Edit는 일단 통과
  } else if (tool_name === 'MultiEdit') {
    return { pass: true };  // MultiEdit도 일단 통과
  }
  
  const violations = validateApiRoute(content, filePath);
  
  if (violations.length > 0) {
    return { pass: false, violations, filePath };
  }
  
  return { pass: true };
}

// Main execution
if (require.main === module) {
  let input;
  
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf-8'));
  } catch (error) {
    console.error('Failed to parse input:', error.message);
    process.exit(1);
  }
  
  const result = validateContent(input);
  
  if (!result.pass) {
    const output = {
      decision: "block",
      reason: `🚫 API Route without session check detected

File: ${result.filePath}

Found ${result.violations.length} unprotected handler(s):
${result.violations.map(v => 
  `  Line ${v.line}: ${v.method} handler`
).join('\n')}

✅ Required pattern:
export async function ${result.violations[0]?.method || 'METHOD'}(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Your logic here
}

💡 Options:
1. Add requireAuth() at the beginning of handler
2. Use @public comment for public endpoints
3. Add to PUBLIC_ENDPOINTS whitelist if truly public`
    };
    
    console.log(JSON.stringify(output));
    process.exit(0);
  }
  
  process.exit(0);
}

module.exports = { validateContent, validateApiRoute };
```

### Phase 2-3: no-snake-case.js

```javascript
#!/usr/bin/env node

const fs = require('fs');

// Snake case 패턴
const SNAKE_CASE_PATTERNS = [
  {
    // 변수 선언
    pattern: /(const|let|var)\s+([a-z]+_[a-z_]+)\s*=/g,
    type: 'variable'
  },
  {
    // 함수 매개변수
    pattern: /function\s+\w+\s*\([^)]*([a-z]+_[a-z_]+)[^)]*\)/g,
    type: 'parameter'
  },
  {
    // 화살표 함수 매개변수
    pattern: /\(([^)]*[a-z]+_[a-z_]+[^)]*)\)\s*=>/g,
    type: 'parameter'
  }
];

// 허용되는 snake_case
const ALLOWED_SNAKE_CASE = [
  // 표준 라이브러리
  '__dirname',
  '__filename',
  'child_process',
  'process_env',
  
  // Supabase/데이터베이스 필드
  'created_at',
  'updated_at',
  'deleted_at',
  'user_id',
  'api_key',
  'is_active',
  'service_name',
  
  // 외부 API
  'access_token',
  'refresh_token',
  'client_id',
  'client_secret',
  'redirect_uri'
];

// Whitelist 파일 패턴
const WHITELIST_FILES = [
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /migrations\//,
  /\.sql$/,
  /database\.types\.ts$/
];

function isAllowedSnakeCase(name) {
  return ALLOWED_SNAKE_CASE.includes(name);
}

function findSnakeCaseViolations(content, filePath) {
  // Whitelist 파일 제외
  if (WHITELIST_FILES.some(p => p.test(filePath))) {
    return [];
  }
  
  const violations = [];
  const lines = content.split('\n');
  
  for (const { pattern, type } of SNAKE_CASE_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    
    while ((match = pattern.exec(content)) !== null) {
      // snake_case 이름 추출
      const snakeCaseMatch = match[0].match(/[a-z]+_[a-z_]+/);
      if (!snakeCaseMatch) continue;
      
      const snakeCaseName = snakeCaseMatch[0];
      
      // 허용된 이름이면 제외
      if (isAllowedSnakeCase(snakeCaseName)) {
        continue;
      }
      
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      const lineIndex = lineNumber - 1;
      
      // @allow-snake-case 체크
      if (/@allow-snake-case/i.test(lines[lineIndex]) || 
          (lineIndex > 0 && /@allow-snake-case/i.test(lines[lineIndex - 1]))) {
        continue;
      }
      
      violations.push({
        line: lineNumber,
        name: snakeCaseName,
        suggested: convertToCamelCase(snakeCaseName),
        type: type,
        text: lines[lineIndex].trim()
      });
    }
  }
  
  return violations;
}

function convertToCamelCase(snakeCase) {
  return snakeCase.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function validateContent(input) {
  const { tool_name, tool_input } = input;
  
  if (!['Write', 'Edit', 'MultiEdit'].includes(tool_name)) {
    return { pass: true };
  }
  
  let content = '';
  let filePath = '';
  
  if (tool_name === 'Write' || tool_name === 'Edit') {
    content = tool_input.content || tool_input.new_string || '';
    filePath = tool_input.file_path || '';
  } else if (tool_name === 'MultiEdit') {
    const allViolations = [];
    filePath = tool_input.file_path || '';
    
    for (const edit of (tool_input.edits || [])) {
      const violations = findSnakeCaseViolations(edit.new_string || '', filePath);
      allViolations.push(...violations);
    }
    
    if (allViolations.length > 0) {
      return { pass: false, violations: allViolations, filePath };
    }
    return { pass: true };
  }
  
  const violations = findSnakeCaseViolations(content, filePath);
  
  if (violations.length > 0) {
    return { pass: false, violations, filePath };
  }
  
  return { pass: true };
}

// Main execution  
if (require.main === module) {
  let input;
  
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf-8'));
  } catch (error) {
    console.error('Failed to parse input:', error.message);
    process.exit(1);
  }
  
  const result = validateContent(input);
  
  if (!result.pass) {
    const output = {
      decision: "block",
      reason: `🚫 snake_case variable names detected

File: ${result.filePath}

Found ${result.violations.length} snake_case violation(s):
${result.violations.slice(0, 3).map(v => 
  `  Line ${v.line}: '${v.name}' → '${v.suggested}'`
).join('\n')}${result.violations.length > 3 ? `\n  ... and ${result.violations.length - 3} more` : ''}

✅ Use camelCase instead:
${result.violations.slice(0, 3).map(v =>
  `  ${v.name} → ${v.suggested}`
).join('\n')}

💡 Tips:
1. Use camelCase for JavaScript/TypeScript variables
2. Database fields can remain snake_case in queries
3. Add @allow-snake-case for external API fields
4. Configure your linter to catch these automatically`
    };
    
    console.log(JSON.stringify(output));
    process.exit(0);
  }
  
  process.exit(0);
}

module.exports = { validateContent, findSnakeCaseViolations, convertToCamelCase };
```

## 🧪 테스트 시나리오 (7단계)

### 시나리오 1: console.log 차단 테스트
```javascript
// 1. 테스트 파일 작성 시도
// test-console.js 생성
const data = fetchData();
console.log('Debug:', data);  // Hook이 차단해야 함

// 2. 예상 결과
// "🚫 console.* statements detected"

// 3. 수정 후 재시도
import { logger } from '@/lib/logger';
const data = fetchData();
logger.debug('Debug:', data);  // 통과해야 함
```

### 시나리오 2: API Route 세션 체크
```typescript
// 1. 보호되지 않은 API Route 작성
// src/app/api/test/route.ts
export async function GET(request: NextRequest) {
  const data = await getData();
  return NextResponse.json(data);
}
// Hook이 차단해야 함

// 2. 수정 후
export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await getData();
  return NextResponse.json(data);
}
// 통과해야 함
```

### 시나리오 3: snake_case 변수 차단
```javascript
// 1. snake_case 변수 작성
const user_data = await fetchUser();  // Hook이 차단
const api_key = process.env.API_KEY;  // 허용 (whitelist)

// 2. 수정 후
const userData = await fetchUser();   // 통과
const apiKey = process.env.API_KEY;   // 통과
```

### 시나리오 4: Whitelist 동작 확인
```javascript
// scripts/test-script.js
console.log('Test script');  // 통과 (scripts/ 폴더)

// src/app/page.tsx
// @allow-console
console.log('Development only');  // 통과 (whitelist marker)
```

### 시나리오 5: MultiEdit 동작
```javascript
// 여러 수정사항을 한번에 적용
// Hook이 각 edit를 개별 검증
```

### 시나리오 6: Emergency Disable
```bash
# Hook 비활성화
export CLAUDE_HOOKS_ENABLED=false
# 모든 작업 통과

# 재활성화
unset CLAUDE_HOOKS_ENABLED
# Hook 정상 동작
```

### 시나리오 7: 통합 테스트
```bash
# 전체 Hook 시스템 테스트
node .claude/hooks/test-hooks.js

# 예상 결과:
# ✅ All validators working correctly
# ✅ Config loading successful
# ✅ Emergency disable functional
```

## 🔄 구현 단계

### Step 1: Hook 파일 생성
1. `.claude/hooks/validators/no-console-log.js` 생성
2. `.claude/hooks/validators/require-session-check.js` 생성
3. `.claude/hooks/validators/no-snake-case.js` 생성

### Step 2: main-validator.js 업데이트
```javascript
// validators 배열에 추가
const validators = [
  'no-any-type',
  'no-todo-comments', 
  'no-empty-catch',
  'no-console-log',       // Phase 2-1
  'require-session-check', // Phase 2-2
  'no-snake-case'         // Phase 2-3
];
```

### Step 3: 설정 파일 업데이트
```json
// .claude/hooks/config.json
{
  "validators": {
    "no-console-log": {
      "enabled": true,
      "severity": "error"
    },
    "require-session-check": {
      "enabled": true,
      "severity": "error"
    },
    "no-snake-case": {
      "enabled": true,
      "severity": "warning"
    }
  }
}
```

### Step 4: 테스트 스크립트 업데이트
```javascript
// test-hooks.js에 새 테스트 추가
testValidators.push(
  testConsoleLog,
  testSessionCheck,
  testSnakeCase
);
```

### Step 5: 문서 업데이트
- README.md에 새 Hook 설명 추가
- 사용 가이드 업데이트

### Step 6: 실제 테스트
1. 각 Hook 개별 테스트
2. 통합 테스트
3. 실제 Claude Code에서 동작 확인

### Step 7: 롤백 계획
```bash
# 문제 발생 시 즉시 비활성화
export CLAUDE_HOOKS_ENABLED=false

# 또는 개별 Hook 비활성화
# config.json에서 enabled: false 설정
```

## 📊 예상 효과

### 정량적 효과
- **console.log 제거**: 63개 → 0개 (100% 감소)
- **API 보안**: 모든 Route 세션 체크 (100% 보호)
- **코딩 스타일**: snake_case 0% 사용

### 정성적 효과
- 프로덕션 코드 품질 향상
- 보안 취약점 사전 차단
- 일관된 코딩 스타일 유지
- 디버깅 시간 단축

## ⚠️ 주의사항

### 구현 시 주의
1. **점진적 적용**: 한 번에 하나씩 구현하고 테스트
2. **Whitelist 충분히**: 필요한 예외는 미리 정의
3. **팀 공지**: Hook 추가 전 팀원들에게 알림
4. **롤백 준비**: 문제 시 즉시 비활성화 가능

### 알려진 제한사항
1. **Edit/MultiEdit**: 전체 파일 컨텍스트 없이는 false positive 가능
2. **동적 코드**: eval() 등으로 생성된 코드는 검증 불가
3. **성능**: 대용량 파일에서 약간의 지연 가능

## 📝 검증 체크리스트

- [ ] 각 Hook 파일이 정상 생성되었는가?
- [ ] main-validator.js가 새 Hook을 로드하는가?
- [ ] 각 Hook이 의도한 패턴을 정확히 감지하는가?
- [ ] Whitelist가 올바르게 동작하는가?
- [ ] Emergency disable이 작동하는가?
- [ ] 테스트가 모두 통과하는가?
- [ ] 실제 Claude Code에서 동작하는가?

## 🎯 성공 기준

1. **기능적 성공**
   - 3개 Hook 모두 정상 동작
   - False positive 최소화 (<5%)
   - 성능 영향 최소화 (<100ms)

2. **품질 개선**
   - console.log 100% 제거
   - API Route 100% 보호
   - 일관된 camelCase 사용

3. **팀 수용성**
   - 개발 워크플로우 방해 최소화
   - 명확한 에러 메시지
   - 쉬운 예외 처리

---

*이 지시서는 INSTRUCTION_TEMPLATE.md v17.0 지침에 따라 작성되었습니다.*
*구현 시 실제 테스트와 검증을 반드시 수행하세요.*