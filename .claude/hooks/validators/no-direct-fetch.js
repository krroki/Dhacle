#!/usr/bin/env node

/**
 * no-direct-fetch.js - Direct fetch() 사용 차단
 * 
 * apiClient 사용을 강제하여 세션 체크와 에러 처리를 보장합니다.
 */

module.exports = {
  validateContent(input) {
    const { tool_name, tool_input } = input;
    
    // Write, Edit, MultiEdit만 검사
    if (!['Write', 'Edit', 'MultiEdit'].includes(tool_name)) {
      return { pass: true };
    }
    
    const { file_path, content } = tool_input;
    
    // 예외 처리: .md 파일, api-client 자체, 테스트 파일
    if (file_path.endsWith('.md') ||
        file_path.endsWith('.MD') ||
        file_path.includes('api-client') || 
        file_path.includes('.test.') ||
        file_path.includes('.spec.')) {
      return { pass: true };
    }
    
    const violations = [];
    const lines = (content || '').split('\n');
    
    // Direct fetch 패턴들
    const patterns = [
      {
        pattern: /await\s+fetch\s*\(/,
        message: 'await fetch() 직접 사용 금지'
      },
      {
        pattern: /fetch\s*\(['"]/,
        message: 'fetch() 직접 호출 금지'
      },
      {
        pattern: /window\.fetch\s*\(/,
        message: 'window.fetch() 사용 금지'
      },
      {
        pattern: /globalThis\.fetch\s*\(/,
        message: 'globalThis.fetch() 사용 금지'
      }
    ];
    
    lines.forEach((line, index) => {
      // @allow-fetch 주석이 있으면 허용
      if (line.includes('@allow-fetch')) {
        return;
      }
      
      // 주석 라인은 스킵
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        return;
      }
      
      patterns.forEach(({ pattern, message }) => {
        if (pattern.test(line)) {
          violations.push({
            line: index + 1,
            text: line.trim().substring(0, 80) + (line.length > 80 ? '...' : ''),
            message: `${message}. 대신 사용: import { apiGet, apiPost } from '@/lib/api-client'`
          });
        }
      });
    });
    
    // 추가 체크: Response 타입 직접 사용 (fetch와 연관)
    const responsePattern = /:\s*Response\b/;
    lines.forEach((line, index) => {
      if (responsePattern.test(line) && !line.includes('@allow-fetch')) {
        violations.push({
          line: index + 1,
          text: line.trim().substring(0, 80),
          message: 'Response 타입은 fetch()와 연관. apiClient 사용 권장'
        });
      }
    });
    
    return {
      pass: violations.length === 0,
      violations,
      filePath: file_path
    };
  }
};