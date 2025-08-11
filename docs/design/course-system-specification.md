# 📚 디하클 강의 시스템 기술 명세서 v1.0

## 🎯 시스템 개요

### 프로젝트 배경
YouTube Shorts 크리에이터 교육 플랫폼 '디하클'의 핵심 기능인 온라인 강의 시스템 구축

### 핵심 목표
- 체계적인 4주/8주 커리큘럼 제공
- 무료/유료 강의 차별화
- DRM 보호된 고품질 동영상 스트리밍
- 강의별 고유 뱃지를 통한 성취감 부여
- 강사-수강생 간 Q&A 활성화

### 차별화 포인트
- 강의별 관리자 지정 뱃지 시스템 (고유 이미지)
- 모바일 최적화 (배속/PIP)
- 간편한 Stripe 결제
- 카카오 오픈채팅 연동

## 🏗️ 시스템 아키텍처

### 기술 스택
```yaml
Frontend:
  - Framework: Next.js 14.2.5
  - Language: TypeScript 5.x
  - Styling: Tailwind CSS + theme.deep.json
  - State: React Context API

Backend:
  - Database: Supabase (PostgreSQL)
  - Auth: Supabase Auth (Kakao OAuth)
  - Storage: Supabase Storage
  
Video:
  - Format: HLS (m3u8)
  - CDN: Cloudflare Stream
  - DRM: Basic (Phase 1) / Advanced (Phase 2)
  
Payment:
  - Provider: Stripe
  - Currency: KRW
  - Mode: One-time payment
```

### 시스템 흐름도
```
사용자 → 강의 목록 → 강의 상세 → 결제(Stripe) → 수강 → 진도 → 수료/뱃지
                        ↓
                    Q&A 게시판 ← 강사 답변
```

## 📊 데이터베이스 설계

### ERD (Entity Relationship Diagram)
```
users (Supabase Auth)
  ↓
enrollments ← courses → course_weeks
  ↓           ↓
progress    course_qna
  ↓
user_badges
```

### 테이블 상세 (6개)

#### 1. courses (강의 정보)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | PK |
| title | VARCHAR(200) | 강의명 |
| description | TEXT | 강의 설명 |
| instructor_name | VARCHAR(100) | 강사명 |
| thumbnail_url | TEXT | 썸네일 이미지 |
| badge_icon_url | TEXT | 뱃지 아이콘 |
| duration_weeks | INT | 4 or 8 |
| price | INT | 가격 (0=무료) |
| is_premium | BOOLEAN | 프리미엄 여부 |
| chat_room_url | TEXT | 오픈채팅 링크 |
| launch_date | DATE | 시작일 |
| status | VARCHAR(50) | upcoming/active/completed |

#### 2. course_weeks (주차별 콘텐츠)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | PK |
| course_id | UUID | FK → courses |
| week_number | INT | 주차 (1-8) |
| title | VARCHAR(200) | 주차 제목 |
| video_url | TEXT | HLS 스트리밍 URL |
| video_duration | INT | 영상 길이(초) |
| download_materials | JSONB | 다운로드 자료 |

#### 3. enrollments (수강 신청)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| course_id | UUID | FK → courses |
| payment_id | VARCHAR(200) | Stripe 결제 ID |
| payment_status | VARCHAR(50) | pending/completed/failed |
| enrolled_at | TIMESTAMP | 신청일 |
| completed_at | TIMESTAMP | 수료일 |
| certificate_issued | BOOLEAN | 수료증 발급 여부 |

#### 4. progress (진도 관리)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | PK |
| enrollment_id | UUID | FK → enrollments |
| week_number | INT | 주차 |
| watched_seconds | INT | 시청 시간 |
| completed | BOOLEAN | 완료 여부 |
| completed_at | TIMESTAMP | 완료일 |

#### 5. course_qna (Q&A)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | PK |
| course_id | UUID | FK → courses |
| user_id | UUID | FK → users |
| parent_id | UUID | FK → course_qna (답글) |
| title | VARCHAR(200) | 제목 |
| content | TEXT | 내용 |
| is_answer | BOOLEAN | 강사 답변 여부 |
| is_resolved | BOOLEAN | 해결 여부 |

