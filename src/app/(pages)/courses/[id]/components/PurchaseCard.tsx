'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PlayCircle, 
  Clock, 
  Users, 
  FileText, 
  Award, 
  ShieldCheck,
  ChevronRight,
  Tag,
  Loader2,
  CreditCard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { requestPayment, type PaymentMethod } from '@/lib/tosspayments/client';
import { PaymentMethodSelector } from '@/components/features/payment/PaymentMethodSelector';
import type { Course } from '@/types/course';

interface PurchaseCardProps {
  course: Course;
  isEnrolled?: boolean;
  isPurchased?: boolean;
  firstLessonId?: string;
}

export function PurchaseCard({ course, isEnrolled, isPurchased, firstLessonId }: PurchaseCardProps) {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderId: string;
    amount: number;
    orderName: string;
    customerName: string;
    customerEmail: string;
    purchaseId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number): string => {
    if (price === 0) return '무료';
    return `₩${price.toLocaleString()}`;
  };

  const finalPrice = course.discount_price || course.price;
  const discountedPrice = finalPrice - discount;

  const handlePurchase = async () => {
    if (course.is_free || isEnrolled || isPurchased) {
      // 무료 강의나 이미 구매한 경우 바로 학습 페이지로
      // firstLessonId가 있으면 첫 번째 레슨으로, 없으면 강의 ID만으로 이동
      const learnUrl = firstLessonId 
        ? `/learn/${course.id}/${firstLessonId}`
        : `/learn/${course.id}/1`; // 기본값으로 레슨 1
      router.push(learnUrl);
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      // 1. 주문 정보 생성
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          couponCode: appliedCoupon?.code || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || '결제 준비 중 오류가 발생했습니다.';
        
        // 특정 에러에 대한 사용자 친화적 메시지
        if (response.status === 401) {
          throw new Error('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
        } else if (response.status === 404) {
          throw new Error('강의를 찾을 수 없습니다. 페이지를 새로고침 해주세요.');
        } else if (response.status === 400 && errorData.error?.includes('이미 구매')) {
          throw new Error('이미 구매한 강의입니다. 내 강의 페이지에서 확인해주세요.');
        } else {
          throw new Error(errorMessage);
        }
      }

      const data = await response.json() as { 
        orderId: string; 
        amount: number; 
        orderName: string;
        customerName: string;
        customerEmail: string;
        purchaseId: string; 
      };

      // 2. 주문 데이터 저장하고 결제 수단 선택 모달 열기
      setOrderData(data);
      setShowPaymentModal(true);
      setError(null);
      
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : '결제 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      
      // 로그인 필요 시 로그인 페이지로 리다이렉트
      if (errorMessage.includes('로그인이 필요')) {
        setTimeout(() => {
          router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
        }, 2000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setError(null);
    // 결제 성공 시 처리는 TossPayments가 successUrl로 리다이렉트 처리
  };

  const handlePaymentError = (err: Error) => {
    setShowPaymentModal(false);
    
    // 사용자가 취소한 경우는 에러 메시지를 표시하지 않음
    if (err.message.includes('사용자가 결제를 취소')) {
      return;
    }
    
    // 네트워크 에러 처리
    if (err.message.includes('네트워크') || err.message.includes('Network')) {
      setError('네트워크 연결을 확인해주세요. 잠시 후 다시 시도해주세요.');
    } else {
      setError(err.message || '결제 처리 중 오류가 발생했습니다.');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    
    setIsApplyingCoupon(true);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode, courseId: course.id })
      });

      if (response.ok) {
        const data = await response.json();
        setDiscount(data.discount.discountAmount);
        setAppliedCoupon(data.coupon);
      } else {
        const error = await response.json();
        alert(error.error || '쿠폰 적용에 실패했습니다.');
      }
    } catch (error) {
      console.error('쿠폰 적용 실패:', error);
      alert('쿠폰 적용 중 오류가 발생했습니다.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const getButtonText = () => {
    if (isPurchased || isEnrolled) return '학습하기';
    if (course.is_free) return '무료로 시작하기';
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
                  <span className="text-3xl font-bold">
                    {formatPrice(discountedPrice)}
                  </span>
                  <Badge variant="destructive">
                    {Math.round((1 - course.discount_price / course.price) * 100)}% 할인
                  </Badge>
                </div>
                <span className="text-muted-foreground line-through">
                  {formatPrice(course.price)}
                </span>
              </>
            ) : (
              <div className="text-3xl font-bold">
                {formatPrice(discountedPrice)}
              </div>
            )}
          </div>

          {/* 쿠폰 입력 */}
          {!course.is_free && !isPurchased && !isEnrolled && (
            <div className="flex gap-2">
              <Input
                placeholder="쿠폰 코드 입력"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={applyCoupon}
                disabled={isApplyingCoupon}
              >
                <Tag className="w-4 h-4" />
              </Button>
            </div>
          )}

          {discount > 0 && (
            <div className="text-sm text-green-600">
              쿠폰 할인: -₩{discount.toLocaleString()}
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 구매/학습 버튼 */}
          <Button 
            size="lg" 
            className="w-full"
            onClick={handlePurchase}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                처리중...
              </>
            ) : (
              <>
                {getButtonText()}
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
              <span>{course.student_count.toLocaleString()}명 수강중</span>
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
        {course.preview_video_url && !isPurchased && !isEnrolled && (
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
    <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>결제하기</DialogTitle>
          <DialogDescription>
            원하시는 결제 수단을 선택하여 진행해주세요
          </DialogDescription>
        </DialogHeader>
        {orderData && (
          <PaymentMethodSelector
            orderId={orderData.orderId}
            amount={orderData.amount}
            orderName={orderData.orderName}
            customerName={orderData.customerName}
            customerEmail={orderData.customerEmail}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}