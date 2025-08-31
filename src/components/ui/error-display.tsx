// User-Friendly Error Display Components
// Provides consistent error UI with recovery actions

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home, Mail } from 'lucide-react';
import { ErrorResponse, ErrorSeverity } from '@/lib/error/error-handler';

interface ErrorDisplayProps {
  error: ErrorResponse['error'];
  onRetry?: () => void;
  onGoHome?: () => void;
  onContact?: () => void;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// Main Error Display Component
export function ErrorDisplay({ 
  error, 
  onRetry, 
  onGoHome, 
  onContact,
  className = "" 
}: ErrorDisplayProps) {
  const getSeverityColor = (severity: ErrorSeverity): string => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (_severity: ErrorSeverity) => {
    return <AlertCircle className="h-4 w-4" />;
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry action - reload page
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      // Default home action
      window.location.href = '/';
    }
  };

  const handleContact = () => {
    if (onContact) {
      onContact();
    } else {
      // Default contact action - could open a modal or navigate to contact page
      console.log('Contact support requested');
    }
  };

  return (
    <Alert variant={getSeverityColor(error.severity)} className={className}>
      {getSeverityIcon(error.severity)}
      <AlertTitle className="flex items-center gap-2">
        오류 발생
        {error.code && (
          <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
            {error.code}
          </span>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-4">
        <p>{error.message}</p>
        
        {error.recoveryActions && error.recoveryActions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {error.canRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                {error.retryAfter ? `${error.retryAfter}초 후 다시 시도` : '다시 시도'}
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="h-3 w-3" />
              홈으로
            </Button>

            {(error.severity === 'critical' || error.severity === 'high') && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleContact}
                className="flex items-center gap-2"
              >
                <Mail className="h-3 w-3" />
                문의하기
              </Button>
            )}
          </div>
        )}

        {error.retryAfter && (
          <p className="text-sm text-muted-foreground">
            {error.retryAfter}초 후에 자동으로 다시 시도됩니다.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Compact Error Display for smaller spaces
export function CompactErrorDisplay({ error, onRetry }: Pick<ErrorDisplayProps, 'error' | 'onRetry'>) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md bg-destructive/10 border-destructive/20">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span className="text-sm text-destructive">{error.message}</span>
      </div>
      {error.canRetry && (
        <Button size="sm" variant="ghost" onClick={onRetry}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// Error Page Component for full-page errors
export function ErrorPage({ 
  error, 
  onRetry, 
  onGoHome,
  title = "오류가 발생했습니다" 
}: ErrorDisplayProps & { title?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {error.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {error.canRetry && (
              <Button onClick={onRetry} className="w-full flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                다시 시도
              </Button>
            )}
            <Button variant="outline" onClick={onGoHome} className="w-full flex items-center gap-2">
              <Home className="h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </div>
          
          {error.code && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                오류 코드: {error.code} | {error.timestamp}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// React Error Boundary Component
export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: (error: Error, errorInfo: React.ErrorInfo) => React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{
    fallback?: (error: Error, errorInfo: React.ErrorInfo) => React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
    
    // Log to our error handler
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // Default error UI
      const error = {
        code: 'REACT_ERROR',
        message: '페이지에 오류가 발생했습니다',
        severity: 'high' as ErrorSeverity,
        recoveryActions: ['페이지 새로고침', '홈으로 돌아가기'],
        canRetry: true,
        timestamp: new Date().toISOString(),
      };

      return (
        <ErrorPage
          error={error}
          onRetry={() => window.location.reload()}
          onGoHome={() => window.location.href = '/'}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for handling async errors in components
export function useErrorHandler() {
  const [error, setError] = React.useState<ErrorResponse['error'] | null>(null);

  const handleError = React.useCallback((error: unknown) => {
    // Convert any error to our standardized format
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const apiError = error as ErrorResponse;
      setError(apiError.error);
    } else if (error instanceof Error) {
      setError({
        code: 'COMPONENT_ERROR',
        message: error.message,
        severity: 'medium',
        recoveryActions: ['다시 시도'],
        canRetry: true,
        timestamp: new Date().toISOString(),
      });
    } else {
      setError({
        code: 'UNKNOWN_ERROR',
        message: '알 수 없는 오류가 발생했습니다',
        severity: 'medium',
        recoveryActions: ['다시 시도'],
        canRetry: true,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const retry = React.useCallback(() => {
    setError(null);
    // Trigger re-render or retry logic
  }, []);

  return {
    error,
    handleError,
    clearError,
    retry,
    hasError: error !== null,
  };
}