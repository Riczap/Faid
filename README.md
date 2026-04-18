# Arquitectura Técnica y Decisiones de Ingeniería: Faid

https://faid.riczap06.workers.dev/

En caso que los rates de supabase estén saturados, se puede usar el usuario de invitado:

invitado@hackaton.ia

Invitado2026!


## 1. Arquitectura del Sistema y Flujo de Datos

Faid está diseñado como una aplicación web inteligente, segura y altamente responsiva, creada para actuar como un asesor financiero personalizado. Para equilibrar la naturaleza estocástica de la IA con los requisitos deterministas de las matemáticas financieras, el sistema impone una estricta separación de responsabilidades entre el Frontend (Presentación y Estado), el Servicio de IA (Categorización y Lógica de Estrategia) y el Backend (Persistencia y Seguridad).

### Separación de Responsabilidades
*   **Frontend (Presentación y Estado):** Responsable exclusivamente de la interacción con el usuario, la gestión del estado y la visualización de datos. Maneja las entradas del usuario y renderiza las abstracciones de los gráficos directamente a partir de los datos deterministas del backend.
*   **Servicio de IA (Categorización y Lógica de Estrategia):** Actúa como un motor de procesamiento sin estado. Recibe la entrada cruda o no estructurada del usuario, infiere la intención (por ejemplo, categorizar un gasto o identificar un objetivo financiero), devuelve salidas JSON estructuradas y delega toda la persistencia del estado nuevamente al sistema.
*   **Backend (Persistencia y Seguridad):** Sirve como la única fuente de verdad. Valida todas las estructuras entrantes mediante Seguridad a Nivel de Fila (RLS - Row Level Security), persiste los datos saneados y gestiona de forma asíncrona fuentes de datos externas (por ejemplo, tasas de mercado).

### Flujo de Datos del Ciclo de Vida de la Petición
El ciclo de vida de una acción del usuario (como registrar un gasto no estructurado o solicitar un plan financiero) sigue un flujo definido y unidireccional:

1.  **Cliente / Usuario:** El usuario introduce datos en lenguaje natural (por ejemplo, "Gasté 500 pesos en el supermercado") a través de la interfaz de React.
2.  **Contexto de React:** El enrutador de estado local registra la petición de entrada y la envía a la capa de servicios de la aplicación, mostrando estados de carga optimistas en la interfaz.
3.  **Capa de Servicio de IA (Gemini):** La petición se envía a través de un proxy a la API de Google Gemini utilizando el SDK de Gen AI. Los prompts del sistema imponen restricciones agresivas, exigiendo a la IA que devuelva un objeto JSON estrictamente tipado que contenga las categorías identificadas, las cantidades normalizadas y las perspectivas estratégicas.
4.  **Análisis y Saneamiento:** El frontend recibe la respuesta no estructurada de la IA, analiza el JSON y mapea el payload extraído contra los requisitos del esquema de la base de datos.
5.  **Base de Datos Supabase (con Validación RLS):** Se envía una solicitud de mutación a la base de datos PostgreSQL de Supabase. Antes de confirmarla, las políticas de intercepción de Seguridad a Nivel de Fila (RLS) de PostgreSQL desempaquetan automáticamente el JWT del usuario, verificando la propiedad y garantizando que el usuario solo pueda insertar o leer sus propios registros financieros.
6.  **Actualización del Frontend (Recharts):** Tras una inserción exitosa en la base de datos, los listeners en tiempo real o la invalidación del estado desencadenan una nueva obtención de la caché de datos localizada. El Contexto de React distribuye los datos actualizados a los componentes de Recharts, transformando fluidamente las analíticas visuales.

---

## 2. Tecnologías Empleadas y Justificación

El stack tecnológico se seleccionó para maximizar la velocidad de iteración para un MVP de desarrollo rápido en hackathon, sin comprometer los patrones arquitectónicos de nivel de producción.

*   **React + Vite:**
    *   *Justificación:* Vite proporciona un Reemplazo de Módulos en Caliente (HMR) casi instantáneo, crítico para el desarrollo de interfaces de usuario a alta velocidad. La arquitectura basada en componentes de React garantiza que los dashboards y formularios financieros complejos sigan siendo modulares, comprensibles y altamente reutilizables.
*   **Supabase (PostgreSQL, Auth, Edge Functions):**
    *   *Justificación:* Supabase ofrece un backend PostgreSQL instantáneo y estrictamente tipado, junto con autenticación Zero-Config. Elimina la necesidad de montar una capa middleware personalizada con Node.js/Express, permitiendo una interacción directa y segura desde el cliente a través de RLS.
