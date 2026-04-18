import { useState, useEffect } from 'react';
import PageBreadcrumb from '../../template/components/common/PageBreadCrumb';
import ComponentCard from '../../template/components/common/ComponentCard';
import Label from '../../template/components/form/Label';
import Input from '../../template/components/form/input/InputField';
import Button from '../../template/components/ui/button/Button';
import Badge from '../../template/components/ui/badge/Badge';
import { useFinancial } from '../../context/FinancialContext';
import { useAuth } from '../../context/AuthContext';
import { upsertProfile, invalidateProfileContext } from '../../services/db.service';

export default function UserProfile() {
  const { formatCurrency, currency, financialProfile, fetchFinancialData } = useFinancial();
  const { user } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Local form state — seed from DB profile on mount
  const [formData, setFormData] = useState<Record<string, number | string>>({
    income: 0,
    fixedExpenses: 0,
    totalDebts: 0,
    monthlyDebtPayment: 0,
    netWorth: 0,
  });

  // Hydrate form from DB profile whenever it loads/changes
  useEffect(() => {
    if (financialProfile) {
      setFormData({
        income: financialProfile.income ?? 0,
        fixedExpenses: financialProfile.fixed_expenses ?? 0,
        totalDebts: financialProfile.total_debts ?? 0,
        monthlyDebtPayment: financialProfile.monthly_contribution ?? 0,
        netWorth: financialProfile.net_worth ?? 0,
      });
    }
  }, [financialProfile]);

  // Fetch global data on mount (if not already loaded)
  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: raw === '' ? '' : Number(raw) }));
    setShowSuccess(false);
    setSaveError('');
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setShowSuccess(false);
    setSaveError('');
    try {
      await upsertProfile(user.id, {
        income: Number(formData.income) || 0,
        fixed_expenses: Number(formData.fixedExpenses) || 0,
        total_debts: Number(formData.totalDebts) || 0,
        monthly_contribution: Number(formData.monthlyDebtPayment) || 0,
        net_worth: Number(formData.netWorth) || 0,
      });
      // Invalidate AI context so next advisor chat rebuilds with new data
      await invalidateProfileContext(user.id);
      // Refresh global state
      await fetchFinancialData();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error('Profile save error:', err);
      setSaveError(err.message || 'Error al guardar el perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  // Computed values (coerce empty strings to 0 for math)
  const numIncome = Number(formData.income) || 0;
  const numFixed = Number(formData.fixedExpenses) || 0;
  const numDebtPay = Number(formData.monthlyDebtPayment) || 0;
  const numNetWorth = Number(formData.netWorth) || 0;
  const surplus = numIncome - numFixed - numDebtPay;
  const debtExceedsIncome = numDebtPay > numIncome && numIncome > 0;
  const savingsRate = numIncome > 0 ? ((surplus / numIncome) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Perfil Financiero" />

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-fadeIn">
          <div className="flex items-center gap-3 bg-success-500 text-white px-5 py-3 rounded-xl shadow-lg shadow-success-500/30">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-sm">¡Perfil actualizado correctamente!</span>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {saveError && (
        <div className="fixed top-6 right-6 z-50 animate-fadeIn">
          <div className="flex items-center gap-3 bg-error-500 text-white px-5 py-3 rounded-xl shadow-lg shadow-error-500/30">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="font-medium text-sm">{saveError}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column — Form Cards */}
        <div className="xl:col-span-2 space-y-6">

          {/* User Identity Card */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-500/25">
                {user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user?.email?.split('@')[0] || 'Usuario'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email || 'usuario@correo.com'}
                </p>
                <Badge color="primary" className="mt-1.5">Plan Gratuito</Badge>
              </div>
            </div>
          </div>

          {/* Income Section */}
          <ComponentCard title="Ingresos Mensuales" desc="Tu ingreso neto mensual después de impuestos.">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-success-50 dark:bg-success-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <Label htmlFor="income">Ingreso Neto Mensual ({currency})</Label>
                <Input
                  id="income"
                  type="number"
                  value={formData.income}
                  onChange={handleChange('income')}
                  placeholder="Ej. 35000"
                  hint={`Equivale a ${formatCurrency(formData.income, { showCode: true })}`}
                  success={formData.income > 0}
                />
              </div>
            </div>
          </ComponentCard>

          {/* Fixed Expenses Section */}
          <ComponentCard title="Estructura de Gastos" desc="Gastos fijos mensuales: renta, servicios, compromisos recurrentes.">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-warning-50 dark:bg-warning-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <div className="flex-1">
                <Label htmlFor="fixedExpenses">Gastos Fijos Mensuales ({currency})</Label>
                <Input
                  id="fixedExpenses"
                  type="number"
                  value={formData.fixedExpenses}
                  onChange={handleChange('fixedExpenses')}
                  placeholder="Ej. 12000"
                  hint={`Equivale a ${formatCurrency(formData.fixedExpenses, { showCode: true })}`}
                />
              </div>
            </div>
          </ComponentCard>

          {/* Debts Section */}
          <ComponentCard title="Pasivos (Deudas Actuales)" desc="Suma total de deudas pendientes y pago mensual comprometido.">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-error-50 dark:bg-error-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalDebts">Suma Total de Deudas ({currency})</Label>
                    <Input
                      id="totalDebts"
                      type="number"
                      value={formData.totalDebts}
                      onChange={handleChange('totalDebts')}
                      placeholder="Ej. 22000"
                      error={debtExceedsIncome}
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyDebt">Pago Mensual por Deuda ({currency})</Label>
                    <Input
                      id="monthlyDebt"
                      type="number"
                      value={formData.monthlyDebtPayment}
                      onChange={handleChange('monthlyDebtPayment')}
                      placeholder="Ej. 4500"
                      error={debtExceedsIncome}
                      hint={debtExceedsIncome ? '⚠️ Tu pago de deuda excede tus ingresos.' : undefined}
                    />
                  </div>
                </div>
              </div>
              {debtExceedsIncome && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20">
                  <svg className="w-5 h-5 text-error-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p className="text-sm text-error-600 dark:text-error-400 font-medium">
                    Alerta: Tu pago mensual por deuda supera tus ingresos. Revisa tus cifras para generar un plan realista.
                  </p>
                </div>
              )}
            </div>
          </ComponentCard>

          {/* Net Worth Section */}
          <ComponentCard title="Patrimonio Neto" desc="Valor total de tus activos: efectivo, inversiones, propiedades.">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
              </div>
              <div className="flex-1">
                <Label htmlFor="netWorth">Valor Total de Activos ({currency})</Label>
                <Input
                  id="netWorth"
                  type="number"
                  value={formData.netWorth}
                  onChange={handleChange('netWorth')}
                  placeholder="Ej. 150000"
                  hint={`Equivale a ${formatCurrency(formData.netWorth, { showCode: true })}`}
                  success={formData.netWorth > 0}
                />
              </div>
            </div>
          </ComponentCard>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              startIcon={
                isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>

        {/* Right Column — Summary Cards */}
        <div className="xl:col-span-1 space-y-6">

          {/* Financial Overview Card */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 space-y-5 sticky top-24">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Resumen Financiero
            </h3>

            {/* Stat Rows */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Ingresos</span>
                <span className="text-sm font-semibold text-success-500">{formatCurrency(numIncome)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Gastos Fijos</span>
                <span className="text-sm font-semibold text-warning-500">-{formatCurrency(numFixed)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Pago de Deuda</span>
                <span className="text-sm font-semibold text-error-500">-{formatCurrency(numDebtPay)}</span>
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Excedente Mensual</span>
                <span className={`text-base font-bold ${surplus >= 0 ? 'text-success-500' : 'text-error-500'}`}>
                  {formatCurrency(surplus)}
                </span>
              </div>
            </div>

            {/* Savings Rate */}
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tasa de Ahorro</span>
                <span className={`text-sm font-bold ${Number(savingsRate) >= 20 ? 'text-success-500' : Number(savingsRate) >= 10 ? 'text-warning-500' : 'text-error-500'}`}>
                  {savingsRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    Number(savingsRate) >= 20 ? 'bg-success-500' : Number(savingsRate) >= 10 ? 'bg-warning-500' : 'bg-error-500'
                  }`}
                  style={{ width: `${Math.min(Math.max(Number(savingsRate), 0), 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Number(savingsRate) >= 20
                  ? '🎉 Excelente. Estás ahorrando más del 20% de tus ingresos.'
                  : Number(savingsRate) >= 10
                  ? '👍 Buen inicio. La meta ideal es superar el 20%.'
                  : '⚠️ Tu tasa de ahorro es baja. Revisa tus gastos fijos.'}
              </p>
            </div>

            {/* Net Worth Badge */}
            <div className="rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 p-4">
              <p className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">Patrimonio Neto</p>
              <p className="text-2xl font-bold text-brand-700 dark:text-brand-300">
                {formatCurrency(numNetWorth)}
              </p>
              <p className="text-xs text-brand-500 dark:text-brand-400 mt-1">
                Efectivo, inversiones y propiedades
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
