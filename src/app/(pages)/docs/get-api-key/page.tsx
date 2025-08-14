import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Copy,
  Clock,
  DollarSign,
  Shield,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function GetApiKeyPage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">YouTube Data API Key 발급 가이드</h1>
        <p className="text-muted-foreground">
          Google Cloud Console에서 무료로 YouTube API Key를 발급받는 방법을 안내합니다.
        </p>
      </div>

      {/* 소요 시간 및 비용 안내 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <Clock className="h-5 w-5 text-primary mb-2" />
            <CardTitle className="text-lg">소요 시간</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">5분</p>
            <p className="text-sm text-muted-foreground">간단한 설정</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <DollarSign className="h-5 w-5 text-green-600 mb-2" />
            <CardTitle className="text-lg">비용</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">무료</p>
            <p className="text-sm text-muted-foreground">일일 10,000 units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Shield className="h-5 w-5 text-blue-600 mb-2" />
            <CardTitle className="text-lg">보안</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">안전</p>
            <p className="text-sm text-muted-foreground">AES-256 암호화</p>
          </CardContent>
        </Card>
      </div>

      {/* 필요 사항 */}
      <Alert className="mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>시작하기 전에 필요한 것:</strong>
          <ul className="list-disc list-inside mt-2">
            <li>Google 계정 (Gmail 계정)</li>
            <li>신용카드 (선택사항, 무료 사용 시 불필요)</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* 단계별 가이드 */}
      <div className="space-y-6">
        {/* Step 1 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full">1</Badge>
              <CardTitle>Google Cloud Console 접속</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Google Cloud Console에 접속하여 프로젝트를 생성합니다.</p>
            
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium mb-2">1-1. Console 접속</p>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://console.cloud.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  Google Cloud Console 열기
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">1-2. 새 프로젝트 만들기</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>상단의 프로젝트 선택 드롭다운 클릭</li>
                <li>"새 프로젝트" 클릭</li>
                <li>프로젝트 이름 입력 (예: "dhacle-youtube")</li>
                <li>"만들기" 클릭</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full">2</Badge>
              <CardTitle>YouTube Data API v3 활성화</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>YouTube Data API를 검색하여 활성화합니다.</p>
            
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium mb-2">2-1. API 라이브러리 접속</p>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  YouTube Data API v3 페이지 열기
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">2-2. API 활성화</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>"사용" 버튼 클릭</li>
                <li>잠시 대기 (10-30초)</li>
                <li>활성화 완료 확인</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full">3</Badge>
              <CardTitle>API Key 생성</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>사용자 인증 정보를 만들어 API Key를 발급받습니다.</p>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">3-1. 사용자 인증 정보 만들기</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>좌측 메뉴에서 "사용자 인증 정보" 클릭</li>
                <li>상단의 "+ 사용자 인증 정보 만들기" 클릭</li>
                <li>"API 키" 선택</li>
              </ul>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">3-2. API Key 복사</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>생성된 API Key가 팝업으로 표시됨</li>
                <li>"복사" 버튼을 클릭하여 Key 복사</li>
                <li>안전한 곳에 임시 저장</li>
              </ul>
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  API Key는 한 번만 표시됩니다. 반드시 복사해두세요!
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Step 4 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full">4</Badge>
              <CardTitle>API Key 제한 설정 (권장)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>보안을 위해 API Key 사용을 제한합니다.</p>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">4-1. API 제한</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>생성된 API Key 이름 클릭</li>
                <li>"API 제한" 섹션에서 "키 제한"</li>
                <li>"YouTube Data API v3"만 선택</li>
                <li>"저장" 클릭</li>
              </ul>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">4-2. 애플리케이션 제한 (선택사항)</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>웹사이트에서만 사용: "HTTP 리퍼러" 선택</li>
                <li>dhacle.com/* 입력</li>
                <li>"저장" 클릭</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Step 5 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full">5</Badge>
              <CardTitle>디하클에 API Key 등록</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>발급받은 API Key를 디하클에 등록합니다.</p>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">5-1. 설정 페이지로 이동</p>
              <Button variant="default" asChild>
                <Link href="/settings/api-keys">
                  API Key 설정 페이지로 이동
                </Link>
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">5-2. API Key 입력 및 저장</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>복사한 API Key 붙여넣기</li>
                <li>"검증" 버튼으로 유효성 확인</li>
                <li>"저장" 버튼 클릭</li>
              </ul>
            </div>

            <Alert className="mt-4" variant="default">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>완료!</strong> 이제 YouTube Lens를 사용할 수 있습니다.
                일일 10,000 units의 개인 할당량으로 자유롭게 검색하세요.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>자주 묻는 질문</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Q: 정말 무료인가요?</h4>
            <p className="text-sm text-muted-foreground">
              네, YouTube Data API는 일일 10,000 units까지 완전 무료입니다. 
              신용카드 등록도 필요 없습니다.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Q: 10,000 units로 얼마나 사용할 수 있나요?</h4>
            <p className="text-sm text-muted-foreground">
              검색 1회당 100 units를 사용하므로, 하루에 약 100회 검색이 가능합니다.
              일반적인 사용에는 충분한 양입니다.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Q: API Key가 유출되면 어떻게 하나요?</h4>
            <p className="text-sm text-muted-foreground">
              Google Cloud Console에서 즉시 Key를 삭제하고 새로 발급받으세요.
              디하클은 API Key를 암호화하여 안전하게 보관합니다.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Q: 여러 개의 API Key를 사용할 수 있나요?</h4>
            <p className="text-sm text-muted-foreground">
              현재는 계정당 하나의 YouTube API Key만 등록 가능합니다.
              필요시 기존 Key를 삭제하고 새 Key를 등록할 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Button size="lg" asChild>
          <Link href="/settings/api-keys">
            <Zap className="mr-2 h-5 w-5" />
            API Key 등록하러 가기
          </Link>
        </Button>
      </div>
    </div>
  );
}