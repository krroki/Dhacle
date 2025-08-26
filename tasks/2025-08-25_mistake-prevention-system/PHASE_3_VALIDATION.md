/sc:implement --seq --validate --think
"Phase 3: 시스템 실행 및 검증 - 실제 작동 확인"

# Phase 3: 실행 및 검증

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📌 Phase 정보
- Phase 번호: 3/3
- 예상 시간: 30분
- 우선순위: CRITICAL
- 목표: 시스템 실제 작동 확인 및 성능 측정

## 🔥 실제 코드 패턴 확인

### 시스템 실행 전 현황 체크
```bash
# Step 0-1: 현재 위반 사항 카운트
echo "=== 실행 전 현황 ==="
echo "any 타입 개수: $(grep -r ": any" src/ --include="*.ts" 2>/dev/null | wc -l)"
echo "TODO/FIXME 개수: $(grep -r "TODO\|FIXME" src/ 2>/dev/null | wc -l)"
echo "금지 패턴 개수: $(grep -r "createServerComponentClient" src/ 2>/dev/null | wc -l)"

# Step 0-2: 시스템 준비 상태 확인
echo "=== 시스템 준비 상태 ==="
ls -la .claude/watchdog/implementation-details.js 2>/dev/null && echo "✅ 메인 파일 존재" || echo "❌ 메인 파일 없음"
ls -la .claude/settings.local.json 2>/dev/null && echo "✅ 설정 파일 존재" || echo "❌ 설정 파일 없음"

# Step 0-3: Node 환경 확인
echo "=== Node 환경 ==="
node --version
npm --version
```

## 🎯 Phase 3 목표
1. 시스템 시작 및 정상 작동 확인
2. 13가지 패턴 감지 테스트
3. 성능 측정 및 최적화
4. 실제 사용 시나리오 검증

## 📝 작업 내용

### 3.1 시스템 시작

```bash
# 실시간 감시 시작
npm run watch:conventions
```

**예상 출력**:
```
🛡️ Claude Code 실수 방지 시스템 시작
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  자동 수정: 비활성화 (38개 스크립트 재앙 방지)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛡️ Dhacle 규약 감시 대시보드
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 실시간 통계
  가동 시간: 0시간 0분 5초
  검사한 파일: 0개
  발견된 위반: 0개
  Critical 위반: 0개
  자동 수정: 0개 (비활성화)
```

### 3.2 감지 테스트 시나리오

#### 🔴 필수: Critical 패턴 테스트

##### Test 1: any 타입 감지
```bash
# 테스트 파일 생성
cat > test-any.ts << 'EOF'
// 테스트: any 타입 감지
const badVariable: any = { test: true };
const goodVariable: unknown = { test: true };
EOF

# 알림 확인 → 데스크톱 알림 팝업
# 콘솔 확인 → "🚫 any 타입 사용 금지!" 메시지

# 테스트 파일 제거
rm test-any.ts
```

##### Test 2: TODO/FIXME 감지
```bash
# 테스트 파일 생성
cat > test-todo.ts << 'EOF'
// TODO: 이것은 임시방편입니다
// FIXME: 나중에 수정 필요
function testFunction() {
  return null; // 임시
}
EOF

# 알림 확인 → "🚫 TODO/FIXME는 임시방편!" 메시지

# 테스트 파일 제거
rm test-todo.ts
```

##### Test 3: 자동 스크립트 감지
```bash
# 테스트 스크립트 생성
echo "console.log('자동 변환');" > scripts/fix-test.js

# 알림 확인 → "🚫 자동 변환 스크립트 금지!" 메시지

# 테스트 파일 제거
rm scripts/fix-test.js
```

##### Test 4: API Route 세션 체크
```bash
# 테스트 API Route 생성
mkdir -p src/app/api/test
cat > src/app/api/test/route.ts << 'EOF'
export async function GET() {
  // getUser() 없음 - 위반!
  return Response.json({ test: true });
}
EOF

# 알림 확인 → "🚫 API Route에 getUser() 세션 체크 필수!" 메시지

# 올바른 코드로 수정
cat > src/app/api/test/route.ts << 'EOF'
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return Response.json({ test: true });
}
EOF

# 테스트 파일 제거
rm -rf src/app/api/test
```

