# Dhacle **YouTube Lens** — 최종 구현 지시서 (v2)

## A. 실행 요약 (1\~2p)

**프로젝트 명/경로**

* `dhacle.com/tools/youtube-lens` (기존 구현 **재사용**, 충돌 금지)

**핵심 미션**

* **허용(승인)된 채널 리스트에 한해**, **전일 Δ(일일 조회수 증가분)** 기반 랭킹·인사이트를 **일 1회 배치**로 제공.
* **조회수 중심, 단순·명확한 UX**로 **오늘 올릴 소재**를 즉시 고르는 데 집중.

**주요 제약**

1. **전체 유튜브 전수 탐색 금지** (허용 리스트만)
2. **OAuth/Analytics 미사용**, **YouTube Data API v3 공개 데이터만**
3. **Shorts 판별 = 길이(≤60s) + 키워드 + 썸네일 세로비(≥1)** 합성 + **관리자 오버라이드**
4. **일 1회 배치(옵션 6/12h)**, **WebSub/실시간 미사용**
5. **비인가 원시 스냅샷 30일 롤링 삭제**(정책 준수)
6. **상용 데이터 금지**(SocialBlade 등)

> API/쿼터 근거: `channels.list`, `videos.list`, `playlistItems.list`는 **호출당 1 유닛**, `search.list`는 **100 유닛**으로 고비용이므로 회피합니다. 또한 `channels.list`는 `part=statistics,contentDetails`로 **구독자수/총조회수/업로드 플레이리스트**를 취득하고(`contentDetails.relatedPlaylists.uploads`), `videos.list(contentDetails)`의 `duration`(ISO8601)로 길이 판별합니다. `snippet.thumbnails.*`의 `width/height`로 세로비 판별이 가능합니다. ([Google for Developers][1])

**가치 제안**

* **아이디어 발굴 부담↓**: 승인 채널 내 **전일 Δ Top**만 빠르게 보여줌
* **소음↓**: Shorts 판별·임계 필터(100K/300K)로 **바이럴 신호만 노출**
* **운영 쉬움**: 관리자 승인 게이트 + 30일 롤링 정책 자동화

**핵심 KPI**

* 세션당 **아이디어 저장 수**, 팔로우 전환율, 일일 요약 알림 CTR, WAU/리텐션, 허용 채널 커버리지

**타임라인 개요**

* **Phase 0 (1\~2주)**: 코드/데이터 감사, 연구 설계, 쿼터/정책 점검
* **Phase 1 (2\~3주)**: MVP 코어(Δ 집계·승인 게이트·대시보드 최소·랭킹·저장)
* **Phase 2 (2\~3주)**: Shorts/키워드/카테고리·검색·알림(일간)
* **Phase 3 (1\~3주)**: 품질/성능/UX 고도화 + 비교/CSV Export(선택)

---

## B. 단계별 계획 (Phase) — **범위·수용 기준 포함**

### Phase 0 — **코드/데이터 감사 & 연구 설계**

**목표**

* 기존 `/tools/youtube-lens` 구현 자산(컴포넌트/스토어/유틸) **전수 목록화** 및 재사용 계획 수립
* **API 호출 플랜/쿼터 예산/정책(30일)** 체크리스트 완료
* **키 분리 정책**: \*\*통계·집계(이번 구현)\*\*는 **관리자 API 키**, \*\*검색 기능(기존 구현)\*\*은 **사용자 API 키** 사용

**스코프 In**

* 경로/라우팅 충돌 점검, Zustand/React Query 키 충돌 정리
* DB 스키마 갭 분석(승인 게이트, 스냅샷/Δ 테이블, 키워드/카테고리 뷰)
* YouTube Data API 문서 확정: `channels.list`, `playlistItems.list`, `videos.list` 중심 (**search.list 회피**) — 쿼터 근거 포함 ([Google for Developers][1])

**스코프 Out**

* 실시간 WebSub, OAuth(Analytics/Reporting), 상용 데이터, 국가별 완전 분해

**수용 기준**

* 재사용 가능한 컴포넌트/스토어/유틸 목록 & 영향도 표 완료
* API 호출 예산서: 1,000채널 일일 약 **20 유닛**(50채널/호출 × 20회), 상한·버퍼 정의. *예: playlistItems TopN 소량 추가 포함* ([Google for Developers][1])
* 데이터 보존/삭제 절차(30일 롤링) 설계서 승인 *(정책 참고)*. ([Google for Developers][2])

---

### Phase 1 — **MVP 코어** (허용 채널 Δ·승인 게이트·대시보드 최소)

**목표**

* 승인 채널의 **전일 Δ 조회수** 집계 & 랭킹
* **RLS + 승인 게이트**(미승인 비노출)
* 대시보드 **“오늘의 30초”** 최소 6블록(카테고리/키워드/신흥/Top 쇼츠(샘플)/팔로우/보드 미리보기) — *Top 쇼츠는 채널 기반 샘플*

**스코프 In**

* **배치 파이프라인**

  1. `channels.list(part=statistics,contentDetails&id=<=50)` batched
  2. 스냅샷 적재(`channel_daily_snapshot`), Δ 계산(`channel_daily_delta`)
  3. Δ 음수 보정(최소 0), 이상치 클립(상위 퍼센타일 컷)
  4. 카테고리/세부카테고리 채널 프로필 적용(관리자 지정 우선)
* **UI/UX (필수 7필드 & 천/만)**

  * 모든 표·카드·드로어·모달에 **채널명/구독자수/일일 조회수/총 조회수/카테고리/세부카테고리/형식** 표기
  * 숫자 포맷은 **k/m 금지, “천/만”만** (`formatNumberKo`)
* **승인 콘솔(Admin/Channels)**: 추가/편집/승인/반려/삭제 + 감사 로그
* **Idea Board** 기본 저장/삭제(기존 재사용)

**데이터 흐름**

* **허용 채널 목록 → channels.list → snapshot → Δ 집계 → ranking view**
* **대시보드 요약**: Δ Top, 카테고리 점유, 키워드 Top(Phase 2에서 고도화), 신흥 채널(Top 신규진입 규칙)

**API 호출 예시**

* `GET /youtube/v3/channels?part=statistics,contentDetails&id={50개까지 CSV}&key={ADMIN_KEY}` → **1 유닛/호출** ([Google for Developers][1])
* (보조) `GET /youtube/v3/playlistItems?part=snippet&playlistId={uploadsId}&maxResults=10&key={ADMIN_KEY}` → **1 유닛/호출** ([Google for Developers][3])

**DB 스키마/인덱스** — *자세한 SQL은 섹션 D, E, G 아래*

* `channels(approval_status, subscriber_count, view_count_total, category, subcategory, dominant_format, …)`
* `channel_daily_snapshot(channel_id, date, view_count_total, subscriber_count, …)`
* `channel_daily_delta(channel_id, date, delta_views)`
* 인덱스: `(channel_id, date)`, `approval_status`, 파티셔닝: `date` (월 단위)

**RLS 정책**

* 일반 사용자: `channels.approval_status='approved'` **만 접근**
* Admin: 전체 접근 / MV는 admin 전용

**UI 와이어 (요약)**

* **랭킹 표**(Compact): 1스크린 **18\~22행**, 컬럼=순위/채널명/구독자수/일일 조회수/총 조회수/카테고리/세부카테고리/형식/비교
* **대시보드 6블록**: 1440px 한 화면 수납(밀도 Compact+썸네일 S)

**성능 목표**

* 주요 리스트/검색 **p95 < 500ms**, 배치는 1,000채널 기준 **< 5분**

**리스크/완화**

* Data API 통계가 **지연/스테일**일 수 있음 → **Δ는 추정(Estimated)** 라벨, 7d 스파크라인으로 급변 탐지, 이상치 클립. (이슈 보고 사례 존재) ([Google Issue Tracker][4])

