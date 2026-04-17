import React, { useState } from 'react';
import Input from '../../template/components/form/input/InputField';
import Label from '../../template/components/form/Label';
import Select from '../../template/components/form/Select';
import Button from '../../template/components/ui/button/Button';
import {
  DollarLineIcon,
  AlertIcon,
  PieChartIcon,
  BoltIcon
} from '../../template/icons';

// ==========================================
// MOCK DATA - FASE 1 (Zero-Cost Mandate)
// ==========================================
const MOCK_CONTEXT = {
  current_debt_load: 15000,
  emergency_fund_progress: 0.40, 
  recommended_capacity: 5000 
};

const DEBT_CATEGORIES = [
  { value: 'personal', label: 'Préstamo Personal' },
  { value: 'auto', label: 'Crédito Automotriz' },
  { value: 'mortgage', label: 'Crédito Hipotecario' },
  { value: 'credit_card', label: 'Tarjeta de Crédito' },
];

const CreditCalculator = () => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    interestRate: '',
    term: ''
  });

  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const calculateImpact = () => {
    // Phase 1: Simulate network delay
    setLoading(true);
    setSimulation(null);

    setTimeout(() => {
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
        const newTotalDebt = MOCK_CONTEXT.current_debt_load + p;
        const isDangerous = monthlyPayment > MOCK_CONTEXT.recommended_capacity;

        setSimulation({
          monthlyPayment,
          totalInterest,
          totalPayment,
          newTotalDebt,
          isDangerous
        });
      }
      setLoading(false);
    }, 1200);
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
            <div>
              <Label>Monto a solicitar ($)</Label>
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
                 <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pago Mensual Estimado</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${simulation.monthlyPayment.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                 </div>
                 <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Intereses a Pagar</p>
                    <p className="text-2xl font-bold text-error-500">
                      ${simulation.totalInterest.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </p>
                 </div>
               </div>

               <div className={`rounded-xl border p-4 flex gap-4 ${simulation.isDangerous ? 'border-error-200 bg-error-50 dark:border-error-900/30 dark:bg-error-900/10' : 'border-success-200 bg-success-50 dark:border-success-900/30 dark:bg-success-900/10'}`}>
                 <div className={`mt-1 flex-shrink-0 ${simulation.isDangerous ? 'text-error-500' : 'text-success-500'}`}>
                   {simulation.isDangerous ? <AlertIcon className="w-6 h-6" /> : <DollarLineIcon className="w-6 h-6" />}
                 </div>
                 <div>
                   <h3 className={`font-medium ${simulation.isDangerous ? 'text-error-800 dark:text-error-400' : 'text-success-800 dark:text-success-400'}`}>
                     Impacto en: "Armar Tu Colchón"
                   </h3>
                   <p className={`mt-1 text-sm ${simulation.isDangerous ? 'text-error-600 dark:text-error-300' : 'text-success-600 dark:text-success-300'}`}>
                     {simulation.isDangerous 
                       ? `¡Cuidado! Este pago mensual supera tu capacidad de ahorro recomendada por $${(simulation.monthlyPayment - MOCK_CONTEXT.recommended_capacity).toLocaleString('en-US', {maximumFractionDigits: 2})}. Adquirir esta deuda detendrá por completo tu progreso actual de tu Fondo de Emergencia (${(MOCK_CONTEXT.emergency_fund_progress * 100).toFixed(0)}%).` 
                       : `Este pago mensual está dentro de tu capacidad de ahorro recomendada ($${MOCK_CONTEXT.recommended_capacity.toLocaleString()}). Aún así, retrasará el cumplimiento de tu meta del Fondo de Emergencia en proporción mensual.`}
                   </p>
                 </div>
               </div>
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
