'use client';

import {
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  DollarSign,
  GraduationCap,
  Laptop,
  Loader2,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiPost } from '@/lib/api-client';
import { useAuth } from '@/lib/auth/AuthContext';
import { cn } from '@/lib/utils';

interface OnboardingData {
  work_type: 'main' | 'side' | '';
  job_category: string;
  current_income: string;
  target_income: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | '';
}

const JOB_CATEGORIES = [
  { value: 'office_worker', label: '회사원', icon: Building2 },
  { value: 'student', label: '학생', icon: GraduationCap },
  { value: 'freelancer', label: '프리랜서', icon: Laptop },
  { value: 'self_employed', label: '자영업자', icon: Store },
  { value: 'creator', label: '크리에이터', icon: Users },
  { value: 'unemployed', label: '무직/취준생', icon: Briefcase },
  { value: 'other', label: '기타', icon: TrendingUp },
];

const INCOME_RANGES = [
  { value: '0-100', label: '100만원 미만' },
  { value: '100-300', label: '100-300만원' },
  { value: '300-500', label: '300-500만원' },
  { value: '500-1000', label: '500-1,000만원' },
  { value: '1000+', label: '1,000만원 이상' },
];

const EXPERIENCE_LEVELS = [
  {
    value: 'beginner' as const,
    label: '초급',
    description: '이제 막 시작했어요',
    icon: '🌱',
  },
  {
    value: 'intermediate' as const,
    label: '중급',
    description: '1년 미만 경험이 있어요',
    icon: '🌿',
  },
  {
    value: 'advanced' as const,
    label: '고급',
    description: '1년 이상 경험이 있어요',
    icon: '🌳',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: auth_loading } = useAuth();

  const [step, set_step] = useState(1);
  const [loading, set_loading] = useState(false);
  const [_generatedUsername, set_generated_username] = useState('');
  const [data, set_data] = useState<OnboardingData>({
    work_type: '',
    job_category: '',
    current_income: '',
    target_income: '',
    experience_level: '',
  });

  // 인증 확인
  useEffect(() => {
    if (!auth_loading && !user) {
      router.push('/auth/login');
    }
  }, [user, auth_loading, router]);

  // 사용자명 자동 생성
  const generate_username = async () => {
    try {
      const data = await apiPost<{ username: string }>('/api/user/generate-username', {});

      if (data.username) {
        set_generated_username(data.username);
        return data.username;
      }

      throw new Error('Failed to generate username');
    } catch (error) {
      console.error('Page error:', error);
      // 폴백: 클라이언트에서 생성
      const fallback_username = `creator_${Math.random().toString(36).substring(2, 10)}`;
      set_generated_username(fallback_username);
      return fallback_username;
    }
  };

  // 다음 단계로
  const handle_next = async () => {
    if (step === 1) {
      if (!data.work_type || !data.job_category) {
        alert('모든 필드를 선택해주세요');
        return;
      }
    }

    if (step === 2) {
      if (!data.current_income || !data.target_income) {
        alert('현재 수입과 목표 금액을 선택해주세요');
        return;
      }
    }

    if (step === 3 && !data.experience_level) {
      alert('경험 수준을 선택해주세요');
      return;
    }

    if (step === 3) {
      // 온보딩 완료 - 프로필 저장
      await complete_onboarding();
    } else {
      set_step(step + 1);
    }
  };

  // 온보딩 완료 처리
  const complete_onboarding = async () => {
    if (!user) {
      return;
    }

    set_loading(true);
    try {
      // 먼저 사용자명 자동 생성
      const username = await generate_username();

      await apiPost('/api/user/profile', {
        id: user.id,
        username: username,
        work_type: data.work_type,
        job_category: data.job_category,
        current_income: data.current_income,
        target_income: data.target_income,
        experience_level: data.experience_level,
      });

      // 메인 페이지로 이동
      router.push('/');
    } catch (error) {
      console.error('Page error:', error);
      alert('프로필 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      set_loading(false);
    }
  };

  if (auth_loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all',
                  step >= i
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {step > i ? <Check className="h-5 w-5" /> : i}
              </div>
              {i < 3 && (
                <div
                  className={cn('w-20 h-1 transition-all', step > i ? 'bg-primary' : 'bg-muted')}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && '크리에이터 활동 형태를 알려주세요'}
              {step === 2 && '수익 목표를 설정해주세요'}
              {step === 3 && '경험 수준을 알려주세요'}
            </CardTitle>
            <CardDescription>
              {step === 1 && '본업인지 부업인지, 현재 직업은 무엇인지 알려주세요'}
              {step === 2 && '현재 월 수입과 목표로 하는 수입을 선택해주세요'}
              {step === 3 && '적합한 난이도의 강의를 추천해드릴게요'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: 본업/부업 + 직업 카테고리 */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    크리에이터 활동이 본업인가요, 부업인가요?{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={data.work_type}
                    onValueChange={(value) =>
                      set_data((prev) => ({ ...prev, work_type: value as 'main' | 'side' }))
                    }
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="main" id="main" />
                      <Label htmlFor="main" className="cursor-pointer flex-1">
                        <span className="font-medium">본업</span>
                        <p className="text-sm text-muted-foreground">
                          크리에이터 활동이 주 수입원이에요
                        </p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="side" id="side" />
                      <Label htmlFor="side" className="cursor-pointer flex-1">
                        <span className="font-medium">부업</span>
                        <p className="text-sm text-muted-foreground">
                          다른 일을 하면서 크리에이터 활동을 해요
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    현재 직업을 선택해주세요 <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {JOB_CATEGORIES.map((job) => (
                      <button
                        key={job.value}
                        onClick={() => set_data((prev) => ({ ...prev, job_category: job.value }))}
                        className={cn(
                          'p-4 rounded-lg border-2 text-left transition-all hover:shadow-md',
                          data.job_category === job.value
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-muted-foreground'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <job.icon className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{job.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: 수입 정보 */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    현재 월 평균 수입은 얼마인가요? <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={data.current_income}
                    onValueChange={(value) =>
                      set_data((prev) => ({ ...prev, current_income: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="수입 범위를 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_RANGES.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    크리에이터 활동으로 목표하는 월 수입은?{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={data.target_income}
                    onValueChange={(value) =>
                      set_data((prev) => ({ ...prev, target_income: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="목표 수입을 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_RANGES.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    목표 달성을 위한 맞춤형 강의와 전략을 추천해드릴게요!
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: 경험 수준 */}
            {step === 3 && (
              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => set_data((prev) => ({ ...prev, experience_level: level.value }))}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-all hover:shadow-md',
                      data.experience_level === level.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{level.icon}</span>
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold">{level.label}</p>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </div>
                      {data.experience_level === level.value && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => set_step(step - 1)} disabled={step === 1}>
                이전
              </Button>
              <Button onClick={handle_next} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 3 ? '시작하기' : '다음'}
                {step < 3 && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
