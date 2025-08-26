# 🛡️ Claude Code 실수 방지 시스템

> Dhacle 프로젝트를 위한 실시간 규약 체크 및 실수 히스토리 추적 시스템

## 📁 폴더 구조

```
2025-08-25-claude-code-mistake-prevention-system/
├── ANALYSIS_REPORT.md         # 종합 분석 보고서 (5W1H)
├── implementation-details.js   # 전체 구현 코드
├── README.md                  # 이 파일
└── config-templates/          # 설정 파일 템플릿
    ├── settings.local.json    # Claude Code 설정
    ├── package.json          # npm 스크립트
    └── .gitignore           # Git 제외 파일
```

## 🚀 빠른 시작

### 1. 설치

```bash
# 필수 패키지 설치
npm install -D chokidar node-notifier chalk

# 디렉토리 생성
mkdir -p .claude/mistakes/history
mkdir -p .claude/watchdog
```

### 2. 설정 파일 복사

```bash
# Claude Code 설정
cp tasks/2025-08-25-claude-code-mistake-prevention-system/config-templates/settings.local.json .claude/

# 실행 스크립트 복사
cp tasks/2025-08-25-claude-code-mistake-prevention-system/implementation-details.js .claude/watchdog/
```

### 3. package.json에 스크립트 추가

```json
{
  "scripts": {
    "watch:conventions": "node .claude/watchdog/implementation-details.js start",
    "analyze:patterns": "node .claude/watchdog/implementation-details.js analyze",
    "check:pre-edit": "node .claude/watchdog/implementation-details.js pre-edit",
    "check:post-edit": "node .claude/watchdog/implementation-details.js post-edit"
  }
}
```

### 4. 실행

```bash
# 실시간 감시 시작
npm run watch:conventions

# 패턴 분석 (주간)
npm run analyze:patterns
```

## 📊 시스템 구성

### 1. 실수 히스토리 추적 시스템
- 파일별 변경 이력 관리
- MD5 해시 기반 중복 감지
- 1→2→1 패턴 방지

### 2. 실시간 규약 체크 엔진
- Chokidar 기반 파일 감시
- 13가지 실수 패턴 감지
- 즉각적인 피드백 제공

### 3. Claude Code Hooks
- Pre-edit: 수정 전 체크
- Post-edit: 수정 후 검증
- OnError: 에러 시 가이드

### 4. 자동 학습 시스템
- 패턴 분석 및 분류
- 문서 업데이트 제안
- 주간 리포트 생성

## 🎯 감지 패턴 (13가지)

### 치명적 (Critical)
1. **임시방편 코드**: TODO, FIXME, 주석 처리
2. **any 타입**: TypeScript any 사용
3. **자동 스크립트**: fix-*.js 생성
4. **세션 체크 누락**: API Route 인증 없음

### 반복적 (Recurring)
5. **Supabase 패턴 혼용**
6. **snake_case/camelCase 혼용**
7. **환경변수 직접 접근**
8. **파일 컨텍스트 무시**
9. **React Hook 명명 규칙 위반**

## 📈 대시보드

실시간 감시 실행 시 5초마다 갱신되는 대시보드:

```
🛡️ Dhacle 규약 감시 대시보드

📊 실시간 통계
  가동 시간: 2시간 15분 30초
  검사한 파일: 152개
  발견된 위반: 12개
  자동 수정: 8개
  
🔥 핫스팟 (자주 실수하는 파일)
  1. route.ts - 5회
  2. index.tsx - 3회
  3. types.ts - 2회

📈 개선 추세
  이번 시간: 92.1% ✅
  오늘: 개선 중 ↑
```

## 🔧 설정

### .claude/settings.local.json

```json
{
  "hooks": {
    "beforeEdit": "npm run check:pre-edit",
    "afterEdit": "npm run check:post-edit",
    "onError": "node .claude/watchdog/error-handler.js"
  },
  "watchdog": {
    "enabled": true,
    "realtime": true,
    "autoFix": false,
    "notificationLevel": "all"
  }
}
```

## 📋 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run watch:conventions` | 실시간 감시 시작 |
| `npm run analyze:patterns` | 패턴 분석 실행 |
| `npm run check:pre-edit [file]` | 수정 전 체크 |
| `npm run check:post-edit [file]` | 수정 후 검증 |

## 📊 성공 지표

- **반복 실수**: 0회/월 (목표)
- **any 타입**: 0개 (목표)
- **빌드 성공률**: 98% 이상
- **코드 리뷰 통과율**: 95% 이상

## 🐛 문제 해결

### 감시 시스템이 시작되지 않음
```bash
# 권한 확인
chmod +x .claude/watchdog/implementation-details.js

# Node 버전 확인 (16+ 필요)
node --version
```

### 알림이 표시되지 않음
- Windows: 알림 센터 설정 확인
- Mac: 시스템 환경설정 > 알림 확인
- Linux: libnotify 설치 필요

### 성능 문제
```javascript
// .claude/watchdog/config.js
module.exports = {
  ignore: ['node_modules', '.next', 'dist'],
  throttle: 500, // ms
  maxFiles: 1000
};
```

## 📚 참고 문서

- [종합 분석 보고서](./ANALYSIS_REPORT.md)
- [구현 상세 코드](./implementation-details.js)
- [프로젝트 문서](/docs/CONTEXT_BRIDGE.md)

## 📝 라이센스

Dhacle 프로젝트 내부용

---

*개발자의 생산성 향상을 위한 실수 방지 시스템*