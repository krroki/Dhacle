#!/bin/bash

# Vercel 환경변수 자동 설정 스크립트
# 카카오 OAuth 문제 해결을 위한 프로덕션 환경변수 설정

echo "🚀 Vercel 환경변수 설정 시작..."
echo ""

# Vercel CLI가 설치되어 있는지 확인
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI가 설치되지 않았습니다."
    echo "설치 명령: npm i -g vercel"
    exit 1
fi

echo "📋 설정할 환경변수들:"
echo "   NEXT_PUBLIC_SITE_URL=https://dhacle.com"
echo "   NEXT_PUBLIC_APP_URL=https://dhacle.com"
echo "   NEXT_PUBLIC_API_URL=https://dhacle.com/api"
echo ""

read -p "계속하시겠습니까? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 환경변수 설정
echo "🔧 환경변수 설정 중..."

vercel env add NEXT_PUBLIC_SITE_URL production <<< "https://dhacle.com"
vercel env add NEXT_PUBLIC_APP_URL production <<< "https://dhacle.com" 
vercel env add NEXT_PUBLIC_API_URL production <<< "https://dhacle.com/api"

echo ""
echo "✅ 환경변수 설정 완료!"
echo ""
echo "📋 다음 단계:"
echo "   1. vercel --prod 명령으로 재배포"
echo "   2. 카카오 개발자 콘솔에서 Redirect URI 확인"
echo "   3. Supabase Dashboard에서 OAuth 설정 확인"
echo ""
echo "🔗 설정 가이드: ./KAKAO_OAUTH_FIX_GUIDE.md 참고"
