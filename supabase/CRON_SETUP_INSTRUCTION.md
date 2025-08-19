# YouTube Lens Delta System - Supabase 크론 스케줄 설정 가이드

## ⚡ 즉시 실행 필요!

### 1. Supabase Dashboard 접속
https://app.supabase.com/project/golbwnsytwbyoneucunx

### 2. SQL Editor 이동
좌측 메뉴 → SQL Editor

### 3. 아래 SQL 실행

```sql
-- 기존 스케줄 제거 (있는 경우)
SELECT cron.unschedule('yl-daily-batch') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'yl-daily-batch'
);

-- 일일 배치 작업 스케줄 설정
-- UTC 20:00 = KST 05:00 (한국 시간 새벽 5시)
SELECT cron.schedule(
  'yl-daily-batch',
  '0 20 * * *',
  $$
  SELECT net.http_post(
    url := 'https://golbwnsytwbyoneucunx.supabase.co/functions/v1/yl-daily-batch',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret 
        FROM vault.decrypted_secrets 
        WHERE name = 'service_role_key'
      ),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'mode', 'daily',
      'timestamp', now()::text
    )
  ) AS request_id;
  $$
);

-- 스케줄 확인
SELECT 
  jobname,
  schedule,
  active,
  jobid
FROM cron.job 
WHERE jobname = 'yl-daily-batch';
```

### 4. 확인 메시지
성공 시 아래와 같은 결과가 표시됩니다:
```
jobname         | schedule      | active | jobid
----------------|---------------|--------|-------
yl-daily-batch  | 0 20 * * *    | t      | 1
```

## 📅 스케줄 옵션

### 기본 설정 (일일 1회)
- **시간**: 매일 새벽 5시 (KST)
- **크론 표현식**: `0 20 * * *` (UTC)

### 대안 설정 (6시간마다)
```sql
-- 6시간마다 실행하려면
SELECT cron.schedule(
  'yl-6hour-batch',
  '0 */6 * * *',
  $$
  -- 동일한 내용
  $$
);
```

## 🔍 실행 로그 확인

```sql
-- 최근 실행 로그 확인
SELECT 
  jobname,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobname LIKE 'yl-%'
ORDER BY start_time DESC
LIMIT 10;
```

## ⚠️ 주의사항

1. **Service Role Key**: Vault에서 자동으로 가져오므로 직접 입력하지 마세요
2. **시간대**: UTC 기준이므로 한국 시간과 9시간 차이
3. **중복 실행**: 동일한 이름의 스케줄이 있으면 먼저 제거 필요

## 🧪 수동 테스트

Edge Function을 수동으로 테스트하려면:

```bash
curl -X POST https://golbwnsytwbyoneucunx.supabase.co/functions/v1/yl-daily-batch \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"mode": "test"}'
```

## 📞 문제 발생 시

1. Supabase Dashboard → Functions → Logs 확인
2. pg_cron extension 활성화 확인
3. Edge Function 배포 상태 확인