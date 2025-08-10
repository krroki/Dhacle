# 📸 Visual Verification Protocol (VVP) - UI 작업 필수 검증 체계

## 🚨 핵심 원칙
**"코드가 동작한다 ≠ UI가 완성됐다"**

모든 UI 관련 작업은 반드시 시각적 검증을 통과해야 완료로 간주됩니다.

## 🔴 의무 사항 (MANDATORY)

### 1. 3단계 검증 프로세스

#### Stage 1: 코드 검증 (Code Verification)
```yaml
필수_체크:
  - TypeScript 컴파일 에러: 0개
  - ESLint 에러: 0개
  - 하드코딩된 색상/값: 0개
  - 토큰 시스템 사용: 100%
```

#### Stage 2: 렌더링 검증 (Rendering Verification)
```yaml
필수_체크:
  - 개발 서버 실행: 성공
  - 페이지 로드: 404 없음
  - Console 에러: 0개
  - 컴포넌트 마운트: 성공
```

#### Stage 3: 시각적 검증 (Visual Verification) ⭐
```yaml
필수_체크:
  - 스크린샷 촬영: 최소 3장 (기본/호버/클릭)
  - UI 요소 가시성: 100%
  - 레이아웃 정렬: 정상
  - 색상 적용: 토큰 값 확인
  - 인터랙션: 정상 동작
```

## 📋 Visual Verification 체크리스트

### 필수 스크린샷 (모든 UI 작업)
1. **기본 상태** - 컴포넌트 초기 렌더링
2. **호버 상태** - 마우스 오버 시 변화
3. **클릭/활성 상태** - 사용자 인터랙션
4. **반응형** - 모바일/태블릿/데스크톱

### 검증 항목
```typescript
interface VisualVerification {
  // 1. 크기 및 치수 검증
  dimensions: {
    width_correct: boolean;          // 너비가 디자인 스펙과 일치
    height_correct: boolean;         // 높이가 디자인 스펙과 일치
    min_max_sizes: boolean;          // 최소/최대 크기 제약 준수
    aspect_ratio: boolean;           // 종횡비 유지 (이미지, 비디오)
    overflow_handling: boolean;      // 오버플로우 처리 정상
    text_truncation: boolean;        // 텍스트 잘림 처리 적절
  };
  
  // 2. 위치 및 정렬 검증
  positioning: {
    absolute_position: boolean;      // 절대 위치 정확
    relative_position: boolean;      // 상대 위치 정확
    z_index_order: boolean;          // 레이어 순서 정확
    centered_properly: boolean;      // 중앙 정렬 정확
    grid_alignment: boolean;         // 그리드 정렬 준수
    flex_layout: boolean;           // Flexbox 레이아웃 정상
  };
  
  // 3. 간격 및 여백 검증
  spacing: {
    margin_correct: boolean;         // 외부 여백 정확
    padding_correct: boolean;        // 내부 여백 정확
    gap_between_elements: boolean;   // 요소 간 간격 일관성
    line_height_proper: boolean;     // 줄 간격 가독성
    letter_spacing: boolean;         // 자간 적절함
    consistent_spacing: boolean;     // 전체 간격 일관성
  };
  
  // 4. 시각적 계층 검증
  hierarchy: {
    heading_sizes: boolean;          // 제목 크기 계층 정확
    visual_weight: boolean;          // 시각적 중요도 표현
    contrast_ratios: boolean;        // 대비율 WCAG 준수
    focus_order: boolean;           // 포커스 순서 논리적
    reading_flow: boolean;          // 읽기 흐름 자연스러움
    grouping_clear: boolean;        // 관련 요소 그룹핑 명확
  };
  
  // 5. 색상 및 테마 검증
  appearance: {
    color_accuracy: boolean;         // 색상 정확도 (토큰 값 일치)
    gradient_rendering: boolean;     // 그라디언트 부드러움
    transparency_levels: boolean;    // 투명도 레벨 정확
    dark_mode_support: boolean;      // 다크모드 지원
    theme_consistency: boolean;      // 테마 일관성
    brand_compliance: boolean;       // 브랜드 가이드 준수
  };
  
  // 6. 경계 및 윤곽 검증
  borders: {
    border_width: boolean;           // 테두리 두께 정확
    border_radius: boolean;          // 모서리 둥글기 정확
    border_style: boolean;           // 테두리 스타일 일치
    shadow_depth: boolean;           // 그림자 깊이 적절
    shadow_blur: boolean;            // 그림자 블러 정확
    outline_focus: boolean;          // 포커스 아웃라인 표시
  };
  
  // 7. 타이포그래피 검증
  typography: {
    font_family: boolean;            // 폰트 패밀리 정확
    font_size: boolean;              // 폰트 크기 정확
    font_weight: boolean;            // 폰트 굵기 정확
    text_alignment: boolean;         // 텍스트 정렬 정확
    text_overflow: boolean;          // 텍스트 오버플로우 처리
    readability: boolean;            // 가독성 확보
  };
  
  // 8. 반응형 디자인 검증
  responsive: {
    mobile_layout: boolean;          // 모바일 레이아웃 정상
    tablet_layout: boolean;          // 태블릿 레이아웃 정상
    desktop_layout: boolean;         // 데스크톱 레이아웃 정상
    breakpoint_transitions: boolean; // 브레이크포인트 전환 부드러움
    touch_targets: boolean;          // 터치 타겟 크기 적절 (최소 44x44px)
    viewport_meta: boolean;          // 뷰포트 메타 태그 설정
  };
  
  // 9. 인터랙션 및 애니메이션 검증
  interaction: {
    hover_states: boolean;           // 호버 상태 표시
    active_states: boolean;          // 활성 상태 표시
    disabled_states: boolean;        // 비활성 상태 표시
    loading_states: boolean;         // 로딩 상태 표시
    transition_smooth: boolean;      // 전환 애니메이션 부드러움
    animation_performance: boolean;  // 애니메이션 성능 (60fps)
  };
  
  // 10. 접근성 검증
  accessibility: {
    keyboard_navigation: boolean;    // 키보드 탐색 가능
    screen_reader: boolean;          // 스크린 리더 호환
    aria_labels: boolean;            // ARIA 레이블 적절
    color_blind_safe: boolean;       // 색맹 친화적
    focus_visible: boolean;          // 포커스 표시 명확
    alt_text: boolean;              // 대체 텍스트 제공
  };
  
  // 11. 성능 관련 시각 검증
  performance: {
    image_optimization: boolean;     // 이미지 최적화
    lazy_loading: boolean;          // 지연 로딩 동작
    skeleton_screens: boolean;       // 스켈레톤 스크린 표시
    progressive_rendering: boolean;  // 점진적 렌더링
    no_layout_shift: boolean;       // 레이아웃 시프트 없음 (CLS)
    smooth_scrolling: boolean;      // 스크롤 부드러움
  };
  
  // 12. 크로스 브라우저 검증
  compatibility: {
    chrome_rendering: boolean;       // Chrome 렌더링 정상
    firefox_rendering: boolean;      // Firefox 렌더링 정상
    safari_rendering: boolean;       // Safari 렌더링 정상
    edge_rendering: boolean;         // Edge 렌더링 정상
    mobile_browsers: boolean;        // 모바일 브라우저 정상
    legacy_support: boolean;         // 레거시 브라우저 대응
  };
}
```

