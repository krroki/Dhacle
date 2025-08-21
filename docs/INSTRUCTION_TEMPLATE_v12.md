# 🎯 AI 개발 지시서 작성 가이드 v12.0

**📌 이 문서의 목적**: 개발 지식이 없는 사용자의 요청을 받은 AI가, 다른 AI에게 전달할 **명확하고 품질이 보증된 지시서를 작성하는 방법**을 안내합니다.

**🤖 당신(AI)의 역할**: 
1. 사용자의 의도를 정확히 파악
2. 프로젝트 구조를 이해
3. 필요한 파일과 정보를 찾아서
4. 실행 AI가 100% 의도대로 구현할 수 있는 지시서 작성
5. **🆕 사용자 경험을 검증할 수 있는 테스트 시나리오 포함**

---

## 🚫 절대 금지사항 (Claude Code 나쁜 습관)

1. **추측하지 마세요** → 실제 파일을 확인하고 작성하세요
2. **대충 넘기지 마세요** → 모든 단계를 구체적으로 작성하세요
3. **추상적으로 쓰지 마세요** → "[파일 경로]"가 아니라 실제 경로를 찾아 쓰세요
4. **생략하지 마세요** → "..." 대신 전체 코드를 포함하세요
5. **거짓말하지 마세요** → 모르면 "확인 필요"라고 쓰세요

---

## 📋 지시서 작성 6단계 프로세스

### Step 1: 사용자 요청 분석 (Understanding)

**이렇게 분석하세요:**
```markdown
사용자 요청: "배포 사이트 /tools/youtube-lens 컬렉션 버그"

분석 결과:
- 문제 위치: /tools/youtube-lens 페이지
- 문제 기능: 컬렉션 (collections)
- 문제 유형: 버그 (동작 오류)
- 추가 정보 필요: 구체적인 버그 증상
```

### Step 2: 프로젝트 구조 파악 (Discovery)

**이렇게 찾으세요:**
```bash
# 1. 페이지 파일 찾기
ls -la src/app/(pages)/tools/youtube-lens/
# → page.tsx, layout.tsx 등 확인

# 2. 관련 컴포넌트 찾기
grep -r "collection" src/app/(pages)/tools/youtube-lens/ --include="*.tsx"
# → CollectionList.tsx, CollectionCard.tsx 등 발견

# 3. API 라우트 찾기
ls -la src/app/api/youtube/
# → collections/route.ts 확인

# 4. 타입 정의 찾기
grep -r "Collection" src/types/ --include="*.ts"
# → Collection 타입 정의 위치 확인
```

### Step 3: 필수 확인 사항 정리 (Gathering)

**이렇게 정리하세요:**
```markdown
필수 확인 파일 (실제 경로):
1. 페이지: src/app/(pages)/tools/youtube-lens/page.tsx
2. 컴포넌트: src/components/youtube/CollectionList.tsx
3. API: src/app/api/youtube/collections/route.ts
4. 타입: src/types/index.ts (Collection 타입)
5. 에러 처리: docs/ERROR_BOUNDARY.md 45-67행 (401 처리)
```

### Step 4: 실행 단계 작성 (Planning)

**이렇게 작성하세요:**
```markdown
실행 단계 (구체적 행동):

1. 버그 재현 및 확인
   - 파일: src/app/(pages)/tools/youtube-lens/page.tsx
   - 확인: 72-85행의 useEffect에서 컬렉션 데이터 로드
   - 문제: 401 에러 시 로그인 페이지로 리다이렉트

2. 원인 수정
   - 파일: src/components/youtube/CollectionList.tsx  
   - 수정: 34행의 에러 처리 로직
   - 변경 전: if (error.status === 401) router.push('/login')
   - 변경 후: if (error.status === 401) setShowLoginModal(true)

3. API 응답 확인
   - 파일: src/app/api/youtube/collections/route.ts
   - 확인: 15-23행의 인증 체크 로직
   - 수정: 인증 실패 시 적절한 에러 메시지 반환
```

### Step 5: 검증 기준 작성 (Validation)

