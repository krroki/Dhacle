# 🔄 폴백 전략 가이드

*Context 없는 AI를 위한 Plan B/C/D 완전 대응 전략*

---

## 📋 폴백 전략 개요

### 🎯 목적
- 원래 계획이 실패할 때의 대안 제시
- 점진적 축소 전략으로 최소한의 성과라도 확보
- 완전 실패 방지 및 안전한 롤백 보장

### 🏗️ 4단계 폴백 구조
1. **Plan A** (100% 목표): 원래 계획 그대로 실행
2. **Plan B** (70% 목표): 핵심 기능만 우선 실행
3. **Plan C** (40% 목표): 최소 필수 기능만 실행
4. **Plan D** (20% 목표): 현상 유지 + 문제 보고

---

## 🚀 Phase 1 폴백 전략 (즉시 정리 및 안정화)

### 📄 작업 1: 문서 체계 정리

#### Plan A (100%): 완전한 문서 통합
```bash
/cleanup docs --validate --evidence --systematic
```
**목표**: 15개 → 10개 통합, 중복 완전 제거

#### Plan B (70%): 핵심 문서만 통합  
```bash
/cleanup docs --focus high-priority --validate
```
**축소된 목표**:
- CONTEXT_BRIDGE.md 우선 유지
- 가장 중복이 심한 5개 문서만 통합
- 나머지는 현상 유지

**실행 방법**:
```bash
# 1. 중복도가 높은 문서 식별
grep -l "반복 실수" docs/*.md > duplicate-docs.txt

# 2. 우선순위 문서만 통합
mv docs/CONTEXT_BRIDGE.md docs/CONTEXT_BRIDGE.md.backup
# 가장 중복이 심한 3-5개 문서만 선별 통합
```

#### Plan C (40%): 최소 정리만
```bash
/cleanup docs --minimal --validate
```
**최소 목표**:
- 명백히 중복된 2-3개 문서만 제거
- 파일명 표준화 (띄어쓰기 → 언더스코어)
- 깨진 링크만 수정

**실행 방법**:
```bash
# 1. 완전히 같은 내용의 문서만 식별
diff docs/FILE1.md docs/FILE2.md > /dev/null && echo "완전 중복: FILE1, FILE2"

# 2. 명백한 중복만 제거
rm docs/FILE2.md  # FILE1과 100% 같은 내용인 경우만
```

#### Plan D (20%): 현상 유지 + 분석 보고
```bash
/analyze docs --evidence --report-only
```
**목표**: 변경 없이 현황 파악만
- 현재 문서 구조 분석 리포트 생성
- 중복도 수치화
- 개선 권장사항 제시 (실행 안함)

### 🔧 작업 2: 검증 스크립트 중복 제거

#### Plan A (100%): 완전한 스크립트 통합
```bash
/analyze scripts --systematic --evidence
/improve scripts --validate --safe-mode --loop
```

#### Plan B (70%): 핵심 중복만 제거
**축소된 목표**:
- `verify:parallel` vs `jscpd:check` 중복만 해결
- 나머지 스크립트는 현상 유지

**실행 방법**:
```bash
# 1. 가장 큰 중복 2개만 식별
npm run verify:parallel --dry-run > verify-output.txt
npm run jscpd:check > jscpd-output.txt
diff verify-output.txt jscpd-output.txt

# 2. 중복 로직만 제거 (전체 재작성 안함)
```

#### Plan C (40%): 실행 시간만 단축
**최소 목표**:
- 스크립트 통합은 포기
- timeout 설정만 추가하여 빠르게 실행
- 병목 지점 1-2개만 해결

**실행 방법**:
```bash
# 1. 각 스크립트에 timeout 추가
timeout 60s npm run verify:parallel
timeout 30s npm run jscpd:check

# 2. 가장 느린 검증 1개만 최적화
```

