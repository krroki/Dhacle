'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TestLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleTestLogin = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ ' + data.message)
        // 잠시 후 리다이렉트
        setTimeout(() => {
          router.push(data.redirect || '/mypage/profile')
        }, 1000)
      } else {
        setMessage('❌ ' + (data.error || '로그인 실패'))
      }
    } catch (error) {
      console.error('Test login error:', error)
      setMessage('❌ 테스트 로그인 중 오류 발생')
    } finally {
      setLoading(false)
    }
  }

  // 개발 환경이 아닌 경우 경고 표시
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            ⚠️ 접근 불가
          </h1>
          <p className="text-gray-600">
            이 페이지는 개발 환경에서만 사용 가능합니다.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🧪 테스트 로그인
        </h1>
        <p className="text-gray-600 mb-6">
          개발 환경 전용 테스트 로그인 페이지입니다.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ 주의:</strong> 이것은 개발 전용 테스트 로그인입니다.
            실제 인증은 수행하지 않으며, 테스트 세션만 생성합니다.
          </p>
        </div>

        <button
          onClick={handleTestLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              로그인 중...
            </span>
          ) : (
            '🧪 테스트 로그인'
          )}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            message.startsWith('✅') 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            테스트 계정 정보:
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>이메일: test-user@dhacle.com</p>
            <p>역할: 일반 사용자 (authenticated)</p>
            <p>세션 유효기간: 24시간</p>
          </div>
        </div>
      </div>
    </div>
  )
}