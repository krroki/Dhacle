'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get('orderId');
  const code = searchParams.get('code');
  const message = searchParams.get('message');
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (orderId) {
      // 서버에 결제 실패 상태 업데이트
      updateFailureStatus();
    }
  }, [orderId]);

  const updateFailureStatus = async () => {
    try {
      await fetch('/api/payment/fail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          code,
          message,
        }),
      });
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  const handleRetry = () => {
    // 이전 페이지로 돌아가서 다시 시도
    router.back();
  };

  const getErrorMessage = () => {
    if (message) return message;
    if (code === 'USER_CANCEL') return '결제를 취소하셨습니다.';
    if (code === 'PAYMENT_TIMEOUT') return '결제 시간이 초과되었습니다.';
    return '결제 처리 중 오류가 발생했습니다.';
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          
          <CardTitle className="text-2xl">결제를 완료할 수 없습니다</CardTitle>
          <CardDescription className="text-base mt-2">
            {getErrorMessage()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {orderId && (
            <div className="text-center text-sm text-muted-foreground">
              주문번호: {orderId}
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2">다음 방법을 시도해보세요</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>카드 정보가 올바른지 확인해주세요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>카드 한도가 충분한지 확인해주세요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>다른 결제 수단을 이용해보세요</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/courses')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              강의 목록으로
            </Button>
            
            <Button 
              className="flex-1"
              onClick={handleRetry}
              disabled={isProcessing}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도하기
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>계속해서 문제가 발생하시면</p>
        <p className="mt-1">
          고객센터(support@dhacle.com)로 문의해주세요.
        </p>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFailContent />
    </Suspense>
  );
}