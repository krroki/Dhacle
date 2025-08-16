# YouTube Lens Phase 5: UI/UX 구현

## 📌 개요
YouTube Lens의 사용자 인터페이스를 구현합니다. 브랜드 컬러 시스템을 적용하고, 직관적이고 반응형인 대시보드를 구축합니다.

## 🎯 목표
- 브랜드 컬러 시스템 적용
- 반응형 대시보드 레이아웃
- 데이터 시각화 컴포넌트
- 사용자 경험 최적화

## 🎨 브랜드 디자인 시스템

### 컬러 팔레트 구현

```css
/* styles/globals.css */
@layer base {
  :root {
    /* Primary - 보라 */
    --primary-hue: 245;
    --primary-saturation: 58%;
    --primary-lightness: 61%;
    --primary: hsl(var(--primary-hue), var(--primary-saturation), var(--primary-lightness));
    --primary-foreground: hsl(0, 0%, 100%);
    
    /* Secondary - 빨강 */
    --secondary-hue: 0;
    --secondary-saturation: 100%;
    --secondary-lightness: 71%;
    --secondary: hsl(var(--secondary-hue), var(--secondary-saturation), var(--secondary-lightness));
    --secondary-foreground: hsl(0, 0%, 100%);
    
    /* Accent - 민트 */
    --accent-hue: 161;
    --accent-saturation: 94%;
    --accent-lightness: 50%;
    --accent: hsl(var(--accent-hue), var(--accent-saturation), var(--accent-lightness));
    --accent-foreground: hsl(0, 0%, 0%);
    
    /* 파생 색상 */
    --primary-hover: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) - 5%));
    --primary-pressed: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) - 10%));
    --primary-disabled: hsl(var(--primary-hue), 20%, 70%);
    
    /* 배경 및 전경 */
    --background: hsl(0, 0%, 100%);
    --foreground: hsl(0, 0%, 3.9%);
    
    /* 카드 */
    --card: hsl(0, 0%, 100%);
    --card-foreground: hsl(0, 0%, 3.9%);
    
    /* 테두리 및 입력 */
    --border: hsl(0, 0%, 89.8%);
    --input: hsl(0, 0%, 89.8%);
    
    /* 상태 색상 */
    --success: hsl(142, 76%, 36%);
    --warning: hsl(38, 92%, 50%);
    --error: hsl(0, 84%, 60%);
    --info: hsl(199, 89%, 48%);
  }
  
  .dark {
    /* 다크모드 색상 */
    --primary-lightness: 77%;
    --secondary-lightness: 65%;
    --accent-lightness: 45%;
    
    --background: hsl(0, 0%, 3.9%);
    --foreground: hsl(0, 0%, 98%);
    
    --card: hsl(0, 0%, 8%);
    --card-foreground: hsl(0, 0%, 98%);
    
    --border: hsl(0, 0%, 14.9%);
    --input: hsl(0, 0%, 14.9%);
  }
}
```

### 타이포그래피 시스템

```tsx
// components/ui/typography.tsx
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function H1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn(
      "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      className
    )}>
      {children}
    </h1>
  );
}

export function H2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn(
      "scroll-m-20 text-3xl font-semibold tracking-tight",
      className
    )}>
      {children}
    </h2>
  );
}

export function Body({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "leading-7 [&:not(:first-child)]:mt-6",
      className
    )}>
      {children}
    </p>
  );
}

export function Caption({ children, className }: TypographyProps) {
  return (
    <p className={cn(
      "text-sm text-muted-foreground",
      className
    )}>
      {children}
    </p>
  );
}
```

## 📊 대시보드 레이아웃

### 메인 레이아웃 구조

```tsx
// app/(pages)/youtube-lens/layout.tsx
'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/features/youtube-lens/Sidebar';
import { Header } from '@/components/features/youtube-lens/Header';
import { cn } from '@/lib/utils';

export default function YouTubeLensLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}>
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

### 사이드바 네비게이션

```tsx
// components/features/youtube-lens/Sidebar.tsx
'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  TrendingUp,
  Folder,
  Bell,
  Bookmark,
  BarChart3,
  Settings,
  Search,
  Globe,
  Zap
} from 'lucide-react';

