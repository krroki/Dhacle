# ✅ Dhacle 프로젝트 실행 체크리스트

*Context 없는 AI를 위한 단계별 검증 체크리스트 - 실수 방지 및 품질 보장*

---

## 📋 체크리스트 개요

### 목적
- **누락 방지**: 중요한 단계를 빠뜨리지 않도록 체크리스트 제공
- **품질 보장**: 각 단계별 검증으로 품질 기준 달성
- **안전성**: 위험한 작업 전 사전 확인으로 사고 방지
- **일관성**: 모든 작업에서 동일한 품질 기준 적용

### 사용 방법
1. **작업 전 체크**: 해당 체크리스트를 먼저 확인
2. **단계별 수행**: 각 항목을 순서대로 실행하며 체크
3. **완료 확인**: 모든 항목이 완료되어야 다음 단계 진행
4. **실패 시 중단**: 체크리스트 항목 실패 시 원인 해결 후 재시도

---

## 🚀 작업 시작 전 기본 검증 체크리스트

### Environment 기본 확인 (필수)
- [ ] **현재 위치 확인**
  ```bash
  pwd
  # 예상 결과: [프로젝트경로]/dhacle
  ```

- [ ] **Git 상태 확인**
  ```bash
  git branch --show-current
  # 예상 결과: feature/safe-massive-refactor
  
  git status --porcelain | wc -l
  # 예상 결과: 변경사항 개수 (숫자)
  ```

- [ ] **Node.js 환경 확인**
  ```bash
  node --version
  # 예상 결과: v18.17.0 이상
  
  npm --version
  # 예상 결과: 9.6.7 이상
  ```

- [ ] **필수 파일 존재 확인**
  ```bash
  ls package.json .jscpd.json project-dna.json
  # 예상 결과: 3개 파일 모두 존재
  ```

- [ ] **의존성 설치 확인**
  ```bash
  npm list jscpd --depth=0
  # 예상 결과: jscpd@4.0.5
  
  ls node_modules/.bin/jscpd
  # 예상 결과: 실행 파일 존재
  ```

- [ ] **디스크 공간 확인**
  ```bash
  df -h .
  # 예상 결과: 여유 공간 1GB 이상
  ```

### AI Context System 상태 확인 (필수)
- [ ] **핵심 명령어 실행 테스트**
  ```bash
  npm run scan:assets > /dev/null && echo "✅ Asset Scanner 정상"
  npm run jscpd:check > /dev/null && echo "✅ jscpd 정상"
  npm run context:load > /dev/null && echo "✅ Context Loader 정상"
  ```

- [ ] **자동 생성 파일 확인**
  ```bash
  ls asset-inventory.json ai-context-warmup.md
  # 예상 결과: 두 파일 모두 존재
  
  stat -c%s asset-inventory.json
  # 예상 결과: 40KB 이상 (정상적인 크기)
  ```

### 메모리 및 성능 준비 (권장)
- [ ] **메모리 설정 확인**
  ```bash
  echo $NODE_OPTIONS
  # 권장 결과: --max-old-space-size=4096
  
  # 설정되지 않았다면 설정
  export NODE_OPTIONS="--max-old-space-size=4096"
  ```

- [ ] **백그라운드 프로세스 확인**
  ```bash
  ps aux | grep -c "[n]ode"
  # 예상 결과: 5개 이하 (너무 많으면 메모리 부족 위험)
  ```

---

## 📋 Phase 1: 즉시 정리 및 안정화 체크리스트

### Phase 1 시작 전 준비
- [ ] **백업 생성**
  ```bash
  git stash push -m "Phase 1 시작 전 백업"
  git log --oneline -1
  # 백업 지점 기록
  ```

- [ ] **현재 상태 기록**
  ```bash
  npm run full:scan > phase1-baseline.txt 2>&1
  # 기준선 데이터 저장
  ```

### Task 1: 문서 체계 정리
**SC Command**: `/cleanup docs --validate --evidence --systematic`

- [ ] **작업 전 문서 현황 파악**
  ```bash
  find docs/ -name "*.md" | wc -l
  # 현재 문서 개수 (예상: 15개 이상)
  
  du -sh docs/
  # 문서 폴더 크기 기록
  ```

