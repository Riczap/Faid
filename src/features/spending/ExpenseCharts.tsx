import { useState, useEffect } from "react";
import ExpenseTable from "./ExpenseTable";
import ExpensePieChart from "./ExpensePieChart";
import ExpenseInputForm from "./ExpenseInputForm";
import ExpensePdfUpload from "./ExpensePdfUpload";
import FinancialAdvisorQA from "../common/FinancialAdvisorQA";
import { Modal } from "../../template/components/ui/modal";
import { useFinancial } from "../../context/FinancialContext";
import Select from "../../template/components/form/Select";
import DatePicker from "../../template/components/form/date-picker";
import { EXPENSE_CATEGORIES } from "../../config/constants";

// Mock Data de la Fase 1 (No conectar a base de datos aún)
const MOCK_EXPENSES = [
  { id: "uuid-1", concept: "Renta", amount: 12000, category: "Housing", created_at: "2026-04-10T10:00:00Z", source: "manual" },
  { id: "uuid-2", concept: "Despensa", amount: 4000, category: "Food", created_at: "2026-04-12T10:00:00Z", source: "manual" },
  { id: "uuid-3", concept: "Uber", amount: 350, category: "Transport", created_at: "2026-04-14T10:00:00Z", source: "manual" },
];

const getCategorySpanishName = (cat: string) => {
  const map: Record<string, string> = {
    Housing: "Vivienda",
    Food: "Alimentos",
    Transport: "Transporte",
    Utilities: "Servicios",
    Entertainment: "Entretenimiento",
    Health: "Salud",
    Debt: "Deudas",
    Misc: "Otros"
  };
  return map[cat] || cat;
};

const CATEGORY_OPTIONS = [
  { value: "all", label: "Todas las Categorías" },
  ...EXPENSE_CATEGORIES.map(cat => ({
    value: cat,
    label: getCategorySpanishName(cat)
  }))
];

const MONTH_OPTIONS = [
  { value: "all", label: "Todos los Meses" },
  { value: "0", label: "Enero" },
  { value: "1", label: "Febrero" },
  { value: "2", label: "Marzo" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Mayo" },
  { value: "5", label: "Junio" },
  { value: "6", label: "Julio" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Septiembre" },
  { value: "9", label: "Octubre" },
  { value: "10", label: "Noviembre" },
  { value: "11", label: "Diciembre" }
];

const SOURCE_OPTIONS = [
  { value: "all", label: "Todos los Orígenes" },
  { value: "manual", label: "Manual" },
  { value: "auto", label: "Automático" }
];

export default function ExpenseCharts() {
  const { formatCurrency, currency } = useFinancial();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<typeof MOCK_EXPENSES>([]);
  const [editingExpense, setEditingExpense] = useState<typeof MOCK_EXPENSES[0] | null>(null);

  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [filterSource, setFilterSource] = useState("all");

  useEffect(() => {
    // Fase 1: Simulamos una petición a la red (latencia)
    const timer = setTimeout(() => {
      setExpenses(MOCK_EXPENSES);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleAddExpense = (newExpense: { id?: string; concept: string; amount: number; category: string; created_at: string; source?: "manual" | "auto" }) => {
    if (newExpense.id) {
      // Editar
      setExpenses(prev => prev.map(exp => exp.id === newExpense.id ? { ...exp, ...newExpense } as any : exp));
      setEditingExpense(null);
    } else {
      // Crear
      const expenseWithId = { ...newExpense, id: `manual-${Date.now()}`, source: newExpense.source || "manual" };
      setExpenses(prev => [expenseWithId, ...prev]);
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    let matches = true;
    if (filterCategory !== "all") {
      matches = matches && exp.category === filterCategory;
    }
    if (filterMonth !== "all") {
      const expMonth = new Date(exp.created_at).getMonth().toString();
      matches = matches && expMonth === filterMonth;
    }
    if (filterDate) {
      const expDate = new Date(exp.created_at).toISOString().split('T')[0];
      matches = matches && expDate === filterDate;
    }
    if (filterSource !== "all") {
      matches = matches && exp.source === filterSource;
    }
    return matches;
  });

  // Procesar los datos para el gráfico circular (sumar totales por categoría)
  const categoryTotals = filteredExpenses.reduce((acc, expense) => {
    const map: Record<string, string> = {
      Housing: "Vivienda",
      Food: "Alimentos",
      Transport: "Transporte",
      Utilities: "Servicios",
      Entertainment: "Entretenimiento",
      Health: "Salud",
      Debt: "Deudas",
      Misc: "Otros"
    };
    const categoryName = map[expense.category] || expense.category;
      
    acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieChartLabels = Object.keys(categoryTotals);
  const pieChartData = Object.values(categoryTotals);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-2">
          Seguimiento de Gastos
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Monitorea y categoriza tus gastos mensuales.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Cargando datos de gastos...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseInputForm onAddExpense={handleAddExpense} currency={currency} />
            <ExpensePdfUpload 
              onUploadComplete={() => handleAddExpense({ 
                concept: "Extracción Automática PDF", 
                amount: 850, 
                category: "Utilities", 
                created_at: new Date().toISOString(), 
                source: "auto" 
              })} 
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col space-y-4">
              {/* Barra de Filtros */}
              <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Filtros:</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1 justify-end flex-wrap">
                  <div className="w-full sm:w-[140px]">
                    <Select 
                      options={CATEGORY_OPTIONS}
                      defaultValue={filterCategory}
                      onChange={setFilterCategory}
                    />
                  </div>
                  
                  <div className="w-full sm:w-[140px]">
                    <Select 
                      options={MONTH_OPTIONS}
                      defaultValue={filterMonth}
                      onChange={setFilterMonth}
                      disabled={filterDate !== ""}
                    />
                  </div>

                  <div className="w-full sm:w-[140px]">
                    <DatePicker 
                      id="filter-date"
                      placeholder="Fecha"
                      defaultDate={filterDate}
                      onChange={(selectedDates, dateStr) => setFilterDate(dateStr)}
                      disabled={filterMonth !== "all"}
                    />
                  </div>

                  <div className="w-full sm:w-[140px]">
                    <Select 
                      options={SOURCE_OPTIONS}
                      defaultValue={filterSource}
                      onChange={setFilterSource}
                    />
                  </div>
                  
                  {(filterCategory !== "all" || filterMonth !== "all" || filterDate !== "" || filterSource !== "all") && (
                    <button 
                      onClick={() => { setFilterCategory("all"); setFilterMonth("all"); setFilterDate(""); setFilterSource("all"); }}
                      className="h-10 px-3 text-sm font-medium text-error-600 hover:bg-error-50 dark:text-error-500 dark:hover:bg-error-500/10 rounded-lg transition-colors"
                      title="Limpiar filtros"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
              
              <ExpenseTable expenses={filteredExpenses} formatCurrency={formatCurrency} onEdit={setEditingExpense} />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <ExpensePieChart data={pieChartData} labels={pieChartLabels} formatCurrency={formatCurrency} />
              <FinancialAdvisorQA contextData={expenses} />
            </div>
          </div>

          {/* Modal de Edición */}
          <Modal 
            isOpen={!!editingExpense} 
            onClose={() => setEditingExpense(null)}
            className="max-w-[500px] p-6 lg:p-8"
          >
            {editingExpense && (
              <ExpenseInputForm 
                onAddExpense={handleAddExpense} 
                currency={currency} 
                initialData={editingExpense} 
                onCancel={() => setEditingExpense(null)} 
                isModal={true}
              />
            )}
          </Modal>
        </>
      )}
    </div>
  );
}
