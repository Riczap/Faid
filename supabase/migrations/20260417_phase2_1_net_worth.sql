-- ==============================================
-- FAID Phase 2.1: Add net_worth column to profiles
-- ==============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS net_worth NUMERIC DEFAULT 0;
