# ✅ 실행 체크리스트 및 검증 방법

*단계별 체크리스트로 누락 없는 완벽한 문서 재구성*

**작성일**: 2025-08-31  
**목적**: 모든 단계를 빠짐없이 체크하여 완벽한 재구성 보장  
**사용법**: 각 항목을 하나씩 체크하며 순차 진행

---

## 📋 **Phase 1: 백업 및 준비작업** ⏰ 10분

### **Step 1.1: 현재 상태 백업** 
- [ ] `cp -r docs/ docs_backup_$(date +%Y%m%d_%H%M%S)/` 실행
- [ ] `cp CLAUDE.md CLAUDE_backup_$(date +%Y%m%d_%H%M%S).md` 실행
- [ ] 백업 파일 생성 확인: `ls -la docs_backup_*/ CLAUDE_backup_*.md`
- [ ] 백업 파일이 정상적으로 읽히는지 확인: `head -10 docs_backup_*/PROJECT.md`

### **Step 1.2: 현재 문서 현황 파악**
- [ ] 기존 docs 문서 개수 확인: `find docs/ -name "*.md" | wc -l` → 18개
- [ ] CLAUDE.md 파일 개수 확인: `find . -name "CLAUDE.md" | wc -l` → 15개  
- [ ] 프로젝트 현재 상태: `npm run verify:parallel`
- [ ] AI 컨텍스트 생성: `node scripts/context-loader.js`

### **Step 1.3: 새 디렉터리 구조 생성**
- [ ] 메인 구조: `mkdir -p docs/{tutorial,how-to,reference,explanation}`
- [ ] How-to 하위: `mkdir -p docs/how-to/{api-development,component-development,database-operations,testing}`
- [ ] 구조 확인: `tree docs/`

**Phase 1 완료 기준**: 백업 완료 + 새 구조 생성 완료

---

## 📚 **Phase 2: 핵심 4개 문서 우선 작성** ⏰ 60분

### **Step 2.1: tutorial/01-quick-start.md** ⏰ 15분
- [ ] 파일 생성: `touch docs/tutorial/01-quick-start.md`
- [ ] 내용 작성 완료 (아래 필수 포함사항 확인)
- [ ] 30초 읽기 테스트: 실제로 30초 내에 읽을 수 있는지 확인

**필수 포함사항 체크리스트**:
- [ ] 프로젝트 기본 정보 (Dhacle, Phase 1-4 완료, Next.js 15)
- [ ] 절대 규칙 3가지 (any 타입, TODO, 임시방편 금지)
- [ ] 필수 검증 명령어: `npm run verify:parallel`
- [ ] 첫 작업 시작 방법 (다음 읽을 문서들)
- [ ] 16개 서브에이전트 시스템 언급

### **Step 2.2: explanation/mistake-patterns.md** ⏰ 20분  
- [ ] 파일 생성: `touch docs/explanation/mistake-patterns.md`
- [ ] CONTEXT_BRIDGE.md 완전 읽기 완료
- [ ] 22가지 패턴 모두 이관 완료
- [ ] "왜" 중심의 설명 방식으로 작성 완료

**필수 포함사항 체크리스트**:
- [ ] "왜 이 문서가 필요한가?" 배경 설명
- [ ] 가장 치명적인 5가지 패턴 (테이블 없이 구현, any 타입, profiles/users 혼란, 임시방편, 서버/클라이언트 혼용)
- [ ] 22가지 전체 패턴 목록과 해결책
- [ ] "2주간 에러 디버깅"의 교훈 포함
- [ ] 각 실수의 예방적 접근법

### **Step 2.3: how-to/api-development/create-new-route.md** ⏰ 15분
- [ ] 파일 생성: `touch docs/how-to/api-development/create-new-route.md`
- [ ] src/app/api/CLAUDE.md 완전 읽기 완료
- [ ] 3단계 구조 (STOP-MUST-CHECK) 적용 완료
- [ ] 실제 실행 가능한 단계별 가이드 작성 완료

