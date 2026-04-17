import { Link } from 'react-router';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useFinancial } from '../../context/FinancialContext';
import Badge from '../../template/components/ui/badge/Badge';
import PageMeta from '../../template/components/common/PageMeta';
import {
  DollarLineIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalenderIcon,
  BoltIcon,
  BoxIconLine,
  PieChartIcon,
} from '../../template/icons';

// ==========================================
// MOCK DATA — FASE 1 (Zero-Cost Mandate)
// ==========================================

const MOCK_KPI = {
  balance: 24500,
  monthlySpend: 8320,
  nextPayment: { name: 'CFE (Luz)', amount: 400, daysUntil: 3 },
  creditCapacity: 5833,  // 35% de ingresos ficticios de $16,666
};

const MOCK_WEEKLY_SPENDING = [
  { day: 'Lun', amount: 1200 },
  { day: 'Mar', amount: 850 },
  { day: 'Mié', amount: 2100 },
  { day: 'Jue', amount: 430 },
  { day: 'Vie', amount: 1900 },
  { day: 'Sáb', amount: 1340 },
  { day: 'Dom', amount: 500 },
];

const MOCK_CATEGORY_BREAKDOWN = [
  { name: 'Vivienda', amount: 12000, pct: 47, color: 'bg-brand-500' },
  { name: 'Alimentos', amount: 4000, pct: 25, color: 'bg-success-500' },
  { name: 'Transporte', amount: 1800, pct: 12, color: 'bg-warning-500' },
  { name: 'Entretenimiento', amount: 1200, pct: 8, color: 'bg-error-500' },
  { name: 'Otros', amount: 1320, pct: 8, color: 'bg-gray-400' },
];

const MOCK_RECENT_EXPENSES = [
  { concept: 'Renta Departamento', category: 'Vivienda', amount: 12000, date: 'Hoy' },
  { concept: 'Despensa Semanal', category: 'Alimentos', amount: 1850, date: 'Ayer' },
  { concept: 'Gasolina', category: 'Transporte', amount: 980, date: 'Hace 2 días' },
  { concept: 'Netflix + Spotify', category: 'Entretenimiento', amount: 340, date: 'Hace 3 días' },
  { concept: 'Farmacia', category: 'Salud', amount: 420, date: 'Hace 4 días' },
];

export default function HomeDashboard() {
  const { formatCurrency, currency } = useFinancial();

  // Area chart config
  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'area',
      height: 200,
      toolbar: { show: false },
      sparkline: { enabled: false },
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
    chart: { fontFamily: 'Outfit, sans-serif', type: 'donut' },
    colors: ['#465FFF', '#22C55E', '#F59E0B', '#EF4444', '#9CA3AF'],
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
          Panel de Control
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
                <Badge color="light">Activo</Badge>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Tu Plan Financiero
              </h3>
              <p className="text-white/80 text-sm leading-relaxed mb-2">
                Fase 1: Liquidando Tarjeta de Crédito A
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

        {/* Category Breakdown (Donut) */}
        <div className="col-span-12 xl:col-span-5">
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
                        <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></span>
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

        {/* Quick Actions */}
        <div className="col-span-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/spending"
              className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-800"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10 group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20 transition-colors">
                <PieChartIcon className="text-brand-500 size-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Registrar Gasto
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Agregar un nuevo movimiento
                </p>
              </div>
            </Link>

            <Link
              to="/simulator"
              className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-800"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-50 dark:bg-success-500/10 group-hover:bg-success-100 dark:group-hover:bg-success-500/20 transition-colors">
                <BoltIcon className="text-success-500 size-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Simular Crédito
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Calcula tu capacidad de pago
                </p>
              </div>
            </Link>

            <Link
              to="/calendar"
              className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-800"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-50 dark:bg-warning-500/10 group-hover:bg-warning-100 dark:group-hover:bg-warning-500/20 transition-colors">
                <CalenderIcon className="text-warning-500 size-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Ver Calendario
                </h4>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Próximos pagos y suscripciones
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
