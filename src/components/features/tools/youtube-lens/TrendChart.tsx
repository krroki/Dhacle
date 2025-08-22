'use client';

/**
 * YouTube Lens - Trend Chart Component
 * Phase 4: UI Component
 *
 * Visualizes trend data using interactive charts
 */

import { Activity, AlertCircle, BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TrendAnalysis } from '@/types';

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
  const sentiment_bar_ref = useRef<HTMLDivElement>(null);
  // Sort trends by growth rate
  const sorted_trends = useMemo(() => {
    return [...trends].sort((a, b) => {
      const a_rate = typeof a.growthRate === 'number' ? a.growthRate : 0;
      const b_rate = typeof b.growthRate === 'number' ? b.growthRate : 0;
      return b_rate - a_rate;
    });
  }, [trends]);

  // Top growing and declining trends
  const top_growing = sorted_trends
    .filter((t) => typeof t.growthRate === 'number' && t.growthRate > 0)
    .slice(0, 5);
  const top_declining = sorted_trends
    .filter((t) => typeof t.growthRate === 'number' && t.growthRate < 0)
    .slice(0, 5);

  // Sentiment distribution
  const sentiment_counts = useMemo(() => {
    const counts = { positive: 0, negative: 0, neutral: 0 };
    trends.forEach((trend) => {
      counts[trend.sentiment]++;
    });
    return counts;
  }, [trends]);

  // Set CSS variables for dynamic widths
  useEffect(() => {
    if (sentiment_bar_ref.current && trends.length > 0) {
      const positive_percent = (sentiment_counts.positive / trends.length) * 100;
      const neutral_percent = (sentiment_counts.neutral / trends.length) * 100;
      const negative_percent = (sentiment_counts.negative / trends.length) * 100;

      sentiment_bar_ref.current.style.setProperty('--positive-width', `${positive_percent}%`);
      sentiment_bar_ref.current.style.setProperty('--neutral-width', `${neutral_percent}%`);
      sentiment_bar_ref.current.style.setProperty('--negative-width', `${negative_percent}%`);
    }
  }, [sentiment_counts, trends.length]);

  const get_sentiment_color = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const get_growth_icon = (rate: number) => {
    if (rate > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
    if (rate < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const format_growth_rate = (rate: number) => {
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
              {top_growing.length > 0 ? (
                top_growing.map((trend, index) => (
                  <div
                    key={`${trend.keyword}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{String(trend.keyword ?? '')}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            빈도: {String(trend.frequency ?? 0)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${get_sentiment_color(String(trend.sentiment ?? 'neutral'))}`}
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
                      {get_growth_icon(trend.growthRate)}
                      <span className="font-bold text-green-600">
                        {format_growth_rate(trend.growthRate)}
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
              {top_declining.length > 0 ? (
                top_declining.map((trend, index) => (
                  <div
                    key={`${trend.keyword}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{String(trend.keyword ?? '')}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            빈도: {String(trend.frequency ?? 0)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${get_sentiment_color(String(trend.sentiment ?? 'neutral'))}`}
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
                      {get_growth_icon(trend.growthRate)}
                      <span className="font-bold text-red-600">
                        {format_growth_rate(trend.growthRate)}
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
                  <p className="text-2xl font-bold text-green-700">{sentiment_counts.positive}</p>
                  <p className="text-sm text-green-600 mt-1">긍정적</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-2xl font-bold text-gray-700">{sentiment_counts.neutral}</p>
                  <p className="text-sm text-gray-600 mt-1">중립적</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-2xl font-bold text-red-700">{sentiment_counts.negative}</p>
                  <p className="text-sm text-red-600 mt-1">부정적</p>
                </div>
              </div>

              {/* Sentiment Percentage Bar - Using CSS variables with Tailwind */}
              <div
                ref={sentiment_bar_ref}
                className="w-full bg-gray-200 rounded-full h-8 overflow-hidden flex"
              >
                {sentiment_counts.positive > 0 && (
                  <div className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium w-[var(--positive-width)]">
                    {((sentiment_counts.positive / trends.length) * 100).toFixed(0)}%
                  </div>
                )}
                {sentiment_counts.neutral > 0 && (
                  <div className="bg-gray-400 h-full flex items-center justify-center text-white text-xs font-medium w-[var(--neutral-width)]">
                    {((sentiment_counts.neutral / trends.length) * 100).toFixed(0)}%
                  </div>
                )}
                {sentiment_counts.negative > 0 && (
                  <div className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium w-[var(--negative-width)]">
                    {((sentiment_counts.negative / trends.length) * 100).toFixed(0)}%
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

                    if (keywords.length === 0) {
                      return null;
                    }

                    return (
                      <div key={sentiment} className="flex items-center gap-2">
                        <Badge variant="outline" className={get_sentiment_color(sentiment)}>
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
