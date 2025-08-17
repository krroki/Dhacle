'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { apiPost, ApiError } from '@/lib/api-client';
import { 
  KeyRound, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ApiKeySetupProps {
  onSuccess?: () => void;
}

export default function ApiKeySetup({ onSuccess }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('API 키를 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // API 키 검증 및 저장
      await apiPost('/api/user/api-keys', {
        apiKey: apiKey.trim(),
        serviceName: 'youtube'
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('인증이 필요합니다. 로그인 후 다시 시도해주세요.');
        } else {
          setError(err.message || 'API 키 저장 실패');
        }
      } else {
        setError(err instanceof Error ? err.message : 'API 키 저장 중 오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">API 키 설정 완료!</h3>
            <p className="text-muted-foreground text-center">
              YouTube Lens 기능을 사용할 준비가 완료되었습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="w-5 h-5" />
          YouTube API 키 설정
        </CardTitle>
        <CardDescription>
          YouTube Lens 기능을 사용하려면 먼저 YouTube Data API 키가 필요합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 안내 메시지 */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            YouTube Data API v3 키가 필요합니다. 아래 단계를 따라 무료로 발급받을 수 있습니다.
          </AlertDescription>
        </Alert>

        {/* API 키 발급 가이드 */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">API 키 발급 방법:</h4>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-medium">1.</span>
              <div>
                <a 
                  href="https://console.cloud.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Google Cloud Console
                  <ExternalLink className="w-3 h-3" />
                </a>
                에 접속
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium">2.</span>
              <span>새 프로젝트 생성 또는 기존 프로젝트 선택</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium">3.</span>
              <span>{'"API 및 서비스"'} → {'"라이브러리"'}에서 YouTube Data API v3 활성화</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium">4.</span>
              <span>{'"사용자 인증 정보"'} → {'"사용자 인증 정보 만들기"'} → {'"API 키"'} 선택</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium">5.</span>
              <span>생성된 API 키를 복사하여 아래에 입력</span>
            </li>
          </ol>
        </div>

        {/* API 키 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">YouTube API 키</Label>
            <Input
              id="apiKey"
              type="text"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={loading}
              className="font-mono"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                API 키 검증 중...
              </>
            ) : (
              'API 키 저장'
            )}
          </Button>
        </form>

        {/* 보안 안내 */}
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground">
            <strong>보안 안내:</strong> API 키는 AES-256 암호화되어 안전하게 저장됩니다. 
            키는 오직 YouTube API 호출에만 사용되며, 다른 용도로 사용되지 않습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}