- [ ] **중복 문서 식별**
  ```bash
  npm run jscpd:check --pattern "docs/**/*.md" > docs-duplicates.txt
  # 중복 문서 리스트 생성
  ```

- [ ] **문서 정리 실행**
  - 중복 내용 제거
  - 구조화 및 통합
  - 우선순위 문서 명시

- [ ] **정리 후 검증**
  ```bash
  find docs/ -name "*.md" | wc -l
  # 목표: 10개 이하
  
  git diff --stat
  # 변경된 파일들 확인
  ```

- [ ] **품질 검증**
  ```bash
  # 주요 문서들 존재 확인
  ls docs/CONTEXT_BRIDGE.md docs/PROJECT.md docs/CHECKLIST.md
  # 3개 핵심 문서 존재 필수
  ```

### Task 2: 검증 스크립트 중복 제거
**SC Command**: `/analyze scripts --focus quality --systematic --evidence`

- [ ] **스크립트 현황 분석**
  ```bash
  find scripts/ -name "*.js" | wc -l
  # 현재 스크립트 개수
  
  grep -r "verify" scripts/ | wc -l
  # verify 관련 스크립트 개수
  ```

- [ ] **중복 기능 식별**
  ```bash
  npm run jscpd:check --pattern "scripts/**/*.js" > scripts-duplicates.txt
  # 스크립트 중복 분석
  ```

- [ ] **성능 벤치마크 (Before)**
  ```bash
  time npm run verify:parallel
  # 현재 실행 시간 기록 (예상: ~25초)
  ```

- [ ] **스크립트 통합 실행**
  - 중복 로직 제거
  - 공통 함수 추출
  - 실행 순서 최적화

- [ ] **통합 후 검증**
  ```bash
  time npm run verify:parallel
  # 목표: 50% 시간 단축 (12-15초)
  
  npm run verify:parallel > /dev/null && echo "✅ 통합 검증 성공"
  ```

### Task 3: 시스템 헬스체크 자동화
**SC Command**: `/build health-check --validate --test-driven --evidence`

- [ ] **헬스체크 스크립트 생성**
  ```bash
  ls scripts/health-check.js
  # 새로운 스크립트 존재 확인
  
  chmod +x scripts/health-check.js
  # 실행 권한 설정
  ```

- [ ] **npm 스크립트 추가 검증**
  ```bash
  npm run | grep health
  # health 관련 명령어 확인
  
  npm run health:check > /dev/null && echo "✅ Health Check 정상"
  ```

- [ ] **자동화 테스트**
  ```bash
  # 10초 간격으로 3회 실행
  for i in {1..3}; do
    npm run health:check
    sleep 10
  done
  # 일관된 결과 확인
  ```

### Task 4: 백업 및 복구 전략
**SC Command**: `/implement backup-system --validate --safe-mode --evidence`

- [ ] **백업 시스템 구현 검증**
  ```bash
  ls scripts/backup-system.js
  # 백업 스크립트 존재
  
  npm run backup:create > /dev/null && echo "✅ 백업 생성 성공"
  ```

- [ ] **복구 테스트**
  ```bash
  # 테스트용 파일 생성
  echo "test content" > test-file.txt
  
  # 백업
  npm run backup:create
  
  # 파일 삭제
  rm test-file.txt
  
  # 복구 테스트
  npm run backup:restore
  ls test-file.txt
  # 파일 복구 확인
  
  rm test-file.txt  # 정리
  ```

### Task 5: 에러 메시지 개선
**SC Command**: `/improve error-handling --validate --user-friendly --loop`

- [ ] **에러 메시지 개선 전 수집**
  ```bash
  # 의도적으로 에러 발생시켜 현재 메시지 확인
  npm run non-existent-script 2>&1 | tee old-errors.txt
  ```

- [ ] **개선 후 검증**
  ```bash
  npm run non-existent-script 2>&1 | tee new-errors.txt
  
  # 개선 효과 비교
  diff old-errors.txt new-errors.txt
  ```

