'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VideoPlayer } from './components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  Lock,
  FileText,
  MessageSquare,
  Award
} from 'lucide-react';
import { createClient } from '@/lib/supabase/browser-client';
import type { Lesson, Course, CourseProgress } from '@/types/course';

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    loadCourseData();
  }, [courseId, lessonId]);

  const loadCourseData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // 강의 정보
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (courseData) {
        setCourse(courseData);
      }

      // 레슨 목록
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (lessonsData) {
        setLessons(lessonsData);
        const current = lessonsData.find(l => l.id === lessonId);
        setCurrentLesson(current || null);
      }

      // 진도 정보
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: progressData } = await supabase
          .from('course_progress_extended')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId);

        if (progressData) {
          setProgress(progressData);
          
          // 현재 레슨의 메모 가져오기
          const currentProgress = progressData.find(p => p.lesson_id === lessonId);
          if (currentProgress?.notes) {
            setNotes(currentProgress.notes);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = async (time: number) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !currentLesson) return;

      // 진도 업데이트
      const { error } = await supabase
        .from('course_progress_extended')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          progress: Math.floor(time),
          completed: time >= currentLesson.duration * 0.9, // 90% 이상 시청 시 완료
          last_watched_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) {
        console.error('Failed to update progress:', error);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleNoteSave = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('course_progress_extended')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          notes,
          progress: 0
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) {
        console.error('Failed to save notes:', error);
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const navigateToLesson = (lesson: Lesson) => {
    router.push(`/learn/${courseId}/${lesson.id}`);
  };

  const getLessonProgress = (lessonId: string): number => {
    const lessonProgress = progress.find(p => p.lesson_id === lessonId);
    const lesson = lessons.find(l => l.id === lessonId);
    
    if (!lessonProgress || !lesson) return 0;
    
    return Math.min(100, Math.round((lessonProgress.progress / lesson.duration) * 100));
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    const lessonProgress = progress.find(p => p.lesson_id === lessonId);
    return lessonProgress?.completed || false;
  };

  const getCourseCompletionRate = (): number => {
    if (lessons.length === 0) return 0;
    
    const completedCount = lessons.filter(l => 
      isLessonCompleted(l.id)
    ).length;
    
    return Math.round((completedCount / lessons.length) * 100);
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

  if (!course || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">강의를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const currentIndex = lessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 사이드바 */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r bg-white dark:bg-gray-800`}>
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg line-clamp-2">{course.title}</h2>
          <div className="mt-2 space-y-2">
            <Progress value={getCourseCompletionRate()} className="h-2" />
            <p className="text-sm text-muted-foreground">
              진도율: {getCourseCompletionRate()}%
            </p>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-120px)]">
          <div className="p-2">
            {lessons.map((lesson, index) => {
              const isCompleted = isLessonCompleted(lesson.id);
              const lessonProgress = getLessonProgress(lesson.id);
              const isCurrent = lesson.id === lessonId;

              return (
                <button
                  key={lesson.id}
                  onClick={() => navigateToLesson(lesson)}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                    isCurrent
                      ? 'bg-primary/10 border border-primary'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : lessonProgress > 0 ? (
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
                              strokeDasharray={`${lessonProgress * 0.5} 100`}
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
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <FileText className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="font-semibold text-lg">{currentLesson.title}</h1>
                <p className="text-sm text-muted-foreground">
                  레슨 {currentIndex + 1} / {lessons.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => prevLesson && navigateToLesson(prevLesson)}
                disabled={!prevLesson}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => nextLesson && navigateToLesson(nextLesson)}
                disabled={!nextLesson}
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
              streamUrl={currentLesson.video_url || ''}
              lessonId={lessonId}
              userId="user123" // TODO: 실제 사용자 ID로 교체
              title={currentLesson.title}
              onProgress={handleProgressUpdate}
              initialProgress={progress.find(p => p.lesson_id === lessonId)?.progress || 0}
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
                      {currentLesson.description || '이 레슨에서는 중요한 내용을 다룹니다.'}
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
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[200px]"
                    />
                    <Button onClick={handleNoteSave}>
                      노트 저장
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground text-center">
                      아직 토론이 없습니다.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* 수료 조건 */}
            {getCourseCompletionRate() === 100 && (
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