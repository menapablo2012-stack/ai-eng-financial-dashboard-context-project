# Reglas de nomenclatura

## Campos de entrada y salida

- **Alcance:** movimientos de la API y resultados calculados del frontend.
- **Justificación:** [financial-types.ts](../../frontend/src/lib/financial-types.ts) define `FinancialMovement` con `create_date`, `operation_type` y `business_type`, mientras `MonthlyDataPoint` usa `profitPercent`.
- **Guía:** conserva los nombres del contrato de entrada al consumir movimientos y usa los nombres del tipo de salida para los datos calculados. Si cambias un nombre, actualiza el contrato y sus consumidores.

## Funciones de cálculo

- **Alcance:** cambios en cálculos financieros del frontend.
- **Justificación:** [financial-utils.ts](../../frontend/src/lib/financial-utils.ts) distingue `computeKPIs` para indicadores y `computeMonthlyData` para puntos mensuales.
- **Guía:** usa la función y el tipo de resultado correspondientes; no intercambies indicadores globales con datos mensuales.

## Alias de imports

- **Alcance:** imports del frontend y configuración de Vite.
- **Justificación:** [vite.config.ts](../../frontend/vite.config.ts) apunta el alias `@` a `frontend/src` y resuelve la ruta desde `import.meta.url`.
- **Guía:** conserva ese destino para los imports existentes y utiliza resolución compatible con módulos ES; `__dirname` no está definido con el cargador `runner`.
