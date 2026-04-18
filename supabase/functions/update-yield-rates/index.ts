// ==============================================
// Supabase Edge Function: update-yield-rates
// Fetches CETES rates from Banxico SIE API and
// scrapes SOFIPO rates, then upserts into DB.
//
// Triggered monthly via pg_cron or manually via:
//   curl -i --request POST 'https://<project>.functions.supabase.co/update-yield-rates' \
//     --header 'Authorization: Bearer <SERVICE_ROLE_KEY>'
// ==============================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Supabase Admin Client ───────────────────────────────────────
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ─── Institutional Health Scraper Placeholders ───────────────────
// TODO: Finalize scraper logic for regulatory scores.
// Official Sources:
// - SOFIPO NICAP (Nivel de Capitalizacion):
//   Published monthly by CNBV:
//   https://www.gob.mx/cnbv/acciones-y-programas/banca-de-desarrollo-y-entidades-de-fomento
//   Look for "Alertas Tempranas" or "Nivel de Capitalización de las Sociedades Financieras Populares"
// - Bank ICAP (Indice de Capitalizacion):
//   Published monthly by Banxico/CNBV:
//   https://www.banxico.org.mx/publicaciones-y-prensa/informes-sobre-el-sistema-financiero/
//
// These functions should eventually return mappings of institution name to their latest score.
async function fetchLatestNICAP() {
  // Placeholder: Return mocked or scraped CNBV data
  return {
    "Nu Cajita Turbo": "NICAP Cat 1",
    "Nu Cajita 24/7": "NICAP Cat 1",
    "Nu Ahorro Congelado": "NICAP Cat 1",
  };
}

async function fetchLatestICAP() {
  // Placeholder: Return mocked or scraped Banxico data
  return {};
}

// ─── Configuration ───────────────────────────────────────────────
// 🔑 REPLACE with your real Banxico API token from:
// https://www.banxico.org.mx/SieAPIRest/service/v1/token
const BANXICO_TOKEN = Deno.env.get("BANXICO_API_TOKEN") ?? "PLACEHOLDER_TOKEN_HERE";

// Banxico SIE API series IDs for CETES maturities
const CETES_SERIES = [
  { id: "SF60633", name: "CETES 28 días",  termDays: 28 },
  { id: "SF60634", name: "CETES 91 días",  termDays: 91 },
  { id: "SF60635", name: "CETES 182 días", termDays: 182 },
  { id: "SF60636", name: "CETES 364 días", termDays: 364 },
];

// ─── CETES Fetcher (Banxico SIE API) ─────────────────────────────
interface BanxicoRate {
  institution_name: string;
  instrument_type: string;
  annual_rate: number;
  term_days: number;
  source_url: string;
  trust_score: string;
  protection_type: string;
  base_apy: number;
  max_apy: number;
  requirements_description: string | null;
  is_promotional: boolean;
}

