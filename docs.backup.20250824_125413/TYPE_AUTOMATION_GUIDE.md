# 🤖 타입 자동 관리 가이드 (개발 지식 불필요!)

*개발을 몰라도 괜찮습니다. Claude Code가 다 해드립니다.*

---

## 🎯 당신이 해야 할 일: 단 하나!

```
"타입 오류 수정해줘"
```

끝입니다. Claude Code가 알아서 처리합니다.

---

## 📋 상황별 대처법

### 1️⃣ "빨간줄이 생겼어요"
**당신**: "타입 오류 수정해줘"  
**Claude Code**: 
1. `npm run types:auto-fix` 실행
2. 오류 분석
3. 자동 수정
4. 완료!

### 2️⃣ "새로운 기능 추가하고 싶어요"
**당신**: "회원 프로필에 전화번호 추가해줘"  
**Claude Code**:
1. Supabase에 필드 추가 안내
2. `npm run types:generate` 실행
3. 코드에 자동 반영
4. 완료!

### 3️⃣ "뭔가 이상해요"
**당신**: "타입 확인해줘"  
**Claude Code**:
1. `npm run types:check` 실행
2. 문제 발견 시 자동 수정
3. 완료!

---

## 🔧 Claude Code가 사용하는 명령어들

*당신이 직접 실행할 필요 없습니다. 그냥 참고용입니다.*

| 명령어 | 하는 일 | 언제 사용? |
|--------|---------|-----------|
| `npm run types:auto-fix` | 타입 오류 자동 수정 v2.0 | 빨간줄 생겼을 때 |
| `npm run types:sync` | DB와 타입 동기화 | DB 변경했을 때 |
| `npm run types:generate` | 새 타입 생성 | 테이블 추가했을 때 |
| `npm run types:check` | 오류 확인 | 확인하고 싶을 때 |
| `npm run types:explain` | 오류 상세 설명 | 오류 이해 안될 때 |
| `npm run types:help` | 도움말 보기 | 명령어 잊었을 때 |

---

## 💡 자주 묻는 질문

### Q: 제가 뭔가 해야 하나요?
**A: 아니요!** Claude Code에게 "해줘"라고만 하세요.

### Q: DB를 수정했는데 오류가 나요
**A:** "DB 바뀐거 타입 동기화해줘"라고 하세요.

### Q: 새 테이블을 만들고 싶어요
**A:** "XX 테이블 만들어줘"라고 하세요. Claude Code가:
1. Supabase에서 테이블 생성 방법 안내
2. 타입 자동 생성
3. 코드에서 바로 사용

### Q: 타입이 뭔가요?
**A:** 몰라도 됩니다! Claude Code가 알아서 관리합니다.

---

## 🚀 실제 사용 예시

### 예시 1: 회원 정보에 생일 추가
```
당신: "회원 정보에 생일 필드 추가해줘"

Claude Code:
1. Supabase users 테이블에 birthday 컬럼 추가 안내
2. npm run types:generate 실행
3. 코드에서 user.birthday 사용 가능
4. 완료!
```

### 예시 2: 새로운 게시판 기능
```
당신: "공지사항 게시판 만들어줘"

Claude Code:
1. notices 테이블 생성 안내
2. npm run types:generate 실행
3. Notice 타입 자동 생성
4. 게시판 코드 작성
5. 완료!
```

### 예시 3: 오류 발생
```
당신: "코드에 빨간줄이 생겼어"

Claude Code:
1. npm run types:auto-fix 실행
2. "user_name을 userName으로 변경 필요" 발견
3. 자동 수정
4. 완료!
```

---

## ✅ 체크리스트 (Claude Code 전용)

Claude Code가 작업할 때 자동으로 체크합니다:

- [ ] 새 테이블 필요? → Supabase 안내 → types:generate
- [ ] 새 필드 필요? → DB 수정 안내 → types:generate  
- [ ] 타입 오류? → types:auto-fix
- [ ] import 오류? → 자동 import 추가
- [ ] 빌드 확인? → types:check

---

## 🆕 자동 수정 기능 v2.0

**이제 더 똑똑해졌습니다!**

### 자동으로 수정되는 것들:
- ✅ **import 문 자동 추가**: 누락된 타입 import 자동 추가
- ✅ **속성명 자동 변환**: snake_case ↔ camelCase 자동 변환
- ✅ **null 체크 추가**: 옵셔널 체이닝(?.) 자동 추가
- ✅ **any 타입 제거**: unknown 또는 구체적 타입으로 변경
- ✅ **모듈 경로 수정**: 잘못된 import 경로 자동 수정
- ✅ **DB 타입 동기화**: 24시간 이상 된 타입 자동 재생성

### VS Code 스니펫 지원:
- `impt` → import types from @/types
- `apiroute` → API route with auth
- `s2c` → snake to camel conversion
- `c2s` → camel to snake conversion

### 더 나은 오류 설명:
```bash
npm run types:explain
```
- 오류별 구체적 해결 방법
- 예시 코드 제공
- 자동 수정 가능 여부 표시

---

## 🎉 결론

**당신이 기억할 것: "타입 오류 수정해줘"**

그 외 모든 것은 Claude Code가 알아서 합니다!

- 개발 지식? 불필요 ❌
- 명령어 외우기? 불필요 ❌
- 복잡한 설정? 불필요 ❌

그냥 Claude Code에게 말씀만 하세요! 🤖

---

*마지막 업데이트: 2025-02-01 v2.0*