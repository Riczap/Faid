# COMPREHENSIVE AI AGENT WORKFLOW & ARCHITECTURE GUIDE

> **System Instruction for Incoming AI Agents:**
> You are collaborating with a human developer to build the "Financial AI Advisor" MVP. This project is natively injected into a premium Tailwind CSS Admin Dashboard Template. It also has strict zero-cost mandates API limit restrictions.
> 
> **You MUST read and rigidly adhere to the following workflow for every single task. Treat this as your primary system prompt.**

---

## 🏗️ 1. ARCHITECTURE & FOLDER STRUCTURE
To maintain clean separation of concerns, the repository is strictly divided into two zones:

### A. Template Assets Zone (`src/template/`)
**READ-ONLY LIBRARY.** The premium Tailwind template assets have been sandboxed here. **DO NOT WRITE FROM SCRATCH WHAT ALREADY EXISTS HERE.**
- **Rule:** NEVER generate raw un-styled Tailwind components from scratch. If you need a Bar Chart, Card, Input string, or Badge, you must first `ls` or `view_file` inside `src/template/components/` and import them directly.
- **Charts & Graphs:** Found in `src/template/components/charts/` or `ecommerce/`.
- **Form Elements:** Found in `src/template/components/form/` (e.g. `<Input>`, `<Label>`, `<Checkbox>`).
- **UI Bits:** Found in `src/template/components/ui/` (e.g. buttons, badges, modals).
- **Icons:** Extract solely from `src/template/icons/`.

### B. Custom Logic Zone (`src/`)
**ACTIVE WORKSPACE.** All core business logic and new features for the Hackathon reside here.
- `src/features/` - Only create or modify React components here for the new Financial logic (Strategy, Spending, Simulator).
- `src/services/` - External APIs (Google Gemini AI, Supabase Data fetching).
- `src/context/` - Global Context wrappers (`AuthContext`, `FinancialContext`).

### C. Language Localization Rule 🇲🇽
**ALL UI RENDERED TEXT MUST BE IN SPANISH WITHOUT EXCEPTION.** All pages, components, dashboards, sidebars, and placeholders MUST be strictly in Spanish. There should be NO English text visible to the user at any time anywhere on the screen. Code variables, state hooks, and JSON paths (`id`, `cetes`, `category`) should remain in English to sync natively with the backend logic.

### D. Global Currency System 💱
**ALL MONETARY DISPLAY VALUES MUST USE THE GLOBAL `formatCurrency()` FUNCTION FROM `FinancialContext`.** No component should ever hardcode a `$` symbol or call `.toLocaleString()` directly for monetary amounts.

- **Context:** `src/context/FinancialContext.jsx` exposes `currency`, `setCurrency`, and `formatCurrency` via `useFinancial()`.
- **Config:** Currency conversion rates and symbols are defined in `CURRENCY_CONFIG` inside the context file. Supported currencies: `MXN`, `USD`, `EUR`.
- **Selector:** The `CurrencySelector` component in the header lets the user switch currencies globally.
- **Usage:**
  ```jsx
  const { formatCurrency, currency } = useFinancial();
  // Display: formatCurrency(12000)           → "$12,000"
  // With decimals: formatCurrency(12000, { decimals: 2 })  → "$12,000.00"
  // With code: formatCurrency(12000, { showCode: true })   → "$12,000 MXN"
  // For form labels: `Monto (${currency})`    → "Monto (MXN)"
  ```
- **Rule:** All amounts stored in the database are in MXN (base currency). Conversion is display-only.

### E. Branding Configuration 🎨
**All logo paths, page titles, and brand assets are centralized in `src/config/branding.ts`.** Components must import from `BRAND` instead of hardcoding image paths. Changes to `branding.ts` automatically propagate to the sidebar, headers, auth pages, browser tab, and favicon.

### F. Modular AI Advisor (FloatingAdvisorChat) 🤖
**DO NOT CREATE CUSTOM CHAT WIDGETS OR EMBED CHAT IN INDIVIDUAL PAGES.** The AI financial advisor is a persistent floating popup rendered globally in `AppLayout.tsx` via `src/features/common/FloatingAdvisorChat.jsx`.
- It is always visible as a bottom-right FAB on all authenticated pages.
- It manages its own chat history state and Phase 1 mock delays.
- **Do NOT import or render it inside any feature page.** It is already mounted at the layout level.

---

## 🛑 2. ZERO-COST DEVELOPMENT MANDATE (PHASE 1)
We operate on strict free-tier limits for both Google Gemini and Supabase. During UI scaffolding, API calls will drain limits and incur unacceptable costs. 

**PHASE 1 RESTRICTIONS (ACTIVE BY DEFAULT):**
- **NO API CALLS:** You are strictly forbidden from importing or executing functions from `src/services/ai.service.js` or `src/services/db.service.js`.
- **MOCK DATA ONLY:** You must generate extensive, realistic mock data arrays natively inside the React component. (e.g., hardcode realistic arrays of expenses representing `Housing`, `Food`, `Transport`, etc., or hardcode a static JSON object for the Gemini Financial Strategy result).
- **MOCK STATE:** Simulate delays using `setTimeout` for loading states to replicate network behavior natively.
- **DESIGN APPROVAL GATE:** You must polish the page design using the imported `src/template` widgets and mock data until the human developer says: *"The design is 100% approved. Proceed to API binding."*

---

