import React, { useState } from 'react';
import FinancialInputsForm from './FinancialInputsForm';
import StrategyStepper from './StrategyStepper';
import PageBreadcrumb from '../../template/components/common/PageBreadCrumb';

const mockStrategyData = {
  debt_priority: ["Tarjeta de Crédito A (alto interés)", "Préstamo Personal"],
  emergency_target_mxn: 45000,
  inflation_protection_strategy: "CETES o Cuenta de Ahorro de Alto Rendimiento",
  allocation: {
    cetes: 50,
    udibonos: 20,
    liquidity: 30
  }
};

const StrategyDashboard = () => {
  const { user } = useAuth();
  const { latestStrategy, fetchFinancialData } = useFinancial();
  const [isLoading, setIsLoading] = useState(false);
  
  // Provide the global strategy if it already exists to the UI
  const planData = latestStrategy?.allocation ? latestStrategy : null;

  const handleGeneratePlan = async (formData) => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Profile UPSERT
      const profileData = {
        income: Number(formData.income) || 0,
        fixed_expenses: Number(formData.expenses) || 0,
        total_debts: Number(formData.debts) || 0,
        monthly_contribution: Number(formData.contribution) || 0,
        emergency_fund_progress: 0 // Will auto-calculate or reset later
      };
      await upsertProfile(user.id, profileData);

      // 2. Prompt Gemini natively
      const generatedPlan = await generateFinancialStrategy(profileData);
      
      if (generatedPlan) {
        // 3. Save to database
        await insertStrategy(user.id, {
          debt_priority: JSON.stringify(generatedPlan.debt_priority),
          emergency_target_mxn: generatedPlan.emergency_target_mxn,
          inflation_protection_strategy: generatedPlan.inflation_protection_strategy,
          allocation: JSON.stringify(generatedPlan.allocation),
          input_snapshot: JSON.stringify(profileData)
        });
        
        // 4. Force AI Context invalidation
        await invalidateProfileContext(user.id);
        
        // 5. Reload global data
        await fetchFinancialData();
      }
    } catch (err) {
       console.error("Strategy Gen Error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Optional: Only resets local view state if desired, but strategy persists in DB.
    // For now we do nothing since 'latestStrategy' comes from DB natively.
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Plan Financiero" />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <FinancialInputsForm onSubmit={handleGeneratePlan} isLoading={isLoading} />
        </div>
        
        <div className="xl:col-span-2">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Analizando perfil financiero...</p>
            </div>
          )}

          {!isLoading && !planData && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="w-16 h-16 bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">Descubre tu camino financiero</h3>
              <p className="text-gray-500 dark:text-gray-400">Ingresa tus datos a la izquierda para recibir un plan de acción estratégico en 3 fases adaptado a tu situación.</p>
            </div>
          )}

          {!isLoading && planData && (
            <div className="space-y-6">
               <StrategyStepper planData={planData} onReset={handleReset} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyDashboard;
