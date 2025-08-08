# 검증 보고서: TASK-[번호]

## 📋 검증 메타데이터
- **검증 ID**: VER-[번호]
- **작업 ID**: TASK-[번호]
- **검증일시**: [YYYY-MM-DD HH:mm:ss]
- **검증자**: PM AI
- **환경**: [개발/스테이징/프로덕션]
- **검증 방법**: [Manual/Automated/Playwright]

## 🎯 검증 목표
[작업의 주요 목표가 달성되었는지 확인]

## ✅ 검증 항목

### 1. 기능 검증
| 검증 항목 | 예상 결과 | 실제 결과 | 상태 | 증거 |
|---------|----------|----------|------|------|
| [기능1] | [예상 동작] | [실제 동작] | ✅/❌ | [스크린샷 링크] |
| [기능2] | [예상 동작] | [실제 동작] | ✅/❌ | [로그 링크] |

### 2. 성능 검증
| 메트릭 | 기준값 | 측정값 | 상태 | 비고 |
|--------|--------|--------|------|------|
| 응답시간 | <200ms | [측정값]ms | ✅/❌ | |
| 메모리 사용 | <100MB | [측정값]MB | ✅/❌ | |
| CPU 사용률 | <50% | [측정값]% | ✅/❌ | |

### 3. 코드 품질 검증
| 항목 | 결과 | 상태 |
|------|------|------|
| TypeScript 컴파일 | [에러 수] | ✅/❌ |
| 린트 검사 | [경고 수] | ✅/❌ |
| 테스트 커버리지 | [퍼센트]% | ✅/❌ |

## 🔍 Playwright 검증 결과

### 자동화 테스트 스크립트
```javascript
// 실행한 Playwright 테스트 코드
const { chromium } = require('playwright');

async function verifyTask() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 테스트 단계들...
  await page.goto('http://localhost:3000');
  // ...
  
  await browser.close();
}
```

### 테스트 실행 결과
```json
{
  "test_name": "TASK-[번호] Verification",
  "duration": "[시간]ms",
  "status": "passed/failed",
  "steps": [
    {
      "step": "Navigate to application",
      "status": "passed",
      "duration": "[시간]ms"
    }
  ],
  "screenshots": [
    "docs/evidence/screenshots/TASK-[번호]-step1.png"
  ]
}
```

## 📊 증거 자료

### 1. 스크린샷
- **구현 전**: [경로/파일명]
- **구현 후**: [경로/파일명]
- **기능 동작**: [경로/파일명]
- **에러 상황**: [경로/파일명] (있는 경우)

### 2. 로그 파일
- **실행 로그**: `docs/evidence/logs/TASK-[번호]-execution.log`
- **에러 로그**: `docs/evidence/logs/TASK-[번호]-errors.log`
- **성능 로그**: `docs/evidence/logs/TASK-[번호]-performance.log`

### 3. 테스트 결과
- **단위 테스트**: `docs/evidence/test-results/TASK-[번호]-unit.json`
- **통합 테스트**: `docs/evidence/test-results/TASK-[번호]-integration.json`
- **E2E 테스트**: `docs/evidence/test-results/TASK-[번호]-e2e.json`

## 🔬 Zero Trust 검증

### 실제 동작 확인
- [ ] 브라우저에서 직접 기능 테스트 완료
- [ ] 데이터베이스 변경 사항 확인
- [ ] API 응답 검증 완료
- [ ] 사용자 시나리오 테스트 완료

### 외부 검증
- [ ] 웹 표준 준수 확인
- [ ] 보안 취약점 스캔 완료
- [ ] 성능 벤치마크 비교
- [ ] 접근성 테스트 통과

## 🚨 발견된 문제

### 문제 1: [제목]
- **심각도**: [Critical/High/Medium/Low]
- **설명**: [상세 설명]
- **재현 방법**: [단계별 설명]
- **예상 원인**: [분석 내용]
- **권장 해결책**: [제안 사항]

## 📈 검증 메트릭 요약

```json
{
  "verification_id": "VER-[번호]",
  "task_id": "TASK-[번호]",
  "timestamp": "[ISO 8601]",
  "overall_status": "PASS/FAIL",
  "metrics": {
    "functional_tests": {
      "total": 10,
      "passed": 9,
      "failed": 1
    },
    "performance": {
      "response_time_avg": "[숫자]ms",
      "memory_usage": "[숫자]MB",
      "cpu_usage": "[숫자]%"
    },
    "code_quality": {
      "type_errors": 0,
      "lint_warnings": 0,
      "test_coverage": "[숫자]%"
    }
  },
  "evidence_collected": {
    "screenshots": 5,
    "logs": 3,
    "test_results": 3
  }
}
```

## 🎯 최종 판정

### 검증 결과: [✅ 통과 / ❌ 실패 / ⚠️ 조건부 통과]

### 판정 근거
[검증 결과에 대한 상세한 설명과 근거]

### 조건부 통과 사유 (해당시)
- [조건 1]
- [조건 2]

## 📝 후속 조치

### 즉시 필요한 조치
1. [조치 사항 1]
2. [조치 사항 2]

### 권장 개선 사항
1. [개선 사항 1]
2. [개선 사항 2]

### 다음 단계
- [ ] 검증 통과 시: 작업 완료 처리
- [ ] 검증 실패 시: 개발자 AI에게 수정 요청
- [ ] 조건부 통과 시: 조건 충족 후 재검증

## 🔄 재검증 이력

| 차수 | 날짜 | 결과 | 비고 |
|------|------|------|------|
| 1차 | [날짜] | [결과] | [설명] |
| 2차 | [날짜] | [결과] | [설명] |

## 📎 첨부 파일

1. [파일명] - [설명]
2. [파일명] - [설명]

---

### 검증자 서명
- **PM AI**: [서명/ID]
- **검증 완료 시각**: [YYYY-MM-DD HH:mm:ss]
- **검증 도구 버전**: Playwright [버전], SuperClaude [버전]

---

*이 보고서는 Zero Trust 원칙에 따라 작성되었으며, 모든 주장은 증거로 뒷받침됩니다.*