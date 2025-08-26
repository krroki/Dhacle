/sc:analyze --seq --validate --think
"Phase 0: 기술 부채 해소를 위한 준비 및 백업 작업"

# Phase 0: 준비 및 백업

⚠️ → **필수 확인**: `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 확인
⚠️ → **절대 금지**: 자동 변환 스크립트 생성 (38개 스크립트 재앙 경험)
⚠️ → **필수 사용**: `createSupabaseServerClient` 패턴 (구식 패턴 사용 금지)

## 📌 Phase 정보
- **Phase 번호**: 0/5
- **예상 시간**: 2시간
- **우선순위**: CRITICAL
- **목적**: 안전한 작업 환경 구축 및 현재 상태 백업

## 📚 온보딩 섹션

### 작업 관련 경로
```
- 환경변수: src/lib/env.ts
- 타입 정의: src/types/index.ts
- API 클라이언트: src/lib/api-client.ts
- Supabase: src/lib/supabase/client.ts
```

### 프로젝트 컨텍스트 확인
```bash
# 현재 상태 확인
npm run verify:parallel

# 타입 에러 확인
npm run types:check

# 빌드 테스트
npm run build

# 보안 테스트
npm run security:test
```

## 🎯 Phase 목표
1. 현재 코드베이스 완전 백업
2. 모든 미해결 문제 검증 및 우선순위 확정
3. 작업 환경 설정 및 도구 준비
4. 베이스라인 메트릭 측정

## 📝 작업 내용

### Step 1: Git 브랜치 생성 및 백업
```bash
# 새 브랜치 생성
git checkout -b feature/technical-debt-resolution

# 현재 상태 커밋
git add .
git commit -m "chore: Baseline before technical debt resolution"

# 백업 태그 생성
git tag -a "backup-before-debt-resolution" -m "Backup before starting technical debt resolution"
git push origin --tags
```

### Step 2: 현재 문제 검증
```bash
# 타입 에러 카운트
npm run types:check 2>&1 | grep "error TS" | wc -l

# 콘솔 로그 카운트
grep -r "console.log" src --include="*.ts" --include="*.tsx" | wc -l

# any 타입 사용 확인
grep -r ": any" src --include="*.ts" --include="*.tsx" | wc -l

# 직접 fetch 사용 확인
grep -r "fetch(" src --include="*.ts" --include="*.tsx" | wc -l
```

### Step 3: 베이스라인 메트릭 측정
```javascript
// scripts/measure-baseline.js
const fs = require('fs');
const { execSync } = require('child_process');

const metrics = {
  timestamp: new Date().toISOString(),
  typeErrors: 0,
  consoleLogCount: 0,
  anyTypeCount: 0,
  fetchDirectCount: 0,
  buildTime: 0,
  testCoverage: 0
};

try {
  // 타입 에러
  const typeCheck = execSync('npm run types:check 2>&1', { encoding: 'utf8' });
  metrics.typeErrors = (typeCheck.match(/error TS/g) || []).length;
} catch (e) {
  metrics.typeErrors = (e.stdout.match(/error TS/g) || []).length;
}

// 콘솔 로그
const consoleLog = execSync('grep -r "console.log" src --include="*.ts" --include="*.tsx" | wc -l', { encoding: 'utf8' });
metrics.consoleLogCount = parseInt(consoleLog.trim());

// any 타입
const anyType = execSync('grep -r ": any" src --include="*.ts" --include="*.tsx" | wc -l', { encoding: 'utf8' });
metrics.anyTypeCount = parseInt(anyType.trim());

// fetch 직접 사용
const fetchDirect = execSync('grep -r "fetch(" src --include="*.ts" --include="*.tsx" | wc -l', { encoding: 'utf8' });
metrics.fetchDirectCount = parseInt(fetchDirect.trim());

// 결과 저장
fs.writeFileSync('baseline-metrics.json', JSON.stringify(metrics, null, 2));
console.log('Baseline metrics saved to baseline-metrics.json');
console.log(metrics);
```

### Step 4: 의존성 업데이트 확인
```bash
# 오래된 패키지 확인
npm outdated

# 보안 취약점 확인
npm audit

# 필요시 업데이트 (주의!)
# npm update --save
```

### Step 5: 환경 변수 백업
```bash
# .env.local 백업
cp .env.local .env.local.backup

# 환경 변수 목록 문서화
cat .env.local | grep -v "^#" | grep "=" | cut -d'=' -f1 > env-variables.txt
```

## ✅ 완료 조건
- [ ] Git 브랜치 생성 및 백업 태그 완료
- [ ] 베이스라인 메트릭 측정 및 저장
- [ ] 모든 검증 스크립트 실행 성공
- [ ] 환경 변수 백업 완료
- [ ] baseline-metrics.json 파일 생성

## 📋 QA 테스트 시나리오

### 검증 체크리스트
```bash
# 1. 브랜치 확인
git branch --show-current  # feature/technical-debt-resolution

# 2. 백업 태그 확인
git tag -l | grep backup  # backup-before-debt-resolution

# 3. 메트릭 파일 확인
cat baseline-metrics.json

# 4. 환경 변수 백업 확인
diff .env.local .env.local.backup  # 차이 없어야 함
```

## 🔄 롤백 계획

### 전체 롤백
```bash
# 작업 중단하고 원래 상태로
git stash
git checkout main
git branch -D feature/technical-debt-resolution

# 백업에서 복원
git checkout backup-before-debt-resolution
```

### 환경 변수 롤백
```bash
cp .env.local.backup .env.local
```

## 📊 성과 측정

### 베이스라인 (시작 전)
- 타입 에러: [측정값]개
- console.log: [측정값]개
- any 타입: [측정값]개
- 직접 fetch: [측정값]개
- 빌드 시간: [측정값]초
- 테스트 커버리지: [측정값]%

## → 다음 Phase
- **파일**: PHASE_1_ENV_TYPE_SAFETY.md
- **목표**: 47개 환경변수 타입 안전성 문제 해결
- **예상 시간**: 3일

---

*작성일: 2025-02-23*