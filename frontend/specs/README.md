# Frontend Specifications — Financial Dashboard

**Propósito:** Documentar las tres funcionalidades principales del dashboard financiero, sus requisitos técnicos, contrato de datos y consideraciones de integración.

**Estado:** 📋 Especificaciones activas | 🔧 Desarrollo en curso

---

## 🎯 Funcionalidades Principales

El dashboard financiero implementa tres funcionalidades core:

| # | Funcionalidad | Componentes | Estado | Prioridad |
|---|---|---|---|---|
| **1** | 📊 Indicadores KPI | KPICard, KPIRow | ✅ Activo | 🔴 Crítica |
| **2** | 💰 Visualización Ingresos/Egresos | IncomeOutcomeChart | ✅ Activo | 🔴 Crítica |
| **3** | 📈 Margen de Ganancia | ProfitPercentChart | ✅ Activo | 🟡 Importante |

---

## 1️⃣ Indicadores KPI (Key Performance Indicators)

### Propósito
Mostrar de un vistazo las métricas financieras clave: ingresos totales, egresos totales, ganancia bruta y margen de ganancia en porcentaje.

### Componentes Involucrados
- **KPIRow** (`src/components/dashboard/kpi-row.tsx`) — Contenedor responsivo
- **KPICard** (`src/components/dashboard/kpi-card.tsx`) — Tarjeta individual de métrica
- **Dashboard Header** (`src/components/dashboard/dashboard-header.tsx`) — Encabezado y contexto

### Contrato de Datos

#### Input (desde backend `/api/metrics`)
```typescript
// Array de movimientos financieros
FinancialMovement[] {
  id: string
  amount: number          // Cantidad (positiva o negativa)
  category: string        // 'income' | 'outcome'
  description: string
  create_date: string     // ISO 8601: "2024-02-15"
}
```

**Referencia:** `src/lib/financial-types.ts`

#### Output (Calculado en frontend)
```typescript
KPIMetrics {
  totalIncome: number       // Suma de amounts donde category='income'
  totalOutcome: number      // Suma de amounts donde category='outcome'
  totalProfit: number       // totalIncome - totalOutcome
  profitPercent: number     // (totalProfit / totalIncome) * 100
}
```

**Referencia:** `src/lib/financial-utils.ts` → `computeKPIs()`

### Especificación de Tarjetas KPI

| Métrica | Icono | Variante | Valor | Helper Text | Fórmula |
|---------|-------|---------|-------|-------------|---------|
| **Total Income** | TrendingUp | `income` | `$XX,XXX.XX` | "Total ingresos registrados" | `SUM(amount WHERE category='income')` |
| **Total Outcome** | TrendingDown | `outcome` | `$XX,XXX.XX` | "Total egresos registrados" | `SUM(amount WHERE category='outcome')` |
| **Total Profit** | DollarSign | `profit` | `$XX,XXX.XX` | "Ganancia bruta" | `totalIncome - totalOutcome` |
| **Profit %** | Percent | `profitPercent` | `XX.XX%` | "Margen de ganancia" | `(totalProfit / totalIncome) * 100` |

### Requisitos Técnicos

1. **Formato Numérico**
   - Moneda: USD con símbolo `$`
   - Decimales: 2 posiciones
   - Separadores de mil: comas (ej: `$1,234.56`)
   - Implementar con `Intl.NumberFormat` u librería similar

2. **Estados de Carga**
   - Mostrar esqueletos (skeleton loaders) mientras se cargan datos
   - Duración típica: <1 segundo en conexión normal
   - Implementación: componente `Skeleton` en `src/components/ui/skeleton.tsx`

3. **Responsive Design**
   - Desktop (xl): 4 columnas en grid
   - Tablet (md): 2 columnas en grid
   - Mobile (sm): 1 columna (stack vertical)
   - Referencia: Tailwind CSS breakpoints

4. **Accesibilidad**
   - Labels accesibles (aria-label en KPIRow)
   - Alto contraste con `--income-badge`, `--outcome-badge`, etc.
   - Lectura de pantalla: orden lógico de tarjetas

### Consideraciones Especiales

