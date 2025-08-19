-- YouTube Lens Delta System - Cron Schedule Setup
-- 실행 방법: Supabase Dashboard SQL Editor에서 직접 실행
-- 주의: PROJECT_ID와 SERVICE_ROLE_KEY를 실제 값으로 교체 필요

-- 기존 스케줄이 있다면 제거
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
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json',
      'x-cron-signature', 'yl-daily-batch-2025'
    ),
    body := jsonb_build_object(
      'mode', 'daily',
      'timestamp', now()::text
    )
  ) AS request_id;
  $$
);

-- 6시간마다 실행 옵션 (필요시 활성화)
-- SELECT cron.schedule(
--   'yl-6hour-batch',
--   '0 */6 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://golbwnsytwbyoneucunx.supabase.co/functions/v1/yl-daily-batch',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
--       'Content-Type', 'application/json',
--       'x-cron-signature', 'yl-6hour-batch-2025'
--     ),
--     body := jsonb_build_object(
--       'mode', '6hour',
--       'timestamp', now()::text
--     )
--   ) AS request_id;
--   $$
-- );

-- 스케줄 확인 쿼리
SELECT 
  jobname,
  schedule,
  active,
  jobid
FROM cron.job 
WHERE jobname LIKE 'yl-%';

-- 실행 로그 확인 쿼리
-- SELECT 
--   jobname,
--   status,
--   return_message,
--   start_time,
--   end_time
-- FROM cron.job_run_details
-- WHERE jobname LIKE 'yl-%'
-- ORDER BY start_time DESC
-- LIMIT 10;