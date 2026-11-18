# Registro de verificación de relaciones

Registro para presentar al profesor. Fecha de comprobación: 2026-11-16 (UTC).
Describe el estado observado en esta sesión; no garantiza que los servicios
sigan en el mismo estado cuando se consulte.

## Criterios

- **Verificada en código/configuración:** la relación está declarada en los
  archivos. No implica que funcione en ejecución.
- **Verificada por prueba:** se ejecutó una comprobación con resultado correcto.
- **No verificada en ejecución:** falta comprobar la comunicación real.

No se crearon conexiones nuevas ni se modificaron servicios para esta revisión.

## Relaciones verificadas

| Relación | Alcance de la verificación | Evidencia |
| --- | --- | --- |
| HTML → entrada React | Verificada en código: el HTML incluye el módulo de entrada y el elemento `root`. | [index.html](frontend/index.html#L10), líneas 10–11. |
| Entrada React → aplicación | Verificada en código: `createRoot` monta `App`. | [main.tsx](frontend/src/main.tsx#L6), líneas 6–8. |
| Aplicación → petición de movimientos | Verificada en código: solicita `${API_BASE_URL}/api/metrics`. La base usa `VITE_API_BASE_URL`, o una cadena vacía si no está definida. | [App.tsx](frontend/src/App.tsx#L13), líneas 13–16. |
| Proxy Vite → backend | Verificada en configuración: `/api` se reenvía a `http://backend:8000`. Aplica cuando el navegador solicita al servidor Vite, no cuando se configura una base externa. | [vite.config.ts](frontend/vite.config.ts#L11), líneas 11–13. |
| Servicios → puertos publicados | Verificada en configuración: frontend `5173`, backend `8000` y depurador `5678`. | [docker-compose.yml](docker-compose.yml#L6), líneas 6–20. |
| Frontend → dependencia de arranque del backend | Verificada en configuración mediante `depends_on`. No es una comprobación de disponibilidad de la API. | [docker-compose.yml](docker-compose.yml#L11), líneas 11–12. |
| Contenedores → comandos de entrada | Verificada en configuración: frontend inicia Vite; backend inicia Uvicorn con `app.main:app` bajo `debugpy`. | [Dockerfile frontend](frontend/Dockerfile#L12) y [Dockerfile backend](backend/Dockerfile#L12). |
| FastAPI → router | Verificada en código mediante `app.include_router(router)`. | [main.py](backend/app/main.py#L14), línea 14. |
| Ruta de movimientos → generador simulado | Verificada en código: `/api/metrics` llama a `generate_mock_movements(seed=42)`. | [routes.py](backend/app/routes.py#L248), líneas 248–255. |
| Movimientos recibidos → cálculos | Verificada en código: la respuesta alimenta `computeKPIs` y `computeMonthlyData`. | [App.tsx](frontend/src/App.tsx#L32), líneas 32–33. |
| Resultados calculados → tarjetas y gráficos | Verificada en código mediante las propiedades de `KPIRow`, `IncomeOutcomeChart` y `ProfitPercentChart`. No se inspeccionó su representación en un navegador. | [App.tsx](frontend/src/App.tsx#L58), líneas 58–66. |
| Utilidades → resultados financieros esperados | **Verificada por prueba:** pasó el archivo existente de pruebas de utilidades: 5 pruebas correctas. Esto no prueba la red ni la API. | `cd frontend && npm run test -- src/lib/financial-utils.test.ts` |
| Archivo Compose → configuración válida | **Verificada por comando:** validación de Compose finalizada correctamente, sin mensajes de error. No inicia servicios. | `docker compose config --quiet` |

## Relaciones no verificadas en ejecución

| Relación pendiente | Resultado observado / motivo | Comprobación pendiente |
| --- | --- | --- |
| Navegador → página del mapa en el puerto 5173 | `curl` no pudo conectarse. No demuestra un defecto en el archivo HTML. | Con Vite activo, comprobar `/connections.html` y abrir la página en el navegador. |
| Navegador → montaje visual de React | No se realizó una prueba con navegador. | Abrir `/` y confirmar que se muestra el dashboard. |
| Vite → backend por el proxy `/api` | La consulta a `http://127.0.0.1:5173/api/metrics` no pudo conectarse al frontend. No llegó a comprobarse el salto al backend. | Con ambos servicios activos, comprobar HTTP 200 y contenido JSON de movimientos. |
| Cliente HTTP → backend `/health` | La consulta a `http://127.0.0.1:8000/health` no pudo conectarse. | Comprobar HTTP 200 y `{"status":"ok"}`. |
| Backend → respuesta real de movimientos | No había backend disponible para consultarlo. | Consultar `/api/metrics` y validar estructura y contenido. |
| Backend → resultados de sus pruebas existentes | `python -m pytest --version` devolvió `No module named pytest`; no se ejecutaron esas pruebas. | Preparar las dependencias del backend y ejecutar las pruebas seleccionadas. |
| Frontend → destino alternativo por variable de entorno | Se verificó la opción en código, no una configuración externa concreta. | Si se usa `VITE_API_BASE_URL`, comprobar ese destino explícitamente. |
| Depurador → puerto 5678 | Puerto declarado, sin prueba de conexión del depurador. | Conectar un cliente de depuración al backend activo. |

### Estado de los servicios durante la revisión

`docker compose ps --format json` terminó correctamente sin listar contenedores
activos del proyecto. Las tres consultas HTTP devolvieron `curl: (7) Failed to
connect` y código mostrado `000`, que significa que no hubo una respuesta HTTP;
no es un código de estado enviado por la aplicación.

No se iniciaron contenedores ni se instalaron dependencias durante esta revisión.

## Rutas existentes, pero no consumidas por el dashboard principal

Se confirmó su declaración en [routes.py](backend/app/routes.py). La solicitud
identificada en [App.tsx](frontend/src/App.tsx#L16) es `/api/metrics`; por tanto,
las siguientes rutas **no deben dibujarse como conexiones activas de esa pantalla**.
Su ejecución HTTP queda pendiente.

| Ruta | Línea de declaración |
| --- | --- |
| `GET /health` | 243 |
| `GET /api/metrics/facets` | 262 |
| `GET /api/metrics/summary` | 268 |
| `GET /api/metrics/categories/top` | 287 |
| `GET /api/metrics/comparison` | 305 |
| `GET /api/metrics/alerts` | 342 |
| `GET /api/metrics/b2b` | 362 |
| `GET /api/metrics/b2c` | 378 |

## Cómo completar el registro

En un entorno autorizado para ejecutar los servicios, iniciar desde la raíz:

```bash
docker compose up --build
```

En otra terminal, comprobar:

```bash
curl --fail-with-body http://localhost:8000/health
curl --fail-with-body http://localhost:8000/api/metrics
curl --fail-with-body http://localhost:5173/api/metrics
curl --fail-with-body http://localhost:5173/connections.html
```

Estas instrucciones están pendientes: no se presentan como resultados obtenidos.
Al ejecutarlas, registrar fecha, comando, resultado HTTP y validación del cuerpo.
Abrir también el dashboard y el mapa para confirmar su presentación visual.

## Conclusión para el profesor

La cadena de relaciones está documentada en el código y la configuración.
Los cálculos financieros superaron sus cinco pruebas existentes y Compose pasó
su validación de configuración. **La comunicación completa navegador → Vite →
FastAPI → gráficos no está verificada en ejecución en esta revisión**, porque
los servicios no estaban disponibles. Los diagramas describen conexiones
declaradas; no deben interpretarse como una certificación de disponibilidad.
