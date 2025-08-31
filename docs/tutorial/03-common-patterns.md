# 일반적인 패턴들

## 📌 문서 관리 지침
**목적**: AI가 프로젝트의 핵심 코딩 패턴을 익혀 일관된 품질의 코드를 생산  
**대상**: 패턴 기반 코드 작성이 필요한 AI 또는 일관성 확보가 필요한 경우  
**범위**: 인증, UI, 데이터, 에러처리, 환경변수, 테스팅, 성능 최적화 패턴 포함  
**업데이트 기준**: 새로운 패턴 도입, 기존 패턴 변경, 모범 사례 업데이트 시  
**최대 길이**: 10000 토큰 (코드 예제 포함)  
**연관 문서**: [첫 번째 작업](02-first-task.md), [How-to 가이드](../how-to/)

## ⚠️ 금지사항
- 프레임워크별 상세 설명 금지 (→ reference/ 문서로 이관)
- 복잡한 아키텍처 패턴 추가 금지 (→ explanation/ 문서로 분리)
- 프로젝트별 커스텀 로직 포함 금지 (일반적 패턴에만 집중)

---

*프로젝트에서 자주 사용되는 코딩 패턴과 모범 사례*

**소요 시간**: 10-15분  
**필요 조건**: [첫 번째 작업](02-first-task.md) 완료

---

## 🎯 학습 목표

- 프로젝트의 핵심 패턴들 이해
- 일관된 코딩 스타일 적용
- 자주 발생하는 상황별 해결책 학습

---

## 🔒 인증 패턴

### API Route에서 인증 체크
```typescript
// 모든 API에서 사용하는 표준 패턴
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
}
```

### Client Component에서 인증 상태 확인
```typescript
'use client'

import { useUser } from '@/hooks/queries/useUserQueries';

export default function AuthenticatedComponent() {
  const { data: user, isLoading } = useUser();
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <div>로그인이 필요합니다.</div>;
  
  return <div>인증된 사용자 컨텐츠</div>;
}
```

---

## 🎨 UI 컴포넌트 패턴

### shadcn/ui 컴포넌트 우선 사용
```typescript
// ✅ 추천 - shadcn/ui 사용
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// ❌ 비추천 - HTML 태그 직접 사용
// <button>, <div>, <input>
```

### 조건부 렌더링
```typescript
// 로딩 상태
{isLoading && <LoadingSpinner />}

// 에러 상태  
{error && <ErrorMessage error={error} />}

// 데이터 있을 때
{data && data.length > 0 ? (
  <DataList data={data} />
) : (
  <EmptyState message="데이터가 없습니다." />
)}
```

### Props 타입 정의
```typescript
// ✅ 구체적인 타입 정의
interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

// ❌ any 타입 사용 금지
// props: any
```

---

## 🔄 데이터 페칭 패턴

### React Query 훅 사용
```typescript
// ✅ 추천 - 기존 훅 활용
import { useUserQueries } from '@/hooks/queries/useUserQueries';

const { data: user, isLoading, error } = useUserQueries();
```

### API 클라이언트 사용
```typescript
// ✅ 추천 - api-client 사용
import { apiGet, apiPost } from '@/lib/api-client';

const fetchNotes = async () => {
  return apiGet<Note[]>('/api/notes');
};

const createNote = async (data: CreateNoteData) => {
  return apiPost<Note>('/api/notes', data);
};
```

---

## 🗄️ 데이터베이스 패턴

### 기본 테이블 구조
```sql
-- 표준 테이블 구조
CREATE TABLE IF NOT EXISTS table_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 (필수!)
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own records" ON table_name FOR ALL USING (auth.uid() = user_id);
```

### 업데이트 트리거
```sql
-- updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_table_name_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## ✅ 에러 처리 패턴

### API Route 에러 처리
```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');
    
  if (error) throw error;
  
  return NextResponse.json(data);
} catch (error) {
  console.error('API Error:', error);
  
  const message = error instanceof Error ? error.message : 'Unknown error';
  return NextResponse.json(
    { error: 'Internal Server Error', details: message },
    { status: 500 }
  );
}
```

### Client Component 에러 처리
```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ['notes'],
  queryFn: fetchNotes,
  onError: (error) => {
    console.error('Query Error:', error);
    // 토스트 알림이나 에러 상태 설정
  }
});

