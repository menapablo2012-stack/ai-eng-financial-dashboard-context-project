/**
 * API Types Specification
 * 
 * Define los tipos para las tres funcionalidades principales:
 * 1. FacetsResponse - Referencia de rango de fechas y filtros B2B vs B2C
 * 2. AlertEntry / AlertsResponse - Tabla de anomalías detectadas
 * 3. CategoryEntry / TopCategoriesResponse - Tabla comparativa por categoría B2B vs B2C
 */

// ============================================================================
// 1. FACETS RESPONSE - Rango de fechas y vistas B2B vs B2C
// ============================================================================

/**
 * Referencia de rango de fechas disponibles en los datos.
 * Permite al frontend establecer los límites de filtros de fecha.
 */
export interface DateRangeFacet {
  min: string // ISO date
  max: string // ISO date
  count: number // cantidad total de movimientos
}

/**
 * Resumen de movimientos por tipo de negocio.
 * Permite switch entre vistas B2B y B2C.
 */
export interface BusinessTypeFacet {
  type: 'B2B' | 'B2C'
  count: number
  totalAmount: number
}

/**
 * Respuesta de facetas.
 * Contiene metadatos sobre el rango de fechas y disponibilidad de vistas B2B/B2C.
 */
export interface FacetsResponse {
  dateRange: DateRangeFacet
  businessTypes: BusinessTypeFacet[]
  status: 'success' | 'error'
  timestamp: string
}

// ============================================================================
// 2. ALERT ENTRY / ALERTS RESPONSE - Tabla de anomalías
// ============================================================================

/**
 * Tipos de anomalías detectadas en los datos.
 */
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type AlertType = 'spike' | 'drop' | 'anomaly' | 'threshold' | 'trend'

/**
 * Entrada individual en la tabla de anomalías.
 * Registra movimientos inusuales o cambios significativos.
 */
export interface AlertEntry {
  id: string
  date: string // ISO date
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  businessType: 'B2B' | 'B2C'
  category: string
  amount: number
  percentageChange?: number // cambio respecto al promedio anterior
  metadata?: {
    baseline?: number
    threshold?: number
    detectionMethod?: string
  }
}

/**
 * Respuesta de tabla de anomalías.
 * Contiene listado paginado de alertas para visualización en tabla.
 */
export interface AlertsResponse {
  data: AlertEntry[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
  filters: {
    businessType?: 'B2B' | 'B2C' | 'all'
    severity?: AlertSeverity | 'all'
    dateRange?: {
      start: string
      end: string
    }
  }
  status: 'success' | 'error'
  timestamp: string
}

// ============================================================================
// 3. CATEGORY ENTRY / TOP CATEGORIES RESPONSE - Tabla comparativa B2B vs B2C
// ============================================================================

/**
 * Métricas por categoría para un tipo de negocio.
 */
export interface CategoryMetrics {
  income: number
  outcome: number
  profit: number
  profitPercent: number
  movementCount: number
}

/**
 * Entrada individual en la tabla comparativa de categorías.
 * Permite análisis paralelo entre B2B y B2C.
 */
export interface CategoryEntry {
  category: string
  b2b: CategoryMetrics
  b2c: CategoryMetrics
  variance: {
    incomeRatio: number // B2B income / B2C income
    outcomeRatio: number // B2B outcome / B2C outcome
    profitDiff: number // B2B profit - B2C profit
  }
}

/**
 * Respuesta de tabla comparativa de categorías.
 * Contiene análisis lado-a-lado de categorías entre B2B y B2C.
 */
export interface TopCategoriesResponse {
  data: CategoryEntry[]
  summary: {
    totalCategories: number
    dateRange: {
      start: string
      end: string
    }
    b2bTotal: CategoryMetrics
    b2cTotal: CategoryMetrics
  }
  sortBy: 'income' | 'outcome' | 'profit' | 'variance'
  status: 'success' | 'error'
  timestamp: string
}

// ============================================================================
// TYPE GUARDS & VALIDATORS
// ============================================================================

/**
 * Type guard para validar FacetsResponse.
 */
export function isFacetsResponse(value: unknown): value is FacetsResponse {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return (
    obj.dateRange !== undefined &&
    Array.isArray(obj.businessTypes) &&
    (obj.status === 'success' || obj.status === 'error') &&
    typeof obj.timestamp === 'string'
  )
}

/**
 * Type guard para validar AlertEntry.
 */
export function isAlertEntry(value: unknown): value is AlertEntry {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  const validTypes: AlertType[] = ['spike', 'drop', 'anomaly', 'threshold', 'trend']
  const validSeverities: AlertSeverity[] = ['info', 'warning', 'critical']
  return (
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    validTypes.includes(obj.type as AlertType) &&
    validSeverities.includes(obj.severity as AlertSeverity) &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    (obj.businessType === 'B2B' || obj.businessType === 'B2C') &&
    typeof obj.category === 'string' &&
    typeof obj.amount === 'number'
  )
}

/**
 * Type guard para validar AlertsResponse.
 */
export function isAlertsResponse(value: unknown): value is AlertsResponse {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return (
    Array.isArray(obj.data) &&
    obj.pagination !== undefined &&
    obj.filters !== undefined &&
    (obj.status === 'success' || obj.status === 'error') &&
    typeof obj.timestamp === 'string'
  )
}

/**
 * Type guard para validar CategoryEntry.
 */
export function isCategoryEntry(value: unknown): value is CategoryEntry {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.category === 'string' &&
    obj.b2b !== undefined &&
    obj.b2c !== undefined &&
    obj.variance !== undefined
  )
}

/**
 * Type guard para validar TopCategoriesResponse.
 */
export function isTopCategoriesResponse(value: unknown): value is TopCategoriesResponse {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  const validSortOptions: Array<'income' | 'outcome' | 'profit' | 'variance'> = [
    'income',
    'outcome',
    'profit',
    'variance',
  ]
  return (
    Array.isArray(obj.data) &&
    obj.summary !== undefined &&
    validSortOptions.includes(obj.sortBy as never) &&
    (obj.status === 'success' || obj.status === 'error') &&
    typeof obj.timestamp === 'string'
  )
}
