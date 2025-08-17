# 🚨 YouTube Lens 긴급 문제 진단서

> **작성일**: 2025-01-17
> **상태**: 🔴 **CRITICAL** - 프로덕션 완전 실패
> **배포 URL**: https://dhacle.vercel.app
> **영향 범위**: YouTube Lens 전체 기능 작동 불가

---

## 📍 문제 현황

### 프로덕션 환경 에러 목록
1. **인기 Shorts 메뉴**: `Failed to fetch` 에러
2. **채널 폴더 메뉴**: `Failed to fetch` 에러  
3. **컬렉션 메뉴**: `User not authenticated` 에러
4. **새 컬렉션 만들기**: 작동 안 함

### 테스트 방법
```
1. https://dhacle.vercel.app 접속
2. 카카오 로그인 (테스트 계정은 CLAUDE.md 참조)
3. /tools/youtube-lens 페이지 이동
4. 각 메뉴 클릭하여 에러 확인
```

---

## 🔍 근본 원인 분석

### 1. 🚫 핵심 파일 누락: `/src/lib/api-keys.ts`
```typescript
// 이 파일이 완전히 누락됨!
// client-helper.ts:8에서 import하지만 파일이 없음
import { getDecryptedApiKey } from '@/lib/api-keys';
```

**필요한 구현**:
```typescript
// /src/lib/api-keys.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

export async function getDecryptedApiKey(userId: string, serviceName: string): Promise<string | null> {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data } = await supabase
    .from('user_api_keys')
    .select('encrypted_key, encryption_iv')
    .eq('user_id', userId)
    .eq('service_name', serviceName)
    .eq('is_active', true)
    .single();
    
  if (!data) return null;
  
  // AES-256 복호화
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(data.encryption_iv, 'hex')
  );
  
  let decrypted = decipher.update(data.encrypted_key, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export async function encryptApiKey(apiKey: string): Promise<{ encrypted: string; iv: string }> {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex')
  };
}
```

### 2. 🔐 Vercel 환경변수 미설정
**필수 환경변수** (Vercel Dashboard에 추가 필요):
```bash
# 암호화 키 (CRITICAL!)
ENCRYPTION_KEY=fc28f35efe5b90d34e54dfd342e6c3807c2d71d9054adb8dbba1b90a67ca7660

# Supabase Service Role Key (CRITICAL!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbGJ3bnN5dHdieW9uZXVjdW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU3MjUxNiwiZXhwIjoyMDcwMTQ4NTE2fQ.N_96oQRHl7do6WqlX5wyI9znDDhiQpcxsJtJTlYRypY

# Database URL (마이그레이션용)
DATABASE_URL=postgresql://postgres.golbwnsytwbyoneucunx:skanfgprud$4160@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### 3. 🚫 API 엔드포인트 누락: `/api/user/api-keys`
ApiKeySetup 컴포넌트가 호출하는 엔드포인트가 없음

**필요한 구현**: `/src/app/api/user/api-keys/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { encryptApiKey } from '@/lib/api-keys';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { apiKey, serviceName } = await request.json();
    
    // YouTube API 키 검증
    if (serviceName === 'youtube') {
      const testResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=jNQXAC9IVRw&key=${apiKey}`
      );
      
      if (!testResponse.ok) {
        return NextResponse.json({ error: 'Invalid YouTube API key' }, { status: 400 });
      }
    }
    
    // 암호화
    const { encrypted, iv } = await encryptApiKey(apiKey);
    
    // 기존 키 비활성화
    await supabase
      .from('user_api_keys')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('service_name', serviceName);
    
    // 새 키 저장
    const { error } = await supabase
      .from('user_api_keys')
      .insert({
        user_id: user.id,
        service_name: serviceName,
        encrypted_key: encrypted,
        encryption_iv: iv,
        is_active: true
      });
      
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API key save error:', error);
    return NextResponse.json(
      { error: 'Failed to save API key' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data } = await supabase
      .from('user_api_keys')
      .select('service_name, created_at')
      .eq('user_id', user.id)
      .eq('is_active', true);
    
    return NextResponse.json({ keys: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}
```

### 4. 🔴 환경 변수 체크 오류
`/src/lib/youtube/env-check.ts`가 존재하지 않는 환경변수를 체크함:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` ❌ (설정 안 됨)
- `GOOGLE_CLIENT_SECRET` ❌ (설정 안 됨)
- `YOUTUBE_API_KEY` ❌ (사용자별 API 키로 변경됨)

---

## ✅ 해결 방안 (우선순위 순)

### Step 1: 누락 파일 생성
1. `/src/lib/api-keys.ts` 생성 (위 코드 참조)
2. `/src/app/api/user/api-keys/route.ts` 생성 (위 코드 참조)

### Step 2: Vercel 환경변수 설정
```bash
# Vercel Dashboard > Settings > Environment Variables
ENCRYPTION_KEY=fc28f35efe5b90d34e54dfd342e6c3807c2d71d9054adb8dbba1b90a67ca7660
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://...
```

### Step 3: 환경 체크 수정
`/src/lib/youtube/env-check.ts` 수정:
```typescript
export function checkYouTubeServerEnvVars(): EnvCheckResult {
  const serverVars = {
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY, // YouTube API 키 제거
  };
  // ... 나머지 로직
}
```

### Step 4: 빌드 & 배포
```bash
npm run build
git add -A
git commit -m "fix: YouTube Lens 프로덕션 환경 문제 해결"
git push
```

---

## 📋 체크리스트

- [ ] `/src/lib/api-keys.ts` 파일 생성
- [ ] `/src/app/api/user/api-keys/route.ts` 파일 생성
- [ ] Vercel에 `ENCRYPTION_KEY` 환경변수 추가
- [ ] Vercel에 `SUPABASE_SERVICE_ROLE_KEY` 환경변수 추가
- [ ] Vercel에 `DATABASE_URL` 환경변수 추가
- [ ] `env-check.ts` 수정
- [ ] 로컬 빌드 테스트 (`npm run build`)
- [ ] Git 커밋 & 푸시
- [ ] Vercel 배포 확인
- [ ] 프로덕션 테스트

---

## 🧪 테스트 시나리오

### 1. API 키 등록 테스트
1. https://dhacle.vercel.app/tools/youtube-lens 접속
2. 인기 Shorts 클릭
3. API 키 설정 화면 표시 확인
4. Google Cloud Console에서 YouTube Data API v3 키 발급
5. API 키 입력 및 저장
6. 성공 메시지 확인

### 2. 기능 테스트
1. 인기 Shorts 목록 로드 확인
2. 채널 폴더 생성/조회 확인
3. 컬렉션 생성/조회 확인
4. 비디오 저장 기능 확인

---

## ⚠️ 주의사항

1. **보안**: API 키는 반드시 암호화하여 저장
2. **할당량**: YouTube API는 일일 할당량 제한 있음 (10,000 units)
3. **비용**: 사용자별 API 키 사용으로 비용 부담 없음
4. **마이그레이션**: user_api_keys 테이블이 이미 생성되어 있음

---

## 📞 추가 지원

문제 지속 시 확인 사항:
1. Supabase Dashboard에서 user_api_keys 테이블 확인
2. Vercel Functions 로그 확인
3. 브라우저 콘솔 에러 메시지 확인
4. Network 탭에서 API 응답 확인

---

*이 문서는 YouTube Lens 문제 해결을 위한 긴급 진단서입니다.*
*다음 AI는 이 문서의 지침을 따라 문제를 해결해야 합니다.*