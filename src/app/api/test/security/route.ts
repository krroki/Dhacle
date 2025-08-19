import { NextResponse } from 'next/server';

/**
 * 보안 테스트 엔드포인트
 * - Rate limiting 확인
 * - XSS 방지 확인
 * - 입력 검증 확인
 */
export async function GET(request: Request) {
  return NextResponse.json({
    message: 'Security test endpoint',
    timestamp: new Date().toISOString(),
    headers: {
      cacheControl: request.headers.get('cache-control'),
      xFrameOptions: request.headers.get('x-frame-options'),
      xContentTypeOptions: request.headers.get('x-content-type-options'),
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // XSS 테스트를 위한 응답
    return NextResponse.json({
      echo: body,
      processed: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}