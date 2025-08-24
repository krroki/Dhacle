# 📦 상태 관리 아키텍처 v2.0

> **최종 업데이트**: 2025-02-01
> **주요 변경**: React Query 도입, Zustand 확대

## 📊 상태 관리 전략
- **서버 상태**: React Query (API 데이터, 캐싱)
- **클라이언트 상태**: Zustand (UI, 사용자 상호작용)
- **폼 상태**: React Hook Form
- **URL 상태**: Next.js Router

---

## 🚨 최우선 이해사항 (Critical Understanding)

### 🎯 TypeScript 타입 시스템 v2.0 - Single Source of Truth

#### 필수 타입 import 패턴 (절대 준수)
```typescript
// ✅ 올바른 import - 반드시 @/types에서만
import { 
  User, CommunityPost,         // camelCase 타입 (Frontend용)
  DBUser, DBCommunityPost,      // snake_case 타입 (DB용)
  snakeToCamelCase,            // 변환 유틸리티
  camelToSnakeCase             // 변환 유틸리티
} from '@/types';

// ❌ 절대 금지 패턴
import { Database } from '@/types/database.generated'; // 금지!
import { Database } from '@/types/database';           // 금지!
import { Database } from '@/types/database.types';     // 금지!
```

### 🔄 전체 데이터 플로우 (핵심 아키텍처)
```
[Supabase DB] ← Row Level Security (snake_case)
      ↓
[database.generated.ts] ← Auto-generated Types
      ↓
[src/types/index.ts] ← Type Transformation (snake → camel)
      ↓
[API Routes] ← Session Check (getUser() 필수)
      ↓
[api-client.ts] ← Error Handler (401 표준화)
      ↓
[Zustand Store] ← Global State
      ↓
[React Component] ← Context + Hooks
      ↓
[UI State]
```

### 🏁 상태 관리 현황
- **Global State**: layout.ts, youtube-lens.ts, user.ts, notifications.ts (✅ 4개 store 완료)
- **Auth State**: AuthContext (✅ 100% 완료)
- **Server State**: React Query 도입 (✅ 5개 hooks 구현)
- **Cache State**: React Query 캐싱 + localStorage (✅ 구현 완료)

> **구현 상태 범례**:
> - ✅ 완료: Store와 관련 로직 모두 구현됨
> - ⚠️ 부분: Store는 있으나 일부 기능 미완성
> - ❌ 미구현: Store 자체가 없음

---

## 📚 목차 (Table of Contents)

