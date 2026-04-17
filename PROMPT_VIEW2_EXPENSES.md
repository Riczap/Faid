# TAREA FRONTEND: VISTA 2 - REGISTRO DE GASTOS (EXPENSE TRACKER)

**Objetivo de la tarea:** Construir el dashboard de seguimiento de gastos que contenga una Tabla de Datos y un Gráfico Circular (Pie Chart) visual.

## Regla Importante
**SOLO DATOS DE PRUEBA (MOCK DATA):** NO te conectes a `FinancialContext.fetchUserExpenses()`. Debes hardcodear el conjunto de datos localmente para que el desarrollo no tenga costos de API. Todas las etiquetas y textos de la interfaz deben renderizarse estrictamente en **español**.

## Componentes UI Core Requeridos
- **Tabla de Datos:** Una cuadrícula que renderice los gastos mensuales. Columnas: *Fecha, Concepto, Monto, Categoría*.
- **Gráfico Circular:** Usa un componente de Recharts o ApexCharts de `src/template/components/charts/` para renderizar la distribución porcentual.

## Estructura de Datos de Prueba Objetivo
Este arreglo de prueba refleja la estructura exacta que retornará la tabla `expenses` de Supabase. Úsalo para vincular tu tabla y gráficos:

```json
[
  { "id": "uuid-1", "concept": "Renta", "amount": 12000, "category": "Housing", "created_at": "2026-04-10T10:00:00Z" },
  { "id": "uuid-2", "concept": "Despensa", "amount": 4000, "category": "Food", "created_at": "2026-04-12T10:00:00Z" },
  { "id": "uuid-3", "concept": "Uber", "amount": 350, "category": "Transport", "created_at": "2026-04-14T10:00:00Z" }
]
```
