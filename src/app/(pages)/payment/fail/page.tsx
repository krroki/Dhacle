'use client';

import { ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiPost } from '@/lib/api-client';

function PaymentFailContent() {
  const search_params = useSearchParams();
  const router = useRouter();

  const order_id = search_params.get('orderId');
  const code = search_params.get('code');
  const message = search_params.get('message');

  const [is_processing, _setIsProcessing] = useState(false);

  const update_failure_status = useCallback(async () => {
    try {
      await apiPost('/api/payment/fail', {
        orderId: order_id,
        code,
        message,
      });
    } catch (error) {
      // Log error but don't show toast as we're already on fail page
      console.error('Failed to update payment failure status:', error);
    }
  }, [order_id, code, message]);

  useEffect(() => {
    if (order_id) {
      // 서버에 결제 실패 상태 업데이트
      update_failure_status();
    }
  }, [order_id, update_failure_status]);

  const handle_retry = () => {
    // 이전 페이지로 돌아가서 다시 시도
    router.back();
  };

  const get_error_message = () => {
    if (message) {
      return message;
    }
    if (code === 'USER_CANCEL') {
      return '결제를 취소하셨습니다.';
    }
    if (code === 'PAYMENT_TIMEOUT') {
      return '결제 시간이 초과되었습니다.';
    }
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
          <CardDescription className="text-base mt-2">{get_error_message()}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {order_id && (
            <div className="text-center text-sm text-muted-foreground">주문번호: {order_id}</div>
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
            <Button variant="outline" className="flex-1" onClick={() => router.push('/courses')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              강의 목록으로
            </Button>

            <Button className="flex-1" onClick={handle_retry} disabled={is_processing}>
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도하기
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>계속해서 문제가 발생하시면</p>
        <p className="mt-1">고객센터(support@dhacle.com)로 문의해주세요.</p>
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
