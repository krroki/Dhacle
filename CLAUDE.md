# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Name**: 쇼츠 스튜디오 (Shorts Studio)

This is a community platform for YouTube Shorts creators focused on education and resource sharing. The project aims to build an independent website that combines:
- Course introductions and educational content
- E-book sharing and distribution
- Open chat room links for community networking
- The intuitive information structure of https://passive.ai.kr/
- The premium design system and dynamic UX of https://stripe.com/

## 🚨 CRITICAL: Design System Rules (MUST READ)

**MANDATORY**: ALL styling MUST use theme.deep.json tokens through centralized design system

### ❌ NEVER DO THIS:
```tsx
// WRONG - Hardcoded colors
<div style={{ color: '#ffffff' }}>
<div className="text-white">

// WRONG - Inline styles without tokens  
<button style={{ backgroundColor: 'blue' }}>

// WRONG - Direct Tailwind without Stripe tokens
<div className="bg-blue-500">
```

### ✅ ALWAYS DO THIS:
```tsx
// CORRECT - Use design system components
import { StripeButton, StripeCard, StripeTypography } from '@/components/design-system'
import { useTheme } from '@/lib/theme/ThemeProvider'

// Use components
<StripeButton variant="primary">Click me</StripeButton>
<StripeTypography variant="h2" color="dark">Title</StripeTypography>

// Access theme tokens when needed
const theme = useTheme();
<div style={{ color: theme.colors.text.primary.default }}>
```

### Design System Components (Fully Tokenized):

#### Core Components:
- **StripeButton**: 
  - Variants: primary, secondary, ghost, gradient
  - Sizes: sm, md, lg
  - States: loading, disabled, hover
  - Features: icons, full width support
  
- **StripeCard**: 
  - Variants: default, bordered, elevated, gradient
  - Elevation levels: none, sm, md, lg, xl
  - Padding options: none, sm, md, lg
  - Gradient types: primary, stripe, hero
  
- **StripeTypography**:
  - Variants: h1, h2, h3, h4, body, caption, code
  - Colors: primary, dark, light, muted, inverse
  - Full token integration for fonts, sizes, weights
  
- **StripeGradient**:
  - Variants: primary, stripe, hero, custom
  - Directions: 8 directional options
  - Features: animated mouse tracking, blur effects, overlays
  
- **StripeInput & StripeTextarea**:
  - Variants: default, outlined, filled, ghost
  - States: error, success, focused, disabled
  - Sizes: sm, md, lg
  - Features: labels, hints, icons, validation

#### Theme System:
- **ThemeProvider**: Enhanced context with helper functions
  - `useTheme()`: Access theme tokens and helpers
  - `getToken(path)`: Get nested token values
  - `getCSSVar(name)`: Get CSS variable values
  
- **Token Structure** (theme.deep.json):
  - Colors: primary, neutral, text, button tokens
  - Typography: fonts, sizes, weights, line heights
  - Spacing: 0-32 scale with px precision
  - Effects: shadows, transitions, transforms, opacity
  - Border radius: sm to full scale
  - Gradients: hero, primary, stripe patterns

## Tech Stack

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS with theme.deep.json tokens
- **Design System**: Centralized components using Stripe tokens
- **Theme**: theme.deep.json (extracted from Stripe.com)
- **Animation**: Token-based transitions and transforms
- **Icons**: Heroicons or Feather Icons
- **Fonts**: Sohne-var (Stripe font), system fonts fallback

### Backend
- **Framework**: Python FastAPI
- **Audio Processing**: Python audio libraries for subtitle generation, silence detection and removal

### Infrastructure
- **Database**: Supabase (PostgreSQL-based)
- **Authentication**: Kakao OAuth 2.0
- **Frontend Deployment**: Vercel
- **Backend Deployment**: AWS Lambda or Naver Cloud Functions
- **Storage**: Supabase Storage for file uploads

## Development Commands

```bash
# Frontend (Next.js)
npm install              # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run lint            # Run linter

# Backend (FastAPI)
pip install -r requirements.txt    # Install Python dependencies
uvicorn main:app --reload         # Start development server with auto-reload

# Database (Supabase)
npx supabase init       # Initialize Supabase project
npx supabase start      # Start local Supabase
npx supabase db push    # Push schema changes
```

## Architecture Overview

### Frontend Structure
```
/src
  /components       # Reusable UI components following Stripe design system
    /design-system # Centralized Stripe-inspired components (ALL TOKENIZED)
      StripeButton.tsx      # Button with 4 variants, 3 sizes, loading states
      StripeCard.tsx        # Card with elevation, gradients, hover effects
      StripeTypography.tsx  # Typography system (h1-h4, body, caption, code)
      StripeGradient.tsx    # Dynamic gradient backgrounds with animations
      StripeInput.tsx       # Input/Textarea with validation states
      index.ts             # Central export for all design system components
    /ui            # Base components (Button, Card, Input, etc.)
    /sections      # Page sections (Hero, Features, Pricing, etc.)
    /layouts       # Layout components (Header, Footer, etc.)
  /pages           # Next.js pages
    /design-system # Showcase page for all components
  /lib             # Utility functions and API clients
    /theme         # Theme management system
      ThemeProvider.tsx  # Enhanced theme context with helpers
      theme.ts          # Token exports from theme.deep.json
    /supabase      # Supabase client configuration
    /kakao         # Kakao OAuth integration
  /styles          # Global styles and Tailwind config
  /hooks           # Custom React hooks
  /types           # TypeScript type definitions
```

