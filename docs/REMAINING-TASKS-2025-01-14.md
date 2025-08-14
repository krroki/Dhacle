# 🚀 Dhacle 프로젝트 - 남은 작업 지시서
**작성일**: 2025-01-14  
**프로젝트**: Dhacle (디하클) - YouTube Shorts 크리에이터 교육 플랫폼  
**현재 단계**: Phase 7 완료 (강의 시스템 구현 완료)

---

## 📋 개요

### 프로젝트 상태
- **완료된 작업**: 강의 시스템 전체 구현 (목록, 상세, 비디오 플레이어, 결제, 관리자)
- **기술 스택**: Next.js 15.4.6, React 19.1.1, TypeScript (strict), Supabase, Stripe, shadcn/ui
- **빌드 상태**: ✅ 성공 (ESLint 경고만 존재)

### 남은 작업 범위
1. 환경 설정 및 외부 서비스 연동
2. 기능 보완 및 최적화
3. 테스트 및 배포 준비

---

## 🎯 작업 목록

### 1️⃣ 환경 변수 설정 (Priority: Critical)

**WHAT (무엇을)**
- Stripe, Cloudflare Stream, Supabase 환경 변수 설정
- 로컬 및 프로덕션 환경 분리

**WHY (왜)**
- 현재 하드코딩된 값들을 실제 서비스 키로 교체 필요
- 보안 및 배포 준비

**HOW (어떻게)**

#### 1.1 `.env.local` 파일 생성/수정
```env
# Supabase (이미 설정됨 - 확인만)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (새로 추가)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudflare Stream (새로 추가)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_STREAM_TOKEN=your_stream_token
CLOUDFLARE_CUSTOMER_SUBDOMAIN=customer-xxxxx

# 추가 보안 키
JWT_SECRET_KEY=32자_이상의_랜덤_문자열
ENCRYPTION_KEY=32자_이상의_랜덤_문자열
```

#### 1.2 Vercel 환경 변수 설정
```bash
# Vercel CLI 사용
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# ... 나머지 변수들
```

**예상 소요시간**: 1시간

---

### 2️⃣ Stripe 설정 (Priority: High)

**WHAT (무엇을)**
- Stripe 대시보드 설정
- Webhook 엔드포인트 등록
- 테스트 카드 확인

**WHY (왜)**
- 결제 시스템 실제 작동을 위한 필수 설정

**HOW (어떻게)**

#### 2.1 Stripe Dashboard 설정
1. [Stripe Dashboard](https://dashboard.stripe.com) 로그인
2. 개발자 > API 키에서 키 복사
3. 테스트 모드 활성화 확인

#### 2.2 Webhook 설정
1. 개발자 > Webhooks > 엔드포인트 추가
2. URL: `https://your-domain.com/api/payment/webhook`
3. 이벤트 선택:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Signing secret 복사 → `STRIPE_WEBHOOK_SECRET`

#### 2.3 테스트 카드
```
성공: 4242 4242 4242 4242
실패: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

**예상 소요시간**: 30분

---

### 3️⃣ Cloudflare Stream 설정 (Priority: High)

**WHAT (무엇을)**
- Cloudflare Stream 계정 생성
- 비디오 업로드 API 설정
- HLS 스트리밍 URL 구성

**WHY (왜)**
- 비디오 콘텐츠 스트리밍 및 DRM 보호

**HOW (어떻게)**

#### 3.1 Cloudflare Stream 활성화
1. [Cloudflare Dashboard](https://dash.cloudflare.com) 로그인
2. Stream 탭 > 활성화
3. API 토큰 생성 (Stream:Edit 권한)

#### 3.2 비디오 업로드 API 구현
```typescript
// /app/api/admin/video/upload/route.ts
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STREAM_TOKEN}`,
      },
      body: file
    }
  );
  
  const data = await response.json();
  return NextResponse.json({
    videoId: data.result.uid,
    hlsUrl: `https://${SUBDOMAIN}.cloudflarestream.com/${data.result.uid}/manifest/video.m3u8`
  });
}
```

**예상 소요시간**: 1시간

---

### 4️⃣ 데이터베이스 시드 데이터 (Priority: Medium)

**WHAT (무엇을)**
- 테스트용 강의 데이터 생성
- 샘플 강사 프로필 생성
- 더미 비디오 URL 설정

**WHY (왜)**
- 개발/테스트 환경에서 즉시 확인 가능
- 데모 및 프레젠테이션용

**HOW (어떻게)**

#### 4.1 시드 스크립트 작성
```sql
-- /src/lib/supabase/seeds/001_sample_courses.sql

