# 🚨 긴급: 데이터베이스 테이블 생성 가이드

## 문제 상황
현재 Supabase 데이터베이스에 `revenue_proofs` 및 관련 테이블이 존재하지 않아 API 오류가 발생하고 있습니다.

```
Error: Could not find the table 'public.revenue_proofs' in the schema cache
```

## ✅ 해결 방법 (5분 소요)

### Step 1: Supabase Dashboard 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 (golbwnsytwbyoneucunx)

### Step 2: SQL Editor 실행
1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New Query** 버튼 클릭

### Step 3: SQL 스크립트 실행
1. `fix-database-schema.sql` 파일의 전체 내용 복사
2. SQL Editor에 붙여넣기
3. **RUN** 버튼 클릭 (우측 하단 녹색 버튼)

### Step 4: 실행 결과 확인
성공 시 다음과 같은 메시지가 표시됩니다:
```
Success. No rows returned
```

### Step 5: 테이블 생성 확인
1. 왼쪽 메뉴에서 **Table Editor** 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - ✅ profiles
   - ✅ revenue_proofs
   - ✅ proof_likes
   - ✅ proof_comments
   - ✅ proof_reports
   - ✅ user_badges
   - ✅ monthly_rankings

## 📋 생성되는 항목들

### 테이블 (7개)
- **profiles**: 사용자 프로필 정보
- **revenue_proofs**: 수익 인증 메인 데이터
- **proof_likes**: 좋아요 기능
- **proof_comments**: 댓글 기능
- **proof_reports**: 신고 기능
- **user_badges**: 사용자 배지
- **monthly_rankings**: 월간 랭킹 캐시

### RLS 정책 (12개)
- 읽기/쓰기 권한 자동 설정
- 일일 1회 인증 제한
- 24시간 내 수정 가능
- 3회 신고 시 자동 숨김

### 트리거 (6개)
- 좋아요 수 자동 업데이트
- 댓글 수 자동 업데이트
- 신고 처리 자동화
- updated_at 타임스탬프 자동 갱신
- 신규 사용자 프로필 자동 생성

## 🧪 작동 테스트

### 1. API 테스트 페이지에서 확인
```
http://localhost:3000/api-test
```
- "모든 API 테스트" 버튼 클릭
- 모든 API가 200 OK 응답해야 함

### 2. 수익 인증 페이지 확인
```
http://localhost:3000/revenue-proof
```
- 페이지가 정상 로드되어야 함
- 에러 메시지 없어야 함

### 3. 시드 데이터 추가
로그인 후 브라우저 콘솔에서:
```javascript
await fetch('/api/revenue-proof/seed', { method: 'POST' }).then(r => r.json())
```

## ⚠️ 주의사항

1. **기존 테이블이 있는 경우**: 스크립트가 `IF NOT EXISTS` 조건을 사용하므로 안전함
2. **RLS 정책**: 자동으로 활성화되어 보안 적용됨
3. **트리거**: 자동으로 카운트 업데이트 처리

## 🆘 문제 발생 시

### 오류: "permission denied"
- Supabase Dashboard에서 Database 권한 확인
- Service Role 키 사용 여부 확인

### 오류: "already exists"
- 이미 일부 테이블이 존재하는 경우
- 기존 테이블 백업 후 재실행

### 오류: "foreign key violation"
- auth.users 테이블에 사용자가 없는 경우
- 먼저 카카오 로그인으로 사용자 생성

## ✨ 완료 후 확인사항

1. ✅ API 응답 정상 (200 OK)
2. ✅ 수익 인증 페이지 로드
3. ✅ 시드 데이터 추가 가능
4. ✅ 랭킹 표시 정상

---

**작성일**: 2025-01-13
**문의**: 문제 발생 시 에러 메시지와 함께 보고해주세요.