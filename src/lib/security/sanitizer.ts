/**
 * 🔐 XSS Prevention Sanitizer
 * Wave 3: XSS 방지를 위한 HTML sanitization
 *
 * DOMPurify를 사용하여 사용자 입력을 안전하게 정화합니다.
 */

import DOMPurify from 'isomorphic-dompurify';
import { logger } from '@/lib/logger';

// ============================================
// Sanitization 설정
// ============================================

// 기본 허용 태그 (일반 텍스트용)
const BASIC_ALLOWED_TAGS = [
  'b',
  'i',
  'em',
  'strong',
  'a',
  'br',
  'p',
  'span',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
];

// 리치 텍스트 허용 태그 (에디터용)
const RICH_ALLOWED_TAGS = [
  ...BASIC_ALLOWED_TAGS,
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'img',
  'video',
  'audio',
  'iframe',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'div',
  'section',
  'article',
  'header',
  'footer',
];

// 허용 속성
const ALLOWED_ATTRIBUTES = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  video: ['src', 'width', 'height', 'controls'],
  audio: ['src', 'controls'],
  iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
  '*': ['class', 'id', 'style'],
};

// 위험한 프로토콜 차단
const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;

// ============================================
// Sanitization 함수
// ============================================

/**
 * 기본 텍스트 sanitization
 * 댓글, 제목 등 간단한 텍스트용
 */
export function sanitizeBasicHTML(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: BASIC_ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOWED_URI_REGEXP,
  });
}

/**
 * 리치 텍스트 sanitization
 * 게시글 본문, 에디터 콘텐츠용
 */
export function sanitizeRichHTML(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: RICH_ALLOWED_TAGS,
    ALLOWED_ATTR: Object.keys(ALLOWED_ATTRIBUTES).reduce((acc, tag) => {
      if (tag === '*') {
        return [...acc, ...ALLOWED_ATTRIBUTES[tag]];
      }
      return acc;
    }, [] as string[]),
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOWED_URI_REGEXP,
    ADD_TAGS: ['iframe'], // YouTube 임베드 등을 위해
    ADD_ATTR: ['allowfullscreen', 'frameborder'],
    FORBID_TAGS: ['script', 'style', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

/**
 * 순수 텍스트 추출
 * HTML 태그를 모두 제거하고 텍스트만 추출
 */
export function sanitizePlainText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // 모든 HTML 태그 제거
  const cleaned = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  // 추가 정리: 연속된 공백 제거, 트림
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * URL sanitization
 * URL 파라미터나 경로를 안전하게 처리
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const parsed = new URL(url);

    // 허용된 프로토콜만
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return '';
    }

    return parsed.toString();
  } catch (error) {
    logger.warn('Sanitization failed', {
      operation: 'sanitizeURL',
      metadata: { error }
    });
    // 상대 경로인 경우
    if (url.startsWith('/') && !url.startsWith('//')) {
      return encodeURI(url);
    }

    return '';
  }
}

/**
 * 파일명 sanitization
 * 업로드 파일명을 안전하게 처리
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  // 위험한 문자 제거
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '_') // 연속된 점 제거 (디렉토리 traversal 방지)
    .substring(0, 255); // 최대 길이 제한
}

/**
 * JSON 데이터 sanitization
 * API 응답이나 저장할 JSON 데이터 정화
 */
export function sanitizeJSON(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizePlainText(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeJSON(item));
  }

  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        // 키도 sanitize
        const clean_key = sanitizePlainText(key);
        cleaned[clean_key] = sanitizeJSON((obj as Record<string, unknown>)[key]);
      }
    }
    return cleaned;
  }

  return obj;
}

/**
 * SQL Injection 방지용 이스케이프
 * 주의: 가능하면 파라미터화된 쿼리 사용 권장
 */
export function escapeSQL(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x00/g, '\\x00')
    .replace(/\x1a/g, '\\x1a');
}

/**
 * 마크다운 sanitization
 * 마크다운 콘텐츠를 안전하게 처리
 */
export function sanitizeMarkdown(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  // 위험한 마크다운 패턴 제거
  return markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, ''); // 이벤트 핸들러 제거
}

// ============================================
// 헬퍼 함수
// ============================================

/**
 * 객체의 모든 문자열 값을 sanitize
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  sanitizer: (str: string) => string = sanitizeBasicHTML
): T {
  const cleaned = {} as T;

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        cleaned[key] = sanitizer(value) as T[Extract<keyof T, string>];
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = sanitizeObject(value as Record<string, unknown>, sanitizer) as T[Extract<
          keyof T,
          string
        >];
      } else {
        cleaned[key] = value as T[Extract<keyof T, string>];
      }
    }
  }

  return cleaned;
}

/**
 * Content Security Policy 헤더 생성
 */
export function generateCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.youtube.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.googleapis.com",
    "media-src 'self' https: blob:",
    "frame-src 'self' https://www.youtube.com https://youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

// ============================================
// 익스포트
// ============================================

export default {
  sanitizeBasicHTML,
  sanitizeRichHTML,
  sanitizePlainText,
  sanitizeURL,
  sanitizeFilename,
  sanitizeJSON,
  escapeSQL,
  sanitizeMarkdown,
  sanitizeObject,
  generateCSPHeader,
};
