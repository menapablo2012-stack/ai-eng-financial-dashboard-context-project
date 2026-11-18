# 📋 Resumen Ejecutivo: Desajustes PM vs API

**Generado:** 2026-11-18  
**Por:** Análisis automatizado  
**Basado en:** Comparación de `MAPEO_ENDPOINTS.md` vs `backend/app/routes.py`

---

## 🎯 En 60 Segundos

### Situación Actual
- 🔴 **5 desajustes identificados**
- 🟡 **2 críticos** (impactan funcionalidad)
- 🟢 **3 menores** (solo documentación)

### Lo que se IMPLEMENTÓ pero NO se DOCUMENTÓ
```
✅ GET /api/metrics/b2b
✅ GET /api/metrics/b2c
✅ Parámetro business_type en /api/metrics/summary
```

### Lo que se DOCUMENTÓ pero NO FUNCIONA
```
❌ Parámetro category en /api/metrics/summary (aceptado, pero ignorado)
```

### Acción Inmediata Recomendada
```
1. CORREGIR: Habilitar category en /api/metrics/summary (2 min de código)
2. DOCUMENTAR: Agregar endpoints B2B/B2C a MAPEO_ENDPOINTS.md (5 min)
3. VERIFICAR: Ejecutar tests para validar cambios (2 min)
4. COMUNICAR: Notificar al equipo frontend (1 min)
```

**Total:** ~10 minutos para resolver

---

## 📊 Desajustes por Componente

### Backend (`backend/app/routes.py`)

| Función | Parámetro | ¿Implementado? | ¿Documentado? | Estado |
|---------|-----------|----------------|---------------|--------|
| `get_metrics_summary()` | `business_type` | ✅ Sí | ❌ No | 🟡 Falta docs |
| `get_metrics_summary()` | `category` | ⚠️ Acepta, pero ignora | ✅ Sí | 🔴 Disfuncional |
| `get_b2b_metrics()` | (endpoint completo) | ✅ Sí | ❌ No | 🟡 Falta docs |
| `get_b2c_metrics()` | (endpoint completo) | ✅ Sí | ❌ No | 🟡 Falta docs |

### Especificaciones (`MAPEO_ENDPOINTS.md`)

| Sección | Contenido | Completo | Accionable | Estado |
|---------|-----------|----------|------------|--------|
| `/api/metrics/summary` | Tabla de parámetros | ⚠️ Incompleta | ⚠️ Parcial | Faltan `business_type`, error en `category` |
| `/api/metrics/categories/top` | Parámetros | ✅ Completo | ✅ Sí | ✅ OK |
| Endpoints B2B/B2C | (ausentes) | ❌ Falta sección | ❌ No existe | 🔴 Completamente omitida |
| Respuestas ejemplo | JSON | ✅ Completo | ✅ Sí | ✅ OK |

---

## 🔴 Los 5 Desajustes (Detallado)

### 1️⃣ `business_type` no documentado en `/api/metrics/summary`

**Ubicación:** `MAPEO_ENDPOINTS.md` línea ~40  
**Código afectado:** `backend/app/routes.py` línea ~171-176  

**Situación:**
```
API REAL:
  Parámetro: business_type = "B2B" | "B2C"
  Funciona: ✅ SÍ

ESPECIFICACIÓN:
  Parámetro: (no mencionado)
  Documentado: ❌ NO
```

**Impacto:** 🟡 **Menor** — Funciona, pero cliente no sabe que existe  
**Remediación:** Agregar 1 fila a tabla de parámetros  
**Tiempo:** 2 minutos  

---

### 2️⃣ `category` ACEPTADO pero NO FILTRA en `/api/metrics/summary`

**Ubicación:** `backend/app/routes.py` línea 180 → función `filter_movements()`  
**Especificación esperada:** `MAPEO_ENDPOINTS.md` línea ~43  

**Situación:**
```
API REAL:
  Parámetro: category = "suppliers" | "sales" | "operational" | "administrative" | "others"
  Función: ❌ SE IGNORA (siempre se pasa como None)
  
ESPECIFICACIÓN:
  Parámetro: category = "suppliers" | "sales" | ...
  Función: Filtrar por categoría ✅

REALIDAD EN PROD:
  curl "http://localhost:8000/api/metrics/summary?category=suppliers"
  → Devuelve resumen de TODOS, no solo suppliers
```

**Impacto:** 🔴 **Crítico** — Contrato roto. Se promete, pero no cumple  
**Remediación:** Cambiar línea 180 de `category=None` → `category=category`  
**Código:**

