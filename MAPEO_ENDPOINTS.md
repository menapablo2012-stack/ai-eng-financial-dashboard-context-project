# Mapeo de Endpoints - Financial Metrics API

**Última actualización:** 2026-11-18  
**Cambios:** 
- ✅ Confirmado: Parámetro `category` en `/api/metrics/summary` funciona correctamente
- ✅ Confirmado: Parámetro `business_type` en `/api/metrics` disponible
- ✅ Deprecado: Endpoints `/api/metrics/b2b` y `/api/metrics/b2c` removidos (usar `?business_type=X`)
- ✅ Aclarado: Propósito de `/api/metrics/facets` es data availability

## Visión General
Backend basado en **FastAPI** (Puerto 8000) con 6 endpoints principales organizados en 3 funcionalidades principales.

**Referencia de tipos:** Ver [API_TYPES.md](./frontend/specs/API_TYPES.md) para especificación formal de todos los tipos de entrada/salida.

---

## Funcionalidad 1: Resumen Financiero (Income vs. Outcome)

### 📊 GET `/api/metrics/summary`
**Propósito:** Obtener resumen de ingresos/gastos agrupados por período.

#### Parámetros Query:
| Parámetro | Tipo | Default | Rango | Descripción |
|-----------|------|---------|-------|-------------|
| `group_by` | `"day" \| "week" \| "month"` | `"month"` | - | Granularidad temporal |
| `start_date` | `date (YYYY-MM-DD)` | `null` | - | Fecha inicial (opcional) |
| `end_date` | `date (YYYY-MM-DD)` | `null` | - | Fecha final (opcional) |
| `category` | `"suppliers" \| "sales" \| "operational" \| "administrative" \| "others"` | `null` | - | Filtrar por categoría |
| `operation_type` | `"income" \| "outcome"` | `null` | - | Filtrar por tipo de operación |
| `business_type` | `"B2B" \| "B2C"` | `null` | - | Filtrar por tipo de negocio |

#### Respuesta Exitosa (200 OK):
```json
[
  {
    "period": "2025-01",
    "income": 45230.50,
    "outcome": 28940.75,
    "net": 16289.75
  },
  {
    "period": "2025-02",
    "income": 52100.00,
    "outcome": 31500.25,
    "net": 20599.75
  }
]
```

#### Ejemplo de Uso:
```bash
# Resumen mensual completo
curl "http://localhost:8000/api/metrics/summary"

# Resumen diario de enero de 2025
curl "http://localhost:8000/api/metrics/summary?group_by=day&start_date=2025-01-01&end_date=2025-01-31"

# Resumen semanal de ventas (income) solo B2C
curl "http://localhost:8000/api/metrics/summary?group_by=week&operation_type=income&business_type=B2C"

# Gastos de proveedores (suppliers)
curl "http://localhost:8000/api/metrics/summary?operation_type=outcome&category=suppliers"
```

---

## Funcionalidad 2: Análisis de Categorías

### 📈 GET `/api/metrics/categories/top`
**Propósito:** Obtener categorías principales por monto de movimientos.

#### Parámetros Query:
| Parámetro | Tipo | Default | Rango | Descripción |
|-----------|------|---------|-------|-------------|
| `operation_type` | `"income" \| "outcome"` | `"outcome"` | - | Tipo de operación a analizar |
| `limit` | `integer` | `5` | 1-20 | Número máximo de categorías |
| `start_date` | `date (YYYY-MM-DD)` | `null` | - | Fecha inicial (opcional) |
| `end_date` | `date (YYYY-MM-DD)` | `null` | - | Fecha final (opcional) |
| `business_type` | `"B2B" \| "B2C"` | `null` | - | Filtrar por tipo de negocio |

#### Respuesta Exitosa (200 OK):
```json
[
  {
    "category": "suppliers",
    "operation_type": "outcome",
    "total_amount": 125430.50
  },
  {
    "category": "operational",
    "operation_type": "outcome",
    "total_amount": 89650.25
  },
  {
    "category": "administrative",
    "operation_type": "outcome",
    "total_amount": 54320.00
  }
]
```

#### Ejemplo de Uso:
```bash
# Top 5 categorías de gastos
curl "http://localhost:8000/api/metrics/categories/top"

# Top 3 categorías de ingresos
curl "http://localhost:8000/api/metrics/categories/top?operation_type=income&limit=3"

# Top 10 categorías de gastos en 2025 de negocios B2B
curl "http://localhost:8000/api/metrics/categories/top?limit=10&business_type=B2B&start_date=2025-01-01&end_date=2025-12-31"
```

---

## Funcionalidad 3: Comparación y Alertas

### 🔀 GET `/api/metrics/comparison`
**Propósito:** Comparar valor neto del período actual vs período anterior equivalente.

#### Parámetros Query:
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `start_date` | `date (YYYY-MM-DD)` | ✅ Sí | Inicio del período actual |
| `end_date` | `date (YYYY-MM-DD)` | ✅ Sí | Fin del período actual |
| `business_type` | `"B2B" \| "B2C"` | ❌ No | Filtrar por tipo de negocio |

#### Respuesta Exitosa (200 OK):
```json
{
  "current_period": 16289.75,
  "previous_period": 14520.50,
  "delta_abs": 1769.25,
  "delta_pct": 12.19
}
```

