# Plan de Remediación de Desajustes API

**Estado:** Propuesta de remediación  
**Responsables:** Backend + PM  
**Prioridad:** Alta (bloquea desarrollo frontend confiable)

---

## 🎯 Objetivo

Alinear completamente la especificación documentada (`MAPEO_ENDPOINTS.md`) con la implementación real en `backend/app/routes.py`, para que:

1. ✅ Clientes externos usen la API con confianza
2. ✅ Frontend tenga acceso a todas las capacidades reales
3. ✅ Cambios futuros se coordinen entre PM y backend

---

## 📊 Análisis de Impacto por Desajuste

### **Desajuste #1: `business_type` NO DOCUMENTADO en `/api/metrics/summary`**

#### Situación Actual:
```bash
# IMPLEMENTADO en backend:
curl "http://localhost:8000/api/metrics/summary?business_type=B2B"
# ✅ Funciona, pero NO ESTÁ EN ESPECIFICACIONES
```

#### Impacto:
- Frontend podría beneficiarse de este filtro pero no sabe que existe
- Documentación de Swagger en `/docs` lo mostrará de todas formas

#### Solución Recomendada:
**Actualizar `MAPEO_ENDPOINTS.md`** — Agregar `business_type` a la tabla de parámetros:

```markdown
| `business_type` | `"B2B" \| "B2C"` | `null` | - | Filtrar por tipo de negocio |
```

**Cambios necesarios:** Solo documentación (0 líneas de código backend)

---

### **Desajuste #2: Parámetro `category` ACEPTADO pero IGNORADO en `/api/metrics/summary`**

#### Situación Actual:
```bash
# ESPECIFICADO:
curl "http://localhost:8000/api/metrics/summary?category=suppliers"

# REAL: Se acepta pero se ignora
# Resultado: Resumen de TODOS los tipos, no solo suppliers
```

#### Código Problemático:
```python
# En routes.py línea ~180:
filtered = filter_movements(
    movements, start_date, end_date, 
    category=None,  # ⚠️ SIEMPRE None
    operation_type=operation_type
)
```

#### Impacto:
- 🔴 **Crítico:** Clientes esperan que `category` filtre, pero no lo hace
- Comportamiento impredecible si alguien intenta usarlo
- Tests podrían no cubrir este caso

#### Dos Opciones de Solución:

**OPCIÓN A: Habilitar filtrado por `category`** (3 minutos de código)

Cambiar línea en `routes.py:180`:
```python
# DE:
filtered = filter_movements(
    movements, start_date, end_date, 
    category=None,  # ⚠️ SIEMPRE None
    operation_type=operation_type
)

# A:
filtered = filter_movements(
    movements, start_date, end_date, 
    category=category,  # ✅ USAR EL PARÁMETRO
    operation_type=operation_type
)
```

**Ventaja:** Consigue que el parámetro funcione como se promete  
**Desventaja:** Ligeramente mayor consumo de CPU (menos movimientos a resumir)  
**Cambios necesarios:** 1 línea de código backend

---

**OPCIÓN B: Remover `category` de especificaciones** (10 minutos de doc)

Cambiar `MAPEO_ENDPOINTS.md`:
```markdown
# QUITAR de la tabla de parámetros:
| `category` | `"suppliers" | "sales" | ...` | `null` | - | Filtrar por categoría |

# ACLARAR EN NOTAS:
Para filtrar por categoría específica dentro de un resumen:
1. Usar GET /api/metrics con category filter
2. Luego agrupar manualmente en el frontend
3. O usar GET /api/metrics/categories/top para análisis por categoría
```

**Ventaja:** Especificación más clara, sin falsas promesas  
**Desventaja:** Menos flexible (requiere 2 llamadas en lugar de 1)  
**Cambios necesarios:** Solo actualizar `MAPEO_ENDPOINTS.md`

---

**RECOMENDACIÓN FINAL:** **OPCIÓN A** (habilitar en backend)  
Razón: Transparencia y consistencia. Si se documentó, debe funcionar.

---

### **Desajuste #3 y #4: Endpoints `/api/metrics/b2b` y `/api/metrics/b2c` NO DOCUMENTADOS**

#### Situación Actual:
```bash
# IMPLEMENTADO pero NO DOCUMENTADO:
curl "http://localhost:8000/api/metrics/b2b?start_date=2025-01-01"
# ✅ Funciona perfectamente

# Pero en MAPEO_ENDPOINTS.md:
# ❌ No aparecen en la lista de endpoints disponibles
```

#### Código Real:
```python
@router.get("/api/metrics/b2b", response_model=list[FinancialMovement])
def get_b2b_metrics(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    category: Category | None = Query(default=None),
    operation_type: OperationType | None = Query(default=None),
) -> list[FinancialMovement]:
    movements = [
        movement for movement in generate_mock_movements(seed=42) 
        if movement.business_type == "B2B"
    ]
    filtered = filter_movements(
        movements, start_date, end_date, category, operation_type
    )
    return ensure_chronological_order(filtered)
```

#### Impacto:
- 🔴 **Crítico:** Endpoints funcionales están invisibles
- Frontend no sabe que puede usarlos directamente
- Duplicación de funcionalidad (similar a usar `/api/metrics` + filtrar `business_type`)

#### Solución Recomendada:
**Opción 1: Documentar completamente** (Usar tal como están)

Agregar a `MAPEO_ENDPOINTS.md`:

