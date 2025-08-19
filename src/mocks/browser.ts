import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * MSW Browser Worker Setup
 * 브라우저 환경에서 Service Worker를 통해 API 요청을 가로챕니다.
 */
export const worker = setupWorker(...handlers)