# 🎯 디하클(Dhacle) - YouTube Shorts 크리에이터 교육 플랫폼

> YouTube Shorts 크리에이터를 위한 교육 및 커뮤니티 플랫폼

## 📌 프로젝트 정보

- **버전**: 1.0.0
- **배포 URL**: https://dhacle.com
- **기술 스택**: Next.js 15.4.6 + TypeScript + Supabase + shadcn/ui
- **호스팅**: Vercel
- **최종 업데이트**: 2025-02-02

## 🚀 빠른 시작

### 1. 설치
```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.env.local)
cp .env.example .env.local
# 필수 환경 변수는 아래 참조
```

### 2. 개발
```bash
# 개발 서버 실행
npm run dev

# 타입 체크
npm run types:check

# 린트 실행
npm run lint:biome:fix
```

### 3. 빌드 및 배포
```bash
# 빌드 테스트
npm run build

# 프로덕션 실행
npm run start
```

## 🔑 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key  # 서버 전용

# API Key 암호화 (필수)
ENCRYPTION_KEY=your_64_character_hex_key

# TossPayments (결제)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
```

## 📚 프로젝트 문서 체계

이 프로젝트는 **13개 핵심 문서 체계**로 관리됩니다:

### 필수 확인 문서
- **[CLAUDE.md](/CLAUDE.md)** - AI 작업 지침서와 규칙
- **[docs/PROJECT.md](/docs/PROJECT.md)** - 프로젝트 현황과 이슈 추적
- **[docs/CODEMAP.md](/docs/CODEMAP.md)** - 프로젝트 구조와 기술 스택

### 기술 문서
- **[docs/DATA_MODEL.md](/docs/DATA_MODEL.md)** - 데이터 모델과 타입 시스템
- **[docs/FLOWMAP.md](/docs/FLOWMAP.md)** - 사용자 플로우와 인증 경로
- **[docs/WIREFRAME.md](/docs/WIREFRAME.md)** - UI-API 연결 상태
- **[docs/ROUTE_SPEC.md](/docs/ROUTE_SPEC.md)** - 라우트 구조와 보호 상태
- **[docs/COMPONENT_INVENTORY.md](/docs/COMPONENT_INVENTORY.md)** - 재사용 가능 컴포넌트
- **[docs/STATE_FLOW.md](/docs/STATE_FLOW.md)** - 상태 관리 패턴
- **[docs/ERROR_BOUNDARY.md](/docs/ERROR_BOUNDARY.md)** - 에러 처리 전략

### 작업 문서
- **[docs/CHECKLIST.md](/docs/CHECKLIST.md)** - 작업 검증 체크리스트
- **[docs/DOCUMENT_GUIDE.md](/docs/DOCUMENT_GUIDE.md)** - 문서 가이드라인
- **[docs/INSTRUCTION_TEMPLATE_v9.md](/docs/INSTRUCTION_TEMPLATE_v9.md)** - AI 지시서 템플릿

## 🏗️ 프로젝트 구조

```
9.Dhacle/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (pages)/           # 페이지 그룹
│   │   ├── api/               # API Routes
│   │   └── auth/              # 인증 관련
│   ├── components/            # React 컴포넌트
│   │   ├── ui/               # shadcn/ui 컴포넌트
│   │   └── layout/           # 레이아웃 컴포넌트
│   ├── lib/                   # 유틸리티
│   │   ├── supabase/         # Supabase 클라이언트
│   │   └── security/         # 보안 모듈
│   └── types/                # TypeScript 타입
├── docs/                      # 13개 핵심 문서
├── scripts/                   # 자동화 스크립트
└── supabase/                 # DB 마이그레이션
```

## 🔒 보안 체계

- **Wave 0-3 보안**: 인증, RLS, Rate Limiting, XSS 방지 완료
- **API 표준화**: 38/38 routes 100% 표준화
- **타입 안전성**: TypeScript strict mode, any 타입 0개

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run e2e

# 보안 테스트
npm run security:test
```

## 📊 현재 상태

- ✅ **YouTube Lens**: 100% 구현 완료
- ✅ **TypeScript 타입 시스템**: v2.0 Single Source of Truth
- ✅ **보안**: Wave 0-3 완료, Rate Limiting 적용
- ✅ **코드 품질**: Biome 린팅 67% 개선
- ⚠️ **RLS 정책**: SQL 작성 완료, 프로덕션 적용 대기

## 🤝 기여 가이드

1. **문서 우선**: 13개 핵심 문서 체계 숙지
2. **AI 작업**: CLAUDE.md 지침 준수
3. **타입 시스템**: `@/types`에서만 import
4. **코드 스타일**: Biome + Tailwind CSS
5. **보안**: 모든 API에 인증 체크 필수

## 📝 라이선스

Private Project - All Rights Reserved

## 🔗 관련 링크

- [프로덕션 사이트](https://dhacle.com)
- [Supabase Dashboard](https://supabase.com/dashboard/project/golbwnsytwbyoneucunx)
- [Vercel Dashboard](https://vercel.com/dashboard)

---

*자세한 내용은 `/docs` 폴더의 13개 핵심 문서를 참조하세요.*