**테스트 계획**

* 유닛(Vitest): Δ 계산(음수 0 클립), 천/만 포맷, Shorts 판별 룰
* E2E(Playwright): 승인 채널만 노출, 대시보드 6블록 한 화면, 랭킹 7필드/정렬
* MSW: API 모킹(성공/쿼터 초과/빈 응답)

**수용 기준**

* **1,000 채널** 일일 배치 성공, Δ 정합(음수 0), 임계 필터 동작
* 랭킹/카드/드로어/모달 **7필드 전면 표기**, **천/만 포맷** 일관 적용

---

### Phase 2 — **Shorts/키워드/카테고리·검색·알림(일간)**

**목표**

* **Shorts 판별 규칙**(길이/키워드/세로비 + 오버라이드) 정식 적용
* **키워드 TopN·카테고리 점유율** 지표 안정화
* **통합 검색(채널/영상/키워드)**— *검색 호출은 기존 구현 정책대로 **사용자 API 키** 사용*
* **일간 요약 알림**(팔로우 기반)

**스코프 In**

* `videos.list(part=contentDetails,snippet&id=<=50)`로 **duration**(ISO8601→초) + **썸네일 width/height** + **제목/설명** 토큰화 구축 ([Google for Developers][5])
* Shorts 스코어 = `w1*I(duration<=60)` + `w2*I(#shorts|#쇼츠|shorts)` + `w3*I(height/width>=1)`; **스코어≥T**시 Shorts, **관리자 오버라이드 필드** 최종 결정
* 키워드 TopN: 간단 규칙(불용어 제거, n-gram 1\~2), **전일 상위 영상/채널 제목·설명 기반**
* 카테고리 점유율: 승인 채널 집계, 쇼츠/롱폼/라이브 **형식별 분리**(옵션)
* 알림(메일/푸시): 전일 요약(팔로우 채널 Δ 상위/키워드/Top 쇼츠 샘플)

**데이터 흐름**

* `channels.contentDetails.relatedPlaylists.uploads` → `playlistItems.list` → 최신 업로드 N개 id → `videos.list`(배치) → Shorts 판별/키워드 추출
  (*uploads 플레이리스트는 channels.list의 contentDetails에서 제공*) ([Google for Developers][1])

**API 호출 예시**

* `GET /playlistItems?part=snippet&playlistId={uploads}&maxResults=20&key={ADMIN_KEY}` (**1 유닛**) ([Google for Developers][3])
* `GET /videos?part=contentDetails,snippet&id={<=50 CSV}&key={ADMIN_KEY}` (**1 유닛**) ([Google for Developers][5])

**UI/UX**

* **Top 쇼츠(그리드/리스트)**: 각 카드 하단 2\~3줄에 **7필드 핵심 메타**
* **Keywords/Categories**: 칩/표에서 **필터 상태**로 랭킹/Top 쇼츠에 드릴다운

**테스트**

