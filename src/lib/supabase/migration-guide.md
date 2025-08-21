# DB 호출 마이그레이션 가이드

## 🎯 목표
snake_case/camelCase 변환 오류를 영구적으로 해결

## ✅ 새로운 방식 (권장)

```typescript
// ❌ 기존 방식 - 오류 발생 원인
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data } = await supabase
  .from('courses')
  .select('*');

// data.instructor_name 접근해야 함 (snake_case)
// 하지만 개발자는 data.instructorName 으로 접근 → 오류!

// ✅ 새로운 방식 - 자동 변환
import { db } from '@/lib/supabase/typed-client';

const { data } = await db
  .from('courses')
  .select('*');

// data.instructorName 으로 접근 가능! (camelCase)
```

## 🔄 점진적 마이그레이션

### Phase 1: 새 코드만 적용 (지금)
- 새로 작성하는 코드는 `db` 사용
- 기존 코드는 그대로 유지

### Phase 2: 자주 오류나는 파일부터 수정 (1주)
- payment 관련 파일들
- admin 관련 파일들

### Phase 3: 전체 마이그레이션 (1개월)
- 모든 파일 점진적 수정

## 📋 체크리스트

- [ ] 새 파일 작성 시 `db` import
- [ ] 오류 수정 시 해당 파일 `db`로 변경
- [ ] PR 리뷰 시 `db` 사용 확인

## ⚠️ 주의사항

1. **기존 코드와 호환됨**
   - 급하게 모두 바꿀 필요 없음
   - 천천히 안전하게 마이그레이션

2. **타입 안정성 유지**
   - TypeScript가 자동으로 타입 체크
   - 컴파일 타임에 오류 발견

3. **성능 영향 없음**
   - 단순 객체 키 변환만 수행
   - 비동기 처리에 영향 없음