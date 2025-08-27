/sc:implement --e2e --validate 
"Dhacle 안정적 사이트 구현 - E2E 작동 강제 버전"

# Dhacle E2E 구현 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 🎬 사용자 시나리오 (필수)
1. 사용자가 localhost:3000 접속
2. 모든 기능 실제 클릭 테스트
3. 작동 확인 → 다음 단계
4. 실패 시 → 즉시 수정 (TODO 금지)

## 🔥 핵심 원칙
**"클릭했을 때 작동하지 않으면 완료가 아니다"**

## ⚠️ 필수 사항
1. **로그인 방법**: localhost에서 "🧪 테스트 로그인" 버튼 사용
2. **포트 관리**: 테스트 끝나면 반드시 Ctrl+C로 서버 종료
3. **프로세스 정리**: 3000-3010 포트 확인 후 정리

---

## Phase 0: 현재 상태 파악

```bash
# 1. DB Truth 확인 (가장 중요!)
npm run types:generate
git diff src/types/database.generated.ts

# 2. 실제 상황 파악
npm run dev
# localhost:3000 접속

# 3. 실제로 클릭해보기
- 어떤 버튼이 작동하는가?
- 어떤 기능이 안 되는가?
- Console 에러는 무엇인가?
```

### 현재 문제점 (41개 TODO)
```bash
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | wc -l
# 결과: 41개

# 타입 에러 확인
npm run types:check 2>&1 | grep "error TS" | wc -l
# 결과: 15개+
```

### 우선순위 
1. DB 스키마와 코드 불일치 (profiles vs users)
2. 타입 에러로 빌드 실패
3. TODO로 기능 미구현
4. API Route 미완성

---

## 📂 Phase별 E2E 구현

### Phase 1: DB Truth & 타입 에러 (4시간)

#### 🎬 사용자 시나리오
```
1. localhost:3000 접속 → 500 에러
2. Console → "profiles.naver_cafe_member_url" 에러
3. DB 확인 → 실제는 "cafe_member_url"
4. 코드 수정 → 다시 테스트 → 작동!
```

#### 문제 파악
```bash
# profiles vs users 혼란
grep -n "naver_cafe_member_url" src/ --include="*.ts" --include="*.tsx"
# 5개 파일에서 잘못된 필드명 사용 중
```

#### 수정
```typescript
// ❌ 잘못된 코드 (추측)
profile.naver_cafe_member_url

// ✅ DB 확인 후 수정
profile.cafe_member_url
```

#### 검증
```bash
npm run dev
# localhost:3000 접속
# Console 에러 0개 확인
```

---

### Phase 2: 인증 TODO 5개 (3시간)

#### 🎬 사용자 시나리오
```
1. "로그인" 버튼 클릭 → 카카오 로그인
2. /mypage/profile 접속 → 프로필 표시
3. "네이버 카페 인증" 클릭
4. URL & 닉네임 입력 → "인증 요청"
5. DB 저장 확인 → 성공!
```

#### 현재 문제
```typescript
// src/app/api/user/naver-cafe/route.ts
export async function POST(request: NextRequest) {
  // TODO: Implement Naver Cafe verification
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
```

#### 해결
```typescript
// 실제 구현 (TODO 제거)
export async function POST(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { cafeMemberUrl, cafeNickname } = await request.json();
  
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      cafe_member_url: cafeMemberUrl,
      naver_cafe_nickname: cafeNickname,
      naver_cafe_verified: false
    })
    .eq('id', user.id);
    
  if (error) throw error;
  return NextResponse.json({ success: true });
}
```

#### 검증
```bash
# 브라우저에서 직접 테스트
1. /mypage/profile 접속
2. 네이버 카페 인증 클릭
3. 폼 입력 & 제출
4. Network 탭 → 200 OK
5. DB 확인 → 데이터 저장됨
```

---

### Phase 3: 프로필 TODO 8개 (4시간)

#### 🎬 사용자 시나리오
```
1. /mypage/profile → "편집" 클릭
2. 각 필드 수정 → "저장"
3. "프로필이 업데이트되었습니다" 토스트
4. 새로고침 → 데이터 유지 확인
```

