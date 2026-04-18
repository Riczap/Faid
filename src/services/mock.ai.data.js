// ==============================================
// MOCK AI RESPONSES
// Toggle via VITE_MOCK_AI=true in .env
// All DB operations continue to work normally.
// Only Gemini API calls are intercepted.
// ==============================================

/**
 * Simple keyword-based categorizer for mock mode.
 */
const CATEGORY_KEYWORDS = {
  Housing: ['renta', 'hipoteca', 'casa', 'depa', 'departamento', 'alquiler'],
  Food: ['super', 'walmart', 'oxxo', 'restaurante', 'comida', 'cena', 'kfc', 'pizza', 'cafe', 'soriana', 'chedraui', 'rest'],
  Transport: ['uber', 'didi', 'gasolina', 'novogas', 'gas', 'estacionamiento', 'taxi', 'rides'],
  Utilities: ['luz', 'agua', 'cfe', 'telmex', 'internet', 'telefono', 'celular'],
  Entertainment: ['cine', 'netflix', 'spotify', 'steam', 'xbox', 'playstation', 'bar', 'fiesta', 'concierto', 'music'],
  Health: ['farmacia', 'doctor', 'hospital', 'smartfit', 'gym', 'salud', 'ahorro'],
  Education: ['universidad', 'colegiatura', 'curso', 'udemy', 'platzi', 'libro', 'escuela', 'capacitacion', 'maestria'],
  Debt: ['tarjeta', 'credito', 'prestamo', 'pago tdc', 'bmovil'],
  Misc: ['amazon', 'paypal', 'mercadolibre', 'merpago', 'stripe'],
};

export const mockCategorizeExpense = (concept) => {
  const lower = concept.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return 'Misc';
};

/**
 * Generates a realistic Mexican-market financial strategy.
 */
export const mockGenerateFinancialStrategy = (userData) => {
  const debts = Number(userData.total_debts) || 0;
  const income = Number(userData.income) || 0;
  const expenses = Number(userData.fixed_expenses) || 0;
  const surplus = income - expenses;

  return {
    debt_priority: debts > 0
      ? ["Liquidar tarjeta de crédito con mayor tasa de interés", "Reducir saldo de préstamos personales"]
      : ["Sin deudas actuales — enfocarse en ahorro e inversión"],
    emergency_target_mxn: Math.max(expenses * 3, 30000),
    inflation_protection_strategy: `Con un excedente mensual estimado de $${surplus.toLocaleString('es-MX')} MXN, se recomienda destinar el 50% a CETES a 28 días para mantener liquidez inmediata, 20% a UDIBONOS para protección contra inflación a largo plazo, y conservar 30% en una cuenta de alta disponibilidad como fondo de emergencia activo.`,
    allocation: {
      cetes: 50,
      udibonos: 20,
      liquidity: 30
    },
    estimated_timeframes: {
      step1: debts > 0 ? "3-6 Meses" : "N/A",
      step2: "6-12 Meses",
      step3: "Continuo"
    }
  };
};

/**
 * Returns a mock context synthesis string.
 */
export const mockSynthesizeContext = (rawContext) => {
  return `[MOCK] Resumen financiero generado localmente para pruebas. Datos base: ${rawContext.substring(0, 200)}...`;
};

/**
 * Returns a mock advisor chat response based on simple keyword matching.
 */
const CHAT_RESPONSES = {
  deuda: "Basándome en tu perfil, te recomiendo aplicar el método avalancha: paga el mínimo en todas tus deudas y destina el excedente a la que tenga la tasa de interés más alta. Esto te ahorrará más dinero a largo plazo en intereses acumulados.",
  ahorro: "Para tu situación actual, te sugiero automatizar tu ahorro. Configura una transferencia automática el día de tu nómina hacia una cuenta de CETES Directo. Empieza con al menos el 10% de tus ingresos y ajusta conforme liquides deudas.",
  gasto: "Revisando tus patrones de gasto, noto que las categorías de Alimentos y Entretenimiento representan una porción considerable. Considera establecer un presupuesto semanal fijo para estas categorías y utilizar efectivo para controlar mejor el flujo.",
  inversión: "Dado tu perfil de riesgo conservador en el mercado mexicano, te recomiendo comenzar con CETES a 28 días (liquidez inmediata) y gradualmente incorporar UDIBONOS para protección contra inflación. Evita instrumentos de alto riesgo hasta tener tu fondo de emergencia completo.",
  emergencia: "Tu fondo de emergencia debería cubrir entre 3 y 6 meses de gastos fijos. Basándome en tus gastos actuales, la meta recomendada es acumular al menos $50,000 MXN en una cuenta de alta liquidez antes de considerar inversiones a plazo.",
  default: "¡Hola! Soy tu Asesor Faid. Puedo ayudarte con estrategias de ahorro, manejo de deudas, inversión en el mercado mexicano y análisis de tus gastos. ¿En qué área te gustaría enfocarte hoy?"
};