* Shorts 오탐/미탐 케이스 세트(가로형 60s 이하, #shorts 미표기 등)
* 키워드 상위 n 변화에 대한 안정성(샘플링)
* 사용자 키/관리자 키 라우팅 분기(검색=사용자, 집계=관리자)

**수용 기준**

* **Shorts 판별 정확도 기준(내부 샘플)** 충족 & **오버라이드 UI** 작동
* 키워드/카테고리 페이지 p95<500ms
* 일간 알림 전송 성공(팔로우 기반)

---

### Phase 3 — **품질/성능/UX 고도화 & 비교/내보내기(선택)**

**스코프 In**

* 랭킹 **Δ/업로드** 평균 토글, **7d 스파크라인**
* **Compare(2\~4 채널)**: 7d Δ, Δ/업로드, Shorts 비중, 키워드 Top5
* **CSV Export**(랭킹/키워드/카테고리/보드)
* **관측성/알림 튜닝**: 오류/지연 감지, 알림 우선순위

**성능 목표**

* 주요 조회 **p95 < 400ms**, 대량 필터링 시 **서버 측 페이지네이션 + 인덱스/사전 집계** 강화

**수용 기준**

* Compare UI 정상, CSV 내보내기 파일 무결성
* p95 목표 충족, 에러율/타임아웃 임계 이하

---

## C. 아키텍처 & 데이터 모델

### 전체 구성

* **FE**: Next.js 15(App Router), React 19, TS(strict), shadcn/ui+Radix, Tailwind 3, Framer Motion 12
* **상태/데이터**: React Query 5, Zustand 5, React Hook Form 7
* **BE/Infra**: Supabase(Postgres, Auth, Storage, Realtime), Vercel(Edge/Serverless), Supabase CLI
* **결제**: TossPayments(후순위)
* **미디어/에디터**: TipTap 3 (HLS.js 미사용)

### ERD (요약)

```
channels(
  channel_id PK, title, handle, approval_status, source,
  subscriber_count, view_count_total,
  category, subcategory, dominant_format, // '쇼츠'|'롱폼'|'라이브'
  created_at, updated_at, notes
)

channel_daily_snapshot(
  channel_id FK→channels, date, view_count_total, subscriber_count,
  PRIMARY KEY(channel_id, date)
)

channel_daily_delta(
  channel_id FK→channels, date, delta_views,
  PRIMARY KEY(channel_id, date)
)

videos(
  video_id PK, channel_id FK, title, description,
  duration_sec, is_short_algo, is_short_override, // override 우선
  published_at, category_hint, subcategory_hint,
  thumb_w, thumb_h
)

video_daily_stats(
  video_id FK, date, view_count_total, like_count_total NULLABLE,
  PRIMARY KEY(video_id, date)
)

settings(
  key PK, value_json
)

approvals_log(
  id PK, channel_id, action, actor_id, before_json, after_json, created_at
)

evidence_flags(선택)
(
  id PK, entity_type, entity_id, flag_type, evidence_json, created_at
)

youtube_favorites(아이디어 보드)
(
  id PK, user_id, video_id, channel_id, memo, tags, created_at, updated_at
)

user_follows(
  id PK, user_id, channel_id, created_at
)
```

**인덱싱/파티셔닝**

* 주 인덱스: `(channel_id, date)` / `approval_status`
* 파티셔닝: `channel_daily_snapshot`, `channel_daily_delta`, `video_daily_stats`는 **date 월 파티션**
* 검색: `pg_trgm`/FTS(제목/설명/키워드) + `GIN` 인덱스

**MV 정책**

* **admin 전용 MV** (예: 일/주/월 랭킹 사전집계)
* 공용은 **RLS 통과 뷰/함수**만 사용

---

## D. API 호출 전략 & 쿼터

**핵심 엔드포인트 & 근거**

* `channels.list(part=statistics,contentDetails&id=...)`

  * **쿼터**: 1 유닛/호출, `maxResults` 0\~50, `contentDetails.relatedPlaylists.uploads`로 업로드 플레이리스트 ID 확보. ([Google for Developers][1])
* `playlistItems.list(part=snippet&playlistId=...&maxResults=N)`

  * **쿼터**: 1 유닛/호출 — 플레이리스트 최신 업로드 N개 영상 ID 취득. ([Google for Developers][3])
* `videos.list(part=contentDetails,snippet&id=<=50)`

  * **쿼터**: 1 유닛/호출, `contentDetails.duration`(ISO8601)로 길이 판별, `snippet.thumbnails.*(width/height)`로 세로비 판별. ([Google for Developers][5])
* (회피) `search.list` — **100 유닛/호출**로 고비용, *기능 요구와 불일치* → 불채용. ([Google for Developers][6])

**배치 스케줄**

* Supabase/Vercel Cron: **매일 05:00 KST** (옵션 6/12h)
* 실패 재시도(백오프), 부분 실패 시 재수집 큐

**예산(예: 1,000 채널)**

* `channels.list`: 50개/호출 × 20회 ≈ **20 유닛/일**
* `playlistItems.list`/`videos.list`: 상위 Δ 채널만 N개 샘플(선택) → +수 유닛
* 총 **여유 폭 충분**, `search.list` 미사용으로 대폭 절감

**Δ 계산 모범사례**

* `Δ = max(0, view_count_total(D) - view_count_total(D-1))`
* 비공개/삭제로 인한 급감→**0 클립**, 장기 결측 구간은 **단절 처리**
* 이상치(비정상 급증)는 상위 p99 캡 또는 MAD 기반 클립

**정책/보존**

* **30일 롤링 삭제** 자동화(원시 스냅샷) — YouTube API Services 정책 준수 취지(취소/권한 철회 시 30일 내 삭제 등 준수). ([Google for Developers][2])

---

## E. RLS/권한 설계

**정책 요약**

* **일반 사용자**: `channels.approval_status='approved'`인 행만 SELECT
* **Admin**: 전체 SELECT/INSERT/UPDATE/DELETE
* **MV/사전 집계**: **admin 스키마** 전용. 공용 노출은 RLS를 통과하는 **뷰/함수**에 한정.

**SQL 예시(요지)**

```sql
-- 1) APPROVED만 노출
alter table channels enable row level security;

create policy channels_select_approved
on channels for select
using (approval_status = 'approved');

-- 2) Admin 전용 롤
create role yl_admin;
grant yl_admin to authenticated;

-- 3) MV는 admin 전용 스키마
create schema if not exists yl_admin;
-- MV 예: 일간 랭킹
create materialized view yl_admin.mv_daily_ranking as
select c.channel_id, s.date, (s.view_count_total - lag(s.view_count_total) over (partition by c.channel_id order by s.date)) as delta_views
from channel_daily_snapshot s
join channels c on c.channel_id = s.channel_id;

revoke all on schema yl_admin from public;
```

**e2e 권한 테스트 시나리오**

1. 승인 전 채널이 **공용 랭킹/검색에 절대 노출되지 않음**
2. Admin 계정에서만 MV 접근 가능
3. RLS 우회 불가(예: 조인/서브쿼리/뷰 통해서도 미승인 행 불출력)

---

## F. UI/UX 명세(재사용 최우선)

### 페이지

1. **Dashboard**(오늘의 30초)
2. **Channel Ranking**(일/주/월, 임계 100K/300K)
3. **Top 쇼츠**(그리드/리스트)
4. **Keywords**
5. **Categories**
6. **Idea Board**
7. **Admin/Channels**

### **필수 7필드 & 숫자 규칙(전면 적용)**

* **채널명, 구독자수, 일일 조회수(전일 Δ), 총 조회수, 카테고리, 세부카테고리, 형식(쇼츠/롱폼/라이브)**
* 숫자 표기: \*\*“천/만”\*\*만 사용 (예: 1.2천, 12.3만, 1,234.5만) — **k/m 금지**
* 유틸: `formatNumberKo(n)`(천·만 전용), 툴팁에 원본 정수 `12,345,678` 병기

### 컴포넌트(shadcn/ui + Radix + TanStack) 맵핑

* **Button/Badge/Chip/Tooltip/Toast/Skeleton**
* **ChannelTable**(TanStack Table): 7필드 컬럼 고정, 열 숨김/정렬/CSV
* **ShortsGrid/List**: 썸네일 S/M/L 토글, 카드 1\~3줄 메타에 7필드 요약
* **Channel Drawer**: 우측 420px, 상단에 7필드 요약 + 최근 업로드(쇼츠 필터)
* **Video Modal**: 임베드 + 7필드(채널 단위 메타)

### 색상 토큰/톤(브랜드=HSL)

* **Primary 보라**: HSL **245 58% 61%** | 다크: **245 65% 77%**
* **Secondary 빨강**: HSL **0 100% 71%** | 다크: **0 90% 65%**
* **Accent 민트**: HSL **161 94% 50%** | 다크: **161 84% 45%**
* **시맨틱**: **민트=상승/Δ**, **보라=포커스/CTA**, **빨강=트렌드 배지**, 에러는 별도 `--error`

### 상호작용/단축키/접근성

* 단축키: `/` 검색, `s` 저장, `f` 팔로우, `⌘K` 팔레트
* Skeleton/Empty/토스트 일관
* ARIA 라벨 한국어, 대비 기준 충족

### 와이어(ASCII 요약)

* 대시보드 6블록 2×3(1440/Compact 한 화면 수납), 랭킹 18~~22행, Top 쇼츠 12~~16 카드

---

## G. 테스트·관측성

**테스트**

* **Unit**(Vitest/RTL): Δ 계산, 천/만 포맷, Shorts 룰/오버라이드, 권한 훅
* **E2E**(Playwright): 승인 전 채널 비노출, 7필드 표기, 밀도 토글, 필터 드릴다운
* **MSW**: API 정상/실패/쿼터 초과 시나리오

**관측성**

* Sentry(에러), Logflare/Supabase(로그), OpenTelemetry(선택)
* 배치 로그: **성공/스킵/삭제 건수** 집계, 알림

**성능**

* p95 < 500ms(Phase 3: 400ms), 캐시 키/사전집계/MV + 인덱스 튜닝

---

## H. 리스크 레지스터 & **채용하지 않은 안(사유 명시)**

| 항목                            | 배제 사유             | 대안(현 설계)                                              |
| ----------------------------- | ----------------- | ----------------------------------------------------- |
| **전체 유튜브 전수 탐색**              | 쿼터·효율 문제, 노이즈↑    | **허용 리스트** 운영                                         |
| **OAuth/Analytics/Reporting** | 동의/지연/복잡, 정책 리스크  | **Data API 공개 데이터**(Estimated)                        |
| **실시간(WebSub)**               | ROI 낮음/운영비↑       | **일 1회 배치**(옵션 6/12h)                                 |
| **국가별 완전 분해**                 | 데이터 한계/목표와 무관     | 카테고리/키워드 중심                                           |
| **자동 페이스리스 판별**               | 오탐/비전 비용          | **관리자 수작업 분류**                                        |
| **상용 데이터(SocialBlade 등)**     | 비용/법무             | **YouTube Data API 순정**                               |
| **HLS 미리보기**                  | 불필요/TOS 고려        | **YouTube 임베드/링크아웃**                                  |
| **search.list 남용**            | **100 유닛/호출** 고비용 | playlistItems+videos로 대체 ([Google for Developers][6]) |

---

## I. 확장 제안(스코프 내)

* **채널 추가 UX**: 개별 추가 + CSV 업로드, 핸들/URL 파서, 중복 검증
* **설정화**: 임계(100K/300K), 배치 빈도(24h/12h/6h), Top N 수
* **알림**: 일일 요약 메일/푸시(요약 템플릿), 팔로우 기반
* **메모/태깅 협업**: 아이디어 보드 메모/태그 공유
* **중복 탐지(선택)**: 제목 n‑gram + 채널 교차 규칙(경량 룰) — pHash는 보류

---

# 6) 핵심 연구 질문(답변)

**1. `channels.list(statistics,contentDetails)`를 50 ID 배치 호출할 때 쿼터/한계/신뢰도 & 음수/비공개 처리?**

* **쿼터**: `channels.list`는 **1 유닛/호출**. `id`는 CSV(여러 개) 허용, `maxResults`는 0\~50. **1,000채널 ⇒ 20호출 ≈ 20유닛/일**. `contentDetails.relatedPlaylists.uploads`로 업로드 목록 ID 확보. ([Google for Developers][1])
* **신뢰도/지연**: 통계 갱신이 지연되는 사례 보고 있음 → Δ는 **Estimated** 라벨, **이상치 클립**/7d 스파크라인 병용. ([Google Issue Tracker][4])
* **음수/비공개 전환**: `Δ = max(0, today-total - yesterday-total)`로 **음수 0 클립**, 비공개/삭제 시 **0** 처리. Δ 연속성 깨짐은 **단절 플래그**.

**2. Shorts 판별(길이/키워드/세로비) 임계·오탐 패턴·오버라이드 UX?**

* **길이**: `videos.list(contentDetails).duration` → ISO8601(`PT45S`) 파싱하여 **≤60s** 기준. ([Google for Developers][5])
* **키워드**: 제목/설명 `#shorts|#쇼츠|shorts` 포함 가산
* **세로비**: `snippet.thumbnails.*.width/height`로 **height/width ≥ 1** 가산 (값이 없을 수 있어 다중 해상도 중 최대값 기준). ([Google for Developers][7])
* **임계치 T**: 초기 `w1=0.5, w2=0.3, w3=0.2, T=0.6` → 데이터 기반 튜닝
* **오탐 패턴**: *가로형 60s 이하*, *#shorts 미표기* 등 → **관리자 오버라이드** 필드로 최종 결정
* **오버라이드 UX**: Admin/Channels/Video 상세에서 **토글** + 사유 메모, 감사 로그 남김

**3. RLS & MV 누출 방지 베스트 프랙티스?**

* **MV는 admin 스키마 전용**, 공용은 **RLS 통과**하는 **뷰/함수**를 통해서만 접근
* **정책**: SELECT 정책을 **테이블/뷰/함수** 모두에 일관 적용, 조인/서브쿼리 경유 누출 방지
* **테스트**: E2E로 “승인 전 채널이 어떤 경로로도 노출되지 않음” 검증

**4. 대시보드(오늘의 30초) 지표를 배치로 가장 가볍게?**

* 카테고리 점유율/신흥 채널/Top 쇼츠(샘플)/팔로우/보드 미리보기는 **사전 집계 뷰**로 생성
* 키워드는 **전일 상위 채널/영상 제목·설명만** 토큰화(가벼운 불용어 규칙)

**5. 검색 p95<500ms 위한 인덱스/캐시/사전집계 & TanStack 연동?**

* **서버 페이지네이션 + 정렬 키 인덱싱**
* FTS/`pg_trgm`와 `GIN` 인덱스, 범위 필터(`date`, `delta_views`) 결합
* React Query 키 체계(`yl/*`) + pagination/filters를 **키에 포함**, **staleTime**/**prefetch**
* TanStack Table은 **서버측 정렬/필터**로 위임

**6. 정책 준수(30일 보존) 자동화(SQL/cron) & 삭제/갱신 로그?**

* **배치** 후 `channel_daily_snapshot`/`video_daily_stats`에서 **D-30 미만만 보관**
* 삭제/갱신 건수 **housekeeping 로그 테이블**에 적재
* YouTube API 정책의 **30일 내 삭제/갱신 취지**에 부합. ([Google for Developers][2])

**7. UI/UX: 색상·Skeleton/Empty/토스트/단축키/접근성 & 컴포넌트 재사용?**

* **민트=상승/Δ**, **보라=포커스/CTA**, **빨강=트렌드 뱃지**, 에러는 별도 색
* Skeleton/Empty/토스트를 **모든 리스트/카드**에 통일 적용
* 키보드: `/`, `s`, `f`, `⌘K`
* 모든 텍스트 **한국어**만 사용, i18n 키 관리(하드코딩 금지)
* 기존 컴포넌트/스토어/유틸 **최우선 재사용**, props 확장으로 7필드·포맷 반영

---

# 7) 출력 요구(Deliverables)

## 샘플 코드

### 1) TypeScript — **채널 통계 수집 & Δ 계산(배치)**

```ts
// lib/youtube/fetchChannelStats.ts
// 관리자 키 사용 (검색만 사용자 키 사용)
const YT_BASE = 'https://www.googleapis.com/youtube/v3';

export async function fetchChannelStatsBatch(
  adminKey: string,
  channelIds: string[]
) {
  // 최대 50개/호출
  const chunks = [];
  for (let i = 0; i < channelIds.length; i += 50) {
    chunks.push(channelIds.slice(i, i + 50));
  }
  const results = [];
  for (const ids of chunks) {
    const url = new URL(`${YT_BASE}/channels`);
    url.searchParams.set('part', 'statistics,contentDetails,snippet');
    url.searchParams.set('id', ids.join(','));
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', adminKey);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`channels.list failed: ${res.status}`);
    const json = await res.json();
    results.push(...json.items);
  }
  return results;
}

// Δ 계산 (음수 0 클립, 이상치 캡)
export function computeDelta(today: number, yesterday: number, cap?: number) {
  const raw = today - yesterday;
  const clipped = Math.max(0, raw);
  return typeof cap === 'number' ? Math.min(clipped, cap) : clipped;
}
```

### 2) TypeScript — **Shorts 판별(룰+오버라이드)**

```ts
// lib/youtube/shorts.ts
export function parseISODurationToSec(iso: string): number {
  // PT#H#M#S -> seconds (단순 파서)
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = Number(m[1] || 0), mm = Number(m[2] || 0), s = Number(m[3] || 0);
  return h * 3600 + mm * 60 + s;
}

export function shortsScore({
  durationSec, hasHashtag, isPortrait,
}: { durationSec: number; hasHashtag: boolean; isPortrait: boolean; }) {
  const w1 = 0.5, w2 = 0.3, w3 = 0.2;
  return (durationSec <= 60 ? w1 : 0) + (hasHashtag ? w2 : 0) + (isPortrait ? w3 : 0);
}

export function isShort({ score, threshold = 0.6, override }:
  { score: number; threshold?: number; override?: boolean|null }) {
  return typeof override === 'boolean' ? override : score >= threshold;
}
```

### 3) TypeScript — **숫자 포맷(천/만 전용)**

```ts
// lib/format/number-ko.ts
export function formatNumberKo(n: number, opts?: { digitsSmall?: number; digitsMan?: 1|0 }) {
  const digitsSmall = opts?.digitsSmall ?? 1;
  const digitsMan = opts?.digitsMan ?? 1;
  if (!isFinite(n)) return '0';
  const abs = Math.abs(n), sign = n < 0 ? '-' : '';
  if (abs < 1000) return sign + String(abs);
  if (abs < 10000) return sign + (abs/1000).toFixed(digitsSmall).replace(/\.0$/,'') + '천';
  const v = abs/10000, d = v < 100 ? digitsMan : 0;
  return sign + v.toFixed(d).replace(/\.0$/,'') + '만';
}
```

### 4) SQL — **테이블/인덱스/RLS/Δ 집계/30일 롤링 삭제**

```sql
-- 핵심 테이블
create table if not exists channels(
  channel_id text primary key,
  title text not null,
  handle text,
  approval_status text not null default 'pending',
  source text default 'manual',
  subscriber_count bigint,
  view_count_total bigint,
  category text,
  subcategory text,
  dominant_format text, -- '쇼츠'|'롱폼'|'라이브'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists channel_daily_snapshot(
  channel_id text references channels(channel_id),
  date date not null,
  view_count_total bigint not null,
  subscriber_count bigint,
  primary key(channel_id, date)
);

create table if not exists channel_daily_delta(
  channel_id text references channels(channel_id),
  date date not null,
  delta_views bigint not null,
  primary key(channel_id, date)
);

-- 인덱스
create index if not exists idx_channels_status on channels(approval_status);
create index if not exists idx_snap_day on channel_daily_snapshot(date);
create index if not exists idx_delta_day on channel_daily_delta(date);

-- RLS
alter table channels enable row level security;
create policy channels_select_approved on channels for select
  using (approval_status = 'approved');

-- Δ 집계 (하루 1회)
insert into channel_daily_delta(channel_id, date, delta_views)
select s.channel_id, s.date,
       greatest(0, s.view_count_total - lag(s.view_count_total)
         over(partition by s.channel_id order by s.date)) as delta_views
from channel_daily_snapshot s
where s.date = current_date
on conflict (channel_id, date) do update
  set delta_views = excluded.delta_views;

-- 30일 롤링 삭제 (원시 스냅샷)
delete from channel_daily_snapshot where date < current_date - interval '30 days';
```

### 5) React Query 키/캐시 설계

```ts
// lib/queryKeys.ts
export const qk = {
  dash: (date: string) => ['yl/dash/summary', date],
  ranking: (p: {period:'daily'|'weekly'|'monthly', threshold:'100k'|'300k', filters:any}) =>
    ['yl/ranking', p],
  shorts: (p: any) => ['yl/shorts', p],
  keywords: (p: any) => ['yl/keywords', p],
  categories: (p: any) => ['yl/categories', p],
  board: (userId: string) => ['yl/board', userId],
  adminChannels: (p: any) => ['yl/admin/channels', p],
};
```

### 6) 라우트 구조

```
app/tools/youtube-lens/
  layout.tsx
  page.tsx                    # Dashboard
  ranking/page.tsx
  top-shorts/page.tsx
  keywords/page.tsx
  categories/page.tsx
  board/page.tsx
  compare/page.tsx            # ?ids=...
  admin/channels/page.tsx

app/api/youtube-lens/
  trending-summary/route.ts   # 6블록 집계
  ranking/route.ts
  videos/route.ts             # Shorts 판별 포함
  keywords/route.ts
  categories/route.ts
  favorites/route.ts
  follows/route.ts
  admin/channels/route.ts
  admin/approve/route.ts
  admin/import-csv/route.ts
```

### 7) **관리자 키 vs 사용자 키 분리** (중요)

* **원칙**:

  * **집계/통계/Δ/랭킹/대시보드/알림** → **관리자 API 키**
  * **검색(기존 구현 범위 한정)** → **사용자 API 키** (이미 저장소에 구현된 사용자 키 등록 기능 재사용)

```ts
// lib/youtube/client.ts
export function getYoutubeKeyForRoute(route: string, userKey?: string) {
  const useUserKey = route.startsWith('/api/youtube-lens/search');
  return useUserKey && userKey ? userKey : process.env.YT_ADMIN_KEY!;
}
```

---

# 8) 수용 기준(Acceptance)

* **데이터/배치**: 허용 채널 **1,000개** 기준, 일일 배치 성공(재시도 포함), Δ 집계 정확(음수 0 클립), **임계 필터(100K/300K)** 동작
* **보안**: 승인 전 채널 **전면 비노출(RLS+쿼리 가드 이중화)**
* **UX**: 대시보드 **6블록**(카테고리/키워드/신흥/Top 쇼츠/팔로우/보드) 한 화면에서 확인(1440/Compact)
* **성능**: 주요 리스트/검색 **p95 < 500ms**
* **정책**: 비인가 원시 스냅샷 **30일 롤링 삭제** 자동화
* **충돌 없음**: 기존 `/tools/youtube-lens`와 **라우트/컴포넌트/스토어 충돌 없이 재사용**
* **표기 규정**: 모든 화면/카드에 **필수 7필드** 표기, **숫자 “천/만”** 포맷 일관 적용
* **키 분리**: **검색=사용자 키**, **통계=관리자 키** 라우팅 검증

---

## 부록 1. 색상 토큰/버튼/배지/차트 톤 활용 규칙

* **버튼**: 기본/프라이머리(보라), 서브/윤곽, 파괴적(에러)
* **배지**: **Δ(민트)**, **트렌딩(빨강)**, **중립(회색)**
* **차트**: 기본 자동 색상, **민트**로 상승 강조(범례/포인트)
* **포커스/대표 CTA**: 보라
* **에러/경고**: 별도 `--error` (브랜드 레드와 구분)

---

## 부록 2. 사용자 시나리오 & 화면 플로우 (초보/성장 중심)

**페르소나 A – 초보 운영자**

1. 대시보드 진입(오늘의 30초) → Top 쇼츠 8~~12개 훑기 (카드 2~~3줄 메타=**7필드** 노출)
2. 카드 클릭 → 모달에서 **보드 저장**(메모/태그) → 바로 업로드 아이디어 확정
3. 필요 시 키워드 칩 클릭 → 랭킹으로 필터 상태 이동

**페르소나 B – 성장 운영자**

1. 랭킹(일/주/월)에서 Δ 상위 채널 **18\~22행**/스크린으로 스캔
2. 행 클릭 → **채널 드로어**: 7필드 요약 + 최근 업로드/Shorts만 보기
3. 2\~4개 비교(Phase 3)로 **카테고리 확장/집중** 전략 수립

**페르소나 C – 애널리스트(후순위)**

1. 키워드/카테고리 표 → CSV Export(Phase 3) → 팀 공유
2. 알림 요약/보드 아카이브로 스프린트 계획

**플로우 요약**
대시보드 → (랭킹/Top 쇼츠/키워드/카테고리) → (드로어/모달/비교/보드) → 알림

---

## 부록 3. UI/컴포넌트 재사용 체크리스트

* [ ] 기존 Button/Badge/Modal/Drawer/Table를 **props 확장**으로 7필드/천·만 포맷 반영
* [ ] Zustand store 키 충돌 없이 `yl/*` 네임스페이스 사용
* [ ] React Query **키/캐시** 통일(`qk.*`)
* [ ] 기존 검색 기능은 **사용자 키** 유지 (신규 통계는 **관리자 키**)

---

## 참고(공식 문서/정책)

* **channels.list** (쿼터 1, `contentDetails.uploads`, `maxResults` ≤ 50, `statistics.subscriberCount`/`hiddenSubscriberCount`) ([Google for Developers][1])
* **playlistItems.list** (쿼터 1) ([Google for Developers][3])
* **videos.list** (duration=ISO8601, contentDetails) ([Google for Developers][5])
* **thumbnails** (snippet.thumbnails width/height 존재) ([Google for Developers][7])
* **Quota cost 표** (메서드별 유닛) / **search.list=100** 유닛 ([Google for Developers][8])
* **YouTube API Services – Developer Policies** (저장/삭제 30일 조항 관련) ([Google for Developers][2])

---

# (별첨) 사용자 경험 보고서 — **Phase와 별개 배치**

**목표 요약**

* **한 화면 정보 밀도 극대화**(Compact+S), **드릴다운 최소 클릭**, **한국어만** 사용, **숫자 인지 용이(천/만)**

**핵심 UX 결정**

* **필수 7필드** 전면 표시: *사용자 “정보 부족” 불만 제거*
* **숫자 포맷 일관**: 글로벌 k/m 대신 **천/만** → 국내 운영자 즉시 인지
* **드로어 중심**: 테이블→드로어로 맥락 유지한 채 세부 탐색
* **키워드/카테고리 칩 → 필터 라우팅**: 주제 기반 탐색 가속
* **팔로우/보드 CTA**: 탐색→저장/알림까지 워크플로우 단축

**정보량/가독 균형 장치**

* 썸네일 **S/M/L** 토글, 제목 **1\~2줄** 컷, **툴팁**(정확값)
* **열 숨김/표시**로 개인별 밀도 최적화
* **Skeleton/Empty** 일관 적용으로 지각 성능 개선

**모바일 최적화**

* 카드형 리스트, Top 쇼츠 2열, 랭킹 1카드=7필드 2\~3줄 요약
* 하단 탭/Sticky CTA(보드/팔로우)로 조작 거리 단축

**접근성/언어**

* 모든 라벨/툴팁/토스트 **한국어 일원화**(하드코딩 금지, i18n)
* 스크린리더 라벨: “Δ 어제 대비 증가” 등 **풀 문장**

**검증 체크리스트(디자인 리뷰)**

* [ ] 대시보드 6블록 **1스크린 수납**(1440/Compact)
* [ ] 랭킹 **18\~22행** & **7필드** 전면 노출
* [ ] Top 쇼츠 **12\~16개** 카드 & 7필드 요약
* [ ] **천/만 포맷** 일관 + 툴팁 원본 표시
* [ ] 드로어/모달 모든 CTA 한 화면 내
* [ ] 모바일 카드 7필드 2\~3줄 요약 가독성 유지

---


아래는  \*\*핸드오프 팩(Handoff Pack)\*\*입니다.

> **주의:** 모든 사용자 노출 문구는 **한국어만**, 숫자 표기는 \*\*“천/만”\*\*만(※ k/m 금지)입니다.

---

## 0) 프로젝트 가드레일(요약)

* **경로**: `/tools/youtube-lens` (기존 구현과 충돌 금지, 재사용 우선)
* **스택**: Next.js 15(App Router), React 19, TS(strict), shadcn/ui+Radix, Tailwind 3, React Query 5, Zustand 5, Supabase(Postgres/Auth/Storage)
* **키 분리**:

  * **집계/통계/Δ/랭킹/대시보드/알림** → **관리자 YouTube API 키**
  * **검색(기존 구현 범위)** → **사용자 YouTube API 키** (이미 구현됨)
* **표기 규정(전면 적용)**: **채널명 · 구독자수 · 일일 조회수(전일 Δ) · 총 조회수 · 카테고리 · 세부카테고리 · 형식** 7필드와 **“천/만”** 포맷.
* **RLS**: 승인 전 채널 **전면 비노출**.
* **보존 정책**: 원시 스냅샷 30일 롤링 삭제.

---

## 1) 파일 트리(스캐폴딩)

```
app/
└─ tools/
   └─ youtube-lens/
      ├─ layout.tsx
      ├─ page.tsx                        # Dashboard (오늘의 30초, 6블록)
      ├─ ranking/
      │  └─ page.tsx                     # 채널 랭킹 (7필드 표기)
      ├─ top-shorts/
      │  └─ page.tsx                     # Top 쇼츠 (그리드/리스트, 7필드 메타)
      ├─ keywords/
      │  └─ page.tsx
      ├─ categories/
      │  └─ page.tsx
      ├─ board/
      │  └─ page.tsx                     # 아이디어 보드
      ├─ compare/
      │  └─ page.tsx                     # /compare?ids=...
      └─ admin/
         └─ channels/
            └─ page.tsx                  # 허용 채널 관리

app/api/
└─ youtube-lens/
   ├─ trending-summary/route.ts          # 대시보드 6블록 집계
   ├─ ranking/route.ts                   # 랭킹 데이터(일/주/월)
   ├─ videos/route.ts                    # Top 쇼츠 후보(Shorts 판별 포함)
   ├─ keywords/route.ts
   ├─ categories/route.ts
   ├─ favorites/route.ts                 # 보드 CRUD
   ├─ follows/route.ts                   # 팔로우
   └─ admin/
      ├─ channels/route.ts               # 허용 채널 CRUD
      ├─ approve/route.ts                # 승인/반려
      └─ import-csv/route.ts             # CSV 업로드

components/youtube-lens/
├─ ui/
│  ├─ button.tsx
│  ├─ badge.tsx
│  ├─ chip.tsx
│  ├─ delta-pill.tsx
│  ├─ thumb.tsx
│  ├─ sparkline.tsx                      # 7d Δ 미니 차트(placeholder OK)
│  ├─ search-bar.tsx
│  └─ table/
│     ├─ channel-table.tsx               # 7필드 표 표준 칼럼
│     └─ table-toolbar.tsx
├─ dashboard/
│  ├─ categories-card.tsx
│  ├─ keywords-card.tsx
│  ├─ newcomers-card.tsx
│  ├─ top-shorts-card.tsx                # 7필드 요약 2~3줄
│  ├─ follows-card.tsx
│  └─ board-preview-card.tsx
├─ shorts/
│  ├─ shorts-grid.tsx
│  └─ shorts-list.tsx
├─ keywords/keywords-panel.tsx
├─ categories/categories-panel.tsx
├─ board/board-list.tsx
├─ drawer/channel-drawer.tsx             # 우측 420px, 7필드 상단 고정
└─ modal/video-modal.tsx                 # 임베드 + 7필드(채널 메타)

lib/youtube-lens/
├─ strings.ko.ts                         # 모든 문구 한국어만
├─ query-keys.ts                         # React Query 키 통일
├─ number-format.ts                      # “천/만” 포맷 유틸
├─ shorts.ts                             # Shorts 판별 룰/오버라이드
├─ yt-client.ts                          # 관리자/사용자 키 분기
├─ tanstack.ts                           # 테이블 기본 옵션
├─ store.ts                              # Zustand(밀도/썸네일 사이즈 등)
└─ types.ts                              # 공통 타입(7필드 포함)

supabase/
├─ migrations/
│  ├─ 001_channels.sql
│  ├─ 002_snapshots_delta.sql
│  ├─ 003_rls_policies.sql
│  └─ 004_housekeeping.sql
└─ functions/
   └─ youtube-lens-batch/
      ├─ index.ts                        # 일일 수집/Δ 계산
      └─ housekeeping.ts                 # 30일 롤링 삭제

tests/
├─ e2e/
│  ├─ dashboard.e2e.spec.ts
│  ├─ ranking.e2e.spec.ts
│  └─ rls.e2e.spec.ts
├─ unit/
│  ├─ number-format.spec.ts
│  ├─ shorts.spec.ts
│  └─ delta.spec.ts
└─ mocks/
   ├─ server.ts                          # MSW
   └─ handlers.ts
```

---

## 2) 환경/설정

**`package.json` 주요 의존성**

```
next@15 react@19 react-dom@19
@tanstack/react-query@5 zustand@5
tailwindcss@3 postcss autoprefixer
shadcn-ui radix-ui lucide-react
zod date-fns
```

**Tailwind & 토큰**

* 글로벌 CSS 변수(브랜드/시맨틱)로 보라/민트/빨강/에러, 테이블 보더, 서브텍스트 등 정의.
* (이미 제공한) `youtube_lens_theme.css`를 `app/globals.css`에 임포트.

**.env**

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
YT_ADMIN_KEY=...      # 관리자 키(집계/통계/Δ)
```

---

## 3) 타입 & 유틸(핵심 코드)

### `lib/youtube-lens/types.ts`

```ts
export type FormatType = '쇼츠' | '롱폼' | '라이브';

export type CommonMeta = {
  channelId: string;
  channelName: string;          // 채널명
  subscribers: number;          // 구독자수
  dailyViews: number;           // 일일 조회수(전일 Δ, 채널 단위)
  totalViews: number;           // 총 조회수(채널 누적)
  category: string;             // 카테고리
  subcategory: string;          // 세부카테고리
  format: FormatType;           // 형식
};
```

### `lib/youtube-lens/number-format.ts` — **“천/만” 전용**

```ts
export function formatNumberKo(n: number, opts?: { digitsSmall?: number; digitsMan?: 1|0 }) {
  const digitsSmall = opts?.digitsSmall ?? 1;  // 천 구간 소수
  const digitsMan = opts?.digitsMan ?? 1;      // 만 구간 소수(100만 미만)
  if (!isFinite(n)) return '0';
  const abs = Math.abs(n), sign = n < 0 ? '-' : '';
  if (abs < 1000) return sign + String(abs);
  if (abs < 10000) return sign + (abs/1000).toFixed(digitsSmall).replace(/\.0$/,'') + '천';
  const v = abs/10000, d = v < 100 ? digitsMan : 0;
  return sign + v.toFixed(d).replace(/\.0$/,'') + '만';
}
```

### `lib/youtube-lens/shorts.ts` — **룰+오버라이드**

```ts
export function parseISODurationToSec(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = Number(m[1]||0), mm = Number(m[2]||0), s = Number(m[3]||0);
  return h*3600 + mm*60 + s;
}

export function shortsScore({durationSec, hasHashtag, isPortrait}:{
  durationSec:number; hasHashtag:boolean; isPortrait:boolean;
}) {
  const w1=0.5, w2=0.3, w3=0.2;
  return (durationSec<=60? w1:0) + (hasHashtag? w2:0) + (isPortrait? w3:0);
}

export function isShort({score, threshold=0.6, override}:{score:number;threshold?:number;override?:boolean|null}) {
  return typeof override==='boolean' ? override : score>=threshold;
}
```

### `lib/youtube-lens/yt-client.ts` — **관리자/사용자 키 분리**

```ts
export function getYoutubeKeyForRoute(route: string, userKey?: string) {
  const useUserKey = route.startsWith('/api/youtube-lens/search'); // 검색만 사용자 키
  return useUserKey && userKey ? userKey : process.env.YT_ADMIN_KEY!;
}
```

### `lib/youtube-lens/query-keys.ts`

```ts
export const qk = {
  dash: (date: string) => ['yl/dash/summary', date],
  ranking: (p:{period:'daily'|'weekly'|'monthly'; threshold:'100k'|'300k'; filters:any}) =>
    ['yl/ranking', p],
  shorts: (p:any) => ['yl/shorts', p],
  keywords: (p:any) => ['yl/keywords', p],
  categories: (p:any) => ['yl/categories', p],
  board: (userId:string) => ['yl/board', userId],
  adminChannels: (p:any) => ['yl/admin/channels', p],
};
```

### `lib/youtube-lens/strings.ko.ts` — **한국어만**

```ts
export const ko = {
  appTitle: 'YouTube Lens',
  search: '검색…',
  columns: {
    rank: '순위', name:'채널명', subs:'구독자수', daily:'일일 조회수', total:'총 조회수',
    category:'카테고리', subcategory:'세부카테고리', format:'형식', compare:'비교'
  },
  format: { shorts:'쇼츠', long:'롱폼', live:'라이브' },
  dash: { categories:'카테고리 점유율', keywords:'급상승 키워드', newcomers:'신흥 채널',
          topShorts:'Top 쇼츠 (어제 Δ 상위)', follows:'팔로우 채널 업데이트', board:'아이디어 보드 미리보기' },
};
```

---

## 4) UI 컴포넌트(핵심) — 7필드/천·만 반영

### `components/youtube-lens/ui/delta-pill.tsx`

```tsx
import { formatNumberKo } from '@/lib/youtube-lens/number-format';

export function DeltaPill({ value }:{ value:number }) {
  const txt = (value>=0? '+' : '') + formatNumberKo(value);
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--accent)]/10 text-[var(--accent-foreground)] px-2 py-0.5 text-xs">
      {txt}
    </span>
  );
}
```

### `components/youtube-lens/ui/thumb.tsx`

```tsx
export function Thumb({ src, alt, size='s' }:{
  src?:string; alt:string; size?:'s'|'m'|'l';
}) {
  const h = size==='s'? 114 : size==='m'? 142 : 170;
  const w = Math.round(h/16*9);
  return <div className="bg-slate-200 rounded-md overflow-hidden" style={{width:w, height:h}} aria-label={alt} />;
}
```

### `components/youtube-lens/table/channel-table.tsx`

```tsx
'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { qk } from '@/lib/youtube-lens/query-keys';
import { formatNumberKo } from '@/lib/youtube-lens/number-format';
import { DeltaPill } from '../ui/delta-pill';
import { ko } from '@/lib/youtube-lens/strings.ko';

