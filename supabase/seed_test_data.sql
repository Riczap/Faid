-- ==========================================
-- SCRIPT DE DATOS DE PRUEBA Y CORRECCIONES
-- UUID del Usuario: 7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f
-- ==========================================

-- 1. CORRECCIONES DE SCHEMA FALTANTES (De la revisión anterior)
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE recurring_charges ADD COLUMN IF NOT EXISTS auto_pay BOOLEAN DEFAULT false;

-- 2. INSERTAR PERFIL
-- Nota: Si el usuario no existe en auth.users, la llave foránea podría fallar. 
-- En Supabase, normalmente el usuario ya debe haberse autenticado y existir en auth.users.
INSERT INTO profiles (id, income, fixed_expenses, total_debts, monthly_contribution, emergency_fund_progress, preferred_currency, ai_context_summary, ai_context_updated_at)
VALUES (
  '7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f',
  35000.00,
  14500.00,
  22000.00,
  3500.00,
  0.45,
  'MXN',
  'El usuario tiene ingresos mensuales de $35,000 MXN y gastos fijos de $14,500 MXN. Presenta una deuda total de $22,000 MXN. Su progreso en el fondo de emergencia es del 45%. Ha asignado $3,500 MXN mensuales para aportaciones a su plan financiero.',
  now()
) ON CONFLICT (id) DO UPDATE SET 
  income = EXCLUDED.income,
  fixed_expenses = EXCLUDED.fixed_expenses,
  total_debts = EXCLUDED.total_debts,
  monthly_contribution = EXCLUDED.monthly_contribution,
  emergency_fund_progress = EXCLUDED.emergency_fund_progress,
  ai_context_summary = EXCLUDED.ai_context_summary,
  ai_context_updated_at = EXCLUDED.ai_context_updated_at;

-- 3. INSERTAR GASTOS RECIENTES
INSERT INTO expenses (user_id, concept, amount, category, created_at, source)
VALUES 
  ('7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f', 'Supermercado Walmart', 2450.50, 'Food', now() - interval '2 days', 'manual'),
  ('7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f', 'Gasolina', 950.00, 'Transport', now() - interval '3 days', 'manual'),
  ('7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f', 'Cena Vips', 680.00, 'Food', now() - interval '5 days', 'manual'),
  ('7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f', 'Uber', 150.00, 'Transport', now() - interval '6 days', 'manual'),
  ('7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f', 'Farmacia San Pablo', 420.00, 'Health', now() - interval '7 days', 'manual'),
  ('7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f', 'Renta Departamento', 12000.00, 'Housing', now() - interval '10 days', 'auto'),
  ('7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f', 'Boletos Cine', 350.00, 'Entertainment', now() - interval '12 days', 'manual');

-- 4. INSERTAR CARGOS RECURRENTES (Calendario)
INSERT INTO recurring_charges (user_id, name, amount, billing_day, frequency, type, auto_pay)
VALUES 
  ('7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f', 'Spotify Premium', 129.00, 15, 'monthly', 'subscription', true),
  ('7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f', 'CFE (Luz)', 450.00, 5, 'bimonthly', 'service', false),
  ('7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f', 'Internet Telmex', 599.00, 12, 'monthly', 'service', true),
  ('7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f', 'Seguro de Auto', 6500.00, 20, 'yearly', 'expense', false);

-- 5. INSERTAR ESTRATEGIA FINANCIERA (Activa)
INSERT INTO strategies (user_id, debt_priority, emergency_target_mxn, inflation_protection_strategy, allocation, input_snapshot)
VALUES (
  '7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f',
  '["Tarjeta de Crédito BBVA", "Préstamo Personal"]'::jsonb,
  50000.00,
  'Mantener el 50% en CETES a 28 días para liquidez y 20% en UDIBONOS a 3 años para protección contra inflación.',
  '{"cetes": 50, "udibonos": 20, "liquidity": 30}'::jsonb,
  '{"income": 35000, "total_debts": 22000, "fixed_expenses": 14500}'::jsonb
);

-- 6. INSERTAR SIMULACIONES (Historial)
INSERT INTO simulations (user_id, amount, category, interest_rate, term_months, monthly_payment, total_interest, total_payment, is_dangerous)
VALUES (
  '7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f',
  80000.00,
  'auto',
  14.5,
  36,
  2753.40,
  19122.40,
  99122.40,
  false
),
(
  '7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f',
  250000.00,
  'personal',
  28.0,
  48,
  8864.50,
  175496.00,
  425496.00,
  true
);

-- 7. INSERTAR HISTORIAL DE CHAT
INSERT INTO chat_messages (user_id, role, content, route, created_at)
VALUES 
  ('7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f', 'user', 'Tengo una deuda de $22,000 MXN en tarjetas y no sé por dónde empezar, ¿qué me recomiendas?', '/', now() - interval '1 hour'),
  ('7e6c3eca-bd97-4b7c-8d0f-62f1cc61350f', 'assistant', 'Dado que tus ingresos son de $35,000 MXN y tienes $14,500 MXN en gastos fijos, te sugiero aplicar el "Método Avalancha". Paga el mínimo en todas tus deudas excepto en la que tenga la tasa de interés más alta (como la de BBVA que mencionaste en tu plan). Utiliza tus $3,500 MXN de aportación mensual directamente al saldo de esa tarjeta.', '/', now() - interval '59 minutes');
