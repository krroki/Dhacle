'use client';

/**
 * YouTube Lens - Entity Radar Component
 * Phase 4: UI Component
 *
 * Visualizes extracted entities (keywords, topics, brands, people, locations)
 */

import { AlertCircle, Building2, Globe, Hash, MapPin, Tag, Users } from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { EntityExtraction } from '@/types';

interface EntityRadarProps {
  entities: EntityExtraction[];
  title?: string;
  description?: string;
}

export function EntityRadar({
  entities,
  title = '엔티티 레이더',
  description = 'NLP 기반 키워드 및 엔티티 추출 결과',
}: EntityRadarProps) {
  // Aggregate all entities
  const aggregated_entities = useMemo(() => {
    const keywords = new Map<string, number>();
    const topics = new Map<string, number>();
    const brands = new Map<string, number>();
    const people = new Map<string, number>();
    const locations = new Map<string, number>();
    const languages = new Map<string, number>();

    entities.forEach((entity) => {
      // Type guard for entities property
      if (!entity.entities || typeof entity.entities !== 'object') {
        return;
      }

      const ent = entity.entities as {
        keywords?: string[];
        topics?: string[];
        brands?: string[];
        people?: string[];
        locations?: string[];
        languages?: string[];
      };

      // Keywords
      ent.keywords?.forEach((keyword) => {
        keywords.set(keyword, (keywords.get(keyword) || 0) + 1);
      });

      // Topics
      ent.topics?.forEach((topic) => {
        topics.set(topic, (topics.get(topic) || 0) + 1);
      });

      // Brands
      ent.brands?.forEach((brand) => {
        brands.set(brand, (brands.get(brand) || 0) + 1);
      });

      // People
      ent.people?.forEach((person) => {
        people.set(person, (people.get(person) || 0) + 1);
      });

      // Locations
      ent.locations?.forEach((location) => {
        locations.set(location, (locations.get(location) || 0) + 1);
      });

      // Language
      const lang = typeof entity.language === 'string' ? entity.language : 'unknown';
      languages.set(lang, (languages.get(lang) || 0) + 1);
    });

    return {
      keywords: Array.from(keywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20),
      topics: Array.from(topics.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      brands: Array.from(brands.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      people: Array.from(people.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      locations: Array.from(locations.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      languages: Array.from(languages.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [entities]);

  // Calculate average confidence
  const avg_confidence = useMemo(() => {
    if (entities.length === 0) {
      return 0;
    }
    const sum = entities.reduce((acc, entity) => {
      const confidence = typeof entity.confidence === 'number' ? entity.confidence : 0;
      return acc + confidence;
    }, 0);
    return ((sum / entities.length) * 100).toFixed(1);
  }, [entities]);

  const get_frequency_color = (frequency: number, max: number) => {
    const ratio = frequency / max;
    if (ratio > 0.7) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (ratio > 0.4) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (ratio > 0.2) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const EntityList = ({
    items,
    icon: Icon,
    emptyMessage,
  }: {
    items: [string, number][];
    icon: React.ElementType;
    emptyMessage: string;
  }) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <AlertCircle className="w-6 h-6 mb-2" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      );
    }

    const max_freq = items[0]?.[1] || 1;

    return (
      <ScrollArea className="h-[300px]">
        <div className="space-y-2 pr-4">
          {items.map(([item, frequency]) => (
            <div
              key={item}
              className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{item}</span>
              </div>
              <Badge variant="outline" className={get_frequency_color(frequency, max_freq)}>
                {frequency}
              </Badge>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  if (!entities || entities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p>엔티티 데이터가 없습니다</p>
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
              <Globe className="w-5 h-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{entities.length}개 비디오 분석</Badge>
            <Badge variant="secondary">신뢰도 {avg_confidence}%</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="keywords" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="keywords">키워드</TabsTrigger>
            <TabsTrigger value="topics">토픽</TabsTrigger>
            <TabsTrigger value="brands">브랜드</TabsTrigger>
            <TabsTrigger value="people">인물</TabsTrigger>
            <TabsTrigger value="locations">장소</TabsTrigger>
          </TabsList>

          <TabsContent value="keywords" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  상위 {aggregated_entities.keywords.length}개 키워드
                </p>
                {aggregated_entities.languages.length > 0 && (
                  <div className="flex gap-1">
                    {aggregated_entities.languages.map(([lang, count]) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang} ({count})
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <EntityList
                items={aggregated_entities.keywords}
                icon={Hash}
                emptyMessage="추출된 키워드가 없습니다"
              />
            </div>
          </TabsContent>

          <TabsContent value="topics" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {aggregated_entities.topics.length > 0
                  ? `${aggregated_entities.topics.length}개 토픽 감지됨`
                  : '토픽 분석 중'}
              </p>
              <EntityList
                items={aggregated_entities.topics}
                icon={Tag}
                emptyMessage="감지된 토픽이 없습니다"
              />
            </div>
          </TabsContent>

          <TabsContent value="brands" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {aggregated_entities.brands.length > 0
                  ? `${aggregated_entities.brands.length}개 브랜드 언급됨`
                  : '브랜드 분석 중'}
              </p>
              <EntityList
                items={aggregated_entities.brands}
                icon={Building2}
                emptyMessage="언급된 브랜드가 없습니다"
              />
            </div>
          </TabsContent>

          <TabsContent value="people" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {aggregated_entities.people.length > 0
                  ? `${aggregated_entities.people.length}명 인물 감지됨`
                  : '인물 분석 중'}
              </p>
              <EntityList
                items={aggregated_entities.people}
                icon={Users}
                emptyMessage="감지된 인물이 없습니다"
              />
            </div>
          </TabsContent>

          <TabsContent value="locations" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {aggregated_entities.locations.length > 0
                  ? `${aggregated_entities.locations.length}개 장소 언급됨`
                  : '장소 분석 중'}
              </p>
              <EntityList
                items={aggregated_entities.locations}
                icon={MapPin}
                emptyMessage="언급된 장소가 없습니다"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Entity Cloud Visualization (simplified) */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">주요 엔티티 클라우드</p>
          <div className="flex flex-wrap gap-2">
            {aggregated_entities.keywords.slice(0, 15).map(([keyword, freq]) => {
              const size = Math.min(Math.max(12 + freq * 2, 12), 24);
              // Map size to Tailwind font size classes
              const get_font_size_class = (size: number) => {
                if (size <= 14) return 'text-xs';
                if (size <= 16) return 'text-sm';
                if (size <= 18) return 'text-base';
                if (size <= 20) return 'text-lg';
                return 'text-xl';
              };

              return (
                <span
                  key={keyword}
                  className={`inline-flex items-center px-2 py-1 rounded-full bg-white border text-gray-700 hover:bg-purple-50 hover:border-purple-300 transition-colors cursor-pointer ${get_font_size_class(size)}`}
                >
                  {keyword}
                </span>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
