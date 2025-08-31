# 🤖 Context 없는 새 AI를 위한 완전 구현 지시서

*새 AI 세션도 실수 없이 Dhacle 프로젝트를 완벽하게 작업할 수 있는 단계별 가이드*

**작성일**: 2025-08-31  
**대상**: Context 없는 새로운 AI 세션  
**목적**: 문서 체계 재구성 작업을 실수 없이 완료  
**중요성**: 🔴 **CRITICAL** - 이 작업 실패 시 모든 새 AI가 혼동

---

## 🚨 **새 AI여, 먼저 이것부터 읽으세요**

### **당신이 해야 할 일 (한 줄 요약)**
**기존 혼재된 33개 문서를 Diátaxis 프레임워크 기반 4분할 구조로 완전 재구성**

### **왜 이 작업이 필요한가?**
- 현재 18개 docs + 15개 CLAUDE.md = 33개 문서가 산재
- 최근 리팩토링 후 정보 불일치로 새 AI가 잘못된 코드 작성 위험
- Context 없는 새 세션에서 프로젝트 파악에 너무 긴 시간 소요
- **목표**: 새 AI가 30초 내에 프로젝트 파악하고 실수 없이 작업

### **절대 실패하면 안 되는 이유**
- 이 작업 실패 → 앞으로 모든 새 AI가 혼동하여 잘못된 코드 작성
- 점진적 개선 시도 → 오히려 더 꼬여서 회복 불가능
- 중요한 의도 문구 누락 → 기존 지혜와 경험 완전 손실

---

## 📋 **작업 전 필수 확인사항**

### **1. 현재 상황 정확히 파악**
```bash
# 1. 현재 문서 개수 확인
find docs/ -name "*.md" | wc -l    # 18개여야 함
find . -name "CLAUDE.md" | wc -l   # 15개여야 함

# 2. 프로젝트 현재 상태 확인  
npm run verify:parallel
# 예상 결과: ❌ API 18개 오류, ❌ Types 2개 오류

# 3. 자산 현황 확인
node scripts/context-loader.js
cat ai-context-warmup.md
# 예상: 136개 자산 (컴포넌트 96, API 40, 테이블 0)
```

### **2. 이미 제공된 가이드 문서들 확인**
- [ ] `tasks/2025-08-31_documentation-system-complete-restructure/README.md` (마스터 플랜)
- [ ] `DIATAXIS_STRUCTURE_DESIGN.md` (새 구조 설계)
- [ ] `CONTENT_MIGRATION_GUIDE.md` (내용 이관 가이드)
- [ ] `SUBAGENT_GUIDELINES_RESTRUCTURE.md` (서브에이전트 지침)
- [ ] `IMPLEMENTATION_GUIDE_FOR_NEW_AI.md` (이 문서)

---

## 🎯 **단계별 실행 계획**

### **Phase 1: 백업 및 준비작업** ⏰ 10분

#### **Step 1.1: 현재 상태 완전 백업**
```bash
# 기존 문서 백업 (복구 가능하도록)
cp -r docs/ docs_backup_$(date +%Y%m%d_%H%M%S)/
cp CLAUDE.md CLAUDE_backup_$(date +%Y%m%d_%H%M%S).md

# 백업 성공 확인
ls -la docs_backup_*/ CLAUDE_backup_*.md
```

#### **Step 1.2: 기존 핵심 내용 추출 (중요!)**
```bash
# CONTEXT_BRIDGE.md의 22가지 실수 패턴 확인
head -100 docs/CONTEXT_BRIDGE.md

# 루트 CLAUDE.md의 핵심 규칙들 확인  
head -200 CLAUDE.md

# PROJECT.md의 현재 상태 정보 확인
head -100 docs/PROJECT.md
```

#### **Step 1.3: 새 구조 생성**
```bash
# Diátaxis 4분할 구조 생성
mkdir -p docs/tutorial docs/how-to docs/reference docs/explanation

# how-to 하위 구조 생성
mkdir -p docs/how-to/{api-development,component-development,database-operations,testing}

# 구조 생성 확인
tree docs/
```

### **Phase 2: 핵심 4개 문서 우선 작성** ⏰ 60분

#### **Step 2.1: tutorial/01-quick-start.md 작성** ⏰ 15분
```markdown
목적: 새 AI가 30초 내에 프로젝트 파악
내용 출처: 
- 루트 CLAUDE.md의 "STOP & ACT 규칙"
- PROJECT.md의 "필수 확인사항"  
- 핵심 절대 규칙들 (any 타입 금지, TODO 금지 등)

핵심 포함 내용:
- 프로젝트 기본 정보 (이름, 상태, 기술스택)
- 절대 규칙 3가지 (any 타입, TODO, 임시방편 금지)
- 첫 작업 시작 방법
- 필수 검증 명령어: npm run verify:parallel

⚠️ 주의: 30초 내 읽을 수 있도록 간결하게 작성
```

