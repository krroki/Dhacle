# React 컴포넌트 생성하기

*shadcn/ui 우선, Server Component 기본, 타입 안전한 Props로 재사용 가능한 컴포넌트 만들기*

---

## 🛑 STOP - 즉시 중단 신호

- **Props에 any 타입 사용 → 중단**
- **'use client' 남발 → 중단** (Server Component 우선)
- **HTML 태그 직접 사용 → 중단** (`<button>`, `<div>` 대신 shadcn/ui)
- **children: any → 중단**

---

## 2️⃣ MUST - 필수 행동

### shadcn/ui 컴포넌트 우선 사용
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
```

### Props 타입 명시적 정의
```typescript
interface ComponentProps {
  data: User[];                           // 구체적 타입
  onEdit?: (id: string) => void;         // 옵셔널 콜백
  className?: string;                     // 스타일 커스터마이징
  variant?: 'default' | 'compact';       // 제한된 옵션
}
```

---

## 3️⃣ CHECK - 검증 필수

```bash
npm run types:check                      # Props 타입 검증
npm run dev                             # 실제 렌더링 확인
npx biome check src/components/**/*.tsx  # 코드 스타일 검증
```

---

## 📝 단계별 가이드

### Step 1: 컴포넌트 타입 정의

```typescript
// src/components/features/[feature-name]/ComponentName.tsx
import { User } from '@/types';

interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
  showActions?: boolean;
}
```

### Step 2: Server Component로 시작 (기본값)

```typescript
// ✅ Server Component (기본값 - 'use client' 없음)
export default function UserCard({ 
  user, 
  onEdit, 
  onDelete,
  variant = 'default',
  className,
  showActions = true
}: UserCardProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {user.name}
          {showActions && (
            <div className="flex gap-2">
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(user.id)}
                >
                  편집
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDelete(user.id)}
                >
                  삭제
                </Button>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{user.email}</p>
        {variant === 'default' && user.bio && (
          <p className="mt-2 text-sm text-gray-500">{user.bio}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 3: Client Component (필요한 경우만)

```typescript
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InteractiveFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: FormData;
  isLoading?: boolean;
}

export default function InteractiveForm({ 
  onSubmit, 
  initialData,
  isLoading = false 
}: InteractiveFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isLoading}
      />
      <Input
        type="text"
        placeholder="내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '저장 중...' : '저장'}
      </Button>
    </form>
  );
}
```

### Step 4: 조건부 렌더링 패턴

```typescript
export default function DataDisplay({ data, isLoading, error }: DataDisplayProps) {
  // 로딩 상태
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">로딩 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // 에러 상태
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>오류가 발생했습니다: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // 데이터 없음
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <FileX className="h-8 w-8 mx-auto mb-2" />
            <p>표시할 데이터가 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // 정상 데이터 표시
  return (
    <div className="grid gap-4">
      {data.map((item) => (
        <DataCard key={item.id} data={item} />
      ))}
    </div>
  );
}
```

---

## 🎨 스타일링 패턴

### Tailwind CSS 클래스 조합

```typescript
import { cn } from '@/lib/utils';

interface StyledComponentProps {
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export default function StyledComponent({ 
  variant, 
  size, 
  disabled, 
  className 
}: StyledComponentProps) {
  return (
    <div
      className={cn(
        // 기본 스타일
        "rounded-lg border transition-colors",
        
        // 크기별 스타일
        {
          "px-2 py-1 text-sm": size === 'sm',
          "px-4 py-2 text-base": size === 'md',
          "px-6 py-3 text-lg": size === 'lg',
        },
        
        // 변형별 스타일
        {
          "bg-blue-500 text-white border-blue-500": variant === 'primary',
          "bg-gray-500 text-white border-gray-500": variant === 'secondary',
          "bg-transparent border-gray-300 hover:bg-gray-50": variant === 'outline',
        },
        
        // 상태별 스타일
        {
          "opacity-50 cursor-not-allowed": disabled,
          "hover:opacity-80": !disabled,
        },
        
        // 외부 className
        className
      )}
    >
      컴포넌트 내용
    </div>
  );
}
```

---

## 📱 반응형 디자인

### 그리드 레이아웃
```typescript
export default function ResponsiveGrid({ items }: { items: Item[] }) {
  return (
    <div className={cn(
      "grid gap-4",
      "grid-cols-1",        // 모바일: 1열
      "sm:grid-cols-2",     // 작은 화면: 2열
      "md:grid-cols-3",     // 중간 화면: 3열
      "lg:grid-cols-4",     // 큰 화면: 4열
      "xl:grid-cols-5"      // 매우 큰 화면: 5열
    )}>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### 모바일 우선 디자인
```typescript
<Card className={cn(
  // 모바일 기본
  "p-4 text-sm",
  
  // 태블릿 이상
  "md:p-6 md:text-base",
  
  // 데스크톱 이상  
  "lg:p-8 lg:text-lg"
)}>
  {content}
</Card>
```

---

## 🧪 컴포넌트 테스팅

### 기본 테스트 구조
```typescript
// src/components/features/user/UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserCard from './UserCard';

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  bio: 'Test user bio'
};

describe('UserCard', () => {
  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test user bio')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} />);
    
    await userEvent.click(screen.getByRole('button', { name: '편집' }));
    
    expect(onEdit).toHaveBeenCalledWith('1');
  });
  
  it('hides actions when showActions is false', () => {
    render(<UserCard user={mockUser} showActions={false} />);
    
    expect(screen.queryByRole('button', { name: '편집' })).not.toBeInTheDocument();
  });
});
```

---

## 📁 파일 구조

```
src/components/
├── ui/                   # shadcn/ui 컴포넌트 (수정 금지)
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
├── features/             # 기능별 컴포넌트
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── UserProfile.tsx
│   ├── notes/
│   │   ├── NotesList.tsx
│   │   ├── NoteCard.tsx
│   │   └── CreateNoteForm.tsx
│   └── dashboard/
│       ├── MetricCard.tsx
│       └── ChartWidget.tsx
├── layout/               # 레이아웃 컴포넌트
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Sidebar.tsx
└── common/               # 공통 유틸리티 컴포넌트
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    └── EmptyState.tsx
```

---

## ❌ 흔한 실수들

### 1. HTML 태그 직접 사용
```typescript
// ❌ 잘못된 방법
return (
  <div>
    <h1>제목</h1>
    <button onClick={onClick}>클릭</button>
  </div>
);