### Phase 1 완료 검증
- [ ] **전체 기능 테스트**
  ```bash
  npm run full:scan > phase1-result.txt 2>&1
  
  # 기준선과 비교
  diff phase1-baseline.txt phase1-result.txt
  ```

- [ ] **성과 측정**
  ```bash
  # 문서 개수: 15개 → 10개 이하
  find docs/ -name "*.md" | wc -l
  
  # 검증 시간: 25초 → 15초 이하
  time npm run verify:parallel
  
  # 헬스체크: 새 기능 추가
  npm run health:check && echo "✅ 헬스체크 시스템 작동"
  ```

- [ ] **Git 상태 정리**
  ```bash
  git add .
  git commit -m "Phase 1: 즉시 정리 및 안정화 완료
  
  - 문서 체계 정리: 15개 → 10개
  - 검증 스크립트 통합 및 최적화
  - 시스템 헬스체크 자동화
  - 백업/복구 시스템 구축
  - 사용자 친화적 에러 메시지 적용"
  ```

---

## 🚀 Phase 2: 성능 최적화 및 개선 체크리스트

### Phase 2 시작 전 준비
- [ ] **Phase 1 완료 확인**
  ```bash
  git log --oneline -1 | grep -i "phase 1"
  # Phase 1 완료 커밋 확인
  ```

- [ ] **성능 기준선 측정**
  ```bash
  # Asset Scanner 성능
  time npm run scan:assets
  # 현재 시간 기록 (예상: ~8초)
  
  # Context Loader 성능
  time npm run context:load  
  # 현재 시간 기록 (예상: ~3초)
  ```

### Task 6: Asset Scanner 성능 최적화
**SC Command**: `/improve asset-scanner --focus performance --validate --benchmark --evidence`

- [ ] **최적화 전 벤치마크**
  ```bash
  # 3회 실행하여 평균 측정
  for i in {1..3}; do
    time npm run scan:assets
  done
  # 평균 시간 계산하여 기록
  ```

- [ ] **메모리 사용량 측정**
  ```bash
  # 백그라운드에서 메모리 모니터링
  (npm run scan:assets &
  sleep 2
  ps aux | grep "asset-scanner" | head -1 | awk '{print $6}') 
  # 메모리 사용량 기록 (KB 단위)
  ```

- [ ] **최적화 구현 후 검증**
  ```bash
  # 성능 개선 확인
  time npm run scan:assets
  # 목표: 50% 시간 단축 (4초 이하)
  
  # 기능 정상성 확인
  npm run scan:assets > /dev/null && echo "✅ 기능 정상"
  
  # 결과 파일 크기 비교
  stat -c%s asset-inventory.json
  # 기존 크기와 비슷해야 함 (데이터 누락 없음)
  ```

### Task 7: CLI 통합 도구 개발  
**SC Command**: `/build cli-tool --validate --test-driven --c7 --systematic`

- [ ] **CLI 도구 구현 검증**
  ```bash
  ls scripts/dhacle-cli.js
  # CLI 도구 파일 존재 확인
  
  chmod +x scripts/dhacle-cli.js
  # 실행 권한 설정
  ```

- [ ] **기본 기능 테스트**
  ```bash
  node scripts/dhacle-cli.js --help
  # 도움말 출력 확인
  
  node scripts/dhacle-cli.js scan
  # Asset Scanner 실행 확인
  
  node scripts/dhacle-cli.js check  
  # jscpd 실행 확인
  
  node scripts/dhacle-cli.js context
  # Context Loader 실행 확인
  ```

- [ ] **통합 테스트**
  ```bash
  # 모든 기능 순차 실행
  node scripts/dhacle-cli.js health && \
  node scripts/dhacle-cli.js scan && \
  node scripts/dhacle-cli.js check && \
  node scripts/dhacle-cli.js context && \
  echo "✅ CLI 통합 테스트 성공"
  ```

### Task 8: 히스토리 추적 시스템
**SC Command**: `/implement tracking-system --validate --evidence --systematic`

- [ ] **추적 시스템 구현 검증**
  ```bash
  ls scripts/history-tracker.js
  # 추적 스크립트 존재
  
  ls history-data.csv
  # 히스토리 데이터 파일 존재
  ```

