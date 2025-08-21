import { ArrowLeft, Construction, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
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
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-2">이용약관</CardTitle>
          <p className="text-muted-foreground text-lg">디하클 서비스 이용약관</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-6 text-center">
            <Construction className="w-12 h-12 text-amber-600 dark:text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">🚧 준비 중입니다</h3>
            <p className="text-muted-foreground">
              디하클 서비스 이용약관을 준비하고 있습니다. 곧 공개될 예정입니다.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">포함될 내용:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                서비스 이용 조건
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                회원의 권리와 의무
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                콘텐츠 이용 규정
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                결제 및 환불 정책
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                지적재산권 보호
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
