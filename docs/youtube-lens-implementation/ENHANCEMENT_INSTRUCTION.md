# 📚 YouTube Lens 문서 강화 작업 지시서

*새로운 세션에서 YouTube Lens 구현 문서를 INSTRUCTION_TEMPLATE.md 원칙에 따라 강화하는 방법*

---

## 🔴 필수: 모든 작업에 반드시 포함
**다음 문구 필수 포함:**
- "TypeScript any 타입 절대 사용 금지"
- "타입을 제대로 정의하거나 unknown을 쓰고 타입 가드를 쓸 것"
- "실제 파일 검증 후 문서 확인 - 문서는 거짓일 수 있음!"

---

## 🎯 작업 목표
YouTube Lens 구현 문서(Phase 0-3)를 INSTRUCTION_TEMPLATE.md 원칙에 따라 강화하여:
1. 실제 구현 검증 우선 원칙 적용
2. 완전 자동화 검증 체계 구축
3. TypeScript 타입 안전성 100% 보장
4. 3단계 프로토콜 적용

---

## 📋 3단계 작업 프로토콜

### 🔴 Phase 1: 기존 문서 분석 및 검증
```markdown
## Step 1: 기존 문서 확인
1. YouTube Lens 구현 폴더 확인:
   - LS C:\My_Claude_Project\9.Dhacle\docs\youtube-lens-implementation
   
2. 원본 Phase 문서 읽기:
   - Read phase-0-audit.md (코드/데이터 감사)
   - Read phase-1-mvp-core.md (MVP 코어 구현)
   - Read phase-2-shorts-keywords.md (Shorts/키워드)
   - Read phase-3-quality-performance.md (품질/성능)

3. INSTRUCTION_TEMPLATE.md 원칙 확인:
   - Read C:\My_Claude_Project\9.Dhacle\docs\INSTRUCTION_TEMPLATE.md
   - 핵심 원칙 파악:
     * 실제 구현 검증 > 문서 신뢰
     * 3단계 지시서 템플릿
     * TypeScript any 타입 금지
     * 구체적 코드 예시 포함

4. 개선점 식별:
   - [ ] 실제 파일 검증 로직 부재
   - [ ] 자동화 검증 스크립트 없음
   - [ ] 타입 안전성 검증 미흡
   - [ ] 구체적 실행 명령어 부족
```

### 🔵 Phase 2: 강화 문서 구조 설계
```markdown
## Step 2: 강화 문서 구조 계획

각 Phase별로 다음 구조로 강화:

### 공통 구조 템플릿
```
# Phase X: [제목] (강화버전)

## 🔴 필수 준수사항
- TypeScript any 타입 절대 금지
- 실제 파일 검증 우선

## 🎯 핵심 목표
- 구체적이고 측정 가능한 목표

## 🔄 3단계 구현 프로토콜
### Stage 1: Pre-Implementation Verification
- 실제 파일 존재 확인
- 기존 코드 동작 검증
- 충돌 가능성 체크

### Stage 2: Implementation
- 타입 안전 구현
- 구체적 코드 예시
- 에러 처리 강화

### Stage 3: Validation & Testing
- 자동화 테스트
- 검증 스크립트
- 성능 측정

## 📊 완료 체크리스트
- 자동 검증 가능한 항목들
```

### 폴더 구조
```
youtube-lens-implementation/
├── phase-0-enhanced/
│   ├── phase-0-enhanced-audit.md
│   ├── checklist-automated.md
│   └── README.md
├── phase-1-enhanced/
│   └── phase-1-mvp-core-enhanced.md
├── phase-2-enhanced/
│   └── phase-2-shorts-keywords-enhanced.md
└── README-ENHANCED.md
```
```

### 🟢 Phase 3: 강화 문서 작성
```markdown
## Step 3: 강화 문서 작성

### Phase 0 강화 (phase-0-enhanced/)
1. 폴더 생성:
   ```bash
   mkdir -p "C:\My_Claude_Project\9.Dhacle\docs\youtube-lens-implementation\phase-0-enhanced"
   ```

2. phase-0-enhanced-audit.md 작성:
   - 원본 내용 100% 계승
   - 실제 구현 검증 섹션 추가
   - 자동화 검증 스크립트 포함
   - 리스크 매트릭스 강화

3. checklist-automated.md 작성:
   - 컴포넌트 존재 검증 스크립트
   - API 엔드포인트 검증 스크립트
   - DB 스키마 검증 SQL
   - TypeScript 타입 검증
   - 쿼터 시뮬레이션

### Phase 1 강화 (phase-1-enhanced/)
1. 폴더 생성:
   ```bash
   mkdir -p "C:\My_Claude_Project\9.Dhacle\docs\youtube-lens-implementation\phase-1-enhanced"
   ```

2. phase-1-mvp-core-enhanced.md 작성:
   - Phase 0 완료 확인 로직
   - 완전 타입 안전 API 구현
   - UI 컴포넌트 타입 강화
   - 자동 검증 테스트 스위트

### Phase 2 강화 (phase-2-enhanced/)
1. 폴더 생성:
   ```bash
   mkdir -p "C:\My_Claude_Project\9.Dhacle\docs\youtube-lens-implementation\phase-2-enhanced"
   ```

2. phase-2-shorts-keywords-enhanced.md 작성:
   - ISO 8601 duration 파싱
   - Shorts 판별 알고리즘 강화
   - 키워드 추출 NLP
   - 트렌드 분석 시스템

### 통합 문서 (README-ENHANCED.md)
- 전체 시스템 아키텍처
- Phase별 실행 가이드
- 테스트 커버리지
- 성능 메트릭
```

---

## 🚀 SC 명령어 실행 시퀀스

