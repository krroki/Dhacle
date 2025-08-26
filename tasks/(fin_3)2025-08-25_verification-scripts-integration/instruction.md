/sc:implement --seq --validate --delegate files
"검증 스크립트 통합 및 최적화 작업"

# 검증 스크립트 통합 및 최적화 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- 스크립트: `scripts/verify-*.js`
- 보안 스크립트: `scripts/security/*.js`
- 설정: `package.json` (scripts 섹션)
- 문서: `scripts/CLAUDE.md`

### 프로젝트 컨텍스트 확인
```bash
# 현재 검증 스크립트 목록
ls scripts/verify-*.js scripts/security/*.js

# NPM 스크립트 확인
cat package.json | grep -A 100 "scripts"

# 병렬 실행 설정 확인
cat scripts/verify-parallel.js
```

## 📌 목적
프로젝트에 산재된 29개의 검증 스크립트를 목적별로 정리하고, 중복 기능을 통합하여 유지보수성과 실행 효율성을 향상시킵니다.

## 🤖 실행 AI 역할
검증 스크립트 분석가 및 시스템 아키텍트로서 기존 스크립트들의 기능을 완전히 이해하고, 효율적인 통합 방안을 구현합니다.

## 📝 작업 내용

### Phase 1: 현황 분석 및 검증
1. **스크립트 인벤토리 작성**
   ```bash
   # 모든 검증 스크립트의 기능 매핑
   node scripts/analyze-scripts.js
   ```
   
2. **각 스크립트 실행 테스트**
   ```bash
   # 개별 실행하여 실제 동작 확인
   npm run verify:api -- --dry-run
   npm run verify:types -- --dry-run
   npm run verify:ui -- --dry-run
   # ... 모든 검증 스크립트
   ```

3. **중복 기능 식별**
   - 타입 관련: `verify-types.js`, `type-validator.js`, `type-suggester.js`, `type-error-helper.js`
   - API 관련: `verify-api-consistency.js`, `verify-routes.js`
   - 보안 관련: `security/*.js` (7개 파일)

### Phase 2: 통합 구조 설계
1. **새로운 통합 스크립트 구조**
   ```
   scripts/
   ├── verify/
   │   ├── index.js           # 메인 검증 엔진
   │   ├── modules/
   │   │   ├── types.js        # 타입 검증 통합
   │   │   ├── api.js          # API + 라우트 검증 통합
   │   │   ├── security.js     # 보안 검증 통합
   │   │   ├── ui.js           # UI 일관성 검증
   │   │   ├── database.js     # DB 관련 검증
   │   │   └── dependencies.js # 의존성 검증
   │   └── config.js           # 공통 설정
   ├── verify-parallel.js      # 유지 (병렬 실행)
   └── legacy/                 # 기존 스크립트 백업
   ```

2. **공통 유틸리티 추출**
   ```javascript
   // scripts/verify/utils.js
   module.exports = {
     colors: { /* 색상 코드 */ },
     logger: { /* 로깅 함수 */ },
     fileScanner: { /* 파일 스캔 */ },
     reporter: { /* 결과 리포팅 */ }
   };
   ```

### Phase 3: 통합 구현

#### 3.1 타입 검증 통합
```javascript
// scripts/verify/modules/types.js
class TypeVerifier {
  constructor(options) {
    this.checks = [
      'anyTypeUsage',      // any 타입 사용 검사
      'typeConsistency',   // 타입 일관성
      'generatedTypes',    // 생성된 타입 동기화
      'typeErrors'         // TypeScript 오류
    ];
  }
  
  async verify() {
    // verify-types.js + type-validator.js 로직 통합
    // type-suggester.js의 제안 기능 포함
    // type-error-helper.js의 설명 기능 포함
  }
}
```

#### 3.2 API 검증 통합
```javascript
// scripts/verify/modules/api.js
class ApiVerifier {
  constructor(options) {
    this.checks = [
      'authPatterns',      // 인증 패턴 일치성
      'routeProtection',   // 라우트 보호 검증
      'apiConsistency',    // API 일관성
      'sessionChecks'      // 세션 체크
    ];
  }
  
  async verify() {
    // verify-api-consistency.js + verify-routes.js 통합
  }
}
```

