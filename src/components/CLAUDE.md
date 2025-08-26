# 🧩 Component 개발 지침

*React 컴포넌트 작성 규칙, shadcn/ui 활용, Tailwind CSS 스타일링*

---

## 🛑 컴포넌트 3단계 필수 규칙

### 1️⃣ STOP - 즉시 중단 신호
- **Props에 any 타입 → 중단**
- **이벤트 핸들러 any → 중단**
- **children: any → 중단**
- **타입 없는 state → 중단**

### 2️⃣ MUST - 필수 행동
```typescript
// Props 타입 정의 필수
interface Props {
  data: UserData;  // any 금지
  onChange: (value: string) => void;  // 명확한 타입
  children: React.ReactNode;  // any 대신
}

// State 타입 명시 필수
const [data, setData] = useState<UserData | null>(null);

// Event 타입 명시 필수
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {}
```

### 3️⃣ CHECK - 검증 필수
```bash
# 수정 후 즉시 실행
npm run types:check
npx biome check src/components/**/*.tsx
npm run dev  # 실제 렌더링 확인
```

## 🚫 컴포넌트 any 타입 금지

### ❌ 발견된 문제: SearchBar.tsx
```typescript
// ❌ 절대 금지 - 'any' 문자열 값
<option value="any">모든 정의</option>

// ✅ 즉시 수정 - 다른 값 사용
<option value="all">모든 정의</option>
```

---

## 🚨 컴포넌트 작성 원칙

### 📁 파일 구조
```
components/
├── ui/                   # shadcn/ui 컴포넌트 (수정 금지)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── features/            # 기능별 컴포넌트
│   ├── auth/           # 인증 관련
│   ├── revenue-proof/  # 수익 인증
│   └── youtube-lens/   # YouTube Lens
├── layout/              # 레이아웃 컴포넌트
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
└── common/              # 공통 컴포넌트
    ├── ErrorBoundary.tsx
    ├── Loading.tsx
    └── WebVitals.tsx
```

---

## ✅ Server Component (기본값)

**별도 지시자 없으면 Server Component로 작성**

```typescript
// Server Component - 'use client' 없음
interface Props {
  data: SomeType;
  className?: string;
}

export function ServerComponent({ data, className }: Props) {
  // 서버에서만 실행되는 로직
  const processedData = processServerData(data);
  
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {processedData.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

---

## 🎨 Client Component

**인터랙션이 필요한 경우만 'use client' 추가**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function ClientComponent() {
  const [state, setState] = useState('');
  
  // 브라우저 API 사용
  useEffect(() => {
    const handleScroll = () => {
      // 스크롤 처리
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div>
      <input 
        value={state}
        onChange={(e) => setState(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <Button onClick={() => console.log(state)}>
        클릭
      </Button>
    </div>
  );
}
```

---

## 🎯 shadcn/ui 우선 사용

### ✅ 올바른 사용
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function FormComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>제목</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">이름</Label>
            <Input id="name" placeholder="이름 입력" />
          </div>
          <Button>제출</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### ❌ 금지 - 직접 구현
```typescript
// ❌ HTML 요소 직접 사용 금지
<button className="px-4 py-2 bg-blue-500">Click</button>

// ✅ shadcn/ui 컴포넌트 사용
<Button>Click</Button>
```

---

## 🎨 스타일링 규칙 (Tailwind CSS만)

### ✅ 올바른 스타일링
```typescript
// Tailwind 클래스 사용
<div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
    제목
  </h2>
  <p className="text-sm text-gray-600 dark:text-gray-400">
    설명
  </p>
</div>
```

### ❌ 금지된 방식들
```typescript
// ❌ 인라인 스타일 금지
<div style={{ display: 'flex', padding: '16px' }}>

// ❌ CSS 모듈 금지
import styles from './Component.module.css';
<div className={styles.container}>

// ❌ styled-components 금지
const StyledDiv = styled.div`
  display: flex;
`;

// ❌ emotion 금지
/** @jsxImportSource @emotion/react */
<div css={{ display: 'flex' }}>
```

### cn 유틸리티 활용
```typescript
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function Component({ className, variant = 'primary' }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg p-4", // 기본 스타일
        {
          "bg-blue-500 text-white": variant === 'primary',
          "bg-gray-200 text-gray-900": variant === 'secondary',
        },
        className // 외부에서 전달된 클래스
      )}
    >
      컨텐츠
    </div>
  );
}
```

