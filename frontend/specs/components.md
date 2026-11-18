# Frontend Components Specification

Documentación de los componentes del dashboard financiero, organizados por funcionalidad.

## Table of Contents

1. [Layout y Estructura](#layout-y-estructura)
2. [KPI Metrics](#kpi-metrics)
3. [Visualización de Datos](#visualización-de-datos)
4. [UI Primitives](#ui-primitives)
5. [Integration Patterns](#integration-patterns)

---

## Layout y Estructura

### `DashboardHeader`

**Ubicación:** `src/components/dashboard/dashboard-header.tsx`

**Responsabilidad:** Encabezado principal del dashboard con marca, título y período.

**Props:**
```typescript
interface DashboardHeaderProps {
  period?: string  // Período mostrado (ej: "2024 — Full Year")
}
```

**Comportamiento:**
- Muestra ícono de dashboard (LayoutDashboard de Lucide)
- Título "Financial Overview" y subtítulo "Executive metrics dashboard"
- Badge con período configurable
- Responsive: flex column en móvil, row en desktop

**Estilo:**
- Fondo primario con 10% opacidad para el ícono
- Tipografía: h1 con tracking-tight
- Border badge con estilo secundario
- Accesible a través del contexto CSS personalizado

**Notas:**
- Componente stateless, solo presentación
- Período por defecto: "2024 — Full Year"
- No conectado a estados globales

---

## KPI Metrics

### `KPICard`

**Ubicación:** `src/components/dashboard/kpi-card.tsx`

**Responsabilidad:** Tarjeta individual que muestra una métrica KPI con valor y descripción.

**Props:**
```typescript
interface KPICardProps {
  label: string                                    // Nombre de la métrica
  value: string                                    // Valor formateado a mostrar
  helperText: string                               // Descripción o explicación
  icon: LucideIcon                                 // Componente de ícono Lucide
  variant: 'income' | 'outcome' | 'profit' | 'profitPercent'
  loading?: boolean                                // Estado de carga
}
```

**Variantes y Estilos:**
Cada variante usa variables CSS personalizadas para colores:
- `income`: badge con `--income-badge` y `--income-badge-fg`
- `outcome`: badge con `--outcome-badge` y `--outcome-badge-fg`
- `profit`: badge con `--profit-badge` y `--profit-badge-fg`
- `profitPercent`: badge con `--profit-badge` y `--profit-badge-fg`

**Comportamiento:**
- Muestra label en mayúsculas pequeño (12px)
- Valor principal en tipografía grande (3xl)
- Helper text descriptivo en gris
- Efecto hover: cambio de border de border/60 a border completo
- Esqueletos de carga cuando `loading=true`

**Estructura:**
```
┌─ Card (bg-card, border-border/60)
│  └─ CardContent (p-6, flex flex-col gap-4)
│     ├─ Encabezado (flex justify-between)
│     │  ├─ Label (text-sm uppercase)
│     │  └─ Icon Badge (rounded-lg p-1.5)
│     ├─ Valor Principal (text-3xl font-semibold)
│     └─ Helper Text (text-xs text-muted-foreground)
```

**Notas:**
- Componente reutilizable para múltiples métricas
- Estados de carga con esqueletos preconfigurados
- Colores temáticos según tipo de métrica
- Hover effect para mejorar interactividad

---

### `KPIRow`

**Ubicación:** `src/components/dashboard/kpi-row.tsx`

**Responsabilidad:** Fila de cuatro KPI cards mostrando métricas financieras agregadas.

**Props:**
```typescript
interface KPIRowProps {
  metrics: KPIMetrics | null  // Objeto con cálculos financieros
  loading?: boolean           // Propagar estado de carga a tarjetas
}
```

**Métricas Mostradas:**

1. **Total Income**
   - Calcula: Suma de todos los movimientos tipo "income"
   - Icono: TrendingUp (Lucide)
   - Variante: income
   - Helper: "Cumulative revenue from all income movements"

2. **Total Outcome**
   - Calcula: Suma de todos los movimientos tipo "outcome"
   - Icono: TrendingDown (Lucide)
   - Variante: outcome
   - Helper: "Total expenditure across all categories"

3. **Profit**
   - Calcula: Income - Outcome
   - Icono: DollarSign (Lucide)
   - Variante: profit
   - Helper: "Net profit — income minus total outcome"

4. **Profit Margin**
   - Calcula: (Profit / Income) × 100
   - Icono: BarChart2 (Lucide)
   - Variante: profitPercent
   - Helper: "Profit as a percentage of total income"

**Layout:**
```css
grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4
```
- Móvil: 1 columna
- Tablet: 2 columnas
- Desktop: 4 columnas

**Gestión de Datos:**
- Convierte datos con `formatCurrency()` e `formatPercent()`
- Fallback a "—" cuando `metrics` es null
- Propaga `loading` a todas las tarjetas simultáneamente

**Notas:**
- Componente contenedor: orquesta 4 KPICards
- Responsable de formateo de valores
- Patrón: null-safe con fallback visual

---

## Visualización de Datos

### `IncomeOutcomeChart`

**Ubicación:** `src/components/dashboard/income-outcome-chart.tsx`

**Responsabilidad:** Gráfico de líneas mostrando evolución mensual de ingresos vs egresos.

**Props:**
```typescript
interface IncomeOutcomeChartProps {
  data: MonthlyDataPoint[]  // Array de puntos mensuales
  loading?: boolean         // Estado de carga
}
```

**Datos Esperados:**
```typescript
interface MonthlyDataPoint {
  month: string        // Etiqueta del mes (ej: "Jan", "Feb")
  income: number       // Monto de ingresos
  outcome: number      // Monto de egresos
  profitPercent: number // Margen de ganancia (no usado en este gráfico)
}
```

**Comportamiento:**
- Dos líneas: income (color `--chart-income`) y outcome (color `--chart-outcome`)
- Tooltips personalizados que muestran ambos valores
- Grid punteado para referencia
- Puntos interactivos que crecen al pasar el mouse (r: 3 → 5)
- Fallback: mensaje "No data available to display" cuando no hay datos

**Configuración de Recharts:**
- `height: 280px`
- `margin: { top: 4, right: 8, left: 0, bottom: 0 }`
- YAxis: formatea valores en k (ej: "$50k")
- Colores: CSS variables para tema coherente

**CustomTooltip:**
```
┌─ Contenedor (rounded-lg border bg-card)
│  ├─ Mes (font-semibold)
│  ├─ Fila Income (flex con punto de color)
│  └─ Fila Outcome (flex con punto de color)
```

**Estados:**
- `loading`: Muestra esqueletos
- Sin datos: Área vacía con mensaje
- Con datos: Gráfico líneal interactivo

**Notas:**
- Uso de Recharts ResponsiveContainer para responsividad
- CSS variables para coherencia de colores
- Accesibilidad: punto del color visible en tooltip

---

### `ProfitPercentChart`

**Ubicación:** `src/components/dashboard/profit-percent-chart.tsx`

**Responsabilidad:** Gráfico de línea mostrando margen de ganancia porcentual mensual.

**Props:**
```typescript
interface ProfitPercentChartProps {
  data: MonthlyDataPoint[]  // Array de puntos mensuales
  loading?: boolean         // Estado de carga
}
```

**Datos Esperados:**
```typescript
interface MonthlyDataPoint {
  month: string        // Etiqueta del mes
  profitPercent: number // Margen porcentual
  // ... otros campos no usados
}
```

**Comportamiento:**
- Una línea única: profitPercent (color `--chart-profit`)
- Línea de referencia horizontal en 0% (punteada)
- Tooltip personalizado mostrando porcentaje con 1 decimal
- Responsivo con altura 280px
- Fallback: mensaje cuando no hay datos

**Configuración de Recharts:**
- `domain: ['auto', 'auto']` para auto-escalado
- YAxis formatea valores con símbolo "%"
- ReferenceLine en y=0 con punteo
- Puntos interactivos (r: 3 → 5)

**CustomTooltip:**
```
┌─ Contenedor
│  ├─ Mes (font-semibold)
│  └─ "Profit margin: XX.X%"
```

**Estados:**
- `loading`: Esqueletos
- Sin datos: Área vacía con mensaje
- Con datos: Gráfico con línea de referencia

**Notas:**
- Detecta datos válidos: `.some((d) => d.profitPercent !== 0)`
- Formato decimal: `toFixed(1)` para precisión
- Línea de referencia ayuda a identificar meses negativos

---

## UI Primitives

### `Card`

**Ubicación:** `src/components/ui/card.tsx`

**Responsabilidad:** Componente base para contenedores de contenido.

**Componentes:**

#### `Card`
Contenedor principal.
```typescript
function Card({ className, ...props }: React.ComponentProps<'div'>)
```
- `data-slot="card"`
- Clases: `bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm`
- Flexbox con gap-6 vertical

#### `CardHeader`
Encabezado con layout grid automático.
```typescript
function CardHeader({ className, ...props }: React.ComponentProps<'div'>)
```
- `data-slot="card-header"`
- Container queries: `@container/card-header`
- Grid auto con soporte para acciones (`has-data-[slot=card-action]`)
- Padding: px-6
- GAP: 2

#### `CardTitle`
Título principal.
```typescript
function CardTitle({ className, ...props }: React.ComponentProps<'div'>)
```
- `data-slot="card-title"`
- Tipografía: `font-semibold leading-none`

#### `CardDescription`
Descripción secundaria.
```typescript
function CardDescription({ className, ...props }: React.ComponentProps<'div'>)
```
- `data-slot="card-description"`
- Color: `text-muted-foreground text-sm`

#### `CardAction`
Elemento de acción (derecha del encabezado).
```typescript
function CardAction({ className, ...props }: React.ComponentProps<'div'>)
```
- Posicionamiento: `col-start-2 row-span-2 row-start-1`
- Justify: `self-start justify-self-end`

#### `CardContent`
Contenido principal.
```typescript
function CardContent({ className, ...props }: React.ComponentProps<'div'>)
```
- `data-slot="card-content"`
- Padding: px-6

#### `CardFooter`
Pie de tarjeta.
```typescript
function CardFooter({ className, ...props }: React.ComponentProps<'div'>)
```
- `data-slot="card-footer"`
- Flexbox: `flex items-center px-6`

**Patrón de Uso:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenido */}
  </CardContent>
</Card>
```

**Notas:**
- Primitiva composable
- Usar `data-slot` para selectores CSS
- Container queries permiten diseños responsivos

---

### `Skeleton`

**Ubicación:** `src/components/ui/skeleton.tsx`

**Responsabilidad:** Placeholder animado para estados de carga.

**Props:**
```typescript
function Skeleton({ className, ...props }: React.ComponentProps<'div'>)
```

**Comportamiento:**
- `data-slot="skeleton"`
- Fondo: `bg-accent` (color de acento del tema)
- Animación: `animate-pulse` (parpadeo)
- Border radius: `rounded-md`

**Uso Común:**
```tsx
{loading ? (
  <>
    <Skeleton className="h-4 w-28" />
    <Skeleton className="h-8 w-36" />
  </>
) : (
  <div>Contenido real</div>
)}
```

**Notas:**
- Altura y anchura personalizables con Tailwind
- Animación pulse preestablecida
- Color consistente con tema

---

## Integration Patterns

### App.tsx - Orquestador Principal

**Ubicación:** `src/App.tsx`

**Responsabilidad:** Componente raíz que orquesta fetch de datos y renderizado.

**Flujo de Datos:**

```
┌─ App (useEffect)
│  └─ fetchFinancialData() → GET /api/metrics
│     ├─ setMetrics(computeKPIs(movements))
│     ├─ setMonthlyData(computeMonthlyData(movements))
│     └─ setLoading(false)
│
└─ Render
   ├─ DashboardHeader
   ├─ Error Boundary (si hay error)
   ├─ KPIRow (metrics, loading)
   └─ Charts Grid
      ├─ IncomeOutcomeChart (monthlyData, loading)
      └─ ProfitPercentChart (monthlyData, loading)
```

**Estados:**
```typescript
const [metrics, setMetrics] = useState<KPIMetrics | null>(null)
const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

**Gestión de Errores:**
- Try-catch en fetchFinancialData
- Fallback a error message en español
- Renderiza banner rojo si hay error
- No crashea la app

**Layout Principal:**
```
┌─ main (dark mode, bg-background)
│  └─ Container (max-w-7xl, px-4 py-8)
│     └─ Flex Column (gap-8)
│        ├─ DashboardHeader
│        ├─ Error Banner (condicional)
│        ├─ section: KPIRow
│        └─ section: Charts Grid (xl:grid-cols-2)
```

**Variables de Entorno:**
```
VITE_API_BASE_URL  // URL base de API (fallback: "")
```

**Notas:**
- Fetch en useEffect[] para ejecutar una sola vez
- Loading propagado a todos los componentes hijos
- Error handling centralizado

---

## Data Flow & Types

### Financial Types

**Ubicación:** `src/lib/financial-types.ts`

```typescript
type OperationType = 'income' | 'outcome'
type Category = 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others'
type BusinessType = 'B2B' | 'B2C'

interface FinancialMovement {
  create_date: string        // ISO date
  amount: number
  operation_type: OperationType
  category: Category
  business_type: BusinessType
}

interface KPIMetrics {
  totalIncome: number        // Suma de movements.income
  totalOutcome: number       // Suma de movements.outcome
  profit: number             // totalIncome - totalOutcome
  profitPercent: number      // (profit / totalIncome) * 100
}

interface MonthlyDataPoint {
  month: string              // "Jan", "Feb", etc.
  income: number             // Suma mensual
  outcome: number            // Suma mensual
  profitPercent: number      // (profit / income) * 100
}
```

### Utilities

**Ubicación:** `src/lib/financial-utils.ts`

Funciones clave:
- `computeKPIs(movements: FinancialMovement[]): KPIMetrics`
- `computeMonthlyData(movements: FinancialMovement[]): MonthlyDataPoint[]`
- `formatCurrency(value: number): string`
- `formatPercent(value: number): string`

---

## Styling & Themes

### CSS Variables por Funcionalidad

**Chart Colors:**
```css
--chart-income        /* Color de línea de ingresos */
--chart-outcome       /* Color de línea de egresos */
--chart-profit        /* Color de línea de ganancia */
```

**KPI Badges:**
```css
--income-badge        /* Fondo del badge de ingresos */
--income-badge-fg     /* Texto del badge de ingresos */
--outcome-badge       /* Fondo del badge de egresos */
--outcome-badge-fg    /* Texto del badge de egresos */
--profit-badge        /* Fondo del badge de ganancia */
--profit-badge-fg     /* Texto del badge de ganancia */
```

**Base Theme:**
```css
--background          /* Fondo principal */
--foreground          /* Texto principal */
--card                /* Fondo de tarjetas */
--card-foreground     /* Texto en tarjetas */
--border              /* Color de bordes */
--muted-foreground    /* Texto secundario */
--accent              /* Color de acentos */
```

---

## Component Hierarchy

```
App
├─ DashboardHeader
└─ KPIRow
   ├─ KPICard (Total Income)
   ├─ KPICard (Total Outcome)
   ├─ KPICard (Profit)
   └─ KPICard (Profit Margin)
└─ IncomeOutcomeChart
   └─ Recharts LineChart
└─ ProfitPercentChart
   └─ Recharts LineChart
```

---

## Responsive Design

**Breakpoints:**

| Componente | Móvil | Tablet | Desktop |
|-----------|-------|--------|---------|
| DashboardHeader | flex-col | flex-row | flex-row |
| KPIRow | 1 col | 2 col | 4 col |
| Charts | 1 col | 1 col | 2 col |
| Charts Height | 280px | 280px | 280px |

---

## Accessibility

- **ARIA Labels:** sections etiquetadas con `aria-label`
- **Color Contrast:** Cumple WCAG AA
- **Tooltips:** Información complementaria accesible
- **Loading States:** Skeletons previenen layout shift
- **Semantic HTML:** Uso de `<main>`, `<section>`, `<header>`

---

## Performance Considerations

1. **Memoization:** Componentes funcionales con props estables
2. **Recharts:** ResponsiveContainer evita recálculos de dimensiones
3. **Data Fetching:** Única request en App.tsx
4. **Bundle:** Tree-shakeable con exports nombrados
5. **CSS Variables:** Evita duplicación de colores

---

## Future Extensions

- [ ] DateRange Picker para filtrar período
- [ ] Export de datos (PDF, CSV)
- [ ] Comparativa período anterior
- [ ] Drill-down por categoría
- [ ] Alertas de anomalías
- [ ] Dashboard personalizable

