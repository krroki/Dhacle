# ⚠️ 필독: SQL 테이블 생성 시 반드시 따라야 할 프로세스

## 🚨 중요: 다음 AI도 이 프로세스를 따라야 합니다!

### 📝 SQL 테이블 생성 = 2단계로 끝

**1. SQL 파일 생성**
```bash
# 파일 위치: supabase/migrations/날짜_설명.sql
supabase/migrations/20250129_new_feature.sql
```

**2. 프로덕션 실행** ⭐
```bash
# 이 명령어 하나로 끝!
npm run sql:apply supabase/migrations/파일명.sql
```

### ✅ 확인 명령어
```bash
# 상태 체크
npm run prod:check

# Vercel 배포
npm run deploy:vercel
```

## ❌ 자주 발생하는 실수

1. **SQL 파일만 만들고 실행 안함** → 500 에러
2. **로컬에만 적용하고 프로덕션 안함** → 500 에러
3. **환경변수 설정 안함** → 500 에러

## ✅ 체크리스트

- [ ] SQL 파일 생성 (`supabase/migrations/`)
- [ ] 프로덕션 DB에 SQL 실행
- [ ] 타입 재생성
- [ ] `npm run prod:check` 성공
- [ ] Vercel 재배포

## 🔗 Supabase 프로젝트 정보

- **Project ID**: golbwnsytwbyoneucunx
- **Dashboard**: https://supabase.com/dashboard/project/golbwnsytwbyoneucunx
- **Database URL**: 환경변수 참조

## 📌 기억하세요!

> "테이블 생성 = SQL 파일 생성 + **프로덕션 실행**"

SQL 파일만 만들면 아무 의미 없습니다. 
**반드시 프로덕션 DB에 실행해야 합니다!**