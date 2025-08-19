'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser-client';
import type { Course } from '@/types/course';
import { CourseEditor } from '../components/CourseEditor';

export default function NewCoursePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (courseData: Partial<Course>) => {
    setIsSaving(true);
    try {
      const supabase = createClient();

      // 현재 사용자 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // 강의 생성
      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          instructorId: user.id,
          status: 'upcoming',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 성공 시 강의 관리 페이지로 이동
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('강의 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">새 강의 만들기</h1>
        <p className="text-muted-foreground mt-2">새로운 강의를 생성합니다</p>
      </div>

      <CourseEditor onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}
