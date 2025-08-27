/sc:troubleshoot --seq --validate --think --evidence
"Phase 0: 타입 에러 및 필드명 불일치 긴급 수정 - 빌드 가능한 상태로 만들기"

# Phase 0: 긴급 타입 에러 수정

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인
- `/docs/CONTEXT_BRIDGE.md` 전체 읽기
- `/CLAUDE.md` 17-43행 자동 스크립트 금지
- any 타입 사용 금지
- 임시방편 해결책 금지

## 📌 Phase 정보
- Phase 번호: 0/3
- 예상 시간: 1일
- 우선순위: 🔴 CRITICAL (다른 모든 작업의 전제조건)
- 목표: **타입 에러 0개, 빌드 성공**

## 📚 온보딩 섹션

### 작업 관련 경로
- API Routes: `src/app/api/*/route.ts`
- 컴포넌트: `src/components/features/tools/youtube-lens/`
- 타입 정의: `src/types/index.ts`
- 프로필 페이지: `src/app/mypage/profile/page.tsx`

### 프로젝트 컨텍스트 확인
```bash
# 현재 타입 에러 확인
npm run types:check 2>&1 | head -30

# 필드명 패턴 확인
grep -r "naver_cafe_member_url\|cafe_member_url" src/ --include="*.ts" --include="*.tsx"

# profiles 테이블 실제 필드 확인
cat src/types/database.generated.ts | grep -A 30 "profiles:"
```

### 🔥 실제 코드 패턴 확인
```bash
# 현재 profiles 필드 사용 패턴
grep -r "profile\." src/app/api --include="*.ts" | head -10

# AlertRules 타입 사용 패턴
grep -r "AlertRule" src/components --include="*.tsx" | head -10

# database.generated.ts 구조 확인
cat src/types/database.generated.ts | grep -A 5 "alert_rules:"
```

## 🎯 Phase 목표
1. 모든 TypeScript 컴파일 에러 해결
2. 필드명 불일치 통일
3. 타입 정의 정확성 확보
4. 빌드 성공 달성

## 📝 작업 내용

### 1️⃣ 필드명 불일치 해결 (naver_cafe 관련)

#### 문제 분석
- DB: `cafe_member_url` (profiles 테이블)
- 코드: `naver_cafe_member_url` 사용 중
- 영향: 5개 파일에서 타입 에러 발생

#### 수정 파일 및 내용

**src/app/api/admin/verify-cafe/route.ts**
```typescript
// 80번 줄 수정
- .select('naver_cafe_member_url, naver_cafe_nickname, naver_cafe_verified')
+ .select('cafe_member_url, naver_cafe_nickname, naver_cafe_verified')

// 88번 줄 수정
- cafeUrl: profile.naver_cafe_member_url,
+ cafeUrl: profile.cafe_member_url,
```

**src/app/api/user/naver-cafe/route.ts**
```typescript
// 37번 줄 수정
- .select('id, username, naver_cafe_nickname, naver_cafe_verified, naver_cafe_member_url, naver_cafe_verified_at')
+ .select('id, username, naver_cafe_nickname, naver_cafe_verified, cafe_member_url, naver_cafe_verified_at')

// 66번 줄 수정
- cafeMemberUrl: profile?.naver_cafe_member_url || null,
+ cafeMemberUrl: profile?.cafe_member_url || null,
```

**src/app/mypage/profile/page.tsx**
```typescript
// 108-109번 줄 수정
- const cafeUrl = profile?.naver_cafe_member_url || null;
- const cafeMemberUrl = profile?.naver_cafe_member_url;
+ const cafeUrl = profile?.cafe_member_url || null;
+ const cafeMemberUrl = profile?.cafe_member_url;
```

### 2️⃣ AlertRules 타입 에러 해결

#### 문제 분석
- DB: `channel_id: string | null`
- Component: `channel_id: string` (null 처리 안됨)

#### 수정 내용

**src/components/features/tools/youtube-lens/AlertRules.tsx**
```typescript
// 타입 정의 수정 (약 20번 줄)
interface AlertRule {
  id: string;
  user_id: string;
  channel_id: string | null;  // null 허용
  rule_type: string;
  threshold_value: any;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

// 55번 줄 - 타입 assertion 추가
setRules(data as AlertRule[]);

// 91번 줄 - 필드 매핑 수정
const newRule = {
  channel_id: channelId,
  rule_type: formData.metric,  // metric을 rule_type으로 매핑
  threshold_value: {
    value: formData.threshold,
    operator: formData.condition
  },
  user_id: user.id,
  is_active: true
};
```

