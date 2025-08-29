-- Context7 참조: Supabase 500 Auth 에러 디버깅 쿼리들

-- 1. Auth 로그에서 500 에러 및 오류 찾기
select
  cast(metadata.timestamp as datetime) as timestamp,
  msg,
  event_message,
  status,
  path,
  level
from auth_logs
cross join unnest(metadata) as metadata
where
   -- 500 에러나 error/fatal 레벨 찾기
   status::INT = 500
    OR
  regexp_contains(level, 'error|fatal')
order by timestamp desc
limit 20;

-- 2. Postgres 로그에서 supabase_auth_admin 관련 에러 찾기
select
  cast(postgres_logs.timestamp as datetime) as timestamp,
  event_message,
  parsed.error_severity,
  parsed.user_name,
  parsed.query,
  parsed.detail,
  parsed.hint,
  parsed.sql_state_code,
  parsed.backend_type
from
  postgres_logs
  cross join unnest(metadata) as metadata
  cross join unnest(metadata.parsed) as parsed
where
  regexp_contains(parsed.error_severity, 'ERROR|FATAL|PANIC')
  and regexp_contains(parsed.user_name, 'supabase_auth_admin')
order by timestamp desc
limit 10;

-- 3. Auth 스키마 테이블들의 소유자 확인
select 
  schemaname,
  tablename,
  tableowner
from pg_tables 
where schemaname = 'auth'
order by tablename;

-- 4. Auth 스키마 함수들의 소유자 확인
select 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_userbyid(p.proowner) as owner
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where n.nspname = 'auth'
order by function_name;

-- 5. Users 테이블 관련 외래키 제약조건 찾기 (문제의 주요 원인!)
select 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
from 
  information_schema.table_constraints AS tc 
  join information_schema.key_column_usage AS kcu
    on tc.constraint_name = kcu.constraint_name
  join information_schema.constraint_column_usage AS ccu
    on ccu.constraint_name = tc.constraint_name
where 
  tc.constraint_type = 'FOREIGN KEY' 
  and ccu.table_name = 'users'
  and ccu.table_schema = 'auth'
order by tc.table_name;

-- 6. Auth schema migrations 확인
select version from auth.schema_migrations order by version desc limit 10;