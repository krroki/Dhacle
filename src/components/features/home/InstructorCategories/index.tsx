'use client';

import { InstructorCard } from './InstructorCard';
import { SectionTitle } from '../shared/SectionTitle';
import { dummyInstructors } from '@/lib/dummy-data/home';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function InstructorCategories() {

  return (
    <section className="py-12">
      <div className="container-responsive">
        <SectionTitle
          title="전문 강사진"
          subtitle="각 분야 최고의 전문가들이 함께합니다"
        />
        
        {/* Desktop Grid View */}
        <div className="hidden lg:grid grid-cols-6 gap-4">
          {dummyInstructors.map((instructor) => (
            <InstructorCard
              key={instructor.id}
              instructor={instructor}
            />
          ))}
        </div>

        {/* Mobile/Tablet Horizontal Scroll */}
        <ScrollArea className="lg:hidden w-full whitespace-nowrap">
          <div className="flex space-x-4 pb-4">
            {dummyInstructors.map((instructor) => (
              <div key={instructor.id} className="w-[140px] flex-shrink-0">
                <InstructorCard
                  instructor={instructor}
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
}