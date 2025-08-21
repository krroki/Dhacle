# 📊 Supabase 데이터베이스 마이그레이션 실행 가이드

## 🚨 현재 상황
- **문제**: 60개 이상의 테이블이 정의되어 있으나 프로덕션 DB에는 7개만 존재
- **영향**: 66개의 TypeScript 빌드 오류 발생
- **원인**: 마이그레이션 파일이 생성되었으나 실행되지 않음

## ✅ 즉시 실행 필요한 마이그레이션

### 1️⃣ Supabase Dashboard에서 실행하는 방법

1. **Supabase Dashboard 접속**
   - URL: https://supabase.com/dashboard/project/golbwnsytwbyoneucunx
   - SQL Editor 탭으로 이동

2. **다음 순서로 마이그레이션 실행**

### 📋 실행 순서 (중요!)

```sql
-- Step 1: 초기 스키마 (20250109000001_initial_schema.sql)
-- courses, enrollments, revenue_certifications 등 기본 테이블 생성

-- Step 2: 인증 트리거 (20250109000002_auth_triggers.sql)
-- 사용자 인증 관련 트리거

-- Step 3: RLS 정책 (20250109000003_rls_policies.sql)
-- Row Level Security 정책

-- Step 4: 카카오 인증 트리거 (20250109000004_kakao_auth_trigger.sql)

-- Step 5: 강의 시스템 (20250109000005_course_system.sql)
-- courses, course_weeks, lessons 등

-- Step 6: YouTube Lens 시스템 (20250121000001_youtube_lens_complete_schema.sql)
-- videos, channels, collections 등

-- Step 7: 커뮤니티 시스템 (20250115000001_community_system.sql)
-- community_posts, community_comments 등
```

### 2️⃣ CLI로 실행하는 방법 (인증 문제 해결 후)

```bash
# 방법 1: 환경 변수 설정
set SUPABASE_DB_PASSWORD=skanfgprud$4160
npx supabase db push

# 방법 2: 직접 연결
npx supabase db push --db-url "postgresql://postgres.golbwnsytwbyoneucunx:skanfgprud$4160@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

# 방법 3: 프로젝트 재연결
npx supabase link --project-ref golbwnsytwbyoneucunx
npx supabase db push
```

## 📊 누락된 주요 테이블 목록

### 강의 시스템 (Course System)
- ❌ courses
- ❌ course_weeks  
- ❌ lessons
- ❌ enrollments
- ❌ progress
- ❌ course_qna
- ❌ course_reviews
- ❌ purchases
- ❌ coupons

### YouTube Lens 시스템
- ❌ videos
- ❌ video_stats
- ❌ channels
- ❌ source_folders
- ❌ folder_channels
- ❌ collections
- ❌ collection_items
- ❌ saved_searches
- ❌ subscriptions

### 기타 시스템
- ❌ naver_cafe_verifications
- ❌ proof_likes
- ❌ proof_comments
- ❌ user_badges
- ❌ monthly_rankings

## 🔄 마이그레이션 후 실행 명령어

```bash
# 1. 타입 재생성
npm run types:generate

# 2. 타입 체크
npm run types:check

# 3. 빌드 검증
npm run build

# 4. 로컬 테스트
npm run dev
```

## ⚠️ 주의사항

1. **순서 중요**: 마이그레이션은 반드시 파일명 순서대로 실행
2. **중복 실행 방지**: IF NOT EXISTS 구문이 있으므로 안전하지만, 한 번만 실행
3. **백업 권장**: 실행 전 데이터 백업 권장
4. **RLS 정책**: 마이그레이션 후 RLS 정책도 함께 적용 필요

## 📝 검증 체크리스트

- [ ] 모든 마이그레이션 파일 실행 완료
- [ ] `npm run types:generate` 실행 후 60+ 테이블 확인
- [ ] TypeScript 빌드 오류 0개 확인
- [ ] 기본 기능 동작 테스트
- [ ] dhacle.com에서 실제 테스트

## 🆘 문제 발생 시

### 인증 오류
```
failed SASL auth (invalid SCRAM server-final-message received from server)
```
👉 Supabase Dashboard에서 직접 SQL 실행

### 타입 오류 지속
```bash
# 캐시 클리어 후 재생성
rm src/types/database.generated.ts
npm run types:generate
```

### 빌드 오류 지속
```bash
# 클린 빌드
rm -rf .next
npm run build
```

---

**작성일**: 2025-02-02
**상태**: 마이그레이션 실행 대기 중