'use client';

import { AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiUpload } from '@/lib/api-client';

export default function VideoUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [course_id, setCourseId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 파일 크기 체크 (500MB)
      if (selectedFile.size > 500 * 1024 * 1024) {
        setError('파일 크기는 500MB를 초과할 수 없습니다');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file || !course_id || !lessonId || !lessonTitle) {
      setError('모든 필드를 입력해주세요');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('course_id', course_id);
    formData.append('lessonId', lessonId);
    formData.append('lessonTitle', lessonTitle);

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      // 진행률 시뮬레이션 (실제로는 XMLHttpRequest 또는 fetch with streams 사용)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // FormData 업로드는 apiUpload 사용
      const _result = await apiUpload('/api/admin/video/upload', formData);

      clearInterval(progressInterval);
      setProgress(100);
      setSuccess(true);

      // 성공 후 폼 초기화
      setTimeout(() => {
        setFile(null);
        setCourseId('');
        setLessonId('');
        setLessonTitle('');
        setProgress(0);
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : '비디오 업로드 중 오류가 발생했습니다');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">비디오 업로드</h1>

        <Card>
          <CardHeader>
            <CardTitle>새 비디오 업로드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 파일 선택 */}
            <div className="space-y-2">
              <Label htmlFor="video">비디오 파일 *</Label>
              <Input
                id="video"
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={handleFileChange}
                disabled={uploading}
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  선택된 파일: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                지원 형식: MP4, WebM, OGG (최대 500MB)
              </p>
            </div>

            {/* 강의 선택 */}
            <div className="space-y-2">
              <Label htmlFor="courseId">강의 선택 *</Label>
              <Select value={course_id} onValueChange={setCourseId} disabled={uploading}>
                <SelectTrigger id="courseId">
                  <SelectValue placeholder="강의를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course-1">YouTube Shorts 마스터 클래스</SelectItem>
                  <SelectItem value="course-2">콘텐츠 기획의 정석</SelectItem>
                  <SelectItem value="course-3">편집 완벽 가이드</SelectItem>
                  <SelectItem value="course-4">수익화 전략</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 레슨 ID */}
            <div className="space-y-2">
              <Label htmlFor="lessonId">레슨 ID *</Label>
              <Input
                id="lessonId"
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                placeholder="예: lesson-001"
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground">레슨의 고유 식별자를 입력하세요</p>
            </div>

            {/* 레슨 제목 */}
            <div className="space-y-2">
              <Label htmlFor="lessonTitle">레슨 제목 *</Label>
              <Input
                id="lessonTitle"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="예: 1강. YouTube Shorts 시작하기"
                disabled={uploading}
              />
            </div>

            {/* 진행 상태 */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>업로드 진행중...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* 성공 메시지 */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  비디오가 성공적으로 업로드되었습니다!
                </AlertDescription>
              </Alert>
            )}

            {/* 에러 메시지 */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 업로드 버튼 */}
            <Button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  업로드 중... ({progress}%)
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  비디오 업로드
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 업로드 가이드 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">업로드 가이드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <span className="font-semibold">1.</span>
              <span>비디오 파일은 MP4, WebM, OGG 형식만 지원됩니다.</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">2.</span>
              <span>파일 크기는 최대 500MB까지 업로드 가능합니다.</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">3.</span>
              <span>레슨 ID는 중복되지 않는 고유한 값이어야 합니다.</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">4.</span>
              <span>업로드 중에는 페이지를 벗어나지 마세요.</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold">5.</span>
              <span>대용량 파일은 업로드에 시간이 걸릴 수 있습니다.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
