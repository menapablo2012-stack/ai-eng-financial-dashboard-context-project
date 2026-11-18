# Desajustes entre Especificaciones del PM y API Real

**Fecha de análisis:** 2026-11-18  
**Documentos analizados:**
- `MAPEO_ENDPOINTS.md` (especificaciones del PM)
- `backend/app/routes.py` (implementación real)

---

## Resumen Ejecutivo

Se han identificado **5 desajustes principales** entre lo que el PM documentó y lo que la API realmente implementa. Estos desajustes afectan principalmente a:
- Parámetros de filtrado que se documentan pero no se implementan
- Campos de respuesta con nombres diferentes
- Lógica de endpoints adicionales no documentados

---

## 🔴 Desajustes Críticos

### 1. **Endpoint `GET /api/metrics/summary` — Parámetro `business_type` NO DOCUMENTADO EN ESPECIFICACIONES**

#### Especificación (PM):
```
No menciona business_type como parámetro disponible
```

#### Implementación Real:
```python
def get_metrics_summary(
    group_by: GroupBy = Query(default="month"),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    category: Category | None = Query(default=None),
    operation_type: OperationType | None = Query(default=None),
    business_type: BusinessType | None = Query(default=None),  # ✓ IMPLEMENTADO
) -> list[MetricsSummaryItem]:
```

#### Impacto:
- El frontend **puede** filtrar por `business_type` en resúmenes, pero el PM no lo indicó
- El cliente podrá sorprenderse si usa este parámetro sin saberlo

#### Acción Recomendada:
✅ **ACTUALIZAR ESPECIFICACIONES** para incluir `business_type` en `GET /api/metrics/summary`

---

### 2. **Endpoints `/api/metrics/b2b` y `/api/metrics/b2c` — COMPLETAMENTE OMITIDOS EN ESPECIFICACIONES**

#### Especificación (PM):
```
No aparecen en MAPEO_ENDPOINTS.md
```

#### Implementación Real:
```python
@router.get("/api/metrics/b2b", response_model=list[FinancialMovement])
def get_b2b_metrics(...)

@router.get("/api/metrics/b2c", response_model=list[FinancialMovement])
def get_b2c_metrics(...)
```

Ambos aceptan:
- `start_date`
- `end_date`
- `category`
- `operation_type`

#### Impacto:
- Dos endpoints funcionales están completamente invisibles en la documentación
- El frontend o clientes pueden no saber que existen estas rutas convenientes
- Falta claridad sobre qué diferencia hay entre usar `business_type` en `/summary` vs estos endpoints

#### Acción Recomendada:
✅ **AGREGAR A ESPECIFICACIONES** una sección "Funcionalidad 4: Segmentación por Tipo de Negocio"

---

### 3. **Modelos Pydantic vs Respuesta Esperada — INCONSISTENCIA EN ESTRUCTURA**

#### Especificación (PM) - Estructura esperada de `/api/metrics`:
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

#### Implementación Real - Modelo `FinancialMovement`:
```python
class FinancialMovement(BaseModel):
    create_date: date  # ✓ coincide
    amount: float      # ✓ coincide
    operation_type: OperationType  # ✓ coincide
    category: Category  # ✓ coincide
    business_type: BusinessType  # ✓ coincide
```

#### Impacto:
- ✅ **Sin desajuste real** — la estructura coincide perfectamente
- Pero la especificación no muestra ejemplos para todos los endpoints

---

### 4. **Parámetro `category` EN `/api/metrics/summary` NO SE USA EN LA LÓGICA**

#### Especificación (PM):
```
GET /api/metrics/summary
Parámetro: category = "suppliers" | "sales" | "operational" | "administrative" | "others"
Descripción: "Filtrar por categoría"
```

#### Implementación Real:
```python
def get_metrics_summary(
    # ... otros parámetros ...
    category: Category | None = Query(default=None),
    # ...
) -> list[MetricsSummaryItem]:
    movements = generate_mock_movements(seed=42)
    if business_type is not None:
        movements = [item for item in movements if item.business_type == business_type]
    filtered = filter_movements(
        movements, start_date, end_date, 
        category=None,  # ⚠️ SIEMPRE SE PASA COMO None, IGNORA EL PARÁMETRO
        operation_type=operation_type
    )
```

