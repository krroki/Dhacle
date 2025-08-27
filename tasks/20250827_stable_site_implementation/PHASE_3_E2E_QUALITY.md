/sc:analyze --seq --validate --ultrathink --persona-qa --playwright
"Phase 3: E2E 품질 보증 - 전체 사용자 워크플로우 검증 및 최적화"

# Phase 3: E2E 품질 보증

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인
- 실제 사용자 시나리오 중심
- 브라우저에서 직접 테스트
- 성능 측정 및 최적화

## 📌 Phase 정보
- Phase 번호: 3/3
- 예상 시간: 2일
- 우선순위: 🟡 MEDIUM
- 선행 조건: Phase 2 완료 (안정성 확보)
- 목표: **완벽하게 작동하는 프로덕션 레디 사이트**

## 📚 온보딩 섹션

### 작업 관련 경로
- E2E 테스트: `tests/e2e/`
- 성능 최적화: `next.config.js`
- 메트릭: `src/lib/analytics/`
- 모니터링: `src/lib/monitoring/`

### 🔥 실제 코드 패턴 확인
```bash
# 현재 최적화 설정
cat next.config.js | grep -E "images|compress|optimize"

# 번들 크기 확인
npm run build 2>&1 | grep -E "First Load JS|Size"

# Core Web Vitals
npx lighthouse http://localhost:3000 --view
```

## 🎯 Phase 목표
1. 완전한 E2E 워크플로우 검증
2. 성능 최적화 (Core Web Vitals)
3. 접근성 개선
4. 프로덕션 배포 준비

## 📝 작업 내용

### 1️⃣ E2E 테스트 시나리오 구현

#### 회원가입부터 수익 인증까지 전체 플로우
```typescript
// tests/e2e/complete-user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('신규 사용자 전체 플로우', async ({ page }) => {
    // 1. 메인 페이지 방문
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/Dhacle/);
    
    // 2. 회원가입/로그인
    await page.click('text=로그인');
    await page.click('text=카카오로 시작하기');
    // 카카오 OAuth 처리...
    
    // 3. 프로필 설정
    await page.waitForURL('**/mypage/profile');
    await page.fill('input[name="username"]', 'testuser123');
    await page.selectOption('select[name="work_type"]', 'freelancer');
    await page.click('button:text("저장")');
    await expect(page.locator('.toast')).toContainText('프로필이 업데이트되었습니다');
    
    // 4. 네이버 카페 인증
    await page.click('text=네이버 카페 인증');
    await page.fill('input[name="cafeMemberUrl"]', 'https://cafe.naver.com/dinohighclass');
    await page.fill('input[name="cafeNickname"]', 'TestNickname');
    await page.click('button:text("인증 요청")');
    await expect(page.locator('.toast')).toContainText('인증 요청이 접수되었습니다');
    
    // 5. YouTube Lens 사용
    await page.goto('http://localhost:3000/tools/youtube-lens');
    await page.fill('input[placeholder="검색어를 입력하세요"]', '프로그래밍');
    await page.click('button:text("검색")');
    await page.waitForSelector('.search-results');
    const results = await page.locator('.search-result-item').count();
    expect(results).toBeGreaterThan(0);
    
    // 6. 채널 분석
    await page.click('.search-result-item:first-child');
    await page.waitForSelector('.channel-details');
    await expect(page.locator('.subscriber-count')).toBeVisible();
    
    // 7. 알림 규칙 설정
    await page.click('button:text("알림 설정")');
    await page.selectOption('select[name="metric"]', 'subscriber_change');
    await page.fill('input[name="threshold"]', '1000');
    await page.click('button:text("규칙 추가")');
    await expect(page.locator('.alert-rule')).toBeVisible();
    
    // 8. 수익 인증 작성
    await page.goto('http://localhost:3000/revenue-proof/create');
    await page.fill('input[name="title"]', '2025년 8월 수익 인증');
    await page.fill('input[name="amount"]', '5000000');
    await page.fill('textarea[name="description"]', '프리랜서 프로젝트 수익');
    
    // 이미지 업로드
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/proof-image.png');
    
    await page.click('button:text("저장")');
    await page.waitForURL('**/revenue-proof/*');
    await expect(page.locator('h1')).toContainText('2025년 8월 수익 인증');
    
    // 9. 공유 기능
    await page.click('button:text("공유")');
    const shareUrl = await page.locator('.share-url').textContent();
    expect(shareUrl).toContain('http://localhost:3000/revenue-proof/');
    
    // 10. 로그아웃
    await page.click('button[aria-label="프로필 메뉴"]');
    await page.click('text=로그아웃');
    await page.waitForURL('http://localhost:3000');
  });
});
```

### 2️⃣ 성능 최적화

