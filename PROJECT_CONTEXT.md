# FAID — Financial AI Advisor · Project Context

> **Purpose of this document:** Give any incoming AI agent or developer a complete conceptual understanding of the project in under 5 minutes. For strict implementation rules, defer to `AI_ARCHITECTURE_GUIDE.md`.

---

## 🎯 What is Faid?

**Faid** (Financial AI Advisor) is a personal finance management web application built for the **Mexican market**. It combines manual expense tracking with AI-powered analysis to help users take control of their money through three pillars:

1. **Understand** — Where is my money going?
2. **Plan** — How do I get out of debt and start investing?
3. **Simulate** — Can I afford this new credit?

The entire UI is **in Spanish** and all monetary values default to **MXN (Mexican Peso)**, with optional conversion to USD and EUR for display purposes.

---

## 🧩 Core Feature Modules

| Module | Route | What it does |
|---|---|---|
| **Dashboard** | `/` | High-level financial overview (home page) |
| **Plan Financiero** | `/strategy` | User inputs their financial profile → AI generates a 3-phase action plan (debt priority, emergency fund, investment allocation) |
| **Seguimiento de Gastos** | `/spending` | Expense tracking with manual input, PDF upload, category pie charts, and a sortable table |
| **Simulador de Deuda** | `/simulator` | Credit calculator — user inputs loan terms → sees monthly payment, total interest, and impact on their financial goals |
| **Calendario de Cargos** | `/calendar` | Subscription & recurring service tracker with FullCalendar, annual projections, and billing-day awareness |
| **AI Test Sandbox** | `/test` | Internal dev tool for testing Gemini AI categorization and strategy generation with real API calls |

### Shared Components

- **FloatingAdvisorChat** — A persistent AI chat popup (bottom-right FAB) available on all pages. Shows route-aware preset suggestions. Mounted at the layout level, never inside individual pages.
- **CurrencySelector** — Header dropdown to switch the display currency (MXN/USD/EUR). All pages react instantly.

---

## 🏛️ Architecture Overview

```
src/
├── App.tsx                    # Route definitions
├── main.tsx                   # Entry point + runtime branding injection
├── config/
│   ├── branding.ts            # Single source of truth for logos, titles, favicon
│   ├── constants.js           # Expense category definitions
│   └── supabase.js            # Supabase client initialization
├── context/
│   ├── AuthContext.jsx         # Supabase Auth wrapper (user session, login/logout)
│   ├── FinancialContext.jsx    # Global state: expenses, currency, formatCurrency()
│   └── ProtectedRoute.jsx     # Route guard (redirects to /signin if unauthenticated)
├── services/
│   ├── ai.service.js           # Google Gemini SDK (categorizeExpense, generateFinancialStrategy)
│   └── db.service.js           # Supabase CRUD (insertExpense, fetchExpenses)
├── features/                   # All custom pages and components
│   ├── analysis/               # Strategy dashboard, stepper, financial inputs form
│   ├── spending/               # Expense table, pie chart, input form, PDF upload
│   ├── simulators/             # Credit calculator
│   ├── calendar/               # Subscription calendar
│   ├── common/                 # FloatingAdvisorChat, CurrencySelector, (legacy) FinancialAdvisorQA
│   ├── auth/                   # Auth-related feature components
│   └── test/                   # AI integration test view
└── template/                   # READ-ONLY premium Tailwind dashboard template
    ├── components/             # Pre-styled UI components (charts, forms, buttons, badges, modals)
    ├── context/                # ThemeContext (light/dark), SidebarContext
    ├── layout/                 # AppLayout, AppSidebar, AppHeader
    ├── hooks/                  # useModal, etc.
    ├── icons/                  # SVG icon library
    └── pages/                  # Template pages (Auth, Dashboard shell, 404)
```

### Key Separation of Concerns

- **`src/template/`** is a **read-only** premium UI library. Never write new components here — only import from it.
- **`src/features/`** is the **active workspace**. All custom financial logic lives here.
- **`src/context/`** provides global state (auth, currency, expenses).
- **`src/services/`** wraps external APIs (Supabase for data, Gemini for AI).

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Charts | ApexCharts (via react-apexcharts) |
| Calendar | FullCalendar 6 |
| Auth + DB | Supabase (Auth + PostgreSQL) |
| AI | Google Gemini (`@google/genai` SDK) |
| State Mgmt | React Context API (no Redux) |

