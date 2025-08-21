import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW Server Setup
 * Node.js 환경(테스트, SSR)에서 API 요청을 가로챕니다.
 */
export const server = setupServer(...handlers);
