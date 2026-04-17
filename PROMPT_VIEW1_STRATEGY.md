# TAREA FRONTEND: VISTA 1 - PLAN FINANCIERO (STRATEGY DASHBOARD)

**Objetivo de la tarea:** Construir el Dashboard de Estrategia interactivo donde los usuarios ingresan su contexto financiero para recibir un plan generado por IA de 3 fases.

## Regla Importante
**SOLO DATOS DE PRUEBA (MOCK DATA):** NO integres con `ai.service.js` o `db.service.js`. Debes usar `setTimeout` y arreglos de estado hardcodeados para simular el retraso y la respuesta de la API. Todas las etiquetas y textos de la interfaz deben renderizarse estrictamente en **español**.

## Componentes UI Core Requeridos
- **Sección de Entrada:** Un formulario o modal a medida recopilando Deudas, Ingresos y Gastos.
- **Componente Timeline/Stepper:** Renderiza el plan de IA de 3 pasos retornado por la "IA" simulada. Agrega checkboxes visuales o barras de progreso que indiquen la finalización.
  - *Paso 1: Resuelve Tu Deuda*
  - *Paso 2: Armar Tu Colchón*
  - *Paso 3: Inversión*

## Estructura de Datos de Prueba Objetivo
Cuando el usuario haga clic en "Generar Plan", simula un estado de carga de red de 3 segundos, y luego carga este objeto JSON de prueba exacto en el estado para simular la futura respuesta de la API de Gemini:

```json
{
  "debt_priority": ["Tarjeta de Crédito A (alto interés)", "Préstamo Personal"],
  "emergency_target_mxn": 45000,
  "inflation_protection_strategy": "CETES o Cuenta de Ahorro de Alto Rendimiento",
  "allocation": {
    "cetes": 50,
    "udibonos": 20,
    "liquidity": 30
  }
}
```
*Nota: Esta estructura específica refleja el endpoint `generateFinancialStrategy` que el equipo backend conectará más adelante.*
