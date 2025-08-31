# 스크립트 정리 계획 (Phase 1)

## 목표: 53개 → 35개 이하 (중복 제거 완료)

### 📊 현재 상태
- **전체**: 53개 스크립트
- **verify**: 22개 (핵심 유지)
- **check**: 6개 (중복 있음)
- **test**: 5개 (대부분 임시)
- **analyze**: 3개
- **기타**: 17개

### 🗑️ 삭제할 스크립트들 (약 18개)

#### 1. 임시 test 스크립트들 (5개)
- ❌ test-api-client-fix.js - API 수정 테스트 완료
- ❌ test-context-less-workflow.js - 워크플로 테스트 완료
- ❌ test-phase1-operations.js - Phase1 완료
- ❌ test-yl-channels-direct.js - 임시 채널 테스트
- ❌ test-youtube-api-response.js - 임시 API 테스트

#### 2. 완료된 phase 관련 verify 스크립트들 (4개)
- ❌ verify-phase1-complete.js - Phase1 완료
- ❌ verify-phase1-issues-resolved.js - Phase1 이슈 해결 완료
- ❌ verify-phase1-existing.js - Phase1 기존 검증 완료
- ❌ verify-phase3.js - Phase3 관련

#### 3. 중복 check 스크립트들 (4개 중 2개 삭제, 2개 통합)
- ❌ check-profiles-table.js (→ check-profiles-structure.js로 통합)
- ❌ check-profiles-view-definition.js (→ check-profiles-structure.js로 통합)
- ❌ check-yl-channels.js (→ check-yl-channels-table.js로 통합)
- ✅ check-profiles-structure.js (통합본 유지)
- ✅ check-yl-channels-table.js (통합본 유지)
- ✅ check-kakao-oauth.js (단독 기능, 유지)

#### 4. 구식/중복 분석 스크립트들 (3개)
- ❌ analyze-phase1-implementation.js - Phase1 완료
- ❌ type-error-helper.js - type-suggester.js와 중복
- ❌ measure-baseline.js - 구식 측정 도구

#### 5. 기타 구식/임시 스크립트들 (4개)
- ❌ simple-prod-deploy.js - 구식 배포 스크립트
- ❌ react-query-v5-migration-check.js - 마이그레이션 완료
- ❌ dev-verify.js - verify-parallel.js로 대체됨
- ❌ organize-components.js - 컴포넌트 정리 완료

### ✅ 유지할 핵심 스크립트들 (35개)

#### 핵심 검증 스크립트들
- ✅ verify-parallel.js (메인 통합 검증)
- ✅ verify-with-service-role.js (핵심 DB 검증)
- ✅ verify-ui-consistency.js
- ✅ verify-runtime.js
- ✅ verify-dependencies.js
- ✅ verify-database.js
- ✅ verify-imports.js
- ✅ verify-api-consistency.js
- ✅ verify-case-consistency.js
- ✅ verify-auth-implementation.js
- ✅ verify-db-truth.js
- ✅ verify-type-recovery.js
- ✅ verify-types.js
- ✅ verify-routes.js
- ✅ verify-redis-setup.js
- ✅ verify-youtube-api-fix.js
- ✅ verify-youtube-api.js

#### SQL/DB 관리
- ✅ supabase-sql-executor.js (핵심 SQL 실행)
- ✅ supabase-migration.js
- ✅ supabase-migrate-complete.js
- ✅ apply-sql-to-production.js

#### 타입 시스템
- ✅ safe-type-generator.js
- ✅ type-suggester.js (통합된 타입 제안)
- ✅ type-validator.js

#### 체크/검증
- ✅ check-profiles-structure.js (통합본)
- ✅ check-yl-channels-table.js (통합본)  
- ✅ check-kakao-oauth.js

#### AI Context System (최신 중요)
- ✅ asset-scanner.js
- ✅ context-loader.js

#### 분석/유틸리티
- ✅ analyze-dependencies.js
- ✅ analyze-scripts.js
- ✅ detect-temporary-fixes.js
- ✅ validate-env.js
- ✅ validate-claude-restructure.js
- ✅ build-verify.js
- ✅ seed.js

### 🔧 통합 작업

#### check-profiles-structure.js 통합
- 3개 profiles 관련 스크립트 기능을 하나로 통합
- 테이블/뷰 구조, 정의, 상태를 모두 확인

#### check-yl-channels-table.js 통합  
- 2개 channels 관련 스크립트 기능을 하나로 통합
- 테이블 존재 여부와 구조를 모두 확인