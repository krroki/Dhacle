'use client';

import {
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Lock,
  MessageSquare,
  PlayCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/browser-client';
import { mapCourse, mapLesson } from '@/lib/utils/type-mappers';
import type { Course, CourseProgress, Lesson } from '@/types';
import { VideoPlayer } from './components/VideoPlayer';

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const course_id = params.course_id as string;
  const lesson_id = params.lesson_id as string;

  const [course, set_course] = useState<Course | null>(null);
  const [lessons, set_lessons] = useState<Lesson[]>([]);
  const [current_lesson, set_current_lesson] = useState<Lesson | null>(null);
  const [progress, set_progress] = useState<CourseProgress[]>([]);
  const [notes, set_notes] = useState('');
  const [loading, set_loading] = useState(true);
  const [is_sidebar_open, set_is_sidebar_open] = useState(true);
  const [user_id, set_user_id] = useState<string>('');

  const load_course_data = useCallback(async () => {
    set_loading(true);
    try {
      const supabase = createClient();

      // 강의 정보
      const { data: course_data } = await supabase
        .from('courses')
        .select('*')
        .eq('id', course_id)
        .single();

      if (course_data) {
        set_course(mapCourse(course_data));
      }

      // 레슨 목록
      const { data: lessons_data } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', course_id)
        .order('order_index');

      if (lessons_data) {
        const mapped_lessons = lessons_data.map(mapLesson);
        set_lessons(mapped_lessons);
        const current = mapped_lessons.find((l: Lesson) => l.id === lesson_id);
        set_current_lesson(current || null);
      }

      // 진도 정보
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        set_user_id(user.id); // 사용자 ID 설정

        // TODO: courseProgressExtended 뷰/테이블 생성 후 주석 해제
        // const { data: progressData } = await supabase
        //   .from('courseProgressExtended')
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .eq('course_id', course_id);
        const progress_data: CourseProgress[] = []; // 임시로 빈 배열 반환

        if (progress_data.length > 0) {
          set_progress(progress_data);

          // 현재 레슨의 메모 가져오기
          const current_progress = progress_data.find((p) => p.lesson_id === lesson_id);
          if (current_progress?.notes) {
            set_notes(current_progress.notes);
          }
        }
      }
    } catch (_error) {
    } finally {
      set_loading(false);
    }
  }, [course_id, lesson_id]);

  useEffect(() => {
    load_course_data();
  }, [load_course_data]);

  const handle_progress_update = async (_time: number) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !current_lesson) {
        return;
      }

      // TODO: courseProgressExtended 뷰/테이블 생성 후 주석 해제
      // 진도 업데이트 (임시로 스킵)
      // const { error } = await supabase.from('courseProgressExtended').upsert(
      //   {
      //     user_id: user.id,
      //     course_id: course_id,
      //     lesson_id: lessonId,
      //     progress: Math.floor(time),
      //     completed: time >= currentLesson.duration * 0.9, // 90% 이상 시청 시 완료
      //     last_watched_at: new Date().toISOString(),
      //   },
      //   {
      //     onConflict: 'user_id,lesson_id',
      //   }
      // );

      // if (error) {
      //   console.error('Progress update error:', error);
      // }
    } catch (_error) {}
  };

  const handle_note_save = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { error } = await supabase.from('course_progress_extended').upsert(
        {
          user_id: user.id,
          course_id: course_id,
          lesson_id: lesson_id,
          notes,
          progress: 0,
        },
        {
          onConflict: 'user_id,lesson_id',
        }
      );

      if (error) {
      }
    } catch (_error) {}
  };

  const navigate_to_lesson = (lesson: Lesson) => {
    router.push(`/learn/${course_id}/${lesson.id}`);
  };

  const get_lesson_progress = (lessonId: string): number => {
    const lesson_progress = progress.find((p) => p.lesson_id === lessonId);
    const lesson = lessons.find((l) => l.id === lessonId);

    if (!lesson_progress || !lesson) {
      return 0;
    }

    return Math.min(100, Math.round((lesson_progress.progress / lesson.duration) * 100));
  };

  const is_lesson_completed = (lessonId: string): boolean => {
    const lesson_progress = progress.find((p) => p.lesson_id === lessonId);
    return lesson_progress?.completed || false;
  };

  const get_course_completion_rate = (): number => {
    if (lessons.length === 0) {
      return 0;
    }

    const completed_count = lessons.filter((l) => is_lesson_completed(l.id)).length;

    return Math.round((completed_count / lessons.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="w-32 h-32 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!course || !current_lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">강의를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const current_index = lessons.findIndex((l) => l.id === lesson_id);
  const prev_lesson = current_index > 0 ? lessons[current_index - 1] : null;
  const next_lesson = current_index < lessons.length - 1 ? lessons[current_index + 1] : null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 사이드바 */}
      <div
        className={`${is_sidebar_open ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r bg-white dark:bg-gray-800`}
      >
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg line-clamp-2">{course.title}</h2>
          <div className="mt-2 space-y-2">
            <Progress value={get_course_completion_rate()} className="h-2" />
            <p className="text-sm text-muted-foreground">진도율: {get_course_completion_rate()}%</p>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-120px)]">
          <div className="p-2">
            {lessons.map((lesson, index) => {
              const is_completed = is_lesson_completed(lesson.id);
              const lesson_progress = get_lesson_progress(lesson.id);
              const is_current = lesson.id === lesson_id;

              return (
                <button
                  key={lesson.id}
                  onClick={() => navigate_to_lesson(lesson)}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                    is_current
                      ? 'bg-primary/10 border border-primary'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {is_completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : lesson_progress > 0 ? (
                        <div className="relative w-5 h-5">
                          <svg className="w-5 h-5 transform -rotate-90">
                            <circle
                              cx="10"
                              cy="10"
                              r="8"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              className="text-gray-300"
                            />
                            <circle
                              cx="10"
                              cy="10"
                              r="8"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              strokeDasharray={`${lesson_progress * 0.5} 100`}
                              className="text-primary"
                            />
                          </svg>
                        </div>
                      ) : lesson.is_free ? (
                        <PlayCircle className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">
                        {index + 1}. {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.floor(lesson.duration / 60)}분
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <div className="border-b bg-white dark:bg-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => set_is_sidebar_open(!is_sidebar_open)}
              >
                <FileText className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="font-semibold text-lg">{current_lesson.title}</h1>
                <p className="text-sm text-muted-foreground">
                  레슨 {current_index + 1} / {lessons.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => prev_lesson && navigate_to_lesson(prev_lesson)}
                disabled={!prev_lesson}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => next_lesson && navigate_to_lesson(next_lesson)}
                disabled={!next_lesson}
              >
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* 비디오 플레이어 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 space-y-6">
            <VideoPlayer
              streamUrl={current_lesson.video_url || ''}
              lesson_id={lesson_id}
              user_id={user_id}
              title={current_lesson.title}
              onProgress={handle_progress_update}
              initialProgress={progress.find((p) => p.lesson_id === lesson_id)?.progress || 0}
            />

            {/* 레슨 정보 탭 */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="notes">
                  <FileText className="w-4 h-4 mr-2" />
                  노트
                </TabsTrigger>
                <TabsTrigger value="discussion">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  토론
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">레슨 설명</h3>
                    <p className="text-muted-foreground">
                      {current_lesson.description || '이 레슨에서는 중요한 내용을 다룹니다.'}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold">내 노트</h3>
                    <Textarea
                      placeholder="학습하면서 메모할 내용을 작성하세요..."
                      value={notes}
                      onChange={(e) => set_notes(e.target.value)}
                      className="min-h-[200px]"
                    />
                    <Button onClick={handle_note_save}>노트 저장</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground text-center">아직 토론이 없습니다.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* 수료 조건 */}
            {get_course_completion_rate() === 100 && (
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Award className="w-12 h-12 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-lg">축하합니다! 🎉</h3>
                      <p className="text-muted-foreground">
                        모든 레슨을 완료하셨습니다. 수료증이 발급되었습니다.
                      </p>
                      <Button className="mt-3" variant="outline">
                        수료증 다운로드
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
