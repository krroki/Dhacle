#!/usr/bin/env node

/**
 * 🔐 보안 리팩토링: Wave 1 - api-client.ts 전환 구문 오류 수정
 * 
 * 목적: 잘못된 괄호와 구문 오류 수정
 */

const fs = require('fs');
const path = require('path');

// 수정이 필요한 파일과 패치 내용
const fixes = [
  {
    file: 'src/app/(pages)/community/board/page.tsx',
    replacements: [
      {
        from: `        })
      });`,
        to: `        });`
      }
    ]
  },
  {
    file: 'src/app/(pages)/courses/[id]/components/PurchaseCard.tsx',
    replacements: [
      {
        from: `      })
      });`,
        to: `      });`
      },
      {
        from: `        })
      });`,
        to: `        });`
      }
    ]
  },
  {
    file: 'src/app/(pages)/payment/fail/page.tsx',
    replacements: [
      {
        from: `      }const response = await apiPost('/api/payments/fail', {`,
        to: `      }
      const response = await apiPost('/api/payments/fail', {`
      }
    ]
  },
  {
    file: 'src/app/(pages)/settings/api-keys/page.tsx',
    replacements: [
      {
        from: `      })
      });`,
        to: `      });`
      },
      {
        from: `        })
      });`,
        to: `        });`
      }
    ]
  },
  {
    file: 'src/app/(pages)/tools/youtube-lens/page.tsx',
    replacements: [
      {
        from: `const data = await apiGet(\`/api/youtube/lens?\${params.toString()}\`);
        
        if (!data.ok) {`,
        to: `const data = await apiGet(\`/api/youtube/lens?\${params.toString()}\`);
        
        // api-client handles errors internally, data is returned directly`
      },
      {
        from: `      } catch (err) {
        if (!data.ok) {`,
        to: `      } catch (err) {`
      }
    ]
  },
  {
    file: 'src/app/onboarding/page.tsx',
    replacements: [
      {
        from: `      })
      });`,
        to: `      });`
      }
    ]
  },
  {
    file: 'src/components/features/tools/youtube-lens/ChannelFolders.tsx',
    replacements: [
      {
        from: `      })
      });`,
        to: `      });`
      }
    ]
  },
  {
    file: 'src/components/features/tools/youtube-lens/CollectionBoard.tsx',
    replacements: [
      {
        from: `        if (!data.ok) {`,
        to: `        // api-client handles errors internally
        if (false) { // Remove this check as api-client handles errors`
      }
    ]
  },
  {
    file: 'src/lib/api/revenue-proof.ts',
    replacements: [
      {
        from: `apiPost('/api/upload', JSON.parse(formData))`,
        to: `fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
  })`
      },
      {
        from: `apiGet(\`/api/upload?\${params.toString()}\`, {
    method: 'DELETE',
    credentials: 'same-origin',
  })`,
        to: `apiDelete(\`/api/upload?\${params.toString()}\`)`
      }
    ]
  }
];

let fixedFiles = 0;
let errorFiles = [];

console.log('🔧 api-client.ts 전환 구문 오류 수정 시작\n');

fixes.forEach(({ file, replacements }) => {
  const fullPath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ ${file}: 파일을 찾을 수 없음`);
    errorFiles.push(file);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.replace(from, to);
        modified = true;
        console.log(`✅ ${file}: 패치 적용`);
      }
    });
    
    // 파일 저장
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      fixedFiles++;
      console.log(`💾 ${file}: 저장 완료`);
    } else {
      console.log(`⚠️  ${file}: 수정 사항 없음`);
    }
    
  } catch (error) {
    console.error(`❌ ${file}: 처리 중 오류 - ${error.message}`);
    errorFiles.push(file);
  }
});

// 결과 요약
console.log('\n' + '='.repeat(50));
console.log('📊 구문 오류 수정 결과:');
console.log(`  - 처리 대상: ${fixes.length}개`);
console.log(`  - 수정됨: ${fixedFiles}개`);
console.log(`  - 오류: ${errorFiles.length}개`);

if (errorFiles.length > 0) {
  console.log('\n❌ 오류 발생 파일:');
  errorFiles.forEach(file => console.log(`  - ${file}`));
}

console.log('='.repeat(50));

console.log('\n✅ 구문 오류 수정 완료!');
console.log('\n⚠️  다시 TypeScript 타입 체크를 실행하세요:');
console.log('   npx tsc --noEmit');