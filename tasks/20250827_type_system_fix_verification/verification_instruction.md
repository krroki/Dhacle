# 🔍 타입 시스템 복구 검증 지시서 - 새 작업

**명령어**: `/sc:analyze --ultrathink --seq --c7 --validate --evidence`  
**작업명**: "타입 시스템 복구 완료 검증"

---

## 📁 Step 1: 검증 작업용 새 Task 폴더 생성

```bash
# 새로운 검증 작업 폴더 생성 (필수!)
mkdir -p tasks/20250827_type_system_fix_verification
cd tasks/20250827_type_system_fix_verification

# 검증 지시서 작성
echo "검증 작업 시작: $(date)" > verification_log.md
```

---

## ⚠️ Step 2: 필수 준비사항

```bash
# 1. 포트 정리
netstat -ano | findstr :300
taskkill /F /PID [프로세스ID]

# 2. 이전 작업 결과물 확인
ls -la tasks/20250827_type_system_fix/
# instruction_v3_e2e.md가 있는지만 확인 (작업 완료 주장)

# 3. Git 상태로 실제 변경 확인
git status
git diff --stat

# 4. 프로젝트 규약 확인
cat docs/CLAUDE.md | head -50
cat docs/CONTEXT_BRIDGE.md | grep "반복 실수"
```

---

## 🔍 Phase 0: 작업 완료 주장 검증

```bash
# 주장: "instruction_v3_e2e.md 를 수행했다"
# 검증: 실제로 수행했는지 확인

echo "=== 작업 수행 증거 찾기 ==="
# 1. 타입 파일 변경 확인
git diff src/types/index.ts

# 2. API 라우트 변경 확인  
git diff src/app/api/admin/verify-cafe/route.ts
git diff src/app/api/user/naver-cafe/route.ts

# 3. 컴포넌트 변경 확인
git diff src/components/features/tools/youtube-lens/AlertRules.tsx

# 4. 프로필 페이지 변경 확인
git diff src/app/mypage/profile/page.tsx

# ❌ 변경사항 없음 = 작업 미수행
# ✅ 변경사항 있음 = Phase 1 검증 진행
```

---

## 📂 Phase 1 검증: Tables 제네릭 타입 실제 적용

### 1.1 타입 시스템 변경 확인
```bash
# src/types/index.ts 검사
cat src/types/index.ts | head -20

# 필수 확인 사항:
# 1. Tables, TablesInsert, TablesUpdate import
# 2. DBUser = Tables<'users'> 형태
# 3. Database['public']['Tables'] 패턴 제거

echo "=== Phase 1 검증 ==="
echo "[ ] Tables 제네릭 import 있음"
echo "[ ] 모든 타입이 Tables<> 사용"
echo "[ ] 구식 패턴 완전 제거"
```

### 1.2 TypeScript 컴파일 확인
```bash
# 타입 에러 상태
npm run types:check 2>&1 | tee phase1_typecheck.txt
ERROR_COUNT=$(grep "error TS" phase1_typecheck.txt | wc -l)
echo "TypeScript 에러: $ERROR_COUNT 개"

# ❌ 15개 이상 = Phase 1 미완료
# ✅ 15개 미만 = 진행
```

### 1.3 실제 작동 테스트
```bash
# 개발 서버 실행
npm run dev

# 브라우저 테스트
echo "localhost:3000 접속"
echo "[ ] 페이지 로드 성공"
echo "[ ] Console 에러 확인 (F12)"
echo "[ ] Network 탭 실패 요청 확인"
```

---

## 📂 Phase 2 검증: profiles View vs users Table 해결

### 2.1 코드 변경 확인
```bash
# API Route 검사
grep -n "from('users')" src/app/api/admin/verify-cafe/route.ts
grep -n "from('profiles')" src/app/api/admin/verify-cafe/route.ts

# ❌ profiles 사용 = 미수정
# ✅ users 직접 조회 = 수정됨
```

### 2.2 API 실제 테스트
```bash
# 테스트 로그인 후
curl -X GET "http://localhost:3000/api/admin/verify-cafe" \
  -H "Cookie: [세션쿠키]" \
  -v 2>&1 | tee api_test.txt

# 응답 확인
echo "[ ] 200 OK"
echo "[ ] naver_cafe 필드 포함"
echo "[ ] 에러 없음"
```

### 2.3 프로필 페이지 테스트
```bash
echo "=== 프로필 페이지 실제 테스트 ==="
echo "1. 테스트 로그인"
echo "2. /mypage/profile 접속"
echo "3. 확인사항:"
echo "   [ ] 카페 URL 표시됨"
echo "   [ ] 모든 필드 정상"
echo "   [ ] Console 에러 0개"
```

---

## 📂 Phase 3 검증: AlertRules 컴포넌트

### 3.1 타입 확인
```bash
# AlertRules.tsx 검사
grep -n "Tables<'alert_rules'>" src/components/features/tools/youtube-lens/AlertRules.tsx
grep -n "yl_alert_rules" src/components/features/tools/youtube-lens/AlertRules.tsx

# ✅ Tables<'alert_rules'> 사용
# ❌ yl_ prefix 있음 = 잘못됨
```

