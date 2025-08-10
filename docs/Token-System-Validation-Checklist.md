# 🎨 토큰 시스템 검증 체크리스트

## 1. 토큰 정의 검증

### 색상 토큰 (colors.ts)
- [ ] theme.deep.json에서 색상 토큰 정의 존재
- [ ] colors.ts로 올바르게 export
- [ ] 모든 색상이 유효한 HEX/RGB 값
- [ ] semantic 색상 정의 (success, error, warning, info)
- [ ] neutral 색상 스케일 (0-900)
- [ ] primary/secondary 색상 정의

### 타이포그래피 토큰 (typography.ts)
- [ ] fontSize 스케일 정의 (xs ~ h1)
- [ ] fontWeight 정의 (light ~ bold)
- [ ] lineHeight 정의
- [ ] fontFamily 정의
- [ ] letterSpacing 정의

### 효과 토큰 (effects.ts)
- [ ] shadows 정의 (sm, md, lg, xl, hover)
- [ ] borderRadius 정의 (sm ~ full)
- [ ] animation.duration 정의
- [ ] animation.easing 정의
- [ ] opacity 레벨 정의
- [ ] blur 값 정의

### 간격 토큰 (spacing.ts)
- [ ] spacing 스케일 (0 ~ 32)
- [ ] 일관된 간격 시스템
- [ ] rem 단위 사용

## 2. 토큰 사용 검증

### 하드코딩 검사
```bash
# 색상 하드코딩 검사
grep -r "color: ['\"]#" src/
grep -r "backgroundColor: ['\"]#" src/
grep -r "text-[a-z]+-[0-9]+" src/
grep -r "bg-[a-z]+-[0-9]+" src/

# 간격 하드코딩 검사
grep -r "padding: ['\"][0-9]+px" src/
grep -r "margin: ['\"][0-9]+px" src/

# 폰트 하드코딩 검사
grep -r "fontSize: ['\"][0-9]+" src/
grep -r "fontWeight: [0-9]+" src/
```

### 토큰 import 검증
- [ ] 컴포넌트에서 토큰 import 확인
- [ ] 올바른 경로에서 import
- [ ] 사용하지 않는 import 없음

## 3. 런타임 검증

### 토큰 값 확인
- [ ] undefined 값 없음
- [ ] 빈 문자열 값 없음
- [ ] 올바른 타입 (string, number)

### 브라우저 렌더링 확인
- [ ] 개발자 도구에서 computed styles 확인
- [ ] 토큰 값이 실제로 적용됨
- [ ] CSS 변수로 변환 시 정상 작동

## 4. 자동화 검증 스크립트

### 실행 방법
```bash
node scripts/validate-tokens.js
```

### 검증 항목
1. theme.deep.json 파일 존재 및 유효성
2. 토큰 파일 export 확인
3. 하드코딩 검색
4. 순환 참조 검사
5. 누락된 토큰 검사

## 5. 컴포넌트별 토큰 사용 체크리스트

### ExperienceCard 예시
- [ ] colors.semantic.success (별점)
- [ ] colors.neutral[300] (빈 별)
- [ ] colors.neutral[0] (배경)
- [ ] colors.neutral[900] (텍스트)
- [ ] effects.borderRadius.lg (카드 모서리)
- [ ] effects.shadows.hover (호버 그림자)
- [ ] typography.fontSize.* (텍스트 크기)

## 6. 문제 해결 가이드

### 토큰이 undefined일 때
1. theme.deep.json 확인
2. export 구문 확인
3. import 경로 확인
4. 타입 정의 확인

### 스타일이 적용되지 않을 때
1. className vs style 우선순위 확인
2. CSS 특이성 확인
3. 토큰 값 자체 확인
4. 브라우저 캐시 클리어

## 7. 토큰 시스템 모범 사례

### DO ✅
- 항상 토큰 시스템 사용
- semantic 토큰 우선 사용
- 일관된 import 패턴 유지
- TypeScript 타입 활용

### DON'T ❌
- 하드코딩된 값 사용
- 토큰 값 직접 수정
- 인라인 스타일 남용
- Tailwind 기본 클래스 사용

## 8. 검증 보고서 템플릿

```markdown
## 토큰 시스템 검증 결과

**날짜**: YYYY-MM-DD
**검증자**: [이름]

### 검증 결과 요약
- 총 토큰 수: XXX개
- 하드코딩 발견: X건
- undefined 토큰: X건
- 미사용 토큰: X건

### 발견된 문제
1. [파일명:라인] - 문제 설명
2. ...

### 권장 조치
1. ...
2. ...
```