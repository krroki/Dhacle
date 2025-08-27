/sc:implement --e2e --validate
"Phase 2-5: 나머지 TODO 36개 - 모든 기능 작동"

# Phase 2-5: 모든 기능 E2E 구현

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📊 남은 TODO 현황
```bash
# 전체 TODO 확인
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | wc -l
# Phase 1 완료 후: 36개 남음

# 카테고리별
프로필: 8개
YouTube Lens: 10개  
결제: 8개
기타: 10개
```

---

## Phase 2: 프로필 TODO (8개) - 4시간

### 🎬 사용자 시나리오
1. /mypage/profile → "편집" 클릭
2. 모든 필드 수정 가능
3. 이미지 업로드 → 미리보기
4. "저장" → 성공 토스트
5. 새로고침 → 데이터 유지

### TODO 목록 & 해결

#### 1. 프로필 이미지 업로드
```typescript
// src/app/api/user/upload-avatar/route.ts
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${user.id}/${Date.now()}`, file);
    
  if (error) throw error;
  
  // profiles 테이블 업데이트
  await supabase.from('profiles')
    .update({ avatar_url: data.path })
    .eq('id', user.id);
    
  return NextResponse.json({ url: data.path });
}
```

#### 2. 랜덤 닉네임 생성
```typescript
// src/app/api/user/generate-nickname/route.ts
export async function GET() {
  const adjectives = ['빠른', '용감한', '현명한', '강력한'];
  const nouns = ['사자', '독수리', '호랑이', '용'];
  const number = Math.floor(Math.random() * 9999);
  
  const nickname = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${number}`;
  
  return NextResponse.json({ nickname });
}
```

#### 3-8. 나머지 필드들
- 작업 유형 선택
- 소개글 입력
- 소셜 링크 추가
- 공개/비공개 설정
- 알림 설정
- 테마 설정

### 검증
```bash
# 각 기능 테스트
1. 프로필 편집 페이지 접속
2. 각 필드 수정 → 저장
3. 새로고침 → 데이터 확인
4. DB 확인
```

---

## Phase 3: YouTube Lens TODO (10개) - 5시간

### 🎬 사용자 시나리오
1. /tools/youtube-lens 접속
2. "프로그래밍" 검색 → 결과 표시
3. 채널 클릭 → 상세 정보
4. "알림 설정" → 규칙 추가
5. 즐겨찾기 → ⭐ 표시

### 핵심 TODO & 해결

#### 1. YouTube 검색 API
```typescript
// src/app/api/youtube/search/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  // YouTube API 호출
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=channel&key=${process.env.YOUTUBE_API_KEY}`
  );
  
  const data = await response.json();
  return NextResponse.json(data.items);
}
```

#### 2. 채널 상세 정보
```typescript
// src/app/api/youtube/channel/[id]/route.ts
export async function GET(request: NextRequest, { params }) {
  const channelId = params.id;
  
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`
  );
  
  const data = await response.json();
  return NextResponse.json(data.items[0]);
}
```

#### 3. 알림 규칙 CRUD
```typescript
// src/app/api/youtube-lens/alert-rules/route.ts
export async function POST(request: NextRequest) {
  const user = await requireAuth(request);
  const { channelId, metric, threshold, condition } = await request.json();
  
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('youtube_alert_rules')
    .insert({
      user_id: user.id,
      channel_id: channelId,
      metric_type: metric,
      threshold_value: threshold,
      condition
    });
    
  return NextResponse.json(data);
}
```

#### 4-10. 나머지 기능들
- 즐겨찾기 추가/제거
- 채널 분석 시작
- 메트릭 히스토리
- 대시보드 표시
- 필터링 & 정렬
- CSV 내보내기
- 실시간 업데이트

### 검증
```bash
# 전체 플로우 테스트
1. YouTube Lens 접속
2. 검색 → 채널 선택 → 분석
3. 알림 규칙 추가
4. 즐겨찾기 확인
5. DB 데이터 확인
```

---

## Phase 4: 결제 TODO (8개) - 4시간

### 🎬 사용자 시나리오
1. /pricing → 상품 선택
2. "구매하기" 클릭
3. 쿠폰 코드 입력
4. 결제 정보 입력
5. 결제 완료 → 주문 확인

### 핵심 구현

#### 1. 결제 인텐트 생성
```typescript
// src/app/api/payment/create-intent/route.ts
export async function POST(request: NextRequest) {
  const { amount, currency } = await request.json();
  
  // Stripe/토스페이먼츠 인텐트 생성
  const intent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: { enabled: true }
  });
  
  return NextResponse.json({ clientSecret: intent.client_secret });
}
```

#### 2. 쿠폰 적용
```typescript
// src/app/api/coupons/validate/route.ts
export async function POST(request: NextRequest) {
  const { code } = await request.json();
  
  const supabase = await createSupabaseServerClient();
  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();
    
  if (!coupon) {
    return NextResponse.json({ error: 'Invalid coupon' }, { status: 400 });
  }
  
  return NextResponse.json({ 
    discount: coupon.discount_percentage,
    message: `${coupon.discount_percentage}% 할인 적용`
  });
}
```

### 검증
```bash
# 결제 테스트
1. 상품 선택
2. WELCOME50 쿠폰 적용
3. 테스트 카드: 4242 4242 4242 4242
4. 결제 완료 확인
5. 주문 내역 확인
```

---

## Phase 5: 나머지 TODO (10개) - 4시간

### 🎬 주요 시나리오

#### 수익 인증
```bash
1. /revenue-proof/create 접속
2. 제목: "2025년 8월 수익"
3. 금액: 5,000,000원
4. 이미지 업로드
5. 저장 → 공유 링크 생성
```

#### 다크 모드
```bash
1. 테마 토글 클릭
2. 다크 모드 전환
3. localStorage 저장
4. 새로고침 후 유지
```

#### 알림 센터
```bash
1. 🔔 클릭
2. 알림 목록 표시
3. 읽음 처리
4. 설정 페이지
```

---

## ✅ 전체 완료 조건

### Phase별 TODO
- [ ] Phase 2: 프로필 8개 해결
- [ ] Phase 3: YouTube 10개 해결
- [ ] Phase 4: 결제 8개 해결
- [ ] Phase 5: 기타 10개 해결

### 실제 작동
- [ ] 모든 페이지 에러 없이 로드
- [ ] 모든 버튼 클릭 가능
- [ ] 모든 폼 제출 성공
- [ ] DB 데이터 정확히 저장

### 최종 테스트
```bash
# 신규 사용자 전체 여정
1. 회원가입
2. 프로필 설정
3. 네이버 카페 인증
4. YouTube Lens 사용
5. 유료 기능 구매
6. 수익 인증 작성
7. 로그아웃
```

---

## 📊 성공 기준

```markdown
TODO: 41개 → 0개
타입 에러: 15개 → 0개
작동 기능: 0% → 100%
Console 에러: 많음 → 0개
사용자 만족: 100%
```

---

*Phase 2-5: 모든 기능 구현*
*목표: 실제 사용 가능한 안정적 사이트*
*총 시간: 17시간*