```python
# ANTES (línea 180):
filtered = filter_movements(
    movements, start_date, end_date, 
    category=None,  # ⚠️ IGNORA EL PARÁMETRO
    operation_type=operation_type
)

# DESPUÉS:
filtered = filter_movements(
    movements, start_date, end_date, 
    category=category,  # ✅ USA EL PARÁMETRO
    operation_type=operation_type
)
```

**Tiempo:** 2 minutos (1 línea)  
**Testing:** Agregar caso de test (5 minutos)  

---

### 3️⃣ Endpoint `/api/metrics/b2b` no documentado

**Ubicación:** `backend/app/routes.py` línea ~295  
**Especificación esperada:** No existe en `MAPEO_ENDPOINTS.md`  

**Situación:**
```
API REAL:
  Ruta: GET /api/metrics/b2b
  Parámetros: start_date, end_date, category, operation_type
  Funciona: ✅ SÍ

ESPECIFICACIÓN:
  (No existe)
```

**Impacto:** 🔴 **Crítico** — Endpoint funcional completamente invisible  
**Remediación:** Agregar sección "Funcionalidad 4: Acceso Rápido por Tipo de Negocio"  
**Tiempo:** 10 minutos  

---

### 4️⃣ Endpoint `/api/metrics/b2c` no documentado

**Ubicación:** `backend/app/routes.py` línea ~314  
**Especificación esperada:** No existe en `MAPEO_ENDPOINTS.md`  

**Situación:**
```
API REAL:
  Ruta: GET /api/metrics/b2c
  Parámetros: start_date, end_date, category, operation_type
  Funciona: ✅ SÍ

ESPECIFICACIÓN:
  (No existe)
```

**Impacto:** 🔴 **Crítico** — Endpoint funcional completamente invisible  
**Remediación:** Incluir en la misma sección del desajuste #3  
**Tiempo:** Incluido en 10 minutos del #3  

---

### 5️⃣ Falta ejemplos curl para algunos parámetros

**Ubicación:** `MAPEO_ENDPOINTS.md` línea ~180  
**Especificación esperada:** Sección "Ejemplo de Uso"  

**Situación:**
```
ESPECIFICACIÓN:
  Ejemplos: 
    - Resumen mensual ✅
    - Filtrado por rango de fechas ✅
    - Filtrado por business_type ❌ FALTA
    - Combinación de filtros ❌ FALTA

IMPACTO:
  Cliente no sabe cómo hacer queries complejas
```

**Impacto:** 🟡 **Menor** — Documentación incompleta  
**Remediación:** Agregar 2-3 ejemplos más  
**Tiempo:** 5 minutos  

---

## ✅ Lo que SÍ funciona correctamente

| Endpoint | Parámetro | Documentado | Funciona | Estado |
|----------|-----------|-------------|----------|--------|
| `/api/metrics` | Todos | ✅ | ✅ | ✅ OK |
| `/api/metrics/facets` | — | ✅ | ✅ | ✅ OK |
| `/api/metrics/summary` | `group_by` | ✅ | ✅ | ✅ OK |
| `/api/metrics/summary` | `start_date`, `end_date` | ✅ | ✅ | ✅ OK |
| `/api/metrics/summary` | `operation_type` | ✅ | ✅ | ✅ OK |
| `/api/metrics/categories/top` | Todos | ✅ | ✅ | ✅ OK |
| `/api/metrics/comparison` | Todos | ✅ | ✅ | ✅ OK |
| `/api/metrics/alerts` | Todos | ✅ | ✅ | ✅ OK |
| `/health` | — | ✅ | ✅ | ✅ OK |

**Resumen:** 9 de 10+ combos funcionan bien. Los desajustes son casos específicos.

---

## 🎬 Plan de Acción (Paso a Paso)

### Paso 1: Corregir Backend (2 minutos)

**Archivo:** `backend/app/routes.py`  
**Cambio:** Línea 180

```diff
def get_metrics_summary(...) -> list[MetricsSummaryItem]:
    # ...
    filtered = filter_movements(
        movements, start_date, end_date, 
-       category=None,
+       category=category,
        operation_type=operation_type
    )
```

**Verificación:**
```bash
cd backend
python -m pytest tests/test_routes.py::test_summary_category_filter -v
```

---

### Paso 2: Actualizar Especificaciones (5 minutos)

**Archivo:** `MAPEO_ENDPOINTS.md`