export const mockChatResponse = (userMessage) => {
  const lower = userMessage.toLowerCase();
  for (const [keyword, response] of Object.entries(CHAT_RESPONSES)) {
    if (keyword !== 'default' && lower.includes(keyword)) return response;
  }
  return CHAT_RESPONSES.default;
};

/**
 * Returns a realistic mock PDF extraction based on common Mexican bank statement patterns.
 * Uses the actual data the user shared from their real bank statement.
 */
export const mockExtractExpensesFromPDF = () => {
  return [
    { concept: "WM EXPRESS JURI STA FE", amount: 87.53, category: "Food", created_at: "2026-02-19" },
    { concept: "TH JURIQUILLA INT", amount: 147.00, category: "Misc", created_at: "2026-02-19" },
    { concept: "BMOVIL.PAGO TDC", amount: 8000.00, category: "Debt", created_at: "2026-02-19" },
    { concept: "REST CORDELIA", amount: 1606.00, category: "Food", created_at: "2026-02-22" },
    { concept: "NOVOGAS JURIQUILLA", amount: 500.00, category: "Transport", created_at: "2026-02-27" },
    { concept: "BAR MONCHIS", amount: 746.90, category: "Entertainment", created_at: "2026-02-27" },
    { concept: "F AHORRO QRFJ JUNIPERO", amount: 311.00, category: "Health", created_at: "2026-02-27" },
    { concept: "KFC 573 BOULEVARES QRO", amount: 193.00, category: "Food", created_at: "2026-02-27" },
    { concept: "OXXO UNIVERSITARIO", amount: 50.00, category: "Food", created_at: "2026-03-03" },
    { concept: "REST JARDIN HERCULES", amount: 1061.50, category: "Food", created_at: "2026-03-04" },
    { concept: "COPIZZA JURIQUILLA", amount: 613.00, category: "Food", created_at: "2026-03-04" },
    { concept: "BMOVIL.PAGO TDC", amount: 5241.68, category: "Debt", created_at: "2026-03-04" },
    { concept: "MERPAGO*GAMAMUSIC", amount: 16238.00, category: "Entertainment", created_at: "2026-03-04" },
    { concept: "WL *STEAM PURCHASE", amount: 261.00, category: "Entertainment", created_at: "2026-03-06" },
    { concept: "SMARTFIT", amount: 599.00, category: "Health", created_at: "2026-03-02" },
    { concept: "SMARTFIT", amount: 349.50, category: "Health", created_at: "2026-03-02" },
    { concept: "NOVOGAS JURIQUILLA", amount: 700.00, category: "Transport", created_at: "2026-03-10" },
    { concept: "D LOCAL*DIDI RIDES", amount: 172.00, category: "Transport", created_at: "2026-03-08" },
    { concept: "AMAZON", amount: 411.79, category: "Misc", created_at: "2026-03-09" },
    { concept: "DLO*SPOTIFY", amount: 139.00, category: "Entertainment", created_at: "2026-03-13" },
    { concept: "NOVOGAS JURIQUILLA", amount: 710.00, category: "Transport", created_at: "2026-03-13" },
    { concept: "MACO CAFE", amount: 143.00, category: "Food", created_at: "2026-03-15" },
    { concept: "BMOVIL.PAGO TDC", amount: 11000.00, category: "Debt", created_at: "2026-03-07" },
    { concept: "STRIPE *AMAZON", amount: 129.00, category: "Misc", created_at: "2026-03-16" },
  ];
};

/**
 * Returns mock recommendations specifically tuned for the Debt Simulator results.
 */
export const mockGetSimulationRecommendations = (profile, simulationData) => {
  return [
    {
      title: "Técnicas de Inversión",
      description: "Considerando tu margen libre, se recomienda escalonar instrumentos a corto plazo. Aprovechar plazos de 28 días te brindará flexibilidad sobre la cuota mensual para no comprometer tu flujo ante imprevistos."
    },
    {
      title: "Fondos Recomendados",
      description: "BONDDIA y fondos soberanos de bajo riesgo son ideales en esta etapa. Te permitirán amortiguar la inflación y crear interés compuesto seguro sin someterte a volatilidad, respetando la regla del 35%."
    },
    {
      title: "Consejos Rápidos Financieros",
      description: "Intenta domiciliar el pago mensual estimado de esta posible deuda para evitar recargos. Paralelamente, procura reducir temporalmente un 10-15% en gastos de entretenimiento para absorber este ajuste cómodamente."
    }
  ];
};

