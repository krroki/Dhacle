'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser-client';
import type { Course } from '@/types';
import { CourseEditor } from '../components/CourseEditor';

export default function NewCoursePage() {
  const router = useRouter();
  const [is_saving, set_is_saving] = useState(false);

  const handle_save = async (course_data: Partial<Course>) => {
    set_is_saving(true);
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
      const { data: _data, error } = await supabase
        .from('courses')
        .insert([
          {
            title: course_data.title || '',
            description: course_data.description || null,
            instructor_id: user.id,
            instructor_name: course_data.instructor_name || user.email?.split('@')[0] || 'Unknown',
            thumbnail_url: course_data.thumbnail_url || null,
            price: course_data.price || 0,
            duration_weeks: Math.ceil((course_data.total_duration || 0) / (7 * 60)) || 8, // Convert minutes to weeks
            category: course_data.category || null,
            level: course_data.level || course_data.difficulty || 'beginner',
            is_free: course_data.price === 0 || course_data.is_free || false,
            is_published: false,
            curriculum: course_data.contentBlocks
              ? JSON.parse(JSON.stringify(course_data.contentBlocks))
              : null,
            what_youll_learn: course_data.whatYouLearn || null,
            requirements: course_data.requirements || null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 성공 시 강의 관리 페이지로 이동
      router.push('/admin/courses');
    } catch (error) {
      console.error('Admin page error:', error);
      alert('강의 생성 중 오류가 발생했습니다.');
    } finally {
      set_is_saving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">새 강의 만들기</h1>
        <p className="text-muted-foreground mt-2">새로운 강의를 생성합니다</p>
      </div>

      <CourseEditor onSave={handle_save} isSaving={is_saving} />
    </div>
  );
}