-- 샘플 강사 추가
INSERT INTO instructor_profiles (display_name, bio, specialty, is_verified)
VALUES 
  ('김쇼츠', 'YouTube Shorts 전문가, 구독자 100만', 'Shorts 알고리즘', true),
  ('이크리에이터', '콘텐츠 기획 전문가', '바이럴 콘텐츠', true);

-- 샘플 강의 추가
INSERT INTO courses (
  title, subtitle, description, instructor_name, 
  price, is_free, status, category, difficulty, 
  student_count, average_rating, review_count
) VALUES 
  (
    'YouTube Shorts 마스터 클래스',
    '30일 만에 10만 구독자 달성하기',
    '쇼츠 알고리즘부터 편집 노하우까지 모든 것을 알려드립니다.',
    '김쇼츠',
    99000, false, 'active', '콘텐츠 제작', 'beginner',
    1234, 4.8, 234
  ),
  (
    '무료 Shorts 입문 가이드',
    '초보자를 위한 기초 과정',
    'YouTube Shorts를 처음 시작하는 분들을 위한 무료 강의입니다.',
    '이크리에이터',
    0, true, 'active', '콘텐츠 제작', 'beginner',
    5678, 4.5, 567
  );

-- 샘플 레슨 추가
INSERT INTO lessons (course_id, title, duration, order_index, is_free)
SELECT 
  c.id,
  '레슨 ' || generate_series(1, 10),
  300 + (random() * 600)::int,
  generate_series(1, 10),
  CASE WHEN generate_series(1, 10) <= 2 THEN true ELSE false END
FROM courses c
WHERE c.title = 'YouTube Shorts 마스터 클래스';
```

#### 4.2 실행 명령어
```bash
npm run db:seed
```

**예상 소요시간**: 30분

---

### 5️⃣ ESLint 경고 해결 (Priority: Low)

**WHAT (무엇을)**
- 빌드 시 발생한 ESLint 경고 해결
- 사용하지 않는 import 제거
- useEffect 의존성 배열 수정

**WHY (왜)**
- 코드 품질 향상
- 잠재적 버그 방지

**HOW (어떻게)**

#### 5.1 자동 수정
```bash
npm run lint:fix
```

#### 5.2 주요 수정 사항
- `@typescript-eslint/no-unused-vars`: 사용하지 않는 변수 제거
- `react-hooks/exhaustive-deps`: useCallback 사용하여 의존성 해결
- `@typescript-eslint/no-explicit-any`: 타입 명시

**예상 소요시간**: 1시간

---

### 6️⃣ 모바일 반응형 테스트 (Priority: Medium)

**WHAT (무엇을)**
- 모바일 뷰포트 테스트
- 터치 인터랙션 확인
- 비디오 플레이어 모바일 최적화

**WHY (왜)**
- 사용자의 60% 이상이 모바일 접속 예상

**HOW (어떻게)**

#### 6.1 Chrome DevTools 테스트
```
- iPhone 12 Pro (390x844)
- Samsung Galaxy S20 (412x915)
- iPad (768x1024)
```

#### 6.2 체크리스트
- [ ] 네비게이션 메뉴 햄버거 동작
- [ ] 강의 카드 터치 스크롤
- [ ] 비디오 플레이어 전체화면
- [ ] 결제 폼 입력 편의성
- [ ] 2칼럼 레이아웃 → 1칼럼 변환

**예상 소요시간**: 2시간

---

### 7️⃣ 성능 최적화 (Priority: Low)

**WHAT (무엇을)**
- 이미지 최적화
- 번들 사이즈 분석
- 캐싱 전략 구현

**WHY (왜)**
- LCP < 2.5s 달성
- 사용자 경험 향상

**HOW (어떻게)**

#### 7.1 Next.js Image 컴포넌트 적용
```typescript
import Image from 'next/image';

