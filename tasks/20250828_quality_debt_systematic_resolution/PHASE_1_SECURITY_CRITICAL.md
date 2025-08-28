/sc:implement --seq --validate --evidence --no-speculation
"Phase 1: 보안 위험 해결 - API Routes 세션 체크 누락 해결 - 30분 이내 완료"

# Phase 1/3: 보안 위험 해결

⚠️ **절대 준수사항**
- [ ] 추측 금지 - 모든 것을 확인 후 진행
- [ ] 임시방편 금지 - TODO, any, 주석처리 절대 금지
- [ ] 테스트 필수 - 작동 확인 없이 완료 보고 금지

## 📍 현재 상태 확인 (필수 실행)

### 파일 존재 확인

```bash
# API Routes 전체 목록 확인 (추측 금지)
find src/app/api -name "route.ts" -type f

# 세션 체크 누락 API 식별
find src/app/api -name "route.ts" -exec grep -L "getUser()" {} \; > missing-auth-routes.txt

# 누락된 routes 개수 확인
wc -l missing-auth-routes.txt
```

### 현재 구현 확인

```bash
# 표준 인증 패턴 확인 (기존 올바른 패턴)
grep -A 10 -B 5 "getUser()" src/app/api/user/profile/route.ts

# 세션 체크 없는 보호되어야 할 API 확인
cat missing-auth-routes.txt | head -5
```

### 의존성 확인

```bash
# Supabase 클라이언트 import 패턴 확인
grep -r "createSupabaseRouteHandlerClient" src/app/api/ --include="*.ts" | head -3

# 표준 에러 응답 패턴 확인  
grep -r "User not authenticated" src/app/api/ --include="*.ts" | head -3
```

❌ **확인 실패 시** → 즉시 중단 및 보고

## 🔧 수정 작업 (정확한 위치)

### 🚨 강제 체크포인트 CP1: 시작 전
- [ ] missing-auth-routes.txt 파일 생성 확인
- [ ] 표준 인증 패턴 파악 완료
- [ ] 수정 대상 API 우선순위 결정 (최대 5개)

### 우선순위 API Routes 수정

#### 파일 1: src/app/api/certificates/route.ts
**현재 상태 확인**
```bash
cat -n src/app/api/certificates/route.ts | sed -n '1,30p'
```

**라인 19-25 수정 예상 (실제 확인 후 수정)**
```typescript
// 현재 코드 (확인 후 정확히 이 코드여야 함)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 📍 여기에 세션 체크 누락 - 추가 필요

// 수정 후 (정확히 이렇게 변경)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 🔴 필수: 세션 체크 추가
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
```

**수정 이유**: 사용자가 인증서 목록을 조회할 때 로그인된 사용자만 접근 가능하도록

#### 파일 2: src/app/api/revenue-proof/route.ts
**현재 상태 확인**
```bash
cat -n src/app/api/revenue-proof/route.ts | sed -n '1,30p'
```

**세션 체크 패턴 추가 (정확한 라인은 파일 확인 후 결정)**

⚠️ **수정 금지 사항**
- any 타입 사용 → 타입 오류 발생 시 정확한 타입 찾기
- TODO 주석 → 완전히 구현하거나 삭제
- try-catch로 에러 숨기기 → 근본 원인 해결

## 🔍 검증 단계 (필수)

### 🚨 강제 체크포인트 CP2: 수정 중
- [ ] 정확한 라인 번호 명시
- [ ] any 타입 0개
- [ ] TODO 주석 0개
- [ ] 세션 체크 패턴 정확히 적용

### 1. 컴파일 검증
```bash
# 타입 체크 (에러 0개 필수)
npm run types:check
# 실패 시 → 수정 단계로 돌아가기

# 빌드 확인  
npm run build
# 실패 시 → 에러 메시지 기록 후 수정
```

### 2. 실제 동작 검증
```bash
# 개발 서버 실행
npm run dev
```

**브라우저 테스트 체크리스트**
- [ ] http://localhost:3000 접속
- [ ] 로그아웃 상태에서 /api/certificates 직접 호출 → 401 응답 확인
- [ ] 테스트 로그인 후 /api/certificates 호출 → 200 응답 확인
- [ ] Console 에러 0개 확인 (F12)
- [ ] Network 탭에서 인증 헤더 확인

### 3. 데이터 검증
```bash
# API 응답 구조 확인
curl -X GET http://localhost:3000/api/certificates

# 로그인 상태에서 API 호출 테스트
# (개발자 도구 Network 탭에서 Bearer token 복사 후 테스트)
```

### 🚨 강제 체크포인트 CP3: 수정 후
- [ ] npm run types:check 통과
- [ ] npm run build 성공
- [ ] 브라우저 실제 테스트 완료
- [ ] 인증/비인증 시나리오 모두 확인

❌ **검증 실패** → Phase 실패 보고 및 중단
✅ **검증 성공** → Phase 2 진행 가능

## ✅ Phase 1 완료 조건

### 필수 (하나라도 실패 시 미완료)
- [ ] 컴파일 에러 0개
- [ ] 런타임 에러 0개  
- [ ] 보안 경고 80개 → 40개 이하 감소 확인
- [ ] Console 에러 0개
- [ ] 인증/비인증 시나리오 정상 동작

### 증거 수집
- 스크린샷: API 401/200 응답 화면
- 로그: 세션 체크 동작 로그
- 검증: `npm run verify:security` 실행 결과

### 성과 측정
```bash
# Phase 1 완료 후 보안 경고 수 측정
npm run verify:security 2>&1 | grep -o '[0-9]\+ security warnings' | grep -o '[0-9]\+'

# 목표: 80개 → 40개 이하
```

### 다음 Phase 진행 가능 여부
- ✅ 모든 필수 조건 충족 → Phase 2 진행
- ❌ 조건 미충족 → 수정 후 재검증

## ⛔ 절대 금지 (하나라도 위반 시 STOP)

1. **추측 금지**
   - ❌ "아마 이 파일일 것이다"
   - ❌ "이 패턴을 쓸 것 같다"
   - ✅ grep/cat으로 확인 후 진행

2. **임시방편 금지**
   - ❌ // TODO: 나중에 세션 체크 추가
   - ❌ as any
   - ❌ // @ts-ignore
   - ✅ 완전히 해결하거나 보고

3. **검증 생략 금지**
   - ❌ "빌드 됐으니 될 거야"
   - ❌ "타입 에러 없으니 OK"  
   - ✅ 브라우저에서 실제 API 호출 테스트

4. **대충 넘어가기 금지**
   - ❌ 에러 나도 다음 작업
   - ❌ 일부만 되도 완료
   - ✅ 100% 작동 확인 후 진행

**하나라도 실패 → 다음 단계 진행 불가**