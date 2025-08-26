/sc:implement --seq --validate --c7 --think
"디하클 프로젝트의 문서 시스템 통합 및 자동화 구현"

# 문서 시스템 통합 및 자동화 구현 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- 메인 문서: `docs/DOCUMENT_GUIDE.md`
- 기술 문서: `docs/TECH_STACK.md`, `docs/TOOL_DECISION_TREE.md`, `docs/NPM_SCRIPTS_GUIDE.md`
- 연결 대상: `CLAUDE.md`, `docs/PROJECT.md`, `docs/CHECKLIST.md`
- 검증 스크립트: `scripts/verify-docs.js` (생성 예정)
- package.json: `package.json`

### 프로젝트 컨텍스트 확인
```bash
# 현재 의존성 카운트 확인
node -e "const pkg = require('./package.json'); console.log('Dependencies:', Object.keys(pkg.dependencies).length)"

# 현재 스크립트 카운트 확인
node -e "const pkg = require('./package.json'); console.log('Scripts:', Object.keys(pkg.scripts).length)"

# 문서 최종 수정일 확인
git log -1 --format="%ci" -- docs/TECH_STACK.md
git log -1 --format="%ci" -- docs/TOOL_DECISION_TREE.md
git log -1 --format="%ci" -- docs/NPM_SCRIPTS_GUIDE.md
```

## 📌 목적

디하클(Dhacle) 프로젝트의 3개 기술 문서(TECH_STACK.md, TOOL_DECISION_TREE.md, NPM_SCRIPTS_GUIDE.md)를 메인 문서 시스템과 완전히 통합하고, 자동 동기화 시스템을 구축하여 문서의 정확성과 최신성을 보장합니다.

## 🤖 실행 AI 역할

당신은 문서 시스템 통합 전문가로서:
1. 긴급 수정사항을 즉시 처리
2. 문서 간 연결성 강화
3. 자동화 시스템 구축
4. 검증 체계 구현

## 📝 작업 내용

### Phase 1: 긴급 수정 (즉시 실행)

#### 1.1 DOCUMENT_GUIDE.md 업데이트
```markdown
파일: docs/DOCUMENT_GUIDE.md

추가할 섹션 (15번 다음):
16. **TECH_STACK.md** - 기술 스택 현황
    - 의존성 목록 및 버전
    - 개발 도구 및 프레임워크
    - 업데이트: package.json 변경 시

17. **TOOL_DECISION_TREE.md** - 도구 선택 가이드
    - 의사결정 매트릭스
    - 도구별 사용 시나리오
    - 업데이트: 새 도구 도입 시

18. **NPM_SCRIPTS_GUIDE.md** - NPM 스크립트 가이드
    - 모든 스크립트 명령어 설명
    - 실행 순서 및 의존성
    - 업데이트: scripts 섹션 변경 시
```

#### 1.2 카운트 오류 수정
```markdown
파일: docs/TECH_STACK.md
수정: Dependencies 카운트 79 → 78

파일: docs/NPM_SCRIPTS_GUIDE.md
수정: Scripts 카운트 114 → 113
```

#### 1.3 문서 선택 매트릭스 추가
```markdown
파일: docs/DOCUMENT_GUIDE.md

문서 선택 매트릭스 섹션에 추가:
| 기술 정보 필요 | TECH_STACK.md | 의존성, 버전 확인 |
| 도구 선택 필요 | TOOL_DECISION_TREE.md | 최적 도구 결정 |
| 스크립트 실행 | NPM_SCRIPTS_GUIDE.md | 명령어 참조 |
```

### Phase 2: 통합 강화 (1주일 내)

#### 2.1 문서 간 참조 추가
```markdown
CLAUDE.md에 추가:
- 도구 선택 시 → `/docs/TOOL_DECISION_TREE.md` 참조
- 의존성 확인 → `/docs/TECH_STACK.md` 참조

PROJECT.md에 추가:
- 기술 스택 변경 로그 섹션 생성
- 최근 의존성 변경사항 추적

CHECKLIST.md에 추가:
- NPM 스크립트 검증 → `/docs/NPM_SCRIPTS_GUIDE.md` 참조
```

#### 2.2 업데이트 트리거 정의
```yaml
업데이트 규칙:
  TECH_STACK.md:
    트리거: package.json의 dependencies/devDependencies 변경
    주기: 즉시
    
  TOOL_DECISION_TREE.md:
    트리거: 새 도구/라이브러리 도입 검토
    주기: 월 1회 검토
    
  NPM_SCRIPTS_GUIDE.md:
    트리거: package.json의 scripts 섹션 변경
    주기: 즉시
```

### Phase 3: 자동화 구축 (1개월 내)

