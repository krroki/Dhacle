# 🚀 SuperClaude 기반 문서 체계 재구성 실행 가이드

*SuperClaude 명령어와 플래그를 활용한 최적화된 실행 전략*

**작성일**: 2025-08-31  
**대상**: SuperClaude 프레임워크 사용자  
**목적**: Context 효율성과 실행 품질을 보장하는 최적화된 지시 방법

---

## 🎯 **추천 SuperClaude 명령어 및 플래그**

### **핵심 실행 명령어**
```bash
/sc:implement --validate --evidence --c7 --delegate auto --wave-mode force --safe-mode
```

**플래그 분해 설명**:
- `--validate`: 단계별 검증 및 위험 평가 활성화
- `--evidence`: 증거 기반 의사결정 및 결과 추적
- `--c7`: Context7 MCP 서버 활성화 (문서화 베스트 프랙티스)
- `--delegate auto`: 자동 서브에이전트 위임 (43개 작업 항목 처리)
- `--wave-mode force`: Wave 오케스트레이션 강제 활성화 (복잡도 0.9)
- `--safe-mode`: 보수적 실행 및 백업 보장

### **대안 명령어들**

#### **단계별 진행 선호 시**
```bash
/sc:build --phase-by-phase --validate --evidence --c7 --safe-mode
```

#### **빠른 실행 필요 시**
```bash
/sc:implement --uc --delegate files --validate --c7
```

#### **품질 우선 시**
```bash
/sc:improve --systematic --validate --evidence --wave-validation --c7
```

---

## 📋 **Context 최적화 전략**

### **필수 Context 전달 구조**

#### **1단계: 기본 프로젝트 Context**
```markdown
프로젝트: Dhacle (YouTube 크리에이터 도구)
현재 상태: Phase 1-4 완료, Production Ready
기술 스택: Next.js 15, Supabase, TypeScript
품질 현황: 18% (136개 자산, API 18개 오류, Type 2개 오류)
```

#### **2단계: 작업 특화 Context**
```markdown
작업: 문서 체계 완전 재구성
범위: 33개 문서 → Diátaxis 4분할 구조
위험도: CRITICAL (실패 시 모든 새 AI 혼동)
소요 시간: 3시간 (5개 Phase)
```

#### **3단계: 실행 가이드 위치**
```markdown
가이드 위치: tasks/2025-08-31_documentation-system-complete-restructure/
핵심 문서:
- README.md (마스터 플랜)
- IMPLEMENTATION_GUIDE_FOR_NEW_AI.md (441줄 완전 지시서)
- EXECUTION_CHECKLIST.md (313줄 체크리스트)
- DIATAXIS_STRUCTURE_DESIGN.md (346줄 구조 설계)
```

### **Context 전달 시 절대 생략 금지 항목**

#### **기존 문서 보존 의도**
- CONTEXT_BRIDGE.md의 22가지 실수 패턴
- 16개 서브에이전트의 3단계 규칙 (STOP-MUST-CHECK)
- "any 타입 절대 금지" 핵심 원칙
- "2주간 에러 디버깅" 교훈 (임시방편 코드 위험)

#### **새 구조 목표**
- 새 AI 30초 프로젝트 파악
- 22가지 실수 패턴 완전 방지
- 서브에이전트별 전문 지침 표준화
- Diátaxis 4분할 구조 (Tutorial/How-to/Reference/Explanation)

#### **품질 보장 기준**
- 기존 핵심 의도 100% 보존
- 모든 코드 예시 실제 작동 확인
- 새 AI 테스트 시나리오 통과 필수
- 단계별 검증 및 백업 보장

---

## 🛠️ **단계별 실행 전략**

### **Phase 1: 준비 및 백업** (SuperClaude 최적화)

#### **명령어**
```bash
/sc:task "Phase 1 백업 및 준비" --validate --safe-mode --evidence
```

#### **Context 전달**
```markdown
목표: 현재 상태 완전 백업 및 새 구조 준비
범위: docs/ 18개 + CLAUDE.md 15개 백업
검증: npm run verify:parallel 현재 상태 확인
소요: 10분
```

#### **핵심 작업**
- 백업: `docs_backup_$(date)`, `CLAUDE_backup_$(date).md`
- 현황: 문서 개수 확인, 프로젝트 상태 파악
- 구조: Diátaxis 4분할 디렉터리 생성

### **Phase 2: 핵심 문서 작성** (Context7 활용)

#### **명령어**
```bash
/sc:implement "핵심 4개 문서 작성" --c7 --validate --evidence --delegate files
```

#### **Context 전달**
```markdown
우선순위: tutorial/quick-start.md (30초 파악), explanation/mistake-patterns.md (22패턴)
출처: CONTEXT_BRIDGE.md, PROJECT.md, 루트 CLAUDE.md
목표: 새 AI가 혼동 없이 이해 가능한 수준
소요: 60분 (각 15-20분)
```

