'use client';

/**
 * YouTube Lens - Trend Chart Component
 * Phase 4: UI Component
 *
 * Visualizes trend data using interactive charts
 */

import { Activity, AlertCircle, BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TrendAnalysis } from '@/types/youtube-lens';

interface TrendChartProps {
  trends: TrendAnalysis[];
  title?: string;
  description?: string;
}

export function TrendChart({
  trends,
  title = '트렌드 분석',
  description = '키워드 성장률 및 트렌드 패턴',
}: TrendChartProps) {
  // Sort trends by growth rate
  const sortedTrends = useMemo(() => {
    return [...trends].sort((a, b) => b.growthRate - a.growthRate);
  }, [trends]);

  // Top growing and declining trends
  const topGrowing = sortedTrends.filter((t) => t.growthRate > 0).slice(0, 5);
  const topDeclining = sortedTrends.filter((t) => t.growthRate < 0).slice(0, 5);

  // Sentiment distribution
  const sentimentCounts = useMemo(() => {
    const counts = { positive: 0, negative: 0, neutral: 0 };
    trends.forEach((trend) => {
      counts[trend.sentiment]++;
    });
    return counts;
  }, [trends]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (rate < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const formatGrowthRate = (rate: number) => {
    const percentage = (rate * 100).toFixed(1);
    return rate > 0 ? `+${percentage}%` : `${percentage}%`;
  };

  if (!trends || trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p>트렌드 데이터가 없습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">총 {trends.length}개 트렌드</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="growing" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="growing">상승 트렌드</TabsTrigger>
            <TabsTrigger value="declining">하락 트렌드</TabsTrigger>
            <TabsTrigger value="sentiment">감성 분석</TabsTrigger>
          </TabsList>

          <TabsContent value="growing" className="space-y-4">
            <div className="space-y-3">
              {topGrowing.length > 0 ? (
                topGrowing.map((trend, index) => (
                  <div
                    key={`${trend.keyword}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{trend.keyword}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            빈도: {trend.frequency}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getSentimentColor(trend.sentiment)}`}
                          >
                            {trend.sentiment === 'positive'
                              ? '긍정'
                              : trend.sentiment === 'negative'
                                ? '부정'
                                : '중립'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getGrowthIcon(trend.growthRate)}
                      <span className="font-bold text-green-600">
                        {formatGrowthRate(trend.growthRate)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">상승 트렌드가 없습니다</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="declining" className="space-y-4">
            <div className="space-y-3">
              {topDeclining.length > 0 ? (
                topDeclining.map((trend, index) => (
                  <div
                    key={`${trend.keyword}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{trend.keyword}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            빈도: {trend.frequency}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getSentimentColor(trend.sentiment)}`}
                          >
                            {trend.sentiment === 'positive'
                              ? '긍정'
                              : trend.sentiment === 'negative'
                                ? '부정'
                                : '중립'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getGrowthIcon(trend.growthRate)}
                      <span className="font-bold text-red-600">
                        {formatGrowthRate(trend.growthRate)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">하락 트렌드가 없습니다</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-4">
            <div className="space-y-4">
              {/* Sentiment Distribution */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-2xl font-bold text-green-700">{sentimentCounts.positive}</p>
                  <p className="text-sm text-green-600 mt-1">긍정적</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-2xl font-bold text-gray-700">{sentimentCounts.neutral}</p>
                  <p className="text-sm text-gray-600 mt-1">중립적</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-2xl font-bold text-red-700">{sentimentCounts.negative}</p>
                  <p className="text-sm text-red-600 mt-1">부정적</p>
                </div>
              </div>

              {/* Sentiment Percentage Bar */}
              <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden flex">
                {sentimentCounts.positive > 0 && (
                  <div
                    className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${(sentimentCounts.positive / trends.length) * 100}%` }}
                  >
                    {((sentimentCounts.positive / trends.length) * 100).toFixed(0)}%
                  </div>
                )}
                {sentimentCounts.neutral > 0 && (
                  <div
                    className="bg-gray-400 h-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${(sentimentCounts.neutral / trends.length) * 100}%` }}
                  >
                    {((sentimentCounts.neutral / trends.length) * 100).toFixed(0)}%
                  </div>
                )}
                {sentimentCounts.negative > 0 && (
                  <div
                    className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${(sentimentCounts.negative / trends.length) * 100}%` }}
                  >
                    {((sentimentCounts.negative / trends.length) * 100).toFixed(0)}%
                  </div>
                )}
              </div>

              {/* Top Keywords by Sentiment */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">감성별 주요 키워드</p>
                <div className="space-y-2">
                  {['positive', 'negative', 'neutral'].map((sentiment) => {
                    const keywords = trends
                      .filter((t) => t.sentiment === sentiment)
                      .slice(0, 3)
                      .map((t) => t.keyword);

                    if (keywords.length === 0) return null;

                    return (
                      <div key={sentiment} className="flex items-center gap-2">
                        <Badge variant="outline" className={getSentimentColor(sentiment)}>
                          {sentiment === 'positive'
                            ? '긍정'
                            : sentiment === 'negative'
                              ? '부정'
                              : '중립'}
                        </Badge>
                        <div className="flex gap-1 flex-wrap">
                          {keywords.map((keyword) => (
                            <Badge key={keyword} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
