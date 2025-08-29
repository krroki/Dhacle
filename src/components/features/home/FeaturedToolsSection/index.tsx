import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Eye, Calculator, Palette } from 'lucide-react';
import { SectionTitle } from '@/components/features/home/shared/SectionTitle';

const featuredTools = [
  {
    id: 'youtube-lens',
    name: 'YouTube Lens',
    description: '채널 분석, 키워드 트렌드, 경쟁사 분석을 한 번에. 데이터 기반 콘텐츠 전략 수립',
    icon: Eye,
    href: '/tools/youtube-lens',
    status: 'live',
    features: ['채널 분석', '키워드 트렌드', '경쟁사 분석', '데이터 시각화'],
    bgGradient: 'from-blue-500 to-purple-600',
  },
  {
    id: 'revenue-calculator',
    name: '수익 계산기',
    description: 'YouTube 수익 예측, CPM 분석, 월 수익 시뮬레이션으로 수익화 계획 세우기',
    icon: Calculator,
    href: '/tools/revenue-calculator',
    status: 'beta',
    features: ['수익 예측', 'CPM 분석', '수익 시뮬레이션', '목표 설정'],
    bgGradient: 'from-green-500 to-emerald-600',
  },
  {
    id: 'thumbnail-maker',
    name: '썸네일 제작기',
    description: 'AI 기반 썸네일 분석, 클릭률 예측, 자동 텍스트 오버레이로 완벽한 썸네일 제작',
    icon: Palette,
    href: '/tools/thumbnail-maker',
    status: 'coming-soon',
    features: ['AI 분석', '클릭률 예측', '자동 텍스트', '템플릿 제공'],
    bgGradient: 'from-orange-500 to-red-600',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'live':
      return <Badge className="bg-green-500 text-white">Live</Badge>;
    case 'beta':
      return <Badge className="bg-yellow-500 text-white">Beta</Badge>;
    case 'coming-soon':
      return <Badge className="bg-gray-500 text-white">출시예정</Badge>;
    default:
      return null;
  }
};

export function FeaturedToolsSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/30">
      <div className="container-responsive">
        <SectionTitle
          title="주요 도구"
          subtitle="YouTube 크리에이터를 위한 핵심 도구들"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {featuredTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Card key={tool.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.bgGradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  <div className="flex items-center justify-between relative z-10">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${tool.bgGradient} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    {getStatusBadge(tool.status)}
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {tool.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tool.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    asChild 
                    className={`w-full bg-gradient-to-r ${tool.bgGradient} hover:opacity-90 transition-opacity`}
                    disabled={tool.status === 'coming-soon'}
                  >
                    <Link href={tool.href}>
                      {tool.status === 'coming-soon' ? '출시 예정' : '도구 사용하기'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}