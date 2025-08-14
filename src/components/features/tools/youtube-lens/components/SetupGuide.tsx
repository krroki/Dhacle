'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  FileText,
  Key,
  Settings,
  Terminal
} from 'lucide-react';

interface SetupGuideProps {
  missingVars?: string[];
}

export function SetupGuide({ missingVars = [] }: SetupGuideProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const envTemplate = `# YouTube Lens 설정
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
YOUTUBE_API_KEY=AIzaSy-your-api-key
ENCRYPTION_KEY=`;

  const encryptionKeyCommand = `require('crypto').randomBytes(32).toString('hex')`;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          YouTube Lens 설정 가이드
        </CardTitle>
        <CardDescription>
          Google OAuth 2.0과 YouTube API를 설정하여 YouTube Lens를 활성화하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {missingVars.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>환경 변수 누락</AlertTitle>
            <AlertDescription>
              다음 환경 변수가 설정되지 않았습니다:
              <div className="mt-2 flex flex-wrap gap-2">
                {missingVars.map((varName) => (
                  <Badge key={varName} variant="destructive">
                    {varName}
                  </Badge>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="step1" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="step1">1. Google 설정</TabsTrigger>
            <TabsTrigger value="step2">2. 환경 변수</TabsTrigger>
            <TabsTrigger value="step3">3. 데이터베이스</TabsTrigger>
            <TabsTrigger value="step4">4. 테스트</TabsTrigger>
          </TabsList>

          <TabsContent value="step1" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Google Cloud Console 설정</h3>
              
              <div className="space-y-2">
                <h4 className="font-medium">1. 프로젝트 생성</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Google Cloud Console 접속</li>
                  <li>새 프로젝트 생성 또는 기존 프로젝트 선택</li>
                </ol>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">
                    Console 열기 <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">2. API 활성화</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>YouTube Data API v3</li>
                  <li>Google+ API (사용자 정보용)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">3. OAuth 2.0 클라이언트 ID 생성</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>애플리케이션 유형: 웹 애플리케이션</li>
                  <li>승인된 JavaScript 원본: <code className="text-xs bg-muted px-1 py-0.5 rounded">http://localhost:3000</code></li>
                  <li>승인된 리디렉션 URI: <code className="text-xs bg-muted px-1 py-0.5 rounded">http://localhost:3000/api/youtube/auth/callback</code></li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">4. API 키 생성</h4>
                <p className="text-sm text-muted-foreground ml-4">
                  "사용자 인증 정보" → "API 키 만들기"
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="step2" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">환경 변수 설정</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">1. .env.local 파일 생성</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(envTemplate, 0)}
                  >
                    {copiedIndex === 0 ? (
                      <>
                        <CheckCircle className="mr-2 h-3 w-3" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-3 w-3" />
                        템플릿 복사
                      </>
                    )}
                  </Button>
                </div>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                  {envTemplate}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">2. 암호화 키 생성</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(encryptionKeyCommand, 1)}
                  >
                    {copiedIndex === 1 ? (
                      <>
                        <CheckCircle className="mr-2 h-3 w-3" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-3 w-3" />
                        명령어 복사
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Terminal className="h-3 w-3" />
                    Node.js 콘솔에서 실행:
                  </div>
                  <code className="text-xs">{encryptionKeyCommand}</code>
                </div>
              </div>

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>참고</AlertTitle>
                <AlertDescription>
                  자세한 설정 방법은 <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local.example</code> 파일을 참조하세요.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="step3" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">데이터베이스 설정</h3>
              
              <div className="space-y-2">
                <h4 className="font-medium">Supabase SQL Editor에서 실행:</h4>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
{`-- 테이블 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_api_keys', 'youtube_favorites');

-- 마이그레이션 실행 (필요시)
-- src/lib/supabase/migrations/009_youtube_lens_fix.sql 내용 실행`}
                </pre>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>중요</AlertTitle>
                <AlertDescription>
                  데이터베이스 마이그레이션이 완료되었는지 확인하세요.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="step4" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">설정 테스트</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">1. 개발 서버 재시작</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-xs">npm run dev</code>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">2. OAuth 플로우 테스트</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>이 페이지 새로고침</li>
                    <li>"Google로 로그인" 버튼 클릭</li>
                    <li>Google 계정 선택 및 권한 승인</li>
                    <li>성공 시 YouTube Lens 페이지로 리디렉션</li>
                  </ol>
                </div>

                <Alert variant="default">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>준비 완료!</AlertTitle>
                  <AlertDescription>
                    모든 설정이 완료되면 페이지를 새로고침하여 YouTube Lens를 사용하세요.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}