#### Ejemplo de Uso:
```bash
# Comparar enero 2025 con diciembre 2024
curl "http://localhost:8000/api/metrics/comparison?start_date=2025-01-01&end_date=2025-01-31"

# Comparar trimestre B2B
curl "http://localhost:8000/api/metrics/comparison?start_date=2025-01-01&end_date=2025-03-31&business_type=B2B"

# Comparar última semana
curl "http://localhost:8000/api/metrics/comparison?start_date=2025-02-10&end_date=2025-02-16"
```

### 🚨 GET `/api/metrics/alerts`
**Propósito:** Detectar períodos con gastos anormalmente altos.

#### Parámetros Query:
| Parámetro | Tipo | Default | Rango | Descripción |
|-----------|------|---------|-------|-------------|
| `threshold` | `float` | `0.3` | ≥0 | Umbral de incremento (ej: 0.3 = 30% sobre promedio) |
| `group_by` | `"day" \| "week" \| "month"` | `"month"` | - | Granularidad temporal |
| `start_date` | `date (YYYY-MM-DD)` | `null` | - | Fecha inicial (opcional) |
| `end_date` | `date (YYYY-MM-DD)` | `null` | - | Fecha final (opcional) |
| `business_type` | `"B2B" \| "B2C"` | `null` | - | Filtrar por tipo de negocio |

#### Respuesta Exitosa (200 OK):
```json
[
  {
    "period": "2025-03",
    "outcome_total": 48500.75,
    "baseline_average": 32150.50,
    "increase_ratio": 0.5089
  },
  {
    "period": "2025-05",
    "outcome_total": 42300.00,
    "baseline_average": 29450.25,
    "increase_ratio": 0.4356
  }
]
```

#### Ejemplo de Uso:
```bash
# Alertas de gastos con umbral 30% (default)
curl "http://localhost:8000/api/metrics/alerts"

# Alertas diarias con umbral 50%
curl "http://localhost:8000/api/metrics/alerts?threshold=0.5&group_by=day"

# Alertas semanales en 2025, solo B2C
curl "http://localhost:8000/api/metrics/alerts?group_by=week&start_date=2025-01-01&end_date=2025-12-31&business_type=B2C"
```

---

## Endpoints de Soporte

### 🏥 GET `/health`
**Propósito:** Verificar que el backend está operativo.

#### Respuesta Exitosa (200 OK):
```json
{
  "status": "ok"
}
```

### 📋 GET `/api/metrics/facets`
**Propósito:** Obtener información de disponibilidad de datos: rango de fechas y presencia de datos por tipo de negocio.

**Uso Recomendado:** El frontend puede usarlo para:
- Validar rango de fechas disponibles (rellenar date pickers)
- Detectar si existen datos B2B/B2C antes de mostrar filtros asociados

#### Parámetros Query:
Ninguno

#### Respuesta Exitosa (200 OK):
```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2024-01-07",
  "max_date": "2024-12-28"
}
```

#### Interpretación:
- `operation_types`: Lista de tipos de operación presentes en los datos (siempre ["income", "outcome"])
- `business_types`: Lista de tipos de negocio presentes (ej: si solo hay B2B, retorna ["B2B"])
- `categories`: Categorías disponibles en los datos
- `min_date` / `max_date`: Rango de fechas de los movimientos

### 📊 GET `/api/metrics`
**Propósito:** Obtener datos brutos de movimientos financieros.

#### Parámetros Query:
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `start_date` | `date (YYYY-MM-DD)` | `null` | Fecha inicial (opcional) |
| `end_date` | `date (YYYY-MM-DD)` | `null` | Fecha final (opcional) |
| `category` | `string` | `null` | Filtrar por categoría |
| `operation_type` | `"income" \| "outcome"` | `null` | Filtrar por tipo de operación |
| `business_type` | `"B2B" \| "B2C"` | `null` | Filtrar por tipo de negocio |

#### Respuesta Exitosa (200 OK):
```json
[
  {
    "create_date": "2024-01-07",
    "amount": 3245.50,
    "operation_type": "income",
    "category": "sales",
    "business_type": "B2B"
  },
  {
    "create_date": "2024-01-10",
    "amount": 1200.00,
    "operation_type": "outcome",
    "category": "suppliers",
    "business_type": "B2C"
  }
]
```

---

## Tipos de Datos

```typescript
// OperationType
"income" | "outcome"

// Category
"suppliers" | "sales" | "operational" | "administrative" | "others"

// BusinessType
"B2B" | "B2C"

// GroupBy
"day" | "week" | "month"

// Date Format
"YYYY-MM-DD"
```

---

## Respuestas de Error

### 400 Bad Request
```json
{
  "detail": [
    {
      "loc": ["query", "limit"],
      "msg": "ensure this value is less than or equal to 20",
      "type": "value_error.number.not_le"
    }
  ]
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["query", "start_date"],
      "msg": "value is not a valid date",
      "type": "type_error.date"
    }
  ]
}
```

---

## Configuración de CORS

✅ Permite orígenes: **todos** (`*`)  
✅ Permite credenciales: **sí**  
✅ Permite métodos: **todos**  
✅ Permite headers: **todos**

Ideal para desarrollo local y testing cross-domain.
