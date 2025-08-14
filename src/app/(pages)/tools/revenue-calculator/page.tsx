import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function RevenueCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-6">
        <Link href="/tools">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            도구로 돌아가기
          </Button>
        </Link>
      </div>

      <Card className="border-2 border-dashed">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Calculator className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-2">수익 계산기</CardTitle>
          <p className="text-muted-foreground text-lg">
            YouTube Shorts 예상 수익 계산
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-6 text-center">
            <Construction className="w-12 h-12 text-amber-600 dark:text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">🚧 준비 중입니다</h3>
            <p className="text-muted-foreground">
              조회수, 구독자 수, 참여율 등을 기반으로 예상 수익을 계산할 수 있는 도구를 준비하고 있습니다.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">곧 제공될 기능:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                CPM 기반 광고 수익 계산
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                YouTube Shorts 펀드 예상 수익
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                채널 성장률 예측
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                수익 최적화 팁 제공
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}