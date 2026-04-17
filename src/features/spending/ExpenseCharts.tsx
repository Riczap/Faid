import { useState, useEffect } from "react";
import ExpenseTable from "./ExpenseTable";
import ExpensePieChart from "./ExpensePieChart";
import ExpenseInputForm from "./ExpenseInputForm";
import ExpensePdfUpload from "./ExpensePdfUpload";
import FinancialAdvisorQA from "../common/FinancialAdvisorQA";
import { Modal } from "../../template/components/ui/modal";
import { useFinancial } from "../../context/FinancialContext";

// Mock Data de la Fase 1 (No conectar a base de datos aún)
const MOCK_EXPENSES = [
  { id: "uuid-1", concept: "Renta", amount: 12000, category: "Housing", created_at: "2026-04-10T10:00:00Z" },
  { id: "uuid-2", concept: "Despensa", amount: 4000, category: "Food", created_at: "2026-04-12T10:00:00Z" },
  { id: "uuid-3", concept: "Uber", amount: 350, category: "Transport", created_at: "2026-04-14T10:00:00Z" },
];

export default function ExpenseCharts() {
  const { formatCurrency, currency } = useFinancial();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<typeof MOCK_EXPENSES>([]);
  const [editingExpense, setEditingExpense] = useState<typeof MOCK_EXPENSES[0] | null>(null);

  useEffect(() => {
    // Fase 1: Simulamos una petición a la red (latencia)
    const timer = setTimeout(() => {
      setExpenses(MOCK_EXPENSES);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleAddExpense = (newExpense: { id?: string; concept: string; amount: number; category: string; created_at: string }) => {
    if (newExpense.id) {
      // Editar
      setExpenses(prev => prev.map(exp => exp.id === newExpense.id ? { ...exp, ...newExpense } as any : exp));
      setEditingExpense(null);
    } else {
      // Crear
      const expenseWithId = { ...newExpense, id: `manual-${Date.now()}` };
      setExpenses(prev => [expenseWithId, ...prev]);
    }
  };

  // Procesar los datos para el gráfico circular (sumar totales por categoría)
  const categoryTotals = expenses.reduce((acc, expense) => {
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
            <ExpensePdfUpload />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ExpenseTable expenses={expenses} formatCurrency={formatCurrency} onEdit={setEditingExpense} />
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
