'use client';

import { AlertTriangle, Bug, CheckCircle, Copy, Home, RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { env } from '@/env';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: 'config' | 'network' | 'auth' | 'unknown';
  copied: boolean;
}

export class YouTubeLensErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 에러 타입 분류
    let error_type: State['errorType'] = 'unknown';

    if (error.message.includes('환경 변수') || error.message.includes('NEXT_PUBLIC')) {
      error_type = 'config';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      error_type = 'network';
    } else if (error.message.includes('auth') || error.message.includes('OAuth')) {
      error_type = 'auth';
    }

    return {
      hasError: true,
      error,
      errorType: error_type,
    };
  }

  componentDidCatch(_error: Error, error_info: ErrorInfo) {
    this.setState({ errorInfo: error_info });

    // 에러 리포팅 (프로덕션 환경에서)
    if (env.NODE_ENV === 'production') {
      // TODO: 에러 리포팅 서비스로 전송
      console.log('Error reported to monitoring service');
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      copied: false,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleCopyError = () => {
    const { error, errorInfo } = this.state;
    const error_text = `
Error: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace'}
Component Stack: ${errorInfo?.componentStack || 'No component stack'}
    `.trim();

    navigator.clipboard.writeText(error_text);
    this.setState({ copied: true });
    toast.success('에러 정보가 클립보드에 복사되었습니다');

    setTimeout(() => {
      this.setState({ copied: false });
    }, 2000);
  };

  getErrorSolution = () => {
    const { errorType } = this.state;

    switch (errorType) {
      case 'config':
        return {
          title: '환경 변수 설정 필요',
          description: 'YouTube Lens를 사용하기 위한 환경 변수가 설정되지 않았습니다.',
          solutions: [
            '`.env.local` 파일을 생성하고 필요한 환경 변수를 추가하세요',
            'Google Cloud Console에서 OAuth 2.0 클라이언트를 생성하세요',
            'YouTube Data API v3를 활성화하세요',
            '개발 서버를 재시작하세요',
          ],
        };

      case 'network':
        return {
          title: '네트워크 연결 오류',
          description: '서버와의 연결에 문제가 발생했습니다.',
          solutions: [
            '인터넷 연결 상태를 확인하세요',
            'VPN이나 프록시 설정을 확인하세요',
            '잠시 후 다시 시도해주세요',
            '문제가 지속되면 관리자에게 문의하세요',
          ],
        };

      case 'auth':
        return {
          title: '인증 오류',
          description: 'Google OAuth 인증 과정에서 문제가 발생했습니다.',
          solutions: [
            'Google 계정에 다시 로그인해보세요',
            '브라우저 쿠키와 캐시를 삭제하세요',
            'OAuth 클라이언트 ID와 Secret이 올바른지 확인하세요',
            '리디렉션 URI가 Google Console에 등록되어 있는지 확인하세요',
          ],
        };

      default:
        return {
          title: '예기치 않은 오류',
          description: 'YouTube Lens 실행 중 오류가 발생했습니다.',
          solutions: [
            '페이지를 새로고침하세요',
            '브라우저를 재시작하세요',
            '다른 브라우저에서 시도해보세요',
            '문제가 지속되면 관리자에게 문의하세요',
          ],
        };
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorType, copied } = this.state;
      const solution = this.getErrorSolution();

      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle>{solution.title}</CardTitle>
                  <CardDescription>{solution.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 에러 메시지 */}
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertTitle>오류 상세</AlertTitle>
                <AlertDescription className="mt-2">
                  <code className="block text-xs bg-destructive/10 p-2 rounded mt-2">
                    {error?.message || '알 수 없는 오류가 발생했습니다'}
                  </code>
                </AlertDescription>
              </Alert>

              {/* 해결 방법 */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">해결 방법</h3>
                <ol className="list-decimal list-inside space-y-2">
                  {solution.solutions.map((step, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* 액션 버튼 */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={this.handleReset} variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  다시 시도
                </Button>
                <Button onClick={this.handleReload} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  페이지 새로고침
                </Button>
                <Button onClick={this.handleGoHome} variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  홈으로
                </Button>
                <Button onClick={this.handleCopyError} variant="outline" disabled={copied}>
                  {copied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      오류 복사
                    </>
                  )}
                </Button>
              </div>

              {/* 개발 모드 상세 정보 */}
              {env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="text-sm font-medium cursor-pointer">
                    개발자 정보 (클릭하여 펼치기)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div className="text-xs bg-muted p-3 rounded font-mono overflow-x-auto">
                      <p>
                        <strong>Error Type:</strong> {errorType}
                      </p>
                      <p>
                        <strong>Message:</strong> {error?.message}
                      </p>
                      <p className="mt-2">
                        <strong>Stack:</strong>
                      </p>
                      <pre className="whitespace-pre-wrap text-xs">{error?.stack}</pre>
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
