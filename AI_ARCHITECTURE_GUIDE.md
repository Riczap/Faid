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
**ALL UI RENDERED TEXT MUST BE IN SPANISH.** You must strictly use Spanish for user-facing headers, paragraphs, buttons, placeholders, and tooltips. Code variables, state hooks, and JSON paths (`id`, `cetes`, `category`) should remain in English to sync natively with the backend logic.

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

---

## 📋 4. STANDARD OPERATING PROCEDURE FOR AGENTS
When given a page to build, execute exactly as follows:
1. **Analyze:** Understand the page layout priorities. Check `src/template/components` for the required pre-styled building blocks.
2. **Scaffold (Phase 1):** Build the component in `src/features/` using exclusively fast, local mock data. 
3. **Refine:** Iterate on the UI alignment, CSS (using Tailwind spacing on the imported template widgets), and visual transitions until the user evaluates that it passes Phase 1.
4. **Bind (Phase 2):** Unpack the Supabase context and Gemini functions, replacing the mock arrays.
5. **Verify:** Check error boundaries and active loading states globally.