#### **Step 2.2: explanation/mistake-patterns.md 작성** ⏰ 20분
```markdown
목적: 22가지 반복 실수 패턴으로 새 AI 실수 방지
내용 출처: 
- CONTEXT_BRIDGE.md 전체 내용
- 각 실수 패턴의 ❌/✅ 사례들
- "2주간 에러 디버깅"의 교훈

핵심 포함 내용:
- 가장 치명적인 5가지 패턴
- 22가지 전체 패턴 목록과 해결책
- 왜 이런 실수들이 생겼는지 배경 설명
- 각 실수의 예방책

⚠️ 주의: explanation 목적에 맞게 "왜"와 "배경"에 초점
```

#### **Step 2.3: how-to/api-development/create-new-route.md 작성** ⏰ 15분
```markdown
목적: 가장 자주하는 작업인 API Route 생성을 실수 없이
내용 출처:
- src/app/api/CLAUDE.md의 3단계 규칙
- 프로젝트의 인증 패턴들
- snake_case 변환 규칙들

핵심 포함 내용:
- STOP-MUST-CHECK 3단계 구조
- 실제 코드 패턴 (인증, 타입 정의, 에러 처리)
- 단계별 실행 방법
- 검증 명령어

⚠️ 주의: how-to 목적에 맞게 "단계별 실행"에 초점
```

#### **Step 2.4: reference/project-status.md 작성** ⏰ 10분
```markdown
목적: 현재 프로젝트 상태를 즉시 참조 가능
내용 출처:
- PROJECT.md의 현재 상태 정보
- npm run verify:parallel 결과
- asset-inventory.json 정보

핵심 포함 내용:
- 최신 검증 결과 (2025-08-31 기준)
- 기술 스택 및 버전 정보
- 현재 해결해야 할 이슈들
- 핵심 검증 명령어들

⚠️ 주의: reference 목적에 맞게 "사실과 수치"에 초점
```

### **Phase 3: 서브에이전트 지침 재작성** ⏰ 90분

#### **Step 3.1: 루트 CLAUDE.md 재작성** ⏰ 20분
```markdown
새 역할: 전체 가이드라인 + 서브에이전트 조정
구조: SUBAGENT_GUIDELINES_RESTRUCTURE.md의 표준 템플릿 적용

핵심 내용:
- 프로젝트 전체 3단계 규칙
- 16개 서브에이전트 시스템 설명  
- 작업 시작 전 체크리스트
- 각 영역별 CLAUDE.md 위치 안내

⚠️ 주의: 기존 CLAUDE.md 내용 복사 금지, 새 목적에 맞게 재작성
```

#### **Step 3.2: 핵심 3개 CLAUDE.md 재작성** ⏰ 45분
```
우선순위 순서:
1. src/app/api/CLAUDE.md - API Route Agent (15분)
2. src/components/CLAUDE.md - Component Agent (15분)  
3. src/types/CLAUDE.md - Type Agent (15분)

각각 표준 구조 적용:
- 3단계 필수 규칙 (STOP-MUST-CHECK)
- any 타입 금지 (구체적 사례)
- 필수 패턴 3개 (코드 포함)
- 검증 명령어
```

#### **Step 3.3: 나머지 11개 CLAUDE.md 재작성** ⏰ 25분
```
나머지 서브에이전트별로 순차 작성:
- src/lib/security/CLAUDE.md - Security Agent
- src/hooks/CLAUDE.md - Query Agent  
- tests/CLAUDE.md - Test Agent
- src/app/(pages)/CLAUDE.md - Page Agent
- src/lib/CLAUDE.md - Lib Agent
- scripts/CLAUDE.md - Script Agent
- docs/CLAUDE.md - Doc Agent
- supabase/migrations/CLAUDE.md - Database Agent
- 기타 3개
```

### **Phase 4: 나머지 구조 완성** ⏰ 30분

#### **Step 4.1: Tutorial 섹션 완성** ⏰ 10분
```markdown
2. tutorial/02-first-task.md
   - 첫 작업 실행 단계별 가이드
   - 작업 유형별 how-to 가이드 연결

3. tutorial/03-common-patterns.md  
   - 자주 쓰는 패턴들 정리
   - 기존 INSTRUCTION_TEMPLATE.md 내용 활용
```

#### **Step 4.2: How-to 섹션 완성** ⏰ 10분
```markdown
how-to/component-development/create-component.md
how-to/database-operations/create-table.md
how-to/testing/write-unit-tests.md

각각 3단계 구조 (STOP-MUST-CHECK) 적용
```