### 3.2 YouTube Lens 실제 테스트
```bash
echo "=== YouTube Lens 실제 작동 테스트 ==="
echo "1. YouTube Lens 페이지 접속"
echo "2. 알림 규칙 생성 클릭"
echo "3. 규칙 생성 완료"
echo "4. 확인사항:"
echo "   [ ] 규칙 목록에 추가됨"
echo "   [ ] 수정 가능"
echo "   [ ] 삭제 가능"
echo "   [ ] Console 에러 0개"
```

---

## 📂 Phase 4 검증: any 타입 완전 제거

```bash
# any 타입 철저히 검색
echo "=== any 타입 검색 중... ==="
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | grep -v "//" | grep -v "test" > any_types.txt
grep -r "as any" src/ --include="*.ts" --include="*.tsx" | grep -v "//" | grep -v "test" >> any_types.txt
grep -r "<any>" src/ --include="*.ts" --include="*.tsx" | grep -v "//" | grep -v "test" >> any_types.txt

ANY_COUNT=$(cat any_types.txt | wc -l)
echo "발견된 any 타입: $ANY_COUNT 개"

if [ $ANY_COUNT -gt 0 ]; then
  echo "❌ any 타입 발견! 위치:"
  cat any_types.txt
  echo "Phase 4 재작업 필요"
fi
```

---

## 📂 Phase 5 검증: 테스트 작성 확인

```bash
# 테스트 파일 존재 확인
echo "=== 테스트 파일 검증 ==="
ls -la src/components/features/tools/youtube-lens/*.test.tsx 2>/dev/null || echo "❌ AlertRules 테스트 없음"
ls -la src/app/api/admin/verify-cafe/*.test.ts 2>/dev/null || echo "❌ API 테스트 없음"
ls -la e2e/*type*.spec.ts 2>/dev/null || echo "❌ E2E 테스트 없음"

# 테스트 실행 (있는 경우)
npm run test 2>&1 | tee test_result.txt
```

---

## 🎬 최종 E2E 시나리오 검증

```bash
echo "=== 전체 플로우 실제 테스트 ==="
echo ""
echo "시나리오:"
echo "1. localhost:3000 접속"
echo "2. 🧪 테스트 로그인 클릭"
echo "3. 로그인 성공 확인"
echo "4. /mypage/profile 이동"
echo "5. 프로필 정보 확인"
echo "6. YouTube Lens 이동"
echo "7. 알림 규칙 생성"
echo "8. 생성된 규칙 확인"
echo "9. 페이지 새로고침"
echo "10. 데이터 유지 확인"
echo ""
echo "각 단계 통과 여부:"
echo "[ ] 1. 메인 페이지 로드"
echo "[ ] 2. 테스트 로그인 버튼 표시"
echo "[ ] 3. 로그인 성공"
echo "[ ] 4. 프로필 페이지 접근"
echo "[ ] 5. 카페 정보 표시"
echo "[ ] 6. YouTube Lens 접근"
echo "[ ] 7. 규칙 생성 가능"
echo "[ ] 8. 규칙 목록 표시"
echo "[ ] 9. 새로고침 정상"
echo "[ ] 10. 데이터 유지됨"
echo ""
echo "Console 에러: [ ] 개"
```

---

## ✅ 최종 판정

```bash
# 검증 결과 기록
cat > tasks/20250827_type_system_fix_verification/final_result.md << EOF
# 타입 시스템 복구 검증 결과

## 검증 정보
- 날짜: $(date)
- 수행 명령: /sc:analyze --ultrathink --seq --c7 --validate --evidence
- 원본 작업: tasks/20250827_type_system_fix/instruction_v3_e2e.md

## 검증 결과
### TypeScript
- 에러 개수: [X]개
- any 타입: [X]개

### 실제 작동
- 로그인: [✅/❌]
- 프로필: [✅/❌]
- YouTube Lens: [✅/❌]
- API: [✅/❌]

### 테스트
- 테스트 파일: [있음/없음]
- 테스트 통과: [✅/❌]

## 최종 판정
[합격/불합격]

## 재작업 필요 항목
- [ ] Phase X: [구체적 문제]
EOF

echo "검증 완료. 결과는 final_result.md 참조"
```

---

## 🚨 불합격 시 재작업 지시

```bash
# 재작업 명령어
/sc:implement --e2e --validate --think-hard --seq
"타입 시스템 복구 재작업 - [실패한 Phase]"

# 재작업 Task 폴더
mkdir -p tasks/20250827_type_system_fix_rework
cd tasks/20250827_type_system_fix_rework

# instruction_v3_e2e.md의 해당 Phase만 다시 수행
```

---

## 📊 검증 채점표

| 항목 | 점수 | 획득 |
|------|------|------|
| TypeScript 에러 0개 | 20 | [ ] |
| any 타입 0개 | 20 | [ ] |
| 로그인 작동 | 10 | [ ] |
| 프로필 작동 | 10 | [ ] |
| YouTube Lens 작동 | 10 | [ ] |
| API 정상 | 10 | [ ] |
| Console 클린 | 10 | [ ] |
| 테스트 존재 | 10 | [ ] |
| **합계** | 100 | [ ] |

**합격선: 80점 이상**

---

*검증 철학: 실제 작동하지 않으면 작업 완료가 아니다*