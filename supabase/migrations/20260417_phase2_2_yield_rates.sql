-- ==============================================
-- FAID Phase 2.2: Yield Rates Table
-- Stores current financial instrument rates
-- Updated monthly via Edge Function + pg_cron
-- ==============================================

CREATE TABLE IF NOT EXISTS yield_rates (
  id SERIAL PRIMARY KEY,
  institution_name TEXT NOT NULL UNIQUE,     -- e.g. 'CETES 28d', 'Nu Cajita Turbo'
  instrument_type TEXT NOT NULL,             -- 'cetes' | 'sofipo' | 'bond'
  annual_rate NUMERIC NOT NULL,              -- Annual yield rate as percentage (e.g. 10.5)
  gat_nominal NUMERIC,                      -- GAT nominal if available
  term_days INTEGER,                         -- Term in days (28, 91, 182, 364, etc.)
  source_url TEXT,                           -- URL where rate was sourced
  last_fetched_at TIMESTAMPTZ DEFAULT now(), -- When the rate was last updated
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE yield_rates ENABLE ROW LEVEL SECURITY;

-- Everyone can read yield rates (public financial data)
CREATE POLICY "yield_rates_read_all" ON yield_rates
  FOR SELECT USING (true);

-- Only service role can insert/update (via Edge Function)
CREATE POLICY "yield_rates_service_write" ON yield_rates
  FOR ALL USING (auth.role() = 'service_role');

-- Seed with current known rates (April 2026)
INSERT INTO yield_rates (institution_name, instrument_type, annual_rate, gat_nominal, term_days, source_url)
VALUES
  ('CETES 28 días',  'cetes',  9.50,  NULL,   28,  'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF60633/datos/oportuno'),
  ('CETES 91 días',  'cetes',  9.75,  NULL,   91,  'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF60634/datos/oportuno'),
  ('CETES 182 días', 'cetes',  10.00, NULL,   182, 'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF60635/datos/oportuno'),
  ('CETES 364 días', 'cetes',  10.25, NULL,   364, 'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF60636/datos/oportuno'),
  ('Nu Cajita Turbo', 'sofipo', 13.00, 13.88, NULL, 'https://nu.com.mx/cuenta/'),
  ('Nu Cajita 24/7',  'sofipo', 6.75,  6.98,  NULL, 'https://nu.com.mx/cuenta/'),
  ('Nu Ahorro Congelado', 'sofipo', 7.05, 7.30, 180, 'https://nu.com.mx/cuenta/')
ON CONFLICT (institution_name) DO UPDATE SET
  annual_rate = EXCLUDED.annual_rate,
  gat_nominal = EXCLUDED.gat_nominal,
  term_days = EXCLUDED.term_days,
  source_url = EXCLUDED.source_url,
  last_fetched_at = now();