- [ ] **데이터 수집 테스트**
  ```bash
  npm run track:collect
  # 현재 상태 데이터 수집
  
  wc -l history-data.csv
  # 데이터 라인 수 확인 (1 이상)
  
  tail -1 history-data.csv
  # 최신 데이터 확인
  ```

- [ ] **트렌드 분석 테스트**
  ```bash
  npm run track:report
  # 트렌드 리포트 생성
  
  ls history-report.txt
  # 리포트 파일 생성 확인
  ```

### Task 9: Context Loader 캐싱 최적화
**SC Command**: `/improve context-loader --focus performance --validate --benchmark`

- [ ] **캐싱 최적화 전 성능 측정**
  ```bash
  # 캐시 클리어 후 측정
  rm -f context-cache.json
  
  time npm run context:load
  # 첫 실행 시간 (예상: 3초)
  
  time npm run context:load  
  # 두 번째 실행 시간 (캐시 효과 확인)
  ```

- [ ] **캐시 시스템 검증**
  ```bash
  ls context-cache.json
  # 캐시 파일 생성 확인
  
  stat -c%s context-cache.json
  # 캐시 파일 크기 (적정 크기 확인)
  ```

- [ ] **성능 개선 확인**
  ```bash
  # 여러 번 실행하여 일관된 성능 확인
  for i in {1..5}; do
    time npm run context:load 2>&1 | grep real
  done
  # 목표: 5초 이하 일관된 성능
  ```

### Phase 2 완료 검증
- [ ] **전체 성능 향상 확인**
  ```bash
  # Asset Scanner: 8초 → 4초
  time npm run scan:assets | grep real
  
  # Context Loader: 3초 → 1.5초  
  time npm run context:load | grep real
  
  # CLI 통합: 모든 기능 작동
  node scripts/dhacle-cli.js health
  ```

- [ ] **기능 정상성 검증**
  ```bash
  npm run full:scan > phase2-result.txt 2>&1
  
  # 에러 없이 완료되어야 함
  grep -i error phase2-result.txt | wc -l
  # 결과: 0 (에러 없음)
  ```

---

## 🔧 Phase 3: 고도화 및 지속성 체크리스트

### Task 10: 프로젝트 품질 개선
**SC Command**: `/improve project-quality --systematic --loop --validate --evidence --focus quality`

- [ ] **품질 개선 전 현황 측정**
  ```bash
  npm run scan:assets | grep -A 10 "품질 점수"
  # 현재 품질 점수 기록 (예상: 25%)
  ```

- [ ] **개선 대상 식별**
  ```bash
  # Client Component 비율 확인
  grep -r "use client" src/ | wc -l
  
  # API 인증 누락 확인  
  grep -L "getUser" src/app/api/**/*.ts | wc -l
  
  # any 타입 사용 확인
  grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l
  ```

- [ ] **단계별 개선 및 검증**
  ```bash
  # 각 개선 후 품질 점수 확인
  npm run scan:assets | grep "품질 점수"
  # 목표: 25% → 40%
  ```

### Task 11: 운영 매뉴얼 작성
**SC Command**: `/document operations --comprehensive --validate --systematic`

- [ ] **운영 매뉴얼 생성 검증**
  ```bash
  ls docs/OPERATIONS_MANUAL.md
  # 운영 매뉴얼 존재 확인
  
  wc -l docs/OPERATIONS_MANUAL.md
  # 충분한 분량 확인 (200라인 이상)
  ```

- [ ] **매뉴얼 완성도 확인**
  ```bash
  # 필수 섹션 존재 확인
  grep -c "일일 체크리스트\|주간 점검\|월간 보고\|장애 대응" docs/OPERATIONS_MANUAL.md
  # 결과: 4 (모든 섹션 존재)
  ```

---

## ⚠️ 에러 발생 시 대응 체크리스트

### 즉시 대응 (모든 에러)
- [ ] **에러 정보 수집**
  ```bash
  # 전체 에러 메시지 파일로 저장
  [실패한_명령어] 2>&1 | tee error-$(date +%Y%m%d-%H%M%S).log
  ```