#### Plan D (20%): 현재 상태 유지
**목표**: 스크립트 변경 없이 사용법만 정리
- 각 스크립트 용도 명확화
- 실행 순서 가이드 작성
- 성능 개선은 차후 과제로

### 🏥 작업 3: 시스템 헬스체크 자동화

#### Plan A (100%): 완전한 자동화
```bash
/build health-check --validate --test-driven --c7
```

#### Plan B (70%): 기본 헬스체크만
**축소된 목표**:
- 핵심 시스템 3개만 체크 (jscpd, Asset Scanner, Git hooks)
- 고급 기능 (메모리, 디스크) 제외

**구현 방법**:
```bash
#!/bin/bash
# scripts/basic-health-check.sh
echo "🔍 기본 헬스체크 시작..."

# 1. jscpd 작동 확인
npm run jscpd:check >/dev/null 2>&1 && echo "✅ jscpd 정상" || echo "❌ jscpd 실패"

# 2. Asset Scanner 작동 확인  
npm run scan:assets >/dev/null 2>&1 && echo "✅ Asset Scanner 정상" || echo "❌ Asset Scanner 실패"

# 3. Git hooks 권한 확인
[ -x .husky/pre-commit ] && echo "✅ Git hooks 정상" || echo "❌ Git hooks 권한 없음"

echo "기본 헬스체크 완료"
```

#### Plan C (40%): 수동 체크리스트만
**최소 목표**:
- 자동화 포기, 수동 확인 가이드만 작성
- 3개 핵심 명령어만 나열

**가이드 내용**:
```markdown
## 수동 헬스체크 (2분)
1. `npm run jscpd:check` - 정상 실행되는지 확인
2. `npm run scan:assets` - 에러 없이 완료되는지 확인  
3. `ls -la .husky/pre-commit` - 실행 권한 있는지 확인
```

#### Plan D (20%): 문제 리포트만
**목표**: 헬스체크 구현 포기, 현재 문제점만 문서화
- 자주 발생하는 3-5개 문제점 정리
- 각 문제별 해결 방법 링크

---

## ⚡ Phase 2 폴백 전략 (성능 최적화 및 개선)

### 🚀 Asset Scanner 성능 최적화

#### Plan A (100%): 완전한 최적화
- 50% 성능 향상 목표
- 캐싱, 증분 스캔, 병렬 처리 모두 구현

#### Plan B (70%): 캐싱만 구현
**축소된 목표**: 25% 성능 향상
- 변경되지 않은 파일 스킵하는 간단한 캐싱만
- 병렬 처리나 복잡한 최적화 제외

**구현 방법**:
```javascript
// scripts/asset-scanner.js 일부 수정
const fs = require('fs');
const cacheFile = '.asset-scanner-cache.json';

function isFileChanged(filePath, lastModified) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.getTime() > lastModified;
  } catch {
    return true; // 파일 없으면 변경된 것으로 간주
  }
}
```

#### Plan C (40%): 스캔 범위만 축소
**최소 목표**: 실행 시간 30% 단축
- 성능 개선 포기, 스캔 대상만 줄이기
- 핵심 폴더만 스캔 (src/components, src/app/api)

**구현 방법**:
```bash
# 임시로 스캔 범위 축소
sed -i.backup 's/src\/\*\*/src\/components src\/app\/api/g' scripts/asset-scanner.js
```

#### Plan D (20%): 현재 상태 유지
- Asset Scanner 개선 포기
- 현재 성능 측정만 하고 차후 과제로

### 🛠️ CLI 통합 도구 개발

#### Plan A (100%): 완전한 CLI 도구
- `dhacle-cli` 전체 명령어 세트 구현

#### Plan B (70%): 핵심 명령어만
**축소된 목표**: 5개 핵심 명령어만
- scan, check, context, health, report만 구현
- backup, restore 등 고급 기능 제외

