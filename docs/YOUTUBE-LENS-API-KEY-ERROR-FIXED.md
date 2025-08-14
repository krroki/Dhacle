# 🔧 YouTube Lens API Key 저장 오류 해결 완료

## 📅 해결 일시
- **해결 완료**: 2025-01-18
- **문제 발생 환경**: https://dhacle.com (Vercel 배포)

## 🔴 문제 상황
API Key 검증은 성공하지만 저장 시 "Failed to save API key" 오류 발생

## 🎯 근본 원인
1. **RLS 정책 문제**: server-client.ts가 anon key만 사용하여 RLS 정책에 의해 INSERT가 차단됨
2. **함수 파라미터 불일치**: increment_api_key_usage SQL 함수 호출 시 잘못된 파라미터 사용
3. **부족한 에러 로깅**: 정확한 오류 원인 파악 어려움

## ✅ 해결 방법

### 1. Service Role Client 생성
**파일**: `/src/lib/supabase/server-client.ts`
- `createSupabaseServiceRoleClient()` 함수 추가
- Service Role Key를 사용하여 RLS 정책 우회

### 2. saveUserApiKey 함수 수정  
**파일**: `/src/lib/api-keys/index.ts`
- Service Role Client 사용으로 변경
- 상세한 에러 로깅 추가
- INSERT/UPDATE 시 에러 디테일 출력

### 3. incrementUsage 함수 수정
**파일**: `/src/lib/api-keys/index.ts`
- 올바른 파라미터(`p_user_id`, `p_service_name`) 사용
- user_api_keys 테이블에서 필요한 정보 조회 후 SQL 함수 호출

### 4. 디버깅 코드 최적화
**파일**: `/src/lib/api-keys/crypto.ts`
- 과도한 디버깅 로그 제거
- 프로덕션 환경에 적합하게 최적화

## 🚀 배포 체크리스트

### 환경 변수 확인 (Vercel Dashboard)
- [x] `ENCRYPTION_KEY` - 64자 hex 문자열
- [x] `NEXT_PUBLIC_SUPABASE_URL` 
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **필수 확인**

### 테이블 및 RLS 확인 (Supabase Dashboard)
- [x] `user_api_keys` 테이블 존재
- [x] RLS 정책 활성화
- [x] `increment_api_key_usage` 함수 존재

## 📝 변경된 파일 목록
1. `/src/lib/supabase/server-client.ts` - Service Role Client 추가
2. `/src/lib/api-keys/index.ts` - 핵심 로직 수정
3. `/src/lib/api-keys/crypto.ts` - 디버깅 코드 최적화

## 🔍 테스트 방법
1. Vercel에 배포
2. https://dhacle.com/tools/youtube-lens 접속
3. API Key 설정 버튼 클릭
4. 유효한 YouTube API Key 입력
5. 저장 성공 확인

## ⚠️ 주의사항
- Service Role Key는 절대 클라이언트에 노출되면 안 됨
- 프로덕션 로그에서 민감한 정보 제거 필요
- ENCRYPTION_KEY 변경 시 기존 저장된 API Key 모두 사용 불가

## 💡 추가 개선 사항 (선택)
1. 에러 메시지 사용자 친화적으로 개선
2. API Key 저장 성공 시 토스트 알림 추가
3. 로딩 상태 UI 개선

---
*작성자: Claude (SuperClaude Framework)*
*해결 완료: 2025-01-18*