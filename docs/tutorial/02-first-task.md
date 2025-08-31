# 첫 번째 작업 시작하기

## 📌 문서 관리 지침
**목적**: AI가 실제 개발 워크플로우를 단계별로 학습하고 완전한 기능을 독립적으로 구현  
**대상**: 개발 워크플로우를 처음 학습하는 AI 또는 실습이 필요한 경우  
**범위**: 데이터베이스 → API → 컴포넌트 → 검증의 전체 개발 사이클 포함  
**업데이트 기준**: 개발 워크플로우 변경, 핵심 패턴 업데이트, 검증 명령어 변경 시  
**최대 길이**: 8000 토큰 (실습 코드 포함)  
**연관 문서**: [일반적인 패턴들](03-common-patterns.md), [API 개발 가이드](../how-to/api-development/)

## ⚠️ 금지사항
- 이론적 설명 확장 금지 (→ explanation/ 문서로 이관)
- 고급 패턴 추가 금지 (→ how-to/ 문서로 분리)
- 다른 예제 기능 추가 금지 (메모 기능에 집중)

---

*새로운 기능 추가의 전체 워크플로우를 실제로 따라해보세요*

**소요 시간**: 15-20분  
**필요 조건**: [프로젝트 빠른 시작](01-quick-start.md) 완료

---

## 🎯 학습 목표

이 튜토리얼을 완료하면 다음을 할 수 있습니다:
- 새 API 엔드포인트 생성
- React 컴포넌트 추가
- 데이터베이스 테이블 생성
- 전체 검증 과정 실행

---

## 📝 실습: 간단한 메모 기능 추가

### Step 1: 데이터베이스 테이블 생성 (5분)

```bash
# 1. 마이그레이션 파일 생성
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_create_notes.sql << 'EOF'
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 (필수!)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notes" ON notes FOR ALL USING (auth.uid() = user_id);
EOF

# 2. SQL 실행
node scripts/supabase-sql-executor.js --method pg --file supabase/migrations/$(ls -t supabase/migrations/*.sql | head -1)

# 3. 타입 생성
npm run types:generate
```

### Step 2: API 엔드포인트 생성 (5분)

```typescript
// src/app/api/notes/route.ts
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const supabase = await createSupabaseRouteHandlerClient();
  
  // 🔒 인증 체크 (필수)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }
  
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(notes);
}

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createSupabaseRouteHandlerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }
  
  const body = await request.json();
  const { title, content } = body;
  
  const { data: note, error } = await supabase
    .from('notes')
    .insert({ title, content, user_id: user.id })
    .select()
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(note);
}
```

### Step 3: React 컴포넌트 생성 (5분)

```typescript
// src/components/features/notes/NotesList.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface NotesListProps {
  notes: Note[];
  onAddNote: (title: string, content: string) => void;
}

export default function NotesList({ notes, onAddNote }: NotesListProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const handleSubmit = () => {
    if (title.trim()) {
      onAddNote(title, content);
      setTitle('');
      setContent('');
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>새 메모 추가</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea 
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button onClick={handleSubmit}>추가</Button>
        </CardContent>
      </Card>
      
      <div className="grid gap-4">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <CardTitle className="text-lg">{note.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{note.content}</p>
              <p className="text-sm text-gray-400 mt-2">
                {new Date(note.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ 검증하기

### 1. TypeScript 검증
```bash
npm run types:check
```

### 2. 실제 동작 확인
```bash
# 개발 서버 시작
npm run dev

# API 테스트
curl -X GET http://localhost:3000/api/notes
```

### 3. 브라우저 테스트
1. http://localhost:3000 접속
2. 로그인 후 메모 기능 테스트

---

## 🎉 완료!

축하합니다! 다음을 성공적으로 완료했습니다:

- ✅ 데이터베이스 테이블 생성 (RLS 정책 포함)
- ✅ API 엔드포인트 생성 (인증 포함)  
- ✅ React 컴포넌트 생성 (shadcn/ui 사용)
- ✅ 타입 안전성 확보
- ✅ 실제 동작 검증

---

## 📚 다음 단계

- [일반적인 패턴들](03-common-patterns.md) - 자주 사용하는 패턴들
- [API 개발 가이드](../how-to/api-development/create-new-route.md) - 더 자세한 API 개발
- [컴포넌트 개발 가이드](../how-to/component-development/create-component.md) - 고급 컴포넌트 패턴

---

## 💡 문제 해결

**API가 작동하지 않는 경우:**
- 인증 상태 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인
- 서버 로그 확인

**타입 에러가 나는 경우:**
- `npm run types:generate` 재실행
- TypeScript 서버 재시작

**데이터베이스 접근 안되는 경우:**
- RLS 정책 확인: `node scripts/verify-with-service-role.js`
- Supabase 대시보드에서 테이블 상태 확인