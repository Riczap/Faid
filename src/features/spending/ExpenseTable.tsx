import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../template/components/ui/table";
import Badge from "../../template/components/ui/badge/Badge";

interface ExpenseItem {
  id: string;
  concept: string;
  amount: number;
  category: string;
  created_at: string;
}

interface ExpenseTableProps {
  expenses: ExpenseItem[];
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Housing": return "info";
    case "Food": return "success";
    case "Transport": return "warning";
    case "Utilities": return "primary";
    case "Entertainment": return "error";
    case "Health": return "success";
    case "Debt": return "error";
    case "Misc": return "dark";
    default: return "light";
  }
};

const getCategoryLabel = (category: string) => {
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
  return map[category] || category;
};

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] h-full">
      <div className="p-5 border-b border-gray-100 dark:border-white/[0.05]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Últimos Gastos
        </h3>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Fecha
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Concepto
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Categoría
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                Monto
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  {new Date(expense.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                </TableCell>
                <TableCell className="px-5 py-4 text-start">
                  <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {expense.concept}
                  </span>
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge size="sm" color={getCategoryColor(expense.category) as any}>
                    {getCategoryLabel(expense.category)}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-4 text-end font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  ${expense.amount.toLocaleString('es-MX')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
