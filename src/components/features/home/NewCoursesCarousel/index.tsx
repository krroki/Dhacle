import { SectionTitle } from '../shared/SectionTitle';
import { CourseCarousel } from '../shared/CourseCarousel';
import { dummyNewCourses } from '@/lib/dummy-data/home';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function NewCoursesCarousel() {
  return (
    <section className="py-12">
      <div className="container-responsive">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <SectionTitle
              title="신규 강의"
              subtitle="최신 트렌드를 반영한 새로운 강의들"
              className="mb-0"
            />
          </div>
          <Button variant="outline" asChild>
            <Link href="/courses/new">전체보기</Link>
          </Button>
        </div>
        
        <CourseCarousel courses={dummyNewCourses} showNewBadge={true} />
      </div>
    </section>
  );
}