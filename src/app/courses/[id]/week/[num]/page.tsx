'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import VideoPlayer from '@/components/courses/VideoPlayer';
import { CourseWeek, Enrollment, Progress } from '@/types/course-system.types';
import { StripeTypography, StripeButton, StripeCard } from '@/components/design-system';
import { createBrowserClient } from '@/lib/supabase/browser-client';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function CourseWeekPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const courseId = params?.id as string;
  const weekNumber = parseInt(params?.num as string || '1');
  
  const [week, setWeek] = useState<CourseWeek | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const supabase = createBrowserClient();

  useEffect(() => {
    if (courseId && weekNumber) {
      fetchWeekData();
    }
  }, [courseId, weekNumber, user]);

  const fetchWeekData = async () => {
    try {
      setLoading(true);
      
      // Check enrollment first
      if (!user) {
        router.push('/login?redirect=/courses/' + courseId);
        return;
      }
      
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();
      
      if (enrollmentError || !enrollmentData) {
        alert('이 강의에 등록되지 않았습니다.');
        router.push('/courses/' + courseId);
        return;
      }
      
      setEnrollment(enrollmentData as Enrollment);
      
      // Fetch week data
      const { data: weekData, error: weekError } = await supabase
        .from('course_weeks')
        .select('*')
        .eq('course_id', courseId)
        .eq('week_number', weekNumber)
        .single();
      
      if (weekError) {
        console.error('Week fetch error:', weekError);
        // Use mock data for development
        setWeek(getMockWeek());
      } else {
        setWeek(weekData as CourseWeek || getMockWeek());
      }
      
      // Fetch progress
      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('enrollment_id', enrollmentData.id)
        .eq('week_number', weekNumber)
        .single();
      
      if (progressData) {
        setProgress(progressData as Progress);
      }
    } catch (error) {
      console.error('Error fetching week data:', error);
      setWeek(getMockWeek());
    } finally {
      setLoading(false);
    }
  };

  const getMockWeek = (): CourseWeek => ({
    id: '1',
    course_id: courseId,
    week_number: weekNumber,
    title: `Week ${weekNumber}: 샘플 강의 제목`,
    description: '이 주차에서는 중요한 내용을 다룹니다.',
    video_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Sample HLS stream for testing
    video_duration: 2700,
    download_materials: [
      { name: '강의 슬라이드.pdf', url: '/downloads/slides.pdf', size: 2048000 },
      { name: '실습 파일.zip', url: '/downloads/practice.zip', size: 5120000 }
    ],
    is_published: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const handleProgress = async (currentTime: number, duration: number) => {
    if (!enrollment || !week) return;
    
    // Update progress every 10 seconds
    if (Math.floor(currentTime) % 10 === 0) {
      const progressData = {
        enrollment_id: enrollment.id,
        week_number: weekNumber,
        watched_seconds: Math.floor(currentTime),
        total_seconds: Math.floor(duration),
        last_position: Math.floor(currentTime),
        completed: currentTime / duration > 0.9,
        watch_count: (progress?.watch_count || 0) + 1
      };
      
      try {
        const { error } = await supabase
          .from('progress')
          .upsert(progressData, {
            onConflict: 'enrollment_id,week_number'
          });
        
        if (error) {
          console.error('Progress save error:', error);
        }
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
  };

  const handleComplete = async () => {
    if (!enrollment || !week) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('progress')
        .upsert({
          enrollment_id: enrollment.id,
          week_number: weekNumber,
          completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'enrollment_id,week_number'
        });
      
      if (error) throw error;
      
      alert('수강이 완료되었습니다!');
      
      // Navigate to next week if available
      if (weekNumber < 4) {
        router.push(`/courses/${courseId}/week/${weekNumber + 1}`);
      } else {
        router.push(`/courses/${courseId}`);
      }
    } catch (error) {
      console.error('Error marking complete:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!week) {
    return (
      <div className="text-center py-12">
        <StripeTypography variant="body" color="muted">
          강의를 찾을 수 없습니다.
        </StripeTypography>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          ← 강의 상세로
        </Link>
        
        <StripeTypography variant="h1" color="dark" className="mb-2">
          {week.title}
        </StripeTypography>
        
        {week.description && (
          <StripeTypography variant="body" color="muted">
            {week.description}
          </StripeTypography>
        )}
      </div>
      
      {/* Video Player */}
      <div className="mb-8">
        <VideoPlayer
          videoUrl={week.video_url}
          onProgress={handleProgress}
          onComplete={handleComplete}
          initialPosition={progress?.last_position || 0}
          enableDRM={true}
        />
        
        {/* Progress Bar */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">진도율</span>
            <span className="text-sm font-medium">
              {progress ? Math.round((progress.watched_seconds / (week.video_duration || 1)) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${progress ? Math.min(100, (progress.watched_seconds / (week.video_duration || 1)) * 100) : 0}%` 
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Download Materials */}
      {week.download_materials && Array.isArray(week.download_materials) && week.download_materials.length > 0 && (
        <StripeCard variant="default" className="mb-8">
          <div className="p-6">
            <StripeTypography variant="h3" color="dark" className="mb-4">
              📎 다운로드 자료
            </StripeTypography>
            
            <div className="space-y-3">
              {week.download_materials.map((material: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <div className="font-medium">{material.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(material.size || 0)}
                      </div>
                    </div>
                  </div>
                  
                  <a href={material.url} download>
                    <StripeButton variant="ghost" size="sm">
                      다운로드
                    </StripeButton>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </StripeCard>
      )}
      
      {/* Navigation */}
      <div className="flex items-center justify-between">
        {weekNumber > 1 ? (
          <Link href={`/courses/${courseId}/week/${weekNumber - 1}`}>
            <StripeButton variant="secondary">
              ← 이전 주차
            </StripeButton>
          </Link>
        ) : (
          <div />
        )}
        
        <StripeButton 
          variant="gradient"
          onClick={handleComplete}
          loading={saving}
          disabled={progress?.completed}
        >
          {progress?.completed ? '완료됨' : '완료 표시'}
        </StripeButton>
        
        {weekNumber < 4 ? (
          <Link href={`/courses/${courseId}/week/${weekNumber + 1}`}>
            <StripeButton variant="secondary">
              다음 주차 →
            </StripeButton>
          </Link>
        ) : (
          <Link href={`/courses/${courseId}`}>
            <StripeButton variant="secondary">
              강의 목록
            </StripeButton>
          </Link>
        )}
      </div>
    </div>
  );
}