/sc:verify --seq --validate --evidence --no-speculation  
"Phase 3: 최종 빌드 검증 - Vercel 배포 준비 완료 확인"

# Phase 3/3: 최종 빌드 검증 및 배포 준비

⚠️ **절대 준수사항**
- [ ] 추측 금지 - 모든 것을 확인 후 진행
- [ ] 임시방편 금지 - TODO, any, 주석처리 절대 금지
- [ ] 테스트 필수 - 작동 확인 없이 완료 보고 금지

---

## 📍 현재 상태 확인 (필수 실행)

### Phase 1, 2 완료 상태 확인
```bash
# Phase 1에서 수정한 파일 확인
grep -n "@ts-expect-error" src/app/test-error/page.tsx
# @ts-ignore가 모두 @ts-expect-error로 변경되었는지 확인

# Phase 2에서 수정한 파일 확인
grep -A 3 "useEffect.*channelId.*loadAlertRules" src/components/features/tools/youtube-lens/AlertRules.tsx
grep -A 5 "const currentPubsub" src/hooks/use-youtube-lens-subscription.ts
```

### 현재 빌드 상태 확인
```bash
# 전체 빌드 테스트
npm run build

# ESLint 전체 검사
npm run lint

# 타입 체크
npm run types:check
```

❌ **확인 실패 시** → 즉시 중단 및 보고

---

## 🔧 최종 검증 작업

### 1. 종합 빌드 테스트
```bash
# Clean 빌드 (캐시 제거)
rm -rf .next
npm run build

# 결과 확인
echo "빌드 결과:"
echo "- ESLint 에러: $(npm run build 2>&1 | grep -c 'Error:')"
echo "- TypeScript 에러: $(npx tsc --noEmit 2>&1 | grep -c 'error')"
echo "- 경고 수: $(npm run build 2>&1 | grep -c 'Warning:')"
```

### 2. 프로덕션 빌드 시뮬레이션
```bash
# Next.js 프로덕션 빌드
npm run build

# 빌드 결과 확인
ls -la .next

# 빌드 성공 여부 확인
echo $? # 0이면 성공, 0이 아니면 실패
```

### 3. Vercel 환경 시뮬레이션
```bash
# Vercel과 동일한 환경에서 빌드 시뮬레이션
NODE_ENV=production npm run build

# 포트 확인 (Vercel과 유사한 환경)
NODE_ENV=production npm start & 
sleep 5
curl -I http://localhost:3000
pkill -f "npm start" # 프로세스 종료
```

---

## 🔍 종합 검증 단계 (필수)

### 1. 빌드 검증
```bash
# 모든 빌드 스크립트 실행
npm run types:check    # TypeScript 에러 0개 확인
npm run lint          # ESLint 에러 0개 확인  
npm run build         # Next.js 빌드 성공 확인

# 검증 결과 출력
echo "=== 빌드 검증 결과 ==="
echo "Types: $(npm run types:check 2>&1 | grep -c 'error' || echo '0') errors"
echo "ESLint: $(npm run lint 2>&1 | grep -c 'Error:' || echo '0') errors" 
echo "Build: $(test -d .next && echo 'SUCCESS' || echo 'FAILED')"
```

### 2. 전체 검증 스크립트 실행
```bash
# 프로젝트 전체 검증
npm run verify:parallel

# 검증 결과 확인
echo "Parallel verification result: $?"
```

### 3. 실제 동작 검증
```bash
# 개발 서버 실행
npm run dev &
sleep 10

# 주요 페이지 응답 확인
curl -f http://localhost:3000 >/dev/null && echo "메인 페이지: OK" || echo "메인 페이지: ERROR"
curl -f http://localhost:3000/test-error >/dev/null && echo "테스트 에러 페이지: OK" || echo "테스트 에러 페이지: ERROR"

# 개발 서버 종료
pkill -f "npm run dev"
```

### 4. 브라우저 최종 테스트
**수동 브라우저 테스트 체크리스트**
- [ ] http://localhost:3000 접속 → 메인 페이지 정상 로딩
- [ ] http://localhost:3000/test-error 접속 → 에러 테스트 페이지 정상 로딩
- [ ] YouTube Lens 페이지 접속 → AlertRules 컴포넌트 정상 렌더링
- [ ] Console 에러 0개 확인 (F12) - 의도된 테스트 에러 제외
- [ ] Network 탭에서 모든 리소스 200 응답 확인
- [ ] 페이지 이동 시 정상 동작 확인

---

## 🚀 Vercel 배포 준비 확인

### Pre-commit Hook 검증
```bash
# Pre-commit hook 시뮬레이션 (있는 경우)
if [ -f ".husky/pre-commit" ]; then
  echo "Pre-commit hook 실행 중..."
  .husky/pre-commit
  echo "Pre-commit hook 결과: $?"
fi

# Git 상태 확인
git status
git diff --name-only
```

### 최종 체크리스트
- [ ] npm run build 성공 (exit code 0)
- [ ] npm run types:check 에러 0개
- [ ] npm run lint 에러 0개  
- [ ] npm run verify:parallel 성공
- [ ] 모든 수정된 파일이 정상 동작
- [ ] Console 에러 0개 (의도된 에러 제외)
- [ ] Pre-commit hook 통과 (있는 경우)

---

## ✅ Phase 3 완료 조건

### 필수 (하나라도 실패 시 미완료)
- [ ] 전체 빌드 프로세스 에러 0개
- [ ] Vercel 배포 준비 완료
- [ ] 모든 수정 사항 정상 작동
- [ ] 실제 사용자 플로우 테스트 성공
- [ ] 성능 저하 없음 확인

### 증거 수집
- 스크린샷: [빌드 성공 로그, 브라우저 정상 동작]
- 로그: [npm run build 완전 성공 결과]
- 메트릭: [빌드 시간, 번들 크기 변화]
- 테스트: [주요 페이지 응답 시간]

### Vercel 배포 가능 여부
- ✅ 모든 필수 조건 충족 → Vercel 배포 가능
- ❌ 조건 미충족 → 이전 Phase 재검토 필요

---

## 🔐 강제 체크포인트 (통과 필수)

### CP1: 시작 전  
- [ ] Phase 1, 2의 모든 수정 사항 적용 확인
- [ ] 현재 빌드 상태 정확히 파악
- [ ] 검증 스크립트 실행 가능 상태 확인

### CP2: 검증 중
- [ ] 각 빌드 단계별 개별 성공 확인
- [ ] 에러 발생 시 즉시 원인 파악
- [ ] 성능 및 기능 정상 동작 확인

### CP3: 완료 전
- [ ] 모든 검증 스크립트 통과
- [ ] 브라우저 수동 테스트 완료
- [ ] Git 커밋 준비 상태 확인
- [ ] Vercel 배포 가능 상태 확인

**하나라도 실패 → 프로젝트 미완료**

---

## 📊 성공 메트릭

### 빌드 성능
- 빌드 시간: ___초 (이전 대비 변화)
- 번들 크기: ___MB (변화 없음 또는 감소)
- TypeScript 컴파일: ___초

### 품질 지표
- ESLint 에러: 0개 (목표 달성)
- TypeScript 에러: 0개 (목표 달성)  
- React Hook 경고: 0개 (목표 달성)
- Console 에러: 0개 (의도된 에러 제외)

### 사용자 경험
- 페이지 로딩 속도: 정상 범위 유지
- 기능 정상 동작: 100% 
- 브라우저 호환성: 유지

---

*Phase 3 완료 시 전체 프로젝트 성공*