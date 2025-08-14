import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Accessibility, Construction } from 'lucide-react';
import Link from 'next/link';

export default function AccessibilityPage() {
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
            <Accessibility className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-2">접근성 안내</CardTitle>
          <p className="text-muted-foreground text-lg">
            모두를 위한 디하클 서비스
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-6 text-center">
            <Construction className="w-12 h-12 text-amber-600 dark:text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">🚧 준비 중입니다</h3>
            <p className="text-muted-foreground">
              모든 사용자가 편리하게 이용할 수 있도록 접근성 안내 페이지를 준비하고 있습니다.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">포함될 내용:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                스크린 리더 지원
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                키보드 탐색 가이드
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                색상 대비 설정
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                폰트 크기 조절
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                자막 및 대체 텍스트
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}