- [ ] **환경 상태 확인**
  ```bash
  node --version
  npm --version  
  git status --porcelain
  pwd
  df -h .
  # 환경 정보 기록
  ```

- [ ] **백업 상태 확인**
  ```bash
  git log --oneline -5
  # 최근 백업 지점 확인
  
  git stash list
  # 임시 백업 존재 여부
  ```

### 에러 수준별 대응

#### Critical 에러 (즉시 중단)
- [ ] **작업 즉시 중단**
- [ ] **현재 상태 백업**
  ```bash
  git stash push -m "에러 발생 시점 백업 $(date)"
  ```
- [ ] **에스컬레이션 준비**
  ```bash
  # EXCEPTION_HANDLING_GUIDE.md의 에스컬레이션 템플릿 사용
  ```

#### High Priority 에러 (1시간 내 해결 시도)
- [ ] **EXCEPTION_HANDLING_GUIDE.md 자주 발생하는 오류 섹션 확인**
- [ ] **해결 시도 후 검증**
  ```bash
  # 해결 시도 후 원래 명령어 재실행
  [원래_명령어] && echo "✅ 문제 해결됨"
  ```

#### Medium Priority 에러 (우회책 적용)
- [ ] **우회책 적용**
- [ ] **우회책 검증 후 계속 진행**
- [ ] **나중에 해결 위한 기록 남김**

---

## 🏁 작업 완료 후 최종 검증 체크리스트

### 기능 정상성 확인 (필수)
- [ ] **모든 핵심 명령어 실행 테스트**
  ```bash
  npm run scan:assets && echo "✅ Asset Scanner"
  npm run jscpd:check && echo "✅ jscpd"  
  npm run context:load && echo "✅ Context Loader"
  npm run verify:parallel && echo "✅ 전체 검증"
  npm run build && echo "✅ 빌드"
  ```

- [ ] **자동 생성 파일 상태 확인**
  ```bash
  stat -c%s asset-inventory.json
  # 40KB 이상 (정상적인 자산 데이터)
  
  stat -c%s ai-context-warmup.md  
  # 5KB 이상 (정상적인 컨텍스트 데이터)
  ```

- [ ] **Git 상태 정리**
  ```bash
  git status --porcelain
  # 의도된 변경사항만 존재하는지 확인
  
  git diff --check
  # 공백 문제 등 없는지 확인
  ```

### 성과 측정 (필수)
- [ ] **정량적 지표 확인**
  ```bash
  # 문서 수: 15개 → 10개 이하
  find docs/ -name "*.md" | wc -l
  
  # 중복률: 5% 이하
  npm run jscpd:check | grep "duplicated percentage"
  
  # Asset Scanner 성능: 50% 향상
  time npm run scan:assets
  
  # Context Loader 성능: 30초 → 10초 이하  
  time npm run context:load
  ```

- [ ] **품질 지표 확인**
  ```bash
  npm run scan:assets > quality-final.txt
  
  # 품질 점수: 25% → 40%
  grep "품질점수" quality-final.txt
  
  # any 타입 사용: 0개
  grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l
  
  # Client Component 비율: 감소 확인
  grep -r "use client" src/ | wc -l
  ```

### 시스템 안정성 확인 (필수)
- [ ] **메모리 사용량 정상**
  ```bash
  # 모든 스크립트 실행 후 메모리 확인
  ps aux | grep node | awk '{sum+=$6} END {print "Total memory: " sum " KB"}'
  # 1GB 이하 유지
  ```

- [ ] **디스크 공간 확인**
  ```bash
  df -h .
  # 1GB 이상 여유 공간 유지
  ```

- [ ] **장기 안정성 테스트**
  ```bash
  # 5회 연속 실행 테스트
  for i in {1..5}; do
    npm run full:scan > /dev/null && echo "Run $i: OK" || echo "Run $i: FAILED"
    sleep 30
  done
  # 모든 실행 성공해야 함
  ```

---

## 📊 성과 측정 및 문서화 체크리스트

