'use client';

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Info,
  Key,
  Shield,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function GetApiKeyPage() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    toast.success('클립보드에 복사되었습니다');
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">YouTube API Key 발급 가이드</h1>
        <p className="text-muted-foreground">
          Google Cloud Console에서 YouTube Data API v3 Key를 무료로 발급받는 방법을 안내합니다.
        </p>
      </div>

      {/* 예상 시간 및 요구사항 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <Clock className="h-5 w-5 text-primary mb-2" />
            <CardTitle className="text-base">소요 시간</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">5분</p>
            <p className="text-sm text-muted-foreground">첫 발급 기준</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Zap className="h-5 w-5 text-primary mb-2" />
            <CardTitle className="text-base">일일 할당량</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">10,000</p>
            <p className="text-sm text-muted-foreground">units/day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Shield className="h-5 w-5 text-primary mb-2" />
            <CardTitle className="text-base">비용</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">무료</p>
            <p className="text-sm text-muted-foreground">기본 할당량</p>
          </CardContent>
        </Card>
      </div>

      {/* 필수 요구사항 */}
      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertTitle>시작하기 전에</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Google 계정이 필요합니다</li>
            <li>Google Cloud Console 첫 사용시 프로젝트 생성이 필요합니다 (무료)</li>
            <li>신용카드 등록은 필요하지 않습니다</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* 단계별 가이드 */}
      <Tabs defaultValue="step1" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="step1">1단계</TabsTrigger>
          <TabsTrigger value="step2">2단계</TabsTrigger>
          <TabsTrigger value="step3">3단계</TabsTrigger>
          <TabsTrigger value="step4">4단계</TabsTrigger>
          <TabsTrigger value="step5">5단계</TabsTrigger>
        </TabsList>

        {/* Step 1: Google Cloud Console 접속 */}
        <TabsContent value="step1">
          <Card>
            <CardHeader>
              <CardTitle>1단계: Google Cloud Console 접속</CardTitle>
              <CardDescription>Google Cloud Platform 콘솔에 로그인합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">아래 링크를 클릭하여 Google Cloud Console에 접속하세요:</p>
                <Button variant="outline" asChild={true}>
                  <a
                    href="https://console.cloud.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Google Cloud Console 열기
                  </a>
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  처음 사용하시는 경우 Google 계정으로 로그인이 필요합니다.
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">로그인 완료 후 2단계로 진행하세요</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: 프로젝트 생성 */}
        <TabsContent value="step2">
          <Card>
            <CardHeader>
              <CardTitle>2단계: 프로젝트 생성 또는 선택</CardTitle>
              <CardDescription>API를 사용할 프로젝트를 생성하거나 선택합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">새 프로젝트 생성하기:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>상단 프로젝트 선택 드롭다운 클릭</li>
                  <li>&quot;새 프로젝트&quot; 클릭</li>
                  <li>프로젝트 이름 입력 (예: &quot;YouTube-Lens&quot;)</li>
                  <li>&quot;만들기&quot; 클릭</li>
                </ol>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  기존 프로젝트가 있다면 선택하여 사용하셔도 됩니다.
                </AlertDescription>
              </Alert>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-mono">프로젝트 이름 예시: dhacle-youtube</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard('dhacle-youtube', 2)}
                >
                  {copiedStep === 2 ? (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  복사
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: YouTube Data API 활성화 */}
        <TabsContent value="step3">
          <Card>
            <CardHeader>
              <CardTitle>3단계: YouTube Data API v3 활성화</CardTitle>
              <CardDescription>
                프로젝트에서 YouTube API를 사용할 수 있도록 활성화합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">API 활성화 방법:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>좌측 메뉴에서 &quot;API 및 서비스&quot; → &quot;라이브러리&quot; 클릭</li>
                  <li>검색창에 &quot;YouTube Data API v3&quot; 입력</li>
                  <li>검색 결과에서 &quot;YouTube Data API v3&quot; 클릭</li>
                  <li>&quot;사용&quot; 버튼 클릭</li>
                </ol>
              </div>

              <Button variant="outline" asChild={true}>
                <a
                  href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  YouTube Data API 페이지로 바로가기
                </a>
              </Button>

              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  &quot;사용&quot; 버튼을 클릭하면 API가 활성화됩니다.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: API Key 생성 */}
        <TabsContent value="step4">
          <Card>
            <CardHeader>
              <CardTitle>4단계: API Key 생성</CardTitle>
              <CardDescription>YouTube API를 사용하기 위한 API Key를 생성합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">API Key 생성 방법:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>&quot;API 및 서비스&quot; → &quot;사용자 인증 정보&quot; 클릭</li>
                  <li>상단의 &quot;+ 사용자 인증 정보 만들기&quot; 클릭</li>
                  <li>&quot;API 키&quot; 선택</li>
                  <li>API 키가 생성되면 복사하여 안전한 곳에 저장</li>
                </ol>
              </div>

              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800 dark:text-yellow-200">중요!</AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  생성된 API Key는 한 번만 표시됩니다. 반드시 복사하여 저장해주세요.
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">API Key 형식:</p>
                <code className="text-xs">AIzaSy...</code> (39자)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 5: API Key 제한 설정 (선택) */}
        <TabsContent value="step5">
          <Card>
            <CardHeader>
              <CardTitle>5단계: API Key 제한 설정 (선택사항)</CardTitle>
              <CardDescription>보안을 위해 API Key 사용을 제한할 수 있습니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">권장 제한 설정:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>생성된 API Key 옆 편집 버튼 클릭</li>
                  <li>&quot;애플리케이션 제한사항&quot;에서 &quot;HTTP 리퍼러&quot; 선택</li>
                  <li>웹사이트 도메인 추가 (예: https://dhacle.com/*)</li>
                  <li>&quot;API 제한사항&quot;에서 &quot;키 제한&quot; 선택</li>
                  <li>&quot;YouTube Data API v3&quot;만 선택</li>
                  <li>&quot;저장&quot; 클릭</li>
                </ol>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  제한 설정은 선택사항이지만, 보안을 위해 권장됩니다. 개발 중에는 제한 없이
                  사용하고, 배포 시 설정하셔도 됩니다.
                </AlertDescription>
              </Alert>

              <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">완료!</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  API Key 발급이 완료되었습니다. 이제 디하클에서 사용할 수 있습니다.
                </p>
                <Button asChild={true}>
                  <Link href="/settings/api-keys">
                    <Key className="mr-2 h-4 w-4" />
                    API Key 등록하러 가기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* FAQ 섹션 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>자주 묻는 질문</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">API Key는 안전한가요?</h4>
            <p className="text-sm text-muted-foreground">
              네, 디하클에서는 모든 API Key를 AES-256 암호화를 통해 안전하게 저장합니다. 다른
              사용자는 절대 접근할 수 없습니다.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-1">비용이 발생하나요?</h4>
            <p className="text-sm text-muted-foreground">
              아니요, YouTube Data API v3는 일일 10,000 units까지 무료로 사용할 수 있습니다.
              일반적인 사용에는 충분한 양입니다.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-1">할당량이 초과되면 어떻게 되나요?</h4>
            <p className="text-sm text-muted-foreground">
              할당량이 초과되면 다음날 자정(태평양 시간 기준)에 자동으로 초기화됩니다. 추가 할당량이
              필요한 경우 Google에 요청할 수 있습니다.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-1">여러 개의 API Key를 사용할 수 있나요?</h4>
            <p className="text-sm text-muted-foreground">
              현재는 계정당 하나의 YouTube API Key만 등록할 수 있습니다. 기존 Key를 삭제하고 새로운
              Key를 등록할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 도움말 */}
      <Alert className="mt-8">
        <Info className="h-4 w-4" />
        <AlertTitle>도움이 필요하신가요?</AlertTitle>
        <AlertDescription>
          API Key 발급 과정에서 문제가 발생했다면 고객 지원팀에 문의해주세요.
          <br />
          이메일: support@dhacle.com
        </AlertDescription>
      </Alert>
    </div>
  );
}