// ✅ 올바른 방법
return (
  <Card>
    <CardHeader>
      <CardTitle>제목</CardTitle>
    </CardHeader>
    <CardContent>
      <Button onClick={onClick}>클릭</Button>
    </CardContent>
  </Card>
);
```

### 2. Props 타입 정의 누락
```typescript
// ❌ 잘못된 방법
export default function MyComponent(props: any) {
  return <div>{props.title}</div>;
}

// ✅ 올바른 방법
interface MyComponentProps {
  title: string;
  description?: string;
  onClick?: () => void;
}

export default function MyComponent({ title, description, onClick }: MyComponentProps) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      {description && <p>{description}</p>}
      {onClick && <Button onClick={onClick}>액션</Button>}
    </Card>
  );
}
```

### 3. 불필요한 'use client' 사용
```typescript
// ❌ 불필요한 Client Component
'use client'

export default function StaticList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map(item => <li key={item}>{item}</li>)}
    </ul>
  );
}

// ✅ Server Component로 충분
export default function StaticList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map(item => <li key={item}>{item}</li>)}
    </ul>
  );
}
```

---

## 🔗 관련 문서

- [프로젝트 패턴들](../../tutorial/03-common-patterns.md) - 일반적인 개발 패턴
- [컴포넌트 에이전트 지침](../../../src/components/CLAUDE.md) - 상세 개발 규칙
- [타입 정의 가이드](../../../src/types/CLAUDE.md) - Props 타입 작성법

---

**💡 기억하세요**: 재사용 가능하고 타입 안전한 컴포넌트를 만들면, 전체 프로젝트의 일관성과 유지보수성이 크게 향상됩니다.