### Before/After 데이터 수집
- [ ] **성능 비교 데이터 생성**
  ```bash
  # 실행 시간 비교표 생성
  echo "=== 성능 개선 결과 ===" > performance-report.txt
  echo "Asset Scanner: Before 8s → After $(time npm run scan:assets 2>&1 | grep real)" >> performance-report.txt
  echo "Context Loader: Before 3s → After $(time npm run context:load 2>&1 | grep real)" >> performance-report.txt
  echo "검증 시스템: Before 25s → After $(time npm run verify:parallel 2>&1 | grep real)" >> performance-report.txt
  ```

- [ ] **품질 지표 비교**
  ```bash
  # 품질 개선 결과
  npm run scan:assets | grep -A 5 "품질점수" >> quality-improvement.txt
  ```

### 문서 업데이트 (권장)
- [ ] **README.md 업데이트**
  ```bash
  # 새로운 기능들을 README.md에 반영
  grep -q "AI Context System" README.md || echo "📊 AI Context System - 자동 자산 추적 및 품질 관리" >> README.md
  ```

- [ ] **CHANGELOG.md 생성**
  ```bash
  cat > CHANGELOG.md << 'EOF'
  # Changelog

  ## [2025-08-30] AI Context System 도입
  ### Added
  - jscpd 중복 코드 감지 시스템 (5% 임계값)
  - Asset Scanner 자동 자산 추적 (199개 자산)
  - AI Context Loader 30초 워밍업 시스템
  - 통합 CLI 도구 (dhacle-cli)
  
  ### Improved  
  - Asset Scanner 성능 50% 향상
  - 검증 시스템 실행 시간 50% 단축
  - 문서 체계 정리 (15개 → 10개)
  
  ### Fixed
  - 사용자 친화적 에러 메시지 적용
  - 시스템 헬스체크 자동화
  EOF
  ```

### 최종 커밋 및 정리
- [ ] **변경사항 커밋**
  ```bash
  git add .
  git commit -m "feat: AI Context System 완전 구현

  🚀 주요 성과:
  - 중복 감지: jscpd 5% 임계값 적용  
  - 자산 추적: 199개 자산 실시간 모니터링
  - 성능 향상: Asset Scanner 50% 최적화
  - 품질 개선: 25% → 40% 달성
  - 문서 정리: 15개 → 10개 통합
  - CLI 통합: dhacle-cli 도구 개발
  
  🛠️ 기술적 개선:
  - Context Loader 캐싱 시스템
  - 히스토리 추적 시스템
  - 자동 백업/복구 시스템
  - 헬스체크 자동화
  
  📊 검증 완료:
  - 모든 기능 정상 작동 확인
  - 성능 기준 달성
  - 29개 후속작업 로드맵 완성
  
  🧠 Generated with Claude Code
  Co-Authored-By: Claude <noreply@anthropic.com>"
  ```

- [ ] **브랜치 정리 준비**
  ```bash
  git log --oneline -10
  # 커밋 히스토리 확인
  
  git push origin feature/safe-massive-refactor
  # 원격 저장소에 푸시 (필요시)
  ```

---

## 💡 체크리스트 사용 팁

### 효율적인 사용법
1. **일괄 체크**: 연관된 항목들을 그룹화하여 한 번에 체크
2. **병렬 실행**: 독립적인 명령어들은 병렬로 실행
3. **자동화 활용**: 반복적인 체크는 스크립트로 자동화
4. **기록 보관**: 체크리스트 결과를 파일로 보관

### 문제 발생 시
1. **즉시 중단**: 예상과 다른 결과 나오면 즉시 중단
2. **상황 기록**: 모든 명령어와 결과를 기록
3. **가이드 참조**: EXCEPTION_HANDLING_GUIDE.md 확인
4. **단계적 해결**: 간단한 해결책부터 시도

### 품질 보장
1. **모든 항목 체크**: 건너뛰는 항목 없이 모두 확인
2. **결과 검증**: 예상 결과와 실제 결과 비교
3. **재확인**: 중요한 항목은 2회 이상 확인
4. **문서화**: 특이사항이나 변경사항 문서에 기록

---

*이 체크리스트는 Context 없는 AI가 Dhacle 프로젝트의 29개 후속작업을 안전하고 체계적으로 수행할 수 있도록 설계되었습니다. 모든 항목을 순서대로 체크하면서 진행하시기 바랍니다.*