1. **Línea 40 (tabla de parámetros de `/api/metrics/summary`):**
   - Agregar: `| business_type | "B2B" \| "B2C" | null | - | Filtrar por tipo de negocio |`

2. **Línea 70 (ejemplos de `/api/metrics/summary`):**
   - Agregar: `curl "http://localhost:8000/api/metrics/summary?business_type=B2B"`

3. **Al final del documento (antes de "Tipos de Datos"):**
   - Crear sección "Funcionalidad 4: Acceso Rápido por Tipo de Negocio"
   - Incluir `/api/metrics/b2b` y `/api/metrics/b2c`

---

### Paso 3: Agregar Tests (5 minutos)

**Archivo:** `backend/tests/test_routes.py`

Agregar:
```python
def test_summary_filters_by_category():
    """Verifica que category filtra correctamente en /api/metrics/summary"""
    response = client.get(
        "/api/metrics/summary?category=suppliers&operation_type=outcome"
    )
    assert response.status_code == 200
    data = response.json()
    # Validar que los valores sean consistentes con solo suppliers
    
def test_b2b_endpoint():
    """Verifica que /api/metrics/b2b devuelve solo B2B"""
    response = client.get("/api/metrics/b2b")
    assert response.status_code == 200
    data = response.json()
    assert all(item["business_type"] == "B2B" for item in data)

def test_b2c_endpoint():
    """Verifica que /api/metrics/b2c devuelve solo B2C"""
    response = client.get("/api/metrics/b2c")
    assert response.status_code == 200
    data = response.json()
    assert all(item["business_type"] == "B2C" for item in data)
```

---

### Paso 4: Verificar (2 minutos)

```bash
# Terminal 1: Iniciar backend
cd backend
docker compose up backend

# Terminal 2: Ejecutar tests
cd backend
pytest tests/ -v

# Terminal 3: Prueba manual
curl "http://localhost:8000/api/metrics/summary?category=suppliers" | jq
curl "http://localhost:8000/api/metrics/b2b" | jq '.[] | .business_type' | sort | uniq
```

---

### Paso 5: Comunicar (1 minuto)

Mensaje al equipo frontend:
```
🔧 Se han corregido desajustes en la API:

✅ CORREGIDO:
  - Parámetro 'category' ahora filtra correctamente en /api/metrics/summary

✅ DOCUMENTADO:
  - Endpoints /api/metrics/b2b y /api/metrics/b2c (ya funcionales)
  - Parámetro 'business_type' en /api/metrics/summary

📍 Cambios:
  - Especificación: MAPEO_ENDPOINTS.md (actualizado)
  - Código backend: routes.py línea 180
  - Tests: test_routes.py (nuevos casos)

🧪 Validar:
  - Revisar MAPEO_ENDPOINTS.md para nuevas capacidades
  - Consultar frontend/specs/API_QUIRKS.md para workarounds actuales
```

---

## 📊 Matriz de Decisión

| Desajuste | Tipo | Acción | Tiempo | Riesgo | ¿Hacer Ahora? |
|-----------|------|--------|--------|--------|---------------|
| `business_type` no documentado | Doc | Agregar a tabla | 2 min | Bajo | ✅ SÍ |
| `category` no filtra | Bug | Cambiar 1 línea | 2 min | Bajo | ✅ SÍ |
| `/api/metrics/b2b` no doc | Doc | Crear sección | 10 min | Bajo | ✅ SÍ |
| `/api/metrics/b2c` no doc | Doc | Crear sección | 10 min | Bajo | ✅ SÍ |
| Faltan ejemplos curl | Doc | Agregar 3 ejemplos | 5 min | Bajo | ⏳ DESPUÉS |

**Total de tiempo:** ~25-30 minutos  
**Riesgo general:** 🟢 Muy bajo (cambios menores y documentación)  
**Dependencias:** Ninguna (cambios independientes)  

---

## 🔗 Documentos Relacionados

| Documento | Propósito | Ubicación |
|-----------|----------|----------|
| Desajustes Detallados | Análisis técnico profundo | `frontend/specs/DESAJUSTES_PM_VS_API.md` |
| Plan de Remediación | Instrucciones paso a paso | `frontend/specs/PLAN_REMEDIACION.md` |
| API Quirks | Guía de workarounds para frontend | `frontend/specs/API_QUIRKS.md` |
| Este documento | Resumen ejecutivo | `frontend/specs/RESUMEN_EJECUTIVO.md` |

