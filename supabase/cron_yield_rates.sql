-- ==============================================
-- FAID: Monthly Yield Rate Cron Job
-- Calls the update-yield-rates Edge Function
-- on the 1st of every month at 00:00 UTC.
--
-- Run this in the Supabase SQL Editor ONCE
-- after deploying the Edge Function.
-- ==============================================

-- 1. Enable required extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Store the service role key in Vault for security
-- 🔑 REPLACE with your actual service_role key
INSERT INTO vault.secrets (name, secret)
VALUES ('edge_function_service_key', 'YOUR_SERVICE_ROLE_KEY_HERE')
ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;

-- 3. Schedule the monthly cron job
SELECT cron.schedule(
  'monthly-update-yield-rates',       -- Job name (unique)
  '0 0 1 * *',                        -- 1st of every month at 00:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://nqmqiufingckwgrigikc.supabase.co/functions/v1/update-yield-rates',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT secret FROM vault.secrets WHERE name = 'edge_function_service_key')
    ),
    body := '{"source": "pg_cron"}'::jsonb
  );
  $$
);

-- ========================
-- MANAGEMENT QUERIES
-- ========================

-- View all scheduled jobs:
-- SELECT * FROM cron.job;

-- View recent job execution history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Unschedule the job:
-- SELECT cron.unschedule('monthly-update-yield-rates');

-- Manually trigger a one-time run right now (for testing):
-- SELECT net.http_post(
--   url := 'https://nqmqiufingckwgrigikc.supabase.co/functions/v1/update-yield-rates',
--   headers := jsonb_build_object(
--     'Content-Type', 'application/json',
--     'Authorization', 'Bearer ' || (SELECT secret FROM vault.secrets WHERE name = 'edge_function_service_key')
--   ),
--   body := '{"source": "manual_trigger"}'::jsonb
-- );