#### 🟡 권장: Recurring 패턴 테스트

##### Test 5: 구식 Supabase 패턴
```bash
# 테스트 파일 생성
cat > test-supabase.ts << 'EOF'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// 위 패턴은 구식! createSupabaseServerClient 사용해야 함
EOF

# 알림 확인 → "⚠️ 구식 Supabase 패턴!" 메시지

# 테스트 파일 제거
rm test-supabase.ts
```

##### Test 6: 1→2→1 패턴 감지
```bash
# 파일 생성
echo "const original = 1;" > test-repeat.ts
sleep 1

# 수정
echo "const modified = 2;" > test-repeat.ts
sleep 1

# 원래대로 되돌리기 (1→2→1 패턴)
echo "const original = 1;" > test-repeat.ts

# 알림 확인 → "⚠️ 반복 실수 감지!" 메시지

# 테스트 파일 제거
rm test-repeat.ts
```

### 3.3 성능 측정

#### CPU/메모리 사용률 확인
```bash
# 새 터미널에서 실행
npm run watch:conventions &
WATCHDOG_PID=$!

# 성능 모니터링 (Windows)
powershell -Command "Get-Process -Id $WATCHDOG_PID | Select-Object CPU, WS"

# 성능 모니터링 (Mac/Linux)
top -p $WATCHDOG_PID

# 목표: CPU < 5%, Memory < 100MB
```

#### 응답 시간 측정
```bash
# 파일 변경 시 감지 시간 측정
time (echo "const test: any = 1;" > test-timing.ts && sleep 0.5)

# 목표: < 500ms 이내 감지
rm test-timing.ts
```

### 3.4 실제 사용 시나리오

#### 시나리오 1: 일반 개발 작업
```bash
# 1. 시스템 시작
npm run watch:conventions

# 2. 일반 개발 진행
# - 파일 수정 시 실시간 피드백
# - 위반 사항 즉시 알림
# - 대시보드에서 통계 확인

# 3. pre-commit 체크
npm run check:pre-edit src/app/page.tsx
```

#### 시나리오 2: CI/CD 통합
```bash
# GitHub Actions / Vercel 빌드에 추가
- name: Convention Check
  run: |
    npm run analyze:patterns
    if [ -f .claude/mistakes/violations.json ]; then
      echo "❌ 규약 위반 발견!"
      exit 1
    fi
```

### 3.5 주간 리포트 생성

```bash
# 패턴 분석 실행
npm run analyze:patterns

# 리포트 확인
cat .claude/mistakes/weekly-report.md
```

**리포트 예시**:
```markdown
# 주간 실수 패턴 분석

생성일: 2025-08-25T10:00:00Z

## 📊 통계
- 총 검사 파일: 1,234개
- 발견된 위반: 23개
- Critical: 5개
- High: 10개
- Medium: 8개

## 🔥 핫스팟
1. src/app/api/route.ts - 5회
2. src/components/Button.tsx - 3회

## 📈 개선 추이
- any 타입: 88개 → 45개 (48.9% 감소)
- TODO/FIXME: 23개 → 5개 (78.3% 감소)
```

## ✅ Phase 3 완료 조건

### 🔴 필수 완료 조건 (하나라도 미충족 시 미완료)
```bash
# 1. 시스템 실행
- [ ] npm run watch:conventions → 정상 시작
- [ ] 대시보드 표시 → 5초마다 갱신
- [ ] Ctrl+C → 정상 종료

# 2. 패턴 감지
- [ ] any 타입 → 즉시 감지 ✅
- [ ] TODO/FIXME → 즉시 감지 ✅
- [ ] 자동 스크립트 → 즉시 감지 ✅
- [ ] API Route 세션 → 즉시 감지 ✅
- [ ] 1→2→1 패턴 → 반복 실수 차단 ✅

# 3. 알림 시스템
- [ ] 데스크톱 알림 → 팝업 표시
- [ ] 콘솔 출력 → 색상 구분
- [ ] 로그 파일 → .claude/logs에 저장

# 4. 성능 기준
- [ ] CPU 사용률 < 5%
- [ ] 메모리 사용 < 100MB
- [ ] 감지 시간 < 500ms
```