```markdown
## Funcionalidad 4: Acceso Rápido por Tipo de Negocio

### 🏢 GET `/api/metrics/b2b`
**Propósito:** Acceso rápido a movimientos B2B (equivalente a /api/metrics?business_type=B2B).

#### Parámetros Query:
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `start_date` | `date (YYYY-MM-DD)` | `null` | Fecha inicial (opcional) |
| `end_date` | `date (YYYY-MM-DD)` | `null` | Fecha final (opcional) |
| `category` | `"suppliers" \| ...` | `null` | Filtrar por categoría |
| `operation_type` | `"income" \| "outcome"` | `null` | Filtrar por tipo de operación |

#### Respuesta Exitosa (200 OK):
```json
[
  {
    "create_date": "2024-01-07",
    "amount": 3245.50,
    "operation_type": "income",
    "category": "sales",
    "business_type": "B2B"
  }
]
```

### 👥 GET `/api/metrics/b2c`
**Propósito:** Acceso rápido a movimientos B2C.

(Parámetros y respuesta idénticos a /api/metrics/b2b, solo filtra business_type=B2C)
```

**Ventaja:** Documenta funcionalidad existente, muy útil para clientes  
**Desventaja:** Endpoints duplicados (redundancia con `business_type` en `/api/metrics`)  
**Cambios necesarios:** Solo actualizar `MAPEO_ENDPOINTS.md`

---

**Opción 2: Deprecar y remover** (Eliminar endpoints)

Cambios:
1. Remover `@router.get("/api/metrics/b2b")` y su función
2. Remover `@router.get("/api/metrics/b2c")` y su función
3. Especificar en documentación que se use `/api/metrics?business_type=B2B` en su lugar

**Ventaja:** Menos código duplicado, menos mantenimiento  
**Desventaja:** Endpoints ya pueden estar en uso por clientes  
**Cambios necesarios:** Cambios de código backend

---

**RECOMENDACIÓN FINAL:** **Opción 1** (Documentar completamente)  
Razón: No sabemos quién ya usa estos endpoints. Mejor documentar que remover sin previo aviso.

---

## 🔧 Tabla de Cambios Propuestos

| Cambio | Componente | Acción | Tiempo | Prioridad |
|--------|-----------|--------|--------|-----------|
| `business_type` en `/api/metrics/summary` | MAPEO_ENDPOINTS.md | Agregar a tabla de parámetros | 5 min | 🟡 Media |
| `category` en `/api/metrics/summary` | backend/app/routes.py | Cambiar `category=None` → `category=category` (línea 180) | 2 min | 🔴 Alta |
| `category` en `/api/metrics/summary` | backend/tests/test_routes.py | Agregar test que verifique filtrado por category | 10 min | 🔴 Alta |
| `/api/metrics/b2b` y `/api/metrics/b2c` | MAPEO_ENDPOINTS.md | Crear Funcionalidad 4 con ambos endpoints | 15 min | 🔴 Alta |

---

## 📋 Checklist de Implementación

### Fase 1: Correcciones Críticas (Backend)

- [ ] **Habilitar filtrado por `category` en `/api/metrics/summary`**
  - Archivo: `backend/app/routes.py` línea ~180
  - Cambio: `category=None` → `category=category`
  - Verificación: Probar manualmente en curl o tests

- [ ] **Agregar test para `category` en `/api/metrics/summary`**
  - Archivo: `backend/tests/test_routes.py`
  - Caso: Verificar que `?category=suppliers` filtra correctamente
  - Ejecución: `pytest backend/tests/test_routes.py -v`

### Fase 2: Actualización de Especificaciones (Documentación)

- [ ] **Actualizar `MAPEO_ENDPOINTS.md`**
  - Agregar `business_type` a tabla de `/api/metrics/summary`
  - Crear Funcionalidad 4 para B2B/B2C endpoints
  - Verificar ejemplos curl funcionan
  - Revisar con PM

### Fase 3: Comunicación

- [ ] **Notificar al equipo frontend**
  - Nuevas capacidades disponibles
  - Cambios en comportamiento de `/api/metrics/summary`

- [ ] **Actualizar documentación pública** (si existe)
  - Swagger docs en `/docs` se actualizarán automáticamente

---

## 🧪 Verificación Post-Implementación

### Test Manual:

```bash
# 1. Verificar category filtra en summary
curl "http://localhost:8000/api/metrics/summary?category=suppliers" | jq

# Esperado: Resumen que solo incluye movimientos de suppliers
# Actual (antes del fix): Resumen de TODOS
# Actual (después del fix): Resumen solo de suppliers

# 2. Verificar business_type en summary (ya funciona, solo documentar)
curl "http://localhost:8000/api/metrics/summary?business_type=B2B" | jq

# 3. Verificar endpoints B2B/B2C siguen funcionando
curl "http://localhost:8000/api/metrics/b2b" | jq '.[] | .business_type' | sort | uniq
# Esperado: "B2B" (solo este valor)

curl "http://localhost:8000/api/metrics/b2c" | jq '.[] | .business_type' | sort | uniq
# Esperado: "B2C" (solo este valor)
```

### Test Automatizado:

```bash
cd backend
pytest tests/test_routes.py -v -k summary
pytest tests/test_routes.py -v -k b2b
pytest tests/test_routes.py -v -k b2c
```

---

## 📝 Notas de Implementación

1. **Seed de datos:** Ambos endpoints usan `seed=42`, por lo que los datos son predecibles
2. **Sin base de datos:** Todo es generado. Los cambios se aplicarán instantáneamente
3. **Sin cambios de DB schema:** No hay migraciones necesarias
4. **Compatibilidad hacia atrás:** No se rompen endpoints existentes

---

## 🚀 Timeline Propuesto

| Fase | Duración | Responsable |
|------|----------|-------------|
| Fase 1 (Backend) | 15 minutos | Backend dev |
| Fase 2 (Docs) | 20 minutos | PM + Backend dev |
| Fase 3 (Comunicación) | 5 minutos | PM |
| Total | ~40 minutos | — |

