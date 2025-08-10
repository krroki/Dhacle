# TASK-[번호]: [작업 제목]

## 🚨 즉시 실행 스크립트 (Context Zero - 새 세션 시작 시)
```bash
# 새 세션 AI는 반드시 이 스크립트를 먼저 실행하여 현재 상태 파악
cd C:\My_Claude_Project\9.Dhacle
pwd
git status --short
npx tsc --noEmit 2>&1 | head -20
npm list --depth=0 2>/dev/null | grep -E "(next|react|typescript|supabase)"
```

## 🌍 프로젝트 기본 정보 (Context Zero 보완)
- **프로젝트명**: 디하클 (Dhacle)
- **목적**: YouTube Shorts 크리에이터 교육 플랫폼
- **기술 스택**: Next.js 14.2.5, TypeScript 5.x, Supabase, styled-components
- **디자인 시스템**: theme.deep.json 토큰 시스템 (Stripe 스타일)
- **프로젝트 위치**: C:\My_Claude_Project\9.Dhacle

## 📌 메타데이터
- **작업 ID**: TASK-[번호]
- **예상 소요시간**: 30분
- **담당**: Developer AI
- **우선순위**: [Critical/High/Medium/Low]
- **상태**: 대기중

## 🎯 Developer AI 학습 요구사항

### 필수 학습 문서 (작업 시작 전 반드시 읽기)
```bash
# 1. 프로젝트 기본 이해 (필수)
- docs/PROJECT-INDEX.md              # 프로젝트 개요와 현재 상황
- CLAUDE.md                          # 프로젝트 규칙과 검증 체크리스트
- docs/site-architecture-plan.md    # 전체 구조 이해
- docs/Visual-Verification-Protocol.md  # UI 검증 60개 항목

# 2. 기술 스택 이해 (필수)
- package.json                      # 사용 가능한 라이브러리
- theme.deep.json                   # 토큰 시스템
- src/components/design-system/     # 디자인 시스템 컴포넌트
- src/types/database.types.ts       # DB 타입 정의

# 3. 작업 관련 파일 (작업별로 다름)
- [수정할 파일 경로들]
- [참고할 파일 경로들]
```

### 학습 확인 체크리스트
**기본 체크리스트 (모든 작업 공통)**
- [ ] 프로젝트가 무엇인지 이해했는가? (YouTube Shorts 크리에이터 교육 플랫폼)
- [ ] theme.deep.json 토큰만 사용해야 한다는 규칙 확인했는가?
- [ ] 디자인 시스템 컴포넌트(StripeButton 등) 사용법 확인했는가?

**작업별 체크리스트 (작업에 맞게 추가)**
- [ ] [이 작업에서 수정할 파일 위치 아는가?]
- [ ] [관련 기존 코드의 패턴 파악했는가?]
- [ ] [이 기능이 왜 필요한지 이해했는가?]
- [ ] [실패 시 어떤 영향이 있는지 아는가?]

## 🎯 작업 목표
[명확하고 측정 가능한 목표 - Context 활용하여 간결하게]

## 📝 구현 지시사항

### Context 기반 구현
```markdown
기준 문서: site-architecture-plan.md의 [섹션명]
구현 내용: 문서에 정의된 대로 구현
추가 사항:
- [추가할 내용만 명시]
- [변경할 부분만 명시]
```

### 구체적 변경사항 (Context에 없는 부분만)
```typescript
// 새로 추가할 코드나 수정할 부분만
// 기존 문서에 있는 내용은 참조만
```

## ✅ 완료 기준
- [ ] 학습한 문서 기준 100% 구현
- [ ] TypeScript 타입 체크 통과
- [ ] 실제 동작 검증 완료

## 🔍 검증 명령어 (실행 가능한 것만)
```bash
# 타입 체크
npx tsc --noEmit

# 테스트 실행
npm test

# 로컬 실행
npm run dev
```

## 📊 증거 수집
1. 실행 로그 저장
2. 스크린샷 캡처 (UI 작업인 경우)
3. 테스트 결과 저장

## 🚨 실패 시나리오 및 롤백 (Context Zero 보완)
### 예상 가능한 실패와 대처
1. **타입 에러 발생 시**
   ```bash
   # 전체 타입 체크
   npx tsc --noEmit
   
   # 특정 타입 정의 확인
   cat src/types/database.types.ts  # DB 타입
   cat src/types/[관련타입].ts  # 타입 정의 확인
   
   # Supabase 타입 재생성 (필요시)
   npx supabase gen types typescript --local > src/types/database.types.ts
   ```

2. **import 경로 에러 시**
   ```bash
   # 파일 존재 확인
   ls -la src/[경로]/  
   
   # export 위치 찾기
   grep -r "export.*ComponentName" src/
   
   # 경로 구조 확인
   tree src/components -L 2
   ```

3. **런타임 에러 시**
   ```bash
   # 개발 서버 재시작
   npm run dev
   
   # 포트 충돌 시
   npx kill-port 3000
   npm run dev
   ```
   - 브라우저 콘솔 확인 (F12)
   - 네트워크 탭 확인 (실패한 API 호출)
   - React DevTools 확인 (컴포넌트 상태)
   - 에러 메시지 전체 복사

4. **Supabase 연결 에러 시**
   ```bash
   # 환경 변수 확인
   cat .env.local | grep SUPABASE
   
   # Supabase 상태 확인
   npx supabase status
   
   # Mock 모드 확인
   echo $NEXT_PUBLIC_USE_MOCK_SUPABASE
   ```

5. **스타일링 깨짐 시**
   ```bash
   # 토큰 검증
   node scripts/validate-tokens.js
   
   # theme.deep.json 확인
   cat theme.deep.json | jq '.colors'
   ```

### Git 롤백 절차
```bash
# ⚠️ 주의: git 명령은 반드시 사용자 확인 후 실행
# 변경사항 확인
git status
git diff [파일명]

# 특정 파일 롤백 (사용자 승인 필요)
git checkout -- [파일명]

# 모든 변경사항 임시 저장 (사용자 승인 필요)
git stash
```

## 📑 작업 완료 보고 형식 (Context Zero)
```json
{
  "task_id": "TASK-[번호]",
  "status": "completed",
  "files_modified": [
    "[파일 경로 1]",
    "[파일 경로 2]"
  ],
  "changes_summary": [
    "[변경 내용 1]",
    "[변경 내용 2]"
  ],
  "verification": {
    "typescript_check": "✅ 0 errors",
    "lint_check": "✅ 0 warnings",
    "runtime_test": "✅ No console errors"
  },
  "evidence": {
    "screenshots": "[경로]",
    "logs": "[경로]"
  }
}
```

## 💬 PM AI → Developer AI 지시
1. 위 문서들을 먼저 학습하세요
2. Context를 활용하여 구현하세요
3. 불명확한 부분만 질문하세요
4. 완료 후 증거 제출하세요
5. **⚠️ Git 작업은 반드시 사용자 승인 후 실행**

---
*Context Zero + Context 활용 통합 템플릿 v3.0*
*작성일: 2025-01-09*
*주의: 모든 git 작업은 사용자 확인 필수*