// Before
<img src={thumbnail} />

// After
<Image 
  src={thumbnail} 
  width={640} 
  height={360}
  alt={title}
  loading="lazy"
/>
```

#### 7.2 번들 분석
```bash
npm run build:analyze
```

**예상 소요시간**: 2시간

---

### 8️⃣ 배포 준비 (Priority: High)

**WHAT (무엇을)**
- Vercel 프로젝트 연결
- 도메인 설정
- 프로덕션 빌드 테스트

**WHY (왜)**
- 실제 서비스 런칭 준비

**HOW (어떻게)**

#### 8.1 Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

#### 8.2 도메인 연결
1. Vercel Dashboard > Settings > Domains
2. dhacle.com 추가
3. DNS 설정 (A 레코드 또는 CNAME)

#### 8.3 배포 후 체크리스트
- [ ] 환경 변수 확인
- [ ] HTTPS 인증서
- [ ] 404/500 페이지
- [ ] 로봇 차단 (robots.txt)
- [ ] 사이트맵 생성

**예상 소요시간**: 1시간

---

## 📊 작업 우선순위 매트릭스

| 우선순위 | 작업 | 예상 시간 | 의존성 |
|---------|------|----------|--------|
| 🔴 Critical | 환경 변수 설정 | 1시간 | 없음 |
| 🟠 High | Stripe 설정 | 30분 | 환경 변수 |
| 🟠 High | Cloudflare Stream | 1시간 | 환경 변수 |
| 🟠 High | 배포 준비 | 1시간 | 모든 설정 |
| 🟡 Medium | DB 시드 데이터 | 30분 | 없음 |
| 🟡 Medium | 모바일 테스트 | 2시간 | 없음 |
| 🟢 Low | ESLint 해결 | 1시간 | 없음 |
| 🟢 Low | 성능 최적화 | 2시간 | 없음 |

**총 예상 시간**: 9시간 30분

---

## ✅ 완료 확인 체크리스트

### 기능 테스트
- [ ] 회원가입/로그인 (카카오 OAuth)
- [ ] 강의 목록 필터링
- [ ] 강의 상세 페이지 스크롤
- [ ] 무료 강의 시청
- [ ] 유료 강의 결제 (테스트 카드)
- [ ] 쿠폰 적용
- [ ] 비디오 재생 (HLS)
- [ ] 진도 저장
- [ ] 관리자 강의 생성/수정
- [ ] 수료증 발급

### 기술 요구사항
- [ ] TypeScript 에러 0개
- [ ] 빌드 성공
- [ ] Lighthouse 점수 90+
- [ ] 모바일 반응형
- [ ] SEO 메타 태그

### 보안 체크
- [ ] 환경 변수 분리
- [ ] API 키 숨김
- [ ] SQL Injection 방지 (Supabase RLS)
- [ ] XSS 방지 (React 자동)
- [ ] CORS 설정

---

## 📞 지원 및 참고자료

### 공식 문서
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Cloudflare Stream](https://developers.cloudflare.com/stream/)

### 프로젝트 문서
- `/docs/PROJECT.md` - 프로젝트 전체 개요
- `/docs/PROJECT-CODEMAP.md` - 코드 구조 맵
- `/docs/DEVELOPMENT-INSTRUCTION-TEMPLATE.md` - 개발 지침 템플릿

### 문의
- 기술 문의: GitHub Issues
- 긴급 지원: Slack #dhacle-dev

---

**작성자**: Claude AI Assistant  
**검토자**: -  
**최종 수정일**: 2025-01-14

---

## 🎉 축하합니다!

강의 시스템 구현이 성공적으로 완료되었습니다. 위 작업들을 순차적으로 진행하시면 Dhacle 플랫폼을 실제 서비스로 런칭할 수 있습니다.

화이팅! 💪