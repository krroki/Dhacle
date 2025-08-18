# 💾 상태 관리 플로우 (State Flow)

*목적: 프로젝트의 모든 상태 관리 패턴과 데이터 플로우를 체계적으로 문서화*
*업데이트: 2025-01-30*

> **구현 상태 범례**:
> - ✅ 완료: Store와 관련 로직 모두 구현됨
> - ⚠️ 부분: Store는 있으나 일부 기능 미완성
> - ❌ 미구현: Store 자체가 없음

---

## 🏗️ 상태 관리 아키텍처

### 전체 데이터 플로우
```
[Supabase DB] ← Row Level Security
      ↓
[API Routes] ← Session Check (Wave 1)
      ↓
[api-client.ts] ← Error Handler
      ↓
[Zustand Store] ← DevTools
      ↓
[React Component] ← Context API
      ↓
[UI State (useState/useReducer)]
```

### 상태 타입별 관리 전략

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

### 1. Layout Store (/src/store/layout.ts)

```typescript
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

## 🔐 Auth State (Context API)

### AuthContext (/src/lib/auth/AuthContext.tsx)

```typescript
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

## 🗄️ Server State 관리 패턴

### 데이터 동기화 패턴

#### 1. 읽기 (GET)
```typescript
// 표준 패턴
useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await apiGet('/api/endpoint')
      setData(data)
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
// 낙관적 업데이트 패턴
const handleUpdate = async (newData) => {
  // 1. Optimistic Update
  setLocalData(newData)
  
  try {
    // 2. API Call
    const result = await apiPost('/api/endpoint', newData)
    // 3. Confirm with server data
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
// Global State (Zustand)
- videos: FlattenedYouTubeVideo[] (youtube-lens store)
- apiKey: string | null (youtube-lens store)
- quotaInfo: { used, limit } (youtube-lens store)

// Auth State (Context)
- user: User (AuthContext)

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
// Auth State (필수)
- user: User (AuthContext)

// Server State  
- profile: UserProfile (GET /api/user/profile)
- enrollments: Course[] (미구현)
- revenues: Revenue[] (GET /api/revenue-proof/my)

// Local State
- activeTab: string
- isEditMode: boolean
- formData: ProfileForm

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
- **Zustand Stores**: 2개 구현 완료
  - layout.ts (100% 완료)
  - youtube-lens.ts (100% 완료)
- **Context Providers**: 1개 구현 완료
  - AuthContext (100% 완료)

### 상태 타입별 사용 현황
- **Global State**: 13개 상태 변수
- **Server State**: 37개 API 엔드포인트
- **Local State**: 페이지당 평균 5-10개
- **UI State**: 컴포넌트당 평균 2-3개

---

## 🚨 개선 필요 사항

### 긴급 (Phase 1)
- [ ] 401 에러 전역 처리 강화
- [ ] 로딩 상태 일관성 (스켈레톤 통일)
- [ ] 에러 바운더리 구현

### 중요 (Phase 2)
- [ ] React Query 도입 (서버 상태 관리)
- [ ] 낙관적 업데이트 확대 적용
- [ ] 캐싱 전략 구현 (SWR 패턴)

### 개선 (Phase 3)
- [ ] Supabase Realtime 전체 적용
- [ ] 상태 디버깅 도구 (Redux DevTools)
- [ ] 상태 persistence 전략

---

*이 문서는 상태 관리 작업 시 필수 참조 문서입니다.*