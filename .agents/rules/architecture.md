# Reglas de arquitectura

## Contrato de movimientos

- **Alcance:** cambios en `/api/metrics`, sus tipos o sus consumidores.
- **Justificación:** [App.tsx](../../frontend/src/App.tsx) solicita un array de movimientos; [financial-types.ts](../../frontend/src/lib/financial-types.ts) define sus campos y [financial-utils.ts](../../frontend/src/lib/financial-utils.ts) calcula indicadores y puntos mensuales.
- **Guía:** conserva la compatibilidad del array y sus campos; si cambias el contrato, actualiza el backend, los tipos y los consumidores afectados.

## Diagnóstico de errores de datos

- **Alcance:** fallos de carga o cálculo en el dashboard.
- **Justificación:** la cadena de [App.tsx](../../frontend/src/App.tsx) presenta el mismo mensaje para errores de red, lectura JSON y cálculo.
- **Guía:** identifica la etapa que falló antes de atribuir el problema al backend; comprueba la respuesta HTTP y el procesamiento de los datos.

## Proxy de la API

- **Alcance:** cambios en la conexión entre frontend y backend.
- **Justificación:** [vite.config.ts](../../frontend/vite.config.ts) reenvía `/api` a `http://backend:8000`; `backend` es el nombre del servicio de [docker-compose.yml](../../docker-compose.yml), que no está garantizado fuera de la red de Compose.
- **Guía:** conserva o configura explícitamente el destino del proxy y comprueba la petición a `/api/metrics` desde el frontend.

## Estados vacíos de las gráficas

- **Alcance:** cambios en los datos o la representación de las gráficas.
- **Justificación:** [income-outcome-chart.tsx](../../frontend/src/components/dashboard/income-outcome-chart.tsx) requiere al menos un ingreso o gasto positivo; [profit-percent-chart.tsx](../../frontend/src/components/dashboard/profit-percent-chart.tsx) muestra un estado vacío cuando todos los márgenes son cero, aunque haya movimientos.
- **Guía:** comprueba ambas condiciones por separado y conserva su comportamiento salvo que el cambio lo requiera explícitamente.

## Agrupación mensual y zonas horarias

- **Alcance:** cambios de fechas o de agregación mensual.
- **Justificación:** `computeMonthlyData` en [financial-utils.ts](../../frontend/src/lib/financial-utils.ts) combina `new Date(create_date)` con getters locales. Una fecha ISO sin hora como `2024-02-01` puede agruparse en enero en zonas al oeste de UTC.
- **Guía:** verifica fechas en los límites de mes y distintas zonas horarias; no supongas que una fecha sin hora representa el mismo día local.
