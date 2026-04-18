# TAREA FRONTEND: VISTA 7 - PERFIL FINANCIERO (USER PROFILE)

**Objetivo de la tarea:** Construir la página de perfil personal (`/profile`), accesible desde el headbar. Esta vista permite al usuario centralizar su información base: ingresos, deudas, gastos fijos y patrimonio neto.

## Regla Importante
**INTERFAZ Y ESTADO LOCAL (FASE 1):** No se conectará con Supabase ni servicios de IA en esta etapa. Se debe simular el guardado de datos con un estado local (React State) y una notificación visual de "Perfil Actualizado". Todo el contenido debe estar estrictamente en **español**.

## Componentes UI Core Requeridos (Imports de `src/template/`)
- **Layout de Perfil:** Usa una estructura de dos columnas (Información Personal a la izquierda / Resumen Financiero a la derecha).
- **Formularios de Entrada:** Utiliza componentes `<Input>`, `<Label>` y `<Select>` de `src/template/components/form/`.
- **Iconos de Categoría:** Usa iconos de `src/template/icons/` para identificar cada sección (ej. moneda para ingresos, tarjeta para deudas).
- **Botones de Acción:** Un botón principal de "Guardar Cambios" con estado de carga (spinner) de 1.5 segundos simulado.

## Secciones de Datos Requeridas (Inputs)
El formulario debe estar dividido en secciones lógicas:

1. **Ingresos Mensuales:**
   - Campo para "Ingreso Neto Mensual" (después de impuestos).
2. **Estructura de Gastos:**
   - Campo para "Gastos Fijos" (Renta, servicios, compromisos recurrentes).
3. **Pasivos (Deudas Actuales):**
   - Campo para la "Suma Total de Deudas" y "Pago Mensual por Deuda".
4. **Patrimonio Neto:**
   - Campo para "Valor Total de Activos" (Efectivo, inversiones, propiedades).

## Reglas de Implementación Críticas
1. **Formato de Moneda Dinámico:** Los campos de entrada deben mostrar el valor formateado visualmente o incluir una ayuda visual usando `formatCurrency` de `useFinancial()` para que el usuario sepa que está editando en su moneda global (MXN por defecto).
2. **Validación Visual:** Si el usuario ingresa deudas que superan sus ingresos, mostrar una pequeña advertencia visual (Badge o texto en rojo de `src/template/`) de carácter informativo.
3. **Idioma:** Sin excepciones, todo el contenido debe ser en español.
4. **Acceso:** El componente debe estar vinculado a la ruta `/profile` y ser el destino al hacer clic en el nombre/avatar del usuario en el `Header`.

## Estructura de Datos Hardcoded (Estado Inicial)
Utiliza estos valores como default en los inputs:
- **Ingreso Neto:** 35000
- **Gastos Fijos:** 12000
- **Deuda Mensual:** 4500
- **Patrimonio Neto:** 150000

## Restricciones Técnicas
- **Costo Cero:** Sin llamadas a API.
- **Estilo:** Mantener la estética premium del Dashboard. Utilizar tarjetas separadas (`Card` component) para cada sección de información para evitar formularios demasiado largos.