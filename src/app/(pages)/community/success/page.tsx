import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function CommunitySuccessPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/community">
            <span className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              커뮤니티로 돌아가기
            </span>
          </Link>
        </Button>
      </div>

      <Card className="border-2 border-dashed">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-2">성공 사례</CardTitle>
          <p className="text-muted-foreground text-lg">
            크리에이터들의 성공 스토리
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-6 text-center">
            <Construction className="w-12 h-12 text-amber-600 dark:text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">🚧 준비 중입니다</h3>
            <p className="text-muted-foreground">
              YouTube Shorts 크리에이터들의 성공 사례를 공유하는 공간을 준비하고 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}