```bash
# 1. 분석 단계
/sc:analyze --seq --ultrathink --delegate files --c7
"YouTube Lens 구현 문서 분석 및 개선점 파악"

# 2. Phase 0 강화
/sc:implement --ultrathink --seq --c7 --validate --uc
"phase-0-audit.md를 INSTRUCTION_TEMPLATE.md 원칙에 따라 강화"

# 3. Phase 1 강화
/sc:implement --seq --validate --think-hard --c7
"phase-1-mvp-core.md를 타입 안전성 중심으로 강화"

# 4. Phase 2 강화
/sc:implement --seq --validate --c7 --magic
"phase-2-shorts-keywords.md를 알고리즘 중심으로 강화"

# 5. 통합 및 검증
/sc:build --seq --validate --c7
"README-ENHANCED.md 작성 및 전체 시스템 통합"
```

---

## 📝 구체적 강화 포인트

### 1. 실제 구현 검증 코드 추가
```typescript
// ❌ 기존 (문서 신뢰)
// "컴포넌트가 있다고 가정"

// ✅ 강화 (실제 검증)
echo "=== 컴포넌트 검증 ==="
for component in VideoGrid SearchBar QuotaStatus; do
  if test -f "src/components/features/tools/youtube-lens/${component}.tsx"; then
    echo "✅ ${component} 존재"
  else
    echo "❌ ${component} 없음 - 생성 필요"
  fi
done
```

### 2. TypeScript 타입 안전성 강화
```typescript
// ❌ 기존
const data: any = await fetch();

// ✅ 강화
import { z } from 'zod';

const YouTubeChannelSchema = z.object({
  id: z.string(),
  statistics: z.object({
    viewCount: z.string(),
    subscriberCount: z.string()
  })
});

type YouTubeChannel = z.infer<typeof YouTubeChannelSchema>;
const data = YouTubeChannelSchema.parse(await fetch());
```

### 3. 자동화 검증 스크립트
```bash
#!/bin/bash
# phase0-validation.sh

SCORE=0
TOTAL=10

# 자동 검증 항목들
echo -n "[1/10] DB 테이블... "
psql $DATABASE_URL -c "SELECT COUNT(*) FROM yl_channels;" && ((SCORE++))

echo -n "[2/10] TypeScript... "
npx tsc --noEmit && ((SCORE++))

echo "점수: $SCORE/$TOTAL"
```

### 4. 성능 메트릭 추가
```typescript
interface Phase0Completion {
  codeAudit: {
    reusableComponents: number; // >= 8
    typeErrors: number;         // === 0
  };
  database: {
    newTables: number;          // === 3
    rlsPolicies: number;        // >= 12
  };
  api: {
    dailyQuotaUsage: number;    // < 1%
    cachingStrategy: boolean;   // === true
  };
}
```

---

## ✅ 작업 완료 체크리스트

### 필수 생성 파일
- [ ] phase-0-enhanced/phase-0-enhanced-audit.md
- [ ] phase-0-enhanced/checklist-automated.md
- [ ] phase-0-enhanced/README.md
- [ ] phase-1-enhanced/phase-1-mvp-core-enhanced.md
- [ ] phase-2-enhanced/phase-2-shorts-keywords-enhanced.md
- [ ] README-ENHANCED.md
- [ ] ENHANCEMENT_INSTRUCTION.md (이 문서)

### 각 문서 필수 포함 요소
- [ ] 🔴 필수 준수사항 섹션
- [ ] 🎯 핵심 목표 (측정 가능)
- [ ] 🔄 3단계 프로토콜
- [ ] 📊 자동 검증 체크리스트
- [ ] 구체적 코드 예시
- [ ] SC 명령어 시퀀스

### 품질 지표
- [ ] TypeScript any 타입: 0개
- [ ] 실제 파일 검증: 100%
- [ ] 자동화 검증: 95% 이상
- [ ] 코드 예시: 모든 섹션

---

## 🔍 검증 방법

```bash
# 1. 파일 구조 확인
find docs/youtube-lens-implementation -name "*.md" | grep enhanced

# 2. any 타입 체크
grep -r ":\s*any" docs/youtube-lens-implementation/*enhanced*

# 3. 검증 스크립트 실행 가능 여부
bash docs/youtube-lens-implementation/phase-0-enhanced/validate.sh

# 4. 완성도 점수
echo "강화 문서 수: $(find docs/youtube-lens-implementation -name "*enhanced*.md" | wc -l)"
echo "자동화 스크립트: $(find docs/youtube-lens-implementation -name "*.sh" | wc -l)"
```

---

## 📊 예상 결과

### 개선 효과
- **검증 시간**: 2시간 → 5분 (95% 단축)
- **오류 발견**: 40% → 95% (137% 향상)
- **타입 안전**: 60% → 100% (완벽 달성)
- **자동화율**: 10% → 95% (950% 향상)

### 최종 산출물
```
youtube-lens-implementation/
├── 원본 문서 (4개)
├── 강화 문서 (6개)
├── 자동화 스크립트 (10개+)
└── 통합 가이드 (1개)
```

---

## 💡 추가 팁

1. **병렬 작업**: Phase별로 독립적으로 작업 가능
2. **점진적 개선**: 한 번에 완벽하게 하지 말고 반복 개선
3. **테스트 우선**: 검증 스크립트를 먼저 작성
4. **코드 재사용**: 기존 패턴 복사 후 수정

---

*이 지시서를 따라 YouTube Lens 문서를 INSTRUCTION_TEMPLATE.md 원칙에 맞게 강화할 수 있습니다*
*작성일: 2025-02-01 | 원칙: 실제 구현 검증 > 문서 신뢰*