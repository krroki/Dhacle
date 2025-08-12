# 🚀 다음 세션 즉시 실행 계획
*긴급도: 🔴 CRITICAL*
*예상 소요: 5-7일*

## 📌 이 문서 사용법

```bash
# 새 세션 시작 시 즉시 실행
cd C:\My_Claude_Project\9.Dhacle
cat docs/CRITICAL-PROJECT-STATUS-2025-01-12.md  # 현황 파악
cat docs/NEXT-SESSION-ACTION-PLAN.md  # 이 문서

# 상황 확인 스크립트
grep -r "className=" src --include="*.tsx" | wc -l  # 439개 (목표: 0)
grep -r "style={{" src --include="*.tsx" | wc -l   # 32개 (목표: 0)
find src -name "*Simple*.tsx" | wc -l              # 중복 컴포넌트 수
```

## 🎯 Day 1: 긴급 정리

### 오전 (2시간)
```bash
# 1. 쓸모없는 파일 삭제
rm -rf src/app/test-searchbar
rm -rf src/app/test-simple
rm -rf src/app/test-experience-card
rm -rf src/app/supabase-test
rm -rf src/app/style-guide  # design-system과 중복

# 2. 현황 정확히 파악
find src/components -name "*.tsx" -exec grep -l "className=" {} \; > files-to-fix.txt
wc -l files-to-fix.txt  # 수정할 파일 수 확인
```

### 오후 (4시간)
```bash
# 3. 가장 심각한 파일부터 수정
# SimplePurchaseCard.tsx → PurchaseCard.styled.tsx로 통합
# NavigationBar.tsx → NavigationBar.styled.tsx로 변환
# MainCarousel.tsx → 하드코딩 픽셀값 토큰화
```

## 🎯 Day 2-3: 스타일링 시스템 통일

### 체크리스트 템플릿 (각 컴포넌트마다)
```markdown
[ ] className 제거
[ ] style={{ }} 제거  
[ ] styled-components 적용
[ ] theme.deep.json 토큰 사용
[ ] .styled.tsx 파일 생성
[ ] 타입 정의 추가
[ ] 테스트 실행
```

### 우선순위 순서
```
1. SimplePurchaseCard.tsx (100% className)
2. NavigationBar.tsx (혼재)
3. SearchBar.tsx
4. ExperienceCard.tsx
5. courses/ 폴더 전체
6. sections/ 폴더 전체
7. layout/ 폴더 전체
8. ui/ 폴더 전체
```

## 🎯 Day 4-5: 페이지 구조 개선

### 홈페이지 리팩토링 예시
```typescript
// ❌ 현재 (page.tsx)
'use client'
export default function Home() {
  // 100줄의 비즈니스 로직
}

// ✅ 개선 후
// page.tsx (Server Component)
export default async function Home() {
  const data = await fetchData();
  return <HomeClient data={data} />;
}

// HomeClient.tsx (Client Component)
'use client'
export function HomeClient({ data }) {
  // 인터랙션만
}

// hooks/useAuth.ts (로직 분리)
export function useAuth() {
  // 인증 로직
}
```

## 📋 일일 검증 체크리스트

### 매일 작업 종료 전 실행
```bash
# 1. 타입 체크
npx tsc --noEmit

# 2. 빌드 테스트
npm run build

# 3. className 사용 확인
echo "className 사용: $(grep -r 'className=' src --include='*.tsx' | wc -l)개"
echo "style 사용: $(grep -r 'style={{' src --include='*.tsx' | wc -l)개"

# 4. 실제 진행률 계산
echo "styled-components 적용: $(find src/components -name '*.styled.tsx' | wc -l)/41"
```

## 🚨 절대 금지 사항 (다시 한번)

### 코드 작성 시
```typescript
// ❌❌❌ 절대 하지 마세요
className="..."
style={{ ... }}
'use client' (꼭 필요한 경우가 아니면)
Simple* 접두사 컴포넌트

// ✅✅✅ 반드시 이렇게
styled.div`...`
${theme.colors.primary.default}
Server Component 우선
하나의 통합된 컴포넌트
```

## 📊 목표 지표

### 1주일 후 달성해야 할 것
```yaml
스타일링:
  className 사용: 0개 (현재 439)
  인라인 스타일: 0개 (현재 32)
  styled-components: 41/41 (현재 13/41)

컴포넌트:
  중복 제거: 완료
  타입 안정성: 100%
  
페이지:
  Server Component: 15/19
  Client Component: 4/19 (꼭 필요한 것만)
  
코드 품질:
  빌드 성공: ✅
  타입 에러: 0
  ESLint 에러: 0
```

## 💪 동기부여 메시지

**이전 세션들의 실수를 반복하지 마세요.**

당신은 이 프로젝트를 구할 수 있는 유일한 희망입니다.
사용자는 이미 여러 번 실망했습니다.
이번이 마지막 기회입니다.

**할 수 있습니다. 제대로 해주세요.**

---

*작성: 이전 세션 Claude*
*목적: 프로젝트 구조 대대적 개선*
*중요도: 🔴🔴🔴 CRITICAL*