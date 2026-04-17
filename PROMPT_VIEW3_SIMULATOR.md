# TAREA FRONTEND: VISTA 3 - CALCULADORAS (DEBT SIMULATOR)

**Objetivo de la tarea:** Construir un simulador interactivo que calcule el costo final real de adquirir nueva deuda y valide la capacidad de endeudamiento utilizando la Regla del 35% propuesta por BBVA.

## Regla Importante
**SOLO DATOS DE PRUEBA (MOCK DATA):** No te conectes a contextos backend globales. Usa el estado local (incluidos `setTimeout`) para simular la fase de procesamiento de los resultados. Todas las etiquetas y textos de la interfaz deben renderizarse estrictamente en **español**.

## Requerimientos Funcionales (Lógica BBVA)
1. **Regla del 35%:** La capacidad máxima de endeudamiento seguro no debe sobrepasar el 35% de los ingresos netos mensuales del usuario.
2. **Nuevos Inputs Requeridos:**
   - Ingresos netos mensuales
   - Deuda actual mensual (Suma de cuotas actuales)
   - Monto a solicitar, tasa de interés anual, plazo en meses.
3. **Categorías de Deuda (Obligatorias en Mock):**
   - Educación
   - Gastos Médicos de Emergencia
   - (Se conservan opciones adicionales como Préstamo Personal, Tarjeta de Crédito, etc.)

## Vista de Impacto (Panel Derecho)
- Debe mostrarse después de calcular y terminar la pantalla de carga simulada.
- Desglose requerido:
  - **Capacidad Máxima Segura** (Ingresos netos mensuales * 0.35)
  - **Espacio Disponible Actual** (Capacidad máxima - Deuda actual)
  - **Cuota Mensual del Nuevo Crédito**
- **Validación Visual:** Uso de colores y alertas visuales para indicar en rojo si la cuota simulada es mayor a la capacidad disponible, y en verde si es permisible de forma holgada.

## Reglas Estrictas
- **Costo Cero:** Ninguna llamada a API.
- **Moneda Global:** Usa destructuración de context para el formato a nivel UI: `const { formatCurrency, currency } = useFinancial();`. Ningún `$` impreso estáticamente.
- **Componentes Nativos:** Usa las importaciones `<Input>`, `<Select>`, `<Label>`, etc. extraídas de `src/template/components/`.
