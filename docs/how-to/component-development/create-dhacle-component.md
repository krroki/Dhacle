# 디하클 컴포넌트 개발 가이드

*96개 실제 컴포넌트 분석 기반 - 실전 개발 패턴*

**목표**: 디하클 프로젝트의 실제 컴포넌트 패턴을 따라 일관된 품질의 컴포넌트 작성

## 🏗️ 컴포넌트 아키텍처 개요

### 디렉토리 구조 (실제 패턴)
```
src/components/
├── ui/                    # shadcn/ui 기본 컴포넌트 (27개)
├── common/                # 재사용 가능한 공통 컴포넌트 (11개)
├── features/              # 기능별 특화 컴포넌트 (35개)
│   ├── auth/              # 인증 관련
│   ├── home/              # 홈페이지 섹션
│   └── tools/youtube-lens/ # YouTube Lens 전용
├── layout/                # 레이아웃 컴포넌트 (8개)
├── providers/             # 상태 제공자 (2개)
└── error/                 # 에러 처리 (3개)
```

### 컴포넌트 분류 체계
- **UI Components**: 디자인 시스템 기본 요소
- **Common Components**: 프로젝트 전반 재사용
- **Feature Components**: 도메인 특화 기능
- **Layout Components**: 페이지 구조 담당

## 🎯 Server vs Client Component 패턴

### Server Component 기본 원칙 (65% 적용)

**실제 예시: MetricCard**
```typescript
// ✅ Server Component: 정적 데이터 표시
// Server Component: Metric Display Card
// Static metric display without client-side updates

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  status?: 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  change, 
  status = 'neutral', 
  className 
}: MetricCardProps) {
  // 정적 렌더링 로직만 포함
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={cn("h-4 w-4", statusColors[status])} />
        )}
      </CardHeader>
      
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(value)}
        </div>
        {/* ... 나머지 정적 렌더링 */}
      </CardContent>
    </Card>
  );
}
```

**Server Component 활용 케이스**:
- ✅ LoadingSpinner (정적 SVG)
- ✅ StatusBadge (상태 표시)  
- ✅ SectionTitle (텍스트 표시)
- ✅ FooterLayout (정적 레이아웃)

### Client Component 패턴 (35% 적용)

**실제 예시: KakaoLoginButton**
```typescript
'use client';

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui';
import { createBrowserClient } from '@/lib/supabase/browser-client';

interface KakaoLoginButtonProps {
  redirectTo?: string;
  className?: string;
  variant?: 'default' | 'large' | 'small';
  text?: string;
}

export function KakaoLoginButton({
  redirectTo = '/',
  className = '',
  variant = 'default',
  text = '카카오로 시작하기',
}: KakaoLoginButtonProps) {
  const supabase = createBrowserClient();

  const handle_kakao_login = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          scopes: 'profile_nickname profile_image account_email',
        },
      });

      if (error) {
        alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Component error:', error);
      alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Button
      onClick={handle_kakao_login}
      className={`
        bg-[#FEE500] hover:bg-[#FDD835] text-[#000000]/85
        font-medium rounded-md transition-all duration-200
        ${className}
      `}
    >
      <MessageSquare className="h-5 w-5" />
      <span>{text}</span>
    </Button>
  );
}
```

**Client Component 필수 조건**:
- 🎯 사용자 인터랙션 (onClick, onChange)
- 🎯 브라우저 API (window, localStorage)
- 🎯 상태 관리 (useState, useEffect)
- 🎯 실시간 업데이트

## 📦 shadcn/ui 사용 패턴

### 1. 중앙화된 Import 패턴
```typescript
// ✅ 표준 패턴 - 개별 import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ✅ 대용량 import (Header.tsx 스타일)
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  NavigationMenu,
  // ... 필요한 컴포넌트들
} from '@/components/ui';

// ❌ 절대 금지
import * from '@/components/ui';
```

### 2. shadcn/ui 커스터마이징 패턴

**실제 Button 확장 예시:**
```typescript
// cva(class-variance-authority) 패턴 활용
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

### 3. Card 컴포넌트 활용 패턴

**VideoCard에서 보는 복합 구조:**
```typescript
<Card className={cn(
  'group relative overflow-hidden transition-all duration-200 hover:shadow-lg',
  isSelected && 'ring-2 ring-primary',
  className
)}>
  <div className="relative aspect-[9/16] overflow-hidden bg-muted">
    {/* 썸네일 + 오버레이 요소들 */}
  </div>
  
  <CardContent className="p-3 space-y-2">
    <h3 className="font-medium line-clamp-2 text-sm">{video.title}</h3>
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {/* 메타데이터 */}
    </div>
  </CardContent>
</Card>
```

## 🎨 Tailwind CSS 네이밍 컨벤션

### 1. 디하클 디자인 시스템 컬러
```css
/* globals.css에서 확인한 실제 색상 */
:root {
  --primary: oklch(0.8099 0.2141 151.7689);      /* #635BFF 보라색 */
  --primary-foreground: oklch(0.1448 0 0);
  --secondary: oklch(0.9683 0.0069 247.8956);
  --muted: oklch(0.9613 0.0054 247.8952);
  --muted-foreground: oklch(0.4544 0.0108 247.8948);
}
```

### 2. 실제 사용되는 클래스 패턴

**상태별 색상 시스템 (StatusBadge):**
```typescript
const statusConfig = {
  success: {
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  },
  warning: {
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  },
  error: {
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
  },
  pending: {
    className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
  },
};
```

**크기 시스템 (LoadingSpinner):**
```typescript
const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};
```

**간격 시스템 (일관된 패턴):**
- `space-y-2` (8px) - 컴포넌트 내부 요소
- `gap-2` (8px) - Flex/Grid 요소
- `p-3` (12px) - CardContent 기본
- `mb-8` (32px) - 섹션 간격

### 3. 반응형 패턴

**Header에서 사용된 실제 패턴:**
```typescript
className="hidden md:block"           // 모바일 숨김
className="block md:hidden"           // 데스크톱 숨김  
className="hidden lg:flex"            // 대화면에서만 표시
className="lg:hidden"                 // 대화면에서 숨김
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-5"  // 반응형 그리드
```

## 🔧 컴포넌트 개발 체크리스트

### 1. 개발 전 확인사항
- [ ] Server Component가 가능한지 검토 (인터랙션 없는 경우)
- [ ] 기존 common/ 컴포넌트 재사용 가능성 검토
- [ ] shadcn/ui 기본 컴포넌트 활용 방안 확인

### 2. TypeScript 인터페이스 패턴
```typescript
// ✅ 표준 Props 인터페이스
interface ComponentNameProps {
  // 필수 props
  title: string;
  value: string | number;
  
