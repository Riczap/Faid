import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../template/components/ui/table";
import Badge from "../../template/components/ui/badge/Badge";
import { useFinancial } from "../../context/FinancialContext";

interface ExpenseItem {
  id: string;
  concept: string;
  amount: number;
  category: string;
  created_at: string;
}

interface ExpenseTableProps {
  expenses: ExpenseItem[];
  formatCurrency: (amount: number) => string;
  onEdit?: (expense: ExpenseItem) => void;
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

export default function ExpenseTable({ expenses, onEdit }: ExpenseTableProps) {
  const { formatCurrency } = useFinancial();
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
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                Acciones
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
                  {formatCurrency(expense.amount)}
                </TableCell>
                <TableCell className="px-5 py-4 text-end">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(expense)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
