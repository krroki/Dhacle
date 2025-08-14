// Server Component - 강의 목록 페이지
import { getCourses, getUniqueInstructors } from '@/lib/api/courses';
import { CourseGrid } from './components/CourseGrid';
import { InstructorFilter } from './components/InstructorFilter';

export default async function CoursesPage() {
  // 서버에서 데이터 가져오기
  const coursesData = await getCourses();
  const instructors = await getUniqueInstructors();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">전체 강의</h1>
        <p className="text-muted-foreground">
          YouTube Shorts 전문가들이 제작한 체계적인 커리큘럼으로 학습하세요.
        </p>
      </div>

      {/* 필터 (Client Component) */}
      <InstructorFilter instructors={instructors} />

      {/* 강의 그리드 (Client Component) */}
      <CourseGrid initialCourses={coursesData.courses} />
    </div>
  );
}