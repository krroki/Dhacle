/**
 * Typed Supabase Client
 *
 * snake_case/camelCase 변환을 자동화하는 Supabase 래퍼
 * 기존 코드와 100% 호환되면서 점진적 마이그레이션 가능
 */

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types';

// snake_case → camelCase 변환
export function snakeToCamel<T>(obj: unknown): T {
  if (obj === null || obj === undefined) return obj as T;
  if (obj instanceof Date) return obj as T;
  if (Array.isArray(obj)) return obj.map((item) => snakeToCamel<unknown>(item)) as T;
  if (typeof obj !== 'object') return obj as T;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = snakeToCamel<unknown>(value);
  }
  return result as T;
}

// camelCase → snake_case 변환
export function camelToSnake<T>(obj: unknown): T {
  if (obj === null || obj === undefined) return obj as T;
  if (obj instanceof Date) return obj as T;
  if (Array.isArray(obj)) return obj.map((item) => camelToSnake<unknown>(item)) as T;
  if (typeof obj !== 'object') return obj as T;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = camelToSnake<unknown>(value);
  }
  return result as T;
}

/**
 * Typed Supabase Client with automatic case conversion
 *
 * 사용법:
 * ```typescript
 * import { db } from '@/lib/supabase/typed-client';
 *
 * // 자동으로 camelCase로 변환
 * const { data } = await db.from('courses')
 *   .select('*')
 *   .eq('id', course_id);
 *
 * // data는 이미 camelCase
 * console.log(data.instructor_name); // OK!
 * ```
 */
class TypedSupabaseClient {
  private supabase = createClient();

  from<T extends keyof Database['public']['Tables']>(table: T) {
    const originalFrom = this.supabase.from(table);

    return new Proxy(originalFrom, {
      get(target, prop: string) {
        const originalMethod = target[prop as keyof typeof target];

        if (typeof originalMethod !== 'function') {
          return originalMethod;
        }

        return async (...args: unknown[]) => {
          // insert/update 시 camelCase → snake_case 변환
          if (prop === 'insert' || prop === 'update' || prop === 'upsert') {
            const convertedArgs = args.map((arg) => {
              if (Array.isArray(arg)) {
                return arg.map((item) => camelToSnake(item));
              }
              return camelToSnake(arg);
            });
            const result = await originalMethod.apply(target, convertedArgs);

            // 결과를 camelCase로 변환
            if (result.data) {
              result.data = snakeToCamel(result.data);
            }
            return result;
          }

          // select 등 다른 메서드들
          const result = await originalMethod.apply(target, args);

          // 결과를 camelCase로 변환
          if (result.data) {
            result.data = snakeToCamel(result.data);
          }

          return result;
        };
      },
    });
  }

  // auth는 그대로 노출
  get auth() {
    return this.supabase.auth;
  }

  // storage는 그대로 노출
  get storage() {
    return this.supabase.storage;
  }

  // functions는 그대로 노출
  get functions() {
    return this.supabase.functions;
  }
}

// 싱글톤 인스턴스
export const db = new TypedSupabaseClient();

// 기존 코드 호환성을 위한 export
export const typedSupabase = db;
