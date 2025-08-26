/**
 * Case Converter Utility
 * Converts between snake_case (database) and camelCase (frontend)
 */

// 타입 정의 (향후 사용을 위해 export)
export type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Uppercase<T> ? '_' : ''}${Lowercase<T>}${SnakeCase<U>}`
  : S;

export type CamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<CamelCase<U>>}`
  : S;

// Recursive transformation types - removed unused type

type SnakeToCamelCase<T> = T extends Array<infer U>
  ? Array<SnakeToCamelCase<U>>
  : T extends Date
  ? T
  : T extends object
  ? { [K in keyof T as K extends string ? CamelCase<K> : K]: SnakeToCamelCase<T[K]> }
  : T;

type CamelToSnakeCase<T> = T extends Array<infer U>
  ? Array<CamelToSnakeCase<U>>
  : T extends Date
  ? T
  : T extends object
  ? { [K in keyof T as K extends string ? SnakeCase<K> : K]: CamelToSnakeCase<T[K]> }
  : T;

/**
 * Converts snake_case object keys to camelCase
 * Handles nested objects, arrays, and special types
 */
export function snakeToCamel<T>(obj: T): SnakeToCamelCase<T> {
  if (obj === null || obj === undefined) return obj as SnakeToCamelCase<T>;
  if (obj instanceof Date) return obj as SnakeToCamelCase<T>;
  if (Array.isArray(obj)) return obj.map(snakeToCamel) as SnakeToCamelCase<T>;
  if (typeof obj !== 'object') return obj as SnakeToCamelCase<T>;

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = snakeToCamel((obj as Record<string, unknown>)[key]);
    return acc;
  }, {} as Record<string, unknown>) as SnakeToCamelCase<T>;
}

/**
 * Converts camelCase object keys to snake_case
 * Handles nested objects, arrays, and special types
 */
export function camelToSnake<T>(obj: T): CamelToSnakeCase<T> {
  if (obj === null || obj === undefined) return obj as CamelToSnakeCase<T>;
  if (obj instanceof Date) return obj as CamelToSnakeCase<T>;
  if (Array.isArray(obj)) return obj.map(camelToSnake) as CamelToSnakeCase<T>;
  if (typeof obj !== 'object') return obj as CamelToSnakeCase<T>;

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = camelToSnake((obj as Record<string, unknown>)[key]);
    return acc;
  }, {} as Record<string, unknown>) as CamelToSnakeCase<T>;
}

/**
 * Transform Supabase response from snake_case to camelCase
 */
export function supabaseTransform<T>(data: unknown): T {
  return snakeToCamel(data) as T;
}

/**
 * Transform API request from camelCase to snake_case
 */
export function apiTransform<T>(data: T): CamelToSnakeCase<T> {
  return camelToSnake(data);
}

/**
 * Converts a single snake_case string to camelCase
 */
export function snakeToCamelString(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts a single camelCase string to snake_case
 */
export function camelToSnakeString(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}