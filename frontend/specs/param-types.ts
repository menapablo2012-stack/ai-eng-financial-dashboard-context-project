/**
 * Query Parameter Types Specification
 * 
 * Define los tipos para los parámetros de query que se envían a cada endpoint.
 * Usados para validación y autocompletado en llamadas HTTP.
 * 
 * Estructura:
 * 1. Tipos base y enumeraciones
 * 2. Parámetros por endpoint
 * 3. Builders para construcción segura de URLs
 */

// ============================================================================
// 1. TIPOS BASE Y ENUMERACIONES
// ============================================================================

/**
 * Granularidad temporal disponible para agrupación de datos.
 */
export type TimeGrouping = 'day' | 'week' | 'month'

/**
 * Tipos de negocio para segmentación de datos.
 */
export type BusinessType = 'B2B' | 'B2C'

/**
 * Categorías de movimientos financieros disponibles.
 */
export type FinancialCategory = 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others'

/**
 * Tipos de operación financiera.
 */
export type OperationType = 'income' | 'outcome'

/**
 * Formato de fecha esperado: YYYY-MM-DD
 */
export type DateString = string // ISO 8601 format

// ============================================================================
// 2. PARÁMETROS POR ENDPOINT
// ============================================================================

/**
 * Parámetros para GET `/api/metrics/summary`
 * 
 * Obtiene resumen de ingresos/gastos agrupados por período con filtros opcionales.
 */
export interface SummaryParams {
  /**
   * Granularidad temporal para agrupar datos.
   * @default "month"
   */
  group_by?: TimeGrouping

  /**
   * Fecha inicial del rango (YYYY-MM-DD).
   * Incluyente. Si no se especifica, comienza desde el primer registro.
   */
  start_date?: DateString

  /**
   * Fecha final del rango (YYYY-MM-DD).
   * Incluyente. Si no se especifica, termina en el último registro.
   */
  end_date?: DateString

  /**
   * Filtrar por categoría de movimiento.
   * Si se omite, incluye todas las categorías.
   */
  category?: FinancialCategory

  /**
   * Filtrar por tipo de operación.
   * Si se omite, incluye ingresos y gastos.
   */
  operation_type?: OperationType

  /**
   * Filtrar por tipo de negocio.
   * Si se omite, incluye ambos tipos.
   */
  business_type?: BusinessType
}

/**
 * Parámetros para GET `/api/metrics/categories/top`
 * 
 * Obtiene las categorías principales ordenadas por monto de movimientos.
 */
export interface TopCategoriesParams {
  /**
   * Tipo de operación a analizar.
   * @default "outcome"
   */
  operation_type?: OperationType

  /**
   * Número máximo de categorías a retornar.
   * @default 5
   * @min 1
   * @max 20
   */
  limit?: number

  /**
   * Fecha inicial del rango (YYYY-MM-DD).
   * Incluyente. Si no se especifica, comienza desde el primer registro.
   */
  start_date?: DateString

  /**
   * Fecha final del rango (YYYY-MM-DD).
   * Incluyente. Si no se especifica, termina en el último registro.
   */
  end_date?: DateString

  /**
   * Filtrar por tipo de negocio.
   * Si se omite, incluye ambos tipos.
   */
  business_type?: BusinessType
}

/**
 * Parámetros para GET `/api/metrics/comparison`
 * 
 * Compara el valor neto del período actual vs período anterior equivalente.
 */
export interface ComparisonParams {
  /**
   * Inicio del período actual a comparar (YYYY-MM-DD).
   * Requerido. Incluyente.
   */
  start_date: DateString

  /**
   * Fin del período actual a comparar (YYYY-MM-DD).
   * Requerido. Incluyente.
   */
  end_date: DateString

  /**
   * Filtrar por tipo de negocio.
   * Si se omite, incluye ambos tipos.
   */
  business_type?: BusinessType
}

/**
 * Parámetros para GET `/api/metrics/alerts`
 * 
 * Detecta períodos con gastos anormalmente altos (desviaciones de promedio histórico).
 */
export interface AlertsParams {
  /**
   * Umbral de incremento para disparar alerta.
   * Expresado como factor decimal (ej: 0.3 = 30% sobre promedio).
   * @default 0.3
   * @min 0
   */
  threshold?: number

  /**
   * Granularidad temporal para analizar anomalías.
   * @default "month"
   */
  group_by?: TimeGrouping

  /**
   * Fecha inicial del rango (YYYY-MM-DD).
   * Incluyente. Si no se especifica, comienza desde el primer registro.
   */
  start_date?: DateString

  /**
   * Fecha final del rango (YYYY-MM-DD).
   * Incluyente. Si no se especifica, termina en el último registro.
   */
  end_date?: DateString
}

/**
 * Parámetros para GET `/api/metrics/facets`
 * 
 * Obtiene metadatos sobre rango de fechas y disponibilidad de vistas B2B vs B2C.
 */
export interface FacetsParams {
  // Este endpoint no tiene parámetros obligatorios
  // Se incluye para completitud y futuras extensiones
}

// ============================================================================
// 3. TIPOS COMBINADOS Y UTILIDADES
// ============================================================================

/**
 * Unión de todos los tipos de parámetros posibles.
 * Útil para funciones genéricas que construyen URLs.
 */
export type AnyParams =
  | SummaryParams
  | TopCategoriesParams
  | ComparisonParams
  | AlertsParams
  | FacetsParams

/**
 * Tipo para parámetros que requieren rango de fechas.
 * Se hereda en endpoints que necesitan start_date y end_date.
 */
export interface DateRangeParams {
  start_date?: DateString
  end_date?: DateString
}

/**
 * Tipo para parámetros que soportan filtrado por business_type.
 * Se hereda en endpoints que pueden filtrar por tipo de negocio.
 */
export interface BusinessTypeFilterParams {
  business_type?: BusinessType
}

/**
 * Validador de rango de fechas.
 * Retorna true si ambas fechas están presentes y son válidas.
 * @throws No lanza errores, retorna false en validación fallida.
 */
export function isValidDateRange(start?: DateString, end?: DateString): boolean {
  if (!start || !end) return false
  const startDate = new Date(start)
  const endDate = new Date(end)
  return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate
}

/**
 * Convierte un objeto de parámetros a URLSearchParams.
 * Filtra valores undefined/null automáticamente.
 * @example
 * ```ts
 * const params: SummaryParams = { group_by: 'week', start_date: '2025-01-01' }
 * const url = new URL('http://localhost:8000/api/metrics/summary')
 * url.search = paramsToURLSearchParams(params).toString()
 * ```
 */
export function paramsToURLSearchParams(params: Record<string, any>): URLSearchParams {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value))
    }
  })
  return search
}
