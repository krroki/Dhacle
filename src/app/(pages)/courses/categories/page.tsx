import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction, Grid3x3 } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
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
            <Grid3x3 className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-2">카테고리별 강의</CardTitle>
          <p className="text-muted-foreground text-lg">
            주제별로 분류된 강의 목록
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-6 text-center">
            <Construction className="w-12 h-12 text-amber-600 dark:text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">🚧 준비 중입니다</h3>
            <p className="text-muted-foreground">
              카테고리별 강의 분류 시스템을 준비하고 있습니다. 원하는 주제를 쉽게 찾을 수 있도록 개선하고 있습니다.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">준비 중인 카테고리:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                기초 - YouTube Shorts 시작하기
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                콘텐츠 기획 및 아이디어
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                촬영 및 편집 기법
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                알고리즘 및 성장 전략
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                수익화 및 비즈니스
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                분석 및 최적화
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}