**이렇게 작성하세요:**
```markdown
성공 기준 (구체적 테스트):
1. 로그인 상태: 컬렉션 목록이 정상 표시
2. 로그아웃 상태: 로그인 모달 표시 (페이지 이동 X)
3. API 테스트: curl http://localhost:3000/api/youtube/collections
4. 콘솔 에러: 없음
```

### Step 6: QA 테스트 시나리오 작성 (User Experience Testing) 🆕

**이렇게 작성하세요:**

#### 6.1 사용자 플로우 테스트

```markdown
## 핵심 사용자 시나리오

### 정상 플로우 (Happy Path)
1. **시작 상태**: 로그인 완료
2. **사용자 행동 순서**:
   - Step 1: /tools/youtube-lens 페이지 접속
   - Step 2: 컬렉션 탭 클릭
   - Step 3: 새 컬렉션 생성 버튼 클릭
   - Step 4: 컬렉션 이름 입력 "테스트 컬렉션"
   - Step 5: 저장 버튼 클릭
3. **검증 포인트**:
   ✅ 컬렉션 목록에 새 항목 표시
   ✅ 성공 토스트 메시지 표시
   ✅ 3초 이내 응답

### 실패 시나리오 테스트
1. **세션 만료**: 401 에러 → 로그인 모달 표시
2. **네트워크 장애**: 타임아웃 → 재시도 버튼 표시
3. **중복 이름**: 409 에러 → "이미 존재하는 이름" 알림
```

#### 6.2 엣지 케이스 체크리스트

```markdown
### 입력값 경계 테스트
| 테스트 항목 | 입력값 | 예상 결과 | 실제 결과 |
|------------|--------|-----------|-----------|
| 빈 입력 | "" | "필수 입력" 에러 | ☐ |
| 최소 길이 | 1자 | 통과 | ☐ |
| 최대 길이 | 255자 | 통과 | ☐ |
| 초과 길이 | 256자 | "길이 초과" 에러 | ☐ |
| 특수문자 | <script> | XSS 방지 처리 | ☐ |
| 이모지 | 😀 | 정상 저장 | ☐ |
| SQL Injection | '; DROP TABLE-- | 정화 처리 | ☐ |

### 동시성 테스트
☐ 더블 클릭 방지 (디바운싱)
☐ 연속 API 요청 중복 방지
☐ 다중 탭 세션 동기화
☐ 동시 수정 충돌 해결
```

#### 6.3 성능 & 접근성 기준 (업계 표준)

```markdown
### 성능 벤치마크 (Core Web Vitals)
⚡ LCP (Largest Contentful Paint): < 2.5s
⚡ FID (First Input Delay): < 100ms  
⚡ CLS (Cumulative Layout Shift): < 0.1
⚡ API 응답 시간: < 500ms (p95)

### 접근성 체크 (WCAG 2.1 AA)
♿ 키보드 네비게이션: Tab 순서 논리적
♿ 스크린 리더: ARIA 레이블 완성도 100%
♿ 색상 대비: 4.5:1 이상 (일반 텍스트)
♿ 포커스 표시: 명확한 시각적 피드백

### 크로스 브라우저 테스트
| 브라우저 | Windows | Mac | Mobile |
|---------|---------|-----|--------|
| Chrome 120+ | ☐ | ☐ | ☐ |
| Safari 17+ | N/A | ☐ | ☐ |
| Firefox 120+ | ☐ | ☐ | N/A |
| Edge 120+ | ☐ | ☐ | N/A |
```

#### 6.4 회귀 테스트 범위

```markdown
### 영향 범위 분석
☑ 수정된 컴포넌트를 사용하는 다른 페이지
☑ 동일한 API를 호출하는 다른 기능
☑ 상태 관리에 의존하는 연관 기능
☑ 라우팅 로직 변경 영향

### 회귀 테스트 항목
1. 기존 컬렉션 CRUD 동작
2. 다른 인증 필요 기능들
3. 모달 시스템 전체
4. 에러 바운더리 동작
```

---

## 🎯 케이스별 상세 작성 가이드