#### Plan C (40%): Wrapper 스크립트만
**최소 목표**: CLI 포기, bash wrapper만
- 복잡한 Node.js CLI 대신 간단한 bash 스크립트

**구현 방법**:
```bash
#!/bin/bash
# scripts/dhacle-wrapper.sh
case $1 in
  "scan") npm run scan:assets ;;
  "check") npm run jscpd:check ;;  
  "context") npm run context:load ;;
  *) echo "사용법: $0 [scan|check|context]" ;;
esac
```

#### Plan D (20%): 현재 npm scripts 유지
- CLI 개발 완전 포기
- 기존 npm scripts 사용법 가이드만 작성

---

## 🔧 Phase 3 폴백 전략 (고도화 및 지속성)

### 📊 프로젝트 문제 구간 개선

#### Plan A (100%): 완전한 품질 개선
- 199개 자산 품질 25% → 40% 달성
- 체계적 순서 (테이블 → API → 컴포넌트)

#### Plan B (70%): 가장 심각한 문제만
**축소된 목표**: 품질 25% → 30%
- RLS 없는 테이블 2개만 우선 해결
- API 인증 9개 중 가장 중요한 3-5개만

#### Plan C (40%): 보안 문제만
**최소 목표**: 품질 점수 무시, 보안만
- RLS 없는 테이블 2개 무조건 해결
- 나머지는 차후 과제

#### Plan D (20%): 현황 분석만
- 개선 작업 포기
- 문제 구간 상세 분석 리포트만 작성
- 우선순위 매트릭스 제공

---

## 🆘 완전 실패 시 비상 전략

### 🚨 모든 Plan이 실패할 때

#### Emergency Plan: 손실 방지
1. **즉시 중단**: 더 이상의 변경 금지
2. **현상 보존**: 현재 상태 그대로 유지
3. **백업 확인**: Git 상태 및 백업 파일 점검
4. **문제 보고**: 상세한 실패 리포트 작성

#### 실행 절차
```bash
# 1단계: 현재 변경사항 격리
git stash push -m "emergency-stash-$(date +%Y%m%d-%H%M%S)"

# 2단계: 안전한 상태로 이동
git checkout main  # 또는 안전한 브랜치

# 3단계: 현재 상태 스냅샷
git log --oneline -5 > emergency-git-state.txt
npm list --depth=0 > emergency-packages.txt
ls -la > emergency-files.txt

# 4단계: 기본 기능 확인
npm run jscpd:check > emergency-jscpd-test.txt
npm run scan:assets > emergency-assets-test.txt
```

### 📝 실패 보고서 템플릿

#### Context 없는 AI가 사용자에게 제공할 보고서
```markdown
# 🆘 작업 실패 보고서

## 📊 시도한 작업
- **목표**: [원래 목표]
- **Plan A**: [100% 목표 내용] → ❌ 실패
- **Plan B**: [70% 목표 내용] → ❌ 실패  
- **Plan C**: [40% 목표 내용] → ❌ 실패
- **Plan D**: [20% 목표 내용] → ❌ 실패

## ❌ 실패 원인 분석
### 기술적 원인
- [구체적 에러 메시지]
- [실패한 명령어]
- [환경 이슈]

### 환경적 원인  
- [시스템 리소스 문제]
- [권한 문제]
- [의존성 문제]

## 🔧 현재 상태
- **Git 상태**: [브랜치, 커밋 해시]
- **변경사항**: [stash로 보존됨]
- **파일 상태**: [핵심 파일 존재 여부]
- **기능 상태**: [기본 기능 작동 여부]

## 💡 추천 해결 방안
1. **즉시 조치**: [환경 문제 해결 방법]
2. **대안 접근**: [다른 방법론 제안]
3. **분할 접근**: [작업을 더 작은 단위로]
4. **전문가 도움**: [구체적으로 도움이 필요한 부분]

## 📋 다음 세션을 위한 준비사항
- [ ] [환경 문제 해결]
- [ ] [의존성 재설치]
- [ ] [권한 문제 해결]
- [ ] [리소스 확보]
```

