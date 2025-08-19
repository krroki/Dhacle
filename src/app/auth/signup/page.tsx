import { Award, Sparkles, Star, TrendingUp, Users, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { KakaoLoginButton } from '@/components/features/auth/KakaoLoginButton';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export const metadata: Metadata = {
  title: '회원가입 - 디하클',
  description: '디하클과 함께 성공적인 크리에이터가 되어보세요',
};

export default function SignupPage() {
  const features = [
    {
      icon: Zap,
      title: '빠른 시작',
      description: '복잡한 절차 없이 3초 만에 가입',
    },
    {
      icon: Star,
      title: '프리미엄 콘텐츠',
      description: '검증된 크리에이터의 노하우 전수',
    },
    {
      icon: TrendingUp,
      title: '실시간 트렌드',
      description: '최신 숏폼 트렌드 분석 제공',
    },
    {
      icon: Users,
      title: '활발한 커뮤니티',
      description: '1만+ 크리에이터와 함께 성장',
    },
    {
      icon: Award,
      title: '수익 인증',
      description: '투명한 수익 공개로 신뢰 구축',
    },
    {
      icon: Sparkles,
      title: 'AI 도구',
      description: '콘텐츠 제작을 위한 AI 도구 제공',
    },
  ];

  const stats = [
    { value: '10,000+', label: '활동 크리에이터' },
    { value: '500+', label: '강의 콘텐츠' },
    { value: '95%', label: '만족도' },
    { value: '24/7', label: '지원' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <h1 className="text-3xl font-bold text-primary">디하클</h1>
              </Link>
              <div className="space-y-2">
                <h2 className="text-4xl font-bold">
                  크리에이터 성공의
                  <br />
                  <span className="text-primary">첫 걸음</span>을 함께해요
                </h2>
                <p className="text-lg text-muted-foreground">
                  국내 최대 YouTube Shorts 교육 플랫폼
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 pt-6 border-t">
              {stats.map((stat, index) => (
                <div key={index} className="text-center space-y-1">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Signup Card */}
          <div className="lg:pl-12">
            <Card className="relative overflow-hidden border-2">
              {/* Special Badge */}
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  신규 가입 혜택
                </Badge>
              </div>

              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">무료로 시작하기</CardTitle>
                <p className="text-muted-foreground">지금 가입하고 특별 혜택을 받아보세요</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Special Offer */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">신규 가입 혜택</span>
                  </div>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>무료 강의 3개 즉시 해금</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>첫 구매 시 30% 할인 쿠폰</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      <span>프리미엄 커뮤니티 7일 체험</span>
                    </li>
                  </ul>
                </div>

                {/* Kakao Login Button */}
                <KakaoLoginButton variant="large" text="카카오톡으로 회원가입" className="w-full" />

                {/* Terms */}
                <p className="text-xs text-center text-muted-foreground">
                  회원가입 시{' '}
                  <Link href="/terms" className="underline underline-offset-2 hover:text-primary">
                    이용약관
                  </Link>{' '}
                  및{' '}
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-primary">
                    개인정보처리방침
                  </Link>
                  에 동의합니다
                </p>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground">
                      이미 회원이신가요?
                    </span>
                  </div>
                </div>

                {/* Login Link */}
                <Link
                  href="/auth/login"
                  className="block w-full text-center py-3 px-4 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  로그인하기
                </Link>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="text-green-500">🔒</span>
                <span>안전한 인증</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⚡</span>
                <span>3초 가입</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🎁</span>
                <span>신규 혜택</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
