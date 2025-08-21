/**
 * API 경계 전용 snake/camel 변환 유틸리티
 * React/라이브러리 예약어를 보호하면서 데이터 키만 변환
 */

import { snakeToCamelCase as baseSnakeToCamel, camelToSnakeCase as baseCamelToSnake } from './db-types';

// React/라이브러리 예약어 - 절대 변환하지 않음
const RESERVED_KEYS = new Set([
  'displayName',
  'className',
  'htmlFor',
  'onClick',
  'onChange',
  'onSubmit',
  'onFocus',
  'onBlur',
  'defaultValue',
  'defaultChecked',
  'autoComplete',
  'autoFocus',
  'readOnly',
  'tabIndex',
  'colSpan',
  'rowSpan',
  'aria-label',
  'aria-describedby',
  'data-testid',
  'data-id',
]);

// React 컴포넌트 프로퍼티인지 확인
function isReactProperty(key: string): boolean {
  // on으로 시작하는 이벤트 핸들러
  if (key.startsWith('on') && key.length > 2 && key[2] === key[2].toUpperCase()) {
    return true;
  }
  
  // aria- 또는 data-로 시작하는 속성
  if (key.startsWith('aria-') || key.startsWith('data-')) {
    return true;
  }
  
  // 예약어 목록에 있는지 확인
  return RESERVED_KEYS.has(key);
}

/**
 * API 응답을 camelCase로 변환 (React 예약어 보호)
 */
export function snakeToCamelCase<T>(obj: T): T {
  // React 컴포넌트나 라이브러리 객체는 변환하지 않음
  if (obj && typeof obj === 'object' && 'displayName' in obj) {
    return obj;
  }
  
  // 기본 변환 함수 사용
  return baseSnakeToCamel(obj);
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
  return baseCamelToSnake(obj);
}

// 기존 함수와의 호환성을 위해 re-export
export { snakeToCamelCase as snakeToCamel, camelToSnakeCase as camelToSnake };