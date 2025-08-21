import { BarChart3, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge, Card, CardContent } from '@/components/ui';
import type { Course } from '@/lib/dummy-data/home';

interface CourseCardProps {
  course: Course;
  showNewBadge?: boolean;
}

const levelColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-blue-100 text-blue-800',
  advanced: 'bg-purple-100 text-purple-800',
};

const levelLabels = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
};

export function CourseCard({ course, showNewBadge = false }: CourseCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <Link href={`/courses/${course.id}`}>
        <div className="relative aspect-video">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill={true}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {showNewBadge && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">NEW</Badge>
          )}
          {course.is_free && (
            <Badge className="absolute top-2 right-2 bg-green-500 text-white">무료</Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              <span className={`px-2 py-0.5 rounded-full text-xs ${levelColors[course.level]}`}>
                {levelLabels[course.level]}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{course.enrollCount.toLocaleString()}명</span>
            </div>

            {!course.is_free && course.price && (
              <p className="font-bold text-lg text-primary">₩{course.price.toLocaleString()}</p>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