#### 6. user_badges (뱃지)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| course_id | UUID | FK → courses |
| earned_at | TIMESTAMP | 획득일 |

## 🎨 UI/UX 설계

### 페이지 구조
```
/courses
├── /free                    # 무료 강의 목록
├── /premium                 # 유료 강의 목록
├── /[id]                   # 강의 상세
│   ├── /week/[num]         # 주차별 수강
│   ├── /qna                # Q&A 게시판
│   └── /certificate        # 수료증
└── /my-courses             # 내 강의 (마이페이지)
```

### 주요 화면 와이어프레임

#### 1. 강의 목록 (/courses/free, /courses/premium)
```
┌─────────────────────────────────────────────┐
│  [무료 강의]  [프리미엄 강의]  (탭 네비게이션)  │
├─────────────────────────────────────────────┤
│  정렬: [최신순 ▼]                             │
├─────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ 썸네일  │ │ 썸네일  │ │ 썸네일  │          │
│  │ 16:9   │ │ 16:9   │ │ 16:9   │          │
│  ├────────┤ ├────────┤ ├────────┤          │
│  │강의명   │ │강의명   │ │강의명   │          │
│  │강사: OO │ │강사: OO │ │강사: OO │          │
│  │4주 과정 │ │8주 과정 │ │4주 과정 │          │
│  │무료     │ │₩100,000│ │₩50,000 │          │
│  └────────┘ └────────┘ └────────┘          │
└─────────────────────────────────────────────┘
```

#### 2. 강의 상세 (/courses/[id])
```
┌─────────────────────────────────────────────┐
│  ← 목록으로                                   │
├─────────────────────────────────────────────┤
│  ┌──────────────────────────────────┐       │
│  │         강의 썸네일 (대형)          │       │
│  └──────────────────────────────────┘       │
│                                             │
│  [뱃지] 쇼츠 마스터 과정                      │
│  강사: 김철수 | 4주 과정                      │
│  ₩50,000                                    │
│                                             │
│  [수강 신청하기] [오픈채팅 참여]              │
├─────────────────────────────────────────────┤
│  📚 커리큘럼                                 │
│  ┌─────────────────────────────────┐       │
│  │ ✅ Week 1: 기초 이론              │       │
│  │ ✅ Week 2: 실전 편집              │       │
│  │ 🔄 Week 3: 알고리즘 이해          │       │
│  │ 🔒 Week 4: 수익화 전략            │       │
│  └─────────────────────────────────┘       │
├─────────────────────────────────────────────┤
│  💬 Q&A (23개 질문)         [더보기 →]       │
└─────────────────────────────────────────────┘
```

#### 3. 수강 페이지 (/courses/[id]/week/[num])
```
┌─────────────────────────────────────────────┐
│  Week 3: 알고리즘 이해                        │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │      [동영상 플레이어]               │   │
│  │      • 배속: 1x                    │   │
│  │      • PIP 모드                    │   │
│  │      • 전체화면                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ⏱️ 진도: 15:30 / 45:00 (34%)              │
├─────────────────────────────────────────────┤
│  📎 다운로드 자료                            │
│  • 알고리즘 분석 템플릿.pdf [다운로드]        │
│  • 해시태그 리스트.xlsx [다운로드]           │
├─────────────────────────────────────────────┤
│  [← 이전 주차] [완료] [다음 주차 →]          │
└─────────────────────────────────────────────┘
```

## 🏆 뱃지 시스템

### 뱃지 관리 방식
- **관리자 업로드**: 각 강의별로 관리자가 고유 뱃지 이미지를 직접 업로드
- **이미지 저장**: Supabase Storage의 `badges` 버킷에 저장
- **DB 연결**: `courses.badge_icon_url`에 이미지 URL 저장

### 뱃지 이미지 규격
```yaml
포맷: PNG 또는 SVG
크기: 100x100px (권장)
최대 파일 크기: 500KB
배경: 투명 배경 권장
파일명 규칙: badge_course_{course_id}.png
```

### 관리자 업로드 프로세스
1. 강의 생성 시 뱃지 이미지 필수 업로드
2. Supabase Storage에 자동 저장
3. CDN URL 생성 및 DB 저장
4. 이미지 변경 시 기존 파일 덮어쓰기

