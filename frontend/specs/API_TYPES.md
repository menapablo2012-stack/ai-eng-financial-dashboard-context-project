# API Types Specification

**Documento:** Especificación formal de tipos para entrada y salida de la API de métricas financieras.  
**Fecha:** 2026-11-18  
**Estado:** Válido (en uso por backend FastAPI y frontend TypeScript)

---

## Tipos Base

### `OperationType`

```typescript
type OperationType = "income" | "outcome"
```

**Descripción:** Tipo de operación financiera.
- `income`: Movimiento de entrada de dinero
- `outcome`: Movimiento de salida de dinero

---

### `Category`

```typescript
type Category = 
  | "suppliers"      // Pagos a proveedores
  | "sales"          // Ingresos por ventas
  | "operational"    // Gastos operacionales
  | "administrative" // Gastos administrativos
  | "others"         // Otros movimientos
```

**Descripción:** Categoría del movimiento financiero.

---

### `BusinessType`

```typescript
type BusinessType = "B2B" | "B2C"
```

**Descripción:** Segmento de negocio.
- `B2B`: Business-to-Business (relaciones comerciales entre empresas)
- `B2C`: Business-to-Consumer (relaciones comerciales con consumidores finales)

---

### `DateString`

```typescript
type DateString = string // ISO 8601 format: YYYY-MM-DD
```

**Descripción:** Fecha en formato ISO 8601 sin componente de hora.

**Ejemplos válidos:**
```
"2024-01-15"
"2025-12-31"
"2024-02-29"  // año bisiesto
```

---

## Modelos de Respuesta

### `FinancialMovement`

**Ubicación:** Respuesta de `/api/metrics` y otros endpoints de movimientos

```typescript
interface FinancialMovement {
  /**
   * Fecha de creación del movimiento (ISO 8601, sin hora).
   * @example "2024-01-15"
   */
  create_date: DateString

  /**
   * Monto del movimiento en unidades monetarias.
   * Siempre positivo; el tipo de operación determina si es entrada o salida.
   * @example 1250.50
   * @minimum 0
   */
  amount: number

  /**
   * Tipo de operación: entrada (income) o salida (outcome).
   */
  operation_type: OperationType

  /**
   * Categoría del movimiento.
   */
  category: Category

  /**
   * Segmento de negocio (B2B o B2C).
   */
  business_type: BusinessType
}
```

**Ejemplo JSON:**
```json
{
  "create_date": "2024-01-15",
  "amount": 1250.50,
  "operation_type": "income",
  "category": "sales",
  "business_type": "B2B"
}
```

---

### `KPIMetrics`

**Ubicación:** Cálculos derivados de movimientos (usado en el frontend)

```typescript
interface KPIMetrics {
  /**
   * Suma total de todos los movimientos de tipo "income".
   * @minimum 0
   */
  totalIncome: number

  /**
   * Suma total de todos los movimientos de tipo "outcome".
   * @minimum 0
   */
  totalOutcome: number

  /**
   * Ganancia neta: totalIncome - totalOutcome.
   * Puede ser negativo si hay más egresos que ingresos.
   */
  profit: number

  /**
   * Margen de ganancia porcentual: (profit / totalIncome) * 100.
   * Valor entre -∞ y +∞.
   * Si totalIncome es 0, el valor no se puede calcular.
   */
  profitPercent: number
}
```

**Ejemplo JSON:**
```json
{
  "totalIncome": 125000.00,
  "totalOutcome": 95000.00,
  "profit": 30000.00,
  "profitPercent": 24.0
}
```

---

### `MonthlyDataPoint`

**Ubicación:** Datos agregados mensualmente (usado en gráficas)

```typescript
interface MonthlyDataPoint {
  /**
   * Etiqueta del mes en formato corto.
   * @example "Jan", "Feb", "Mar"
   */
  month: string

  /**
   * Suma de todos los ingresos del mes.
   * @minimum 0
   */
  income: number

  /**
   * Suma de todos los egresos del mes.
   * @minimum 0
   */
  outcome: number

  /**
   * Margen de ganancia porcentual del mes: (profit / income) * 100.
   * Puede ser cualquier valor si income > 0.
   */
  profitPercent: number
}
```

