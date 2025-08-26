/sc:improve --validate --seq --think-hard --wave-mode auto
"14개 핵심 문서 체계를 효율적으로 통합하고 중복을 제거하여 유지보수성을 극대화"

# 📋 문서 체계 통합 및 최적화 지시서 v1.0

## 🚨 프로젝트 특화 규칙 확인 (필수)
⚠️ **경고**: 아래 문서 미확인 시 프로젝트 파괴 가능성 90%

### 📌 필수 확인 문서
1. `/docs/CONTEXT_BRIDGE.md` - 반복 실수 패턴 방지
2. `/docs/PROJECT.md` - 현재 프로젝트 상태  
3. `/docs/CLAUDE.md` - 문서 체계 가이드
4. `/CLAUDE.md` (루트) - 전체 AI 작업 네비게이터

### ⛔ 절대 금지사항
- ❌ 임시방편 코드 작성 (주석 처리, TODO, any 타입)
- ❌ 자동 변환 스크립트 생성
- ❌ 사용자 협의 없는 문서 생성/삭제
- ❌ 검증 없는 일괄 변경

---

## 📊 현재 상태 분석 (2025년 2월 23일 기준)

### 완료된 작업
✅ **Phase 2 완료**: 8개 폴더별 CLAUDE.md 생성
- src/app/(pages)/CLAUDE.md (481줄)
- src/app/api/CLAUDE.md (508줄)
- src/components/CLAUDE.md (610줄)
- src/hooks/CLAUDE.md
- src/lib/CLAUDE.md
- src/lib/security/CLAUDE.md
- src/lib/supabase/CLAUDE.md
- src/types/CLAUDE.md

✅ **Phase 3 완료**: 3개 기술 스택 문서 생성
- TECH_STACK.md
- NPM_SCRIPTS_GUIDE.md
- TOOL_DECISION_TREE.md

### 문제점
🔴 **중복 문서 존재**
- COMPONENT_INVENTORY.md ↔ src/components/CLAUDE.md
- ROUTE_SPEC.md ↔ src/app/api/CLAUDE.md + src/app/(pages)/CLAUDE.md
- INSTRUCTION_TEMPLATE.md ↔ INSTRUCTION_TEMPLATE_v16.md

🔴 **비대한 문서**
- CODEMAP.md: 기술 스택 + NPM 스크립트 + 구조 (500줄 이상)
- CHECKLIST.md: 모든 체크리스트 중복 포함

---

## 🎯 작업 목표

### 최종 목표
14개 핵심 문서를 **10개로 축소**하고 각 문서의 역할을 명확히 정의

### 세부 목표
1. 중복 문서 3개 제거
2. 비대한 문서 2개 슬림화
3. Single Source of Truth 구현
4. 각 문서 200줄 이하 유지

---

## 📋 실행 Phase

### Phase 1: 백업 및 준비 (30분)
```bash
# 1. 전체 문서 백업
cp -r docs/ docs.backup.20250223/

# 2. 변경 대상 파일 목록 작성
cat > consolidation-targets.txt << EOF
docs/COMPONENT_INVENTORY.md
docs/ROUTE_SPEC.md
docs/INSTRUCTION_TEMPLATE.md
docs/CODEMAP.md
docs/CHECKLIST.md
EOF

# 3. 의존성 확인
grep -r "COMPONENT_INVENTORY\|ROUTE_SPEC" docs/ src/
```

### Phase 2: 문서 통합 및 제거 (1시간)

#### 2.1 INSTRUCTION_TEMPLATE 통합
```bash
# v16을 메인으로 만들기
mv docs/INSTRUCTION_TEMPLATE_v16.md docs/INSTRUCTION_TEMPLATE.md.new
rm docs/INSTRUCTION_TEMPLATE.md
mv docs/INSTRUCTION_TEMPLATE.md.new docs/INSTRUCTION_TEMPLATE.md

# Git 기록 보존
git add docs/INSTRUCTION_TEMPLATE.md
git commit -m "docs: INSTRUCTION_TEMPLATE v16을 메인 버전으로 통합"
```

#### 2.2 COMPONENT_INVENTORY 제거
```bash
# 1. 중요 내용 확인 및 백업
cp docs/COMPONENT_INVENTORY.md docs/archive/

# 2. src/components/CLAUDE.md에 누락된 내용 추가
# (수동 검토 필요)

# 3. 참조 업데이트
find docs/ -type f -name "*.md" -exec sed -i 's|COMPONENT_INVENTORY\.md|../src/components/CLAUDE.md|g' {} \;

# 4. 파일 제거
rm docs/COMPONENT_INVENTORY.md
git rm docs/COMPONENT_INVENTORY.md
```