type Row = {
  rank:number;
  channelId:string;
  channelName:string;
  subscribers:number;
  dailyViews:number;
  totalViews:number;
  category:string;
  subcategory:string;
  format:'쇼츠'|'롱폼'|'라이브';
};

export function ChannelTable(props:{params:{period:'daily'|'weekly'|'monthly';threshold:'100k'|'300k'}}) {
  const { data } = useQuery({
    queryKey: qk.ranking({period:props.params.period, threshold:props.params.threshold, filters:{} }),
    queryFn: async()=> {
      const r = await fetch('/api/youtube-lens/ranking', { cache: 'no-store' });
      if (!r.ok) throw new Error('ranking failed');
      return r.json() as Promise<Row[]>;
    }
  });

  return (
    <div className="w-full overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-[var(--muted)] text-slate-600">
          <tr>
            <th className="p-2 text-left w-14">{ko.columns.rank}</th>
            <th className="p-2 text-left">{ko.columns.name}</th>
            <th className="p-2 text-right w-28">{ko.columns.subs}</th>
            <th className="p-2 text-right w-32">{ko.columns.daily}</th>
            <th className="p-2 text-right w-32">{ko.columns.total}</th>
            <th className="p-2 text-left w-40">{ko.columns.category}</th>
            <th className="p-2 text-left w-48">{ko.columns.subcategory}</th>
            <th className="p-2 text-left w-20">{ko.columns.format}</th>
            <th className="p-2 w-16">{ko.columns.compare}</th>
          </tr>
        </thead>
        <tbody>
          {data?.map(row=>(
            <tr key={row.channelId} className="border-b">
              <td className="p-2">{row.rank}</td>
              <td className="p-2">
                <div className="flex items-center gap-2">
                  {/* 썸네일 S 생략가능: <Thumb alt={row.channelName} size="s" /> */}
                  <div className="flex flex-col">
                    <span className="font-medium">{row.channelName}</span>
                    <span className="text-xs text-slate-500">
                      구독 {formatNumberKo(row.subscribers)} · 총 {formatNumberKo(row.totalViews)}
                    </span>
                  </div>
                </div>
              </td>
              <td className="p-2 text-right" aria-label={`구독자수 ${row.subscribers.toLocaleString()}`}>
                {formatNumberKo(row.subscribers)}
              </td>
              <td className="p-2 text-right" aria-label={`어제 대비 ${row.dailyViews.toLocaleString()}`}>
                <DeltaPill value={row.dailyViews} />
              </td>
              <td className="p-2 text-right" aria-label={`총 조회수 ${row.totalViews.toLocaleString()}`}>
                {formatNumberKo(row.totalViews)}
              </td>
              <td className="p-2">{row.category}</td>
              <td className="p-2">{row.subcategory}</td>
              <td className="p-2">{row.format}</td>
              <td className="p-2 text-center"><input type="checkbox" aria-label="비교 선택" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### `components/youtube-lens/shorts/shorts-card.tsx`

```tsx
import { formatNumberKo } from '@/lib/youtube-lens/number-format';
import { DeltaPill } from '../ui/delta-pill';

type Props = {
  title:string; lengthSec:number;
  meta:{ channelName:string; subscribers:number; totalViews:number; dailyViews:number; category:string; subcategory:string; format:'쇼츠'|'롱폼'|'라이브' };
};

export function ShortsCard({ title, lengthSec, meta }: Props) {
  const mm = Math.floor(lengthSec/60); const ss = String(lengthSec%60).padStart(2,'0');
  return (
    <div className="rounded-lg border p-2">
      <div className="bg-slate-200 rounded-md aspect-[9/16]" />
      <div className="mt-2 text-sm font-medium line-clamp-1">{title}</div>
      <div className="text-xs text-slate-500 line-clamp-1">
        {meta.channelName} · 구독 {formatNumberKo(meta.subscribers)} · 총 {formatNumberKo(meta.totalViews)}
      </div>
      <div className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
        형식 {meta.format} · 어제 <DeltaPill value={meta.dailyViews} /> · {meta.category} · {meta.subcategory}
      </div>
      <div className="mt-1 text-[10px] text-slate-500">길이 {mm}:{ss}</div>
    </div>
  );
}
```

---

## 5) 페이지 스켈레톤

### `app/tools/youtube-lens/page.tsx` — **Dashboard(오늘의 30초)**

```tsx
import { ko } from '@/lib/youtube-lens/strings.ko';

export default function DashboardPage() {
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">{ko.appTitle} · 대시보드</h1>
      <div className="grid grid-cols-3 gap-4">
        <section className="rounded-lg border p-3">
          <h2 className="text-sm font-semibold">{ko.dash.categories}</h2>
          <div className="h-48 bg-slate-100 rounded-md mt-2" />
        </section>
        <section className="rounded-lg border p-3">
          <h2 className="text-sm font-semibold">{ko.dash.keywords}</h2>
          <div className="h-48 bg-slate-100 rounded-md mt-2" />
        </section>
        <section className="rounded-lg border p-3">
          <h2 className="text-sm font-semibold">{ko.dash.newcomers}</h2>
          <div className="h-48 bg-slate-100 rounded-md mt-2" />
        </section>
        <section className="rounded-lg border p-3 col-span-2">
          <h2 className="text-sm font-semibold">{ko.dash.topShorts}</h2>
          <div className="grid grid-cols-4 gap-3 mt-2">
            {/* ShortsCard 8~12개 배치 */}
          </div>
        </section>
        <section className="rounded-lg border p-3">
          <h2 className="text-sm font-semibold">{ko.dash.follows}</h2>
          <div className="h-48 bg-slate-100 rounded-md mt-2" />
        </section>
      </div>
    </main>
  );
}
```

### `app/tools/youtube-lens/ranking/page.tsx`

```tsx
import { ChannelTable } from '@/components/youtube-lens/table/channel-table';

export default function RankingPage() {
  return (
    <main className="p-4 space-y-3">
      <h1 className="text-lg font-semibold">채널 랭킹</h1>
      {/* 필터 바 생략: 기간/임계/카테고리/세부/형식 */}
      <ChannelTable params={{ period:'daily', threshold:'100k' }} />
    </main>
  );
}
```

---

## 6) API 스텁(Next App Router)

### `app/api/youtube-lens/ranking/route.ts`

```ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Supabase에서 승인 채널 + Δ 조인 후 7필드로 매핑해 반환
  const rows = [
    {
      rank: 1, channelId:'abc', channelName:'채널 A',
      subscribers: 1234000, dailyViews: 2105000, totalViews: 12345000,
      category:'Entertainment', subcategory:'축구/하이라이트', format:'쇼츠' as const,
    },
  ];
  return NextResponse.json(rows);
}
```

> 실제 구현에서는 Supabase RLS를 통과하는 **view/function**을 호출해 **승인 채널만** 노출되도록 합니다.

---

## 7) Supabase SQL 마이그레이션(요지)

### `001_channels.sql`

```sql
create table if not exists channels(
  channel_id text primary key,
  title text not null,
  handle text,
  approval_status text not null default 'pending',
  source text default 'manual',
  subscriber_count bigint,
  view_count_total bigint,
  category text,
  subcategory text,
  dominant_format text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_channels_status on channels(approval_status);
```

### `002_snapshots_delta.sql`

```sql
create table if not exists channel_daily_snapshot(
  channel_id text references channels(channel_id),
  date date not null,
  view_count_total bigint not null,
  subscriber_count bigint,
  primary key(channel_id, date)
);

create table if not exists channel_daily_delta(
  channel_id text references channels(channel_id),
  date date not null,
  delta_views bigint not null,
  primary key(channel_id, date)
);

create index if not exists idx_snap_day on channel_daily_snapshot(date);
create index if not exists idx_delta_day on channel_daily_delta(date);
```

### `003_rls_policies.sql`

```sql
alter table channels enable row level security;
create policy channels_select_approved on channels for select
  using (approval_status = 'approved');
```

### `004_housekeeping.sql`

```sql
-- 30일 롤링 삭제
create or replace procedure yl_housekeeping()
language plpgsql as $$
begin
  delete from channel_daily_snapshot where date < current_date - interval '30 days';
  delete from channel_daily_delta where date < current_date - interval '30 days';
end $$;
```

---

## 8) 배치(Edge Function) 스텁

`supabase/functions/youtube-lens-batch/index.ts`

```ts
// 1) channels.list(statistics,contentDetails) batched(<=50)
// 2) snapshot insert
// 3) Δ 계산 (음수 0 클립, 이상치 캡)
// 4) optional: 상위 Δ 채널 최신 업로드 N개 -> videos.list -> shorts 판별

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  // TODO: Supabase에서 승인 채널 id 목록 로드
  // TODO: YouTube Data API 호출
  // TODO: snapshot/delta 테이블 upsert
  return new Response('ok');
}
```

---

## 9) 테스트(템플릿)

**Unit – `tests/unit/number-format.spec.ts`**

```ts
import { formatNumberKo } from '@/lib/youtube-lens/number-format';
import { describe, it, expect } from 'vitest';

describe('formatNumberKo', ()=>{
  it('천/만 포맷', ()=>{
    expect(formatNumberKo(999)).toBe('999');
    expect(formatNumberKo(1200)).toBe('1.2천');
    expect(formatNumberKo(12340)).toBe('1.2만');
    expect(formatNumberKo(1234000)).toBe('123만');
  });
});
```

**E2E – `tests/e2e/ranking.e2e.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('랭킹 표 7필드 표기', async ({ page }) => {
  await page.goto('/tools/youtube-lens/ranking');
  const headers = await page.locator('thead th').allTextContents();
  expect(headers).toContain('채널명');
  expect(headers).toContain('구독자수');
  expect(headers).toContain('일일 조회수');
  expect(headers).toContain('총 조회수');
  expect(headers).toContain('카테고리');
  expect(headers).toContain('세부카테고리');
  expect(headers).toContain('형식');
});
```

**RLS – `tests/e2e/rls.e2e.spec.ts`**: 미승인 채널이 리스트에 없는지 검증.

---

## 10) Figma/디자인 연동

* 이미 드린 **Hi‑Fi SVG**와 **Figma Tokens**를 그대로 드래그/Import.
* 컴포넌트화 시 Variant: `밀도(Compact/Comfy)`, `썸네일(S/M/L)`, `배지(Δ/트렌드/중립)`.

---

## 11) Claude Code를 위한 “바로 실행 체크리스트”

1. **기존 저장소 체크아웃** → `app/tools/youtube-lens` 아래 스캐폴딩 병합(경로 충돌 금지)
2. **env 설정**: `YT_ADMIN_KEY` 주입(집계 전용), 검색 경로는 기존 사용자 키 사용 유지
3. **DB 마이그레이션**: 001\~004 실행, RLS ON 확인
4. **API 라우트**: `/api/youtube-lens/ranking`부터 연결 → `ChannelTable` 렌더
5. **전체 화면에 7필드/“천·만” 적용**(카드/표/드로어/모달/보드/관리자)
6. **테스트**: unit + e2e 스위트 통과
7. **배치**: Edge Function/cron 배치 후 첫 스냅샷/Δ 생성 확인

---

### 결론

* **Claude Code가 알아서** 어느 정도 할 수 있지만, **이번 프로젝트의 제약·재사용·표기 규정**을 100% 지키려면 위 **핸드오프 팩**이 **가장 빠르고 안전**합니다.
* 이 패키지 그대로 전달하면, 구현자가 **바로 디렉터리 생성 → 의존성 설치 → RLS/Δ 계산/7필드 UI 렌더**까지 **직행**할 수 있습니다.

원하시면, 저장소의 현재 트리/코드 스타일에 맞춰 **파일명/임포트 경로/ESLint 규칙**까지 미세 조정한 버전을 추가로 드릴게요.