⚠️ **Manejo de División por Cero**
- Si `totalIncome === 0`, establecer `profitPercent = 0` (no Infinity)
- Validar antes de dividir en `computeKPIs()`
- Test case: datos vacíos o solo egresos

⚠️ **Moneda y Localización**
- Actualmente hardcodeado en USD
- Si se agrega soporte multi-divisa, actualizar tipos en `financial-types.ts`
- Considerar zona horaria para fechas (ver `.agents/rules/architecture.md`)

⚠️ **Validación de Datos**
- Backend puede retornar array vacío
- Frontend debe manejar gracefully (mostrar ceros, no errores)
- Mantener compatibilidad con tipo `FinancialMovement`

### Integración con App.tsx

```typescript
// App.tsx extrae datos brutos
const movements = await fetchFinancialData() // GET /api/metrics

// Calcula KPIs
const metrics = computeKPIs(movements)

// Pasa a KPIRow para renderizar
<KPIRow metrics={metrics} loading={loading} />
```

---

## 2️⃣ Visualización de Ingresos/Egresos

### Propósito
Mostrar gráfico de barras mensual con ingresos (en verde) y egresos (en rojo) para identificar tendencias y patrones estacionales.

### Componentes Involucrados
- **IncomeOutcomeChart** (`src/components/dashboard/income-outcome-chart.tsx`) — Gráfico principal
- **Librería de gráficos:** Recharts (`recharts` NPM package)

### Contrato de Datos

#### Input (Transformado en frontend)
```typescript
// Calculado por computeMonthlyData()
MonthlyDataPoint[] {
  month: string              // Formato: "Jan 2024", "Feb 2024", etc.
  income: number             // Suma de ingresos del mes
  outcome: number            // Suma de egresos del mes
  date: Date                 // Fecha JS para ordenar
}
```

**Referencia:** `src/lib/financial-utils.ts` → `computeMonthlyData()`

#### Salida (en la UI)
- Barras agrupadas mensuales
- Eje X: nombres de mes
- Eje Y: cantidad en dólares
- Leyenda: "Income" (verde) y "Outcome" (rojo)

### Especificación del Gráfico

| Aspecto | Especificación | Notas |
|---------|---|---|
| **Tipo** | BarChart (Recharts) | Barras agrupadas, no apiladas |
| **Anchura Contenedor** | Responsivo (100% del ancho) | Media query: min-width 320px |
| **Altura Contenedor** | 350px | Fijo para consistencia |
| **Colores** | Verde income, Rojo outcome | Variables CSS: `--income-bg`, `--outcome-bg` |
| **Eje X** | Meses (Jan, Feb, ..., Dec) | Formato de Intl.DateTimeFormat |
| **Eje Y** | Dólares con separadores | Formatter: `$XXX,XXX` |
| **Tooltip** | Hover muestra mes + ambas métricas | Formato USD |
| **Leyenda** | Bottom o top según espacio | Responsive, ocultar si <sm |

### Requisitos Técnicos

1. **Transformación de Datos**
   - Entrada: array de `FinancialMovement`
   - Proceso: agrupar por mes usando `create_date` (ISO 8601)
   - Salida: `MonthlyDataPoint[]` ordenado cronológicamente
   - Función: `computeMonthlyData()` en `financial-utils.ts`

2. **Manejo de Zonas Horarias**
   - ⚠️ Fecha ISO sin hora (`2024-02-01`) puede interpretarse en zona horaria diferente
   - Usar `new Date(create_date)` con cuidado en timezones al oeste de UTC
   - Test: datos límite (fin/inicio de mes) con múltiples zonas
   - **Referencia:** `.agents/rules/architecture.md` → "Agrupación mensual y zonas horarias"

3. **Estado Vacío**
   - Si no hay datos de ingreso Y egreso en el mes: no renderizar barra
   - Si TODOS los meses están vacíos: mostrar mensaje "No data available"
   - **Referencia:** `.agents/rules/architecture.md` → "Estados vacíos de las gráficas"

4. **Responsividad**
   - Desktop (lg+): gráfico completo con todas las etiquetas
   - Tablet (md): fuente reducida en eje X
   - Mobile (sm): labels rotados 45°, leyenda oculta