#### **핵심 작업**
1. **tutorial/01-quick-start.md** - 30초 프로젝트 파악 가능
2. **explanation/mistake-patterns.md** - 22가지 실수 패턴 완전 이관
3. **how-to/api-development/create-new-route.md** - 가장 자주 쓰는 작업
4. **reference/project-status.md** - 현재 상태 정확 반영

### **Phase 3: 서브에이전트 지침** (Wave 모드)

#### **명령어**
```bash
/sc:improve "서브에이전트 지침 재구성" --wave-mode force --systematic --validate
```

#### **Context 전달**
```markdown
범위: 15개 CLAUDE.md 표준화 (3단계 구조)
패턴: STOP-MUST-CHECK + any 타입 금지 + 필수 패턴 + 검증 명령어
우선순위: 루트 CLAUDE.md → API/Component/Types → 나머지 11개
소요: 90분 (루트 20분, 핵심 3개 45분, 나머지 25분)
```

#### **Wave 전략**
- **Review Wave**: 기존 15개 CLAUDE.md 내용 분석
- **Planning Wave**: 표준 템플릿 설계 및 적용 전략
- **Implementation Wave**: 3단계 구조 일괄 적용
- **Validation Wave**: 표준 준수 및 품질 확인

### **Phase 4-5: 완성 및 검증** (Evidence 기반)

#### **명령어**
```bash
/sc:build "나머지 구조 완성 및 검증" --evidence --validate --c7 --safe-mode
```

#### **Context 전달**
```markdown
범위: Tutorial/How-to/Reference 섹션 완성 + 전체 검증
검증: 새 AI 30초 테스트, 실무 작업 가능성, 22패턴 방지
증거: 구조 확인, 내용 품질, 의도 보존, 실제 작동성
소요: 50분 (완성 30분, 검증 20분)
```

---

## 🎯 **실행 시 주의사항**

### **절대 생략하면 안 되는 데이터**

#### **CONTEXT_BRIDGE.md 22가지 패턴** (완전 보존 필수)
1. webpack layout.js 컴파일 에러 (Next.js standalone으로 해결)
2. 테이블 없이 기능 구현 시작 (CREATE TABLE 먼저)
3. profiles vs users 테이블 혼란 (VIEW vs TABLE 명확히)
4. any 타입 남발 (biome 에러, 즉시 제거)
5. 임시방편 코드 작성 ("2주간 에러 디버깅"의 교훈)
6. getSession() 대신 getUser() 사용 (토큰 검증)
7. process.env 직접 접근 (env.ts 타입 안전)
8. database.generated 직접 import (@/types 중앙화)
9. 직접 fetch 사용 (api-client.ts 함수)
10. HTML 태그 직접 사용 (shadcn/ui 컴포넌트)
11. RLS 없는 테이블 생성
12. Client 컴포넌트 남발 (Server Component 우선)
13. 검증 스크립트 미실행
14. 임시 데이터 반환 ([], null, "TODO")
15. 자동 변환 스크립트 생성 (38개 스크립트 에러 지옥)
16. Task 도구 사용 시 analyzer 지정 (general-purpose 사용)
17. 서버/클라이언트 컨텍스트 혼용
18. Silent 에러 처리 (try-catch로 숨기기)
19. TODO 주석 남기기 (미완성 코드)
20. 기능 기획 없이 코드부터 작성
21. 검증 실패 후 다음 작업 진행
22. 복사-붙여넣기식 문제 해결

#### **16개 서브에이전트 지침** (표준 구조 적용)
```markdown
각 CLAUDE.md 필수 포함:
🛑 [영역명] 3단계 필수 규칙
  ├── STOP: 즉시 중단 신호
  ├── MUST: 필수 행동
  └── CHECK: 검증 필수

🚫 [영역명] any 타입 금지 (구체적 사례)
🚨 [영역명] 필수 패턴 (코드 예시 3개)
📋 [영역명] 검증 명령어
```

#### **Diátaxis 구조 목적** (각 섹션 명확히)
- **Tutorial**: 새 AI 온보딩 (30초 파악 목표)
- **How-to**: 실무 작업 가이드 (실수 없는 단계별)
- **Reference**: 기술 참조 (즉시 참조 가능한 사실)
- **Explanation**: 배경 지식 (왜 이런 규칙들이 생겼는지)

### **Context 과부하 방지 전략**

#### **단계별 Context 주입**
```markdown
Phase 1: 프로젝트 기본 + 백업 가이드만
Phase 2: + 핵심 4개 문서 출처 정보
Phase 3: + 서브에이전트 표준 템플릿
Phase 4-5: + 검증 기준 및 테스트 방법
```

