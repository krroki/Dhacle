'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  PlayCircle, 
  Clock, 
  Users, 
  FileText, 
  Award, 
  ShieldCheck,
  ChevronRight,
  Tag
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Course } from '@/types/course';

interface PurchaseCardProps {
  course: Course;
  isEnrolled?: boolean;
  isPurchased?: boolean;
}

export function PurchaseCard({ course, isEnrolled, isPurchased }: PurchaseCardProps) {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);

  const formatPrice = (price: number): string => {
    if (price === 0) return '무료';
    return `₩${price.toLocaleString()}`;
  };

  const finalPrice = course.discount_price || course.price;
  const discountedPrice = finalPrice - discount;

  const handlePurchase = async () => {
    if (course.is_free || isEnrolled || isPurchased) {
      // 무료 강의나 이미 구매한 경우 바로 학습 페이지로
      router.push(`/learn/${course.id}`);
    } else {
      // 결제 페이지로 이동
      router.push(`/payment?courseId=${course.id}&coupon=${couponCode}`);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    
    setIsApplyingCoupon(true);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, courseId: course.id })
      });

      if (response.ok) {
        const data = await response.json();
        setDiscount(data.discountAmount);
      }
    } catch (error) {
      console.error('쿠폰 적용 실패:', error);
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

          {/* 구매/학습 버튼 */}
          <Button 
            size="lg" 
            className="w-full"
            onClick={handlePurchase}
          >
            {getButtonText()}
            <ChevronRight className="w-4 h-4 ml-1" />
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
  );
}