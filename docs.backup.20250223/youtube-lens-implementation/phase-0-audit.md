# Phase 0: 코드/데이터 감사 & 연구 설계

## 🎯 목표
- 기존 YouTube Lens 구현 자산 전수 조사
- API 호출 계획 및 쿼터 예산 수립
- 재사용 가능 컴포넌트 식별

## 📋 체크리스트

### 1. 기존 코드 감사

#### 재사용 가능한 컴포넌트
- [x] `VideoGrid` - 영상 그리드 표시
- [x] `SearchBar` - 검색 바
- [x] `QuotaStatus` - API 할당량 표시
- [x] `YouTubeLensErrorBoundary` - 에러 처리
- [x] `PopularShortsList` - 인기 Shorts 리스트 (수정 필요)
- [x] `ChannelFolders` - 채널 폴더 관리
- [x] `CollectionBoard` - 컬렉션 보드
- [x] `AlertRules` - 알림 규칙

#### 수정이 필요한 컴포넌트
- [ ] `MetricsDashboard` → 완전 교체 필요
- [ ] API 엔드포인트들 → 일부 신규 추가 필요

#### Zustand Store 분석
```typescript
// src/store/youtube-lens.ts
- videos, searchHistory, favoriteVideos 등 기존 상태 유지
- 새로운 상태 추가 필요:
  - approvedChannels: Map<string, Channel>
  - channelDeltas: Map<string, DeltaData>
  - dashboardMetrics: DashboardData
```

### 2. DB 스키마 갭 분석

#### 필요한 새 테이블
```sql
-- 승인된 채널 관리
CREATE TABLE yl_channels (
  channel_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  handle TEXT,
  approval_status TEXT DEFAULT 'pending',
  subscriber_count BIGINT,
  view_count_total BIGINT,
  category TEXT,
  subcategory TEXT,
  dominant_format TEXT, -- '쇼츠'|'롱폼'|'라이브'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 일일 스냅샷
CREATE TABLE yl_channel_daily_snapshot (
  channel_id TEXT REFERENCES yl_channels(channel_id),
  date DATE NOT NULL,
  view_count_total BIGINT NOT NULL,
  subscriber_count BIGINT,
  PRIMARY KEY(channel_id, date)
);

-- 일일 델타
CREATE TABLE yl_channel_daily_delta (
  channel_id TEXT REFERENCES yl_channels(channel_id),
  date DATE NOT NULL,
  delta_views BIGINT NOT NULL,
  PRIMARY KEY(channel_id, date)
);
```

### 3. API 호출 계획

#### YouTube Data API v3 엔드포인트
```typescript
// 사용할 엔드포인트 (1 unit/call)
- channels.list(part=statistics,contentDetails,snippet)
- playlistItems.list(part=snippet)  
- videos.list(part=contentDetails,snippet)

// 회피할 엔드포인트
- search.list (100 units/call - 너무 비쌈)
```

#### 쿼터 예산 (1,000 채널 기준)
- channels.list: 50개/호출 × 20회 = **20 units/일**
- playlistItems.list: 선택적 사용 = **~10 units/일**
- videos.list: 상위 채널만 = **~20 units/일**
- **총합**: ~50 units/일 (일일 할당량 10,000의 0.5%)

### 4. 충돌 방지 계획

#### 라우팅 충돌 방지
```typescript
// 기존 라우트 유지
/tools/youtube-lens/
  ├── page.tsx (대시보드 내용만 교체)
  ├── 기타 기존 기능들 유지

// 새 API 라우트 추가
/api/youtube-lens/
  ├── trending-summary/  (신규)
  ├── ranking/          (신규)
  ├── admin/channels/   (신규)
  └── 기존 라우트들 유지
```

#### React Query 키 충돌 방지
```typescript
// 새로운 키 네임스페이스
export const ylQueryKeys = {
  dash: (date: string) => ['yl/dash/summary', date],
  ranking: (params: any) => ['yl/ranking', params],
  adminChannels: (params: any) => ['yl/admin/channels', params],
  // 기존 키는 그대로 유지
};
```

### 5. 환경 변수 설정

```env
# .env.local 추가
YT_ADMIN_KEY=AIza...  # 관리자용 YouTube API 키 (통계/집계용)
# 기존 사용자 API 키는 DB에 저장된 것 사용
```

### 6. 재사용 유틸리티 목록

#### 기존 유틸 활용
- `src/lib/api-client.ts` - API 클라이언트 래퍼
- `src/lib/utils.ts` - 공통 유틸리티
- `src/types/youtube.ts` - YouTube 타입 정의

#### 새로 필요한 유틸
```typescript
// src/lib/youtube-lens/format-ko.ts
export function formatNumberKo(n: number): string {
  // 천/만 포맷 구현
}

// src/lib/youtube-lens/shorts-detector.ts
export function detectShorts(video: VideoData): boolean {
  // Shorts 판별 로직
}

// src/lib/youtube-lens/delta-calculator.ts
export function calculateDelta(today: number, yesterday: number): number {
  // Δ 계산 (음수 0 클립)
}
```

## 📊 영향도 분석

### 영향 받는 파일
1. `src/app/(pages)/tools/youtube-lens/page.tsx` - 대시보드 탭 내용 교체
2. `src/components/features/tools/youtube-lens/MetricsDashboard.tsx` - 완전 교체
3. `src/store/youtube-lens.ts` - 상태 추가

### 영향 없는 파일 (그대로 유지)
- 인기 Shorts, 채널 폴더, 컬렉션, 검색, 즐겨찾기 관련 모든 컴포넌트

## 🚨 리스크 및 완화 방안

| 리스크 | 완화 방안 |
|-------|---------|
| API 통계 지연/부정확 | Δ는 "추정치" 라벨, 7일 트렌드 표시 |
| 기존 기능 충돌 | 네임스페이스 분리, 별도 테이블 prefix |
| 쿼터 초과 | 배치 최적화, 캐싱 적극 활용 |
| RLS 정책 누출 | 승인 상태 체크 이중화 |

## ✅ Phase 0 완료 기준

- [ ] 재사용 컴포넌트 목록 확정
- [ ] DB 마이그레이션 파일 작성
- [ ] API 호출 예산서 승인
- [ ] 환경 변수 설정 완료
- [ ] 충돌 방지 계획 검증

## 📌 다음 단계
Phase 1: MVP 코어 구현으로 진행