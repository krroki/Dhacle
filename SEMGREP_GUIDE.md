# Semgrep 설치 및 사용 가이드

## 🔒 Semgrep이란?
정적 분석 도구로 보안 취약점과 코드 품질 문제를 자동으로 탐지합니다.

## 📦 설치 방법

### 옵션 1: Python pip (권장)
```bash
# Python 3.7+ 필요
pip install semgrep

# 또는 pipx 사용 (가상환경 자동 관리)
pipx install semgrep
```

### 옵션 2: npm (대안)
```bash
npm install -g @semgrep/semgrep
```

### 옵션 3: Docker (설치 없이 사용)
```bash
docker run --rm -v "${PWD}:/src" semgrep/semgrep --config=.semgrep.yml
```

### 옵션 4: Windows (수동 설치)
1. https://github.com/semgrep/semgrep/releases 방문
2. 최신 Windows 바이너리 다운로드
3. PATH에 추가

## 🚀 사용 방법

### 기본 스캔
```bash
# 프로젝트 루트에서 실행
semgrep --config=.semgrep.yml ./src
```

### 특정 규칙만 실행
```bash
# 인증 체크만
semgrep --config=.semgrep.yml --include-rule=missing-auth-check ./src

# 보안 규칙만
semgrep --config=.semgrep.yml --severity=ERROR ./src
```

### CI/CD 통합 (GitHub Actions)
`.github/workflows/semgrep.yml` 생성:
```yaml
name: Semgrep
on:
  pull_request: {}
  push:
    branches: [main, develop]

jobs:
  semgrep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: semgrep/semgrep-action@v1
        with:
          config: .semgrep.yml
```

## 📋 현재 프로젝트 규칙 (10개)

1. **missing-auth-check** - API Route 인증 체크 누락
2. **direct-fetch-usage** - api-client.ts 대신 직접 fetch 사용
3. **no-any-type** - TypeScript any 타입 사용
4. **hardcoded-secret** - 하드코딩된 비밀키
5. **inline-style-usage** - Tailwind 대신 인라인 스타일
6. **console-log-usage** - 프로덕션 console.log
7. **sql-injection-risk** - SQL Injection 위험
8. **xss-dangerouslySetInnerHTML** - XSS 취약점
9. **async-without-promise-type** - Promise 타입 누락
10. **rls-missing-user-filter** - RLS 테이블 user_id 필터 누락

## 🎯 npm 스크립트 실행
```bash
# Semgrep 실행 (설치 필요)
npm run security:semgrep
```

## 📊 예상 결과
- 직접 fetch() 호출: 14개 발견 예상
- any 타입: 0개 (이미 수정됨)
- console.log: 여러 개 발견 예상

## 🔧 문제 수정 예시

### 직접 fetch → api-client 사용
```typescript
// ❌ Before
const response = await fetch('/api/endpoint');

// ✅ After
import { apiGet } from '@/lib/api-client';
const data = await apiGet('/api/endpoint');
```

### any 타입 제거
```typescript
// ❌ Before
const data: any = await fetchData();

// ✅ After
interface DataType {
  id: string;
  name: string;
}
const data = await fetchData<DataType>();
```

## 🌟 장점
- **빠른 스캔**: 수천 개 파일도 수초 내 분석
- **정확한 탐지**: AST 기반 분석으로 오탐 최소화
- **커스텀 규칙**: 프로젝트별 맞춤 규칙 작성 가능
- **CI/CD 통합**: GitHub, GitLab, Jenkins 등 지원

## 📝 추가 정보
- 공식 문서: https://semgrep.dev/docs
- 규칙 라이브러리: https://semgrep.dev/registry
- 커뮤니티: https://r2c.dev/slack