import React, { useState } from "react";
import Input from "../../template/components/form/input/InputField";
import Select from "../../template/components/form/Select";
import Button from "../../template/components/ui/button/Button";
import DatePicker from "../../template/components/form/date-picker";

import { EXPENSE_CATEGORIES } from "../../config/constants";
import { useFinancial } from "../../context/FinancialContext";

interface ExpenseInputFormProps {
  onAddExpense: (expense: {
    id?: string;
    concept: string;
    amount: number;
    category: string;
    created_at: string;
  }) => void;
  currency: string;
  initialData?: {
    id: string;
    concept: string;
    amount: number;
    category: string;
    created_at: string;
  };
  onCancel?: () => void;
  isModal?: boolean;
}

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

const CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map(cat => ({
  value: cat,
  label: getCategorySpanishName(cat)
}));

export default function ExpenseInputForm({ onAddExpense, currency, initialData, onCancel, isModal = false }: ExpenseInputFormProps) {
  const [concept, setConcept] = useState(initialData?.concept || "");
  const [amount, setAmount] = useState<string>(initialData?.amount?.toString() || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [date, setDate] = useState(() => {
    if (initialData?.created_at) {
      return new Date(initialData.created_at).toISOString().split("T")[0];
    }
    return "";
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!concept || !amount || !category || !date) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    onAddExpense({
      id: initialData?.id,
      concept,
      amount: parseFloat(amount),
      category,
      created_at: new Date(date).toISOString(),
    });

    if (!initialData) {
      // Clear form only on new entry
      setConcept("");
      setAmount("");
      setCategory("");
      setDate("");
    }
  };

  const containerClasses = isModal 
    ? "flex flex-col px-2 overflow-y-auto custom-scrollbar" 
    : "rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] h-full";

  return (
    <div className={containerClasses}>
      {isModal ? (
        <div className="mb-6">
          <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
            {initialData ? "Editar Gasto" : "Agregar Nuevo Gasto"}
          </h5>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Actualiza los detalles de este gasto para mantener tu registro al día.
          </p>
        </div>
      ) : (
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          Agregar Gasto Manual
        </h3>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Concepto
          </label>
          <Input
            type="text"
            placeholder="Ej. Compra de supermercado"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Monto ({currency})
          </label>
          <Input
            type="number"
            placeholder="Ej. 1500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step={0.01}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Categoría
            </label>
            <Select
              options={CATEGORY_OPTIONS}
              placeholder="Seleccionar..."
              onChange={(value) => setCategory(value)}
              defaultValue={category}
            />
          </div>

          <div className="flex-1">
            <DatePicker
              id={isModal ? "modal-expense-date" : "expense-date"}
              label="Fecha"
              placeholder="Seleccionar fecha"
              defaultDate={date}
              onChange={(selectedDates, dateStr) => setDate(dateStr)}
            />
          </div>
        </div>

        {isModal ? (
          <div className="flex items-center gap-3 mt-8 modal-footer sm:justify-end">
            <button
              onClick={onCancel}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {initialData ? "Guardar Cambios" : "Agregar Gasto"}
            </button>
          </div>
        ) : (
          <div className="pt-2 flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" className="w-full">
              {initialData ? "Actualizar Gasto" : "Guardar Gasto"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