if (error) {
  return <ErrorMessage error={error} />;
}
```

---

## 🔧 환경변수 패턴

### 타입 안전한 환경변수 접근
```typescript
// ✅ 추천 - env.ts 사용
import { env } from '@/env';

const apiKey = env.NEXT_PUBLIC_API_KEY;
const dbUrl = env.DATABASE_URL;

// ❌ 비추천 - 직접 접근
// process.env.API_KEY
```

### 클라이언트/서버 구분
```typescript
// 클라이언트에서 접근 가능 (NEXT_PUBLIC_ 필수)
const publicUrl = env.NEXT_PUBLIC_SITE_URL;

// 서버에서만 접근 가능 (접두사 없음)
const secretKey = env.SECRET_KEY;
```

---

## 🧪 테스팅 패턴

### 유닛 테스트
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotesList from './NotesList';

describe('NotesList', () => {
  const mockNotes = [
    { id: '1', title: 'Test Note', content: 'Test content', created_at: '2024-01-01' }
  ];
  
  it('renders notes correctly', () => {
    render(<NotesList notes={mockNotes} onAddNote={jest.fn()} />);
    
    expect(screen.getByText('Test Note')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
  
  it('calls onAddNote when form is submitted', async () => {
    const onAddNote = jest.fn();
    render(<NotesList notes={[]} onAddNote={onAddNote} />);
    
    await userEvent.type(screen.getByPlaceholderText('제목'), 'New Note');
    await userEvent.click(screen.getByRole('button', { name: '추가' }));
    
    expect(onAddNote).toHaveBeenCalledWith('New Note', '');
  });
});
```

---

## 📱 반응형 디자인 패턴

### Tailwind CSS 반응형
```typescript
<div className={cn(
  "grid gap-4",
  "grid-cols-1",        // 모바일: 1열
  "md:grid-cols-2",     // 태블릿: 2열  
  "lg:grid-cols-3",     // 데스크톱: 3열
  "xl:grid-cols-4"      // 대형 화면: 4열
)}>
  {items.map(item => (
    <Card key={item.id}>{item.title}</Card>
  ))}
</div>
```

### 조건부 스타일링
```typescript
<Button 
  className={cn(
    "px-4 py-2",
    {
      "bg-blue-500": variant === 'primary',
      "bg-gray-500": variant === 'secondary',
      "opacity-50": disabled
    }
  )}
>
  {children}
</Button>
```

---

## 🔍 검증 패턴

### 필수 검증 명령어
```bash
# 매번 변경 후 실행
npm run types:check      # TypeScript 검증
npm run verify:parallel  # 전체 시스템 검증

# 특정 영역 검증
npx biome check src/components/**/*.tsx  # 컴포넌트 스타일
curl -X GET http://localhost:3000/api/endpoint  # API 테스트
```

### Git 커밋 전 체크리스트
```bash
# 1. 타입 체크
npm run types:check

# 2. 린트 체크  
npm run lint

# 3. 빌드 테스트
npm run build

# 4. 테스트 실행
npm run test

# 모든 검증 통과 후 커밋
git add .
git commit -m "feat: 메모 기능 추가"
```

---

## 💡 성능 최적화 패턴

### React Query 캐싱
```typescript
const { data } = useQuery({
  queryKey: ['notes', userId],
  queryFn: () => fetchNotes(userId),
  staleTime: 5 * 60 * 1000,    // 5분간 fresh
  cacheTime: 10 * 60 * 1000,   // 10분간 캐시 유지
});
```

### 이미지 최적화
```typescript
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="Hero image"
  width={800}
  height={600}
  priority  // 중요한 이미지에만
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

---

## 📚 다음 단계

패턴을 익혔다면 실전에 적용해보세요:

- [API 개발](../how-to/api-development/create-new-route.md) - API 고급 패턴
- [컴포넌트 개발](../how-to/component-development/create-component.md) - 재사용 가능한 컴포넌트
- [데이터베이스 운영](../how-to/database-operations/create-table.md) - DB 고급 운영

---

**💡 기억하세요**: 패턴은 일관성을 위한 것입니다. 프로젝트 전체에서 동일한 패턴을 사용하면 코드 품질과 유지보수성이 크게 향상됩니다.