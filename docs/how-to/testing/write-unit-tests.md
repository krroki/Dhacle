# 유닛 테스트 작성하기

*React Testing Library, Jest, Playwright를 활용한 포괄적 테스트 전략*

---

## 🛑 STOP - 즉시 중단 신호

- **런타임 에러 무시 → 중단**
- **테스트 커버리지 무시 → 중단** (80% unit, 70% integration 목표)
- **any 타입 테스트 데이터 → 중단**
- **실제 API 호출 테스트 → 중단** (모킹 필수)

---

## 2️⃣ MUST - 필수 행동

### React 컴포넌트 테스트
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// 구체적 타입 정의
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com'
};

// 실제 사용자 상호작용 시뮬레이션
await userEvent.click(screen.getByRole('button', { name: '저장' }));
```

---

## 3️⃣ CHECK - 검증 필수

```bash
npm run test                    # 유닛 테스트 실행
npm run test:coverage           # 커버리지 확인 (80% 목표)
npm run test:e2e               # E2E 테스트 실행
npm run test:watch             # 개발 중 지속 테스트
```

---

## 📝 테스트 타입별 가이드

### 1. React 컴포넌트 테스트

#### 기본 렌더링 테스트
```typescript
// src/components/features/notes/NoteCard.test.tsx
import { render, screen } from '@testing-library/react';
import NoteCard from './NoteCard';
import { Note } from '@/types';

const mockNote: Note = {
  id: '1',
  title: 'Test Note',
  content: 'This is a test note',
  created_at: '2024-01-01T00:00:00Z',
  user_id: 'user-1'
};

describe('NoteCard', () => {
  it('renders note information correctly', () => {
    render(<NoteCard note={mockNote} />);
    
    expect(screen.getByText('Test Note')).toBeInTheDocument();
    expect(screen.getByText('This is a test note')).toBeInTheDocument();
    expect(screen.getByText('2024년 1월 1일')).toBeInTheDocument();
  });
  
  it('handles missing content gracefully', () => {
    const noteWithoutContent = { ...mockNote, content: null };
    
    render(<NoteCard note={noteWithoutContent} />);
    
    expect(screen.getByText('Test Note')).toBeInTheDocument();
    expect(screen.queryByText('This is a test note')).not.toBeInTheDocument();
  });
});
```

#### 사용자 상호작용 테스트
```typescript
import userEvent from '@testing-library/user-event';

