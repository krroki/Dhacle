import { ArrowLeft, Construction, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RevenueProofGuidePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-6">
        <Link href="/revenue-proof">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            수익 인증으로 돌아가기
          </Button>
        </Link>
      </div>

      <Card className="border-2 border-dashed">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <FileCheck className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-2">수익 인증 가이드</CardTitle>
          <p className="text-muted-foreground text-lg">수익 인증 방법 안내</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-6 text-center">
            <Construction className="w-12 h-12 text-amber-600 dark:text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">🚧 준비 중입니다</h3>
            <p className="text-muted-foreground">
              수익 인증 가이드를 준비하고 있습니다. 간편하고 안전한 인증 방법을 제공할 예정입니다.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">제공될 가이드 내용:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                수익 인증 절차 안내
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                필요한 서류 및 자료
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                스크린샷 촬영 방법
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                개인정보 보호 방법
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                인증 후 혜택 안내
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                자주 묻는 질문
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
