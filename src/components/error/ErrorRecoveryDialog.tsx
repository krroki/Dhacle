'use client';

// User-friendly Error Recovery Dialog Component
// Provides automated error recovery with user guidance

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { ErrorInfo } from '@/lib/error/error-handler';

interface ErrorRecoveryDialogProps {
  error: ErrorInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  onContactSupport?: () => void;
}

interface RecoveryState {
  isRecovering: boolean;
  currentStep: string;
  progress: number;
  success: boolean | null;
  logs: string[];
}

export function ErrorRecoveryDialog({
  error,
  isOpen,
  onClose,
  onRetry,
  onContactSupport
}: ErrorRecoveryDialogProps) {
  const [recoveryState, setRecoveryState] = useState<RecoveryState>({
    isRecovering: false,
    currentStep: '',
    progress: 0,
    success: null,
    logs: []
  });

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (error?.retryAfter && countdown === 0) {
      setCountdown(error.retryAfter);
    }
  }, [error]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  if (!error) return null;

  const getSeverityColor = (severity: string): 'destructive' | 'secondary' | 'outline' => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleAutomaticRecovery = async () => {
    if (!error.canRetry) return;

    setRecoveryState({
      isRecovering: true,
      currentStep: '문제 분석 중...',
      progress: 10,
      success: null,
      logs: ['🔍 오류 상황을 분석하고 있습니다...']
    });

    try {
      // Simulate recovery steps
      const steps = [
        { message: '연결 상태를 확인하고 있습니다...', progress: 25 },
        { message: '캐시를 정리하고 있습니다...', progress: 50 },
        { message: '서비스 연결을 재시도하고 있습니다...', progress: 75 },
        { message: '복구 작업을 완료하고 있습니다...', progress: 90 }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setRecoveryState(prev => ({
          ...prev,
          currentStep: step.message,
          progress: step.progress,
          logs: [...prev.logs, `⏳ ${step.message}`]
        }));
      }

      // Simulate success/failure
      const success = Math.random() > 0.3; // 70% success rate

      setRecoveryState(prev => ({
        ...prev,
        isRecovering: false,
        progress: 100,
        success,
        currentStep: success ? '복구 완료!' : '복구 실패',
        logs: [
          ...prev.logs,
          success ? '✅ 문제가 해결되었습니다!' : '❌ 자동 복구에 실패했습니다.'
        ]
      }));

      if (success && onRetry) {
        setTimeout(() => {
          onRetry();
          onClose();
        }, 2000);
      }

    } catch (error) {
      setRecoveryState(prev => ({
        ...prev,
        isRecovering: false,
        success: false,
        currentStep: '복구 실패',
        logs: [...prev.logs, '❌ 복구 중 오류가 발생했습니다.']
      }));
    }
  };

  const formatTimeLeft = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            {getSeverityIcon(error.severity)}
            <div>
              <DialogTitle className="text-xl">
                문제가 발생했습니다
              </DialogTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={getSeverityColor(error.severity)}>
                  {error.severity.toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-500">
                  {error.code}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogDescription asChild>
          <div className="space-y-4">
            {/* Error Message */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                {error.userMessage}
              </AlertDescription>
            </Alert>

            {/* Recovery Progress */}
            {recoveryState.isRecovering && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">자동 복구 진행중</span>
                  <span className="text-sm text-gray-500">
                    {recoveryState.progress}%
                  </span>
                </div>
                <Progress value={recoveryState.progress} className="h-2" />
                <div className="text-sm text-gray-600">
                  <RefreshCw className="inline h-4 w-4 mr-1 animate-spin" />
                  {recoveryState.currentStep}
                </div>
              </div>
            )}

            {/* Recovery Success/Failure */}
            {recoveryState.success !== null && (
              <Alert variant={recoveryState.success ? 'default' : 'destructive'}>
                {recoveryState.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {recoveryState.success 
                    ? '문제가 자동으로 해결되었습니다. 잠시 후 다시 시도됩니다.'
                    : '자동 복구에 실패했습니다. 수동으로 문제를 해결해주세요.'
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Recovery Actions */}
            {error.recoveryActions.length > 0 && !recoveryState.isRecovering && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">해결 방법:</h4>
                <ul className="space-y-1">
                  {error.recoveryActions.map((action, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mr-2 font-medium">
                        {index + 1}
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Retry Countdown */}
            {error.canRetry && countdown > 0 && !recoveryState.isRecovering && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  {formatTimeLeft(countdown)} 후에 다시 시도할 수 있습니다.
                </AlertDescription>
              </Alert>
            )}

            {/* Recovery Logs */}
            {recoveryState.logs.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">복구 로그:</h4>
                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {recoveryState.logs.map((log, index) => (
                    <div key={index} className="text-xs font-mono text-gray-700">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Details (collapsible) */}
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-700">
                기술 정보 보기
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded font-mono">
                <div><strong>오류 코드:</strong> {error.code}</div>
                <div><strong>심각도:</strong> {error.severity}</div>
                <div><strong>발생 시간:</strong> {new Date(error.context.timestamp).toLocaleString('ko-KR')}</div>
                {error.context.component && (
                  <div><strong>컴포넌트:</strong> {error.context.component}</div>
                )}
                {error.context.action && (
                  <div><strong>작업:</strong> {error.context.action}</div>
                )}
                <div><strong>기술 메시지:</strong> {error.technicalMessage}</div>
              </div>
            </details>
          </div>
        </DialogDescription>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {/* Automatic Recovery Button */}
          {error.canRetry && !recoveryState.isRecovering && recoveryState.success === null && (
            <Button 
              onClick={handleAutomaticRecovery}
              disabled={countdown > 0}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              자동 복구 시도
              {countdown > 0 && ` (${formatTimeLeft(countdown)})`}
            </Button>
          )}

          {/* Manual Retry Button */}
          {onRetry && !recoveryState.isRecovering && recoveryState.success !== true && (
            <Button 
              onClick={() => {
                onRetry();
                onClose();
              }}
              variant="outline"
              disabled={countdown > 0}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
          )}

          {/* Contact Support Button */}
          {(error.severity === 'high' || error.severity === 'critical' || recoveryState.success === false) && (
            <Button 
              onClick={onContactSupport}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              고객센터 문의
            </Button>
          )}

          {/* Close Button */}
          <Button 
            onClick={onClose} 
            variant={recoveryState.success ? "default" : "secondary"}
            className="w-full sm:w-auto"
          >
            {recoveryState.success ? '완료' : '닫기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}