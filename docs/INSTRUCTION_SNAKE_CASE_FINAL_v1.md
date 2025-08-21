# 🎯 Snake Case 마이그레이션 최종 완료 지시서 v1.0

**📌 목적**: Wave 5 이후 남은 117개 TypeScript 오류 해결 및 snake_case 마이그레이션 완전 종료

**🔴 긴급도**: CRITICAL - 프로덕션 배포 차단 중

**⏰ 작성일시**: 2025-08-21

**📊 현재 상태**: Wave 1-5 완료, Session 2 추가 수정 완료, 빌드 실패 (117개 오류)

---

## 🚀 추천 실행 명령어

```bash
# 복잡도: Complex (117개 오류, 다중 작업)
/sc:troubleshoot --seq --validate --think-hard --c7
"이 지시서를 읽고 snake_case 마이그레이션 최종 완료 작업 수행"

# 빠른 실행 (긴급 수정만)
/sc:fix --validate
"alertRules 비활성화 및 주요 타입 오류만 수정"
```

---

## 📚 온보딩 섹션 (필수)

### 필수 읽기 문서
- [ ] `/CLAUDE.md` 17-30행 - 빌드 오류 긴급 대응
- [ ] `/CLAUDE.md` 150-220행 - TypeScript 타입 관리 시스템
- [ ] `/CLAUDE.md` 776-795행 - 누락된 테이블 처리 가이드
- [ ] `/docs/migration-report-snake-case.md` - Wave 5까지 진행 상황
- [ ] `/docs/INSTRUCTION_FIX_BUILD_ERROR_v1.md` - 이전 시도 내역

### 프로젝트 컨텍스트
```bash
# 현재 브랜치 확인
git branch --show-current
# → feature/snake-case-migration

# 빌드 상태 확인
npm run build 2>&1 | head -50
# → 117개 TypeScript 오류

# DB 테이블 확인  
node scripts/verify-with-service-role.js | grep -E "alert|profile"
# → alertRules 테이블 없음 확인

# 타입 파일 상태
ls -la src/types/
# → database.generated.ts, index.ts 확인
```

### 작업 관련 핵심 정보
- **프레임워크**: Next.js 14 (App Router)
- **데이터베이스**: Supabase (PostgreSQL)
- **타입 시스템**: database.generated.ts (snake_case) → Frontend (snake_case로 통일 중)
- **주요 문제**: alertRules 테이블 미존재, Profile 타입 불일치, 일부 camelCase 잔존

---

## 📌 목적

Snake case 마이그레이션 Wave 5 이후 남은 117개 TypeScript 오류를 해결하여 빌드를 성공시키고, 프로덕션 배포 가능한 상태로 만들기

## 🤖 실행 AI 역할

1. 존재하지 않는 테이블 참조 코드 비활성화
2. 타입 불일치 문제 해결
3. 남은 camelCase 필드 snake_case로 변환
4. 빌드 성공 확인
5. 테스트 실행 및 검증

---

## 🔥 Phase 0: 즉시 실행 - 빌드 차단 해제

### 0.1 AlertRules 컴포넌트 완전 비활성화

**파일**: `src/components/features/tools/youtube-lens/AlertRules.tsx`

```typescript
// 전체 파일 내용을 다음으로 교체:

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AlertRules() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>알림 규칙</CardTitle>
      </CardHeader>
      <CardContent className="py-12">
        <div className="text-center text-muted-foreground">
          <p>알림 규칙 기능은 준비 중입니다.</p>
          <p className="text-sm mt-2">빠른 시일 내에 제공될 예정입니다.</p>
        </div>
      </CardContent>
    </Card>
  );
}

// TODO: alertRules 테이블 생성 후 원래 기능 복원
// 원본 코드는 AlertRules.tsx.backup 파일 참조
```

### 0.2 백업 파일 생성

```bash
# 원본 코드 백업
cp src/components/features/tools/youtube-lens/AlertRules.tsx \
   src/components/features/tools/youtube-lens/AlertRules.tsx.backup
```

---

## 📋 Phase 1: Profile 타입 문제 해결

### 1.1 Profile 타입 확인 및 수정