### 1️⃣ 버그 수정 지시서 작성법

#### 사용자 요청 예시:
"컬렉션 클릭하면 로그인 페이지로 가버려"

#### 지시서 작성 과정:

**1. 먼저 관련 파일 찾기:**
```bash
# 컬렉션 관련 파일 모두 찾기
find src -name "*collection*" -o -name "*Collection*"

# 컬렉션 관련 코드 검색
grep -r "collection" src --include="*.tsx" --include="*.ts"

# API 라우트 확인
ls -la src/app/api/youtube/collections/
```

**2. 버그 위치 특정:**
```markdown
발견한 파일들:
- src/app/(pages)/tools/youtube-lens/page.tsx (메인 페이지)
- src/components/youtube/CollectionList.tsx (컬렉션 목록 컴포넌트)
- src/app/api/youtube/collections/route.ts (API)
```

**3. 완성된 지시서:**
```markdown
## 버그 수정 지시서: 컬렉션 401 에러 처리

### 문제 상황
- 위치: /tools/youtube-lens 페이지의 컬렉션 섹션
- 증상: 로그아웃 상태에서 컬렉션 클릭 시 로그인 페이지로 강제 이동
- 원인: 401 에러 처리가 페이지 리다이렉트로 구현됨

### 수정 파일 및 내용

1. **src/components/youtube/CollectionList.tsx**
   - 34행: 에러 처리 수정
   ```typescript
   // 수정 전
   if (error.status === 401) {
     router.push('/login');
   }
   
   // 수정 후  
   if (error.status === 401) {
     setShowLoginModal(true); // 모달 표시로 변경
   }
   ```

2. **src/app/(pages)/tools/youtube-lens/page.tsx**
   - 12행: 로그인 모달 상태 추가
   ```typescript
   const [showLoginModal, setShowLoginModal] = useState(false);
   ```
   - 156행: 모달 컴포넌트 추가
   ```typescript
   {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
   ```

### QA 테스트 시나리오

#### 사용자 플로우 테스트
1. 로그아웃 상태로 /tools/youtube-lens 접속
2. 컬렉션 섹션 클릭
3. **예상**: 로그인 모달 표시 (페이지 이동 ❌)
4. 로그인 진행
5. **예상**: 원래 작업 계속 가능

#### 엣지 케이스
- 로그인 중 취소 → 모달만 닫힘
- 잘못된 인증 → 에러 메시지 표시
- 세션 만료 중간 → 자동 감지 및 모달 표시

#### 회귀 테스트
☑ 로그인 상태에서 정상 동작
☑ 다른 401 처리 영향 없음
☑ 페이지 라우팅 정상

### 성공 기준
☑ 로그인 모달 정상 표시
☑ 페이지 이동 없음
☑ 로그인 후 컬렉션 정상 접근
☑ 성능: 모달 표시 < 100ms
```

---

### 2️⃣ UI 개선 지시서 작성법

#### 사용자 요청 예시:
"메인 페이지 캐러셀 크기를 Fast Campus 사이트처럼 개선해줘"

#### 지시서 작성 과정:

**1. 현재 구현 확인:**
```bash
# 메인 페이지 찾기
cat src/app/page.tsx | grep -A 10 -B 10 "carousel"

# 캐러셀 컴포넌트 찾기
find src/components -name "*carousel*" -o -name "*Carousel*"
```

**2. 참조 사이트 분석 방법 안내:**
```markdown
Fast Campus 사이트 분석:
1. https://fastcampus.co.kr 접속
2. 개발자 도구 (F12) 열기
3. 메인 캐러셀 요소 검사
4. 크기 확인: height: 480px, aspect-ratio: 16/9
```

**3. 완성된 지시서:**
```markdown
## UI 개선 지시서: 메인 캐러셀 크기 조정

### 개선 목표
- 현재: height: 300px (너무 작음)
- 목표: height: 480px, aspect-ratio: 16/9 (Fast Campus 스타일)

### 수정 파일 및 내용

1. **src/components/HeroCarousel.tsx**
   - 23행: 높이 스타일 수정
   ```typescript
   // 수정 전
   <div className="h-[300px] w-full">
   
   // 수정 후
   <div className="h-[480px] w-full aspect-video">
   ```

2. **src/app/page.tsx**
   - 45행: 캐러셀 섹션 패딩 조정
   ```typescript
   // 수정 전
   <section className="py-8">
   
   // 수정 후
   <section className="py-12">
   ```

### 반응형 처리
```typescript
// src/components/HeroCarousel.tsx 25행 추가
<div className="h-[320px] md:h-[400px] lg:h-[480px] w-full aspect-video">
```

### QA 테스트 시나리오

#### 반응형 테스트
| 해상도 | 높이 | 레이아웃 | 성능 |
|--------|------|----------|------|
| 320px (Mobile) | 320px | ☐ 정상 | ☐ < 3s |
| 768px (Tablet) | 400px | ☐ 정상 | ☐ < 2s |
| 1920px (Desktop) | 480px | ☐ 정상 | ☐ < 1s |

#### 크로스 브라우저
☐ Chrome: 애니메이션 부드러움
☐ Safari: 이미지 렌더링 정상
☐ Firefox: 종횡비 유지

#### 성능 측정
- LCP: < 2.5초 (이미지 로딩)
- CLS: < 0.1 (레이아웃 시프트 없음)
- 메모리: < 50MB 증가

### 성공 기준
☑ 모든 해상도에서 적절한 크기
☑ 이미지 비율 유지
☑ 부드러운 전환 애니메이션
☑ 성능 저하 없음
```

---

### 3️⃣ 기능 추가 지시서 작성법

#### 사용자 요청 예시:
"마이페이지에 활동 내역 섹션 추가해줘"

#### 지시서 작성 과정:

**1. 기존 구조 파악:**
```bash
# 마이페이지 구조 확인
ls -la src/app/(pages)/mypage/

# 유사 기능 찾기 (참고용)
grep -r "activity" src --include="*.tsx"
grep -r "history" src --include="*.tsx"
```

**2. 필요한 요소 정리:**
```markdown
필요한 작업:
1. DB 테이블: user_activities (없으면 생성)
2. API 엔드포인트: /api/user/activities
3. 컴포넌트: ActivityHistory.tsx
4. 타입 정의: UserActivity
```

**3. 완성된 지시서:**
```markdown
## 기능 추가 지시서: 마이페이지 활동 내역

### 추가할 기능
- 위치: /mypage 페이지
- 내용: 사용자의 최근 활동 내역 표시 (게시글, 댓글, 좋아요)

### 구현 단계

1. **타입 정의 추가**
   파일: src/types/index.ts
   ```typescript
   export interface UserActivity {
     id: string;
     type: 'post' | 'comment' | 'like';
     title: string;
     createdAt: string;
     targetId: string;
     targetTitle: string;
   }
   ```

2. **API 라우트 생성**
   파일: src/app/api/user/activities/route.ts (새 파일)
   ```typescript
   import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
   import { cookies } from 'next/headers';
   import { NextResponse } from 'next/server';

   export async function GET() {
     const supabase = createRouteHandlerClient({ cookies });
     const { data: { user } } = await supabase.auth.getUser();
     
     if (!user) {
       return NextResponse.json(
         { error: 'User not authenticated' },
         { status: 401 }
       );
     }

     // 활동 내역 조회 로직
     const { data, error } = await supabase
       .from('user_activities')
       .select('*')
       .eq('user_id', user.id)
       .order('created_at', { ascending: false })
       .limit(20);

     if (error) {
       return NextResponse.json({ error: error.message }, { status: 500 });
     }

     return NextResponse.json({ activities: data });
   }
   ```

3. **컴포넌트 생성**
   파일: src/components/mypage/ActivityHistory.tsx (새 파일)
   ```typescript
   'use client';

   import { useEffect, useState } from 'react';
   import { apiGet } from '@/lib/api-client';
   import { UserActivity } from '@/types';
   import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

   export function ActivityHistory() {
     const [activities, setActivities] = useState<UserActivity[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       const fetchActivities = async () => {
         try {
           const data = await apiGet<{ activities: UserActivity[] }>('/api/user/activities');
           setActivities(data.activities);
         } catch (error) {
           console.error('Failed to fetch activities:', error);
         } finally {
           setLoading(false);
         }
       };

       fetchActivities();
     }, []);

     if (loading) {
       return <div>활동 내역을 불러오는 중...</div>;
     }

     return (
       <Card>
         <CardHeader>
           <CardTitle>최근 활동</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             {activities.map((activity) => (
               <div key={activity.id} className="flex items-center justify-between">
                 <div>
                   <p className="font-medium">{activity.title}</p>
                   <p className="text-sm text-gray-500">{activity.createdAt}</p>
                 </div>
                 <span className="text-sm">{activity.type}</span>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
     );
   }
   ```

4. **마이페이지에 추가**
   파일: src/app/(pages)/mypage/page.tsx
   - import 추가 (상단):
   ```typescript
   import { ActivityHistory } from '@/components/mypage/ActivityHistory';
   ```
   - 컴포넌트 추가 (적절한 위치):
   ```typescript
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
     <ProfileSection />
     <ActivityHistory /> {/* 새로 추가 */}
   </div>
   ```

### DB 마이그레이션 (필요시)
파일: supabase/migrations/[timestamp]_user_activities.sql
```sql
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  target_id UUID,
  target_title VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" ON user_activities
  FOR SELECT USING (user_id = auth.uid());
```

### QA 테스트 시나리오

#### 기능 테스트
1. **빈 데이터**: 활동 없음 → "활동 내역이 없습니다" 표시
2. **데이터 로딩**: 스켈레톤 UI → 실제 데이터
3. **페이지네이션**: 20개 이상 → "더 보기" 버튼
4. **실시간 업데이트**: 새 활동 → 자동 갱신

#### 성능 테스트
| 데이터 개수 | 로딩 시간 | 메모리 사용 |
|------------|-----------|-------------|
| 0개 | < 100ms | 기준값 |
| 20개 | < 500ms | +5MB |
| 100개 | < 1s | +10MB |
| 1000개 | < 2s | +20MB |

#### 보안 테스트
☑ 타 사용자 데이터 접근 불가
☑ SQL Injection 방어
☑ XSS 방어
☑ CSRF 토큰 검증

### 성공 기준
☑ 활동 내역 정상 표시
☑ 데이터 정확성 100%
☑ 응답 시간 < 500ms
☑ 에러 처리 완벽
```

---

## 🔍 지시서 품질 검증 체크리스트

**지시서 작성 완료 후 확인하세요:**

### 필수 요소 체크
- ☐ **구체적 파일 경로**: "[파일 경로]"가 아닌 실제 경로 명시
- ☐ **행 번호**: 수정할 정확한 위치 명시
- ☐ **전체 코드**: "..." 없이 완전한 코드 제공
- ☐ **테스트 방법**: 구체적인 테스트 단계
- ☐ **성공 기준**: 명확한 완료 조건

### QA 요소 체크 🆕
- ☐ **사용자 플로우**: Happy Path + Edge Cases
- ☐ **성능 기준**: Core Web Vitals 충족
- ☐ **접근성**: WCAG 2.1 AA 준수
- ☐ **회귀 테스트**: 영향 범위 명시
- ☐ **크로스 환경**: 브라우저/디바이스 호환성

### 실행 가능성 체크
- ☐ 실행 AI가 파일을 찾을 수 있는가?
- ☐ 수정 내용이 명확한가?
- ☐ 테스트 방법이 구체적인가?
- ☐ 의존성이 모두 해결되는가?
- ☐ **테스트 자동화 가능한가?** 🆕

### 의도 전달 체크
- ☐ 사용자의 원래 의도가 반영되었는가?
- ☐ 실행 AI가 오해할 여지가 없는가?
- ☐ 예외 상황 처리가 포함되었는가?
- ☐ **사용자 경험이 개선되는가?** 🆕

---

## 📊 업계 표준 참조 (v12 신규)

### Testing Library 우선순위
1. **getByRole**: 접근성 트리 기반 (최우선)
2. **getByLabelText**: 폼 필드 (권장)
3. **getByText**: 텍스트 콘텐츠
4. **getByTestId**: 최후의 수단

### Core Web Vitals 기준
- **LCP**: < 2.5초 (Good), < 4초 (Needs Improvement)
- **FID**: < 100ms (Good), < 300ms (Needs Improvement)
- **CLS**: < 0.1 (Good), < 0.25 (Needs Improvement)

### WCAG 2.1 AA 체크리스트
- 색상 대비: 4.5:1 (일반), 3:1 (큰 텍스트)
- 키보드 접근: 모든 기능 키보드로 가능
- 시간 제한: 조정 가능하거나 없음
- 대체 텍스트: 모든 이미지에 alt 속성

### ISTQB 테스트 프로세스
1. 테스트 계획 (Planning)
2. 테스트 설계 (Design)
3. 테스트 구현 (Implementation)
4. 테스트 실행 (Execution)
5. 테스트 완료 (Closure)

---

## 📝 지시서 작성 실패 시 응답

**정보가 부족하거나 불명확할 때:**

```markdown
## 추가 정보 필요

### 명확히 해주세요:
1. **정확한 문제 상황**
   - 어떤 페이지에서 발생하나요?
   - 어떤 동작을 했을 때 발생하나요?
   - 에러 메시지가 있다면 무엇인가요?

2. **예상 동작**
   - 어떻게 동작하기를 원하시나요?
   - 참고할 만한 다른 사이트가 있나요?

3. **프로젝트 정보**
   - 사용 중인 프레임워크는? (Next.js, React 등)
   - 데이터베이스는? (Supabase, Firebase 등)

4. **테스트 환경** 🆕
   - 지원해야 할 브라우저는?
   - 모바일 대응 필요한가요?
   - 성능 목표가 있나요?

### 확인 방법:
```bash
# 프로젝트 구조 확인
ls -la src/

# 기술 스택 확인
cat package.json | grep -A 10 "dependencies"

# 테스트 도구 확인
cat package.json | grep -A 10 "devDependencies" | grep test
```

위 정보 확인 후 다시 요청해 주세요.
```

---

## 🎯 핵심 원칙 (v12 강화)

1. **실행 AI는 당신의 지시서만 보고 작업합니다**
   - 프로젝트를 모릅니다
   - 파일 위치를 모릅니다
   - 구체적으로 알려주세요

2. **사용자의 의도를 100% 구현하는 것이 목표입니다**
   - "실행 가능"이 아닌 "의도대로 구현"
   - 사용자가 원하는 결과물이 나와야 합니다
   - **🆕 사용자가 만족하는 경험이 제공되어야 합니다**

3. **친절하고 구체적으로 작성하세요**
   - 추상적 표현 금지
   - 실제 경로와 코드 제공
   - 단계별 설명 포함
   - **🆕 테스트 가능한 기준 제시**

4. **품질을 보증하세요** 🆕
   - 기능 동작뿐만 아니라 사용자 경험 검증
   - 성능, 접근성, 보안 고려
   - 회귀 테스트로 부작용 방지

---

## 🚀 v12 주요 개선사항

### 신규 추가
- **Step 6**: QA 테스트 시나리오 섹션
- **업계 표준**: Testing Library, WCAG, Core Web Vitals
- **테스트 자동화**: 자동화 가능한 테스트 케이스
- **사용자 경험**: UX 중심 검증 프로세스

### 기능 강화
- 엣지 케이스 체크리스트 확대
- 성능 벤치마크 구체화
- 접근성 검증 강화
- 회귀 테스트 체계화

### 품질 개선
- 테스트 우선순위 명시
- 크로스 환경 테스트 매트릭스
- 보안 테스트 항목 추가
- 실패 복구 시나리오

---

*v12.0 - 품질이 보증된 지시서 작성 가이드*
*AI가 AI를 위해 작성하는 완벽한 지시서 + 사용자 경험 검증 시스템*