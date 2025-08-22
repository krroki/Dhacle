'use client';

import confetti from 'canvas-confetti';
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiPost } from '@/lib/api-client';
import { createClient } from '@/lib/supabase/browser-client';
import type { Course } from '@/types';

function PaymentSuccessContent() {
  const search_params = useSearchParams();
  const router = useRouter();

  // 토스페이먼츠 파라미터
  const order_id = search_params.get('orderId');
  const payment_key = search_params.get('paymentKey');
  const amount = search_params.get('amount');

  const [course, set_course] = useState<Course | null>(null);
  const [is_processing, set_is_processing] = useState(true);
  const [error, set_error] = useState<string | null>(null);

  const load_course_data = useCallback(async (course_id: string) => {
    const supabase = createClient();
    const { data } = await supabase.from('courses').select('*').eq('id', course_id).single();

    if (data) {
      // DB 데이터를 Course 타입으로 변환
      const course_data: Course = {
        id: data.id,
        title: data.title,
        description: data.description ?? undefined,
        instructor_name: data.instructor_name || 'Unknown',
        instructor_id: data.instructor_id ?? undefined,
        thumbnail_url: data.thumbnail_url ?? undefined,
        price: data.price,
        is_free: data.price === 0,
        isPremium: data.price > 0,
        total_duration: (data.duration_weeks || 8) * 7 * 60, // weeks to minutes
        student_count: data.total_students || 0,
        average_rating: data.average_rating || 0,
        reviewCount: 0,
        status: 'active', // DB에 status 컬럼이 없음
        launchDate: data.created_at || new Date().toISOString(),
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || data.created_at || new Date().toISOString(),
      };
      set_course(course_data);
    }
  }, []);

  const confirm_payment = useCallback(async () => {
    try {
      const data = await apiPost<{
        success: boolean;
        purchase?: {
          id: string;
          course_id: string;
          amount: number;
          status: string;
        };
        error?: string;
      }>('/api/payment/confirm', {
        orderId: order_id,
        paymentKey: payment_key,
        amount: Number.parseInt(amount || '0', 10),
      });

      // 축하 애니메이션
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#22c55e', '#84cc16'],
      });

      // 강의 정보 로드
      if (data.purchase?.course_id) {
        load_course_data(data.purchase.course_id);
      }
    } catch (error) {
      set_error(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.');
    } finally {
      set_is_processing(false);
    }
  }, [order_id, payment_key, amount, load_course_data]);

  useEffect(() => {
    if (!order_id || !payment_key || !amount) {
      set_error('결제 정보가 올바르지 않습니다.');
      set_is_processing(false);
      return;
    }

    confirm_payment();
  }, [order_id, payment_key, amount, confirm_payment]);

  if (is_processing) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center">
          <p className="text-muted-foreground">결제를 처리하는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <CardTitle>결제 실패</CardTitle>
            <CardDescription className="text-destructive">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/courses')}>강의 목록으로 돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center">
          <p className="text-muted-foreground">강의 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-3xl font-bold mb-4">결제가 완료되었습니다!</h1>
        <p className="text-lg text-muted-foreground">
          {course.title} 강의를 구매해주셔서 감사합니다.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>구매 완료</CardTitle>
          <CardDescription>이제 모든 강의 콘텐츠에 접근하실 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">강의명</span>
            <span className="font-medium">{course.title}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">강사</span>
            <span className="font-medium">{course.instructor_name}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">결제 금액</span>
            <span className="font-medium">₩{course.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">상태</span>
            <span className="font-medium text-green-600">결제 완료</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button size="lg" className="w-full" onClick={() => router.push(`/learn/${course.id}`)}>
          <BookOpen className="w-4 h-4 mr-2" />
          바로 학습 시작하기
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => router.push('/my/courses')}
        >
          내 강의 목록 보기
        </Button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-medium mb-2">다음 단계</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>강의 대시보드에서 전체 커리큘럼을 확인하세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>첫 번째 레슨부터 차근차근 학습을 시작하세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>질문이 있으시면 토론 게시판을 활용해주세요</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>모든 레슨 완료 시 수료증이 자동 발급됩니다</span>
          </li>
        </ul>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>결제 영수증이 이메일로 발송되었습니다.</p>
        <p className="mt-1">문의사항이 있으시면 고객센터로 연락주세요.</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
