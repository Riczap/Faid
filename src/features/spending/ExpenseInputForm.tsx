import React, { useState } from "react";
import Input from "../../template/components/form/input/InputField";
import Select from "../../template/components/form/Select";
import Button from "../../template/components/ui/button/Button";

import { EXPENSE_CATEGORIES } from "../../config/constants";

interface ExpenseInputFormProps {
  onAddExpense: (expense: {
    concept: string;
    amount: number;
    category: string;
    created_at: string;
  }) => void;
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

export default function ExpenseInputForm({ onAddExpense }: ExpenseInputFormProps) {
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!concept || !amount || !category || !date) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    onAddExpense({
      concept,
      amount: parseFloat(amount),
      category,
      created_at: new Date(date).toISOString(),
    });

    // Clear form
    setConcept("");
    setAmount("");
    setCategory("");
    setDate("");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] h-full">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
        Agregar Gasto Manual
      </h3>
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
            Monto ($)
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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Fecha
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full">
            Guardar Gasto
          </Button>
        </div>
      </form>
    </div>
  );
}
