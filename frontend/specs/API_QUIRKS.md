# API Quirks & Workarounds para Frontend

**Última actualización:** 2026-11-18  
**Audiencia:** Equipo Frontend  
**Estado:** ⚠️ Documento de transición (ver DESAJUSTES_PM_VS_API.md para contexto)

---

## ⚠️ Comportamientos Inesperados Conocidos

### #1: `category` NO FILTRA en `/api/metrics/summary`

**Problema:**
```javascript
// NO FUNCIONA COMO SE ESPERA:
const response = await fetch(
  `/api/metrics/summary?category=suppliers`
);
// Resultado: Resumen de TODOS los movimientos, no solo suppliers
```

**Workaround ACTUAL:**
```javascript
// OPCIÓN A: Usar /api/metrics + filtrar en frontend
const allMovements = await fetch(`/api/metrics?category=suppliers`);
const movements = allMovements.json();
// Luego agrupar por período manualmente en JavaScript

// OPCIÓN B: Usar /api/metrics/categories/top
// (Si lo que necesitas es "cuál es la categoría más cara")
const topCategories = await fetch(
  `/api/metrics/categories/top?operation_type=outcome`
);
```

**Estado:** 🔴 EN REPARACIÓN  
**ETA de fix:** Próxima semana  

**Una vez corregido:**
```javascript
// FUNCIONARÁ COMO ESPERADO:
const response = await fetch(
  `/api/metrics/summary?category=suppliers`
);
// Resultado: Resumen SOLO de suppliers
```

---

### #2: Endpoints `/api/metrics/b2b` y `/api/metrics/b2c` SON VÁLIDOS pero NO DOCUMENTADOS

**Situación:**
Estos endpoints funcionan perfectamente, pero no estaban en la especificación `MAPEO_ENDPOINTS.md`.

```javascript
// ✅ ESTO FUNCIONA (aunque no esté documentado):
const b2bMovements = await fetch(`/api/metrics/b2b`);
const b2cMovements = await fetch(`/api/metrics/b2c`);

// Es equivalente a:
const movements = await fetch(`/api/metrics?business_type=B2B`);
```

**Recomendación:**
Ambas formas son válidas. Usa la que sientas más legible:

- **Más explícita:** `GET /api/metrics/b2b`
- **Más flexible:** `GET /api/metrics?business_type=B2B` (porque puedes combinar con otros filtros)

**Estado:** ✅ DOCUMENTADA  
Ahora aparece en `MAPEO_ENDPOINTS.md` bajo "Funcionalidad 4"

---

### #3: `business_type` NO ESTABA DOCUMENTADO en `/api/metrics/summary` (pero funciona)

**Situación:**
El parámetro funciona pero no estaba en la especificación original.

```javascript
// ✅ ESTO FUNCIONA (aunque no esté en docs):
const b2bSummary = await fetch(
  `/api/metrics/summary?business_type=B2B`
);
// Resumen solo de movimientos B2B
```

**Estado:** ✅ DOCUMENTADA  
Ahora aparece en la tabla de parámetros de `/api/metrics/summary`

---

## 🎯 Guía de Uso Recomendado (Mientras se reparan desajustes)

### Para obtener Resumen Filtrado por Categoría

**Necesidad:** "Quiero ver el resumen de gastos, pero SOLO de suppliers"

**Hoy (hasta que se repare):**
```javascript
// Paso 1: Obtener todos los movimientos de suppliers
const response = await fetch(`/api/metrics?category=suppliers&operation_type=outcome`);
const movements = await response.json();

// Paso 2: Agrupar por período en frontend
const summary = movements.reduce((acc, mov) => {
  const period = mov.create_date.slice(0, 7); // "2024-01"
  if (!acc[period]) acc[period] = { income: 0, outcome: 0 };
  acc[period][mov.operation_type] += mov.amount;
  return acc;
}, {});

// Resultado:
// {
//   "2024-01": { income: 1200, outcome: 5600 },
//   "2024-02": { income: 0, outcome: 8900 },
// }
```

