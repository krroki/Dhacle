'use client';

import { useEffect, useState, Suspense } from 'react';
import { apiGet, apiPost, ApiError } from '@/lib/api-client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Download, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/browser-client';
import confetti from 'canvas-confetti';
import type { Course } from '@/types/course';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 토스페이먼츠 파라미터
  const orderId = searchParams.get('orderId');
  const paymentKey = searchParams.get('paymentKey');
  const amount = searchParams.get('amount');
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !paymentKey || !amount) {
      setError('결제 정보가 올바르지 않습니다.');
      setIsProcessing(false);
      return;
    }

    confirmPayment();
  }, [orderId, paymentKey, amount]);

  const confirmPayment = async () => {
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
          orderId,
          paymentKey,
          amount: parseInt(amount || '0'),
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
        loadCourseData(data.purchase.course_id);
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      setError(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadCourseData = async (courseId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (data) {
      setCourse(data);
    }
  };

  if (isProcessing) {
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
            <CardDescription className="text-destructive">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/courses')}>
              강의 목록으로 돌아가기
            </Button>
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
          <CardDescription>
            이제 모든 강의 콘텐츠에 접근하실 수 있습니다
          </CardDescription>
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
        <Button 
          size="lg" 
          className="w-full"
          onClick={() => router.push(`/learn/${course.id}`)}
        >
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