#### 2.3 ROUTE_SPEC 제거
```bash
# 1. 중요 내용 백업
cp docs/ROUTE_SPEC.md docs/archive/

# 2. API 라우트 → src/app/api/CLAUDE.md
# 3. 페이지 라우트 → src/app/(pages)/CLAUDE.md
# (수동 병합 필요)

# 4. 참조 업데이트
find docs/ -type f -name "*.md" -exec sed -i 's|ROUTE_SPEC\.md|../src/app/api/CLAUDE.md|g' {} \;

# 5. 파일 제거
rm docs/ROUTE_SPEC.md
git rm docs/ROUTE_SPEC.md
```

### Phase 3: 문서 슬림화 (1시간)

#### 3.1 CODEMAP.md 슬림화
```markdown
# 기존 구조 (500줄+)
- 프로젝트 구조 (100줄)
- 기술 스택 (200줄) → TECH_STACK.md로 이동
- NPM 스크립트 (150줄) → NPM_SCRIPTS_GUIDE.md로 이동
- 기타 (50줄)

# 새 구조 (200줄 이하)
- 프로젝트 구조 (150줄)
- 핵심 모듈 관계도 (30줄)
- 참조 링크 (20줄)
```

#### 3.2 CHECKLIST.md 슬림화
```markdown
# 기존 구조 (400줄+)
- 전체 체크리스트 (50줄)
- API 체크리스트 (100줄) → src/app/api/CLAUDE.md
- 컴포넌트 체크리스트 (100줄) → src/components/CLAUDE.md
- 테스트 체크리스트 (100줄) → tests/CLAUDE.md
- 기타 (50줄)

# 새 구조 (100줄 이하)
- 프로젝트 레벨 체크리스트 (50줄)
- 배포 체크리스트 (30줄)
- 참조 링크 (20줄)
```

### Phase 4: 검증 및 문서화 (30분)

#### 4.1 링크 검증
```bash
# 깨진 링크 확인
find docs/ -type f -name "*.md" -exec grep -l "COMPONENT_INVENTORY\|ROUTE_SPEC\|INSTRUCTION_TEMPLATE_v16" {} \;

# 자동 수정
find docs/ -type f -name "*.md" -exec sed -i \
  -e 's|COMPONENT_INVENTORY\.md|../src/components/CLAUDE.md|g' \
  -e 's|ROUTE_SPEC\.md|../src/app/api/CLAUDE.md|g' \
  -e 's|INSTRUCTION_TEMPLATE_v16\.md|INSTRUCTION_TEMPLATE.md|g' {} \;
```

#### 4.2 문서 현황 업데이트
```bash
# docs/CLAUDE.md 업데이트
# 14개 → 10개 문서 체계로 변경

# 루트 CLAUDE.md 업데이트
# 문서 참조 경로 수정
```

#### 4.3 최종 검증
```bash
# 문서 크기 확인
wc -l docs/*.md | sort -n

# 중복 내용 확인
for file in docs/*.md; do
  echo "=== $file ==="
  grep -c "컴포넌트 목록\|라우트 구조\|NPM 스크립트" "$file"
done

# Git 상태 확인
git status
git diff --stat
```

---

## 📊 예상 결과

### Before (14개 문서, 중복 많음)
```
docs/
├── CONTEXT_BRIDGE.md         # 유지
├── PROJECT.md                # 유지
├── CODEMAP.md                # 500줄 → 200줄
├── CHECKLIST.md              # 400줄 → 100줄
├── DOCUMENT_GUIDE.md         # 유지
├── INSTRUCTION_TEMPLATE.md   # v16 통합
├── INSTRUCTION_TEMPLATE_v16.md # 삭제
├── FLOWMAP.md                # 유지
├── WIREFRAME.md              # 유지
├── COMPONENT_INVENTORY.md    # 삭제
├── ROUTE_SPEC.md             # 삭제
├── STATE_FLOW.md             # 유지
├── DATA_MODEL.md             # 유지
├── ERROR_BOUNDARY.md         # 유지
├── TECH_STACK.md             # 신규 (Phase 3)
├── NPM_SCRIPTS_GUIDE.md      # 신규 (Phase 3)
└── TOOL_DECISION_TREE.md     # 신규 (Phase 3)
```