**Después del fix:** Podrás usar directamente:
```javascript
const summary = await fetch(
  `/api/metrics/summary?category=suppliers`
).then(r => r.json());
```

---

### Para obtener Top Categorías

**Necesidad:** "Cuáles son mis 5 categorías de gasto más grandes"

**Hoy (y siempre):**
```javascript
const topCategories = await fetch(
  `/api/metrics/categories/top?operation_type=outcome&limit=5`
).then(r => r.json());

// Respuesta:
// [
//   { category: "suppliers", operation_type: "outcome", total_amount: 125430.50 },
//   { category: "operational", operation_type: "outcome", total_amount: 89650.25 },
//   ...
// ]
```

✅ Este endpoint funciona perfectamente, úsalo sin dudas.

---

### Para Comparar Períodos

**Necesidad:** "Comparar enero 2025 vs diciembre 2024"

```javascript
const comparison = await fetch(
  `/api/metrics/comparison?start_date=2025-01-01&end_date=2025-01-31`
).then(r => r.json());

// Respuesta:
// {
//   current_period: 16289.75,     // enero 2025
//   previous_period: 14520.50,    // diciembre 2024 (período anterior equivalente)
//   delta_abs: 1769.25,
//   delta_pct: 12.19
// }
```

✅ Este endpoint funciona perfectamente, úsalo sin dudas.

---

### Para Detectar Alertas de Gasto Anómalo

**Necesidad:** "Alertarme si un mes gasto mucho más que lo normal"

```javascript
const alerts = await fetch(
  `/api/metrics/alerts?threshold=0.3&group_by=month`
).then(r => r.json());

// threshold=0.3 significa "alertar si gastos > 30% sobre promedio"

// Respuesta:
// [
//   {
//     period: "2024-03",
//     outcome_total: 48500.75,
//     baseline_average: 32150.50,
//     increase_ratio: 0.5089  // 50.89% más que promedio
//   }
// ]
```

✅ Este endpoint funciona perfectamente, úsalo sin dudas.

---

## 📊 Matriz de Endpoints: Qué Funciona y Qué No

| Endpoint | Funciona | Documentado | Notas |
|----------|----------|------------|-------|
| `GET /api/metrics` | ✅ | ✅ | Datos brutos, todos los filtros funcionan |
| `GET /api/metrics/facets` | ✅ | ✅ | Opciones de filtros disponibles |
| `GET /api/metrics/summary` | ⚠️ Parcial | ✅ | ⚠️ `category` NO filtra (en reparación) |
| `GET /api/metrics/summary?business_type=...` | ✅ | ⚠️ Faltaba | ✅ Ahora documentado |
| `GET /api/metrics/categories/top` | ✅ | ✅ | Funciona perfecto |
| `GET /api/metrics/comparison` | ✅ | ✅ | Funciona perfecto |
| `GET /api/metrics/alerts` | ✅ | ✅ | Funciona perfecto |
| `GET /api/metrics/b2b` | ✅ | ⚠️ Faltaba | ✅ Ahora documentado |
| `GET /api/metrics/b2c` | ✅ | ⚠️ Faltaba | ✅ Ahora documentado |
| `GET /health` | ✅ | ✅ | Verifica que backend está vivo |

---

## 🔗 Referencias

- **Especificaciones:** [MAPEO_ENDPOINTS.md](../MAPEO_ENDPOINTS.md)
- **Desajustes identificados:** [DESAJUSTES_PM_VS_API.md](./DESAJUSTES_PM_VS_API.md)
- **Plan de reparación:** [PLAN_REMEDIACION.md](./PLAN_REMEDIACION.md)

---

## ❓ Si algo no funciona como esperas

1. Revisa esta tabla de "Qué Funciona"
2. Consulta [DESAJUSTES_PM_VS_API.md](./DESAJUSTES_PM_VS_API.md) para más contexto
3. Pregunta a @backend-team si es algo no documentado aquí
4. No es un bug tuyo — es un desajuste conocido

