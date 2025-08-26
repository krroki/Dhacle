# ⚡ Phase 3 검증 빠른 참조 가이드

## 🎯 1분 검증 (자동화)
```bash
# 검증 스크립트 실행
node scripts/verify-phase3.js
```

## 📋 5분 수동 검증
```bash
# 1. API Client 확인
ls -la src/lib/api-client.ts && echo "✅ Exists" || echo "❌ Not found"

# 2. 직접 fetch 카운트
echo "Direct fetch count: $(grep -r 'fetch(' src/ --include='*.ts' --include='*.tsx' | grep -v 'api-client' | wc -l)"

# 3. Silent failure 카운트
echo "Silent failures: $(grep -r 'catch.*{}' src/ --include='*.ts' --include='*.tsx' | wc -l)"

# 4. apiClient 사용률
echo "apiClient imports: $(grep -r "from '@/lib/api-client'" src/ | wc -l)"

# 5. TypeScript 체크
npm run types:check && echo "✅ TypeScript OK" || echo "❌ TypeScript Failed"
```

## 🎯 핵심 검증 기준

| 항목 | 목표 | 명령어 | 통과 기준 |
|------|------|--------|----------|
| api-client.ts | 존재 | `ls src/lib/api-client.ts` | 파일 존재 |
| 직접 fetch (내부) | 0 | `grep -r "fetch(" src/` | 0개 (외부 API 제외) |
| Silent failure | 0 | `grep -r "catch.*{}" src/` | ≤5개 |
| apiClient 사용 | 30+ | `grep -r "api-client" src/` | ≥25개 파일 |
| TypeScript | 통과 | `npm run types:check` | 에러 없음 |

## 🚨 즉시 확인 사항

### RED FLAGS (즉시 수정 필요)
```bash
# api-client.ts 누락
[ ! -f "src/lib/api-client.ts" ] && echo "🚨 CRITICAL: api-client.ts missing!"

# 과도한 직접 fetch
[ $(grep -r "fetch(" src/ | grep -v "api-client" | wc -l) -gt 10 ] && echo "🚨 Too many direct fetch!"

# TypeScript 실패
npm run types:check || echo "🚨 TypeScript compilation failed!"
```

### YELLOW FLAGS (개선 필요)
```bash
# apiClient 사용 부족
[ $(grep -r "api-client" src/ | wc -l) -lt 25 ] && echo "⚠️ Low apiClient adoption"

# Silent failure 존재
[ $(grep -r "catch.*{}" src/ | wc -l) -gt 0 ] && echo "⚠️ Silent failures exist"
```

## 🔧 문제 해결 Quick Fix

### api-client.ts 누락 시
```bash
# 파일 생성 (기본 템플릿은 PHASE_3 지시서 참조)
touch src/lib/api-client.ts
```

### 직접 fetch 변경
```typescript
// Before
const res = await fetch('/api/data');

// After
import { apiClient } from '@/lib/api-client';
const res = await apiClient.get('/api/data');
```

### Silent failure 수정
```typescript
// Before
try { ... } catch {}

// After  
try { ... } catch (error) {
  logger.error('Operation failed:', error);
  toast.error('작업 실패');
}
```

## 📊 검증 결과 해석

### 🟢 PASSED (100% 완료)
- 모든 검증 항목 통과
- Phase 4 진행 가능

### 🟡 PARTIALLY PASSED (75% 완료)
- 1-2개 경고 사항
- 수정 후 진행 권장

### 🔴 FAILED (<50% 완료)
- 3개 이상 실패
- 즉시 수정 필요

## 📝 1줄 보고서 생성
```bash
echo "Phase 3 검증: $(node scripts/verify-phase3.js | grep 'Overall Status' | cut -d: -f2)"
```

## 🚀 다음 액션

```bash
# 검증 통과 시
echo "✅ Phase 3 Complete. Ready for Phase 4"

# 부분 통과 시
echo "⚠️ Phase 3 needs improvement. Fix warnings first"

# 실패 시
echo "❌ Phase 3 failed. Run fixes then re-verify"
```

---

**⏱️ Total Time: 1-5분**
**🎯 Goal: 100% 검증 통과**
**📌 Priority: CRITICAL**