#### Next.js 최적화 설정
```javascript
// next.config.js
const nextConfig = {
  images: {
    domains: ['supabase.co', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  compress: true,
  poweredByHeader: false,
  
  // 번들 분석
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            name: 'lib',
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};
```

#### 이미지 최적화
```typescript
// src/components/common/OptimizedImage.tsx
import Image from 'next/image';

export function OptimizedImage({ 
  src, 
  alt, 
  priority = false,
  ...props 
}: any) {
  return (
    <Image
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      quality={85}
      {...props}
    />
  );
}
```

### 3️⃣ Core Web Vitals 개선

```typescript
// src/lib/analytics/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Google Analytics로 전송
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

export function measureWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

### 4️⃣ 접근성 개선

```typescript
// src/components/common/AccessibleButton.tsx
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  loading?: boolean;
}

export function AccessibleButton({ 
  label, 
  loading, 
  children,
  ...props 
}: Props) {
  return (
    <button
      aria-label={label}
      aria-busy={loading}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <span className="sr-only">로딩 중...</span>
          <LoadingSpinner size="sm" />
        </>
      ) : (
        children
      )}
    </button>
  );
}
```

### 5️⃣ 모니터링 및 에러 트래킹

```typescript
// src/lib/monitoring/error-tracking.ts
export function initErrorTracking() {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      logError({
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      logError({
        message: 'Unhandled Promise Rejection',
        reason: event.reason,
      });
    });
  }
}

async function logError(error: any) {
  try {
    await fetch('/api/analytics/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...error,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    });
  } catch (e) {
    console.error('Failed to log error:', e);
  }
}
```

## ✅ 완료 조건

### 🔴 필수 완료 조건

```bash
# 1. E2E 테스트 통과
- [ ] 회원가입 → 로그아웃 전체 플로우
- [ ] 모든 핵심 기능 테스트 통과
- [ ] 에러 시나리오 테스트 통과

# 2. 성능 기준 달성
- [ ] Lighthouse Performance Score > 80
- [ ] First Contentful Paint < 2초
- [ ] Time to Interactive < 3.5초
- [ ] 번들 크기 < 500KB

# 3. 접근성 기준
- [ ] Lighthouse Accessibility Score > 90
- [ ] 키보드 네비게이션 완벽
- [ ] 스크린 리더 호환

# 4. 프로덕션 준비
- [ ] 환경 변수 설정 완료
- [ ] 에러 트래킹 구현
- [ ] 모니터링 대시보드 설정
```

### 🟡 권장 완료 조건
- [ ] SEO 점수 > 90
- [ ] PWA 지원
- [ ] 오프라인 지원 (일부)

## 📋 최종 체크리스트

### 프로덕션 배포 전 확인
```bash
# 1. 코드 품질
- [ ] TypeScript 에러: 0개
- [ ] ESLint/Biome 경고: 0개
- [ ] 콘솔 로그 제거
- [ ] 개발용 코드 제거

# 2. 보안
- [ ] 환경 변수 안전
- [ ] API Rate Limiting
- [ ] XSS 방지 확인
- [ ] SQL Injection 방지

# 3. 성능
- [ ] 이미지 최적화
- [ ] 코드 스플리팅
- [ ] CDN 설정
- [ ] 캐싱 전략

# 4. 모니터링
- [ ] Google Analytics
- [ ] Error Tracking
- [ ] Performance Monitoring
- [ ] Uptime Monitoring
```

## 🚀 배포 프로세스

```bash
# 1. 최종 테스트
npm run test:e2e
npm run lighthouse

# 2. 빌드
npm run build
npm run start  # 프로덕션 모드 테스트

# 3. 배포
vercel --prod

# 4. 배포 후 확인
- [ ] 프로덕션 URL 접속
- [ ] 모든 기능 테스트
- [ ] 모니터링 대시보드 확인
```

## 📊 성공 지표

```yaml
완료 기준:
  코드_품질:
    타입_에러: 0
    TODO_주석: 0
    any_타입: 0
  
  사용자_경험:
    페이지_로드: < 3초
    응답_시간: < 500ms
    에러_율: < 0.1%
  
  E2E_테스트:
    통과_율: 100%
    커버리지: > 80%
  
  성능_점수:
    Lighthouse: > 80
    Core_Web_Vitals: 통과
```

## 🎉 완료 및 인수 조건

### 프로젝트 완료 선언
```markdown
✅ Dhacle 프로젝트가 "실제로 안정적이게 사용 가능한 사이트"가 되었습니다.

- 모든 기능이 브라우저에서 완벽하게 작동
- 사용자가 에러 없이 전체 워크플로우 수행 가능
- 성능, 접근성, 보안 기준 모두 충족
- 프로덕션 배포 준비 완료
```

---
*Phase 3: E2E 품질 보증*
*목표: 완벽하게 작동하는 프로덕션 레디 사이트*
*최종 상태: 실제로 안정적이게 사용 가능한 사이트 완성*