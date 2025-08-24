# 📄 Next.js Pages 개발 지침

*Next.js 15 App Router 페이지 패턴 및 Server Component 우선 원칙*

---

## 🚨 Server Component 우선 원칙

### ✅ 기본 패턴 (Server Component)

```typescript
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic'; // 정적 생성 방지

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 서버에서 데이터 페칭
  const data = await fetchData(user?.id);
  
  return <PageContent data={data} />;
}
```

### 🎨 Client Component 사용 시점

**Client Component가 필요한 경우만 'use client' 추가:**
- 상태 관리 필요 (useState, useReducer)
- 브라우저 API 사용 (window, document)
- 이벤트 핸들러 (onClick, onChange)
- 외부 라이브러리 (차트, 에디터 등)
- React Query 훅 사용

```typescript
'use client';

import { useState } from 'react';
import { useYouTubeSearch } from '@/hooks/queries/useYouTubeSearch';

export function ClientSection() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useYouTubeSearch(query);
  
  return (
    <div>
      <input onChange={(e) => setQuery(e.target.value)} />
      {/* 인터랙티브 UI */}
    </div>
  );
}
```

---

## 📁 페이지 구조 패턴

```
(pages)/
├── [feature]/
│   ├── page.tsx          # Server Component (기본)
│   ├── layout.tsx        # 레이아웃 (선택적, 협의 필요)
│   ├── loading.tsx       # 로딩 UI
│   ├── error.tsx         # 에러 바운더리
│   └── components/       # 페이지 전용 컴포넌트
│       ├── ClientSection.tsx  # 'use client'
│       └── ServerSection.tsx  # Server Component
```

### 파일별 역할
- `page.tsx`: 메인 페이지 컴포넌트 (Server)
- `layout.tsx`: 공통 레이아웃 (사용자 협의 필수)
- `loading.tsx`: Suspense 폴백 UI
- `error.tsx`: 에러 처리 UI
- `components/`: 페이지 전용 하위 컴포넌트

---

## 🔐 인증이 필요한 페이지

### 리다이렉트 패턴
```typescript
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  // 인증된 사용자만 접근 가능한 컨텐츠
  const userContent = await fetchUserContent(user.id);
  
  return <ProtectedContent data={userContent} />;
}
```

### 조건부 렌더링 패턴
```typescript
export default async function OptionalAuthPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return (
    <>
      {user ? (
        <AuthenticatedView userId={user.id} />
      ) : (
        <PublicView />
      )}
    </>
  );
}
```

---

## 💾 데이터 페칭 전략

### 1. Server Component (초기 데이터)
```typescript
// 서버에서 직접 페칭 (SEO 친화적, 빠른 초기 로드)
export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('posts')
    .select()
    .order('created_at', { ascending: false });
  
  return <PostList initialData={data} />;
}
```

### 2. Client Hooks (동적 업데이트)
```typescript
'use client';

import { useCommunityPosts } from '@/hooks/queries/useCommunityPosts';

export function DynamicPostList({ initialData }) {
  const { data, refetch } = useCommunityPosts({
    initialData // 서버 데이터로 초기화
  });
  
  return (
    <>
      <button onClick={() => refetch()}>새로고침</button>
      <PostGrid posts={data} />
    </>
  );
}
```

### 3. Streaming (점진적 렌더링)
```typescript
import { Suspense } from 'react';

export default function StreamingPage() {
  return (
    <>
      <Header /> {/* 즉시 렌더링 */}
      
      <Suspense fallback={<LoadingSkeleton />}>
        <SlowDataSection /> {/* 비동기 로드 */}
      </Suspense>
      
      <Footer /> {/* 즉시 렌더링 */}
    </>
  );
}
```

### 4. 캐싱 전략
```typescript
// 정적 데이터 (재검증 주기 설정)
export const revalidate = 3600; // 1시간마다 재검증

// 동적 데이터 (캐싱 비활성화)
export const dynamic = 'force-dynamic';

// 세그먼트별 캐싱
export const fetchCache = 'force-cache';
```

---

## 🎯 메타데이터 설정

### 정적 메타데이터
```typescript
export const metadata = {
  title: '페이지 제목 | Dhacle',
  description: 'SEO를 위한 페이지 설명',
  keywords: ['키워드1', '키워드2'],
  openGraph: {
    title: 'OG 제목',
    description: 'OG 설명',
    images: ['/og-image.png'],
    url: 'https://dhacle.com/page',
  },
  twitter: {
    card: 'summary_large_image',
    title: '트위터 제목',
    description: '트위터 설명',
  }
};
```

### 동적 메타데이터
```typescript
export async function generateMetadata({ params }) {
  const post = await getPost(params.id);
  
  return {
    title: `${post.title} | Dhacle`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.thumbnail],
    }
  };
}
```

---

## 🎨 레이아웃 패턴

### 중첩 레이아웃
```typescript
// app/(pages)/layout.tsx
export default function PagesLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

### 조건부 레이아웃
```typescript
// 특정 페이지만 다른 레이아웃
export default function SpecialLayout({ children }) {
  const pathname = usePathname();
  
  if (pathname.startsWith('/special')) {
    return <SpecialWrapper>{children}</SpecialWrapper>;
  }
  
  return children;
}
```

---

## 🚦 로딩 및 에러 처리

### Loading UI
```typescript
// loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
}
```

### Error Boundary
```typescript
// error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">문제가 발생했습니다</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-white rounded"
      >
        다시 시도
      </button>
    </div>
  );
}
```

---

## ⚠️ 주의사항

1. **layout.tsx는 사용자 협의 없이 생성 금지**
2. **페이지별 상태는 Zustand store 활용**
3. **스타일링은 Tailwind CSS만 사용**
4. **shadcn/ui 컴포넌트 우선 활용**
5. **Server Component가 기본, 필요시만 Client**
6. **환경변수는 env.ts 통해 접근**
7. **데이터 페칭은 서버 우선**

---

## 📋 체크리스트

- [ ] Server Component로 구현 가능한가?
- [ ] 인증이 필요한 페이지인가?
- [ ] SEO가 중요한 페이지인가?
- [ ] 메타데이터 설정했는가?
- [ ] 로딩/에러 UI 구현했는가?
- [ ] Tailwind CSS만 사용했는가?
- [ ] shadcn/ui 컴포넌트 활용했는가?

---

## 📁 관련 파일

- Supabase 클라이언트: `/src/lib/supabase/server-client.ts`
- React Query 훅: `/src/hooks/queries/`
- 공통 컴포넌트: `/src/components/`
- 타입 정의: `/src/types/index.ts`
- 상태 관리: `/src/store/`

---

*페이지 작업 시 이 문서를 우선 참조하세요.*