# 🔴 DB 테이블 진실의 원천 (The Single Source of Truth)

**⚠️ 이 문서가 최우선! 추측 금지! 실제 DB 구조만 따르세요!**

생성일: 2025-08-27
검증일: 2025-08-27

## 📊 테이블 구조 명확화

### 1. `users` 테이블 (메인 - 실제 데이터)
- **용도**: 사용자 정보 실제 저장
- **타입**: TABLE (실제 테이블)
- **주요 필드**:
  - `id`: string (PK)
  - `email`: string (필수)
  - `naver_cafe_nickname`: string | null
  - `cafe_member_url`: string | null (⚠️ naver_cafe_member_url 아님!)
  - `naver_cafe_verified`: boolean | null
  - `naver_cafe_verified_at`: string | null
  - `role`: string | null
  - `total_revenue`: number | null

### 2. `profiles` VIEW (조회용)
- **용도**: users 테이블의 읽기 전용 뷰
- **타입**: VIEW (실제 데이터 없음)
- **특징**: 
  - email, id가 nullable
  - role 필드 없음
  - total_revenue 필드 없음
  - 주로 프론트엔드 표시용

## ✅ 사용 규칙

### 카페 인증 관련 작업
```typescript
// ✅ 올바름 - users 테이블 사용
await supabase
  .from('users')  // ← users 테이블!
  .update({
    naver_cafe_nickname: nickname,
    cafe_member_url: url,  // ← cafe_member_url 필드!
    naver_cafe_verified: true
  })
```

### 사용자 정보 조회 (읽기만)
```typescript
// 둘 다 가능하지만 profiles 권장
await supabase
  .from('profiles')  // 조회는 profiles OK
  .select('*')
```

### 사용자 정보 수정
```typescript
// ✅ 반드시 users 테이블
await supabase
  .from('users')  // 수정은 반드시 users!
  .update({ ... })
```

## 🚫 절대 금지

1. **추측으로 테이블 변경 금지**
2. **에러 메시지만 보고 수정 금지**
3. **cafe_member_url을 naver_cafe_member_url로 바꾸기 금지**
4. **profiles 테이블에 INSERT/UPDATE 금지** (VIEW라서 불가능)

## 📍 검증 SQL

```sql
-- 실제 어떤 테이블인지 확인
SELECT 
  table_name,
  table_type  -- TABLE or VIEW
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'profiles');

-- 실제 카페 인증 데이터 위치 확인
SELECT COUNT(*) 
FROM users 
WHERE naver_cafe_verified = true;
```

---

**마지막 업데이트**: 2025-08-27
**다음 검증 예정**: 문제 해결 후