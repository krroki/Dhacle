/**
 * 데이터베이스 타입 변환 유틸리티
 * snake_case (DB) ↔ camelCase (Frontend) 자동 변환
 *
 * Single Source of Truth: Supabase 자동 생성 타입 기반
 * Type Safety: 제네릭 타입으로 any 타입 제거
 */

// ============= Type-level Transformations =============

/**
 * String literal type을 snake_case에서 camelCase로 변환
 * @example SnakeToCamel<"user_id"> = "userId"
 */
type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S;

/**
 * String literal type을 camelCase에서 snake_case로 변환
 * @example CamelToSnake<"userId"> = "user_id"
 */
type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Uncapitalize<T>}${CamelToSnake<U>}`
    : `${Uncapitalize<T>}_${CamelToSnake<Uncapitalize<U>>}`
  : S;

/**
 * 객체의 모든 키를 snake_case에서 camelCase로 변환 (재귀적)
 */
export type SnakeToCamelCase<T> = T extends Array<infer U>
  ? Array<SnakeToCamelCase<U>>
  : T extends object
    ? {
        [K in keyof T as SnakeToCamel<K & string>]: SnakeToCamelCase<T[K]>;
      }
    : T;

/**
 * 객체의 모든 키를 camelCase에서 snake_case로 변환 (재귀적)
 */
export type CamelToSnakeCase<T> = T extends Array<infer U>
  ? Array<CamelToSnakeCase<U>>
  : T extends object
    ? {
        [K in keyof T as CamelToSnake<K & string>]: CamelToSnakeCase<T[K]>;
      }
    : T;

// ============= Runtime Transformations =============

/**
 * 문자열을 snake_case에서 camelCase로 변환
 */
function snakeToCamelString(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 문자열을 camelCase에서 snake_case로 변환
 */
function camelToSnakeString(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * 객체의 키를 snake_case에서 camelCase로 변환 (재귀적)
 * @param obj DB에서 가져온 snake_case 객체
 * @returns camelCase로 변환된 객체
 */
export function snakeToCamelCase<T>(obj: T): SnakeToCamelCase<T> {
  if (obj === null || obj === undefined) {
    return obj as SnakeToCamelCase<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamelCase(item)) as SnakeToCamelCase<T>;
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamelString(key);
      result[camelKey] = snakeToCamelCase(value);
    }

    return result as SnakeToCamelCase<T>;
  }

  return obj as SnakeToCamelCase<T>;
}

/**
 * 객체의 키를 camelCase에서 snake_case로 변환 (재귀적)
 * @param obj Frontend의 camelCase 객체
 * @returns snake_case로 변환된 객체 (DB 저장용)
 */
export function camelToSnakeCase<T>(obj: T): CamelToSnakeCase<T> {
  if (obj === null || obj === undefined) {
    return obj as CamelToSnakeCase<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnakeCase(item)) as CamelToSnakeCase<T>;
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnakeString(key);
      result[snakeKey] = camelToSnakeCase(value);
    }

    return result as CamelToSnakeCase<T>;
  }

  return obj as CamelToSnakeCase<T>;
}

// ============= Partial Transformations (for updates) =============

/**
 * Partial 객체 변환 (UPDATE 작업용)
 */
export function partialSnakeToCamel<T>(obj: Partial<T>): Partial<SnakeToCamelCase<T>> {
  return snakeToCamelCase(obj) as Partial<SnakeToCamelCase<T>>;
}

export function partialCamelToSnake<T>(obj: Partial<T>): Partial<CamelToSnakeCase<T>> {
  return camelToSnakeCase(obj) as Partial<CamelToSnakeCase<T>>;
}

// ============= Safe Property Access =============

/**
 * snake_case와 camelCase 모두 안전하게 접근
 * @param obj 객체
 * @param camelKey camelCase 키
 * @param snakeKey snake_case 키 (옵션)
 */
export function safeGet<T extends Record<string, unknown>>(
  obj: T,
  camelKey: string,
  snakeKey?: string
): unknown {
  // Try camelCase first
  if (camelKey in obj) {
    return obj[camelKey];
  }

  // Try snake_case
  const snake = snakeKey || camelToSnakeString(camelKey);
  if (snake in obj) {
    return obj[snake];
  }

  // Try the reverse (in case the key is already snake_case)
  const camel = snakeToCamelString(camelKey);
  if (camel in obj) {
    return obj[camel];
  }

  return undefined;
}

// ============= Batch Transformations =============

/**
 * 여러 객체를 한번에 변환
 */
export function batchSnakeToCamel<T>(items: T[]): SnakeToCamelCase<T>[] {
  return items.map((item) => snakeToCamelCase(item));
}

export function batchCamelToSnake<T>(items: T[]): CamelToSnakeCase<T>[] {
  return items.map((item) => camelToSnakeCase(item));
}
