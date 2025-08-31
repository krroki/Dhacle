# Component Inventory Reference

## 📌 문서 관리 지침
**목적**: React 컴포넌트 전체 인벤토리 - 위치, Props, 의존성, 사용처 데이터 종합 조회
**대상**: Component Agent, Frontend 개발 AI (src/components/** 영역 작업시)
**범위**: 컴포넌트 목록과 인터페이스만 포함 (구현 코드나 사용법 없음)
**업데이트 기준**: src/components/** 파일 추가/변경 시 자동 업데이트
**최대 길이**: 10000 토큰 (현재 약 8000 토큰)
**연관 문서**: [Component Agent](../../src/components/CLAUDE.md), [프로젝트 구조](./project-structure.md)

## ⚠️ 금지사항
- 컴포넌트 구현 방법이나 사용 예제 추가 금지 (→ how-to/ 문서로 이관)
- 스타일이나 디자인 가이드 추가 금지 (→ how-to/ 문서로 이관)
- 컴포넌트 설계 철학이나 아키텍처 설명 추가 금지 (→ explanation/ 문서로 이관)

---

**Project**: Dhacle - YouTube Creator Tools Platform  
**Last Updated**: 2025-08-31  
**Total Components**: 97 TSX files  
**Architecture**: Next.js 15 + React + TypeScript + Tailwind CSS  

## Component Organization Structure

```
src/components/
├── common/          # 14 files - Reusable utility components
├── error/           # 2 files - Error handling components  
├── features/        # 25 files - Feature-specific components
│   ├── auth/        # 1 file - Authentication components
│   ├── home/        # 7 files - Homepage components
│   └── tools/       # 17 files - YouTube Lens tool components
├── layout/          # 10 files - Layout and navigation components
├── providers/       # 2 files - React context providers
├── ui/              # 43 files - Shadcn/ui base components + extensions
├── ErrorBoundary.tsx
├── lazy/            # 1 file - Lazy loading utilities
└── WebVitals.tsx
```

## 1. Common Components (14 files)

Reusable utility components used across the application.

### Core Common Components
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **AccessibleButton** | Accessibility-enhanced button | WCAG compliance, keyboard navigation |
| **ContentWrapper** | Main content container | Responsive padding, max-width control |
| **DataTable** | Generic data table | Sorting, pagination, filtering |
| **DynamicComponents** | Dynamic component loading | Code splitting, lazy loading |
| **EmptyState** | Empty state placeholder | Consistent empty state messaging |
| **FeatureCard** | Feature showcase card | Consistent feature presentation |
| **FocusTrap** | Accessibility focus management | Modal focus containment |
| **InfoBanner** | Information display banner | Alert-style messaging |
| **LoadingSpinner** | Loading state indicator | Consistent loading UI |
| **MetricCard** | Metric display card | Statistics and KPI display |
| **OptimizedImage** | Performance-optimized images | Next.js Image wrapper with presets |
| **ScreenReaderOnly** | Screen reader only content | Accessibility helper |
| **StatsSummary** | Statistics summary display | Dashboard-style metrics |
| **StatusBadge** | Status indicator badge | Colored status indicators |

### Usage Patterns
```typescript
// Common component import pattern
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MetricCard } from '@/components/common/MetricCard';
import { StatusBadge } from '@/components/common/StatusBadge';

// Typical usage
<MetricCard title="Total Views" value={1234567} />
<StatusBadge status="active" />
```

## 2. Feature Components (25 files)

Domain-specific components organized by feature areas.

### 2.1 Authentication (1 file)
| Component | Purpose | Integration |
|-----------|---------|-------------|
| **KakaoLoginButton** | Kakao OAuth login | Supabase Auth + Kakao SDK |

### 2.2 Home Page Components (7 files)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **AllToolsGrid** | Complete tool listing | Grid layout, tool categorization |
| **FAQSection** | Frequently asked questions | Accordion-style Q&A |
| **FeaturedToolsSection** | Featured tools showcase | Highlighted tool selection |
| **HeroCarousel** | Main hero carousel | Auto-play, responsive design |
| **HeroSlide** | Individual carousel slide | Video embed, call-to-action |
| **YouTubeEmbed** | YouTube video integration | Lazy loading, performance optimized |
| **LoadingSkeletons** | Loading state placeholders | Shimmer effects |
| **SectionTitle** | Consistent section headers | Typography standardization |

### 2.3 YouTube Lens Tool Components (17 files)

The core feature of the application - YouTube analytics and management tools.

#### Main Tool Components
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **AlertRules** | YouTube alert rule management | Threshold monitoring, notifications |
| **ApiKeySetup** | YouTube API key configuration | Encrypted key storage, validation |
| **ChannelFolders** | Channel organization system | Folder-based channel management |
| **CollectionBoard** | Video collection management | CRUD operations, privacy settings |
| **CollectionViewer** | Collection display interface | Grid/list views, filtering |
| **DeltaDashboard** | Change tracking dashboard | Time-series comparisons |
| **EntityRadar** | Content discovery radar | Trending content analysis |
| **KeywordTrends** | Keyword trending analysis | Search trend visualization |
| **MetricsDashboard** | Analytics metrics display | KPI tracking, performance metrics |
| **PopularShortsList** | YouTube Shorts trending list | Shorts-specific analytics |
| **SubscriptionManager** | Channel subscription management | Bulk subscription handling |
| **TrendChart** | Trend visualization charts | Chart.js integration |

#### YouTube Lens Sub-Components (5 files)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **EnvironmentChecker** | Environment validation | API connectivity checks |
| **QuotaStatus** | API quota monitoring | Usage tracking, limits display |
| **SearchBar** | YouTube content search | Real-time search, filters |
| **SetupGuide** | Onboarding guidance | Step-by-step setup |
| **VideoCard** | Video display card | Thumbnail, metadata, actions |
| **VideoGrid** | Video grid layout | Responsive grid, infinite scroll |
| **YouTubeLensErrorBoundary** | Error handling | Feature-specific error boundaries |

#### Admin Components (1 file)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **ChannelApprovalConsole** | Admin channel approval | Moderation interface, bulk actions |

## 3. Layout Components (10 files)

Navigation, structure, and layout management components.

### Core Layout Components
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **Header** | Main site header | Navigation, user menu, responsive |
| **HeaderLayout** | Header layout wrapper | Consistent header structure |
| **Footer** | Site footer | Links, legal, company info |
| **FooterClient** | Client-side footer logic | Dynamic content handling |
| **FooterLayout** | Footer layout wrapper | Consistent footer structure |
| **Sidebar** | Side navigation | Collapsible, mobile-responsive |
| **MobileNav** | Mobile navigation menu | Hamburger menu, touch-optimized |
| **NotificationDropdown** | Notification center | Real-time notifications |
| **ProgressBar** | Page loading progress | Top-level loading indicator |
| **RootLayoutClient** | Root layout client logic | Global client-side functionality |
| **ScrollToTop** | Scroll to top functionality | UX enhancement |
| **TopBanner** | Announcement banner | Site-wide messaging |

### Layout Architecture
```typescript
// Layout hierarchy
RootLayoutClient
├── Header (HeaderLayout)
├── TopBanner (conditional)
├── Sidebar (desktop)
├── MobileNav (mobile)
├── main content area
├── ProgressBar
├── ScrollToTop
└── Footer (FooterLayout)
```

## 4. UI Components (43 files)

Base design system components from Shadcn/ui with custom extensions.

### 4.1 Base Shadcn/ui Components (39 files)
| Category | Components | Count |
|----------|------------|-------|
| **Form & Input** | button, input, label, textarea, checkbox, radio-group, select, switch, slider | 9 |
| **Layout** | card, separator, scroll-area, tabs, accordion | 5 |
| **Feedback** | alert, toast, toaster, sonner, skeleton, progress | 6 |
| **Navigation** | navigation-menu, dropdown-menu, popover | 3 |
| **Overlay** | dialog, alert-dialog, tooltip | 3 |
| **Data Display** | table, badge, avatar, carousel | 4 |
| **Advanced** | tiptap-editor (rich text editor) | 1 |
| **Testing** | button.test.tsx | 1 |
| **Hooks** | use-toast.tsx | 1 |

### 4.2 Custom UI Extensions (4 files)
| Component | Purpose | Extension Features |
|-----------|---------|-------------------|
| **error-display** | Error state display | Enhanced error UI with recovery actions |
| **tiptap-editor** | Rich text editor | Custom Tiptap integration |
| **use-toast** | Toast notification hook | Enhanced toast functionality |

## 5. Provider Components (2 files)

React context providers for global state management.

| Component | Purpose | Functionality |
|-----------|---------|---------------|
| **Providers** | Root provider wrapper | Auth, theme, query providers |
| **ErrorNotificationProvider** | Error handling context | Global error state management |

## 6. Error Handling Components (3 files)

Comprehensive error handling and recovery system.

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **ErrorBoundary** | Global error boundary | Error catching, fallback UI |
| **ErrorRecoveryDialog** | Error recovery interface | User-guided error recovery |
| **ErrorStatusIndicator** | Error state indicator | Visual error feedback |

## 7. Utility Components (2 files)

Performance and development utilities.

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **WebVitals** | Performance monitoring | Core Web Vitals tracking |
| **lazy/index** | Lazy loading utilities | Component code splitting |

## Component Usage Statistics

### By Category
- **UI Components**: 43 files (44.3%)
- **Feature Components**: 25 files (25.8%)
- **Common Components**: 14 files (14.4%)
- **Layout Components**: 10 files (10.3%)
- **Utility Components**: 5 files (5.2%)

### By Complexity
- **Simple Components** (< 100 lines): ~60 files
- **Medium Components** (100-300 lines): ~25 files  
- **Complex Components** (> 300 lines): ~12 files

### By Purpose
- **Display Components**: 35 files (36.1%)
- **Interactive Components**: 28 files (28.9%)
- **Layout/Structure**: 15 files (15.5%)
- **Utility/Helper**: 19 files (19.5%)

## Component Development Patterns

### 1. File Organization
```typescript
// Typical component file structure
'use client'; // Client component directive

import { ... } from 'external-libraries';
import { ... } from '@/components/ui/...';
import { ... } from '@/lib/...';
import type { ... } from '@/types';

export default function ComponentName() {
  // Component logic
}
```

### 2. Common Imports
```typescript
// Most frequently imported utilities
import { cn } from '@/lib/utils';                    // Class merging
import { Button } from '@/components/ui/button';     // Base button
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiGet, apiPost } from '@/lib/api-client';  // API calls
import type { ... } from '@/types';                 // Type definitions
```

### 3. State Management Patterns
```typescript
// Common state patterns
const [loading, set_loading] = useState(false);
const [data, set_data] = useState<Type[]>([]);
const [error, set_error] = useState<string | null>(null);

// API call pattern
useEffect(() => {
  const fetchData = async () => {
    set_loading(true);
    try {
      const result = await apiGet<Type[]>('/api/endpoint');
      set_data(result);
    } catch (err) {
      set_error(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      set_loading(false);
    }
  };
  fetchData();
}, []);
```

## Component Dependencies

### Key External Dependencies
- **@radix-ui/react-***: Base primitive components
- **lucide-react**: Icon library
- **class-variance-authority**: Component variants
- **sonner**: Toast notifications
- **next**: Next.js framework components

### Internal Dependencies
- **@/components/ui/**: Base UI components
- **@/lib/utils**: Utility functions
- **@/lib/api-client**: API communication
- **@/types**: TypeScript definitions

## Quality & Testing

### Testing Coverage
- **Unit Tests**: button.test.tsx (1 test file)
- **Error Boundaries**: Multiple error handling components
- **TypeScript**: 100% TypeScript coverage

### Accessibility Features
- **AccessibleButton**: WCAG compliance
- **FocusTrap**: Focus management
- **ScreenReaderOnly**: Screen reader support
- **Keyboard Navigation**: Consistent across components

### Performance Features
- **Lazy Loading**: Dynamic imports, code splitting
- **Image Optimization**: OptimizedImage component
- **Memoization**: Used in complex components
- **Bundle Splitting**: Feature-based code splitting

## Recommendations

### Component Organization
1. **Consolidation Opportunity**: Some UI components could be merged
2. **Documentation**: Add component documentation/Storybook
3. **Testing**: Expand test coverage beyond button component
4. **Consistency**: Standardize naming conventions (some use snake_case, some camelCase)

### Performance Optimization
1. **Bundle Analysis**: Review component bundle sizes
2. **Lazy Loading**: Implement more lazy loading for heavy components
3. **Tree Shaking**: Ensure unused components are eliminated

### Maintenance
1. **Component Audit**: Review and remove unused components
2. **Dependency Updates**: Regular updates of Shadcn/ui components
3. **Migration Path**: Plan for Next.js 15+ compatibility

---

*This inventory reflects the component structure as of 2025-08-31. Components are actively developed and may change frequently.*