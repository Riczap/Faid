# TAREA FRONTEND: VISTA 4 - CALENDARIO (SUBSCRIPTION CALENDAR)

**Objetivo de la tarea:** Construir una cuadrícula de seguimiento de cargos recurrentes y un resumen de proyección anual.

## Regla Importante
**SOLO DATOS DE PRUEBA (MOCK DATA):** Construye la UI usando respuestas locales simuladas de la Base de Datos. No queremos hacer ping a Supabase durante la iteración de la UI. Todas las etiquetas y textos de la interfaz deben renderizarse estrictamente en **español**.

## Componentes UI Core Requeridos
- **Vista Mensual:** Una interfaz de calendario importada de `src/template/` o FullCalendar resaltando fechas específicas de cargos automatizados.
- **Resumen Anual:** Una tarjeta de métricas agregadas o lista mostrando los costos anualizados por servicio.

## Estructura de Datos de Prueba Objetivo
Este arreglo se mapea perfectamente al futuro esquema de tabla backend de `subscriptions`. Mapea tus nodos del calendario a esto:

```json
[
  { "id": "sub-1", "name": "Spotify", "amount": 120, "billing_day": 15, "frequency": "monthly" },
  { "id": "sub-2", "name": "Amazon Prime", "amount": 899, "billing_day": 2, "frequency": "yearly" },
  { "id": "sub-3", "name": "Gym", "amount": 600, "billing_day": 28, "frequency": "monthly" }
]
```
