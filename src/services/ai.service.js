import { GoogleGenAI } from '@google/genai';
import {
  getProfile,
  getExpensesByUser,
  getRecurringCharges,
  getLatestStrategy,
  getChatHistory,
  insertChatMessage,
  updateProfileContext,
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
IMPORTANT RULES:
1. The "inflation_protection_strategy" MUST be written in Spanish.
2. For "debt_priority", if there are no specific debt names provided but the user has total_debts > 0, return a 1-item array with generic advice like ["Liquidar saldo total de deudas pendientes"]. If total_debts is 0, return ["Sin deudas actuales"].

{
  "debt_priority": ["Nombre de deuda de alto interés", "Deuda secundaria"],
  "emergency_target_mxn": 50000,
  "inflation_protection_strategy": "Descripción de la estrategia en español",
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
export const fetchRawUserContext = async (userId, profile = null) => {
  try {
    const [fetchedProfile, expenses, charges, strategy] = await Promise.all([
      profile ? Promise.resolve(profile) : getProfile(userId),
      getExpensesByUser(userId),
      getRecurringCharges(userId),
      getLatestStrategy(userId),
    ]);

    const sections = [];

    // Profile summary
    if (fetchedProfile) {
      sections.push(`## Perfil Financiero del Usuario
- Ingresos mensuales: $${fetchedProfile.income?.toLocaleString('es-MX') || 0} MXN
- Gastos fijos: $${fetchedProfile.fixed_expenses?.toLocaleString('es-MX') || 0} MXN
- Deudas totales: $${fetchedProfile.total_debts?.toLocaleString('es-MX') || 0} MXN
- Aportación mensual al plan: $${fetchedProfile.monthly_contribution?.toLocaleString('es-MX') || 0} MXN
- Progreso fondo de emergencia: ${((fetchedProfile.emergency_fund_progress || 0) * 100).toFixed(0)}%`);
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
    console.error('Error fetching raw user context:', error);
    return 'No se pudo obtener la información financiera del usuario.';
  }
};

/**
 * Resynthesizes the financial data context using Gemini and stores the text summary in the profile cache.
 */
export const synthesizeUserContext = async (userId, profile = null) => {
  const rawContext = await fetchRawUserContext(userId, profile);
  
  const prompt = `You are a strict data condenser. Compress the following raw financial data into a highly dense, extremely descriptive 150-word summary in Spanish. Focus on metrics, spending habits, major obligations, and the current active plan. Omit all pleasantries. Emphasize actual MXN values.

RAW DATA:
${rawContext}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    
    const summary = response.text.trim();
    
    // Save to the DB
    await updateProfileContext(userId, summary);
    return summary;
  } catch (error) {
    console.error("AI Context Synthesis Error:", error);
    return rawContext; // Fallback to raw text if synthesis fails
  }
}

/**
 * Provides the context string to inject into the Chat model.
 * Prioritizes the cached text summary, dropping to manual resynthesis if invalid/missing.
 */
export const buildUserContext = async (userId) => {
  try {
    const profile = await getProfile(userId);
    
    if (profile && profile.ai_context_summary) {
      return profile.ai_context_summary;
    }

    return await synthesizeUserContext(userId, profile);
  } catch (error) {
    console.error('Error in buildUserContext:', error);
    return 'Contexto no disponible por falla en base de datos.';
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

// ==============================================
// PDF EXTRACTOR (Phase 3)
// ==============================================

/**
 * Sends a PDF base64 payload to Gemini for OCR and expense extraction.
 * @param {string} base64String - Raw base64 string of the PDF (without data URI prefix)
 * @returns {Array} Array of expense objects
 */
export const extractExpensesFromPDF = async (base64String) => {
  const prompt = `You are an expert financial data extractor. I am providing you with a PDF bank statement.
  Analyze the document and extract ALL outward money movements (expenses, purchases, payments, withdrawals).
  DO NOT include income, deposits, or starting/ending balances.
  
  Return a raw JSON array of objects exactly matching this format:
  [
    {
      "concept": "Name of the merchant or description",
      "amount": 150.50,
      "category": "Food",
      "created_at": "YYYY-MM-DD"
    }
  ]
  
  IMPORTANT RULES:
  1. The "amount" must be a positive number.
  2. The "category" must be strictly one of: Housing, Food, Transport, Utilities, Entertainment, Health, Debt, Misc. Guess the best fit based on the concept.
  3. The "created_at" must be an ISO date string (YYYY-MM-DD). If no year is present, assume the current year.
  4. ONLY return the raw JSON array. Do not wrap in markdown. ONLY JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        { text: prompt },
        { inlineData: { mimeType: "application/pdf", data: base64String } }
      ]
    });

    let jsonString = '';
    
    console.log("[AI_SERVICE] Response text resolved to type:", typeof response.text);
    if (response.text && typeof response.text === 'string') {
        jsonString = response.text;
    } else if (typeof response.text === 'function') {
        jsonString = await response.text(); 
    } else if (response.candidates && response.candidates.length > 0) {
        const parts = response.candidates[0]?.content?.parts || [];
        jsonString = parts.map(p => p.text).filter(Boolean).join('\\n');
    }

    console.log("[AI_SERVICE] Extracted JSON string length:", jsonString?.length || 0);

    if (!jsonString) {
        throw new Error('La API de IA no devolvió contenido válido.');
    }

    const startIdx = jsonString.indexOf('[');
    const endIdx = jsonString.lastIndexOf(']');
    
    console.log("[AI_SERVICE] Bounds located - Start:", startIdx, "End:", endIdx);
    
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
        console.error("[AI_SERVICE] Missing array brackets. Raw Gemini Output:\n", jsonString);
        throw new Error('La IA no devolvió un arreglo JSON procesable. Intenta nuevamente.');
    }
    
    const cleanJsonStr = jsonString.substring(startIdx, endIdx + 1);
    console.log("[AI_SERVICE] Final cut JSON block length:", cleanJsonStr.length);

    try {
        const parsedArray = JSON.parse(cleanJsonStr);
        console.log("[AI_SERVICE] JSON successfully parsed! Elements:", parsedArray?.length);
        if (!Array.isArray(parsedArray)) throw new Error('El objeto retornado no es un Array.');
        return parsedArray;
    } catch (parseError) {
        console.error("[AI_SERVICE] JSON Parse failed! Problematic string:", cleanJsonStr);
        throw new Error('Error parseando el JSON (' + parseError.message + '). Texto recibido: ' + cleanJsonStr.substring(0, 100) + '...');
    }
    
  } catch (error) {
    console.error("AI PDF Extraction Error:", error);
    throw error;
  }
};
