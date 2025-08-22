'use client';

import {
  Award,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  PlayCircle,
  ShieldCheck,
  Tag,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PaymentMethodSelector } from '@/components/features/payment/PaymentMethodSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { apiPost } from '@/lib/api-client';
import type { Course } from '@/types';

interface PurchaseCardProps {
  course: Course;
  is_enrolled?: boolean;
  is_purchased?: boolean;
  firstLessonId?: string;
}

export function PurchaseCard({
  course,
  is_enrolled,
  is_purchased,
  firstLessonId,
}: PurchaseCardProps) {
  const router = useRouter();
  const [coupon_code, set_coupon_code] = useState('');
  const [is_applying_coupon, set_is_applying_coupon] = useState(false);
  const [discount, set_discount] = useState(0);
  const [is_processing, set_is_processing] = useState(false);
  const [applied_coupon, set_applied_coupon] = useState<{ code: string; discount: number } | null>(
    null
  );
  const [show_payment_modal, set_show_payment_modal] = useState(false);
  const [order_data, set_order_data] = useState<{
    orderId: string;
    amount: number;
    orderName: string;
    customerName: string;
    customerEmail: string;
    purchaseId: string;
  } | null>(null);
  const [error, set_error] = useState<string | null>(null);

  const format_price = (price: number): string => {
    if (price === 0) {
      return '무료';
    }
    return `₩${price.toLocaleString()}`;
  };

  const final_price = course.discount_price || course.price;
  const discounted_price = final_price - discount;

  const handle_purchase = async (): Promise<void> => {
    if (course.is_free || is_enrolled || is_purchased) {
      // 무료 강의나 이미 구매한 경우 바로 학습 페이지로
      // firstLessonId가 있으면 첫 번째 레슨으로, 없으면 강의 ID만으로 이동
      const learn_url = firstLessonId
        ? `/learn/${course.id}/${firstLessonId}`
        : `/learn/${course.id}/1`; // 기본값으로 레슨 1
      router.push(learn_url);
      return;
    }

    set_is_processing(true);
    set_error(null);

    try {
      // 1. 주문 정보 생성
      const data = await apiPost<{
        orderId: string;
        amount: number;
        orderName: string;
        customerName: string;
        customerEmail: string;
        purchaseId: string;
      }>('/api/payment/create-intent', {
        course_id: course.id,
        couponCode: applied_coupon?.code || '',
      });

      // 2. 주문 데이터 저장하고 결제 수단 선택 모달 열기
      set_order_data(data);
      set_show_payment_modal(true);
      set_error(null);
    } catch (error) {
      const error_message =
        error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.';
      set_error(error_message);

      // 로그인 필요 시 로그인 페이지로 리다이렉트
      if (error_message.includes('로그인이 필요')) {
        setTimeout(() => {
          router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }, 2000);
      }
    } finally {
      set_is_processing(false);
    }
  };

  const handle_payment_success = () => {
    set_show_payment_modal(false);
    set_error(null);
    // 결제 성공 시 처리는 TossPayments가 successUrl로 리다이렉트 처리
  };

  const handle_payment_error = (err: Error) => {
    set_show_payment_modal(false);

    // 사용자가 취소한 경우는 에러 메시지를 표시하지 않음
    if (err.message.includes('사용자가 결제를 취소')) {
      return;
    }

    // 네트워크 에러 처리
    if (err.message.includes('네트워크') || err.message.includes('Network')) {
      set_error('네트워크 연결을 확인해주세요. 잠시 후 다시 시도해주세요.');
    } else {
      set_error(err.message || '결제 처리 중 오류가 발생했습니다.');
    }
  };

  const apply_coupon = async (): Promise<void> => {
    if (!coupon_code) {
      return;
    }

    set_is_applying_coupon(true);
    try {
      const data = await apiPost<{
        discount: { discountAmount: number };
        coupon: { code: string; discount: number };
      }>('/api/coupons/validate', {
        couponCode: coupon_code,
        course_id: course.id,
      });

      set_discount(data.discount.discountAmount);
      set_applied_coupon(data.coupon);
    } catch (error) {
      const error_message =
        error instanceof Error ? error.message : '쿠폰 적용 중 오류가 발생했습니다.';
      alert(error_message);
    } finally {
      set_is_applying_coupon(false);
    }
  };

  const get_button_text = () => {
    if (is_purchased || is_enrolled) {
      return '학습하기';
    }
    if (course.is_free) {
      return '무료로 시작하기';
    }
    return '수강 신청하기';
  };

  return (
    <>
      <Card className="sticky top-24">
        <CardHeader>
          <div className="space-y-3">
            {/* 가격 표시 */}
            <div className="space-y-1">
              {course.discount_price && course.discount_price < course.price ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold">{format_price(discounted_price)}</span>
                    <Badge variant="destructive">
                      {Math.round((1 - course.discount_price / course.price) * 100)}% 할인
                    </Badge>
                  </div>
                  <span className="text-muted-foreground line-through">
                    {format_price(course.price)}
                  </span>
                </>
              ) : (
                <div className="text-3xl font-bold">{format_price(discounted_price)}</div>
              )}
            </div>

            {/* 쿠폰 입력 */}
            {!course.is_free && !is_purchased && !is_enrolled && (
              <div className="flex gap-2">
                <Input
                  placeholder="쿠폰 코드 입력"
                  value={coupon_code}
                  onChange={(e) => set_coupon_code(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={apply_coupon} disabled={is_applying_coupon}>
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
            )}

            {discount > 0 && (
              <div className="text-sm text-green-600">쿠폰 할인: -₩{discount.toLocaleString()}</div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 구매/학습 버튼 */}
            <Button size="lg" className="w-full" onClick={handle_purchase} disabled={is_processing}>
              {is_processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  처리중...
                </>
              ) : (
                <>
                  {get_button_text()}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator />

          {/* 강의 정보 */}
          <div className="space-y-3">
            <h4 className="font-medium">이 강의는</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>총 {Math.floor(course.total_duration / 3600)}시간 분량</span>
              </div>
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-muted-foreground" />
                <span>평생 무제한 시청</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>수업 자료 제공</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                <span>수료증 발급</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{course.student_count?.toLocaleString() || 0}명 수강중</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* 보장 사항 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>7일 내 100% 환불 보장</span>
            </div>
            <p className="text-xs text-muted-foreground">
              강의에 만족하지 못하셨다면 7일 이내 전액 환불해드립니다.
            </p>
          </div>

          {/* 미리보기 버튼 */}
          {course.previewVideoUrl && !is_purchased && !is_enrolled && (
            <>
              <Separator />
              <Button variant="outline" className="w-full">
                <PlayCircle className="w-4 h-4 mr-2" />
                무료 미리보기
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* 결제 수단 선택 모달 */}
      <Dialog open={show_payment_modal} onOpenChange={set_show_payment_modal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>결제하기</DialogTitle>
            <DialogDescription>원하시는 결제 수단을 선택하여 진행해주세요</DialogDescription>
          </DialogHeader>
          {order_data && (
            <PaymentMethodSelector
              orderId={order_data.orderId}
              amount={order_data.amount}
              orderName={order_data.orderName}
              customerName={order_data.customerName}
              customerEmail={order_data.customerEmail}
              onSuccess={handle_payment_success}
              onError={handle_payment_error}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
