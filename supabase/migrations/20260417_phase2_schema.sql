-- ==============================================
-- FAID Phase 2: Complete Database Schema
-- Supabase / PostgreSQL Migration
-- ==============================================

-- =====================
-- 1. PROFILES
-- =====================
-- Extends Supabase Auth with financial context.
-- One row per user, created on first Strategy form submission.
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  income NUMERIC DEFAULT 0,
  fixed_expenses NUMERIC DEFAULT 0,
  total_debts NUMERIC DEFAULT 0,
  monthly_contribution NUMERIC DEFAULT 0,
  emergency_fund_progress NUMERIC DEFAULT 0 CHECK (emergency_fund_progress BETWEEN 0 AND 1),
  preferred_currency TEXT DEFAULT 'MXN' CHECK (preferred_currency IN ('MXN', 'USD', 'EUR')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at on any change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- 2. EXPENSES
-- =====================
-- Already exists from Phase 1. This is an idempotent re-creation.
-- User-tracked spending entries, categorized by Gemini or manually.
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL DEFAULT 'Misc',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id, created_at DESC);

-- =====================
-- 3. RECURRING CHARGES
-- =====================
-- Subscriptions, services, and fixed annual expenses.
-- Feeds the Calendar view and annual projections.
CREATE TABLE IF NOT EXISTS recurring_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  billing_day INTEGER NOT NULL CHECK (billing_day BETWEEN 1 AND 31),
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'bimonthly', 'yearly')),
  type TEXT NOT NULL CHECK (type IN ('subscription', 'service', 'expense')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recurring_charges_user ON recurring_charges(user_id);

-- =====================
-- 4. STRATEGIES
-- =====================
-- AI-generated 3-phase financial plans.
-- Each generation creates a new row (history preserved).
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  debt_priority JSONB NOT NULL DEFAULT '[]',
  emergency_target_mxn NUMERIC DEFAULT 0,
  inflation_protection_strategy TEXT,
  allocation JSONB NOT NULL DEFAULT '{}',
  input_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_strategies_user ON strategies(user_id, created_at DESC);

-- =====================
-- 5. CHAT MESSAGES
-- =====================
-- Persistent conversation history for the floating AI advisor.
-- Stores the route context and optional hidden prompt (for preset suggestions).
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  hidden_prompt TEXT,
  route TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id, created_at DESC);

-- =====================
-- 6. SIMULATIONS
-- =====================
-- Credit simulation results history.
CREATE TABLE IF NOT EXISTS simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL,
  interest_rate NUMERIC NOT NULL CHECK (interest_rate >= 0),
  term_months INTEGER NOT NULL CHECK (term_months > 0),
  monthly_payment NUMERIC NOT NULL,
  total_interest NUMERIC NOT NULL,
  total_payment NUMERIC NOT NULL,
  is_dangerous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_simulations_user ON simulations(user_id, created_at DESC);


-- ==============================================
-- ROW LEVEL SECURITY
-- ==============================================
-- Users can only access their own data.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

-- Profiles: id = auth.uid()
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Expenses: user_id = auth.uid()
CREATE POLICY "Users manage own expenses"
  ON expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Recurring Charges: user_id = auth.uid()
CREATE POLICY "Users manage own recurring charges"
  ON recurring_charges FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Strategies: user_id = auth.uid()
CREATE POLICY "Users manage own strategies"
  ON strategies FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Chat Messages: user_id = auth.uid()
CREATE POLICY "Users manage own chat messages"
  ON chat_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Simulations: user_id = auth.uid()
CREATE POLICY "Users manage own simulations"
  ON simulations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
