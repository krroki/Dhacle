# 문서 시스템 현대화 및 정확성 검증 지시서 (TCREI 프레임워크)

> **작성일**: 2025-08-29  
> **프레임워크**: TCREI (Task-Context-Resources-Execution-Inspection)  
> **목적**: 대규모 리팩토링에 따른 문서 시스템 정확성 복원  
> **적용 원칙**: 추측 금지, 실제 확인 기반, 안전 우선

---

## T (Task) - 작업 정의

### 주요 목표
**목적**: 프로젝트 문서 시스템의 정확성 복원 및 현대화
**범위**: docs/ 폴더 내 6개 핵심 문서 정리
**성공 기준**: 
- 실제 코드베이스와 100% 일치하는 문서 달성
- 삭제된 기능 참조 완전 제거
- 현재 구현된 기능만 정확히 반영

### 단계별 작업 정의
1. **Phase 1**: 현황 파악 및 백업 (Risk: Low)
2. **Phase 2**: 우선순위 기반 문서 정리 (Risk: Medium)  
3. **Phase 3**: 교차 검증 및 일관성 확보 (Risk: Medium)
4. **Phase 4**: 최종 검증 및 품질 확인 (Risk: Low)

### 측정 가능한 목표
- **정확성**: 문서 내용과 실제 코드 100% 일치
- **완전성**: 구현된 기능의 95% 이상 문서화
- **일관성**: 문서 간 상호 참조 100% 정확
- **현재성**: 2025-08-29 기준 최신 상태 반영

---

## C (Context) - 상황 분석

### 프로젝트 현황 (확인 필요)
```bash
# 실행 전 필수 확인 명령어들
pwd  # C:\My_Claude_Project\9.Dhacle 확인
ls docs/*.md | wc -l  # 14개 문서 존재 확인
git status  # 현재 브랜치와 상태 확인
```

### 분석된 문제 상황
| 문서 | 삭제 라인 | 수정 라인 | 위험도 | 우선순위 |
|------|----------|----------|--------|----------|
| PROJECT.md | 18개 | 5개 | Low | 4 |
| CODEMAP.md | ~150개 | ~50개 | Critical | 1 |
| ROUTE_SPEC.md | ~200개 | ~30개 | Critical | 2 |
| STATE_FLOW.md | ~400개 | ~100개 | Critical | 3 |
| DATA_MODEL.md | ~600개 | ~150개 | Critical | 3 |
| CONTEXT_BRIDGE.md | 0개 | 0개 | None | N/A |

### 전제 조건 (작업 전 검증 필수)
- Git 저장소 상태 확인
- 백업 생성 가능한 디스크 공간
- 기존 14개 문서 모두 존재
- Read 권한으로 모든 파일 접근 가능

---

## R (Resources) - 자원 및 도구

### 필수 도구
1. **Read**: 모든 파일 내용 확인
2. **Edit**: 기존 문서 수정
3. **Bash**: 백업 및 검증 명령어
4. **Glob**: 파일 패턴 검색
5. **Grep**: 내용 검색 및 검증

### 백업 전략
```bash
# 백업 디렉토리 생성
mkdir -p backups/docs-cleanup-$(date +%Y%m%d_%H%M%S)

# 전체 docs 폴더 백업
cp -r docs/ backups/docs-cleanup-$(date +%Y%m%d_%H%M%S)/

# 백업 검증
ls -la backups/docs-cleanup-$(date +%Y%m%d_%H%M%S)/
```

### 검증 도구
```bash
# 문서 일관성 검증
grep -r "deleted-feature" docs/  # 삭제된 기능 참조 검색
grep -r "TODO" docs/  # 미완성 항목 검색

# 링크 유효성 검증
grep -r "\[.*\](" docs/  # 마크다운 링크 검색
grep -r "src/" docs/  # 파일 경로 참조 검색
```

### 복구 메커니즘
```bash
# 긴급 복구 (필요시)
rm -rf docs/
cp -r backups/docs-cleanup-$(date +%Y%m%d_%H%M%S)/ docs/
```

---

## E (Execution) - 실행 방법

### Phase 1: 현황 파악 및 백업 (15분)

#### 1.1 환경 확인
```bash
# 작업 디렉토리 확인
pwd
ls docs/*.md | wc -l  # 14개 확인

# Git 상태 확인
git status
git log --oneline -5
```

#### 1.2 백업 생성
```bash
# 타임스탬프 백업
mkdir -p backups/docs-cleanup-$(date +%Y%m%d_%H%M%S)
cp -r docs/ backups/docs-cleanup-$(date +%Y%m%d_%H%M%S)/
```

#### 1.3 현황 분석
- **필수**: 각 문서를 Read로 전체 내용 확인
- **기준**: 실제 존재하지 않는 파일/기능 참조 식별
- **기록**: 문제 패턴과 수정 필요 영역 리스트 작성

### Phase 2: 우선순위 기반 정리 (60분)

#### 2.1 CODEMAP.md 정리 (Critical - Priority 1)
```bash
# 실제 파일 구조 확인
find src/ -type f -name "*.tsx" -o -name "*.ts" | head -20
```
- 삭제된 파일 참조 제거 (~150라인)
- 현재 존재하는 파일만 포함 (~50라인 수정)
- 실제 디렉토리 구조와 100% 일치

#### 2.2 ROUTE_SPEC.md 정리 (Critical - Priority 2)  
```bash
# 실제 라우트 확인
find src/app -name "page.tsx" -o -name "route.ts" | sort
```
- 삭제된 라우트 제거 (~200라인)
- 현재 구현된 라우트만 포함 (~30라인 수정)

