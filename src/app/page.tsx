import { Suspense } from 'react';
import { HeroCarousel } from '@/components/features/home/HeroCarousel';
import { InstructorCategories } from '@/components/features/home/InstructorCategories';
import { RevenueGallery } from '@/components/features/home/RevenueGallery';
import { FreeCoursesCarousel } from '@/components/features/home/FreeCoursesCarousel';
import { FreeCoursesSchedule } from '@/components/features/home/FreeCoursesSchedule';
import { NewCoursesCarousel } from '@/components/features/home/NewCoursesCarousel';
import { EbookSection } from '@/components/features/home/EbookSection';
import { FAQSection } from '@/components/features/home/FAQSection';
import {
  HeroSkeleton,
  InstructorCardSkeleton,
  RevenueCardSkeleton,
  CourseCardSkeleton,
  CalendarSkeleton,
  EbookCardSkeleton,
  FAQSkeleton,
} from '@/components/features/home/shared/LoadingSkeletons';

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Carousel Section */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroCarousel />
      </Suspense>

      {/* Revenue Gallery Section */}
      <Suspense 
        fallback={
          <div className="py-12 bg-muted/30">
            <div className="container-responsive">
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                  <RevenueCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <RevenueGallery />
      </Suspense>

      {/* Free Courses Carousel Section */}
      <Suspense 
        fallback={
          <div className="py-12 container-responsive">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <FreeCoursesCarousel />
      </Suspense>

      {/* Free Courses Schedule Section */}
      <Suspense fallback={<CalendarSkeleton />}>
        <FreeCoursesSchedule />
      </Suspense>

      {/* New Courses Carousel Section */}
      <Suspense 
        fallback={
          <div className="py-12 container-responsive">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <NewCoursesCarousel />
      </Suspense>

      {/* Ebook Section */}
      <Suspense 
        fallback={
          <div className="py-12 bg-muted/30">
            <div className="container-responsive">
              <div className="grid grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <EbookCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <EbookSection />
      </Suspense>

      {/* Instructor Categories Section */}
      <Suspense 
        fallback={
          <div className="py-12 container-responsive">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <InstructorCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <InstructorCategories />
      </Suspense>

      {/* FAQ Section */}
      <Suspense fallback={<FAQSkeleton />}>
        <FAQSection />
      </Suspense>
    </div>
  );
}