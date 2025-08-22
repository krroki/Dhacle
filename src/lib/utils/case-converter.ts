/**
 * API 경계 전용 snake/camel 변환 유틸리티
 * React/라이브러리 예약어를 보호하면서 데이터 키만 변환
 */

import {
  camelToSnakeCase as baseCamelToSnake,
  snakeToCamelCase as baseSnakeToCamel,
} from './db-types';

/**
 * API 응답을 camelCase로 변환 (React 예약어 보호)
 */
export function snakeToCamelCase<T>(obj: T): T {
  // React 컴포넌트나 라이브러리 객체는 변환하지 않음
  if (obj && typeof obj === 'object' && 'displayName' in obj) {
    return obj;
  }

  // 기본 변환 함수 사용
  return baseSnakeToCamel(obj) as T;
}

/**
 * API 요청 데이터를 snake_case로 변환 (React 예약어 보호)
 */
export function camelToSnakeCase<T>(obj: T): T {
  // React 컴포넌트나 라이브러리 객체는 변환하지 않음
  if (obj && typeof obj === 'object' && 'displayName' in obj) {
    return obj;
  }

  // 기본 변환 함수 사용
  return baseCamelToSnake(obj) as T;
}

// 기존 함수와의 호환성을 위해 re-export
export { snakeToCamelCase as snakeToCamel, camelToSnakeCase as camelToSnake };
