# 🔍 Desajustes API — Quick Reference Card

```
╔══════════════════════════════════════════════════════════════════════╗
║                 DESAJUSTES PM vs API — SNAPSHOT                      ║
║                      Análisis: 2026-11-18                            ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 🎯 El Problema en Tres Líneas

```
📝 ESPECIFICACIÓN (PM):         🔧 IMPLEMENTACIÓN (Backend):
   ❌ Endpoints faltantes              ✅ Endpoints implementados
   ✅ Parámetros documentados          ⚠️ Parámetro ignorado
   
RESULTADO: Desastre de integración → Frontend no sabe qué puede hacer
```

---

## 📋 Los 5 Desajustes (Visual)

### Desajuste #1: `business_type` Oculto 🔒
```
❌ No está en especificación
✅ Implementado en backend
⚠️ Frontend lo descubre por error

UBICACIÓN: /api/metrics/summary?business_type=B2B
ACCIÓN: Documentar (2 min)
```

### Desajuste #2: `category` Roto 💔
```
✅ En especificación: "Filtrar por categoría"
❌ No funciona (siempre ignora el parámetro)
🔴 CRÍTICO: Falsas promesas

UBICACIÓN: backend/app/routes.py línea 180
ACCIÓN: Cambiar category=None → category=category (2 min)
```

### Desajuste #3: `/api/metrics/b2b` Fantasma 👻
```
✅ Implementado y funciona
❌ No está en especificación
⚠️ Nadie sabe que existe

UBICACIÓN: Falta en MAPEO_ENDPOINTS.md
ACCIÓN: Agregar sección (10 min)
```

### Desajuste #4: `/api/metrics/b2c` Fantasma 👻
```
✅ Implementado y funciona
❌ No está en especificación
⚠️ Idéntico al #3

UBICACIÓN: Falta en MAPEO_ENDPOINTS.md
ACCIÓN: Agregar sección (incluido en #3)
```

### Desajuste #5: Ejemplos Incompletos 📚
```
❌ Faltan ejemplos curl complejos
⚠️ Documentación poco clara

ACCIÓN: Agregar 3 ejemplos más (5 min)
```

---

## ⏱️ Tiempo de Reparación

```
🔧 Backend:        2 min  (1 línea de código)
📝 Documentación: 15 min  (3-4 secciones)
🧪 Tests:          5 min  (3-4 test cases)
✅ Verificación:   2 min  (curl + pytest)
─────────────────────────
   TOTAL:        ~24 min
```

---

## 🛠️ Checklist de Reparación

```
PASO 1: Backend Fix
  [ ] Cambiar línea 180 en routes.py: category=None → category=category
  [ ] Verificar cambio compila
  
PASO 2: Tests
  [ ] Agregar test: test_summary_filters_by_category()
  [ ] Agregar test: test_b2b_endpoint()
  [ ] Agregar test: test_b2c_endpoint()
  [ ] pytest backend/tests/ -v ✅
  
PASO 3: Documentation
  [ ] Actualizar MAPEO_ENDPOINTS.md:
      ✓ Agregar business_type a tabla /summary
      ✓ Crear Funcionalidad 4 (B2B/B2C endpoints)
      ✓ Agregar ejemplos curl complejos
  [ ] Revisar con PM ✅
  
PASO 4: Communication
  [ ] Notificar equipo frontend
  [ ] Actualizar docs en /docs endpoint
```

---

## 📊 Matriz de Impacto

```
┌────────┬──────────┬────────────┬────────────────────────────┐
│ Tipo   │ Severidad│ Componente │ Impacto en Frontend        │
├────────┼──────────┼────────────┼────────────────────────────┤
│ Doc    │ 🟡 Menor │ Especif.   │ ⚠️ No sabe qué puede hacer │
│ Bug    │ 🔴 Alto  │ Backend    │ 💔 Parámetro no funciona   │
│ Doc    │ 🔴 Alto  │ Especif.   │ 👻 Endpoints fantasmas     │
│ Doc    │ 🔴 Alto  │ Especif.   │ 👻 Endpoints fantasmas     │
│ Doc    │ 🟡 Menor │ Especif.   │ ⚠️ Ejemplos insuficientes  │
└────────┴──────────┴────────────┴────────────────────────────┘
```

---

## 🎯 Por Rol

```
👨‍💼 PM:
   Lee → RESUMEN_EJECUTIVO.md (5 min)
   Decide → Opción A o B (1 min)
   Autoriza → Go/No-Go

👨‍💻 Backend:
   Lee → DESAJUSTES_PM_VS_API.md (10 min)
   Consulta → PLAN_REMEDIACION.md (5 min)
   Implementa → Cambios de código
   Verifica → Tests + Manual

🎨 Frontend:
   Lee → API_QUIRKS.md (10 min)
   Usa → Workarounds actuales
   Espera → Notificación de cambios
```

---

## ⚠️ Comportamientos Actuales (Para Frontend)

```
❌ NO FUNCIONA COMO SE PROMETE:
   GET /api/metrics/summary?category=suppliers
   → Devuelve TODOS, no solo suppliers
   
   WORKAROUND:
   GET /api/metrics?category=suppliers
   → Luego agrupar por período en frontend

✅ FUNCIONA PERO NO DOCUMENTADO:
   GET /api/metrics/b2b
   GET /api/metrics/b2c
   GET /api/metrics/summary?business_type=B2B
   
   RECOMENDACIÓN:
   Usar sin miedo (están en reparación = documentación)

✅ FUNCIONA PERFECTAMENTE:
   GET /api/metrics
   GET /api/metrics/facets
   GET /api/metrics/categories/top
   GET /api/metrics/comparison
   GET /api/metrics/alerts
   GET /health
```

---

## 🔗 Documentación Completa

| Documento | Tiempo | Para Quién |
|-----------|--------|-----------|
| [README.md](./README.md) | 3 min | Todos |
| [RESUMEN_EJECUTIVO.md](./RESUMEN_EJECUTIVO.md) | 5 min | PM/Líderes |
| [DESAJUSTES_PM_VS_API.md](./DESAJUSTES_PM_VS_API.md) | 15 min | Developers |
| [PLAN_REMEDIACION.md](./PLAN_REMEDIACION.md) | 20 min | Backend Dev |
| [API_QUIRKS.md](./API_QUIRKS.md) | 10 min | Frontend Dev |

---

## 🚀 Estado General

```
📊 ANÁLISIS:        ✅ COMPLETADO
🔧 REMEDIACIÓN:     ⏳ PROPUESTA (pendiente aprobación)
🧪 TESTING:         ⏳ LISTO (en plan)
📝 DOCUMENTACIÓN:   ⏳ LISTA (en plan)
✅ IMPLEMENTACIÓN:  ⏳ PENDIENTE
```

---

## ✅ Siguiente Acción

1. **Leer:** RESUMEN_EJECUTIVO.md (5 minutos)
2. **Decidir:** ¿Comenzar ahora? (SI → Vaya a paso 3)
3. **Implementar:** Seguir PLAN_REMEDIACION.md (25 minutos)
4. **Verificar:** Ejecutar tests y validar
5. **Comunicar:** Notificar equipo frontend

**Tiempo total:** ~35 minutos

---

```
╔══════════════════════════════════════════════════════════════════════╗
║  Documento: Quick Reference Card                                     ║
║  Creado: 2026-11-18                                                  ║
║  Ubicación: frontend/specs/QUICK_REFERENCE.md                        ║
╚══════════════════════════════════════════════════════════════════════╝
```
