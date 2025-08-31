# Dhacle How-To Guides

## 📌 문서 관리 지침
**목적**: 구현 작업 총괄 가이드 - 4개 핵심 구현 패턴 모음집  
**대상**: 모든 구현 작업하는 AI (복사-붙여넣기 가능한 코드 필요 시)  
**범위**: 구현 가이드 링크와 빠른 참조만 포함 (상세 설명 없음)  
**업데이트 기준**: 새 how-to 가이드 추가 또는 패턴 변경 시  
**최대 길이**: 2500 토큰 (현재 약 2200 토큰)  
**연관 문서**: 각 how-to 가이드, [API Route Agent](../../src/app/api/CLAUDE.md)

## ⚠️ 금지사항
- 상세 구현 내용 추가 금지 (→ 각 how-to 문서로 유지)
- 이론적 설명 추가 금지 (→ explanation/ 문서로 이관)
- 프로젝트별 커스터마이징 가이드 추가 금지

---

Concrete implementation guides based on actual Dhacle codebase patterns.

## Available Guides

### [01. Authentication Patterns](./01-authentication-patterns.md)
Real authentication implementations used across 40+ API routes:
- `requireAuth()` helper pattern
- Direct Supabase auth pattern  
- Role-based authentication
- Optional authentication
- Complete template with error handling

### [02. Snake Case Conversion](./02-snake-case-conversion.md)
Actual snake_case conversion patterns from the codebase:
- Database to API response conversion
- Frontend to database field mapping
- Manual vs automatic conversion
- Type system integration
- Real examples from profile API

### [03. Type Imports](./03-type-imports.md)
Central type system patterns used throughout Dhacle:
- Import from `@/types` only
- Database entity types
- Insert/Update types
- API response types
- Form data types
- Type guards and utilities

### [04. Supabase Integration](./04-supabase-integration.md)
Complete Supabase integration patterns:
- Server client creation
- CRUD operation patterns
- Error handling strategies
- Service layer integration
- Row Level Security
- Performance optimization

## Why These Guides?

These guides are **extracted from actual working code** in the Dhacle project, not theoretical examples. Every pattern, import, and code snippet is currently being used in production.

## Quick Reference

### Most Common Patterns

```typescript
// Authentication
const user = await requireAuth(request);
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// Database Query
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', user.id);

// Response Conversion
return NextResponse.json(snakeToCamelCase({ data }));

// Type Import
import type { User, Profile, YouTubeVideo } from '@/types';
```

### Project Structure

```
src/app/api/           → Use authentication patterns
src/types/index.ts     → Central type system
src/lib/supabase/      → Database integration
docs/how-to/          → These guides
```

## Using These Guides

1. **Copy-paste ready**: All examples are working code from Dhacle
2. **Context-aware**: Each guide shows where patterns are used
3. **Error handling**: Real error handling from production code  
4. **Type safety**: Full TypeScript integration examples
5. **Best practices**: Extracted from battle-tested implementations

## Related Documentation

- [API Route Agent](../src/app/api/CLAUDE.md) - API-specific guidelines
- [Type Agent](../src/types/CLAUDE.md) - Type system guidelines  
- [Project Status](../reference/project-status.md) - Current codebase state
- [Mistake Patterns](../explanation/mistake-patterns.md) - Common pitfalls to avoid

---

These guides represent the **actual implementation patterns** used in Dhacle's YouTube creator tools platform. Use them as definitive references for consistent development practices.