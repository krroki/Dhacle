#!/usr/bin/env node

/**
 * 🔐 보안 리팩토링: Wave 1 - 올바른 api-client.ts 전환
 * 
 * 목적: api-client.ts를 올바르게 사용하도록 수정
 * - api 함수들은 직접 데이터를 반환 (response 객체가 아님)
 * - 에러는 ApiError를 throw
 * - response.json() 호출 불필요
 */

const fs = require('fs');
const path = require('path');

// 수정이 필요한 파일별 패치
const patches = {
  'src/lib/api/revenue-proof.ts': [
    // GET 요청들을 올바르게 수정
    {
      from: `const response = await fetch(\`\${API_BASE}?\${searchParams.toString()}\`, {
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || \`Failed to fetch revenue proofs (\${response.status})\`;
    console.error('Revenue proofs fetch error:', errorMessage, errorData);
    throw new ApiError(errorMessage);
  }
  
  return response.json();`,
      to: `try {
    return await apiGet(\`\${API_BASE}?\${searchParams.toString()}\`);
  } catch (error) {
    console.error('Revenue proofs fetch error:', error);
    throw error;
  }`
    },
    {
      from: `const response = await fetch(\`\${API_BASE}/\${id}\`, {
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new ApiError('Failed to fetch revenue proof');
  }
  
  return response.json();`,
      to: `return await apiGet(\`\${API_BASE}/\${id}\`);`
    },
    // uploadImage는 FormData 사용하므로 fetch 유지
    {
      from: `const response = await apiPost('/api/upload', JSON.parse(formData));`,
      to: `const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
  });`
    },
    // deleteImage DELETE 요청
    {
      from: `const response = await apiGet(\`/api/upload?\${params.toString()}\`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });`,
      to: `const response = await fetch(\`/api/upload?\${params.toString()}\`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });`
    },
    // updateRevenueProof PUT 요청
    {
      from: `const response = await fetch(\`\${API_BASE}/\${id}\`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new ApiError('Failed to update revenue proof');
  }
  
  return response.json();`,
      to: `return await apiPut(\`\${API_BASE}/\${id}\`, data);`
    },
    // deleteRevenueProof DELETE 요청
    {
      from: `const response = await fetch(\`\${API_BASE}/\${id}\`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new ApiError('Failed to delete revenue proof');
  }
  
  return response.json();`,
      to: `return await apiDelete(\`\${API_BASE}/\${id}\`);`
    },
    // toggleLike POST 요청
    {
      from: `const response = await fetch(\`\${API_BASE}/\${proofId}/like\`, {
    method: 'POST',
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new ApiError('Failed to toggle like');
  }
  
  return response.json();`,
      to: `return await apiPost(\`\${API_BASE}/\${proofId}/like\`);`
    },
    // createComment POST 요청
    {
      from: `const response = await fetch(\`\${API_BASE}/\${proofId}/comment\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new ApiError('Failed to create comment');
  }
  
  return response.json();`,
      to: `return await apiPost(\`\${API_BASE}/\${proofId}/comment\`, { content });`
    },
    // reportProof POST 요청
    {
      from: `const response = await fetch(\`\${API_BASE}/\${proofId}/report\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new ApiError('Failed to report proof');
  }
  
  return response.json();`,
      to: `return await apiPost(\`\${API_BASE}/\${proofId}/report\`, data);`
    },
    // getRankings GET 요청
    {
      from: `const response = await fetch(\`\${API_BASE}/ranking?period=\${period}\`, {
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new ApiError('Failed to fetch rankings');
  }
  
  return response.json();`,
      to: `return await apiGet(\`\${API_BASE}/ranking?period=\${period}\`);`
    },
    // getMyProofs GET 요청
    {
      from: `const response = await fetch(\`\${API_BASE}/my\`, {
    credentials: 'same-origin',
  });
  
  if (!response.ok) {
    throw new ApiError('Failed to fetch my proofs');
  }
  
  return response.json();`,
      to: `return await apiGet(\`\${API_BASE}/my\`);`
    }
  ],
  'src/app/(pages)/community/board/page.tsx': [
    {
      from: `const response = await apiPost('/api/community/posts', {
          category: 'board',
          title: newPost.title,
          content: newPost.content
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(errorData.error || '게시글 작성에 실패했습니다');
      }`,
      to: `await apiPost('/api/community/posts', {
        category: 'board',
        title: newPost.title,
        content: newPost.content
      });`
    }
  ]
};

let fixedFiles = 0;
let errorFiles = [];

console.log('🔧 올바른 api-client.ts 전환 시작\n');

// 각 파일에 패치 적용
Object.entries(patches).forEach(([filePath, replacements]) => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ ${filePath}: 파일을 찾을 수 없음`);
    errorFiles.push(filePath);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.replace(from, to);
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
      console.log(`⚠️  ${filePath}: 패치할 내용을 찾을 수 없음`);
    }
    
  } catch (error) {
    console.error(`❌ ${filePath}: 처리 중 오류 - ${error.message}`);
    errorFiles.push(filePath);
  }
});

// 결과 요약
console.log('\n' + '='.repeat(50));
console.log('📊 api-client.ts 전환 결과:');
console.log(`  - 처리 대상: ${Object.keys(patches).length}개`);
console.log(`  - 수정됨: ${fixedFiles}개`);
console.log(`  - 오류: ${errorFiles.length}개`);

if (errorFiles.length > 0) {
  console.log('\n❌ 오류 발생 파일:');
  errorFiles.forEach(file => console.log(`  - ${file}`));
}

console.log('='.repeat(50));

console.log('\n✅ 올바른 api-client.ts 전환 완료!');
console.log('\n⚠️  다시 TypeScript 타입 체크를 실행하세요:');
console.log('   npx tsc --noEmit');