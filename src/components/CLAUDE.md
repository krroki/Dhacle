# 🧩 Component 개발 지침

*React 컴포넌트 전문가 - Component Agent 자동 활성화*

**자동 활성화**: `src/components/**` 파일 Edit/Write/MultiEdit 시  
**전문 분야**: shadcn/ui 우선, Server Component 기본, Props 타입 안전성

---

## 🛑 Component 3단계 필수 규칙

### 1️⃣ STOP - 즉시 중단 신호
- **Props any 타입 → 중단**
- **'use client' 남발 → 중단** (Server Component 우선)
- **HTML 태그 직접 사용 → 중단** (`<button>`, `<div>` 대신 shadcn/ui)
- **children: any → 중단**
- **Event handler any → 중단**

### 2️⃣ MUST - 필수 행동
```typescript
// shadcn/ui 컴포넌트 우선 사용 (필수)
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Props 타입 정의 필수 (any 금지)
interface ComponentProps {
  data: User[];  // 구체적 타입
  onChange: (value: string) => void;
  children: React.ReactNode;  // any 대신
}

// Server Component 기본 (별도 지시 없으면)
export default function ServerComponent({ data }: ComponentProps) {
  return <Card><CardContent>...</CardContent></Card>;
}
```

### 3️⃣ CHECK - 검증 필수
```bash
# Component 수정 후 즉시 실행
npm run types:check                      # TypeScript 검증
npm run dev                             # 실제 렌더링 확인
npx biome check src/components/**/*.tsx  # 코드 스타일 검증
```

## 🚫 Component any 타입 금지

### ❌ 발견된 문제: SearchBar.tsx
```typescript
// ❌ 절대 금지 - 'any' 문자열도 혼동 야기
<option value="any">모든 정의</option>

// ✅ 즉시 수정 - 명확한 값 사용
<option value="all">모든 정의</option>
```

### 🛡️ 예방책
- **Props Interface 정의**: 모든 컴포넌트에 구체적 Props 타입
- **Generic 활용**: `<T>` 사용으로 타입 안전성과 재사용성 확보
- **Type Agent 연계**: `.tsx` 파일 수정 시 Type Agent 자동 활성화

---

## 🚨 Component 필수 패턴

### 패턴 1: shadcn/ui 우선 사용
```typescript
// ✅ shadcn/ui 컴포넌트 우선 (프로젝트 표준)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>제목</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="입력하세요" />
        <Button>클릭</Button>
      </CardContent>
    </Card>
  );
}

// ❌ 절대 금지 - HTML 태그 직접 사용
// <div><h1>제목</h1><input><button>클릭</button></div>
```

### 패턴 2: Server Component 기본값
```typescript
// ✅ Server Component (기본값 - 'use client' 없음)
import { User } from '@/types';

interface ServerComponentProps {
  users: User[];
}

export default function UserList({ users }: ServerComponentProps) {
  return (
    <div>
      {users.map(user => (
        <Card key={user.id}>
          <CardContent>{user.name}</CardContent>
        </Card>
      ))}
    </div>
  );
}

// ❌ Client Component는 정말 필요한 경우만
// 'use client'  // 상태나 이벤트가 반드시 필요한 경우만
```

### 패턴 3: 타입 안전 Props 정의
```typescript
// ✅ 구체적 Props 타입 정의
interface UserCardProps {
  user: User;                           // 구체적 타입
  onEdit?: (id: string) => void;        // 옵셔널 콜백
  className?: string;                   // 스타일 커스터마이징
  variant?: 'default' | 'compact';     // 제한된 옵션
}

export default function UserCard({ 
  user, 
  onEdit, 
  className,
  variant = 'default' 
}: UserCardProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardContent>
        <h3>{user.name}</h3>
        {onEdit && <Button onClick={() => onEdit(user.id)}>편집</Button>}
      </CardContent>
    </Card>
  );
}
```

---

## 📋 Component 검증 명령어

```bash
# 즉시 검증
npm run types:check                      # Props 타입 검증
npm run dev                             # 실제 렌더링 확인

# 상세 검증
npx biome check src/components/**/*.tsx  # ESLint + Prettier
npm run build                           # 프로덕션 빌드 확인

# 실제 동작 확인
# 브라우저에서 컴포넌트 렌더링 및 상호작용 테스트
```

---

## 🎯 Component 성공 기준

- [ ] **shadcn/ui 사용**: HTML 태그 대신 UI 컴포넌트 사용
- [ ] **Props 타입 정의**: any 타입 0개, 모든 Props에 구체적 타입
- [ ] **Server Component 우선**: 'use client' 최소화 
- [ ] **타입 안전성**: 이벤트 핸들러, children 모두 타입 정의
- [ ] **실제 렌더링**: 브라우저에서 정상 표시 확인

---

## ⚠️ Component 주의사항

### 자주 하는 실수
- **HTML 태그 직접 사용**: `<button>` 대신 `<Button>` 사용
- **'use client' 남발**: 상태/이벤트 없으면 Server Component
- **Props any 타입**: 빠른 개발을 핑계로 타입 안전성 포기
- **shadcn/ui 무시**: 일관성 없는 스타일링

### 함정 포인트
- **children 타입**: `any` 대신 `React.ReactNode` 사용
- **이벤트 타입**: `any` 대신 `React.MouseEvent<HTMLButtonElement>` 등
- **조건부 렌더링**: null 체크 후 JSX 반환
- **CSS 클래스**: Tailwind 우선, 커스텀 CSS는 최소화

---

## 📁 관련 파일

- **UI 컴포넌트**: [/src/components/ui/](ui/) - shadcn/ui 컴포넌트 (수정 금지)
- **타입 정의**: [/src/types/index.ts](../../types/index.ts)
- **유틸리티**: [/src/lib/utils.ts](../../lib/utils.ts) - cn() 함수
- **Tailwind 설정**: [/tailwind.config.ts](../../tailwind.config.ts)

---

## 📁 Component 파일 구조

```
src/components/
├── ui/                   # shadcn/ui (수정 금지)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── features/             # 기능별 컴포넌트
│   ├── auth/
│   ├── youtube-lens/
│   └── revenue-proof/
├── layout/               # 레이아웃
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
└── common/               # 공통 유틸리티
    ├── ErrorBoundary.tsx
    ├── LoadingSpinner.tsx
    └── EmptyState.tsx
```

---

*Component 작업 시 이 지침을 필수로 준수하세요. Component Agent가 자동으로 활성화되어 shadcn/ui 우선 사용과 타입 안전성을 강제 검증합니다.*