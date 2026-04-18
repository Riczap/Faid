# TAREA FRONTEND: VISTA 6 - ACADEMIA FINANCIERA (EDUCATION HUB)

**Objetivo de la tarea:** Construir una página informativa (`/education`) que funcione como una biblioteca de conceptos básicos financieros. El diseño debe ser limpio, con una lectura amena y visualmente estructurada para que cualquier usuario pueda entender conceptos complejos de forma sencilla.

## Regla Importante
**CONTENIDO ESTÁTICO Y HARDCODED (FASE 1):** No se realizarán llamadas a la API de Gemini ni se utilizarán contextos de base de datos. Toda la información debe estar escrita directamente en el componente utilizando componentes de texto y diseño del template. Todo el contenido debe estar estrictamente en **español**.

## Componentes UI Core Requeridos (Imports de `src/template/`)
- **Sección de Héroe (Header):** Un título llamativo ("Aprende lo Básico") con un buscador visual (solo decorativo en Fase 1).
- **Tarjetas Informativas (Education Cards):** Grid de tarjetas que al hacer clic puedan expandirse o llevar a una sección detallada. Deben incluir iconos de `src/template/icons/`.
- **Acordeones o Tabs:** Para organizar preguntas frecuentes o conceptos detallados.
- **Componentes de Alerta/Tips:** Bloques de "Sabías que..." o "Tip Pro" resaltados con los colores del branding.

## Contenido Hardcoded Requerido (Estructura de Temas)
Debes redactar e integrar las siguientes secciones con lenguaje sencillo:

1. **¿Qué es la Inflación?**
   - *Explicación:* "Es como si tu dinero perdiera fuerza. Si hoy un refresco cuesta $20 y el próximo año cuesta $22, ese aumento es la inflación."
   - *Visual:* Un pequeño gráfico comparativo estático que muestre la pérdida de poder adquisitivo.

2. **El Poder de las Tarjetas de Crédito:**
   - *Concepto:* No es dinero extra, es una herramienta de historial.
   - *Puntos clave:* Beneficios de pagar a tiempo (Totalero), construcción de Score Crediticio y protección contra fraudes.

3. **Cuentas de Ahorro vs. Inflación:**
   - *Importancia:* Por qué dejar el dinero "bajo el colchón" o en una cuenta de banco tradicional que no paga intereses es perder dinero.
   - *Recomendación:* Mencionar conceptos como "Rendimiento Anual" y cómo buscar cuentas que igualen o superen el % de inflación (ej. CETES o SOFIPOS, solo como ejemplos educativos).

## Reglas de Implementación Críticas
1. **Idioma:** Sin excepciones, todo el contenido debe ser en español claro y cercano (evitar tecnicismos sin explicación).
2. **Diseño:** Utiliza componentes de `src/template/components/ui/` (Badges para etiquetas, Accordions para FAQ, Cards para temas).
3. **Navegación:** Esta vista debe ser accesible desde el Sidebar o Navbar bajo el nombre "Academia" o "Educación".
4. **Formato de Moneda:** Si mencionas ejemplos numéricos, usa `formatCurrency` de `useFinancial()` para mantener la coherencia con el sistema global.

## Restricciones Técnicas
- **Costo Cero:** Sin dependencias externas nuevas.
- **Interactividad:** La página debe sentirse viva (hovers en tarjetas, transiciones suaves de Tailwind), aunque el contenido sea estático.