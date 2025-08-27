/sc:implement --seq
"Phase 6: 부가 기능 구현 - UX 개선 및 완성도 향상"

# Phase 6: 부가 기능 구현

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📌 Phase 정보
- Phase 번호: 6/6
- 예상 시간: 3-4일
- 우선순위: 🟢 LOW
- 선행 조건: Phase 1-5 완료

## 🎯 Phase 목표
1. 계정 관리 기능 완성
2. 커뮤니케이션 기능 구현
3. 미디어 처리 개선
4. 모니터링 시스템 구축

## 📝 작업 내용

### 1️⃣ 계정 삭제 API 구현

```typescript
// src/app/api/user/delete/route.ts 생성
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  // 사용자 데이터 익명화 (완전 삭제 대신)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      username: `deleted_${user.id.substring(0, 8)}`,
      display_name: '탈퇴한 사용자',
      bio: null,
      avatar_url: null,
      email: null,
      deleted_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  // Auth 계정 삭제
  const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
  
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
```

```typescript
// src/app/mypage/settings/page.tsx 수정
// 44-45번 줄 - 계정 삭제 기능 연결
const handleDeleteAccount = async () => {
  if (!confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    return;
  }

  try {
    const response = await apiDelete('/api/user/delete');
    if (response.success) {
      // 로그아웃 및 홈으로 이동
      await supabase.auth.signOut();
      router.push('/');
    }
  } catch (error) {
    toast({
      title: '계정 삭제 실패',
      variant: 'destructive'
    });
  }
};
```

### 2️⃣ 뉴스레터 구독 기능

```typescript
// src/app/api/newsletter/subscribe/route.ts 생성
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email } = await request.json();
  const supabase = await createSupabaseServerClient();

  // 이메일 중복 체크
  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return NextResponse.json({ 
      message: '이미 구독 중입니다' 
    }, { status: 400 });
  }

  // 구독 추가
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({
      email,
      subscribed_at: new Date().toISOString(),
      is_active: true
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 환영 이메일 발송 (추후 구현)
  // await sendWelcomeEmail(email);

  return NextResponse.json({ 
    success: true,
    message: '뉴스레터 구독이 완료되었습니다'
  });
}
```

### 3️⃣ 검색 기능 구현

```typescript
// src/app/api/search/route.ts 생성
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'all';

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createSupabaseServerClient();
  const results: any = {};

  // 코스 검색
  if (type === 'all' || type === 'courses') {
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, description, thumbnail_url')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10);
    
    results.courses = courses || [];
  }

  // 게시글 검색
  if (type === 'all' || type === 'posts') {
    const { data: posts } = await supabase
      .from('community_posts')
      .select('id, title, content, created_at')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(10);
    
    results.posts = posts || [];
  }

  // 수익 인증 검색
  if (type === 'all' || type === 'revenue') {
    const { data: proofs } = await supabase
      .from('revenue_proofs')
      .select('id, title, description, revenue_amount')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10);
    
    results.revenueProofs = proofs || [];
  }

  // 검색 기록 저장
  await saveSearchHistory(query, type);

  return NextResponse.json(results);
}

async function saveSearchHistory(query: string, type: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from('search_history')
      .insert({
        user_id: user.id,
        query,
        search_type: type,
        searched_at: new Date().toISOString()
      });
  }
}
```

### 4️⃣ 이미지 크롭 기능

```typescript
// src/app/(pages)/revenue-proof/create/page.tsx 수정
// 416번 줄 - 크롭 기능 구현

import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/utils/image-crop';

// 크롭 컴포넌트 추가
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
  setCroppedAreaPixels(croppedAreaPixels);
}, []);

const handleCropSave = async () => {
  try {
    const croppedImage = await getCroppedImg(
      imageUrl,
      croppedAreaPixels
    );
    setFinalImage(croppedImage);
    setShowCropper(false);
  } catch (e) {
    console.error(e);
  }
};
```

### 5️⃣ 에러 리포팅 시스템

```typescript
// src/components/ErrorBoundary.tsx 수정
// 60번 줄 - Sentry 연동

import * as Sentry from '@sentry/nextjs';

componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error('Error caught by boundary:', error, errorInfo);
  
  // Sentry로 에러 전송
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
    extra: errorInfo,
  });
}

// src/components/features/tools/youtube-lens/components/YouTubeLensErrorBoundary.tsx
// 60번 줄 - 에러 리포팅

if (process.env.NODE_ENV === 'production') {
  Sentry.captureException(error, {
    tags: {
      component: 'YouTubeLens',
      action: 'error-boundary',
    },
    extra: {
      props: this.props,
      state: this.state,
    },
  });
}
```

### 6️⃣ Batch Processor 구현

```typescript
// src/lib/youtube/workers/batch-processor.ts 수정
// 248번 줄 - 실제 구현

export class BatchProcessor {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private batchSize = 10;
  private delay = 1000;

  async addToQueue(task: () => Promise<void>) {
    this.queue.push(task);
    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      
      await Promise.all(batch.map(task => 
        task().catch(error => {
          console.error('Batch processing error:', error);
          // 에러 발생 시 재시도 큐에 추가
          this.retryQueue.push(task);
        })
      ));
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }
    
    this.processing = false;
  }

  async processBatch(items: any[], processor: (item: any) => Promise<void>) {
    const tasks = items.map(item => () => processor(item));
    for (const task of tasks) {
      await this.addToQueue(task);
    }
  }
}
```

### 7️⃣ blur placeholder 생성

```typescript
// src/lib/utils/image-blur.ts 생성
export async function generateBlurPlaceholder(imageUrl: string): Promise<string> {
  // Canvas를 사용한 blur placeholder 생성
  const img = new Image();
  img.src = imageUrl;
  
  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 작은 크기로 리사이징
      canvas.width = 10;
      canvas.height = 10;
      
      ctx!.drawImage(img, 0, 0, 10, 10);
      
      // base64 변환
      const placeholder = canvas.toDataURL('image/jpeg', 0.1);
      resolve(placeholder);
    };
  });
}

// src/app/api/revenue-proof/route.ts 수정
// 230번 줄 - blur placeholder 구현
screenshot_blur: await generateBlurPlaceholder(screenshot_url),
```

## ✅ 완료 조건

### 🔴 필수 완료 조건
```bash
# 1. 빌드 성공
npm run build

# 2. 실제 브라우저 테스트
npm run dev
- [ ] 계정 삭제 → 실제 작동 확인
- [ ] 뉴스레터 구독 → DB 저장 확인
- [ ] 검색 기능 → 결과 표시 확인
- [ ] 이미지 크롭 → 편집 가능
- [ ] 에러 발생 → Sentry 전송 확인

# 3. TODO 완전 제거 확인
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | wc -l
# 결과: 0개여야 함
```

### 🟡 권장 완료 조건
- [ ] 이메일 발송 시스템
- [ ] 푸시 알림
- [ ] 실시간 검색 제안

## 🎉 전체 작업 완료

모든 Phase가 완료되면:
1. 62개 TODO 모두 해결
2. 시스템 완전 작동
3. 사용자 경험 개선

## 최종 검증
```bash
# 전체 시스템 검증
npm run verify:all
npm run build
npm run dev

# 프로덕션 배포 준비
npm run build:prod
```