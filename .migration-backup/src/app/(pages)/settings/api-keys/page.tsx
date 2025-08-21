'use client';

import { ExternalLink, Eye, EyeOff, Key, RefreshCw, ShieldCheck, Trash2, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiDelete, apiGet, apiPost } from '@/lib/api-client';
import { useAuth } from '@/lib/auth/AuthContext';

interface ApiKeyData {
  id: string;
  serviceName: string;
  apiKeyMasked: string;
  created_at: string;
  updated_at: string;
  lastUsedAt: string | null;
  usageCount: number;
  usageToday: number;
  usageDate: string;
  is_active: boolean;
  isValid: boolean;
  validationError: string | null;
}

export default function ApiKeysPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [currentKey, setCurrentKey] = useState<ApiKeyData | null>(null);
  const [fetchingKey, setFetchingKey] = useState(true);

  const fetchCurrentKey = useCallback(async () => {
    try {
      setFetchingKey(true);
      const data = await apiGet<{ success: boolean; data?: ApiKeyData }>(
        '/api/user/api-keys?service=youtube'
      );

      if (data.success && data.data) {
        setCurrentKey(data.data);
      }
    } catch (_error) {
    } finally {
      setFetchingKey(false);
    }
  }, []);

  // 현재 API Key 조회
  useEffect(() => {
    if (user) {
      fetchCurrentKey();
    }
  }, [user, fetchCurrentKey]);

  // API Key 유효성 검증
  const handleValidate = async () => {
    if (!apiKey) {
      toast.error('API Key를 입력해주세요');
      return;
    }

    setValidating(true);
    try {
      const data = await apiPost<{ success: boolean; error?: string }>(
        '/api/youtube/validate-key',
        { apiKey }
      );

      if (data.success) {
        toast.success('유효한 API Key입니다!');
        return true;
      }
      toast.error(data.error || '유효하지 않은 API Key입니다');
      return false;
    } catch (_error) {
      toast.error('검증 중 오류가 발생했습니다');
      return false;
    } finally {
      setValidating(false);
    }
  };

  // API Key 저장
  const handleSave = async () => {
    setLoading(true);

    try {
      // 먼저 유효성 검증
      const isValid = await handleValidate();
      if (!isValid) {
        setLoading(false);
        return;
      }

      // API Key 저장
      const data = await apiPost<{ success: boolean; error?: string }>('/api/user/api-keys', {
        apiKey,
        serviceName: 'youtube',
      });

      if (data.success) {
        toast.success('API Key가 저장되었습니다');
        setApiKey('');
        await fetchCurrentKey();

        // YouTube Lens로 이동할지 확인
        const shouldRedirect = confirm(
          'API Key가 저장되었습니다. YouTube Lens로 이동하시겠습니까?'
        );
        if (shouldRedirect) {
          router.push('/tools/youtube-lens');
        }
      } else {
        toast.error(data.error || '저장 실패');
      }
    } catch (_error) {
      toast.error('저장 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // API Key 삭제
  const handleDelete = async () => {
    if (!confirm('정말로 API Key를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const data = await apiDelete<{ success: boolean; error?: string }>(
        '/api/user/api-keys?service=youtube'
      );

      if (data.success) {
        toast.success('API Key가 삭제되었습니다');
        setCurrentKey(null);
      } else {
        toast.error(data.error || '삭제 실패');
      }
    } catch (_error) {
      toast.error('삭제 중 오류가 발생했습니다');
    }
  };

  // 인증 체크
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/settings/api-keys');
    }
  }, [user, authLoading, router]);

  if (authLoading || fetchingKey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Key 설정</h1>
        <p className="text-muted-foreground">
          외부 서비스 API Key를 관리하고 개인 할당량을 사용하세요
        </p>
      </div>

      <Tabs defaultValue="youtube" className="space-y-4">
        <TabsList>
          <TabsTrigger value="youtube">YouTube Data API</TabsTrigger>
          <TabsTrigger value="other" disabled={true}>
            기타 서비스 (준비 중)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="youtube" className="space-y-4">
          {/* 현재 API Key 상태 */}
          {currentKey && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>현재 등록된 API Key</CardTitle>
                  <Badge variant={currentKey.isValid ? 'default' : 'destructive'}>
                    {currentKey.isValid ? '정상' : '오류'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">마스킹된 Key</Label>
                    <p className="font-mono text-sm">{currentKey.apiKeyMasked}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">등록일</Label>
                    <p className="text-sm">
                      {new Date(currentKey.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">오늘 사용량</Label>
                    <p className="text-sm">{currentKey.usageToday} / 10,000 units</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">총 사용 횟수</Label>
                    <p className="text-sm">{currentKey.usageCount}회</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fetchCurrentKey()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    새로고침
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* API Key 등록 폼 */}
          <Card>
            <CardHeader>
              <CardTitle>{currentKey ? 'API Key 변경' : '새 API Key 등록'}</CardTitle>
              <CardDescription>
                YouTube Data API v3 Key를 등록하여 개인 할당량을 사용하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 안내 메시지 */}
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertTitle>개인 할당량 사용의 이점</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>일일 10,000 units의 독립적인 할당량</li>
                    <li>다른 사용자와 할당량 공유 없음</li>
                    <li>무료로 사용 가능 (Google Cloud 무료 티어)</li>
                    <li>안정적인 서비스 이용 보장</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* API Key 입력 */}
              <div className="space-y-2">
                <Label htmlFor="apiKey">YouTube API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="AIzaSy..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleValidate}
                    disabled={!apiKey || validating}
                  >
                    {validating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        검증 중...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        검증
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  YouTube Data API v3 Key를 입력하세요. Key는 암호화되어 안전하게 저장됩니다.
                </p>
              </div>

              {/* 저장 버튼 */}
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={!apiKey || loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      {currentKey ? 'API Key 업데이트' : 'API Key 저장'}
                    </>
                  )}
                </Button>
                <Button variant="outline" asChild={true}>
                  <Link href="/docs/get-api-key">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    발급 방법 보기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 도움말 */}
          <Card>
            <CardHeader>
              <CardTitle>자주 묻는 질문</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">API Key는 어떻게 발급받나요?</h4>
                <p className="text-sm text-muted-foreground">
                  Google Cloud Console에서 무료로 발급받을 수 있습니다. 자세한 방법은{' '}
                  <Link href="/docs/get-api-key" className="text-primary hover:underline">
                    발급 가이드
                  </Link>
                  를 참고하세요.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">API Key는 안전하게 보관되나요?</h4>
                <p className="text-sm text-muted-foreground">
                  모든 API Key는 AES-256 암호화를 사용하여 안전하게 저장되며, 다른 사용자는 접근할
                  수 없습니다.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">할당량은 얼마나 사용할 수 있나요?</h4>
                <p className="text-sm text-muted-foreground">
                  각 API Key당 일일 10,000 units를 사용할 수 있으며, 매일 자정(한국 시간 기준)에
                  초기화됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
