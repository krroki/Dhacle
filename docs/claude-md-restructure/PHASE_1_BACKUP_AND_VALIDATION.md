/sc:implement --seq --validate --think
"Phase 1: 백업 및 검증 시스템 구축"

# Phase 1: 백업 및 검증 시스템 구축

## 🚨 프로젝트 특화 규칙 확인 (필수)
⚠️ **경고**: 아래 문서 미확인 시 프로젝트 파괴 가능성 90%

### 최우선 확인 문서
- [ ] `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 (전체 읽기 필수)
- [ ] `/CLAUDE.md` 72-98행 - 자동 스크립트 절대 금지
- [ ] `/docs/CRITICAL_TYPE_SYSTEM_RECOVERY_PLAN.md` - 타입 시스템 복구 계획

### 프로젝트 금지사항 체크 ✅
- [ ] 자동 변환 스크립트 생성 금지
- [ ] 임시방편 해결책 사용 금지
- [ ] 기존 파일 무분별 삭제 금지
- [ ] 백업 없이 변경 금지

## 📌 Phase 정보
- **Phase 번호**: 1/4
- **선행 조건**: 없음 (시작 Phase)
- **예상 시간**: 30분
- **우선순위**: CRITICAL
- **작업 범위**: 전체 프로젝트 백업 및 검증 시스템 구축

## 🎯 Phase 목표
1. 현재 CLAUDE.md 완벽한 백업 생성
2. 모든 관련 문서 백업
3. 검증 스크립트 작성 및 테스트
4. Git 브랜치 생성 및 초기 커밋

## 📚 온보딩 섹션

### 이 Phase에 필요한 지식
- [ ] Git 브랜치 전략 이해
- [ ] Node.js 파일 시스템 API
- [ ] 백업 및 복구 전략

### 작업 파일 경로
- `/CLAUDE.md` - 메인 백업 대상
- `/docs/` - 문서 백업 대상
- `/scripts/verify-claude-migration.js` - 검증 스크립트 생성 위치

## 📝 작업 내용

### Step 1: Git 브랜치 생성 및 백업
```bash
# 새 브랜치 생성
git checkout -b feature/claude-md-restructure

# 타임스탬프 생성
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# CLAUDE.md 백업
cp CLAUDE.md CLAUDE.md.backup.$TIMESTAMP

# docs 폴더 백업
cp -r docs docs.backup.$TIMESTAMP