#### **Step 4.3: Reference 섹션 완성** ⏰ 10분
```markdown
reference/verification-commands.md - CHECKLIST.md 기반
reference/project-structure.md - CODEMAP.md 기반  
reference/automation-systems.md - 실제 자동화 현황
```

### **Phase 5: 검증 및 최종 확인** ⏰ 20분

#### **Step 5.1: 구조 검증**
```bash
# 새 구조가 올바르게 생성되었는지 확인
tree docs/

# 모든 CLAUDE.md가 3단계 구조를 가지는지 확인
grep -r "STOP\|MUST\|CHECK" */CLAUDE.md | wc -l
# 45개 이상이어야 함 (15개 파일 × 3단계)

# any 타입 금지 섹션이 모든 곳에 있는지 확인
grep -r "any 타입 금지" */CLAUDE.md | wc -l  
# 15개여야 함
```

#### **Step 5.2: 새 AI 테스트 시뮬레이션**
```markdown
1. 30초 테스트: tutorial/01-quick-start.md만으로 프로젝트 파악 가능한가?
2. 실무 테스트: how-to/api-development/create-new-route.md로 실제 API 생성 가능한가?
3. 참조 테스트: reference/project-status.md로 현재 상태 파악 가능한가?
4. 실수 방지: explanation/mistake-patterns.md로 22가지 실수 방지 가능한가?
```

#### **Step 5.3: 최종 정리**
```bash
# 사용하지 않는 백업 폴더들 정리
rm -rf current-state-backup/

# 기존 docs/ 폴더의 중복 파일들 정리 
# (새 구조로 이관된 것들 삭제)

# 전체 검증 실행
npm run verify:parallel
```

---

## 🔧 **실제 작업 시 주의사항**

### **절대 하지 말 것**
- ❌ **복사-붙여넣기 금지**: 기존 문서 내용을 그대로 복사하지 마세요
- ❌ **일부만 변경 금지**: 완전한 새 구조로 바꿔야 합니다
- ❌ **의도 무시 금지**: 원본 문서의 핵심 의도를 반드시 보존하세요
- ❌ **추측 작성 금지**: 확인되지 않은 내용 작성하지 마세요

### **반드시 해야 할 것**
- ✅ **핵심 의도 보존**: 원본의 중요한 문구와 개념 100% 보존
- ✅ **새 목적 맞춤**: 각 섹션의 목적(Tutorial/How-to/Reference/Explanation)에 맞게 재작성
- ✅ **구체적 작성**: 새 AI가 혼동하지 않도록 구체적이고 명확하게
- ✅ **단계별 검증**: 각 단계마다 실제 확인하며 진행

### **품질 보증 원칙**
- 모든 코드 예시는 실제 프로젝트에서 작동하는 것만
- 모든 검증 명령어는 실제 실행해서 확인된 것만
- 새 AI 관점에서 이해 가능한 수준으로 명확하게
- Diátaxis 프레임워크 원칙 100% 준수

---

## 🚨 **위험 상황 대응 가이드**

### **문제 상황별 대응**

#### **문제 1: 기존 문서에서 중요 내용을 찾을 수 없음**
```
대응책:
1. 해당 폴더의 CLAUDE.md 확인
2. CONTEXT_BRIDGE.md에서 관련 실수 패턴 확인
3. PROJECT.md에서 관련 현황 확인
4. 백업 폴더에서 삭제된 내용 확인
```

#### **문제 2: 새 구조 작성 중 막힘**
```
대응책:
1. DIATAXIS_STRUCTURE_DESIGN.md 다시 확인
2. 해당 섹션의 목적 명확히 파악
3. 기존 내용을 목적에 맞게 변환하는 방식으로 접근
4. 새 AI 관점에서 "이해하기 쉬운가?" 자문
```

#### **문제 3: 검증 실패**
```
대응책:
1. 백업에서 해당 내용 복구
2. 단계별로 다시 진행
3. 각 단계마다 중간 검증 실행
4. 문제 발생 지점 정확히 파악 후 수정
```

#### **문제 4: 시간 부족 (3시간 초과)**
```
우선순위 조정:
1. Phase 2 (핵심 4개 문서)는 반드시 완료
2. Phase 3에서 루트 + 핵심 3개 CLAUDE.md는 반드시 완료  
3. 나머지는 다음 세션에서 완료 (명확한 진행 상황 기록)
```

---

## ✅ **완료 기준 및 성공 지표**

