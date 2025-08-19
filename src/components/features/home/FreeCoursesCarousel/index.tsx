import Link from 'next/link';
import { Button } from '@/components/ui';
import { dummyFreeCourses } from '@/lib/dummy-data/home';
import { CourseCarousel } from '../shared/CourseCarousel';
import { SectionTitle } from '../shared/SectionTitle';

export function FreeCoursesCarousel() {
  return (
    <section className="py-12">
      <div className="container-responsive">
        <div className="flex items-center justify-between mb-8">
          <SectionTitle title="무료 강의" subtitle="부담없이 시작해보세요" className="mb-0" />
          <Button variant="outline" asChild={true}>
            <Link href="/courses/free">전체보기</Link>
          </Button>
        </div>

        <CourseCarousel courses={dummyFreeCourses} />
      </div>
    </section>
  );
}
