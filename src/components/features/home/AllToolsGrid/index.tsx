import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Eye, 
  Calculator, 
  Palette, 
  BarChart3, 
  Zap, 
  Target, 
  Users, 
  TrendingUp,
  Search,
  Hash,
  Calendar,
  FileText
} from 'lucide-react';
import { SectionTitle } from '@/components/features/home/shared/SectionTitle';

const allTools = [
  // 메인 도구들
  {
    id: 'youtube-lens',
    name: 'YouTube Lens',
    description: '채널 분석 및 키워드 트렌드',
    icon: Eye,
    href: '/tools/youtube-lens',
    status: 'live',
    category: '분석',
  },
  {
    id: 'revenue-calculator',
    name: '수익 계산기',
    description: 'YouTube 수익 예측 도구',
    icon: Calculator,
    href: '/tools/revenue-calculator',
    status: 'beta',
    category: '수익화',
  },
  {
    id: 'thumbnail-maker',
    name: '썸네일 제작기',
    description: 'AI 기반 썸네일 제작',
    icon: Palette,
    href: '/tools/thumbnail-maker',
    status: 'coming-soon',
    category: '콘텐츠',
  },
  
  // 추가 도구들 (향후 구현 예정)
  {
    id: 'analytics-dashboard',
    name: '통합 대시보드',
    description: '모든 지표를 한눈에',
    icon: BarChart3,
    href: '/tools/analytics-dashboard',
    status: 'planning',
    category: '분석',
  },
  {
    id: 'trend-alert',
    name: '트렌드 알림',
    description: '실시간 트렌드 알림',
    icon: Zap,
    href: '/tools/trend-alert',
    status: 'planning',
    category: '트렌드',
  },
  {
    id: 'competitor-tracker',
    name: '경쟁사 추적',
    description: '경쟁채널 모니터링',
    icon: Target,
    href: '/tools/competitor-tracker',
    status: 'planning',
    category: '분석',
  },
  {
    id: 'audience-insights',
    name: '시청자 분석',
    description: '타겟 오디언스 분석',
    icon: Users,
    href: '/tools/audience-insights',
    status: 'planning',
    category: '분석',
  },
  {
    id: 'growth-tracker',
    name: '성장 추적',
    description: '채널 성장률 추적',
    icon: TrendingUp,
    href: '/tools/growth-tracker',
    status: 'planning',
    category: '성장',
  },
  {
    id: 'seo-optimizer',
    name: 'SEO 최적화',
    description: '동영상 SEO 최적화',
    icon: Search,
    href: '/tools/seo-optimizer',
    status: 'planning',
    category: '최적화',
  },
  {
    id: 'hashtag-generator',
    name: '해시태그 생성기',
    description: '트렌드 해시태그 생성',
    icon: Hash,
    href: '/tools/hashtag-generator',
    status: 'planning',
    category: '콘텐츠',
  },
  {
    id: 'upload-scheduler',
    name: '업로드 스케줄러',
    description: '최적 업로드 시간 추천',
    icon: Calendar,
    href: '/tools/upload-scheduler',
    status: 'planning',
    category: '관리',
  },
  {
    id: 'script-generator',
    name: '대본 생성기',
    description: 'AI 기반 영상 대본 생성',
    icon: FileText,
    href: '/tools/script-generator',
    status: 'planning',
    category: '콘텐츠',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'live':
      return <Badge className="bg-green-500 text-white text-xs">Live</Badge>;
    case 'beta':
      return <Badge className="bg-yellow-500 text-white text-xs">Beta</Badge>;
    case 'coming-soon':
      return <Badge className="bg-blue-500 text-white text-xs">출시예정</Badge>;
    case 'planning':
      return <Badge className="bg-gray-400 text-white text-xs">기획중</Badge>;
    default:
      return null;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case '분석':
      return 'text-blue-600';
    case '수익화':
      return 'text-green-600';
    case '콘텐츠':
      return 'text-purple-600';
    case '트렌드':
      return 'text-orange-600';
    case '성장':
      return 'text-pink-600';
    case '최적화':
      return 'text-indigo-600';
    case '관리':
      return 'text-teal-600';
    default:
      return 'text-gray-600';
  }
};

export function AllToolsGrid() {
  return (
    <section className="py-16">
      <div className="container-responsive">
        <SectionTitle
          title="모든 도구"
          subtitle="YouTube 크리에이터를 위한 완벽한 도구 모음"
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
          {allTools.map((tool) => {
            const IconComponent = tool.icon;
            const isAvailable = tool.status === 'live' || tool.status === 'beta';
            
            return (
              <Card 
                key={tool.id} 
                className={`group transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm ${
                  isAvailable ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : 'opacity-75'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${
                      isAvailable ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    {getStatusBadge(tool.status)}
                  </div>
                  <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                    {tool.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${getCategoryColor(tool.category)}`}>
                      {tool.category}
                    </span>
                    {isAvailable && (
                      <Button 
                        asChild 
                        variant="ghost" 
                        size="sm"
                        className="h-8 px-3 text-xs hover:bg-primary/10"
                      >
                        <Link href={tool.href}>
                          사용하기
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            더 많은 도구들이 준비중입니다. 새로운 도구 출시 알림을 받고 싶다면{' '}
            <Link href="/docs/get-api-key" className="text-primary hover:underline">
              API 키를 발급
            </Link>
            받아 보세요.
          </p>
        </div>
      </div>
    </section>
  );
}