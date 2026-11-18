# Estado Actual del Proyecto

Documento que describe qué está implementado, qué no, conocido, limitaciones y qué se recomienda validar o mejorar. Basado en la lectura del código, configuración y el [registro de verificaciones](../REGISTRO_VERIFICACIONES.md) del 2026-11-16.

## Qué funciona (verificado en código o pruebas)

| Componente | Evidencia | Estado |
| --- | --- | --- |
| **Configuración de Compose** | `docker compose config --quiet` sin errores | ✓ Válida |
| **Pruebas de cálculos frontend** | `npm run test -- src/lib/financial-utils.test.ts` pasó 5 pruebas | ✓ Funcionales |
| **Definición de rutas backend** | [routes.py](../backend/app/routes.py) declara 8 endpoints | ✓ Implementados |
| **Proxy de Vite configurado** | [vite.config.ts](../frontend/vite.config.ts) reenvía `/api` a `http://backend:8000` | ✓ Configurado |
| **Componentes React montados** | [App.tsx](../frontend/src/App.tsx) importa y usa Dashboard, KPI, gráficas | ✓ Implementados |
| **Contrato de datos definido** | [financial-types.ts](../frontend/src/lib/financial-types.ts) define tipos para movimientos, KPIs, agregaciones | ✓ Definido |
| **Generador de datos simulados** | [routes.py](../backend/app/routes.py#L248) implementa `generate_mock_movements(seed=42)` | ✓ Implementado |

## Gaps conocidos (documentados en las reglas del proyecto)

| Aspecto | Descripción | Fuente |
| --- | --- | --- |
| **Diagnóstico de errores genérico** | [App.tsx](../frontend/src/App.tsx#L36) muestra el mismo mensaje para fallos de red, JSON y cálculo. No identifica cuál fue el problema. | [Reglas de arquitectura](../.agents/rules/architecture.md#diagnóstico-de-errores-de-datos) |
| **Riesgo de zona horaria en agrupación mensual** | `computeMonthlyData` en [financial-utils.ts](../frontend/src/lib/financial-utils.ts#L9) usa `new Date()` con getters locales. Una fecha ISO sin hora como `2024-02-01` puede agruparse en enero en zonas horarias al oeste de UTC. | [Reglas de arquitectura](../.agents/rules/architecture.md#agrupación-mensual-y-zonas-horarias) |
| **Cargador Vite específico** | El entorno observado requirió `--configLoader runner` en [frontend/Dockerfile](../frontend/Dockerfile#L12). Fallo observado: `TypeError: Cannot convert undefined or null to object`. No se ha generalizado a otros entornos. | [Reglas de operación](../.agents/rules/operations.md#cargador-de-configuración-de-vite) |
| **Estados vacíos de gráficas con condiciones distintas** | [income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx) requiere al menos un ingreso o gasto positivo; [profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx) muestra vacío cuando todos los márgenes son cero, aunque haya movimientos. | [Reglas de arquitectura](../.agents/rules/architecture.md#estados-vacíos-de-las-gráficas) |

## Limitaciones actuales (por diseño)

| Limitación | Detalles | Implicación |
| --- | --- | --- |
| **Datos simulados** | [routes.py](../backend/app/routes.py#L248) todas las rutas usan `generate_mock_movements(seed=42)`. Seed fijo asegura consistencia, no variedad. | No hay integración con datos reales ni base de datos |
| **Período fijo en la cabecera** | [App.tsx](../frontend/src/App.tsx#L49) pasa `period="2024 - Full Year"` a `DashboardHeader`. No se calcula desde los movimientos. | La cabecera no refleja el rango real de los datos |
| **Sin persistencia** | No hay base de datos; los datos se generan en memoria en cada solicitud. | Cada sesión recibe los mismos datos (seed=42) |
| **Sin autenticación** | Los endpoints no validan identidad del cliente | No hay control de acceso |
| **Sin preparación para producción** | El backend corre bajo `debugpy` en desarrollo; no hay configuración de CORS, rate limiting ni logging seguro | No es seguro exponer a internet |
| **Pruebas sin navegador** | [financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts) y [test_routes.py](../backend/tests/test_routes.py) usan `TestClient` y funciones directas, no Vitest + navegador ni Playwright | El renderizado React, Recharts y CSS no se verifican automáticamente |

## Verificaciones pendientes

Según el [registro de verificaciones](../REGISTRO_VERIFICACIONES.md#relaciones-no-verificadas-en-ejecución), estos puntos aún no se han comprobado en ejecución:

| Verificación | Acción recomendada | Resultado esperado |
| --- | --- | --- |
| **Servicios activos** | Ejecutar `docker compose up --build` desde la raíz | Ambos contenedores en estado `running` |
| **Backend responde en `/health`** | `curl --fail-with-body http://localhost:8000/health` | HTTP 200, body `{"status":"ok"}` |
| **Backend entrega movimientos** | `curl --fail-with-body http://localhost:8000/api/metrics` | HTTP 200, array JSON de movimientos con `create_date`, `amount`, `operation_type`, `category`, `business_type` |
| **Proxy de Vite actúa** | `curl --fail-with-body http://localhost:5173/api/metrics` | HTTP 200, mismo contenido que `/api/metrics` en el backend |
| **Frontend renderiza** | Abrir `http://localhost:5173` en navegador | Dashboard visible con cabecera, tarjetas KPI, dos gráficas (ingresos/gastos y margen %) |
| **Mapa HTML carga** | Abrir `http://localhost:5173/connections.html` en navegador | Página con diagrama Mermaid visible |
| **Dependencias del backend** | `cd backend && pip install -r requirements.txt && python -m pytest --version` | pytest disponible sin errores |
| **Pruebas del backend pasan** | `cd backend && python -m pytest` | Todas las pruebas en [test_routes.py](../backend/tests/test_routes.py) pasan |
| **Debugger accesible** | Conectar cliente de depuración a `localhost:5678` | Conexión exitosa al backend en ejecución |

## Siguientes prioridades

Ordenadas por dependencia (bloquean otras validaciones):

1. **Iniciar servicios de desarrollo**
   - Comando: `docker compose up --build`
   - Propósito: Habilitar todas las pruebas de conectividad y renderizado
   - Bloquea: Verificaciones 2–8 anteriores

2. **Validar conectividad del backend**
   - Comandos: comprobar `/health` y `/api/metrics` según tabla anterior
   - Propósito: Descartar problemas de red o configuración del proxy
   - Bloquea: Validación visual del frontend

3. **Instalar y ejecutar pruebas del backend**
   - Comandos: `cd backend && pip install -r requirements.txt && python -m pytest`
   - Propósito: Validar que las rutas y modelos funcionan sin el frontend
   - Impacto: Independiente; refina la confianza en la API

4. **Validar renderizado visual del dashboard**
   - Acción: Abrir `http://localhost:5173` en navegador y confirmar estructura
   - Propósito: Verificar que React, Recharts y Tailwind renderizan correctamente
   - Notas: Consultar [reglas de testing](../.agents/rules/testing.md#integración-y-representación-visual) para distinguir HTTP 200 de renderizado real

5. **Revisión de los gaps identificados**
   - Mejorar mensaje de error en [App.tsx](../frontend/src/App.tsx) para diferenciar fallos de red vs JSON vs cálculo
   - Verificar agrupación mensual en diferentes zonas horarias
   - Evaluar si los estados vacíos de gráficas son el comportamiento deseado
   - Propósito: Aumentar robustez y claridad del diagnóstico

6. **Preparación para datos reales** (fuera del alcance actual)
   - Integrar una base de datos persistente
   - Agregar autenticación y autorización
   - Configurar CORS y seguridad
   - Implementar logging estructurado
   - Propósito: Si el proyecto pasa a usar datos financieros reales

## Notas

- Esta descripción no incluye suposiciones sobre el futuro del proyecto. Reporta solo lo verificado o explícitamente documentado en el código.
- El [REGISTRO_VERIFICACIONES.md](../REGISTRO_VERIFICACIONES.md) distingue entre verificación en código, pruebas ejecutadas y pruebas pendientes; consultar esa fuente para detalles.
- Las [reglas locales](../.agents/rules) recopilan convenciones y riesgos conocidos del proyecto; leerlas antes de hacer cambios.
