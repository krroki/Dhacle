/sc:implement --seq --validate --c7
"Phase 1: 환경변수 타입 안전성 구현 - 47개 문제 해결"

# Phase 1: 환경변수 타입 안전성 구현

⚠️ → **필수 확인**: `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 확인
⚠️ → **절대 금지**: 자동 변환 스크립트 생성
⚠️ → **필수 패턴**: TypeScript 타입 안전성 보장

## 📌 Phase 정보
- **Phase 번호**: 1/5
- **예상 시간**: 3일
- **우선순위**: CRITICAL
- **영향 범위**: 47개 파일
- **비즈니스 영향**: 런타임 에러 90% 감소 예상

## 📚 온보딩 섹션

### 작업 관련 경로
```
- 환경변수 타입: src/lib/env.ts
- API Routes: src/app/api/*/route.ts (15개)
- 유틸리티: src/lib/*.ts (12개)
- 컴포넌트: src/components/*/*.tsx (8개)
- 서비스: src/lib/services/*.ts (12개)
```

### 문제 분석 (5W1H)
- **WHO**: 개발팀, 사용자, DevOps팀
- **WHAT**: 환경변수 타입 안전성 부재로 런타임 에러 발생
- **WHERE**: 47개 파일에서 process.env 직접 사용
- **WHEN**: 빌드 타임에 감지 못하고 런타임에 에러 발생
- **WHY**: 초기 빠른 프로토타이핑, TypeScript 검증 시스템 미구축
- **HOW**: @t3-oss/env-nextjs 도입으로 해결

## 🎯 Phase 목표
1. 모든 환경변수에 타입 정의 추가
2. 빌드 타임 검증 시스템 구축
3. 런타임 에러 방지
4. 환경변수 문서화

## 📝 작업 내용

### Step 1: @t3-oss/env-nextjs 설치 및 설정
```bash
npm install @t3-oss/env-nextjs zod
```

### Step 2: 환경변수 타입 정의 파일 생성
```typescript
// src/lib/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  // 서버 환경변수
  server: {
    // Supabase
    DATABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    
    // 보안
    ENCRYPTION_KEY: z.string().length(64),
    JWT_SECRET: z.string().min(32),
    
    // Redis
    REDIS_URL: z.string().url().optional(),
    REDIS_TTL: z.coerce.number().default(3600),
    
    // API Keys (서버 전용)
    OPENAI_API_KEY: z.string().min(1).optional(),
    YOUTUBE_API_KEY: z.string().min(1),
    
    // 이메일
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().email().optional(),
    SMTP_PASS: z.string().optional(),
    
    // 모니터링
    SENTRY_DSN: z.string().url().optional(),
    VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  },
  
  // 클라이언트 환경변수
  client: {
    // Supabase Public
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    
    // App Config
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_TIMEOUT: z.coerce.number().default(30000),
    
    // Feature Flags
    NEXT_PUBLIC_ENABLE_ANALYTICS: z.coerce.boolean().default(false),
    NEXT_PUBLIC_ENABLE_PWA: z.coerce.boolean().default(false),
    
    // 결제
    NEXT_PUBLIC_TOSS_CLIENT_KEY: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z.string().optional(),
  },
  
  // 런타임 환경변수 매핑
  runtimeEnv: {
    // 서버
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_TTL: process.env.REDIS_TTL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SENTRY_DSN: process.env.SENTRY_DSN,
    VERCEL_ENV: process.env.VERCEL_ENV,
    
    // 클라이언트
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_TIMEOUT: process.env.NEXT_PUBLIC_TIMEOUT,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA,
    NEXT_PUBLIC_TOSS_CLIENT_KEY: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  },
  
  // 빌드 타임 검증 스킵 (개발 환경)
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  
  // 에러 메시지 커스터마이징
  emptyStringAsUndefined: true,
});
```

### Step 3: 기존 코드 마이그레이션 (수동)

#### 3.1 API Routes 수정 (15개 파일)
```typescript
// Before: src/app/api/*/route.ts
const apiKey = process.env.YOUTUBE_API_KEY; // undefined 가능

