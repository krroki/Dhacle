/**
 * 🔐 Rate Limiter
 * Wave 3: API 호출 제한 구현
 * 
 * IP 기반 및 사용자 기반 rate limiting을 제공합니다.
 * 메모리 저장소를 사용하여 간단하게 구현되었습니다.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // 메모리 정리를 위한 인터벌 설정 (5분마다)
    setInterval(() => this.cleanup(), 300000);
  }

  /**
   * Rate limit 체크
   * @param identifier IP 주소 또는 사용자 ID
   * @returns 허용 여부와 정보
   */
  check(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    limit: number;
  } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // 새로운 엔트리이거나 윈도우가 만료된 경우
    if (!entry || entry.resetTime <= now) {
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
        limit: this.maxRequests,
      };
    }

    // 제한 확인
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        limit: this.maxRequests,
      };
    }

    // 카운트 증가
    entry.count++;
    this.store.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
      limit: this.maxRequests,
    };
  }

  /**
   * 만료된 엔트리 정리
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.store.forEach((entry, key) => {
      if (entry.resetTime <= now) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.store.delete(key));
  }

  /**
   * 특정 식별자의 제한 초기화
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * 전체 저장소 초기화
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * 현재 저장된 엔트리 수
   */
  get size(): number {
    return this.store.size;
  }
}

// Rate limiter 인스턴스들
export const apiRateLimiter = new RateLimiter(60000, 60); // 분당 60회
export const authRateLimiter = new RateLimiter(900000, 5); // 15분당 5회 (로그인 시도)
export const uploadRateLimiter = new RateLimiter(3600000, 10); // 시간당 10회 (파일 업로드)

// IP 주소 추출 헬퍼
export function getClientIp(request: Request): string {
  // Vercel/Cloudflare 헤더 확인
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // 기본값
  return 'unknown';
}

// Rate limit 응답 생성 헬퍼
export function createRateLimitResponse(resetTime: number): Response {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      },
    }
  );
}

export default RateLimiter;