**Ejemplo JSON:**
```json
{
  "month": "Jan",
  "income": 15000.00,
  "outcome": 10000.00,
  "profitPercent": 33.33
}
```

---

### `MetricsSummaryItem`

**Ubicación:** Respuesta de `/api/metrics/summary`

```typescript
interface MetricsSummaryItem {
  /**
   * Período de agrupación (día, semana o mes).
   * Formato depende de group_by:
   * - "day": YYYY-MM-DD
   * - "week": YYYY-WNN (ej: 2024-W05)
   * - "month": YYYY-MM (ej: 2024-01)
   */
  period: string

  /**
   * Suma de ingresos del período.
   * @minimum 0
   */
  income: number

  /**
   * Suma de egresos del período.
   * @minimum 0
   */
  outcome: number

  /**
   * Neto del período: income - outcome.
   */
  net: number
}
```

**Ejemplo JSON:**
```json
[
  {
    "period": "2024-01",
    "income": 15000.00,
    "outcome": 10000.00,
    "net": 5000.00
  },
  {
    "period": "2024-02",
    "income": 18000.00,
    "outcome": 12000.00,
    "net": 6000.00
  }
]
```

---

### `TopCategoryItem`

**Ubicación:** Respuesta de `/api/metrics/categories/top`

```typescript
interface TopCategoryItem {
  /**
   * Categoría financiera.
   */
  category: Category

  /**
   * Suma total de movimientos en esta categoría.
   * @minimum 0
   */
  total: number
}
```

**Ejemplo JSON:**
```json
[
  {
    "category": "suppliers",
    "total": 45000.00
  },
  {
    "category": "operational",
    "total": 32000.00
  },
  {
    "category": "administrative",
    "total": 15000.00
  }
]
```

---

### `MetricsComparison`

**Ubicación:** Respuesta de `/api/metrics/comparison`

```typescript
interface MetricsComparison {
  /**
   * Período actual especificado en la solicitud.
   * Formato: "YYYY-MM-DD a YYYY-MM-DD"
   */
  current_period: string

  /**
   * Período anterior equivalente (mismo número de días antes).
   * Formato: "YYYY-MM-DD a YYYY-MM-DD"
   */
  previous_period: string

  /**
   * Neto del período actual: income - outcome.
   */
  current_net: number

  /**
   * Neto del período anterior.
   */
  previous_net: number

  /**
   * Cambio en valor absoluto: current_net - previous_net.
   * Positivo = mejora
   */
  net_change: number

  /**
   * Cambio porcentual: (net_change / previous_net) * 100.
   * Puede ser ∞ si previous_net es 0.
   */
  percent_change: number
}
```

**Ejemplo JSON:**
```json
{
  "current_period": "2024-01-01 a 2024-01-31",
  "previous_period": "2023-12-01 a 2023-12-31",
  "current_net": 5000.00,
  "previous_net": 4500.00,
  "net_change": 500.00,
  "percent_change": 11.11
}
```

---

### `MetricsAlert`

**Ubicación:** Respuesta de `/api/metrics/alerts`

```typescript
interface MetricsAlert {
  /**
   * Período con gasto anómalo.
   * Formato depende de granularidad: "day", "week", "month"
   */
  period: string

  /**
   * Monto total de gastos en el período.
   * @minimum 0
   */
  total_outcome: number

  /**
   * Promedio histórico de gastos en períodos similares.
   * @minimum 0
   */
  average_outcome: number

  /**
   * Factor de desviación del promedio: total_outcome / average_outcome.
   * > 1.0 = gasto superior al promedio
   * = 1.0 = igual al promedio
   * < 1.0 = gasto inferior al promedio
   */
  deviation_factor: number

  /**
   * Porcentaje de desviación: (deviation_factor - 1) * 100.
   * Positivo = gasto superior
   * Negativo = gasto inferior
   */
  deviation_percent: number
}
```

