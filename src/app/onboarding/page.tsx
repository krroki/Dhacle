'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { createBrowserClient } from '@/lib/supabase/browser-client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ArrowRight, Check, User, Target, Sparkles, Loader2 } from 'lucide-react'

interface OnboardingData {
  username: string
  fullName: string
  interests: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | ''
}

const INTERESTS = [
  { id: 'youtube', label: 'YouTube Shorts', icon: '📹' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'instagram', label: 'Instagram Reels', icon: '📷' },
  { id: 'editing', label: '영상 편집', icon: '✂️' },
  { id: 'thumbnail', label: '썸네일 제작', icon: '🎨' },
  { id: 'monetization', label: '수익화', icon: '💰' },
]

const EXPERIENCE_LEVELS = [
  { 
    value: 'beginner', 
    label: '초급', 
    description: '이제 막 시작했어요',
    icon: '🌱'
  },
  { 
    value: 'intermediate', 
    label: '중급', 
    description: '1년 미만 경험이 있어요',
    icon: '🌿'
  },
  { 
    value: 'advanced', 
    label: '고급', 
    description: '1년 이상 경험이 있어요',
    icon: '🌳'
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = createBrowserClient()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [data, setData] = useState<OnboardingData>({
    username: '',
    fullName: '',
    interests: [],
    experienceLevel: ''
  })

  // 인증 확인
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // 사용자명 중복 체크
  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameError('사용자명은 3자 이상이어야 합니다')
      return false
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('영문, 숫자, 언더스코어(_)만 사용 가능합니다')
      return false
    }

    setCheckingUsername(true)
    try {
      const response = await fetch('/api/user/check-username?' + new URLSearchParams({ username }))
      const { available } = await response.json()
      
      if (!available) {
        setUsernameError('이미 사용 중인 사용자명입니다')
        return false
      }
      
      setUsernameError('')
      return true
    } catch (error) {
      console.error('사용자명 체크 에러:', error)
      setUsernameError('사용자명 확인 중 오류가 발생했습니다')
      return false
    } finally {
      setCheckingUsername(false)
    }
  }

  // 다음 단계로
  const handleNext = async () => {
    if (step === 1) {
      if (!data.username || !data.fullName) {
        alert('모든 필드를 입력해주세요')
        return
      }
      
      const isValid = await checkUsername(data.username)
      if (!isValid) return
    }
    
    if (step === 2 && data.interests.length === 0) {
      alert('최소 1개 이상의 관심 분야를 선택해주세요')
      return
    }
    
    if (step === 3 && !data.experienceLevel) {
      alert('경험 수준을 선택해주세요')
      return
    }

    if (step === 3) {
      // 온보딩 완료 - 프로필 저장
      await completeOnboarding()
    } else {
      setStep(step + 1)
    }
  }

  // 온보딩 완료 처리
  const completeOnboarding = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          username: data.username,
          full_name: data.fullName,
          interests: data.interests,
          experience_level: data.experienceLevel,
        })
      })

      if (!response.ok) {
        throw new Error('프로필 생성 실패')
      }

      // 메인 페이지로 이동
      router.push('/')
    } catch (error) {
      console.error('온보딩 에러:', error)
      alert('프로필 생성 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  // 관심 분야 토글
  const toggleInterest = (interest: string) => {
    setData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
                  className={cn(
                    'w-20 h-1 transition-all',
                    step > i ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && '기본 정보를 입력해주세요'}
              {step === 2 && '관심 분야를 선택해주세요'}
              {step === 3 && '경험 수준을 알려주세요'}
            </CardTitle>
            <CardDescription>
              {step === 1 && '디하클에서 사용할 프로필 정보입니다'}
              {step === 2 && '맞춤형 콘텐츠를 추천해드리기 위해 필요해요'}
              {step === 3 && '적합한 난이도의 강의를 추천해드릴게요'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: 기본 정보 */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">
                    사용자명 (ID) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="username"
                    placeholder="예: creator_kim"
                    value={data.username}
                    onChange={(e) => {
                      setData(prev => ({ ...prev, username: e.target.value }))
                      setUsernameError('')
                    }}
                    onBlur={() => data.username && checkUsername(data.username)}
                    className={cn(usernameError && 'border-destructive')}
                  />
                  {usernameError && (
                    <p className="text-sm text-destructive">{usernameError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    영문, 숫자, 언더스코어(_)만 사용 가능합니다
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    이름 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="실명 또는 활동명"
                    value={data.fullName}
                    onChange={(e) => setData(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Step 2: 관심 분야 */}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 text-left transition-all hover:shadow-md',
                      data.interests.includes(interest.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{interest.icon}</span>
                      <div className="space-y-1">
                        <p className="font-medium">{interest.label}</p>
                        {data.interests.includes(interest.id) && (
                          <Badge variant="secondary" className="text-xs">
                            선택됨
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: 경험 수준 */}
            {step === 3 && (
              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setData(prev => ({ ...prev, experienceLevel: level.value as any }))}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-all hover:shadow-md',
                      data.experienceLevel === level.value
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
                      {data.experienceLevel === level.value && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                이전
              </Button>
              <Button
                onClick={handleNext}
                disabled={loading || checkingUsername}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 3 ? '시작하기' : '다음'}
                {step < 3 && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}