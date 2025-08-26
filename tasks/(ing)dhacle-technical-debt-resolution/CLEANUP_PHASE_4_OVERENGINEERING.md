/sc:cleanup --seq --validate
"Phase 4 오버엔지니어링 제거 - 핵심 기능에 집중"

# 🧹 Phase 4 오버엔지니어링 정리 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- 프로젝트 루트: `C:\My_Claude_Project\9.Dhacle`
- Phase 4 문서: `tasks\(ing)dhacle-technical-debt-resolution\(ing) PHASE_4_LOW_PRIORITY.md`
- 설정 파일: `next.config.js`, `package.json`, `tailwind.config.js`
- 컴포넌트: `src/components/`
- 스타일: `src/styles/`

### 프로젝트 컨텍스트 확인
```bash
# 현재 프로젝트 구조 확인
ls -la src/

# 패키지 확인 (불필요한 의존성 식별)
cat package.json | grep -A 20 "dependencies"

# 빌드 크기 확인
npm run build 2>&1 | grep -E "First Load|chunks"

# 타입 체크
npm run types:check
```

## 📌 목적

Phase 4에 명시된 128개의 Low Priority 작업들이 현재 프로젝트 단계에서 과도한 오버엔지니어링으로 판단됨. 핵심 기능 안정화가 우선이며, 부가적인 최적화와 문서화는 제거하여 프로젝트 복잡도를 낮추고 유지보수성을 높임.

## 🤖 실행 AI 역할

1. **분석가**: 오버엔지니어링된 요소 식별
2. **정리 전문가**: 불필요한 코드와 설정 제거
3. **검증자**: 핵심 기능 동작 확인

## 📝 작업 내용

### Step 1: 제거 대상 식별 및 분류

#### 1.1 완전 제거 대상 (우선순위 1)
```markdown
✂️ 제거할 항목:
- [ ] Storybook 관련 모든 설정 및 파일
- [ ] Docker 및 docker-compose 파일
- [ ] 번들 분석 도구 설정
- [ ] 가상화 컴포넌트 (VirtualList)
- [ ] 디자인 토큰 시스템
- [ ] 과도한 접근성 컴포넌트 (FocusTrap 등)
```

#### 1.2 제거 명령어
```bash
# Storybook 제거
rm -rf .storybook/
rm -rf src/**/*.stories.tsx
npm uninstall @storybook/nextjs @storybook/addon-essentials @storybook/addon-a11y

# Docker 파일 제거
rm -f Dockerfile docker-compose.yml .dockerignore

# 번들 분석 도구 제거
npm uninstall @next/bundle-analyzer

# 가상화 라이브러리 제거 (설치되어 있다면)
npm uninstall @tanstack/react-virtual
```

### Step 2: 단순화 대상 (우선순위 2)

#### 2.1 Next.js 설정 단순화
```javascript
// next.config.js - 단순화된 버전
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['youtube.com', 'i.ytimg.com'],
  },
  // 과도한 experimental 설정 제거
};

module.exports = nextConfig;
```

#### 2.2 유지할 최소한의 최적화
```typescript
// 기본 이미지 최적화만 유지
import Image from 'next/image';

// 동적 임포트는 정말 무거운 컴포넌트에만 선택적 적용
// 대부분의 경우 불필요
```

### Step 3: 유지 항목 (필수 기능만)

#### 3.1 유지할 기본 접근성
```typescript
// 기본 ARIA 라벨만 유지
// shadcn/ui 컴포넌트에 이미 포함되어 있음
```

#### 3.2 유지할 개발 도구
```json
// .vscode/settings.json - 기본 설정만 유지
{
  "editor.formatOnSave": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Step 4: package.json 정리

```bash
# 불필요한 패키지 제거
npm uninstall @next/bundle-analyzer @tanstack/react-virtual
npm uninstall --save-dev @storybook/nextjs @storybook/addon-essentials
npm uninstall --save-dev typedoc