5. **Performance**
   - Memoizar con `useMemo()` la transformación de datos
   - Recharts: usar `shouldUpdate={false}` si datos no cambian
   - Evitar re-renders innecesarios durante carga

### Consideraciones Especiales

⚠️ **Escala Dinámica del Eje Y**
- Recharts calcula automáticamente el rango
- Si max(income, outcome) = $50K → escala hasta $60K
- Verificar que valores pequeños (<$1K) sean visibles

⚠️ **Meses Vacíos**
- Si un mes no tiene movimientos, omitir del array (no rellenar con ceros)
- O alternativamente: rellenar con ceros si hay datos en meses adyacentes
- Decidir según UX (gaps vs continuo)

⚠️ **Validación del Backend**
- Backend `/api/metrics` debe retornar fechas ISO válidas
- Validar con `new Date(create_date).getTime()` antes de usar
- Ver `.agents/rules/architecture.md` → "Contrato de movimientos"

### Integración con App.tsx

```typescript
// En App.tsx
const monthlyData = computeMonthlyData(movements)

// Pasar a componente
<IncomeOutcomeChart data={monthlyData} loading={loading} />
```

---

## 3️⃣ Margen de Ganancia (Profit Percentage)

### Propósito
Mostrar gráfico de línea mensual con el margen de ganancia (profit %) para visualizar rentabilidad y eficiencia operativa a lo largo del tiempo.

### Componentes Involucrados
- **ProfitPercentChart** (`src/components/dashboard/profit-percent-chart.tsx`) — Gráfico de línea
- **Librería de gráficos:** Recharts (LineChart)

### Contrato de Datos

#### Input (Transformado en frontend)
```typescript
// Calculado por computeMonthlyData()
MonthlyDataPoint[] {
  month: string              // Formato: "Jan 2024", "Feb 2024", etc.
  income: number
  outcome: number
  date: Date
  // profitPercent se calcula en el componente:
  // (income - outcome) / income * 100
}
```

#### Cálculo
```
profitPercent[month] = ((income[month] - outcome[month]) / income[month]) * 100

Casos especiales:
- Si income = 0 → profitPercent = 0 (no Infinity)
- Si income = outcome → profitPercent = 0 (break-even)
- Si outcome > income → profitPercent < 0 (pérdida)
```

### Especificación del Gráfico

| Aspecto | Especificación | Notas |
|---------|---|---|
| **Tipo** | LineChart (Recharts) | Línea suave (monotone curve) |
| **Anchura Contenedor** | Responsivo (100% del ancho) | Media query: min-width 320px |
| **Altura Contenedor** | 350px | Consistente con Income/Outcome |
| **Color Línea** | Dinámico según valor | Verde si >0, rojo si ≤0 |
| **Eje X** | Meses (Jan, Feb, ..., Dec) | Formato de Intl.DateTimeFormat |
| **Eje Y** | Porcentaje (0-100%) | Formato: `XX.XX%`, range 0-100 |
| **Área bajo línea** | Relleno con opacidad 20% | Color según valor (verde/rojo) |
| **Tooltip** | Hover muestra mes + porcentaje | Formato: `32.5%` |
| **Punto de datos** | Círculos en cada mes | Radio: 4px, hover: 6px |
| **Leyenda** | Oculta o solo "Profit %" | Simplificar si es métrica única |

### Requisitos Técnicos

1. **Transformación de Datos**
   - Reutilizar `MonthlyDataPoint[]` del gráfico Income/Outcome
   - Calcular `profitPercent` dentro del componente o agregar a utils
   - Usar `computeMonthlyData()` y derivar porcentaje

2. **Manejo de Casos Especiales**
   - **División por cero:** Si `income[mes] = 0` → `profitPercent = 0`
   - **Pérdidas:** Si `outcome > income` → porcentaje negativo (permitido)
   - **Break-even:** Si `income = outcome` → `profitPercent = 0` (esperado)
   - **Referencia:** `.agents/rules/architecture.md` → "Estados vacíos de las gráficas"

3. **Estados de Carga**
   - Mostrar esqueleto mientras se carga
   - Duración: <1 segundo típicamente

