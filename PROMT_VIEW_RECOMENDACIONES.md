# TAREA FRONTEND: VISTA - RECOMENDACIONES PERSONALIZADAS (EDUCACIÓN)

**Ubicación:** `/recommendations` (Hereda del NavMenu "Educación Financiera")
Objetivo de la tarea: Construir una vista inyectable en el contenedor que muestre recomendaciones de impacto educacional usando Modales y un Carrusel principal.

## Estructura
1. Carrusel Core (Cover Flow estilo Nike/Premium): Mostrará 3 tarjetas minimalistas, centradas, con un borde redondeado elegante y mucho padding blanco.
   - Técnicas de Inversión
   - Fondos Recomendados
   - Consejos Rápidos Financieros
2. Modales de Información (`src/template/components/ui/modal`): 
   - Al darle "click" a cualquier tarjeta del carrusel, debe activarse el Overlay.
   - El contenedor del Model debe poseer la respuesta en crudo detallada arrojada por la IA respecto de ese tema en particular sobre el perfil actual.

## Conexión (Phase 2 Binding)
- Consumo de `ai.service.js > getInvestmentRecommendations`.
- La data generada usará el salario base (`userProfile.income`) del usuario para sugerir si conviene CETES, S&P 500, etc.

## Regla Importante (Mock Syncing)
Obligatorio: Al editar esta vista se debe paralelamente hidratar la salida del Mocking en `mock.ai.data.js` garantizando que la estructura de prueba emita el mismo JSON que esperaría esta vista. Ninguna prueba en modo gratuito debería crashear.