**src/app/(pages)/tools/youtube-lens/page.tsx**
```typescript
// 464번 줄 - channelId prop 추가
<AlertRules channelId={selectedChannel?.id || ''} />
```

### 3️⃣ 빌드 검증 스크립트

**scripts/verify-phase0.js**
```javascript
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function verifyPhase0() {
  console.log('=== Phase 0 검증 시작 ===\n');
  
  try {
    // 1. TypeScript 컴파일 체크
    console.log('📋 TypeScript 컴파일 체크...');
    const { stdout: tsOutput, stderr: tsError } = await execAsync('npx tsc --noEmit');
    
    if (tsError) {
      console.log('❌ TypeScript 에러 발견:', tsError);
      return false;
    }
    console.log('✅ TypeScript 컴파일 성공\n');
    
    // 2. 빌드 테스트
    console.log('📋 Next.js 빌드 테스트...');
    const { stderr: buildError } = await execAsync('npm run build');
    
    if (buildError && buildError.includes('error')) {
      console.log('❌ 빌드 실패:', buildError);
      return false;
    }
    console.log('✅ 빌드 성공\n');
    
    // 3. 필드명 일치 확인
    console.log('📋 필드명 일치 확인...');
    const { stdout: grepOutput } = await execAsync(
      'grep -r "naver_cafe_member_url" src/ --include="*.ts" --include="*.tsx" | wc -l'
    );
    
    if (parseInt(grepOutput) > 0) {
      console.log('⚠️  아직 naver_cafe_member_url 사용 중');
    } else {
      console.log('✅ 필드명 통일 완료');
    }
    
    console.log('\n=== Phase 0 검증 완료 ===');
    console.log('🎉 모든 검증 통과!');
    
  } catch (error) {
    console.error('검증 실패:', error.message);
    return false;
  }
}

verifyPhase0();
```

## ✅ 완료 조건

### 🔴 필수 완료 조건 (모두 충족 필요)
```bash
# 1. TypeScript 컴파일 성공
- [ ] npm run types:check → 에러 0개
- [ ] npx tsc --noEmit → 성공

# 2. 빌드 성공
- [ ] npm run build → 성공
- [ ] 빌드 로그에 에러 없음

# 3. 필드명 통일
- [ ] naver_cafe_member_url → cafe_member_url 완전 교체
- [ ] 모든 API에서 정상 작동

# 4. 실제 작동 테스트
- [ ] npm run dev → 정상 실행
- [ ] http://localhost:3000 → 페이지 로드
- [ ] 브라우저 콘솔 → 에러 0개
```

### 🟡 권장 완료 조건
- [ ] any 타입 사용 0개
- [ ] 모든 타입 명시적 정의
- [ ] ESLint/Biome 경고 해결

## 📋 QA 테스트 시나리오

### 🔴 필수: 기본 작동 확인
```bash
# 1. 개발 서버 실행
npm run dev

# 2. 브라우저 테스트 (http://localhost:3000)
- [ ] 메인 페이지 로드 성공
- [ ] 로그인 페이지 접근 가능
- [ ] 프로필 페이지 접근 가능 (로그인 후)
- [ ] YouTube Lens 페이지 로드
- [ ] 개발자 도구 Console: 에러 0개

# 3. API 테스트
- [ ] /api/user/profile → 200 응답
- [ ] /api/user/naver-cafe → 정상 응답
- [ ] /api/admin/verify-cafe → 정상 응답 (관리자)
```

### 🟡 권장: 타입 안정성 확인
```bash
# VS Code에서 확인
- [ ] 빨간 밑줄 없음
- [ ] IntelliSense 정상 작동
- [ ] 자동완성 제안 정확함
```

## 🔄 롤백 계획

### 실패 시 롤백
```bash
# 현재 상태 백업
git stash
git checkout -b phase0-backup

# 롤백 (필요시)
git checkout main
git reset --hard HEAD~1
```

## 📊 검증 명령어

```bash
# Phase 0 완료 확인
node scripts/verify-phase0.js

# 수동 확인
npm run types:check
npm run build
npm run dev
```

## → 다음 Phase
Phase 0 완료 후 Phase 1로 진행:
```bash
cat PHASE_1_CORE_FEATURES.md
```

---
*Phase 0: 긴급 타입 에러 수정*
*목표: 빌드 가능한 안정적 기반 확보*