**필수 포함사항 체크리스트**:
- [ ] STOP: 세션 체크 없음, any 타입, 임시 반환값
- [ ] MUST: getUser() 인증 패턴 코드
- [ ] MUST: Response 타입 정의 코드
- [ ] CHECK: npm run types:check, curl 테스트
- [ ] 실제 단계별 실행 방법 (1-6단계)

### **Step 2.4: reference/project-status.md** ⏰ 10분
- [ ] 파일 생성: `touch docs/reference/project-status.md`  
- [ ] PROJECT.md 완전 읽기 완료
- [ ] 2025-08-31 기준 최신 정보 반영 완료
- [ ] Reference 목적에 맞는 사실/수치 중심 작성 완료

**필수 포함사항 체크리스트**:
- [ ] 최신 검증 결과 (npm run verify:parallel 실행 결과)
- [ ] 현재 자산 현황 (136개: 컴포넌트 96, API 40, 테이블 0)
- [ ] 품질 점수 (18%)
- [ ] 기술 스택 및 버전 정보
- [ ] 현재 해결해야 할 이슈들
- [ ] 핵심 검증 명령어들

**Phase 2 완료 기준**: 4개 핵심 문서 작성 + 30초 테스트 통과

---

## 🤖 **Phase 3: 서브에이전트 지침 재작성** ⏰ 90분

### **Step 3.1: 루트 CLAUDE.md 재작성** ⏰ 20분
- [ ] 기존 CLAUDE.md 백업 확인
- [ ] 새 역할 정의: 전체 가이드라인 + 서브에이전트 조정
- [ ] 표준 템플릿 구조 적용 완료
- [ ] 16개 서브에이전트 시스템 설명 포함

**표준 구조 체크리스트**:
- [ ] 🛑 프로젝트 전체 3단계 필수 규칙
- [ ] 🚫 프로젝트 전체 any 타입 금지
- [ ] 🚨 프로젝트 전체 필수 패턴
- [ ] 📋 전체 검증 명령어
- [ ] 🤖 16개 서브에이전트 시스템 설명
- [ ] 📁 각 영역별 CLAUDE.md 위치 안내

### **Step 3.2: 핵심 3개 CLAUDE.md 재작성** ⏰ 45분

#### **src/app/api/CLAUDE.md (API Route Agent)** ⏰ 15분
- [ ] 기존 내용 완전 읽기 완료
- [ ] 표준 템플릿 적용 완료
- [ ] API Route 특화 내용 포함 완료

**특화 내용 체크리스트**:
- [ ] STOP: 세션 체크 없는 API, requireAuth() 함수 사용, any 타입, 임시 반환값
- [ ] MUST: getUser() 인증 패턴, Response 타입 정의, snake_case 변환  
- [ ] CHECK: npm run types:check, curl 테스트
- [ ] 필수 패턴: 인증 + 변환, 에러 처리, 타입 안전성

#### **src/components/CLAUDE.md (Component Agent)** ⏰ 15분
- [ ] 기존 내용 완전 읽기 완료
- [ ] 표준 템플릿 적용 완료
- [ ] Component 특화 내용 포함 완료

**특화 내용 체크리스트**:
- [ ] STOP: Props any 타입, 'use client' 남발, <button>/<div> 직접 사용
- [ ] MUST: Props 타입 정의, shadcn/ui 사용, Server Component 기본
- [ ] CHECK: npm run types:check, npm run dev
- [ ] 필수 패턴: shadcn/ui 우선, Server Component, 타입 안전 Props

#### **src/types/CLAUDE.md (Type Agent)** ⏰ 15분
- [ ] 기존 내용 완전 읽기 완료
- [ ] 표준 템플릿 적용 완료  
- [ ] Types 특화 내용 포함 완료

**특화 내용 체크리스트**:
- [ ] STOP: any 타입, database.generated 직접 import, unknown→any 캐스팅
- [ ] MUST: @/types 중앙화, 구체적 타입 정의, 타입 가드
- [ ] CHECK: npm run types:check, biome check
- [ ] 필수 패턴: @/types 중앙화, 구체적 정의, 타입 가드 활용

