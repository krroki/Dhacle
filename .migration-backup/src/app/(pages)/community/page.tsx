import { ArrowLeft, BookOpen, Construction, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>

      {/* 메인 카드 */}
      <Card className="border-2 border-dashed">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-2">커뮤니티</CardTitle>
          <p className="text-muted-foreground text-lg">디하클 커뮤니티가 곧 오픈됩니다!</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 준비 중 메시지 */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-6 text-center">
            <Construction className="w-12 h-12 text-amber-600 dark:text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">🚧 준비 중입니다</h3>
            <p className="text-muted-foreground">
              더 나은 커뮤니티 서비스를 제공하기 위해 열심히 준비하고 있습니다.
              <br />
              조금만 기다려주세요!
            </p>
          </div>

          {/* 예정된 기능들 */}
          <div>
            <h3 className="font-semibold mb-4">곧 만나실 수 있는 기능들:</h3>
            <div className="grid gap-4">
              <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">자유 게시판</h4>
                  <p className="text-sm text-muted-foreground">
                    자유롭게 소통하고 정보를 공유하는 공간
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Q&A</h4>
                  <p className="text-sm text-muted-foreground">
                    YouTube Shorts 제작에 대한 질문과 답변
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
                <Users className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">스터디 모집</h4>
                  <p className="text-sm text-muted-foreground">함께 성장할 스터디 멤버 찾기</p>
                </div>
              </div>
            </div>
          </div>

          {/* 알림 신청 */}
          <div className="bg-primary/5 rounded-lg p-6 text-center">
            <p className="mb-4">커뮤니티 오픈 알림을 받고 싶으신가요?</p>
            <Button disabled={true}>오픈 알림 신청하기 (준비중)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
