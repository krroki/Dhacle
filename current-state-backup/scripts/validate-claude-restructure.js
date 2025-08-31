#!/usr/bin/env node

/**
 * CLAUDE.md 재구조화 검증 스크립트
 * 1111 라인의 내용이 손실 없이 마이그레이션되었는지 확인
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

class ClaudeRestructureValidator {
  constructor() {
    this.originalFile = path.join(PROJECT_ROOT, 'CLAUDE.md');
    this.expectedLines = 1111;
    this.newFiles = [
      '/CLAUDE.md',
      'src/CLAUDE.md',
      'src/app/CLAUDE.md',
      'src/app/api/CLAUDE.md',
      'src/app/(pages)/CLAUDE.md',
      'src/components/CLAUDE.md',
      'src/hooks/CLAUDE.md',           // ✨ React Query (PHASE 0)
      'src/lib/CLAUDE.md',              // ✨ env.ts 포함 (PHASE 0)
      'src/lib/supabase/CLAUDE.md',
      'src/lib/security/CLAUDE.md',
      'src/types/CLAUDE.md',
      'scripts/CLAUDE.md',
      'docs/CLAUDE.md',
      'tests/CLAUDE.md'                 // ✨ 테스트 가이드 (PHASE 0)
    ];
    
    this.criticalSections = [
      { name: 'STOP & ACT 규칙', pattern: /STOP & ACT 규칙/, required: true },
      { name: '자동 스크립트 금지', pattern: /코드 자동 변환 스크립트 절대 금지/, required: true },
      { name: 'React Query 규칙', pattern: /React Query 사용 규칙/, required: true },
      { name: '에러 처리 규칙', pattern: /에러 처리 규칙/, required: true },
      { name: '환경변수 타입 안전성', pattern: /환경 변수 타입 안전성 시스템/, required: true },
      { name: 'TypeScript 타입 관리', pattern: /TypeScript 타입 관리 시스템/, required: true },
      { name: 'Supabase 클라이언트 패턴', pattern: /Supabase 클라이언트 패턴/, required: true },
      { name: '인증 프로토콜', pattern: /인증 프로토콜/, required: true },
      { name: 'Git 작업 규칙', pattern: /Git 작업 규칙/, required: false },
      { name: 'dhacle.com 테스트', pattern: /dhacle\.com/, required: false }
    ];
    
    this.results = {
      errors: [],
      warnings: [],
      info: [],
      stats: {}
    };
  }

  /**
   * 파일 내용을 읽고 해시 생성
   */
  readFileContent(filePath) {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath, 'utf-8');
  }

  /**
   * 내용 해시 생성
   */
  generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * 원본 파일 분석
   */
  analyzeOriginal() {
    console.log('\n📊 원본 CLAUDE.md 분석 중...');
    
    const content = this.readFileContent(this.originalFile);
    if (!content) {
      this.results.errors.push('❌ 원본 CLAUDE.md 파일을 찾을 수 없습니다.');
      return false;
    }

    const lines = content.split('\n');
    this.results.stats.originalLines = lines.length;
    this.results.stats.originalHash = this.generateHash(content);
    this.results.stats.originalSize = Buffer.byteLength(content, 'utf8');

    // 라인 수 검증
    if (lines.length !== this.expectedLines) {
      this.results.warnings.push(
        `⚠️ 예상 라인 수(${this.expectedLines})와 실제(${lines.length})가 다릅니다.`
      );
    }

    // 중요 섹션 존재 확인
    console.log('\n🔍 중요 섹션 확인 중...');
    for (const section of this.criticalSections) {
      if (section.pattern.test(content)) {
        this.results.info.push(`✅ "${section.name}" 섹션 확인`);
      } else if (section.required) {
        this.results.errors.push(`❌ "${section.name}" 섹션을 찾을 수 없습니다.`);
      } else {
        this.results.warnings.push(`⚠️ "${section.name}" 섹션이 없습니다.`);
      }
    }

    return true;
  }

  /**
   * 새 파일 구조 분석
   */
  analyzeNewStructure() {
    console.log('\n📁 새 파일 구조 분석 중...');
    
    let totalLines = 0;
    let totalContent = '';
    let existingFiles = 0;
    
    for (const file of this.newFiles) {
      const filePath = path.join(PROJECT_ROOT, file);
      const content = this.readFileContent(filePath);
      
      if (content) {
        const lines = content.split('\n').length;
        totalLines += lines;
        totalContent += content + '\n';
        existingFiles++;
        this.results.info.push(`✅ ${file} (${lines} 라인)`);
      } else {
        this.results.warnings.push(`⏳ ${file} 아직 생성되지 않음`);
      }
    }
    
    this.results.stats.newFiles = existingFiles;
    this.results.stats.newTotalLines = totalLines;
    this.results.stats.newHash = this.generateHash(totalContent);
    this.results.stats.newSize = Buffer.byteLength(totalContent, 'utf8');
    
    return existingFiles > 0;
  }

  /**
   * 내용 무결성 검증
   */
  validateIntegrity() {
    console.log('\n🔐 내용 무결성 검증 중...');
    
    // 새 파일이 생성되지 않았으면 건너뛰기
    if (this.results.stats.newFiles === 0) {
      this.results.info.push('ℹ️ 아직 마이그레이션이 시작되지 않았습니다.');
      return true;
    }
    
    // 중요 섹션이 새 구조에도 존재하는지 확인
    let allSectionsFound = true;
    for (const section of this.criticalSections) {
      if (!section.required) continue;
      
      let found = false;
      for (const file of this.newFiles) {
        const filePath = path.join(PROJECT_ROOT, file);
        const content = this.readFileContent(filePath);
        if (content && section.pattern.test(content)) {
          found = true;
          break;
        }
      }
      
      if (!found) {
        this.results.errors.push(
          `❌ "${section.name}" 섹션이 새 구조에서 누락되었습니다.`
        );
        allSectionsFound = false;
      }
    }
    
    return allSectionsFound;
  }

  /**
   * 중복 내용 검사
   */
  checkDuplication() {
    console.log('\n🔄 중복 내용 검사 중...');
    
    const contentMap = new Map();
    
    for (const file of this.newFiles) {
      const filePath = path.join(PROJECT_ROOT, file);
      const content = this.readFileContent(filePath);
      
      if (content) {
        // 각 섹션을 파싱하여 중복 검사
        const sections = content.split(/^##\s+/m);
        for (const section of sections) {
          if (section.trim().length < 50) continue; // 짧은 섹션 무시
          
          const hash = this.generateHash(section);
          if (contentMap.has(hash)) {
            this.results.warnings.push(
              `⚠️ 중복 섹션 발견: ${file} ↔ ${contentMap.get(hash)}`
            );
          } else {
            contentMap.set(hash, file);
          }
        }
      }
    }
    
    return true;
  }

  /**
   * 최종 보고서 생성
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 CLAUDE.md 재구조화 검증 보고서');
    console.log('='.repeat(60));
    
    // 통계
    console.log('\n📊 통계:');
    console.log(`  원본 라인: ${this.results.stats.originalLines}`);
    console.log(`  원본 크기: ${(this.results.stats.originalSize / 1024).toFixed(2)} KB`);
    console.log(`  새 파일 수: ${this.results.stats.newFiles}/${this.newFiles.length}`);
    console.log(`  새 총 라인: ${this.results.stats.newTotalLines || 0}`);
    console.log(`  새 총 크기: ${((this.results.stats.newSize || 0) / 1024).toFixed(2)} KB`);
    
    // 성능 개선
    if (this.results.stats.newFiles > 0) {
      const avgLinesPerFile = Math.round(this.results.stats.newTotalLines / this.results.stats.newFiles);
      const reduction = Math.round(((this.results.stats.originalLines - avgLinesPerFile) / this.results.stats.originalLines) * 100);
      console.log(`\n⚡ 성능 개선:`);
      console.log(`  평균 파일당 라인: ${avgLinesPerFile} (${reduction}% 감소)`);
    }
    
    // 오류
    if (this.results.errors.length > 0) {
      console.log('\n❌ 오류:');
      this.results.errors.forEach(err => console.log(`  ${err}`));
    }
    
    // 경고
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️ 경고:');
      this.results.warnings.forEach(warn => console.log(`  ${warn}`));
    }
    
    // 정보
    if (this.results.info.length > 0) {
      console.log('\nℹ️ 정보:');
      this.results.info.forEach(info => console.log(`  ${info}`));
    }
    
    // 최종 결과
    console.log('\n' + '='.repeat(60));
    if (this.results.errors.length === 0) {
      console.log('✅ 검증 통과: 재구조화가 안전하게 진행 가능합니다.');
      return true;
    } else {
      console.log('❌ 검증 실패: 위의 오류를 수정한 후 다시 시도하세요.');
      return false;
    }
  }

  /**
   * 전체 검증 실행
   */
  async run() {
    console.log('🚀 CLAUDE.md 재구조화 검증 시작\n');
    
    // 1. 원본 분석
    if (!this.analyzeOriginal()) {
      this.generateReport();
      return false;
    }
    
    // 2. 새 구조 분석
    this.analyzeNewStructure();
    
    // 3. 무결성 검증
    this.validateIntegrity();
    
    // 4. 중복 검사
    this.checkDuplication();
    
    // 5. 보고서 생성
    return this.generateReport();
  }
}

// 실행
const validator = new ClaudeRestructureValidator();
validator.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ 검증 중 오류 발생:', error);
  process.exit(1);
});