### 🟡 권장 완료 조건
- [ ] 주간 리포트 생성 성공
- [ ] CI/CD 통합 가능
- [ ] 히스토리 추적 작동

### 🟢 선택 완료 조건
- [ ] 패턴 학습 시스템
- [ ] 커스텀 패턴 추가
- [ ] 팀 공유 설정

## 🔄 트러블슈팅

### 문제: 알림이 표시되지 않음
```bash
# Windows
# 설정 → 시스템 → 알림 → Node.js 허용

# Mac
# 시스템 환경설정 → 알림 → Node 추가

# Linux
sudo apt-get install libnotify-bin
```

### 문제: 프로세스가 종료되지 않음
```bash
# 강제 종료
pkill -f "watch:conventions"
# 또는
ps aux | grep watch:conventions
kill -9 [PID]
```

### 문제: 성능 저하
```bash
# config.json 수정
{
  "throttle": 1000,  // 500 → 1000ms로 증가
  "ignored": [
    "node_modules/**",
    ".next/**",
    "dist/**",
    "coverage/**",  // 추가
    "*.test.ts"     // 추가
  ]
}
```

## 📊 최종 성과 측정

### 실행 전후 비교
```bash
# 실행 전
echo "=== Before ==="
echo "any types: $(grep -r ": any" src/ --include="*.ts" 2>/dev/null | wc -l)"
echo "TODOs: $(grep -r "TODO\|FIXME" src/ 2>/dev/null | wc -l)"

# 시스템 1주일 운영 후
echo "=== After (1 week) ==="
echo "any types: $(grep -r ": any" src/ --include="*.ts" 2>/dev/null | wc -l)"
echo "TODOs: $(grep -r "TODO\|FIXME" src/ 2>/dev/null | wc -l)"
```

### 목표 달성도
| 지표 | 목표 | 현재 | 달성률 |
|------|------|------|---------|
| 반복 실수 | 0회/월 | - | - |
| any 타입 | 0개 | 88개 | 0% |
| 빌드 성공률 | 98% | - | - |
| 38개 스크립트 재발 | 방지 | ✅ | 100% |

## 🎯 최종 확인

```bash
# 전체 시스템 상태
echo "🛡️ Claude Code 실수 방지 시스템 상태"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[ -f .claude/watchdog/implementation-details.js ] && echo "✅ 코어 엔진" || echo "❌ 코어 엔진"
[ -f .claude/settings.local.json ] && echo "✅ 설정 파일" || echo "❌ 설정 파일"
[ -d .claude/mistakes/history ] && echo "✅ 히스토리" || echo "❌ 히스토리"
npm run watchdog:status 2>/dev/null && echo "✅ 실행 준비" || echo "❌ 실행 준비"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "자동 수정: 비활성화 ✅"
echo "38개 스크립트 재앙: 방지 중 ✅"
```

---

## 🏆 프로젝트 완료

**축하합니다! Claude Code 실수 방지 시스템이 성공적으로 구축되었습니다.**

### 달성 성과
- ✅ 13가지 실수 패턴 실시간 감지
- ✅ 1→2→1 반복 실수 차단
- ✅ 38개 스크립트 재앙 영구 방지
- ✅ 실시간 대시보드 및 알림

### 다음 단계
1. 일주일간 시스템 운영
2. 주간 리포트 분석
3. 팀원들과 결과 공유
4. any 타입 0개 달성까지 지속 운영

---

**"다시는 38개 스크립트 재앙이 발생하지 않을 것입니다!"**