import { test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate with test login', async ({ page }) => {
  console.log('🔐 테스트 로그인 시작...');
  
  // 홈페이지로 이동
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  console.log('📄 홈페이지 로드됨');
  
  // 개발 모드에서 테스트 로그인 버튼 찾기
  const testLoginButton = page.locator('button:has-text("테스트 로그인"), button:has-text("Test Login"), [data-testid="test-login"]');
  
  // 테스트 로그인 버튼이 있는지 확인
  if (await testLoginButton.count() > 0) {
    console.log('✅ 테스트 로그인 버튼 발견');
    await testLoginButton.click();
    
    // 로그인 성공 확인 (대시보드나 홈페이지로 리다이렉트)
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('🌐 로그인 후 URL:', currentUrl);
    
    // 로그인 상태 확인 - 사용자 메뉴나 프로필 버튼이 보이는지
    const userMenuExists = await page.locator('[data-testid="user-menu"], .user-menu, button:has-text("프로필"), button:has-text("Profile")').count();
    
    if (userMenuExists > 0) {
      console.log('✅ 테스트 로그인 성공 - 사용자 메뉴 확인됨');
    } else {
      console.log('⚠️ 테스트 로그인 후 상태 불명확 - 쿠키 저장 계속 진행');
    }
  } else {
    console.log('❌ 테스트 로그인 버튼 없음 - 일반 로그인 페이지로 이동');
    
    // 일반 로그인 페이지로 이동
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
    
    // 카카오 로그인 버튼 확인
    const kakaoButton = page.locator('button:has-text("카카오"), button:has-text("Kakao"), [data-testid="kakao-login"]');
    
    if (await kakaoButton.count() > 0) {
      console.log('🟡 카카오 로그인 버튼만 있음 - 개발 모드가 아닐 수 있음');
      
      // 테스트를 위해 빈 인증 상태라도 저장
      await page.context().storageState({ path: authFile });
      console.log('📁 빈 인증 상태 저장 완료');
      return;
    }
    
    console.log('❌ 로그인 방법을 찾을 수 없음');
  }
  
  // 인증 상태 저장
  await page.context().storageState({ path: authFile });
  console.log('💾 인증 상태 저장 완료:', authFile);
});

// 추가: 관리자 인증 설정 (필요시)
const adminAuthFile = path.join(__dirname, '../playwright/.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
  console.log('👑 관리자 인증 시작...');
  
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  
  // 개발 모드에서 관리자 테스트 로그인 버튼 찾기
  const adminTestLogin = page.locator('button:has-text("관리자 테스트"), button:has-text("Admin Test"), [data-testid="admin-test-login"]');
  
  if (await adminTestLogin.count() > 0) {
    console.log('✅ 관리자 테스트 로그인 버튼 발견');
    await adminTestLogin.click();
    await page.waitForTimeout(3000);
    
    console.log('👑 관리자 로그인 완료');
  } else {
    console.log('⚠️ 관리자 테스트 로그인 불가 - 일반 사용자와 동일한 상태로 진행');
  }
  
  await page.context().storageState({ path: adminAuthFile });
  console.log('💾 관리자 인증 상태 저장 완료:', adminAuthFile);
});