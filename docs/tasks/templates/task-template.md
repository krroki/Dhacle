# TASK-[번호]: [작업 제목]

## 📌 메타데이터
- **작업 ID**: TASK-[번호]
- **예상 소요시간**: 30분
- **담당**: Developer AI
- **우선순위**: [Critical/High/Medium/Low]
- **의존성**: [선행 작업 ID 목록]
- **상태**: [대기중/진행중/검토중/완료/보류]
- **생성일**: [YYYY-MM-DD]
- **마감일**: [YYYY-MM-DD]

## 🎯 작업 목표
[명확하고 측정 가능한 목표 - 1-2문장]

## 📝 상세 지시사항

### 1. 환경 설정
- **작업 디렉토리**: `C:\My_Claude_Project\9.Dhacle`
- **브랜치**: `feature/[기능명]`
- **필요 도구**: 
  - [ ] Node.js 18+
  - [ ] npm/yarn
  - [ ] Git
  - [ ] [기타 도구]

### 2. 구현 단계

#### Step 1: [단계 제목]
```bash
# 실행할 명령어
[명령어]
```
- **설명**: [무엇을 하는지 상세 설명]
- **예상 결과**: 
  ```
  [예상되는 출력]
  ```
- **검증 방법**: 
  ```bash
  # 검증 명령어
  [검증 명령]
  ```

### 3. 코드 구현

#### 파일: `[파일 경로]`
```typescript
// 구현 코드
```

## ✅ 완료 기준
- [ ] 모든 기능 구현
- [ ] 테스트 통과
- [ ] 문서화 완료

## 📸 시각적 검증 요구사항 (Visual Verification Protocol)
> ⚠️ **UI 관련 작업에만 적용** - 백엔드/인프라 작업은 이 섹션 제거

### VVP 3단계 검증 체크리스트

#### Stage 1: 코드 검증 ✅
- [ ] TypeScript 컴파일 에러 0개
- [ ] 하드코딩된 색상 없음 (`grep -n "text-|bg-" *.tsx` 결과 없음)
- [ ] 토큰 시스템 100% 사용

#### Stage 2: 렌더링 검증 ✅
- [ ] 개발 서버 정상 실행 (`npm run dev`)
- [ ] 페이지 404 없이 로드
- [ ] Console 에러 0개
- [ ] 컴포넌트 정상 마운트

#### Stage 3: 시각적 검증 ✅ (필수!)
- [ ] 스크린샷 최소 3장 촬영
  - [ ] 기본 상태: `screenshots/[component]-default.png`
  - [ ] 호버 상태: `screenshots/[component]-hover.png`
  - [ ] 모바일: `screenshots/[component]-mobile.png`
- [ ] 크기/위치 검증
  - [ ] 너비/높이가 디자인 스펙과 일치
  - [ ] 요소 위치가 올바름
  - [ ] 간격(margin/padding)이 일관됨
- [ ] 시각적 스타일 검증
  - [ ] 색상이 토큰 값과 일치
  - [ ] 그림자/테두리 정상 표시
  - [ ] 텍스트 가독성 확보
- [ ] 반응형 검증
  - [ ] 모바일(375px) 레이아웃 정상
  - [ ] 태블릿(768px) 레이아웃 정상
  - [ ] 데스크톱(1920px) 레이아웃 정상

### Playwright 검증 스크립트
```javascript
// visual-verification-[component].spec.ts
test('Visual Verification: [Component]', async ({ page }) => {
  await page.goto('/test-[component]');
  
  // 크기 검증
  const element = await page.$('[data-testid="component"]');
  const box = await element.boundingBox();
  expect(box.width).toBe(expectedWidth);
  expect(box.height).toBe(expectedHeight);
  
  // 스크린샷
  await page.screenshot({ 
    path: 'screenshots/[component]-default.png',
    fullPage: true 
  });
  
  // 스타일 검증
  const styles = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="component"]');
    return window.getComputedStyle(el);
  });
  
  expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(styles.boxShadow).not.toBe('none');
});
```

### VVP 실패 시 조치
1. 작업 중단
2. 스크린샷 분석
3. 문제 수정
4. 처음부터 재검증

## 🔍 검증 체크리스트
```json
{
  "implementation_complete": false,
  "tests_passing": false,
  "lint_clean": false,
  "documentation_updated": false,
  "manual_verification": false,
  "screenshot_captured": false,
  "logs_collected": false,
  "vvp_stage1_code": false,
  "vvp_stage2_rendering": false,
  "vvp_stage3_visual": false
}
```

## 📊 증거 수집 요구사항
1. **실행 로그**: `docs/evidence/logs/TASK-[번호]-execution.log`
2. **스크린샷**: `docs/evidence/screenshots/TASK-[번호]/`
3. **테스트 결과**: `docs/evidence/test-results/TASK-[번호]-results.json`
4. **코드 diff**: `docs/evidence/diffs/TASK-[번호]-diff.txt`
5. **VVP 스크린샷**: 
   - `docs/evidence/screenshots/TASK-[번호]-default.png`
   - `docs/evidence/screenshots/TASK-[번호]-hover.png`
   - `docs/evidence/screenshots/TASK-[번호]-mobile.png`
6. **VVP 검증 보고서**: `docs/evidence/vvp-reports/TASK-[번호]-vvp.md`

## 🚨 예외 처리
- **실패 시나리오 1**: [상황] → [해결책]
- **실패 시나리오 2**: [상황] → [해결책]

## 💬 PM AI 지시사항
개발자 AI가 이 작업을 수행할 때:
1. 환경 설정 확인 먼저 실행
2. 단계별로 검증 수행
3. 문제 발생 시 즉시 중단하고 보고
4. 모든 증거 수집 후 완료 보고
5. UI 작업의 경우 VVP 3단계 검증 필수 실행
6. 시각적 문제 발견 시 즉시 중단 및 보고

## 🔧 권장 SuperClaude 명령
```bash
/sc:implement --persona-backend --seq --validate
```

## 📁 생성될 파일 목록
| 파일명 | 경로 | 용도 |
|--------|------|------|
| [파일1] | [경로] | [설명] |

## 📑 보고 요구사항

### 최종 보고 형식
1. **로그 요약**: 주요 실행 결과 5줄 이내
2. **diff 출력**: 주요 변경사항
3. **검증 결과**: 모든 체크리스트 항목 통과 여부
4. **증거 파일**: 자동 생성된 증거 파일 목록

---

**작업 완료 후**: `git add -A && git commit -m "feat: [작업 설명]"`