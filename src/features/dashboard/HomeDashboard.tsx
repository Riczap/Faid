import { Link } from 'react-router';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useFinancial } from '../../context/FinancialContext';
import Badge from '../../template/components/ui/badge/Badge';
import PageMeta from '../../template/components/common/PageMeta';
import { useTheme } from '../../template/context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useMemo } from 'react';
import { CATEGORY_LABELS_ES, CATEGORY_COLORS } from '../../config/constants';
import {
  DollarLineIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalenderIcon,
  BoltIcon,
  BoxIconLine,
  PieChartIcon,
} from '../../template/icons';

export default function HomeDashboard() {
  const { user } = useAuth();
  const { formatCurrency, currency, expenses, recurringCharges, financialProfile, latestStrategy, paidEvents, setPaidEvents } = useFinancial();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const MOCK_KPI = useMemo(() => {
    const monthlySpend = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    
    const activeCharges = recurringCharges || [];
    let nextPayment = { name: 'Ninguno', amount: 0, daysUntil: 0 };
    if (activeCharges.length > 0) {
      const today = new Date().getDate();
      const upcoming = activeCharges.filter(c => c.billing_day >= today).sort((a,b) => a.billing_day - b.billing_day);
      const nextCharge = upcoming.length > 0 ? upcoming[0] : activeCharges.sort((a,b) => a.billing_day - b.billing_day)[0];
      let days = nextCharge.billing_day - today;
      if (days < 0) days += 30; // Approx next month
      nextPayment = { name: nextCharge.name, amount: Number(nextCharge.amount), daysUntil: days };
    }

    const income = financialProfile?.income || 0;
    const debts = financialProfile?.total_debts || 0;
    const creditCapacity = Math.max(0, (income * 0.35) - (debts / 12)); 
    const balance = income - monthlySpend;

    return { balance, monthlySpend, nextPayment, creditCapacity };
  }, [expenses, recurringCharges, financialProfile]);

  const upcomingPayments = useMemo(() => {
    const activeCharges = recurringCharges || [];
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();
    
    const formatKey = (id: string, y: number, m: number) => `${id}_${y}-${String(m).padStart(2, '0')}`;

    // Map all charges to the current month to sync perfectly with the calendar state
    const currentMonthEvents = [];
    
    activeCharges.forEach(c => {
      if (c.created_at) {
        const createdDate = new Date(c.created_at);
        const createdYear = createdDate.getFullYear();
        const createdMonth = createdDate.getMonth() + 1;
        const createdDay = createdDate.getDate();
        
        if (currentYear < createdYear || (currentYear === createdYear && currentMonth < createdMonth)) {
          return;
        }
        if (currentYear === createdYear && currentMonth === createdMonth && c.billing_day < createdDay) {
          return;
        }
      }

      currentMonthEvents.push({
        ...c,
        eventDate: new Date(currentYear, currentMonth - 1, c.billing_day),
        eventKey: formatKey(c.id, currentYear, currentMonth)
      });
    });
    
    currentMonthEvents.sort((a, b) => a.billing_day - b.billing_day);
    
    // Show upcoming payments first, then wrap around to past payments of the current month
    const upcoming = currentMonthEvents.filter(c => c.billing_day >= currentDay);
    const past = currentMonthEvents.filter(c => c.billing_day < currentDay);
    
    return [...upcoming, ...past].slice(0, 5);
  }, [recurringCharges]);

  const MOCK_RECENT_EXPENSES = useMemo(() => {
    return (expenses || []).slice(0, 5).map(e => ({
      concept: e.concept,
      category: e.category,
      amount: Number(e.amount),
      date: new Date(e.created_at).toLocaleDateString('es-MX')
    }));
  }, [expenses]);

  const MOCK_CATEGORY_BREAKDOWN = useMemo(() => {
    const totals = (expenses || []).reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {});
    const total = Object.values(totals).reduce((a: any, b: any) => a+b, 0) || 1;
    
    return Object.entries(totals).map(([rawKey, amount]: [string, any]) => ({
      name: CATEGORY_LABELS_ES[rawKey] || rawKey,
      rawKey,
      amount,
      pct: Math.round((amount / total) * 100),
      hexColor: CATEGORY_COLORS[rawKey] || CATEGORY_COLORS.Misc,
    })).sort((a,b) => b.amount - a.amount);
  }, [expenses]);

  const MOCK_WEEKLY_SPENDING = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const sums: Record<string, number> = { 'Dom':0, 'Lun':0, 'Mar':0, 'Mié':0, 'Jue':0, 'Vie':0, 'Sáb':0 };
    (expenses || []).forEach(e => {
        const d = new Date(e.created_at);
        const diff = (new Date().getTime() - d.getTime()) / (1000 * 3600 * 24);
        if (diff <= 7) {
            sums[days[d.getDay()]] += Number(e.amount);
        }
    });
    return [
      { day: 'Lun', amount: sums['Lun'] },
      { day: 'Mar', amount: sums['Mar'] },
      { day: 'Mié', amount: sums['Mié'] },
      { day: 'Jue', amount: sums['Jue'] },
      { day: 'Vie', amount: sums['Vie'] },
      { day: 'Sáb', amount: sums['Sáb'] },
      { day: 'Dom', amount: sums['Dom'] }
    ];
  }, [expenses]);

  // Area chart config
  const chartOptions: ApexOptions = {
    theme: { mode: isDark ? 'dark' : 'light' },
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'area',
      height: 200,
      toolbar: { show: false },
      sparkline: { enabled: false },
      background: 'transparent',
    },
    colors: ['#465FFF'],
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    dataLabels: { enabled: false },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      borderColor: '#f3f4f6',
    },
    xaxis: {
      categories: MOCK_WEEKLY_SPENDING.map(d => d.day),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: '#6B7280', fontSize: '12px' },
      },
    },
    yaxis: {
      labels: {
        style: { colors: ['#6B7280'], fontSize: '12px' },
        formatter: (val: number) => formatCurrency(val),
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => formatCurrency(val),
      },
    },
  };

  const chartSeries = [
    {
      name: 'Gastos',
      data: MOCK_WEEKLY_SPENDING.map(d => d.amount),
    },
  ];

  // Pie chart config (mini)
  const pieOptions: ApexOptions = {
    theme: { mode: isDark ? 'dark' : 'light' },
    chart: { fontFamily: 'Outfit, sans-serif', type: 'donut', background: 'transparent' },
    colors: MOCK_CATEGORY_BREAKDOWN.map(c => c.hexColor),
    labels: MOCK_CATEGORY_BREAKDOWN.map(c => c.name),
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              formatter: () => formatCurrency(MOCK_KPI.monthlySpend),
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => formatCurrency(val),
      },
    },
  };

  const pieSeries = MOCK_CATEGORY_BREAKDOWN.map(c => c.amount);

  return (
    <>
      <PageMeta
        title="Panel de Control | Faid"
        description="Centro de control financiero — resumen de gastos, pagos y estrategia."
      />

      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Hola, {financialProfile?.first_name || user?.user_metadata?.fname || user?.email?.split('@')[0] || 'Usuario'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Resumen de tu situación financiera actual
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6 mb-6">
        {/* Patrimonio Total */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-brand-50 rounded-xl dark:bg-brand-500/10">
            <DollarLineIcon className="text-brand-500 size-6" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Patrimonio Total
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatCurrency(MOCK_KPI.balance, { decimals: 2 })}
              </h4>
            </div>
            <Badge color="success">
              <ArrowUpIcon />
              4.2%
            </Badge>
          </div>
        </div>

        {/* Gastos del Mes */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-error-50 rounded-xl dark:bg-error-500/10">
            <BoxIconLine className="text-error-500 size-6" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Gastos del Mes
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatCurrency(MOCK_KPI.monthlySpend, { decimals: 2 })}
              </h4>
            </div>
            <Badge color="error">
              <ArrowDownIcon />
              12.3%
            </Badge>
          </div>
        </div>

        {/* Próximo Pago */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-warning-50 rounded-xl dark:bg-warning-500/10">
            <CalenderIcon className="text-warning-500 size-6" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Próximo Pago
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatCurrency(MOCK_KPI.nextPayment.amount)}
              </h4>
            </div>
            <Badge color="warning">
              {MOCK_KPI.nextPayment.daysUntil} días
            </Badge>
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {MOCK_KPI.nextPayment.name}
          </p>
        </div>

        {/* Capacidad de Crédito */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-success-50 rounded-xl dark:bg-success-500/10">
            <BoltIcon className="text-success-500 size-6" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Capacidad de Crédito
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatCurrency(MOCK_KPI.creditCapacity)}
              </h4>
            </div>
            <Badge color="success">Regla 35%</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Weekly Spending Chart */}
        <div className="col-span-12 xl:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                  Actividad de Gastos
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Últimos 7 días
                </p>
              </div>
              <Link
                to="/spending"
                className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
              >
                Ver detalle →
              </Link>
            </div>
            <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-4">
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height={200}
              />
            </div>
          </div>
        </div>

        {/* Strategy CTA Banner */}
        <div className="col-span-12 xl:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-brand-500 to-brand-700 p-6 h-full flex flex-col justify-between dark:border-gray-800">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <BoltIcon className="text-white size-5" />
                </div>
                <Badge color="light">{latestStrategy ? 'Activo' : 'Pendiente'}</Badge>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Tu Plan Financiero
              </h3>
              <p className="text-white/80 text-sm leading-relaxed mb-2">
                {latestStrategy 
                  ? `Prioridad: ${latestStrategy.debt_priority?.[0] || 'Construir fondo'}` 
                  : 'Fase 1: No tienes una estrategia generada'}
              </p>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-white/70 mb-1.5">
                  <span>Progreso</span>
                  <span>65%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: '65%' }}
                  ></div>
                </div>
              </div>
            </div>

            <Link
              to="/strategy"
              className="inline-flex items-center justify-center w-full rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-sm py-3 transition-colors"
            >
              Ver mi Plan de 3 Fases →
            </Link>
          </div>
        </div>

        {/* Left Column wrapper for Donut & Calendar */}
        <div className="col-span-12 xl:col-span-5 flex flex-col gap-4 md:gap-6">
          {/* Category Breakdown (Donut) */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                  Distribución de Gastos
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Por categoría este mes
                </p>
              </div>
              <Link
                to="/spending"
                className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
              >
                Ver todos →
              </Link>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0 w-[160px]">
                  <Chart
                    options={pieOptions}
                    series={pieSeries}
                    type="donut"
                    height={160}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  {MOCK_CATEGORY_BREAKDOWN.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.hexColor }}></span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{cat.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {cat.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Payments (Calendario) */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] flex-1 flex flex-col">
            <div className="px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                  Calendario
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Pagos del mes
                </p>
              </div>
              <Link
                to="/calendar"
                className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
              >
                Ver todos →
              </Link>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex-1 flex flex-col gap-2.5">
              {upcomingPayments.map((item, i) => {
                let lineColor = "bg-brand-500";
                if (item.type === "service") lineColor = "bg-warning-500";
                if (item.type === "expense") lineColor = "bg-error-500";
                
                const today = new Date();
                today.setHours(0,0,0,0);
                const isAutoPayPastDue = item.auto_pay && item.eventDate < today;
                const isPaid = !!paidEvents[item.eventKey] || isAutoPayPastDue;
                
                return (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (!item.auto_pay) {
                        setPaidEvents((prev: any) => ({ ...prev, [item.eventKey]: !prev[item.eventKey] }));
                      }
                    }}
                    className={`flex items-center w-full bg-gray-50 dark:bg-white/[0.05] rounded-lg px-3 py-2.5 border border-gray-100 dark:border-transparent transition-all ${item.auto_pay ? '' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.08]'} ${isPaid ? 'opacity-50 grayscale' : ''}`}
                  >
                    <div className={`w-1 h-5 rounded-full flex-shrink-0 ${lineColor}`}></div>
                    <div className={`flex-1 truncate text-sm font-medium ml-3 ${isPaid ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white/90'}`}>
                      {item.name}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {item.eventDate.getDate()} {item.eventDate.toLocaleString('es-MX', { month: 'short' }).replace('.', '')}
                      </span>
                      {!item.auto_pay && (
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${isPaid ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                          {isPaid && (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {upcomingPayments.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-500 text-center py-4">No hay pagos próximos.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="col-span-12 xl:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                  Movimientos Recientes
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Últimos gastos registrados
                </p>
              </div>
              <Link
                to="/spending"
                className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
              >
                Ver tabla →
              </Link>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {MOCK_RECENT_EXPENSES.map((expense, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                        <DollarLineIcon className="text-gray-500 dark:text-gray-400 size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {expense.concept}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {expense.category} · {expense.date}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-error-500">
                      -{formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
