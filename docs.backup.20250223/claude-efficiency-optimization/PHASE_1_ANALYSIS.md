/sc:analyze --seq --ultrathink --delegate folders
"Phase 1: 현재 프로젝트 상태 분석 및 개선 계획 수립"

# Phase 1: 현재 상태 분석 및 계획 수립

## 🚨 프로젝트 특화 규칙 확인 (필수)
⚠️ **경고**: 아래 문서 미확인 시 프로젝트 파괴 가능성 90%

### 최우선 확인 문서
- [ ] `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 (전체 읽기 필수)
- [ ] `/CLAUDE.md` 17-43행 - 자동 스크립트 절대 금지
- [ ] `package.json` - 108개 dependencies 파악

### 작업 전 검증 명령어
```bash
# 현재 CLAUDE.md 파일 확인
find src -name "CLAUDE.md" -type f | wc -l  # 현재 몇 개 존재하는지

# NPM scripts 개수 확인
cat package.json | jq '.scripts | keys | length'  # 119개 확인

# Dependencies 분석
cat package.json | jq '.dependencies | keys | length'  # 78개
cat package.json | jq '.devDependencies | keys | length'  # 30개
```

## 📌 Phase 정보
- **Phase 번호**: 1/4
- **선행 조건**: 없음
- **예상 시간**: 1시간
- **우선순위**: CRITICAL
- **작업 범위**: 전체 프로젝트 분석

## 🎯 Phase 목표
1. 현재 폴더 구조 및 CLAUDE.md 존재 여부 파악
2. 108개 dependencies 카테고리별 분류
3. 119개 NPM scripts 용도별 정리
4. 개선 우선순위 결정

## 📚 온보딩 섹션
### 이 Phase에 필요한 지식
- [ ] `/docs/DOCUMENT_GUIDE.md` - 문서 작성 규칙
- [ ] `/docs/CODEMAP.md` - 프로젝트 구조

### 작업 파일 경로
- 분석 대상: `src/` 전체 폴더 구조
- package.json: dependencies, scripts 분석
- 기존 CLAUDE.md 파일들

## 📝 작업 내용

### 1. 폴더 구조 분석
```bash
# 폴더별 CLAUDE.md 필요 위치 파악
echo "=== 폴더별 CLAUDE.md 필요 위치 ==="
echo "src/app/api/ - API 개발 가이드"
echo "src/app/(pages)/ - 페이지 개발 가이드"
echo "src/components/ - 컴포넌트 가이드"
echo "src/hooks/ - React Query 가이드"
echo "src/lib/ - 라이브러리 가이드"
echo "src/lib/supabase/ - Supabase 가이드"
echo "src/lib/security/ - 보안 가이드"
echo "src/types/ - 타입 시스템 가이드"
echo "scripts/ - 스크립트 가이드"
echo "tests/ - 테스트 가이드"

# 현재 존재하는 CLAUDE.md 확인
find . -name "CLAUDE.md" -type f
```

### 2. Dependencies 분석 및 분류
```javascript
// scripts/analyze-dependencies.js 생성
const packageJson = require('../package.json');

const categories = {
  'UI Framework': ['react', 'react-dom', 'next'],
  'UI Components': ['@radix-ui', 'embla-carousel', 'framer-motion'],
  'State Management': ['zustand', '@tanstack/react-query'],
  'Form & Validation': ['react-hook-form', 'zod'],
  'Database': ['@supabase', '@redis'],
  'Testing': ['vitest', '@testing-library', 'playwright'],
  'Build Tools': ['vite', 'turbo', 'tsup'],
  'Dev Tools': ['biome', 'typescript', 'prettier'],
  'Security': ['dompurify', 'crypto-js', 'jsonwebtoken'],
  'Analytics': ['@vercel/analytics', 'posthog-js']
};

// 분류 실행
Object.entries(categories).forEach(([category, patterns]) => {
  const deps = Object.keys({
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  }).filter(dep => patterns.some(p => dep.includes(p)));
  
  console.log(`\n${category}: ${deps.length}개`);
  deps.forEach(d => console.log(`  - ${d}`));
});
```

### 3. NPM Scripts 카테고리화
```javascript
// scripts/analyze-scripts.js 생성
const scripts = packageJson.scripts;

const scriptCategories = {
  'Development': ['dev', 'start'],
  'Build': ['build', 'export'],
  'Testing': ['test', 'e2e'],
  'Verification': ['verify', 'check'],
  'Security': ['security'],
  'Database': ['db', 'migrate'],
  'Linting': ['lint', 'format'],
  'Analysis': ['analyze'],
  'Clean': ['clean']
};

Object.entries(scriptCategories).forEach(([category, patterns]) => {
  const categoryScripts = Object.keys(scripts)
    .filter(name => patterns.some(p => name.includes(p)));
  
  console.log(`\n${category} (${categoryScripts.length}개):`);
  categoryScripts.forEach(s => console.log(`  npm run ${s}`));
});
```

### 4. 개선 우선순위 매트릭스 생성
```markdown
| 폴더 | 중요도 | 복잡도 | 파일 수 | 우선순위 |
|------|--------|--------|---------|----------|
| src/app/api/ | 높음 | 높음 | 30+ | 1 |
| src/components/ | 높음 | 중간 | 50+ | 2 |
| src/hooks/ | 높음 | 중간 | 15 | 3 |
| src/lib/supabase/ | 높음 | 높음 | 10 | 4 |
| src/types/ | 중간 | 낮음 | 5 | 5 |
```

## 📋 QA 테스트 시나리오
### 정상 플로우
1. 모든 폴더 구조 정확히 파악됨
2. Dependencies 100% 분류됨
3. NPM Scripts 100% 카테고리화됨

### 실패 시나리오
- 누락된 폴더 발견 시 → 즉시 목록에 추가
- 미분류 dependency → 새 카테고리 생성
- 중복 script → 용도별 정리

## ✅ Phase 완료 조건
- [ ] 12개 폴더 구조 완전 파악
- [ ] 108개 dependencies 100% 분류
- [ ] 119개 NPM scripts 카테고리화
- [ ] 우선순위 매트릭스 완성
- [ ] 분석 보고서 생성

## 🔄 롤백 절차
```bash
# 분석 단계이므로 롤백 불필요
# 생성된 분석 스크립트만 제거
rm scripts/analyze-*.js
```

## → 다음 Phase
- **파일**: PHASE_2_FOLDER_CLAUDE.md
- **선행 조건**: 분석 보고서 완성