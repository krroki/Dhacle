'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/browser-client'
import { StripeCard, StripeTypography, StripeButton } from '@/components/design-system'
import type { Database } from '@/types/database.types'

type UserProfile = Database['public']['Tables']['users']['Row']

export default function MyPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <StripeCard>
          <StripeTypography variant="body">프로필을 불러올 수 없습니다</StripeTypography>
        </StripeCard>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: '프로필', emoji: '👤' },
    { id: 'courses', label: '내 강의', emoji: '📚' },
    { id: 'revenue', label: '수익 인증', emoji: '💰' },
    { id: 'settings', label: '설정', emoji: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <StripeTypography variant="h1" className="mb-2">
            마이페이지
          </StripeTypography>
          <StripeTypography variant="body" color="muted">
            프로필 정보와 활동 내역을 관리하세요
          </StripeTypography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <StripeCard className="p-6">
              {/* Profile Summary */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  {profile.full_name?.[0] || profile.username?.[0] || '?'}
                </div>
                <StripeTypography variant="h3" className="mb-1">
                  {profile.full_name || profile.username}
                </StripeTypography>
                <StripeTypography variant="caption" color="muted">
                  @{profile.username}
                </StripeTypography>
                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    profile.role === 'admin' ? 'bg-red-100 text-red-800' :
                    profile.role === 'instructor' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {profile.role === 'admin' ? '관리자' :
                     profile.role === 'instructor' ? '강사' : '일반 회원'}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-xl">{tab.emoji}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Logout Button */}
              <div className="mt-6 pt-6 border-t">
                <StripeButton
                  variant="ghost"
                  fullWidth
                  onClick={handleLogout}
                  className="text-red-600 hover:bg-red-50"
                >
                  로그아웃
                </StripeButton>
              </div>
            </StripeCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <StripeCard className="p-6">
              {activeTab === 'profile' && (
                <div>
                  <StripeTypography variant="h2" className="mb-6">
                    프로필 정보
                  </StripeTypography>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          이메일
                        </label>
                        <div className="text-gray-900">{profile.email}</div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          닉네임
                        </label>
                        <div className="text-gray-900">@{profile.username}</div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          이름
                        </label>
                        <div className="text-gray-900">{profile.full_name || '-'}</div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          가입일
                        </label>
                        <div className="text-gray-900">
                          {new Date(profile.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    </div>

                    {/* Channel Information */}
                    <div className="pt-4 border-t">
                      <StripeTypography variant="h3" className="mb-4">
                        채널 정보
                      </StripeTypography>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            YouTube 채널명
                          </label>
                          <div className="text-gray-900">{profile.channel_name || '미연동'}</div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            채널 URL
                          </label>
                          {profile.channel_url ? (
                            <a href={profile.channel_url} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:underline">
                              {profile.channel_url}
                            </a>
                          ) : (
                            <div className="text-gray-500">-</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="pt-4 border-t">
                      <StripeTypography variant="h3" className="mb-4">
                        활동 통계
                      </StripeTypography>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            {profile.total_revenue ? 
                              `₩${profile.total_revenue.toLocaleString()}` : '₩0'}
                          </div>
                          <div className="text-sm text-gray-600">총 수익</div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">0</div>
                          <div className="text-sm text-gray-600">수강 중인 강의</div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">0</div>
                          <div className="text-sm text-gray-600">수익 인증</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <StripeButton variant="primary" onClick={() => router.push('/mypage/settings')}>
                        프로필 수정
                      </StripeButton>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'courses' && (
                <div>
                  <StripeTypography variant="h2" className="mb-6">
                    내 강의
                  </StripeTypography>
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">📚</div>
                    <StripeTypography variant="body" color="muted">
                      아직 수강 중인 강의가 없습니다
                    </StripeTypography>
                    <div className="mt-4">
                      <StripeButton variant="primary" onClick={() => router.push('/courses')}>
                        강의 둘러보기
                      </StripeButton>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'revenue' && (
                <div>
                  <StripeTypography variant="h2" className="mb-6">
                    수익 인증
                  </StripeTypography>
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">💰</div>
                    <StripeTypography variant="body" color="muted">
                      아직 수익 인증 내역이 없습니다
                    </StripeTypography>
                    <div className="mt-4">
                      <StripeButton variant="primary" onClick={() => router.push('/community/revenue')}>
                        수익 인증하기
                      </StripeButton>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <StripeTypography variant="h2" className="mb-6">
                    설정
                  </StripeTypography>
                  <div className="space-y-4">
                    <StripeButton variant="secondary" fullWidth 
                                 onClick={() => router.push('/mypage/settings')}>
                      프로필 수정
                    </StripeButton>
                    <StripeButton variant="secondary" fullWidth>
                      알림 설정
                    </StripeButton>
                    <StripeButton variant="secondary" fullWidth>
                      개인정보 보호
                    </StripeButton>
                    <div className="pt-4 border-t">
                      <StripeButton variant="ghost" fullWidth className="text-red-600 hover:bg-red-50">
                        회원 탈퇴
                      </StripeButton>
                    </div>
                  </div>
                </div>
              )}
            </StripeCard>
          </div>
        </div>
      </div>
    </div>
  )
}