**확인 명령**:
```bash
# Profile 타입 사용 위치 확인
grep -r "Profile" src/app/mypage --include="*.tsx"
grep -r "Profile" src/components --include="*.tsx"

# database.generated.ts에서 Profile 타입 확인
cat src/types/database.generated.ts | grep -A 20 "profiles"
```

### 1.2 타입 불일치 수정

**파일**: `src/app/mypage/profile/page.tsx`

현재 코드 확인 후 다음 패턴으로 수정:
```typescript
// 수정 전 (camelCase 필드 사용)
profile.displayName
profile.avatarUrl
profile.createdAt

// 수정 후 (snake_case 필드 사용)
profile.display_name
profile.avatar_url
profile.created_at
```

**파일**: `src/components/features/revenue-proof/RevenueProofDetail.tsx`

동일한 패턴으로 Profile 관련 필드 수정

---

## 📊 Phase 2: 남은 camelCase 필드 일괄 수정

### 2.1 자동 검색 및 수정 스크립트

**파일**: `scripts/fix-remaining-camelcase.js` (새 파일)

```javascript
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// camelCase → snake_case 변환 매핑
const fieldMappings = {
  // 공통 필드
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'deletedAt': 'deleted_at',
  'userId': 'user_id',
  'videoId': 'video_id',
  'channelId': 'channel_id',
  'playlistId': 'playlist_id',
  'courseId': 'course_id',
  'lessonId': 'lesson_id',
  
  // Profile 필드
  'displayName': 'display_name',
  'avatarUrl': 'avatar_url',
  'phoneNumber': 'phone_number',
  
  // API 키 필드
  'apiKey': 'api_key',
  'encryptedKey': 'encrypted_key',
  'encryptionIv': 'encryption_iv',
  'serviceName': 'service_name',
  'apiKeyMasked': 'api_key_masked',
  
  // 기타 필드
  'isActive': 'is_active',
  'isPublic': 'is_public',
  'errorCode': 'error_code',
  'accessToken': 'access_token',
  'refreshToken': 'refresh_token',
};

// TSX/TS 파일에서 필드 사용 패턴 수정
function fixCamelCaseFields(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  for (const [camel, snake] of Object.entries(fieldMappings)) {
    // 객체 속성 접근 패턴 수정 (예: user.userId → user.user_id)
    const propertyPattern = new RegExp(`\\.${camel}(?![a-zA-Z])`, 'g');
    if (propertyPattern.test(content)) {
      content = content.replace(propertyPattern, `.${snake}`);
      modified = true;
    }
    
    // 구조 분해 할당 패턴 수정 (예: { userId } → { user_id })
    const destructurePattern = new RegExp(`{([^}]*\\b)${camel}(\\b[^}]*)}`, 'g');
    if (destructurePattern.test(content)) {
      content = content.replace(destructurePattern, `{$1${snake}$2}`);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  return false;
}

// 실행
console.log('🔍 Searching for remaining camelCase fields...\n');

const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: [
    'src/types/database.generated.ts',
    'src/**/*.test.{ts,tsx}',
    'src/**/*.spec.{ts,tsx}',
    'node_modules/**'
  ]
});

let fixedCount = 0;
files.forEach(file => {
  if (fixCamelCaseFields(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
```

### 2.2 스크립트 실행

```bash
# 스크립트 실행
node scripts/fix-remaining-camelcase.js

# 변경 사항 확인
git diff --stat
```

---

## 🔧 Phase 3: 누락된 테이블 처리

### 3.1 누락된 테이블 확인

```bash
# DB에 실제로 없는 테이블 확인
node scripts/verify-with-service-role.js | grep -v "테이블 목록"

# 코드에서 참조하는 테이블 확인
grep -r "from('alert" src --include="*.ts"
grep -r "from('proof_likes" src --include="*.ts"
grep -r "from('proof_comments" src --include="*.ts"
```

### 3.2 누락된 테이블 참조 코드 비활성화

각 누락된 테이블을 참조하는 코드에 대해:

```typescript
// 패턴 1: API Route에서
// 수정 전
const { data } = await supabase
  .from('proof_likes')
  .select('*');

// 수정 후
// TODO: proof_likes 테이블 생성 후 구현
const data: any[] = []; // 임시로 빈 배열 반환
```