---

## 🔐 Auth Flow

1. User lands on any route → `ProtectedRoute` checks for a Supabase session.
2. If unauthenticated → redirected to `/signin`.
3. On successful login → `AuthContext` stores the user object and the app renders `AppLayout`.
4. `FinancialContext` wraps the authenticated app to provide expenses and currency state.

---

## 💱 Currency System

All data is stored in **MXN**. The `FinancialContext` provides:

- `currency` — current display currency code (`"MXN"`, `"USD"`, `"EUR"`)
- `formatCurrency(amount, options?)` — converts and formats amounts for display
- `setCurrency(code)` — updates the global currency

This is display-only conversion. No backend currency conversion happens.

---

## 🤖 AI Integration (Gemini)

Four AI functions exist in `ai.service.js`:

1. **`categorizeExpense(concept)`** — Takes a text description (e.g. "Starbucks Latte") and returns a category (e.g. "Food").
2. **`generateFinancialStrategy(userData)`** — Takes the user's expense data and returns a structured JSON strategy with debt priorities, emergency fund targets, and investment allocations tuned for the Mexican market.
3. **`buildUserContext(userId)`** — Fetches all user data from the database (profile, expenses, recurring charges, latest strategy) and assembles it into a structured system prompt for Gemini.
4. **`chatWithAdvisor(userId, message, route, hiddenPrompt?)`** — The full floating chat flow: builds context → retrieves chat history → calls Gemini → persists both messages to the database.

### Phase 1 vs Phase 2

- **Phase 1 (current):** All pages use hardcoded mock data. No API calls. `setTimeout` simulates network latency.
- **Phase 2 (on approval):** Mock data is replaced with real Supabase queries and Gemini calls. The user must explicitly authorize this transition.

---

## 🗃️ Database Schema (Supabase / PostgreSQL)

Migration file: `supabase/migrations/20260417_phase2_schema.sql`

| Table | Columns (key) | Purpose |
|---|---|---|
| `profiles` | income, fixed_expenses, total_debts, monthly_contribution, emergency_fund_progress | User's financial profile (1:1 with auth.users) |
| `expenses` | concept, amount, category, created_at | Individual spending entries |
| `recurring_charges` | name, amount, billing_day, frequency, type, is_active | Subscriptions, services, annual charges |
| `strategies` | debt_priority (jsonb), emergency_target_mxn, allocation (jsonb), input_snapshot (jsonb) | AI-generated financial plans (history) |
| `chat_messages` | role, content, hidden_prompt, route | Persistent advisor chat with route context |
| `simulations` | amount, category, interest_rate, term_months, monthly_payment, total_interest, is_dangerous | Credit simulation history |

All tables enforce **Row Level Security** — users can only read/write their own rows.

---

## 🎨 Branding

Centralized in `src/config/branding.ts`:

| Key | Usage |
|---|---|
| `logoText` | Expanded sidebar, headers (dark mode) |
| `logoTextLight` | Same locations (light mode) |
| `logoSmall` | Collapsed sidebar icon |
| `favicon` | Browser tab icon |
| `pageTitle` | Browser tab title |

Theme-aware logo switching uses `useTheme()` from `ThemeContext`.

---

## 🌐 Localization

- **All user-facing text is in Spanish.** No exceptions.
- Code variables, JSON keys, and database columns remain in English for backend compatibility.
- Example: A button says "Calcular Impacto" but the state variable is `calculateImpact`.

---

## 📁 Key Config Files

| File | Purpose |
|---|---|
| `AI_ARCHITECTURE_GUIDE.md` | Strict rules for AI agents (MUST READ before any task) |
| `PROJECT_CONTEXT.md` | This file — conceptual overview |
| `PROMPT_VIEW1_STRATEGY.md` | Detailed prompt/spec for the Strategy Dashboard page |
| `src/config/branding.ts` | Logo paths, page title, favicon |
| `src/config/constants.js` | Expense category definitions |
| `src/config/supabase.js` | Supabase client init |

---

## 🚀 Running the Project

```bash
npm install
npm run dev      # Starts Vite dev server (default: http://localhost:5173)
npm run build    # TypeScript check + production build
```

No environment variables are needed for Phase 1 (mock data). For Phase 2, Supabase and Gemini API keys are required via `.env`.
