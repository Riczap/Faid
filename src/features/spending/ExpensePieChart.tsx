import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface ExpensePieChartProps {
  data: number[];
  labels: string[];
  formatCurrency: (amount: number) => string;
  activeCategory?: string | null;
  onCategoryClick?: (categoryLabel: string) => void;
}

export default function ExpensePieChart({ data, labels, formatCurrency, activeCategory, onCategoryClick }: ExpensePieChartProps) {
  const options: ApexOptions = {
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f43f5e", "#64748b"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      events: {
        dataPointSelection: (event, chartContext, config) => {
          if (onCategoryClick) {
            const selectedLabel = labels[config.dataPointIndex];
            onCategoryClick(selectedLabel);
          }
        }
      }
    },
    states: {
      active: {
        filter: {
          type: 'none'
        }
      },
      hover: {
        filter: {
          type: 'none'
        }
      }
    },
    fill: {
      opacity: labels.map(label => activeCategory ? (label === activeCategory ? 1 : 0.25) : 1)
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

  const totalAmount = activeCategory 
    ? data[labels.findIndex(l => l === activeCategory)] || 0
    : data.reduce((sum, val) => sum + val, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
        Distribución por Categoría
      </h3>
      <div id="expensePieChart" className="flex justify-center transition-opacity duration-300">
        <Chart options={options} series={data} type="pie" width={380} />
      </div>
      
      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/[0.05] flex justify-between items-center">
        <span className="text-gray-600 dark:text-gray-400 font-medium">
          {activeCategory ? `Total ${activeCategory}` : "Total General"}
        </span>
        <span className="text-xl font-bold text-gray-800 dark:text-white/90">
          {formatCurrency(totalAmount)}
        </span>
      </div>
    </div>
  );
}