#### 2.3 STATE_FLOW.md & DATA_MODEL.md 정리 (Critical - Priority 3)
```bash
# 실제 훅과 타입 확인
ls src/hooks/queries/
ls src/types/
```
- 삭제된 기능 참조 제거
- 현재 구현된 상태 관리만 반영

### Phase 3: 교차 검증 및 일관성 확보 (30분)

#### 3.1 참조 일관성 검증
```bash
# 문서 간 교차 참조 확인
grep -r "CLAUDE.md\|docs/" docs/ | grep -v "Binary"
```

#### 3.2 링크 유효성 검증
```bash
# 마크다운 링크 검증
grep -r "\[.*\](.*\.md)" docs/
grep -r "\[.*\](src/.*)" docs/
```

### Phase 4: 최종 검증 (15분)

#### 4.1 품질 검증
```bash
# TODO 및 미완성 항목 검색
grep -r "TODO\|FIXME\|WIP" docs/

# 삭제된 기능 참조 검색  
grep -r "deleted\|removed\|deprecated" docs/
```

#### 4.2 일관성 검증
- 각 문서 간 상호 참조 정확성 확인
- 파일 경로와 실제 존재 여부 매칭
- 기능 설명과 실제 구현 일치 여부

---

## I (Inspection) - 검증 기준

### 완료 기준 체크리스트

#### ✅ 정확성 검증
- [ ] 문서 내 모든 파일 경로가 실제 존재함
- [ ] 언급된 모든 기능이 실제 구현됨
- [ ] 코드 예시가 현재 코드베이스와 일치함
- [ ] 삭제된 기능 참조가 완전히 제거됨

#### ✅ 완전성 검증  
- [ ] 구현된 주요 기능 95% 이상 문서화
- [ ] API 라우트 목록이 실제와 일치
- [ ] 컴포넌트 목록이 실제와 일치
- [ ] 상태 관리 패턴이 현재 구현과 일치

#### ✅ 일관성 검증
- [ ] 문서 간 교차 참조 100% 정확
- [ ] 용어 사용이 프로젝트 전반에서 일관됨
- [ ] 디렉토리 구조 설명이 통일됨
- [ ] 명명 규칙이 일관되게 적용됨

#### ✅ 현재성 검증
- [ ] 2025-08-29 기준 최신 상태 반영
- [ ] 최근 변경사항이 모두 반영됨
- [ ] 더 이상 사용하지 않는 패턴 제거
- [ ] 현재 권장 패턴만 포함

### 최종 검증 명령어
```bash
# 1. 링크 유효성 최종 확인
find docs/ -name "*.md" -exec grep -l "\[.*\](src/" {} \; | xargs -I {} bash -c 'echo "=== {} ===" && grep "\[.*\](src/" {}'

# 2. 파일 참조 유효성 확인
grep -r "src/.*\.tsx\|src/.*\.ts" docs/ | while read line; do
  file=$(echo $line | grep -o "src/[^)]*")
  if [ ! -f "$file" ]; then
    echo "❌ 존재하지 않는 파일 참조: $line"
  fi
done

# 3. TODO 및 미완성 항목 최종 확인
grep -r "TODO\|FIXME\|WIP\|XXX" docs/ && echo "❌ 미완성 항목 발견" || echo "✅ 미완성 항목 없음"
```

### 롤백 조건
다음 상황에서 즉시 롤백:
- 문서 구조가 심각하게 손상됨
- 50% 이상의 링크가 깨짐
- 실제 코드와 일치율이 80% 미만
- 검증 스크립트가 3개 이상 실패

### 롤백 실행
```bash
# 백업에서 복구
BACKUP_DIR=$(ls -t backups/ | head -1)
rm -rf docs/
cp -r backups/$BACKUP_DIR/ docs/
echo "✅ $BACKUP_DIR 에서 복구 완료"
```

### 성공 확인
```bash
# 최종 성공 확인
echo "=== 문서 현대화 완료 확인 ==="
echo "📁 문서 개수: $(ls docs/*.md | wc -l)/14"
echo "🔗 깨진 링크: $(grep -r "\[.*\](src/" docs/ | wc -l) 개 (0개 목표)"
echo "📝 TODO 항목: $(grep -r "TODO" docs/ | wc -l) 개 (0개 목표)"
echo "✅ 작업 완료 시각: $(date)"
```

---

## 🚨 중요 안전 수칙

1. **백업 필수**: 모든 작업 전 반드시 백업
2. **단계적 접근**: 한 번에 하나씩, 검증 후 다음 단계
3. **실제 확인**: 추측 금지, 모든 참조는 실제 파일로 검증
4. **복구 준비**: 언제든 이전 상태로 돌아갈 수 있도록 준비
5. **품질 우선**: 완성도보다 정확성 우선

---

## 📋 작업 완료 후 확인사항

### 필수 검증 항목
- [ ] 백업 파일이 정상적으로 생성됨
- [ ] 모든 문서가 읽기 가능한 상태임
- [ ] Git 상태가 작업 전과 일치함
- [ ] 14개 문서 모두 존재함
- [ ] 검증 스크립트 모두 통과함

### 문서별 완료 확인
- [ ] CODEMAP.md: 실제 파일 구조와 100% 일치
- [ ] ROUTE_SPEC.md: 실제 라우트와 100% 일치  
- [ ] STATE_FLOW.md: 실제 상태 관리와 일치
- [ ] DATA_MODEL.md: 실제 데이터 모델과 일치
- [ ] PROJECT.md: 현재 프로젝트 상태 반영
- [ ] CONTEXT_BRIDGE.md: 변경 불필요 확인

---

**작성자**: AI Assistant  
**검토 필요**: 실행 전 사용자 승인 필수  
**예상 소요 시간**: 120분 (4 Phase × 평균 30분)  
**위험도**: Medium (백업과 검증으로 리스크 최소화)