const navigation = [
  {
    title: '탐색',
    items: [
      { name: '인기 Shorts', href: '/youtube-lens', icon: TrendingUp },
      { name: '전 세계 트렌드', href: '/youtube-lens/global', icon: Globe },
      { name: '키워드 검색', href: '/youtube-lens/search', icon: Search },
    ]
  },
  {
    title: '모니터링',
    items: [
      { name: '채널 폴더', href: '/youtube-lens/folders', icon: Folder },
      { name: '알림', href: '/youtube-lens/alerts', icon: Bell },
      { name: '즐겨찾기', href: '/youtube-lens/bookmarks', icon: Bookmark },
    ]
  },
  {
    title: '분석',
    items: [
      { name: '트렌드 레이더', href: '/youtube-lens/radar', icon: Zap },
      { name: '랭킹 보드', href: '/youtube-lens/rankings', icon: BarChart3 },
      { name: '설정', href: '/youtube-lens/settings', icon: Settings },
    ]
  }
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside className={cn(
      "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r transition-all duration-300 z-40",
      open ? "w-64" : "w-16"
    )}>
      <ScrollArea className="h-full">
        <div className="p-4">
          {navigation.map((section) => (
            <div key={section.title} className="mb-6">
              {open && (
                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      !open && "justify-center px-2"
                    )}
                    asChild
                  >
                    <a href={item.href}>
                      <item.icon className="h-4 w-4" />
                      {open && <span className="ml-3">{item.name}</span>}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
```

## 🎬 영상 카드 컴포넌트

```tsx
// components/features/youtube-lens/VideoCard.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Heart,
  Eye,
  Clock,
  TrendingUp,
  Bookmark,
  MoreVertical,
  Play
} from 'lucide-react';
import { formatNumber, formatTimeAgo } from '@/lib/utils';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnail: string;
    channel: {
      title: string;
      thumbnail: string;
    };
    statistics: {
      viewCount: number;
      likeCount: number;
    };
    metrics: {
      vph: number;
      delta24h: number;
      engagementRate: number;
      score: number;
    };
    publishedAt: string;
    duration: number;
  };
}

export function VideoCard({ video }: VideoCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] bg-muted">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        
        {/* Duration Badge */}
        <Badge className="absolute bottom-2 right-2 bg-black/80 text-white">
          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
        </Badge>
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button size="icon" variant="secondary" className="rounded-full">
            <Play className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Score Badge */}
        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
          Score: {video.metrics.score}
        </Badge>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold line-clamp-2 mb-2">
          {video.title}
        </h3>
        
        {/* Channel */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={video.channel.thumbnail}
            alt={video.channel.title}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-muted-foreground">
            {video.channel.title}
          </span>
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{formatNumber(video.statistics.viewCount)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span>{video.metrics.engagementRate.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{formatNumber(video.metrics.vph)}/h</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(video.publishedAt)}</span>
          </div>
        </div>
        
        {/* 24h Change */}
        {video.metrics.delta24h > 0 && (
          <Badge variant="outline" className="text-success">
            +{formatNumber(video.metrics.delta24h)} (24h)
          </Badge>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <Button
            size="sm"
            variant={bookmarked ? "default" : "outline"}
            onClick={() => setBookmarked(!bookmarked)}
          >
            <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>보드에 추가</DropdownMenuItem>
              <DropdownMenuItem>채널 보기</DropdownMenuItem>
              <DropdownMenuItem>YouTube에서 열기</DropdownMenuItem>
              <DropdownMenuItem>링크 복사</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
```

## 📈 데이터 시각화

### 트렌드 차트

```tsx
// components/features/youtube-lens/TrendChart.tsx
'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
  title?: string;
}

export function TrendChart({ data, title }: TrendChartProps) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            if (value >= 1000000) {
              return (value / 1000000) + 'M';
            } else if (value >= 1000) {
              return (value / 1000) + 'K';
            }
            return value;
          }
        }
      }
    }
  };
  
  return (
    <Card className="p-6">
      <Line options={options} data={data} />
    </Card>
  );
}
```

### 키워드 클라우드

```tsx
// components/features/youtube-lens/KeywordCloud.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KeywordCloudProps {
  keywords: {
    word: string;
    count: number;
    trend?: 'up' | 'down' | 'stable';
  }[];
}

