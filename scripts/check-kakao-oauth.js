#!/usr/bin/env node
/**
 * 카카오 OAuth 설정 체크 스크립트
 * 
 * 목적: 카카오 로그인 문제 진단을 위한 환경 설정 체크
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 카카오 OAuth 설정 체크 시작\n');

// 1. 환경변수 체크
console.log('1️⃣ 환경변수 체크');
console.log('─'.repeat(50));

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Supabase 설정 체크
  const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
  const supabaseAnonKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1];
  const siteUrl = envContent.match(/NEXT_PUBLIC_SITE_URL=(.+)/)?.[1];
  
  console.log(`✅ SUPABASE_URL: ${supabaseUrl ? '설정됨' : '❌ 누락'}`);
  console.log(`   → ${supabaseUrl || 'NOT SET'}`);
  
  console.log(`✅ SUPABASE_ANON_KEY: ${supabaseAnonKey ? '설정됨' : '❌ 누락'}`);
  console.log(`   → ${supabaseAnonKey ? supabaseAnonKey.substring(0, 30) + '...' : 'NOT SET'}`);
  
  console.log(`⚠️  SITE_URL: ${siteUrl || 'NOT SET'}`);
  console.log(`   → 프로덕션: https://dhacle.com 이어야 함`);
  
} else {
  console.log('❌ .env.local 파일이 존재하지 않습니다!');
}

console.log('\n');

// 2. 필수 파일 체크
console.log('2️⃣ 필수 파일 체크');
console.log('─'.repeat(50));

const requiredFiles = [
  'src/components/features/auth/KakaoLoginButton.tsx',
  'src/app/auth/callback/route.ts',
  'src/app/auth/error/page.tsx',
  'src/app/onboarding/page.tsx'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n');

// 3. KakaoLoginButton 설정 체크
console.log('3️⃣ KakaoLoginButton 설정 체크');
console.log('─'.repeat(50));

const buttonPath = path.join(process.cwd(), 'src/components/features/auth/KakaoLoginButton.tsx');
if (fs.existsSync(buttonPath)) {
  const buttonContent = fs.readFileSync(buttonPath, 'utf8');
  
  // redirectTo 설정 체크
  const redirectToMatch = buttonContent.match(/redirectTo:\s*`([^`]+)`/);
  if (redirectToMatch) {
    console.log(`✅ redirectTo 설정: ${redirectToMatch[1]}`);
  } else {
    console.log('❌ redirectTo 설정을 찾을 수 없습니다');
  }
  
  // OAuth 스코프 체크
  const scopesMatch = buttonContent.match(/scopes:\s*'([^']+)'/);
  if (scopesMatch) {
    console.log(`✅ OAuth 스코프: ${scopesMatch[1]}`);
  } else {
    console.log('⚠️  OAuth 스코프가 설정되지 않았습니다');
  }
} else {
  console.log('❌ KakaoLoginButton.tsx 파일을 찾을 수 없습니다');
}

console.log('\n');

// 4. 해결책 제시
console.log('🚨 카카오 로그인 문제 해결 체크리스트');
console.log('─'.repeat(50));
console.log('');
console.log('📋 카카오 개발자 콘솔 설정 (https://developers.kakao.com)');
console.log('   1. 애플리케이션 선택 → 제품 설정 → 카카오 로그인');
console.log('   2. Redirect URI 추가:');
console.log('      ✓ https://dhacle.com/auth/callback');
console.log('      ✓ https://golbwnsytwbyoneucunx.supabase.co/auth/v1/callback');
console.log('');
console.log('📋 Supabase Dashboard 설정 (https://supabase.com/dashboard)');
console.log('   1. 프로젝트 선택 → Authentication → Providers → Kakao');
console.log('   2. 설정 확인:');
console.log('      ✓ Site URL: https://dhacle.com');
console.log('      ✓ Redirect URLs: https://dhacle.com/auth/callback');
console.log('');
console.log('📋 Vercel 환경변수 설정');
console.log('   1. Vercel Dashboard → 프로젝트 → Settings → Environment Variables');
console.log('   2. 환경변수 추가/수정:');
console.log('      ✓ NEXT_PUBLIC_SITE_URL = https://dhacle.com');
console.log('');
console.log('⚡ 설정 완료 후 Vercel 재배포 필수!');
console.log('   vercel --prod');
console.log('\n');

console.log('🔍 체크 완료 - 위 설정들을 확인하고 수정해주세요!');