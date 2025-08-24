# 🔐 Supabase 클라이언트 패턴

*프로젝트 표준 Supabase 클라이언트 사용법 및 RLS 정책 가이드*

---

## 🚨 필수 패턴 (2025-08-22 표준)

### ✅ Server Component 패턴

```typescript
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic'; // 환경변수 오류 방지 필수!

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  
  // 인증 체크
  const { data: { user } } = await supabase.auth.getUser();
  
  // 데이터 페칭
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user?.id);
  
  if (error) {
    console.error('Supabase error:', error);
    return <ErrorComponent />;
  }
  
  return <PageContent data={data} />;
}
```

### ✅ API Route 패턴

```typescript
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const supabase = await createSupabaseRouteHandlerClient();
  
  // 인증 체크 (필수)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }
  
  // 비즈니스 로직
  const { data, error } = await supabase
    .from('table')
    .select()
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }
  
  return NextResponse.json(data);
}
```

### ✅ Client Component 패턴

```typescript
'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { useEffect, useState } from 'react';

export function ClientComponent() {
  const supabase = createSupabaseBrowserClient();
  const [data, setData] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('posts')
        .select()
        .order('created_at', { ascending: false });
      
      if (!error) {
        setData(data);
      }
    }
    
    fetchData();
  }, []);
  
  // Realtime 구독
  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('Change received!', payload);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return <div>{/* UI */}</div>;
}
```

---

## ❌ 절대 금지 패턴 (빌드 실패 원인)

### 44개 파일에서 제거된 패턴들
```typescript
// ❌ 모두 금지 - PKCE 오류 발생!
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

// ❌ 직접 생성 금지 - 환경변수 오류!
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);

// ❌ 기타 금지사항
getSession()    // 금지 → getUser() 사용
new Response()  // 금지 → NextResponse.json() 사용
process.env.*   // 금지 → env.ts 사용
```

---

## 🔒 인증 패턴

### getUser() vs getSession()
```typescript
// ✅ 올바름 - 서버에서 토큰 검증
const { data: { user } } = await supabase.auth.getUser();

// ❌ 금지 - 클라이언트 토큰 신뢰
const { data: { session } } = await supabase.auth.getSession();
```

### 로그인/로그아웃
```typescript
// 로그인 (OAuth)
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'kakao',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});

// 로그아웃
const { error } = await supabase.auth.signOut();

// 현재 사용자
const { data: { user } } = await supabase.auth.getUser();
```

---

## 🔒 RLS (Row Level Security) 정책

### 테이블 생성 시 즉시 적용
```sql
-- 1. 테이블 생성
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS 활성화 (필수!)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 3. 정책 생성
-- 자신의 데이터만 조회
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

-- 자신의 데이터만 생성
CREATE POLICY "Users can create own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 자신의 데이터만 수정
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

-- 자신의 데이터만 삭제
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);
```

### 공개 데이터 정책
```sql
-- 모든 사용자가 조회 가능
CREATE POLICY "Public posts viewable by all" ON posts
  FOR SELECT USING (is_public = true);

-- 인증된 사용자만 생성
CREATE POLICY "Authenticated users can create" ON posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### 관리자 정책
```sql
-- 관리자는 모든 작업 가능
CREATE POLICY "Admins can do everything" ON posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

---

## 📊 쿼리 최적화

### 필요한 필드만 선택
```typescript
// ✅ 효율적 - 필요한 필드만
const { data } = await supabase
  .from('posts')
  .select('id, title, created_at')
  .eq('status', 'published')
  .limit(10);

// ❌ 비효율 - 모든 필드
const { data } = await supabase
  .from('posts')
  .select('*');
```

### 조인 최적화
```typescript
// 단일 조인
const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    author:users(name, avatar)
  `)
  .eq('status', 'published');

// 다중 조인
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    author:users(name),
    comments(count),
    tags(name)
  `);
```

### 페이지네이션
```typescript
const PAGE_SIZE = 20;

const { data, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
  .order('created_at', { ascending: false });
```

---

## 🔄 트랜잭션 처리

### RPC 함수 사용
```sql
-- Supabase SQL Editor에서 생성
CREATE OR REPLACE FUNCTION transfer_credits(
  from_user UUID,
  to_user UUID,
  amount INT
) RETURNS void AS $$
BEGIN
  -- 출금
  UPDATE users 
  SET credits = credits - amount 
  WHERE id = from_user;
  
  -- 입금
  UPDATE users 
  SET credits = credits + amount 
  WHERE id = to_user;
  
  -- 로그 기록
  INSERT INTO transfer_logs (from_user, to_user, amount)
  VALUES (from_user, to_user, amount);
END;
$$ LANGUAGE plpgsql;
```

```typescript
// TypeScript에서 호출
const { error } = await supabase.rpc('transfer_credits', {
  from_user: userId1,
  to_user: userId2,
  amount: 100
});
```

---

## 📝 마이그레이션 관리

### SQL 실행 도구
```bash
# PostgreSQL 직접 연결 (권장)
node scripts/supabase-sql-executor.js --method pg --file migrations/001_create_tables.sql

# 테이블 상태 확인
node scripts/verify-with-service-role.js

# 타입 재생성
npm run types:generate
```

### 마이그레이션 파일 구조
```sql
-- migrations/001_create_tables.sql
BEGIN;

-- 테이블 생성
CREATE TABLE IF NOT EXISTS ...

-- RLS 정책
ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
CREATE POLICY ...

-- 인덱스
CREATE INDEX ...

COMMIT;
```

---

## 🔍 Realtime 구독

### 테이블 변경 감지
```typescript
const channel = supabase
  .channel('db-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // 'INSERT' | 'UPDATE' | 'DELETE'
      schema: 'public',
      table: 'posts',
      filter: `user_id=eq.${userId}` // 선택적 필터
    },
    (payload) => {
      console.log('Change:', payload);
    }
  )
  .subscribe();

// 정리
return () => {
  supabase.removeChannel(channel);
};
```

### Presence (온라인 상태)
```typescript
const channel = supabase.channel('online-users');

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    console.log('Online users:', state);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user_id: userId });
    }
  });
```

---

## ⚠️ 주의사항

1. **환경변수 직접 접근 금지** - env.ts 사용
2. **getSession() 사용 금지** - getUser() 사용
3. **auth-helpers-nextjs 사용 금지** - 프로젝트 래퍼 사용
4. **RLS 없는 테이블 생성 금지** - 보안 취약점
5. **SELECT * 사용 자제** - 필요한 필드만 선택

---

## 📋 체크리스트

- [ ] 올바른 클라이언트 패턴 사용
- [ ] 인증 체크 구현
- [ ] RLS 정책 적용
- [ ] 쿼리 최적화
- [ ] 에러 처리
- [ ] 타입 안전성
- [ ] Realtime 정리

---

## 📁 관련 파일

- Server 클라이언트: `/src/lib/supabase/server-client.ts`
- Browser 클라이언트: `/src/lib/supabase/browser-client.ts`
- 타입 정의: `/src/types/index.ts`
- 마이그레이션: `/supabase/migrations/`
- SQL 실행 도구: `/scripts/supabase-sql-executor.js`

---

*Supabase 작업 시 이 문서를 우선 참조하세요.*