# 백업 확인
ls -la *.backup.*
ls -la docs.backup.*
```

### Step 2: 검증 스크립트 작성
`scripts/verify-claude-migration.js` 파일 생성:

```javascript
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class ClaudeMigrationValidator {
  constructor() {
    this.originalPath = 'CLAUDE.md.backup';
    this.errors = [];
    this.warnings = [];
    this.stats = {
      originalLines: 0,
      migratedLines: 0,
      filesCreated: 0,
      contentHash: null
    };
  }

  // 원본 내용 해시 생성
  generateContentHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // 백업 파일 존재 확인
  validateBackupExists() {
    const backupFiles = fs.readdirSync('.').filter(f => f.startsWith('CLAUDE.md.backup.'));
    if (backupFiles.length === 0) {
      this.errors.push('❌ 백업 파일이 존재하지 않습니다.');
      return false;
    }
    this.originalPath = backupFiles[backupFiles.length - 1]; // 최신 백업 사용
    console.log(`✅ 백업 파일 확인: ${this.originalPath}`);
    return true;
  }

  // 원본 내용 분석
  analyzeOriginal() {
    if (!fs.existsSync(this.originalPath)) {
      this.errors.push(`❌ ${this.originalPath} 파일을 찾을 수 없습니다.`);
      return false;
    }

    const content = fs.readFileSync(this.originalPath, 'utf-8');
    this.stats.originalLines = content.split('\n').length;
    this.stats.contentHash = this.generateContentHash(content);
    
    console.log(`📊 원본 분석 완료:`);
    console.log(`  - 총 라인 수: ${this.stats.originalLines}`);
    console.log(`  - 컨텐츠 해시: ${this.stats.contentHash.substring(0, 8)}...`);
    
    // ⚠️ PHASE 0 업데이트: 실제 라인 수 검증 (1111 예상)
    if (this.stats.originalLines !== 1111) {
      this.warnings.push(`⚠️ 예상 라인 수(1111)와 실제(${this.stats.originalLines})가 다릅니다.`);
    }
    
    // 새 섹션 존재 확인
    const newSections = [
      'React Query 사용 규칙',
      '에러 처리 규칙',
      '환경 변수 타입 안전성 시스템'
    ];
    
    for (const section of newSections) {
      if (content.includes(section)) {
        console.log(`  ✅ "${section}" 섹션 확인`);
      } else {
        this.warnings.push(`⚠️ "${section}" 섹션을 찾을 수 없습니다.`);
      }
    }
    
    return true;
  }

  // 마이그레이션 대상 폴더 구조 확인
  validateFolderStructure() {
    const requiredPaths = [
      'src/',
      'src/app/',
      'src/app/api/',
      'src/app/(pages)/',
      'src/components/',
      'src/hooks/',  // ✨ PHASE 0 추가: React Query
      'src/lib/',
      'src/lib/supabase/',
      'src/lib/security/',
      'src/types/',
      'scripts/',
      'docs/',
      'tests/'  // ✨ PHASE 0 추가: 테스트 가이드
    ];

    console.log('\n📁 폴더 구조 확인:');
    for (const dir of requiredPaths) {
      if (fs.existsSync(dir)) {
        console.log(`  ✅ ${dir}`);
      } else {
        this.warnings.push(`⚠️ ${dir} 폴더가 없습니다. 생성이 필요합니다.`);
        console.log(`  ⚠️ ${dir} (생성 필요)`);
      }
    }
    
    return true;
  }

  // 마이그레이션 후 내용 검증 (Phase 2 이후 사용)
  validateMigration() {
    const newFiles = [
      '/CLAUDE.md',
      'src/CLAUDE.md',
      'src/app/CLAUDE.md',
      'src/app/api/CLAUDE.md',
      'src/app/(pages)/CLAUDE.md',
      'src/components/CLAUDE.md',
      'src/hooks/CLAUDE.md',  // ✨ PHASE 0 추가: React Query
      'src/lib/CLAUDE.md',
      'src/lib/supabase/CLAUDE.md',
      'src/lib/security/CLAUDE.md',
      'src/types/CLAUDE.md',
      'scripts/CLAUDE.md',
      'docs/CLAUDE.md',
      'tests/CLAUDE.md'  // ✨ PHASE 0 추가: 테스트 가이드
    ];

    let combinedContent = '';
    let createdFiles = 0;

    console.log('\n📄 마이그레이션 파일 확인:');
    for (const file of newFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8');
        combinedContent += content + '\n';
        createdFiles++;
        console.log(`  ✅ ${file} (${content.split('\n').length}줄)`);
      } else {
        console.log(`  ⏳ ${file} (아직 생성 안됨)`);
      }
    }

    this.stats.filesCreated = createdFiles;
    this.stats.migratedLines = combinedContent.split('\n').length;

    // 내용 완전성 검증은 Phase 2 이후에 수행
    if (createdFiles > 0) {
      console.log(`\n📊 마이그레이션 통계:`);
      console.log(`  - 생성된 파일: ${createdFiles}개`);
      console.log(`  - 마이그레이션된 라인: ${this.stats.migratedLines}`);
    }

    return true;
  }

  // 전체 검증 실행
  async run() {
    console.log('🚀 CLAUDE.md 마이그레이션 검증 시작\n');
    console.log('='.repeat(50));

    // Phase 1 검증
    if (!this.validateBackupExists()) return false;
    if (!this.analyzeOriginal()) return false;
    if (!this.validateFolderStructure()) return false;

    // Phase 2 이후에만 실행
    // this.validateMigration();

    // 결과 출력
    console.log('\n' + '='.repeat(50));
    console.log('📋 검증 결과:\n');

    if (this.errors.length > 0) {
      console.log('❌ 오류:');
      this.errors.forEach(err => console.log(`  ${err}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ 경고:');
      this.warnings.forEach(warn => console.log(`  ${warn}`));
    }

    if (this.errors.length === 0) {
      console.log('✅ Phase 1 검증 완료: 백업 및 준비 상태 양호');
      return true;
    }

    return false;
  }
}

// 실행
const validator = new ClaudeMigrationValidator();
validator.run().then(success => {
  process.exit(success ? 0 : 1);
});
```

### Step 3: 검증 스크립트 실행
```bash
# 검증 스크립트 실행
node scripts/verify-claude-migration.js

# 성공 시 초기 커밋
git add -A
git commit -m "feat: CLAUDE.md 분산 시스템 Phase 1 - 백업 및 검증 시스템 구축

- CLAUDE.md 백업 생성
- docs 폴더 백업
- 검증 스크립트 작성
- 폴더 구조 확인"
```

## 📋 QA 테스트 시나리오

### 정상 플로우
1. 백업 파일이 정상 생성되는가?
2. 백업 파일 내용이 원본과 100% 일치하는가?
3. 검증 스크립트가 오류 없이 실행되는가?

### 실패 시나리오
1. 디스크 공간 부족 시 → 에러 메시지 표시
2. 파일 권한 오류 시 → 권한 요청 메시지
3. Git 충돌 발생 시 → 충돌 해결 가이드

### 성능 측정
- 백업 생성 시간: < 5초
- 검증 스크립트 실행 시간: < 3초
- 전체 Phase 완료 시간: < 30분

## ✅ Phase 완료 조건 (기능 작동 필수)
- [ ] **백업 파일 생성 완료** - CLAUDE.md.backup.* 파일 존재
- [ ] **docs 백업 완료** - docs.backup.* 폴더 존재
- [ ] **Git 브랜치 생성** - feature/claude-md-restructure 브랜치
- [ ] **검증 스크립트 작성** - verify-claude-migration.js 생성
- [ ] **검증 스크립트 테스트 통과** - 오류 0개
- [ ] **초기 커밋 완료** - Git 히스토리에 기록

## 🔄 롤백 절차
```bash
# Phase 1 롤백 (브랜치 삭제)
git checkout main
git branch -D feature/claude-md-restructure

# 백업 파일 제거
rm -f CLAUDE.md.backup.*
rm -rf docs.backup.*
```

## → 다음 Phase
- **파일**: PHASE_2_CONTENT_MIGRATION.md
- **선행 조건**: Phase 1의 모든 완료 조건 충족
- **주요 작업**: 실제 내용 이동 및 폴더별 CLAUDE.md 생성