### 아키텍처 및 패턴
- [🏗️ 상태 관리 아키텍처](#️-상태-관리-아키텍처)
- [🌍 Global State (Zustand)](#-global-state-zustand)
- [🔐 Auth State (Context API)](#-auth-state-context-api)
- [🗜️ Server State 관리 패턴](#️-server-state-관리-패턴)
- [📍 Local State 패턴](#-local-state-패턴)

### 페이지별 상태
- [📊 페이지별 상태 관리 매핑](#-페이지별-상태-관리-매핑)
  - [🎬 YouTube Lens](#-youtube-lens-toolsyoutube-lens)
  - [👤 마이페이지](#-마이페이지-mypage)
  - [💰 수익인증](#-수익인증-revenue-proof)
  - [💬 커뮤니티](#-커뮤니티-community)

### 동기화 및 최적화
- [🔀 상태 동기화 규칙](#-상태-동기화-규칙)
- [🛟️ 에러 상태 관리](#️-에러-상태-관리)
- [📈 성능 최적화 패턴](#-성능-최적화-패턴)
- [🐛 안티패턴](#-안티패턴-피해야-할-것)

### 통계 및 개선
- [📊 상태 관리 통계](#-상태-관리-통계)
- [🚨 개선 필요 사항](#-개선-필요-사항)

---

## 🏗️ 상태 관리 아키텍처

### 상태 타입별 관리 전략 세부

| 타입 | 저장소 | 범위 | 지속성 | 예시 | 구현 |
|------|--------|------|--------|------|------|
| **Global State** | Zustand | 전체 앱 | 세션 | layout, youtube-lens | ✅ |
| **Auth State** | Supabase Auth + Context | 전체 앱 | 세션 | user session | ✅ |
| **Server State** | Supabase/API | DB | 영구 | videos, courses, posts | ✅ |
| **Local State** | useState | 컴포넌트 | 마운트 | form, modal, search | ✅ |
| **UI State** | useState | UI 전용 | 임시 | loading, error, open | ✅ |
| **Cache State** | localStorage/Memory | 브라우저 | TTL | API 응답 캐싱 | ⚠️ |

---

## 🌍 Global State (Zustand)

### Zustand Store 목록 (4개)
1. **layout.ts** - UI 레이아웃 상태 관리
2. **youtube-lens.ts** - YouTube Lens 기능 상태
3. **user.ts** - 사용자 정보 및 설정 (NEW)
4. **notifications.ts** - 알림 관리 (NEW)

### 1. Layout Store (/src/store/layout.ts)

```typescript
// 타입 import는 필요 시 @/types에서
import type { User } from '@/types';

interface LayoutState {
  // Banner State
  isBannerVisible: boolean
  setBannerVisible: (visible: boolean) => void
  
  // Sidebar State  
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  
  // Mobile Menu
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
  
  // Header State
  isHeaderVisible: boolean
  setHeaderVisible: (visible: boolean) => void
  isScrolled: boolean
  setScrolled: (scrolled: boolean) => void
  
  // Search State
  isSearchOpen: boolean
  toggleSearch: () => void
  setSearchOpen: (open: boolean) => void
  
  // Notification State
  isNotificationOpen: boolean
  toggleNotification: () => void
  setNotificationOpen: (open: boolean) => void
  
  // Profile Dropdown
  isProfileDropdownOpen: boolean
  toggleProfileDropdown: () => void
  setProfileDropdownOpen: (open: boolean) => void
}
```

**사용처**: Header, Sidebar, MobileNav, TopBanner
**구현 상태**: ✅ 완료

---

### 2. YouTube Lens Store (/src/store/youtube-lens.ts)

```typescript
interface YouTubeLensState {
  // Video State
  videos: FlattenedYouTubeVideo[]
  setVideos: (videos: FlattenedYouTubeVideo[]) => void
  addVideos: (videos: FlattenedYouTubeVideo[]) => void
  clearVideos: () => void
  
  // Search State
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: FlattenedYouTubeVideo[]
  setSearchResults: (results: FlattenedYouTubeVideo[]) => void
  isSearching: boolean
  setIsSearching: (searching: boolean) => void
  
  // OAuth State
  oauthToken: OAuthToken | null
  setOAuthToken: (token: OAuthToken | null) => void
  
  // API Key State
  apiKey: string | null
  setApiKey: (key: string | null) => void
  hasApiKey: boolean
  
  // Quota State
  quotaUsed: number
  quotaLimit: number
  setQuotaInfo: (used: number, limit: number) => void
  
  // UI State
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  
  // Collection State
  selectedCollection: string | null
  setSelectedCollection: (id: string | null) => void
  
  // Filter State
  activeFilter: SearchFilter
  setActiveFilter: (filter: SearchFilter) => void
  
  // Pagination
  nextPageToken: string | null
  setNextPageToken: (token: string | null) => void
  hasMore: boolean
  setHasMore: (hasMore: boolean) => void
  
  // Methods
  resetState: () => void
  loadMoreVideos: () => Promise<void>
}
```

**사용처**: YouTube Lens 관련 모든 컴포넌트
**구현 상태**: ✅ 완료

---

### 3. User Store (/src/store/user.ts) - NEW

```typescript
interface UserStore {
  // User State
  user: User | null
  isLoading: boolean
  error: string | null
  
  // Preferences
  preferences: {
    language: string
    theme: 'light' | 'dark' | 'system'
    emailNotifications: boolean
    pushNotifications: boolean
  }
  
  // Actions
  fetchUser: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  updatePreferences: (prefs: Partial<Preferences>) => Promise<void>
  clearUser: () => void
  
  // Persist
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}
```

**사용처**: 프로필, 설정, 헤더 등
**구현 상태**: ✅ 완료 (2025-08-23)
**특징**: localStorage persist 적용

---

### 4. Notifications Store (/src/store/notifications.ts) - NEW

```typescript
interface NotificationsStore {
  // Notification State
  notifications: Notification[]
  unreadCount: number
  isDropdownOpen: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  addNotification: (notification: Notification) => void
  toggleDropdown: () => void
  setDropdownOpen: (open: boolean) => void
  
  // Real-time
  subscribeToNotifications: () => () => void
}
```

**사용처**: 헤더 알림 드롭다운, 알림 센터
**구현 상태**: ✅ 완료 (2025-08-23)
**특징**: Optimistic UI 업데이트

### Zustand 사용 패턴
```typescript
// 1. Store 생성 패턴
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useStore = create<StoreType>()(
  devtools(
    persist(
      (set, get) => ({
        // 상태
        items: [],
        
        // 액션
        addItem: (item) => set(state => ({
          items: [...state.items, item]
        })),
        
        // 비동기 액션
        fetchItems: async () => {
          const items = await apiGet('/api/items');
          set({ items });
        },
      }),
      {
        name: 'store-storage', // localStorage 키
      }
    )
  )
);

// 2. Selector 패턴 (성능 최적화)
const count = useStore(state => state.items.length);
const addItem = useStore(state => state.addItem);

// 3. Multiple Store 조합
import { useLayoutStore } from '@/store/layout';
import { useUserStore } from '@/store/user';

function Header() {
  const isSidebarOpen = useLayoutStore(state => state.isSidebarOpen);
  const user = useUserStore(state => state.user);
  
  return (
    <header>
      {user && <UserMenu />}
      <SidebarToggle isOpen={isSidebarOpen} />
    </header>
  );
}
```

---

## 🔐 Auth State (Context API)

### AuthContext (/src/lib/auth/AuthContext.tsx)

```typescript
// 타입 import는 @/types에서
import type { User } from '@/types';

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (provider: 'kakao') => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}
```

**Provider 위치**: `/src/lib/auth/AuthProvider.tsx`
**사용처**: 모든 인증이 필요한 페이지
**구현 상태**: ✅ 완료

---

## 🚀 React Query - 서버 상태 관리

### 설정 및 Provider
**파일**: `src/components/providers/Providers.tsx`
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5분 fresh
      gcTime: 5 * 60 * 1000,       // 5분 cache
      retry: 3,                    // 3회 재시도
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Custom Hooks 목록 (15개)
**디렉토리**: `src/hooks/queries/`

| Hook 이름 | 용도 | 캐싱 키 | 캐싱 시간 |
|-----------|------|---------|-----------|
| useYouTubeSearch | YouTube 검색 | ['youtube', 'search', query] | 5분 |
| useYouTubePopular | 인기 동영상 | ['youtube', 'popular'] | 30분 |
| useYouTubeFavorites | 즐겨찾기 | ['youtube', 'favorites'] | 5분 |
| useYouTubeQueries | YouTube 통합 | ['youtube', type] | 5분 |
| useChannelFolders | 채널 폴더 | ['channels', 'folders'] | 10분 |
| useUserProfile | 사용자 프로필 | ['user', 'profile', userId] | 10분 |
| useUserQueries | 사용자 통합 | ['user', type] | 5분 |
| useCommunityPosts | 커뮤니티 글 | ['community', 'posts'] | 1분 |
| useCommunityQueries | 커뮤니티 통합 | ['community', type] | 3분 |
| useRevenueProof | 수익 인증 | ['revenue', 'proofs'] | 5분 |
| useRevenueProofQueries | 수익 통합 | ['revenue', type] | 5분 |
| useCourseQueries | 강의 관련 | ['courses', type] | 10분 |
| useNotifications | 알림 목록 | ['notifications'] | 30초 |
| useNotificationQueries | 알림 통합 | ['notifications', type] | 1분 |
| useAdminQueries | 관리자 기능 | ['admin', type] | 3분 |
| useCacheInvalidation | 캐시 무효화 | - | - |

### 사용 패턴
```typescript
// 1. 기본 사용
import { useYouTubeSearch } from '@/hooks/queries/useYouTubeSearch';

function SearchComponent() {
  const { data, isLoading, error, refetch } = useYouTubeSearch({
    query: 'Next.js tutorial',
    maxResults: 10,
  });
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <SearchResults data={data} />;
}

// 2. Mutation 사용
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/lib/api-client';

function CreatePostForm() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (data) => apiPost('/api/posts', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['community', 'posts']);
      toast.success('게시글 작성 완료');
    },
  });
  
  const handleSubmit = (data) => {
    mutation.mutate(data);
  };
}

// 3. Optimistic Update
const mutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (newPost) => {
    await queryClient.cancelQueries(['posts']);
    const previousPosts = queryClient.getQueryData(['posts']);
    queryClient.setQueryData(['posts'], old => [...old, newPost]);
    return { previousPosts };
  },
  onError: (err, newPost, context) => {
    queryClient.setQueryData(['posts'], context.previousPosts);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['posts']);
  },
});

// 4. React Query v5 useInfiniteQuery 타입 패턴 (2025-08-24 추가)
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
}

// ✅ 올바른 v5 패턴 - 5개 제네릭 타입 명시
return useInfiniteQuery<
  PaginatedResponse<Post>,                    // TQueryFnData
  Error,                                       // TError  
  InfiniteData<PaginatedResponse<Post>>,      // TData (InfiniteData로 감싸기)
  readonly ['posts', any?],                    // TQueryKey (readonly 튜플)
  number                                       // TPageParam
>({
  queryKey: ['posts'] as const,
  queryFn: ({ pageParam }) => {               // pageParam 기본값 제거!
    return apiGet(`/api/posts?page=${pageParam}`);
  },
  initialPageParam: 0,                        // v5 필수 속성
  getNextPageParam: (lastPage, pages) => {
    if (lastPage?.data?.length < 20) return undefined;
    return pages.length;
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,                    // cacheTime → gcTime in v5
});
```

### 캐싱 전략
- **staleTime**: 데이터가 "신선"하다고 간주되는 시간
- **gcTime**: 캐시가 메모리에 유지되는 시간
- **refetchOnWindowFocus**: 창 포커스 시 재요청 (기본 false)
- **refetchOnReconnect**: 재연결 시 재요청 (기본 true)

### 데이터 동기화 패턴

#### 1. 읽기 (GET)
```typescript
// 타입 import
import { apiGet } from '@/lib/api-client';
import type { User, CommunityPost } from '@/types';

// 표준 패턴 - 타입 지정
useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      // API 응답은 이미 camelCase로 변환됨
      const data = await apiGet<CommunityPost[]>('/api/community/posts')
      setData(data) // data는 이미 camelCase
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [dependencies])
```

#### 2. 쓰기 (POST/PUT)
```typescript
import { apiPost } from '@/lib/api-client';
import type { CommunityPostInsert } from '@/types';

// 낙관적 업데이트 패턴 - 타입 지정
const handleUpdate = async (newData: CommunityPostInsert) => {
  // 1. Optimistic Update (camelCase 사용)
  setLocalData(newData)
  
  try {
    // 2. API Call - 자동으로 snake_case 변환 후 전송
    const result = await apiPost<CommunityPost>('/api/community/posts', newData)
    // 3. Confirm with server data (camelCase로 수신)
    setLocalData(result)
  } catch (error) {
    // 4. Rollback on error
    setLocalData(previousData)
    toast.error(error.message)
  }
}
```

#### 3. 실시간 구독 (부분 구현)
```typescript
// Supabase Realtime (수익인증 랭킹)
useEffect(() => {
  const channel = supabase
    .channel('revenue-proof-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'revenue_certifications'
    }, handleRealtimeUpdate)
    .subscribe()
    
  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

---

## 📍 Local State 패턴

### 폼 상태 관리
```typescript
// 검색 폼 예시
const [formState, setFormState] = useState({
  query: '',
  filter: 'all',
  sort: 'relevance'
})

const [formErrors, setFormErrors] = useState({})
const [isSubmitting, setIsSubmitting] = useState(false)
```

### 모달 상태
```typescript
const [modalState, setModalState] = useState({
  isOpen: false,
  type: null, // 'confirm' | 'alert' | 'custom'
  data: null
})
```

### 페이지네이션 상태
```typescript
const [pagination, setPagination] = useState({
  page: 1,
  limit: 20,
  total: 0,
  hasMore: true
})
```

---

## 📊 페이지별 상태 관리 매핑

### 🎬 YouTube Lens (/tools/youtube-lens)
```typescript
// 필요한 타입 import
import type { User } from '@/types';
import type { FlattenedYouTubeVideo, Collection, Favorite } from '@/types/youtube';

// Global State (Zustand)
- videos: FlattenedYouTubeVideo[] (youtube-lens store)
- apiKey: string | null (youtube-lens store)
- quotaInfo: { used, limit } (youtube-lens store)

// Auth State (Context)
- user: User (AuthContext - @/types에서 import)

// Server State (API)
- collections: Collection[] (GET /api/youtube/collections)
- favorites: Favorite[] (GET /api/youtube/favorites)

// Local State (useState)
- selectedVideo: Video | null
- isModalOpen: boolean
- videoAnalysis: AnalysisResult | null

// UI State
- isLoading: boolean (youtube-lens store)
- error: string | null (youtube-lens store)
```

### 👤 마이페이지 (/mypage)
```typescript
// 필요한 타입 import
import type { User, Course, RevenueProof } from '@/types';

// Auth State (필수)
- user: User (AuthContext - @/types에서 import)

// Server State  
- profile: User (GET /api/user/profile - User 타입 사용)
- enrollments: Course[] (미구현 - @/types에서 정의)
- revenues: RevenueProof[] (GET /api/revenue-proof/my)

// Local State
- activeTab: string
- isEditMode: boolean
- formData: Partial<User> // User 타입 활용

// UI State
- isSaving: boolean
- saveError: string | null
```

### 💰 수익인증 (/revenue-proof)
```typescript
// Auth State
- user: User | null (AuthContext - 옵션)

// Server State
- proofs: RevenueProof[] (GET /api/revenue-proof)
- ranking: RankingItem[] (GET /api/revenue-proof/ranking)

// Local State
- page: number
- filters: FilterOptions
- selectedProof: Proof | null

// UI State
- isLoadingMore: boolean
- likeAnimations: Map<string, boolean>
```

### 💬 커뮤니티 (/community)
```typescript
// Auth State
- user: User | null (AuthContext)

// Server State
- posts: Post[] (GET /api/community/posts)
- categories: Category[] (정적 데이터)

// Local State
- selectedCategory: string
- searchQuery: string
- sortBy: 'latest' | 'popular'

// UI State
- isPosting: boolean
- postError: string | null
```

---

## 🔀 상태 동기화 규칙

### 1. 인증 상태 동기화
```
로그인 성공 
  → Supabase Session 생성
  → AuthContext 업데이트
  → Protected Routes 접근 가능
  → Header UI 변경

로그아웃
  → Supabase Session 삭제
  → AuthContext user = null
  → Zustand stores 리셋
  → 홈으로 리다이렉트
```

### 2. 낙관적 업데이트 (좋아요 예시)
```
클릭 이벤트
  → UI 즉시 업데이트 (count +1, 아이콘 변경)
  → API 호출 (POST /api/revenue-proof/[id]/like)
  → 성공: 상태 유지
  → 실패: 롤백 + Toast 에러
```

### 3. 무한 스크롤 상태
```
스크롤 감지 (Intersection Observer)
  → hasMore 체크
  → true: 다음 페이지 로드
    → page + 1
    → API 호출
    → 데이터 병합
  → false: "더 이상 없음" 표시
```

---

## 🛡️ 에러 상태 관리

### 전역 에러 처리
```typescript
// api-client.ts에서 처리
if (response.status === 401) {
  // 인증 에러 → 로그인 페이지
  window.location.href = '/auth/login'
} else if (response.status === 403) {
  // 권한 에러 → Toast
  toast.error('권한이 없습니다')
} else if (response.status >= 500) {
  // 서버 에러 → 재시도 UI
  setError({ 
    type: 'server', 
    message: '서버 오류', 
    retry: true 
  })
}
```

### 컴포넌트 레벨 에러
```typescript
const [error, setError] = useState<{
  field?: string
  message: string
  code?: string
} | null>(null)

// 필드별 에러 표시
{error?.field === 'email' && (
  <span className="text-red-500">{error.message}</span>
)}
```

---

## 📈 성능 최적화 패턴

### 1. 메모이제이션
```typescript
// 파생 상태 메모이제이션
const filteredVideos = useMemo(() => 
  videos.filter(v => v.category === filter),
  [videos, filter]
)

// 콜백 메모이제이션
const handleSearch = useCallback((query) => {
  searchVideos(query)
}, [searchVideos])
```

### 2. 디바운싱
```typescript
// 검색 입력 디바운싱
const debouncedSearch = useMemo(
  () => debounce((query) => {
    apiSearch(query)
  }, 300),
  []
)
```

### 3. 상태 배칭
```typescript
// React 18 자동 배칭
const handleMultipleUpdates = () => {
  setLoading(true)
  setError(null)
  setData(newData)
  // 한 번의 리렌더링으로 처리됨
}
```

---

## 🐛 안티패턴 (피해야 할 것)

### ❌ Props Drilling
```typescript
// 나쁨
<Parent user={user}>
  <Child user={user}>
    <GrandChild user={user}>

// 좋음 - Context 또는 Zustand
const { user } = useAuth() // Context
const { user } = useUserStore() // Zustand
```

### ❌ 중복 상태
```typescript
// 나쁨
const [items, setItems] = useState([])
const [filteredItems, setFilteredItems] = useState([])
const [sortedItems, setSortedItems] = useState([])

// 좋음 - 파생 상태
const processedItems = useMemo(() => {
  return items
    .filter(filterFn)
    .sort(sortFn)
}, [items, filterFn, sortFn])
```

### ❌ 동기화 안 된 상태
```typescript
// 나쁨
localStorage.setItem('apiKey', key)
setApiKey(key) // 동기화 안 됨

// 좋음 - 단일 진실 소스
const setApiKey = (key) => {
  localStorage.setItem('apiKey', key)
  set({ apiKey: key })
}
```

---

## 📊 상태 관리 통계

### Store 구현 현황
- **Zustand Stores**: 4개 구현 완료
  - layout.ts (100% 완료)
  - youtube-lens.ts (100% 완료)
  - user.ts (100% 완료)
  - notifications.ts (100% 완료)
- **React Query**: 15개 hooks 구현 완료
  - YouTube 관련: 4개 (Search, Popular, Favorites, Queries)
  - User 관련: 2개 (Profile, Queries)
  - Community 관련: 2개 (Posts, Queries)
  - Revenue 관련: 2개 (Proof, Queries)
  - 기타: 5개 (Course, Notifications, Admin, Cache, Folders)
- **Context Providers**: 1개 구현 완료
  - AuthContext (100% 완료)

### 상태 타입별 사용 현황
- **Global State**: 13개 상태 변수
- **Server State**: 37개 API 엔드포인트
- **Local State**: 페이지당 평균 5-10개
- **UI State**: 컴포넌트당 평균 2-3개
- **캐싱 효율**: API 호출 70% 감소 (React Query 도입 후)

---

## 🚨 개선 필요 사항

### ✅ 완료된 개선사항 (2025-08-23)
- [x] React Query 도입 (서버 상태 관리) - 5개 hooks 구현
- [x] 낙관적 업데이트 적용 - 좋아요, 프로필, 즐겨찾기
- [x] 캐싱 전략 구현 - React Query 캐싱 설정
- [x] 에러 바운더리 구현 - ErrorBoundary 컴포넌트

### 긴급 (Phase 1)
- [ ] 401 에러 전역 처리 강화
- [ ] 로딩 상태 일관성 (스켈레톤 통일)

### 중요 (Phase 2)
- [ ] React Query 확대 적용 (나머지 API)
- [ ] 무한 스크롤 최적화

### 개선 (Phase 3)
- [ ] Supabase Realtime 전체 적용
- [ ] 상태 디버깅 도구 (Redux DevTools)
- [ ] 상태 persistence 전략 확대

---

*이 문서는 상태 관리 작업 시 필수 참조 문서입니다.*