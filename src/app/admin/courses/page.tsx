import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server-client';
import { mapCourse } from '@/lib/utils/type-mappers';
import type { Course } from '@/types/course';

async function getCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  // Type assertion to match mapCourse expectations
  return data.map((course) => mapCourse(course as Record<string, unknown>)) as Course[];
}

export default async function AdminCoursesPage() {
  const courses = await getCourses();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">강의 관리</h1>
          <p className="text-muted-foreground mt-2">강의를 생성하고 관리합니다</p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />새 강의 만들기
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>전체 강의 목록</CardTitle>
          <CardDescription>총 {courses.length}개의 강의</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">강의명</th>
                  <th className="text-left py-3 px-4">강사</th>
                  <th className="text-left py-3 px-4">가격</th>
                  <th className="text-left py-3 px-4">수강생</th>
                  <th className="text-left py-3 px-4">상태</th>
                  <th className="text-left py-3 px-4">액션</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        {course.subtitle && (
                          <p className="text-sm text-muted-foreground">{course.subtitle}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">{course.instructorName}</td>
                    <td className="py-3 px-4">
                      {course.isFree ? (
                        <Badge variant="secondary">무료</Badge>
                      ) : (
                        <span>₩{course.price.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{course.studentCount || 0}명</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          course.status === 'active'
                            ? 'default'
                            : course.status === 'upcoming'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {course.status === 'active'
                          ? '활성'
                          : course.status === 'upcoming'
                            ? '예정'
                            : '종료'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link href={`/courses/${course.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/courses/${course.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
