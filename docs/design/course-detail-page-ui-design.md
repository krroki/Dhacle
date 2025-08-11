# 강의 상세 페이지 UI/UX 설계서

## 🎯 설계 목표
구매 전 사용자가 보는 **심플하고 구매 중심적인** 강의 상세 페이지

## 🚫 절대 포함하지 않는 요소
- ❌ Hero 섹션
- ❌ 평점/별점
- ❌ 수강생 수
- ❌ 리뷰/수강후기
- ❌ 강사 소개 (별도 섹션)
- ❌ 추천 강의

## ✅ 필수 포함 요소
- ✅ 강의 제목 및 부제목
- ✅ 미리보기 이미지 (영상 아님)
- ✅ 강의 상세 설명 (콘텐츠 블록 방식)
  - 설명 이미지들아
  - 텍스트 블록
  - GIF 애니메이션
  - 중간 영상 embed
- ✅ 가격 정보 (할인 포함)
- ✅ 구매하기 버튼 (최우선 시각적 계층)
- ✅ 탭 메뉴 (강의소개, 커리큘럼, FAQ)
- ✅ 포함 사항 리스트
- ✅ 수강 기한 정보

## 📐 Desktop 와이어프레임 (1920x1080)

```
┌──────────────────────────────────────────────────────────────────────┐
│  NavigationBar                                                        │
└──────────────────────────────────────────────────────────────────────┘
├─────────────────────────────────────┬────────────────────────────────┤
│  LEFT CONTENT (65%)                 │  RIGHT SIDEBAR (35%)           │
│                                     │                                │
│  [강의 제목 - 48px bold]            │  [PURCHASE CARD - sticky]      │
│  [한 줄 설명 - 18px]                │    가격: 99,000원              │
│  [미리보기 이미지]                   │    [구매하기 버튼]              │
│                                     │    포함 사항 리스트             │
│  ▼ 강의 상세 설명 (스크롤)          │    수강 기한                   │
│  [설명 이미지 1]                    │                                │
│  [텍스트 블록]                       │                                │
│  [설명 이미지 2]                    │                                │
│  [GIF 애니메이션]                   │                                │
│  [텍스트 블록]                       │                                │
│  [설명 이미지 3]                    │                                │
│  [영상 embed]                      │                                │
│  ...계속...                         │                                │
│                                     │                                │
│  [탭 메뉴]                          │                                │
│  [탭 콘텐츠 영역]                    │
│                                     │                                │
└─────────────────────────────────────┴────────────────────────────────┘
```

## 📱 Mobile 와이어프레임 (375x812)

```
┌─────────────────────────┐
│  NavigationBar          │
├─────────────────────────┤
│  [강의 제목]             │
│  [한 줄 설명]            │
│  [미리보기 이미지]        │
│  ▼ 강의 상세 설명       │
│  [설명 이미지 1]         │
│  [텍스트]               │
│  [설명 이미지 2]         │
│  [GIF]                 │
│  ...계속...             │
│  [가격 정보]             │
│  [탭 메뉴 - 스크롤]      │
│  [탭 콘텐츠]             │
├─────────────────────────┤
│  [구매하기 - 하단 고정]   │
└─────────────────────────┘
```

## 🎨 디자인 시스템 (theme.deep.json 기반)

### 색상
- 배경: `#F7FAFC` (neutral.gray.50)
- 카드: `#FFFFFF` (white)
- 주요 텍스트: `#0A2540` (primary.darkBlue)
- 본문: `#425466` (text.primary.default)
- 버튼: `#635BFF` (primary.blue)

### 타이포그래피
- 제목: 48px (desktop) / 24px (mobile)
- 부제목: 18px
- 본문: 16px
- 캡션: 14px

### 간격
- 섹션 간: 48px
- 요소 간: 24px
- 카드 패딩: 32px

## 📦 컴포넌트 구조

```
CourseDetailPage/
├── CourseMainContent (65%)
│   ├── CourseTitle
│   ├── CourseSubtitle
│   ├── CoursePreview
│   ├── CourseTabs
│   └── CourseTabContent
└── CoursePurchaseCard (35%, sticky)
    ├── PriceDisplay
    ├── PurchaseButton
    ├── IncludedItems
    └── Duration
```

## 💻 구현 가이드

### Step 1: 타입 정의
```typescript
interface SimpleCourse {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  thumbnailUrl: string;  // 미리보기 이미지
  duration: string;
  includedItems: string[];
  
  // 콘텐츠 블록 시스템 (이미 구현됨)
  content_blocks: ContentBlock[];
  
  curriculum: CurriculumWeek[];
  faqs: FAQ[];
  // rating, student_count 제외
}

interface ContentBlock {
  id: string;
  type: 'image' | 'text' | 'gif' | 'video' | 'heading';
  url?: string;  // image, gif, video용
  content?: string;  // text, heading용
}
```

### Step 2: 레이아웃 구현
```tsx
<div className="lg:grid lg:grid-cols-[65%_35%] lg:gap-8">
  <div>
    {/* 상단 정보 */}
    <h1>{course.title}</h1>
    <p>{course.subtitle}</p>
    <img src={course.thumbnailUrl} />
    
    {/* 강의 상세 설명 - 콘텐츠 블록 렌더링 */}
    <div className="mt-8 space-y-6">
      {course.content_blocks.map(block => (
        <ContentBlockRenderer block={block} />
      ))}
    </div>
    
    {/* 탭 메뉴 */}
    <CourseTabs />
  </div>
  
  <div className="hidden lg:block lg:sticky lg:top-24">
    <CoursePurchaseCard />
  </div>
</div>

{/* Mobile fixed bottom */}
<div className="fixed bottom-0 left-0 right-0 lg:hidden">
  <PurchaseButton />
</div>
```

### Step 3: 반응형 브레이크포인트
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## ✅ 검증 체크리스트

### Desktop
- [ ] 2-컬럼 레이아웃 정상 표시
- [ ] 구매 카드 sticky 동작
- [ ] 탭 전환 정상 작동
- [ ] 구매 버튼 항상 보임

### Mobile
- [ ] 1-컬럼 레이아웃
- [ ] 하단 구매 버튼 고정
- [ ] 탭 메뉴 가로 스크롤
- [ ] 터치 타겟 44px 이상

### 금지사항
- [ ] Hero 섹션 없음 확인
- [ ] 평점/별점 없음 확인
- [ ] 수강생 수 없음 확인
- [ ] 리뷰 없음 확인

## 🚨 Developer AI 주의사항

1. **절대 추가하지 말 것**
   - Netflix 로고만 띄우고 끝내기
   - 스타일 없는 빈 컴포넌트
   - rating, student_count 필드

2. **반드시 구현할 것**
   - 완전한 레이아웃 구조
   - 모든 스타일링 적용
   - 반응형 처리
   - 실제 작동하는 탭 메뉴

3. **테스트 필수**
   - npm run dev 실행
   - Desktop/Mobile 뷰 확인
   - 스크린샷 증거 제출

---

*작성일: 2025-01-11*
*작성자: PM AI (Design Architect)*