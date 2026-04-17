# TAREA FRONTEND: VISTA 3 - CALCULADORAS (DEBT SIMULATOR)

**Objetivo de la tarea:** Construir un simulador interactivo que calcule el costo final real de adquirir nueva deuda.

## Regla Importante
**SOLO DATOS DE PRUEBA (MOCK DATA):** No te conectes a contextos backend globales. Usa el estado local para simular el progreso actual del usuario en el Paso 1 y Paso 2 del Plan Financiero. Todas las etiquetas y textos de la interfaz deben renderizarse estrictamente en **español**.

## Componentes UI Core Requeridos
- **Formulario de Análisis de Costos:** Campos de selección para categoría de deuda, tasa de interés y plazo.
- **Visualización de Impacto:** Una tarjeta que indique cómo adquirir esta deuda impacta su objetivo de "Armar Tu Colchón" (Fondo de Emergencia).

## Estructura de Datos de Prueba Objetivo
Para simular la lógica entre vistas, integra una configuración hardcodeada del progreso del usuario:
```json
{
  "current_debt_load": 15000,
  "emergency_fund_progress": 0.40, 
  "recommended_capacity": 5000 
}
```
Desarrolla la interfaz para mostrar una advertencia intuitiva o proyección basada en calcular el interés compuesto estándar contra esta matriz de capacidad simulada.