**Ejemplo JSON:**
```json
[
  {
    "period": "2024-01-15",
    "total_outcome": 15000.00,
    "average_outcome": 10000.00,
    "deviation_factor": 1.5,
    "deviation_percent": 50.0
  },
  {
    "period": "2024-01-22",
    "total_outcome": 14000.00,
    "average_outcome": 10000.00,
    "deviation_factor": 1.4,
    "deviation_percent": 40.0
  }
]
```

---

### `MetricsFacets`

**Ubicación:** Respuesta de `/api/metrics/facets`

```typescript
interface MetricsFacets {
  /**
   * Rango de fechas de los datos disponibles.
   */
  date_range: {
    /**
     * Primera fecha con movimientos (ISO 8601).
     * @example "2024-01-01"
     */
    min: DateString

    /**
     * Última fecha con movimientos (ISO 8601).
     * @example "2024-12-31"
     */
    max: DateString
  }

  /**
   * Indica si hay movimientos de tipo B2B en los datos.
   */
  has_b2b: boolean

  /**
   * Indica si hay movimientos de tipo B2C en los datos.
   */
  has_b2c: boolean
}
```

**Ejemplo JSON:**
```json
{
  "date_range": {
    "min": "2024-01-01",
    "max": "2024-12-31"
  },
  "has_b2b": true,
  "has_b2c": true
}
```

---

## Parámetros Query

### `/api/metrics`

```typescript
interface GetMetricsParams {
  /**
   * Fecha inicial del rango (ISO 8601).
   * Incluyente. Si no se especifica, comienza desde el primer registro.
   * @example "2024-01-01"
   */
  start_date?: DateString

  /**
   * Fecha final del rango (ISO 8601).
   * Incluyente. Si no se especifica, termina en el último registro.
   * @example "2024-12-31"
   */
  end_date?: DateString

  /**
   * Filtrar por categoría de movimiento.
   * Si se omite, incluye todas las categorías.
   */
  category?: Category

  /**
   * Filtrar por tipo de operación.
   * Si se omite, incluye ingresos y gastos.
   */
  operation_type?: OperationType

  /**
   * Filtrar por tipo de negocio.
   * Si se omite, incluye ambos tipos (B2B y B2C).
   */
  business_type?: BusinessType
}
```

---

### `/api/metrics/summary`

```typescript
interface GetMetricsSummaryParams extends GetMetricsParams {
  /**
   * Granularidad temporal para agrupar datos.
   * @default "month"
   * @enum ["day", "week", "month"]
   */
  group_by?: "day" | "week" | "month"
}
```

---

### `/api/metrics/categories/top`

```typescript
interface GetTopCategoriesParams {
  /**
   * Tipo de operación a analizar.
   * @default "outcome"
   */
  operation_type?: OperationType

  /**
   * Número máximo de categorías a retornar.
   * @default 5
   * @minimum 1
   * @maximum 20
   */
  limit?: number

  /**
   * Fecha inicial del rango (ISO 8601).
   * @example "2024-01-01"
   */
  start_date?: DateString

  /**
   * Fecha final del rango (ISO 8601).
   * @example "2024-12-31"
   */
  end_date?: DateString

  /**
   * Filtrar por tipo de negocio.
   * Si se omite, incluye ambos tipos.
   */
  business_type?: BusinessType
}
```

---

### `/api/metrics/comparison`

```typescript
interface GetMetricsComparisonParams {
  /**
   * Inicio del período actual a comparar (ISO 8601).
   * Requerido. Incluyente.
   */
  start_date: DateString

  /**
   * Fin del período actual a comparar (ISO 8601).
   * Requerido. Incluyente.
   */
  end_date: DateString

  /**
   * Filtrar por tipo de negocio.
   * Si se omite, incluye ambos tipos.
   */
  business_type?: BusinessType
}
```

---

### `/api/metrics/alerts`

