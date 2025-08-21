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

      // 강의 생성 - snake_case로 변환
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
            title: courseData.title || '',
            description: courseData.description || null,
            instructor_id: user.id,
            instructor_name: courseData.instructor_name || user.email?.split('@')[0] || 'Unknown',
            thumbnail_url: courseData.thumbnail_url || null,
            price: courseData.price || 0,
            duration_weeks: Math.ceil((courseData.total_duration || 0) / (7 * 60)) || 8, // Convert minutes to weeks
            category: courseData.category || null,
            level: courseData.level || courseData.difficulty || 'beginner',
            is_free: courseData.price === 0 || courseData.is_free || false,
            is_published: false,
            curriculum: courseData.contentBlocks
              ? JSON.parse(JSON.stringify(courseData.contentBlocks))
              : null,
            what_youll_learn: courseData.whatYouLearn || null,
            requirements: courseData.requirements || null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 성공 시 강의 관리 페이지로 이동
      router.push('/admin/courses');
    } catch (_error) {
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
