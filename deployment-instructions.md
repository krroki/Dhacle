# Dhacle Deployment Instructions

## Task R-1.2 완료 상태

✅ **완료된 작업:**
1. theme.deep.json 토큰 기반 중앙화된 디자인 시스템 구축
2. ThemeProvider 및 React Context를 통한 글로벌 테마 관리
3. StripeButton, StripeCard, StripeTypography 컴포넌트 생성
4. 스타일 가이드 페이지 (/style-guide) 제작 완료
5. 모든 TypeScript 및 빌드 오류 해결
6. 로컬 개발 서버 정상 작동 (http://localhost:3010)

## Vercel 배포 방법

### 1. Vercel 계정 로그인
```bash
cd dhacle-frontend
vercel login
```
이메일을 입력하고 인증 링크를 통해 로그인합니다.

### 2. 프로젝트 배포
```bash
vercel
```
또는
```bash
npx vercel --prod
```

### 3. 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `KAKAO_CLIENT_ID`
- `KAKAO_CLIENT_SECRET`

### 4. 도메인 설정 (선택사항)
Vercel 대시보드에서 커스텀 도메인을 연결할 수 있습니다.

## 디자인 시스템 사용 방법

### 컴포넌트 사용 예시
```tsx
import { StripeButton } from '@/components/design-system/StripeButton';
import { StripeCard } from '@/components/design-system/StripeCard';
import { StripeTypography } from '@/components/design-system/StripeTypography';

// Button 사용
<StripeButton variant="primary" size="md">
  Click Me
</StripeButton>

// Typography 사용
<StripeTypography variant="h1" color="dark">
  Heading Text
</StripeTypography>

// Card 사용
<StripeCard>
  <StripeTypography variant="h4">Card Title</StripeTypography>
  <StripeTypography variant="body" color="muted">
    Card content here
  </StripeTypography>
</StripeCard>
```

### 테마 토큰 직접 사용
```tsx
import { useTheme } from '@/lib/theme/ThemeProvider';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <div style={{ 
      backgroundColor: theme.colors.primary.blue.default,
      padding: theme.spacing['4'],
      borderRadius: theme.borderRadius.lg
    }}>
      Content
    </div>
  );
}
```

## 중요 규칙 (CLAUDE.md에 명시)

⚠️ **절대 준수 사항:**
1. **theme.deep.json 토큰만 사용**: 모든 디자인 값은 반드시 theme.deep.json에서 가져와야 함
2. **중앙화된 컴포넌트 사용**: StripeButton, StripeCard, StripeTypography 사용
3. **하드코딩 금지**: 색상, 크기, 간격 등을 직접 입력하지 말 것
4. **ThemeProvider 필수**: 모든 페이지는 ThemeProvider 내부에 있어야 함

## 현재 상태

- ✅ 로컬 개발 서버: http://localhost:3010
- ✅ 스타일 가이드: http://localhost:3010/style-guide
- ⏳ Vercel 배포: 로그인 필요

## 다음 단계

1. Vercel에 로그인하여 배포 완료
2. 환경 변수 설정
3. 프로덕션 URL 확인
4. 도메인 연결 (선택사항)