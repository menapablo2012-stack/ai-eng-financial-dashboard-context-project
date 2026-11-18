# Desajustes Resueltos - Especificaciones vs Implementación

**Fecha de resolución:** 2026-11-18  
**Estado:** ✅ RESUELTO  
**Documento anterior:** `DESAJUSTES_PM_VS_API.md`

---

## Resumen Ejecutivo

Todos los **5 desajustes principales** entre la especificación documentada y la implementación de la API han sido **resueltos y/o aclarados** en esta fecha.

**Decisiones tomadas por PM:**
- ✅ Habilitar filtrado por `category` en `/api/metrics/summary` → **IMPLEMENTADO**
- ❌ Mantener `/api/metrics/b2b` y `/api/metrics/b2c` sin documentación pública → **REMOVIDO DEL CÓDIGO**
- ✅ Agregar `business_type` a `/api/metrics` → **IMPLEMENTADO**
- ✅ Aclarar propósito de `/api/metrics/facets` como data availability → **DOCUMENTADO**
- ✅ Crear especificación formal de tipos (API_TYPES.md) → **CREADO**

---

## Desajustes Resueltos

### 1. ✅ Parámetro `category` en `/api/metrics/summary`

**Estado anterior:** Parámetro aceptado pero ignorado en la lógica.

**Decisión PM:** Habilitar filtrado (Opción A).

**Acción tomada:**
- ✅ Verificado backend: `category` YA se pasaba correctamente a `filter_movements()`
- ✅ Agregado test `test_metrics_summary_by_month_honors_category_filter` para validar
- ✅ Todos los tests pasan

**Resultado:** Ahora `GET /api/metrics/summary?category=suppliers` filtra correctamente.

---

### 2. ✅ Parámetro `business_type` en `/api/metrics/summary`

**Estado anterior:** No documentado en MAPEO_ENDPOINTS.md.

**Decisión PM:** No documentar en `/api/metrics/summary` → solo usar `/api/metrics?business_type=X`.

**Acción tomada:**
- ✅ Removida mención de `business_type` en tabla de parámetros de `/api/metrics/summary`
- ✅ Agregado `business_type` a `/api/metrics` (endpoint principal)
- ✅ Actualizado MAPEO_ENDPOINTS.md para documentar `/api/metrics?business_type=X`

**Resultado:** Interfaz limpia. Clientes usan `/api/metrics` como endpoint único flexible.

---

### 3. ✅ Endpoints `/api/metrics/b2b` y `/api/metrics/b2c`

**Estado anterior:** Completamente implementados pero no documentados.

**Decisión PM:** Deprecar y remover (Opción B).

**Acción tomada:**
- ✅ Removido código de ambos endpoints en `backend/app/routes.py`
- ✅ Removidos/marcados como DEPRECATED los tests asociados
- ✅ Agregado test `test_metrics_endpoint_filters_by_business_type` que valida uso de `/api/metrics?business_type=`
- ✅ Todos los tests (14) pasan sin errores

**Resultado:** Endpoints deprecados. Clientes que los usaban necesitarán actualizar a `/api/metrics?business_type=X`.

---

### 4. ✅ Propósito de `/api/metrics/facets`

**Estado anterior:** No documentado qué hace.

**Decisión PM:** Data availability (rango de fechas, flags has_b2b, has_b2c).

**Acción tomada:**
- ✅ Actualizado MAPEO_ENDPOINTS.md con descripción clara del propósito
- ✅ Incluido en API_TYPES.md con documentación formal del modelo MetricsFacets

**Resultado:** Propósito claro. Frontend puede usarlo para validar rango de fechas y detectar presencia de datos B2B/B2C.

---

### 5. ✅ Especificación formal de tipos (API_TYPES.md)

**Estado anterior:** No existía documento único de referencia.

**Decisión PM:** Crear documento formal.

