import { useState, useEffect } from "react";
import ExpenseTable from "./ExpenseTable";
import ExpensePieChart from "./ExpensePieChart";
import ExpenseInputForm from "./ExpenseInputForm";
import ExpensePdfUpload from "./ExpensePdfUpload";
import { Modal } from "../../template/components/ui/modal";
import { useFinancial } from "../../context/FinancialContext";
import Select from "../../template/components/form/Select";
import DatePicker from "../../template/components/form/date-picker";
import { EXPENSE_CATEGORIES, CATEGORY_LABELS_ES, CATEGORY_COLORS } from "../../config/constants";
import { insertExpense, updateExpense } from "../../services/db.service";
import { useAuth } from "../../context/AuthContext";



const CATEGORY_OPTIONS = [
  ...EXPENSE_CATEGORIES.map(cat => ({
    value: cat,
    label: CATEGORY_LABELS_ES[cat] || cat
  }))
];

const MONTH_OPTIONS = [
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
  { value: "manual", label: "Manual" },
  { value: "auto", label: "Automático" }
];

export default function ExpenseCharts() {
  const { user } = useAuth();
  const { formatCurrency, currency, expenses, fetchFinancialData, loading: ctxLoading } = useFinancial();
  const [loading, setLoading] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [filterSource, setFilterSource] = useState("all");

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const handleAddExpense = async (newExpense: any) => {
    if (!user) return;
    setLoading(true);
    try {
      if (newExpense.id) {
        await updateExpense(newExpense.id, {
          concept: newExpense.concept,
          amount: newExpense.amount,
          category: newExpense.category,
          created_at: newExpense.created_at
        });
      } else {
        await insertExpense(user.id, {
          concept: newExpense.concept,
          amount: newExpense.amount,
          category: newExpense.category,
          source: newExpense.source || "manual",
          created_at: newExpense.created_at || new Date().toISOString()
        });
      }
      // Re-fetch global data (this also rebuilds/flushes contexts)
      await fetchFinancialData();
      setEditingExpense(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAddExpenses = async (extractedExpenses: any[]) => {
    if (!user) return;
    setLoading(true);
    try {
      await Promise.all(
        extractedExpenses.map((exp) =>
          insertExpense(user.id, {
            concept: exp.concept,
            amount: exp.amount,
            category: exp.category,
            source: "auto",
            created_at: exp.created_at || new Date().toISOString(),
          })
        )
      );
      // Re-fetch global data to immediately update all charts
      await fetchFinancialData();
    } catch (err) {
      console.error("Batch insert error:", err);
    } finally {
      setLoading(false);
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

  const expensesForChart = expenses.filter(exp => {
    let matches = true;
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

  // Procesar los datos para el gráfico circular (sumar totales por categoría) usando expensesForChart
  const categoryTotals = expensesForChart.reduce((acc, expense) => {
    const rawKey = expense.category;
    const categoryName = CATEGORY_LABELS_ES[rawKey] || rawKey;
      
    acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieChartLabels = Object.keys(categoryTotals);
  const pieChartData = Object.values(categoryTotals);
  const pieChartColors = Object.keys(categoryTotals).map(label => { const raw = Object.keys(CATEGORY_LABELS_ES).find(k => CATEGORY_LABELS_ES[k] === label) || label; return CATEGORY_COLORS[raw] || CATEGORY_COLORS.Misc; });

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

      {ctxLoading || loading ? (
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
            <ExpensePdfUpload onUploadComplete={handleBatchAddExpenses} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col space-y-4">
              {/* Barra de Filtros */}
              <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-xl p-4 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
                <div className="flex items-center gap-2 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Filtros:</span>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 w-full flex-1 xl:justify-end items-start md:items-center">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full flex-1 max-w-[900px]">
                    <div className="w-full">
                      <Select 
                        options={CATEGORY_OPTIONS}
                        defaultValue={filterCategory === "all" ? "" : filterCategory}
                        placeholder="Categorías"
                        onChange={(val) => setFilterCategory(val || "all")}
                      />
                    </div>
                    
                    <div className="w-full">
                      <Select 
                        options={MONTH_OPTIONS}
                        defaultValue={filterMonth === "all" ? "" : filterMonth}
                        placeholder="Meses"
                        onChange={(val) => setFilterMonth(val || "all")}
                        disabled={filterDate !== ""}
                      />
                    </div>

                    <div className="w-full">
                      <DatePicker 
                        id="filter-date"
                        placeholder="Fecha"
                        defaultDate={filterDate}
                        onChange={(selectedDates, dateStr) => setFilterDate(dateStr)}
                        disabled={filterMonth !== "all"}
                      />
                    </div>

                    <div className="w-full">
                      <Select 
                        options={SOURCE_OPTIONS}
                        defaultValue={filterSource === "all" ? "" : filterSource}
                        placeholder="Origen"
                        onChange={(val) => setFilterSource(val || "all")}
                      />
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto flex items-center justify-end min-w-[80px] shrink-0">
                    <button 
                      onClick={() => { setFilterCategory("all"); setFilterMonth("all"); setFilterDate(""); setFilterSource("all"); }}
                      className={`h-10 px-3 text-sm font-medium text-error-600 hover:bg-error-50 dark:text-error-500 dark:hover:bg-error-500/10 rounded-lg transition-all duration-200 ${
                        (filterCategory !== "all" || filterMonth !== "all" || filterDate !== "" || filterSource !== "all")
                          ? "opacity-100 visible"
                          : "opacity-0 invisible"
                      }`}
                      title="Limpiar filtros"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
              
              <ExpenseTable expenses={filteredExpenses} formatCurrency={formatCurrency} onEdit={setEditingExpense} />
            </div>
            <div className="lg:col-span-1">
              <ExpensePieChart 
                data={pieChartData} 
                labels={pieChartLabels}
                colors={pieChartColors} 
                formatCurrency={formatCurrency} 
                activeCategory={filterCategory !== "all" ? (CATEGORY_LABELS_ES[filterCategory] || filterCategory) : null}
                onCategoryClick={(spanishLabel) => {
                  if (filterCategory !== "all" && (CATEGORY_LABELS_ES[filterCategory] || filterCategory) === spanishLabel) {
                    setFilterCategory("all"); // Deseleccionar si se hace click en el mismo
                  } else {
                    const originalCategory = EXPENSE_CATEGORIES.find(c => (CATEGORY_LABELS_ES[c] || c) === spanishLabel);
                    if (originalCategory) setFilterCategory(originalCategory);
                  }
                }}
              />
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


