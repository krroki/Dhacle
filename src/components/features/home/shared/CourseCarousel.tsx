'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { Course } from '@/lib/dummy-data/home';
import { CourseCard } from './CourseCard';

interface CourseCarouselProps {
  courses: Course[];
  showNewBadge?: boolean;
}

export function CourseCarousel({ courses, showNewBadge = false }: CourseCarouselProps) {
  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {courses.map((course) => (
          <CarouselItem
            key={course.id}
            className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/4"
          >
            <CourseCard course={course} showNewBadge={showNewBadge} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-4 md:-left-12" />
      <CarouselNext className="-right-4 md:-right-12" />
    </Carousel>
  );
}
