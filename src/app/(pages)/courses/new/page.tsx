import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NewCoursesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-6">
        <Link href="/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            강의 목록으로 돌아가기
          </Button>
        </Link>
      </div>

      <Card className="border-2 border-dashed">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-2">신규 강의</CardTitle>
          <p className="text-muted-foreground text-lg">
            새롭게 추가된 최신 강의들
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-6 text-center">
            <Construction className="w-12 h-12 text-amber-600 dark:text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">🚧 준비 중입니다</h3>
            <p className="text-muted-foreground">
              새로운 강의들을 준비하고 있습니다. 최신 트렌드를 반영한 콘텐츠를 기대해주세요.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">곧 공개될 신규 강의:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                최신 YouTube Shorts 알고리즘 공략법
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                AI 도구 활용한 콘텐츠 제작
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                바이럴 콘텐츠 기획 전략
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                수익화 최적화 실전 가이드
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}