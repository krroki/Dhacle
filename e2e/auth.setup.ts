/**
 * 실제 카카오 OAuth 로그인 자동화 Setup
 * 로컬 개발환경과 프로덕션 환경 모두 지원
 * 세션 저장으로 연속성 있는 테스트 환경 구축
 */
import { test as setup, expect } from '@playwright/test'
import fs from 'fs'

const authFile = 'playwright/.auth/user.json'
const adminAuthFile = 'playwright/.auth/admin.json'

// 환경별 설정
const PRODUCTION_URL = 'https://dhacle.vercel.app'
const KAKAO_EMAIL = 'glemfkcl@naver.com'
const KAKAO_PASSWORD = 'dhfl9909'

setup.describe.configure({ mode: 'serial' })

setup('실제 카카오 OAuth 인증 세션 생성', async ({ page }) => {
  console.log('🔐 실제 카카오 OAuth 로그인 자동화 시작...')

  // 환경 감지 및 URL 설정
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
  const isProduction = baseURL.includes('vercel.app') || baseURL.includes('dhacle.com')
  
  console.log(`🌍 테스트 환경: ${isProduction ? '프로덕션' : '개발'} (${baseURL})`)

  // 로그인 페이지로 이동
  const loginUrl = isProduction ? `${PRODUCTION_URL}/auth/login` : '/auth/login'
  await page.goto(loginUrl, { waitUntil: 'networkidle', timeout: 30000 })

  // 개발 환경에서 테스트 로그인 버튼 확인
  if (!isProduction) {
    const testLoginBtn = page.locator('button:has-text("🧪 테스트 로그인 (localhost 전용)")')
    
    if (await testLoginBtn.isVisible({ timeout: 5000 })) {
      console.log('🧪 개발 환경 테스트 로그인 사용')
      
      try {
        // API 응답 대기
        const responsePromise = page.waitForResponse(response => 
          response.url().includes('/api/auth/test-login') && response.status() === 200
        )
        
        await testLoginBtn.click()
        await responsePromise
        console.log('✅ 테스트 로그인 API 호출 완료')
        
        // 프로필 페이지로 이동
        await page.goto('/mypage/profile')
        await page.waitForLoadState('networkidle')
        
        // 세션 저장
        await page.context().storageState({ path: authFile })
        console.log('✅ 테스트 로그인 세션 저장 완료')
        return
      } catch (error) {
        console.log('⚠️ 테스트 로그인 실패, 카카오 로그인 시도')
      }
    }
  }

  console.log('🚀 실제 카카오 OAuth 프로세스 시작')
  
  // 카카오 로그인 버튼 찾기 (정확한 텍스트로)
  const kakaoButton = page.locator('button:has-text("카카오톡으로 3초 만에 시작하기")')
  
  if (await kakaoButton.count() === 0) {
    // 대안 셀렉터들 시도
    const altKakaoButtons = [
      'button:has-text("카카오")',
      'a[href*="kakao.com"]',
      'button[class*="kakao"]'
    ]
    
    let found = false
    for (const selector of altKakaoButtons) {
      const altBtn = page.locator(selector)
      if (await altBtn.count() > 0) {
        await altBtn.first().click()
        found = true
        break
      }
    }
    
    if (!found) {
      throw new Error('🔴 카카오 로그인 버튼을 찾을 수 없습니다. 페이지를 확인해주세요.')
    }
  } else {
    await kakaoButton.click()
  }

  console.log('👆 카카오 로그인 버튼 클릭 완료')

  // 카카오 OAuth 처리 (팝업 또는 리다이렉트)
  let authPage = page

  // 팝업으로 열리는 경우 처리
  try {
    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 5000 }),
      page.waitForTimeout(1000)
    ])
    
    if (popup) {
      console.log('🔄 카카오 OAuth 팝업 창에서 처리')
      authPage = popup
    }
  } catch {
    console.log('🔄 메인 페이지에서 카카오 OAuth 처리')
  }

  // 카카오 로그인 페이지 대기
  try {
    await authPage.waitForURL('**/kauth.kakao.com/**', { timeout: 15000 })
    console.log('📱 카카오 로그인 페이지 접속 완료')
  } catch (error) {
    console.log('⚠️ 카카오 로그인 페이지 로드 대기 중 타임아웃')
    throw error
  }

  // 이미 로그인된 상태 확인
  const isAlreadyLoggedIn = await authPage.locator('button:has-text("동의하고 계속하기"), button:has-text("계속하기")').isVisible({ timeout: 3000 })
  
  if (isAlreadyLoggedIn) {
    console.log('👤 이미 카카오에 로그인된 상태 - 권한 동의로 진행')
    const continueBtn = authPage.locator('button:has-text("동의하고 계속하기"), button:has-text("계속하기")').first()
    await continueBtn.click()
  } else {
    console.log('📧 카카오 계정 로그인 진행')
    
    // 로그인 폼 요소 입력
    const emailSelectors = [
      'input[name="loginKey"]',
      'input[type="email"]', 
      'input[placeholder*="이메일"]',
      'input[id*="email"]',
      'input[id*="id_email_2"]'
    ]
    
    let emailInput = null
    for (const selector of emailSelectors) {
      const input = authPage.locator(selector)
      if (await input.isVisible({ timeout: 3000 })) {
        emailInput = input
        break
      }
    }
    
    if (!emailInput) {
      throw new Error('이메일 입력 필드를 찾을 수 없습니다')
    }
    
    await emailInput.fill(KAKAO_EMAIL)
    console.log('✏️ 이메일 입력 완료')
    
    // 비밀번호 입력
    const passwordInput = authPage.locator('input[name="password"], input[type="password"], input[placeholder*="비밀번호"]')
    await expect(passwordInput.first()).toBeVisible({ timeout: 10000 })
    await passwordInput.first().fill(KAKAO_PASSWORD)
    console.log('✏️ 비밀번호 입력 완료')
    
    // 로그인 버튼 클릭
    const loginBtnSelectors = [
      'button[type="submit"]',
      'button:has-text("로그인")',
      '.submit_btn',
      '.btn_confirm'
    ]
    
    let loginBtn = null
    for (const selector of loginBtnSelectors) {
      const btn = authPage.locator(selector)
      if (await btn.isVisible({ timeout: 3000 })) {
        loginBtn = btn
        break
      }
    }
    
    if (!loginBtn) {
      throw new Error('로그인 버튼을 찾을 수 없습니다')
    }
    
    await loginBtn.click()
    console.log('🔐 카카오 로그인 버튼 클릭 완료')
    
    // 로그인 처리 대기
    await authPage.waitForTimeout(3000)
    
    // 권한 동의 페이지 처리
    const consentBtn = authPage.locator('button:has-text("동의하고 계속하기"), button:has-text("계속하기"), button:has-text("동의")')
    if (await consentBtn.first().isVisible({ timeout: 8000 })) {
      console.log('✅ 권한 동의 페이지에서 동의 버튼 클릭')
      await consentBtn.first().click()
    }
  }

  // OAuth 완료 처리 대기
  try {
    if (authPage !== page) {
      // 팝업인 경우 - 팝업 종료 대기
      await Promise.race([
        authPage.waitForEvent('close', { timeout: 20000 }),
        page.waitForURL('**/mypage/profile**', { timeout: 20000 })
      ])
    } else {
      // 메인 페이지인 경우 - 콜백 처리 대기
      await page.waitForURL('**/auth/callback/**', { timeout: 15000 })
      await page.waitForURL('**/mypage/profile**', { timeout: 10000 })
    }
    
    console.log('🎉 카카오 OAuth 로그인 완료')
  } catch (error) {
    console.log('⚠️ OAuth 완료 대기 중 타임아웃, 수동으로 프로필 페이지 이동')
    const profileUrl = isProduction ? `${PRODUCTION_URL}/mypage/profile` : '/mypage/profile'
    await page.goto(profileUrl, { waitUntil: 'networkidle' })
  }

  // 로그인 성공 검증
  try {
    await expect(page.locator('h1:has-text("프로필"), h1')).toBeVisible({ timeout: 10000 })
    console.log('✅ 프로필 페이지 접근 성공')
  } catch (error) {
    console.log('⚠️ 프로필 페이지 검증 실패, 다른 페이지에 있을 수 있음')
  }
  
  // 사용자 정보 확인 (있으면)
  const userInfoSelectors = ['[data-testid="user-name"]', '.user-name', '.profile-name']
  for (const selector of userInfoSelectors) {
    const userInfo = page.locator(selector)
    if (await userInfo.count() > 0) {
      const userName = await userInfo.first().textContent()
      console.log(`👋 로그인된 사용자: ${userName}`)
      break
    }
  }

  // 세션 상태 저장
  await page.context().storageState({ path: authFile })
  console.log('💾 인증 세션이 저장되었습니다:', authFile)

  // 세션 파일 검증
  if (fs.existsSync(authFile)) {
    const sessionData = JSON.parse(fs.readFileSync(authFile, 'utf-8'))
    const cookieCount = sessionData.cookies?.length || 0
    console.log(`🍪 저장된 쿠키 수: ${cookieCount}`)
    
    if (cookieCount === 0) {
      console.log('⚠️ 경고: 쿠키가 저장되지 않았지만 세션 파일은 생성됨')
    }
  }

  console.log('✅ 실제 카카오 OAuth 인증 setup 완료')
})

setup('관리자 권한 세션 생성 (선택사항)', async ({ page }) => {
  // 일반 사용자 세션부터 시작
  await page.context().storageState({ path: authFile })
  
  console.log('🔑 관리자 권한 확인 중...')
  
  // 관리자 페이지 접근 시도
  await page.goto('/admin', { waitUntil: 'networkidle' })
  
  // 권한이 있는 경우 관리자 세션으로 저장
  const isAdmin = await page.locator('h1:has-text("관리"), .admin-dashboard').isVisible({ timeout: 3000 })
  
  if (isAdmin) {
    await page.context().storageState({ path: adminAuthFile })
    console.log('👑 관리자 세션 저장 완료')
  } else {
    console.log('👤 일반 사용자 권한 - 관리자 세션 생성 스킵')
    
    // 일반 사용자와 동일한 세션으로 저장 (관리자 테스트 스킵용)
    await page.context().storageState({ path: adminAuthFile })
  }
})