export function KeywordCloud({ keywords }: KeywordCloudProps) {
  const maxCount = Math.max(...keywords.map(k => k.count));
  
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword) => {
        const size = (keyword.count / maxCount);
        const fontSize = 0.75 + size * 1.5; // 0.75rem to 2.25rem
        
        return (
          <Badge
            key={keyword.word}
            variant="secondary"
            className={cn(
              "cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
              keyword.trend === 'up' && "border-success",
              keyword.trend === 'down' && "border-error"
            )}
            style={{ fontSize: `${fontSize}rem` }}
          >
            {keyword.word}
            {keyword.trend === 'up' && ' ↑'}
            {keyword.trend === 'down' && ' ↓'}
          </Badge>
        );
      })}
    </div>
  );
}
```

## 🎯 필터 컴포넌트

```tsx
// components/features/youtube-lens/FilterBar.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Filter, RefreshCw } from 'lucide-react';

export function FilterBar({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap gap-4 items-end">
        {/* 지역 선택 */}
        <div>
          <Label>지역</Label>
          <Select defaultValue="KR">
            <option value="KR">🇰🇷 한국</option>
            <option value="US">🇺🇸 미국</option>
            <option value="JP">🇯🇵 일본</option>
            <option value="IN">🇮🇳 인도</option>
            <option value="BR">🇧🇷 브라질</option>
          </Select>
        </div>
        
        {/* 기간 선택 */}
        <div>
          <Label>기간</Label>
          <Select defaultValue="7d">
            <option value="24h">24시간</option>
            <option value="3d">3일</option>
            <option value="7d">7일</option>
            <option value="30d">30일</option>
          </Select>
        </div>
        
        {/* 최소 조회수 */}
        <div className="w-48">
          <Label>최소 조회수</Label>
          <Slider
            defaultValue={[100000]}
            max={10000000}
            step={100000}
            className="mt-2"
          />
        </div>
        
        {/* 정렬 기준 */}
        <div>
          <Label>정렬</Label>
          <Select defaultValue="score">
            <option value="score">종합 점수</option>
            <option value="views">조회수</option>
            <option value="vph">VPH</option>
            <option value="engagement">참여율</option>
            <option value="fresh">최신순</option>
          </Select>
        </div>
        
        {/* 액션 버튼 */}
        <div className="flex gap-2 ml-auto">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            필터 초기화
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

## ✅ 구현 체크리스트

- [ ] 브랜드 컬러 시스템 적용
- [ ] 레이아웃 컴포넌트 (Header, Sidebar)
- [ ] 영상 카드 컴포넌트
- [ ] 필터 바 컴포넌트
- [ ] 데이터 시각화 (차트, 키워드 클라우드)
- [ ] 반응형 디자인
- [ ] 다크모드 지원
- [ ] 접근성 (WCAG AA 준수)

## 🚀 사용자 시나리오

YouTube Lens의 핵심 사용자들과 그들의 실제 사용 시나리오를 정의합니다.

### 주요 사용자 그룹

#### 1. 개인 양산형 크리에이터
- **특징**: 1인 또는 소규모 팀으로 다수 채널 운영
- **목표**: 아이디어 발굴 시간 단축, 트렌드 빠른 캐치
- **주요 활동**: 매일 트렌드 체크, 해외 영상 벤치마킹

#### 2. MCN/에이전시
- **특징**: 다수 클라이언트 채널 관리, 편집팀 운영
- **목표**: 클라이언트 리포트 자동화, 팀 협업 효율화
- **역할 분리**: 
  - 오너: 구독 결제 관리, 팀원 초대
  - 에디터: 영상 아이디어 보드 관리
  - 애널리스트: 데이터 탐색 및 분석

#### 3. 일반 영상 크리에이터
- **특징**: 퀄리티 중심의 콘텐츠 제작
- **목표**: 경쟁 채널 분석, 자기 채널 성과 추적
- **주요 활동**: 주간 단위 분석, 카테고리별 트렌드 파악

### 상황별 사용 시나리오

#### Scenario A: 매일 아침 트렌드 체크 (개인 크리에이터)
```
1. 로그인 → 대시보드 접속
2. "지난 24시간 한국 Top Shorts" 확인
3. VPH 높은 영상 5개 즐겨찾기
4. 채널 폴더 "경쟁사" 새 영상 확인
5. 알림: "XX채널 신규 영상 100만뷰 돌파"
6. 해당 영상 분석 → 아이디어 메모
7. CSV 내보내기 → 편집팀 공유

⏱️ 소요시간: 10분 (기존 30분 → 70% 단축)
```

#### Scenario B: 해외 벤치마킹 (MCN 에디터)
```
1. 국가 필터 → 미국/일본 전환
2. "최근 7일 조회수 Top 100" 탐색
3. 키워드 클라우드에서 트렌드 주제 파악
4. 관련 영상 10개 보드에 추가
5. 보드에 태그 (#기획중, #참고용) 붙이기
6. 팀원과 보드 공유 → 코멘트 추가
7. 엔티티 레이더로 외부 트렌드 확인

💡 가치: 글로벌 트렌드 실시간 파악
```

#### Scenario C: 팀 협업 워크플로우 (에이전시)
```
1. [애널리스트] 주간 트렌드 분석
   - 카테고리별 Top 영상 수집
   - 이상치(Outlier) 영상 발굴
   - 보드 생성 "2025-W33 트렌드"

2. [에디터] 아이디어 구체화
   - 보드 영상 검토
   - 실행 가능한 아이디어 선별
   - 상태 변경: 검토중 → 제작예정

3. [오너] 클라이언트 리포트
   - 보드 데이터 CSV 내보내기
   - Google Sheets 자동 연동
   - 주간 성과 리포트 생성

🤝 효과: 팀 커뮤니케이션 50% 개선
```

#### Scenario D: 실시간 모니터링 (양산형 운영자)
```
1. 채널 폴더 설정
   - "미국 Shorts 강자" 폴더 생성
   - 상위 50개 채널 추가
   - 알림 규칙: "24시간 내 500만뷰"

2. 자동 알림 수신
   - 이메일/슬랙으로 실시간 알림
   - 조건 충족 영상 자동 수집
   - 즉시 분석 및 벤치마킹

3. 빠른 대응
   - 트렌드 캐치 → 기획 → 제작
   - 경쟁사보다 빠른 업로드

⚡ 성과: 트렌드 반응 속도 80% 향상
```

### 사용자 가치 제안 (Value Proposition)

#### 시간 절감
- **Before**: 트렌드 리서치 3시간/일
- **After**: 10-30분/일로 단축
- **절감률**: 70-90%

#### 정확도 향상
- **Before**: 주관적 판단, 놓치는 트렌드 多
- **After**: 데이터 기반 객관적 분석
- **개선**: 트렌드 포착률 3배 향상

#### 팀 생산성
- **Before**: 개별 리서치, 중복 작업
- **After**: 공유 보드, 실시간 협업
- **효과**: 팀 생산성 50% 향상

### KPI 측정 지표

1. **일일 활성 사용자 (DAU)**
   - 목표: 월 20% 성장

2. **평균 세션 시간**
   - 목표: 15분 이상

3. **기능별 사용률**
   - 무키워드 검색: 80%+
   - 채널 모니터링: 60%+
   - 보드 공유: 40%+

4. **사용자 만족도 (NPS)**
   - 목표: 50점 이상

## ✅ 구현 체크리스트

- [ ] 브랜드 컬러 시스템 적용
- [ ] 레이아웃 컴포넌트 (Header, Sidebar)
- [ ] 영상 카드 컴포넌트
- [ ] 필터 바 컴포넌트
- [ ] 데이터 시각화 (차트, 키워드 클라우드)
- [ ] 반응형 디자인
- [ ] 다크모드 지원
- [ ] 접근성 (WCAG AA 준수)
- [ ] 사용자 시나리오별 UI 최적화
- [ ] 온보딩 플로우 구현

## 📝 다음 단계
Phase 6: 비즈니스 기능으로 진행