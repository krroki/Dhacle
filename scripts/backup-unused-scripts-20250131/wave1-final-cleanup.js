#!/usr/bin/env node

/**
 * 🔐 보안 리팩토링: Wave 1 - 최종 정리
 * 
 * 목적: 모든 api-client 관련 오류 최종 수정
 */

const fs = require('fs');
const path = require('path');

// 수정이 필요한 파일들과 구체적인 수정 내용
const fixes = {
  'src/app/(pages)/payment/success/page.tsx': [
    {
      find: `      const response: any = await apiPost('/api/payment/confirm', {
          orderId,
          paymentKey,
          amount: parseInt(amount || '0'),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(error.error || '결제 승인에 실패했습니다.');
      }

      const data = await response.json();`,
      replace: `      const data = await apiPost<any>('/api/payment/confirm', {
          orderId,
          paymentKey,
          amount: parseInt(amount || '0'),
      });`
    }
  ],
  'src/app/(pages)/revenue-proof/create/page.tsx': [
    {
      find: `      const response: any = await apiPost('/api/revenue-proof', JSON.parse(formData));
      
      const result = await response.json();
      
      if (!response.ok) {`,
      replace: `      // FormData는 fetch 사용
      const response = await fetch('/api/revenue-proof', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });
      
      const result = await response.json();
      
      if (!response.ok) {`
    }
  ],
  'src/app/admin/courses/videos/page.tsx': [
    {
      find: `      const response: any = await apiPost('/api/admin/video/upload', JSON.parse(formData));

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(errorData.error || '업로드 실패');
      }

      const result = await response.json();`,
      replace: `      // FormData는 fetch 사용
      const response = await fetch('/api/admin/video/upload', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '업로드 실패');
      }

      const result = await response.json();`
    }
  ],
  'src/components/features/tools/youtube-lens/components/EnvironmentChecker.tsx': [
    {
      find: `      const response: any = await apiGet('/api/youtube/auth/check-config');
      const data = await response.json();`,
      replace: `      const data = await apiGet<any>('/api/youtube/auth/check-config');`
    }
  ]
};

let fixedFiles = 0;
let errorFiles = [];

console.log('🔧 Wave 1 최종 정리 시작\n');

Object.entries(fixes).forEach(([filePath, replacements]) => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ ${filePath}: 파일을 찾을 수 없음`);
    errorFiles.push(filePath);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ find, replace }) => {
      if (content.includes(find)) {
        content = content.replace(find, replace);
        modified = true;
        console.log(`✅ ${filePath}: 패치 적용`);
      }
    });
    
    // 파일 저장
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      fixedFiles++;
      console.log(`💾 ${filePath}: 저장 완료`);
    } else {
      console.log(`⚠️  ${filePath}: 이미 수정됨 또는 패치 대상 없음`);
    }
    
  } catch (error) {
    console.error(`❌ ${filePath}: 처리 중 오류 - ${error.message}`);
    errorFiles.push(filePath);
  }
});

// 결과 요약
console.log('\n' + '='.repeat(50));
console.log('📊 Wave 1 최종 정리 결과:');
console.log(`  - 처리 대상: ${Object.keys(fixes).length}개`);
console.log(`  - 수정됨: ${fixedFiles}개`);
console.log(`  - 오류: ${errorFiles.length}개`);

if (errorFiles.length > 0) {
  console.log('\n❌ 오류 발생 파일:');
  errorFiles.forEach(file => console.log(`  - ${file}`));
}

console.log('='.repeat(50));

console.log('\n✅ Wave 1 최종 정리 완료!');
console.log('\n🏁 최종 확인 단계:');
console.log('1. TypeScript 타입 체크: npx tsc --noEmit');
console.log('2. 빌드 테스트: npm run build');
console.log('3. 보고서 작성');