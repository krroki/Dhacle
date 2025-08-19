import '@testing-library/jest-dom'
import { expect, afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { server } from '@/mocks/server'

// @testing-library/jest-dom matchers 추가
expect.extend(matchers)

// MSW 서버 설정
beforeAll(() => {
  // 테스트 환경에서 MSW 서버 시작
  server.listen({
    onUnhandledRequest: 'warn' // 핸들러가 없는 요청 경고
  })
})

// 각 테스트 후 클린업
afterEach(() => {
  // React Testing Library 클린업
  cleanup()
  // MSW 핸들러 리셋
  server.resetHandlers()
})

// 모든 테스트 종료 후
afterAll(() => {
  // MSW 서버 종료
  server.close()
})

// 전역 fetch 모킹 (필요시)
global.fetch = fetch

// Next.js 환경 변수 모킹
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Console 에러 억제 (필요시)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})