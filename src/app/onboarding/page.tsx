'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/browser-client'
import { StripeButton } from '@/components/design-system/StripeButton'
import { StripeCard } from '@/components/design-system/StripeCard'
import { StripeTypography } from '@/components/design-system/StripeTypography'
import { StripeInput } from '@/components/design-system/StripeInput'
import type { Database } from '@/types/database.types'

const CATEGORIES = [
  { id: 'shorts', label: '쇼츠 제작', emoji: '📱' },
  { id: 'marketing', label: '마케팅', emoji: '📈' },
  { id: 'editing', label: '영상 편집', emoji: '✂️' },
  { id: 'monetization', label: '수익화', emoji: '💰' },
  { id: 'analytics', label: '분석', emoji: '📊' },
  { id: 'thumbnail', label: '썸네일', emoji: '🎨' },
  { id: 'storytelling', label: '스토리텔링', emoji: '📝' },
  { id: 'trend', label: '트렌드', emoji: '🔥' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  
  const [loading, setLoading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    channel_name: '',
    channel_url: '',
    categories: [] as string[],
    terms_agreed: false,
    privacy_agreed: false,
  })
  
  // 초기 데이터 로드 (카카오 정보 활용)
  useEffect(() => {
    const loadInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // 카카오에서 받은 정보로 초기값 설정
        const nickname = user.user_metadata?.profile_nickname || 
                        user.user_metadata?.nickname || ''
        
        setFormData(prev => ({
          ...prev,
          full_name: nickname,
          username: nickname.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        }))
      }
    }
    
    loadInitialData()
  }, [])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username || formData.username.length < 3) {
        setUsernameAvailable(null)
        return
      }

      setCheckingUsername(true)
      try {
        const response = await fetch('/api/user/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username }),
        })
        
        const data = await response.json()
        setUsernameAvailable(data.available)
      } catch (error) {
        console.error('Error checking username:', error)
      } finally {
        setCheckingUsername(false)
      }
    }

    const timer = setTimeout(checkUsername, 500)
    return () => clearTimeout(timer)
  }, [formData.username])

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = '닉네임은 3자 이상이어야 합니다'
    }
    if (!usernameAvailable && formData.username) {
      newErrors.username = '이미 사용중인 닉네임입니다'
    }
    if (!formData.full_name) {
      newErrors.full_name = '이름을 입력해주세요'
    }
    if (formData.categories.length === 0) {
      newErrors.categories = '관심 카테고리를 하나 이상 선택해주세요'
    }
    if (!formData.terms_agreed) {
      newErrors.terms = '서비스 이용약관에 동의해주세요'
    }
    if (!formData.privacy_agreed) {
      newErrors.privacy = '개인정보 처리방침에 동의해주세요'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      // Update user profile
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          full_name: formData.full_name,
          channel_name: formData.channel_name || null,
          channel_url: formData.channel_url || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Redirect to home page
      router.push('/')
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrors({ submit: '프로필 업데이트에 실패했습니다. 다시 시도해주세요.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <StripeCard elevation="lg" className="p-8">
          <div className="text-center mb-8">
            <StripeTypography variant="h1" className="mb-4">
              디하클에 오신 것을 환영합니다! 🎉
            </StripeTypography>
            <StripeTypography variant="body" color="muted">
              몇 가지 정보만 입력하면 바로 시작할 수 있어요
            </StripeTypography>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                닉네임 *
              </label>
              <StripeInput
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="dhacle_creator"
                hint={
                  checkingUsername ? '확인 중...' :
                  usernameAvailable === true ? '✅ 사용 가능한 닉네임입니다' :
                  usernameAvailable === false ? '❌ 이미 사용중인 닉네임입니다' :
                  errors.username || '영문, 숫자, 언더스코어(_)만 사용 가능'
                }
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 *
              </label>
              <StripeInput
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="홍길동"
                hint={errors.full_name}
              />
            </div>

            {/* YouTube Channel (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube 채널명 (선택)
              </label>
              <StripeInput
                value={formData.channel_name}
                onChange={(e) => setFormData({ ...formData, channel_name: e.target.value })}
                placeholder="디하클 TV"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube 채널 URL (선택)
              </label>
              <StripeInput
                value={formData.channel_url}
                onChange={(e) => setFormData({ ...formData, channel_url: e.target.value })}
                placeholder="https://youtube.com/@dhacle"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                관심 카테고리 * (복수 선택 가능)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${formData.categories.includes(category.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{category.emoji}</div>
                    <div className="text-sm font-medium">{category.label}</div>
                  </button>
                ))}
              </div>
              {errors.categories && (
                <p className="mt-2 text-sm text-red-600">{errors.categories}</p>
              )}
            </div>

            {/* Terms */}
            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.terms_agreed}
                  onChange={(e) => setFormData({ ...formData, terms_agreed: e.target.checked })}
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                    서비스 이용약관
                  </a>
                  에 동의합니다 *
                </span>
              </label>
              {errors.terms && (
                <p className="text-sm text-red-600">{errors.terms}</p>
              )}

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.privacy_agreed}
                  onChange={(e) => setFormData({ ...formData, privacy_agreed: e.target.checked })}
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                    개인정보 처리방침
                  </a>
                  에 동의합니다 *
                </span>
              </label>
              {errors.privacy && (
                <p className="text-sm text-red-600">{errors.privacy}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <StripeButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading || checkingUsername}
            >
              {loading ? '처리 중...' : '시작하기'}
            </StripeButton>
          </form>
        </StripeCard>
      </div>
    </div>
  )
}