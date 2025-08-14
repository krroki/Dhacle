import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction, Wrench, Calculator, Palette, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>

      <Card className="border-2 border-dashed">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Wrench className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-2">크리에이터 도구</CardTitle>
          <p className="text-muted-foreground text-lg">
            YouTube Shorts 제작을 위한 다양한 도구들
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 사용 가능한 도구 */}
          <div>
            <h3 className="font-semibold mb-4">🎉 사용 가능한 도구</h3>
            <div className="grid gap-4">
              <Link href="/tools/youtube-lens">
                <div className="flex gap-3 p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                  <Eye className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">디하클렌즈</h4>
                    <p className="text-sm text-muted-foreground">
                      YouTube Shorts 영상 탐색 및 분석 도구
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* 준비 중인 도구들 */}
          <div>
            <h3 className="font-semibold mb-4">🚧 준비 중인 도구들</h3>
            <div className="grid gap-4">
              <div className="flex gap-3 p-4 bg-muted/50 rounded-lg opacity-60">
                <Calculator className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">수익 계산기</h4>
                  <p className="text-sm text-muted-foreground">
                    예상 수익을 계산해보세요
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 bg-muted/50 rounded-lg opacity-60">
                <Palette className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">썸네일 메이커</h4>
                  <p className="text-sm text-muted-foreground">
                    매력적인 썸네일을 쉽게 제작하세요
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 준비 중 메시지 */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-6 text-center">
            <Construction className="w-12 h-12 text-amber-600 dark:text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">더 많은 도구 준비 중</h3>
            <p className="text-muted-foreground">
              크리에이터님들의 제작 활동을 돕는 다양한 도구들을 준비하고 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}