describe('NoteForm', () => {
  it('submits form with correct data', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<NoteForm onSubmit={onSubmit} />);
    
    // 폼 입력
    await user.type(screen.getByLabelText('제목'), 'New Note');
    await user.type(screen.getByLabelText('내용'), 'Note content');
    
    // 폼 제출
    await user.click(screen.getByRole('button', { name: '저장' }));
    
    // 결과 검증
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'New Note',
      content: 'Note content'
    });
  });
  
  it('shows validation errors for empty required fields', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<NoteForm onSubmit={onSubmit} />);
    
    // 빈 폼으로 제출 시도
    await user.click(screen.getByRole('button', { name: '저장' }));
    
    // 에러 메시지 확인
    expect(screen.getByText('제목을 입력하세요')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

### 2. React Hook 테스트

```typescript
// src/hooks/queries/useNoteQueries.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useNoteQueries from './useNoteQueries';
import { apiGet } from '@/lib/api-client';

// API 클라이언트 모킹
jest.mock('@/lib/api-client');
const mockedApiGet = apiGet as jest.MockedFunction<typeof apiGet>;

// React Query 테스트 래퍼
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useNoteQueries', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('fetches notes successfully', async () => {
    const mockNotes = [
      { id: '1', title: 'Note 1', content: 'Content 1' },
      { id: '2', title: 'Note 2', content: 'Content 2' },
    ];
    
    mockedApiGet.mockResolvedValue(mockNotes);
    
    const { result } = renderHook(() => useNoteQueries(), {
      wrapper: createWrapper(),
    });
    
    // 로딩 상태 확인
    expect(result.current.isLoading).toBe(true);
    
    // 데이터 로딩 대기
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // 결과 검증
    expect(result.current.data).toEqual(mockNotes);
    expect(mockedApiGet).toHaveBeenCalledWith('/api/notes');
  });
  
  it('handles fetch error correctly', async () => {
    const mockError = new Error('Failed to fetch');
    mockedApiGet.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useNoteQueries(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    
    expect(result.current.error).toEqual(mockError);
  });
});
```

### 3. API Route 테스트

```typescript
// src/app/api/notes/route.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from './route';

// Supabase 모킹
jest.mock('@/lib/supabase/server-client');

describe('/api/notes', () => {
  describe('GET', () => {
    it('returns notes for authenticated user', async () => {
      const { req } = createMocks({ method: 'GET' });
      
      // 인증된 사용자 모킹
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      jest.mocked(createSupabaseRouteHandlerClient).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [
                  { id: '1', title: 'Note 1', user_id: 'user-1' },
                  { id: '2', title: 'Note 2', user_id: 'user-1' },
                ],
                error: null,
              }),
            }),
          }),
        }),
      } as any);
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
    });
    
    it('returns 401 for unauthenticated user', async () => {
      // 미인증 사용자 모킹
      jest.mocked(createSupabaseRouteHandlerClient).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      } as any);
      
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBe('User not authenticated');
    });
  });
  
  describe('POST', () => {
    it('creates note for authenticated user', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: { title: 'New Note', content: 'Note content' },
      });
      
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockNote = {
        id: '3',
        title: 'New Note',
        content: 'Note content',
        user_id: 'user-1',
      };
      
      jest.mocked(createSupabaseRouteHandlerClient).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockNote,
                error: null,
              }),
            }),
          }),
        }),
      } as any);
      
      const response = await POST(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockNote);
    });
  });
});
```

### 4. 유틸리티 함수 테스트

```typescript
// src/lib/utils/date-formatter.test.ts
import { formatDate, formatRelativeDate } from './date-formatter';

describe('date-formatter', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      
      expect(formatDate(date)).toBe('2024년 1월 15일');
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-01-15');
      expect(formatDate(date, 'MM/DD/YYYY')).toBe('01/15/2024');
    });
    
    it('handles invalid date', () => {
      const invalidDate = new Date('invalid');
      
      expect(formatDate(invalidDate)).toBe('Invalid Date');
    });
  });
  
  describe('formatRelativeDate', () => {
    beforeEach(() => {
      // 현재 시간을 고정
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T10:30:00Z'));
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('formats relative dates correctly', () => {
      const now = new Date('2024-01-15T10:30:00Z');
      const oneHourAgo = new Date('2024-01-15T09:30:00Z');
      const oneDayAgo = new Date('2024-01-14T10:30:00Z');
      
      expect(formatRelativeDate(oneHourAgo)).toBe('1시간 전');
      expect(formatRelativeDate(oneDayAgo)).toBe('1일 전');
    });
  });
});
```

---

## 🧪 E2E 테스트 (Playwright)

### 사용자 플로우 테스트
```typescript
// tests/e2e/notes.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Notes Management', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/auth/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // 대시보드 페이지 대기
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('creates new note successfully', async ({ page }) => {
    // 노트 페이지로 이동
    await page.click('[data-testid="notes-link"]');
    await expect(page).toHaveURL('/notes');
    
    // 새 노트 생성
    await page.click('[data-testid="add-note-button"]');
    await page.fill('[data-testid="note-title"]', 'E2E Test Note');
    await page.fill('[data-testid="note-content"]', 'This is an E2E test note');
    
    // 저장 및 확인
    await page.click('[data-testid="save-note-button"]');
    
    // 성공 메시지 확인
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // 노트 목록에서 확인
    await expect(page.locator('text=E2E Test Note')).toBeVisible();
  });
  
  test('edits existing note', async ({ page }) => {
    await page.goto('/notes');
    
    // 첫 번째 노트 편집
    await page.click('[data-testid="note-card"]:first-child [data-testid="edit-button"]');
    
    // 제목 수정
    await page.fill('[data-testid="note-title"]', 'Updated Note Title');
    await page.click('[data-testid="save-note-button"]');
    
    // 수정 확인
    await expect(page.locator('text=Updated Note Title')).toBeVisible();
  });
  
  test('deletes note with confirmation', async ({ page }) => {
    await page.goto('/notes');
    
    // 노트 개수 확인
    const initialCount = await page.locator('[data-testid="note-card"]').count();
    
    // 첫 번째 노트 삭제
    await page.click('[data-testid="note-card"]:first-child [data-testid="delete-button"]');
    
    // 확인 대화상자
    await page.click('[data-testid="confirm-delete-button"]');
    
    // 삭제 확인
    const finalCount = await page.locator('[data-testid="note-card"]').count();
    expect(finalCount).toBe(initialCount - 1);
  });
});
```

### 성능 테스트
```typescript
// tests/e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3초 이내 로딩
  });
  
  test('handles large dataset efficiently', async ({ page }) => {
    await page.goto('/notes');
    
    // 많은 노트가 있는 상황 시뮬레이션
    await page.evaluate(() => {
      // 가상 스크롤링 테스트
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // 스크롤 성능 확인 (지연 없이 스크롤 가능)
    await expect(page.locator('[data-testid="notes-list"]')).toBeVisible();
  });
});
```

---

## 🔧 테스트 설정 및 유틸리티

### Jest 설정
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/database.generated.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
};
```

### 테스트 유틸리티
```typescript
// tests/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement } from 'react';

