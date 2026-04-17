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
import Badge from '../../template/components/ui/badge/Badge';
import { useFinancial } from '../../context/FinancialContext';
import { useAuth } from '../../context/AuthContext';
import { insertSimulation } from '../../services/db.service';



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
  const { formatCurrency, currency } = useFinancial();
  const [formData, setFormData] = useState({
    netIncome: '',
    currentDebt: '',
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

  const calculateImpact = async () => {
    if (!user) return;
    setLoading(true);
    setSimulation(null);

    try {
      const p = parseFloat(formData.amount);
      const annualRate = parseFloat(formData.interestRate);
      const months = parseInt(formData.term);
      const netIncome = parseFloat(formData.netIncome);
      const currentDebt = parseFloat(formData.currentDebt);

      if (!isNaN(p) && !isNaN(annualRate) && !isNaN(months) && months > 0 && !isNaN(netIncome) && !isNaN(currentDebt)) {
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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.netIncome && formData.currentDebt && formData.amount && formData.category && formData.interestRate && formData.term;

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
                <Input
                  type="number"
                  name="netIncome"
                  placeholder="Ej. 25000"
                  value={formData.netIncome}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div>
                <Label>Deuda actual mensual ({currency})</Label>
                <Input
                  type="number"
                  name="currentDebt"
                  placeholder="Ej. 3000"
                  value={formData.currentDebt}
                  onChange={handleInputChange}
                  min="0"
                />
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
                 <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Capacidad Segura (35%)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(simulation.maxSafeCapacity)}
                    </p>
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
                        ? `¡Cuidado! Este pago mensual supera tu espacio disponible seguro por ${formatCurrency(simulation.monthlyPayment - simulation.availableSpace, { decimals: 2 })}. Considera un monto menor o un plazo más largo para no poner en riesgo tus finanzas.` 
                        : `Este pago mensual es manejable. Tu endeudamiento total se mantendrá en un nivel saludable (por debajo del 35% de tus ingresos).`}
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