4. **Estado Vacío**
   - Si TODOS los meses tienen `income = 0`: mostrar mensaje "No income data"
   - Si al menos un mes tiene datos: renderizar gráfico (con algunos puntos en 0%)
   - **Referencia:** `.agents/rules/architecture.md` → "Estados vacíos de las gráficas"

5. **Responsividad**
   - Desktop (lg+): todos los labels visibles
   - Tablet (md): fuente reducida
   - Mobile (sm): labels cada 2 meses, tooltips con mejor padding

6. **Color Dinámico**
   - Si `profitPercent > 0` → color verde (success)
   - Si `profitPercent ≤ 0` → color rojo (destructive)
   - Usar variables CSS o Tailwind utilities

### Consideraciones Especiales

⚠️ **Validación de Margen**
- Mantener rango de eje Y: 0-100% (o -50% a 150% si hay pérdidas)
- Usar `yAxis domain={[0, 100]}` en LineChart
- Ajustar si datos requieren rango mayor

⚠️ **Meses sin Ingresos**
- Meses sin `income` data: establecer `profitPercent = 0`
- No omitir del gráfico (mantener continuidad visual)
- Helper text aclarando qué significa 0%

⚠️ **Número de Decimales**
- Mostrar 1-2 decimales en tooltip: `32.50%`
- En eje Y: sin decimales `0%`, `25%`, `50%`, etc.
- Fórmula de redondeo: `Math.round(value * 100) / 100`

⚠️ **Integración con KPI**
- El KPI `Profit %` muestra el TOTAL del año
- El gráfico muestra el TREND mensual
- Ambos usan la misma fórmula, pero scope diferente
- En KPI: `(totalProfit / totalIncome) * 100`
- En gráfico: por mes individual

### Integración con App.tsx

```typescript
// En App.tsx
const monthlyData = computeMonthlyData(movements)

// Pasar a componente
<ProfitPercentChart data={monthlyData} loading={loading} />
```

---

## 🔄 Flujo de Integración General

```
┌─────────────────────────────────────────────────────────┐
│                      App.tsx                            │
│  1. fetchFinancialData() → GET /api/metrics             │
│  2. computeKPIs(movements)                              │
│  3. computeMonthlyData(movements)                       │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│  KPIRow      │  │  Income      │  │  Profit %        │
│  (KPIs)      │  │  Outcome     │  │  Chart           │
│              │  │  Chart       │  │                  │
└──────────────┘  └──────────────┘  └──────────────────┘
     (1)              (2)                   (3)
```

### Paso a Paso

1. **Lectura de datos**
   - Endpoint: `GET /api/metrics`
   - Contrato: Array de `FinancialMovement`
   - Validación: Comprobar status 200, JSON válido

2. **Transformación**
   - `computeKPIs()` → Totales y ratios simples
   - `computeMonthlyData()` → Agregación mensual

3. **Renderizado**
   - KPIRow: 4 tarjetas con métricas clave
   - IncomeOutcomeChart: gráfico de barras mensual
   - ProfitPercentChart: gráfico de línea de margen

---

## 🛠️ Referencia de Archivos Clave

| Ruta | Responsabilidad |
|------|---|
| `src/App.tsx` | Orquestación, lectura de API, cálculos iniciales |
| `src/lib/financial-types.ts` | Definición de tipos (FinancialMovement, KPIMetrics, etc.) |
| `src/lib/financial-utils.ts` | Funciones de cálculo (computeKPIs, computeMonthlyData) |
| `src/components/dashboard/kpi-row.tsx` | Layout de tarjetas KPI |
| `src/components/dashboard/kpi-card.tsx` | Tarjeta individual de métrica |
| `src/components/dashboard/dashboard-header.tsx` | Encabezado principal |
| `src/components/dashboard/income-outcome-chart.tsx` | Gráfico de barras (Recharts) |
| `src/components/dashboard/profit-percent-chart.tsx` | Gráfico de línea (Recharts) |
| `src/components/ui/skeleton.tsx` | Skeleton loaders para estados de carga |
| `.agents/rules/architecture.md` | Reglas y consideraciones arquitectónicas |

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|--------|-----------|
| Backend retorna array vacío | UI muestra ceros | Validar en computeKPIs() |
| Fechas ISO en zona horaria diferente | Agrupación mensual incorrecta | Usar fecha sin zona, test con múltiples TZ |
| División por cero en profitPercent | Infinity en cálculos | Validar income > 0 antes de dividir |
| Cambios en contrato `/api/metrics` | Breaking change en frontend | Mantener compatible, ver architecture.md |
| Gráficos no responsivos | Poor UX en mobile | Usar `ResponsiveContainer` de Recharts |
| Datos inconsistentes entre KPI y gráficos | Confusión de usuario | Usar mismas funciones de cálculo |