### Backend Structure
```
/app
  /api             # API endpoints
    /auth          # Kakao authentication endpoints
    /subtitle      # Subtitle generation endpoints
    /courses       # Course management endpoints
    /ebooks        # E-book management endpoints
    /community     # Community links and chat room endpoints
    /admin         # Admin CMS endpoints
  /services        # Business logic
    /audio         # Audio processing and silence detection
    /subtitle      # Subtitle generation logic
    /srt           # SRT file generation
  /models          # Database models
  /utils           # Utility functions
```

## Key Features to Implement

### 1. Subtitle Generator (자막 생성기)
- Accept audio files (mp3, m4a, wav)
- Process audio for speech-to-text conversion
- Detect and remove silence sections
- Generate .srt subtitle files
- Provide download links

### 2. Authentication System
- Kakao OAuth 2.0 integration
- User profile management
- Session handling with Supabase Auth

### 3. Content Management
- Admin panel for managing:
  - Course introductions and descriptions
  - E-books (PDF files) for sharing
  - Open chat room links
  - Announcements
  - FAQs
  - Community resources

### 4. Design System Implementation
Following Stripe's design principles:
- Dynamic gradients with mouse/scroll interaction
- Generous whitespace and 12-column grid system
- Scroll-triggered animations (fade-in, slide-up)
- Hover effects with subtle scale and shadow changes
- Skeleton UI for loading states

## Color System (Deprecated - See theme.json)
**Note**: All color values are now managed through `theme.json`. The values below are for reference only.

The design system uses a comprehensive token-based approach with:
- **Background colors**: Default, subtle, elevated, and overlay variants
- **Text colors**: Primary, secondary, muted, and inverted options
- **Accent colors**: Primary and secondary with hover/active states
- **Gradients**: Dynamic gradients using accent color tokens
- **Surface colors**: Card backgrounds with hover and active states

To view or modify colors, edit `theme.json` in the project root.

## Page Structure

### Home Page (/)
1. **Hero Section**: Dynamic gradient background, headline "쇼츠 크리에이터를 위한 모든 것", CTA button [커뮤니티 참여하기]
2. **Social Proof**: "N사 공식 카페 회원 00,000명이 함께합니다" with community logos
3. **Feature 1**: Course Introduction "전문가의 노하우를 배우세요" (left text, right mockup)
4. **Feature 2**: E-book Sharing "성공한 크리에이터들의 노하우 전자책" (left mockup, right text)
5. **Feature 3**: Subtitle Generator "간편한 자막 생성 도구" (left text, right mockup)
6. **Community Section**: "함께 성장하는 크리에이터 커뮤니티" with card layout - [오픈 채팅방], [FAQ], [쇼츠 제작 꿀팁]
7. **Pricing Section**: "모든 자료는 현재 무료로 제공됩니다" with future course teaser
8. **Final CTA**: "지금 바로 쇼츠 스튜디오와 함께 당신의 채널을 성장시키세요"

## Development Priorities

### Sprint 1: Foundation (2-3 days)
- Set up Next.js with TypeScript
- Implement Stripe-inspired design system components
- Configure Tailwind CSS with custom theme

### Sprint 2: Core Features (3-4 days)
- Build page layouts using passive.ai.kr structure
- Implement Kakao OAuth authentication
- Create subtitle generator (frontend + backend)
- Set up course introduction pages
- Implement e-book sharing system

### Sprint 3: Content & Testing (2 days)
- Build admin CMS for content management
- Add customer support chat integration
- Test responsive design across devices

### Sprint 4: Deployment (1 day)
- Deploy frontend to Vercel
- Deploy backend to serverless environment
- Configure domain and SSL

## Design System (Token-Based Architecture)

### Overview
The entire design system is now driven by a Single Source of Truth: `theme.json`. This file contains all visual design tokens extracted from Stripe.com using Playwright automation.

### Token Structure
- **Colors**: Background, text, accent, border, and surface colors with variants
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Consistent spacing scale from 0 to 64 units
- **Shadows**: Multiple shadow levels including glow effects
- **Animation**: Durations and easing functions
- **Border Radius**: Consistent corner radius scale
- **Opacity & Blur**: Standardized transparency and blur values

### Usage Guidelines
1. **No Hardcoded Values**: Never hardcode color, spacing, or other style values
2. **Token-First**: Always use Tailwind utility classes that reference tokens
3. **Consistency**: The theme.json file is the only source for design values
4. **Updates**: To modify the design system, update theme.json and Tailwind will automatically reflect changes

### Token Update Process
1. Modify values in `theme.json`
2. Tailwind configuration automatically loads the updated tokens
3. All components using those tokens will update automatically
4. No need to search and replace hardcoded values

## Important Notes

1. **Korean Context**: This project is primarily for Korean users. Ensure proper Korean language support and cultural considerations.

2. **Reference Sites**: Always refer to:
   - Structure: https://passive.ai.kr/
   - Design/UX: https://stripe.com/

3. **Performance**: Prioritize fast loading times with SSR/SSG in Next.js

4. **Accessibility**: Ensure WCAG compliance for all interactive elements

5. **Mobile-First**: Design and test for mobile devices as primary platform

## API Integration Points

- Kakao OAuth API for authentication
- Supabase REST API for database operations
- Channel Talk or Kakao Channel for customer support (floating chat button in bottom-right)
- File upload APIs for e-book and audio file management

## Header Navigation Structure

- **Left**: Text logo "쇼츠 스튜디오"
- **Center**: Navigation links - [툴박스], [자료실], [커뮤니티]
- **Right**: [카카오 로그인] button (changes to '마이페이지' and profile icon after login)