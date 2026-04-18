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
