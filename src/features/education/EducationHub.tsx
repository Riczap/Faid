import { useState } from 'react';
import PageBreadcrumb from '../../template/components/common/PageBreadCrumb';
import ComponentCard from '../../template/components/common/ComponentCard';
import Badge from '../../template/components/ui/badge/Badge';
import { useFinancial } from '../../context/FinancialContext';

// ==============================================
// EDUCATION HUB CONTENT (Hardcoded Phase 1)
// ==============================================

const TOPICS = [
  {
    id: 'inflacion',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: '¿Qué es la Inflación?',
    tag: 'Concepto Básico',
    tagColor: 'primary' as const,
    summary: 'Entiende por qué tu dinero pierde valor con el tiempo y cómo protegerte.',
    content: {
      intro: 'Es como si tu dinero perdiera fuerza. Si hoy un refresco cuesta $20 y el próximo año cuesta $22, ese aumento es la inflación. México tiene una meta de inflación del 3% anual, pero históricamente ha sido más alta.',
      points: [
        'La inflación reduce tu poder adquisitivo cada año que no inviertes.',
        'En México, Banco de México publica el índice INPC cada quincena.',
        'Si tu dinero no genera un rendimiento igual o mayor a la inflación, estás perdiendo.',
        'Instrumentos como UDIBONOS están diseñados para proteger contra inflación.',
      ],
      tip: 'Si dejas $100,000 MXN bajo el colchón durante 5 años con una inflación del 5% anual, al final solo tendrás un poder de compra equivalente a $78,353 MXN. ¡Perdiste más de $21,000 sin gastar un solo peso!',
      comparisonData: [
        { year: '2024', price: 20, label: 'Refresco' },
        { year: '2025', price: 21, label: 'Refresco' },
        { year: '2026', price: 22, label: 'Refresco' },
        { year: '2027', price: 23.10, label: 'Refresco' },
        { year: '2028', price: 24.25, label: 'Refresco' },
      ],
    },
  },
  {
    id: 'tarjetas',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: 'El Poder de las Tarjetas de Crédito',
    tag: 'Herramientas',
    tagColor: 'warning' as const,
    summary: 'No es dinero extra. Es una herramienta poderosa de historial crediticio.',
    content: {
      intro: 'Una tarjeta de crédito NO es una extensión de tu sueldo. Es un instrumento financiero que, bien utilizado, construye tu historial crediticio y te protege contra fraudes. Mal utilizado, es la trampa de deuda más común en México.',
      points: [
        'Ser "totalero" (pagar el 100% cada mes) te da crédito gratis y generas historial.',
        'Tu Score Crediticio (Buró de Crédito) sube cuando pagas puntualmente.',
        'Las tarjetas ofrecen protección contra fraude que el efectivo jamás dará.',
        'Pagar solo el mínimo es la forma más cara de financiarte: tasas del 30-60% anual.',
        'Regla de oro: si no puedes pagarlo en efectivo, no lo pongas en la tarjeta.',
      ],
      tip: 'Si tienes una deuda de $10,000 MXN en tu tarjeta con tasa del 40% anual y solo pagas el mínimo, tardarás más de 7 años en liquidarla y pagarás casi $18,000 MXN solo en intereses.',
    },
  },
  {
    id: 'ahorro',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    title: 'Cuentas de Ahorro vs. Inflación',
    tag: 'Inversión',
    tagColor: 'success' as const,
    summary: 'Dejar tu dinero quieto es perderlo. Aprende alternativas reales.',
    content: {
      intro: 'La mayoría de las cuentas de ahorro bancarias en México pagan entre 0.5% y 2% anual. Si la inflación es del 5%, tu dinero está perdiendo poder adquisitivo cada día que pasa. "Ahorrar" en una cuenta básica es lo mismo que perder dinero lentamente.',
      points: [
        'CETES Directo: Inversión gubernamental desde $100 MXN, segura y con rendimientos competitivos.',
        'SOFIPOS (como Supertasas, Kubo): Tasas más altas que bancos tradicionales, protegidas por PROSOFIPO.',
        'UDIBONOS: Bonos gubernamentales que ajustan su valor con la inflación automáticamente.',
        'Fondos de inversión de deuda: Diversifican tu riesgo con gestión profesional.',
        'Regla del 72: Divide 72 entre la tasa de interés para saber en cuántos años se duplica tu dinero.',
      ],
      tip: 'Si inviertes $1,000 MXN mensuales en CETES al 10% anual durante 10 años, acumularías aproximadamente $206,000 MXN. Si solo los ahorras bajo el colchón, tendrías $120,000 y valdrían menos por la inflación.',
    },
  },
];

