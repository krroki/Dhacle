import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction, Award } from 'lucide-react';
import Link from 'next/link';

export default function AchievementsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-6">
        <Link href="/mypage">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            마이페이지로 돌아가기
          </Button>
        </Link>
      </div>

      <Card className="border-2 border-dashed">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Award className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-2">업적</CardTitle>
          <p className="text-muted-foreground text-lg">
            나의 학습 업적과 달성 현황
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-6 text-center">
            <Construction className="w-12 h-12 text-amber-600 dark:text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">🚧 준비 중입니다</h3>
            <p className="text-muted-foreground">
              학습 진행 상황과 업적을 확인할 수 있는 시스템을 준비하고 있습니다.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">곧 제공될 기능:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                강의 완료 업적
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                연속 학습 기록
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                커뮤니티 활동 배지
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                수익 달성 마일스톤
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                특별 이벤트 업적
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                레벨 시스템
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}