---

## 🎯 상황별 폴백 결정 매트릭스

### 💻 환경 문제 발생 시
| 문제 유형 | Plan B | Plan C | Plan D |
|-----------|--------|--------|--------|
| Node.js 버전 | 일부 기능만 | 기본 기능만 | 현상 분석만 |
| 메모리 부족 | 범위 축소 | 최소 기능만 | 수동 대체 |
| 디스크 부족 | 캐시 정리 후 | 필수만 | 정리만 |
| 권한 문제 | 우회 방법 | 수동 실행 | 가이드만 |

### ⏱️ 시간 제약 시
| 남은 시간 | Plan B | Plan C | Plan D |
|-----------|--------|--------|--------|
| 50% 이상 | 핵심 기능 완성 | 최소 기능 완성 | 분석만 |
| 30% 이상 | 1-2개 기능만 | 가장 중요한 것만 | 현황 정리 |
| 10% 이하 | 안전 중단 | 백업 및 정리 | 보고서만 |

### 🔧 복잡성 초과 시  
| 복잡성 수준 | Plan B | Plan C | Plan D |
|-------------|--------|--------|--------|
| 약간 복잡 | 단순화 버전 | 핵심만 | 설계만 |
| 매우 복잡 | 분할 실행 | 일부만 | 분석만 |  
| 불가능 수준 | 대안 제시 | 현황 유지 | 차후 계획 |

---

## 🎊 성공적인 폴백 사례

### ✅ Plan B 성공 사례
```
원래 목표: 15개 → 10개 문서 통합
Plan B 결과: 15개 → 12개 문서 통합 (60% 달성)
→ 핵심 중복 3개 제거로 가독성 크게 향상
→ 완전 성공보다는 못하지만 의미있는 개선
```

### ✅ Plan C 성공 사례  
```
원래 목표: Asset Scanner 50% 성능 향상
Plan C 결과: 스캔 범위 축소로 30% 시간 단축
→ 근본적 개선은 아니지만 당장 사용성 개선
→ 향후 본격적 최적화의 기반 마련
```

### ✅ Plan D 성공 사례
```
원래 목표: CLI 통합 도구 완전 개발
Plan D 결과: 현재 명령어 사용법 완벽 정리
→ 개발은 실패했지만 사용성 크게 개선
→ 다음 개발을 위한 명확한 요구사항 정의
```

---

## 📋 폴백 실행 체크리스트

### 🔄 Plan A → Plan B 전환 시
- [ ] 원래 목표의 실패 원인 명확히 파악
- [ ] Plan B 목표를 구체적으로 재정의 (수치 포함)
- [ ] Plan B 실행에 필요한 리소스 재평가
- [ ] Plan B 성공 기준 명확히 설정
- [ ] 실행 시간 재추정 (보통 원래의 50-70%)

### 🔄 Plan B → Plan C 전환 시  
- [ ] Plan A, B 실패 패턴 분석
- [ ] 환경적 제약사항 재확인
- [ ] Plan C로 얻을 수 있는 최소 가치 명확화
- [ ] 사용자 기대치 조정
- [ ] 차후 재시도 계획 수립

### 🔄 Plan C → Plan D 전환 시
- [ ] 기술적 실행 포기 결정
- [ ] 현상 보존 및 백업 확인
- [ ] 상세한 실패 분석 보고서 작성
- [ ] 다음 시도를 위한 환경 개선 방안 제시
- [ ] 사용자와의 명확한 소통

---

**폴백 전략은 실패가 아닌 현명한 적응입니다. 상황에 맞는 최선의 결과를 만드는 것이 목표입니다! 🎯**

---

*본 가이드는 실제 프로젝트에서 발생 가능한 모든 제약 상황을 고려하여 작성되었습니다.*