const FAQ_ITEMS = [
  {
    q: '¿Qué es el Buró de Crédito y debo tenerle miedo?',
    a: 'No. El Buró de Crédito es simplemente un registro de tu historial financiero. Estar en Buró no es malo — todos los que han tenido un crédito están ahí. Lo que importa es tu calificación (score): pagar a tiempo sube tu score, y un buen score te abre puertas a mejores tasas de interés.',
  },
  {
    q: '¿Cuánto debería tener en mi fondo de emergencia?',
    a: 'La regla general es tener entre 3 y 6 meses de gastos fijos mensuales. Si ganas $15,000 y tus gastos fijos son $10,000, tu meta debería ser entre $30,000 y $60,000 MXN en una cuenta de fácil acceso (como CETES a 28 días).',
  },
  {
    q: '¿Qué es mejor: pagar deudas o empezar a invertir?',
    a: 'Depende de las tasas. Si tu deuda cobra 40% anual (tarjeta de crédito) y tu inversión genera 10% anual, matemáticamente conviene liquidar la deuda primero. La excepción: siempre ten un pequeño fondo de emergencia antes de atacar deudas agresivamente.',
  },
  {
    q: '¿Qué significa ser "totalero" con mi tarjeta?',
    a: 'Significa pagar el 100% de tu estado de cuenta cada mes antes de la fecha límite. Así nunca generas intereses, construyes historial crediticio positivo, y aprovechas beneficios como puntos o meses sin intereses. Es la forma más inteligente de usar tarjetas.',
  },
];

export default function EducationHub() {
  const { formatCurrency } = useFinancial();
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTopics = TOPICS.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Academia Financiera" />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-8 md:p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Aprende lo Básico 📚
          </h1>
          <p className="text-brand-100 text-lg max-w-2xl mb-6">
            Conceptos financieros explicados de forma sencilla. No necesitas ser experto para tomar el control de tu dinero.
          </p>
          {/* Decorative Search */}
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar un tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Topic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => {
          const isExpanded = expandedTopic === topic.id;
          return (
            <div
              key={topic.id}
              onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
              className={`group cursor-pointer rounded-2xl border bg-white dark:bg-white/[0.03] transition-all duration-300 overflow-hidden
                ${isExpanded
                  ? 'border-brand-300 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 md:col-span-3'
                  : 'border-gray-200 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-500/30 hover:shadow-md'
                }`}
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                    ${isExpanded
                      ? 'bg-brand-500 text-white'
                      : 'bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400 group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20'
                    }`}>
                    {topic.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge color={topic.tagColor}>{topic.tag}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {topic.summary}
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 mt-1 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-0 border-t border-gray-100 dark:border-gray-800 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                    {/* Left: Explanation */}
                    <div className="space-y-4">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {topic.content.intro}
                      </p>
                      <ul className="space-y-2.5">
                        {topic.content.points.map((point, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right: Tip + Visual */}
                    <div className="space-y-4">
                      {/* Pro Tip Card */}
                      <div className="rounded-xl bg-warning-50 dark:bg-warning-500/10 border border-warning-200 dark:border-warning-500/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">💡</span>
                          <span className="text-sm font-semibold text-warning-700 dark:text-warning-400">Tip Pro</span>
                        </div>
                        <p className="text-sm text-warning-800 dark:text-warning-300 leading-relaxed">
                          {topic.content.tip}
                        </p>
                      </div>

                      {/* Inflation Comparison Chart (only for inflacion topic) */}
                      {topic.content.comparisonData && (
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-4">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                            Ejemplo: Precio de un refresco con inflación del 5%
                          </p>
                          <div className="flex items-end gap-2 h-32">
                            {topic.content.comparisonData.map((d, i) => {
                              const maxPrice = topic.content.comparisonData![topic.content.comparisonData!.length - 1].price;
                              const heightPct = (d.price / (maxPrice * 1.2)) * 100;
                              return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                    {formatCurrency(d.price)}
                                  </span>
                                  <div
                                    className="w-full rounded-t-md bg-gradient-to-t from-brand-500 to-brand-400 transition-all duration-500"
                                    style={{ height: `${heightPct}%` }}
                                  ></div>
                                  <span className="text-[10px] text-gray-500">{d.year}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sabías Que Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 p-5">
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-400 mb-1">📊 ¿Sabías que...</p>
          <p className="text-sm text-brand-600 dark:text-brand-300">
            El 68% de los mexicanos no tiene un fondo de emergencia, según la ENIF 2024. Tener uno te coloca en la minoría financieramente preparada.
          </p>
        </div>
        <div className="rounded-xl bg-success-50 dark:bg-success-500/10 border border-success-100 dark:border-success-500/20 p-5">
          <p className="text-sm font-semibold text-success-700 dark:text-success-400 mb-1">🏦 ¿Sabías que...</p>
          <p className="text-sm text-success-600 dark:text-success-300">
            Puedes invertir en CETES desde {formatCurrency(100)} MXN a través de cetesdirecto.com sin comisiones. Es la inversión más segura de México porque está respaldada por el gobierno federal.
          </p>
        </div>
        <div className="rounded-xl bg-warning-50 dark:bg-warning-500/10 border border-warning-100 dark:border-warning-500/20 p-5">
          <p className="text-sm font-semibold text-warning-700 dark:text-warning-400 mb-1">💳 ¿Sabías que...</p>
          <p className="text-sm text-warning-600 dark:text-warning-300">
            Pagar tu tarjeta de crédito en su totalidad cada mes te convierte en un "totalero", lo que significa que usas crédito gratis y generas historial sin pagar un solo peso de interés.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <ComponentCard title="Preguntas Frecuentes" desc="Las dudas más comunes sobre finanzas personales en México.">
        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div
                key={index}
                className={`rounded-xl border transition-all duration-200 overflow-hidden
                  ${isOpen
                    ? 'border-brand-200 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-500/5'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className={`font-medium text-sm ${isOpen ? 'text-brand-600 dark:text-brand-400' : 'text-gray-800 dark:text-white/90'}`}>
                    {faq.q}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-3 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ComponentCard>
    </div>
  );
}