// 테스트용 Query Client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// 커스텀 렌더 함수
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const queryClient = createTestQueryClient();
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  return render(ui, { wrapper: Wrapper, ...options });
};

// 모킹 헬퍼
export const mockUser = (overrides?: Partial<User>): User => ({
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const mockNote = (overrides?: Partial<Note>): Note => ({
  id: 'test-note-1',
  title: 'Test Note',
  content: 'Test content',
  user_id: 'test-user-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// 재내보내기
export * from '@testing-library/react';
export { customRender as render };
```

---

## 📊 테스트 커버리지

### 커버리지 목표
- **Unit Tests**: 80% 이상
- **Integration Tests**: 70% 이상
- **E2E Tests**: 주요 사용자 플로우 100%

### 커버리지 확인
```bash
# 전체 커버리지 리포트
npm run test:coverage

# HTML 리포트 생성
npm run test:coverage -- --coverage --watchAll=false

# 특정 파일 커버리지
npm run test:coverage -- --collectCoverageFrom="src/components/**/*.{ts,tsx}"
```

---

## ❌ 흔한 실수들

### 1. any 타입 테스트 데이터
```typescript
// ❌ 잘못된 방법
const mockData: any = { id: 1, name: 'test' };

// ✅ 올바른 방법
const mockData: User = {
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
};
```

### 2. 실제 API 호출
```typescript
// ❌ 잘못된 방법 - 실제 API 호출
test('fetches user data', async () => {
  const data = await fetch('/api/users'); // 실제 서버 호출!
  // ...
});

// ✅ 올바른 방법 - 모킹 사용
test('fetches user data', async () => {
  jest.mocked(apiGet).mockResolvedValue(mockUsers);
  // ...
});
```

### 3. 비동기 처리 무시
```typescript
// ❌ 잘못된 방법
test('updates state', () => {
  fireEvent.click(button);
  expect(screen.getByText('Updated')).toBeInTheDocument(); // 즉시 확인
});

// ✅ 올바른 방법
test('updates state', async () => {
  fireEvent.click(button);
  await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
```

---

## 🔗 관련 문서

- [Test Agent 지침](../../../tests/CLAUDE.md) - 상세 테스트 규칙
- [컴포넌트 개발](../component-development/create-component.md) - 테스트 가능한 컴포넌트 작성
- [API 개발](../api-development/create-new-route.md) - API 테스트 패턴

---

**💡 기억하세요**: 좋은 테스트는 코드의 품질을 보장할 뿐만 아니라, 리팩토링과 기능 추가 시에도 안전망 역할을 합니다. 테스트를 먼저 작성하는 TDD 방식도 고려해보세요.