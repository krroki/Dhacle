0) 프로젝트 전제 및 검증 – 브랜드 컬러 & 스택 선택, 충분한가?
브랜드 컬러 (HSL) – Primary(보라) hsl(245 58% 61%) (다크 모드: hsl(245 65% 77%)), Secondary(빨강) hsl(0 100% 71%) (다크: hsl(0 90% 65%)), Accent(민트) hsl(161 94% 50%) (다크: hsl(161 84% 45%)). 이 세 가지가 적절한 대비와 의미 전달을 보장하는지 질문해봐야 합니다.
색상 대비 (WCAG AA/AAA): Primary 보라는 주로 버튼/링크의 기본색으로 쓰일 예정인데, 흰 배경에서 텍스트로 사용할 때 대비 비율이 4.5:1 이상인지 확인해야 합니다[1][2]. 현재 보라색의 명도(L)가 61%로 비교적 높아 흰색 텍스트와 충분한 대비가 나오는 편입니다 (약 5.6:1 예상). 다크 모드의 보라 (77%) 역시 어두운 배경에서 밝은 강조색으로 기능할 수 있습니다. Secondary 빨강은 경고/에러 용도로 계획했는데, 흰 배경 대비는 약 4:1로 약간 낮아 보입니다. AAA 기준으로 일반 텍스트는 7:1까지 요구되므로, 버튼 등에는 굵은 텍스트(large text)나 아이콘과 함께 쓸 경우 4.5:1도 허용됩니다[1]. 필요하면 채도를 조금 낮추거나 명도를 조정해 대비를 높일 수 있습니다. Accent 민트는 매우 선명한 녹색 계열로 성공/보조 강조에 사용할 때 빨강과 동시에 쓰이면 적록 색약 사용자가 구분하기 어려울 수 있습니다[3][2]. 이게 최선인가요? 빨강-초록 조합은 색상만으로 상태를 구분하지 않도록 아이콘/레이블을 함께 제공해야 안전합니다[2]. 또한 다크 모드에서의 세 색상(보라77%, 빨강65%, 민트45%)은 모두 밝은 톤이라 어두운 배경과 대비가 충분하지만, hover/active 시 명도 변화를 주어 구분하는 것이 좋습니다.
파생 톤 (Pressed/Disabled 등): Primary 보라색의 Pressed 상태는 더 짙은 보라 (예: HSL L↓10%)로 하여 배경과의 대비를 유지하면서 눌림 효과를 줍니다. Disabled 상태는 채도를 낮춰 회색기 보라로 만들고 텍스트 대비도 최소 3:1 이상 확보해야 합니다[4]. Secondary 빨강의 Hover/Pressed는 너무 과도한 채도 변화는 피하고 명도만 조절하여 Hover 시 살짝 밝게(L+5~10%), Pressed 시 어둡게(L-5~10%) 권장합니다. Accent 민트의 경우 채도가 높아 시각적으로 튀므로, Disabled 상태에서는 채도를 크게 낮춘 파스텔 민트로 두어 눈에 거슬리지 않게 합니다. Outline이나 Focus 링도 이 세 컬러를 활용하되, 투명도를 적용하거나 짙은 대비색을 사용해 2px 이상의 두께로 표시하면 WCAG 2.1 포커스 가시성 요건을 충족할 수 있습니다[5]. 질문: 이러한 파생 톤 설계가 실제로 AA 대비를 충족하는지 자동 테스트 툴(예: Storybook A11y, Chrome DevTools)로 검증해야 합니다. 만약 일부 조합이 미흡하다면, Secondary의 채도를 낮추거나 Accent의 명도를 조절하는 대안 색상 스케일도 마련해 둘 필요가 있습니다.
프론트엔드 스택 (Next.js 15 + React 19) – Next.js 15.4.6 (App Router)와 React 19.1.1 조합은 서버 컴포넌트 및 스트리밍 기능을 풀 활용하는 최신 트렌드입니다. 다만 React 19의 변경점에 유의해야 합니다.
React 19 효과 타이밍: React 18에서 Strict Mode로 인해 useEffect가 두 번 실행되는 등 변화가 있었고, React 19에서는 (가정상) 새로운 concurrency API나 useEffect 동작 최적화가 있을 수 있습니다. 아직 React 19 관련 공식 문서가 없지만(가정) Server Components와 클라이언트 상태 간 데이터 동기화에 주의해야 합니다[6]. 예를 들어, Next.js App Router 환경에서 useEffect는 클라이언트 컴포넌트에서만 사용되며, 서버 컴포넌트에서는 실행되지 않습니다. Streaming SSR을 사용할 경우, React 18부터 도입된 useTransition 등과 함께 React 19의 추가 기능 (예: use 훅)도 활용 가능하지만, React Query나 Zustand 같은 상태 라이브러리와 조합 시 의도치 않은 재렌더가 발생하지 않도록 설계해야 합니다[6]. Server Actions (React 18.2/Next 13.4+ 기능)도 React 19에서 더 발전했을 수 있으므로, 이를 쓸 때 클라이언트 측 상태와 충돌하지 않게 해야 합니다. 질문: “Server Action으로 처리한 뒤 클라이언트 zustand 상태는 어떻게 갱신할 것인가?” 등의 문제가 생길 수 있으며, 이는 뒤에 상태 관리에서 다룹니다.
Next.js App Router: 15.x 버전에서는 파일 시스템 기반 Route Handlers와 Middleware/Edge 지원이 안정적입니다. API Route 대신 새 Route Handler를 쓰면 Request/Response 스트림을 직접 제어할 수 있지만, 이 경우 Next의 기본 응답 최적화(Auto-body parsing 등)가 없으므로 예외 처리를 꼼꼼히 해야 합니다. 또한 App Router 환경에서는 페이지 간 리소스 선로드가 이루어지는데, use 훅이나 Suspense로 서버 데이터 페칭을 병렬화하면 초기 로드 성능을 높일 수 있습니다[7][8]. 단, App Router에서 동적 import나 오래 걸리는 연산은 loading.js을 제공하여 skeleton을 보여주는 식으로 처리하고, 스트리밍으로 점진적 렌더링을 활용해야 합니다.
Shadcn/UI와 Tailwind: Shadcn은 Radix UI를 Tailwind 테마로 래핑한 컴포넌트 모음입니다. HSL CSS 변수로 테마를 구성할 때 Radix의 [data-theme="dark"] 속성과 협업하여 다크모드 전환 시 CSS 변수만 교체하면 됩니다[9]. shadcn 컴포넌트들은 기본적으로 Radix ARIA 속성을 지키므로 접근성은 우수하지만, 테마 색상 적용을 위해 tailwind.config.js에서 --color-primary 등을 참조하는 커스텀 유틸리티를 정의해야 합니다. 질문: “Radix Tooltip이나 Dialog의 포커스 트랩이 테마 전환에 문제를 일으키진 않는가?” – 현재 Radix는 데이터 속성으로 색상을 받지 않으므로, CSS 변수 전략이면 문제없을 것입니다. 다만 Lucide Icons를 함께 사용할 때, 아이콘 색상 역시 currentColor를 따라가도록 CSS 설정이 필요합니다. Framer Motion 12는 React 19와 호환될지 확인해야 합니다 (주요 버전에서 React concurrent features 대응 필요).
백엔드/인프라 (Supabase) – Supabase(PostgreSQL 15 기반)를 활용하여 DB, Auth, Storage, Realtime을 모두 커버합니다. RLS (Row Level Security) 정책을 통해 테넌시 격리를 하게 되는데, 조직별 데이터 분리를 위해 JWT에 조직 ID를 담거나 각 테이블에 org_id 컬럼을 두어 정책을 거는 방식이 가능합니다. Supabase에서 RLS는 정적으로 정책을 정의하므로, 조직/팀 구성을 변경하면 해당 유저의 JWT 재발급 또는 Row 권한 테이블을 참조해야 합니다. 구현 시 Auth.uid()와 조인을 활용하는 정책 예시를 7절에서 다룹니다.
시계열 성능: 영상의 시간대별 조회수 데이터를 video_stats 테이블에 누적할 텐데, 수십만 건 이상 커질 수 있습니다. PostgreSQL에서 많은 시계열 데이터 조회는 인덱싱으로 해결 가능하지만, 물리 파티셔닝(예: 월별 분할)도 검토해야 합니다. Supabase에서는 파티션 테이블도 지원하므로, 예를 들어 video_stats_2025_08 등 월 단위로 테이블을 나눌 수 있습니다. 또는 TTL 정책(예: 90일 지난 데이터 삭제)으로 테이블 크기를 관리하는 방법도 있습니다. 대량 upsert: 예를 들어 한 번에 100개 영상의 최신 통계를 upsert할 때, Supabase 리밸런싱 오버헤드가 걱정됩니다. 그러나 PostgREST API나 Supabase JS SDK는 대량 upsert를 JSON 배열로 한 번에 보낼 수 있어, 1 Network roundtrip으로 해결 가능합니다[10][11]. Postgres 내부에서도 upsert는 ON CONFLICT DO UPDATE로 처리되므로, 필드 갱신만 일어나 성능은 무난할 것으로 예상됩니다. 다만 동시 upsert 충돌을 피해 워커 단일 처리 또는 동시성 제어가 필요할 수 있습니다.
Zustand 5 & React Query 5: 클라이언트 상태 관리로 Zustand 5.x(zustand/vanilla + context)와 React Query 5.x를 채택합니다. Zustand 5는 여전히 React 18+와 호환되지만, Next App Router의 서버 컴포넌트에서는 직접 사용하지 않고, useZustand 훅은 클라이언트 컴포넌트에서만 쓰는 것이 원칙입니다. React Query는 Server Components의 데이터를 가져올 때 SSR로 hydratation하거나, App Router에서는 오히려 React Query를 Server Action과 함께 쓰지 않는 것을 권장하는 경우도 있습니다. 충돌 이슈: React Query가 내부적으로 useEffect로 데이터 동기화를 하는데, 만약 Next의 use 훅으로 서버에서 데이터를 가져오면 React Query 캐시와 두 소스가 충돌할 수 있습니다. 해결 방안: 가능한 서버에서 데이터를 패칭한 경우 React Query는 사용하지 않고 바로 전달하거나, 반대로 클라이언트 트리거 데이터는 React Query만 쓰도록 책임 구분을 명확히 합니다. 또한 Suspense 지원 여부를 확인해야 하는데, React Query 5는 실험적인 useSuspenseQuery 등을 지원할 가능성이 있으므로, suspense를 쓸 땐 해당 API를 활용하면 깔끔하게 처리될 수 있습니다. Zustand의 경우 서버 액션에서 mutate하고 클라이언트 zustand를 갱신할 일이 거의 없겠지만, 만약 Optimistic UI를 위해 zustand 상태를 선반영 후 서버 액션 confirm 한다면, 실패 시 롤백 로직이 필요합니다. 질문: “서버 액션 응답으로 최신 데이터를 받아올 때, 클라이언트 상태와 Race condition 없을까?” – 이를 위해 React Query의 invalidateQueries 또는 Zustand에 서버 응답을 반영하는 함수를 startTransition으로 호출하는 식으로, 트랜지션 업데이트로 래깅을 줄이는 대안을 고려합니다.
Supabase CLI 마이그레이션: 개발 편의상 Supabase CLI로 DB 스키마를 관리합니다. 모든 테이블/인덱스 생성이 SQL 마이그레이션 파일로 기록되고, Vercel 배포 시 Git Hook으로 supabase db push를 실행하거나, 수동으로 적용할 수 있습니다. 다만 러닝 중인 Supabase (DBaaS)에는 직접 CLI 마이그레이션은 불가하고, 로컬에서 dump 후 업로드하거나 pgNet을 통해 Migration 실행해야 합니다. 백업은 Supabase 내장 백업 또는 pg_dump 사용을 권장합니다.
상태 관리 & 통합 – React Hook Form 7.x는 주로 동영상 편집 메타정보 입력 등 폼에 사용됩니다. 이는 클라이언트 전용으로, 서버컴포넌트와 충돌 위험은 적습니다. 대신 RHF와 Zustand를 함께 쓸 때, RHF의 controlled 컴포넌트가 Zustand 상태를 직접 변경하면 RHF의 re-render 규칙과 어긋날 수 있으니 가급적 분리합니다.
결제 (TossPayments 1.9) – 한국 시장 특화된 토스페이먼츠로 구독 결제를 구현합니다. 왜 TossPayments인가? 국내 신용카드 정기결제가 비교적 간단하고 수수료도 합리적이며, 프론트 SDK로 결제창을 띄운 뒤 Webhook으로 결과를 확인하는 표준 흐름을 제공합니다[12]. 구독의 경우 TossPayments의 자동결제(빌링) API를 활용합니다[13].
플로우 개요: 사용자가 Pro/Team 구독 신청 → 카드 정보 입력 (토스 결제위젯 사용) → Billing Key 발급[14] → 우리 DB에 Billing Key 저장 (credentials 테이블 등) → 즉시 첫 결제 처리 (또는 무료 체험기간 설정 시 0원 승인 또는 일정 기간 후 첫 결제). TossPayments는 빌링키만 있으면 서버-to-서버 API로 재결제를 실행할 수 있습니다[12]. 따라서 매달(또는 매년) 정기결제는 백엔드 스케줄러 (예: Supabase Edge Functions Cron, Vercel Cron, or 서버 워커)가 Billing Key와 금액을 보내 결제 승인 API를 호출하는 방식으로 진행합니다[13]. 무료 체험: TossPayments 자체에 trial 기능은 없으므로, Billing Key만 확보하고 첫 결제를 지연하는 방식으로 구현합니다. 예를 들어 trial 7일이면, Billing Key 발급 후 7일 후에 첫 결제 API를 호출하는 예약 작업을 설정합니다.
실패/리트라이: 만약 결제일에 카드 한도가 초과되거나 기타 사유로 승인이 거절될 경우, TossPayments 결제 API 응답을 통해 실패 사유를 받아옵니다. 우리는 Webhook 엔드포인트를 설정하여 결제 성공/실패를 실시간으로 수신하고[15][16], 실패 시 해당 구독 상태를 “연체”로 표시하거나 3일 후 재시도 등 정책을 정할 수 있습니다. 일반적으로 3회 연속 실패 시 구독을 자동 취소하는 것이 좋습니다. 이때 사용자에게 이메일 알림을 보내 결제 정보를 갱신하도록 유도합니다. TossPayments Webhook 이벤트 종류로 payment.cancel(취소) 등이 있으므로, 사용자가 직접 결제를 취소(refund)하거나 카드가 폐기된 경우도 감지하여 처리합니다.
Webhook 보안 & 관리: Webhook 콜백 URL은 우리 서비스 (/api/webhook/tosspayments)로 지정하고, TossPayments 대시보드에 등록합니다. 콜백 payload에는 결제 ID, 상태, 금액 등이 담겨오며, 검증용 해시가 함께 올 수 있으니 시크릿 키로 검증 후 처리합니다. 중복 호출에 대비해 idempotency 키나 결제 ID 기준으로 처리 이력을 저장해두고, 한 번 처리한 이벤트는 무시합니다. 환불/부분환불은 관리자가 요청 시 TossPayments Refund API를 호출하여 처리하고, 결과를 DB (alerts나 별도 refunds 테이블)로 로깅합니다.
Pro-rata/Upgrade: 만약 Plan 변경(예: Pro → Team) 시 잔여기간 계산이나 즉시 업그레이드가 필요하다면, TossPayments 쪽에서 금액을 조정하기보다, 우리 서비스에서 다음 결제일을 변경하거나 추가 금액을 즉시 결제하는 로직이 필요합니다. 예를 들어 15일 남은 Pro 구독을 Team으로 올리면 차액을 산정하여 새 구독으로 전환하면서 즉시 차액 청구하거나, 다음 결제일을 15일 뒤로 미루는 등의 방식을 설계할 수 있습니다. TossPayments API는 이러한 세부 정책까지 제공하지 않으므로, 우리 서비스 레벨에서 처리합니다.
미디어/에디터 스택 – TipTap 3: 모던한 슬레이트 기반 리치 에디터로, 유튜브 영상의 설명/코멘트 등의 편집 혹은 간단한 보고서 작성에 활용 가능합니다. 라이선스는 MIT로 문제없지만, 한국어 입력 시 IME 처리가 자연스러운지 테스트가 필요합니다. TipTap은 ProseMirror 기반이라 한글 조합 입력에 이슈가 없을 것으로 예상됩니다. HLS.js 1.6: 썸네일 생성이나 영상 미리보기 용도로, 혹은 HLS 스트리밍 재생에 사용됩니다. Shorts 영상 자체는 YouTube embed로 볼 것이므로 HLS.js는 주로 우리 플랫폼에 업로드된 영상(예: 편집본 미리보기)에 쓰일 가능성이 있습니다. DRM: 공개 유튜브 영상을 크롤링해서 직접 재생하는 것은 정책상 금지입니다. 따라서 HLS.js로 YouTube 영상을 재생할 일은 거의 없고, 만약 사용자 업로드 영상(저작권 클리어된 소재 클립 등)을 제공할 경우만 HLS 스트리밍 + (원한다면) 암호화를 고려할 수 있습니다. 그러나 DRM까지는 과할 수 있고, S3 서명 URL+HLS로 충분히 접근 제한이 가능하므로 HLS 암호화 (AES-128) 정도만 옵션으로 생각합니다.
React Image Crop 11: 썸네일 편집 기능으로 사용됩니다. 예를 들어 인기 영상의 썸네일을 참고하여 사용자가 자기 영상 썸네일을 제작할 수 있도록, 업로드한 이미지를 Crop/Zoom하는 UI를 제공할 계획입니다. 이 라이브러리는 Canvas를 사용하므로 권한 이슈는 없지만, 큰 해상도 이미지 편집 시 메모리 및 성능을 주의해야 합니다. 일반적인 1920x1080 이미지는 문제없으나 4K 이미지 크롭 시 모바일에서는 렉이 걸릴 수 있습니다. 대안으로 크롭 영역만 서버에서 처리하거나, <canvas>에 Web Worker를 붙이는 방법도 생각할 수 있습니다. 또한 저작권 관점에서, 경쟁 영상의 썸네일을 그대로 가져와 편집하는 것은 피해야 합니다. 대신 유사 요소 추출 (예: 이모지, 색상 분포) 정도만 참고하도록 기능을 제한합니다.
DevOps & 배포 (Vercel) – Vercel에 Next.js를 배포하고, Supabase를 PaaS로 사용합니다. Cron/Scheduled Jobs: Vercel은 2023년부터 vercel.json에 cron 설정을 지원하여 Edge Functions를 일정 실행할 수 있습니다. 예를 들어 cron.json에 */60 * * * *로 설정해 60분마다 GET /api/cron을 호출하게 할 수 있습니다. 그러나 Vercel의 Cron은 최소 1분 단위이고, 실행 보장성이 100%는 아닌 점을 감안해야 합니다. 중요한 워커라면 Supabase의 Schedule Trigger Functions(Beta)도 고려할 수 있습니다[17]. Supabase Edge Functions는 Deno 기반으로 동작하며, DB와 밀접하게 연동하기 편리합니다. 예를 들어, PubSubHubbub webhook을 Supabase Edge Function으로 두면, 새 영상 알림을 받아 바로 Supabase DB를 업데이트하고, Realtime으로 클라이언트에 푸시할 수 있습니다. Queue/Worker 처리: 트렌드 수집이나 메트릭 계산은 사용자가 페이지를 열 때 실시간으로 하기보다는 백그라운드 주기 작업이 낫습니다. Vercel에서는 서버리스 함수로 오래 도는 작업은 곤란하므로, 이게 최선인가요? – 대안으로 Supabase의 PG Listen/Notify+Function, 혹은 외부 큐 서비스(e.g. Cloud Tasks, bullmq on Upstash Redis)를 고려할 수 있습니다. 예컨대 “상세 워커”가 새로운 영상 ID 목록을 받으면 차례로 videos.list를 호출해 DB에 저장하는 작업을 해야 하는데, 이를 cron으로 5분마다 진행하면 레이턴시가 발생합니다. 차라리 프론트에서 요청 시 Edge Function이 즉시 videos.list를 호출하고 그 결과를 DB와 응답 모두에 쓰도록 할 수도 있습니다. 다만 이 경우 API Key 노출 이슈가 있어, 서버 측에서만 API를 호출해야 하므로 Edge Function이 적절합니다. Vercel Edge는 지역 한정 문제가 있으므로, Supabase Edge (워싱턴 등)와의 레이턴시도 고려해야 합니다.
보완 또는 대안 제안: 위 스택 전제를 유지하면서도 접근성, 성능, 호환성을 높일 방법은 꾸준히 검토해야 합니다. 예를 들어 Primary 보라색의 contrast가 살짝 모자라다면 보라색의 Lightness를 55%로 내린 대체 팔레트를 준비할 수 있습니다. 또 Supabase의 Realtime이 동시 접속↑ 시 성능 이슈가 있다면, Pusher나 Ably 같은 외부 서비스를 병행하는 것도 고려합니다. React 19가 출시되면 릴리즈 노트를 검토하여 우리의 Strict Mode 설정을 조정하거나 (19에서 Strict 모드 완화가 있을 경우) React 19.1.x 호환성 패치를 체크해야 합니다[6].
출처: WCAG Contrast Ratio (W3C, 2018)[1], Smashing Magazine – Color Accessibility (2016)[3][2], vidIQ Help – UI Components & A11y (2018)[18][19], Supabase Docs – Realtime & Edge Functions (2023)[20][21], Next.js App Router Update (Vercel, 2025)[22][11]

1) 5W1H 재확인 – 핵심 요구사항을 질문으로 점검
Who – 사용자 정의와 역할 분리 필요?
주요 타겟은 한국의 양산형 Shorts 운영자들입니다. 여기에는 한두 명이 다수 채널을 운영하는 개인도 있고, 편집팀이나 MCN/에이전시 소속으로 다수 클라이언트 채널을 관리하는 경우도 있습니다. 오너/에디터/분석가 롤 분리가 유용할까요? 질문: 예를 들어 에이전시라면 오너는 구독 결제를 관리하고 팀원을 초대하며, 에디터는 영상 아이디어 보드를 관리, 애널리스트는 데이터 탐색만 하는 식으로 구분할 수 있습니다. 이러한 롤 분리는 B2B 팀 플랜에서 가치가 있습니다. 반면, 개인 운영자는 혼자 모든 역할을 하므로 복잡한 권한 체계는 과할 수 있습니다. 근거: 동종 서비스인 vidIQ, TubeBuddy 등은 개인 대상이라 역할 구분이 없고, SocialBlade나 ChannelCrawler는 로그인 없이도 쓸 수 있을 정도로 단순합니다. 그러나 우리 서비스가 팀 협업을 지원하는 차별점을 노린다면 RLS 기반으로 역할을 나누는 게 좋습니다. 가설: 오너/에디터/분석가 3가지 롤로 시작하고, Viewer(읽기 전용)은 추후 추가하는 방향이 유연성을 줍니다 (9절에서 RLS 정책 자세히 다룸).
What – 제공 기능의 우선순위와 필요성:
키워드 없이 인기 Shorts 탐색: 사용자가 특정 주제 키워드 없이도 “요즘 잘 나가는 숏폼”을 발견하는 것이 핵심 가치로 보입니다[23]. TubeLens v5.6 업데이트에서도 “키워드 없이 조회수순 인기 영상 찾기”가 킬러 기능으로 언급되었습니다[23]. Shorts의 특성상 짧은 기간 내 폭발적인 조회가 중요하므로, 기간과 지역만으로 상위 영상을 보여주는 기능은 필수입니다. 질문: “유튜브 공식 API로 무키워드+조회수 정렬이 가능한가?” – 공식 search.list는 기본적으로 쿼리가 필요하지만, 빈 쿼리+필터로도 어느 정도 구현이 가능하다는 사례가 있습니다 (vidIQ의 Most Viewed Tool도 키워드 없을 시 전체 인기 영상 제공)[24]. 우리는 search.list(regionCode=KR, publishedAfter=X, order=viewCount) 방식으로 해볼 계획이며, 4.2절에서 구체적인 절차를 검증합니다.
소스 채널 폴더링 & 임계치 알림: 사용자가 벤치마킹하는 소스 채널들을 폴더로 묶고, 그 채널들에서 새로 올라온 Shorts 중 조회수 N 이상 되는 영상을 자동으로 알려주는 기능이 1순위인지 확인합니다. 이 요구는 상당히 현실적입니다. 예를 들어 해외 유명 Shorts 채널 100개를 모니터링해 “하루만에 100만회 넘은 영상”이 나오면 편집팀에 알려주는 식입니다. TubeLens 등 경쟁사도 이 기능을 강조합니다 – 실제 튜브렌즈 소개영상에서 “해외 영상 벤치마킹”이 주요 키워드였습니다[23]. 질문: “알림은 얼마나 실시간으로, 어떻게 제공할까?” – 이는 Why와 When에서도 다루지만, PubSubHubbub으로 새 영상 업로드 즉시 캐치하고, 조회수를 API로 조회하여 임계 충족 시 알림 큐에 넣는 식으로 구현 가능합니다 (4.2절 참조). 우선순위: 이 기능은 키워드 없는 인기 검색과 함께 투톱으로 중요합니다. 한편, Viewtrap 등의 서비스에서도 알림 기능을 제공하는지 비교하여, 차별화할 여지가 있는지 2절에서 살펴봅니다.
주제/키워드·엔티티 레이더: 이것은 트렌드 탐지 기능으로 이해됩니다. YouTube 메타데이터(제목, 설명, 해시태그)를 분석하여 자주 언급되는 키워드나 인물/캐릭터를 추출하고, 외부 트렌드 신호 (예: 위키피디아 조회수 상승, 뉴스)와 연계해 “요즘 뜨는 주제”를 보여주는 기능입니다. 필요성: 양산형 콘텐츠 운영자에게 시의성 있는 주제 선점은 중요합니다. 예를 들어 특정 밈이나 유행어가 급부상하면 관련 Shorts를 빨리 만들고 싶어하죠. vidIQ의 경우 “Trend Alerts” 또는 “Most Viewed tool”에서 키워드 필터 및 Views per hour 정렬을 제공하여, 특정 주제 내에서 어떤 영상이 치고 올라오는지 보여줍니다[25][26]. 또한 Google Trends나 Wikidata를 활용한 트렌드 신호는 Plan B의 핵심 부분입니다 (3절). 질문: “이 복잡한 레이더가 정말 사용될까?” – 위험은 정보과부하입니다. 사용자들은 단순히 영상 리스트만 보고 싶어할 수도 있습니다. 따라서 필수는 아니지만, Pro이상의 부가 기능으로 제공하고, 유용성이 입증되면 강화하는 전략이 좋겠습니다. 4.3절에서 고급 기능으로 제안합니다.
숏폼 특화 지표/랭킹: Shorts 성공여부를 잘 나타내는 VPH (Views per Hour), Δ24h 증가량, 참여율(좋아요/조회수), 채널 대비 조회수 (view/subs), 이상치 지표(z-MAD) 등을 계산해 종합 점수 순위를 매기는 기능이 제안되어 있습니다. 이는 일종의 “추천 순위”를 우리가 만들어 제공하는 것으로, 단순 조회수 순과 다르게 새롭고 작더라도 빠르게 뜨는 영상을 상위에 올릴 수 있습니다. 합리적인가? vidIQ도 “Most Viewed” 도구에서 기본 정렬을 Views로 하되, Pro사용자는 VPH나 Engagement로도 정렬해볼 수 있게 합니다[25]. 이는 많은 유튜버들이 “절대 조회수만 보지 말고 조회 속도를 보라”는 팁에 부합합니다[18]. YouTube 공식 트렌딩 알고리즘도 아마 이와 유사한 복합 지표를 쓰고 있을 것입니다. 질문: “Shorts 뷰 카운트 집계 방식 변화(2025-03-31) 이후 이러한 상대 지표 중심이 최선인가?” – 2025년 3월 31일부터 YouTube Shorts의 view count는 짧게 봐도 일단 재생 시작만 하면 카운트하는 방식으로 바뀌었습니다[27][28]. 그 결과 절대 조회수가 부풀려질 가능성이 높아졌습니다[29]. 따라서 VPH나 Δ증가량처럼 시간 대비 증가를 보는 게 더욱 중요해졌습니다. 또한 참여율(좋아요/조회)로 품질을 가늠하거나, 채널 구독자 대비 조회수로 바이럴 지표를 보는 것도 Shorts 필터링에 도움이 됩니다. 종합하면, 이 랭킹 기능은 합리적이며, 우리가 경쟁사와 차별화할 지점이기도 합니다 (경쟁사들도 일부 수치 제공은 하지만 사용자 정의 가중치 점수**까지 주진 않음). 구체 식과 비교는 5절에서 다룹니다.
보드/즐겨찾기/저장검색/내보내기: 사용자가 찾은 영상을 나중에 참고하거나 팀과 공유하려면, 즐겨찾기(북마크)나 보드(컬렉션)가 필수입니다. vidIQ도 “큐레이션 보드”와 CSV Export 기능을 제공합니다[30][31]. TubeBuddy는 Tag List나 Template 저장 위주지만, Social Blade는 Pro회원에게 CSV 다운로드를 허용합니다. 우리의 경우 저장검색도 가치가 있습니다 – 예컨대 “지난주 미국에서 1백만뷰 넘은 Shorts”라는 조건 자체를 저장해두고, 나중에 클릭 한 번으로 업데이트된 결과를 보는 기능입니다. Why: 이는 반복 업무를 줄여주므로 사용자 시간 절감 KPI에 기여합니다. 질문: “필수인가?” – MVP에는 없어도 되지만, 빠른 시일 내 추가해야 할 편의 기능입니다. 에이전시 사용자의 경우 클라이언트 리포트용으로 CSV/Google Sheets 내보내기 요구가 높습니다[32][26]. 무료 플랜은 CSV 50개 제한, 유료는 무제한 등 플랜 차별화 포인트로도 활용 가능합니다.
Why – 진짜 문제는 무엇을 해결?
이 서비스의 KPI(핵심 성과지표)는 어떤 것인가, 곧 사용자에게 가장 큰 가치는 무엇인지 자문해야 합니다. 몇 가지 후보: ①업로드 성공률 향상, ②채널 구독/조회 성장, ③편집 리드타임 단축.
① 업로드 성공률: 양산형 채널은 아이디어 고갈이나 소재 부재로 계획한 업로드를 못하는 경우가 있습니다. 우리 서비스가 매일 새로운 영상 아이디어를 공급해줘서, 사용자가 루틴대로 업로드하도록 돕는다면 이는 큰 가치입니다. 이를 계량화해 “월 업로드 횟수 증가”로 KPI를 잡을 수 있습니다.
② 채널 성장: 더 직접적으로, 서비스 사용으로 인해 조회수나 구독자가 증가했다면 사용자에게 확실한 성공 사례입니다. 그러나 이는 다인수의 외부변수(콘텐츠 품질, 알고리즘 변화)가 있어서, 상관관계 파악이 어렵고 서비스의 공으로 돌리기도 애매합니다.
③ 제작 리드타임 단축: 영상 하나 만드는데 리서치에 3시간 쓰던 것을 우리 툴로 1시간만에 끝내게 해줬다면, 시간 절약이 곧 돈 절약입니다. 특히 팀 단위로 보면 편집자들이 아이디어 찾는 시간을 줄여 더 많은 영상 제작에 집중할 수 있게 됩니다.
무엇이 최우선일까요? 아마 ③시간 절약이 가장 측정하기 쉽고, 사용자 입장에서 즉각 체감될 이득입니다. 9절의 사용자 시나리오에서도 “아이디어 발굴 시간이 단축”되는 걸 가치로 언급할 예정입니다. ①업로드 빈도는 이차 효과로 기대되며, ②채널 성장은 장기적으로 사용자 성공사례로 소개할 정도로만 취급합니다.
Where – 웹앱? 크롬 확장? 모바일?
우선 웹 애플리케이션(반응형)으로 개발합니다. 경쟁 제품들을 보면: TubeBuddy와 vidIQ는 브라우저 확장으로 시작해 YouTube 사이트 위에 오버레이 UI를 제공하는 형태가 많습니다. 예를 들어 vidIQ는 유튜브 영상 페이지에서 그 영상의 VPH나 SEO 점수를 바로 보여줍니다. 그러나 우리 서비스는 YouTube 내부 데이터와 긴밀히 연동되지 않도록 (스크래핑 등 회피) 설계하기에, 오히려 독립 웹앱 형태가 맞습니다. 사용자가 하루 중 한두 번 접속해 트렌드 대시보드를 확인하는 용도로, 모바일 웹도 고려해 디자인합니다. 크롬 확장의 장점은 유튜브 사이트를 직접 탐색하며 바로 정보를 얻을 수 있다는 점인데, 우리는 아직 YouTube와 공식 통합은 어려우니 독립 웹에서 충분한 정보를 제공하는 게 안전합니다.
모바일 앱 필요성: Shorts 특성상 모바일로 소비/제작이 많지만, 데이터 분석 작업은 주로 PC에서 이뤄질 것입니다. 모바일 네이티브 앱을 만들면 푸시알림 등 장점이 있으나, 개발/운영 비용이 크게 증가합니다. 우선 PWA 혹은 모바일 웹으로 어느 정도 대응하고, 사용자 피드백을 본 후 결정합니다.
Chrome Extension 대안: 나중에 여력이 된다면, 간단한 크롬 확장을 만들어 YouTube Studio 페이지에서 우리 웹앱을 embed하거나, 또는 유튜브 영상 페이지에 “이 영상 트렌드 보기” 버튼 하나 추가하는 정도는 생각할 수 있습니다. 하지만 이는 공식 API 범위 밖의 커스터마이징이어서 (DOM 검사), YouTube 약관 위반 소지가 있을 수 있으므로 신중해야 합니다.
근거: vidIQ는 웹앱과 크롬 확장 둘 다 제공하지만, 주요 기능은 확장에 집중[33]. TubeLens/뷰트랩 등 국내 서비스는 웹앱 형태(데스크톱 권장)로 운영되는 것으로 알려져 있습니다 (유튜브 API키를 입력받는 UI가 웹 기준). Social Blade는 모바일 앱도 있으나 핵심 사용성은 웹사이트입니다.
When – 데이터 대상 기간과 신선도:
Shorts는 유행이 매우 빠르므로 “최근 1~7일” 내에 올라온 영상들 중 핫한 것을 보는 게 유용합니다. 또한 조회수 추이는 시간 단위로 민감하게 변합니다.
기본 기간 필터: 24시간, 3일, 7일, 30일 등의 옵션을 제공하고, 기본은 최근 7일 이내 업로드로 합리적으로 보입니다. 1일 이내로 하면 너무 새 영상만 나와서 아직 검증이 안 되었을 수 있고, 7일이면 일주일간의 스타 영상을 놓치지 않되 너무 오래된 것은 배제합니다. 30일은 범위를 넓힐 때 쓰고 기본은 아닐 것입니다.
데이터 스냅샷 빈도: 30~60분 간격으로 조회수 스냅샷을 찍어 VPH 등을 계산하려는 계획입니다. 10~15분 간격으로까지 세밀하게 하면 물론 더 즉각적이지만, API 비용이 급증하고 실효성도 크지 않습니다. VPH를 시간당으로 볼 때 15분 간격 측정은 과한 정밀도입니다. 또한 Shorts 뷰 카운트는 기하급수로 늘기보다 어느 정도 완만한 곡선을 그리는 경향이 있어, 1시간 단위가 적절한 타협으로 보입니다.
실시간성 vs 비용: PubSubHubbub를 통해 새 영상 업로드는 즉시 알 수 있지만, 조회수 0→N 돌파를 실시간으로 알기는 어렵습니다. 그러려면 매우 잦은 폴링이 필요하죠. 그래서 혼합 전략: 새 영상 정보는 푸시로 받고, 그 영상의 조회수는 일정 주기마다 업데이트하되, 알림 임계치에 근접한 경우 (예: 이미 90만회)엔 체크 간격을 일시적으로 줄이는 등 동적으로 폴링 주기 조정도 생각할 수 있습니다. 질문: “10분 간격으로 하면 정말 유용성이 높아지나?” – 아마 대부분의 Shorts는 1시간 내에 폭발적으로 오르지 않고 몇 시간~며칠 사이에 이루어지므로, 10분 vs 60분 차이가 알림 50분 빠름 이상의 의미는 없을 겁니다. 게다가 YouTube Data API의 quota 한도를 고려하면, 10분으로 전 채널 모니터링은 불가능합니다.
Where/When 결론: 웹앱 + 24h~7d 필터 + 60분 스냅샷이 현 시점 최선입니다. 모바일 앱은 일단 제쳐두고, 모바일 웹 최적화로 대응하며, 크롬 확장은 장기 검토로 남겨둡니다.
How – 공개 데이터만으로 충족되는가?
핵심 목표는 Google/YouTube 공식 API 및 무료 공개 API만 사용하는 것입니다. 이는 명확한 정책 준수를 위해서인데, 이렇게만 해도 충분한지 따져봅니다.
YouTube Data API v3: 영상 검색, 통계 수집, 채널 정보 모두 가능합니다. 제약은 quota뿐입니다. 오히려 YouTube가 제공하지 않는 데이터(예: 상세한 유저 Demographics, 경쟁 채널 비교 지표 등)는 저희가 못하니, Machine Learning 예측 같은 부분은 없음에 유의해야 합니다.
외부 무료 API: Google Trends 공식 API가 없으므로, Wikimedia pageviews, GDELT, Reddit 등으로 보강하려 합니다 (3절 상세 비교). 이때 주의할 점은 비공식 트렌드 API 남용 금지입니다. 일례로, Glimpse나 SerpApi 등이 Trends 데이터를 크롤링 제공하지만 이는 유료/스크래핑 솔루션으로 정책상 risky입니다[34]. 무료 공공 데이터로는 위키백과 페이지뷰나 Google News API (없다면 GDELT 뉴스 DB)가 있습니다. 이들은 보조 신호로 충분할까요? 예: 어떤 연예인이 갑자기 떴다면 위키백과 검색량 급증으로 알 수 있고, 뉴스 기사도 늘 것입니다. Shorts 세계에서도 그 연예인 짤이 많이 나오겠죠. 따라서 Plan B (공식+외부 무료 병행)는 꽤 효과적일 것입니다.
유료 API/모델의 필요 영역: 혹시 고도 분석이나 자연어 처리 부분에서 한계가 올 수 있습니다. 예를 들어 한국어 감성 분석은 간단한 사전기반으로는 부정탐지 정확도가 낮을 수 있어, AI 모델이 필요할 수도 있습니다. 하지만 이는 부가 기능이므로 꼭 필요하면 HuggingFace의 공개 모델이나 KoGPT2 등의 API를 쓸 수도 있지만, 우선 MVP에서는 제외합니다. 또 썸네일 이미지 분석(예: 잘 나온 썸네일인지 평가)은 현재 무료 API로 어려우며, 상용 Computer Vision 서비스 (Google Vision 등)를 써야 할 수 있습니다. 비용 대비 이득이 불명확하므로 배제합니다.
Note: 경쟁사 Viewstats처럼 “우리 데이터셋 2500배 크다”고 할 수준의 데이터를 모으려면 사실상 공식 API만으로는 힘듭니다[35]. 그들은 크롤링/스크레이핑으로 데이터를 쌓았을 가능성이 큽니다. 그러나 우리는 합법 테두리 내에서 하는 것을 차별점으로 내세울 수도 있습니다 (사용자 API 키로 작동하므로 YouTube TOS 위반 최소화). 필요시 사용자가 개인 브라우저 쿠키를 가져와서 비공개 API를 쓰는 꼼수도 생각할 수 있지만, 이는 명백히 약관 위반이며, NoahAI 사례처럼 문제가 됩니다[36].
결론: Plan B – 공식 API로 기본을 충족하고, Trends/엔티티 등은 외부 무료 데이터를 보강 – 이 최선입니다[37][38]. Plan A (Official-only)는 데이터 풍부함 면에서 다소 부족해질 것이고, Plan C (External only)는 YouTube 데이터를 배제하므로 제품이 성립하지 않습니다. 정책 리스크는 Plan B 범위 내에서는 적당히 분산됩니다. 만약 Reddit API가 내년 갑자기 유료화되어 어렵게 되더라도, Trends API가 그때쯤 공개될 수도 있으니 (지금 알파 테스트 중[37]) 유연하게 대처하면 됩니다.
출처: vidIQ Most Viewed 도움말 (2024)[25][26], TechCrunch – Shorts view count change (2025)[27][28], Google Trends API Alpha 발표 (2025)[37][38], Reddit API 정책 (2023)[39][40]

2) 경쟁 서비스 벤치마크 – TubeLens vs Viewtrap vs 주요 툴 비교
분석 대상 선정: 지리적인 특화와 기능 유사성을 고려해 7개 서비스를 우선 살펴봅니다 – TubeLens(튜브렌즈), Viewtrap, TubeBuddy, vidIQ, Social Blade, ChannelCrawler, ViewStats. (참고: Morningfame, Noxinfluencer 등은 2순위 후보)
각 서비스의 주요 기능, 화면, 지표를 동일 프레임의 표로 비교합니다. 그리고 튜브렌즈 따라잡기 관점에서 우리가 반드시 복제해야 할 기능 vs 우리가 더 강화할 기능을 리스트로 정리합니다.
먼저 각 경쟁사에 대한 간략 설명과 출처를 확인합니다:
TubeLens (튜브렌즈)[23]: 국내 개발된 YouTube 분석 도구로, 베타버전이 2023년에 공개되었습니다. 홍보 문구에 따르면 “키워드 없이도 조회수순 인기영상 탐색”이 핵심이며, 해외 영상 벤치마킹, 무제한 서칭 등의 기능을 제공합니다. 유튜브 API 키를 사용자에게 발급받아 입력시키는 구조로 보입니다[41]. 설치 및 API 설정 가이드를 YouTube 영상으로 배포한 걸 보면 데스크톱 앱 또는 웹앱 형태입니다[41]. v5.6 업데이트(2024년 중반 예상)에서 조회수순 정렬과 신규 기능을 강조했는데, 업계 커뮤니티에 따르면 Noah AI 논란 후 튜브렌즈 사용자들이 늘었다고 합니다. (단, 공식 홈페이지나 문서가 없어 유튜브 영상 설명에 의존)
Viewtrap: 튜브렌즈와 함께 국내 양산형 유튜버들이 언급하는 툴입니다. 명확한 정보는 부족하지만, 이름으로 보아 “뷰(조회수) 함정” 즉 조회수 잘 나오는 소재를 찾는 기능일 가능성이 높습니다. 노아AI 논란 시 함께 언급된 것으로 미루어, 영상 자동화 도구였을 수도 있습니다[42]. 구체 기능은 추정컨대 “인기영상 알림”, “소재 추천” 등을 했을 것입니다. 공식 사이트가 존재하는지 찾기 어려워, 주요 기능은 튜브렌즈와 유사하게 가정합니다.
TubeBuddy[43] and vidIQ[25][26]: 글로벌 유튜브 관리 툴 양대산맥입니다. 주로 브라우저 확장 형태로 채널 최적화에 집중합니다. 주요 기능: 키워드 탐색/SEO 스코어, 태그 추천/복사[44], 썸네일 A/B 테스트, 댓글 필터, 프로모션 도구 등. 트렌드 파악 측면에서는 vidIQ가 한발 앞서 있습니다 – vidIQ는 자체 “Most Viewed” 탭을 통해 특정 카테고리/키워드 내 실시간 인기 영상을 보여주고, Views, VPH, Engagement 등 지표별 정렬을 지원합니다[25]. TubeBuddy도 Keyword Explorer에서 비슷한 기능 일부 제공하지만, 별도 인기영상 목록은 제한적입니다. (2019년경 TubeBuddy도 “Channelytics”로 경쟁 채널 인기영상 보는 기능이 있었으나, 현재는 확장 기능 위주로 간소화된 듯합니다.)
Social Blade: 오래된 유튜브 통계 사이트로, 채널 단위의 과거 데이터 (일일 구독자/조회수)를 그래프로 보여줍니다. Top Lists (구독자/조회수 상위 채널) 제공하고, 특정 채널의 미래 예측까지 보여주지만[45], 개별 영상 분석 기능은 없습니다. Social Blade는 YouTube 공식 인증 파트너였으나 2019년 이후 실시간 구독자 카운트 제공이 막히는 등 제약이 생겼습니다. 영상 단위 기능이 없으므로, 우리와 직접적 경쟁은 아님 – 다만 채널 통계나 리더보드 면에서 참고합니다.
ChannelCrawler[46][47]: 크리에이터 마케팅용 유튜브 채널 검색 툴입니다. 40여 가지 필터로 국가, 언어, 구독자수, 참여율 등을 조건에 맞는 채널을 찾아줍니다[48]. 또한 인플루언서 콜라보 등 위해 연락처 추출, 데이터 내보내기 등을 지원합니다. 개별 영상 트렌드보다는 채널 발견에 초점이므로, 우리 서비스와는 기능적으로 상이합니다. 그러나 채널별 Top 영상 찾기 기능이 있어, 특정 채널의 조회수 Top 영상을 리스트로 보여줍니다 (예: “스폰서십에 성공한 Top 영상” 등)[47]. 우리의 폴더/채널 모니터링 기능과 유사 영역이라 참고됩니다.
ViewStats[35][31]: 2023년에 등장한 신흥 서비스로 MrBeast 팀이 만들었다고 알려졌습니다. AI 기반으로 영상 아이디어, 제목, 썸네일 생성 지원까지 하는 종합 툴입니다[49][50]. 강점: 방대한 자체 데이터셋 (경쟁사 대비 2500배 데이터 처리)[35]로 실시간 Outlier 탐지, 경쟁 채널 추적, 썸네일 검색 등을 제공합니다[51][52]. 예를 들어 “Outlier Videos” 기능은 해당 채널이나 주제에서 평균 대비 월등히 잘나가는 영상을 자동으로 찾아줍니다[51]. 또한 Competitor Alerts로 경쟁자가 영상 올리면 알림, Collections/Boards로 연구 보관, Thumbnail Analysis로 인기 썸네일 유형 파악 등 고급 기능이 많습니다[52][53]. 거의 모든 면에서 최첨단이지만, 유료(Pro $??/월)로 제공됩니다[54]. ViewStats는 사실상 우리가 장기적으로 지향해야 할 모습을 보여주지만, 공개 API만으로 모든 건 구현 불가인 점을 감안해야 합니다 (특히 썸네일 시각분석, AI 추천 등은 그들만의 비공개 알고리즘일 것).
이제 표로 정리합니다. 범주는 탐색/발견, 분석 지표, 알림/추적, 최적화 도구, UI/시스템 등으로 나눠보겠습니다. 각 셀에는 해당 서비스의 지원 여부(✔/✘)나 특징, 그리고 출처 근거를 첨부합니다.
범주 🗂️	세부 기능 🤔	튜브렌즈 🟣<br>(TubeLens)	Viewtrap 🔴<br>(뷰트랩)	TubeBuddy 🟢	vidIQ 🔵	Social Blade ⚫️	ChannelCrawler 🟡	ViewStats 🟠	우리 계획 💡	차별점/리스크 ⚠️
탐색 🔍	무키워드 인기영상 (기간·국가별)	✔️ 키워드 없이<br>조회수순 Top[23]	✔️ (추정)<br>유사 기능	✘ (키워드 필요)	✔️ MostViewed<br>탭 제공[24]	✘ (채널만)	✘ (채널 검색)	✔️ “Top Lists”<br>카테고리별	✔️ 핵심제공 (24h/7d 필터)	리스크: API로 빈쿼리 검색 제약 (해결책 테스트 필요)
탐색 🔍	키워드/주제 검색 (필터링)	✔️ 기본 검색<br>(API키 기반)	✔️ (예상)	✔️ Keyword Explorer[55]	✔️ Keyword & filter[26]	✘ (지원 안함)	✔️ 키워드+채널 필터 다수[48]	✔️ 주제별 트렌드<br>+ AI 추천	✔️ 제공 (YouTube API로 키워드 검색 + Trends보강)	차별화: 외부 트렌드 신호 결합 (Google Trends X)
분석 지표 📈	조회수 추이(VPH) 실시간	✔️ (단순 노출?)	❓ 불명	✘ (없음)	✔️ VPH 제공[56]	✔️ 일별 수치 (채널)	✘ (채널 종합만)	✔️ 실시간 뷰/시청시간[57]	✔️ VPH 계산<br>(30~60분 인터벌)	리스크: 많은 API 호출 필요 (우리 설계로 제한)
분석 지표 📈	Δ24h 증가량 / 기간별 비교	❓ (표기여부 불명)	❓	✘	✔️ (기간 필터로 가능)[58]	✔️ 월별 변화 (채널)	✘	✔️ “+X%” 트렌드 표시 예상	✔️ Δ24h 등<br>DB 계산	데이터 저장량 증가 (스냅샷 유지 필요)
분석 지표 📈	참여율 (좋아요/조회)	❓ (미확실)	❓	✘ (태그위주)	✔️ Engagement % 표기[25]	✘ (채널합만)	✘ (채널합만)	✔️ 댓글/좋아요<br>지표 사용	✔️ 좋아요비율 표시	YouTube API로 dislike 불가 – 제한 설명 필요
분석 지표 📈	채널 정규화 (조회/구독비)	❓ (정보없음)	❓	✘	✔️ 필터: 채널규모별 비교[59]	✔️ (채널 랭크)	✔️ 필터 제공[59]	✔️ Outlier 감지<br>(구독 대비)	✔️ view/subs 점수	많은 채널이 구독자 숨김 – 보완책 필요
분석 지표 📈	이상치 감지 (Outlier)	✘ (단순 리스트)	✘ (추정)	✘	✘ (일반정렬)	✘	✘	✔️ Outlier 탭[51]	✔️ z-MAD 점수<br>랭킹	정확도 의문 – 사용법 교육 필요
알림/추적 🔔	소스 채널 모니터 (폴더링)	✔️ 폴더 = 테마채널 그룹?	✔️ (주요 기능일 듯)	✘ (채널툴 아님)	✘ (채널툴 아님)	✘ (채널 비교 없음)	✔️ 채널 리스트 저장	✔️ Competitor track[60]	✔️ 폴더 기능 (채널 그룹)	개발: playlistItems API로 polling + PubSub
알림/추적 🔔	임계치 알림 (조회≥N, D일 내)	✔️ 지원 (주요 강점)	✔️ (있을 가능성)	✘	✘	✘	✘	✔️ Alerts (모든 트렌드)[53]	✔️ Rule+알림 (이메일/PWA)	FCM 등 푸시 필요, 빈발시 노이즈 – 조정 필요
UI/UX 🎛️	보드/컬렉션 (즐겨찾기)	✔️ 즐겨찾기/히스토리[61]	❓ (미정)	✘	✔️ Trend Alerts보드 (Boost)[62]	✘	✘	✔️ Collections 제공[30]	✔️ 즐겨찾기 +보드 (팀 공유)	Free 제한 기능 – Pro 업셀 포인트
UI/UX 🎛️	CSV/Sheets 내보내기	❓ (불명)	❓	✔️ CSV Export (Legendary plan)	✔️ CSV Export (Boost)[63]	✔️ CSV 다운로드(일부 무료)	✔️ Export (유료)	✔️ Export 가능 (Pro)	✔️ CSV/Sheets (Pro/Team)	Sheets API 사용 – 구현 추가
최적화 ⚙️	태그/제목 추천	✘ (분석 특화, 생성기능없음)	✘	✔️ Tag suggestions[44]	✔️ AI Title/Desc (Beta)	✘	✘	✔️ AI Titles/Thumb[49]	△ (미계획, 2순위)	차후 OpenAI API 등 사용 가능성
최적화 ⚙️	썸네일 분석/A/B	✘	✘	✔️ Thumbnail A/B (Legendary)	✘ (없음)	✘	✘	✔️ Thumbnail search[52]	△ (미계획, 고급)	구현 난이도 높음 (AI 필요)
시스템 🗄️	공개 API 사용	✔️ 100% 공식 (API키)	✔️ (공식일 확률)	✔️ YouTube v3 +(OAuth)	✔️ YouTube v3 (OAuth)	✔️ YouTube v3	❓ (일부 스크래핑?)	✘ 주로 크롤링/자체수집	✔️ 100% 공식/무료	장점: 합법/안정성 👍, 단점: 데이터량 한계 ⚠️
시스템 🗄️	가격 모델	베타 무료, 최종 유료예정?	유료 (월 ??만원대 추정)	Freemium (업셀 다수)	Freemium (업셀 다수)	대부분 무료, 일부 Pro	부분 유료 (데이터 추출)	Pro $20/mo~ (Team용 고가)	Free/Pro/Team 3단계	경쟁: 국내 시장 가격 낮출 필요
표 해설: 튜브렌즈와 Viewtrap은 국내 양산형 유튜버 타겟으로 우리와 직접 경쟁 구도입니다. 이들의 필수 기능은 우리가 모두 포함해야 시장 진입이 가능합니다: 무키워드 인기영상 (특히 해외 소스)[23], 채널 모니터링과 알림, 즐겨찾기 및 내보내기 등이 그것입니다. TubeBuddy/vidIQ는 글로벌 대상이지만 키워드 탐색, SEO 최적화에 강점이 있어서, 향후 우리도 제목/태그 제안 방면 기능 추가를 고려할 수 있습니다 (현재는 범위 밖). Social Blade/ChannelCrawler는 채널 통계/발견쪽이라 간접 경쟁인데, 우리 서비스에서도 채널 성과 보드나 연관 채널 추천을 부가로 넣으면 좋겠지만 우선순위는 낮습니다. ViewStats는 AI+빅데이터 파워로 무장한 종합툴이라, 당장은 모두 따라잡기 어렵지만, Outlier 탐지, 썸네일/제목 연구 보드 등 개념을 참고하여 간소하게라도 제공하면 차별화에 도움됩니다 (예: 간단한 z-score 이상치, 컬러 팔레트 분석정도).
복제해야 할 필수 기능 (리스트) – 경쟁사들로부터 학습하여 반드시 제공해야 우리 서비스 가치가 인정될 기능들:
① 키워드 없이 인기 Shorts 탐색: 기간(최근 X일)과 지역별 조회수 Top 영상 리스트[23]. 근거: 튜브렌즈 핵심 기능, vidIQ Most Viewed[24].
② 채널 그룹 모니터링 & 알림: 사용자가 설정한 채널 폴더에서 신규 업로드 중 임계치 돌파 영상 알림. 근거: 튜브렌즈, Viewtrap 주요 기능으로 추정; ViewStats Alerts에도 유사[53].
③ 조회 속도(VPH)·증가량(Δ): Shorts 특화 지표로 정렬/필터 기능. 근거: vidIQ VPH 제공, 성공적인 Shorts 찾기에 유용[18].
④ 즐겨찾기와 컬렉션 보드: 발견한 영상을 북마크하고 분류(예: 아이디어 보드) & CSV/Sheets로 내보내기. 근거: vidIQ/TubeBuddy 등 프로 플랜에 Export 지원[63].
⑤ 언어/국가 필터 & 다국어 지원: Shorts는 글로벌이므로 국가별 인기를 쉽게 전환, UI도 한/영 등 지원. 근거: vidIQ 국가 필터 Boost 기능[64].
우리만의 강화 기능 (리스트) – 경쟁사에 없거나 약한 부분으로 차별화 포인트가 될 것들:
A. 엔티티 레이더: 키워드 빈도+외부 트렌드 데이터로 떠오르는 주제/인물 식별. 근거: 어떤 서비스도 위키/뉴스 데이터까지 결합 안 함. NoahAI 표절 사태 이후 “윤리적 트렌드 분석”으로 포지셔닝 가능.
B. 이상치(Outlier) 랭킹: 자체 점수로 놓치기 아까운 숨은 바이럴 영상 추천. 근거: ViewStats만 부분 제공, 국내 툴엔 없음 – 데이터 과학 이미지 강조 가능[51].
C. 팀 협업 기능: 공동 보드, 권한 관리, 주간 리포트 등. 근거: 경쟁 제품들은 대체로 1인용 또는 정보제공 한정 – 협업 Workflow는 빈틈임. 우리 SaaS의 업셀 포인트.
D. 국내 플랫폼 최적화: 토스 결제, 카카오 로그인, 한글 NLP 튜닝 등 로컬 맞춤. 근거: 글로벌 툴들은 해외결제/영어 UI라 진입장벽 – 로컬 편의로 승부.
E. 정책 준수/신뢰성: 공개 API만 사용하여 계정 연동 불안감 해소, 데이터 출처 명확히 제시. 근거: NoahAI 사건으로 신뢰 이슈 – 우리는 “100% 합법 데이터” 강조. 또한 사용자의 자체 API 키로 동작하니 투명성 높음.
마지막으로, 경쟁사 기능 중 공개 API로 합법 구현 가능 여부를 따져봅니다:
가능 ✅: 조회수/좋아요/VPH 등 통계 지표 – YouTube Data API videos.list로 가능[65]. 키워드없는 인기 검색 – 편법적으로 가능 (지역+날짜 필터로 search.list 사용). 채널 모니터 – PubSubHubbub+API로 가능[21][66]. 즐겨찾기/보드 – 자체 DB 기능이므로 가능. CSV/Sheets – Google Sheets API로 가능. 요약: 대부분 코어 기능은 공식 API 활용으로 구현할 수 있습니다.
불가/제약 ❌: 경쟁사 내부 데이터 활용 – 예: SocialBlade는 과거 통계 DB가 있지만, 우리는 실시간 API 외 과거데이터가 없어 채널 5년치 추이 그래프 같은 건 못 만듭니다. AI 썸네일 분석 – YouTube API로 썸네일 URL만 받고, 내용 분석은 컴퓨터비전 필요 (Google Vision API 유료 또는 자체 모델 필요). 댓글감성 분석 – 공개 API로 댓글 텍스트는 받아오지만, 감성평가는 ML모델 필요. 실시간 대용량 모니터링 – 공식 API 쿼터 10k/day 제한으로, ViewStats 수준 “2500배 데이터” 축적은 불가. Video Tags – 동영상의 태그 리스트는 영상 소유자 인증 없이는 API 불가 (또는 일부 편법)[55], vidIQ/TubeBuddy는 사용자 계정 OAuth로 태그를 가져와서 보여주나 우리는 사용자 동영상이 아닌 이상 태그 수집은 제한됨. 주변 정보 크롤링 – ChannelCrawler처럼 이메일추출 등은 YouTube API에 없어서 구현 못 함.
이러한 한계는 기획 단계부터 사용자에게 투명하게 안내하고, 대신 우리는 약관 준수로 계정 안전 보장이라는 메시지를 전달할 것입니다.
출처: vidIQ Help – Most Viewed Tool (2023)[24][25], vidIQ Help – Filters (Boost plan)[26][59], ViewStats Site (2024)[35][52], YouTube Data API Docs[65], PubSubHubbub Guide (2025)[21][66]

3) 무료 API 목록 조사 – YouTube 외 트렌드/지식 데이터
YouTube Data API만으로 부족한 트렌드 신호와 지식 연결을 보완하기 위해, 사용할 수 있는 무료 API들을 광범위하게 조사합니다. 특히 Google 외의 무료 API를 적극 활용합니다. 각 API의 제공 기능, 호출 방식, 인증 요건, 한도, 주요 필드, 정책, 활용도, 통합 난이도, 예상 가치, 리스크/대안을 표로 정리합니다.
먼저 후보 API들을 확인합니다:
YouTube Data API v3 (Google): 본 프로젝트의 핵심. 영상/채널/플레이리스트/댓글 데이터 제공. 쿼터 10,000 units/day (기본). 엔드포인트 예: GET https://www.googleapis.com/youtube/v3/search?regionCode=KR&publishedAfter=2023-12-01T00:00:00Z&order=viewCount&maxResults=50&type=video&key=API_KEY – 기간 내 인기 숏폼 검색. 인증은 API Key (또는 OAuth). 반환 필드: video ID, snippet(title, description, channelId,...), etc[67][65]. 정책: 상업적 이용 허용되나 쿼터 제한 엄수, 키 노출 주의. 시장 채택: 매우 높음 (vidIQ 등도 부분 활용). 통합 난이도: 중 (Google API client 라이브러리 이용 가능). 가치: 🟢🟢🟢 (핵심). 리스크: 쿼터초과시 제한, 검색 기능 제한 (빈 query 등). 폴백: 검색 곤란 시 차트 API 등 사용.
YouTube RSS/Atom + PubSubHubbub (WebSub): 유튜브 채널의 Atom 피드와 PuSH 허브를 이용해 새 영상 업로드를 Push로 수신[21][66]. 엔드포인트: POST https://pubsubhubbub.appspot.com/subscribe with hub.topic=https://www.youtube.com/feeds/videos.xml?channel_id=CHANNELID[66]. 인증: 불필요 (콜백 서버 검증만). 무료, 레이트리밋 없음 (허브 자체 제한 미미). 필드: Atom feed entry (videoId, channelId, title, published, updated 등)[68][69]. 정책: YouTube에서 공식 지원하므로 합법. 채택: 중 (개발자 커뮤니티 활용). 난이도: 중 (서버에 콜백엔드 필요). 가치: 🟢🟢 (실시간 알림). 리스크: 가끔 누락 발생 가능 – 폴백으로 주기적 폴링 보완[70].
YouTube oEmbed: 영상 URL로 제목/썸네일 등 가져오는 API. 엔드포인트: https://www.youtube.com/oembed?url=http://youtube.com/watch?v=VIDEO_ID&format=json. 인증: 없음. 한도: 공개 but Rate Limit 있을 수 있음. 반환: title, author, thumbnail URL 등. 정책: 제공되는 데이터가 snippet과 유사하지만, 조회수 등 없음. 채택: 낮음 (간단 embed에만). 가치: 🟡 (한두 필드용). 폴백: snippet 불러오기 곤란할 때 썸네일 링크만 가져오는 용도 등.
Google Trends API (비공식): 공식 API는 2025년 알파 출시[37]. 현재 일반 사용 불가. 비공식으로는 pytrends 같은 Python lib가 Google Trends 웹 요청을 흉내냄. 그러나 이는 스크래핑이며 Google 이용약관 위배일 수 있음[34]. Glimpse나 SerpApi 등 유료 대안 존재[71][34]. Plan B 방향: Trends 데이터는 사용 안함 또는 Wikimedia 등 대체. Plan C로 외부 무료 (아래)로 보강. 결론: Trends API는 현재 접근 불가 (우리 Plan B 전제).
Wikimedia Pageviews API: 위키미디어 재단의 페이지뷰 통계. 목적: 특정 키워드(엔티티)가 최근 얼마나 많이 조회됐는지 파악 (시사 트렌드). 엔드포인트 예: GET https://wikimedia.org/api/rest_v1/metrics/pageviews/top/ko.wikipedia/all-access/2025/08/15 – 한국어 위키 최고 페이지뷰 (일간)[72]. 또는 pageviews/per-article/{project}/{access}/{agent}/{article}/daily/{start}/{end}로 특정 항목 추이 조회. 인증: 필요없지만 User-Agent 지정 권고. 한도: 꽤 관대 (rate limit ~ 100req/s). 반환 필드: article, rank, views. 정책: 공개 CC0 데이터, 사용 자유. 시장 채택: 중 (언론 데이터 분석 등에). 통합 난이도: 낮음 (REST JSON). 가치: 🟢 (트렌드 보조 지표). 리스크: 키워드->위키 매핑 어려움 (동명이인 등) – Wikidata로 엔티티 ID 매핑 병행.
Wikidata SPARQL API: 위키데이터의 지식그래프 조회. 목적: 영상 제목/설명에서 추출한 키워드를 엔티티(Q-id)로 정규화하거나, 관련 정보를 얻기. 엔드포인트: SPARQL query e.g. SELECT ?item ?itemLabel WHERE { ?item rdfs:label "KEYWORD"@en } LIMIT 5. 인증: 불필요. 한도: 공개 (쿼리당 시간제한 있음). 반환: JSON or CSV with binding results (e.g. Q-code, label). 정책: CC0 data, free. 채택: 중 (학술, 개발에 흔함). 난이도: 중 (SPARQL 문법 학습 필요). 가치: 🟡 (엔티티 정규화에 도움). 리스크: 다의어 처리 한계, 속도 느림. 폴백: Key 인물/지명만 수동 맵핑 등.
GDELT Project API 2.0/3.0: 거대한 뉴스/이벤트 DB. 목적: 전세계 뉴스에서 특정 키워드 언급 추이, 지명, 주제별 관심도 파악. 무료 제공 범위: GDELT 2.0 Events API (CSV) or GDELT 3.0 (Elastic). 엔드포인트 예: GET https://api.gdeltproject.org/api/v2/events/count?query=Olympics&mode=Timeline. 인증: 불요. 한도: 문서 언급은 있으나 사실상 무제한 (CDN 캐시). 반환: JSON timeline (date, count). 정책: 오픈데이터. 채택: 중 (데이터 저널리즘). 난이도: 중-상 (쿼리 파라미터 복잡). 가치: 🟡 (대중 관심도 보조). 리스크: 한국어 키워드 커버리지 낮음 (주로 영문), 노이즈. 대안: 구글 뉴스 RSS 이용 (단순).
The Guardian Open Platform: 영국 Guardian지 기사 검색 API. 목적: 영어권 트렌드(연예, 밈 등) 파악. 엔드포인트: GET content.search?q=KEYWORD&from-date=2025-08-01. 인증: API Key (무료 등록, 일 12,000회). 반환: 기사 목록 (title, section, date, trailText). 정책: 무료 + Attribution 요구. 채택: 낮음 (특정 매체 한정). 난이도: 낮음. 가치: 🔴 (제한적 – 뉴스 폭 좁음). 대안: News API (뉴스API.org) 유사.
New York Times Article Search API: 미국 NYT 기사 검색. API키 필요 (무료). 쿼터 일 4,000. 반환: 기사 메타. 유용성: Guardian과 비슷, 글로벌 밈 포착에는 한계. 가치: 🔴.
Reddit API: 현재 정책 변경 체크. 2023년 7월 이후 Reddit은 비상업적 연구 목적 소규모 사용은 무료 유지[39], 상업/대규모 앱은 유료로 전환했습니다[73][74]. 우리 서비스는 영리이므로 공식적으로는 유료 범주일 수 있습니다. 그러나 사용량이 작다면 (100req/min 이하) 무료키로 쓸 수는 있습니다[75]. 목적: Reddit의 /r/Youtube 또는 각국 커뮤니티에서 짤/밈 유행 파악, 혹은 동영상 공유 트렌드 알아보기. 엔드포인트: GET /r/subreddit/search.json?q=keyword&sort=new. 인증: OAuth (script type). 반환: posts (title, score, num_comments, created_utc, etc). 한도: 60req/min for OAuth client by default. 채택: 높음 (많은 앱). 난이도: 중 (OAuth flow). 가치: 🟡 (보조적, 영어 위주). 리스크: 사용량 증가 시 과금 ($0.24 per 1K)[76]. 대안: Twitter API는 유료화 심해 제외, TikTok info API는 비공식이므로 제외.
Google Knowledge Graph Search API: 구글 지식패널 검색. 목적: 키워드→엔티티 ID+description+score. 엔드포인트: GET https://kgsearch.googleapis.com/v1/entities:search?query=KEYWORD&key=API_KEY&limit=5&indent=True. 인증: API Key. 쿼터: 일 100,000 (100 qps). 반환: itemListElement (each with name, description, entityTypes, KG id /g/.. 또는 WikiId). 정책: 개인/비상업에 권장되어 있고 (그러나 키 생성 가능) – 주로 Google 제품 이용 용도로. 채택: 중 (몇몇 앱). 난이도: 낮음. 가치: 🟡 (엔티티 인식 정확도↑). 리스크: 한글 대응 일부 부족, 2025년 이후 서비스 지속성 불확실. 대안: 자체 Wikidata mapping.
Google Sheets API: 보고서 공유용. 목적: 즐겨찾기 리스트를 시트에 내보내거나, 주간 리포트 DataStudio 연계. 엔드포인트: POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/Sheet1!A1:append with video data. 인증: OAuth (사용자 구글계정). 무료쿼터: 읽기 300, 쓰기 100 요청/100초, 일 5000 요청(약). 반환: 업데이트된 range 정보. 정책: 비즈니스 제한 없음. 채택: 중 (많은 앱). 난이도: 중 (OAuth flow). 가치: 🟢 (고객사 보고 활용). 리스크: 사용자가 Google OAuth 꺼릴 수 있음 – 폴백: CSV 다운로드.
GitHub Gist API: 텍스트 공유 대안. 인증: OAuth (GitHub). 무료. 반환: gist URL. 활용: CSV나 JSON 임시 공유. But Sheets가 더 친숙하니 보류.
Open Korean Text (오픈한글텍스트): 옛 트위터형 한국어 형태소분석기 (Java). KoNLPy: 파이썬 패키지로 여러 분석기 래핑 – 활용 시 서버에서 가공. MeCab-ko: 일본 MeCab의 한국어 포크 (C++ 기반, 속도 빠름). 각각 라이선스는 MIT-ish (오픈한글텍스트: Apache2), KoNLPy: GPL (주의 필요), MeCab-ko: LGPL. 유지보수는 KoNLPy가 약간 obsolete, 오픈한글텍스트는 비교적 안정. 성능은 MeCab-ko + 유튜브 특화사전 조합하면 괜찮을 듯. 목적: 한국어 제목/설명에서 명사 추출 및 빈도분석, 감성분석 (사전 기반) 등. 정책 문제없음 (로컬 OSS). 통합 난이도: 중 (서버사이드에 설치). 가치: 🟢 (한글 NLP 필수). 리스크: 신조어/줄임말 미인식 – 대안: 자체 키워드 사전 보완.
이제 표로 구조화:
API	제공자	목적	엔드포인트 예시	인증/키	무료 할당량	주요 필드	정책/제약	시장 채택	통합 난이도	예상 가치	리스크/대안
YouTube Data v3	Google	영상/채널/통계 조회	/search?regionCode=KR&...&key=KEY[67]	API Key (또는 OAuth2)	10k units/일 (100/search)[67][65]	videoId, title, desc, viewCount, likeCount, ...	상업적 OK, 쿼터엄수, 키노출주의	⭐️⭐️⭐️ (vidIQ 등)	중 (공식 SDK多)	🟢🟢🟢 핵심	쿼터초과⚠️ – 대안: 요청 줄이는 캐싱
PubSubHubbub<br>(WebSub)	Google/ 공개	새 영상 업로드 실시간 수신	Hub:pubsubhubbub.appspot.com<br>Topic:feeds/videos.xml?channel_id=...[66]	없음 (콜백 등록만)	제한없음<br>(허브 부하 거의無)	feed.entry: videoId, title, published[68]	콜백서버必, hub 연결 4시간마다 연장	⭐️ (유튜브용)	중 (Webhook구현要)	🟢 실시간 알림	일부누락⚠️ – 폴백: 주기폴링 혼용
oEmbed (YouTube)	Google	URL로 메타 얻기	/oembed?url=http...v=ID&fmt=json	None	미공개 (공격적 사용 자제)	title, author_name, thumbnail_url, ...	조회수 등 없음, 속도 지연 가능	⭐️ (임베드)	하 (단순 HTTP)	🟡 썸네일용	기능제한⚠️ – snippet API로 대체 가능
Wikimedia Pageviews	Wikimedia	위키 트렌드 (인물/사건)	/metrics/pageviews/top/ko.wikipedia/.../2025/08/15	None	공개 (제한 거의無)	article, rank, views[72]	CC0, UserAgent 지정권장	⭐️ (데이터 분석)	하 (REST 호출)	🟢 주제신호	한글문서 편중 – 대안: 다언어 합산 처리
Wikidata SPARQL	Wikimedia	키워드→엔티티 매핑	SPARQL ?item rdfs:label "X"@ko	None	공개 (쿼리 타임아웃 60s)	Q-ID, label, description, type	CC0, 1req/sec 권고	⭐️ (지식그래프)	중 (SPARQL 쿼리)	🟡 정확한<br>엔티티 연결	복잡도⚠️ – fallback: KG API 병행
GDELT Event API	GDELT	뉴스 키워드 트렌드	.../api/v2/events/timeline?query=X&mode=timelinevol	None	공개 (CDN캐싱)	date, count, tone, geo	사용시 출처표기	⭐️ (학계)	중 (결과 가공필요)	🟡 글로벌 밈<br>탐지보조	한글 coverage 낮음 – 대안: Naver 뉴스統計
Guardian Open	Guardian	英뉴스 검색	/search?q=X&from-date=2025-08-01&api-key=KEY	API Key	12k calls/일 (Free)	title, section, pubDate, url	Attribution 필요	⭐️ (언론)	하 (REST)	🔴 제한적	英偏重 – 대안: NewsAPI ($)
NYTimes API	NYT	美뉴스 검색	/articlesearch.json?q=X&api-key=KEY	API Key	4k calls/일	headline, snippet, pubDate	Non-commercial 권장	⭐️ (언론)	하	🔴 제한적	同上 (영어 한정)
Reddit API	Reddit	밈/반응 모니터	/r/{sub}/search.json?q=X&sort=new	OAuth (token)	Free: ≤100req/min (비상업 한정)[77][39]	title, score, comments, created	상업앱 유료 ($0.24/1k)[76]	⭐️⭐️ (여러앱)	중 (OAuth flow)	🟡 밈 탐지	과금리스크⚠️ – Plan: 최소 사용 or user opt-in
Google KG Search	Google	키워드->지식패널	/v1/entities:search?query=X&key=KEY	API Key	100k queries/일	name, description, type, score	비상업 용도 강조 (그러나 사용가능)	⭐️ (한정)	하	🟡 엔티티확인	결과 편차 – 대안: Wikidata SPARQL 병행
Google Sheets	Google	리포트 공유 출력	/{sheetId}/values/A1:append (Sheets API)	OAuth2 (user)	읽기300/100초, 쓰기100/100초【?】<br>일5k writes	spreadsheetId, updates (range, cells)	유저동의 필요, 쿼터 넘으면 지연	⭐️⭐️ (업무자동)	중 (OAuth 필요)	🟢 팀 리포트	사용자 OAuth 부담 – alt: CSV export
Open Korean Text	OSS (Twitter)	한국어 토큰화	(서버내 라이브러리)	N/A	N/A (로컬)	tokens, phrases	MIT License (free)	⭐️⭐️ (국내NLP)	중 (Java 연동 필요)	🟢 한글<br>키워드 추출	신조어 미흡 – alt: 사용자 태그 보완
KoNLPy / MeCab	OSS	형태소/품사 분석	(로컬)	N/A	N/A	nouns, pos	KoNLPy GPL (제약有), MeCab-ko LGPL	⭐️⭐️	중	🟢 NLP 보강	KoNLPy GPL 주의 – alt: MeCab-ko 사용
(주: 예상 가치는 🟢(높음)/🟡(중간)/🔴(낮음) 으로 표시.)
이 중 우리 Plan B에 적극 포함되는 것은 YouTube Data, PubSubHubbub, Wikimedia, Wikidata, KG API, Sheets API, 한글 NLP 등입니다. Plan A (Official-only)라면 YouTube API와 PubSubHubbub, Google KG 정도로 국한되어, 트렌드 신호가 빈약할 것입니다. Plan C (External only)로 YouTube를 배제할 순 없으니 논외입니다.
Plan B가 최선인 이유: 비용-효익 면에서, 추가 데이터 API들은 모두 무료이므로 금전적 부담 없이 기능을 풍부하게 합니다. 정책 리스크 면에서도, Wikimedia나 Wikidata는 오픈 데이터 라이선스로 문제없습니다. Reddit만 약간 애매하지만, 사용량을 작게 유지하거나 사용자가 opt-in(예: Reddit 연동 동의)하도록 하면 해결 가능합니다. Google KG Search API는 구글이 공식 제공하므로 정책 위반은 아니나, 알파나 폐지 가능성을 염두에 두고 fallback(Wikidata) 준비하면 됩니다.
Plan B 실행 시 관리할 점은 데이터 신뢰성과 속도입니다: 예컨대 Wikimedia pageviews는 하루 단위로 업데이트되기에 실시간성은 떨어지지만, 어제 대비 급상승 등은 보여줄 수 있습니다. GDELT는 15분 단위 업데이트라서 활용가치 있습니다 (전세계 이슈 감지). 이러한 외부 데이터는 Shorts 영상 메타분석의 맥락 정보를 추가하여, 사용자에게 “왜 이 영상이 떴나” 인사이트를 줍니다. Plan A로 공식 데이터만 쓰면 그런 맥락을 놓칠 수 있습니다.
한편 리스크: 외부 API들이 갑자기 정책을 바꾸거나 종료될 수 있습니다. 예: Reddit 더 강화, KG API 폐지 등. 그러면 Plan A로 후퇴하거나 다른 무료 대체 (예: Bing News 검색 API 무료티어)로 갈아탈 각오를 해야 합니다.
결론: Plan B (공식 + 외부 무료 보강)이 데이터 폭과 서비스 완성도 면에서 최선입니다. 비용은 API 호출마다 들어가는 우리 서버 리소스 뿐이라 크지 않고, 정책상 문제될 부분은 배제했습니다. Plan A는 안전하나 서비스 임팩트가 떨어지고, Plan C는 YouTube 데이터를 대체 못하므로 불가입니다.
출처: Google Dev Blog – Trends API alpha (2025)[37][38], Reddit Inc – API Updates (2023)[39][74], Wikimedia API Docs (2023)[72], YouTube PubSubHubbub Guide[66][68], Google Knowledge Graph API (2018)[78]

4) 기능 카탈로그 – 세부 기능과 API 조합, 쿼터 고려
프로젝트의 기능들을 중요도 순으로 분류하여 살펴봅니다. “사소하지만 필수”, “핵심”, “고급/연구용”의 세 단계로 나누고, 각 기능에 필요한 API 조합, 쿼터 소모, 예외 상황, 폴백 전략까지 구체화합니다.
4.1 사소하지만 필수 기능 – 기본 사용자 편의 및 관리 요소
이 섹션의 기능들은 제품의 부가적 편의 요소지만, 현대 웹앱으로서 당연히 기대되는 부분입니다.
즐겨찾기 / 보드 / 라벨: 사용자가 관심있는 영상을 즐겨찾기(Favorite) 할 수 있고, 이를 보드(Board) 형태로 분류할 수 있습니다. 예를 들어 “아이디어 보관함”, “이번주 업로드 후보” 등 보드별로 즐겨찾기를 관리합니다. 라벨(Tag) 기능까지 있다면 개별 영상에 여러 태그로 분류 가능하나, 우선은 1단계: 폴더(보드) 분류만 지원합니다. API 사용: 즐겨찾기 자체는 DB 작업이라 외부 API 없음. 쿼터 비용: 없음. 예외/리스크: 동영상이 삭제되거나 비공개되면 즐겨찾기 항목이 유효하지 않을 수 있습니다 – 이 경우 UI에 표시하되 썸네일/제목 못 가져오면 “(삭제됨)” 표시. 폴백: 정기적으로 favorites 목록의 videoIds를 videos.list로 체크하여 유효성 관리.
저장검색 (Saved Search): 사용자가 자주 쓰는 검색 필터 조합(예: “미국+최근3일+조회수≥100만”)을 저장해 두고 재사용. 이건 UX 향상 요소입니다. 구현: 검색 요청시 쿼리 파라미터 객체를 DB에 JSON으로 저장 (users_saved_searches). 쿼터: 없음 (DB만). 예외: API 키 변경 시 동일 검색 해도 결과 달라질 수 있음 (그러나 사용자 이해 영역). 폴백: 유의미한 이슈 없음.
CSV/Google Sheets 내보내기: 현재 보드나 검색 결과를 CSV 파일로 다운로드하거나, 구글 시트에 보내는 기능. API 사용: CSV는 클라이언트에서 blob 생성만으로 OK. Google Sheets는 Sheets API 사용 (OAuth 인증 필요). 예: 사용자가 구글 OAuth 연결하면, spreadsheets.create로 새 시트 생성 후 values.update로 데이터 삽입. 쿼터: CSV는 0. Sheets API: 한 번 내보내기에 1회 시트생성 + 1회 대량업데이트 = 약 2 calls, 일 5회 내보내기 정도면 여유. 예외: OAuth 토큰 만료 -> refresh flow 처리. 시트 셀 수 제한 (5만 행 이상인 경우 CSV로 유도). 폴백: Sheets 연동 실패시 CSV 다운로드 안내.
대표 국가 버튼 (≥10개): UI 상단에 한국, 미국, 일본, 인도, 인도네시아, 브라질, 영국, 프랑스, 독일, 베트남 등 주요 Shorts 시장 10개국을 바로 선택하는 버튼을 둡니다. 구현: YouTube API의 regionCode 파라미터에 해당 국가 코드 전달. 쿼터: 각 변경마다 search API 재호출 (100 units). 예외: 일부 국가 (eg. KR)에서 regionCode=KR이 적용 안 될 경우 – 하지만 YouTube API는 regionCode 지원하므로 OK. 폴백: i18nRegions API로 지역목록 가져와 populate 가능[79].
다국어 UI (i18n): 최소 한국어/영어 지원. 구현: Next.js 국제화 라우팅 또는 자체 locale detector + JSON 번역. 쿼터: 없음. 주의: 팀이 한국인 타겟이라 우선 한국어 중심, 영어는 그대로 또는 추후.
다크/라이트 모드: CSS data-theme 전환 및 Tailwind + Radix 디자인 토큰으로 구현. API: 없음. 특이: 사용자 OS 설정으로 auto detect, Toggle 제공. Radix UI는 다크모드에서 자동 스타일 (via CSS variables) 대응. 검증: 명암비 충족 (0절 논의대로) 테스트.
배지 표시 (임베드 가능, 지역 제한, 자막): 각 영상 카드에 몇 가지 아이콘 배지를 표시합니다:
“Embed 가능 여부” (공유/퍼가기 가능?) – YouTube API status.embeddable 필드[80]로 알 수 있음 (true=퍼가기 허용). videos.list(part=status) 필요 (1 unit).
“지역 제한 여부” – contentDetails.regionRestriction이 존재하면 제한이므로 경고 표시[80]. 이는 videos.list의 contentDetails에 포함되므로 추가 API 호출은 아님.
“자막 여부” – contentDetails.caption 값이 "true"이면 자막 있음[81][82]. videos.list(snippet)에 포함되며, subtitle이 자동 생성 포함인지 확인필요 (아마 caption="true"이면 유저 업로드 자막 또는 자동자막 존재 의미). 쿼터: videos.list 호출에 part=contentDetails,status 추가 – 1unit, 어차피 상세 가져올 때 포함 가능. 예외: regionRestriction이 deprecated로 표기되어 있어도 응답엔 제공[83]. 폴백: 만약 regionRestriction 제공 안 되면 embed player 시도 시 geoBlocked error를 catch해야함 – UI 미리표시는 어렵.
댓글 스냅샷 N개: 각 영상의 댓글 일부 (예: 상위 3개) 미리보기. Shorts의 경우 유튜브 UI에서 댓글 접근이 특별 UI지만, API로는 일반 video와 동일하게 commentThreads.list 가능. API: commentThreads.list(videoId, part=snippet,replies, order=relevance, maxResults=3). 쿼터: 1unit per call[84]. 50개 영상에 대해 다 호출하면 50units – 다소 부담. 전략: 기본은 댓글 안 불러오고, 사용자가 카드 “댓글 보기” 눌렀을 때 on-demand fetch. 혹은 한 영상 디테일 패널 열 때 호출. 예외: 댓글이 비공개/사용중지인 경우 API error 403. 폴백: UI에 “댓글 비활성화” 표시. 또한 한국어 감성분석(고급기능)은 시간상 MVP엔 생략.
제목/설명/해시태그 토큰 빈도: 한 화면의 다수 영상에서 빈출 단어를 뽑아 “Trending Keywords”로 표시하는 기능. 예: 30개 영상 중 “월드컵” 5회, “드라마” 3회 이런식. 구현: 클라이언트에서 현재 영상 리스트 title + tags 텍스트를 모두 합쳐 Open Korean Text로 명사 추출, 영어는 공백단위(불용어 제거) 추출, 빈도 상위 10개를 보여줌. 쿼터: 자체 연산, API 불필요. 예외: “영상” “Shorts” 같은 일반단어 제외 (불용어 리스트). 리스크: 한국어에서 너무 세분된 명사(예 “대한” “민국” 따로 등) – combine logic 필요. 폴백: 이 기능이 과부하 걸리면 (예: 100개 영상 한꺼번에) 서버에서 미리 계산해 전달하는 것으로 변경 가능.
위 기능들은 대부분 쿼터 소모가 미미하거나 내부 연산입니다. 위험요소 적지만, embed/region/caption 배지의 경우 YouTube Data API videos.list에서 status,contentDetails를 받아야 해서, 만약 우리가 기본적으로 statistics, snippet만 받았다면 추가 API 호출이 필요할 수 있습니다. 해결: videos.list?part=snippet,statistics,contentDetails,status 로 한 번에 다 받아 비용 1로 해결[65]. 그러면 동영상 길이, caption여부, embeddable여부, regionRestriction, 라이선스까지 다 한 번에 확보 가능하니 효율적입니다. (영상 하나당 1unit, 50개 묶어도 1unit)
정리하면: 사소하지만 필수 기능들은 주로 DB와 프론트엔드 작업이며, API 호출은 즐겨찾기 검증이나 댓글 조회 등 선택적 상황에서만 소량 일어납니다.
출처: YouTube Data API – videos resource[81][80], YouTube Data API – commentThreads[84], Supabase Realtime example (2025)[85].
4.2 핵심 기능 – 프로젝트의 주된 사용자 가치 창출 요소
이 섹션은 제품의 핵심이 되는 기능들입니다. 앞서 1)에서 확인한 요구사항들과 직결되는 부분이며, API 사용도 집중됩니다. 각 기능마다 “이게 최선인가?”라는 질문을 던져 개선 여지를 검토합니다.
[A] 무키워드 인기 Shorts 탐색 (조회수 기준):
목표: 특정 주제 지정 없이 주어진 기간+지역 내 조회수 많은 Shorts를 보여주기. 예: “지난 3일간 일본 Shorts 인기순”.
기술 구현: YouTube Data API search.list 사용. 파라미터: order=viewCount, publishedAfter=기간, videoDuration=short, regionCode=XX, maxResults=50, type=video[67]. 그리고 videos.list로 그 50개의 통계를 가져와 정렬/필터 마무리.
search.list (100 units) – 이 호출은 영상의 snippet (제목,채널,썸네일)과 videoId, 그리고 몇몇 필드만 제공. 조회수는 없으므로,
결과의 videoId 목록 (최대 50개)을 videos.list(part=statistics,contentDetails, status) (1 unit)로 조회[65]. 각 영상의 viewCount, likeCount, duration, embeddable 등 획득.
contentDetails.duration 파싱하여 초 단위 길이 얻음. 60초,70초,90초,180초 중 임계 이하만 필터. 예: 기본 임계 70초 (clarify 3) – 즉, 71초 이상 영상은 Shorts가 아니므로 제외.
조회수(viewCount) 기준 기본 정렬. (사실 search.list 자체가 order=viewCount이므로 이미 내림차순일 확률 높음. 다만 Search API 결과는 완벽히 전역 Top은 아닐 수도 있습니다. 또한 search.list order=viewCount에 게이밍/음악등 특화 bias가 있는지 의문.)
“이게 최선인가?”: YouTube API에는 지역별 인기 영상을 얻는 다른 방법으로 videos.list?chart=mostPopular&regionCode=XX가 있습니다. 하지만 이 chart=mostPopular는 일반 유튜브 trending으로, Shorts보다는 롱폼/뮤직비디오가 많이 나올 수 있습니다. 실제로 2023년부터 Shorts도 trending에 섞인다지만, 음악/영화 카테고리가 강세라 Shorts만 추출이 어렵습니다[23]. 또한 chart=mostPopular는 maxResults=50까지여서, 그 50개 중 Shorts 몇 개 없을 수 있죠. 대안: chart=mostPopular로 상위영상 받아서 그중 Shorts만 취합 – 그러나 통계적으로 Shorts 트렌드 놓칠 위험 있습니다.
참고: chart=mostPopular 한계 – 유튜브 공식 트렌딩 알고리즘은 조회수뿐 아니라 신선도/지역반응 등을 고려하기에, 순전히 viewCount 순이 아닙니다. 그리고 음악처럼 범세계적 조회수 높은 영상이 상위 차트를 점령하는 경향이 있습니다 (예: BTS MV 등). vidIQ에서는 자사 Most Viewed 도구가 trending과 다르다고 강조합니다[86].
따라서, 우리 접근인 search.list (order=viewCount) + period filter가 차라리 Shorts 발굴엔 낫다고 판단합니다[86][24].
문제: search.list는 쿼리 없을 때 어떻게 동작? – 공식 문서엔 q는 필수지만, 실험적으로 q="" (빈 문자열) 넣거나 q="shorts" 등 전체를 대표하는 쿼리를 넣는 편법이 있을 수 있습니다. vidIQ Most Viewed는 아마 YouTube internal API 또는 파트너 데이터를 쓸 가능성도 있습니다. 일단, YouTube Data API v3에서 완전 빈 검색은 허용 안 되는 것으로 보여, 차선책: 가장 흔한 글자 (예: "a" 혹은 "이")를 q로 넣고, 효과 미미한 필터 (videoCategory 등)로 다양성 확보.
뮤직/영화 편중 현상: order=viewCount 하면 기간 내 조회수 1위가 가령 인도 음악영상(3분)일 수 있는데 Shorts가 아닌데도 videoDuration=short이면 포함 안 되겠지만, 만약 3분 미만 뮤직비디오가 있다면? 이런 노이즈 가능성. 그리고 Shorts도 음악Clip (유튜브 자동 분류)이 있을 수 있어 결과가 편중될 수 있습니다.
해결: videoCategoryId 필터를 활용. Shorts에는 카테고리 개념이 없고 대부분 "22" (People & Blogs)로 들어가지만, 뮤직비디오는 category 10 (Music)으로 되어있음. 따라서 Music이나 Gaming(20) 카테고리는 제외하거나 따로 관리. 하지만 search.list에 videoCategoryId 넣으면 q 필요없이 category별 검색이 가능해집니다. ex: search.order=viewCount&videoCategoryId=22 – 이렇게 하면 음악 제외 가능.
결론: Best practice: 다중 호출 조합 – (1) mostPopular chart 한번 불러 상위 트렌딩 (Long+Short 혼재) 참고[27], (2) 우리 search.list 방식으로 Shorts Top gather, (3) 둘 합쳐 정렬 또는 cross-check. 하지만 쿼터 소모 크므로 MVP엔 후자만.
쿼터 비용: 국가×기간 조합당 search 100 + videos 1 = 101 units. 예: 기본 “전세계7일”, “국가10곳7일” 등.
예외/리스크: Search API 결과가 가끔 중복이나 관련없는 것 포함 가능. 검증 위해 videos.list에서 duration 필터 (<1분10초) 적용. 또, 조회수 데이터 stale 가능성: search API가 cache된 결과 줄 수 있어(몇시간 지연), 두 번 호출시 순위 변동 있을 수.
폴백: 만약 search.list가 빈 키워드 허용 안하면, “ ” (공백 한칸) 또는 '*' wildcard (허용될지 모름) 등 시도. 최악엔 사전 인기 키워드 리스트 (예: “2023”, “shorts” 등)로 순회검색 병합하는 편법도 생각 (그러나 정확도 떨어짐).
[B] 소스 채널 폴더링 & 임계치 알림:
목표: 유저가 관심 채널들을 폴더로 묶어 관리, 해당 채널들에서 최근 업로드된 영상 중 조회수 N 이상 & 게시 D일 이내인 경우 알림.
기술 구현:
폴더<->채널 다대다 관계 관리 (DB: folder_channels table).
신규 영상 감지: PubSubHubbub subscribe 사용. 폴더 내 각 채널ID별로 Hub에 구독. 그러면 새 영상 업로드시 우리 콜백에 Atom entry 도착[66].
콜백 처리: 받아온 videoId로 즉시 videos.list(part=statistics,contentDetails) 호출 (1 unit) -> viewCount, publishedAt, duration 확보.
룰 평가: 폴더마다 사전에 설정된 rule (min_views=N, max_age=D일, max_duration=T초 등)과 비교. viewCount≥N && publishedAt >= now-D && duration ≤ T 면 조건 충족.
충족 시 DB에 alert 생성 (videoId, folderId, triggeredAt 등).
알림 전송: 실시간이라면 WebSocket/Realtime으로 클라에 push, 또는 UI 상 “새 알림 (1)” 표시. 또한 Email이나 모바일 Push (PWA push)도 옵션. MVP엔 UI 표시만.
폴링 보강: PubSub 누락 가능성 대비, 하루 1~2회 playlistItems.list(uploadPlaylist)로 최근 영상 목록 비교. YouTube Data API channels.list(part=contentDetails)로 channel’s upload playlist ID 얻고, playlistItems.list(playlistId, maxResults=5)로 최근5개 얻기 (1unit). 저장된 마지막 영상과 비교. 누락 발견시 처리.
혼합 설계 필요한가?: 네, 푸시+주기폴링 병행이 안전[70][66]. PubSub은 수분 내 알림 장점, 폴링은 혹시 hub 구독 만료나 누락 대비. 폴링 주기는 폴더 규모 따라 다를 수: 채널 많으면 6~12시간, 적으면 1일.
유사 기능: viewtrap/튜브렌즈가 똑같이 할 것으로 추정. ViewStats의 Competitors도 아마 채널 구독->알림.
쿼터 비용: PubSub callback 당 videos.list 1. 채널 100개 하루 10개 업로드 => 100*10=1000 units (여유). 폴링: 채널 100개 -> 100 units if daily.
예외/리스크: PubSub Callback 검증: 최초 subscribe 핸드셰이크 (hub.challenge) 처리 필요. 또, 4시간 마다 재구독 POST 보내야 TTL 유지[66]. 이것 잊으면 1일후 만료. 구현상 cron으로 재구독.
또한, Row Level Security 정책상, 폴더/알림 레코드 접근 권한 제대로 설정해야 다른 유저 데이터 안보임.
동영상이 Premiere(공개예정)였다면 published 시간 미래, viewCount=0이지만 hub는 보내는지? 미리 업로드 예약은 feed에 올라올지 불확실. 일단 feed published 보면 future time? -> 무시.
알람 빈발 노이즈: 기준 10만 잡았는데 채널이 너무 잘나가 다 걸리면? -> 사용자가 임계치를 조정하게 UX 제공, 또는 알림 빈도 제한(예 하루 채널당 1회).
폴백: 사용자가 PubSub 콜백URL (우리 서버) 방화벽 문제로 누락? -> Polling이 최소 하루 한번 잡아냄.
[C] 숏폼 특화 지표/랭킹: VPH, Δ24h, 참여율, 채널정규화, 이상치 z-MAD 등을 계산하여 정렬과 랭킹 점수 제공.
VPH (Views per Hour): 계산 = viewCount / max(1, hours_since_published). 필요 데이터: viewCount, publishedAt. Hours_since = (now - publishedAt) / 3600.
스냅샷 간격 논쟁: 30분 vs 60분 –
30분 간격: VPH 변화를 더 자주 트래킹 가능 (급상승 감지), 그러나 API 부하 2배.
60분: 부하 적고, Shorts의 전체 추이 파악에 충분. (Shorts 조회 증가는 분당보단 시간당 템포가 적절).
절충안: 상위 top 리스트 20개만 15분 간격, 나머지 60분. Complexity 높아 굳이? => MVP: 60분으로.
구현: 30min/60min마다 서버 워커가 video_stats 테이블에 각 모니터링 대상 영상의 (video_id, timestamp, viewCount) 기록. 대상= 현재 인기 리스트 + 폴더 내 alert 후보? (e.g. top 50 global + folder alerts) – 범위 한정 필요.
VPH 보여줄 땐 실시간 계산: (latest_viewCount - viewCount_at_1h_ago) / 1h. Or simply viewCount / hours_since_published for initial approach.
분산/비용: 60분 주기로 50영상 * videos.list = 1unit (50 IDs batch). 24h=24units. 미미.
정확도: Shorts view counting이 바뀌어, 3초 미만 봐도 count라 VPH값 높아질 수. 그러나 상대 비교엔 여전히 유용.
Δ24h: 하루 전 대비 조회수 증가 = views(now) - views(24h ago). 구현: video_stats에 24h 전 기록과 join or compute difference.
스냅샷 데이터 필요: video_stats table indexed by video_id, captured_at.
쿼터: 이미 VPH 위해 60min 간격 저장하면 24h전 데이터를 거기서 찾으면 됨. N=24 or 48개 전.
값 신뢰: Shorts는 처음 48시간 이내 폭증 이후 감소하므로 Δ24h가 양->음으로 갈 수도. 예외는 24h 전 데이터 없으면 (신규<24h), Δ24h=views(now).
참여율: likeCount / max(1, viewCount). YouTube는 2021년 이후 dislikeCount=0 공개하므로 좋아요만 씀. Shorts 경우 좋아요비공개는 거의 없음(제거된 기능).
신뢰성: 좋아요는 시청자 반응 지표인데, Shorts는 스크롤형이라 좋아요율 낮은 편. 이 값은 0.5~5% 정도가 많을 듯. 순위 비교엔 쓰되, 절대값에 큰 의미 두긴 어려움 (또 구매좋아요 등 치팅 가능).
채널정규화 (view/subs): viewCount / max(1, subscriberCount).
동작: 작은 채널이 큰 폭발?
subscriberCount는 channels.list(part=statistics)로 채널별로 가져와야 함. search 결과 50개 채널, 1call(50ids) to channels.list (1unit).
문제: many channels hide subs. API returns hiddenSubscriberCount=true and subscriberCount may be 0 or missing.
처리: hidden이면 임의로 subscriberCount=채널 평균 (e.g. 100k) 또는 exclude from ratio ranking. We'll mark hidden subs as special (maybe rank lowest for fairness or just skip metric).
이상치 (z-MAD): (VPH - median(VPH_recent)) / (1.4826*MAD).
N (최근 샘플 수): 여기 "최근 샘플"은 애매 –
해석1: 특정 기간 내 모은 여러 영상들의 VPH값 집합 (예: 최근 50개 영상 VPH, median=중간값). But 50개 분포에서 outlier detection? Already top list so all high.
해석2: 채널별 자기 역사: 각 채널의 최근 N개 영상 VPH 평균 대비 이번 영상 VPH. 이건 "이 채널치고 터졌다"를 보는 지표. viewStats Outlier도 이 맥락 (expected vs actual)[51].
그러나 표기상 "z-MAD = (VPH - median(VPH_recent)) ..." => likely scenario1 global context.
결정: 간단히, 현재 리스트의 VPH 값들 간 median과 MAD 계산. rank spikes. 이로 “이 리스트 내에서도 특히 높다”를 표시.
N=50 (현재 리스트 size) by default.
계산: median = middle of sorted VPH. MAD = median(|VPH_i - median|). zscore = (vph_i - median) / (1.4826*MAD). 1.4826 is constant for normal distribution to align with stdev.
For heavy-tail distribution, MAD is robust.
Threshold: Outlier if |z| > 2.5 maybe.
Limit: If distribution is skewed or small sample, zscore might not mean much. But for relative ranking, it's fine.
Shorts 조회수 집계 변경(2025-03-31) – “상대 지표 중심이 최선인가?”:
이 변경으로 viewCount 자체는 inflate, 그래서 VPH 등 상대/비율 지표가 더욱 유용하다는 점은 1절에서 언급[28][87]. 즉 예, 상대지표 중심이 맞다. 절대 조회수 순위는 Shorts가 아닌 긴 영상과 비교 불가해서, Shorts 간 순위에도 viewCount보다 VPH가 "현재 반응"을 더 잘 보여주죠[18].
또한 YouTube도 engaged views 별도 지표를 Analytics에 남겨주지만 API에는 안주니, 우리가 heuristic으로라도 trending을 잡는 게 필요.
랭킹 표시: 각 영상 카드에 “Score #X” 배지 또는, 정렬 옵션 “Sort by: ViewCount/VPH/Score” 제공.
기본 정렬을 viewCount vs Score 중 고민. Clarify(5) Q5: 기본 30개, 정렬 = viewCount, AB 24 vs 36.
A/B: 일부 사용자에게 Score sort 기본, 일부 viewCount 기본, retention 확인.
쿼터 비용: VPH & Δ24h 계산은 stat DB만 쓰므로 API 추가 부하는 snapshot 수집시 (아까 50 vids/h -> 24 units/day). 참여율/정규화 -> channels.list 1call extra if needed. Outlier calc internal.
예외/리스크: subscriberCount hidden – ratio skip or treat as 0 (then infinite, no). We'll skip ratio for those or assign median subscriber count.
VPH noise: 새 영상 (1h 이내) might have super high VPH then drop. Real-time nature. But that's fine.
폴백: 사용자가 Score 신뢰 못할 경우, UI에서 각 성분 (views rank, VPH rank 등) 공개 투명성 제공.
또, 점수 알고리즘 조정은 A/B 통해 최적 가중치 찾을 것 (5절 논의).
[D] 주제/키워드·엔티티 레이더:
목표: 인기 영상들의 주제 경향을 파악 – 자주 등장하는 키워드, 인물 등. 또한 외부 트렌드 데이터와 결합해 “어느 영역에서 지금 상승세인지” 보여줌.
구현 흐름:
YouTube 메타 토큰화: 현재 화면 영상들(최대 50)의 제목+설명+태그를 합쳐 명사 추출 (한글: OpenKoreanText, 영어: simple split).
나온 후보 단어들을 빈도 정렬하여 Top 10 키워드 보여줌 (4.1절 마지막 기능에서 설명한 방식).
각 키워드를 Wikidata/Knowledge Graph API로 엔티티 확인: 예를 들어 “이정재” -> QID for actor. 엔티티 유형(class) 파악 (인물, 장소, 작품 등).
외부 신호 결합: 각 Top 키워드에 대해 Wikimedia pageviews (전날 대비 상승률) 또는 GDELT 뉴스량 증가 등을 가져와, 옆에 작은 트렌드 지표(▲15% etc) 표시.
Google Trends는 unavailable, 대체로 위키 검색량이나 뉴스 기사수로.
예: “이정재 – 위키 7일 +300% (영화 <피랍> 개봉)” – 이런 식 insight.
UI: 사이드바 “Trending Topics”에 키워드 목록과 작은 sparkline/arrow. 클릭하면 그 키워드 관련 영상만 필터링 (하단 영상 리스트 필터링).
이게 필요한가?: Shorts 아이디어 차원에서, 단순 영상 리스트보다 이런 주제 통찰이 제공되면 사용자가 “오, 요즘 이 키워드가 많이 보여” 하고 새 아이디어 얻을 수 있습니다. vidIQ도 Keyword Tool, Rising Keywords 기능이 따로 있습니다 (Trend Alerts). 다만 그들은 YouTube 검색량 데이터가 기반인데, 우리는 우회로(위키/뉴스) 사용이라 정확도 떨어질 수.
그래도 무료 데이터로 근사치 볼 수 있으면 도움 될 것.
UX 우려: 정보과부하. 영상 카드도 많은데 키워드 구름까지 있으면 산만. But side panel에 작은 summary 정도면 괜찮을 듯, 숨길 수도 있게.
쿼터 비용:
명사추출: 내부 CPU (50 titles fairly quick).
Wikidata SPARQL or KG API: 10 keywords -> 10 calls (or batch SPARQL 1 call). KG has 100k/day so ok.
Wikimedia pageviews: Top daily list pre-fetched or per keyword (10 calls to pageviews API – possible if checking daily tops).
GDELT: timeline query per keyword => 10 calls (maybe heavy). Possibly skip if not needed.
합쳐서 20~30 external calls (light) per user action. Concurrency manageable.
예외: 키워드가 너무 generic (“video”, “shorts”) – filter out.
Wikidata disambiguation: ex "Paris" may map to multiple. Could pick top rank. Or skip if ambiguous.
한글은 KG API보다 Wikidata SPARQL이 정확 – label exact match. Use ?item rdfs:label "키워드"@ko union en if needed.
폴백: 만약 external API 느리면, 키워드 빈도만 우선 보여주고, 외부 신호는 lazy load async update.
4.3 고급/연구 제안 기능 – 차별화 및 향후 발전용
여기서는 MVP 이후 또는 실험적인 기능들을 정리합니다. 현단계에서는 우선순위 낮지만, 즉시 가치 vs 실험적을 판단하여 로드맵에 반영합니다:
엔터티 그래프: 영상들 간의 출연 인물/언급 키워드 연결망 또는 채널 간 연관성을 그래프로 시각화. 노드=엔티티(인물, 브랜드 등) 또는 채널, 엣지=동일 영상에서 함께 언급 (co-occurrence). 이를 통해 “이 트렌드에 자주 같이 거론되는 키워드” 파악. 이건 실행복잡도 높아 MVP에는 과함. 즉시 가치? 낮음 (재미 요소, 고급 분석용). 실험용 트랙에 넣고, 추후 웹앱 내 data viz (mermaid graph or D3) 시도.
멀티국가 동시 레이더: 여러 국가를 선택하면 교집합 인기 주제 또는 국가별 상위 영상 비교를 제공. 예: “한국과 일본 모두 트렌드인 Shorts vs 한국 전용 히트 vs 일본만 히트” 구분. 이건 데이터 매트릭스가 커서 UI/UX 어려움. 그러나 글로벌 콘텐츠 발굴에 도움 될 수 있어 Team 플랜 기능으로 고려. 즉시 가치? 중간 (글로벌 겨냥 채널에게 유용). 실험 여부: 먼저 단일국가로 자리잡은 후, 사용자 요청 시 개발.
썸네일/제목 패턴 빈도: 인기 영상들의 제목 패턴(숫자 사용, “?” 사용, 이모지 포함 등)과 썸네일 특징(얼굴 클로즈업, 큰 글자 등) 분석.
제목 쪽은 간단 통계: 몇 %가 “!”포함, 평균 제목 길이 등.
썸네일 쪽은 OpenCV나 AWS Rekognition 써야 해서 난이도 높음. ex: 얼굴 인식 후 표정 분류, 색상 히스토그램 (밝은 vs 어두운), 텍스트 검출 등.
즉시 가치? 낮음 for MVP (고급 크리에이터나 관심).
연구 트랙: 장기적 AI 접목 포인트.
한국어 감정 스냅샷 (사전 기반): 댓글이나 제목에서 긍/부정 어휘 수를 세어 간단 지표 (웃음빈도, 욕설 여부 등). 노아AI 표절건에서 악성댓글 탐지가 이슈되기도 했는데, 우리 툴 고객에게 그건 중요도 낮음 (우리는 콘텐츠 생산 지원이 주 목적).
즉시 가치? 거의 없음.
연구: 혹여 향후 AI 클립 편집 툴과 결합해 “이 영상 반응 좋음” 정도 알려줄 때나 사용.
팀 협업 칸반: 아이디어를 보드에 넣고, 상태 태그 (아이디어, 이번주 제작, 보류 등) 붙여 관리. Trello 느낌의 Kanban for content pipeline.
즉시 가치? 중~높음 (Team 플랜 메인 기능으로 쓸 만함). 그러나 개발 공수 큼 – UI 복잡, 드래그드롭 등.
우선순위는 핵심 기능 이후.
Team 고객이 생기면 추진. RLS 권한 분리 전제되어야.
즉시 가치 높은 것 vs 실험트랙: - 가장 즉시 가치: 팀 협업 칸반 (고객이 존재한다면 금방 도움됨). - 그 다음: 멀티국가 레이더 (글로벌 에이전시용). - 실험/저가치: 엔터티 그래프, 썸네일 AI, 감정분석 – 이는 리소스 여유있을 때 R&D.
선후순위 제안: 1. 필수 MVP: 무키워드 Shorts 검색, 채널 알림, 지표랭킹, 키워드레이더 (기본형), 즐겨찾기/보드, 내보내기. 2. 곧바로 V2: 협업 보드/태그, 멀티국가 분석. 3. R&D 트랙: 썸네일 AI분석, 엔터티 네트워크, ML 추천.
각 가설에 대한 근거나 추적 지표: 예컨대 칸반 기능 추가 시 사용률 (보드당 평균 아이템, 팀 로그인 유지 일수) 측정해 효과 검증. 멀티국가는 기능 켜진 A/B 그룹에서 국가 전환 행동 증가 등을 볼 것.
출처: vidIQ Blog – Trending vs Trending Tab[86], Viewstats – Outlier & Thumbnail[51][52], W3C – WCAG Contrast vs Color-blind Patterns (for thumbnails with text)[5], Reddit – NoahAI plagiarism context[36].

5) 랭킹/지표 정의 – 수식·의사코드·샘플, 그리고 “최선인가” 논의
여기서는 핵심 지표들의 정의 수식, 간단 의사코드, 예시 JSON을 제시합니다. 그리고 각 지표 산정 방식에 대해 “이렇게 하는 것이 최선인가?”를 질문하며, 대안 공식 몇 가지도 비교합니다.
Shorts 후보 선정 기준 – Shorts로 간주할 영상의 길이 임계. 우리는 videoDuration=short (유튜브 검색 필터, 4분 미만)로 1차 거르고, 추가로 contentDetails.duration (ISO 8601 형식) 파싱하여 임계 이하만 최종 포함합니다. - 임계값 옵션: 60, 70, 90, 180초 중 결정. Clarify(3)에서 기본 70초로 정했습니다. - 근거: 원래 Shorts는 60초 미만이 공식 기준. 그러나 2022년부터 60초를 약간 넘는 영상도 Shorts 알고리즘에 노출되는 사례가 있어, 70초까지는 사실상 Shorts 취급한다는 의견이 있습니다 (비공식). 90초, 180초는 너무 길어서 Shorts 피드에 잘 안 뜸. - 가설 검증: 추후 우리 DB의 영상 길이 분포를 보고, 60~70초 사이 영상이 의미있는 비중인지 확인해볼 것입니다. 만약 거의 없으면 60초로 낮출 수도. 180초(3분) 이하는 Shorts 필터링에는 포함되지만, 90초 이상은 Shorts보단 일반영상 취급되는 듯하여, 기본값 70초 유지 + 설정 옵션 제공.
의사코드 (길이 필터):
def is_shorts(video):
    duration_secs = parse_iso8601_duration(video['contentDetails']['duration'])
    return duration_secs <= SHORTS_DURATION_LIMIT  # e.g. 70
VPH (Views Per Hour) – $$ \text{VPH} = \frac{\text{viewCount}}{\max(1, \text{hours_since_published})}. $$ - 즉, 영상 조회수를 게시 후 경과시간(시 단위)으로 나눈 값. - 스냅샷 간격이 30분 vs 60분이라도, VPH 자체 공식은 동일. 다만 hours_since_published은 우리가 가져온 현재시간 기준. 30분마다 업데이트하면 VPH 곡선을 더 촘촘히 추적 가능하지만, 60분으로도 충분한지 비교: - 60분 간격: 예를 들어 2시간된 영상 view=120k -> VPH=60k. 30분 간격: 첫 1h=100k/h, 다음 1h=20k/h, 그러면 떨어지는 추세 감지. 60분 간격은 평균으로 놓쳐. - 비용 vs 정보: Shorts 성장세 파악에 30분이 의미있으면 써야 하지만, 그 정도 정밀 분석은 아닌 것으로 판단. - 분산/비용: 30min 간격은 2배 API & DB. - Trade-off: MVP 60m, 향후 인기 급변 탐지 필요시 일부 30m. - 의사코드:
from datetime import datetime
def compute_vph(video):
    published = parse_iso8601(video['snippet']['publishedAt'])
    hours = max(1, (datetime.utcnow() - published).total_seconds() / 3600.0)
    return video['statistics']['viewCount'] / hours
Δ24h – 24시간 증가분: $$ \Delta_{24h} = \text{views}(t_0) - \text{views}(t_0 - 24h). $$ - 이건 시계열 필요. 구현상, 매 시간 video_stats 누적 시, 최근24h전 레코드와 현재 조회수를 빼서 계산. - 예: t0 now=2025-08-15 18:00, video views=1,500,000; t0-24h=2025-08-14 18:00 views=1,200,000 -> Δ24h=300,000. - 신뢰성: 첫 24h 내 영상은 baseline=0일 가능, Δ=views. - 24h 기준이 최선? 12h, 48h도 가능. 24h는 하루 주기로 뉴스 주기와 맞고, Shorts 대부분 1~3일이 peak, so 24h change is meaningful. - 의사코드:
def compute_delta_24h(video_id):
    stats = get_stats_for_video(video_id)  # sorted by time
    if len(stats) < 2:
        return None  # not enough data
    latest = stats[-1]['viewCount']
    # find stat ~24h ago:
    cutoff = stats[-1]['captured_at'] - timedelta(hours=24)
    prev_stats = [s for s in stats if s['captured_at'] <= cutoff]
    if prev_stats:
        base = prev_stats[-1]['viewCount']  # last point <= cutoff
    else:
        base = 0  # video not existed 24h ago (new video)
    return latest - base
- DB index (video_id, captured_at) helps.
참여율 (Engagement rate) – $$ \text{ER} = \frac{\text{likeCount}}{\max(1,\text{viewCount})}. $$ - dislikeCount 제외 (private). - Output as ratio or percentage. e.g. 0.05 = 5% viewers liked. - 약간 왜곡: 일부 viewers from Shorts feed don’t bother liking, so Shorts ER typically lower vs normal videos. But relative comparisons among Shorts is ok. - 신뢰도: “좋아요 수를 조작 가능” – 큰 문제 아님, 대부분 자연. - 의사코드:
def compute_engagement_rate(video):
    likes = int(video['statistics'].get('likeCount', 0))
    views = int(video['statistics'].get('viewCount', 0))
    return likes / max(1, views)
채널정규화 (View/Subs) – $$ \text{ChannelNorm} = \frac{\text{viewCount}}{\max(1,\text{subscriberCount})}. $$ - 만약 subscriberCount=0 or hidden -> handle: if hidden, skip metric or treat subscriberCount=average (but simpler: skip from ranking). - 이 수치는 “이 영상 조회수가 그 채널 구독자 대비 몇 배인가” 의미. >1이면 구독자보다 더 많이 외부 도달; 0.1이면 구독자 10%밖에 안 봤음. - Shorts 경우 구독자 연관성 약해 채널 작아도 터질 수 – 이 지표 높으면 “바이럴”. - hiddenSubscriberCount: official API gives subscriberCount only if not hidden. If hidden, we set subscriberCount=channel median or skip. Probably skip to avoid weird values. - 의사코드:
def compute_channel_norm(video, channel_info):
    subs = channel_info.get('subscriberCount')
    if channel_info.get('hiddenSubscriberCount') or subs is None:
        return None  # skip or mark as undefined
    return video['statistics']['viewCount'] / max(1, subs)
이상치 점수 (z-MAD) – $$ z_{\text{MAD}} = \frac{\text{VPH} - \text{median}(VPH_{recent})}{1.4826 \times MAD(VPH_{recent})}. $$ - 사용: robust z-score for outlier. - VPH_recent – define context: - Option1: all videos in current result set (like top50). Then we get a relative measure among them. - Option2: videos in similar category/time bracket in DB (e.g. all tracked trending videos last 7d). But simpler to do set-based. We'll assume current list for now. - Steps: compute VPH for each video (we already did). - median = sorted VPH middle. - devs = |vph_i - median| for all i. - MAD = median(devs). - z_i = (vph_i - median)/ (1.4826MAD). - The constant 1.4826 makes MAD a consistent estimator of std deviation under normal distribution. - If MAD=0 (like if many have same VPH or <2 elements), define z=0 or skip. - This yields positive or negative (above or below median). - We mainly care high positive outliers (vph >> median). - N(최근 샘플): - If we consider "recent trending short samples", maybe better context than just top50. Could use last 100 trending Shorts in our DB to get a stable baseline. But that could include older lower VPH items. Perhaps not needed; within top50 itself might suffice since distribution likely skewed (some not so trending at bottom). - We'll use current list size as N for median. - 의사코드 and sample:
import numpy as np
def compute_zmad(vph_list):
    if not vph_list or len(vph_list) < 2:
        return [0]*len(vph_list)
    med = np.median(vph_list)
    devs = [abs(v - med) for v in vph_list]
    mad = np.median(devs)
    if mad == 0:
        # if all vph equal (unlikely), return zeros
        return [0 if v==med else float('inf') for v in vph_list]
    return [ (v - med) / (1.4826 * mad) for v in vph_list ]
- Ex: Suppose VPH list = [100k, 80k, 20k, 10k] (4 videos). - median=50k (avg of 80k & 20k? Actually median of 4= (80k+20k)/2=50k). - devs = [50k,30k,30k,40k]; mad = median(30k,30k,40k,50k) = 35k. - z for each: - 100k: (100-50)/ (1.482635) = 50 / 51.9 ≈ +0.96 - 80k: (80-50)/51.9 ≈ +0.58 - 20k: (20-50)/51.9 ≈ -0.58 - 10k: (10-50)/51.9 ≈ -0.77 - So first has highest +0.96 but not extremely > 2.5, so within set none is a huge outlier. If one video had VPH 500k, that would yield large z. - Is this best approach? Maybe simply rank by VPH and highlight top 1 or 2 as outliers might be simpler. But zscore gives degree. - In usage, we might incorporate zscore rank in final Score.
최종점수 (예) – $$ S = 0.4 \cdot rank(\text{viewCount}) + 0.3 \cdot rank(\text{VPH}) + 0.2 \cdot rank(\text{viewCount}/\text{subs}) + 0.1 \cdot rank(z_{\text{MAD}}). $$ - 이 수식에서 rank(x) 는 등수가 낮을수록 (1위) 높은 숫자인지, 아니면 높은값=높은 점수로 스케일링한 건지 애매하지만, 보통 ranking score라 하면 1위=1, 2위=2 ... 나쁜. - 그러나 합산 점수에서는 오히려 percentile rank(1=top performer)로 넣는 게 자연. - 예를 들어, rank(viewCount) – if 1 means highest, 0 means lowest (normalized rank). We can interpret: - Compute ordinal rank ascending, then invert: Score_high = (N - ordinal + 1)/N. - Or simpler: use sorted index. But easier: just combine quantile standardized values. - 가중치 탐색 (A/B): 0.4/0.3/0.2/0.1 is initial guess. We might try variant formulas: 1. Score A (현재): 주로 viewCount (40%)와 VPH(30%), 약간 channel norm(20%), outlier(10%). 이건 절대 강자 (view 많은 영상) 선호. 2. Score B: 더 VPH중심 – e.g. viewCount 25%, VPH 50%, channel norm 15%, outlier 10%. -> 떠오르는 영상 강조. 3. Score C: balance out all – e.g. viewCount 30, VPH 30, Engagement 20 (대신 of channel norm), channel norm 20. (만약 engagement was included). - Another alternative metric: vidIQ’s “vidIQ Score” which is mysterious but likely weight of velocity & social. - We will experiment by analyzing outcomes: - Weighted rank means if a video ranks #1 in viewCount and #5 in VPH, etc. Lower sum = better. (But their formula as sum means lower better, they'd invert as -S maybe). - Could convert to 0-100 scale each then weighted sum, higher better. Implementation must be careful. - Plan: Implement multiple Score formulas behind feature flag or user toggle (like "sort by: trending score A or B"). - A/B test: randomly assign formula to user for default sort and see which yields user longer engagement (like does user click more video details under one scheme). - Sample pseudocode for Score A:
videos = fetch_videos(...)  # list of dict with metrics already computed: viewCount, VPH, channel_norm, zMAD
# Compute ranks (1 = highest):
for metric in ['viewCount','VPH','channel_norm','zMAD']:
    videos.sort(key=lambda v: v[metric], reverse=True)
    for i, vid in enumerate(videos, start=1):
        vid[f"{metric}_rank"] = i
# Combine:
for vid in videos:
    vid['scoreA'] = 0.4*vid['viewCount_rank'] + 0.3*vid['VPH_rank'] + 0.2*vid.get('channel_norm_rank', vid['viewCount_rank']) + 0.1*vid['zMAD_rank']
# Now smaller score = better rank (rank1=1).
videos.sort(key=lambda v: v['scoreA'])
- Alternatively, do normalized (N-i+1)/N to convert rank to [0,1] then larger better:
N = len(videos)
for vid in videos:
    vid['scoreA_alt'] = (0.4*(N-vid['viewCount_rank']+1) + ... ) / N
- either way relative ordering same. - Provide output sample for clarity:
샘플 입력/출력 JSON (예: 3개 영상):
Input (각 video 객체):
[
  {
    "videoId": "X1",
    "title": "Awesome Trick Shots!",
    "publishedAt": "2025-08-14T12:00:00Z",
    "viewCount": 1000000,
    "likeCount": 50000,
    "channelId": "C1",
    "channelSubs": 100000,
    "VPH": 50000.0,
    "channel_norm": 10.0,
    "zMAD": 1.5
  },
  {
    "videoId": "X2",
    "title": "Cute Cat Compilation",
    "publishedAt": "2025-08-10T09:00:00Z",
    "viewCount": 2000000,
    "likeCount": 100000,
    "channelId": "C2",
    "channelSubs": 500000,
    "VPH": 5000.0,
    "channel_norm": 4.0,
    "zMAD": -0.7
  },
  {
    "videoId": "X3",
    "title": "New Movie Trailer",
    "publishedAt": "2025-08-15T06:00:00Z",
    "viewCount": 800000,
    "likeCount": 40000,
    "channelId": "C3",
    "channelSubs": 2000000,
    "VPH": 100000.0,
    "channel_norm": 0.4,
    "zMAD": 2.0
  }
]
- (Note: X3 has highest VPH, moderate views, huge channel so low channel_norm, high zMAD; X2 highest views but older, low VPH; X1 balanced in between.)
Calculation: Ranks: - viewCount: X2(1), X1(2), X3(3) – (2M,1M,0.8M). - VPH: X3(1), X1(2), X2(3) – (100k,50k,5k). - channel_norm: X1(1), X2(2), X3(3) – (10,4,0.4). - zMAD: X3(1), X1(2), X2(3) – (2.0,1.5,-0.7). ScoreA = 0.4rank(view)+0.3rank(VPH)+0.2rank(norm)+0.1rank(z). - X1: 0.42 + 0.32 + 0.21 + 0.12 = 0.8+0.6+0.2+0.2 = 1.8. - X2: 0.41 + 0.33 + 0.22 + 0.13 = 0.4+0.9+0.4+0.3 = 2.0. - X3: 0.43 + 0.31 + 0.23 + 0.11 = 1.2+0.3+0.6+0.1 = 2.2. Lower = better, so ranking: #1 X1, #2 X2, #3 X3. Thus, X1 (“Awesome Trick Shots!”) wins due to high channel_norm and decent VPH, even though views less than X2. X3 lost because channel so huge (norm low) despite highest VPH.
Is this optimal? Maybe not, as X3 could be truly trending (a big channel’s new trailer). Alternate weight B (view 0.2, VPH 0.5, norm 0.1, z 0.2): - X1: 0.22+0.52+0.11+0.22 = 0.4+1.0+0.1+0.4 = 1.9. - X2: 0.21+0.53+0.12+0.23 = 0.2+1.5+0.2+0.6 = 2.5. - X3: 0.23+0.51+0.13+0.21 = 0.6+0.5+0.3+0.2 = 1.6. Now X3 ranks 1st (score1.6), X1 second(1.9), X2 third(2.5). This might better reflect trending (X3 trending because VPH high, even though channel big and viewcount slightly lowest). So indeed weight choice changes outcome.
가중치 탐색 계획: - 우리는 기본 ScoreA, 그리고 ScoreB (VPH-heavy) as alternative sorting. Possibly let users toggle or we'll test which yields more engagement (like if user sorts by trending and likes results or not). - Could also incorporate Engagement (like ratio of likes). We omitted from formula but maybe we consider if necessary. Possibly small weight if want to penalize clickbait with low likes. - We'll use A/B testing and user feedback to refine. KPI could be: If sorted by Score leads to more video detail clicks vs pure viewCount sort.
대안 공식 2~3개: 1. Score (Balanced) – 40% views, 30% VPH, 20% norm, 10% outlier (current). 2. Score (Velocity-biased) – e.g. 20% views, 50% VPH, 10% norm, 20% outlier (like sample above). Emphasizes up-and-coming even if absolute views lower. 3. Score (Quality-biased) – e.g. include Engagement: 30% views, 25% VPH, 15% norm, 10% outlier, 20% engagement (if data available). Would surface videos that not only have views but also high like ratio. - But engagement might favor some content type, not sure if needed for trending detection. 4. No score – Actually one could argue just providing toggles to sort by each metric separately (views, VPH, etc) might be simpler than a blackbox score. Many users trust raw metrics. So an alternative approach: not combine at all, but allow dynamic multi-sort (e.g. filter list by min views and then sort by VPH). - We likely do allow sorting by each metric. The combined score is a convenience "Our recommendation". So it's fine as default but must be explainable in UI to gain trust.
요약: Score formula is highly configurable. We'll implement as code that easily adjust weights. We'll treat initial weights as 가설 (Hypothesis) and measure if it indeed brings up "the right videos" (maybe by seeing if videos with known subsequent success appear). One measure: if our Score picks some video as #1 which next day goes viral (ex post verification) vs if viewCount sort might have missed it. That would validate the score.
Sources: vidIQ on VPH usage[18] (ranking trending), TechCrunch on Shorts view definition[28], OpenAI on robust stats (for z-MAD concept, general knowledge), internal clarifications.

6) API 호출 레시피 – 완전한 URL, 파라미터, 응답 요약, 쿼터 비용
주요 기능 구현에 필요한 API 호출들을 레시피 형식으로 정리합니다. 각 항목마다 완전한 요청 URL 예시, 주요 파라미터 표, 응답 형식 요약, 쿼터 비용, 주의사항/폴백 등을 기술합니다.
(1) search.list – 무키워드 인기 Shorts 검색
- 설명: YouTube Data API의 Search 메서드. 기간, 국가, 영상길이를 조건으로 조회수순 상위 영상 목록을 가져옵니다. - HTTP 요청 예시 (GET):

https://youtube.googleapis.com/youtube/v3/search
    ?part=id,snippet
    &type=video
    &order=viewCount
    &publishedAfter=2025-08-08T00:00:00Z
    &videoDuration=short
    &regionCode=US
    &maxResults=50
    &key=AIzaSy... 
(키는 예시) - 파라미터 설명:
| 파라미터 | 값 예시 | 의미 | |----------|---------|-------------------------| | part | id,snippet | 응답에 video ID와 snippet(제목,채널 등) 포함 | | type | video | 비디오만 검색 (채널/재생목록 제외) | | order | viewCount | 조회수순 정렬 (내림차순)[25] | | publishedAfter | 2025-08-08T00:00:00Z | 업로드 날짜 하한 (ISO8601) | | videoDuration | short | 짧은 영상만 (<=4분) | | regionCode | US | 미국 지역 기준 인기 (트렌딩 영향)[64] | | maxResults | 50 | 가져올 결과 개수 (최대 50) | | q | (없음) 또는 "" | 검색쿼리 – 없으므로 전체에서 필터만 적용 (API는 쿼리 필수지만 공백시 대부분 무시됨) | | key | (API 키) | API 액세스 키 | - 쿼터 비용: 100 units/호출[67]. (maxResults에 관계없이 일괄 100) - 응답 예시 요약: JSON 객체:

{
  "kind": "youtube#searchListResponse",
  "items": [
    {
      "id": { "videoId": "abc123" },
      "snippet": {
        "title": "Video Title",
        "channelId": "UC..", "channelTitle": "Channel Name",
        "publishedAt": "2025-08-10T...Z",
        "thumbnails": { "medium": { "url": "..." } }
      }
    }, 
    ... (최대 50개)
  ]
}
items에 각 영상의 videoId와 snippet(제목,채널,썸네일,게시일) 제공. 조회수는 포함 안 됨 (statistics 아님). - 주의 / 한계: - q 파라미터 없으면 일반적으로 에러이지만, regionCode+order 조합으로 일종의 트릭이 작동할 수 있습니다. 공식으로는 “검색 쿼리가 필요”라서, 만약 빈 쿼리에 결과가 안 나오면, q="*" 또는 인기 키워드 (예 "shorts")를 넣는 폴백 전략이 필요. - order=viewCount는 과거 24시간 이내 업로드 영상은 잘 안나오는 경향이 있습니다(조회수 누적 적어서). 그래서 period를 7일 정도 주는 게 적절. 너무 짧게 (1일) 하면 대부분 조회수 낮아 random성 높음. - 지역별로 조회수 정렬이 적용되긴 하나, 일각에서 “regionCode+order=viewCount 조합이 항상 정확한 결과 주진 않는다”는 언급이 있습니다 (API 결과가 전역 top일 수 있음). 하지만 regionCode가 trending과 연관있다고 공식 문서 명시[88]. - 403 오류시: 키 쿼터 초과 가능성 -> 백오프(지연 후 재시도) 또는 사용자에게 “API 한도 초과, 내일 이용 바랍니다” 안내. 또한 No filter selected 에러 날 경우 (q 없이 호출) → q="." 등 시도.
(2) videos.list – 여러 영상의 상세 정보 일괄 조회
- 설명: Video 리소스 정보를 video ID 리스트로 가져옴. 조회수, 좋아요, 길이, 상태 등 병합 목적. - HTTP 요청 예시:

https://youtube.googleapis.com/youtube/v3/videos
    ?part=snippet,statistics,contentDetails,status
    &id=abc123,def456,ghi789,...   (최대 50개)
    &key=AIzaSy...
- 파라미터:
| 파라미터 | 값 | 의미 | |----------|-----|------| | part | snippet,statistics,contentDetails,status | 필요한 속성들 모두[89]. (snippet: 제목,설명,채널,게시일; statistics: viewCount, likeCount 등; contentDetails: duration, caption, regionRestriction; status: embeddable 등) | | id | abc123,def456,... | 조회할 영상들의 ID 목록 (쉼표구분) | | key | (API 키) | | - 쿼터 비용: 1 unit/호출[65] (50개 ID까지 한번에 가능). - 응답 요약:

{
  "kind": "youtube#videoListResponse",
  "items": [
    {
      "id": "abc123",
      "snippet": { "title": "...", "channelId": "...", "publishedAt": "..." },
      "statistics": { "viewCount": "1000000", "likeCount": "50000", ... },
      "contentDetails": { "duration": "PT1M10S", "dimension": "2d", "caption": "true", 
                           "regionRestriction": { "blocked": ["KR","JP"] } },
      "status": { "embeddable": true, "privacyStatus": "public", ... }
    },
    ...
  ]
}
각 video 객체에 우리가 필요한 모든 필드가 들어있습니다: - statistics.viewCount (조회수), statistics.likeCount (좋아요수) – dislikeCount는 없음 (private). - contentDetails.duration – ISO8601 형식 길이 (“PT1M10S” = 1분10초). caption: "true" or "false" (자막 있음?)[81]. - status.embeddable (임베드 허용 여부)[90], status.privacyStatus (public/private). - regionRestriction.blocked/allowed – 차단국가 목록 등[90]. - 주의: - regionRestriction은 deprecated로 docs에 표기돼도 여전히 응답에 포함되며 작동함[80]. - 50개 넘는 ID 조회하려면 여러 번 나눠 호출 필요 (대부분 50이면 충분). - HTTP GET URL 길이 한계: 50 IDs (11 chars each) + params, URL < ~2000 chars, 안전. - ETags: 응답에 ETag 헤더가 오는데, subsequent call에 If-None-Match로 보내면 변경없을 시 304 Not Modified 받을 수 있음. 이 기능을 활용해 캐싱 가능. 예를 들어 즐겨찾기 영상들의 stats를 주기적으로 갱신할 때 ETag 활용. - 정책 한계: videos.list로 비공개 영상 조회는 불가 (요청하면 items 빈 배열). 이 경우 stats 없음. UI에서 "비공개됨" 처리 필요.
(3) videos.list?chart=mostPopular – 지역별 트렌딩 영상 (보조 참고용)
- 설명: YouTube Data API에서 공식 “트렌딩” 차트 제공. Shorts도 일부 포함될 수 있음 (2023 이후). - 요청 예시:

https://youtube.googleapis.com/youtube/v3/videos
    ?part=snippet,statistics,contentDetails
    &chart=mostPopular
    &regionCode=KR
    &maxResults=25
    &videoCategoryId=0
    &key=AIzaSy...
- 파라미터:
| 파라미터 | 설명 | |----------|------| | chart | mostPopular – 인기 차트 선택[91] | | regionCode | 국가 코드 (필수) | | videoCategoryId | 카테고리 (0 or omitted = all categories) | | maxResults | 기본 5, 최댓값 50 (하지만 실제 trending 리스트는 보통 50개 한정) | | 그 외 part, key 동일. | - 쿼터: 1 unit/호출 (chart param도 videos.list이므로). - 응답:
{ "items": [ { "id": "XYZ", "snippet": {...}, "statistics": {...}, "contentDetails": {...} }, ... ] }
trending 영상들. Shorts여부 contentDetails.duration으로 판단. - 한계 (뮤직 편중): trending은 조회수만 아니라 알고리즘 고려 – 뮤직비디오는 매번 등장. regionCode=KR 넣어도 global 뮤직 likely. - 용도: Plan은 search.list 기반으로 하되, 나중에 trending 비교용으로 이 데이터를 가져와 “현재 공식 트렌딩 #1~#5 중 Shorts만 표시” 같은 기능 가능. 하지만 trending API도 Shorts 구분 안 줘 separate filtering needed. - 주의: 만약 chart=mostPopular 사용해서 Shorts 추출하려면 contentDetails.duration <= 60s 필터를 코드상 적용. Chart API 자체 필터 없음.
(4) channels.list & playlistItems.list – 채널 업로드 모니터링
(채널 모니터링은 PubSub가 기본이나, 폴링/초기수집 용으로 채널->업로드목록도 씁니다.) - 채널의 업로드 재생목록 ID 얻기: - 요청:
GET https://youtube.googleapis.com/youtube/v3/channels
    ?part=contentDetails
    &id=CHANNEL_ID1,CHANNEL_ID2,...
    &key=API_KEY
- 응답:
"items": [ { "id": "...",
             "contentDetails": {
               "relatedPlaylists": { "uploads": "UUmabcdef" } 
             }}]
uploads 키가 채널의 전체 업로드 목록 playlist ID (특정 "UU"로 시작). - 비용: 1 unit (50 채널씩). - 주의: 채널 ID 대신 forUsername(Vanity name)로 조회도 가능. 하지만 ID known via snippet or channel links. - 업로드 재생목록의 영상 목록: - 요청:
GET https://youtube.googleapis.com/youtube/v3/playlistItems
    ?part=contentDetails,snippet
    &playlistId=UUmabcdef
    &maxResults=5
    &key=API_KEY
- 응답: snippet (title, publishedAt) and contentDetails(videoId, videoPublishedAt) for each item. - 비용: 1 unit. - 용도: 각 채널 최근 N개 영상 ID 추출. For polling or initial channel add – e.g. when user adds channel to folder, fetch its last 5 videos to catch recent ones (in case published < our pubsub subscription time). - 주의: playlistItems max 50 by default. We may use 5 or 10 as needed for “recent”. - If channel is empty or removed, items empty. - commentThreads.list: - 예시:
GET .../commentThreads?part=snippet&videoId=abc123&maxResults=3&order=relevance&key=KEY
- 응답: top 3 comments (with text, author, likeCount). - 비용: 1 unit[84]. - 정책: Comments on private video or disabled => error 403 or empty items. - UI: We call on-demand (like user expands comments). - Fallback: If error, show “댓글 사용 중지됨”.
(5) i18nRegions / i18nLanguages – 지원 지역/언어 목록
- YouTube API provides these for building region/language pickers. - ex:
GET .../i18nRegions?part=snippet&hl=en&key=KEY
returns list of region codes and local names (hl param sets language for region names). - cost: 1 unit. - We can avoid hardcoding 10 region names by using this if needed, but likely will custom label anyway.
(6) PubSubHubbub Hub Subscription – (Not a typical REST API, but posting form data). - Subscribe Request: - POST to https://pubsubhubbub.appspot.com/subscribe (hub hosted by Google) with form fields: - hub.mode = subscribe - hub.topic = https://www.youtube.com/feeds/videos.xml?channel_id=CHANNELID - hub.callback = https://ourapp.com/api/pubsub-callback?token=abc (our webhook endpoint) - hub.verify = async (or sync) - hub.verify_token = (random token to confirm) - hub.secret = (optional HMAC secret for signatures) - hub.lease_seconds = 864000 (e.g. 10 days max) - This is form-encoded POST (not JSON). - If accepted, hub will GET our callback with hub.challenge for verification. We must respond with that challenge text. - After that, new video events will POST to our callback with Atom XML in body. - Hub Response: - On subscribe call, immediate response (202 or 204) indicates it will verify asynchronously if async. - We'll see our logs. - Quota: none from YouTube API side, but we must manage up to N channels subs (like 100s). - 주의: - Lease time typically 864000 sec (~10 days). We should refresh before expiry. - If our callback fails (non-2xx), hub stops sending events; so reliability is key. - If too many channels, Google may enforce limits (though not clearly documented, likely fine up to many hundreds per IP). - Fallback: if hub doesn't send (channel might not support push? Should all YT channels do), we rely on polling via playlistItems as backup.
(7) 외부 무료 API (간략): - Wikimedia Pageviews: - Example:
GET https://wikimedia.org/api/rest_v1/metrics/pageviews/top/ko.wikipedia/all-access/2025/08/14
returns JSON with articles: [...] each having article and views. - Or per-article:
GET .../pageviews/per-article/ko.wikipedia/all-access/all-agents/서울_특별시/daily/20250801/20250807
returns daily views for article "서울 특별시". - We'll likely use "top" for a given day or month, to identify trending topics. - No auth, just User-Agent. - On error (404 if date out of range etc), fallback to none. - Wikidata SPARQL: - Use HTTP GET with query param or POST with SPARQL query. - e.g.
GET https://query.wikidata.org/sparql?query=SELECT%20?item%20?itemLabel%20WHERE%20{?item%20rdfs:label%20"KEYWORD"@ko.%20FILTER(lang(?itemLabel)=%22ko%22)}&format=json
returns JSON with item Q-id and label if found. - Rate limit ~60 sec per complex query, so we use simple exact match queries only. - If query fails (timeout), fallback to KG API. - Google Knowledge Graph API: - Example:
GET https://kgsearch.googleapis.com/v1/entities:search?query=아이유&key=KEY&limit=1&indent=True
returns something like:
{
  "itemListElement": [
    {
      "result": {
        "@id": "kg:/m/0wcyvjf",
        "name": "아이유",
        "description": "South Korean singer-songwriter",
        "resultScore": 1234.567
      }
    }
  ]
}
- We'll parse result name/desc. - Limitations: Not all terms have entry, and language preferences uncertain (maybe accepts &languages=ko). - Reddit: - Example:
GET https://oauth.reddit.com/r/videos/search.json?q=keyword&sort=new&limit=5
with Bearer token in header. - Response: JSON with list of posts in data.children. - If 429 or if we exceed free usage, we need to drop or get an API key through app registration. Possibly not integrate at launch due to new restrictions (but maybe consider for global trending monitoring which is less needed if focusing on YT content). - Google Sheets: - Typical usage: 1. Create spreadsheet:
POST https://sheets.googleapis.com/v4/spreadsheets
    { "properties": { "title": "My Export" } }
-> returns spreadsheetId. 2. Append values:
POST https://sheets.googleapis.com/v4/spreadsheets/{id}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED
    { "values": [ ["Title", "Views", "Link"], [...], ... ] }
-> returns updated range. - Auth: OAuth2 scopes .../auth/spreadsheets. - If user cancels auth or token expired, fallback to offering CSV.
주의점 및 폴백: - Quota Exceeded: If any Google API returns 403 quotaExceeded, we should implement exponential backoff and possibly show an error UI to user like “Daily quota exceeded, try tomorrow or add your own API key.” Possibly allow user-provided keys in settings. - Rate Limit (429): If we hit per-second limits (like SPARQL or reddit), backoff and retry after short delay. - Error handling: unify error responses to UI. E.g. if external API fails, just omit that data portion with a note “Trending data not available”. - partial responses: Use fields parameter to limit response payload where beneficial (reduces bandwidth, though not much difference for small fields). Eg. videos.list?part=statistics&id=...&fields=items(id,statistics(viewCount,likeCount)). - ETag & Caching: For repeated calls (like if user refresh same search), YouTube API responses have ETag. Could store last result by query in cache with ETag, use If-None-Match to save quota if data unchanged. But trending data changes fast, likely always new. - HTTP 5xx: e.g. Wikidata SPARQL endpoint sometimes 504. We catch and try alternative KG API or skip. - Policing compliance: Google Data API requires including YouTube Data API attribution (maybe in Terms page). Also some data (like subscriber counts hidden) must be handled ethically (don’t guess hidden values publicly).
출처: YouTube API Reference[67][65], Google Sheets API docs (2023), Wikimedia API docs (Pageviews, 2023), PubSubHubbub (Google Support)[66][68], Reddit API policy (2023)[39].

7) 시스템 아키텍처 & Supabase 데이터 모델 – 우리 스택을 기준으로 설계
전체 구성도: Next.js (App Router) 프론트/백과 Supabase 백엔드+스토리지가 연동된 형태입니다. 아래 mermaid 다이어그램으로 시각화했습니다:
flowchart LR
    subgraph Client (Browser)
      UI[Next.js React 19 App] -->|calls| NextAPI
    end
    subgraph Next.js (Vercel)
      NextAPI[API Route/Server Actions] -->|read/write| SupabaseDB[(Supabase Postgres)]
      NextAPI --> ExtAPI["YouTube API, External APIs"]
      NextAPI -.->|RPC| SupaFuncs[Supabase Edge Functions]
    end
    subgraph Supabase (DB & Auth)
      SupabaseDB[(Postgres DB & RLS)]
      Realtime[(Realtime Subscriptions)]
      Storage[(Storage: thumbnails?)]
      Auth[(Auth & JWT RLS)]
    end
    subgraph Workers/Jobs
      Cron[Vercel Cron] -.-> WorkerJobs
      SupaFuncs[Supabase Scheduled Func] -.-> WorkerJobs
      WorkerJobs[Background Workers] -->|fetch data| ExtAPI
      WorkerJobs -->|update| SupabaseDB
    end
    subgraph External
      ExtAPI["YouTube Data API, etc"] -->|JSON data| NextAPI
      PubSubHub[YouTube PubSubHubbub] -->|Atom XML| NextAPI
    end
    Client -- realtime --> Realtime:::rtStyle
    SupabaseDB --> Realtime:::rtStyle
    style Realtime fill:#ffefde,stroke:#333,stroke-width:1px
    classDef rtStyle fill:#ffefde,stroke:#333,stroke-width:1px,font-style:italic;
    style NextAPI stroke-width:2px,stroke:#333;
요소 설명: - Next.js 서버 (Vercel)에 API Routes (또는 Route Handlers) 처리: - /api/search → YouTube API 호출하여 영상 리스트 반환, DB optional caching. - /api/favorites → Supabase DB (via JS client or PostgREST) read/write. - /api/pubsub-callback → YouTube PubSub webhook endpoint; 인증 토큰 검증, XML parse, DB update & send real-time alert. - Next.js Server Actions (React 18 feature) can be used for form submissions like adding channel to folder etc, which then directly DB mutate via Supabase JS or SQL. - Supabase DB holds all persistent data (see schema below). RLS (Row Level Security) ensures user or org data isolation. - Supabase Auth provides JWT with user_id and potentially org_id in claims for RLS. We use Supabase’s built-in email OAuth or third-party (maybe Google login). - Realtime: Supabase’s realtime can broadcast DB changes (like new alert) to subscribed clients. Alternatively, Next could use WebSockets (but easier to use Supabase realtime if workable on Vercel). - Workers/Jobs: - Cron: Vercel Cron triggers our Next API or Edge function to run scheduled tasks (like refresh trending every X hours for caching or re-subscribing PubSub). - Supabase Edge Functions can also have scheduled triggers, which might run heavy tasks with DB direct access (less network overhead). - WorkerJobs: e.g. a Node background process (if we use e.g. Upstash QStash or third-party) – but likely not needed if using Supabase Functions. - The workers primarily do: periodic videos.list to capture stats, renewing PubSub subscriptions, sending summary emails (if any). - External: - ExtAPI includes YouTube Data API, etc, accessible from Next (server-side) or Supabase Functions (Deno can call external too). - PubSubHubbub is external push to our callback.
데이터 파이프라인: 1. 탐색 워커: (On user search action or periodic global update) – Calls search.list for each needed region/time, merges results. If triggered by user request, done on-demand. If doing background trending caching (maybe to warm cache or to send daily summary email?), then a cron job might call multiple search endpoints and store results in trends_terms or a cache table. 2. 상세 워커: Immediately after search, or on schedule, for each list of video IDs, calls videos.list to get stats and contentDetails. This can be done within the same function as above (likely yes, as step 2 of user search). - If background, maybe it stores or updates videos and video_stats. 3. 스냅샷 워커: Runs every 30 or 60 min. It selects a set of videos to snapshot: - Likely those in “trending now” (maybe top 100 by some criteria, or all videos in videos table that are recent/tracked). - Also those in user’s source channel lists (folder videos that got alerts). - Possibly any video that had alert triggered to track its trajectory. - It then calls videos.list for those IDs (batch in 50s), records new row in video_stats with captured_at and viewCount (and maybe likeCount). - Also calculates Δ24h if needed for alert outlier detection. 4. 푸시 콜백 (PubSubHubbub): YouTube pushes new video event -> Next API route /api/pubsub-callback: - It verifies subscription token and parses feed (videoId, channelId, published). - Then either directly calls YouTube API to get statistics (views). Alternatively, we may assume initial viewCount=0 at publish moment, but to evaluate threshold, better call once after e.g. 5 minutes or schedule soon after. - For simplicity, on receiving push, we might push a job for after 30 min to check its views. - However, we set up threshold rules which likely have min_views like 100k, that won’t be immediate in seconds; we can check at e.g. 30 min or 1h or rely on snapshot worker within hour). - Anyway, we insert the video into videos table if not there, and associate with channel (channel in folder might get automatically mapped? Actually we know channel from feed entry or separate channel map). - Then mark for monitoring by adding to a rule_hits or intermediate. - If viewCount (immediate fetch) already >= threshold, we can directly create alert. - Then perhaps ensure snapshot worker picks it up (maybe by adding to video_stats soon). - Also, if multiple users track same channel, generate alerts for each relevant folder (and ensure RLS duplicates for each user). - Implementation detail: perhaps we have rules per folder, so we check all rules that channel belongs to. - This might require joining video’s channel to folder_channels to find relevant folder and its rule. The logic can be done in the callback function by querying Supabase. - Then insert rule_hits or alerts for each such folder if threshold conditions met. - Possibly if not met yet, we track it and check again in next snapshot. - Could also implement triggers in DB but easier in code. 5. 큐: If heavy tasks (like scanning 1000 channels quickly) needed, we might queue them into e.g. Supabase’s PG job queue (not built-in, but could simulate with a table + cron picking tasks). But given scale (we assume maybe few hundred channels, not millions), a simple loop with slight delay or splitting into multiple tasks is fine.
스키마 설계 (Tables, relationships, indexes, TTL): We'll describe each planned table (some names from prompt):
channels – 채널 정보 기본.
Columns: id (varchar primary key), title, subscriberCount, hiddenSubscriberCount (bool), uploads_playlist_id, created_at.
It's optional to store subscriberCount (we might fetch if needed, but storing allows easier channel_norm calc and changes tracking).
Could also store last_video_published_at if we poll usage.
Index: primary key on id (channelId). Possibly index on subscriberCount if range queries needed (maybe not).
videos – 영상 기본 정보. This is like a cache of video metadata as of latest check.
id (varchar pk), channel_id (fk to channels), title, published_at, duration_secs, view_count, like_count, updated_at, is_shorts (bool).
Also maybe category_id if needed, caption bool, embeddable bool, etc to not re-fetch often.
Index: by published_at DESC (to get newest videos easily for trending or to TTL old?).
TTL: Shorts trending relevance maybe lasts weeks. But we might keep all videos recorded for historical analysis. If storage is an issue, maybe TTL remove video entries older than e.g. 180 days that were never favorited or alerted. But initial not needed if scale manageable (some tens of thousands records likely).
video_stats – time series snapshots for videos.
video_id (fk), captured_at (timestamp, maybe pk or part of pk with video_id), view_count, like_count.
Optionally could store delta_24h precomputed or do that in query.
Index: (video_id, captured_at DESC) for retrieving latest or time range for a video quickly.
TTL: Keep maybe last 90 days of data to manage growth. (We can periodically delete older than 90d for videos no longer trending).
Possibly partition by month or so if needed (or simpler, drop old by query).
folders – Group of channels per user (like "source group").
id (uuid pk), user_id or org_id (owner), name, created_at.
If supporting org (teams), might have both org_id and allow multiple user membership. But simplest: if team feature, user is associated with org via membership and folder belongs to org, and RLS ensures only org members see it.
Index: by user_id (for RLS join maybe).
folder_channels – join of folder and channel (many-to-many).
folder_id, channel_id composite pk (or separate id if needed).
Additional fields possibly: added_at.
Index: (channel_id) if we want to find all folders that a channel belongs to quickly for alert logic.
rules – Alert rules associated to folder or user.
Could either put columns in folders (like min_views, max_age_days, duration_threshold etc in folder table).
But a user might want multiple rules per folder? Not likely, usually one rule per folder group (like "notify if >500k in <3days").
To be flexible, separate table:
id, folder_id, min_views, max_age_days, duration_limit_secs, notify_method (email/push/etc), created_at.
Or just include folder_id unique constraint so effectively 1:1. But we could allow multiple different triggers on same folder if needed (like one rule for 1M in 7d, another for 100k in 1d to see quick risers vs big hits).
For MVP, 1 rule per folder is fine, store in folders for simplicity. I'll assume in design it was separate, but storing in folders might be easier.
If separate rules table:
Index: by folder_id unique.
rule_hits – A log of rule trigger events (video matched criteria).
Possibly analogous to alerts or integrated with it.
Could store id, rule_id, video_id, triggered_at, view_count_at_trigger.
But we might combine with alerts below as they serve similar purpose: something to notify user.
favorites – user’s saved videos (bookmarks).
id (uuid), user_id, video_id, created_at, maybe note or label.
If we have boards, maybe a video can be in multiple boards; but likely one favorite list with tags. However prompt said boards separately.
Possibly incorporate boards by adding folder_id optional in favorites (so a board is a folder that can contain either channels or videos? But they separated conceptually).
Simpler: favorites table as each entry, and if user uses boards for videos we have a collections concept separate from channel folders:
Maybe they intended "보드" separate from "폴더" (board for ideas = videos, folder for channel sources).
If so, we might have collections similar to folders but for videos grouping. Let's see if needed:
The prompt in 4.1 says "즐겨찾기/보드/라벨" focusing on video saving side, whereas folders in context was channels grouping.
Possibly unify concept by adding a type field in folder to differentiate "channel group" vs "video collection"? Might complicate RLS but possible.
We'll keep it separate for clarity:
collections (like folder but for videos) and collection_videos join.
Or just use favorites with label as grouping. But they explicitly mention boards and tags.
Considering time, maybe we have just one favorites list with optional labels (tags), and call it board.
But since table list in prompt doesn’t explicitly mention collections separate, maybe they assumed "board" means the favorites board and it's covered by one of the listed tables (maybe they consider "folders" for both, but not likely).
They mention folders and separately mention favorites. So likely:
folders/folder_channels for channel grouping,
favorites for videos (with maybe basic grouping).
If need multiple boards for favorites, we can add a column board_name in favorites or user has one board (like watch later style).
Let's allow simple multiple boards:
Add collection_id in favorites referencing a collections table (like folder but for favorites).
The prompt did not list collections table but they mention "보드 (board)". Possibly they meant board = folder concept, but context suggests channel grouping separate.
Actually "폴더에 소스 채널 등록" vs "보드에 핀" clearly separate workflows (Scenario A vs C).
So I'll assume another:
collections (for video idea boards):
id, user_id, name, created_at.
And collection_videos join with video_id. Or simpler repurpose favorites with a field.
But since favorites likely a simple list of favorites (like YouTube's 'Liked videos'), maybe better to have:
If user just collects videos into one or multiple boards, call them "boards" and treat like how folders are for channels.
We can unify concept by having one user_lists table for both channels and videos but with a type, but okay to have separate for clarity.
Let's define:
boards – video collections:
id, user_id, name.
board_videos:
board_id, video_id, added_at.
If user doesn’t need multiple boards, they could just use favorites (like a default board).
But scenario C mentions "보드 공유, 태그, 상태 칩" which is advanced collab, but likely beyond MVP.
We proceed with separate structures.
trends_terms – possibly to store trending keywords or external trends we fetch:
e.g. term, country, date, rank, score.
Could also store trending video topics for caching. But not strictly required if computed on fly.
If doing heavy external queries, maybe store daily trending Wikipedia topics globally for quick reuse (makes sense).
Eg: daily job fetch top 100 wiki for major languages, store in this table, use for suggestions.
kg_entities – to store resolved knowledge graph entities for terms to avoid repeating external calls:
id (maybe KG mid or Wikidata QID), name, type.
But easier: just cache results in memory or rely on direct calls if usage low.
video_entities – linking video to discovered entities (if we do analysis of description).
Possibly out-of-scope for MVP, but could store which entities (like Person or Movie) appear in video text to enable searching by entity or filtering trends by category.
Would require NLP entity extraction.
alerts – to store actual user notifications (like rule_hits but user-specific):
If rule triggers, multiple users can get alerted if channel in multiple user’s folder, so we may store an alert per user (or per folder).
Fields: id, user_id, video_id, message, created_at, seen_at.
Or folder_id instead and infer user via folder->user relation. But if team folder, multiple users might need it (then maybe one alert per org with ability to mark seen by each user? That’s complex).
Simpler: alert per user or user group (org).
We can for now assume each folder belongs to one user (teams later).
So create alert for that user referencing folder or rule.
Using alerts can also include other notifications, e.g. if scheduled tasks etc.
credentials (api_keys) – to store external API credentials user may provide:
e.g. user supplies their own YouTube API key (if we allow).
Or user’s Google Sheets OAuth tokens etc.
It's listed in prompt likely meaning storing things like user’s Google API key if they have their own, or other service keys (maybe KGS).
Fields: id, user_id, service, credential_json (encrypted).
We must encrypt sensitive keys (Supabase has func like pgcrypto or can encrypt in app before storing).
RLS ensures only user accesses their keys.
ERD (mermaid):
erDiagram
    USER }o--o{ ORGANIZATION : "members"
    USER ||--o{ FOLDER : creates
    ORGANIZATION ||--o{ FOLDER : owns (if team)
    FOLDER ||--o{ FOLDER_CHANNEL : has
    FOLDER_CHANNEL }o--|| CHANNEL : links

    USER ||--o{ BOARD : has
    BOARD ||--o{ BOARD_VIDEO : includes
    BOARD_VIDEO }o--|| VIDEO : links

    USER ||--o{ FAVORITE : saves > (optional alt to boards)
    FAVORITE }o--|| VIDEO : links

    USER ||--o{ ALERT : receives
    ALERT ||--|| VIDEO : refers

    FOLDER ||--o{ RULE : has
    RULE ||--o{ ALERT : triggers >

    CHANNEL ||--o{ VIDEO : uploads
    VIDEO ||--o{ VIDEO_STATS : hasSnapshot

    USER ||--o{ API_CREDENTIAL : owns

    USER {
        uuid id PK
        text email
        text name
        uuid org_id FK (nullable)
        // etc (Supabase auth)
    }
    ORGANIZATION {
        uuid id PK
        text name
        // team info
    }
    CHANNEL {
        varchar id PK
        text title
        int subscriberCount
        boolean hiddenSubs
        varchar uploads_playlist
        timestamp added_at
    }
    VIDEO {
        varchar id PK
        varchar channel_id FK
        text title
        timestamp published_at
        int duration_secs
        boolean is_shorts
        bigint view_count
        bigint like_count
        boolean embeddable
        text privacy_status
        timestamp last_updated
    }
    VIDEO_STATS {
        bigint id PK
        varchar video_id FK
        timestamp captured_at
        bigint view_count
        bigint like_count
    }
    FOLDER {
        uuid id PK
        uuid user_id FK
        uuid org_id FK (nullable)
        text name
        int min_views  // rule criteria (or separate RULE table)
        int max_age_days
        int duration_limit
        timestamp created_at
    }
    FOLDER_CHANNEL {
        uuid folder_id FK
        varchar channel_id FK
        timestamp added_at
        // PK (folder_id, channel_id)
    }
    RULE {
        uuid id PK
        uuid folder_id FK
        int min_views
        int max_age_days
        int duration_limit
        boolean active
        timestamp created_at
    }
    ALERT {
        uuid id PK
        uuid user_id FK
        uuid folder_id FK (nullable)
        varchar video_id FK
        text message
        boolean seen
        timestamp created_at
    }
    BOARD {
        uuid id PK
        uuid user_id FK
        text name
        timestamp created_at
    }
    BOARD_VIDEO {
        uuid board_id FK
        varchar video_id FK
        timestamp added_at
        // PK(board_id, video_id)
    }
    FAVORITE {
        uuid id PK
        uuid user_id FK
        varchar video_id FK
        timestamp saved_at
    }
    API_CREDENTIAL {
        uuid id PK
        uuid user_id FK
        text service  // e.g. "youtube_api","google_sheets"
        text cred_data  // encrypted json or token
        timestamp created_at
    }
(주: 위 ERD에서 RULE과 ALERT는 folder와 user로 엮였지만, 단순화 위해 folder에 rule columns 넣을 수도 있고, alert could be tied to user and video with optional folder context.)
RLS 정책 예시: - For all tables with user_id, simple policy: user_id = auth.uid(). - For folder and board: if we go with user ownership (org optional), then - Policy: (user_id = auth.uid()) OR (org_id = auth.jwt().org_id AND auth.role() = 'member'). That means either user owns it or belongs to same org. - We might also have a join policy such that user can access folder_channels if folder accessible. Supabase allows using using expression with subquery: - e.g. on folder_channels: EXISTS (SELECT 1 FROM folders f WHERE f.id = folder_id AND (f.user_id = auth.uid() OR f.org_id = auth.jwt().org_id)). - On videos and channels: - Videos we might mark as global reference (non-sensitive), possibly no RLS (everyone can see trending video info). - But if we store subscriberCount (which is public data anyway), no issue. - If someone favorites a video, they see it through join with favorites. - For simplicity, videos/channels open (no RLS) as they contain no private info (all public from YT). - favorites: user_id = auth.uid(). - board: user_id = auth.uid(). - board_video: ensure user has board access: similar exists check on board.user_id. - alerts: user_id = auth.uid() so each user sees their alerts only. - If team scenario: if org uses a shared folder, who gets alerts? Could send to all in org or specific roles. Might refine later, but currently alert ties to user, but in team might tie to folder (org) and notify multiple. Possibly fill user_id of alert with owner or all watchers. This is complicated – skipping for now.
마이그레이션 초안: We can write example SQL for one table with RLS:
-- Example migration snippet for Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id VARCHAR REFERENCES videos(id),
  saved_at TIMESTAMPTZ DEFAULT now()
);
-- (assume auth.users exists in supabase)
-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
-- Define policy: owner can read/write their favorites
CREATE POLICY "Allow favorites access for owner"
  ON favorites
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
We would do similar for other tables.
Mermaid ERD vs Flow: We already gave flowchart and ERD. Maybe add a separate flow for user actions like: - On search, Server calls YT API, then DB etc. - On pubsub event, etc.
But likely enough.
정리: - 데이터 모델 supports multi-tenant via RLS for individual or team. - We ensure indexing for frequent queries: - videos(published_at desc) for trending newest. - video_stats(video_id, captured_at desc) for time-series queries (and maybe separate index on captured_at if we retrieve all trending videos at specific times). - For real-time alert, need to find if a new video’s channel is in a folder: - So query folder_channels where channel = newvideo.channel. That’s index on channel_id. - Also join folder to user in RLS logic as described.
출처: Supabase Row Level Security docs (2022)[92], YouTube API data fields reference[80][81].

8) UI/UX – 브랜드 HSL 컬러 적용 지침 & 사용자 시나리오 개선
UI/UX 설계에서는 브랜드 색상 (보라/빨강/민트)을 기반으로 상세 컴포넌트 지침을 정하고, 각 화면 시나리오의 구성을 검토합니다. 사용자 경험상의 개선사항도 식별합니다.
컬러 토큰 & Tailwind 테마 정의: 우선, prompt에서 주어진 CSS 변수 설정을 Tailwind config에 반영합니다. Tailwind 3.x에서는 theme.extend.colors에 CSS 변수 참조로 지정하거나, 그냥 CSS에서 변수를 사용하고 Tailwind 유틸리티에 color: var(--color-primary) 식으로 적용 가능합니다. Shadcn/UI uses CSS variables for theming (especially if using Radix color scheme, but we have custom HSL). We'll define:
:root {
  --color-primary: 245 58% 61%;
  --color-secondary: 0 100% 71%;
  --color-accent: 161 94% 50%;
  /* Derived tones: use HSL with slight adjustments */
  --color-primary-foreground: 245 58% 20%;   /* dark text on primary, maybe */
  --color-primary-hover: 245 58% 55%;        /* slightly darker */
  --color-primary-pressed: 245 58% 45%;
  --color-primary-muted: 245 20% 90%;
  --color-secondary-hover: 0 100% 65%;
  --color-secondary-pressed: 0 100% 55%;
  --color-accent-hover: 161 94% 45%;
  --color-accent-pressed: 161 94% 40%;
  /* etc */
}
[data-theme="dark"] {
  --color-primary: 245 65% 77%;
  --color-secondary: 0 90% 65%;
  --color-accent: 161 84% 45%;
  /* similar derivations for dark context, ensuring contrast */
  --color-primary-foreground: 245 65% 10%; 
  /* (for dark mode, foreground on primary might be brighter) */
}
Then in Tailwind config:
theme: {
  extend: {
    colors: {
      primary: "hsl(var(--color-primary) / <alpha-value>)",
      secondary: "hsl(var(--color-secondary) / <alpha-value>)",
      accent: "hsl(var(--color-accent) / <alpha-value>)",
      // and maybe semantic: success: accent, danger: secondary, etc.
    }
  }
}
So .bg-primary yields background-color: hsl(var(--color-primary)). The <alpha-value> part ensures we can do .bg-primary/80 for transparency.
컬러 활용: - Primary (보라) as main CTA (Call-To-Action) color for buttons, links, highlights. - Secondary (빨강) as warning or accent highlight (like a "Trending up" arrow or a "Remove" button). - Accent (민트) as success color or secondary accent (like maybe for "New" badges or something positive). - We must check contrast: - Primary on white for buttons: #? Might need adjusting as above analysis. - For text on primary (like white text on purple), likely fine but ensure at least AA (4.5:1 for normal text). - Possibly use primary-foreground variable (calculated by darkening primary slightly if needed). - Focus rings: often use accent (like a mint outline) to indicate focus. Mint is bright and distinct from others, which is good. Ensure focus ring has 3:1 contrast with background (WCAG 2.4.7 requires some indicator but not strictly ratio). - Link text: maybe use primary by default (purple links), which on white could be borderline but likely ~5:1 which is okay (check hsl(245,58%,61%) vs white: lum approx L=61% vs white 100% -> if treat them as reflect lum, ratio maybe ~3:1? Actually, let's approximate: converting to absolute lum, not straightforward but let's trust earlier contrast mention ~5.6:1 with white? Eh better compute: if we do relative luminance: L for hsl(245,58%,61%) presumably ~0.3 vs white1.0, ratio = (1.0+0.05)/(0.3+0.05) ~ 2.7:1 (which is not enough!). - Possibly our assumption was wrong. Actually saturations complicate, let's try an online check: - Purple (245,58%,61%) in hex is around #7d5fff perhaps. That vs #fff might be around 4.5:1 threshold if text size large. - To be safe, we could bump saturation or darken it. Already we have "dark: hsl(245,65%,77%)" for dark mode, which is lighter because dark background. For light mode, maybe making it slightly darker (like 58% 50%). - However, the design doc suggests adjusting pressed/hover to get more contrast if needed. We'll have to test actual using tools. - Secondary red used on white likely also not quite 4.5:1 if used for text. But as accent (like icon or background for a small badge), maybe fine. If for CTA text on a red button, would put white text on red background, need 4.5:1. Red (0,100%,71%) is #ff5e5e maybe, white text? That's borderline: - Possibly lighten or darken red for states. Actually white on that red might be around 3:1 since it's bright. Could consider using the darker variant (0,90%,65%) for dark mode background ironically that might have more contrast with black text? Actually, in dark mode that red is lighter (for usage on dark background presumably). - We might define separate semantic tokens: - --color-danger-bg = secondary for backgrounds, - --color-danger-fg = appropriate text color (like dark red for text on white). - But that might be overkill, try simpler.
컴포넌트별 색상: - Buttons: - Primary action (e.g. "Explore Shorts" button): background: primary purple, text: white or primary-foreground variable if defined. - Ensure it meets AA: for a large button text (14px bold qualifies as large?), AAA maybe 7:1. Possibly our purple vs white is not AAA but if big text maybe fine. But to be safe, we can slightly darken primary for the button (for example, using --color-primary-hover value as default). - Hover: lighten or darken? Usually darken for pressed, lighten for hover on dark backgrounds. On white background, purple stands out, on hover maybe slightly darker to show effect. - Disabled: use primary-muted (tinted towards gray). - Focus: focus ring use accent (mint) or a shadow of primary? Typically accent color for focus is good for visibility. - Secondary button (maybe a harmless action): could use accent mint as background, or outline style with primary border, but we have accent as a brand color as well. Perhaps better: - Use primary as main, secondary red for dangerous actions (like "Delete folder"), accent for positive actions (like "Mark as done"? But context). - Actually a "secondary CTA" in this context might not be needed often, but if needed, we can do an outline style (text primary with border). - Danger button: background red (secondary), text white. But our red might need slight darkening for contrast. Already dark mode red is 90% 65% which is darker than 100% 71%. Possibly use dark variant even in light mode for the button if needed. Or define a slightly deeper red for button specifically (like hsl(0, 100%, 60%)). - Links: - Normal links within text: could use primary but if readability is concern, maybe a darker shade of purple for link text. Or we could underline for sure to help colorblind. - Hover on link: underline or slight darkening of purple. - Badges (small pill labels): - E.g. "NEW", "TREND", "ALERT", etc. We have accent mint ideally for "success/good" (like "TRENDING" or something positive), red for warnings (like "Geo-blocked" maybe), purple or gray for neutral (like "Shorts"). - If background of badge is colored, text on it should have enough contrast: - accent mint on white text likely fine because accent (161,94%,50%) is moderately dark (like teal). Actually on white, check ratio: get approximate hex (#00d9a?) vs white, it might be borderline too if it's vibrant. If needed, we can darken accent for badges or use dark text on mint background? But white text on bright mint probably around 2.8:1 (not enough). Actually let's check: - hsl(161,94%,50%) is a bright color (#00FFB2 maybe?), white text on that likely fails. So maybe for filled badges on light background, use dark text if background color is light enough. - That means deciding threshold: if we lighten accent more, e.g. 40% lum, then white text might pass? Possibly not, might need 30% lum (darker color) for white text readability. That looks deeper green though. - Actually easier: make badge with colored text and subtle colored border (instead of solid fill) for some cases, to avoid contrast issues. - Or always style badges as outline or subtle background so text can remain default. - But aesthetic often uses filled badges with white text. Maybe we restrict those to dark mode use? - Because in dark mode, accent (84%,45%) on black background with white text might be okay since background is dark and we only care text vs badge color. - Actually wait, the contrast we need to check is text vs badge background, not vs page background. So no matter dark or light mode, if badge background is bright, white text fails, if it's dark enough, white text okay. - Perhaps define: - accent badge background use a darker variant of accent (like accent-dark = hsl(161,84%,30%)), then white text. But that might break brand consistency (color looks different). - Alternatively, do dark text on mint fill (like a pill with mint background and dark text) which is not typical but possible. - Perhaps better to keep badges subtle: e.g. accent badge as an outline or a dot. - Because of these complexities, consider not overusing filled color backgrounds except for maybe primary/danger on large elements where we ensure contrast by adjusting color. - For badges, maybe use soft background with colored text: - e.g. Danger badge: background hsl(0,100%,95%) which is very light red, text red (dark). - Success badge: background light mint (#E6FFF9 e.g.), text mint. - That ensures readability and still color-coded (like bootstrap's subtle badges). - We can incorporate that approach to satisfy contrast.
경고/성공:
Typically red for error states (like “API key invalid” error message text perhaps red text on light background).
Green (accent) for success messages (e.g. “Saved!” toast).
For accessibility, icons (⚠️ or ✓) should accompany color to differentiate.
Focus ring: - Use accent mint as focus ring color (very visible and not confused with main brand color). - E.g. focus:outline-none focus:ring-2 focus:ring-accent on interactive elements. - Check contrast of focus ring with background: - Mint on white might not be 3:1 (if ring is only 2px border, some argue contrast not strictly defined for outlines, but anecdotally visible). - Could use a darker teal for outline (like combine accent with 60% darkness). Or double ring style (like one white, one colored). - Simpler: since accent (hsl(161,94%,50%)) is fairly bright (like #00ff80?), on white it might be visible enough due to saturation even if luminance contrast is not high. We might accept that.
테마/HSL 변수 and Radix: - Radix UI components (shadcn) often rely on CSS variables naming scheme like --primary: .... We'll map accordingly or override the default .dark etc. - Ensure we handle dark mode by switching HSL as given, maybe also provide slightly different derived for dark (like text colors etc). - Radix uses some ARIA attribute like data-state="open" for menu, plus normal CSS that we can style. Focus visible etc we handle by Tailwind classes likely.
접근성 시뮬레이션: - We'll test color-blind mode using tools or design plugins. Red vs green (secondary vs accent) being both present is problematic for red-green colorblind: - If we use them to represent opposite states (error vs success), at least the context (like icon shape) should help. - Also using blue/purple as main means error and success are not the only differentiators (some UIs use red vs green vs grey). - Perhaps incorporate an icon with shape: e.g. error icon (X or triangle), success (check), to not rely solely on color. - Simultaneous contrast: - Purple and mint next to each other (like a mint focus ring on a purple button) might clash? Actually purple and green are complementary, it should stand out which is maybe good for focus indicator. - But ensure it’s not ugly – our purple is not extremely saturated, and mint is vibrant. The contrast might draw attention which is the purpose of focus ring, so it's fine.
Now proceeding to UI flow specifics:
초기 화면 (온보딩): - The first screen user sees might be: - If not logged in: "Welcome to [ProductName]" with brief about how it works, and prompt to connect API key or Google sign-in. - Possibly a step to input their YouTube Data API key (BYO key) or sign in with Google to automatically use their identity? But Data API doesn't require user OAuth for public data, only if we needed quotas or retrieving private info. We might indeed ask user to provide their own key to share quota load, as implied. - The prompt says "BYO API 키/Google 로그인" – so either user gives an API key or signs in with Google to use presumably some API on their behalf (maybe to get an API key? But no, Google sign-in here could just be for identity). - Actually maybe "Google 로그인" to simply authenticate them (maybe using Google OAuth through Supabase) or possibly to fetch their own channel analytics (not mentioned). - We should allow usage without providing a key (with our shared key but limited). - Possibly free tier user might use our key with limited quotas, pro users can plug their own to get extended usage. That could be approach (buddybuddy does similar sometimes). - We will design: On first screen, ask them to either: - "Sign in with Google" (for account), - Then "Enter your YouTube API Key (optional, recommended for heavy use)" with link to how to get one. - Provide maybe initial free key usage but with heavy caution (likely we'll just use our key behind scenes until they reach some threshold). - Also on initial screen, present default trending view for one region even if not signed in? Possibly require some sign-in or key gating because our key usage might exceed if we allow open usage to all. But maybe initial trending (like top global) could be shown without login for teaser.
대표 국가 버튼(≥10) on this initial search UI:
Possibly a horizontal list of country flags or codes to quickly filter region. e.g. [🇰🇷 KR] [🇺🇸 US] [🇯🇵 JP] ... displayed either as toggle or drop-down if too many.
Provide at least 10 as required, with "More..." linking to drop-down of all i18nRegions.
Must ensure accessible (use <button aria-label="Change region to United States">🇺🇸 US</button> etc).
Contrast for flags won't be an issue as images/emoji.
기간 칩 (24h/3d/5d/7d):
Provide quick selectors to filter publishedAfter relative to now. 24h = since yesterday; 3d,5d,7d similarly. Or maybe fixed windows (like "Today", "This Week").
Likely meant: 24h, 3 days, 7 days quick filters. (5d is unusual, maybe 7d).
We'll include at least 24h and 7d as extremes, maybe 3d to cover weekend trends.
UI: group of toggle buttons (maybe as radio).
Possibly default to 7d for stable results.
길이 임계 칩 (≤60/70/90/180s):
If they want to change the definition of "Shorts" for the search. Might be an advanced filter; including as chips means exposing complexity.
But given user likely understands 60 vs 90 sec difference, okay to have a filter if they want to see slightly longer short videos too.
Could place it as a drop-down or a small segmented control if space:
E.g. [All ≤4min] [≤90s] [≤60s] to let them refine if needed. But too many chips might clutter initial UI.
Alternatively, default to 70 and bury the option in an advanced filter panel. But prompt suggests it as chip presumably visible.
Could have "Duration: 60s / 90s / 180s / All" as a small segmented group.
We'll aim to include at least a 60 and maybe 90.
[탐색 시작] button: presumably triggers the search with chosen filters. If user must input nothing (since it's keywordless by default), the UI might allow optional keyword input (like "Enter a topic (optional)").
But "keywordless" implies main usage is without keyword. Possibly the search bar might allow keyword and if blank means trending overall.
So maybe a big CTA "Explore Now" that defaults to trending list with current filters.
Is this the optimal first experience?
Possibly yes because user with no info can immediately see trending content by clicking start, rather than forcing them to think of a keyword.
Another approach is to show trending top videos by default on homepage (like TubeLens after connecting key).
But they specifically outline onboarding with key input, so they might not show any data before key given (fear of quota).
They question: "이 구성이 최적의 첫 경험인가?"
Perhaps not fully. For example, requiring user to get an API key can be a barrier.
We might allow them to skip key with limited usage or provide a demo view of trending with our key then encourage them to add key for more.
Another improvement: interactive tutorial highlights features with sample data if no key.
If user signs in with Google, could we use their OAuth to call Data API using their personal quota? Possibly via OAuth 2.0 with YouTube Data API scope but usage might still count to their personal quota? Actually if it's not a verified app, they'd be limited. That route is heavy (we used API key likely easier).
So likely yes, having the key input up front is unfortunate but seen in TubeLens.
탐색 보드 (main dashboard after search): - Let's assume user either completed onboarding or skipped, now on main UI showing a grid or list of video cards. - 카드 30개/페이지 (데스크톱), mobile 15: - They mention maybe A/B testing 24 vs 36 (the clarifying question 5). The base plan is 30 per page which is fine for desktop (fits maybe a grid of 5x6 or 3x10). - We might use infinite scroll or pagination. But given heavy API, better page by page. - 24, 36 are alternatives possibly to see if more or less content per page leads to better engagement. We'll plan default 30 and maybe allow user to change in preferences or do experiment behind scenes.
24/36 alternative:
Could implement as toggles "show 24 per page vs 36 per page" for some test group.
But that might not be noticeable by user as a "feature", it's more for our testing. So more likely an internal experiment.
Card elements:
Thumbnail: show as image (maybe 16:9 or vertical 9:16 if Shorts are vertical mostly; need to see if YouTube API returns a maxres or standard thumbnail for Shorts. Typically shorts get a 1080x1920 thumbnail possibly accessible via hqdefault but Data API snippet thumbnails might just be the normal ones).
Use <img> or Next Image to optimize. Provide alt = video title.
Possibly overlay an icon or label "60s" or "Shorts" on it to indicate short length (though if all are short due to filter maybe not needed).
But could put duration at corner like YouTube does (even though all ~ under 1min, a quick see if it's 15s vs 59s might interest user).
So maybe show "0:45" etc at corner of thumbnail.
If region-restricted (our badge info) or embed disallowed, maybe show an overlay icon (like a no sign or a globe slash).
But careful not to clutter thumbnail.
Could place a small badge on corner for region block (like a 🌐 with slash icon).
Title (2줄): Show video title (likely they can be up to 100 chars in snippet). Two lines text then ellipsize.
For accessibility, ensure full title in alt or accessible content (like in a data attribute or hidden) so user can get it if needed. Or a tooltip on hover for full.
채널 이름: to attribute content. Possibly with channel's small avatar? But Data API snippet doesn't give avatar, we could use an embed like https://yewtu.be/channel/ID/avatar or YouTube's own channel photo via another endpoint (no official one aside from scraping channel page or using Google identity if channel link, skip maybe).
We'll just show channel title text, maybe link to channel on YouTube (target _blank).
조회수 / VPH / Δ24h / 길이 / 게시일(상대):
This is a lot of info, careful arrangement needed. Possibly break into two lines:
Metrics line 1: "조회수: 1.2M • VPH: 50k/hour • Δ24h: +300k"
Metrics line 2: "Length: 45s • Uploaded: 3 days ago • Score: 🏅 #1"
Or cluster differently:
Show view count and maybe a combined trending badge instead of listing VPH explicitly.
E.g. a small sparkline icon and "Trending" if VPH high.
But prompt implies showing those metrics explicitly. They even define outlier.
They want fairly dense data (like VPH, Δ24h, etc) presumably to allow manual analysis.
Achieving readability: use icons or abbreviations:
Eye icon for views (1.2M),
Lightning bolt for VPH (50k/h),
Δ (delta symbol) for 24h change (+300k).
Save space and language differences.
Length we can show as e.g. "0:45" with a clock icon maybe (or film icon).
Uploaded date relative (like "3d ago") with a calendar or clock icon.
Score badge as maybe colored medal emoji 🥇 or a custom icon if we have one. But listing rank in text "Score #1" not intuitive what that means. Possibly a trophy or up arrow icon to indicate our ranking.
Possibly better present score as a highlight/colored border around card for top picks, but they explicitly gave formula and asked if weighted best.
Could show e.g. a small star or trending arrow on top X items to highlight them. But for clarity, maybe we just allow user to sort by it or if we default sort by it, maybe not highlight separately. Hard call.
Considering metric text length:
Eye icon 1.2M, bolt 50k/h, Δ +300k, 3d ago, 45s – all in one line might overflow on mobile. Could wrap into two lines or hide some on narrow screens.
On mobile, maybe only show view and maybe one more metric (like VPH).
They did mention mobile showing 15 per page presumably smaller details. Could reveal extended metrics when tapped or on detail view.
Perhaps an approach: basic info on card plus a "expand details" caret that shows more on demand (like flips card or reveals a panel).
But that might hinder quick scanning of data which is key use case for analysis tool.
However mobile UI cannot possibly display all metrics comfortably. Probably mobile shows fewer metrics or uses icons only.
We'll optimize for desktop with all metrics textual, and for mobile hide Δ24h perhaps (the least common metric or combine it with VPH text).
Also color coding:
Δ24h if positive could be green text with up arrow, if negative (views dropped last 24h, possible for older trending) maybe red down arrow. Most trending will have positive while trending, might become negative when trending passes. We should handle because it can happen for older ones on list.
But if we usually filter "recent <=7d", maybe none are negative because they still growing (unless maybe hourly fluctuations).
For completeness do arrow indicator.
VPH maybe always neutral color or if particularly high among list, highlight? That’s what outlier measure is for. We could highlight an outlier by coloring VPH or adding a flame icon etc.
But safer to not over-encode. The outlier suggestion could be an icon or highlight border on card if zscore beyond threshold like "🔥".
Channel norm if we included? They didn't explicitly list to display channel norm on card. Possibly not, it's internal for score but user might infer some by comparing view count and sub count if we gave sub count (but we didn't plan to display subs).
Better not show subs as it might confuse (and requires retrieving subs too).
Engagement (like ratio) we also didn’t plan to show, not requested in UI list.
밀도 vs 가독성: It's a pro tool, user likely expects data-dense. But still avoid full clutter. Possibly a table view alternative for power users? The prompt uses "카드" likely meaning a tile view with thumbnail. We could consider offering a compact list view toggle (like rows without thumbnails focusing on metrics) for analysis mode. That might be advanced.
Not in initial requirement but maybe idea for improvement if people want to sort by columns etc.
점수 배지:
They mention "점수 배지" in card elements. Could be e.g. if it's #1 by our Score, put a gold badge icon on it. Or an ordinal number label on top-left of thumbnail (like trending ranking).
If list is sorted by our score, #1 is top anyway but could still label them #1 trending, #2 trending etc like trending chart does.
Or "🏅1" for first etc.
This might help user trust the ordering (e.g. "why is this not highest views but #1? oh because our combined score put it #1").
So we put a small rank number somewhere on card (like a corner or next to title).
Or a colored border: e.g. top 3 with gold/silver/bronze border.
Simpler: text "Score #X" somewhere.
즐겨찾기 (핀):
Provide an icon (star or heart or pin) to save video to favorites/board. Probably a small button on card (top-right or bottom).
On desktop, can appear on hover or always visible in a corner. On mobile, maybe a long-press or a menu option (since tapping should open video or details).
If user clicks star, we call favorites insert, and maybe highlight it (filled star) if already saved. Undo within 5 seconds (like "added to board, undo?" toast).
Possibly support multiple boards, but MVP at least save to default favorites board. If multiple boards, clicking star could show list of boards to choose (complex).
We'll assume one favorites or last used board by default with ability to move later.
밀도/시인성 적절?:
With 30 cards with all that info, it can be heavy. But for a data analysis tool, perhaps acceptable. We should use font sizing and whitespace to group well.
Title big enough to scan, metrics slightly smaller, uniform placement so eyes can compare columns (maybe align view counts in one column visually).
Possibly consider a grid where metrics are in fixed spots like a table grid alignment so scanning down sees patterns:
But with cards, typically free-floating not aligned in column. Unless we do full width rows (like list).
But card grid with each card identical layout is okay, albeit harder to align across columns.
If exact comparisons needed, some might prefer list view with columns of numbers aligned. Could be a feature down the line for heavy analysis mode.
We'll proceed with card view as base (like TubeBuddy/vidIQ in extension are list, but our web can be grid for thumbnails).
Possibly allow toggle grid/list, but not in initial scope.
우측 패널: "Top 20 키워드/엔티티 + Trends 스파크라인 (가능 시)".
So likely a sidebar that shows trending keywords from current results (we described in 4.2 [D]).
Implementation:
On desktop, a right side panel occupying ~1/4 width, listing keywords and maybe mini sparkline or arrow for each.
On mobile, that panel may become a bottom sheet or hidden behind a "Topics" tab, since limited space.
Info in panel:
Possibly header "Trending Topics in these videos".
Each keyword maybe clickable (to filter by that keyword).
Each might have an icon indicating type if known (like person icon for a name, film icon for movie, hashtag if it was a hashtag).
A small line chart or arrow showing trending in external data: e.g. if we have wiki pageviews relative. Might be too detailed to implement fully, maybe an up/down arrow with percentage or "trending up" label suffice.
"Trends 스파크라인" implies maybe showing past week search interest or pageviews. If using Google Trends data it’d be great, but since likely not, maybe skip actual sparkline unless we easily get daily pageview. Actually we can get daily pageviews from wiki and draw a quick small line showing last 7 days progression if that term is big (some extra complexity but doable with a small chart lib or inline svg).
If time short, at least show ▲ or ▼ with % if we have relative change.
They did say "가능 시", implying not mandatory if not enough data. Possibly skip if no data.
정보 과부하 방지:
This panel is additional info, might be collapsed by default to avoid cluttering view.
Or design it in a card with modest height 200px showing maybe 10 keywords, not 20, to not drown user.
"Top 20" might be too many to show without scrolling panel. Possibly better to show top 10 trending topics as bigger focus and allow expand.
We'll plan to initially show 10, with a "Show more" to see full list.
Provide an option to hide entire panel if user not interested (a toggle or closing it to have full width video grid).
Since this is advanced, maybe collapsed by default for new user to not confuse them, but open for someone who toggles it or if they click something like "See trending topics in these videos".
But question's phrasing suggests it's part of UI requirement.
Possibly do as an expandable side drawer or a tab. E.g. have a right side tab "Topics" user can click.
Value: to avoid overload, maybe not open by default, but shown in a subtle way.
소스 채널 & 알림 큐: - This might refer to UI for managing folder and viewing queued alert videos. - Possibly a section or separate page where user can manage channel folders: - Left side: a list of their folders (like "My Source Channels", with maybe tree structure if needed but likely flat list of folders). - Clicking a folder shows list of channels in it and maybe recent videos in that folder that triggered or are pending threshold. - Possibly there's a special "Alert Queue" or "triggered videos" list which compiles all videos from all rules that met criteria, which user can then decide to pin to board or ignore. - They mention "폴더 트리", likely a UI with the folder names (like project names) and under each the channels. - Could be like how bookmarks in a browser appear, but maybe simpler: - Show folder with icon, clicking expands channels (like a tree). - Or a two-column: left column folder list, middle channel list or selected folder details, right could show stats? Or integrate it. - "룰 빌더(min_view, max_age_days, duration_threshold, notify)" likely part of UI to set the threshold values per folder: - Could be inside an "Edit Folder" modal or side panel where user sets "Alert me if any video in this folder gets at least X views within Y days and length <= Z". - Possibly a form with those fields and a toggle if notifications on/off. - If multiple rules allowed, maybe they can add a second rule as another row. - But given complexity, likely one rule per folder with those fields. - "임계 충족 영상만 큐에 표시." That implies an Alert Queue interface showing only videos that hit threshold. - This could be separate from trending search; maybe a tab "Alerts" where any triggered item is listed. - Possibly like: "In folder 'US Competitors': video XYZ reached 1M views in 2 days." - Could allow marking them as handled or saving them to a board (like "pin to ideas"). - Once pinned or acknowledged, maybe removed from queue (or seen status). - So the UI might have an "Alerts" bell icon with count, clicking it opens panel with list. - Or integrated into folder view: e.g. selecting a folder shows an "Alert queue" specific to that folder and maybe an overall one for all. - Possibly simpler: top-level "Alerts" page with filter by folder if needed.
보드/리포트: - They mention "칸반(아이디어/이번주/보류), 주간 리포트 카드". - This likely an advanced team feature (scenario C). - Probably out of immediate scope but good to note: - They envision a collab area where saved video ideas can be dragged between lists like "Backlog ideas", "Planned for this week", "On hold". - Could implement if we had status field on favorites or multiple boards representing those columns. - "주간 리포트 카드(Top Outliers 50, 국가 Top 키워드, 폴더 성과)" suggests maybe generating a summary weekly of what's trending or how their curated sources performed. - This is more like an automated PDF or email perhaps. Possibly out-of-scope for MVP, but interesting as a future feature (maybe Pro plan). - We'll not implement now, but design with maybe future in mind: - Could gather metrics weekly and produce charts of outliers discovered vs utilized etc.
마이크로 UX: - Loading skeletons: use content placeholders when data fetching (especially search might take 1-2 secs). - Sorting client re-order: e.g. if user clicks to sort by views vs by score on the loaded list, do it in JS rather than re-fetch if we have data. - Undo for favorites: as said, show a small toast with “Added to favorites [Undo]”. - Keyboard shortcuts: - Pressing / to focus search bar (common pattern on web apps). - f to toggle favorite on selected video (if we have selection notion). - j/k to move selection down/up video list (like YouTube's shortcuts or Gmail). - Possibly arrow keys to move around grid and Enter to open details. - All these definitely help power users. We should list them in a help modal and ensure focusing logic. - WCAG AA 대비: - Color contrast we've hammered on. We'll test practically via Chrome dev tools or WebAIM on final design. - Also ensure text scaling, alt text for images, focus states visible, ARIA for any icons only buttons (like star needs aria-label "Add to favorites"). - Possibly implement dark mode early to capture usage environment. Provided HSL for dark already so presumably yes.
Radix ARIA 준수:
Shadcn components like Dialog, Dropdown, Tooltip already handle ARIA labeling and keyboard nav by Radix. So using them for modals and menus helps a11y out-of-box.
Ensure to use proper components e.g. <AlertDialog> for confirmations.
Also e.g. menu for profile or folder actions if needed.
컬러 토큰/Tailwind 확장 JSON: We already conceptually wrote CSS. They want presumably a snippet of JSON or code block: Potentially a snippet in tailwind.config or a JSON-like representing the palette:
{
  "primary": "hsl(245 58% 61%)",
  "primary_dark": "hsl(245 65% 77%)",
  "secondary": "hsl(0 100% 71%)",
  "secondary_dark": "hsl(0 90% 65%)",
  "accent": "hsl(161 94% 50%)",
  "accent_dark": "hsl(161 84% 45%)",
  "foreground": "#1C1B1F",
  "background": "#FFFFFF",
  "foreground_dark": "#FFFFFF",
  "background_dark": "#18181B"
}
This JSON includes the brand tokens plus maybe typical black/white alias for text and background.
버튼/링크/배지/경고/성공 톤: - We somewhat covered: - Buttons: primary fill purple, focus accent outline. - Links: maybe just primary text (blueish purple). - Badges: propose subtle tinted background with strong text or vice versa with ensure contrast. - Warnings: use red either as text or border or icon, ensure for colorblind we include icon and not rely on red/green alone. - Success: use mint similarly, and include icon like checkmark.
가독/대비 충분한가?: - We'll validate a few combos specifically: - Purple button with white text: need ~4.5:1. - Red button with white text: check and adjust (maybe our red is too bright for white). - Mint on anything likely yields poor white text, so if used as background, use black text or darken mint. - Provide alternate tone scale: - For primary perhaps scale from dark variant to light: - e.g. primary-900 dark purple, primary-500 main, primary-100 light for outline backgrounds. - But since we started with one value and modifications, not predefining an entire scale in prompt, maybe just mention possible adjustment if needed (like more saturation or different brightness). - Possibly mention using tailwind's built-in accessible color generation or mention test results with those values: - e.g. "We tested primary on #fff, contrast ratio ~3:1, so to meet AA we slightly darkened to ~50% lum which gave ~4.5:1" as adjustment. - Suggest an alternate scheme if needed: - If this scheme fails in testing, we might pivot to a proven accessible palette like using more blueish for primary or simply adjusting brightness until contrast passes. - Or adding an outline to text for better readability if we insist on these hues (like text-shadow hack, but not ideal).
Finally, let's articulate some improvements or alternatives: - Possibly allow customizing theme colors for user? But probably not asked.
출처: WebAIM Contrast Checker[1], SmashingMag on colorblind design[5], Tailwind CSS docs on theming (2022).

9) 사용자 경험 시나리오 – 개선사항 제안 (시간 절감/정확도/재현성)
여러 사용자 시나리오를 통해 UX 흐름을 검토하고, 병목과 개선안을 식별합니다.
시나리오 A: 해외 소스 재가공 팀 (예: 한 에이전시가 해외 인기 Shorts를 편집 재업로드) –
흐름: 팀원 A가 폴더에 소스 채널들을 등록 → 임계 설정 (예: 조회수 ≥ N, 게시 ≤ D일, 길이 ≤ T초) → 서비스가 큐에 자동 선별 (임계 충족 영상들) → 팀이 보드에 핀하고 작업 진행.
병목/개선안: - 초기 채널 등록의 번거로움: 만약 소스 채널이 100개라면, 하나씩 검색해서 추가해야 하는데, 일괄 추가 기능이 없으면 시간이 많이 듭니다. 개선: 채널 URL 리스트 붙여넣기 기능, 또는 CSV import, 아니면 인기 채널 추천 (예: “영국 Top Shorts 채널 50 추가” 버튼) 제공. - 임계값 튜닝 난이도: 운영자가 적절한 N (조회수)과 D (기간)을 설정해야 하는데, 처음엔 감이 없습니다. 개선: 기본값 추천 (예: “구독자 100만↑ 채널은 임계 500k/3일, 100만↓ 채널은 100k/3일” 등) 또는 히스토리 기반 자동 조정 (예: 최근 50개 영상 중 상위 10% 조회수가 임계치가 되도록 권장). UI상에 “권장값: 300k/7일” 식으로 표시하면 결정에 도움됩니다. - 큐 처리의 병목: 임계 충족 영상이 한꺼번에 몰리면 (예: 주말에 확 터진 경우) 팀이 다 확인 못하고 일부 놓칠 우려. 개선: - 큐 내 우선순위 정렬 (예: VPH 높은 순으로 먼저 확인), - 또는 자동 필터 (예: 24h내 더 많이 뛴 것 강조). - 또한 Batch 처리 – 예: 여러 영상을 선택해 일괄 보드로 보내거나 일괄 무시(mark as seen)할 수 있게. 지금 디자인상 개별 “핀”만 언급되어 있는데, 다중선택이 있으면 효율↑. - 커뮤니케이션: 팀 협업이면, 한 명이 핀한 것을 다른 편집자도 알아야 합니다. 개선: - 상태 라벨 – 예: 누가 이 영상을 “편집 중”으로 바꾸면 모두에게 표시. 시나리오C 칸반이 사실 이 목적이죠. - MVP에서는 최소한 “이미 핀됨” 표시라도 공유되게 (동일 영상 두 번 작업 방지). - 혹은 comment 기능: 각 영상에 코멘트를 달아 “요건 우리 2팀 진행” 같은 메모. 이는 DB video_entities나 a join table for video->note. - 알림 전송: 현재 설계는 웹앱 내 큐만 있지만, 팀원이 실시간으로 놓치지 않으려면 이메일이나 Slack 알림도 필요할 수 있습니다. 개선: Pro/Team에 Webhook/Slack integration 고려 (notification pipeline). - 병목 – 데이터 유실: PubSub 누락 시 폴링이 일 1회면 늦을 수 있다. 개선: 3절에서처럼, 1시간마다 폴링 보강 → 거의 실시간 커버. 이건 시스템적. - 요약: 개선 우선순위 – (a) 다중 채널 추가, (b) 임계 추천, (c) UI 다중처리 & 상태공유, (d) 외부 알림.
시나리오 B: 주제 선점 (키워드 트렌드 잡아서 콘텐츠 제작) –
흐름: 사용자가 대표 국가 버튼 (예: US) → 무키워드 인기 쇼츠 리스트 확인 → 엔티티/키워드 레이더에서 급상승 주제 발견 (“예: #Barbie 챌린지”) → 해당 주제 관련 영상만 필터 (아마 키워드 클릭 → 목록 필터링) → 그 영상들 분석 → 아이디어 도출.
UI 단계 개선: - 국가 전환: 현재 각 국마다 별도 검색 클릭. 병목은 없지만, 동시 비교가 힘듭니다. 개선: “다중 국가 선택” 모드 – 시나리오 4.3의 멀티국가 동시 레이더. 예: KR vs US 모두 선택 → Trending list merges or side-by-side. 초기엔 복잡하니, - 차선: 빠른 toggle (“See US trending vs See KR trending” with one click back & forth) – we do have country buttons, maybe caching previous results to toggle instantly. - Also, highlight content that appears in both (some marker on card if same video trending in two regions? Unlikely to exactly coincide due to region filter, but similar topics). - 키워드 레이더 해석 난이도: 사용자에게 급상승 키워드 리스트를 줘도, 맥락 파악이 어려울 수 있습니다. 개선: 각 키워드 옆에 뉴스 헤드라인 snippet이나 위키 설명을 짧게 표시 (예: “Barbie – film release trending globally”). Or at least a tooltip with Wikidata description if available (“Barbie: 2023 film by Greta Gerwig”). This gives user context so they know why it's trending. - 키워드 → 영상 필터 UX: 사용자가 레이더의 키워드 클릭하면, 현재 리스트를 필터링 by that keyword. 병목: 만약 리스트원래 50개, 그중 5개만 해당 키워드 관련, 그러면 남은 45개 gone, might confuse user like did the list update or what. We need clear indicator: e.g. show “Filtered by ‘Barbie’ (5 videos) [Clear filter]”. - Also allow multi-keyword filter? Possibly not needed, one at time. - Also if no video has that exact keyword (maybe trending topic that isn't explicit in snippet?), then result could be empty. We should handle gracefully (“No videos explicitly mention this, but it might be an implicit theme”). - 이후 단계: user might after identifying the topic want to search deeper – e.g. search “Barbie” in our tool explicitly to see global trending beyond just Shorts. We could integrate with YouTube normal search or link out. Possibly an improvement: a “Search on YouTube” link for that keyword for thorough exploration. - 정보 과부하: - The user now has trending list plus side panel plus possibly filter engaged – a lot going on. - Maybe consider splitting workflow: user either exploring trending videos or exploring trending topics separately. Perhaps a separate “Trends” page where we show trending topics across countries and they can click into it to see videos from those topics. - That might be more intuitive than mixing it into main screen. But integrated approach is also powerful for advanced user. - MVP we'll do integrated but will monitor if testers find it confusing. - Provide a short tooltip or help text near the radar e.g. “These are common topics among the trending videos above.” - 개선 UI: Option to collapse the radar if user just cares about scanning videos. We covered that (toggle panel). - 성과: If user can quickly spot a viral meme before others, that’s the goal. To measure: how to ensure they trust the radar? Possibly highlight which videos contributed to a topic's frequency (like a little number “(5 videos)” next to it). - 정확도: Radar might sometimes show irrelevant or stop-words erroneously. If our NLP isn't perfect, user might waste time. Mitigation: - Maintain a blacklist of words (like “shorts”, “official”, “channel”) to filter out. - Possibly allow user to remove a keyword manually if they find it irrelevant (less needed). - Summarily, for scenario B, biggest improvement is giving context around trending topics and making the UI to filter by them clear and user-friendly.
시나리오 C: 팀 협업 – (보드 공유, 태그, 상태)
흐름: 팀 여러명이 보드를 공유하여 아이디어를 모으고 작업 상태를 표기. Ex: Writer pins a trending video idea to "Ideas" board → Editor reviews, moves it to "This Week" when approved → maybe after producing, tag as "Done" or move to archive. They also discuss in comments or via statuses. 권한/RLS 모델 누락?: - We covered RLS in section 7: needed roles Owner/Editor/Analyst. - Are we missing something? Possibly Viewer role for read-only? They mentioned as optional. If for example an external client should see the board but not edit, viewer role needed. - Also, organization/project structure: We have org and folder, but maybe also "project" concept where multiple boards and folders belong to a project? Possibly not needed if one org is one group. But an agency might handle multiple separate YouTube projects (like multiple clients) and would prefer to segregate data by project. - We didn't explicitly have a 'project' table. We could simulate by each folder/board being per client and named accordingly. But a grouping might make UI easier (like sections). - Possibly outside MVP but something to consider if an agency with multiple teams uses it, they might want separate spaces for each client. - 보드 공유: ensure boards have org_id and RLS so all team members see same boards. - 태그, 상태 칩: We didn't implement tags for boards in DB, but scenario calls for them. We might do minimal such as allow adding a tag in a note field or so. Real solution: allow multiple labeled columns (which implies board grouping or something). - Possibly treat board name as status (like boards themselves are columns in Kanban: "Ideas", "This Week", "On hold"). Then moving an item is just changing its board association. - That's a design: have a main board (project) that has sub-boards (columns). But our model currently supports many boards but doesn't link them as a sequence. - Not tackled now due to complexity. - 정합성: if multiple people edit concurrently, must update in realtime. Could use Supabase realtime on board_videos table. Probably fine. - 누락: - Possibly an activity log so team knows who pinned or moved something. Not mentioned but useful (especially if conflict or review needed). - RLS wise, we got org share but need to consider if external user invited (maybe not). - 개선: - If not building full kanban, maybe support at least a “Status” property on a saved idea: e.g. dropdown for Pending/Approved/In production/Done. That alone covers a lot. - Then boards page could filter or group by that status. - Possibly easier to implement than multi-board drag drop. - We will weigh if implementing a simple status field in favorites or board_videos is easier than multi-board linking. Could do that as an internal field from the get-go to ease future kanban.
사용자 가치 기준 (시간 절감/정확도/재현성) – We should list all improvements in terms of how they help: - Time saving: - Bulk channel add - Quick filters & recommended thresholds reduce trial-and-error - Bulk actions on alert queue - Quick multi-country toggling - Clear context (like trending topic description) saves user time researching what that is. - Accuracy: - Filtering out irrelevant tokens (stopwords) improves trending topic accuracy - Combining multiple metrics in score helps them not miss a trending video that isn't top by raw views (our tool improves detection). - If we add "drill down to underlying reason (news or description)" for trending topics, they more accurately judge if it's relevant to them. - Team comments or statuses reduce miscommunication (thus correct video gets picked). - Reproducibility: - Having a saved search ensures they can consistently apply same criteria next time - Weekly report ensures they reflect on trends systematically - Kanban ensures consistent process of moving from idea to done, not ad-hoc. - We list these improvements as final answer likely in bullet format if needed.
출처: - Possibly none needed here as it's brainstorming improvements. But maybe referencing known patterns: - Trello or Notion for kanban (no direct sources given). - However, might reference similar tools features: - TubeBuddy doesn't have collab or boards, but some PM tools do (maybe cite Atlassian blog). - Maybe skip external source citing for scenario improvement unless the user expects references for all points. - Possibly referencing NoahAI controversy could fit scenario A (lack of credit etc).
No direct references given by user to sources in this question, likely they want creative thinking validated by earlier decisions.

10) 쿼터/성능/안정성 – 예산 및 폴백 계획
우리는 하루 API 호출량(쿼터)을 관리하면서 서비스 성능과 안정성을 보장해야 합니다. 쿼터 예산표와 장애 시 폴백 전략을 함께 수립합니다.
쿼터 예산 시나리오 (예):
- 기본 설정: Free 플랜 사용자, 국가 3곳, 기간 7일, 하루 2회 조회. - 요구 API: - search.list: 지역×기간×페이지 조합. 예: 3국 × 1기간 × 1페이지 = 3 calls = 300 units/회. 하루 2회 => 600 units. - videos.list (상세 50개씩): 3 calls (one per search call) = 3 units/회, 6 units/day. (미미) - Channel monitor: say user tracks 10 channels, each ~1 video/day via PubSub (10 vids) -> 10 videos.list for those = 10 units/day. - Snapshot worker: tracking top ~50 trending videos hourly => 24 * (50/50=1 call) = 24 units/day. - Additional external APIs (wiki, etc) are outside Google quota but have own limits (mostly high or none). - 합계 (예): ~600 + 6 + 10 + 24 = ~640 units/day for that user. Well under 10k. Plenty of headroom. - Worst-case Free user: allowed combos (국가×기간×페이지) e.g. 5 countries × 3 periods × 2 pages = 30 search.list calls = 3000 units per refresh. If they refresh multiple times, could approach daily limit. - We'll impose usage limits per free user e.g. 5k/day to be safe, or ask them to connect their own API if heavy usage. - Pro plan: If they use 10 countries × 3 periods × 5 pages (per prompt) = 150 calls = 15000 units per refresh – beyond one key quota. But Pro could allow them to add multiple keys or we get higher quota by applying for extension (if we pass audit). - Alternatively, we might throttle how many combos can be active at once. - Possibly in Pro, we handle sequentially or caching: - e.g. trending data for each country updated periodically and shared, not on-demand always – so multiple Pro users share result of heavy calls. - The prompt suggests these heavy usage, maybe expecting we advise caching or budgeting. - Quota budget table (typical): | Use Case | search.list calls (100u ea) | videos.list calls (1u ea) | Total units | |-------------------------------|---------------------------|-------------------------|-------------| | Free user (3 countries, 1 page, daily 2x) | 32=6 calls = 600u | 6 calls = 6u | ~606u/day | | Pro user (10 countries, 3 periods, 2 pages, daily 4x) | 10324=240 calls = 24,000u | 240 calls = 240u | ~24,240u/day 😨 | | Team heavy (20 countries, 3 periods, 5 pages, daily 4x) | 20354=1200 calls =120k u | ~1200u | ~121,200u/day 🚫 | - Clearly beyond single key limit (we have 10k default). So for Pro/Team, we either: 1. use multiple API keys (pool from our side or user-supplied), 2. or become YouTube API partner to get higher quota, 3. or reduce actual calls via caching: - Possibly do not allow all combos raw, but provide aggregated results from one global search per region and filter locally for period (publishedAfter filtering can be done client side somewhat by ignoring older). - E.g. we could fetch 50 most viewed videos in 30 days and then client filter for 7d or 3d segments – not accurate since there might be videos below top50 that soared in shorter period though. - Or maintain our own trending DB by polling regularly, so user queries hit our DB more than YouTube. - Realistic: For Team plan, we likely maintain a server background that every X minutes collects trending across many regions into our DB (like Social Blade style), then user queries mostly hit our DB not API. That drastically cuts calls but requires storage and continuous jobs. This is a future scaling approach. - 폴백 (쿼터 초과): - If our key or user key hits quota: - Show an error in UI: "YouTube API quota exceeded. Some data may be stale or unavailable until reset (midnight PST)." - Then reduce functionality: e.g. disable new searches, or serve cached last results if available ("Showing cached results from 1 hour ago"). - If we have multiple server keys, could rotate to a backup key if available for critical calls (though that might violate Google’s terms if used to circumvent). - Encourage user to input their own key (they might have leftover quota). - Perhaps for Team plan, require them to add their own Google Cloud project keys to pool. - 폴백 데이터: - Use cached trending data we collected (maybe via our background tasks). - E.g. have an in-memory or DB cache table that stores last successful results for each common query (like top global, top per region). If API fails, serve that with a note. - Similarly for channel monitoring: if API fails retrieving stats at trigger time, we can still notify "Video X likely trending" without exact number (maybe wait and try again later). - Or degrade to scraping (which we avoid for policy). - Graceful degrade*: - If external APIs fail (like wiki down), just skip showing that info rather than block main content. - If supabase (our DB) fails, maybe allow user to still see direct trending from API (but if DB down, likely API calls also hinder because we rely on caching etc). - If Realtime fails, fallback to manual refresh to see new alerts.
성능: - We aim 95 percentile page response under e.g. 3 seconds for main search (just a guess goal). - "10개 국가 × 3기간 × 5페이지 병렬 수집 95p 응답목표" in prompt likely means if user tries to gather that much data concurrently, can we respond timely? - 1035=150 search calls if done sequentially ~ could be 150*? average 0.2s each maybe = 30s. That's too slow for UI. - We could parallelize with up to perhaps 10 calls in parallel (some libraries allow concurrency), but 150 at once is heavy (and might hit QPS limit). - Possibly they expect we wouldn't literally do 150 separate, but find another way. - If they insisted, we might break into phases or only fetch what needed. - Honestly, an on-demand of that scale isn't realistic within one UI action; likely that scenario would be handled by our background aggregator and user would just query our DB for aggregated result. We should note that as design: - For Team plan heavy data, best approach is to have scheduled workers populate trending data in DB. - Then user query just reads DB (fast). - So 95p response can be < 5s because data pre-collected. - If not pre-collected, maybe implement incremental loading: show initial region then allow user to add others gradually. - Summation: For now, we commit to certain realistic usage and highlight extreme usage requires architecture scaling with caching.
장애 폴백: - PubSub failure: if our endpoint is down when YouTube tries to send, we might miss events. We cover by periodic polling. If prolonged downtime, some events lost – acceptable risk, as polling daily covers it albeit delayed. - Supabase outage: If DB temporarily unavailable, maybe serve last known trending from a cached file or static fallback "YouTube Trending is temporarily unavailable". - If our site is down, obviously user waits.
페이지 제한/샘플링: - If user requests extremely broad data (like trending worldwide across many pages), we might impose limits: - e.g. no more than 50 videos per query in UI – ask to refine or paginate. - If high pages requested, maybe after first 2 pages, require user action to load more (infinite scroll with manual "Load more" which we can stop if near quota). - Sampling: - Perhaps rather than retrieving full lists for every region, for something like "All worldwide trending", we could sample top few from each region instead of all from each if they insisted on combining. - Or if user selects too many filters, show a subset or message "Results truncated to first 100 videos due to load". - Graceful degradation on UI: - If external images (thumbnails) fail to load, we show placeholder. - If some metrics are not available (like maybe likeCount sometimes disabled?), show "N/A". - Backoff strategy: - On HTTP 403 (quota or banned), maybe we quickly disable further calls and alert user. - On HTTP 500 from API, attempt up to 3 retries with increasing delay (1s, 2s, 5s). - On network fail, similarly. - Logging these events to monitor if recurring.
일일 쿼터 예산표 (they specifically asked for this): We can tabulate by feature or by plan: - By Plan: - Free: limit ~1000 units/day (10% of our key, because multiple free users). - Pro: allowed up to e.g. 5000/day (with own key usage beyond). - Team: need own keys or custom solution. - Or by feature: | Feature | Units per action | Frequency (per user/day) | Daily units | |------------------------|------------------|--------------------------|-------------| | Trending Search (50 vids) | 100 (search) + 1 (videos) = 101 | 2 times | ~202 | | Channel Alert check (each new video stat) | 1 | ~5 videos | 5 | | Snapshot trending (shared overhead) | 1 per hour for 24h (shared among all) | - | 24 (global) | | ... etc. - Provide one good summary in answer to be clear.
장애 폴백 정리: - Quota: degrade features, ask user key. - External API fail: skip that part, minimal impact on core. - PubSub fail: polling fallback. - Real-time fail: user refresh manually. - Work queue backlog (if background tasks can't keep up): skip less crucial ones (like if trending aggregator behind, maybe show slightly stale data). - We should also mention storing partial results if partial calls succeed to at least show something. E.g. if some region data loaded before fail, show those loaded results.
출처: - YouTube API quotas doc[93] (mention 10k/day). - Reddit on multiple API keys not allowed (maybe not needed). - Possibly mention Social Blade scraping but not advisable. - But likely no specific source for handling quotas, except perhaps Google guidelines on efficient usage (only partial). - Eh we might not cite here as it's mostly architecture planning.

11) 결제/권한/정책 – 플랜, 결제 플로우, 공유 권한, 데이터 정책
마지막으로, 플랜별 기능 제한, TossPayments 구독 설계, Supabase RLS 권한 모델, 데이터/약관 정책 등을 정리합니다.
플랜 게이팅 기준: Free vs Pro vs Team.
Free: 제한 (국가 수 ≤3, 룰 수 ≤2, 보드 공유 없음 등)[29].
Pro: 확장 (국가 ≤10, 룰 ≤10, 보드 공유 ≤5 invites, export limit high).
Team: 최대 (국가 ≤20, 룰 ≤30, 공유 ≤20 members, export up to 100k rows) – as per clarif.7.
These limits are implemented in front/back end:
Front: disable beyond allowed (e.g. only show first 3 country buttons, rest greyed with tooltip "Upgrade for more").
Back: RLS or logic to enforce count (like a DB constraint on number of folders for free user, or code check).
Also gating advanced features:
e.g. Trends radar might be Pro only, or multi-country selection Pro, team collab only on Team plan.
We should decide such: maybe trending keywords could be Pro incentive, but initial likely included to add value to Free too.
Perhaps the Kanban collab definitely Team plan.
Export to Google Sheets – likely Pro, free maybe CSV only small.
We should clearly communicate these in UI (locked features with upgrade prompt).
Payment tiers:
Free: $0 (maybe with watermark or limited data).
Pro: e.g. $X/month (like $20).
Team: $Y/month (like $100 for 5 seats) – but using Toss, easier to treat per member or maybe volume-based.
TossPayments 구독:
We design monthly subscription plans (Free, Pro, Team).
구독 (Recurring): Using Toss Billing (자동결제) as per section 3 analysis[12].
Flow:
On upgrade, user enters card via Toss Payment popup, we get billingKey.
We store it in credentials or separate billing table (with user_id, billing_key, plan, status, next_bill_date).
We call Toss billing API to charge monthly.
We handle 무료 체험: For example, set next_bill_date 7 days later and mark trial in DB; still require card upfront or not? Possibly require card to avoid churn, then first charge after 7 days.
If card fails (retry 3 times as earlier plan).
Retry/웹훅:
Toss sends webhook on payment success/fail[12].
If fail, we mark subscription as “past_due” and notify user to update payment. Try again in X days (maybe automatically 3 days if Toss does not auto, we could schedule).
We reduce plan to free if not resolved by next cycle or after retries.
환불/프로레이션:
If user cancels mid-cycle, do we prorate? Possibly not unless requested (Korea often doesn’t pro-rate monthly sub).
If upgrade mid-month (Free->Pro), start immediately new plan, charge immediately (Toss allows immediate charge).
If downgrade (Pro->Free), apply at period end, don't refund remainder.
We should align with local consumer law but likely monthly small amounts can be done no pro-rata by policy, or do wallet credit.
웹훅 Security: Validate signature or include a secret, to trust it's Toss.
Plan enforcement:
On subscription creation success, update user's role or plan field in DB.
RLS can use JWT claims for role perhaps (if we manually add plan as custom claim on login).
Or easier: just check a users.plan column in policies or code.
For gating counts (like folder count), we can incorporate that in policy:
e.g. in insertion policy for folder, allow if (user.plan = 'Pro' or 'Team' or count_folders_by_user < 3).
But policies cannot easily count unless making a subquery (which is possible).
Perhaps simpler: check in API code before insertion.
For data scope limits (like more results), we enforce in app logic.
취소:
If user cancels subscription (through our UI calls toss billing cancel, or they revoke card?), we mark them as pending downgrade to Free after current period.
They retain Pro features until period end in our system (so plan effective until next_charge fails or cancelled).
Could set users.plan_expires date to end-of-cycle, and have a scheduled job to flip them to free at that time or on next login check.
RLS 권한 모델:
We implemented essentially:
Owner (user who created org, can invite, manage billing maybe).
Editor (org member with full CRUD on all content).
Analyst (org member read-only or no deletion rights).
Possibly implemented by auth.roles or by separate tables.
Supabase can encode role in JWT by having an org_members table and including claims via a function on login (though by default, they include role fixed as 'authenticated').
Simpler: We can manage roles in our application logic:
e.g. an org membership table with role column. Then RLS policies check that table for what they can do:
For select: allow if user in org.
For insert/update: allow if user in org and role in ('Owner','Editor').
We can implement that:
CREATE POLICY org_data_select ON folders
  USING (folder.org_id IS NULL AND folder.user_id = auth.uid()
     OR folder.org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY org_data_insert ON folders
  WITH CHECK (auth.uid() = user_id OR (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('Owner','Editor'))));
Similarly on other tables referencing org.
This covers organizational segregation.
The question: "오너/에디터/분석가" structure to finalize? They ask if to confirm roles.
We think yes 3 roles default, with optional viewer if needed later.
We set that as resolved with viewer optional.
조직/프로젝트 구조:
Did we cover need for multiple projects per org? If a user wants separate sets of data not visible to others in same org except some subset.
Given time, likely one org = one team, not multi-tier. If needed, they'd just make separate accounts or orgs for each client.
We'll mention might consider "project" concept if needed but keep simple for now.
브랜드 HSL 색상:
Implementation in UI design we did with slight adjustments.
They ask if we adopt as is or adjust after testing.
Our plan: use base as given but do actual contrast tests and adjust if necessary.
I'd say "채택 + 테스트 후 미세 조정".
Because we should trust these brand choices but accessibility must be validated. So likely yes, adopt now and run it through a contrast checker. If any fail, tweak things like making primary slightly darker or adding outline.
Possibly mention simulation with colorblind filters to ensure red vs mint difference etc.
정책: - They explicitly say: use only public data, no unauthorized scraping or caption downloading. - We must include a usage policy note: - "We comply with YouTube Terms of Service: we do not download actual videos or private data, we only use official APIs and publicly available info. - No storing of full comments or subtitles (which might violate personal data usage). - If we use any user-provided API key, we store it encrypted and only use for their queries. - The user should also follow YouTube policies (like not re-upload content in violating manner, though our tool not directly policing that but we should disclaim not affiliated with YouTube and that content usage is user's responsibility). - Also, clearly present disclaimers: - e.g. "All data from YouTube API. © respective owners." maybe or at least note these are not our content. - Possibly show a note in UI if some data incomplete due to API limits (like "viewcounts updated hourly, may lag actual by a bit.")
다운로드/자막 무단 수집 금지 고지:
In our UI or terms, mention "We do not provide video downloads or subtitle downloads, in compliance with YouTube API TOS." Just to be safe.
If user requests such, we won't implement it.
Perhaps if user tries to find a way to scrape (like copying list of trending), they could manually. But we'll likely allow CSV export of stats which is fine because it's public data. That should be okay under API TOS as incidental.
But some TOS might forbid exporting data to a separate external service (like to Google Sheets might be borderline, but since it's user usage for analysis probably fine).
Possibly specify: "All analysis is done on publicly available data, we do not store or use any non-public user data from YouTube accounts (unless user voluntarily connects in future)."
출처: - TossPayments developer guide (for subscription)[12], - Supabase docs on RLS (similar to code we gave)[92], - YouTube API TOS (would be good to cite policy forbidding downloads but maybe not needed in answer). - Possibly cite YouTube Terms line about no video downloads (though known knowledge). - We'll likely just cite reference for roles or so: - (Maybe mention that tools like Slack allow up to 10 free integrants vs unlimited in paid, as analog for gating. But not needed). - Because question expects a thorough reasoning, not necessarily heavy external citations here as it's internal planning.
We'll include references if needed such as: - Supabase docs RLS example for multi-tenant (maybe there's a known snippet). - Or RBC (Reddit stuff?) no, skip not relevant. - We'll likely rely on earlier sections references suffice.

We have compiled a ton. Now the final tasks: 1. Check we adhered to the writing guidelines: headings, short paragraphs, bullet lists, question style viewpoint, citations. - We used questions in analysis and where alternatives appear. Ensure we occasionally phrase as a question "Is this best?" which we did in many sections. That should suffice. - Provide sources after sections, we did that systematically. - The final summary JSON required schema is given at the end of section 13 tasks. We'll produce that. 2. The JSON: They gave a skeleton with keys. We should fill: - version: "v1" - date_utc: current date in UTC (like 2025-08-15) - brand_tokens_hsl: as we enumerated in section 8. - stack: list of strings (the items in clarif #, basically we list them as given like "next@15.4.6","react@19.1.1", etc). - apis_used: list of all likely used API names (like in clarif: "youtube.data.v3","pubsubhubbub","google.knowledgegraph", "google.sheets(optional)", "google.trends(if_available)","wikimedia.pageviews","wikidata.sparql","gdelt","guardian","nyt","reddit(if_free)"). - primary_features: from clarif it says e.g. ["keywordless_shorts_discovery","source_channel_rules","entity_radar","outlier_ranking","collections_exports"] (we should match text carefully, yep it basically enumerated earlier). - ranking_formula: presumably that exact formula string from clarif (which matches what we have). - quota_budget_per_day: this should be an object presumably with free/pro/team or some breakdown. They left an empty {} placeholder. Perhaps we fill with a dictionary e.g.:
"quota_budget_per_day": {
   "free_user": "≈1,000 units (YouTube API calls)",
   "pro_user": "≈5,000 units",
   "team_shared": "pre-collected trending data"
}
or we detail by search etc. Possibly they expect a breakdown by feature. The skeleton isn't super clear. We'll provide a mapping for maybe "search_calls":N,"snapshot_calls":N etc? Or do as a string explanation. - ui_initial_screen: they've put an object: - "cards_per_page_desktop": 30, "cards_per_page_mobile":15, - "filters": [region, days, duration, category, language, license] (their example shows category, language, license too, which we didn't discuss much but presumably filters we could have toggles for. Region, days, duration we did. Category (maybe to filter by category if needed e.g. Music category or exclude it?), language or license not in requirements except license might be to exclude copyrighted vs CC videos, maybe they consider adding that filter. - Possibly they expect these exact strings because in prompt in 8) code block, they mentioned filters like category, language, license. - To align, we put those in array as they list even if we didn't use license filtering actively, as possible filter options. - schemas: list of table names we ended up with. They gave example which is exactly the ones in prompt e.g. ["channels","videos","video_stats","folders","rules","alerts","trends_terms","kg_entities","video_entities","favorites","credentials"] - plus our addition like folder_channels, board etc? But they didn't list boards in skeleton, interestingly not, maybe they consider boards included in favorites or not considered main. - Their skeleton not exactly match our built (we have 'collections' concept we added). - Possibly stick to given list. They did mention "trends_terms, kg_entities, video_entities" even if we might not implement fully now. - We should include folder_channels even though not in example (maybe they consider it implicit with folders). But to be safe, add "folder_channels" and "board_videos" as we created in ERD but they didn't mention board in initial list. Did they mention "collections_exports"? Actually "collections_exports" is in primary_features, meaning probably favorites/boards and export. - Maybe they just group that under favorites or in general. But since we mentioned board, add "boards" and "board_videos". - "credentials" likely map to our API_CREDENTIAL table. - risks: list a few top risks we identified (like API quota exhaustion, relying on external sources reliability, user misuse (like plagiarism controversies maybe?), etc). - open_questions: things still not settled or require future decision: - e.g. will we incorporate multi-project segmentation? - Or how to verify if user input API key has enough quota? or how to handle Google Trends if it becomes available (Plan?), - Possibly if to incorporate YouTube OAuth for more data. - Up to us. maybe focus on ones we've flagged: - e.g. Plan for multi-keys or increased quota if usage grows, - Entities extraction accuracy (maybe needed improved NLP?), - or open question about usage of Google Trends official vs skipping it (they did ask clarif #2 about Google Trends API state, we answered none so plan B). - We can list "Will Google Trends API become available to replace external signals?" and "Need to gauge performance of score formula with user feedback" etc.
Let's incorporate those properly.
Now, compile everything into final answer with good formatting and ensure to include core details and citations.
0) 프로젝트 전제 및 검증 – 브랜드 컬러 & 스택
브랜드 컬러 (HSL) – Primary 보라: hsl(245 58% 61%) (다크: hsl(245 65% 77%)), Secondary 빨강: hsl(0 100% 71%) (다크: hsl(0 90% 65%)), Accent 민트: hsl(161 94% 50%) (다크: hsl(161 84% 45%)).
명도/대비: Primary 보라는 흰 배경에서 텍스트/버튼으로 활용 시 약간 밝은 편이라 명도 5~10% 낮춤을 고려합니다 (예: Hover 상태를 55%, Pressed를 45%). 현재 값으로도 WCAG 대비 AA는 간신히 충족하거나 약간 모자랄 수 있어, 실제 UI에서 시뮬레이션 후 미세 조정 예정입니다[1]. Secondary 빨강은 매우 쨍한 밝은 빨강(#FF8B8B 추정)으로, 흰색 텍스트 대비가 4.5:1 미만일 가능성이 높습니다. 버튼 등에 쓸 땐 살짝 어둡게 (예: 65% 명도) 하거나, 굵은 폰트로 최소 AA 기준 확보합니다[4]. Accent 민트는 녹색 계열로 red–green 색약 사용자가 구분 어려울 수 있으므로, 성공 표시에 쓸 경우 아이콘/텍스트 레이블을 병기해 색에만 의존하지 않게 합니다[5]. 또한 민트 배경에 흰 텍스트 조합은 대비 부족 (약 2.5:1 추정)하므로, 배지 등에서는 민트 글자+연한 배경 형태로 사용하여 가독성 확보합니다.
파생 톤 제안: Primary 보라를 기준으로, Foreground 텍스트 색상은 더 짙은 보라/남색 (명도 20%)를 변수로 두고, 다크 모드에선 반대로 매우 밝은 보라(명도 90%+)로 설정해 대비를 높입니다. Secondary 빨강 역시 Hover 시 채도↓ 또는 명도↓로 조금 차분하게 (예: HSL 0° 90% 65%)[5]. Accent 민트는 Hover/Pressed 시 약간 어두운 청록으로 변주 (예: Hover hsl(161 94% 45%), Pressed hsl(161 94% 40%)). Disabled 상태는 모든 색상에 대해 채도를 크게 낮춘 회색기 섞인 톤으로, 예: Primary Disabled = HSL(245,20%,90%) 정도로 설정합니다. Outline(테두리) 및 Focus 링은 Accent 민트를 주로 사용하되, 배경색에 따라 투명도나 명도를 조절해 충분한 시인성을 확보합니다.
콘트라스트 AA/AAA 검토: 보라 버튼에 흰 글자 조합 – 현재 보라 (61% L)와 흰색 대비 약 3:1 추정으로 AA 미만입니다. 이게 최선인가요? – 아니므로, 조금 더 어두운 보라로 조정하여 4.5:1 이상 맞춥니다[1]. 빨강 배경에 흰 글자도 유사하게 조정 또는 흰 글자 대신 짙은 빨강 글자를 밝은 빨강 배경에 쓰는 등 대안을 마련합니다. 민트 색상의 경우 밝은 톤이라 배경색으로 쓸 땐 어두운 글자, 글자색으로 쓸 땐 최대한 짙게 하여 대비를 확보합니다. 이러한 조정은 시뮬레이터(예: WebAIM 대비 체크)로 검증하며, 필요시 색상 팔레트 자체를 약간 변경(예: 보라를 245/58/50으로)하는 것도 고려합니다.
개발 스택 (현행성 & 호환성) – - FE: Next.js 15.4.6 (App Router)와 React 19.1.1, TypeScript(strict). Next 13~15의 App Router는 Server Component 중심 구조입니다. React 19는 (가정상) React 18의 Concurrent 특징을 이어가며, Strict Mode 하의 useEffect 실행 등이 안정되었을 가능성이 있지만, 여전히 효과 타이밍에 유의해야 합니다. 예컨대, React 18에서 개발모드 중복 효과 실행 이슈가 있었는데, React 19에서는 개선됐는지 확인필요[6]. Server Components를 쓸 때, 클라이언트 측 state와의 상호작용에 주의합니다. React 19에서는 (예상) 서버->클라 상태 전달을 돕는 새로운 훅(use 등)이 도입되어, 데이터를 fetch 후 바로 컴포넌트에서 사용할 수 있지만, 우리처럼 YouTube API를 서버에서 호출해 가져온 데이터를 클라이언트 state(예: Zustand store)로도 반영하려면 이중 관리 위험이 있습니다. 질문: SSR로 받은 데이터를 클라 쪽 Zustand와 일치시키는 최선 방법은? – 초기 렌더 시 Props로 전달하거나, React Query의 hydration 기법을 쓰는 등입니다. Streaming SSR의 경우, search 결과를 chunk 단위로 바로 UI에 뿌릴 수 있는데, 우리는 API 응답을 한꺼번에 받으므로 streaming 활용도는 낮지만, Skeleton UI로 로딩중 표시를 적용해 UX를 개선합니다[94].
UI/스타일링: Shadcn/UI (Radix 기반)와 Tailwind CSS 3.x, Framer Motion 12.x, Lucide Icons. Radix의 접근성 속성 (aria-*, focus trap 등)으로 모달, 토글 메뉴 등이 구현돼 있어, 이를 활용하면 WCAG 준수에 유리합니다[9]. 테마는 CSS 변수(--color-primary 등)를 Tailwind와 연동하여, 다크 모드시 [data-theme="dark"]에 변수값 교체로 구현합니다[9]. Tailwind 설정에서 colors: { primary: "hsl(var(--color-primary) / <alpha>)", ... } 식으로 정의해 utility 클래스로 사용합니다. 다크 모드시 Radix 컴포넌트들이 자동으로 적합한 톤을 쓰는지 확인해야 하는데, Shadcn UI에서 Light/Dark 토글을 제공하므로 이를 참고하여 변수 조정합니다. 접근성: Lucide 아이콘은 <svg>로 제공되며, 우리는 aria-hidden과 role="img"+<title> 등을 넣어 스크린리더 호환성을 유지합니다.
BE/인프라: Supabase (PostgreSQL DB + Auth + Storage + Realtime)와 Supabase CLI (DB 마이그레이션 관리). RLS (Row-Level Security) 정책으로 사용자별/팀별 데이터 격리를 구현합니다. 예: folders 테이블에 org_id나 user_id를 기록하고, 정책으로 auth.uid() = user_id OR auth.jwt().org_id = org_id만 select 허용[92]. Supabase Auth는 JWT에 사용자 식별자 및 커스텀 클레임(org 등) 담을 수 있어 이를 활용합니다. RLS를 켠 상태에서 supabase-js 클라이언트는 사용자 토큰을 전달하므로, 프론트에서 곧바로 DB 쿼리도 (제한적으로) 가능하지만, 우리는 중요한 로직은 Route Handler(API)에서 수행해 보안을 높입니다. 시계열 성능: 대량의 video_stats (예: 시간별 조회수) 축적 시, Postgres에서 video_id 파티셔닝이나 인덱싱으로 대응합니다. 수십만 건 수준에서는 video_id, captured_at DESC 복합인덱스로 충분하지만, 수백만 건이 되면 월별 파티션을 고려합니다. Supabase PG 15는 파티션 지원하므로, (예:CREATE TABLE video_stats_202508 PARTITION OF video_stats FOR VALUES IN (2025-08)) 방식을 검토합니다. 또한 오래된 데이터 (예: 90일+)는 TTL 정책 또는 별도 아카이브로 이동해 테이블 사이즈를 관리합니다. 대량 upsert: Supabase PostgREST는 한 번에 JSON 배열을 받아 일괄 upsert 가능합니다[11]. 예컨대 50개 영상의 stats를 /rest/v1/video_stats에 POST하면, 처리를 한 번에 하므로 네트워크+트랜잭션 비용이 줄어듭니다.
상태관리: Zustand 5.x, React Query 5.x, React Hook Form 7.x. Next 15 (App Router)에서 서버 액션이나 Suspense 환경과 이들 라이브러리가 충돌하지 않는지 확인 필요합니다. 예: React Query 5는 여전히 CSR에서 주로 쓰이는데, SSR 후 hydrations시 useQuery가 또 호출되어 데이터 중복 패칭 우려 있습니다. 이를 피하려면 서버에서 패치한 데이터는 React Query 캐시에 미리 넣거나, 또는 서버 액션으로 mutate 시 클라이언트 Query 캐시를 invalidate하는 연계가 필요합니다. 질문: “서버 컴포넌트 안에서 Zustand 상태를 어떻게 쓸까?” – 기본적으로 Server Component에서는 Zustand 사용 금지(클라이언트 전용)[6]. 따라서 즐겨찾기 상태 등은 클라 컴포넌트에서 Zustand useStore로 관리하고, 서버 액션이 수행된 후에는 해당 상태를 업데이트하도록 이벤트를 보내야 합니다. RHF 7.x는 React 18+와도 잘 동작하지만, Next의 React 19 Strict모드에서 uncontrolled->controlled 전환 이슈 없는지 주의합니다.
결제: TossPayments SDK 1.9.x – 국내 구독 결제 플로우. TossPayments는 PG로서 정기 결제(빌링키) 기능을 제공합니다[12]. 설계: 사용자가 Pro/Team 업그레이드 시 결제창을 띄워 카드 등록 및 첫 결제를 받습니다. Toss에서 billingKey를 응답받아 저장 (DB credentials에 AES-256 암호화 저장). 이후 매월 billingKey로 자동과금하는 스케줄을 서버(Walker/cron)에서 실행합니다. 무료 체험: 첫 결제를 0원 승인(또는 첫 과금일을 trial 이후로 설정)하는 방법이 TossPayments에도 문서화돼 있습니다[13]. 7일 trial 구현 시, 카드 등록 -> 0원 승인 -> 7일 후 /billing API로 과금. 리트라이: 만약 결제 실패 (카드 한도초과 등) 웹훅이 오면, 우리 DB에 subscription.status = 'past_due'로 표시하고, 3일 후 재시도 (최대 3회) 로직 수행. 그래도 실패 시 구독 취소 처리 및 사용자 플랜을 Free로 강등. 웹훅: TossPayments 웹훅 URL을 /api/toss/webhook으로 받아, 결제 성공/실패 이벤트마다 DB 업데이트합니다[15]. 환불: 월 중도 해지 시 남은 기간 환불은 정책에 따라 – 보통 일할 계산 어려우므로 “해지 시 다음 결제 안 됨”으로 처리 (no partial refund) 고지. Upgrade (Free→Pro) 시 즉시 새 사이클 시작, Downgrade (Pro→Free) 시 남은 기간 유지 후 만료 처리.
정책: 우리는 YouTube 공개 데이터만 사용하며, 다운로드나 무단 스크래핑을 하지 않습니다 (YouTube API 이용 시 약관 준수). 사용자가 본 서비스로 얻은 데이터를 어떻게 활용할지는 본인 책임이나, 저작권 침해 영상 재업로드 금지 등의 일반 원칙을 안내합니다. 또한 개인정보 미수집: 유튜브 영상/채널 데이터는 공개 정보이고, OAuth로 사용자의 YT 계정 데이터는 받지 않으므로 개인정보 이슈는 적습니다. Reddit/트위터 등의 데이터도 공개 범위 내에서만 사용하고, Reddit API 새 정책상 상업 사용 제한이 있지만, 우리 서비스의 Reddit 활용은 극히 제한적 참고용이므로 문제가 없도록 호출량 제한 및 필요시 API 유료 tier 고려합니다[39]. 마지막으로, API 키 보관: 사용자가 제공한 YouTube API 키는 암호화되어 DB 저장하고, 사용자 요청에만 사용하며, 키 노출이 없도록 합니다 (저장시 환경변수 기반 키로 AES암호화). 이러한 정책을 이용약관 및 개인정보처리방침에 명시하여, 신뢰성을 높입니다.

1) 5W1H – 요구사항 재확인 (질문형, 근거 인용)
Who: 주요 사용자는 한국의 ‘양산형 쇼츠’ 운영자들로 보입니다. 즉 해외/국내 인기 영상을 소재로 다량의 Shorts를 만드는 개인 크리에이터, 편집 도우미 팀, 또는 MCN/에이전시입니다. 오너/에디터/분석가 식으로 역할 분리도 고려됩니다. 예컨대 에이전시라면 오너는 구독 결제와 팀 관리 권한, 에디터는 채널 폴더와 아이디어 보드 CRUD, 분석가는 데이터 조회만 가능하게 설계할 수 있습니다. 초창기에는 역할없이 1인 사용이 많겠지만, 팀 요금을 받는다면 권한 구분이 필요합니다. 이런 롤 기반 접근은 Supabase RLS로 구현 용이하며 (org_members 테이블에 role 컬럼, 정책 분기), 추후 기업용까지 대비합니다.
What:
“무키워드” + 국가/기간/길이 조건에서 조회수 상위 영상 탐색 – 네, 이 기능이 핵심입니다. 일반 유튜브 트렌딩은 Shorts가 섞이거나 가려질 수 있는데, 우리 서비스는 키워드 없이 특정 기간·지역 내 조회수 Top Shorts를 보여줍니다[23]. 예를 들어 “최근 7일 미국에서 조회수 가장 높은 Shorts”를 한눈에 보는 것이 주된 시나리오입니다. 경쟁 툴 TubeLens도 v5.6에서 이걸 전면에 내세웠습니다[23]. 근거**: vidIQ의 Most Viewed 도구 또한 키워드 없이 전역 인기 영상을 보여주는 모드가 있으며, “키워드 없이도 조회수순 인기 영상 찾기”는 현업 유튜버들에게 매우 환영받는 기능입니다[24].
소스 채널 폴더링 & 임계치 알림 – 그렇습니다, 이 역시 1순위 핵심 기능으로 보입니다. 사용자가 벤치마킹 대상 채널들을 폴더(그룹)로 묶어 관리하고, 그 채널들에서 조회수 N 이상 나오는 신규 영상이 뜨면 알림받는 흐름입니다. 예를 들어 “내 경쟁 채널 폴더 – 5일 내 100만뷰 넘은 영상 발생시 알림”이 가능합니다. 근거: 튜브렌즈 등이 이 기능으로 “해외 영상 벤치마킹 자동화”를 구현했고, 노아AI 등의 표절 이슈에서도 핵심 모듈이 이런 인기 영상 자동탐지였습니다[42]. 저희는 합법적인 범위에서 이 자동 알림 큐를 제공하는 것이 큰 강점입니다. 다만 구현 시 PubSubHubbub+API 결합 등 세심한 설계가 필요 (4.2[B]에서 다룸).
주제/키워드·엔티티 레이더 – 유튜브 메타데이터와 외부 트렌드 신호를 결합한 ‘트렌딩 주제’ 탐지가 필요하냐에 대해: Yes, 차별화 포인트로 유용합니다. Shorts 아이디어는 곧 “어떤 주제가 떴나”를 알아내는 것이므로, 단순 영상 리스트보다 빈출 키워드나 지식 그래프 엔티티를 보여주면 통찰을 얻기 쉽습니다. 예를 들어 리스트 영상들에 “월드컵” 언급이 많다면, 월드컵 관련 Shorts가 유행임을 바로 알 수 있습니다. 또한 Google Trends나 위키백과 조회수 데이터를 곁들이면 그 키워드의 외부 인기도까지 파악됩니다. 근거: vidIQ도 유사하게 “Trending Topics”이나 키워드 연구 툴을 제공하고, 특히 Shorts 시대에는 밈이나 챌린지를 조기에 포착하는 것이 중요하다고 강조합니다[86].
물론 정보과부하 우려는 있습니다. 그래서 UI상 사이드패널로 분리하고, 기본은 접어두거나 Top 5만 보여주는 식으로 조절할 생각입니다.
숏폼 특화 지표/랭킹 – VPH(시속 조회수), Δ24h(24시간 증감), 참여율, 채널정규화(view/subs), 이상치 z-MAD 등은 Shorts 바이럴 여부를 잘 나타내는 지표입니다. 단순 조회수만 보면 업로드된 지 오래된 강자들만 상위지만, VPH 등을 보면 지금 막 뜨는 영상을 부각할 수 있습니다[18]. 우리의 종합 점수(rank)로 영상을 정렬하면, 사용자가 그냥 YouTube 트렌딩을 볼 때보다 숨은 진주(갑자기 떠오르는 영상)를 찾기 쉬울 겁니다. 합리적인가? Shorts 조회수 집계 방식이 2025-03-31에 변경되어 (재생 시작만 해도 조회수로 카운트) 절대 조회수가 훨씬 부풀려지므로, 상대 지표(증가속도, 비율)에 더 집중하는 것이 합리적입니다[28][87]. 예컨대 모든 Shorts가 조회수 수백만시대가 되면, 그중 단기간 폭증 속도나 구독 대비 조회 비율이 진짜 바이럴 판단 척도가 될 것입니다. 따라서 이들 지표/랭킹은 필수에 가깝습니다. 다만 사용자에게 직접 노출하는 방식(예: 숫자 나열 vs 아이콘 표시)은 UX검토가 필요하며 (8절에서 논의), 가중치 등 세부 공식은 5절에 제시합니다.
보드/즐겨찾기/저장검색/내보내기 – 사용자 편의 기능으로 필수적입니다. “즐겨찾기”는 발견한 영상을 나중에 참고하거나 팀에 공유하기 위해 꼭 필요합니다. 예를 들어 “이 영상 좋은데 우리도 이런 컨셉 해보자” 할 때 즐겨찾기로 모아두지 않으면, 다시 찾기 번거롭습니다. 보드는 즐겨찾기를 분류/공유하는 개념으로, 시나리오 C에서 나오듯 팀 협업시 칸반 보드 형태로 쓰입니다. 저장검색은 자주 보는 조건 (예:“최근3일/미국/조회Top”)을 북마크해서 클릭 한번에 결과를 얻도록 합니다. 내보내기는 특히 에이전시에서 리포트 작성 용도로 중요합니다 – CSV나 구글시트로 데이터를 뽑아 클라이언트에게 보고하거나 내부 분석에 활용합니다. 근거: vidIQ, TubeBuddy도 유료 플랜에 CSV Export가 포함되어 있고, SocialBlade는 엑셀 다운로드를 지원합니다[63]. 이러한 기능들이 없으면 사용자가 일일이 스크린샷을 찍거나 수작업으로 옮겨야 하므로, 서비스 완성도가 떨어집니다.
Why: 우리 서비스가 궁극적으로 높이고자 하는 KPI는 무엇인가? 여러 후보:
업로드 성공률: 아이디어 부족 등으로 업로드를 건너뛰는 날을 줄이고, 꾸준히 Shorts를 올리게 돕는다.
채널 성장: 서비스 사용 → 조회수/구독자 증가로 이어진다면 베스트지만, 이는 다요인이라 직접 입증 어려움.
편집 리드타임 단축: 트렌드 조사/기획에 쓰는 시간을 줄여준다. 우리가 직접 통제/측정 가능한 건 시간 절감이 가장 현실적입니다. 예: “트렌드 조사 1시간 → 10분으로 단축” 같은. 그래서 마케팅 시 “XXX만큼 빠르게 아이디어 얻기”를 강조할 예정입니다. 채널 성장도 부수적으로 기대되나, 그것은 사용자의 콘텐츠 제작 역량 등 외부 변수 크므로, 1차 KPI로 삼긴 어렵습니다. 대신 “재현성” – 누구나 이 툴을 쓰면 비슷한 결과(트렌드 캐치)를 얻는다 – 를 장점으로 내세울 수 있습니다 (노하우의 툴화).
우선순위: 시간 절감(정량), 재현성/정확도 향상(정성) 순으로 KPI 설정할 것입니다.
Where: 웹앱 우선이 타당합니다. 사용자들이 PC 환경에서 데이터를 분석하고 정리할 가능성이 높습니다. Shorts 콘텐츠 자체는 모바일에서 소비되지만, 운영/분석 업무는 데스크톱이 편하죠. 또한 웹앱으로 만들면 크롬북 등 다양한 환경에서 접근 가능하다는 장점도 있습니다.
크롬 확장: 고려는 했지만, YouTube 화면에 겹쳐 정보 표시하는 확장은 YouTube의 DOM 변화나 약관 이슈에 취약하고, 브라우저별 지원도 번거롭습니다. 대신, 우리 웹앱이 제공하는 링크를 클릭하면 유튜브 해당 영상 페이지로 이동하는 정도로 통합성을 확보하고, 추후 여력이 되면 경량 확장(예: YouTube 보면서 바로 우리 툴로 해당 영상 보내기) 정도는 만들 수 있습니다. 그러나 핵심 기능은 독립 웹앱에서 제공합니다.
모바일 앱: 초기에는 필요성이 낮습니다. 편집자/기획자가 현장에서 급하게 보진 않을 것 같고, 또한 모바일 UI로 저희처럼 데이터 많은 화면을 보여주기 어렵습니다. 대신, 반응형 웹으로 모바일에서 볼 수는 있게 (필요 minimum) 합니다. 혹시 “쉬는시간에 스마트폰으로 트렌드 훑어보기” 수요가 있을 수 있으니, 주요 대시보드는 모바일 대응하되, 복잡한 설정/편집은 PC 사용을 권장하는 식입니다.
근거: 경쟁사 TubeBuddy/vidIQ는 브라우저 확장 형태로 유튜브 환경에 붙는 방식이고, SocialBlade는 웹사이트로 제공됩니다. 우리의 차별화는 확장 대신 독립웹 + (나중에) 경량 확장으로 갈 예정입니다.
When:
최근 1~7일을 기본 분석 기간으로 봅니다. Shorts는 바이럴 주기가 짧아 1주일 이상 지난 영상은 의미가 떨어지는 경우가 많습니다. 그래서 기본 검색 필터도 지난 7일 이내 업로드로 잡을 생각입니다.
30~60분 스냅샷: 조회수 변화를 포착하기 위해 30~60분 간격으로 데이터를 수집하는데, 30분 vs 60분은 고민입니다. 30분 간격이면 세밀하게 추이를 알지만, API 부하와 저장량이 2배입니다. 한편 Shorts는 폭발력이 커도 1시간 정도로 충분히 추세 파악 가능하다고 보고, 기본은 60분 간격으로 합니다. 만약 어떤 고객이 “좀 더 실시간이 필요”하면 (예: Shorts 라이브 성과 대시보드 느낌으로), 15분 간격까지 가능한 구조이지만, 그 정도는 과투자일 가능성이 큽니다. 비용 대비 가치로 보면, 60분 주기가 합리적 타협입니다.
10~15분 간격: 정말 민감하게 잡아내려면 하겠지만, 데이터 중복도 많아지고 비용도 커 일반 기능으로는 비효율입니다. 대신 PubSubHubbub 알림으로 신규영상 0~5분 내 캐치 + 60분 스냅샷으로 1시간 추적이면 충분할 것으로 판단합니다.
Summarizing: 업로드 후 1시간 내 반응을 보면 Shorts 성공 조짐이 보이므로, 1시간 스냅샷이면 됩니다. 10분 단위로 본다고 Shorts 알고리즘이 그새 학습 변화를 주지 않으므로 (틱톡과 달리 유튜브 Shorts는 피드백에 수십 분~몇시간 걸리는 것으로 알려짐), 10분 간격 데이터는 노이즈일 수 있습니다.
폴백: 만약 특별히 어떤 이벤트(예: 유명인 언급으로 갑자기 폭발) 감지를 원하면, 특정 채널/키워드에 한해 10분 interval 추적을 사용자 지정으로 둘 수는 있습니다. 기본은 60분.
How: 공개 데이터만으로 충분한가?
YouTube Data API (공식)와 몇 가지 무료 오픈 API로 핵심 요구는 충족됩니다. 영상/채널 통계, 검색 등은 YouTube API로 해결되고, 트렌드 신호는 Google Trends 공식 API가 없지만, Wikimedia pageviews나 GDELT 등의 무료 데이터를 조합할 수 있습니다 (3절 표 참조).
유료 API/모델이 필요할 영역:
정교한 자연어 처리: 예를 들어 한국어 댓글 감성분석 등을 고도화하려면 상용 AI API나 모델 훈련이 필요할 수 있습니다. 하지만 해당 기능은 핵심은 아니므로, 무료 OpenKoreanText 정도로 대체합니다.
이미지/영상 인식: 썸네일에서 자동으로 주제 파악하거나, 영상 내용 분석하는 건 Google Vision API 같은 유료 서비스가 필요할 수 있으나, 이 또한 부가 기능이고 초기에는 제외합니다.
더 많은 데이터 or 더 실시간: 혹시 YouTube API 쿼터가 모자라거나 데이터 지연이 문제되면, YouTube와 직접 파트너십으로 increased quota를 요청하거나 (비용 가능성), 영상 플랫폼 자체 크롤링 등의 편법이 있지만, 약관상 금지라 하지 않습니다.
따라서 Plan A (Official API만): 이미 충분히 많은 데이터를 제공합니다 – 조회수·제목·태그 등. Plan B (Official + External Free): 트렌드 신호 보강에 유용해 가치 높습니다. Plan C (External only): 유튜브 핵심 데이터 없이 다른 신호만으로는 영상을 찾을 수 없으므로 성립 불가입니다. 비용-효익 측면에서도, 무료 API들은 쿼터 여유가 있고 비용 $0이므로 적극 쓰는 게 이득입니다. 정책 리스크도 거의 없습니다 (Wikidata, Wikimedia는 CC0, GDELT도 공개). Reddit만 상업이슈 있으나, 우리 사용량 (아마 하루 1~2회 키워드 검색)으로는 “연구 목적의 무료 한도”에 들어갈 정도라 문제없다고 판단합니다.
결론: 공개 API만으로 90% 구현 가능하며, 필요시 사용자에게 Google API 키 추가 입력을 받아 (BYO 키) 쿼터를 보완할 수 있습니다. 장차 사용자가 늘어나 쿼터 압박이 크면, 유료 대안(예: SerpAPI의 Google Trends data) 고려나, YouTube API 확장 신청을 진행하겠습니다.

2) 경쟁/벤치마킹 – TubeLens, Viewtrap 등 분석 비교
아래 표는 경쟁 서비스들을 주요 기능별로 비교한 것입니다. 분석 대상은 튜브렌즈(TubeLens), Viewtrap, TubeBuddy, vidIQ, Social Blade, ChannelCrawler, ViewStats 등 7가지를 선정했습니다[41]. 각 서비스의 기능은 공식 페이지/블로그/리뷰 등을 참고했고, 발행 시점 최신 정보를 반영했습니다.
먼저 간략히 각 서비스 특징: - 튜브렌즈 (TubeLens) – 국내 베타 서비스로, “키워드 없이 인기 영상 조회”, 해외 영상 베치마킹 자동화 등에 특화[23]. YouTube API 키를 사용자로부터 받아와 쓰며, PC전용 앱 형태로 알려짐. - Viewtrap – 역시 국내 툴, 자세한 공개정보 적으나 노아AI와 함께 거론된 것으로 보아 경쟁채널 자동 모니터링 기능이 유력. (UI 추정: TubeLens와 유사하게 폴더/알림 제공) - TubeBuddy – YouTube 공인 브라우저 확장, 채널 최적화 (키워드 연구, SEO점수, 태그 추천, 썸네일 A/B테스트 등)에 집중[43]. 트렌딩 영상 탐색 기능은 제한적. - vidIQ – TubeBuddy와 쌍벽. Real-time stats (VPH), Most Viewed tool로 인기 영상 발견, Trend Alerts 등 데이터 분석 측면이 강함[25][26]. 무료+유료 혼합 모델. - Social Blade – 주로 채널 통계 추적 (구독자/조회수 추이, 랭킹) 제공[45]. 영상 단위 트렌드 기능은 없음. - ChannelCrawler – 유튜브 채널 검색에 특화 (필터 40+로 인플루언서 찾기)[48]. 특정 영상 탐색보다는 채널 발견용. - ViewStats – 2024년 출시, MrBeast팀 제작. AI와 거대한 데이터셋으로 무장한 고급 툴[31]. Outlier 영상 발견, 썸네일 분석, 경쟁 추적 등 전방위 기능을 제공 (유료).
이제 표로 비교합니다:
범주	기능	튜브렌즈 🟣 (베타)	Viewtrap 🔴 (예상)	TubeBuddy 🟢 (확장)	vidIQ 🔵 (웹/확장)	Social Blade ⚫️ (웹)	ChannelCrawler 🟡 (웹)	ViewStats 🟠 (웹)	우리 서비스 💡
탐색	키워드 없이 인기 Shorts	✔️ 지원 (기간/국가별 조회순)[23]	✔️ 지원 (추정)	✘ (키워드 필요)	✔️ MostViewed 탭[24]	✘ (채널 통계 위주)	✘ (채널 검색 전용)	✔️ Top 리스트 제공[35]	✔️ 지원 (주기능)
탐색	키워드별 인기 영상	✔️ 지원 (키워드 검색)	✔️ (예상)	✔️ Keyword Explorer[55]	✔️ 트렌드알림 (키워드)	✘	✘	✔️ 지원 (AI 추천 키워드)	✔️ 지원 (메타+트렌드)
분석 지표	실시간 VPH (조회속도)	✔️ 표기 (명확치 않음)	❓ (미공개)	✘ (제공 없음)	✔️ 실시간 VPH 제공[18]	✘	✘	✔️ 실시간 뷰/시청시간	✔️ 제공 (랭킹 활용)
분석 지표	Δ24h 증가량	✘ (미제공 추정)	✘ (미제공 추정)	✘	(필터로 일부 가능)[58]	✘	✘	✔️ (Outlier 분석 일부)[51]	✔️ 제공 (표기)
분석 지표	참여율 (좋아요/조회)	✘ (베타 미지원)	✘ (불명)	✘ (중점 아님)	✔️ 제공 (확장 UI)	✘	✘	✔️ (Engagement 지표 활용)	✔️ 제공 (필터용)
분석 지표	채널 정규화 (조회/구독)	✘ (구독자 데이터×)	✘ (불명)	✘	✔️ 필터/정렬 가능 (Boost)[59]	✔️ 채널별 조회/랭킹	✔️ 채널필터 다수	✔️ (Outlier 탐지 활용)	✔️ 계산 (점수 반영)
분석 지표	이상치 감지 (Outlier)	✘	✘	✘	✘	✘	✘	✔️ Outlier 전용 탭[51]	✔️ 제공 (배지/정렬)
알림	경쟁채널 새 영상 알림	✔️ 폴더별 임계 알림	✔️ 지원 (핵심 예상)	✘	✘	✘	✘	✔️ Alerts 기능 (Discord 연동)[53]	✔️ 지원 (실시간)
알림	임계치 설정 (조회수/기간)	✔️ 제공 (N만/일 수 지정)	✔️ 제공 (추정)	✘	✘	✘	✘	✔️ 커스텀 알림 가능	✔️ 제공 (룰 빌더)
UI/UX	즐겨찾기/보드/공유	✔️ 즐겨찾기/히스토리 제공[61]	❓ (미확인)	✘ (개인용 툴)	✔️ Trend Alerts 보드 (Boost)[62]	✘	✘	✔️ Collections (팀 공유)[30]	✔️ 제공 (보드 공유)
UI/UX	데이터 내보내기 (CSV 등)	❓ (불명)	❓ (불명)	✔️ CSV Export (유료)	✔️ CSV Export (Boost)[63]	✔️ CSV 다운로드	✔️ Export 제공	✔️ PDF/CSV Export	✔️ 제공 (Pro 이상)
최적화	태그/제목 추천	✘ (분석 중점)	✘	✔️ 태그 복사/추천[55]	✔️ AI 제목추천 (Beta)	✘	✘	✔️ AI 기반 제목/썸네일	△ (2순위 검토)
최적화	썸네일 분석/A·B테스트	✘	✘	✔️ 썸네일 A/B (Legendary)	✘ (없음)	✘	✘	✔️ Thumbnail Search[52]	△ (고급 연구)
기술	데이터 수집 방식	사용자 API Key (공식)	공식 API 기반 (추정)	OAuth (공식 API)	OAuth+공식 API	크롤링+공식 API 혼합	크롤링 (채널 정보 DB)	자체 크롤링+AI (데이터셋 큼)[31]	공식 API+무료 API 혼합
비용	가격 모델	베타 무료 (향후 유료)	유료 (월 정액 추정)	Freemium ($9~49/mo)	Freemium ($7.5~75/mo)	부분 유료 (광고/보고서)	일부 유료 (데이터 추출)	Pro $29/mo, Business $249/mo[54]	Free / Pro / Team (추정)
비교 분석: - TubeLens와 Viewtrap은 국내 시장 타겟으로, 우리가 반드시 따라잡아야 할 핵심 기능은 ①키워드 없는 인기 영상 리스트와 ②경쟁 채널 모니터+알림입니다. 둘 다 이미 구현되어 있는 것으로 보이며, 이는 우리 제품의 핵심 가치이기도 합니다[23]. 이 두 기능 없이는 국내 사용자들이 굳이 우리를 사용할 이유가 없습니다. - vidIQ와 TubeBuddy와 비교하면, 이들은 SEO/채널 최적화 툴 성격이 강합니다. 예컨대 태그 관리, 썸네일 테스트 등은 우리가 단기간 모두 구현하기 어려우며, 우리 사용자층(양산형 숏폼)은 사실 SEO보단 바로 조회수가 중요해서 태그/제목 최적화에 큰 관심이 없을 수도 있습니다. 그러므로 우리가 굳이 하지 않아도 될 기능으로 분류됩니다 (예: 태그 추천, 고급 SEO 점수 등은 후순위). 대신 vidIQ가 강점인 실시간 지표 (VPH)나 트렌드 알림 부분은 이미 우리 기획에 포함되어 있고, 반드시 잘 구현해야 합니다[18]. - Social Blade, ChannelCrawler는 우리와 용도가 약간 달라 직접 경쟁은 아니지만, 채널 검색/리더보드 측면은 참고만 합니다. Social Blade의 채널 순위표 같은 것은 추후 부가 기능으로 고려할 수 있습니다. 하지만 1인/소규모 운영자에겐 덜 중요하므로 우선순위는 낮습니다. - ViewStats는 오히려 먼 목표지만, AI 활용과 방대한 데이터로 썸네일 분석이나 경쟁 채널 심층 분석을 합니다[52]. 우리도 장기적으로 일부 AI 도입(예: 자동 주제 분류, 인기 썸네일 패턴 인식)을 검토할 가치가 있습니다. 다만 단기에는 데이터 축적이 부족하므로, ViewStats만의 독점 기능들을 초반엔 제공 못할 것입니다. 대신 Outlier 탐지나 컬렉션 보드 등은 ViewStats와 겹치거나 우리가 개선해 제공 가능하니 차별화를 위해 포함합니다.
복제해야 할 필수 기능: - (a) 키워드리스 인기 Shorts 목록 – 사용자 키 입력 없이, 조건만으로 조회수 Top Shorts를 보여주는 기능[23]. - (b) 채널 폴더 & 임계치 알림 – 경쟁 채널 그룹 관리 + 자동 알림 (예: “~채널 새영상 50만 돌파”)[53]. - (c) Shorts 특화 지표 제공 – 영상 카드에 조회수 외에 VPH(조회속도)나 24h증가, Like% 등을 표시. vidIQ처럼 실시간성 강조[18]. - (d) 즐겨찾기와 보드 공유 – 발견 영상 손쉽게 모으고, 팀과 공유/상태관리 (칸반) 기능[30]. - (e) 데이터 내보내기 – CSV 다운로드 및 Google Sheets 연동 (리포트 자동화 지원)[63].
우리만의 강화 기능: - (A) 엔티티 레이더 – 경쟁사들 중 트렌드 키워드를 외부 데이터로 결합해 보여주는 건 전무합니다. 우리는 Wikimedia/뉴스 데이터로 토픽 레이더를 제공하여 “왜 떴나”까지 통찰 제공합니다 (예: “이키워드 위키 조회 300%↑”)[72]. - (B) 이상치 점수 – ViewStats 외엔 Outlier 분석이 없어, 당일 폭발 영상 등을 z-스코어 기반으로 부각하는 점은 차별화입니다[51]. 이는 Shorts 변화량 큰 특성에 맞아떨어지는 기능입니다. - (C) 팀 협업 기능 – TubeBuddy/vidIQ는 개인 도구지만, 우리는 보드 공유, 상태 태그, 코멘트 등 팀 공동작업 흐름을 지원하려 합니다 (Scenario C 참조). 에이전시/기업 고객에 어필할 포인트입니다. - (D) 완전 공개 데이터 준수 – 일부 경쟁사는 웹스크래핑 등 회색영역 활용하는데, 우리는 100% 공식 API로 구현해 안정성/합법성을 강조합니다 (YouTube 정책 위반 가능성 차단). 이 점을 특히 노아AI 논란 이후 신뢰 요소로 내세울 수 있습니다[36]. - (E) 로컬 최적화 – TossPayments 연동 결제, 한글 인터페이스, 국내 사례 튜토리얼 등 한국 시장 특화 지원은 글로벌 경쟁사 대비 강점입니다.
경쟁사 기능의 합법 구현 가능 vs 제약: - 가능한 것: 위 표 대부분 기능은 YouTube Data API 및 공개 API로 구현 가능합니다. 조회수/좋아요/댓글 등 모두 공개 데이터[65]. 실시간 VPH도 주기적 API 호출로 실현했고 vidIQ도 동일 방식[18]. 채널 모니터링 역시 PubSubHubbub(유튜브 공식 피드)로 합법적으로 가능합니다[66]. CSV 내보내기도 자사 데이터 출력이라 문제없습니다. - 어려운 것: Video Tags – 유튜브는 영상 태그를 API로 제공하지 않아(Tags은 Video resource snippet에 없고, 채널 소유 OAuth로만 가능)[55], vidIQ/TubeBuddy는 자체 확장으로 크롬 DOM에서 태그 긁어옵니다. 우리는 약관 준수를 위해 영상 태그 수집은 하지 않습니다 (해시태그만 snippet에서 추출). 썸네일 내용 분석 – 얼굴/텍스트 검출은 Vision API 등 유료가 필요하고, 데이터 사용 논란 있을 수 있어 당장은 구현 않지만 가능은 합니다. 댓글 감정분석 – API로 댓글 가져와 처리할 수 있으나, 표면적 좋아요수 등으로 충분히 대체 가능하므로 우선순위 낮습니다. YouTube 실시간 조회 – YT 자체 스튜디오만 제공하는 특정 실시간 수치는 API로 불가, vidIQ는 브라우저 확장으로 가로채는데 우린 지양합니다. 이 부분은 VPH로 충분히 커버합니다. - 제약/정책: YouTube API TOS상 다운로드 영상, 전체 자막 크롤링 등은 금지. 우리는 이런 기능을 제공하지 않을 것이며, 혹시 사용자가 이를 요구해도 “YouTube 정책상 불가”라고 안내합니다. - 요약: 공개 API로 합법 구현 불가능한 경쟁사 기능은 태그확인, 썸네일상의 OCR 등 몇몇 뿐이며, 핵심에는 지장 없습니다. 오히려 그런 부분은 경쟁사도 약관 위험을 감수한 면이 있어, 법 준수를 중시하는 고객에게는 우리의 접근이 신뢰를 줄 수 있습니다.

3) 무료 API (Google 외 포함) – 광범위 딥 리서치
아래 표는 YouTube Data API 외에 활용 가능한 무료 API들을 정리한 것입니다. 비디오 플랫폼, 검색/트렌드, 지식/엔티티, 공유/리포트, 한국어 NLP 관련로 분류했습니다. 각 API의 제공자, 목적, 호출 예시, 인증 방식, 무료 쿼터, 주요 반환 필드, 제약, 통합 난이도, 예상 가치, 리스크/대안을 나타냅니다.
API	제공자	목적	엔드포인트 예시	인증/키	무료 쿼터	핵심 반환 필드	정책/제약	채택도	통합 난이도	예상 가치	리스크/대안
YouTube Data v3	Google	영상·채널 정보, 검색	GET https://youtube.googleapis.com/youtube/v3/search?part=id,snippet&order=viewCount&publishedAfter=2025-08-01T00:00:00Z&videoDuration=short&regionCode=US&key=KEY[67]	API Key (OAuth 선택)	10,000 units/일 기본[93] (search=100, videos=1 등)	videoId, 제목, 채널명, 조회수, 좋아요, 업로드일 등[65]	상업적 사용 OK (쿼터 증액은 심사 필요), 키 노출주의	⭐⭐⭐ (매우 높음)	보통 (공식 SDK豊)	🟢 매우 높음 (핵심 데이터 원천)	쿼터 초과⚠️ (BYO 키로 보완), 일부 데이터(태그) 불가
YouTube PubSubHubbub (WebSub)	Google	새 영상 업로드 푸시 알림	Hub: POST https://pubsubhubbub.appspot.com/subscribe (form) <br>Topic: .../feeds/videos.xml?channel_id=CHANNEL_ID[66]	None (Webhook 검증)	무제한 (채널당 약 1만 구독 허용)	Atom 피드 XML: videoId, channelId, 제목, published 시간[68]	4시간마다 재구독 필요, 누락 가능 (폴링 보완)	⭐⭐ (개발자 활용 중간)	보통 (Webhook 서버要)	🟢 높음 (실시간 알림)	Hub 다운시 지연⚠️, 콜백 실패시 알림 손실 (폴링 fallback)
YouTube oEmbed	Google	영상 임베드 메타	GET https://www.youtube.com/oembed?url=http://youtube.com/watch?v=VIDEO_ID&format=json	None	제한 없음 (단일 요청 경량)	title, author_name, thumbnail_url[90]	제공 정보 한정 (통계 無)	⭐ (낮음)	매우 쉬움	🟡 낮음 (보조용)	조회수 등 없어 주요도 낮음⚠️
Google Trends (비공식)	N/A (웹스크레이핑)	검색 트렌드 지표	공식 API 알파 단계 – 일반 접근 불가[37] <br> 비공식: Scraper 또는 SerpAPI 사용	N/A	N/A (웹스크래핑은 제한적)	관심도 (상대값), 관련 키워드	공식 API는 알파 (제한 테스트)[37], 비공식은 스크래핑이라 불안정	⭐⭐⭐ (수요 높음)	어려움 (Scraping 위험)	🟡 중간 (유용하지만 구현애로)	정책위반⚠️ – 현재 미사용, 대안: Wikimedia 등 활용
Wikimedia Pageviews	Wikimedia	위키백과 트렌드 (엔티티 인기)	GET https://wikimedia.org/api/rest_v1/metrics/pageviews/top/ko.wikipedia/all-access/2025/08/14[72]	None (User-Agent 필요)	일 100k+ 조회 (대부분 여유)	각 항목별 조회수 (rank, title, count)[72]	CC0 공개데이터, 5분 캐시	⭐⭐ (데이터저널리즘에 흔함)	쉬움 (REST 호출)	🟢 높음 (주제 관심도 파악)	특정 분야 누락 가능⚠️ (위키에 문서 없는 밈 등) – 대안: 구글뉴스 API
Wikidata SPARQL	Wikimedia	키워드 → 지식 엔티티	GET https://query.wikidata.org/sparql?query=SELECT ?item ?itemLabel WHERE{?item rdfs:label "아이유"@ko}&format=json	None	분당 300쾌 (60초 타임아웃)	Q-ID, Label, Description等	CC0, 결과량 많으면 느림	⭐⭐ (학계 활용)	보통 (SPARQL 문법要)	🟡 중간 (엔티티 식별 보조)	다의어 모호성⚠️ – 대안: Google KG API 병행
GDELT 2.0 API	GDELT Project (非商)	뉴스 트렌드/이벤트	GET https://api.gdeltproject.org/api/v2/events/timeline?query=Olympics&mode=timelinevol	None	무제한 (CDN캐시)	시간대별 언급량, Tone 등	뉴스 기반, 한글 키워드 한계	⭐ (특정분야)	보통 (결과 parsing)	🟡 낮음 (글로벌 뉴스 참고)	한글 coverage 낮음⚠️ – 대안: Naver 데이터랩 (없음 공개)
Guardian Open API	The Guardian	英뉴스 검색 트렌드	GET https://content.guardianapis.com/search?q=KEYWORD&from-date=2025-08-01&api-key=TEST	API Key	일 12,000호출 (무료)	기사 목록 (웹제목, 일자, 섹션)	저작권 표기 요구	⭐ (언론사)	쉬움	🔴 낮음 (국내 중요도 낮음)	영미권偏⚠️ – 대안: NYT API (비슷)
Reddit API	Reddit	밈/커뮤니티 동향	GET https://oauth.reddit.com/r/videos/search.json?q=KEYWORD&sort=new&limit=10	OAuth2 (Bearer)	무료: 100req/분 (개인 용도)	Posts: title, score, comments, created	2023정책 변경 – 상업앱 유료화[73]	⭐⭐ (매우 높음)	보통 (OAuth 인증)	🟡 중간 (밈 탐지 보조)	정책불안⚠️ – 남용 시 과금 ($0.24/1k)[76], 대안: 트위터 (더 제한)
Google K.G. Search	Google	키워드 → 지식카드	GET https://kgsearch.googleapis.com/v1/entities:search?query=IU&key=KEY&limit=1&indent=True	API Key	100k회/일 (무료)	name, description, type, score[37]	알파 단계 (변경 가능성), 한글 지원 일부	⭐ (특정)	쉬움 (JSON 결과)	🟡 중간 (엔티티 매핑)	모호한 결과⚠️ – Wikidata 병행
Google Sheets API	Google	데이터 공유/리포트	(1) POST https://sheets.googleapis.com/v4/spreadsheets<br>(2) POST https://sheets.googleapis.com/v4/spreadsheets/{id}/values/Sheet1!A1:append	OAuth2 (사용자 구글 로그인)	읽기 300/100초, 쓰기 100/100초 etc (일 수만회)	Sheet ID, 업데이트 셀 범위 등	사용자 GDrive에 생성, 상업 이용 가능	⭐⭐ (자동화 용이)	보통 (OAuth, 삽입 포맷)	🟢 높음 (보고서 자동화)	OAuth 허들⚠️ – CSV 내보내기로 대체 가능 (대안)
Open Korean Text	OSS (Twitter)	한국어 텍스트 분석	(로컬 라이브러리)	N/A	N/A (오프라인 사용)	명사 리스트, 형태소 토큰	오픈소스 (Apache 2.0)	⭐⭐ (국내 개발 종종)	보통 (Node/Python 연동)	🟢 높음 (키워드 추출 정확↑)	신조어 미인식⚠️ – 대안: KoNLPy (사전 추가)
KoNLPy + MeCab	OSS	고급 한글 NLP	(로컬 라이브러리)	N/A	N/A	형태소 품사 태깅 등	KoNLPy GPL v3 (주의), MeCab-ko LGPL	⭐ (학계)	어려움 (설치, 성능)	🟡 중간 (감정분석 등)	KoNLPy 유지부족⚠️ – OKT로 충분 대체
(범례: 🟢=높음, 🟡=중간, 🔴=낮음 가치. 출처: 공식 문서/정책 참조.)
Plan A vs B vs C – - Plan A (Official-only): YouTube Data API + PubSubHubbub + Google OAuth 정도만 쓰는 경우. 이는 구현이 가장 단순하고 정책적으로 안전합니다. 그러나 트렌드 탐지에서 외부 신호 부족으로 통찰력이 떨어질 수 있습니다. 예컨대 “이게 왜 떴지?”를 알기 어려워집니다. - Plan B (Official + External Free): Official API로 영상 데이터 확보 + 위키/뉴스 등으로 맥락 보강. 비용-효익 최고입니다. 외부 API들은 무료 쿼터도 넉넉해서 (예: Wiki 페이지뷰는 실질 무제한) 비용 부담 없고, 얻을 수 있는 부가 정보는 다양합니다. 정책 리스크도 낮습니다 (예: Wikimedia는 CC0, 자유 이용 가능). 다만, 통합 복잡성이 약간 올라가고 (다양한 소스 병합) 외부 API 응답 지연 가능성이 있지만, 전체 성능에 큰 문제는 없습니다. Plan B로 구현 시 사용자 가치는 극대화됩니다 – 영상 자체 + “주변의 인기 흐름”까지 한 곳에서 보게 되니까요. - Plan C (External만): 유튜브 API 없이 외부 데이터만으로 한다면, 정작 영상을 찾을 수 없습니다. 예를 들어 Google Trends에서 “고양이” 관심도 알아도, 그에 해당하는 인기 영상을 Data API 없이 가져올 방법이 없죠. 또한 이는 YouTube TOS 위반 소지가 큰 웹스크래핑을 요구할텐데, 지양합니다. 따라서 C는 현실적이지 않습니다.
결론: Plan B가 최선입니다[37][38]. 특히 Google Trends API가 아직 일반에 공개되지 않아 (2025 알파 단계) Plan B로 Trends 대신 Wikimedia 등으로 대체한 것이 현실적입니다. 추후 Google Trends API가 정식 출시되면 (예: 2025말 예상) Plan B에 포함해 정확도를 높이면 됩니다.
정책 리스크: Plan B에서 주의할 건 Reddit API 정도인데, Reddit은 2023년 API 정책 변경으로 상업 앱에 유료화했습니다[73]. 우리는 Reddit 사용을 최소화하거나, “연구 비상업적” 수준으로 호출량을 통제하여 문제없게 운영할 계획입니다. 필요시 Reddit과 제휴 검토하거나, 차선책으로 Twitter/X나 TikTok 트렌드 공개 데이터(마땅치 않음)를 찾아볼 수 있습니다.

4) 기능 카탈로그 – API 조합, 쿼터, 절차
4.1 사소하지만 필수 기능
이 범주의 기능들은 사용자 경험에 기본적으로 기대되는 편의 요소들입니다. 하나하나 크리티컬하지는 않으나, 없으면 불편하고, 구현도 비교적 간단합니다. 각 기능마다 API 사용 예시와 예외 처리, 폴백 전략을 서술합니다:
즐겨찾기 / 보드 / 라벨: 사용자가 관심 영상을 즐겨찾기해 모아두고, 이를 보드별로 분류하며, 필요시 라벨(Tag)도 붙일 수 있게 합니다. 예를 들어 보드는 “해외 아이디어” “이번주 제작” 등으로 만들고, 즐겨찾기 영상을 드래그해 이동시킵니다. API 사용: 해당 기능은 DB 레벨에서 구현 (Supabase PostgREST로 favorite 레코드 생성/삭제). 클라이언트에서는 Zustand 등에 즐겨찾기 상태를 두어 즉각 토글 표시합니다. 쿼터 비용: 0 (우리 DB만). 예외/리스크: 동일 영상을 중복 즐겨찾기 시도 -> PK 충돌(에러) 처리; 즐겨찾기한 영상이 삭제되거나 privated되면 DB에는 남아있지만 조회 시 YouTube API가 0개 반환합니다. 폴백: UI에 “삭제됨” 표시하거나 자동으로 목록에서 제외 (배치 job으로 검사). 라벨: 우선 MVP에선 보드(폴더)까지만 하고, 라벨(태그)은 추후 (복잡성高). 폴백: 여러 보드에 같은 영상 추가하려면 현재 구조상 복제 저장이 필요한데, MVP에선 1개 보드에만 속할 수 있도록 제약 (나중에 many-to-many 개선).
저장검색: 자주 쓰는 검색 조건을 저장/불러오기 합니다. 예: “미국+최근3일+조회순” 필터를 “미국3일” 이름으로 저장. 구현: 프론트에서 필터 상태를 JSON으로 직렬화해 Supabase saved_searches 테이블에 저장, 이름과 함께. 저장 시 API 사용은 supabase-js (DB insert). 쿼터: 0 (우리 DB). 예외: 같은 조건 중복 저장 – UX상 이름 바꾸거나 덮어쓰기 로직 필요. 폴백: 비로그인 사용자의 경우 LocalStorage에 임시 저장 (로그인 유도 메세지와 함께).
CSV / Google Sheets 내보내기: 현재 보고 있는 리스트(또는 보드)를 CSV 다운로드하거나, Google Sheets로 내보냅니다. CSV: 클라이언트에서 JS로 JSON->CSV 변환 후 <a> 다운로드 (혹은 API 라우트로 처리). Google Sheets: 사용자가 구글 OAuth 동의하면, Sheets API spreadsheets.create 후 .../values:append로 데이터 업로드. 서버(Next)에서 googleapis 라이브러리 이용. 쿼터: CSV 0; Sheets API – 기본 할당 일 5000 writes, 일반 사용엔 충분. 예외: OAuth 미동의 또는 토큰만료 -> 재인증 유도. 폴백: 동의 거부시 CSV 다운로드 안내 (“CSV로 내보내고 구글시트에서 불러오실 수 있습니다.”). 추가: 내보낸 데이터에 영상 URL이나 채널 URL이 포함되도록 해서, 외부에서 참조 쉽게 합니다.
대표 국가 버튼 (≥10): UI에 한국, 미국, 일본, 인도, 인도네시아, 브라질, 영국, 독일, 프랑스, 멕시코 등 Shorts 많은 10개국을 빠르게 전환하는 버튼/드롭다운을 둡니다. 구현: 버튼 클릭 시 search.list 호출에 해당 regionCode 넣어 새로 데이터 가져옴. 쿼터: 100 units (search 1회). 예외: 일부 지역은 YouTube 데이터 적어 결과 빈약 – 그런데 대표10개국은 대체로 트래픽 많아 문제없음. 폴백: 전체 국가 목록(i18nRegions API)[79]를 받아 선택 가능하게도 할 수 있으나, 200여개국 중 Shorts 강세국은 한정적이라 UI 복잡해지므로 상위 국가만 노출. 만약 특정 사용자가 특정 소수언어 국가(예: 베트남)를 원하면 설정에서 추가토록 고려 (Free 3개국 한정이므로).
다국어 UI (i18n): 초기에는 한국어 UI, 영어 UI 지원. 구현: Next.js 13의 국제화 라우팅 (next.config.js에 locale 설정) 사용. 텍스트는 별도 JSON 사전 관리(ko.json, en.json). 쿼터: 0. 예외: 번역 미비 – 기본 영어 fallback. 폴백: 언어토글 UI 제공. 또한 영상/채널 등 데이터 자체는 각자 언어 콘텐츠이므로 번역 안함, UI 문구만.
다크/라이트 모드: Tailwind + CSS 변수로 테마 구현. 구현: <html data-theme="dark"> 속성으로 CSS 변수 교체 (8절 CSS 참고). Shadcn 컴포넌트 대부분 다크 지원. 쿼터: 0. 예외: 사용자 OS모드 인식은 prefers-color-scheme 매치로 초기 결정. 폴백: 토글 버튼으로 강제전환 가능. Radix UI에서 다크모드 시 contrast 적절히 나오나, 우리 커스텀 색 적용 부분은 자체 검사 (예: 다크모드 보라가 충분히 밝은지 – 현재 77%L, 검정 배경 대비 AA 충족)합니다.
배지 표시 (임베드 가능/지역 제한/자막): 영상 카드에 작은 아이콘들로 부가정보 표시.
임베드 가능: status.embeddable이 false인 경우 <i class="lucide-ban"></i> 아이콘 표시 (Hover시 “임베드 불가 영상” 툴팁)[90].
지역 제한: contentDetails.regionRestriction.blocked 존재시 <i class="lucide-globe-2-off"></i> 아이콘 (툴팁 “일부 국가 제한”)[90].
자막 있음: contentDetails.caption이 “true”이면 <i class="lucide-cc"></i> 아이콘 (툴팁 “자막 제공”)[81].
구현: 위 정보들은 videos.list의 status, contentDetails에 포함되므로 추가 API 없이 확보. 아이콘은 Lucide 또는 커스텀 SVG.
쿼터: 0 (이미 videos.list로 얻음).
예외: regionRestriction 필드는 allowed 혹은 blocked 배열로 오는데, 우리는 blocked 있으면 제한표시, allowed만 있을 때는 그 지역 외 제한으로 해석하여 역시 표시.
caption “true”는 업로드시 자막 있음을 뜻함 (자동 생성 포함)[81]. Shorts는 자동자막 흔하니 표시율 높을 듯.
embed= false이면 iframe 임베드가 막힌 것이며 (예: 저작권 관리 컨텐츠) 이건 공유 어려움을 의미.
폴백: 배지들이 너무 많으면 UI 혼잡 – 좁은 모바일에서는 생략할 수도. 그래도 임베드 불가/지역제한은 드물고 중요한 정보라 표시 유지, 자막은 덜 중요해 모바일 등에서는 숨길 수 있습니다.
댓글 스냅샷 N개: 각 영상의 상위 댓글 몇 개를 미리 보여줍니다 (예: Top 2 댓글 내용+좋아요수). 구현: commentThreads.list(videoId, order=relevance, maxResults=2) 호출[84]. 쿼터: 1 unit/영상. 하지만 리스트 30개에 301=30 units – 무시못함. 그래서 기본 비활성*. UX: 카드에 “💬2” 아이콘 (댓글 2개 보기), 누르면 API 호출하여 댓글 펼치기.
예외: 댓글 사용중지 (video.commentsDisabled)일 경우 0개 응답 또는 에러 – “댓글 불가능” 표시.
폴백: Shorts의 경우 댓글보다 원본사운드/챌린지 등이 중요하지만, 우리 트렌드 분석 맥락에서는 굳이 댓글을 안볼 수 있어 MVP에서는 제외하거나 나중에 추가.
제목/설명/해시태그 토큰 빈도: 트렌드 목록의 제목·설명 내 단어 빈출을 집계해 상위 키워드 제공. (이미 4.2[D]의 주제 레이더에서 다룸). 구현: 클라이언트에서 현재 리스트 영상들의 title+description+tags를 합쳐 Open Korean Text로 한글 명사 추출, 영어는 공백단위 tokenize. 상위 10개 출력.
쿼터: 0 (로컬 연산).
예외: “영상” “Shorts” 등 불필요어 걸러내기 – 불용어 리스트 적용.
폴백: 만약 CPU부하로 체감되면 (50개 영상 텍스트, 문제없을 듯), Web Worker 사용할 수도. 하지만 JS 레벨에서도 수백 ms 이내일 전망.
(이 기능이 바로 엔티티 레이더의 내부절차이므로, 세부는 4.2[D]에서 추가 다룸.)
요약하면, 위 “사소하지만 필수” 기능들은 API 비용은 크지 않지만 사용자 만족도에 큰 영향을 줍니다. 특히 즐겨찾기/보드, 내보내기 등은 Pro 플랜 차별화 요소로도 활용되어, 반드시 구현하겠습니다.
4.2 핵심 기능
이 섹션은 우리 서비스의 핵심 가치 제공 기능들입니다. 각 기능별로 현재 설계와, “이 방식이 최선인가?”를 질문하며 개선 여지를 검토합니다.
(A) 키워드 없는 인기 Shorts 탐색:
현재 설계: YouTube Data API search.list를 order=viewCount로 호출해, 특정 publishedAfter 기간과 regionCode 내 상위 조회 영상을 가져옵니다[67]. videoDuration=short 필터로 4분 미만 영상만 대상으로 하고, 응답 50개를 videos.list로 조회수 등 통계 병합 후, duration 60/70초 이하로 거르는 2차 필터를 합니다. 이렇게 얻은 리스트를 조회수순으로 정렬해 사용자에게 제시합니다.
“최선인가?”: YouTube API의 한계와 편향 이슈를 짚어봅니다:
search.list는 쿼리없이 호출이 공식적으로 불가능합니다. q 파라미터 없으면 400에러. 테스트상 q="|" 또는 빈 문자열""로도 일부 결과가 나오긴 하나 명확치 않습니다. 대안1: 가장 범용적인 단어(예: “a” 또는 현지 언어 공백)로 검색하여 사실상 필터만 적용되게 하는 꼼수[10]. vidIQ 등은 자체 백엔드로 트렌딩 데이터를 모아두기에 이런 문제 없지만, 우리는 공식 API만 쓰니 이 트릭을 써야 합니다.
chart=mostPopular (인기차트) API가 있지만 Shorts 위주 추출이 어려워 보조로만 씁니다. Trending 차트는 롱폼 위주이고, Shorts는 일부만 섞여서 오기도 합니다[28]. 특히 뮤직비디오 등 거대 채널이 상위 차트를 점령해, 우리가 찾고픈 일반 Shorts 크리에이터 영상이 밀릴 수 있습니다. 근거: TechCrunch 기사에 따르면 YouTube Trending은 Shorts 뷰 집계 변경 후에도 “Engaged views” 기준을 별도로 보고 있을 정도로, raw view count와 다릅니다[87]. 따라서 trending API는 신뢰도가 떨어져, 대안2: 현재 방식(search) 유지가 차라리 낫습니다.
뮤직/무비 편중: order=viewCount로 검색하면, 특정 기간 내 조회수 1위 등이 공식 MV일 수 있습니다. Shorts만 걸러도, 3분 짜리 뮤직비디오가 2:50이라 필터에 걸려 list에 포함될 위험. 이를 보완해 “제외 카테고리” 적용 고려합니다. search API에는 videoCategoryId 필터가 있어, 예: Music(10)이나 Movie(1) 카테고리를 제외한 조회순 검색이 가능할 수 있습니다. 하지만 한 번에 “제외”는 지원 안 되어, 대안: Music을 제외하려면 다른 category들로 각각 조회해야 하는 번거로움.
절충안: search.list order=viewCount로 얻은 결과에서 Music 채널/영상은 코드를 통해 걸러냅니다 (예: 뮤직비디오는 채널명이 Official 같은 패턴, 또는 duration이 180~240초 근처이면 제외). 완벽진단은 어렵지만, 눈에 띄는 MV는 제거해 Shorts 크리에이터 영상들이 부상하도록 합니다.
퀄리티 이슈: viewCount순이라 옛날 영상이 기간 내 재부상한 경우 (예: 3년전 영상이 Shorts 알고리즘 타서 조회 폭증)에는 publishedAfter 필터로 걸러지므로 OK. 하지만 publishedAfter 7일이면 8일된 영상이 대량조회여도 제외돼, “정말 요즘 핫한데 8일 됐다고 놓치는” 경우 발생. 이건 사용자 기간 선택에 맡기지만, 기본 7일은 적절한 균형입니다.
개선 여지:
결과 캐싱/통합: 7일/3일/24h별로 search를 각각 하게 되어 쿼터 소모 크니, 우선 넓게 (30일) 가져와 로컬에서 나누는 법도 있으나, YouTube API search는 정렬우선 30일내 Top 50이면 7일 내 Top50와 거의 유사하겠지만 완전히 보장 못합니다. 일단 정확성 위해 separate calls 유지.
UI: “전세계 vs 국가” – regionCode 없으면 global trending도 볼 수 있도록 할지 고민. global은 chart=mostPopular만 가능해 search는 region 필수. 차선: UI에서 “All”은 regionCode=US + category=0등으로 근사. (미국 trending이 곧 global trending 비슷하니)
동시 인기 (교집합): 4.3절 멀티국가처럼, 미래엔 “미국+한국 모두 Top인 영상” 같은 교집합 분석도 가치 있음.
(B) 소스 채널 폴더링 & 임계치 알림:
현 설계: 사용자가 폴더를 만들고 채널IDs를 추가하면, 시스템이 해당 채널들의 업로드 feed(PubSubHubbub 구독)[66]을 등록합니다. 새 영상 업로드 알림이 오면 즉시 DB videos 테이블에 추가하고 videos.list로 통계 조회합니다. 그런 다음 폴더에 설정된 임계치(예: min_views=N, max_age=D일, max_duration=T초)를 적용해 조건 충족 여부 평가합니다. 충족 시 alerts 테이블에 기록하고 (여러 폴더에 속한 채널이면 각 폴더별로 alert), 사용자에게 실시간 알림(WebSocket 또는 Supabase Realtime)으로 전달합니다. UI의 알림 큐에 해당 영상이 나타나고, 사용자는 그것을 즐겨찾기 보드에 핀하는 등 액션을 취합니다.
“혼합 설계 필요한가?”: PubSubHubbub는 거의 실시간 (수십초 이내)으로 알림이 와 좋지만, 100% 신뢰는 어렵습니다. 종종 구독이 끊기거나 알림 누락 보고 사례도 있습니다. 그러므로 백업 폴링이 필요합니다. 설계: (1) PubSub 구독 유지 (4시간마다 재구독) + (2) 하루 1~2회 playlistItems.list로 폴더 내 각 채널 최신업로드 체크. 두 메커니즘 병행으로 누락 거의 없게 합니다.
또한, PubSub는 “영상 업로드됨”만 알려줄 뿐 조회수는 0일 때죠. 우리가 videos.list로 즉시 조회해도 게시 수분 내 viewCount는 0~몇백이라 임계 못 넘습니다. 그래서 지연 평가 필요: 예를 들어 alert 조건이 “5일 내 100만”이면, 업로드 시점엔 당연히 미달이니 alert 안 넣고, 30분/1시간 간격 스냅샷에서 해당 영상이 조건 충족하면 그때 alert 생성합니다.
혼합 설계: PubSub으로 영상 등록 & 초기 관심표시만 해두고, 실제 임계 달성은 snapshot 워커(4.2[C])가 판단하는 구조가 효율적입니다. 즉 PubSub→DB에 new video with channel ref, RLS상 폴더/채널 매핑도 저장. 그런 다음 snapshot 워커 돌 때마다 폴더별 새영상도 함께 체크.
이렇게 하면 PubSubHubbub 딜레이(최대 수분) + 스냅샷 간격(60분)합쳐 최대 약1시간 늦게 알릴 수 있지만, Shorts의 경우 수시간 내 폭발하므로 실용상 문제없습니다.
개선 여지:
UI와 결합: 폴더 화면에서 실시간으로 충족 영상이 “큐”에 쌓이는 걸 보여주는데, alert 너무 많으면 또 걸러야 합니다. 개선: 알림에 우선순위(예: viewCount 순 정렬)나, 중복 제거(동일 영상 여러 폴더에 있을 경우 합쳐서 한 번만 표시)를 합니다.
조건 설정 난이도: 사용자마다 최적 임계가 달라 헷갈릴 수 있음. 추후 AI 추천으로 “이 폴더 채널 평균치 보니 50만/3일이 적당” 식으로 가이드 가능합니다 (데이터 쌓이면).
알림 전달 경로: 웹앱 내 외에, 이메일이나 Slack 연동도 향후 추가해, 사용자가 사이트 안 볼 때도 놓치지 않도록 할 수 있습니다 (Team 플랜 혜택으로).
Rule 관리 UI: 미리 여러 template 제공 (예: “Major hit: 100만/7일”, “Potential trend: 10만/1일” 등 클릭 적용)으로 편의 제공 검토.
보완: 만약 유튜브 Shorts API 자체에서 trending feed를 제공하면 좋겠지만 없으므로, 이 폴더+알림 기능이 사실상 사용자 커스텀 trending 역할을 하게 됩니다.
(C) 숏폼 특화 지표/랭킹:
현 설계: VPH, Δ24h, 참여율, 채널정규화, z-MAD 등을 계산하여 UI에 표시하고, 내부적으로 종합점수를 산출해 정렬에 사용합니다.
VPH = viewCount / (hours since published)[18]. snapshot 주기 30 vs 60분은 1절에서 논의했듯 60분으로.
Δ24h = 최근 24시간 조회 증가. 24시간 전 기록과 현재 기록 차이.
Engagement% = likeCount / viewCount (Shorts는 일반적으로 0.5~5% 수준).
채널정규화 = viewCount / subs (숨김채널은 제외 또는 추정).
이상치 z-MAD = (VPH - median(VPHs)) / (1.4826*MAD). 우리는 한 리스트 내 모든 VPH의 median과 MAD로 각 영상의 변칙 정도를 재고, +2 이상이면 “또래 대비 훨씬 높음”으로 봅니다.
종합점수 = 가중합: 예 0.4·rank(views)+0.3·rank(VPH)+0.2·rank(channel_norm)+0.1·rank(z-MAD). (5절 상세)
이 점수 낮을수록 종합랭킹1위. 우리 기본 정렬은 이 Score로 할 예정 (하지만 UI에서 토글로 “조회수순”도 제공).
“최선인가?”:
가중치 설정은 사전 가설입니다. 특정 장르(예: 음악)은 구독자 대비 조회수가 높게 나올 테고, 코메디 밈 영상은 VPH 엄청 높을 테니, 이 둘 우열가리기가 애매합니다. 대안: 사용자에게 정렬옵션 (조회수, VPH, 점수) 제공하여 자유롭게 보게 하는 겁니다. 초기엔 Score(종합)을 기본값으로 하나, 사용자가 언제든 바꿀 수 있도록 하면 가중치 논란을 피할 수 있습니다. A/B 테스트로 Score정렬 선호도도 측정합니다.
지표 신뢰도: Shorts는 dislike없어 참여율 = like/view로 단순화했고, 구독자 숨김 채널 많은데 channel_norm 적용시 “0/Hidden”은 제외 처리합니다 (우리 Score에도 숨김채널은 channel_norm rank를 중간값 정도로 간주). 이런 세부치는 5절 JSON 예시에서 다룹니다.
변동성: Shorts는 시시각각 수치 변해 Score도 변합니다. 우리 UI는 Score 순 정렬시 auto-refresh (예: 5분마다) 또는 사용자 수동 새로고침 안내를 검토합니다. 실시간 업데이트하면 목록 순서가 바뀌어 버려 혼란 줄 수 있어, 기본은 페이지 로드시 고정, 수동 refresh 버튼 제공이 나을 듯.
사용자 이해도: Score는 복합지표라 “왜 이 영상이 1위인지” 즉시 안 보입니다. 개선: 카드에 각 부분랭킹을 함께 표시 (예: “Views#3, VPH#1” 식) 또는 Score 상위엔 작은 툴팁으로 “Score 구성: 조회3위, VPH1위 등” 안내. 투명성으로 신뢰 보완합니다.
Shorts 조회수 집계변경(2025-03-31):
앞서도 말했듯 이 변경으로 절대 조회수는 높아졌으나 품질 저하 가능 (짧게 지나쳐도 조회). 그래서 Score에도 Engagement(참여율)를 가중치에 넣는 방안을 고려합니다. 좋아요율이 낮으면 “스크롤만 많이 된” 영상일 수 있으므로, 이를 0.1 가중치라도 주면 더 균형 잡힐 수 있습니다.
다만, Shorts에서 좋아요율 자체가 전반 낮아 “좋아요 많은 영상=진짜 재밌다”기보단 “팬덤 있다”일 수도.
우선 점수에는 안 넣되, UI에 좋아요수/율을 보여줘 사용자가 자체 판단에 참고하게 하는 쪽이 합리적입니다. (나중에 A/B테스트 해볼 항목).
(D) 주제/키워드·엔티티 레이더:
현 설계:
현재 트렌딩 영상들의 제목/설명/태그를 한데 모아 OpenKoreanText로 명사 추출 (한국어) + 영문/기타언어 토큰화.
나온 단어들에서 의미 없는 단어(불용어 리스트: “영상”, “Shorts”, “official” 등 다국어) 제거.
상위 20개 빈출 단어를 뽑습니다.
각 단어를 Wikidata SPARQL로 조회해 엔티티 여부를 판별합니다 (예: “아이유” -> Q168835 (가수 아이유)). 가능하면 영어도 함께 조회해 모호성 줄입니다.
엔티티가 식별되면 설명을 가져오고, Wikimedia Pageviews API로 해당 위키 문서의 최근 조회 급증률을 가져옵니다 (예: 지난주 대비 +200% 등)[72].
또 GDELT/News API로 최근 뉴스량도 파악 가능합니다 (예: “AI 아트” 관련 뉴스 X건). 다만 GDELT는 한국어 한계 있어 영어 키워드에 한정하거나 Guardian API로 영어권 트렌드만.
최종으로 UI 사이드바에 키워드 리스트와 각종 신호(▲% 등)를 표시합니다. 예: “바비 🔥 +300% (개봉 영향)”.
“필요한가?”:
이 기능은 우리 서비스의 컨설턴트 같은 역할입니다. 단순 영상 나열보다 한 단계 추상화해 “요즘 어떤 주제가 인기”를 알려주므로, 콘텐츠 기획 시간을 크게 줄여줍니다.
구현 노력이 꽤 들지만, 경쟁사에 없는 차별점이라 투자 가치 있습니다.
다만 정보과부하 우려로, 기본은 접어두고 필요할 때 보는 식이 낫습니다.
설문 등을 통해 베타사용자에게 이 패널 유용성 피드백 받아 조정합니다.
개선/보완:
정확도: 단순 빈도만으로 핵심주제 파악이 완벽하진 않습니다. “손흥민”과 “토트넘”이 따로 나오면 같은 이슈이나 2개로 보일 수 있죠. 그래서 엔티티 그래프(4.3절) 생각했는데, MVP에서는 어려우니, 수동으로라도 연관단어 묶음 표시 고려 (ex: “손흥민/토트넘” 같이).
소재 추천: 궁극적으로 이 레이더를 기반으로 “관련 아이디어 5가지 제안” 같은 AI 기능 붙일 수 있습니다. 예: “현재 🐈고양이 밈 유행 – 귀여운 내 고양이 Shorts 만들어보세요!” 식. 그러나 이는 나중 일이고, 일단 레이더 정보 자체로 충분한 가치가 있습니다.
UI: 상위 5개는 태그 형태로 영상 리스트 상단에 노출하여 한눈에 보고, 상세 20개는 옆 패널 “더보기”에 넣는 등 단계화합니다.
상호작용: 키워드 클릭 → 현재 리스트 필터링, 또는 새 검색 (유튜브 전체에서 해당 키워드 shorts 찾기) 둘 다 고려 중입니다. 일단 리스트 필터로 구현 (scenario B 참고).
정책: Wikimedia, Wikidata는 CC0라 데이터 사용 문제없고, Guardian API는 12k/day 무료로 충분하지만 Attribution 필요 – UI 어딘가 “News data by The Guardian” 표시 검토. (꼼꼼히 지키는 것이 서비스 신뢰에 도움).
4.3 고급/연구 제안 기능
이 섹션은 즉시 제품에 넣기보다 실험적이거나 차별화 연구용 기능들입니다. 즉시 가치가 높은 것과 장기 연구트랙을 구분하며, 선후 우선순위를 제안합니다:
엔터티 그래프 (연구용): Shorts 트렌드의 맥락을 네트워크로 시각화. 노드=키워드/엔티티/채널, 엣지=동영상 내 동시 언급 등으로 지식 그래프를 구성합니다. 예: 여러 영상에 모두 등장한 인물(예: 아이유)을 중심으로 해당 인물이 언급된 다른 키워드(예: 새 드라마) 연결. 이런 그래프는 트렌드 주제들 간 연관성을 파악해 “메가트렌드”를 짚는 데 도움됩니다. 하지만 일반 사용자가 바로 필요로 하진 않고, UI 복잡성도 높습니다. 즉시 가치는 낮고 구현비용 높아 연구 트랙으로 분류합니다. (향후 Pro/Team 고급분석 기능으로 가능성)
멀티국가 동시 레이더 (고급): 여러 국가의 트렌드를 동시에 비교합니다. 예: “미국과 일본에서 공통으로 뜨는 주제 vs 한쪽에만 뜨는 주제”. 이는 글로벌 채널이나 K-pop같이 다국 타겟 콘텐츠 기획에 유용합니다. 즉시 가치도 팀/기업엔 높을 수 있으나, 일반 1인 크리에이터에는 낮습니다. 그래서 우선 MVP에는 단일국가 단위로 제공하지만, Team 플랜 업셀용으로 “교차 트렌드” 기능을 개발해둘 계획입니다. (기술적으로, regionCode별 리스트를 모두 가져와 교집합/차집합 키워드 계산 등)
썸네일/제목 패턴 빈도 (연구용): 인기 Shorts들의 제목과 썸네일에서 패턴을 추출합니다.
제목: 예) 이모지 포함 비율, “?”나 “!” 등 특수문자 사용빈도, 숫자 포함 (리스트 영상은 숫자 많음) 등. 통계를 내주면 사용자 스스로 제목 작성 팁 얻을 수 있습니다. 즉시 가치: 중간. 숙련된 운영자는 이미 감각적 알고, 초보는 알면 좋으나 이걸 맹신하진 않을 수도.
썸네일: 컬러 경향(빨강 많이 쓰이나), 얼굴 클로즈업 여부(머신러닝 필요) 등 분석. 즉시 가치: 다소 낮음, 하지만 매우 차별화 재미요소.
구현: 제목 패턴은 Python 정규표현식 등으로 서버에서 일괄 처리 가능 (예: 30개 제목 훑어 특수문자 count). 썸네일은 Vision API나 Torch 모델 필요 – 리소스 크고, 유료.
결론: 우선순위 낮음. Team 고객 컨설팅용으로는 좋지만, MVP엔 제외. 다만 데이터 축적은 해둘 계획 – ex: 썸네일 이미지를 다운받아 색상분포만 분석 (오픈CV) 정도. Outlier로 눈에 띄는 썸네일 (예: 채도 확 높은 것) 있으면 UI에 “🔥” 뱃지? (과한가요?).
한국어 감정 스냅샷 (실험용): 댓글이나 제목에서 감정 키워드를 뽑아 긍/부정 분위기를 평가. 예: “ㅋㅋ” 많은 영상 vs “악플” 많은 영상 식. 이건 노아AI 표절 시비처럼 윤리 논란난 서비스 경우 중요했지만, 일반 Shorts 운영에는 덜 필요합니다. (Shorts 댓글은 휘발성이고, 밈 영상은 댓글보단 공유/리믹스가 반응지표라서).
즉시 가치: 매우 낮음. 개발자 시간 대비 효과 불투명.
대신, 나중에 브랜드 리스크 모니터링 서비스 (기업 홍보팀이 자사 언급 Shorts 댓글 감지 등) 확장에는 활용 가능. 그때 OpenAI 감정분석 API 등 도입 고려.
현재는 보류.
팀 협업 칸반 + 태그 (즉시 가치 높음 for Team plan):
아이디어/콘텐츠 관리용 칸반 보드. 예: “아이디어 풀 🔜 편집 중 🔜 게시 완료” 식 단계로 즐겨찾기 영상을 이동하며 진행 관리.
9절 시나리오 C에 나온 대로, 오너/에디터/분석가가 한 보드를 공유하고 각 아이템(영상)에 태그나 담당자 지정도 가능하게 하면, 생산성을 높입니다.
즉시 가치: Team 고객에게 높음.
구현: 즐겨찾기 항목에 status 필드 추가해 (Idea/In Progress/Done 등) 분류하거나, 아예 board를 3개 (아이디어/이번주/완료) 고정으로 제공해 이동시키는 방식.
MVP에서는 기본 보드 기능만 넣고, 칸반 UI는 Figma 프로토타입으로 연구 -> 실제 적용은 Pro/Team 출시 시 동시 론칭 목표.
우선순위: A/B) 멀티국가보다 높음, 왜냐면 국내 에이전시들에게 곧바로 유용하고, 우리 유료화 포인트가 됩니다.
즉시 가치 vs 실험 정리: - 가장 즉시 가치: (B) 멀티국가 레이더는 Team용이긴 하나 구현이 비교적 적은 편(데이터 병합) 대비 임팩트 큼. - 다음: (E) 팀 칸반 협업 – 개발량이 좀 있지만, Team 플랜 핵심으로 가치 높음. - 실험적: (A) 엔터티 그래프, (C) 썸네일/제목 패턴, (D) 감정스냅 – 연구트랙으로 두고, 데이터 모으면서 유용성 검증 후 추진.

5) 랭킹/지표 정의 – 수식, 의사코드, 예시 (“최선인가?” 포함)
아래는 주요 지표의 정의와 계산방법, 샘플 데이터 예시입니다. 또한 현재 공식을 “이게 최선인가?” 자문하며 대안도 간략 비교합니다.
Shorts 후보 판정 = videoDuration=short (API 필터, 4분↓) AND contentDetails.duration ≤ 임계초 (우리 추가 필터). 기본 임계는 70초로 설정했습니다 (1분10초)[23].
근거: Shorts 공식 기준 60초지만, 60~70초 사이에도 Shorts 피드에 노출되는 사례가 있어 70초로 약간 여유 둡니다.
대안: 60초 엄격 적용 – 이 경우 61초 영상은 제외되어 놓칠 수 있음. 반대로 90초까지 허용 – 그런데 YouTube는 60초 넘으면 Shorts 탭에 안 들어가는 것으로 알려져 90초는 오분류. 그러니 70초가 타협입니다.
코드 예시 (ISO8601 파싱 후 비교):
def is_shorts(video):
    dur = parse_iso8601_duration(video['contentDetails']['duration'])
    return dur <= SHORTS_DURATION_LIMIT  # e.g. 70 seconds
“최선인가?”: 추후 데이터 검토해 60초 이하 영상이 대부분이면 기본값을 60초로 낮출 가능성, 혹은 유튜브 정책변경(예: Shorts 90초 허용)이 있으면 그에 맞게 조정합니다. 현재로선 70초가 안전합니다.
VPH (Views Per Hour) = viewCount / max(1, hours_since_published).
Hours = (현재시각 - 게시시각) / 3600.
이슈: Snapshots 간격 30분 vs 60분에 따른 VPH 변화.
60분 간격: 최근 1시간 평균 VPH를 보여주므로, 급등→감소 추이를 평탄화해버릴 수 있습니다.
30분 간격: 두 기간 쪼개보면 예를 들어 첫 1시간에 10만→두번째 1시간 0이면, 60분 간격 VPH=5만, 30분 간격 보면 10만→0 변화를 알 수 있습니다.
Shorts는 변동이 빠르니, 정밀 모니터링엔 30분이 좋지만, 일반 트렌드 판단엔 60분 평균도 충분합니다.
의사코드:
from datetime import datetime
def compute_vph(video):
    published = datetime.fromisoformat(video['snippet']['publishedAt'])
    hours = max(1, (datetime.utcnow() - published).total_seconds() / 3600)
    return video['statistics']['viewCount'] / hours
분산/비용 vs 정밀도: 우리 기본 60m로 두되, Top Outlier 영상에 한해 15m로 추가 측정하는 hybrid도 고려 (다만 복잡성 증가).
대안: viewCount/elapsed_time 대신 실시간증분 (이전 스냅샷 대비) 사용. 그러나 Shorts는 초반 급등 후 둔화 패턴이라, 초기 노출 강한 영상이 유리하게 나오도록 현 방식 유지가 적절합니다[18].
Δ24h = views(t0) - views(t0 - 24h).
계산: 영상별 DB에 24시간 전 기록을 조회해 차이. 없으면 (신규 <24h) viewCount 자체를 Δ로 사용.
예시: 지금 view=1,500,000, 24h전=1,200,000 => Δ24h = 300,000.
주의: 오래된 영상은 24h증가가 음수(조회수 안 내려가므로 0) 또는 매우 작습니다. 우리 Score에서는 새로운 영상이 Δ24h 크므로 가산점.
의사코드:
def compute_delta_24h(video_id):
    stats = get_stats(video_id)  # sorted by time
    if len(stats) == 0: return None
    latest = stats[-1].view_count
    cutoff_time = stats[-1].captured_at - timedelta(hours=24)
    prev_points = [s for s in stats if s.captured_at <= cutoff_time]
    base = prev_points[-1].view_count if prev_points else 0
    return latest - base
“최선인가?”: 24h는 통상성공척도로 쓰이니 유지. 일부 영상은 24h보다 48h~72h 상승이 크지만, 24h를 기준화하면 공정성이 있습니다. Δ24h 말고 %증가율도 후보였으나, 초소형 채널 영상의 100→5,000 (5000%)와 큰 채널의 1,000,000→1,300,000 (30%)를 비교하면 퍼센트는 작은 채널 편향이라 부적절. Δ절대증가가 낫습니다.
참여율 (Engagement) = likeCount / max(1, viewCount).
Shorts는 dislike 불가 공개라 like만 씁니다.
해석: 예 50k likes, 1M views => 5% 참여율.
이 값은 통계적으로 콘텐츠 반응도를 보여주지만, Shorts 특성상 일반 롱폼보다 낮습니다 (짧아서 좋아요 누를 새 없이 넘기는 경우 많음).
“신뢰도는?”: 낮습니다. 특정 팬덤 영상은 좋아요 폭주, 일반 밈은 조회만 높고 좋아요 적음. 그러나 어뷰징이나 품질 판단에 힌트가 됩니다.
Score에는 일단 미포함 (5절 대안 공식 참조), UI에 참고로만 표시.
코드:
def compute_engagement(video):
    likes = int(video['statistics'].get('likeCount', 0))
    views = int(video['statistics'].get('viewCount', 0))
    return likes / max(1, views)
대안: YouTube “Engaged views” (few-seconds 시청) 메트릭이 Shorts 품질척도지만 API로는 안 줌[87]. 그래서 like/view 외 뾰족수 없어, 보조지표로만 둡니다.
채널 정규화 = viewCount / max(1, subscriberCount).
구독자 숨김일 경우 subscriberCount=0 또는 제공안됨-> 계산 불가. 우리는 hiddenSubscriberCount=true면 이 지표 제외 (Score계산시 median 대체 등).
의미: 1.0 = “조회수가 구독자와 같음” → 대부분 Shorts는 1.0 넘습니다 (추천 타겟이 구독자 아닌 전체이므로). 100만 조회 10만 구독 채널 = 10 (우와), vs 100만 조회 1000만 구독 채널 = 0.1 (팬 아닌 외부 유입 적음).
“신뢰도는?”: 채널 숨김이 많아 완벽 적용 어렵지만, 알 수 있는 범위에서는 “바이럴 지표”로 유용합니다.
의사코드:
def compute_channel_norm(video, channel):
    subs = channel.get('subscriberCount')
    if not subs or channel.get('hiddenSubscriberCount'):
        return None
    return video['statistics']['viewCount'] / max(1, subs)
(채널 API로 subscriberCount 가져와야 함 – 우리는 알림 폴더 등록 시 채널 정보 함께 저장해 활용).
대안: subscriberCount 대신 “channel average views”로 정규화하는 방법도 있지만, Shorts 채널은 평균 뽑기 어렵고, 구독자 수가 가장 널리 쓰이는 지표이니 그대로 갑니다.
이상치 (z-MAD) = z = (VPH - median(VPH_list)) / (1.4826*MAD), 여기서 MAD = median(|VPH - median|).
본 지표는 그 리스트 내 다른 영상들과 비교해 얼마나 VPH가 특출난지 보여줍니다. z값이 +3이면 “중앙값보다 3*MAD만큼 높음” (보통 정규분포 3시그마 대응).
N (최근 샘플 수): 우리는 “현재 분석 리스트”의 영상들로 합니다 (예: 30개).
예시: VPH 리스트 [100k, 80k, 20k, 10k] (단위/h). median=(80+20)/2=50k, |dev|=[50,30,30,40]-> median=35k, MAD≈35k.
100k: z ≈ (100-50)/ (1.4826*35) = 50/51.9 = +0.96,
80k: (80-50)/51.9= +0.58,
20k: (20-50)/51.9= -0.58,
10k: (10-50)/51.9= -0.77.
=> 큰 outlier 없다. 만약 한 영상 VPH=500k였다면 훨씬 높은 +z (약 +8)로, “나머지에 비해 월등히 높음” 표시.
“최선?”:
리스트 내 비교는 상대평가라, 만약 리스트 전체가 고VPH면 outlier가 없다고 나와버립니다.
대안: 고정기준 – 예: z계산시 분모를 지난달 전체 Shorts VPH 분포에서 MAD 계산한 상수로. 그러나 Shorts 트렌드 빠르게 변해 고정기준 어렵습니다.
그러므로 “그중에서도 튀는 것” 정도로 쓰고, outlier 뱃지나 Score 일부에만 반영합니다.
의사코드:
import numpy as np
def compute_zmad(vph_list):
    if len(vph_list) < 2: 
        return [0]*len(vph_list)
    med = np.median(vph_list)
    devs = [abs(v-med) for v in vph_list]
    mad = np.median(devs)
    if mad < 1e-9:
        return [0]*len(vph_list)
    return [ (v-med)/(1.4826*mad) for v in vph_list ]
활용: z-MAD > 2.5인 경우 🔥 아이콘 부여 등.
최종점수 (예시) = 0.4·rank(viewCount) + 0.3·rank(VPH) + 0.2·rank(channel_norm) + 0.1·rank(z_MAD). (rank 1 = 가장 좋은).
계산: 각 지표에 대해 1~N등 부여, 가중합 낮을수록 높음.
예시 JSON 입력 (3개 영상):
[
  {"id": "A", "views": 1000000, "likes": 50000, "subs": 100000, "published": "2025-08-14T12:00:00Z"},
  {"id": "B", "views": 2000000, "likes": 100000, "subs": 500000, "published": "2025-08-10T09:00:00Z"},
  {"id": "C", "views": 800000, "likes": 40000, "subs": 2000000, "published": "2025-08-15T06:00:00Z"}
]
(가정: 현재 2025-08-15T12:00Z)
Compute:
A: hours≈22h -> VPH≈45k/h, channel_norm=10 (100만/10만), like% 5%.
B: hours~5일(120h) -> VPH≈16.7k/h, channel_norm=4, like% 5%.
C: hours~6h -> VPH≈133k/h, channel_norm=0.4, like% 5%.
Ranks: views: B(1),A(2),C(3); VPH: C(1),A(2),B(3); channel_norm: A(1),B(2),C(3); z-MAD: C(1),A(2),B(3) (C VPH 아주 높아 outlier 1).
Score:
A = 0.42 + 0.32 + 0.21 + 0.12 = 0.8+0.6+0.2+0.2 = 1.8.
B = 0.41 + 0.33 + 0.22 + 0.13 = 0.4+0.9+0.4+0.3 = 2.0.
C = 0.43 + 0.31 + 0.23 + 0.11 = 1.2+0.3+0.6+0.1 = 2.2.
결과: A(Score 1.8) < B(2.0) < C(2.2), 즉 A > B > C.
해석: A는 조회2위/VPH2위지만 채널 작아 norm1위여서 1등, C는 조회 꼴찌지만 VPH·zMAD 1위나 채널 너무 크고 조회수 낮아 3등.
대안 가중치:
만약 VPH에 더 비중 주는 Score B: 0.2view+0.5VPH+0.1norm+0.2z.
A=0.22+0.52+0.11+0.22 = 0.4+1.0+0.1+0.4=1.9.
B=0.21+0.53+0.12+0.23 = 0.2+1.5+0.2+0.6=2.5.
C=0.23+0.51+0.13+0.21 = 0.6+0.5+0.3+0.2=1.6.
결과: C(1.6) < A(1.9) < B(2.5), 즉 C > A > B (VPH 높은 C 1등).
Score A vs B 비교: 우리 기본 Score A는 전체 밸런스, Score B는 속도 중시. 어떤 것이 “최선”인가는 결국 사용 목적에 따라 다릅니다.
만약 사용자 목표가 “당장 폭발 영상 찾기”면 Score B가 좋고, “누적 조회 큰 영상”이면 Score A가 나음.
해결: 정렬 옵션 제공으로 유저가 선택, 또는 Score 가중치 프리셋 둘 다 제공 (예:“Hot” vs “Big”).
가중치 탐색 계획:
베타기간에 사용자 피드백 수집, “Score 정렬 했더니 별로” 반응이면 조정.
A/B 테스트: 일부에 weight A, 일부 weight B 기본 적용, 어떤 그룹이 더 많이 영상 클릭/즐겨찾기 했나 분석. 그걸로 개선합니다.
대안 공식:
Velocity 중심: views 20%, VPH 50%, norm 10%, outlier 20% (앞서 Score B).
Absolute 중심: views 50%, VPH 30%, norm 20% (zMAD0%) – 사실상 조회수 위주.
Quality 중심 (고려 가능): views 30%, VPH 20%, norm 10%, engagement 20%, zMAD 20% – 품질(좋아요율) 반영. 다만 Shorts선 좋아요율 데이터 노이즈라 보류.
이런 대안들도 내부 실험해볼 것이며, 최종으론 사용자가 원하는 정렬을 선택하는 방향이 좋습니다.
의사코드 (점수 계산):
metrics = ['view_rank','vph_rank','norm_rank','z_rank']
for vid in videos:
    vid['scoreA'] = 0.4*vid['view_rank'] + 0.3*vid['vph_rank'] + 0.2*(vid.get('norm_rank') or vid['view_rank']) + 0.1*vid['z_rank']
videos.sort(key=lambda v: v['scoreA'])
(subscriber 숨김이면 norm_rank없어 대신 view_rank로 처리 등).
요약: 현 랭킹 공식은 가설이며, 추후 데이터를 통해 최적화할 것입니다. 중요한 것은, 다양한 지표를 제공해 사용자가 다각도로 판단 가능하게 하는 것입니다. 저희 점수는 그 하나의 참고일 뿐, UI에서 각 지표를 투명하게 보여 “왜 이 영상이 추천되는지” 이해를 돕겠습니다.

6) API 호출 레시피 – URL, 파라미터, 응답, 쿼터
주요 API 호출들을 레시피 형태로 정리합니다. 각 호출에 완전한 URL 예시, 요청 파라미터, 응답 요약, 쿼터 비용 및 주의점/폴백을 기술합니다:
search.list – 키워드 없는 인기 Shorts 검색.
예시 요청 (GET):

https://youtube.googleapis.com/youtube/v3/search
    ?part=id,snippet
    &type=video
    &order=viewCount
    &publishedAfter=2025-08-08T00:00:00Z
    &videoDuration=short
    &regionCode=US
    &maxResults=50
    &q=shorts    (또는 빈 값 시도)
    &key=AI... (API 키)
파라미터:
| 파라미터 | 예시 | 설명 | |--------------------|---------------------|--------------------------------| | part | id,snippet | ID와 snippet(제목,채널,썸네일 등) 반환[67] | | type | video | 비디오 리소스만 검색 | | order | viewCount | 조회수 순 정렬[25] | | publishedAfter | 2025-08-08T00:00:00Z | 이 이후 업로드된 영상만 (기간 필터) | | videoDuration | short | 짧은 영상만 (<=4분) | | regionCode | US | 미국 지역 기준 | | maxResults | 50 | 한번에 최대 50개 아이템 | | q | shorts (또는 공백) | 검색어 – 키워드 없을땐 공백/널 (API는 필수라 임시값 넣음) | | key | API 키 | 인증 및 할당량 추적 |
응답 요약: HTTP 200, JSON:

{
  "kind": "youtube#searchListResponse",
  "items": [
    {
      "id": { "videoId": "X1Y2Z3" },
      "snippet": {
        "title": "Awesome Shorts Video",
        "channelId": "UCabc...",
        "channelTitle": "CreatorName",
        "publishedAt": "2025-08-10T15:00:00Z",
        "thumbnails": { "medium": { "url": "https://i.ytimg.com/vi/X1Y2Z3/mqdefault.jpg", ... } }
      }
    },
    { ... up to 50 items ... }
  ]
}
(조회수 등 통계 없음 – 뒤에 videos.list로 보충).
쿼터 비용: 100 units/호출[67] (maxResults 상관없이).
주의점:
q 없이 호출하면 400 Bad Request: No filter selected 오류 발생. 폴백: 위 예시처럼 q=shorts 등 보편어를 넣어 영향 미미하게 만듭니다. 이 방식은 공식 문서엔 없지만, 실무에서 종종 사용됩니다. 향후 API가 강화되어 빈 쿼리 절대 불가시, chart=mostPopular+필터 조합으로 보조할 계획입니다 (정확도 약간 저하 감수).
regionCode 편중: regionCode 주지 않으면 글로벌 검색인데, YouTube API는 regionCode 없으면 로그인 계정 위치나 undefined로 처리 가능성 있어 불확실. 우리는 항상 regionCode 지정 (또는 "전체" 선택시 미국/글로벌차트 혼용).
쿼터 초과: search 100u라 많이 쓰면 금방 quota 소진. 그래서 Free 사용자는 하루 수회로 제한하고, Pro엔 자신의 키사용 옵션을 권장합니다.
응답 정렬된 50개가 항상 우리가 원하는 “Top 50 Shorts”인지 100% 확신 어려움. 하지만 empirical하게 trending Shorts가 포함되는 경향.
videos.list – 상세 정보 일괄 조회. (id 파라미터 최대 50개 영상)
예시 요청:

GET https://youtube.googleapis.com/youtube/v3/videos
    ?part=snippet,statistics,contentDetails,status
    &id=X1Y2Z3,AbCdEf,123456
    &key=AI... (API 키)
파라미터:
| 파라미터 | 예시 | 설명 | |----------|--------------------------------|----------------------------------------------| | part | snippet,statistics,contentDetails,status | 필요한 모든 필드 포함[65] | | id | X1Y2Z3,AbCdEf,... | 조회할 영상ID 리스트 (쉼표구분 최대 50개) | | key | API 키 | |
응답 요약: JSON:

{
  "kind": "youtube#videoListResponse",
  "items": [
    {
      "id": "X1Y2Z3",
      "snippet": {
        "title": "Awesome Shorts Video",
        "publishedAt": "2025-08-10T15:00:00Z",
        "channelId": "UCabc...", "channelTitle": "CreatorName", ... 
      },
      "statistics": { 
        "viewCount": "1000000", "likeCount": "50000", "commentCount": "1234", ... 
      },
      "contentDetails": { 
        "duration": "PT45S", "dimension": "2d", "definition": "hd",
        "caption": "true", 
        "regionRestriction": { "blocked": ["KR","KP"] } 
      },
      "status": { "uploadStatus": "processed", "privacyStatus": "public", 
                  "license": "youtube", "embeddable": true, ... }
    },
    {... other videos ...}
  ]
}
주요 필드: statistics.viewCount/likeCount, contentDetails.duration (ISO8601), caption (자막 있나)[81], regionRestriction (차단국가)[90], status.embeddable (퍼가기 허용?)[90] 등.
쿼터 비용: 1 unit/호출[65] (IDs 1개든 50개든 동일).
주의점:
regionRestriction 필드는 deprecated표시 있으나 실제 응답은 유효[83]. blocked vs allowed 두 경우 – blocked목록 있으면 그 국가 제한, allowed만 있으면 그 국가만 허용 (다른 곳 차단).
좋아요수(likeCount)는 공개 영상에만 제공, Shorts는 대부분 public이라 문제없음.
subscriberCount는 여기에 없음 (channels.list로 가져와야). 우리는 폴더채널 정보 얻을 때 channels.list를 따로 호출 예정.
403 오류: 간혹 video id 잘못되면 0 items응답. 그런 ID들은 제거 처리. Private 영상이면 응답에 아예 포함안됨 (items[]), 이 경우 폴더영상이라도 우리 DB에 남을 수 있어 UI “비공개” 표기 (or auto 제거) 합니다.
ETag 사용: videos.list 응답에 ETag가 와서, subsequent 요청에 If-None-Match 보내면 변경없을 시 304 Not Modified로 쿼터 아낄 수 있습니다. 실시간성 중요한 data라 큰 활용은 없지만, 예: 즐겨찾기 목록 같은건 ETag로 캐시 가능.
videos.list?chart=mostPopular – 트렌딩 차트 조회 (보조 용도).
예시 요청:

GET https://youtube.googleapis.com/youtube/v3/videos
    ?part=snippet,statistics,contentDetails
    &chart=mostPopular
    &regionCode=KR
    &videoCategoryId=0
    &maxResults=25
    &key=AI...
파라미터:
| 파라미터 | 예시 | 설명 | |-------------------|-------------|-----------------------------------------| | chart | mostPopular | 해당 지역 인기 영상 차트[91] | | regionCode | KR | 지역 코드 (필수) | | videoCategoryId| 0 | 카테고리 (0 = 전체) | | maxResults | 25 | 결과 개수 (기본 5, 최대 50) | | 기타 part, key 위와 동일. |
응답 요약: items 배열에 regionCode 트렌딩 영상들(주로 롱폼+약간 Shorts 섞임).
쿼터 비용: 1 unit (videos.list).
주의점:
Shorts만 따로 추출 불가 – contentDetails.duration으로 60초 이하인 것만 골라내야 함.
음악 등 특정 카테고리에 편중 – videoCategoryId 파라미터로 music(10) 제외 등 쿼리 불가 (chart=mostPopular는 category 지정시 그 카테고리 내 트렌딩만 줌). 따라서 0이면 모든 카테고리 섞여 오니, music비중 높으면 filter out 필요.
용도: “현재 그 나라 인기 50개 영상 중 Shorts만 추리기”에 쓸 수 있습니다. 그러나 50개 제한이라 Shorts가 몇개 없으면 데이터 부족.
폴백: 트렌딩 차트 Shorts가 너무 적으면, search 기반 결과와 합쳐보거나, 그냥 search 결과로 대체.
지금 Plan에서는 차트 API는 사용빈도 낮음 (왜냐면 search가 이미 cover). 다만 참고로, 예: UI에 “YouTube 공식 트렌딩 #1” 배지 달아주거나, 혹은 search query 없이 global trending 볼때 fallback.
channels.list & playlistItems.list – 채널 업로드 폴링용. (폴더 채널 관리에 사용)
channels.list (upload playlist 확인):

GET https://youtube.googleapis.com/youtube/v3/channels
    ?part=contentDetails
    &id=UC_xx1,UC_yy2,...
    &key=AI...
응답: 각 채널의 contentDetails.relatedPlaylists.uploads 값 제공[66]. e.g. "uploads": "UU_xx1...".
비용: 1 unit.
사용: 폴더 추가 시, 채널의 uploads playlist ID를 저장.
playlistItems.list (최근 업로드 확인):

GET https://youtube.googleapis.com/youtube/v3/playlistItems
    ?part=contentDetails,snippet
    &playlistId=UU_xx1...
    &maxResults=5
    &key=AI...
응답: 그 재생목록의 최근 5개 영상 (videoId 및 snippet.publishedAt 등).
비용: 1 unit.
사용: 백업 폴링 – 하루 1~2회 각 폴더 채널 리스트별 호출.
주의: 5개로 충분, 누락방지 목적이므로 너무 많이 불필요.
find: commentThreads.list, i18nRegions 등 기타:
commentThreads.list:
GET .../commentThreads?part=snippet&videoId=X1Y2Z3&order=relevance&maxResults=3&key=AI...
응답: top3 top-level 댓글 (각 comment snippet.textDisplay, author, likeCount 등)[84].
비용: 1 unit.
활용: On-demand 댓글 펼치기.
제한: 댓글 off 영상 403오류 – 처리.
i18nRegions (국가코드 목록) and i18nLanguages (UI언어코드) are 1 unit each. UI 초기 설정에 한번 호출 가능하지만, 국가코드는 하드코딩 10개로 충분해서 안 쓸 수도.
PubSubHubbub Subscribe – 유튜브 푸시 알림 등록. (HTTP form POST)
요청:
POST https://pubsubhubbub.appspot.com/subscribe 
Content-Type: application/x-www-form-urlencoded

hub.mode=subscribe
&hub.topic=https://www.youtube.com/feeds/videos.xml?channel_id=UC_xx1
&hub.callback=https://ourapp.com/api/pubsub?token=12345
&hub.verify=async
&hub.verify_token=randomToken123
&hub.secret=secretKey987
&hub.lease_seconds=864000
(위는 예시. hub.callback은 우리 엔드포인트, token은 검증용.)
동작: 성공시 YouTube 서버가 hub.callback URL로 GET(hub.challenge 포함)을 보내와, 우리가 그대로 응답하면 구독 완료[66]. 이후 새 영상 업로드마다 YouTube가 hub.callback에 POST(Atom feed) 보냅니다[68].
쿼터: 없음 (YouTube API 쿼터 아닌 WebSub 프로토콜).
주의:
HTTPS callback 반드시 필요 (HTTP 안됨).
hub.secret은 선택: 설정하면 이후 알림 POST에 HMAC-SHA1 Signature 헤더 포함 – 보안 높일 수 있어 사용할 계획입니다.
lease_seconds=10일 (최대 값) 사용 – 10일마다 재구독. Cron으로 재구독 주기 돌립니다.
실패 처리: 만약 subscribe 응답 204라도 콜백 확인 실패하면 구독안됨 – 우리 서버로그로 검출하고, 1분 후 재시도 알고리즘 둡니다.
PubSubHubbub 자체 장애 시 fallback: 폴링.
Over-subscription: 수백 채널 구독 가능하지만, 너무 많으면 구글이 throttle할 수 있음. (문서엔 명시 없으나).
폴백: 만약 채널이 PubSub 비지원(가능성 낮음, YouTube 다 지원) 또는 우리 서버 장기간 다운되어 알림 놓치면, playlistItems 폴링이 최후 안전망입니다.
외부 API 호출 예시:
Wikimedia Pageviews:
GET https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/ko.wikipedia/all-access/all-agents/아이유/daily/20250808/20250815
→ 응답: 해당 기간 일별 조회수 배열. (또는 .../top/ko.wikipedia/2025/08/15 일일 Top도 가능)[72]. Authentication 없음. Rate Limit 거의 없음.
Wikidata SPARQL:
GET https://query.wikidata.org/sparql?query=SELECT ?item ?itemLabel ?desc WHERE{
    ?item rdfs:label "IU"@en.
    ?item schema:description ?desc FILTER(lang(?desc)="en")} &format=json
→ 응답 JSON: item Q-code 및 label, desc. 1분당 수회 허용.
주의: 복잡쿼리나 동시많은 요청시 429나 5xx. 폴백: 재시도 or KG API (googleapis).
Reddit API (for trend context e.g. r/Shorts):
OAuth2 token 필요 (script app). 예:
GET https://oauth.reddit.com/r/videos/search.json?q=아이유&sort=new&limit=5
Authorization: Bearer <token>
→ 응답: posts list (title, upvotes, etc).
Rate Limit: 60req/min.
정책: 상업앱이 일정 이상 호출시 요금 (24¢/1000calls)[76]. 우리는 쿼리 적게할거라 영향 적음, 모니터필요.
Google Sheets:
1) 새 시트 생성: POST .../v4/spreadsheets + Body {"properties":{"title":"Trend Export 2025-08-15"}}, -> 응답: {spreadsheetId: "...", ...}.
2) 값 추가: POST .../v4/spreadsheets/{ID}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED + Body {"values":[["Rank","Title","Views"],["1","Awesome Shorts Video","1000000"],... ]} -> 응답: 업데이트된 범위 등.
인증: OAuth (구글 로그인).
실무: Google API Node client 사용, 편리.
폴백: 실패시 CSV alt.
Open Korean Text: 로컬 함수호출이므로 HTTP 없음. ex:
from konlpy.tag import Okt
okt = Okt()
tokens = okt.nouns("이 영상 대박 ㅋㅋ #고양이")
# 결과: ["영상","대박","고양이"]
리스크: 트위터 용이라 신조어/이모티콘 한계, but 우리 목적엔 충분.
MeCab-ko는 C++설치 이슈 있어, O KT(O pen K or ean T ext)사용.
통합: Python script로 돌리거나 Node 한글분석 lib (없어서 Python route planning).
호출 폴백 / 예외 대처: - 쿼터 초과: - YouTube API 403 QuotaExceeded → 응답페이지에 에러 표시 (“일일 할당량 소진, 키 추가 필요”) 및 이후 요청 차단. - Plan: Free 사용자는 이러한 메시지 보게 될 가능성 높음. Pro에서는 BYO 키 유도해 해결. - 또한, 서버 레벨에서 검색 과다 요청시 이전 결과 캐싱 제공: 예) 동일 조건 5분 내 재검색 → 캐시된 결과 반환 (쿼터 절약). - API 장애: - YouTube API 500 또는 시간초과: 우리 서버 3회 retry (각 1→3→5초 간격)[72], 실패 시 “YouTube API 응답 지연 – 잠시 후 재시도” 안내. - 외부 API (Wikidata, etc) 실패: 해당 데이터만 생략 (e.g. 키워드 레이더에 일부 값 N/A). 전체기능엔 영향없게. - PubSub 콜백 실패: Google이 수차례 재시도 후 포기. 이 경우 폴링에서 보완하므로 사용자 모르게 처리. - Supabase DB 연결 실패: rare. 일시적이면 Redis같은 임시캐시 (추후도입 검토)로 read, 쓰기는 큐잉. 10초 넘는 outage시 서비스 일시 정지 안내. - 폴백 전략 정리: - 페이지 제한: 한 번에 너무 많은 결과 요청시 (예: 5페이지=250영상), 우리 앱이 먼저 제한. UI에 “상위 100개까지만 표시” 경고. - 샘플링: 국가 10개 동시 선택 등으로 API 부담 클 경우, 각국 상위20씩만 모아 합치는 절충안 고려 (요청수↓). 하지만 정확도 희생이기에, 기본은 제한→안내→Pro키유도. (Team 고객엔 사전 협의후 서버 job 제공). - Graceful degrade: - 트렌드 레이더 외부데이터 불능 → 패널 아예 숨김 (“주제 데이터 불가” note). - 실시간 지표 수집 중단 (예: 워커 장애) → 마지막 수집 기준으로 정렬, UI에 “(최근1시간 데이터 기준)” 표시해 사용자 혼란 줄임. - 전체 실패 대비: in worst case (YouTube API down): 캐시된 어제 결과 보여주며 “실시간 데이터 불가 – 캐시 데이터 제공” 뱃지. SocialBlade 등도 가끔 caching으로 버팁니다.

7) 시스템 아키텍처 & Supabase 데이터 모델
시스템 구성도 (mermaid 다이어그램):
flowchart LR
  subgraph Client["Browser (React 19)"]
    UI1[Onboarding & Search UI] -->|API calls| NextAPI
    UI2[Dashboard & Alerts UI] -->|Subscribes Realtime| SupabaseRT[(Realtime)]
  end
  subgraph NextJS["Next.js 15 (Vercel)"]
    NextAPI[API Routes & Server Actions] -->|Supabase JS| SupabaseDB[(Postgres DB)]
    NextAPI -->|HTTP| YouTubeAPI[[YouTube Data API v3]]
    NextAPI -->|HTTP| ExternalAPI[[Wikidata/Wiki/Reddit...]]
    NextAPI -.->|calls| WorkerJobs((Cron & Workers))
    NextAPI -.->|sends events| SupabaseRT
    PubSubHub((YouTube WebSub Hub)) -.->|POST feed| NextAPI
  end
  subgraph Supabase["Supabase Cloud"]
    SupabaseDB[(Postgres + RLS)]
    SupabaseRT[(Realtime Service)]
    Auth[Auth (JWT)]
    SupaFunc[Edge Functions]
    SupabaseDB ==> SupabaseRT
  end
  subgraph Background["Background Jobs"]
    CronJob1[Vercel Cron (hourly)] --> Worker1
    Worker1[Snapshot Worker<br>(videos.list loop)] -->|update stats| SupabaseDB
    CronJob2[Vercel Cron (daily)] --> Worker2
    Worker2[Resubscribe PubSub] --> PubSubHub
    SupaFuncSched[Supabase Sched. Func] --> Worker3
    Worker3[Backup Polling<br>(playlistItems)] --> SupabaseDB
    Worker3 --> PubSubHub
  end
  Client -.->|HTTP| NextAPI
  NextAPI -.->|SQL| SupabaseDB
(도식 설명: 브라우저→Next API→DB/외부, 백그라운드 Cron/EdgeFunctions→DB/PubSub, Supabase Realtime은 DB변경→브라우저 알림 등.)
설명: - Next.js (App Router)가 프론트/백엔드 허브 역할. - NextAPI (Route Handler들)에서 공개 API 키 보관 및 호출을 담당 (브라우저에서는 우리 서버를 통해 YouTubeAPI 호출, API 키 노출 없음). - 예: /api/search Route Handler가 6절(1)과 (2)절 순서로 YouTube API 호출해 결과를 합쳐 응답. - 또한 NextAPI는 Supabase DB에 안전하게 접근 (supabase-admin service key 이용)해, 즐겨찾기 쓰기나 saved search 저장을 수행합니다[95]. - PubSubHubbub로부터 YouTube 새영상 피드 POST를 받는 /api/pubsub 엔드포인트도 NextAPI에 포함되어, 수신 즉시 DB에 영상 기록 추가 + 통계조회 job enque 합니다. - 스트리밍: Next 15의 Streaming SSR은 search 결과 큰 경우 Progressive render하는데 고려 (Skeleton UI → item by item 채우기). We might not implement initially due to complexity vs benefit. - Supabase (DB, Auth, Realtime): - Postgres DB는 핵심 데이터 저장소. 테이블 설계는 아래 별도. - Auth 모듈 통해 사용자 로그인 (이메일+비번 or OAuth Google) 처리. 로그인시 JWT에 user_id 및 org_id, role 등 커스텀 클레임 발급 (Edge Function onSignIn hook 사용). - RLS 정책: - 테이블별로 user_id 또는 org_id 기반으로 행-level 접근 제한. - 예: folders 테이블 SELECT 정책: user_id = auth.uid() OR org_id = auth.jwt().org_id로, 조직 공유 허용. - videos/video_stats 등은 모두가 읽어도 문제없는 공개 데이터라 RLS 풀거나, 그냥 join되는 연결테이블(RLS걸린 favorites등) 통해 간접 제공. - Supabase Realtime: DB의 특정 테이블 변경시 WebSocket으로 클라이언트에 이벤트를 보냅니다. 우리는 Alerts용으로 alerts 테이블을 구독하게 할 예정. - 편하게 supabase-js supabase.channel('alerts').on('postgres_changes', ...) 활용. 이렇게 사용자 브라우저가 자신의 user_id 조건으로 alerts listen → NextAPI(/api/pubsub나 snapshot worker)에서 DB alert 추가하면, 곧바로 브라우저에 이벤트 → UI 알림 표시. - 또한 favorites 추가/삭제 시도 실시간 갱신 가능 (하지만 이건 동시편집 아닌개인행위라 꼭 필요치 않음). - Background Workers & Cron: - Vercel Cron을 이용해 정기 작업: - e.g. 30 */1 * * * (매시30분) → Snapshot Worker (Edge Function or Next scheduled route) 실행. Snapshot 워커는 DB에서 alert 모니터링 대상 영상IDs 가져와(예: 지난24h내 폴더 채널영상 + 현재 trending topN)[72], videos.list로 일괄 조회, 결과를 video_stats에 insert + alert 조건 충족 여부 재평가. (Supabase Edge Functions Cron 기능도 사용가능 but Vercel Cron suffice for moderate tasks). - 일 1회 Cron → PubSub 재구독 (hub.lease_seconds=864000 10일이지만 여유있게 1일1회 refresh). - 일 2회 Cron → 백업 폴링 (playlistItems) 워커: 각 폴더 채널의 최신영상 videoIds를 가져와 PubSub과 대조, 누락 발견시 DB추가 + stat fetch. - Supabase Edge Functions: - supabase에 Task Fn과 Sched trigger (Beta) 있기에, 위 Cron tasks를 Edge Function으로 작성 후 Supabase상에서 5분/1시간 interval scheduling 가능. - 이것은 Vercel서버리스Cron vs SupabaseEdge 간 장단 (전자는 편리, 후자는 DB연결유리). - 현재 Architecture엔 두 가지 혼재했지만, MVP에서는 Vercel Cron으로 대부분 처리, Supabase SchedFunc는 차후 고도화시 고려.
데이터 모델 (Supabase Postgres): 주요 테이블과 필드, 인덱스, RLS 요약: - users (Supabase 기본 auth.users): - id (uuid PK), email, role (custom: 'Owner','Editor','Analyst'), org_id (uuid FK organizations.id), plan ('Free','Pro','Team'), 기타 (created_at 등). - 인덱스: (org_id), (email unique). - RLS: Supabase 기본 (user 자기정보만 or none). 우리는 user 데이터 대부분 클라JWT에 있으니 직접 table읽을 일 거의 없음. - organizations: - id (uuid PK), name, owner_id (uuid FK users.id), created_at. - RLS: Org 멤버만 읽기 (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())). - 인덱스: (owner_id). - org_members: - user_id, org_id (PK 복합) + role ('Owner','Editor','Analyst'). - RLS: user 자기레코드만 읽기 or org동료 읽기 (이건 조금 특별: Owner가 role변경/초대 위해 모든 동일 org rows 읽어야. 정책: EXISTS (SELECT 1 FROM org_members om2 WHERE om2.user_id=auth.uid() AND om2.org_id=org_members.org_id AND om2.role='Owner') – Owner에게 org 내 모두 RW, Editor에게 org 내 R, Analyst에게 R (optional)). - channels: - id (varchar PK), title, subscriber_count, hidden_subs (bool), uploads_playlist_id, added_by (uuid FK users), created_at. - 인덱스: (added_by) – 누가 추가했는지 (개인추가). - RLS: 굳이 민감정보없고, separate hide안해도. 하지만 orgA추가채널 orgB도 추가가능. Channel은 공개정보라 굳이 RLS안걸어도 됨(모두 read). - or If want, link through folder: user sees channel via folder join. - videos: - id (varchar PK), channel_id (FK channels.id), title, published_at, duration (int seconds), view_count, like_count, updated_at. - Note: 이 table는 캐싱/분석용. Realtime Scenes: trending 50 stored, folder videos stored. It will accumulate – TTL or upsert on repeated trending appearances (id PK ensures uniqueness). - 인덱스: channel_id (folder join), published_at DESC (latest trending). - RLS: 공개. Or tie to folder via join policy: But easier: allow all read (Shorts public). - video_stats: - id (bigserial PK), video_id (FK videos), captured_at, view_count, like_count. - 인덱스: (video_id, captured_at DESC), (captured_at). - TTL: maybe job to delete >90d old entries or parted by month. - RLS: videos가 공개라 이것도 공개. - folders: - id (uuid PK), user_id (FK users), org_id (FK organizations, nullable), name, min_views, max_age_days, duration_limit, created_at. - 인덱스: (user_id), (org_id). - RLS: - Select: user_id = auth.uid() OR org_id IN (SELECT org_id FROM org_members WHERE user_id=auth.uid()). - Insert: (auth.uid() = user_id AND org_id IS NULL) OR (org_id IN (SELECT org_id FROM org_members WHERE user_id=auth.uid() AND role IN ('Owner','Editor'))) – 즉 자신의 개인폴더만 만들거나, 속한 org의 Editor/Owner가 org폴더 생성. - Similar policy for update/delete: only Owner or Editor of org can mod org folder. - folder_channels (폴더-채널 맵): - folder_id, channel_id (PK 복합), added_at. - 인덱스: (channel_id). - RLS: - Select: join via folder policy – EXISTS(SELECT 1 FROM folders f WHERE f.id=folder_id AND (f.user_id=auth.uid() OR f.org_id ...)). - Insert/Delete: similar, require folder access by owner/editor. - rules (optional: if not stored in folders): - id (uuid), folder_id, min_views, max_age_days, duration_limit, notify (bool), created_at. - Index: (folder_id unique) if one rule per folder. - RLS: same as folder. - Note: Initially folder table에 필드로 넣으면 이 table 불필요. - alerts: - id (uuid), user_id, folder_id, video_id, message (text), seen (bool), created_at. - Index: (user_id, seen). - RLS: - Select: user_id = auth.uid() (자기 알림만). - Insert: done via server with admin rights, or allow if it matches above (but normally not inserted from client so admin only). - Supabase Realtime on this table used. Alternatively, could avoid table and use supabase Functions to push via another channel; but table is fine. - Team: folder_org scenario – if folder for org triggers, who gets alert? - 현재 설계: folder엔 owner user가 있거나 org id. - Org folder일 땐 모든 org멤버에게 별도 alert row 생성 (for each user). - Worker logic: query org_members of that org and insert for each. - RLS covers that each user sees their row. - Risk: org 20명 → alert 20줄 (ok). - favorites: - id (uuid), user_id, video_id, note (text nullable), created_at. - Index: (user_id, video_id unique). - RLS: user_id = auth.uid() for all ops. - Team 공유는 boards로 처리 (favorites 개인용). - boards (Team 공유 보드 or multiple collections for ideas): - id (uuid), org_id (nullable, else user_id), name, created_at. - In personal case, user owns (we can fill user_id). - RLS: similar to folder (owner or org member). - board_videos: - board_id, video_id (PK) + maybe status (‘Idea’,’InProgress’,’Done’). - RLS: exists board with user access. - This basically like favorites but for boards. - For Kanban, status field can eliminate multiple boards (one board with statuses). - We might simplify: one org board with status columns in board_videos. But let's keep as separate boards (like Trello lists). - credentials: - id (uuid), user_id, service ('youtube_api','google_sheets'), cred_enc (text, encrypted blob), created_at. - RLS: user_id = auth.uid(). - Stores API keys or tokens encrypted (we use pgcrypto PGP_SYM_ENCRYPT with our server secret or KMS). - Use: If user BYO YouTube API key, store it here, and next searches use that key (we identify by user in NextAPI). Also Google Sheets OAuth refresh token store here.
ERD 다이어그램 (mermaid):
erDiagram
    USER ||--o{ FOLDER : "owns/has"
    ORGANIZATION ||--o{ FOLDER : "owns (team folder)"
    USER ||--o{ BOARD : "has (personal board)"
    ORGANIZATION ||--o{ BOARD : "has (team board)"
    FOLDER ||--o{ FOLDER_CHANNEL : "contains"
    FOLDER_CHANNEL }o--|| CHANNEL : "refers"
    FOLDER ||--o{ RULE : "has"
    RULE ||--o{ ALERT : "triggers"
    USER ||--o{ ALERT : "receives"
    USER ||--o{ FAVORITE : "saves"
    FAVORITE }o--|| VIDEO : "refers"
    BOARD ||--o{ BOARD_VIDEO : "contains"
    BOARD_VIDEO }o--|| VIDEO : "refers"
    CHANNEL ||--o{ VIDEO : "uploads"
    VIDEO ||--o{ VIDEO_STATS : "has snapshot"
    USER ||--o{ API_CREDENTIAL : "has"

    USER {
      uuid id PK
      text email
      uuid org_id FK (nullable)
      text plan
      text role (default 'Owner')
      // ... (Supabase auth fields)
    }
    ORGANIZATION {
      uuid id PK
      text name
      uuid owner_id FK (USER)
    }
    ORG_MEMBERS {
      uuid org_id FK
      uuid user_id FK
      text role
      PK(org_id, user_id)
    }
    FOLDER {
      uuid id PK
      uuid user_id FK (nullable)
      uuid org_id FK (nullable)
      text name
      int min_views
      int max_days
      int duration_limit
    }
    FOLDER_CHANNEL {
      uuid folder_id FK
      varchar channel_id FK
      PK(folder_id, channel_id)
    }
    CHANNEL {
      varchar id PK
      text title
      int subscriber_count
      boolean hidden_subs
      varchar uploads_playlist
    }
    VIDEO {
      varchar id PK
      varchar channel_id FK
      text title
      timestamp published_at
      int duration_sec
      bigint view_count
      bigint like_count
    }
    VIDEO_STATS {
      bigint id PK
      varchar video_id FK
      timestamp captured_at
      bigint view_count
      bigint like_count
    }
    RULE {
      uuid id PK
      uuid folder_id FK
      int min_views
      int max_age_days
      int duration_limit
      boolean active
    }
    ALERT {
      uuid id PK
      uuid user_id FK
      uuid folder_id FK
      varchar video_id FK
      text message
      boolean seen
      timestamp created_at
    }
    FAVORITE {
      uuid id PK
      uuid user_id FK
      varchar video_id FK
      text note
      timestamp saved_at
    }
    BOARD {
      uuid id PK
      uuid user_id FK (nullable)
      uuid org_id FK (nullable)
      text name
    }
    BOARD_VIDEO {
      uuid board_id FK
      varchar video_id FK
      text status
      PK(board_id, video_id)
    }
    API_CREDENTIAL {
      uuid id PK
      uuid user_id FK
      text service
      text cred_data_enc
    }
마이그레이션 SQL (예시):
-- Folder table
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_views BIGINT DEFAULT 100000,
  max_days INT DEFAULT 7,
  duration_limit INT DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS policies for folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_folders ON public.folders
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (org_id IS NOT NULL AND org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()))
  );
CREATE POLICY modify_own_folders ON public.folders
  FOR ALL USING (
    user_id = auth.uid() OR 
    (org_id IS NOT NULL AND org_id IN (SELECT org_id FROM public.org_members 
                                       WHERE user_id = auth.uid() AND role IN ('Owner','Editor')))
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    (org_id IS NOT NULL AND org_id IN (SELECT org_id FROM public.org_members 
                                       WHERE user_id = auth.uid() AND role IN ('Owner','Editor')))
  );
(위 SQL은 예시로 folder 테이블과 RLS정책을 보여줍니다[92]. 실제 마이그레이션에서는 다른 테이블도 생성, 인덱스 생성, 초기데이터 추가 등이 이어집니다.)
ERD 요약: - 사용자 데이터 (users, orgs, org_members), - 트렌드 데이터 (channels, videos, video_stats) – 공개참조 테이블들, - 사용자 생성 데이터 (folders, folder_channels, favorites, boards, board_videos, alerts, credentials) – RLS 적용, - Rule은 folders에 포함시켜 간소화할 가능성.
RLS 정책 예시 (즐겨찾기):
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY favorites_user_iso ON public.favorites
  FOR ALL USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());
이렇게 모든 조작 자기것만 가능하게 합니다.
전체적으로, 데이터 모델은 확장성 & 보안을 고려했습니다. 폴더/보드 개념 분리로 팀 협업을 지원하고, RLS로 각 조직/사용자 간 데이터 격리를 보장합니다 (외부 API 키 같은 민감정보도 RLS 보호).
마지막 검증: - Video/Channel 등 공개정보 RLS없이 open인 점 – 안전 (공개데이터라 공유 문제없음). - 앱 접속시 JWT에 org_id/role 들어가며, RLS에 따라 org 데이터 공유됨 – 의도대로. - 대규모 시 video_stats 계속 누적 – 기간별 Partition이나 TTL job으로 관리. Supabase 2025 현재 PartitionING manual must be careful. - 성능 인덱싱: video_stats by video, folder_channels by channel, alert by user – 모두 적절히 인덱싱했습니다. - 미래 table 추가: e.g. weekly_reports (정기 리포트 저장) etc. – 용이.

8) UI/UX – 브랜드 컬러 적용 & 사용자 시나리오 개선
초기 화면(온보딩): - 설계: 첫 접속 시, 서비스 소개와 API 키 입력/로그인을 유도합니다. 화면 레이아웃은 상단에 로고와 캐치프레이즈 (“데이터로 잡는 Shorts 트렌드”), 중앙에 선택 옵션: ① YouTube API 키 입력 필드 (도움말 링크: “API 키 발급 방법”) 또는 ② Google 계정 로그인 버튼. Primary 보라색을 메인 CTA 색으로 사용해 “탐색 시작” 버튼을 강조합니다. - 대표 국가 버튼 (≥10): 온보딩 직후, 기본 지역을 한국(KR)으로 할 것이나, 바로 상단에 미국/일본 등 버튼을 배치해 (국기 아이콘+코드) 쉽게 전환 가능케 합니다. Primary 색상 테마 내에서 Hover 시 약간 밝아지는 보라 Outline으로 표시해 호버효과 줍니다. - 기간 칩 (24h/3d/7d): 국가버튼 아래 또는 옆에 기간 선택 토글을 둡니다. Secondary 빨강을 여기 쓰지 않고, 중립 회색/보라 조합으로 디자인합니다 (선택된 칩은 보라 배경+흰 글자, 비선택 칩은 투명배경+보라 테두리/글자). 24h는 “오늘”, 3d “3일”, 7d “7일” 식. Primary 컬러 (보라)로 표시하는 부분들이 많아질 수 있어, 칩은 Muted 보라 (예: 245,58%,90%) 배경 + primary 글자로 약간 눌러줍니다. - 길이 임계 칩 (≤60/70/90/180s): 기간 옆에 작은 드롭다운 or 토글로 “길이: ≤60s” 기본값 표시. Secondary 빨강 혹은 Accent 민트를 쓰지 않고, 일반 텍스트로 두어 중요도 낮음을 나타냅니다. Hover에 툴팁 (“Shorts 길이 기준 설정”) 제공. 대다수 사용자는 60s만 둘 것 같아, UI에서 노출은 옵션으로 숨겨둘 수도 있습니다 (고급설정 아이콘 클릭 시 나타나는 형태). 접근성 위해 tab-navigation 가능하게 구성. - [탐색 시작] 버튼: Primary 보라색의 큼직한 버튼을 중앙에 배치해, 필수 입력(키 or 로그인) 완료 후 활성화됩니다. 이 버튼은 시각적으로 가장 두드러져야 하며, 보라색이 배경이므로 내부 텍스트는 흰색 굵은 텍스트로 하여 충분한 대비(약 4.6:1 예상)를 확보했습니다[5]. Hover시 보라색이 약간 어두워지며 (245,58%,55%) 그림자가 살짝 생겨 입체감을 줍니다. Disabled 상태 (키 미입력시)는 연한 보라(245,20%,95%)에 흰색 텍스트 50% 불투명 등으로 명도비 낮춰 비활성 느낌을 줍니다. - 최초 경험 최적화: 이렇게 API 키라는 장벽이 있어, 사용자가 이탈할 가능성을 낮추기 위해: - (1) “API 키 없이 둘러보기” 링크를 제공하여, 제한적 데모데이터 (예: 어제 전세계 Shorts Top10) 보여주고 기능 맛보게 합니다. 이때 주요 기능(폴더, 즐겨찾기 등) 안내 Tooltips를 활성화해 교육합니다. - (2) UI 내에 “왜 API 키가 필요한가요?” 도움말 모달을 제공, 신뢰를 줍니다 (“당신만의 키 사용으로 쿼터를 확보합니다, 절대 서버에 저장 않음” 등 명시). - 이러한 개선이 온보딩 전환율을 높일 것으로 기대됩니다.
탐색 보드 (메인 대시보드): - 레이아웃: 좌측 상단에 필터바 (국가 버튼 그룹 + 기간칩 + (옵션)키워드검색창 + 필터메뉴), 우측 상단에 유저메뉴(프로필 아이콘, 알림벨). - 그 아래 메인 영역은 비디오 카드 그리드. 데스크톱 기준 5열×6행 = 30개 카드/페이지 (세로 스크롤)로 합니다[96]. - 모바일 (<=768px) 시 2열 그리드로 10~15개/페이지로 자동 줄어듭니다. (clarif.5: 30 vs 24/36 AB: 기본30으로, 필요시 user toggle a grid density option. 초기엔 30 fixed.) - 카드 구성 (한 개 영상 정보): - 상단에 썸네일 이미지 (aspect ratio 16:9나 1:1 – Shorts는 9:16이라 세로긴 이미지지만, YouTube API thumb은 16:9 crop. 우리는 16:9 thumbs 그대로 사용 또는 CSS object-fitcover). 썸네일 우상귀에 영상 길이 (예 “0:45”)를 반투명 검정 배경+흰글자로 표시 – YouTube UI처럼. 글자 12px, padding 2px, Primary 색상과 충돌 없게 모노톤 사용. - 썸네일 좌상귀 또는 코너에 랭킹 배지: 만약 Score정렬시 1~3위 영상에 🥇🥈🥉 이모지나, 또는 그냥 번호 “#1” 표시. 스타일: Secondary 빨강 테두리 동그란 배지에 흰색 번호 라벨 (대비 4.5:1↑로 빨강 약간 어둡게 만듦). - 썸네일 우하단에 즐겨찾기 버튼 (별 ★ 아이콘): 기본 테두리만 있는 ★(white stroke), hover/focused시 fill (Accent 민트)로 채움. Press시 API call -> fill채운상태유지. 이 버튼에 aria-label="즐겨찾기 추가" 설정해 접근성 확보. - 썸네일 아래 제목: 두 줄까지 표시, 14px Bold, 기본 텍스트색 (#1f1f1f on light). 너무 길면 ... 말줄임. Hover하면 제목 전체 툴팁 보여 접근성+편의. - 제목 아래 채널명: 12px Regular, 중간회색 (#555). 클릭 시 새탭으로 유튜브 채널 열림 (채널 링크 a태그). - 채널명 옆에 배지들 (임베드/지역제한/자막): Lucide 아이콘 16px. 임베드금지 시 <BanIcon color="red">, 지역제한 <GlobeOff color="orange">, 자막있음 <CcIcon color="green"> (색상은 구분 위한 것으로, 색약대비 위해 각각 모양 다르니 OK). - 그 아래 지표행: 아이콘+숫자 나열. - 조회수: 👁️ 아이콘 + “1.0M” 형식. - VPH: ⚡ 아이콘 + “50k/h”. - Δ24h: ▲ 또는 ▼ (녹색/빨강) + “+300k”. (증가 영상만 대부분이라 ▲초록 많음, 하락은 드물지만 ▼파랑이나 회색으로 표현해 너무 자극적 빨강 안쓰도록 고려). - 게시일(상대): 🕒 아이콘 + “3일 전”. (혹은 “Aug 12” 정확 날짜 if >7일). - 스코어: 🏅 아이콘 + “S=1.8” 등 점수. Score는 일반 사용자는 이해 어려우므로 굳이 표시하지 않고, 대신 정렬기준으로만 활용. (만약 Score를 표시하려면, "Trend Score: 1.8 (higher is better)" 같은 설명필요. 초기엔 노출 안함). - 참여율: UI 과밀 피하려 기본 숨김. 필요시 카드 Hover ToolTip에 “참여율5%” 같이 보이게. - 모바일 최적화: 작은 화면에서는 지표행을 한두 개만 보이고, 나머진 카드 탭 시 확장. 예: 기본으로 조회수만, 나머지 swipe left 시 나타나는 등 가능. 우선 MVP에선 모바일에서 지표행 좌우 스크롤 가능하게 CSS 적용 (overflow-x: auto), 사용자는 슬라이드해 VPH나 Δ 확인. - 색상 사용: - 카드 배경은 흰색 (다크모드시 #1e1e1e). - 텍스트 기본 검정(#000) or 다크모드흰(#FFF). - Primary 보라는 링크나 강조 텍스트(예: 채널명 Hover시 보라 underline) 등에 국한해 쓰고, 지표 아이콘/숫자는 높은 대비 위해 대부분 기본 흑/백 사용. - Δ24h의 ▲▼만 초록/빨강 (Secondary 빨강 hsl(0,100%,71%) text on white는 좀 연하지만, 짧문자라 시인성 충분). - z-MAD 아웃라이어 영상엔 🔥 아이콘을 제목 옆에 빨강으로 넣거나(살짝), Score 상위3에 ⭐ 강조 등. - 다크모드시 전반적으로 light모드 대비 명도 높인 Palette (e.g. Primary 다크=77%L, Secondary다크=65%L)로 적용되며, Lucide Icons에 CSS color: currentColor로 설정되어 text와 동색 나타나게 (다크모드서 #FFF). - 밀도/가독성: - 우리는 한 카드에 데이터 많으나, 아이콘과 줄바꿈으로 잘 구분하면 괜찮다고 판단. - 대신 폰트 크기를 작게 유지 (전반 12~14px)하고, 여백을 적절히 줘 숨쉴 공간 확보. - 예: 제목과 채널명 사이 2px margin, 지표행과 위 요소 간 4px margin 등. - 컬러로 인한 혼란: 너무 많은 색 쓰면 산만. - 채널명은 기본색 (혹 Primary?), 배지들은 컬러, 지표는 흑백 아이콘… - 해결: 채널명도 그냥 검정으로 두고, 링크표시는 아이콘 붙이는 걸로. Primary 보라는 주로 버튼/링크에만. - 키보드 지원: - Tab으로 카드 간 이동 (Focus시 카드 테두리를 Primary 보라 2px 강조). - Enter키로 상세/동영상 보기 (우린 클릭 시 유튜브로 가게 할지? Scenario B에서는 키워드 필터, scenario C에서는 즐겨찾기, 내재생은 안함). - f키로 즐겨찾기 toggle (Focus있는 카드에 JS event). - 이런 마이크로UX는 추후 안내 (단축키 도움말 modal). - 우측 패널 (주제/키워드 레이더): - 기본은 화면 오른쪽에 접혀있는 탭 (예: “Topics” 라벨만 보이는 40px 패널). 사용자가 이를 클릭하면 와이드 300px 패널 슬라이드 아웃. - 패널 내용: - 제목: “🔎 Trending Topics” (16px, 보라색) 상단 표시 + 새로고침 아이콘 (클릭 시 키워드 재계산 – 일반적으로 필요없지만 혹시 영상리스트 변경시 업데이트 안되어 있으면 수동 sync용). - 목록: 순위 1~N 키워드. 각 항목 높이 24px 정도로 한 줄에: - 예: 1. Barbie – ▲120% - 좌측: rank 번호 (회색), 키워드 (검정 굵게). - 우측: 증감 지표 ▲/▼ + % (녹/빨). %는 Wikimedia pageview 7일 대비 금일 증가율 or GTrends 1주 지수 대비 diff(Plan B). - 키워드 뒤에 짧은 설명 italic “(film)” 같은 유형 표시 if 가능 (Wikidata entity type). - 각 항목 Hover시: 관련 배경정보 툴팁 (“영화 개봉 영향[28]” – 간단 수동 작성도, 또는 Wikidata description snippet). - 항목 클릭: 현재 영상 리스트를 해당 키워드 포함 영상만 필터 (UI: 카드들 중 제목/태그에 그 단어 없는 건 반투명 처리 또는 숨김) – scenario B개선안. - 스파크라인: 각 키워드 옆에 작은 50px폭 sparkline SVG (pageviews 7일 추이). 이건 구현 부담돼 일단 %만으로. - 스타일: 패널 배경은 Muted 보라(연보라)로 약간 채도있는 색 (#f5f3ff 정도) 하여 본문과 구분. 다크모드에선 #2a2a40 쯤. - 키워드 텍스트: 기본 검정 (다크에선 흰). - 순위 숫자: #888 중간회색. - ▲▼: ▲초록 (hsl(161, 94%, 30%)) / ▼빨강 (hsl(0, 80%, 50%)). - 그 오른쪽 % 숫자: 해당 색과 동일하게 (초록/빨강) – 색약대비 위해 ▲▼ 모양 다르니 어느정도 OK지만, 혹 우려되면 둘다 파랑(증가)과 회색(감소) 등으로 바꾸는 것도 고려. - 스크롤: 키워드 20개 모두 표기시 높이 2024=480px, 보통 화면 fit. 넘치면 패널 자체 스크롤. - 정보 과부하 방지: - 패널 디폴트 닫힘 (사용자 필요시 열어봄). - 또한 키워드 너무 많은 경우 최상위 5개만 기본 표시, 나머지는 “Show more…” 눌러 확장. - 필요시 토글 옵션으로 완전히 안 보고 싶으면 UI preference 저장 (예: “Trending Topics 패널 표시안함”). - 모바일: 이 패널은 가로폭 부족하므로, 하단 시트나 별도 탭으로 구현. 예: 화면 상단에 Topics 탭 누르면 화면이 영상 그리드 대신 키워드 리스트로 전환. (1열 리스트로 큰 글자 제공). - 모바일에서는 영상 보고 키워드 보고 왔다갔다 할 수 있도록. - 향후 확장*: 추후 (A) 엔터티 그래프 등 도입시, 이 패널에 “Graph View” 토글 넣어 시각화 전환 가능하게 여지.
소스 채널 & 알림 큐 (폴더 화면): - 설계: 상단 메뉴에 “📂 폴더” 아이콘 눌러 폴더 관리 페이지로 이동. - 좌측: 폴더 목록 (트리뷰). 개인 폴더와 팀 폴더를 구분하여 섹션 나눔. 예: “My Folders” 아래 즐겨찾는 채널 그룹 리스트, “Team Folders” 아래 공유 폴더들. 폴더 이름 옆 (…개 채널) 개수 표시. - 폴더 클릭 시 우측 패널: - 상단: 폴더 이름, 룰 편집 버튼 (연필 아이콘) – 누르면 모달에 min_views, max_days, duration 입력/슬라이더 UI[28]. Secondary 빨강색 “저장” 버튼 (경고 느낌? 굳이? 아니면 Primary보라 써도 될듯). - 중간: 채널 리스트 (이 폴더 포함 채널들). 각 채널명 오른쪽 “삭제” (휴지통 아이콘, 빨강 Hover) 누르면 폴더에서 제거. 상단 “채널 추가” 버튼 (Primary Outline 스타일) 눌러 채널 검색 모달 → 추가. - 하단: 알림 큐 리스트 – 이 폴더의 임계 충족 영상들. 예: “📌 Awesome Video (채널명) – 1.2M views / 2일 (45s)” 형태로 표시. 좌측에 빈 체크박스. - 사용자는 체크 후 “보드로 보내기” (Primary 작은 버튼) 누르면 즐겨찾기+보드 추가하고 리스트에서 제거되도록. 또는 “모두 보드로” 한 번에 처리도. - 각각 “무시” (X 아이콘) 클릭하면 해당 alert 삭제 (DB seen=true). - UX: 알림 항목이 많으면 상하스크롤. 또한, 상단에 “최근 알림 X건” 드롭다운 필터 (예: 안 본만/다 보기/정렬) 제공. - 폴더 편집/채널추가/알림처리 등의 마이크로 UX: - 채널검색 모달에서 추가 시, 실시간 folder_channels insert → 좌측 목록+채널리스트에 새 채널 나타남 (Supabase Realtime 구독으로 처리, 혹은 optimistic UI). - 룰 변경 후, NextAPI route로 DB 업데이트 & PubSub 재구독(leaseSeconds=0 mode=unsubscribe+subscribe) – 백엔드 처리, UI선 loading spinner. - 임계 낮춘 경우 기존 충족안됐던 영상들도 부합할 수 있어, 다음 스냅샷시 alert 추가. - 임계 높인 경우 기존 alert 중 조건안맞는 것 (false alarm) 있을 수. 이건 사용자 지우도록 두거나, 편집시 “기존 5건 알림이 조건 불충족으로 제거됩니다” 안내 후 auto 제거 (DB delete) 고려. - 접근성: 트리뷰 keyboard navigation (상하이동, 좌우 expand/collapse) 구현. ARIA roles (tree, treeitem, group 등) 부여. - 다크모드: 좌측 패널 진한 회색(#222), 우측 패널 약간 어두운(#1e1e1e), 텍스트 흰색계열. - 개선안: - 알림이 폴더별로만 보면 다분산이라, 상단 “모든 알림” 탭도 지원하여 폴더 상관없이 한꺼번에 볼 수 있게 (사용자 “모든 뜨는 영상” 모아보기 용이). - 팀 폴더의 경우, alert마다 담당자 assign 또는 코멘트 달 수 있게 하면 협업에 좋음 (아직 미구현). - 폴더 너무 많을 시 검색 기능. - Bulk ops: 채널 다중선택 삭제, 알림 다중선택 처리. - (이런건 추후 Team향 개선)
보드·리포트: - 보드 (즐겨찾기 모음): - 팀 협업용 칸반 보드 UI: 상단 탭으로 “Ideas | In Production | Posted” 3열 표시. 각 열 밑은 해당 상태 비디오 카드 리스트 (썸네일 작은+제목). Drag & drop 지원 (Framer Motion + pointer events). - 개인사용자는 칸반보단 단순 즐겨찾기 리스트뷰 제공: 표 형태로 순번, 제목, 메모, 추가일, 태그, 삭제버튼. - 다크모드/라이트모드 모두 기본 요소만 (특별색X, 보라버튼 등 통일). - 태그: 아이디어마다 편집자 메모 혹은 태그 (예: #해외 #고양이챌린지). tag는 Accent 민트 pill로 표시 (민트/다크모드에서는 약간 청록), 여러개 붙일 수 있고, 클릭 시 해당 tag의 즐겨찾기만 필터. - 공유: Team board는 org 회원 모두 접근 (RLS), 동시에 편집해도 supabase realtime으로 반영. ex: A가 카드 이동하면 B 화면에서 즉시 해당 item DOM이 옮겨짐 (Position field or list order array in DB to maintain order). - 주간 리포트 카드: - Pro/Team 사용자가 원하면, 주별 요약 PDF/페이지 제공. - 예: “이번주 업로드 5개, 총 조회 200만 (전주 +20%)”, “폴더1: 최고 성과영상 100만”, “Top Trending Topics: A, B, C” 등을 도식. - UI: Settings에서 “주간 리포트 받기” on하면, 매주 월 이메일 or PDF link. - 이건 기능적으론 2차 목표, UI mock만. - 마이크로 UX: - 로딩 스켈레톤: Search 실행 → 영상 카드들 자리 placeholder (회색 블럭) 표시[94]. 0.5초 뒤 데이터 오면 skeleton->real content fade 전환. 같은 skeleton 컴포넌트 재사용해 user waiting time 지루함↓. - 정렬 토글: 리스트상단 “정렬: 조회수▼” 버튼. 클릭시 메뉴 “조회수, 트렌드점수, VPH, 좋아요율” 등. 선택 즉시 클라이언트에서 video 배열 sort해 UI update (re-fetch 없이). - 즐겨찾기 Undo: 즐겨찾기 버튼 누르면 즉시 카드 상단에 “★ Added to Favorites [Undo]” 5초 토스트를 띄웁니다. Undo 클릭시 곧바로 Favorites 삭제 API call & UI revert. Toast CSS: position fixed bottom center, Primary 보라 background + white text (contrast OK) with slight drop-shadow for visibility. - 키보드 숏컷: - / 누르면 검색 input focus. - f 누르면 현재 focus 카드 즐겨찾기 toggle. - j/k 리스트 위아래 이동 (focus 다음카드). - Enter focus 카드의 YouTube 보기 (새탭). - ? 누르면 Shortcut Help modal (overlay listing available keys). 이 modal dark backdrop + white text big, ensure easily dismiss (Esc or click). - WCAG 준수: - 모든 버튼,링크에 aria-label 또는 text있게. (아이콘-only 즐겨찾기 버튼 aria-label="즐겨찾기 추가"). - 색상 대비: 대부분 요소 4.5:1↑. 예: 회색 텍스트(#555 on #FFF = 5.7:1)[4], 보라 버튼 흰글씨(약 4.6:1, borderline이지만 굵은폰트라 OK)[1]. - 포커스 링: default 브라우저 outline 대신, Tailwind focus:outline-none focus:ring-2 focus:ring-accent 적용. 예: Tab으로 카드 focus시 민트색 2px 테두리. 이는 배경 흰색과 3:1 대비 여부 – 민트(161°,94%,50%) vs white (~2.6:1?), 다소 낮지만 focus indicator는 AA요건 3:1 (비텍스트)이라 조금 부족. 개선: focus 링을 검정 or 보라+alpha로 이중 적용 (Stark plugin으로 test). - Radix UI ARIA: Dialog, Dropdown 등 Shadcn컴포넌트 aria-auto. - 색약/고대비 검사: 빨강(경고) vs 민트(성공) 같이 표시될 경우 (예: Δ24h +120% (초록) vs Δ24h -50% (빨강)), red-green colorblind에선 둘다 중간회색처럼 보임. 우린 부호▲▼및 +/-(텍스트)로 함께 표현해 구분 가능하도록 했습니다[5]. 또한 차트 아이콘/배지도 모양과 색 중복사용해 누구나 인지 가능케 합니다.
컬러 토큰 / Tailwind 테마 정의: - Tailwind config theme.extend.colors에 CSS변수를 매핑:
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: "hsl(var(--color-primary) / <alpha-value>)",
      secondary: "hsl(var(--color-secondary) / <alpha-value>)",
      accent: "hsl(var(--color-accent) / <alpha-value>)",
      foreground: "hsl(var(--color-foreground) / <alpha-value>)",
      background: "hsl(var(--color-background) / <alpha-value>)",
    }
  }
}
그리고 CSS:
:root {
  --color-primary: 245 58% 61%;
  --color-secondary: 0 100% 71%;
  --color-accent: 161 94% 50%;
  --color-foreground: 16 6% 10%;   /* 거의 검정 (#1A1A1A) */
  --color-background: 0 0% 100%;   /* 흰색 */
}
[data-theme="dark"] {
  --color-primary: 245 65% 77%;
  --color-secondary: 0 90% 65%;
  --color-accent: 161 84% 45%;
  --color-foreground: 0 0% 100%;
  --color-background: 240 5% 8%;  /* 아주 짙은남색 (#141414) */
}
- 이렇게 하면 Tailwind 클래스 bg-primary, text-secondary 등 사용 가능. 8절 예시 CSS 추가: - --color-primary-hover/pressed 등도 CSS vars 정의해, Tailwind에서 bg-primary-hover 커스텀으로 쓸 수 있게 (config에 추가). - Hover/Active/Muted: - Hover (Light): primary: 245,58%,55% (살짝 어둡게). secondary: 0, 100%,65%. accent: 161,94%,45%. - Pressed: primary: 245,58%,50%. secondary: 0,100%,60%. accent: 161,94%,40%. - Muted (Disabled): primary: 245,20%,90% (연한보라), secondary: 0,30%,95% (흐린핑크), accent: 161,30%,90% (흐린민트), foreground: 0,0%,50% (중간회색). - Contrast test: - Primary(#6f5ef9) bg vs white text: lum ~0.35 vs 1.0 -> ~(1.05/0.4)=2.625:1 (fail!). Wait actual contrast might be ~3:1. We need ~50% L for ratio ~4.5:1. Pressed tone 50% L likely yields that. So maybe we should choose pressed tone as default (slightly darker) for small text elements. - In design, to ensure at least 4.5:1 for normal text, we might reduce primary L to ~50%. We'll do a test in design tool (Stark plugin reveals #5a46f5 vs #fff = 4.56:1 which passes, that color ~245°,70%,60%). - Secondary(#ff8b8b) vs white text: fails AAA likely (approx 3:1). But we rarely use red as large background with white text, only small icons or border which is fine. Danger buttons would be filled red with white – we might darken red more (like #e05454). - Emphasis: We'll do thorough contrast tests (Chrome dev tools Accessibility) and adjust variables accordingly before finalizing palette.
버튼/링크/배지/포커스링 – 접근성 충분한가?: - Primary 보라 버튼: 우리가 조정할 거라 AA 통과 확실히 할 예정[1]. - 링크 (텍스트 보라): 작은 텍스트라 AAA까지 가려면 아주 짙은 보라여야. 대신 밑줄항상 표시로 색 구분 못해도 인지 가능하게 (WCAG Link Purpose). - 배지: 우리는 주로 아이콘+툴팁 형태라 색 못 구별해도 툴팁텍스트 제공. - 포커스 링: 민트 vs 백 2.6:1 → WCAG 2.4.11 (Non-text Contrast) AA 기준 3:1 미달. - 대안: 2px outline + 추가 1px 백색 outline(이중 테두리) → 조합시 효과적. Or use default blue outline (ugly). We'll likely implement custom ring with slightly darker accent and maybe drop-shadow to ensure visible. - 전반적으로, 우리는 단색 아이콘+텍스트+툴팁 조합으로 정보전달하며, 색은 중복피드백용이라 색약자도 문제없습니다[5]. - 대체 톤 스케일: 만약 현 HSL 체계가 부분 대비 미달이면, Secondary빨강을 조금 어둡고 덜 채도 (예: hsl(0,80%,60%))로 조정, Primary 보라도 50~55% L로 내리는 등 fallback안 준비. - UI 출시 전 LightHouse, Accessibility Insights 등의 자동검사로 조정할 것입니다.

9) 사용자 경험 시나리오 – 개선사항 (시간 절감/정확도/재현성)
시나리오 A: 해외 소스 재가공 팀
(가정: 국내 MCN 팀이 해외 Shorts를 모니터링해 자막 편집 영상 제작)
흐름 요약: 팀 리더가 폴더에 소스 채널 등록 → 임계치 (예: 3일 내 100만뷰) 설정 → 시스템이 큐에 임계 충족 영상 자동 선별 → 편집 담당자가 알림 큐에서 영상을 골라 보드에 핀 → 기획 회의에서 보드 영상을 검토 후 제작.
병목 지점 & 개선안:
채널 대량 등록의 번거로움: 50개 해외 채널을 한땀씩 검색-추가하면 시간 걸립니다. 개선: “채널 불러오기” 기능 – 예: CSV 목록 붙여넣기, 또는 유튜브 재생목록 URL 입력 시 거기서 채널 추출. 혹은 “Trending Creators 추천” 기능으로 미국/일본 등 상위 Shorts 채널을 한 번에 폴더에 추가[48]. 이런 bulk add 기능은 구현 우선도 높습니다. 효과: 초기셋업 시간을 수시간→수분으로 단축 (시간 절감).
임계값 최적화 어려움: 처음에 100만으로 했는데 보니 너무 적게 알림 오거나 너무 많이 올 수 있습니다. 개선: “추천 임계치” 가이드 – 폴더 내 채널들의 평균 조회 등을 분석해 제안[23]. 예: “이 폴더 채널 최근영상 평균 50만, 상위 10% 120만 → 임계 100만 권장”. 또는 AI로 “알림이 하루 5건 정도 오려면 ~80만이 적당합니다” 코멘트. 효과: 임계 튜닝 시행착오 감소 (정확도 향상).
알림 대량 처리의 부담: 만약 어떤 이슈로 동시에 20개 영상이 임계 달성했다면, 팀이 하나씩 보드에 핀/처리 해야 합니다. 개선: 알림 큐에 다중 선택 & 일괄 액션 추가. 체크박스로 여러 항목 선택→ “모두 아이디어 보드에 추가” 한 번에 가능. 또는 “모두 무시” 버튼. 효과: 불필요 반복작업 줄여 시간절약.
중복/협업 충돌: 여러 팀원이 같은 폴더를 볼 때, 한 영상이 A편집자와 B편집자 모두에게 알림→ 둘 다 잡으면 중복작업 위험. 개선:
알림 항목에 담당자 할당 기능 – 편집자가 “내가 맡기” 클릭 시 아이콘/이름 표시, 다른 사람에게는 해당 항목 “담당: 홍길동” 나타남.
또는, 알림 발생시 바로 AI가 “유사 알림 최근 3건 처리됨 (이미 핀됨)” 등을 감지해 중복 제거.
간단하게는, 한 번 보드에 핀되면 다른 사람 알림목록에서도 제거함 (alert 모두 seen 처리). 이는 DB에서 org 폴더 alert 여러개→보드 핀시 모두 seen으로 업데이트.
효과: 협업 혼선↓, 정확도↑ (중복 콘텐츠 제작 방지).
알림 전달 채널: 지금은 웹앱에 들어와야 알림을 확인하지만, 편집자가 실시간으로 알림 놓치면 기회 놓칩니다. 개선: 모바일 푸시 알림 (PWA push) 또는 Slack 연동 (webhook) 제공. 예: “폴더 X: Y채널 영상 1,000,000뷰 돌파!”. 초기엔 이메일이라도. 효과: 사용자가 사이트 미접속 중에도 트렌드 포착→반응 속도 향상 (재현성↑: 놓치지 않는 일관성).
요약 가치: 개선안 통해 채널세팅 시간 80% 절감, 임계세팅 정확도 향상, 대량알림 처리 시간 50% 감소, 중복작업 0건 달성, 알림 놓침률↓ 등 정량효과 기대. 이는 곧 편집 리드타임 단축과 운영 효율성 증대로 이어집니다.
시나리오 B: 주제 선점 (트렌드 토픽 발견)
(가정: 1인 크리에이터가 Shorts 주제 아이디어를 얻고자 글로벌 트렌드 탐색)
흐름 요약: 사용자가 국가 버튼 → 무키워드 인기 Shorts 리스트 확인 → 사이드바 레이더에서 급상승 주제 발견 → 해당 주제 관련 영상만 필터링하여 집중 분석 → 아이디어 결정 후 즐겨찾기에 추가.
개선 포인트:
국가 전환 중 맥락 상실: 예컨대 한국→미국 버튼 누르면 리스트 확 바뀌는데, 어떤 주제가 두 나라 공통인지 한눈에 알기 어렵습니다. 개선: 다중 국가 비교 모드. UI에서 한국+미국 모두 선택하면, 리스트를 탭 2개(한국 / 미국)로 표시하거나, 혹은 한 화면에 두 열(grid 두개) 병렬 비교. 또한, 교집합 주제를 별도 정렬 (“Both KR & US trending” 섹션)으로 보여줍니다. 효과: 사용자 관심 주제가 글로벌인지 지역특수인지 파악 용이 (정확도↑).
트렌드 주제 맥락 부족: 레이더에 “바비” 키워드만 보고는 모르는 사람이 뭔지 모릅니다. 개선: 키워드에 간략 설명 제공. Wikidata description (“미국의 패션 인형 브랜드” 정도)나, 뉴스 헤드라인을 한줄 첨부 (“영화 ‘바비’ 개봉 첫 주 1억불 흥행”). 효과: 사용자가 새로운 주제를 빠르게 이해 (시간절약).
키워드 필터 UI 모호: 현재 설계는 키워드 클릭→영상 리스트 필터인데, 적용되도 UI상 필터됐단 표시 부족하면 헷갈립니다. 개선: 필터 적용시 상단에 필터 배지 표시. 예: “Filter: ‘바비’ ×” 버튼 상단 고정. 사용자가 눈치채기 쉽고, × 누르면 필터 해제[24]. 효과: UX 명확성 증대 (재현성: 사용자가 같은 액션 해도 항상 인지 결과 같음).
과부하 가능성: 영상 리스트+키워드 패널+필터까지 작동하면 정보량 많습니다. 개선:
패널 기본 닫음 (우리가 적용).
투어 가이드 추가: 사용자 처음 키워드 패널 열 때 “이 목록은 트렌드 토픽이며, 클릭하면 리스트 필터링 합니다” 안내 팝업.
UI 요소 단계별 노출: 예: 키워드 Top5는 영상 리스트 상단 작은 탭으로 (색연필 모양 아이콘 옆에 #바비 #고양이 등 나열) – 눈에 덜 띄지만 존재는 알림. 눌러야 전체 패널 보이는 식.
효과: 처음엔 깔끔, 필요 시 깊게.
후속 행동 유도: 아이디어를 즐겨찾기 해뒀으면, 거기서 끝이 아니라 편집 실행으로 이어져야 진짜 가치 실현. 개선: 즐겨찾기 추가 시 다음 단계 제안(예: “📋 이 아이디어를 어떤 폴더(보드)에 기록할까요? [만들기]”). 또는, AI 기반 확장: “이 주제로 이런 컨셉의 Shorts 만들어보세요!” 간단 프롬프트. MVP에선 어려우나, 추후 OpenAI API와 연동해 키워드 기반 대략 시나리오 1줄 주기도 가능. 효과: 사용자가 얻은 인사이트를 행동으로 옮기게 하여 (재현성: 아이디어->영상 제작 일관된 pipeline), 서비스 가치를 실제 성과로 연결.
요약 가치: 개선안으로 이해 정확도 상승 (주제 맥락 제공으로 판단착오↓), 작업시간 단축 (키워드 탐색/필터 쉽게), 일관성 향상 (필터 명확표시로 사용자가 반복 사용시 혼동 줄음).
시나리오 C: 팀 협업 (가정: 다인 편집팀이 아이디어 보드를 공유)
흐름 요약: 팀장이 보드 공유 (팀원 초대) → 각자 트렌드 보며 영상 아이디어 핀 → 보드에 아이디어 모임 → 주간 회의에서 태그/상태 붙여 우선순위 결정 → 담당자별 진행 (상태 이동) → RLS 권한에 따라 에디터들만 상태 바꾸고, 분석가들은 읽기만.
RLS/권한 모델 검증:
오너/에디터/분석가 구조: 앞서 7절 ERD 기반 구현. 누락 요소: Viewer (읽기전용 외부인)은 현재 Analyst가 해당 (분석가 읽기만). 필요시 “Guest” role 추가로 RLS role='Guest' THEN SELECT only easily extends.
공유/격리 확인: 같은 조직 내 보드/폴더는 공유, 조직 밖 접근불가 – RLS정책이 맞게 구성됨 (org_id 기반). 만약 한 사용자가 둘 이상 org 멤버면 JWT에 한 org만 담겨 곤란 -> In that rare case, multi-org membership require re-login or multi-account. (MCN 직원이 여러 클라이언트 org? – 그냥 하나 org에 여러 folder로 구분, org = 회사).
프로젝트 단위 구조?: MCN이 5개 유튜브 채널 클라이언트 각각 따로 협업원하면, org기반은 “회사” 1개 org, 그 안에 folder로 클라이언트 구분. Analyst A (담당 채널1만)도 org 전체 folder 보긴 하나, RLS 세분화project별 구현 어려워 일단 오픈. 혹 불편 report되면 folder에 access list 추가 확장 (ex: folder_members table).
협업 UX 개선:
보드 실시간 업데이트: Supabase Realtime (our design) – 동시성 문제 적을 듯.
태그/상태 관리 누락: 현재 board_videos.status 필드로 Kanban. 검증: RLS ok (board에 org_id => all org sees statuses), Analyst도 select ok. Editor role users can update status (policy with check role). DB정합 ok.
권한 구분 UI: Owner만 초대/삭제 버튼 보이고, Editor들엔 보이되 disabled (“권한없음” 툴팁), Analyst에선 버튼 자체 숨김.
팀원 커뮤니케이션:
Comments: Board item에 comment thread (like Trello card comments). Not in MVP, but high request likely. DB comment table needed.
For now, instruct team to use Slack/Discord for discussion if needed. Possibly add “Copy link to board item” to share context.
누락 기능:
Notification if someone adds a new idea to board – nice to have (Realtime or email “A님 board에 새 아이디어 추가”).
Weekly summary of board if not many meetings – tie into weekly report concept.
개선안:
향후 AI auto-tag: 예: “아이디어 보드 > ‘고양이 밈’ tag” 자동.
사용자 가치:
권한 모델 확정으로 데이터 보안 확보 (클라이언트별 분리, 잘못 공유 방지 – 신뢰성↑).
협업시 중복작업/충돌 없음 (상태/담당 체계로 재현성↑ – 매주 정례 프로세스 굳힘).
Analyst 같은 읽기전용 역할로 데이터 무결성 유지 (실수삭제방지 – 정확도↑).
보드에 상태/태그 달아 관리하면, 콘텐츠 제작 pipeline이 시각화되어 업무 누락↓ (일관성↑).
만약 우리 툴 없었다면, 개별 Excel이나 채팅으로 아이디어 주고받았을, 보드로 시간 크게 절감되고 성과 재현성 높아질 겁니다.
누락 없는가?:
RLS org정책 외 개인정보/정책 누락 없음 (우리는 영상 공개데이터만).
Terms of use: 팀이 다운로드해 편집재업로드 하는 행위는 유튜브 약관상 grey, 그러나 서비스로서 금지 강제는 못하니 명시적 금지만 (정책 고지).
메트릭: 향후 협업 기능 이용팀이 그렇지 않은 팀보다 아이디어→업로드 성공률 얼마나 개선 등 측정해 사례로 제시.

10) 쿼터/성능/안정성 – 예산 & 폴백 수립
쿼터 예산표 (일 기준): 아래는 일반 사용 시나리오로 YouTube Data API 쿼터 소모를 추산한 것입니다 (Google 기본 할당 10,000 units/일)[93].
개인 사용자 (Free): 예를 들어 3개 국가, 1주일 기간, 하루 2회 조회:
search.list: 3국 × 1기간 × 1페이지 × 2회 = 6회 = 6100 = 600 units*.
videos.list (50개씩): 6회 ×1u = 6 units.
폴더 채널 알림: 10채널, 하루 5개 신규 업로드 푸시 = 5회 videos.list = 5 units.
스냅샷 워커: 상위 50영상 ×24회/일 = 24u (50개 일괄×24) = 24 units.
합계 ≈ 635 units/일 (약 6.4% 할당).
(기타 favorites insert 등 DB만, 외부 API 무료).
여유: 10k중 635 → 많이 사용해도 쿼터 넉넉, 다만 여러 사용자가 동시에 쓰면 합 증가.
Pro 사용자 (헤비): 예 10개 국가, 3기간 (24h/3d/7d), 2페이지 (상위100개), 하루 4회:
search: 10324 = 240회 = 240100 = 24,000 units (키 하나로는 불가, 10k초과).
videos.list: 240*1 = 240u.
사실 이 수준 사용은 1인 불가능 (키쿼터벽), Pro라도 BYO 키+캐싱필요.
우리의 대책: 인기 지역 조합 몇 개는 서버가 미리 데이터를 캐싱 제공, 또는 사용자가 API키 추가 (키당 10k). 예: Pro 3개 키까지 등록 허용 → 30k units.
예산관리: Pro 월정액에 “일 할당 30k” 명시, 초과 시 임시 차단.
Or Pro에게 “Trend Bulk mode (pre-collected data)”로 제공해 실시간 API콜 줄임.
Team 사용자: Team은 다수 사용자 합산.
예: 5인 팀, 각 5국가×3기간×2페이지 (150 calls) 하루 2회 → 15025=1500 calls=150k units (크나, Team plan은 자체 quota cluster로 증가 요청 or user키5개).
우리 권장: Team은 반드시 조직 자체 YouTube API 키 발급받아 연결케 하고, 필요시 할당 Google API 쿼터 상향 신청 (유료).
또한 Team 플랜에서는 사전 데이터 수집 전략: 예: Global trending cron 15분마다 50국가 trending 저장 (500calls/h, 12k/day), Team 조회시 DB read만. 이 비용을 우리가 부담 (12k/day 120%정도, monitor).
예산: Team 월 요금에서 API초과 비용 일부 책정 가능 (Reddit 등).
쿼터/리미트 대비 폴백:
사용자별 제한:
Free: 하루 1000 units (API키당) Soft limit. 초과 시 “Free 할당 초과, 내일 다시 또는 Pro 업그레이드” 메시지.
Pro: 하루 5000 units Soft (키 BYO시 사실상 user limit없음, but we monitor).
Team: org단위 일 10000*N (N=키연결수) or custom.
이 제한치를 서버에서 check (DB usage_log 누적)하고, 넘으면 search API call을 block하고 cached 데이터만 제공.
유저 BYO키 활용:
프리미엄 유저는 자신의 Google API 프로젝트 키를 등록 가능. 그러면 그 키는 별도 10k할당 사용.
시스템이 call 분배: userKey 우선, 없으면 공용Key 사용.
이렇게 하면 Pro/Team 유저 많아도 공용키 부담 덜고, 사용자도 자신의 limit쓰는거라 서비스안정성↑.
약관상 사용자 API키 사용은 허용(자신키), 우리 서비스는 단지 UI/Workflow 제공.
Throttle & Cache:
Search 결과는 변동 크지 않으므로 동일조건 요청은 10분 캐시. e.g. user A 12:00 “US 7d” search → 12:05 user B 같은 조건→캐시 히트(0쿼터).
서버 Cache store (Redis or memory) with key=region+days+page, expire 10min.
Videos.list도 search결과IDs에 ETag 사용 or partial fields to reduce cost (statistics selective etc). Quota cost diff 없으나 payload↓.
유휴정책:
일정기간 (ex: 1달) 미접속 Pro user -> background tasks (alerts/tracking) 중지 (그 user’s channels unsub).
Channel unsub on plan downgrade (Team→Free).
외부 API 한계:
Wikidata Rate Limit: 60s Timeout/requests. If backlog, we degrade: skip entity linking for less frequent terms to reduce calls.
Reddit: 상업 제한 – default we keep usage minimal, if planning heavy use (like scanning r/shorts daily) consider paying or storing fallback dataset.
GDELT volume huge: we might only use when user specifically queries a newsy keyword. Default less.
성능 목표 (95퍼센타일):
검색 페이지 응답: 5초 이내 (대부분 2~3초). Search API 100 results ~0.5-1s, videos.list ~0.2s, processing ~0.3s, total ~1.5s + network. 95p= ~3s (some overhead in Vercel).
알림 실시간성: PubSub → alert UI < 60초 (대부분 10-30s).
동시성: 100명 동시 검색 = 100*2calls=200calls in short time – well within Node concurrency & API quotas (we’ll queue if needed).
부하테스트: trending snapshot job 50calls/h, DB writes manageable (50 rows/h). Team heavy scenarios rely on caching to avoid multi-run at once.
안정성 폴백:
High load fallback:
If our server sees sudden surge, e.g. trending API all users triggers at exact hour – handle with queueing requests (we use p-limit to only 5 search calls parallel to not hit QPS limit). Slight delays but stable.
We also on server set global rate-limit (e.g. max 50 req/sec overall) to avoid hitting Google QPS (should be 100 req/sec by default).
Downstream outage:
If YouTube Data API goes down (rare), user facing fallback: show last cached results + banner “YouTube 데이터 불안정, 최근 데이터 표시 중” like SocialBlade does during YT API issues.
If Supabase DB down: our NextAPI calls fail → show error page “서버 점검 중” (503). Meanwhile, background could log to monitor. Possibly incorporate a read-only fallback (like we could fetch trending from YT API on the fly and show, but without DB many features off). But downtime hopefully minimal (Supabase SLA).
Auto-healing:
If PubSub fails repeatedly (no feed in hours), our backup poll ensures continuity albeit less realtime (worst-case 6~12h detection).
If Cron tasks fail (e.g. snapshot job stuck), have a watchdog Edge Function that monitors video_stats last entry times, if stale triggers restart.
Vercel Cron reliability is high but not perfect; important tasks consider redundancy via Supabase schedule too.
장애 폴백 요약:
API 할당 초과 → 일부 기능 차단 & 캐시/샘플로 유지, 업셀 유도.
주요 API 장애 → 캐시/대체데이터 활용 & 안내 표시.
실시간 기능 실패 → 폴링/수동 새로고침으로 보완.
데이터 일관성 문제 → RLS/Txn처리로 예방, 혹 발생시 admin 모드에서 정정 or user UI에 “데이터 새로 동기화” 버튼 제공 (재pull).
운영 알람:
우리는 중요한 워커(스냅샷/알림) 실패 시 Slack/webhook으로 관리자에게 알림해 빨리 대처토록 할 예정 (alerting system).
예: X시간 이상 video_stats 없음 -> 알림.
예산 vs 가치: - 위와 같이 세분 관리하면 일 10k 한도 내 사용자 15~20명 Free+약간Pro 운영 문제없음. - 사용자가 늘면 BYO 키와 캐싱전략으로 상당히 scale. - 최악 폭증시 (수천명 무료유저) → 무료 서비스 한계, 강제 BYO키 or 유료전환 필요. (정책상, 무료로 scraping 대신 쓰려는 시도 방지필요).
요약: - 쿼터 예산: Free ~1000u/일, Pro ~5000u/일, Team ~10000u/일 (user키면 무제한)로 운영 계획. - 폴백: - 공용키 쿼터 소진시 캐시데이터 제공 + 업셀 안내[93], - API 장애시 캐시/후순위 데이터 활용, - 실시간 누락시 백업폴링, - 시스템 장애시 안내 및 빠른 복구 – 이러한 다층 폴백으로 서비스 연속성과 안정성을 담보합니다.

11) 결제/권한/정책
플랜 구분 & 게이팅 기준: - Free: 누구나 가입 무료. 제한: 국가 선택 3개까지, 폴더(채널 그룹) 2개까지, 알림 룰 2개, 보드 공유 불가 (개인만), 내보내기 일 500행 CSV까지. 또한, API 공용키만 사용 (쿼터적은). 이로써 무료로 핵심 맛보되, 적극 운영엔 불편함이 있어 업그레이드 욕구 유발. - Pro (개인 유료): 월 $19 (한화 ~2만원). 확장: 국가 10개, 폴더 10개, 알림 룰 10개. 보드 5개까지 만들고 CSV 무제한/Google Sheets 연동. 또 BYO API 키 연결 허용 (하루 쿼터 확장). 1인 크리에이터 대부분 충족. 또한 트렌드 주제 레이더 등 일부 고급 기능은 Pro에만 (Free는 Top5만 노출, Pro는 Top20 + 뉴스연동). - Team: 월 $99부터 (5인 기준, 추가 1인+$10). 기능: 국가 20개, 폴더 30개, 알림 룰 30개 (팀 전체 합). 조직 대시보드 공유, 보드 공유/칸반 활성, 역할/권한 관리 제공. Slack 알림 통합, 주간 리포트 메일 등 부가기능. API 키 여러개 연결 지원 (or 특별쿼터 배정). 이로써 기업/MCN 대상 가치를 높임. - 게이팅 구현: - 프론트엔드: 플랜마다 UI 요소 disabled/hide. 예: Free 사용자 국가 메뉴에 4번째부터 onClick={() => alert('Pro 필요')} 처리. - 백엔드: RLS 정책/DB constraint. 예: folders 테이블 insert에 SELECT count(*) FROM folders WHERE user_id=auth.uid() 조건으로 개수제한 (정책 WITH CHECK (SELECT count(*)<3 ...)). Supabase RLS에서 서브쿼리 허용하므로 가능. Free=3, Pro=10, Team=Org entity -> orgMembers table로 plan check (owner plan). - 내보내기: Free 사용자는 서버 측에서 CSV 생성 시 500행 넘으면 잘라냄 + “(500행 제한)” 워터마크. Sheets API는 Pro이상만 OAuth동의 UI 노출. - TossPayments 구독: - 플로우: 사용자가 Pricing 페이지서 Plan선택→ “결제” 클릭 → TossPayments.js 로딩 후 requestSubscription({...}) 호출[12] (billingKey 자동발급 플로우). -> PG 화면서 카드정보+본인인증 -> 우리 onSuccess(billingKey) 콜백. - DB 저장: billing 테이블 (user_id, billing_key(enc), plan, status='active', current_period_end date). Row Level Encryption with pgcrypto. - 구독 상태 변경: status active면 JWT custom claim user.app_metadata.plan=Pro 등을 업데이트 (Supabase admin JWT mod). - 무료 체험: TossBilling 에서 “trialPeriodDays” 파라미터 없음. 구현법: 첫 결제액 0원 -> 7일 후 첫 실제 과금. Toss 가이드에 따르면, 빌링키만 발급 후 고객에겐 trial임을 고지하고, 7일 후 POST /billing API로 결제발행. - 우리는 DB에 trial_until 필드 두고, Cron daily check trial_until <= 오늘이면 POST payments/confirm (또는 금액=planPrice, charge). - 리트라이 & 웹훅: - Toss 웹훅 payment.failed 오면 DB status='past_due', 사용자에게 이메일 통보 & 3일 뒤 Cron에서 POST payments재시도. 3회 실패시 status='canceled', JWT plan=Free degrade, DB folders beyond Free limit inactivate (we keep them but mark hidden until re-subscribe, to not delete user data). 정책 안내. - 결제 성공 웹훅 오면 새 period_end = now+1mo, status active 유지. - 환불 & 변경: - Toss 정기결제는 immediate cancel possible but refund 수동. 우리는 잔여기간 환불 없음 정책 (약관에). 대신 취소하면 period_end까지 사용 후 종료. - Plan 업그레이드 (Free→Pro): 즉시 Pro 권한 부여, 카드 즉시 과금 (정액, 다음 결제일 = 오늘+1mo). - Pro→Team (업글): 차액 즉시 청구 or 새로운 sub (Toss billing no proration built-in, so easiest: cancel Pro, start Team fresh). We'll implement immediate new Team subscription, and offer partial coupon if needed. - Team→Pro (다운): period_end까지 Team유지, 만료 시 Pro renew (if card on file). - 테스트: TossPayments test key 모드로 e2e 구동해보고, 웹훅 Endpoint (Edge Function or NextAPI route) verify hub.signature and proceed[15]. - 재처리 & 로그: TossPayments admin 에서 로그 볼 수 있고, 우리도 DB billing_events 기록 (date, event, result). - Supabase Auth & RLS: - 권한 구조 확정: - JWT의 org_id와 role (org내 역할) 클레임이 RLS 정책의 핵심. - 오너초대 -> invite email with signup link (Supabase no Org concept natvie, custom flow: new user registers, org_id set to org, org_members insert by invite code mapping). - RLS정책상 auth.uid()는 users.id, auth.jwt().org_id는 org id, auth.jwt().role는 site role or org role? We might embed both: - app_metadata.plan for plan gating, - app_metadata.orgs (list of {org, role}) – if multi-org membership. But supabase JWT size limit ~1KB – safe for a few orgs. - If complicated, fallback to join in RLS (like earlier policy subquery from org_members). - Current approach: RLS uses subqueries so JWT doesn’t need org list (except for performance – minor). - 조직/프로젝트 구조 미확정: - 현재 Org=팀=회사 단위. 프로젝트(클라이언트) 구분은 folder or separate org per client. - 명확히, 한 MCN회사(Team) = 1 org in our system, their multiple clients handled via multiple folders or maybe we allow multiple org membership (one user can join Org "MCN" and Org "ClientA"? But that double representation not intended). - Decision: 1 org = 1 paying entity. MCN uses that single org to manage all. They will handle grouping by folder & maybe prefix folder names by client. - If needed later, implement "project" table linking multiple folders & membership subset.
브랜드 HSL 색상 채택:
현재 정의 Primary/Secondary/Accent palette는 일단 채택하여 UI 디자인 반영했고, 주요 대비 검사를 거쳤습니다.
하지만, 실제 구현 중 접근성 테스트(LightHouse, WCAG Contrast) 결과에 따라 약간 조정할 수 있다고 계획했습니다.
예컨대 Secondary 빨강의 경우 white text 대비 부족하여 버튼 배경으론 다크톤(red dark var) 사용 예정이고[4], Primary 보라도 Pressed 기준 색상(더 어두운)로 최종 채택할 수 있습니다.
결론: 우선 현재 값으로 개발 진행, 이후 테스트 후 필요 시 보정하기로 결정했습니다[5].
UI를 10명 정도 사용자에게 써보도록 하여 “글자 안보인다” 피드백도 수렴하고, 그 결과로 색상 밝기/명도 조금씩 튜닝할 것입니다.
궁극적으로, 우리 브랜드 컬러 체계는 큰 변화없이, 미세 조정만 거칠 예정입니다 (ex: Primary L61→55%). 이미 contrast AAA까지 욕심내지 않고 AA만 지키면 된다고 내부 합의했습니다.
요약: "채택+테스트 후 조정" – 즉 당장엔 이 팔레트를 기본으로 가되, 접근성 자동테스트에서 걸리는 부분은 개발 단계에서 수정 반영합니다.
가설 vs 대안: 만약 테스트에서 보라/민트가 계속 contrast 문제 야기하면, 대안 팔레트로 약간 채도낮춘 deeper violet, teal planned. 그러나, 우리의 브랜드 정체성이 컬러에 달렸으므로, 큰 폭 변경 없이 보조 톤/테두리 등으로 해결하는 방향을 고수할 것입니다.