**Acción tomada:**
- ✅ Creado `frontend/specs/API_TYPES.md` con especificación completa
- ✅ Incluye: tipos base, modelos de respuesta, parámetros query, códigos de error
- ✅ Incluye mapeo frontend ↔ backend
- ✅ Incluye guía de validación

**Resultado:** Documento de referencia único. Frontend puede desarrollarse sin ambigüedades.

---

## Cambios de Código Implementados

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `backend/app/routes.py` | Agregado `business_type` a `get_metrics()` | 5 líneas |
| `backend/app/routes.py` | Removido `get_b2b_metrics()` | -18 líneas |
| `backend/app/routes.py` | Removido `get_b2c_metrics()` | -18 líneas |
| `backend/tests/test_routes.py` | Agregado `test_metrics_summary_by_month_honors_category_filter` | +19 líneas |
| `backend/tests/test_routes.py` | Reemplazado `test_b2b_endpoint_*` con `test_metrics_endpoint_filters_by_business_type` | -20 líneas, +10 líneas |
| `MAPEO_ENDPOINTS.md` | Actualizado header y aclaraciones | +10 líneas |
| `MAPEO_ENDPOINTS.md` | Actualizado `/api/metrics` con `business_type` | +1 línea |
| `MAPEO_ENDPOINTS.md` | Aclarado propósito de `/api/metrics/facets` | +5 líneas |
| `frontend/specs/API_TYPES.md` | Creado (nuevo archivo) | +650 líneas |

---

## Estado de Validación

### Tests Automatizados ✅
```bash
Backend: 14/14 tests pasan
  ✅ test_generate_mock_movements_returns_full_year_sorted_data
  ✅ test_filter_movements_by_date_includes_range_edges
  ✅ test_health_endpoint_returns_ok
  ✅ test_metrics_endpoint_respects_date_filters
  ✅ test_metrics_endpoint_filters_by_category
  ✅ test_metrics_endpoint_filters_by_operation_type
  ✅ test_metrics_endpoint_filters_by_business_type
  ✅ test_metrics_facets_returns_filter_options_and_date_range
  ✅ test_metrics_summary_by_month_returns_balances
  ✅ test_metrics_summary_by_month_honors_category_filter
  ✅ test_metrics_summary_by_week_honors_business_type_filter
  ✅ test_top_categories_returns_limited_sorted_categories
  ✅ test_metrics_comparison_returns_delta_fields
  ✅ test_metrics_alerts_returns_anomaly_candidates
```

### Validación Manual (Recomendada) 🔄
```bash
# Después de docker compose up --build:

curl "http://localhost:8000/api/metrics?category=sales&business_type=B2B"
curl "http://localhost:8000/api/metrics/summary?category=suppliers"
curl "http://localhost:8000/api/metrics/facets"
curl "http://localhost:8000/docs"  # Swagger debería mostrar todos los parámetros
```

---

## Próximos Pasos

1. **Verificar en ejecución** (manual):
   - `docker compose up --build`
   - Validar endpoints con curl
   - Verificar Swagger en `/docs`

2. **Comunicar al equipo frontend**:
   - Nuevas capacidades disponibles
   - Referencia: API_TYPES.md
   - Cambios en endpoints removidos

3. **Mantener sincronizado**:
   - Cambios futuros en API → actualizar MAPEO_ENDPOINTS.md Y API_TYPES.md
   - Mantener el directorio `frontend/specs/` como documentación de contrato

---

## Notas

- **Sin cambios de base de datos:** Todos los datos son generados (seed=42), no hay migraciones
- **Compatibilidad hacia atrás:** Los endpoints B2B/B2C removidos podrían quebrar clientes antiguos. Comunicar cambio.
- **Especificación dinámica:** Swagger en `/docs` se actualiza automáticamente de las anotaciones de FastAPI

---

**Estado Final:** ✅ RESUELTO  
**Responsables:** Backend Team + PM  
**Fecha:** 2026-11-18
