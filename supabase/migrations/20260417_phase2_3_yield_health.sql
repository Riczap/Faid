-- ==============================================
-- FAID Phase 2.3: Yield Rates - Institutional Health
-- Adds trust scoring, protection classification,
-- tiered APY, requirements, and promotional flags.
-- ==============================================

-- 1. New columns for regulatory health
ALTER TABLE yield_rates ADD COLUMN IF NOT EXISTS trust_score TEXT;
ALTER TABLE yield_rates ADD COLUMN IF NOT EXISTS protection_type TEXT;

-- 2. Tiered APY: base (no requirements) vs max (with requirements met)
ALTER TABLE yield_rates ADD COLUMN IF NOT EXISTS base_apy NUMERIC;
ALTER TABLE yield_rates ADD COLUMN IF NOT EXISTS max_apy NUMERIC;

-- 3. Requirements and promotional status
ALTER TABLE yield_rates ADD COLUMN IF NOT EXISTS requirements_description TEXT;
ALTER TABLE yield_rates ADD COLUMN IF NOT EXISTS is_promotional BOOLEAN DEFAULT false;

-- 4. Backfill existing rows with institutional data
UPDATE yield_rates SET
  trust_score = 'Gobierno Federal',
  protection_type = 'IPAB',
  base_apy = annual_rate,
  max_apy = annual_rate,
  requirements_description = NULL,
  is_promotional = false
WHERE instrument_type = 'cetes';

UPDATE yield_rates SET
  trust_score = 'NICAP Cat 1',
  protection_type = 'ProSofipo',
  base_apy = 6.75,
  max_apy = annual_rate,
  requirements_description = 'Realizar al menos 1 compra mensual con tarjeta Nu de cualquier monto',
  is_promotional = true
WHERE institution_name = 'Nu Cajita Turbo';

UPDATE yield_rates SET
  trust_score = 'NICAP Cat 1',
  protection_type = 'ProSofipo',
  base_apy = annual_rate,
  max_apy = annual_rate,
  requirements_description = NULL,
  is_promotional = false
WHERE institution_name = 'Nu Cajita 24/7';

UPDATE yield_rates SET
  trust_score = 'NICAP Cat 1',
  protection_type = 'ProSofipo',
  base_apy = annual_rate,
  max_apy = annual_rate,
  requirements_description = 'Plazo fijo de 180 dias. Dinero no disponible hasta vencimiento.',
  is_promotional = false
WHERE institution_name = 'Nu Ahorro Congelado';

-- 5. Insert additional institutions for a richer Yield Radar
INSERT INTO yield_rates (
  institution_name, instrument_type, annual_rate, gat_nominal, term_days,
  trust_score, protection_type, base_apy, max_apy,
  requirements_description, is_promotional, source_url
) VALUES
  ('Supertasas Pagare', 'sofipo', 14.50, 15.59, 360,
   'NICAP Cat 1', 'ProSofipo', 14.50, 14.50,
   'Plazo fijo de 360 dias. Inversion minima de $1,000 MXN.', false,
   'https://www.supertasas.com'),
  ('Kubo Financiero', 'sofipo', 12.00, 12.68, 365,
   'NICAP Cat 2', 'ProSofipo', 10.50, 12.00,
   'Tasa preferencial con deposito recurrente mensual de $5,000 MXN.', true,
   'https://www.kubofinanciero.com'),
  ('Hey Banco Inversion', 'bank', 11.00, 11.57, 28,
   'ICAP 14.5%', 'IPAB', 7.00, 11.00,
   'Gasto mensual minimo de $6,000 MXN con tarjeta Hey o nomina domiciliada.', true,
   'https://www.heybanco.com'),
  ('Mercado Pago', 'fintech', 11.70, NULL, NULL,
   'N/A', 'N/A', 11.70, 11.70,
   'Depositado a traves de GBM. Varía ligeramente a diario.', false,
   'https://www.mercadopago.com.mx'),
  ('Plata Card Cuenta', 'bank', 12.00, 12.68, NULL,
   'ICAP 13.2%', 'IPAB', 7.00, 12.00,
   'Para obtener el 12% se requiere contar con la membresia Plata Plus ($99 MXN/mes). Tasa base del 7%.', true,
   'https://platacard.mx'),
  ('DiDi Cuenta', 'sofipo', 15.00, 16.18, NULL,
   'NICAP Cat 1', 'ProSofipo', 7.50, 15.00,
   'Tasa del 15% aplicable unicamente a los primeros $10,000 MXN de saldo. El excedente rinde 7.5%.', true,
   'https://didiglobal.com'),
  ('Openbank Open+', 'bank', 13.00, 13.80, NULL,
   'ICAP 15.0%', 'IPAB', 7.30, 13.00,
   'Rendimiento del 13% aplicable para saldos hasta $40,000 MXN. De $40k a $1M rinde 7.3%.', true,
   'https://openbank.mx'),
  ('Uala Cuenta', 'bank', 15.00, 16.18, NULL,
   'ICAP 14.1%', 'IPAB', 6.75, 15.00,
   '15% para clientes con gasto mensual mayor a $6,000 o portabilidad de nomina. 12% con gasto de $3k. Base 6.75%.', true,
   'https://uala.mx'),
  ('Klar Ahorro', 'sofipo', 15.00, 16.18, 30,
   'NICAP Cat 1', 'ProSofipo', 10.00, 15.00,
   'Tasa maxima Inversion Plus/Platino en plazo fijo. Tasa a la vista es menor dependiendo del segmento.', true,
   'https://klar.mx'),
  ('Stori Cuenta+', 'sofipo', 15.00, 16.18, NULL,
   'NICAP Cat 1', 'ProSofipo', 15.00, 15.00,
   'Liquidez 24/7 sin condiciones complejas al momento.', false,
   'https://storicard.com'),
  ('Finsus Inversion', 'sofipo', 9.09, 9.50, 360,
   'NICAP Cat 2', 'ProSofipo', 9.09, 15.01,
   'Tasas desde 9.09% (360) hasta 15.01% (plazos largos hasta 5 años). Seguro ProSofipo hasta 25k UDIs.', false,
   'https://finsus.mx')
ON CONFLICT (institution_name) DO UPDATE SET
  annual_rate = EXCLUDED.annual_rate,
  gat_nominal = EXCLUDED.gat_nominal,
  term_days = EXCLUDED.term_days,
  trust_score = EXCLUDED.trust_score,
  protection_type = EXCLUDED.protection_type,
  base_apy = EXCLUDED.base_apy,
  max_apy = EXCLUDED.max_apy,
  requirements_description = EXCLUDED.requirements_description,
  is_promotional = EXCLUDED.is_promotional,
  source_url = EXCLUDED.source_url,
  last_fetched_at = now();
