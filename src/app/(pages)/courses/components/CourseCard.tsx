'use client';

import { Clock, Star, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { safeAccess } from '@/lib/utils/type-mappers';
import type { Course } from '@/types';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  const formatPrice = (price: number): string => {
    if (price === 0) {
      return '무료';
    }
    return `₩${price.toLocaleString()}`;
  };

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        {/* 썸네일 */}
        <div className="aspect-video relative bg-gray-100">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill={true}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
              <span className="text-white text-lg font-semibold">
                {course.title.substring(0, 2)}
              </span>
            </div>
          )}

          {/* 뱃지 오버레이 */}
          <div className="absolute top-2 left-2 flex gap-2">
            {safeAccess(course, 'is_free', 'is_free', false) && (
              <Badge className="bg-green-500 text-white">무료</Badge>
            )}
            {safeAccess(course, 'is_premium', 'isPremium', false) && (
              <Badge className="bg-purple-500 text-white">프리미엄</Badge>
            )}
            {course.status === 'upcoming' && <Badge variant="secondary">예정</Badge>}
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* 강사명 */}
          <div className="text-sm text-muted-foreground">
            {safeAccess(course, 'instructor_name', 'instructor_name', '')}
          </div>

          {/* 제목 */}
          <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">{course.title}</h3>

          {/* 설명 */}
          {course.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
          )}

          {/* 통계 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {course.average_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{course.average_rating.toFixed(1)}</span>
              </div>
            )}
            {course.student_count > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.student_count.toLocaleString()}</span>
              </div>
            )}
            {course.total_duration > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(course.total_duration)}</span>
              </div>
            )}
          </div>

          {/* 가격 */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              {course.discount_price && course.discount_price < course.price ? (
                <>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(course.discount_price)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(course.price)}
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    {Math.round((1 - course.discount_price / course.price) * 100)}% 할인
                  </Badge>
                </>
              ) : (
                <span className="text-lg font-bold text-primary">{formatPrice(course.price)}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
