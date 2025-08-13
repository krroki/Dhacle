import { Metadata } from 'next'
import Link from 'next/link'
import { KakaoLoginButton } from '@/components/features/auth/KakaoLoginButton'
import { Card, CardContent } from '@/components/ui'
import { CheckCircle2, Clock, Trophy, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: '로그인 - 디하클',
  description: '디하클에 로그인하여 크리에이터 교육을 시작하세요',
}

export default function LoginPage() {
  const benefits = [
    {
      icon: Clock,
      text: '3초 간편 회원가입',
      description: '복잡한 절차 없이 카카오 계정으로 바로 시작'
    },
    {
      icon: Trophy,
      text: '무료 강의 즉시 시청',
      description: '회원가입 즉시 모든 무료 강의 접근 가능'
    },
    {
      icon: Users,
      text: '수익인증 열람',
      description: '실제 크리에이터들의 수익 인증 확인'
    },
    {
      icon: CheckCircle2,
      text: '커뮤니티 참여',
      description: '크리에이터들과 함께 성장하는 커뮤니티'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-primary">디하클</h1>
          </Link>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">크리에이터의 꿈을</h2>
            <h2 className="text-2xl font-semibold">현실로 만들어요</h2>
          </div>
          <p className="text-muted-foreground">
            YouTube Shorts 크리에이터를 위한 최고의 교육 플랫폼
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-2">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <KakaoLoginButton 
                variant="large"
                text="카카오톡으로 3초 만에 시작하기"
                className="w-full"
              />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    간편 로그인
                  </span>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                별도의 회원가입 없이 카카오 계정으로
                <br />
                바로 시작할 수 있습니다
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="space-y-4">
          <h3 className="text-center text-lg font-semibold">
            디하클 회원 혜택
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="flex flex-col items-center text-center space-y-2 p-4 rounded-lg border bg-card">
                  <Icon className="h-8 w-8 text-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{benefit.text}</p>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            로그인 시{' '}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              이용약관
            </Link>
            {' '}및{' '}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              개인정보처리방침
            </Link>
            에 동의합니다
          </p>
        </div>
      </div>
    </div>
  )
}