---

## 📱 반응형 디자인

### Breakpoint 시스템
```typescript
<div className="
  w-full          // 모바일 (기본)
  sm:w-1/2        // 640px 이상
  md:w-1/3        // 768px 이상
  lg:w-1/4        // 1024px 이상
  xl:w-1/5        // 1280px 이상
  2xl:w-1/6       // 1536px 이상
">
  <div className="
    grid 
    grid-cols-1     // 모바일: 1열
    sm:grid-cols-2  // 태블릿: 2열
    lg:grid-cols-3  // 데스크톱: 3열
    xl:grid-cols-4  // 와이드: 4열
    gap-4
  ">
    {/* 그리드 아이템 */}
  </div>
</div>
```

### 모바일 우선 설계
```typescript
// 모바일부터 시작해서 큰 화면으로 확장
<nav className="
  flex flex-col      // 모바일: 세로 정렬
  sm:flex-row        // 태블릿 이상: 가로 정렬
  sm:items-center    // 태블릿 이상: 중앙 정렬
  gap-2 sm:gap-4     // 반응형 간격
">
```

---

## ♿ 접근성 체크리스트

### 시맨틱 HTML
```typescript
// ✅ 올바른 시맨틱 태그 사용
<header>
  <nav>
    <ul>
      <li><a href="/home">홈</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>제목</h1>
    <section>컨텐츠</section>
  </article>
</main>

<footer>푸터</footer>
```

### ARIA 레이블
```typescript
<button 
  aria-label="메뉴 열기"
  aria-expanded={isOpen}
  aria-controls="navigation-menu"
>
  <MenuIcon />
</button>

<div 
  id="navigation-menu"
  role="navigation"
  aria-hidden={!isOpen}
>
```

### 키보드 네비게이션
```typescript
// Tab 순서 지정
<input tabIndex={1} />
<button tabIndex={2}>다음</button>

// 포커스 표시 유지
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  클릭
</button>
```

---

## 🧪 컴포넌트 테스트

```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName title="테스트" />);
    expect(screen.getByText('테스트')).toBeInTheDocument();
  });
  
  it('should handle click event', async () => {
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🔍 성능 최적화

### React.memo
```typescript
// 불필요한 리렌더링 방지
export const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />;
});
```

### useMemo & useCallback
```typescript
function OptimizedComponent({ items, filter }) {
  // 비용이 큰 계산 메모이제이션
  const filteredItems = useMemo(
    () => items.filter(item => item.includes(filter)),
    [items, filter]
  );
  
  // 함수 재생성 방지
  const handleClick = useCallback((id) => {
    console.log(`Clicked ${id}`);
  }, []);
  
  return (
    <List 
      items={filteredItems}
      onItemClick={handleClick}
    />
  );
}
```

### 동적 import
```typescript
// 코드 스플리팅
const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  { 
    loading: () => <Loading />,
    ssr: false // 클라이언트에서만 로드
  }
);
```

---

## ⚠️ React Hook 명명 규칙

```typescript
// ✅ 올바른 Hook 이름 (camelCase 필수!)
useCarousel     // O
useAuth         // O
useToast        // O
useMediaQuery   // O

// ❌ 잘못된 Hook 이름 (snake_case 금지!)
use_carousel    // X
use_auth        // X
use_toast       // X
use_media_query // X
```

---

## 📋 체크리스트

- [ ] Server Component로 구현 가능한가?
- [ ] shadcn/ui 컴포넌트 활용했는가?
- [ ] Tailwind CSS만 사용했는가?
- [ ] 접근성 고려했는가?
- [ ] 반응형 디자인 적용했는가?
- [ ] 성능 최적화 필요한가?
- [ ] 테스트 작성했는가?
- [ ] Hook 이름이 camelCase인가?

---

## 📁 관련 파일

- shadcn/ui 컴포넌트: `/src/components/ui/`
- 유틸리티: `/src/lib/utils.ts`
- 타입 정의: `/src/types/index.ts`
- React Query 훅: `/src/hooks/queries/`
- 테스트 유틸: `/src/test/utils.tsx`

---

*컴포넌트 작업 시 이 문서를 우선 참조하세요.*