```typescript
// 패턴 2: 컴포넌트에서
// 수정 전
const loadLikes = async () => {
  const response = await apiGet('/api/proof/likes');
  setLikes(response.data);
};

// 수정 후
const loadLikes = async () => {
  // TODO: proof_likes 테이블 생성 후 구현
  setLikes([]);
};
```

---

## ✅ Phase 4: 타입 재생성 및 빌드 검증

### 4.1 타입 재생성

```bash
# 타입 재생성
npm run types:generate

# 타입 체크
npm run types:check
```

### 4.2 빌드 테스트

```bash
# 빌드 실행
npm run build

# 빌드 성공 시 → Phase 5로
# 빌드 실패 시 → 오류 메시지 분석 후 수정
```

---

## 🧪 Phase 5: 테스트 및 검증

### 5.1 단위 테스트

```bash
# 테스트 실행
npm run test

# 테스트 커버리지
npm run test:coverage
```

### 5.2 로컬 환경 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 테스트
# 1. http://localhost:3000 접속
# 2. 주요 페이지 동작 확인
# 3. 콘솔 에러 확인
```

---

## 📊 QA 테스트 시나리오

### 핵심 사용자 시나리오

#### 1. YouTube Lens 기능 (AlertRules 비활성화 확인)
1. `/tools/youtube-lens` 페이지 접속
2. 알림 규칙 섹션 확인
3. **예상**: "준비 중" 메시지 표시
4. **검증**: 에러 없이 정상 표시

#### 2. 마이페이지 Profile (snake_case 필드 확인)
1. `/mypage/profile` 페이지 접속
2. 프로필 정보 표시 확인
3. **예상**: 모든 필드 정상 표시
4. **검증**: undefined 값 없음

#### 3. API 응답 (snake_case 일관성)
```bash
# API 직접 테스트
curl http://localhost:3000/api/user/profile
# 응답 필드가 모두 snake_case인지 확인
```

### 성능 벤치마크
- 빌드 시간: < 2분
- 번들 크기 변화: ±5% 이내
- 페이지 로딩: LCP < 2.5s

### 회귀 테스트
☑ 로그인/로그아웃 정상 동작
☑ 데이터 CRUD 작업 정상
☑ 파일 업로드 기능 정상
☑ 결제 프로세스 정상

---

## 🎯 성공 기준

### 필수 달성 목표
☑ **빌드 성공**: TypeScript 오류 0개
☑ **테스트 통과**: 기존 테스트 100% 통과
☑ **기능 정상**: 주요 기능 동작 확인
☑ **성능 유지**: 빌드 시간 및 번들 크기 유지

### 검증 명령어
```bash
# 최종 확인 체크리스트
npm run build          # ✅ 성공
npm run test           # ✅ 통과
npm run types:check    # ✅ 오류 없음
npm run lint:biome     # ✅ 경고 최소화
```

---

## 🚨 롤백 계획

### 문제 발생 시
```bash
# 현재 작업 저장
git stash

# main 브랜치로 복귀
git checkout main

# 또는 특정 커밋으로 롤백
git reset --hard [커밋해시]
```

### 부분 롤백 (특정 파일만)
```bash
# AlertRules.tsx만 원복
git checkout main -- src/components/features/tools/youtube-lens/AlertRules.tsx
```

---

## 📝 작업 완료 후 체크리스트

- [ ] 빌드 성공 확인
- [ ] 모든 테스트 통과
- [ ] 주요 기능 수동 테스트
- [ ] git diff 검토
- [ ] PR 생성 및 리뷰 요청
- [ ] 배포 전 스테이징 테스트

---

## 💡 추가 권장사항

### 장기적 개선 사항
1. **누락된 테이블 생성**: SQL 마이그레이션 작성
2. **변환 함수 완전 제거**: 더 이상 필요 없음
3. **테스트 커버리지 향상**: 80% 이상 목표
4. **문서 업데이트**: 타입 시스템 변경 사항 반영

### 즉시 실행 가능한 개선
1. **Biome 린트 수정**: `npm run lint:biome:fix`
2. **불필요한 import 정리**: 자동 정리 도구 활용
3. **console.log 제거**: 프로덕션 코드 정리

---

*Generated by Claude Code AI*
*Version: Snake Case Migration Final v1.0*
*Date: 2025-08-21*