/**
 * Returns mock investment recommendations logically based on profile income and expenses.
 */
export const mockGetInvestmentRecommendations = (profileData, expensesData) => {
  return [
    {
      title: "Técnicas de Inversión",
      description: "Basado en tu flujo regular de ingresos, la estrategia más sólida para ti en este momento es el \"Dollar Cost Averaging\" (DCA). Consiste en invertir una cantidad fija mensual, independientemente de si el mercado sube o baja. Dado tu salario registrado, podrías automatizar una transferencia del 10% el día siguiente a tu pago de nómina."
    },
    {
      title: "Fondos Recomendados",
      description: "Para un perfil seguro pero con exposición al crecimiento, te sugerimos dividir tu fondo de la siguiente forma:\n\n**1. CETES a 28 días:** Para mantener liquidez de corto plazo y usar como colchón primario contra la inflación.\n**2. ETFs Indexados (Ej. IVVPESO):** Te da acceso a las 500 empresas más grandes de EE.UU. (S&P 500) operando en pesos mexicanos, ideal para el mediano y largo plazo."
    },
    {
      title: "Consejos Financieros Detallados",
      description: "Hemos detectado picos en la categoría de 'Misc' y 'Entretenimiento' en tus análisis recientes. El consejo riguroso aquí es aplicar la regla 50/30/20 de forma estricta el próximo mes natural: 50% para vivienda/comida, 30% a cosas recreativas, y el 20% sellado herméticamente a tu cuenta de Cetes."
    }
  ];
};

/**
 * Generates a mock AI analysis for a dangerous debt simulation.
 */
export const mockAnalyzeDebtRisk = (simulationData) => {
  return `**⚠️ Alerta de Riesgo Crediticio**

Tu simulación indica un nivel de endeudamiento que supera el **35% de tus ingresos**, lo cual te pone en una zona de alto riesgo para tu liquidez mensual.

**Sugerencias de tu Asesor Faid:**
1. **Reduce el monto a solicitar:** Si es posible, aporta un mayor enganche inicial para reducir el capital financiado.
2. **Extiende el plazo:** Aunque pagarás más intereses a largo plazo, aumentar los meses reducirá la carga mensual a un nivel manejable por debajo de tu límite de ${simulationData?.maxSafeCapacity ? "$" + simulationData.maxSafeCapacity.toLocaleString() : "seguridad"}.
3. **Consolida deudas previas:** Antes de adquirir este nuevo compromiso, evalúa si puedes liquidar o unificar tu deuda actual para liberar espacio presupuestal.`;
};

/**
 * Mock requirement analyzer. Extracts numeric thresholds from requirement text
 * using simple regex patterns instead of calling Gemini.
 */
export const mockAnalyzeRequirements = (text) => {
  if (!text) return { has_requirements: false };

  const result = {
    has_requirements: true,
    min_monthly_spend: null,
    min_deposit: null,
    lock_days: null,
    recurring_deposit: null,
    other_conditions: null,
  };

  // Extract monetary amounts (e.g. "$6,000", "$1,000", "$5,000")
  const moneyMatches = text.match(/\$?([\d,]+(?:\.\d{2})?)\s*(?:MXN|pesos)?/gi);
  const amounts = moneyMatches
    ? moneyMatches.map(m => Number(m.replace(/[$,MXN\s]/gi, '')))
    : [];

  // Extract day counts (e.g. "180 dias", "360 dias")
  const daysMatch = text.match(/(\d+)\s*d[ií]as?/i);
  if (daysMatch) result.lock_days = Number(daysMatch[1]);

  // Classify the extracted amount based on keywords
  const lower = text.toLowerCase();
  if (lower.includes('gasto') || lower.includes('compra')) {
    result.min_monthly_spend = amounts[0] || null;
  } else if (lower.includes('deposito recurrente') || lower.includes('nomina')) {
    result.recurring_deposit = amounts[0] || null;
  } else if (lower.includes('inversion minima') || lower.includes('deposito')) {
    result.min_deposit = amounts[0] || null;
  }

  // Capture leftover conditions
  if (lower.includes('tarjeta') || lower.includes('nomina')) {
    result.other_conditions = text;
  }

  return result;
};
