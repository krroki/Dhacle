# 🗄️ Database 개발 지침

*Supabase 데이터베이스 전문가 - Database Agent 자동 활성화*

**자동 활성화**: SQL, migration 파일 Edit/Write/MultiEdit 시  
**전문 분야**: 테이블 관리, RLS 정책, 마이그레이션 제어

---

## 🛑 Database 3단계 필수 규칙

### 1️⃣ STOP - 즉시 중단 신호
- **RLS 없는 테이블 생성 → 중단**
- **22개 테이블 동시 처리 → 중단** (순차 처리 필수)
- **타입 생성 생략 → 중단**
- **검증 없이 완료 → 중단**
- **public 전체 접근 정책 → 중단**

### 2️⃣ MUST - 필수 행동
```sql
-- 모든 테이블 생성 필수 패턴
CREATE TABLE IF NOT EXISTS table_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🔒 RLS 정책 즉시 추가 (절대 생략 금지!)
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own records" ON table_name FOR ALL USING (auth.uid() = user_id);
```

### 3️⃣ CHECK - 검증 필수
```bash
# SQL 실행 후 즉시 실행
node scripts/supabase-sql-executor.js --method pg --file migrations/001.sql
npm run types:generate  # 타입 생성
node scripts/verify-with-service-role.js  # RLS 정책 확인
```

## 🚫 Database any 타입 금지

### ❌ 발견된 문제: database.generated.ts 직접 참조
```typescript
// ❌ 절대 금지 - database.generated 직접 import
import { Database } from '@/types/database.generated';

// ✅ 즉시 수정 - @/types 중앙화
import { User, Post } from '@/types';
```

### 🛡️ 예방책
- **실제 DB 타입만**: Supabase CLI로 생성된 타입만 사용
- **@/types 중앙화**: database.generated 직접 import 금지
- **Database Agent 연계**: SQL 파일 수정 시 자동 활성화

---

## 🚨 Database 필수 패턴

### 패턴 1: RLS 정책 즉시 적용 (테이블 생성 시)
```sql
-- ✅ 테이블 생성과 동시에 RLS 활성화 (필수)
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화 (절대 생략 금지!)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 기본 정책 생성 (사용자별 접근 제어)
CREATE POLICY "Users can read own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 패턴 2: 순차 테이블 처리 (22개 테이블 에러 방지)
```bash
# ✅ 순차 처리로 안전한 마이그레이션
for file in supabase/migrations/*.sql; do
  echo "Processing $file..."
  node scripts/supabase-sql-executor.js --method pg --file "$file"
  sleep 1  # 테이블 간 충돌 방지
done

# ❌ 절대 금지 - 22개 테이블 동시 처리
# node scripts/supabase-sql-executor.js --method pg --dir migrations/  # 에러 발생!
```

### 패턴 3: 타입 생성 및 검증 (완료 조건)
```bash
# ✅ 모든 마이그레이션 후 필수 실행
npm run types:generate                      # 실제 DB 구조 반영
node scripts/verify-with-service-role.js    # RLS 정책 동작 확인

# 검증 성공 조건
echo "✅ 테이블 생성 및 검증 완료"
```

---

## 📋 Database 검증 명령어

```bash
# 즉시 검증
node scripts/supabase-sql-executor.js --method pg --file migrations/001.sql
npm run types:generate                      # 타입 생성
node scripts/verify-with-service-role.js    # RLS 정책 확인

# 상세 검증
wc -l src/types/database.generated.ts      # 1000줄 이상이어야 정상
head -5 src/types/database.generated.ts    # Supabase 자동 생성 확인

# 실제 동작 확인
# Supabase 대시보드에서 Table Editor로 데이터 접근 테스트
```

---

## 🎯 Database 성공 기준

- [ ] **RLS 정책 적용**: 모든 테이블에 RLS 정책 설정 완료
- [ ] **순차 처리**: 22개 테이블 동시 처리 에러 방지
- [ ] **타입 생성**: database.generated.ts 자동 생성 완료
- [ ] **검증 통과**: verify-with-service-role.js 성공
- [ ] **실제 동작**: Supabase 대시보드에서 접근 확인

---

## ⚠️ Database 주의사항

### 자주 하는 실수
- **RLS 정책 누락**: 테이블 생성 후 RLS 정책 추가 잊음
- **22개 테이블 동시 처리**: 대량 테이블 처리 시 충돌 발생
- **타입 생성 생략**: SQL 실행 후 타입 재생성 잊음
- **검증 없이 완료**: RLS 정책 실제 동작 확인 안함

### 함정 포인트
- **service_role 키**: 클라이언트에서 절대 사용 금지
- **public 정책**: 보안상 위험한 전체 접근 권한
- **CASCADE 삭제**: 데이터 손실 위험, 신중히 사용
- **JSONB 인덱스**: 대용량 데이터 시 성능 고려

---

## 📁 관련 파일

- **타입 정의**: [/src/types/database.generated.ts](../../src/types/database.generated.ts) - Supabase 자동 생성
- **SQL 실행**: [/scripts/supabase-sql-executor.js](../../scripts/supabase-sql-executor.js)
- **RLS 검증**: [/scripts/verify-with-service-role.js](../../scripts/verify-with-service-role.js)
- **타입 관리**: [/src/types/CLAUDE.md](../../src/types/CLAUDE.md)

---

*Database 작업 시 이 지침을 필수로 준수하세요. Database Agent가 자동으로 활성화되어 RLS 정책과 타입 안전성을 강제 검증합니다.*