#### 문제 & 해결
각 TODO를 하나씩:
1. 프로필 이미지 업로드 → Supabase Storage 연동
2. 랜덤 닉네임 생성 → API 구현
3. 작업 유형 선택 → Dropdown 구현
... (8개 TODO 모두 해결)

---

### Phase 4: YouTube Lens TODO 10개 (5시간)

#### 🎬 사용자 시나리오
```
1. /tools/youtube-lens 접속
2. "프로그래밍" 검색 → 결과 표시
3. 채널 클릭 → 상세 정보
4. "알림 설정" → 규칙 추가
5. DB 저장 & 작동 확인
```

#### 핵심 TODO
- 검색 API 구현
- 채널 상세 정보 표시
- 알림 규칙 CRUD
- 즐겨찾기 기능
- 실시간 업데이트

---

### Phase 5: 결제 & 나머지 TODO (8시간)

#### 🎬 결제 시나리오
```
1. /pricing → 상품 선택
2. 쿠폰 "WELCOME50" 적용
3. 테스트 카드 입력
4. 결제 완료 → 주문 확인
```

#### 🎬 수익 인증 시나리오
```
1. /revenue-proof/create 접속
2. 제목 & 금액 입력
3. 이미지 업로드
4. 저장 → 공유 링크 생성
```

---

## ⚡ 실제 작동 검증 체크리스트

```markdown
## 필수 확인 사항
### 각 Phase 완료 시
- [ ] npm run dev 실행
- [ ] localhost:3000 접속
- [ ] 실제 기능 클릭 테스트
- [ ] Console 에러 0개
- [ ] Network 200/201 응답
- [ ] DB 데이터 저장 확인

### 절대 금지
- [ ] TODO 주석 남기기
- [ ] any 타입 사용
- [ ] 빈 배열/null 반환
- [ ] 테스트 없이 "완료"
```

---

## 🚫 절대 규칙

```markdown
## ⛔ 금지 사항
1. 타입 에러만 고치고 "완료" → ❌
2. 컴파일 성공 = 완료 → ❌
3. TODO 주석 남기기 → ❌
4. 실제 테스트 없이 커밋 → ❌

## ✅ 필수 사항
1. 실제 브라우저에서 테스트
2. 사용자 시나리오 완주
3. Console 에러 0개
4. Network 정상 응답
```

---

## 📊 진짜 성공 기준

```markdown
## 완료의 정의

### ❌ 이것은 완료가 아님
- TypeScript 에러 0개
- 빌드 성공
- 테스트 통과

### ✅ 이것이 진짜 완료
- 사용자가 실제로 로그인 가능
- 결제가 실제로 처리됨
- 데이터가 실제로 저장됨
- 새로고침 후에도 작동
```

---

## 🔄 문제 해결 프로세스

```markdown
## 에러 발생 시

1. **증상 수집**
   - Console 에러 전체
   - Network 실패 내용
   - 화면 상태

2. **원인 분석**
   - DB 테이블 있나?
   - API Route 구현됐나?
   - 환경변수 설정됐나?

3. **수정 & 재시도**
   - 근본 원인 해결
   - 다시 테스트
   - 작동할 때까지 반복
```

---

## 📝 일일 진행 체크

### 시작 시
```bash
# 1. 이전 프로세스 정리
# Windows:
netstat -ano | findstr :3000
taskkill /F /PID [프로세스ID]

# 2. DB Truth 확인
npm run types:generate

# 3. TODO 개수 확인  
grep -r "TODO" src/ | wc -l

# 4. 실제 작동 테스트
npm run dev
# 브라우저로 직접 확인!
```

### 종료 시
```bash
# 🚨 필수: 서버 종료
Ctrl + C

# 포트 확인 및 정리
netstat -ano | findstr :300
```
- 해결한 TODO: [목록]
- 작동하는 기능: [목록]
- 남은 작업: [목록]

---

## 🎯 최종 목표

**41개 TODO → 0개**
**타입 에러 15개 → 0개**
**작동하는 기능 0% → 100%**

실제 사용자가 모든 기능을 사용할 수 있는 안정적인 사이트

---

*E2E 중심 | 실제 작동 | 사용자 경험 최우선*