/**
 * 개발 서버 URL 동적 감지 유틸리티
 * Next.js 개발 서버가 실행 중인 포트를 자동으로 찾아서 반환
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 실행 중인 Next.js 개발 서버의 URL을 찾음
 * @returns 서버 URL (예: http://localhost:3000)
 */
export async function getRunningServerUrl(): Promise<string> {
  // 환경변수에서 먼저 확인
  if (process.env.PLAYWRIGHT_BASE_URL) {
    console.log(`📍 환경변수에서 URL 사용: ${process.env.PLAYWRIGHT_BASE_URL}`);
    return process.env.PLAYWRIGHT_BASE_URL;
  }

  // Windows에서 실행 중인 Next.js 서버 찾기
  try {
    // netstat을 사용하여 LISTENING 상태의 포트 찾기
    const { stdout } = await execAsync('netstat -an | findstr LISTENING | findstr :300 | findstr 127.0.0.1');
    
    // 포트 번호 추출 (3000번대 포트)
    const matches = stdout.match(/127\.0\.0\.1:(\d{4})/g);
    if (matches && matches.length > 0) {
      // 3000번대 포트 찾기
      for (const match of matches) {
        const port = match.split(':')[1];
        if (port.startsWith('300')) {
          // 해당 포트가 실제로 Next.js 서버인지 확인
          try {
            const response = await fetch(`http://localhost:${port}`);
            if (response.ok || response.status === 404 || response.status === 500) {
              console.log(`✅ Next.js 서버 발견: http://localhost:${port}`);
              return `http://localhost:${port}`;
            }
          } catch (error) {
            // 연결 실패는 무시하고 다음 포트 시도
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.log('⚠️ netstat 명령 실패, 기본 포트 시도');
  }

  // 일반적인 개발 서버 포트 시도
  const commonPorts = [3000, 3001, 3002, 3003];
  
  for (const port of commonPorts) {
    try {
      const response = await fetch(`http://localhost:${port}`);
      if (response.ok || response.status === 404 || response.status === 500) {
        console.log(`✅ 포트 ${port}에서 서버 발견`);
        return `http://localhost:${port}`;
      }
    } catch (error) {
      // 연결 실패는 무시하고 다음 포트 시도
    }
  }

  // 기본값 반환
  console.log('⚠️ 실행 중인 서버를 찾을 수 없음, 기본값 사용: http://localhost:3000');
  return 'http://localhost:3000';
}

/**
 * 서버가 준비될 때까지 대기
 * @param url 서버 URL
 * @param maxAttempts 최대 시도 횟수
 * @param delay 시도 간격 (ms)
 */
export async function waitForServer(
  url: string,
  maxAttempts: number = 30,
  delay: number = 1000
): Promise<boolean> {
  console.log(`⏳ 서버 준비 대기 중: ${url}`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404 || response.status === 500) {
        console.log(`✅ 서버 준비 완료 (시도 ${attempt}/${maxAttempts})`);
        return true;
      }
    } catch (error) {
      // 연결 실패는 예상되는 상황
    }
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log('❌ 서버 준비 타임아웃');
  return false;
}