### 뱃지 표시 위치
1. 사용자 프로필 (마이페이지)
2. 댓글/게시글 작성자명 옆
3. 수익인증 게시판
4. 강의 수료증
5. 리더보드/랭킹

### 뱃지 표시 방식
```html
<!-- 뱃지 이미지 표시 -->
<img 
  src="{badge_icon_url}" 
  alt="{course_title} 뱃지"
  class="badge-icon"
  width="24" 
  height="24"
/>

<!-- 툴팁 -->
<span class="tooltip">
  {user_name}의 {course_title} 수료 (2025.01.15)
</span>
```

## 💳 Stripe 결제 시스템

### 가격 정책
| 유형 | 가격 | 설명 |
|------|------|------|
| 무료 강의 다시보기 | ₩3,000 | 라이브 종료 후 |
| 4주 일반 과정 | ₩50,000 | 기본 과정 |
| 4주 프리미엄 과정 | ₩100,000 | 심화 과정 |
| 8주 프리미엄 과정 | ₩200,000 | 마스터 과정 |

### 결제 플로우
```
1. 수강신청 클릭
2. Stripe Checkout 세션 생성
3. 결제 정보 입력 (Stripe 호스팅 페이지)
4. 결제 완료
5. Webhook 수신
6. DB 업데이트 (enrollment 생성)
7. 수강 권한 부여
8. 이메일 알림
```

### Webhook 이벤트 처리
- `checkout.session.completed` → 수강 등록
- `payment_intent.succeeded` → 결제 확인
- `payment_intent.payment_failed` → 실패 처리

## 🛡️ DRM 보호

### Phase 1 (기본 보호)
1. **우클릭 방지**
   ```javascript
   document.addEventListener('contextmenu', e => e.preventDefault());
   ```

2. **개발자 도구 감지**
   ```javascript
   if (window.outerHeight - window.innerHeight > 200) {
     video.pause();
     alert('보안상의 이유로 재생이 중단되었습니다.');
   }
   ```

3. **키보드 단축키 차단**
   - F12, Ctrl+Shift+I, Ctrl+Shift+J

4. **워터마크**
   - 사용자 ID 표시

### Phase 2 (고급 보호 - 추후)
- HLS 암호화
- DRM 라이선스 서버
- 디바이스 바인딩
- 동적 워터마크

## 📱 모바일 최적화

### 배속 재생
- 지원 속도: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- localStorage 저장 (사용자 선호도)

### PIP (Picture-in-Picture)
```javascript
if ('pictureInPictureEnabled' in document) {
  await video.requestPictureInPicture();
}
```

### 반응형 디자인
- Mobile: 360px~
- Tablet: 768px~
- Desktop: 1024px~

## 🚀 구현 로드맵

### Phase 1: MVP (1주차)
- [x] 기술 명세서 작성
- [ ] DB 스키마 생성
- [ ] 강의 목록 페이지
- [ ] 강의 상세 페이지
- [ ] 기본 비디오 플레이어
- [ ] 진도 관리

### Phase 2: 핵심 기능 (2주차)
- [ ] Stripe 결제 연동
- [ ] Q&A 게시판
- [ ] 뱃지 시스템
- [ ] 수료증 발급

### Phase 3: 고도화 (3주차)
- [ ] DRM 보호 강화
- [ ] 배속/PIP 기능
- [ ] 관리자 페이지
- [ ] 성능 최적화

## 📋 체크리스트

### 개발 전 준비사항
- [ ] Stripe 계정 생성
- [ ] Stripe API 키 발급
- [ ] Cloudflare Stream 계정
- [ ] HLS 스트리밍 서버 구축
- [ ] Supabase Storage 설정

### 보안 체크리스트
- [ ] SQL Injection 방지
- [ ] XSS 방지
- [ ] CORS 설정
- [ ] Rate Limiting
- [ ] Webhook 서명 검증

### 성능 목표
- 페이지 로드: < 3초
- 비디오 시작: < 5초
- API 응답: < 200ms
- 동시 접속: 1000명+

---

*작성일: 2025-01-11*
*버전: 1.0*
*작성자: PM AI*
*검토자: -* 