#### 3.3 보안 검증 통합
```javascript
// scripts/verify/modules/security.js
class SecurityVerifier {
  constructor(options) {
    this.checks = [
      'secretScanning',    // 비밀키 스캔
      'rlsPolicies',       // RLS 정책 검증
      'sessionVerification', // 세션 검증
      'errorStandardization', // 에러 표준화
      'ttlPolicies'        // TTL 정책
    ];
  }
  
  async verify() {
    // security/*.js 파일들의 로직 통합
  }
}
```

### Phase 4: NPM Scripts 재구성
```json
{
  "scripts": {
    // 새로운 통합 명령어
    "verify": "node scripts/verify",
    "verify:types": "node scripts/verify --module types",
    "verify:api": "node scripts/verify --module api",
    "verify:security": "node scripts/verify --module security",
    "verify:all": "node scripts/verify --all",
    
    // 병렬 실행 (유지)
    "verify:parallel": "node scripts/verify-parallel.js",
    
    // 레거시 호환성 (임시 유지)
    "verify:legacy:api": "node scripts/legacy/verify-api-consistency.js"
  }
}
```

### Phase 5: 테스트 및 검증
1. **단위 테스트 작성**
   ```javascript
   // tests/verify.test.js
   describe('통합 검증 시스템', () => {
     test('타입 검증 정확도', async () => {
       // 기존과 동일한 결과 확인
     });
     
     test('실행 시간 비교', async () => {
       // 성능 개선 확인
     });
   });
   ```

2. **비교 실행**
   ```bash
   # 기존 스크립트 실행 결과 저장
   npm run verify:all > before.log
   
   # 새 통합 스크립트 실행
   npm run verify > after.log
   
   # 결과 비교
   diff before.log after.log
   ```

### Phase 6: 문서화 및 마이그레이션
1. **새로운 사용 가이드 작성**
   ```markdown
   # scripts/verify/README.md
   - 통합된 검증 시스템 사용법
   - 각 모듈별 옵션 설명
   - 마이그레이션 가이드
   ```

2. **CI/CD 파이프라인 업데이트**
   - `.github/workflows/*.yml` 수정
   - Vercel 빌드 스크립트 업데이트

## ✅ 완료 조건
- [ ] 29개 스크립트 → 6개 모듈로 통합
- [ ] 실행 시간 30% 이상 단축
- [ ] 중복 코드 80% 감소
- [ ] 모든 기존 기능 유지
- [ ] 새로운 문서 작성 완료
- [ ] CI/CD 파이프라인 정상 작동

## 📋 QA 테스트 시나리오

### 정상 플로우
1. `npm run verify` 실행 → 모든 검증 통과
2. `npm run verify:types` → 타입 오류 정확히 검출
3. `npm run verify:parallel` → 병렬 실행 정상 작동

### 실패 시나리오
1. any 타입 추가 → 타입 검증에서 검출
2. 세션 체크 누락 → API 검증에서 검출
3. 비밀키 하드코딩 → 보안 검증에서 검출

### 성능 측정
```bash
# 실행 시간 측정
time npm run verify:all      # 기존
time npm run verify --all     # 신규

# 메모리 사용량
/usr/bin/time -v npm run verify
```

## 🔄 롤백 계획
```bash
# 실패 시 롤백
# 1. 레거시 스크립트 복원
mv scripts/legacy/* scripts/
rm -rf scripts/verify/

# 2. package.json 복원
git checkout -- package.json

# 3. 검증
npm run verify:all
```

## 📊 예상 효과
- **유지보수성**: 29개 파일 → 6개 모듈 (79% 감소)
- **실행 시간**: 평균 45초 → 30초 (33% 단축)
- **코드 중복**: 3,500줄 → 1,200줄 (66% 감소)
- **테스트 커버리지**: 60% → 90% 향상

## ⚠️ 주의사항
1. **자동 수정 금지**: 검증만 수행, 수정은 수동으로
2. **호환성 유지**: 기존 npm scripts 당분간 유지
3. **점진적 마이그레이션**: 한 번에 모든 것을 바꾸지 않음
4. **백업 필수**: 기존 스크립트는 legacy 폴더에 보관

---

*이 지시서를 따라 검증 스크립트 통합을 진행하면 프로젝트의 유지보수성과 효율성이 크게 향상됩니다.*