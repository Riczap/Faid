# TAREA FRONTEND: VISTA 4 - CALENDARIO (SUBSCRIPTION CALENDAR)

**Objetivo de la tarea:** Construir una cuadrícula de seguimiento de cargos recurrentes y un resumen de proyección anual.

## Regla Importante
**SOLO DATOS DE PRUEBA (MOCK DATA):** Construye la UI usando respuestas locales simuladas de la Base de Datos. No queremos hacer ping a Supabase durante la iteración de la UI. Todas las etiquetas y textos de la interfaz deben renderizarse estrictamente en **español**.

## Componentes UI Core Requeridos
- **Vista Mensual:** Una interfaz de calendario importada de `src/template/` o FullCalendar resaltando fechas específicas de cargos automatizados y recibos de servicios.
- **Resumen Anual:** Una tarjeta de métricas agregadas o lista mostrando los costos anualizados por servicio o suscripción.
- **Formulario de Adición:** Un modal o formulario en la UI para permitir al usuario agregar manualmente nuevos servicios (Luz, Agua, Gas) y suscripciones recurrentes, especificando su frecuencia y tipo.

## Estructura de Datos de Prueba Objetivo
Este arreglo se mapea perfectamente al futuro esquema de tabla backend de `subscriptions`. Mapea tus nodos del calendario a esto, incluyendo tanto suscripciones como servicios básicos:

```json
[
  { "id": "sub-1", "name": "Spotify", "amount": 120, "billing_day": 15, "frequency": "monthly", "type": "subscription" },
  { "id": "sub-2", "name": "Amazon Prime", "amount": 899, "billing_day": 2, "frequency": "yearly", "type": "subscription" },
  { "id": "service-1", "name": "CFE (Luz)", "amount": 400, "billing_day": 5, "frequency": "bimonthly", "type": "service" },
  { "id": "service-2", "name": "Agua", "amount": 250, "billing_day": 12, "frequency": "monthly", "type": "service" }
]
```