async function fetchCetesRates(): Promise<BanxicoRate[]> {
  const results: BanxicoRate[] = [];

  for (const series of CETES_SERIES) {
    const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${series.id}/datos/oportuno`;

    try {
      const res = await fetch(url, {
        headers: {
          "Bmx-Token": BANXICO_TOKEN,
          "Accept": "application/json",
        },
      });

      if (!res.ok) {
        console.error(`[CETES] Failed to fetch ${series.name}: ${res.status}`);
        continue;
      }

      const json = await res.json();
      // Banxico response structure: bmx.series[0].datos[0].dato
      const dato = json?.bmx?.series?.[0]?.datos?.[0]?.dato;
      const rate = parseFloat(dato);

      if (isNaN(rate)) {
        console.warn(`[CETES] Could not parse rate for ${series.name}: "${dato}"`);
        continue;
      }

      results.push({
        institution_name: series.name,
        instrument_type: "cetes",
        annual_rate: rate,
        term_days: series.termDays,
        source_url: url,
        trust_score: "Gobierno Federal",
        protection_type: "IPAB",
        base_apy: rate,
        max_apy: rate,
        requirements_description: null,
        is_promotional: false,
      });

      console.log(`[CETES] ${series.name}: ${rate}%`);
    } catch (err) {
      console.error(`[CETES] Error fetching ${series.name}:`, err);
    }
  }

  return results;
}

// ─── SOFIPO Scraper (Nu Mexico) ──────────────────────────────────
// 🔗 REPLACE this URL with the actual Nu savings page if it changes.
const NU_RATES_URL = "https://nu.com.mx/cuenta/";

interface SofipoRate {
  institution_name: string;
  instrument_type: string;
  annual_rate: number;
  gat_nominal: number | null;
  term_days: number | null;
  source_url: string;
  trust_score: string;
  protection_type: string;
  base_apy: number;
  max_apy: number;
  requirements_description: string | null;
  is_promotional: boolean;
}

async function scrapeNuRates(nicapScores: Record<string, string>): Promise<SofipoRate[]> {
  const results: SofipoRate[] = [];

  try {
    const res = await fetch(NU_RATES_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FaidBot/1.0)",
      },
    });

    if (!res.ok) {
      console.error(`[NU] Failed to fetch page: ${res.status}`);
      return results;
    }

    const html = await res.text();

    // ────────────────────────────────────────────────────────────
    // 📝 REGEX PATTERNS — Adjust these if Nu changes their HTML.
    // These look for percentage patterns like "13.00%" near known
    // product names in the page source.
    // ────────────────────────────────────────────────────────────

    // Cajita Turbo: look for "13.00%" or similar near "Turbo"
    const turboMatch = html.match(/(?:Turbo|turbo)[^]*?(\d{1,2}\.\d{1,2})%/i);
    if (turboMatch) {
      const rate = parseFloat(turboMatch[1]);
      results.push({
        institution_name: "Nu Cajita Turbo",
        instrument_type: "sofipo",
        annual_rate: rate,
        gat_nominal: null, // GAT requires a separate parse
        term_days: null,
        source_url: NU_RATES_URL,
        trust_score: nicapScores["Nu Cajita Turbo"] || "Desconocido",
        protection_type: "ProSofipo",
        base_apy: 6.75, // Currently default if criteria not met, could scrape this too
        max_apy: rate,
        requirements_description: "Realizar al menos 1 compra mensual con tarjeta Nu de cualquier monto",
        is_promotional: true,
      });
      console.log(`[NU] Cajita Turbo: ${rate}%`);
    }

    // Cajita 24/7: look for percentage near "vista" or "24/7"
    const vistaMatch = html.match(/(?:vista|24\/7)[^]*?(\d{1,2}\.\d{1,2})%/i);
    if (vistaMatch) {
      const rate = parseFloat(vistaMatch[1]);
      results.push({
        institution_name: "Nu Cajita 24/7",
        instrument_type: "sofipo",
        annual_rate: rate,
        gat_nominal: null,
        term_days: null,
        source_url: NU_RATES_URL,
        trust_score: nicapScores["Nu Cajita 24/7"] || "Desconocido",
        protection_type: "ProSofipo",
        base_apy: rate,
        max_apy: rate,
        requirements_description: null,
        is_promotional: false,
      });
      console.log(`[NU] Cajita 24/7: ${rate}%`);
    }

    // If scraping fails silently (no matches), log raw length for debugging
    if (results.length === 0) {
      console.warn(`[NU] No rate patterns matched. HTML length: ${html.length} chars.`);
      console.warn(`[NU] First 500 chars:\n${html.substring(0, 500)}`);
    }
  } catch (err) {
    console.error("[NU] Scraping error:", err);
  }

  return results;
}

// ─── DB Upsert ────────────────────────────────────────────────────
interface YieldRecord {
  institution_name: string;
  instrument_type: string;
  annual_rate: number;
  gat_nominal?: number | null;
  term_days?: number | null;
  source_url?: string;
  last_fetched_at?: string;
  trust_score?: string;
  protection_type?: string;
  base_apy?: number;
  max_apy?: number;
  requirements_description?: string | null;
  is_promotional?: boolean;
}

async function upsertRates(rates: YieldRecord[]) {
  if (rates.length === 0) {
    console.warn("[DB] No rates to upsert.");
    return { count: 0 };
  }

  const records = rates.map((r) => ({
    ...r,
    last_fetched_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("yield_rates")
    .upsert(records, { onConflict: "institution_name" })
    .select();

  if (error) {
    console.error("[DB] Upsert error:", error);
    throw error;
  }

  console.log(`[DB] Successfully upserted ${data?.length ?? 0} rates.`);
  return { count: data?.length ?? 0 };
}

// ─── Handler ──────────────────────────────────────────────────────
Deno.serve(async (_req) => {
  try {
    console.log("[update-yield-rates] Starting rate fetch...");

    // 0. Fetch regulatory scores (currently mocking actual scrapes)
    const nicapScores = await fetchLatestNICAP();
    // const icapScores = await fetchLatestICAP();

    // 1. Fetch CETES from Banxico API
    const cetesRates = await fetchCetesRates();

    // 2. Scrape SOFIPO rates from Nu
    const sofipoRates = await scrapeNuRates(nicapScores);

    // 3. Combine all rates
    const allRates: YieldRecord[] = [...cetesRates, ...sofipoRates];

    // 4. Upsert into DB
    const result = await upsertRates(allRates);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${result.count} yield rates.`,
        cetes: cetesRates.length,
        sofipo: sofipoRates.length,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[update-yield-rates] Fatal error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