*   **API de Google Gemini (vía SDK Gen AI):**
    *   *Justificación:* Las ventanas de contexto avanzado de Gemini son capaces de analizar perfiles financieros densos y multivariables a lo largo de un historial conversacional largo. Su capacidad nativa para imponer salidas JSON estructuradas la hace altamente confiable para integraciones de software a software, en lugar de interfaces de chat puramente generativas.
*   **Recharts:**
    *   *Justificación:* Recharts ofrece una integración nativa y declarativa de React para SVGs. Proporciona retroalimentación visual inmediata y responsiva sobre las asignaciones financieras sin introducir el costo pesado de las bibliotecas de gráficos imperativas basadas en canvas.

---

## 3. Decisiones Técnicas Significativas y Trade-offs

Para entregar un MVP escalable y de alto rendimiento bajo las restricciones extremas de un hackathon, se negociaron varias concesiones estratégicas.

### Decisión 1: Analíticas Basadas en la Base de Datos vs. Generación Pura con IA
*   **Problema:** Depender de un LLM para calcular dinámicamente los totales acumulados, generar esquemas de gráficos sobre la marcha y mantener la precisión histórica en una ventana de contexto masiva; es intrínsecamente frágil y poco confiable matemáticamente.
*   **Solución:** Estructuramos la IA exclusivamente como un *motor de categorización de texto y estrategia*. Las transacciones individuales y los presupuestos son analizados por la IA pero se almacenan de manera determinista en PostgreSQL. Las abstracciones de gráficos (`Recharts`) leen directamente de la base de datos para renderizar las visualizaciones.
*   **Justificación:** Este enfoque híbrido garantiza matemáticamente la exactitud de los totales y el trazado de los gráficos. Reduce significativamente la sobrecarga del gasto en tokens de la API, disminuye la latencia de red en cargas repetitivas y limita las alucinaciones con respecto a los estados financieros pasados.

### Decisión 2: Actualización Asíncrona de Tasas mediante Edge Functions
*   **Problema:** La función "Yield Radar" (Radar de Rendimiento) requiere datos macroeconómicos en tiempo real (por ejemplo, tasas de CETES, APYs de SOFIPOs). Obtenerlos desde los navegadores de los clientes introduce severos bloqueos de seguridad de CORS, expone la lógica del scraping y degrada el rendimiento del cliente.
*   **Solución:** Desacoplamos la obtención de tasas externas moviéndola a una Edge Function de Supabase activada asíncronamente a través de `pg_cron`.
*   **Justificación:** La base de datos actúa como una capa de caché. El cliente consulta exclusivamente nuestra tabla de Supabase, asegurando tiempos de carga ultrarrápidos. El worker de `pg_cron` actualiza las tasas de forma segura en segundo plano, omitiendo CORS por completo y centralizando la lógica de API/scraper lejos del frágil frontend.

### Decisión 3: Exclusión Explícita de APIs Bancarias en Vivo (Open Banking)
*   **Problema:** Normalmente, la integración de datos bancarios en tiempo real requiere servicios como Plaid o Belvo, que demandan largos procesos administrativos de aprobación, provisión de claves API y una importante sobrecarga de seguridad.
*   **Solución:** Las integraciones bancarias en vivo quedaron intencionalmente fuera del alcance. Faid se basa en las entradas dirigidas por el usuario (registro manual y texto en lenguaje natural) para generar su libro contable financiero.
*   **Justificación:** Gestionar el cumplimiento de las API financieras dentro del plazo de un hackathon garantiza no cumplir con las fechas de entrega. Al limitar el alcance al seguimiento manual sumado a la inferencia de IA, comprobamos la validez de la mecánica principal del asesoramiento estratégico sin ser bloqueados por el onboarding de proveedores de terceros.

### Decisión 4: Seguridad a través de Seguridad a Nivel de Fila (RLS)
*   **Problema:** Las aplicaciones frontend sin estado estándar requieren una API backend robusta (ej., Node.js + Express) para analizar los JWT, validar la autorización del usuario y ejecutar consultas a la base de datos de manera segura, lo que cuesta horas de desarrollo cruciales.
*   **Solución:** Eliminamos la capa tradicional del middleware enrutando las solicitudes de los clientes directamente a la capa de base de datos, gobernadas firmemente por la Seguridad a Nivel de Fila de PostgreSQL (RLS).
*   **Justificación:** Las políticas RLS empujan la validación de seguridad directamente hacia el motor de base de datos. Al interpretar el JWT de Supabase Auth dentro de PostgreSQL, garantizamos una absoluta privacidad de los datos financieros. Incluso si el cliente frontend se ve comprometido, un usuario no puede ejecutar una consulta (leer, actualizar o eliminar) contra registros que no contengan exactamente su `auth.uid()`, acelerando enormemente el desarrollo y manteniendo el aislamiento de los datos con nivel empresarial.