#### Impacto:
- El parámetro `category` se **acepta pero se ignora** en la lógica
- Clientes pueden pasar `category=suppliers` sin efecto alguno
- El PM lo documentó, pero la implementación no lo soporta

#### Acción Recomendada:
✅ **CORREGIR LA LÓGICA** del endpoint para usar el parámetro `category`, O  
✅ **ACTUALIZAR ESPECIFICACIONES** para remover `category` de los parámetros de `/api/metrics/summary`

---

### 5. **Parámetro `category` EN `/api/metrics/categories/top` — LÓGICAMENTE INCONSISTENTE**

#### Especificación (PM):
```
GET /api/metrics/categories/top
No menciona category como parámetro
```

#### Implementación Real:
```python
def get_top_categories(
    operation_type: OperationType = Query(default="outcome"),
    limit: int = Query(default=5, ge=1, le=20),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    business_type: BusinessType | None = Query(default=None),
) -> list[TopCategoryItem]:
```

**Observación:** No se acepta `category` (correcto), pero la especificación no lo menciona explícitamente. El endpoint está bien pero la documentación es incompleta.

---

## 🟡 Desajustes Menores

### 6. **Falta de Documentación en Parámetros de `/api/metrics/categories/top`**

**Especificación:** Faltan ejemplos curl en la sección de "Ejemplo de Uso"
**Recomendación:** Agregar ejemplos de filtrado por rango de fechas y por `business_type`

---

## 📋 Tabla Resumen de Desajustes

| Endpoint | Desajuste | Severidad | Acción |
|----------|-----------|-----------|--------|
| `/api/metrics/summary` | Parámetro `business_type` no documentado | 🟡 Menor | Actualizar especificaciones |
| `/api/metrics/summary` | Parámetro `category` aceptado pero ignorado | 🔴 Crítica | Corregir lógica o actualizar especificaciones |
| `/api/metrics/b2b` | Endpoint no documentado | 🔴 Crítica | Agregar a especificaciones |
| `/api/metrics/b2c` | Endpoint no documentado | 🔴 Crítica | Agregar a especificaciones |
| `/api/metrics` | Estructura correcta | ✅ Ninguno | — |

---

## ✅ Recomendaciones de Resolución

### **Opción A: Expandir la Implementación (Recomendado)**
1. Habilitar el filtrado por `category` en `/api/metrics/summary`
2. Documentar completamente los endpoints `/api/metrics/b2b` y `/api/metrics/b2c`
3. Aclarar en la especificación la diferencia de usar `business_type` vs endpoints dedicados

**Ventaja:** Mayor flexibilidad para clientes  
**Desventaja:** Más código para mantener

### **Opción B: Ajustar la Especificación (Más Rápida)**
1. Remover el parámetro `category` de `/api/metrics/summary`
2. Mantener `/api/metrics` como único endpoint de datos brutos con todos los filtros
3. Agregar sección para `/api/metrics/b2b` y `/api/metrics/b2c`
4. Aclarar que se pueden usar en lugar de pasar `business_type` manualmente

**Ventaja:** Menos cambios de código, especificación más clara  
**Desventaja:** Menos flexible si se necesita filtrar por categoría en el futuro

---

## 📝 Notas de Implementación

- **Generación de datos:** Ambos (PM y API) usan `seed=42` correctamente
- **Tipos de datos:** Las enumeraciones coinciden perfectamente
- **Respuestas de error:** Implementadas (400, 422) pero no documentadas en ejemplos

---

## Próximos Pasos

1. ✅ Revisar con PM la decisión entre Opción A o B
2. ✅ Implementar cambios de código (si se elige A)
3. ✅ Actualizar `MAPEO_ENDPOINTS.md` con cambios finales
4. ✅ Verificar cambios con tests automatizados
5. ✅ Comunicar cambios al equipo frontend
