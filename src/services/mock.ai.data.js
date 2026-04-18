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
      description: `**1. Fundamentos del Análisis de Flujo de Caja y Dollar Cost Averaging (DCA)**\nBasado en tu flujo regular de ingresos y el patrón detectado de gastos recurrentes (particularmente tus pagos concentrados a finales del mes), la estrategia principal más sólida y resiliente en el ámbito mexicano es el "Dollar Cost Averaging" o compras promediadas. A diferencia de las inversiones de capital único (Lump Sum), la técnica DCA diluye el riesgo inherente de la volatilidad política y económica, ya que adquieres los instrumentos independientemente de su precio diario.\n\n**2. Estructuración del Portafolio y Automatización**\nSe recomienda destinar, sin excepción, el 20% de tus ingresos netos directamente a una "caja negra" financiera que opere sin intervención emocional. Este proceso debe estar domiciliado para ejecutarse el día 2 o 16 del mes (un día hábil después de que tu nómina se asiente en tu cuenta base). Para aquellos con salarios bajo esquemas mixtos, es imperativo calcular esta base con el ingreso garantizado, dejando los bonos de productividad exclusivamente para inyecciones extraordinarias de capital al principal.\n\n**3. Mitigación de Interés Compuesto Negativo y Eficiencia Inter-Bancaria**\nEs crucial entender que cualquier deuda inflacionaria adquirida mermará esta técnica; esto significa evitar financiarse con plásticos no totaleros mientras se desarrolla esta estrategia. El capital ahorrado se dividirá asimétricamente: usarás herramientas pasivas para evitar pagos de comisiones operativas al bróker, garantizando que el spread se mantenga ínfimo. El objetivo principal de los primeros 12 a 18 meses usando DCA no es hacerse rico, sino alcanzar un GAV (Gross Asset Value) equivalente a 6 meses de tus ingresos, lo que activamente funciona como blindaje de emergencia antes de aventurarse a mercados bursátiles extranjeros de alto riesgo.`
    },
    {
      title: "Fondos Recomendados",
      description: `**1. Deuda Gubernamental (Pilar de Estabilidad - CETES y BONDDIA)**\nPara resguardar el valor adquisitivo de tus primeros ahorros masivos frente a la inflación real de México (calculada anualmente por el INPC), el instrumento base obligatorio será CETES Directo (Certificados de la Tesorería de la Federación). Recomendamos una asignación contundente del 60% de tu flujo de inversión hacia plazos de 28 días, con instrucción automática de reinversión de capital e intereses. Esto garantiza liquidez al finalizar el mes mientras mantienes al capital atado a las tasas históricas del Banco de México que, en ambientes restrictivos, alcanzan hasta un 11% anualizado seguro. Para dinero que absolutamente podrías ocupar en 24 horas, BONDDIA cubrirá tu flanco derecho.\n\n**2. Renta Variable e Inversión Passiva Extranjera (ETFs Indexados)**\nEl 40% restante deberá enfrentar al mercado expansivo de Norteamérica. Instrumentos como IVVPESO o VOO (Vanguard S&P 500 ETF) adquiridos a través de brokers regulados por la CNBV (como GBM+ o Bursanet) otorgan exposición directa a las 500 corporaciones más potentes de EE. UU. Elegir IVVPESO tiene como ventaja estratégica su cobertura cambiaria frente a riesgos de apreciación severa del dólar en el corto plazo, blindando el rendimiento natural del mercado ante un 'súper peso'.\n\n**3. Optimización Fiscal y Aportaciones Complementarias (Afores/PPR)**\nSi tu ingreso te coloca en rangos impositivos altos en la tabla del ISR, se exige derivar un brazo estratégico (hasta un 10% del ingreso bruto anual o el equivalente a 5 UMA elevadas al año) hacia aportaciones voluntarias deducibles estrictamente etiquetadas para el retiro bajo el Artículo 151 (Planes Personales de Retiro). Esto permite inyectar liquidez extra proveniente del SAT durante el mes de mayo de cada ejercicio fiscal, misma liquidez que a su vez se reinvierte en el apartado de Renta Variable (Fibras y ETFs expuestos), maximizando un auténtico efecto multiplicador y cerrando el círculo.`
    },
    {
      title: "Consejos Financieros Detallados",
      description: `**1. Re-ingeniería de Costos Recurrentes (Suscripciones y Fugaces)**\nHemos detectado que las categorías de 'Misc' y 'Entretenimiento' han mostrado anomalías consistentes (picos irregulares) frente al ratio de ingresos. El protocolo para el próximo mes natural implica una depuración quirúrgica: someter a revisión todos los cargos recurrentes domiciliados bajo plataformas de contenido bajo demanda y licencias de software (lo que comúnmente llamamos gasto vampiro o gasto hormiga domiciliado). Estas micro-fugas, acumuladas a lo largo de un período anual de 365 días, pueden truncar meses enteros de interés compuesto de CETES. Se sugiere recortar un 10% a un 15% de dicha categoría.\n\n**2. Consolidación de Estrategia Bancaria y Puntos de Lealtad**\nEvita usar tarjetas de débito para transacciones digitales. El protocolo financiero moderno exige usar una TDC con un ratio bajo de utilización (no pasar del 30% del límite extendido) pagada como "Totalero" cada mes. Esta simple maniobra mecánica no solo provee seguros antifraude con fondos que aún son responsabilidad jurídica del banco emisor, sino que te bonifica (Cashback de 1% a 2%) anualmente sobre el gasto que ya tenías presupuestado en la regla 50/30/20. Todo el cashback se mueve unilateralmente, mes tras mes, hacia la cuenta de Inversiones.\n\n**3. Gestión de la Inflación Personal y Estilo de Vida Compartido**\nTu verdadero enemigo a mediano plazo se etiqueta como "Inflación del Estilo de Vida" (Lifestyle Creep). Si consigues un segundo ingreso lateral, aumentos salariales o bonos excepcionales, debes congelar el nivel de gastos nominales actuales. Se indica bloquear mecánicamente al instante el 80% del valor excedente recibido de dicho bono y transmutarlo directo a la fase 2 de tu fondo (ETFs Indexados o Fibras operativas), autorizando cederte apenas un 20% para gratificaciones hedonísticas inmediatas. Esto asegura escalar patrimonialmente más rápido pero sintiendo la dopamina a corto plazo, equilibrando la salud de tus finanzas psicotécnicas.`
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