### **Step 3.3: 나머지 11개 CLAUDE.md 재작성** ⏰ 25분
- [ ] src/lib/security/CLAUDE.md (Security Agent)
- [ ] src/hooks/CLAUDE.md (Query Agent)
- [ ] tests/CLAUDE.md (Test Agent)  
- [ ] src/app/(pages)/CLAUDE.md (Page Agent)
- [ ] src/lib/CLAUDE.md (Lib Agent)
- [ ] scripts/CLAUDE.md (Script Agent)
- [ ] docs/CLAUDE.md (Doc Agent)
- [ ] supabase/migrations/CLAUDE.md (Database Agent)
- [ ] 나머지 3개 CLAUDE.md

**각각 표준 구조 적용 확인**:
- [ ] 🛑 [영역명] 3단계 필수 규칙
- [ ] 🚫 [영역명] any 타입 금지
- [ ] 🚨 [영역명] 필수 패턴 (3개)
- [ ] 📋 [영역명] 검증 명령어

**Phase 3 완료 기준**: 15개 CLAUDE.md 모두 표준 구조 적용 완료

---

## 📖 **Phase 4: 나머지 구조 완성** ⏰ 30분

### **Step 4.1: Tutorial 섹션 완성** ⏰ 10분  
- [ ] `docs/tutorial/02-first-task.md` 작성 완료
- [ ] `docs/tutorial/03-common-patterns.md` 작성 완료
- [ ] Tutorial 랜딩 페이지 `docs/tutorial/README.md` 작성 완료

### **Step 4.2: How-to 섹션 완성** ⏰ 10분
- [ ] `docs/how-to/component-development/create-component.md` 작성
- [ ] `docs/how-to/database-operations/create-table.md` 작성  
- [ ] `docs/how-to/testing/write-unit-tests.md` 작성
- [ ] How-to 랜딩 페이지 `docs/how-to/README.md` 작성

### **Step 4.3: Reference 섹션 완성** ⏰ 10분
- [ ] `docs/reference/verification-commands.md` 작성 (CHECKLIST.md 기반)
- [ ] `docs/reference/project-structure.md` 작성 (CODEMAP.md 기반)
- [ ] `docs/reference/automation-systems.md` 작성 (실제 현황 반영)
- [ ] Reference 랜딩 페이지 `docs/reference/README.md` 작성

**Phase 4 완료 기준**: 모든 섹션 완성 + 랜딩 페이지 작성 완료

---

## ✅ **Phase 5: 검증 및 최종 확인** ⏰ 20분

### **Step 5.1: 구조 검증**
- [ ] 새 구조 확인: `tree docs/`
- [ ] 3단계 구조 적용 확인: `grep -r "STOP\|MUST\|CHECK" */CLAUDE.md | wc -l` → 45개 이상
- [ ] any 타입 금지 섹션: `grep -r "any 타입 금지" */CLAUDE.md | wc -l` → 15개
- [ ] 필수 패턴 섹션: `grep -r "필수 패턴" */CLAUDE.md | wc -l` → 15개

### **Step 5.2: 새 AI 테스트 시뮬레이션**
- [ ] **30초 테스트**: tutorial/01-quick-start.md 읽고 프로젝트 파악 가능
- [ ] **실무 테스트**: how-to/api-development/create-new-route.md로 API 생성 가능  
- [ ] **참조 테스트**: reference/project-status.md로 현재 상태 파악 가능
- [ ] **실수 방지**: explanation/mistake-patterns.md로 22가지 패턴 파악 가능

### **Step 5.3: 내용 품질 검증**
- [ ] 모든 코드 예시가 실제 프로젝트에서 작동하는지 확인
- [ ] 모든 검증 명령어가 실제 실행 가능한지 확인
- [ ] 기존 핵심 의도와 문구들이 누락되지 않았는지 확인
- [ ] 새 AI 관점에서 이해하기 어려운 부분 없는지 확인

### **Step 5.4: 최종 정리**
- [ ] 사용하지 않는 백업 폴더 정리: `rm -rf current-state-backup/`
- [ ] 전체 검증 실행: `npm run verify:parallel`
- [ ] 메인 docs README.md 작성 (Diátaxis 구조 안내)

