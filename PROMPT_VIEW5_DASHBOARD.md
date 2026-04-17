# TAREA FRONTEND: VISTA 5 - DASHBOARD PRINCIPAL (HOME OVERVIEW)

**Objetivo de la tarea:** Construir la página de inicio (`/`) que sirve como centro de control financiero. Debe ofrecer un resumen visual de alto nivel integrando métricas de las otras secciones (Gastos, Estrategia, Calendario y Simulador).

## Regla Importante
**SOLO DATOS HARDCODED (FASE 1):** No realices llamadas a `ai.service.js` ni consumas contextos de datos reales. Toda la información debe estar integrada estáticamente en el componente para definir el diseño final. Todas las etiquetas y textos deben estar estrictamente en **español**.

## Componentes UI Core Requeridos (Imports de `src/template/`)
- **Tarjetas de Métricas (KPI Cards):** 4 tarjetas superiores con iconos de `src/template/icons/`:
  1. **Patrimonio Total:** Un balance neto ficticio.
  2. **Gastos del Mes:** Basado en el presupuesto de "Gastos".
  3. **Próximo Pago:** La suscripción más cercana del "Calendario".
  4. **Capacidad de Crédito:** Basado en la "Regla del 35%" del Simulador.
- **Gráfico de Actividad Reciente:** Un gráfico de áreas o líneas (ApexCharts) que muestre la tendencia de gastos de la última semana.
- **Acceso Rápido a Estrategia:** Un banner o card destacado que invite al usuario a "Ver mi Plan de 3 Fases" (Redirige a `/strategy`).
- **Resumen de Categorías:** Una versión miniatura del gráfico circular de gastos.

## Reglas de Implementación Críticas
1. **Moneda Global:** Es **obligatorio** usar `formatCurrency` de `useFinancial()` para todos los montos (ej. Patrimonio, Gastos). No hardcodear el símbolo `$`.
2. **Layout:** Utiliza el sistema de grid del template para que las tarjetas sean responsivas.
3. **Navegación Interna:** Los botones de "Ver más" en cada sección deben usar `Link` de `react-router-7` hacia sus respectivas rutas (`/spending`, `/calendar`, etc.).
4. **Idioma:** Sin excepciones, todo el contenido visual (labels, tooltips, placeholders) debe ser en español.

## Estructura de Información para la Vista (Hardcoded)
Usa estos valores para poblar la interfaz de forma coherente con el resto de la app:
- **Balance General:** $24,500.00
- **Gasto Mensual Actual:** $8,320.00
- **Alertas de Calendario:** "Pago de CFE en 3 días ($400.00)"
- **Estado de Estrategia:** "Fase 1: Liquidando Tarjeta de Crédito A (65% completado)"

## Restricciones Técnicas
- **Costo Cero:** Cero importaciones de `services/`.
- **Estilo:** No generes CSS personalizado; usa exclusivamente las clases de Tailwind 4 y los componentes pre-estilizados en `src/template/components/`.