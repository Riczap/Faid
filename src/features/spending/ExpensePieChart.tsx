import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface ExpensePieChartProps {
  data: number[];
  labels: string[];
  formatCurrency: (amount: number) => string;
}

export default function ExpensePieChart({ data, labels, formatCurrency }: ExpensePieChartProps) {
  const options: ApexOptions = {
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
    },
    labels: labels,
    legend: {
      position: "bottom",
      fontFamily: "Outfit",
    },
    dataLabels: {
      enabled: true,
    },
    stroke: {
      show: true,
      colors: ["transparent"],
    },
    tooltip: {
      y: {
        formatter: (val: number) => formatCurrency(val),
      },
    },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] h-full">
      <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
        Distribución por Categoría
      </h3>
      <div id="expensePieChart" className="flex justify-center">
        <Chart options={options} series={data} type="pie" width={380} />
      </div>
    </div>
  );
}
