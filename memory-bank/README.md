# Memoria del proyecto

Actualizado: 2026-11-17. Esta memoria recoge evidencia del codigo y de la documentacion enlazados. La lectura del codigo no acredita que los servicios se hayan ejecutado correctamente.

## Resumen

Panel de metricas financieras con frontend React + TypeScript y backend FastAPI. Presenta indicadores, una grafica de ingresos y gastos y otra de porcentaje de beneficio a partir de movimientos financieros.

El [README en espanol](../README.es.md) lo presenta como un proyecto construido por estudiantes de 4Geeks Academy y recomienda inspeccionar frontend y backend con un agente, documentar reglas y banco de memoria y validar las reglas en el flujo real del proyecto.

## Vision y proposito documentados

El [README en espanol](../README.es.md) describe el producto como un dashboard de metricas financieras con React + TypeScript y FastAPI. Sus pasos recomendados incluyen documentar reglas y banco de memoria en un fork y ajustarlos mediante validacion.

Ese README no formula una vision de producto ni una hoja de ruta adicional. Esta memoria no atribuye al proyecto objetivos futuros que esa fuente no declara.

## Que existe en el repositorio

| Area | Contenido y punto de entrada |
| --- | --- |
| Interfaz | [App.tsx](../frontend/src/App.tsx) carga datos, gestiona carga y error y conecta indicadores y graficas. |
| Componentes | [Dashboard](../frontend/src/components/dashboard) contiene cabecera, tarjetas y graficas; [UI](../frontend/src/components/ui) contiene elementos reutilizables. |
| Contrato y calculos | [Tipos financieros](../frontend/src/lib/financial-types.ts) y [utilidades financieras](../frontend/src/lib/financial-utils.ts) definen movimientos, indicadores y agregacion mensual. |
| API | [routes.py](../backend/app/routes.py) define modelos, generacion de movimientos simulados, filtros y funciones de resumen, categorias, comparacion y alertas. |
| Pruebas | [Pruebas del backend](../backend/tests/test_routes.py) y [pruebas de calculos](../frontend/src/lib/financial-utils.test.ts). No sustituyen una comprobacion visual. |
| Entorno | [Docker Compose](../docker-compose.yml) coordina frontend y backend; [package.json](../frontend/package.json) define dependencias y comandos del frontend. |
| Documentacion | [README en espanol](../README.es.md), [README en ingles](../README.md), [mapa de conexiones](../MAPA_CONEXIONES.md), [registro de verificaciones](../REGISTRO_VERIFICACIONES.md) y [vista HTML de conexiones](../frontend/public/connections.html). |
| Contexto para agentes | [AGENTS.md](../AGENTS.md) indica donde consultar reglas, habilidades y esta memoria; las [reglas locales](../.agents/rules) recogen convenciones del proyecto. |

### Flujo principal

1. El navegador ejecuta el frontend y solicita `GET /api/metrics`.
2. Por defecto, el proxy de Vite envia `/api` al servicio `backend:8000` dentro de Compose. La interfaz permite configurar `VITE_API_BASE_URL`.
3. La API entrega movimientos con `create_date`, `amount`, `operation_type`, `category` y `business_type`.
4. El frontend aplica `computeKPIs` y `computeMonthlyData` y representa tarjetas y graficas con Recharts.

En [routes.py](../backend/app/routes.py), `get_metrics` y las demas rutas financieras llaman a `generate_mock_movements(seed=42)`: los datos de esas rutas son simulados. En [App.tsx](../frontend/src/App.tsx), la cabecera recibe el periodo fijo `2024 - Full Year`; no se calcula a partir de las fechas recibidas.

## Quien puede manejarlo

Las fuentes consultadas permiten documentar lo siguiente:

| Evidencia | Lo que acredita |
| --- | --- |
| [README en espanol](../README.es.md) | Identifica el contexto educativo y da instrucciones para crear un fork y ejecutar el proyecto. Atribuye el proyecto original a @marcogonzalo y otros contribuidores. |
| [AGENTS.md](../AGENTS.md) | Establece instrucciones para agentes que trabajen en el proyecto: consultar reglas, habilidades y banco de memoria. |
| [Reglas de operacion](../.agents/rules/operations.md) | Documentan comandos de arranque y diagnostico, pero no asignan una persona responsable. |

**No confirmado:** quien administra este fork, quien tiene permisos de escritura y quien es responsable de frontend, backend u operacion. Las fuentes anteriores no establecen esas asignaciones. Los creditos del proyecto original no acreditan permisos sobre este fork. No se asignan perfiles, competencias ni autorizaciones por inferencia.

## Operacion basica

Desde la raiz, con Docker y Docker Compose disponibles:

```bash
docker compose up --build -d
docker compose ps -a
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Documentacion interactiva de la API: http://localhost:8000/docs

En Codespaces, abrir el puerto 5173 desde la pestana Ports. Para diagnostico y verificaciones, consultar las reglas de [operacion](../.agents/rules/operations.md) y [testing](../.agents/rules/testing.md).

## Limites y cuidados

- Conservar el contrato de movimientos al cambiar API o consumidores; seguir las reglas de [arquitectura](../.agents/rules/architecture.md) y [nomenclatura](../.agents/rules/naming.md).
- La agrupacion mensual tiene un riesgo documentado de zona horaria en fechas de inicio de mes.
- Las dos graficas tienen condiciones distintas para mostrar estados vacios.
- Las pruebas de funciones y rutas no acreditan el renderizado en navegador ni el funcionamiento del proxy activo.
- Esta memoria no certifica seguridad, persistencia, autenticacion ni preparacion para produccion. Esas capacidades requieren una evaluacion especifica antes de usar datos financieros reales.

## Criterio de esta memoria

Las afirmaciones sobre el proyecto deben tener respaldo en una fuente enlazada. Si un dato no esta confirmado, debe figurar como tal, sin sustituirlo por una propuesta. Las [reglas de testing](../.agents/rules/testing.md) exigen distinguir resultados de pruebas automatizadas, respuestas HTTP y comprobacion visual.