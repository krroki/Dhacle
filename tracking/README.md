# 📊 Dhacle Quality Metrics Tracking System

*히스토리 추적 시스템으로 품질 지표 변화 추이 모니터링*

---

## 🎯 개요

이 추적 시스템은 디하클 프로젝트의 품질 지표를 시간에 따라 추적하고 분석하여 개발 품질 향상을 돕습니다.

### 주요 기능
- **📈 품질 지표 추적**: 전체 품질 점수, 보안, Modern React 비율 등
- **⚡ 성능 모니터링**: Asset Scanner, Context Loader 실행 시간
- **📊 트렌드 분석**: 일일/주간/월간 변화 추이
- **🎨 시각화**: ASCII 차트 및 HTML 대시보드
- **🚨 자동 알림**: 임계값 기반 자동 알림 시스템

---

## 🚀 빠른 시작

### 1. 현재 메트릭 수집
```bash
npm run track:collect
```

### 2. 차트 생성
```bash
npm run track:charts
```

### 3. 일일 추적 실행
```bash
npm run track:daily
```

### 4. 주간 리포트 생성
```bash
npm run track:weekly
```

---

## 📋 사용 가능한 명령어

### 기본 추적 명령어
```bash
npm run track:collect      # 현재 메트릭 수집 및 저장
npm run track:report       # 7일간 트렌드 리포트 생성
npm run track:weekly       # 주간 리포트 생성
npm run track:monthly      # 월간 리포트 생성
npm run track:status       # 추적 시스템 상태 확인
```

### 일일 자동화 명령어
```bash
npm run track:daily        # 일일 추적 (알림 포함)
npm run track:continuous   # 24시간마다 연속 추적
```

### 시각화 명령어
```bash
npm run track:charts       # ASCII + HTML 차트 생성
npm run track:charts:html  # HTML 대시보드만 생성
npm run track:trends       # 트렌드 분석만 표시
```

### 통합 명령어
```bash
npm run track:complete     # 수집 + 차트 생성
```

---

## 📊 추적되는 지표

### 품질 지표
- **Overall Quality Score**: 전체 품질 점수 (Modern React + Security + RLS 평균)
- **Modern React Score**: Server Component vs Client Component 비율
- **Security Score**: API 인증 커버리지
- **RLS Coverage**: 데이터베이스 테이블 보안 정책 적용률

### 성능 지표
- **Asset Scan Time**: 자산 스캔 실행 시간
- **Context Load Time**: AI 컨텍스트 로딩 시간
- **Verify Time**: 검증 스크립트 실행 시간
- **Performance Score**: 전체 성능 점수

### 프로젝트 지표
- **Total Assets**: 전체 자산 수 (컴포넌트 + API + 테이블)
- **Components Count**: React 컴포넌트 수
- **API Routes Count**: API 엔드포인트 수
- **Tables Count**: 데이터베이스 테이블 수

### 코드 품질 지표
- **JSCPD Duplicates**: 코드 중복률 (%)
- **Errors Count**: 검증 에러 수
- **Warnings Count**: 경고 수
- **Git Commits Today**: 오늘 커밋 수

---

## 🗂️ 파일 구조

```
tracking/
├── metrics-history.csv         # 메트릭 데이터 (CSV 형태)
├── alerts.log                  # 알림 로그
├── reports/                    # 생성된 트렌드 리포트들
│   ├── trend-report-7d-*.md
│   ├── trend-report-30d-*.md
│   └── ...
├── charts/                     # HTML 대시보드
│   ├── dashboard-*.html
│   └── ...
└── README.md                   # 이 문서
```

---

## 🚨 알림 시스템

### 자동 알림 임계값
- **Critical 알림**:
  - Overall Quality < 20%
  - Security Score < 30%
  - Asset Scan Time > 5000ms
  - Code Duplicates > 10%

- **Warning 알림**:
  - Overall Quality < 40%
  - Security Score < 60%
  - Asset Scan Time > 3000ms
  - Code Duplicates > 5%

### 알림 확인
```bash
cat tracking/alerts.log | tail -10
```

---

## 📈 시각화 옵션

### 1. ASCII 차트 (터미널)
- 빠른 트렌드 확인
- 명령줄에서 즉시 확인 가능
- 서버 환경에서도 사용 가능

### 2. HTML 대시보드 (브라우저)
- 인터랙티브 차트 (Chart.js)
- 반응형 디자인
- 여러 지표 동시 비교

### 3. 마크다운 리포트
- 상세한 트렌드 분석
- 권장사항 포함
- 문서화 및 공유 용이

---

## 🔧 고급 사용법

### 특정 기간 분석
```bash
node scripts/tracking-system.js report 14    # 14일 리포트
node scripts/chart-visualizer.js --days 7   # 7일 차트
```

### 연속 모니터링
```bash
node scripts/daily-tracker.js --continuous 12  # 12시간마다 실행
```

### HTML만 생성
```bash
node scripts/chart-visualizer.js --html-only
```

---

## 🎯 품질 개선 가이드

### 현재 지표별 개선 방안

#### Overall Quality < 20% (현재 상황)
1. **Modern React 개선**: Client Component → Server Component 전환
2. **보안 강화**: 인증 없는 API 엔드포인트에 getUser() 추가
3. **RLS 정책**: 데이터베이스 테이블에 보안 정책 적용

#### Asset Scan Time 최적화
1. **캐싱 구현**: 변경되지 않은 파일 스킵
2. **증분 스캔**: Git diff 기반 변경 파일만 스캔
3. **병렬 처리**: Worker threads 활용

#### 코드 중복 제거
1. **공통 컴포넌트**: 반복되는 UI 패턴 추상화
2. **Utility 함수**: 중복 로직 utils로 이동
3. **Hook 활용**: 상태 로직 재사용

---

## 🔍 트러블슈팅

### 추적 실패 시
```bash
# 개별 구성요소 테스트
node scripts/asset-scanner.js
node scripts/context-loader.js
npm run verify:quick
```

### 차트 생성 실패 시
```bash
# 데이터 확인
npm run track:status
head -5 tracking/metrics-history.csv
```

### 알림이 작동하지 않을 때
```bash
# 알림 로그 확인
tail -20 tracking/alerts.log
```

---

## 📅 권장 사용 패턴

### 개발자 개인
- **매일 아침**: `npm run track:daily` 실행
- **주말**: `npm run track:weekly` 리포트 확인
- **새 기능 완성 후**: `npm run track:complete`

### 팀 협업
- **주간 회의**: HTML 대시보드 공유
- **월말**: 월간 트렌드 분석
- **릴리즈 전**: 품질 지표 확인

### CI/CD 통합
```yaml
# GitHub Actions 예시
- name: Track Quality Metrics
  run: npm run track:collect
```

---

## 🚀 향후 계획

### Phase 3 고도화 (예정)
- **실시간 대시보드**: WebSocket 기반 실시간 모니터링
- **더 많은 지표**: 테스트 커버리지, 번들 크기 등
- **AI 분석**: GPT를 통한 자동 품질 분석
- **슬랙 연동**: 중요 알림 슬랙 전송

---

*품질 추적을 통해 더 나은 코드를 작성하세요! 🚀*