// After: src/app/api/*/route.ts
import { env } from '@/lib/env';
const apiKey = env.YOUTUBE_API_KEY; // 타입 안전, 빌드 타임 검증
```

#### 3.2 유틸리티 수정 (12개 파일)
```typescript
// Before: src/lib/youtube/api-client.ts
const timeout = parseInt(process.env.TIMEOUT || '30000');

// After: src/lib/youtube/api-client.ts
import { env } from '@/lib/env';
const timeout = env.NEXT_PUBLIC_TIMEOUT; // 이미 number 타입
```

#### 3.3 컴포넌트 수정 (8개 파일)
```typescript
// Before: src/components/payment/TossPayment.tsx
const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

// After: src/components/payment/TossPayment.tsx
import { env } from '@/lib/env';
const clientKey = env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
```

### Step 4: .env.example 업데이트
```bash
# .env.example

# ===== 서버 환경변수 =====
# Supabase (필수)
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# 보안 (필수)
ENCRYPTION_KEY=64자리_랜덤_문자열
JWT_SECRET=32자리_이상_랜덤_문자열

# Redis (선택)
REDIS_URL=redis://...
REDIS_TTL=3600

# API Keys (필수/선택)
YOUTUBE_API_KEY=AIza...
OPENAI_API_KEY=sk-...

# ===== 클라이언트 환경변수 =====
# Supabase Public (필수)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# App Config (필수)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_TIMEOUT=30000

# Feature Flags (선택)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PWA=false
```

### Step 5: CI/CD 파이프라인 검증 추가
```yaml
# .github/workflows/ci.yml
- name: Validate Environment Variables
  run: |
    npm run env:validate
  env:
    SKIP_ENV_VALIDATION: false
```

### Step 6: 검증 스크립트 작성
```javascript
// scripts/validate-env.js
const { env } = require('../src/lib/env');

console.log('✅ Environment variables validated successfully');
console.log('Server variables:', Object.keys(env).filter(k => !k.startsWith('NEXT_PUBLIC')).length);
console.log('Client variables:', Object.keys(env).filter(k => k.startsWith('NEXT_PUBLIC')).length);
```

## ✅ 완료 조건
- [ ] @t3-oss/env-nextjs 설치 완료
- [ ] src/lib/env.ts 파일 생성 및 모든 환경변수 정의
- [ ] 47개 파일에서 process.env 직접 사용 제거
- [ ] .env.example 업데이트
- [ ] 빌드 성공 (npm run build)
- [ ] 타입 체크 통과 (npm run types:check)
- [ ] 환경변수 검증 통과 (npm run env:validate)

## 📋 QA 테스트 시나리오

### 정상 플로우
1. 모든 환경변수 설정 후 앱 시작
2. 각 기능별 정상 작동 확인
3. API 호출 성공 확인

### 실패 시나리오
1. 필수 환경변수 누락 시 → 빌드 실패 확인
2. 잘못된 형식의 환경변수 → 검증 에러 확인
3. 타입 불일치 → TypeScript 컴파일 에러 확인

### 검증 명령어
```bash
# 환경변수 없이 빌드 시도 (실패해야 함)
SKIP_ENV_VALIDATION=false npm run build

# 타입 체크
npm run types:check

# 런타임 테스트
npm run dev
# 각 페이지 접속 및 기능 테스트
```

## 🔄 롤백 계획

### 부분 롤백
```bash
# env.ts 파일만 롤백
git checkout HEAD -- src/lib/env.ts

# 특정 파일 롤백
git checkout HEAD -- src/app/api/youtube/route.ts
```

### 전체 롤백
```bash
# Phase 1 전체 롤백
git reset --hard HEAD~
npm install  # 패키지 복원
```

## 📊 성과 측정

### Before (Phase 0 베이스라인)
- process.env 직접 사용: 47개 위치
- 런타임 에러 가능성: 높음
- 타입 안전성: 0%
- 환경변수 문서화: 부족

### After (Phase 1 완료)
- process.env 직접 사용: 0개
- 런타임 에러 가능성: 매우 낮음
- 타입 안전성: 100%
- 환경변수 문서화: 완료
- 빌드 타임 검증: 활성화

## → 다음 Phase
- **파일**: PHASE_2_HIGH_PRIORITY.md
- **목표**: 나머지 97개 High Priority 문제 해결
- **예상 시간**: 10일

---

*작성일: 2025-02-23*