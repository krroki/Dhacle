'use client';

import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  Key,
  Loader2,
  RefreshCw,
  Settings,
  Shield,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiGet } from '@/lib/api-client';

interface EnvironmentVariable {
  name: string;
  category: 'client' | 'server' | 'security';
  required: boolean;
  status: 'configured' | 'missing' | 'invalid';
  description: string;
  icon: React.ReactNode;
}

interface EnvironmentCheckerProps {
  onComplete?: () => void;
  autoCheck?: boolean;
}

export function EnvironmentChecker({ onComplete, autoCheck = true }: EnvironmentCheckerProps) {
  const [is_checking, set_is_checking] = useState(false);
  const [check_result, set_check_result] = useState<{
    configured: boolean;
    missingVars: string[];
    warnings: string[];
    progress: number;
  } | null>(null);

  const [variables, set_variables] = useState<EnvironmentVariable[]>([
    {
      name: 'NEXT_PUBLIC_SITE_URL',
      category: 'client',
      required: true,
      status: 'missing',
      description: 'OAuth 리디렉션 및 API 통신에 필요한 사이트 URL',
      icon: <Globe className="h-4 w-4" />,
    },
    {
      name: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
      category: 'client',
      required: true,
      status: 'missing',
      description: 'Google OAuth 2.0 클라이언트 ID',
      icon: <Key className="h-4 w-4" />,
    },
    {
      name: 'GOOGLE_CLIENT_SECRET',
      category: 'server',
      required: true,
      status: 'missing',
      description: 'Google OAuth 2.0 클라이언트 시크릿',
      icon: <Shield className="h-4 w-4" />,
    },
    {
      name: 'YOUTUBE_API_KEY',
      category: 'server',
      required: true,
      status: 'missing',
      description: 'YouTube Data API v3 액세스 키',
      icon: <Key className="h-4 w-4" />,
    },
    {
      name: 'ENCRYPTION_KEY',
      category: 'security',
      required: true,
      status: 'missing',
      description: '토큰 암호화를 위한 32자 이상의 키',
      icon: <Shield className="h-4 w-4" />,
    },
  ]);

  const check_environment = useCallback(async () => {
    set_is_checking(true);

    try {
      const data = await apiGet<{
        missingVars?: string[];
        hasAllRequired: boolean;
        error?: string;
      }>('/api/youtube/auth/check-config');

      // 변수 상태 업데이트
      const updated_vars = variables.map((v) => ({
        ...v,
        status: (data.missingVars?.includes(v.name) ? 'missing' : 'configured') as
          | 'missing'
          | 'configured',
      }));

      set_variables(updated_vars);

      const configured_count = updated_vars.filter((v) => v.status === 'configured').length;
      const progress = (configured_count / updated_vars.length) * 100;

      set_check_result({
        configured: data.hasAllRequired,
        missingVars: data.missingVars || [],
        warnings: [],
        progress,
      });

      if (data.hasAllRequired && onComplete) {
        onComplete();
      }
    } catch (_error) {
      set_check_result({
        configured: false,
        missingVars: variables.map((v) => v.name),
        warnings: ['환경 변수 확인 중 오류가 발생했습니다.'],
        progress: 0,
      });
    } finally {
      set_is_checking(false);
    }
  }, [variables, onComplete]);

  useEffect(() => {
    if (autoCheck) {
      check_environment();
    }
  }, [autoCheck, check_environment]);

  const get_category_color = (category: string) => {
    switch (category) {
      case 'client':
        return 'default';
      case 'server':
        return 'secondary';
      case 'security':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const get_status_icon = (status: string) => {
    switch (status) {
      case 'configured':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'invalid':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>환경 변수 상태</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={check_environment} disabled={is_checking}>
            {is_checking ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                확인 중...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3" />
                다시 확인
              </>
            )}
          </Button>
        </div>
        <CardDescription>YouTube Lens 실행에 필요한 환경 변수 설정 상태입니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {check_result && (
          <>
            {/* 진행률 표시 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>설정 진행률</span>
                <span className="font-medium">{Math.round(check_result.progress)}%</span>
              </div>
              <Progress value={check_result.progress} className="h-2" />
            </div>

            {/* 상태 알림 */}
            {check_result.configured ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>설정 완료</AlertTitle>
                <AlertDescription>
                  모든 환경 변수가 올바르게 설정되었습니다. YouTube Lens를 사용할 준비가 되었습니다.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>설정 필요</AlertTitle>
                <AlertDescription>
                  {check_result.missingVars.length}개의 환경 변수가 설정되지 않았습니다.
                </AlertDescription>
              </Alert>
            )}

            {/* 경고 메시지 */}
            {check_result.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>주의사항</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {check_result.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* 변수 목록 */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">환경 변수 상태</h4>
          <div className="space-y-2">
            {variables.map((variable) => (
              <div
                key={variable.name}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {variable.icon}
                    {get_status_icon(variable.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono">{variable.name}</code>
                      <Badge variant={get_category_color(variable.category)}>
                        {variable.category}
                      </Badge>
                      {variable.required && <Badge variant="outline">필수</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{variable.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 도움말 */}
        {check_result && !check_result.configured && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              환경 변수 설정 방법은 상단의 설정 가이드를 참고하세요.
              <br />
              <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code> 파일을 수정한
              후 개발 서버를 재시작해야 합니다.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
