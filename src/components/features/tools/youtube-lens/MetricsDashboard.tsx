'use client';

/**
 * YouTube Lens - Metrics Dashboard Component
 * Phase 5: UI/UX Implementation
 * 
 * Comprehensive dashboard for YouTube Lens metrics and analytics
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendChart } from './TrendChart';
import { EntityRadar } from './EntityRadar';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Users,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
  Calendar,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Youtube,
  Hash,
  Globe,
  Zap
} from 'lucide-react';
import type { VideoStats, TrendAnalysis, EntityExtraction } from '@/types/youtube-lens';

interface MetricsDashboardProps {
  metrics?: VideoStats[];
  trends?: TrendAnalysis[];
  entities?: EntityExtraction[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}

function StatCard({ title, value, change, icon: Icon, description, trend = 'neutral', color = 'primary' }: StatCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'primary': return 'bg-yt-lens-primary/10 text-yt-lens-primary border-yt-lens-primary/20';
      case 'secondary': return 'bg-yt-lens-secondary/10 text-yt-lens-secondary border-yt-lens-secondary/20';
      case 'accent': return 'bg-yt-lens-accent/10 text-yt-lens-accent-dark border-yt-lens-accent/20';
      case 'success': return 'bg-green-50 text-green-600 border-green-200';
      case 'warning': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'error': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-yt-lens-accent" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-yt-lens-secondary" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${getColorClasses()}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          {change !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              {getTrendIcon()}
              <span className={trend === 'up' ? 'text-yt-lens-accent' : trend === 'down' ? 'text-yt-lens-secondary' : 'text-gray-500'}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricsDashboard({ 
  metrics = [], 
  trends = [], 
  entities = [],
  onRefresh,
  isLoading = false
}: MetricsDashboardProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate aggregate metrics
  const aggregateMetrics = useMemo(() => {
    if (metrics.length === 0) {
      return {
        totalViews: 0,
        totalLikes: 0,
        avgVPH: 0,
        avgEngagement: 0,
        totalVideos: 0,
        viralVideos: 0,
        topPerformers: 0,
        growthRate: 0
      };
    }

    const totalViews = metrics.reduce((sum, m) => sum + (m.view_count || 0), 0);
    const totalLikes = metrics.reduce((sum, m) => sum + (m.like_count || 0), 0);
    const avgVPH = metrics.reduce((sum, m) => sum + (m.views_per_hour || 0), 0) / metrics.length;
    const avgEngagement = metrics.reduce((sum, m) => sum + (m.engagement_rate || 0), 0) / metrics.length;
    const viralVideos = metrics.filter(m => (m.viral_score || 0) > 70).length;
    const topPerformers = metrics.filter(m => (m.views_per_hour || 0) > 1000).length;

    // Calculate growth rate from trends data
    const growthRate = trends.length > 0 && trends[0]?.growth_rate ? trends[0].growth_rate : 0;

    return {
      totalViews,
      totalLikes,
      avgVPH: Math.round(avgVPH),
      avgEngagement: avgEngagement.toFixed(2),
      totalVideos: metrics.length,
      viralVideos,
      topPerformers,
      growthRate
    };
  }, [metrics]);

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Performance distribution
  const performanceDistribution = useMemo(() => {
    const distribution = {
      excellent: metrics.filter(m => (m.viral_score || 0) > 80).length,
      good: metrics.filter(m => (m.viral_score || 0) > 60 && (m.viral_score || 0) <= 80).length,
      average: metrics.filter(m => (m.viral_score || 0) > 40 && (m.viral_score || 0) <= 60).length,
      poor: metrics.filter(m => (m.viral_score || 0) <= 40).length
    };
    return distribution;
  }, [metrics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-yt-lens-primary to-yt-lens-secondary bg-clip-text text-transparent">
            YouTube Lens Analytics
          </h2>
          <p className="text-muted-foreground mt-1">실시간 성과 지표 및 분석</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">오늘</SelectItem>
              <SelectItem value="7d">7일</SelectItem>
              <SelectItem value="30d">30일</SelectItem>
              <SelectItem value="90d">90일</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="border-yt-lens-primary text-yt-lens-primary hover:bg-yt-lens-primary hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-yt-lens-accent text-yt-lens-accent-dark hover:bg-yt-lens-accent hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="총 조회수"
          value={formatNumber(aggregateMetrics.totalViews)}
          change={aggregateMetrics.growthRate}
          icon={Eye}
          trend={aggregateMetrics.growthRate > 0 ? "up" : aggregateMetrics.growthRate < 0 ? "down" : "neutral"}
          color="primary"
          description="지난 기간 대비"
        />
        <StatCard
          title="평균 VPH"
          value={formatNumber(aggregateMetrics.avgVPH)}
          change={aggregateMetrics.growthRate}
          icon={Clock}
          trend="up"
          color="secondary"
          description="시간당 조회수"
        />
        <StatCard
          title="참여율"
          value={`${aggregateMetrics.avgEngagement}%`}
          change={0}
          icon={Heart}
          trend="neutral"
          color="accent"
          description="좋아요 + 댓글"
        />
        <StatCard
          title="바이럴 영상"
          value={aggregateMetrics.viralVideos}
          change={0}
          icon={Zap}
          trend="neutral"
          color="success"
          description={`전체 ${aggregateMetrics.totalVideos}개 중`}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-yt-lens-primary/5 to-yt-lens-secondary/5 p-1">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            개요
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white"
          >
            <LineChart className="w-4 h-4 mr-2" />
            성과 분석
          </TabsTrigger>
          <TabsTrigger 
            value="trends" 
            className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            트렌드
          </TabsTrigger>
          <TabsTrigger 
            value="entities" 
            className="data-[state=active]:bg-yt-lens-primary data-[state=active]:text-white"
          >
            <Globe className="w-4 h-4 mr-2" />
            엔티티
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-yt-lens-primary" />
                  성과 분포
                </CardTitle>
                <CardDescription>바이럴 점수 기준 분류</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">우수 (80+)</span>
                      <span className="text-sm text-muted-foreground">{performanceDistribution.excellent}개</span>
                    </div>
                    <Progress 
                      value={(performanceDistribution.excellent / aggregateMetrics.totalVideos) * 100} 
                      className="h-2 bg-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">양호 (60-80)</span>
                      <span className="text-sm text-muted-foreground">{performanceDistribution.good}개</span>
                    </div>
                    <Progress 
                      value={(performanceDistribution.good / aggregateMetrics.totalVideos) * 100} 
                      className="h-2 bg-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">보통 (40-60)</span>
                      <span className="text-sm text-muted-foreground">{performanceDistribution.average}개</span>
                    </div>
                    <Progress 
                      value={(performanceDistribution.average / aggregateMetrics.totalVideos) * 100} 
                      className="h-2 bg-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">미흡 (40 이하)</span>
                      <span className="text-sm text-muted-foreground">{performanceDistribution.poor}개</span>
                    </div>
                    <Progress 
                      value={(performanceDistribution.poor / aggregateMetrics.totalVideos) * 100} 
                      className="h-2 bg-gray-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-yt-lens-secondary" />
                  실시간 활동
                </CardTitle>
                <CardDescription>최근 24시간 동안의 활동</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">신규 영상</p>
                    <p className="text-2xl font-bold text-yt-lens-primary">{aggregateMetrics.totalVideos}</p>
                    <Badge className="bg-yt-lens-accent/20 text-yt-lens-accent-dark">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {aggregateMetrics.growthRate > 0 ? '+' : ''}{aggregateMetrics.growthRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">모니터링 채널</p>
                    <p className="text-2xl font-bold text-yt-lens-secondary">{trends.length}</p>
                    <Badge variant="outline">
                      {trends.length > 0 ? '활성' : '대기'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">알림 발생</p>
                    <p className="text-2xl font-bold">{aggregateMetrics.viralVideos}</p>
                    <Badge className={aggregateMetrics.viralVideos > 5 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                      {aggregateMetrics.viralVideos > 5 ? (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          주의
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          정상
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">API 사용량</p>
                    <p className="text-2xl font-bold">{aggregateMetrics.avgEngagement}%</p>
                    <Progress value={parseFloat(String(aggregateMetrics.avgEngagement))} className="h-2 mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Videos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600" />
                Top 5 인기 영상
              </CardTitle>
              <CardDescription>VPH 기준 상위 5개 영상</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.slice(0, 5).map((metric, index) => (
                  <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yt-lens-primary/10 text-yt-lens-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">Video {metric.video_id}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            {formatNumber(metric.view_count || 0)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            VPH: {formatNumber(metric.views_per_hour || 0)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yt-lens-primary">
                        {metric.viral_score?.toFixed(0)}
                      </div>
                      <p className="text-xs text-muted-foreground">바이럴 점수</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>성과 추이</CardTitle>
              <CardDescription>시간대별 주요 지표 변화</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <LineChart className="w-12 h-12" />
                <p className="ml-4">차트 구현 예정</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          {trends.length > 0 ? (
            <TrendChart trends={trends} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">트렌드 데이터를 불러오는 중...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Entities Tab */}
        <TabsContent value="entities" className="space-y-4">
          {entities.length > 0 ? (
            <EntityRadar entities={entities} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">엔티티 데이터를 불러오는 중...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}