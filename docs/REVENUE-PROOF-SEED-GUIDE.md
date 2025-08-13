# 📸 수익 인증 갤러리 시드 데이터 가이드

## 개요
수익 인증 갤러리에 6개의 샘플 데이터를 추가하는 가이드입니다.
실제 이미지 파일은 `/public/images/revenue-proof/` 디렉토리에 이미 준비되어 있습니다.

## 이미지 파일 목록
```
public/images/revenue-proof/
├── 20250514_155618.png       # YouTube 5월 수익
├── 20250713_195132.png       # Instagram 7월 수익
├── IMG_2157.png              # TikTok 첫 정산
├── KakaoTalk_20250618_054750921_01.png  # YouTube 6월 최고 수익
├── image (2).png             # 멀티 플랫폼 수익
└── 스크린샷_2025-08-03_141501.png  # TikTok 라이브 수익
```

## 시드 데이터 추가 방법

### 방법 1: Node.js 스크립트 실행 (권장)

1. **로컬 서버 실행**
```bash
npm run dev
```

2. **브라우저에서 로그인**
- http://localhost:3000 접속
- 카카오 로그인 진행

3. **스크립트 실행**
```bash
node scripts/seed-revenue-proof.js
```

### 방법 2: Supabase Dashboard에서 SQL 실행

1. **Supabase Dashboard 접속**
- https://app.supabase.com 로그인
- 프로젝트 선택

2. **SQL Editor 이동**
- 좌측 메뉴에서 "SQL Editor" 클릭

3. **SQL 실행**
- `src/lib/supabase/seeds/revenue-proof-seed.sql` 파일 내용 복사
- SQL Editor에 붙여넣기
- "Run" 버튼 클릭

### 방법 3: API를 통한 수동 추가

1. **수익 인증 생성 페이지 접속**
```
http://localhost:3000/revenue-proof/create
```

2. **양식 작성**
- 제목, 플랫폼, 금액 입력
- 이미지는 public 폴더의 이미지 중 하나 선택
- 서명 추가
- 상세 내용 작성

3. **제출**
- "수익 인증하기" 버튼 클릭

## 시드 데이터 내용

### 1. YouTube Shorts 5월 수익 (285만원)
- 일상 브이로그와 먹방 콘텐츠
- 하루 3-4개 쇼츠 업로드
- 트렌드 캐치와 썸네일 최적화 팁

### 2. Instagram 릴스 7월 수익 (125만원)
- 패션 하울과 메이크업 튜토리얼
- 브랜드 협찬 3건
- 음악 선택과 해시태그 전략

### 3. TikTok 크리에이터 펀드 (78만원)
- 댄스 챌린지와 코미디 콘텐츠
- 팔로워 10만 달성
- 트렌드 사운드 활용 팁

### 4. YouTube 6월 최고 수익 (420만원)
- 게임 플레이 쇼츠
- 신작 게임 공략 영상
- 타이밍과 시리즈물 전략

### 5. 멀티 플랫폼 운영 (185만원)
- YouTube + Instagram 동시 운영
- 플랫폼별 콘텐츠 최적화
- 시간 관리 노하우

### 6. TikTok 라이브 수익 (150만원)
- 매일 2시간 라이브 방송
- 시청자 소통과 노래
- 선물 기능 활용

## 주의사항

⚠️ **중요**: 
- 실제 운영 환경에서는 실제 사용자의 진짜 수익 인증만 사용해야 합니다
- 시드 데이터는 개발/테스트 목적으로만 사용하세요
- 프로덕션 배포 전 시드 데이터는 삭제하세요

## 데이터 삭제 방법

시드 데이터를 삭제하려면:

```sql
-- Supabase SQL Editor에서 실행
DELETE FROM revenue_proofs 
WHERE title IN (
  '2025년 5월 YouTube Shorts 수익 인증',
  '2025년 7월 인스타그램 릴스 광고 수익',
  'TikTok 크리에이터 펀드 첫 정산',
  '6월 YouTube 최고 수익 달성!',
  '인스타그램 + YouTube 동시 운영 수익',
  '8월 TikTok 라이브 수익 공개'
);
```

## 문제 해결

### "No users found" 에러
- 먼저 로그인이 필요합니다
- 브라우저에서 카카오 로그인 후 다시 시도

### 이미지가 표시되지 않음
- `/public/images/revenue-proof/` 폴더 확인
- 파일명이 정확한지 확인
- Next.js 서버 재시작 (`npm run dev`)

### Supabase 연결 실패
- `.env.local` 파일의 환경 변수 확인
- Supabase 프로젝트 상태 확인
- 네트워크 연결 확인