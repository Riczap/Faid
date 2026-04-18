# Technical Architecture & Engineering Decisions: Faid

## 1. System Architecture & Data Flow

Faid is architected as an intelligent, secure, and highly responsive web application designed to act as a personalized financial advisor. To balance the stochastic nature of AI with the deterministic requirements of financial mathematics, the system enforces a strict separation of concerns among the Frontend (Presentation & State), the AI Service (Categorization & Strategy Logic), and the Backend (Persistence & Security).

### Separation of Concerns
*   **Frontend (Presentation & State):** Responsible exclusively for user interaction, state management, and data visualization. It handles user inputs and renders charting abstractions directly from the deterministic backend data.
*   **AI Service (Categorization & Strategy Logic):** Acts as a stateless processing engine. It ingests raw or unstructured user input, infers intent (e.g., categorizing an expense or identifying a financial goal), returns structured JSON outputs, and defers all state persistence back to the system.
*   **Backend (Persistence & Security):** Serves as the single source of truth. It validates all incoming structures via Row Level Security (RLS), persists sanitized data, and asynchronously manages external data feeds (e.g., market rates).

### Request Lifecycle Data Flow
The lifecycle of a user action (such as logging an unstructured expense or requesting a financial plan) follows a defined, unidirectional flow:

1.  **User Client:** The user inputs natural language data (e.g., "I spent 500 pesos on groceries") via the React UI.
2.  **React Context:** The local state router registers the input request and dispatches it to the application's service layer, displaying optimistic UI loading states.
3.  **AI Service Layer (Gemini):** The request is proxied to the Google Gemini API using the Gen AI SDK. System prompts enforce aggressive constraints, requiring the AI to return a strictly typed JSON object containing identified categories, normalized amounts, and strategic insights.
4.  **Parsing & Sanitization:** The frontend receives the unstructured AI response, parses the JSON, and maps the extracted payload against the database schema requirements.
5.  **Supabase DB (with RLS Validation):** A mutating request is sent to the Supabase PostgreSQL database. Before committing, PostgreSQL Row Level Security (RLS) intercept policies automatically unpack the user's JWT, verifying ownership and ensuring the user can only insert or read their own financial records.
6.  **Frontend Update (Recharts):** Upon successful database insertion, real-time listeners or state invalidation triggers a re-fetch of the localized data cache. The React Context distributes the updated data to Recharts components, seamlessly morphing the visual analytics.

---

## 2. Technologies Employed & Justification

The technology stack was selected to maximize iteration speed for a rapid-development hackathon MVP, without compromising on production-grade architectural patterns.

*   **React + Vite:**
    *   *Justification:* Vite provides near-instant Hot Module Replacement (HMR) critical for high-velocity UI development. React’s component-based architecture ensures that complex financial dashboards and forms remain modular, understandable, and highly reusable.
*   **Supabase (PostgreSQL, Auth, Edge Functions):**
    *   *Justification:* Supabase delivers an instant, strictly-typed PostgreSQL backend paired with zero-config Auth. It eliminates the need for standing up a custom Node.js/Express middleware layer, allowing direct, secure interaction from the client via RLS.
*   **Google Gemini API (via Gen AI SDK):**
    *   *Justification:* Gemini's advanced context windows are capable of analyzing dense, multi-variable financial profiles over long conversational histories. Its native ability to enforce structured JSON outputs makes it highly reliable for software-to-software integrations, rather than purely generative chat interfaces.
*   **Recharts:**
    *   *Justification:* Recharts offers a declarative, native React integration for SVGs. It provides immediate, responsive visual feedback on financial allocations without introducing the heavy footprint of imperative canvas-based charting libraries.

---

## 3. Significant Technical Decisions & Trade-offs

To deliver a scalable and performant MVP under extreme hackathon constraints, several strategic trade-offs were negotiated.

### Decision 1: Database-Driven Analytics vs. Pure AI Generation
*   **Problem:** Relying on an LLM to dynamically calculate running totals, generate chart schemas on the fly, and maintain historical accuracy over a massive context window is inherently fragile and mathematically unreliable.
*   **Solution:** We architected the AI exclusively as a *text-categorization and strategy engine*. Individual transactions and budgets are parsed by the AI but stored deterministically in PostgreSQL. Charting abstractions (`Recharts`) read directly from the database to render visuals.
*   **Justification:** This hybrid approach mathematically guarantees correct totals and chart plotting. It significantly reduces API token overhead, lowers network latency on repetitive loads, and limits hallucinations regarding past financial states.

### Decision 2: Asynchronous Rate Updating via Edge Functions
*   **Problem:** The "Yield Radar" feature requires live macroeconomic data (e.g., CETES rates, SOFIPO APYs). Fetching these from client-side browsers introduces severe CORS security blocks, exposes scraping logic, and degrades client performance.
*   **Solution:** We decoupled external rate fetching by moving it to a Supabase Edge Function triggered asynchronously via `pg_cron`.
*   **Justification:** The database acts as a caching layer. The client exclusively queries our Supabase table, ensuring lightning-fast load times. The `pg_cron` worker updates the rates securely in the background, bypassing CORS entirely and centralizing API/scraper logic away from the fragile frontend.

### Decision 3: Explicit Exclusion of Live Banking APIs (Open Banking)
*   **Problem:** Integrating live banking data typically requires services like Plaid or Belvo, which demand lengthy administrative approval processes, API key provisioning, and significant security overhead.
*   **Solution:** Live banking integrations were intentionally placed out-of-scope. Faid relies on user-directed input (manual entry and natural language text) to generate its financial ledger.
*   **Justification:** Managing financial API compliance within a hackathon timeline guarantees missed deadlines. By limiting the scope to manual tracking + AI inference, we prove the validity of the core strategic advisory mechanics without being blocked by third-party vendor onboarding.

### Decision 4: Security through Row Level Security (RLS)
*   **Problem:** Standard stateless frontend applications require a robust backend API (e.g., Node.js + Express) to parse JWTs, validate user authorization, and execute database queries safely—costing crucial development hours.
*   **Solution:** We eliminated the traditional middleware layer by routing client requests directly to the database layer, governed firmly by PostgreSQL Row Level Security (RLS).
*   **Justification:** RLS policies push the security validation directly into the database engine. By interpreting the Supabase Auth JWT inside PostgreSQL, we ensure absolute financial data privacy. Even if the frontend client is compromised, a user cannot execute a query (read, update, or delete) against records that do not contain their exact `auth.uid()`, vastly accelerating development while maintaining enterprise-grade data isolation.
