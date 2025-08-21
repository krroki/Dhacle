import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { Instructor } from '@/lib/dummy-data/home';

interface InstructorCardProps {
  instructor: Instructor;
  onClick?: () => void;
}

export function InstructorCard({ instructor, onClick }: InstructorCardProps) {
  return (
    <div
      className="flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg group"
      onClick={onClick}
    >
      <div className="relative w-20 h-20 mb-3">
        <Image
          src={instructor.profileImage}
          alt={instructor.name}
          fill={true}
          className="rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/50 transition-colors"
        />
      </div>
      <h3 className="font-semibold text-sm mb-1">{instructor.name}</h3>
      <p className="text-xs text-muted-foreground mb-2">{instructor.specialty}</p>
      <Badge variant="secondary" className="text-xs">
        {instructor.courseCount}개 강의
      </Badge>
    </div>
  );
}