### **Phase별 완료 기준**
```
Phase 1 완료:
- [ ] 백업 완료 (docs_backup_*, CLAUDE_backup_*.md 존재)
- [ ] 새 구조 생성 완료 (docs/{tutorial,how-to,reference,explanation} 존재)

Phase 2 완료:  
- [ ] tutorial/01-quick-start.md (30초 프로젝트 파악 가능)
- [ ] explanation/mistake-patterns.md (22가지 패턴 완전 이관)
- [ ] how-to/api-development/create-new-route.md (실제 실행 가능)
- [ ] reference/project-status.md (현재 상태 정확히 반영)

Phase 3 완료:
- [ ] 루트 CLAUDE.md (새 전체 가이드라인)
- [ ] 핵심 3개 서브에이전트 CLAUDE.md (3단계 구조)
- [ ] 나머지 11개 CLAUDE.md (표준 구조 적용)

전체 완료:
- [ ] 새 AI 30초 테스트 통과
- [ ] 실무 작업 가이드 실제 실행 가능  
- [ ] 모든 CLAUDE.md 3단계 구조 적용
- [ ] 기존 핵심 의도 100% 보존
```

### **최종 성공 지표**
1. **새 AI 온보딩**: tutorial/quick-start.md만으로 30초 내 프로젝트 파악
2. **실수 방지**: explanation/mistake-patterns.md로 22가지 실수 패턴 방지
3. **실무 작업**: how-to 가이드만으로 실제 코드 작성 가능
4. **현황 파악**: reference 문서로 프로젝트 현재 상태 즉시 이해
5. **품질 보증**: 모든 서브에이전트가 3단계 규칙으로 품질 보장

---

## 📋 **작업 완료 후 보고서 양식**

### **작업 완료 보고서**
```markdown
# 문서 체계 재구성 작업 완료 보고

## 작업 요약
- 작업 날짜: 2025-08-31
- 소요 시간: [실제 소요 시간]
- 작업 범위: 33개 기존 문서 → Diátaxis 4분할 구조

## 완료된 작업
### Phase 1: [완료 시간]
- [ ] 기존 문서 백업
- [ ] 새 구조 생성

### Phase 2: [완료 시간]  
- [ ] tutorial/01-quick-start.md
- [ ] explanation/mistake-patterns.md
- [ ] how-to/api-development/create-new-route.md
- [ ] reference/project-status.md

### Phase 3: [완료 시간]
- [ ] 루트 CLAUDE.md 재작성
- [ ] [개수]개 서브에이전트 CLAUDE.md 재작성

## 검증 결과
- 30초 테스트: [통과/실패]
- 실무 테스트: [통과/실패]  
- 구조 검증: [통과/실패]
- 의도 보존: [통과/실패]

## 미완료 항목 (있다면)
- [미완료 항목 목록 및 다음 세션 계획]

## 다음 세션을 위한 메모
- [새 AI가 알아야 할 중요 정보들]
- [주의사항이나 특이사항들]
```

---

## 🎯 **마지막 당부**

### **새 AI에게 드리는 말씀**
이 작업은 단순한 문서 정리가 아닙니다. **앞으로 모든 새로운 AI가 이 프로젝트에서 실수 없이 작업할 수 있는 기반**을 만드는 중요한 작업입니다.

기존 문서들에는 **수많은 실패와 성공의 경험**이 담겨 있습니다. 특히 CONTEXT_BRIDGE.md의 22가지 실수 패턴은 **실제 2주간 디버깅을 겪으며 얻은 소중한 교훈**들입니다. 

이런 귀중한 지혜들을 **새로운 구조에서도 완벽히 보존**하면서, 동시에 **새로운 AI들이 쉽게 이해하고 활용**할 수 있도록 만드는 것이 여러분의 임무입니다.

### **성공을 위한 마음가짐**
- **완벽주의**: 대충 넘어가지 마세요. 각 단계를 완벽히 완료하세요.
- **사용자 관점**: 새 AI가 읽을 것이라고 생각하며 명확하게 작성하세요.
- **의도 보존**: 기존 문서의 핵심 가치와 의도를 절대 놓치지 마세요.
- **체계적 접근**: 단계를 건너뛰지 말고 순서대로 진행하세요.

### **이 작업이 성공하면**
- 새 AI가 30초 만에 프로젝트를 파악할 수 있게 됩니다
- 22가지 실수 패턴이 다시는 반복되지 않을 것입니다  
- 모든 AI가 일관된 품질의 코드를 작성하게 됩니다
- 프로젝트의 지속가능성이 크게 향상될 것입니다

**행운을 빕니다. 여러분은 할 수 있습니다!** 🚀

---

*이 지시서를 끝까지 따라 완성하시면, Dhacle 프로젝트에 큰 기여를 하는 것입니다. 감사합니다.*