#### 3.1 문서 동기화 스크립트 생성
```javascript
// scripts/sync-docs.js
const fs = require('fs');
const path = require('path');

class DocsSynchronizer {
  constructor() {
    this.packagePath = path.join(__dirname, '../package.json');
    this.techStackPath = path.join(__dirname, '../docs/TECH_STACK.md');
    this.npmGuidePath = path.join(__dirname, '../docs/NPM_SCRIPTS_GUIDE.md');
  }

  async syncTechStack() {
    const pkg = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
    const depCount = Object.keys(pkg.dependencies).length;
    const devDepCount = Object.keys(pkg.devDependencies).length;
    
    // TECH_STACK.md 업데이트 로직
    // 실제 카운트로 문서 업데이트
  }

  async syncNpmScripts() {
    const pkg = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
    const scriptsCount = Object.keys(pkg.scripts).length;
    
    // NPM_SCRIPTS_GUIDE.md 업데이트 로직
    // 스크립트 목록 자동 생성
  }
}

// Pre-commit hook에서 실행
if (require.main === module) {
  const syncer = new DocsSynchronizer();
  syncer.syncTechStack();
  syncer.syncNpmScripts();
}
```

#### 3.2 검증 시스템 구현
```javascript
// scripts/verify-docs.js
class DocsVerifier {
  async verifyConsistency() {
    const errors = [];
    
    // 1. 카운트 정확성 검증
    // 2. 문서 간 참조 무결성 검사
    // 3. 최종 수정일 확인 (30일 이상 경고)
    
    return errors;
  }
}
```

#### 3.3 CI/CD 통합
```yaml
# .github/workflows/docs-validation.yml
name: Documentation Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: node scripts/verify-docs.js
      - run: node scripts/sync-docs.js --check
```

## ✅ 완료 조건

### Phase 1 (Day 1)
- [ ] DOCUMENT_GUIDE.md에 3개 문서 추가 완료
- [ ] Dependencies 카운트 78개로 수정
- [ ] Scripts 카운트 113개로 수정
- [ ] 문서 선택 매트릭스 업데이트

### Phase 2 (Week 1)
- [ ] CLAUDE.md에 기술 문서 참조 추가
- [ ] PROJECT.md에 변경 로그 섹션 추가
- [ ] CHECKLIST.md에 NPM 가이드 참조 추가
- [ ] 업데이트 트리거 규칙 문서화

### Phase 3 (Month 1)
- [ ] sync-docs.js 스크립트 작동
- [ ] verify-docs.js 검증 통과
- [ ] Pre-commit hook 설정
- [ ] CI/CD 파이프라인 통합

## 📋 QA 테스트 시나리오

### 정상 플로우
1. package.json 의존성 추가
2. `npm run sync-docs` 실행
3. TECH_STACK.md 자동 업데이트 확인
4. 카운트 일치 검증

### 실패 시나리오
1. 수동으로 문서 수정 시 불일치 감지
2. 30일 이상 미수정 문서 경고
3. 문서 간 참조 깨짐 감지

### 성능 측정
- 동기화 시간: < 1초
- 검증 시간: < 2초
- 문서 정확도: 99.5% 이상

## 🔄 롤백 계획

### 백업 체크리스트
- [ ] 모든 문서 파일 백업
- [ ] 현재 package.json 백업
- [ ] Git 커밋 해시 기록

### 롤백 트리거 조건
- 자동화 스크립트 무한 루프
- 문서 파일 손상
- CI/CD 파이프라인 실패

### 롤백 절차
```bash
# 이전 상태로 복원
git checkout [백업_커밋_해시] -- docs/
git checkout [백업_커밋_해시] -- scripts/sync-docs.js
git checkout [백업_커밋_해시] -- scripts/verify-docs.js

# 스크립트 비활성화
rm .husky/pre-commit

# 수동 모드로 전환
echo "DOCS_AUTO_SYNC=false" >> .env
```

## 📊 성과 측정

### 정량적 지표
| 지표 | Before | After | 개선율 |
|------|--------|-------|--------|
| 문서 정확도 | 95% | 99.5% | +4.5% |
| 업데이트 누락률 | 30% | <5% | -83% |
| 온보딩 시간 | 3일 | 1.5일 | -50% |
| 문서 활용도 | 40% | 85% | +112% |

### 정성적 지표
- [ ] 개발자 신뢰도 향상
- [ ] 문서 기반 의사결정 증가
- [ ] 기술 부채 감소

## 🎯 핵심 주의사항

1. **자동 스크립트 제한**: 문서 동기화만 자동화, 코드 수정은 수동
2. **점진적 적용**: Phase별 순차 진행, 급격한 변경 금지
3. **백업 필수**: 모든 변경 전 백업 확인
4. **검증 우선**: 자동화보다 정확성 우선

---

*이 지시서는 디하클 프로젝트의 문서 시스템 개선을 위한 단계별 실행 계획입니다.*
*각 Phase는 독립적으로 실행 가능하며, 완료 조건 달성 후 다음 단계로 진행하세요.*