**Phase 5 완료 기준**: 모든 테스트 통과 + 최종 정리 완료

---

## 🎯 **최종 성공 기준**

### **필수 완료 항목**
- [ ] **백업 완료**: 기존 문서들 안전하게 백업
- [ ] **구조 생성**: Diátaxis 4분할 구조 완전 구축
- [ ] **핵심 문서**: 4개 핵심 문서 작성 완료
- [ ] **서브에이전트**: 15개 CLAUDE.md 표준 구조 적용
- [ ] **내용 보존**: 기존 핵심 의도 100% 보존
- [ ] **검증 통과**: 새 AI 테스트 시나리오 모두 통과

### **품질 지표 달성**
- [ ] **30초 온보딩**: tutorial/quick-start.md만으로 프로젝트 파악
- [ ] **실수 방지**: 22가지 실수 패턴 완전 방지 체계
- [ ] **실무 실행**: how-to 가이드만으로 실제 코드 작성
- [ ] **현황 파악**: reference 문서만으로 즉시 상태 파악
- [ ] **품질 보장**: 16개 서브에이전트 3단계 규칙 적용

---

## 🚨 **실패 시 복구 절차**

### **단계별 복구 방법**
```bash
# Phase 1-2 실패 시
rm -rf docs/{tutorial,how-to,reference,explanation}/
cp -r docs_backup_*/ docs/
# 다시 Phase 1부터 시작

# Phase 3 실패 시 (CLAUDE.md 문제)
cp CLAUDE_backup_*.md CLAUDE.md
cp docs_backup_*/CLAUDE.md src/[affected-folder]/CLAUDE.md
# 해당 Phase부터 재시작

# Phase 4-5 실패 시
# 핵심 작업은 완료되었으므로 부분 수정으로 해결
```

### **응급 대응**
- **시간 부족**: Phase 2까지만 완료하고 나머지는 다음 세션
- **구조 오류**: 백업에서 복구 후 단계별 재진행
- **내용 누락**: 백업 파일에서 해당 내용 확인 후 추가

---

## 📊 **진행 현황 추적**

### **전체 진행률**
- [ ] Phase 1: 백업 및 준비 (0/4) - 0%
- [ ] Phase 2: 핵심 문서 (0/4) - 0%  
- [ ] Phase 3: 서브에이전트 (0/15) - 0%
- [ ] Phase 4: 나머지 구조 (0/8) - 0%
- [ ] Phase 5: 검증 확인 (0/12) - 0%

**전체 완료율**: 0/43 항목 (0%)

### **시간 추적**
- 시작 시간: [기록]
- Phase 1 완료: [기록]  
- Phase 2 완료: [기록]
- Phase 3 완료: [기록]
- Phase 4 완료: [기록]
- Phase 5 완료: [기록]
- **총 소요 시간**: [기록]

---

## 🎉 **완료 후 체크**

작업 완료 후 이 체크리스트를 실행하세요:

```bash
# 1. 구조 검증
echo "=== 새 구조 확인 ==="
tree docs/

# 2. 서브에이전트 지침 검증  
echo "=== CLAUDE.md 3단계 구조 확인 ==="
grep -r "STOP\|MUST\|CHECK" */CLAUDE.md | wc -l

# 3. 필수 섹션 검증
echo "=== any 타입 금지 섹션 확인 ==="  
grep -r "any 타입 금지" */CLAUDE.md | wc -l

# 4. 전체 시스템 검증
echo "=== 프로젝트 검증 ==="
npm run verify:parallel

# 5. 새 AI 컨텍스트 생성
echo "=== AI 컨텍스트 업데이트 ==="
node scripts/context-loader.js
echo "ai-context-warmup.md 파일 확인하세요"
```

**모든 항목이 예상 결과와 일치하면 작업 완료입니다!** 🎉

---

*이 체크리스트를 하나씩 체크하며 진행하면 완벽한 문서 재구성을 달성할 수 있습니다. 빠뜨린 항목이 없는지 꼼꼼히 확인하세요.*