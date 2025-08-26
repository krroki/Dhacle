/sc:improve --seq --validate --focus performance
"Phase 4: Low Priority 최적화 - 128개 문제"


** 아래 내용은 대부분 수행되었다가 오버 엔지니어링으로 판단하여, 다시 롤백하였습니다.

# Phase 4: Low Priority 최적화

⚠️ → **필수 확인**: `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 확인
⚠️ → **절대 금지**: 자동 변환 스크립트 생성
⚠️ → **필수 원칙**: 측정 후 최적화

## 📌 Phase 정보
- **Phase 번호**: 4/5
- **예상 시간**: 15일
- **우선순위**: LOW (하지만 중요)
- **문제 수**: 128개
- **주요 영역**: 성능, 접근성, 문서화, 개발환경, UI/UX

## 📚 온보딩 섹션

### 작업 관련 경로
```
- 성능 최적화: src/lib/performance/
- 접근성: src/components/common/
- 문서화: docs/, Storybook
- 개발환경: docker/, .vscode/
- 디자인 시스템: src/styles/design-tokens.ts
```

## 🎯 Phase 목표
1. 성능 최적화 (35개) - 번들 크기 50% 감소
2. 접근성 개선 (25개) - WCAG 2.1 AA 준수
3. 문서화 개선 (20개) - Storybook 구축
4. 개발 환경 개선 (20개) - Docker 설정
5. UI/UX 일관성 (28개) - 디자인 시스템

## 📝 작업 내용

### Task 1: 성능 최적화 (35개)

#### 1.1 번들 분석 및 최적화
```bash
# 번들 분석 도구 설치
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... 기존 설정
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      'lodash',
    ],
  },
});
```

#### 1.2 동적 임포트 적용
```typescript
// Before: 정적 임포트
import HeavyComponent from '@/components/HeavyComponent';

// After: 동적 임포트
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <Skeleton />,
    ssr: false, // 클라이언트에서만 렌더링
  }
);
```

#### 1.3 이미지 최적화
```typescript
// src/components/common/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  className,
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={0}
      height={0}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className={className}
      style={{ width: '100%', height: 'auto' }}
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    />
  );
}
```

#### 1.4 가상화 구현
```typescript
// src/components/common/VirtualList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Task 2: 접근성 개선 (25개)

#### 2.1 ARIA 라벨 추가
```typescript
// src/components/common/AccessibleButton.tsx
interface AccessibleButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
}

export function AccessibleButton({
  onClick,
  children,
  ariaLabel,
  ariaPressed,
  ariaExpanded,
}: AccessibleButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      className="focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </button>
  );
}
```

#### 2.2 포커스 트랩
```typescript
// src/components/common/FocusTrap.tsx
import { useEffect, useRef } from 'react';

interface FocusTrapProps {
  isActive: boolean;
  children: React.ReactNode;
}

export function FocusTrap({ isActive, children }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return <div ref={containerRef}>{children}</div>;
}
```

#### 2.3 스크린 리더 지원
```typescript
// src/components/common/ScreenReaderOnly.tsx
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

// Tailwind CSS 클래스
// .sr-only {
//   position: absolute;
//   width: 1px;
//   height: 1px;
//   padding: 0;
//   margin: -1px;
//   overflow: hidden;
//   clip: rect(0, 0, 0, 0);
//   white-space: nowrap;
//   border-width: 0;
// }
```

### Task 3: 문서화 개선 (20개)

#### 3.1 Storybook 설정
```bash
npx storybook@latest init
```

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
};

export default config;
```

#### 3.2 컴포넌트 스토리 작성
```typescript
// src/components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};
```

#### 3.3 API 문서 자동 생성
```typescript
// src/lib/api-docs.ts
import { z } from 'zod';

// API 스키마 정의
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CourseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  instructor: UserSchema,
});

// TypeDoc 주석
/**
 * 사용자 프로필을 조회합니다.
 * @param userId - 사용자 ID
 * @returns 사용자 프로필 정보
 * @example
 * ```typescript
 * const profile = await getUserProfile('123');
 * console.log(profile.name);
 * ```
 */
export async function getUserProfile(userId: string) {
  // ...
}
```

### Task 4: 개발 환경 개선 (20개)

#### 4.1 Docker 설정
```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - redis

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

#### 4.2 VS Code 설정
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Task 5: UI/UX 일관성 (28개)

#### 5.1 디자인 토큰
```typescript
// src/styles/design-tokens.ts
export const tokens = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
    '2xl': '4rem',  // 64px
  },
  typography: {
    fontFamily: {
      sans: ['Pretendard', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',  // 2px
    base: '0.25rem', // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  animation: {
    duration: {
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};
```

## ✅ 완료 조건
- [ ] 번들 크기 50% 감소 (2.3MB → 1.15MB)
- [ ] LCP < 2.5초, FID < 100ms, CLS < 0.1
- [ ] WCAG 2.1 AA 준수 (90% 이상)
- [ ] Storybook 구축 완료
- [ ] Docker 환경 구축 완료
- [ ] 디자인 시스템 적용 완료
- [ ] 빌드 성공 (npm run build)
- [ ] Lighthouse 점수 90+ (모든 카테고리)

## 📋 QA 테스트 시나리오

### 성능 테스트
```bash
# 번들 분석
ANALYZE=true npm run build

# Lighthouse 테스트
npx lighthouse http://localhost:3000 --view

# Core Web Vitals 측정
npm run test:performance
```

### 접근성 테스트
1. 키보드 네비게이션 → Tab 키로 모든 요소 접근 가능
2. 스크린 리더 → NVDA/JAWS로 테스트
3. 색상 대비 → 4.5:1 이상 확인
4. 포커스 표시 → 명확한 포커스 인디케이터

### Docker 테스트
```bash
# 빌드 및 실행
docker-compose up --build

# 컨테이너 접속
docker exec -it dhacle-app sh
```

## 🔄 롤백 계획

### 성능 최적화 롤백
```bash
git checkout HEAD -- next.config.js
git checkout HEAD -- "src/components/**/*.tsx"
```

### Docker 롤백
```bash
docker-compose down
rm Dockerfile docker-compose.yml
```

## 📊 성과 측정

### Before (Phase 3 완료)
- 번들 크기: 2.3MB
- 페이지 로드: 4.2초
- Lighthouse: 60-70점
- 접근성: 부분 준수
- 문서화: 부족
- 개발 환경: 로컬만

### After (Phase 4 완료)
- 번들 크기: 1.15MB (-50%)
- 페이지 로드: 2.0초 (-52%)
- Lighthouse: 90+ 점
- 접근성: WCAG 2.1 AA 준수
- 문서화: Storybook 완비
- 개발 환경: Docker 지원
- UI 일관성: 디자인 시스템 적용

## → 다음 Phase
- **파일**: PHASE_5_VALIDATION.md
- **목표**: 전체 검증 및 마무리
- **예상 시간**: 2일

---

*작성일: 2025-02-23*