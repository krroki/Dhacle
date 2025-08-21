import { ArrowLeft, Construction, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
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
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-2">개인정보처리방침</CardTitle>
          <p className="text-muted-foreground text-lg">디하클 개인정보 보호 정책</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-6 text-center">
            <Construction className="w-12 h-12 text-amber-600 dark:text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">🚧 준비 중입니다</h3>
            <p className="text-muted-foreground">
              개인정보처리방침을 준비하고 있습니다. 고객님의 개인정보 보호를 최우선으로 합니다.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">포함될 내용:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                수집하는 개인정보 항목
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                개인정보 수집 및 이용 목적
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                개인정보 보유 및 이용 기간
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                개인정보 제3자 제공
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                이용자의 권리와 행사 방법
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