## 🛠️ 실행 방법

### Developer AI 필수 실행 스크립트
```bash
# 1. 코드 작성 완료 후
npm run type-check
grep -n "text-|bg-" [component].tsx  # 하드코딩 검사

# 2. 개발 서버 실행
npm run dev

# 3. Playwright로 시각적 검증 (필수!)
npx playwright test visual-verification.spec.ts

# 4. 스크린샷 저장
/screenshots/
  ├── [component]-default.png
  ├── [component]-hover.png
  ├── [component]-active.png
  └── [component]-mobile.png
```

### Playwright 검증 스크립트 템플릿
```javascript
// visual-verification.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Verification: [Component Name]', () => {
  test('should render correctly', async ({ page }) => {
    // 1. 페이지 로드
    await page.goto('/test-[component]');
    
    // 2. 컴포넌트 확인
    const component = await page.$('[data-testid="component"]');
    expect(component).toBeTruthy();
    
    // 3. 스크린샷 - 기본 상태
    await page.screenshot({ 
      path: 'screenshots/[component]-default.png',
      fullPage: true 
    });
    
    // 4. 호버 상태
    await component.hover();
    await page.screenshot({ 
      path: 'screenshots/[component]-hover.png' 
    });
    
    // 5. 시각적 요소 검증
    const hasProperStyling = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="component"]');
      const styles = window.getComputedStyle(el);
      return {
        hasBackground: styles.backgroundColor !== 'rgba(0, 0, 0, 0)',
        hasBorder: styles.borderWidth !== '0px',
        hasShadow: styles.boxShadow !== 'none',
        isVisible: styles.display !== 'none'
      };
    });
    
    // 6. 모든 스타일 적용 확인
    expect(hasProperStyling.hasBackground).toBe(true);
    expect(hasProperStyling.hasBorder).toBe(true);
    expect(hasProperStyling.hasShadow).toBe(true);
    expect(hasProperStyling.isVisible).toBe(true);
  });
});
```

## ❌ 실패 시 조치

### 시각적 검증 실패 시
1. **즉시 중단** - 더 이상 진행하지 않음
2. **스크린샷 분석** - 무엇이 잘못됐는지 확인
3. **토큰 값 검증** - undefined나 잘못된 값 체크
4. **스타일 우선순위 확인** - className vs style 충돌
5. **재작업** - 문제 수정 후 처음부터 다시 검증

### 보고 형식
```markdown
## Visual Verification Report

### ✅ Stage 1: Code Verification
- TypeScript: PASS
- Linting: PASS
- No hardcoded values: PASS

### ✅ Stage 2: Rendering Verification  
- Server running: PASS
- Page loads: PASS
- No console errors: PASS

### ❌ Stage 3: Visual Verification
- Screenshot captured: YES
- **Issue Found**: 
  - Card container not visible
  - No shadows or borders
  - Stars not showing proper color
  - Layout broken
  
**Status**: FAILED - Requires rework
```

## 🎯 성공 기준

컴포넌트가 "완료"되려면:
1. ✅ 모든 코드 검증 통과
2. ✅ 렌더링 에러 없음
3. ✅ **스크린샷에서 시각적으로 완벽함**
4. ✅ 사용자가 실제로 사용 가능한 수준

## 🔥 핵심 메시지

**"보이지 않으면 존재하지 않는 것이다"**

Developer AI는 반드시:
- 브라우저에서 직접 확인
- 스크린샷 촬영 및 검증
- 시각적 문제 발견 시 즉시 보고
- 완벽한 UI가 될 때까지 반복

---

*이 프로토콜은 모든 UI 작업에 필수 적용됩니다. 위반 시 작업은 "미완료"로 처리됩니다.*