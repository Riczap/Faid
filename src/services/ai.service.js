import { GoogleGenAI } from '@google/genai';
import {
  getProfile,
  getExpensesByUser,
  getRecurringCharges,
  getLatestStrategy,
  getChatHistory,
  insertChatMessage,
} from './db.service';

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

const MODEL = 'gemini-2.5-flash';

// ==============================================
// EXPENSE CATEGORIZATION (Phase 1 — unchanged)
// ==============================================

export const categorizeExpense = async (concept) => {
  const prompt = `You are a strict financial categorizer. Categorize this expense concept: "${concept}". You must return ONLY one exact string from this array: ['Housing', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Debt', 'Misc']. Do not return any other characters.`;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    const category = response.text.trim();
    const valid = ['Housing', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Debt', 'Misc'];
    if (!valid.includes(category)) return 'Misc';
    
    return category;
  } catch (error) {
    console.error("AI Categorization Error:", error);
    return 'Misc';
  }
};

// ==============================================
// STRATEGY GENERATION (Phase 1 — unchanged)
// ==============================================

export const generateFinancialStrategy = async (userData) => {
  const prompt = `You are an expert Mexican market Financial Advisor. Analyze the following user profile and expenses:
${JSON.stringify(userData, null, 2)}

Return a structured JSON object exactly matching this format. ONLY output the raw JSON so it can be parsed.
{
  "debt_priority": ["Highest interest debt name", "Secondary debt"],
  "emergency_target_mxn": 50000,
  "inflation_protection_strategy": "Strategy description",
  "allocation": {
    "cetes": 50,
    "udibonos": 20,
    "liquidity": 30
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    let jsonString = response.text.trim();
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
    }
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Strategy Error:", error);
    return null;
  }
};

// ==============================================
// CONTEXT BUILDER (Phase 2 — NEW)
// ==============================================

/**
 * Fetches all relevant user data from the database and assembles
 * a comprehensive context string for the Gemini system prompt.
 * 
 * @param {string} userId - The authenticated user's UUID
 * @returns {string} A structured context block for Gemini
 */
export const buildUserContext = async (userId) => {
  try {
    const [profile, expenses, charges, strategy] = await Promise.all([
      getProfile(userId),
      getExpensesByUser(userId),
      getRecurringCharges(userId),
      getLatestStrategy(userId),
    ]);

    const sections = [];

    // Profile summary
    if (profile) {
      sections.push(`## Perfil Financiero del Usuario
- Ingresos mensuales: $${profile.income?.toLocaleString('es-MX') || 0} MXN
- Gastos fijos: $${profile.fixed_expenses?.toLocaleString('es-MX') || 0} MXN
- Deudas totales: $${profile.total_debts?.toLocaleString('es-MX') || 0} MXN
- Aportación mensual al plan: $${profile.monthly_contribution?.toLocaleString('es-MX') || 0} MXN
- Progreso fondo de emergencia: ${((profile.emergency_fund_progress || 0) * 100).toFixed(0)}%`);
    }

    // Recent expenses (last 30)
    if (expenses && expenses.length > 0) {
      const recentExpenses = expenses.slice(0, 30);
      const totalSpent = recentExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const byCategory = recentExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
      }, {});

      sections.push(`## Gastos Recientes (${recentExpenses.length} registros)
- Total gastado: $${totalSpent.toLocaleString('es-MX')} MXN
- Distribución por categoría: ${JSON.stringify(byCategory)}`);
    }

    // Recurring charges
    if (charges && charges.length > 0) {
      const chargeList = charges.map(c => `  - ${c.name}: $${c.amount} MXN (${c.frequency}, día ${c.billing_day})`).join('\n');
      const monthlyTotal = charges.reduce((sum, c) => {
        const multiplier = c.frequency === 'monthly' ? 1 : c.frequency === 'bimonthly' ? 0.5 : 1/12;
        return sum + (Number(c.amount) * multiplier);
      }, 0);

      sections.push(`## Cargos Recurrentes Activos (${charges.length})
${chargeList}
- Costo mensual estimado: $${monthlyTotal.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN`);
    }

    // Latest strategy
    if (strategy) {
      sections.push(`## Plan Financiero Vigente (generado ${new Date(strategy.created_at).toLocaleDateString('es-MX')})
- Prioridad de deuda: ${JSON.stringify(strategy.debt_priority)}
- Meta fondo emergencia: $${strategy.emergency_target_mxn?.toLocaleString('es-MX') || 0} MXN
- Distribución de inversión: CETES ${strategy.allocation?.cetes || 0}%, UDIBONOS ${strategy.allocation?.udibonos || 0}%, Liquidez ${strategy.allocation?.liquidity || 0}%`);
    }

    return sections.join('\n\n') || 'El usuario aún no tiene datos financieros registrados.';
  } catch (error) {
    console.error('Error building user context:', error);
    return 'No se pudo obtener el contexto financiero del usuario.';
  }
};

// ==============================================
// ADVISOR CHAT (Phase 2 — NEW)
// ==============================================

/**
 * Sends a user message to Gemini with full financial context,
 * persists both the question and the response to the database.
 * 
 * @param {string} userId - The authenticated user's UUID
 * @param {string} userMessage - The visible message from the user
 * @param {string} route - The current page route (e.g. "/spending")
 * @param {string|null} hiddenPrompt - Optional full prompt from presets
 * @returns {{ role: string, content: string }} The assistant's response
 */
export const chatWithAdvisor = async (userId, userMessage, route, hiddenPrompt = null) => {
  try {
    // 1. Fetch user's full financial context
    const userContext = await buildUserContext(userId);

    // 2. Fetch recent chat history for conversational continuity
    const chatHistory = await getChatHistory(userId, 20);
    const historyBlock = chatHistory
      .map(m => `${m.role === 'user' ? 'Usuario' : 'Asesor'}: ${m.content}`)
      .join('\n');

    // 3. Build the system prompt
    const systemPrompt = `Eres un asesor financiero experto especializado en el mercado mexicano. Tu nombre es "Asesor Faid". Responde SIEMPRE en español, de forma clara, específica y accionable.

REGLAS ESTRICTAS:
- Responde basándote en los datos reales del usuario que se proporcionan abajo.
- Nunca inventes datos que no estén en el contexto.
- Si no tienes suficiente información, dilo honestamente y sugiere qué datos necesitaría el usuario registrar.
- Usa montos en MXN.
- Sé conciso pero útil (máximo 3 párrafos).
- Si el usuario pregunta sobre algo relacionado con la página actual, enfoca tu respuesta en ese tema.

${userContext}

## Página Actual del Usuario
${route || '/'}

## Historial de Conversación
${historyBlock || '(Primera interacción)'}`;

    // 4. The actual prompt sent to Gemini (use hidden if available)
    const actualPrompt = hiddenPrompt || userMessage;

    // 5. Save user message to DB
    await insertChatMessage(userId, {
      role: 'user',
      content: userMessage,
      hidden_prompt: hiddenPrompt,
      route,
    });

    // 6. Call Gemini
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `${systemPrompt}\n\nPregunta del usuario: ${actualPrompt}`,
    });

    const assistantText = response.text.trim();

    // 7. Save assistant response to DB
    await insertChatMessage(userId, {
      role: 'assistant',
      content: assistantText,
      route,
    });

    return { role: 'assistant', content: assistantText };
  } catch (error) {
    console.error('Advisor Chat Error:', error);
    
    const fallback = 'Lo siento, tuve un problema procesando tu consulta. Por favor intenta de nuevo en un momento.';
    
    // Save error response so chat history stays consistent
    try {
      await insertChatMessage(userId, {
        role: 'assistant',
        content: fallback,
        route,
      });
    } catch (_) { /* silent */ }

    return { role: 'assistant', content: fallback };
  }
};