---

## 📋 Checklist de Desarrollo

### Antes de comenzar
- [ ] Leer `.agents/rules/architecture.md` completo
- [ ] Leer `.agents/rules/naming.md` para nomenclatura de imports
- [ ] Revisar `frontend/specs/API_QUIRKS.md` si hay workarounds activos

### KPIs (Funcionalidad 1)
- [ ] Tipos en `financial-types.ts` definidos y exportados
- [ ] `computeKPIs()` implementada y testeada
- [ ] KPICard renderiza 4 métricas correctamente
- [ ] Formato de moneda: `$XX,XXX.XX`
- [ ] Esqueletos funcionan durante carga
- [ ] Responsive: 4 col (desktop), 2 col (tablet), 1 col (mobile)
- [ ] Tests: datos vacíos, solo ingresos, solo egresos

### Income/Outcome Chart (Funcionalidad 2)
- [ ] `computeMonthlyData()` agrupa por mes correctamente
- [ ] Manejo de zonas horarias: test con UTC±5
- [ ] Gráfico Recharts renderiza barras agrupadas
- [ ] Tooltip muestra USD format
- [ ] Responsive: labels completos (desktop), rotados (mobile)
- [ ] Tests: meses vacíos, fechas límite, moneda

### Profit % Chart (Funcionalidad 3)
- [ ] Cálculo de porcentaje: `(income - outcome) / income * 100`
- [ ] Manejo de income=0: resultado 0, no Infinity
- [ ] Gráfico LineChart con área rellena
- [ ] Color dinámico: verde >0%, rojo ≤0%
- [ ] Tooltip muestra: `32.50%`
- [ ] Tests: pérdidas (negativas), break-even, cero ingresos

### Integración General
- [ ] App.tsx fetches y pasa datos correctamente
- [ ] Error handling: muestra mensaje si API falla
- [ ] Loading states: esqueletos en todas las secciones
- [ ] Accesibilidad: aria-label, alt text, contraste
- [ ] Performance: no memory leaks, re-renders óptimos

---

## 🔗 Referencias Cruzadas

- **Arquitectura:** [.agents/rules/architecture.md](../../.agents/rules/architecture.md)
- **Nomenclatura:** [.agents/rules/naming.md](../../.agents/rules/naming.md)
- **Testing:** [.agents/rules/testing.md](../../.agents/rules/testing.md)
- **Operación:** [.agents/rules/operations.md](../../.agents/rules/operations.md)
- **API Endpoints:** [MAPEO_ENDPOINTS.md](../../MAPEO_ENDPOINTS.md)
- **Desajustes Conocidos:** [frontend/specs/API_QUIRKS.md](./API_QUIRKS.md)

---

## 📝 Notas de Archivo

**Documento creado:** 2026-11-18  
**Versión:** 1.0  
**Estado:** 📋 Activo (en desarrollo)  
**Próxima revisión:** Después de completar las tres funcionalidades  

**Cambios recientes:**
- 2026-11-18: Especificación inicial de las tres funcionalidades principales

---

## ✉️ Contacto y Preguntas

Para preguntas sobre esta especificación:
- **Frontend Team:** Implementación y validación
- **Backend Team:** Contrato de `/api/metrics` y tipos de datos
- **QA/Testing:** Casos de prueba y validación de comportamientos

Crear un issue con etiqueta `frontend-spec` si encuentras inconsistencias o tienes preguntas.