```typescript
interface GetMetricsAlertsParams {
  /**
   * Umbral de incremento para disparar alerta.
   * Expresado como factor decimal.
   * @default 0.3
   * @example 0.3 = 30% sobre promedio
   * @minimum 0
   */
  threshold?: number

  /**
   * Granularidad temporal para analizar anomalías.
   * @default "month"
   * @enum ["day", "week", "month"]
   */
  group_by?: "day" | "week" | "month"

  /**
   * Fecha inicial del rango (ISO 8601).
   * @example "2024-01-01"
   */
  start_date?: DateString

  /**
   * Fecha final del rango (ISO 8601).
   * @example "2024-12-31"
   */
  end_date?: DateString
}
```

---

### `/api/metrics/facets`

```typescript
// Este endpoint no tiene parámetros query
// Se incluye la interfaz vacía para completitud

interface GetMetricsFacetsParams {
  // Sin parámetros
}
```

---

## Códigos de Error HTTP

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| **200** | Éxito. Respuesta contiene datos válidos. | — |
| **400** | Solicitud inválida. Parámetros mal formados. | `start_date=invalid-date` |
| **422** | Validación fallida. Parámetros fuera de rango. | `limit=100` (máximo es 20) |
| **500** | Error interno del servidor. | Error inesperado en backend |

---

## Convenciones de Datos

### Rondeo de Moneda

Todos los valores monetarios (`amount`, `income`, `outcome`, `profit`, etc.) se redondean a **2 decimales**.

**Ejemplos:**
```json
{
  "amount": 1250.50,
  "totalIncome": 125000.00,
  "profit": 30000.00,
  "profitPercent": 24.0
}
```

### Formato de Período (Resúmenes)

Los períodos de agrupación dependen de `group_by`:

| Granularidad | Formato | Ejemplo | Rango |
|-------------|---------|---------|-------|
| **day** | YYYY-MM-DD | 2024-01-15 | Un día calendario |
| **week** | YYYY-WNN | 2024-W03 | Semana ISO (lunes a domingo) |
| **month** | YYYY-MM | 2024-01 | Mes calendario completo |

---

## Notas Importantes

### Zona Horaria

Todas las fechas se interpretan como **zona horaria UTC**. Las fechas ISO sin componente de hora se tratan como inicio del día en UTC: `2024-01-15` = `2024-01-15T00:00:00Z`.

**Riesgo documentado:** En zonas horarias al oeste de UTC (ej: EST), una fecha sin hora puede agruparse en el mes anterior si se interpreta con `new Date()` sin especificar zona horaria.

### Generación de Datos

En desarrollo, todos los endpoints usan `generate_mock_movements(seed=42)` para garantizar datos consistentes y predecibles. Este comportamiento es específico del ambiente de desarrollo y no reflejaría datos reales.

### Movimientos Inmovilizados

Dentro de cada mes o período, los movimientos se mantienen en **orden cronológico** (por `create_date`) automáticamente en las respuestas.

---

## Mapeo Frontend ↔ Backend

| Frontend | Backend | Propósito |
|----------|---------|-----------|
| `KPIMetrics` | Resultado de `computeKPIs()` sobre movimientos | Tarjetas de indicadores |
| `MonthlyDataPoint[]` | Resultado de `computeMonthlyData()` | Gráficas de líneas |
| `FinancialMovement[]` | `/api/metrics` | Datos brutos |

---

## Validación en Desarrollo

**Verificar tipos:**

```bash
# Backend (Pydantic en FastAPI)
cd backend
python -m pytest tests/test_routes.py -v

# Frontend (TypeScript en Vite)
cd frontend
npm run build
npm run test
```

**Verificar respuestas reales:**

```bash
# Iniciar servicios
docker compose up --build

# Probar endpoints
curl http://localhost:8000/docs               # Swagger interactivo
curl http://localhost:8000/api/metrics        # Movimientos brutos
curl http://localhost:8000/api/metrics/facets # Metadatos
```

---

**Versión:** 1.0  
**Última actualización:** 2026-11-18  
**Responsable de cambios:** PM + Backend Team