#### **SuperClaude 플래그 활용**
- `--uc`: Context 압축 (30-50% 토큰 절약)
- `--delegate auto`: 작업 분산 (토큰 효율성)
- `--wave-mode`: 단계별 Context 관리
- `--validate`: 품질 게이트 자동 적용

---

## 🔄 **실행 중 문제 대응**

### **Context Limit 발생 시**
```bash
/sc:implement --uc --delegate auto "현재 Phase 완료" --validate
```
- 현재 Phase만 완료 후 다음 세션에서 계속
- 진행 상황을 명확히 문서화

### **검증 실패 시**
```bash
/sc:troubleshoot --evidence --c7 "검증 실패 사항" --safe-mode
```
- 백업에서 복구
- 실패 원인 분석 후 재실행

### **품질 기준 미달 시**
```bash
/sc:improve --quality --validate --evidence "품질 개선" --wave-validation
```
- 기존 핵심 의도 재확인
- 새 AI 테스트 시나리오 재실행

---

## ✅ **성공 기준 및 검증**

### **각 Phase별 완료 기준**

#### **Phase 1 완료**
```bash
# 백업 확인
ls -la docs_backup_*/ CLAUDE_backup_*.md

# 새 구조 확인  
tree docs/

# 현재 상태 확인
npm run verify:parallel
```

#### **Phase 2 완료**
```bash
# 핵심 4개 문서 확인
ls docs/tutorial/01-quick-start.md
ls docs/explanation/mistake-patterns.md  
ls docs/how-to/api-development/create-new-route.md
ls docs/reference/project-status.md

# 30초 읽기 테스트 실행
time head -50 docs/tutorial/01-quick-start.md
```

#### **Phase 3 완료**
```bash
# 3단계 구조 적용 확인
grep -r "STOP\|MUST\|CHECK" */CLAUDE.md | wc -l  # 45개 이상

# any 타입 금지 섹션 확인
grep -r "any 타입 금지" */CLAUDE.md | wc -l     # 15개
```

#### **전체 완료**
```bash
# 새 AI 테스트 시나리오
# 1. 30초 테스트: tutorial/01-quick-start.md만으로 프로젝트 파악 가능
# 2. 실무 테스트: how-to 가이드로 실제 API 생성 가능  
# 3. 참조 테스트: reference 문서로 현재 상태 파악 가능
# 4. 실수 방지: explanation/mistake-patterns.md로 22패턴 파악 가능

# 최종 검증
npm run verify:parallel
node scripts/context-loader.js
```

---

## 🚀 **최적화된 실행 예시**

### **완전 자동화 실행**
```bash
/sc:implement "문서 체계 완전 재구성" \
  --validate --evidence --c7 --delegate auto \
  --wave-mode force --safe-mode \
  --scope "tasks/2025-08-31_documentation-system-complete-restructure/" \
  --time-limit 180 --quality-first
```

### **단계별 제어 실행** 
```bash
# Phase 1
/sc:task "백업 및 준비" --validate --safe-mode --evidence

# Phase 2  
/sc:implement "핵심 4개 문서" --c7 --validate --delegate files

# Phase 3
/sc:improve "서브에이전트 지침" --wave-mode --systematic --validate

# Phase 4-5
/sc:build "완성 및 검증" --evidence --validate --c7
```

---

## 📊 **성과 측정 지표**

### **정량적 지표**
- 새 AI 온보딩 시간: 30초 달성
- 문서 찾는 시간: 90% 단축  
- 실수 패턴 반복: 22가지 → 0가지
- 프로젝트 파악 시간: 95% 단축

### **정성적 지표**
- 새 AI가 실수 없이 코드 작성
- 문서 체계 자체가 자명하고 직관적
- 유지보수 비용 50% 이상 감소
- 모든 서브에이전트 일관된 품질 보장

---

## 🎉 **실행 완료 후 체크**

### **최종 검증 스크립트**
```bash
echo "=== 새 구조 확인 ==="
tree docs/

echo "=== CLAUDE.md 3단계 구조 확인 ==="
grep -r "STOP\|MUST\|CHECK" */CLAUDE.md | wc -l

echo "=== any 타입 금지 섹션 확인 ==="  
grep -r "any 타입 금지" */CLAUDE.md | wc -l

echo "=== 프로젝트 검증 ==="
npm run verify:parallel

echo "=== AI 컨텍스트 업데이트 ==="
node scripts/context-loader.js
```

### **성공 시 기대 결과**
- 새 구조: 4개 메인 폴더 + 하위 구조 완성
- 서브에이전트: 45개 이상 3단계 패턴
- any 타입 금지: 15개 전체 적용
- 프로젝트 검증: 기존 오류 유지 (변경 없음)
- AI 컨텍스트: 새 구조 반영된 warmup 파일

---

*이 가이드를 따라 실행하면 Context 효율성과 품질을 모두 보장하면서 문서 체계 재구성을 완벽하게 완료할 수 있습니다.*