  // 선택적 props
  description?: string;
  icon?: LucideIcon;
  
  // 이벤트 핸들러 (Client Component만)
  onClick?: (value: string) => void;
  onSelect?: (id: string) => void;
  
  // 스타일링
  className?: string;
  variant?: 'default' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}
```

### 3. 접근성 패턴

**LoadingSpinner 접근성:**
```typescript
<svg
  role="img"
  aria-label={text || "Loading"}
  className="animate-spin"
>
  {/* SVG 내용 */}
</svg>
```

**Button 접근성 (Footer 소셜 링크):**
```typescript
<Button
  variant="ghost"
  size="icon"
  asChild
  className="text-muted-foreground hover:text-blue-600"
>
  <Link
    href={social.href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={social.name}  // 접근성 필수
  >
    <Icon className="h-4 w-4" />
  </Link>
</Button>
```

## 📋 컴포넌트 템플릿

### Server Component 템플릿
```typescript
// Server Component: [Component Description]
// [Usage context and purpose]

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  title: string;
  className?: string;
}

export function ComponentName({ title, className }: ComponentNameProps) {
  return (
    <Card className={cn('default-classes', className)}>
      <CardContent>
        <h3 className="font-medium">{title}</h3>
      </CardContent>
    </Card>
  );
}
```

### Client Component 템플릿  
```typescript
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  onAction?: (value: string) => void;
  className?: string;
}

export function ComponentName({ onAction, className }: ComponentNameProps) {
  const [state, setState] = useState('');

  const handleClick = useCallback(() => {
    onAction?.(state);
  }, [state, onAction]);

  return (
    <Button 
      onClick={handleClick}
      className={cn('default-classes', className)}
    >
      Action
    </Button>
  );
}
```

## 🚀 고급 패턴

### 1. 메모화 패턴 (VideoCard)
```typescript
export const VideoCard = memo(function VideoCard({ video, onSelect }: VideoCardProps) {
  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect?.(video.video_id);
    },
    [video.video_id, onSelect]
  );
  
  // 컴포넌트 렌더링
});
```

### 2. 조건부 렌더링 패턴
```typescript
// ✅ 실제 사용 패턴 - 단축 평가 활용
{Icon && (
  <Icon className={cn("h-4 w-4", statusColors[status])} />
)}

{change && (
  <div className="flex items-center mt-2">
    <Badge variant="outline">
      {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
    </Badge>
  </div>
)}

// ✅ 복잡한 조건부 렌더링
{((video.like_count && video.like_count > 0) || (video.comment_count && video.comment_count > 0)) && (
  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
    {/* 통계 정보 */}
  </div>
)}
```

### 3. 다중 뷰모드 패턴 (VideoCard)
```typescript
export function VideoCard({ viewMode = 'grid', ...props }: VideoCardProps) {
  // Grid View
  if (viewMode === 'grid') {
    return <GridViewComponent {...props} />;
  }

  // List View  
  if (viewMode === 'list') {
    return <ListViewComponent {...props} />;
  }

  // Compact View (기본값)
  return <CompactViewComponent {...props} />;
}
```

## ✅ 품질 검증

### 개발 완료 후 체크리스트
- [ ] TypeScript 에러 없음 (`npm run types:check`)
- [ ] Biome 린트 통과 (`npm run lint`)
- [ ] 접근성 속성 추가 (aria-label, role 등)
- [ ] 반응형 디자인 확인 (모바일/데스크톱)
- [ ] Dark/Light 테마 호환성
- [ ] 컴포넌트 재사용성 검토

### 성능 최적화 검증
- [ ] 불필요한 re-render 방지 (memo, useCallback)
- [ ] Client Component 필요성 재검토
- [ ] 큰 컴포넌트 분할 고려
- [ ] 이미지 최적화 (Next.js Image, priority 설정)

---

**참고**: 이 가이드는 디하클 프로젝트의 실제 96개 컴포넌트를 분석하여 작성된 실전 개발 패턴입니다. 새로운 컴포넌트 개발 시 기존 패턴을 먼저 확인하고 일관성을 유지하세요.