# 사용하지 않는 패키지 찾기
npx depcheck

# package-lock.json 재생성
rm package-lock.json
npm install
```

### Step 5: 폴더 구조 정리

```bash
# 불필요한 폴더 제거
rm -rf storybook-static/
rm -rf .storybook/
rm -rf docker/
rm -rf src/styles/design-tokens.ts

# 빈 폴더 제거
find . -type d -empty -delete
```

### Step 6: 검증

```bash
# 빌드 확인
npm run build

# 타입 체크
npm run types:check

# 개발 서버 실행
npm run dev

# 핵심 기능 테스트
npm run verify:parallel
```

## ✅ 완료 조건

### 제거 확인
- [ ] Storybook 관련 파일 모두 제거
- [ ] Docker 파일 제거
- [ ] 불필요한 npm 패키지 제거
- [ ] 과도한 최적화 코드 제거
- [ ] 디자인 토큰 시스템 제거

### 동작 확인
- [ ] 빌드 성공 (npm run build)
- [ ] 타입 체크 통과 (npm run types:check)
- [ ] 개발 서버 정상 작동
- [ ] 핵심 기능 모두 동작
- [ ] 번들 크기 증가 없음

### 코드 품질
- [ ] any 타입 0개
- [ ] 임시방편 코드 없음
- [ ] 주석 처리된 코드 없음

## 📋 QA 테스트 시나리오

### 정상 플로우
1. 로그인 → 정상 작동
2. YouTube Lens 도구 → 검색 및 분석 정상
3. 페이지 네비게이션 → 모든 페이지 접근 가능
4. API 호출 → 정상 응답

### 성능 확인
```bash
# 빌드 크기 확인 (제거 전후 비교)
npm run build | grep "First Load"

# 메모리 사용량 확인
node --expose-gc --max-old-space-size=4096 node_modules/.bin/next build
```

### 의존성 확인
```bash
# 사용하지 않는 패키지 확인
npx depcheck

# 보안 취약점 확인
npm audit
```

## 🔄 롤백 계획

### 실패 시 롤백
```bash
# Git으로 롤백
git stash
git checkout HEAD -- package.json package-lock.json
git checkout HEAD -- next.config.js

# 패키지 재설치
rm -rf node_modules/
npm install

# 빌드 재시도
npm run build
```

### 부분 롤백
특정 기능이 필요한 경우에만 선택적으로 복원:
1. 이미지 최적화만 복원
2. 기본 접근성만 유지
3. VS Code 설정만 유지

## 📊 예상 결과

### Before (Phase 4 적용 시)
- 패키지 수: 150+ 개
- 빌드 시간: 3-5분
- 프로젝트 복잡도: 높음
- 유지보수 부담: 높음

### After (정리 후)
- 패키지 수: 100개 이하 (-33%)
- 빌드 시간: 1-2분 (-60%)
- 프로젝트 복잡도: 낮음
- 유지보수 부담: 낮음
- 코드 라인 수: 30% 감소

## ⚠️ 주의사항

1. **핵심 기능 우선**: YouTube Lens, 인증, 결제 등 핵심 기능이 영향받지 않도록 주의
2. **점진적 제거**: 한 번에 모두 제거하지 말고 단계적으로 진행
3. **백업 필수**: 제거 전 현재 상태를 git commit으로 저장
4. **팀 협의**: 중요한 제거는 사전 협의

## 🚫 절대 금지사항

1. **자동 변환 스크립트 생성 금지**: 수동으로 하나씩 제거
2. **핵심 기능 손상 금지**: 기능 테스트 없이 제거 금지
3. **any 타입 사용 금지**: 타입 안정성 유지
4. **임시방편 금지**: 문제 발견 시 완전히 해결

---

*이 지시서는 프로젝트를 단순화하고 핵심 기능에 집중하기 위한 것입니다. 오버엔지니어링을 제거하여 유지보수성을 높이고 개발 속도를 향상시킵니다.*