### After (10개 문서, 명확한 역할)
```
docs/
├── CONTEXT_BRIDGE.md         # 반복 실수 방지
├── PROJECT.md                # 프로젝트 현황
├── CODEMAP.md                # 프로젝트 구조만 (200줄)
├── CHECKLIST.md              # 프로젝트 레벨만 (100줄)
├── DOCUMENT_GUIDE.md         # 문서 작성 가이드
├── INSTRUCTION_TEMPLATE.md   # 지시서 템플릿 (v16)
├── FLOWMAP.md                # 사용자 플로우
├── WIREFRAME.md              # UI-API 연결
├── STATE_FLOW.md             # 상태 관리
├── DATA_MODEL.md             # 데이터 모델
├── ERROR_BOUNDARY.md         # 에러 처리
├── TECH_STACK.md             # 기술 스택
├── NPM_SCRIPTS_GUIDE.md      # NPM 스크립트
└── TOOL_DECISION_TREE.md     # 도구 선택 가이드
```

---

## ✅ 완료 기준

### 필수 검증 항목
- [ ] 14개 → 10개 문서로 축소 완료
- [ ] 각 문서 200줄 이하 (INSTRUCTION_TEMPLATE 제외)
- [ ] 모든 참조 링크 정상 작동
- [ ] 중복 내용 0%
- [ ] 각 문서 역할 명확히 구분

### 품질 검증
```bash
# 최종 검증 스크립트
npm run verify:docs
npm run verify:parallel
npm run types:check
```

---

## ⚠️ 위험 관리

### 잠재 위험
1. **링크 깨짐**: 문서 제거/이동으로 인한 참조 오류
2. **정보 손실**: 중요 내용 누락 가능성
3. **혼란 발생**: 기존 문서 위치 변경으로 인한 혼란

### 완화 방안
1. **전체 백업**: 작업 전 완전한 백업 생성
2. **단계별 검증**: 각 Phase 후 즉시 검증
3. **롤백 준비**: 문제 발생 시 즉시 롤백
4. **팀 공지**: 변경사항 사전 공유

### 롤백 계획
```bash
# 즉시 롤백 (문제 발생 시)
rm -rf docs/
cp -r docs.backup.20250223/ docs/
git checkout -- docs/
```

---

## 📋 체크리스트

### Phase 1 체크리스트
- [ ] 백업 생성 완료
- [ ] 대상 파일 목록 작성
- [ ] 의존성 확인 완료

### Phase 2 체크리스트
- [ ] INSTRUCTION_TEMPLATE 통합
- [ ] COMPONENT_INVENTORY 제거
- [ ] ROUTE_SPEC 제거
- [ ] 모든 참조 업데이트

### Phase 3 체크리스트
- [ ] CODEMAP.md 200줄 이하로 축소
- [ ] CHECKLIST.md 100줄 이하로 축소
- [ ] 이동된 내용 확인

### Phase 4 체크리스트
- [ ] 링크 검증 통과
- [ ] 문서 현황 업데이트
- [ ] 최종 검증 통과
- [ ] Git 커밋 완료

---

## 🔗 참고 자료

### 관련 문서
- `/docs/claude-efficiency-optimization/README.md` - 효율성 최적화 프로젝트
- `/docs/CLAUDE.md` - 문서 체계 가이드
- `/CLAUDE.md` - AI 작업 네비게이터

### 검증 스크립트
```bash
# 문서 검증
node scripts/check-documentation.js

# 링크 검증  
grep -r "\[.*\](\./" docs/ | wc -l

# 중복 확인
for f in docs/*.md; do echo "=== $f ==="; wc -l "$f"; done
```

---

## 📅 예상 타임라인

| Phase | 작업 내용 | 예상 시간 | 우선순위 |
|-------|----------|-----------|----------|
| Phase 1 | 백업 및 준비 | 30분 | 🔴 Critical |
| Phase 2 | 문서 통합/제거 | 1시간 | 🔴 Critical |
| Phase 3 | 문서 슬림화 | 1시간 | 🟡 High |
| Phase 4 | 검증 및 문서화 | 30분 | 🔴 Critical |
| **총계** | **전체 작업** | **3시간** | - |

---

## 🚀 실행 명령

```bash
# 전체 작업 시작
/sc:improve --validate --seq --think-hard --wave-mode auto
"문서 체계 통합 프로젝트 실행"

# 또는 단계별 실행
/sc:task --phase 1 "백업 및 준비"
/sc:task --phase 2 "문서 통합 및 제거"
/sc:task --phase 3 "문서 슬림화"
/sc:task --phase 4 "검증 및 문서화"
```

---

*이 지시서는 2025년 2월 23일 기준으로 작성되었습니다.*
*문서 체계 개선 후 프로젝트의 유지보수성과 AI 작업 효율성이 크게 향상될 것입니다.*