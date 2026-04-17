# FINANCIAL AI ADVISOR: BACKEND ARCHITECTURE & ENDPOINTS

This document outlines the target database and API architecture that the frontend UI mock data is meticulously designed to map against during Phase 2 integrations.

## 1. Database Schema (Supabase PostgreSQL)

### Table: `expenses` (Already Live)
Tracks dynamic user expenditures. Serves the **Expense Tracker (View 2)**.
- `id` (uuid, primary key)
- `user_id` (uuid, fk to auth.users)
- `concept` (text)
- `amount` (numeric)
- `category` (text)
- `created_at` (timestamptz)

### Table: `subscriptions` (Future Target)
Tracks recurring charges and essential services for the **Subscription Calendar (View 4)**. Including streaming, memberships, water, electricity, internet, etc.
- `id` (uuid, primary key)
- `user_id` (uuid, fk to auth.users)
- `name` (text)
- `amount` (numeric)
- `billing_day` (integer 1-31)
- `frequency` (text: 'monthly' | 'yearly' | 'bimonthly')
- `type` (text: 'subscription' | 'service')

## 2. API Endpoints (Services)

### A. Gemini Subroutines (`src/services/ai.service.js`)
Located in the frontend via direct serverless `@google/genai` logic.

**`categorizeExpense(concept: string)`**
- *Input:* User typed concepts (e.g. "Starbucks Latte")
- *Output:* Strict String matching standard categories (`'Food'`, `'Transport'`, `'Housing'`, `'Misc'`, etc.).

**`generateFinancialStrategy(userData: object)`**
- *Target Component:* **Strategy Dashboard (View 1)**
- *Input:* A combined JSON package of user profile data and their aggregated `expenses` table history.
- *Output:* Structured JSON containing `debt_priority` arrays, `emergency_target_mxn` numeric calculations, and Mexican-market specific `allocation` logic mirroring the mock data block.

### B. Data Binding (`src/services/db.service.js`)
Handles all Supabase remote network interactions via the client library. 
- **`insertExpense(userId, concept, amount, category)`** -> Target implementation for saving rows.
- **`getExpensesByUser(userId)`** -> Core engine populating the `FinancialContext` which acts as the generic middle-man for all visual graphs.
