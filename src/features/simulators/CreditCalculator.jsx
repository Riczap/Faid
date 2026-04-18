import React, { useState } from 'react';
import Input from '../../template/components/form/input/InputField';
import Label from '../../template/components/form/Label';
import Select from '../../template/components/form/Select';
import Button from '../../template/components/ui/button/Button';
import {
  DollarLineIcon,
  AlertIcon,
  PieChartIcon,
  BoltIcon,
  InfoIcon
} from '../../template/icons';
import Badge from '../../template/components/ui/badge/Badge';
import { useFinancial } from '../../context/FinancialContext';
import { useAuth } from '../../context/AuthContext';
import { insertSimulation } from '../../services/db.service';
import { analyzeDebtRisk } from '../../services/ai.service';
import { useEffect } from 'react';



const DEBT_CATEGORIES = [
  { value: 'personal', label: 'Préstamo Personal' },
  { value: 'auto', label: 'Crédito Automotriz' },
  { value: 'mortgage', label: 'Crédito Hipotecario' },
  { value: 'credit_card', label: 'Tarjeta de Crédito' },
  { value: 'education', label: 'Educación' },
  { value: 'medical', label: 'Gastos Médicos de Emergencia' },
];

const CreditCalculator = () => {
  const { user } = useAuth();
  const { formatCurrency, currency, financialProfile } = useFinancial();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    interestRate: '',
    term: ''
  });

  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState(null);
  
  // Derivados dinámicos
  const netIncome = financialProfile?.income || 0;
  const currentDebt = financialProfile?.total_debts || 0;
  
  // AI State
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  // Eliminado el useEffect ya que se usará financialProfile directamente

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const calculateImpact = async () => {
    if (!user) return;
    setLoading(true);
    setSimulation(null);

    try {
      const p = parseFloat(formData.amount);
      const annualRate = parseFloat(formData.interestRate);
      const months = parseInt(formData.term);

      if (!isNaN(p) && !isNaN(annualRate) && !isNaN(months) && months > 0) {
        // PMT Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
        const r = annualRate / 100 / 12; // monthly interest rate
        let monthlyPayment = 0;
        let totalPayment = 0;

        if (r === 0) {
          monthlyPayment = p / months;
          totalPayment = p;
        } else {
          monthlyPayment = (p * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
          totalPayment = monthlyPayment * months;
        }

        const totalInterest = totalPayment - p;
        const newTotalDebt = currentDebt + p;
        
        const maxSafeCapacity = netIncome * 0.35;
        const availableSpace = maxSafeCapacity - currentDebt;
        const isDangerous = monthlyPayment > availableSpace;

        const simResult = {
          netIncome,
          currentDebt,
          amount: p,
          interestRate: annualRate,
          termMonths: months,
          monthlyPayment,
          totalInterest,
          totalPayment,
          newTotalDebt,
          maxSafeCapacity,
          availableSpace,
          isDangerous
        };
        
        setSimulation(simResult);

        // Save to DB
        await insertSimulation(user.id, {
          amount: p,
          category: formData.category,
          interest_rate: annualRate,
          term_months: months,
          monthly_payment: monthlyPayment,
          total_interest: totalInterest,
          total_payment: totalPayment,
          is_dangerous: isDangerous
        });

        // Trigger AI analysis if dangerous
        if (isDangerous) {
          setLoadingSuggestion(true);
          setAiSuggestion(null);
          // Fire asynchronously without blocking the render
          analyzeDebtRisk(simResult).then((suggestion) => {
            setAiSuggestion(suggestion);
            setLoadingSuggestion(false);
          }).catch(() => {
            setLoadingSuggestion(false);
          });
        } else {
          setAiSuggestion(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-2 text-sm text-gray-700 dark:text-gray-300">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  const isFormValid = formData.amount && formData.category && formData.interestRate && formData.term;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Simulador de Deuda</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Calcula el costo real de tu nueva deuda y evalúa su impacto en tus objetivos.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Formulario de Análisis */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-900/20">
              <BoltIcon className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Ingresa los detalles
            </h2>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>Ingresos netos mensuales ({currency})</Label>
                <div className="relative">
                  <Input
                    type="text"
                    name="netIncome"
                    value={formatCurrency(netIncome)}
                    readOnly
                    disabled
                    className="bg-gray-50 text-gray-500 cursor-not-allowed dark:bg-gray-800/50"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </div>
                </div>
              </div>
              <div>
                <Label>Deuda actual mensual ({currency})</Label>
                <div className="relative">
                  <Input
                    type="text"
                    name="currentDebt"
                    value={formatCurrency(currentDebt)}
                    readOnly
                    disabled
                    className="bg-gray-50 text-gray-500 cursor-not-allowed dark:bg-gray-800/50"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label>Monto a solicitar ({currency})</Label>
              <Input
                type="number"
                name="amount"
                placeholder="Ej. 50000"
                value={formData.amount}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            
            <div>
              <Label>Categoría de deuda</Label>
              <Select
                options={DEBT_CATEGORIES}
                placeholder="Selecciona el tipo de crédito"
                onChange={handleSelectChange}
                defaultValue={formData.category}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>Tasa de interés anual (%)</Label>
                <Input
                  type="number"
                  name="interestRate"
                  placeholder="Ej. 12.5"
                  value={formData.interestRate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <Label>Plazo (meses)</Label>
                <Input
                  type="number"
                  name="term"
                  placeholder="Ej. 24"
                  value={formData.term}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
            </div>

            <Button
              className="w-full mt-4"
              onClick={calculateImpact}
              disabled={!isFormValid || loading}
              startIcon={loading ? <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <PieChartIcon className="w-5 h-5 text-white" />}
            >
              {loading ? 'Calculando...' : 'Calcular Impacto'}
            </Button>
          </div>
        </div>

        {/* Visualización de Impacto */}
        <div className="flex flex-col gap-6">
          {simulation ? (
             <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
               <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                 Proyección Real de tu Deuda
               </h2>
               
               <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50 relative group">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Capacidad Segura (35%)</p>
                      <InfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(simulation.maxSafeCapacity)}
                    </p>
                    
                    {/* Tooltip */}
                    <div className="absolute top-10 left-0 w-72 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-theme-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 text-xs text-gray-600 dark:text-gray-300 pointer-events-none">
                      <p className="mb-2">La capacidad de endeudamiento saludable se sitúa generalmente entre el 30% y el 40% de los ingresos netos mensuales, siendo el 35% la cifra recomendada por expertos para mantener la estabilidad financiera. Este límite garantiza margen para gastos fijos y deudas totales (hipoteca, tarjetas, préstamos) sin riesgo de sobre endeudamiento.</p>
                      <ul className="space-y-1">
                        <li><strong className="text-gray-800 dark:text-gray-100">Regla general:</strong> No destinar más del 35% de ingresos mensuales netos al pago de deudas.</li>
                        <li><strong className="text-gray-800 dark:text-gray-100">Recomendación:</strong> Se sugiere que el 60-65% restante cubra gastos fijos (comida, vivienda) y ahorro.</li>
                        <li><strong className="text-gray-800 dark:text-gray-100">Riesgo:</strong> Superar el 40% suele considerarse sobre endeudamiento peligroso.</li>
                      </ul>
                    </div>
                 </div>
                 <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Espacio Disponible</p>
                    <p className={`text-2xl font-bold ${simulation.availableSpace < 0 ? 'text-error-500' : 'text-success-500'}`}>
                      {formatCurrency(simulation.availableSpace)}
                    </p>
                 </div>
                 <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pago Mensual Estimado</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(simulation.monthlyPayment, { decimals: 2 })}
                    </p>
                 </div>
                 <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Intereses a Pagar</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(simulation.totalInterest, { decimals: 2 })}
                    </p>
                 </div>
               </div>

               <div className={`rounded-xl border p-4 flex gap-4 ${simulation.isDangerous ? 'border-error-200 bg-error-50 dark:border-error-900/30 dark:bg-error-900/10' : 'border-success-200 bg-success-50 dark:border-success-900/30 dark:bg-success-900/10'}`}>
                 <div className={`mt-1 flex-shrink-0 ${simulation.isDangerous ? 'text-error-500' : 'text-success-500'}`}>
                   {simulation.isDangerous ? <AlertIcon className="w-6 h-6" /> : <DollarLineIcon className="w-6 h-6" />}
                 </div>
                 <div className="flex-1">
                   <div className="flex items-center justify-between mb-1">
                     <h3 className={`font-medium ${simulation.isDangerous ? 'text-error-800 dark:text-error-400' : 'text-success-800 dark:text-success-400'}`}>
                       Impacto Financiero
                     </h3>
                     <Badge color={simulation.isDangerous ? "error" : "success"} variant="light">
                       {simulation.isDangerous ? "Excede Límite Seguro" : "Dentro del Límite"}
                     </Badge>
                   </div>
                   <p className={`mt-1 text-sm ${simulation.isDangerous ? 'text-error-600 dark:text-error-300' : 'text-success-600 dark:text-success-300'}`}>
                     {simulation.isDangerous 
                        ? `¡Cuidado! Este pago mensual supera tu espacio disponible seguro por ${formatCurrency(simulation.monthlyPayment - simulation.availableSpace, { decimals: 2 })}.` 
                        : `Este pago mensual es manejable. Tu endeudamiento total se mantendrá en un nivel saludable (por debajo del 35% de tus ingresos).`}
                   </p>
                 </div>
               </div>

               {/* AI Suggestion Box */}
               {simulation.isDangerous && (
                 <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50/50 p-5 dark:border-brand-900/30 dark:bg-brand-900/10 transition-all duration-500">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                       </svg>
                     </div>
                     <h3 className="font-semibold text-gray-900 dark:text-white">
                       Análisis del Asesor
                     </h3>
                   </div>
                   
                   {loadingSuggestion ? (
                     <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 py-2">
                       <svg className="animate-spin h-5 w-5 text-brand-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       <span className="text-sm animate-pulse">Generando alternativas financieras seguras...</span>
                     </div>
                   ) : (
                     <div className="prose-sm dark:prose-invert">
                       {renderMarkdown(aiSuggestion)}
                     </div>
                   )}
                 </div>
               )}
             </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-transparent p-5 dark:border-gray-700 h-full flex flex-col items-center justify-center text-center opacity-70">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                <AlertIcon className="w-6 h-6" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Completa el formulario y presiona "Calcular Impacto" para visualizar cómo esta deuda afectará tus finanzas y objetivos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditCalculator;