## 🟢 3. API BINDING (PHASE 2)
**DO NOT ENTER PHASE 2 UNTIL EXPLICITLY AUTHORIZED BY THE USER.**
Once authorized, you will:
1. Delete your hardcoded mock data.
2. Hook into `src/context/FinancialContext.jsx` using `const { expenses, fetchUserExpenses } = useFinancial();`.
3. Map the UI elements directly to the Supabase data streams.
4. Hook into `src/services/ai.service.js` for dynamic calls. Note: `generateFinancialStrategy` accepts the `expenses` array to return structured JSON. Ensure `catLoading` and `stratLoading` state flags gracefully cover the fetch latency in the UI.

### Database Tables (Supabase)
Migration: `supabase/migrations/20260417_phase2_schema.sql`

| Table | Purpose | Page |
|---|---|---|
| `profiles` | User financial context (income, debts, etc.) | Strategy, Dashboard, Simulator |
| `expenses` | Individual spending entries | Spending |
| `recurring_charges` | Subscriptions, services, annual charges | Calendar |
| `strategies` | AI-generated 3-phase financial plans | Strategy |
| `chat_messages` | Persistent advisor chat history with route awareness | Floating Chat (global) |
| `simulations` | Credit simulation result history | Simulator |

All tables enforce **Row Level Security** — users can only access their own data.

### Service Functions (`db.service.js`)
- **Expenses:** `insertExpense`, `getExpensesByUser`, `updateExpense`, `deleteExpense`
- **Profiles:** `getProfile`, `upsertProfile`
- **Recurring Charges:** `getRecurringCharges`, `insertRecurringCharge`, `updateRecurringCharge`, `deleteRecurringCharge`
- **Strategies:** `getLatestStrategy`, `getStrategyHistory`, `insertStrategy`
- **Chat:** `getChatHistory`, `insertChatMessage`, `clearChatHistory`
- **Simulations:** `getSimulations`, `insertSimulation`

### AI Functions (`ai.service.js`)
- `categorizeExpense(concept)` → Returns category string
- `generateFinancialStrategy(userData)` → Returns structured JSON plan
- `buildUserContext(userId)` → Fetches all tables and assembles a Gemini system prompt
- `chatWithAdvisor(userId, message, route, hiddenPrompt?)` → Full chat flow: context → Gemini → DB persist
- `extractExpensesFromPDF(base64String)` → Sends PDF to Gemini, returns array of expense objects

### Mock AI Layer (`mock.ai.data.js`) 🧪
**Toggle:** Set `VITE_MOCK_AI=true` in `.env` to bypass all Gemini API calls. Set to `false` to use the real API.

When mock mode is active:
- `ai.service.js` checks the `MOCK_AI` flag at the top of every exported function.
- If `true`, the function returns a preset response from `mock.ai.data.js` immediately — **no tokens consumed**.
- All Supabase database operations (inserts, reads, updates) continue to work normally.
- A warning `⚠️ MOCK MODE ACTIVE` is logged to the browser console on app boot.

**Mock Data Dictionary Mapping:**

| AI Function | Mock Function | Behavior |
|---|---|---|
| `categorizeExpense` | `mockCategorizeExpense` | Keyword-based category matching from `CATEGORY_KEYWORDS` map |
| `generateFinancialStrategy` | `mockGenerateFinancialStrategy` | Dynamic strategy computed from input values (income, debts, expenses) |
| `synthesizeUserContext` | `mockSynthesizeContext` | Returns raw context prefix string (still persists to DB) |
| `chatWithAdvisor` | `mockChatResponse` | Keyword-matched Spanish responses from `CHAT_RESPONSES` map (still persists to DB) |
| `extractExpensesFromPDF` | `mockExtractExpensesFromPDF` | Returns 24 hardcoded transactions from a real bank statement |

> ⚠️ **MANDATORY SYNC RULE:** When any view or page is modified in a way that changes the shape of the data it consumes from an AI function (e.g., adding a new field to the Strategy Stepper, expecting a new property in the chat response, or changing the expense schema), the corresponding mock function in `mock.ai.data.js` **MUST** be updated in the same commit to match. Failure to do so will cause the app to crash in mock mode.
>
> **Checklist for view changes:**
> 1. Does the view consume new fields from `generateFinancialStrategy`? → Update `mockGenerateFinancialStrategy` return object.
> 2. Does the view expect new categories or expense properties? → Update `mockExtractExpensesFromPDF` and `CATEGORY_KEYWORDS`.
> 3. Does the chat UI parse structured data from advisor responses? → Update `CHAT_RESPONSES` entries.
> 4. Does the strategy stepper reference new plan properties (e.g., `estimated_timeframes`)? → Add them to the mock strategy object.

---

## 📋 4. STANDARD OPERATING PROCEDURE FOR AGENTS
When given a page to build, execute exactly as follows:
1. **Analyze:** Understand the page layout priorities. Check `src/template/components` for the required pre-styled building blocks.
2. **Scaffold (Phase 1):** Build the component in `src/features/` using exclusively fast, local mock data. 
3. **Refine:** Iterate on the UI alignment, CSS (using Tailwind spacing on the imported template widgets), and visual transitions until the user evaluates that it passes Phase 1.
4. **Bind (Phase 2):** Unpack the Supabase context and Gemini functions, replacing the mock arrays.
5. **Mock Sync (Phase 2+):** If your changes alter the AI response schema consumed by any view, update `src/services/mock.ai.data.js` to match. Run with `VITE_MOCK_AI=true` to validate the UI renders correctly with mock data before switching to real API.
6. **Verify:** Check error boundaries and active loading states globally.