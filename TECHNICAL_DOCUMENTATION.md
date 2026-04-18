# Faid: Technical Documentation

## 1. Executive Summary & Product Scope

**Faid** is an AI-driven financial advisor purposely built for the Mexican market. Its primary mission is to democratize personalized financial planning by providing users with tailored strategies that account for local investment vehicles, economic nuances, and specific Mexican regulatory frameworks.

**In Scope (MVP Features):**
*   **Secure Authentication:** User session and credential management via Supabase.
*   **AI-Generated Financial Strategy:** A sequential, step-by-step roadmap prioritizing high-interest debt repayment, emergency fund accumulation, and a structured investment timeline.
*   **Expense Tracking:** Database-driven transaction register featuring AI-powered auto-categorization.
*   **Yield Radar:** Real-time interest rate (APY) comparison platform featuring visual risk indicators and insurance alerts for Mexican institutions.
*   **Debt Simulators:** Interactive calculators visualizing the compounding impact of proposed liabilities on existing financial plans.

**Out of Scope (For MVP Focus):**
*   Live banking API integrations (e.g., Plaid, Belvo).
*   Optical Character Recognition (OCR) for receipt scanning and auto-entry.
*   Direct execution of trades or deposits within the platform.

## 2. System Architecture Overview

Faid implements a serverless architecture emphasizing strict data boundaries and AI orchestration:

**Data Flow Sequence:**
`Client (React)` -> `AI Processing (Gemini)` -> `Persistence (Supabase PostgreSQL)`

**Component Roles:**
*   **Frontend (React/Vite):** Manages application state, handles routing, and renders the user interface utilizing Tailwind CSS and Recharts.
*   **Backend as a Service (Supabase):** Handles authentication, stateless persistence (PostgreSQL), and server-side operations via Row Level Security (RLS) integrations.
*   **AI Engine (Google Gemini API via Gen AI SDK):** Processes unstructured textual inputs, classifies spending, and generates deterministic, localized financial strategies.

## 3. Supabase & Backend Architecture

### Database Schema

The core relational data relies on three primary tables:

*   **`expenses`**
    *   `user_id` (UUID, Foreign Key mapping to `auth.users`)
    *   `concept` (Text)
    *   `amount` (Numeric)
    *   `category` (Text)
*   **`financial_profile`**
    *   `user_id` (UUID, Primary Key mapping to `auth.users`)
    *   `income` (Numeric)
    *   `debts` (JSONB)
    *   `savings` (Numeric)
    *   `comfort_level` (Text)
*   **`yield_rates`**
    *   `institution_name` (Text)
    *   `apy` (Numeric)
    *   `trust_score` (Numeric)
    *   `protection_type` (Enum: 'ProSofipo', 'IPAB')
    *   `last_updated` (Timestamp)

### Authentication Flow
Authentication is managed via a React `AuthContext` provider interacting directly with Supabase Auth. It handles session states and mints JWTs to secure routing at the component boundary.

### Row Level Security (RLS)
Strict RLS policies restrict table permutations. User financial data is intrinsically siloed.
*   Policy Rule: All `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations on tables such as `expenses` and `financial_profile` strictly require the condition `(auth.uid() = user_id)`.

### Edge Functions
*   **`update-yield-rates` (Cron Function):** An automated Edge Function scheduled to fetch external rates. It requires the `BANXICO_SIE_API_TOKEN` environment variable to query government CETES bounds and update the `yield_rates` repository at recurring intervals.

## 4. AI Service Layer (Gemini Integration)

All invocations occur through the `src/services/ai.service.js` module. The implementation relies on forced-schema prompt engineering.

1.  **`categorizeExpense(concept)`**
    *   **Functionality:** Processes raw string text for an expense.
    *   **Constraint:** The prompt enforces a strict response containing only an exact string matched against a fixed, predefined allowed categories array.

2.  **`generateFinancialStrategy(userData)`**
    *   **Functionality:** Analyzes the aggregate user financial profile.
    *   **Constraint:** Enforces strict outputs formatted as JSON detailing a prioritized strategy plan. The returned structure sequentially dictates:
        1.  High-interest debt elimination.
        2.  Attainment of specific emergency fund targets.
        3.  Mexican market investment allocation parameters incorporating instruments like CETES and corresponding ETFs.

## 5. Frontend & UI/UX

### Wireframe Mapping

Features map to the following screen definitions:

*   **Screen 1: Plan Financiero:** Renders a vertical stepper/timeline parsing the AI JSON strategy into actionable phases (Deuda → Colchón → Inversión).
*   **Screen 2: Registro de Gastos:** Displays a responsive data table accompanied by a Recharts Pie Chart mapping proportioned spending by assigned category.
*   **Screen 3: Calculadoras:** Provides a simulator interface utilizing sliders and numeric inputs to expose the systemic impact a new liability will have on the user's existing financial trajectory.
*   **Screen 4: Yield Radar (Rendimientos):** Utilizes a native Recharts BarChart to contrast APY from banks against SOFIPOs.
    *   **Risk Colors:** Trust score indicators distinguish between varying regulatory capitalization matrices (NICAP for SOFIPOs, ICAP for banks).
    *   **Insurance Badges:** Highlights UDI-equivalent capital protection limits defining risk ceilings: ProSofipo max coverage (~$203k MXN) vs IPAB max coverage (~$3.2M MXN).

### State Management
State configuration hinges on the React Context API via `FinancialContext`. This maintains user profile attributes and cached AI analyses across views, diminishing redundant network queries and excessive prop drilling across modular subcomponents.

## 6. Setup & Deployment (Getting Started)

### Environment Configurations

Configure the `.env.local` prior to executing development commands:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_endpoint_key
SUPABASE_SERVICE_ROLE_KEY=your_backend_service_key # Do NOT expose to client context
```

### CLI Operations

To scaffold the Supabase environment and launch the Vite development server:
```bash
# Push schema permutations to the Supabase instance
npx supabase db push

# Start localized development server
npm run dev
```
