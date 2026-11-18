# Reglas de testing

## Cálculos financieros

- **Alcance:** cambios en cálculos y formatos del frontend.
- **Justificación:** [financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts) comprueba indicadores, agregación mensual y formatos.
- **Guía:** ejecuta desde la raíz la prueba correspondiente:

  ```bash
  cd frontend && npm run test -- src/lib/financial-utils.test.ts
  ```

## Fechas y zonas horarias

- **Alcance:** cambios en la agrupación mensual o en el tratamiento de fechas.
- **Justificación:** la prueba mensual de [financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts) no establece una zona horaria; el riesgo concreto está descrito en [Arquitectura](./architecture.md).
- **Guía:** comprueba fechas de inicio de mes en distintas zonas horarias y comunica las zonas verificadas.

## Rutas del backend

- **Alcance:** cambios en rutas o filtros de la API.
- **Justificación:** [test_routes.py](../../backend/tests/test_routes.py) usa `TestClient` de FastAPI para comprobar respuestas y filtros.
- **Guía:** ejecuta las pruebas relevantes de ese archivo y distingue sus resultados de una comprobación HTTP de los servicios activos.

## Integración y representación visual

- **Alcance:** cambios en el proxy, la conexión con la API o las gráficas.
- **Justificación:** [test_routes.py](../../backend/tests/test_routes.py) usa `TestClient` y [financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts) prueba funciones; ninguno ejecuta Vite ni un navegador. [routes.py](../../backend/app/routes.py) devuelve `{"status":"ok"}` en `/health` y una lista de movimientos en `/api/metrics`.
- **Guía:** con los servicios activos según [Operación](./operations.md), comprueba ambas respuestas y verifica que la segunda sea un array JSON:

  ```bash
  curl --fail-with-body http://localhost:8000/health
  curl --fail-with-body http://localhost:5173/api/metrics
  ```

  Abre `http://localhost:5173/` y comprueba las tarjetas y ambas gráficas. Una respuesta HTTP 200 no demuestra que React las haya renderizado.

## Comunicación de resultados

- **Alcance:** informes de validación de cambios de frontend o API.
- **Justificación:** las pruebas de [financial-utils.test.ts](../../frontend/src/lib/financial-utils.test.ts) y [test_routes.py](../../backend/tests/test_routes.py) no comprueban el renderizado en un navegador.
- **Guía:** informa por separado las pruebas automatizadas, las respuestas HTTP y la comprobación visual; no presentes una como evidencia de las otras.
