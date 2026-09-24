export interface ApiReading {
  id: string
  sensorId: string
  siteId: string
  timestamp: string
  temperature: number
  humidity: number
  pm25: number
  pm10: number
  aqi: number
  co: number
  h2s: number
  voc: number
  sensor?: { name: string; location: string }
  site?: { name: string }
}

export interface ApiAlert {
  id: string
  sensorId: string
  siteId: string
  metric: string
  title: string
  description: string
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
  value: number
  threshold: number
  createdAt: string
  sensor?: { name: string; location: string }
  site?: { id?: string; name: string; country?: DashboardCountry | null }
}

export interface DashboardCountry {
  id: string
  name: string
  iso2: string
  iso3: string
  latitude: number
  longitude: number
  demo: boolean
}

export interface DashboardSite {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  countryId?: string | null
  country?: DashboardCountry | null
}

export interface CountrySite extends DashboardSite {
  sensorCount: number
  onlineCount: number
  warningCount: number
  criticalCount: number
  offlineCount: number
  activeAlerts: number
  latestAqi?: number
  latestTemperature?: number
  lastSync: string | null
}

export interface CountrySummary extends DashboardCountry {
  siteCount: number
  sites: CountrySite[]
  sensorCount: number
  onlineCount: number
  warningCount: number
  criticalCount: number
  offlineCount: number
  activeAlerts: number
  latestAqi?: number
  latestTemperature?: number
  lastSync: string | null
}

export type AnalyticsMetric = 'aqi' | 'pm25' | 'temperature' | 'humidity' | 'pm10' | 'co' | 'h2s' | 'voc'
export interface TrendData { metric: AnalyticsMetric; label: string; unit: string; hours: number; points: Array<{ time: string; value: number }>; summary: { current: number | null; average: number | null; minimum: number | null; maximum: number | null; records: number } }
export interface ComparisonSite { id: string; name: string; country: string | null; sensors: number; records: number; averageAqi: number | null; averagePm25: number | null; averageTemperature: number | null; activeAlerts: number; lastReading: string | null }
export interface RiskData { scope: string; score: number; band: string; reasons: string[]; dataAvailable: boolean; contributors: Array<{ id: string; name: string; site: string; band: string; score: number; latestAqi: number | null; activeAlerts: number }>; thresholds: Record<string, { warning: number; critical: number }> }
export interface InsightData { hours: number; generatedAt: string; insights: Array<{ title: string; detail: string; tone: 'info' | 'warning' | 'critical' }>; methodology: string }
export interface ReportData { generatedAt: string; hours: number; trend: TrendData; comparison: ComparisonSite[]; risk: RiskData; insights: InsightData; alerts: ApiAlert[] }
export type IntelligenceMetric = 'aqi' | 'pm25' | 'pm10' | 'co' | 'h2s' | 'voc'
export interface TrendClassification { direction: 'Increasing' | 'Stable' | 'Decreasing' | 'Insufficient data'; explanation: string; change: number | null }
export interface ForecastData { available: boolean; metric: IntelligenceMetric; label: string; unit: string; horizon: number; scope?: string; method: string; trend: TrendClassification; historical: Array<{ time: string; value: number }>; forecast: Array<{ time: string; value: number }>; observations?: number; explanation: string }
export interface AnomalyData { id: string; sensorId: string; sensor: string; siteId: string; site: string; countryId: string | null; country: string; metric: IntelligenceMetric; label: string; unit: string; timestamp: string | null; status: string; current: number | null; baseline: number | null; deviation: number | null; zScore: number | null; explanation: string; method: string }
export interface SensorHealthData { id: string; sensor: string; siteId: string; site: string; country: string; status: string; lastSeenAt: string | null; ageSeconds: number | null; readingCount: number; variability: number; batteryLevel: number; explanation: string }
export interface IntelligenceInsight { id: string; title: string; type: string; severity: 'info' | 'warning' | 'critical'; sensorId?: string; sensor?: string; site?: string; country?: string; metric?: string; explanation: string; recommendedAction: string; timestamp: string }
export interface IntelligenceSummary { risk: { score: number; band: string }; activeAnomalies: number; sensorsRequiringAttention: number; activeCriticalAlerts: number; increasingTrends: number; predictionAvailable: boolean; healthCounts: Record<string, number>; generatedAt: string }
export interface AlertContext { alert: ApiAlert; trend: { metric: IntelligenceMetric; direction: string; explanation: string }; anomaly: { status: string; current: number | null; baseline: number | null; deviation: number | null; zScore: number | null; explanation: string; method: string }; health: SensorHealthData; risk: { score: number; band: string }; relatedAlerts: ApiAlert[]; recentReadings: ApiReading[] }

export interface DashboardSummary {
  dataType: string
  demoThresholds: Record<string, { warning: number; critical: number }>
  countries: DashboardCountry[]
  sites: DashboardSite[]
  sensors: Array<{ id: string; name: string; location: string; type: string; status: string; batteryLevel: number; lastSeenAt: string | null; site: DashboardSite }>
  alerts: ApiAlert[]
  latestReadings: ApiReading[]
  history: Array<{ time: string; aqi: number; pm25: number; temperature: number; humidity: number }>
  metrics: { aqi: number; temperature: number; humidity: number; pm25: number; activeSensors: number; totalSensors: number; openAlerts: number }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init })
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(payload?.error ?? `Request failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}

export function getDashboardSummary() { return request<DashboardSummary>('/api/dashboard/summary') }
export function getCountries() { return request<CountrySummary[]>('/api/countries') }
export function getCountrySummary(countryId: string) { return request<CountrySummary>(`/api/countries/${encodeURIComponent(countryId)}/summary`) }
export function getCountrySites(countryId: string) { return request<CountrySite[]>(`/api/countries/${encodeURIComponent(countryId)}/sites`) }
export function getSensorHistory(sensorId: string) { return request<ApiReading[]>(`/api/readings/history?sensorId=${encodeURIComponent(sensorId)}&hours=24`) }
export function acknowledgeAlert(id: string) { return request<ApiAlert>(`/api/alerts/${id}/acknowledge`, { method: 'POST', body: '{}' }) }
export function getAlerts(status?: ApiAlert['status']) { return request<ApiAlert[]>(`/api/alerts${status ? `?status=${encodeURIComponent(status)}` : ''}`) }
export function getTrendData(params: { hours?: number; metric?: AnalyticsMetric; siteId?: string; sensorId?: string } = {}) { const query = new URLSearchParams(); query.set('hours', String(params.hours ?? 24)); query.set('metric', params.metric ?? 'aqi'); if (params.siteId) query.set('siteId', params.siteId); if (params.sensorId) query.set('sensorId', params.sensorId); return request<TrendData>(`/api/analytics/trends?${query}`) }
export function getComparisonData(hours = 24, siteIds: string[] = []) { const query = new URLSearchParams({ hours: String(hours) }); if (siteIds.length) query.set('siteIds', siteIds.join(',')); return request<ComparisonSite[]>(`/api/analytics/comparison?${query}`) }
export function getRiskData(scope: 'global' | 'site' | 'sensor' = 'global', ids: { siteId?: string; sensorId?: string } = {}) { const query = new URLSearchParams({ scope }); if (ids.siteId) query.set('siteId', ids.siteId); if (ids.sensorId) query.set('sensorId', ids.sensorId); return request<RiskData>(`/api/analytics/risk?${query}`) }
export function getInsightData(hours = 24) { return request<InsightData>(`/api/analytics/insights?hours=${hours}`) }
export function getReportData(hours = 24) { return request<ReportData>(`/api/reports/summary?hours=${hours}`) }
function intelligenceQuery(params: { hours?: number; metric?: IntelligenceMetric; horizon?: number; countryId?: string; siteId?: string; sensorId?: string } = {}) { const query = new URLSearchParams(); query.set('hours', String(params.hours ?? 24)); if (params.metric) query.set('metric', params.metric); if (params.horizon) query.set('horizon', String(params.horizon)); if (params.countryId) query.set('countryId', params.countryId); if (params.siteId) query.set('siteId', params.siteId); if (params.sensorId) query.set('sensorId', params.sensorId); return query }
export function getIntelligenceSummary() { return request<IntelligenceSummary>('/api/intelligence/summary') }
export function getForecastData(params: { hours?: number; metric?: IntelligenceMetric; horizon?: number; countryId?: string; siteId?: string; sensorId?: string } = {}) { return request<ForecastData>(`/api/intelligence/forecast?${intelligenceQuery({ metric: 'aqi', horizon: 1, ...params })}`) }
export function getAnomalyData(params: { hours?: number; metric?: IntelligenceMetric; countryId?: string; siteId?: string; sensorId?: string } = {}) { return request<AnomalyData[]>(`/api/intelligence/anomalies?${intelligenceQuery(params)}`) }
export function getSensorHealthData(params: { hours?: number; countryId?: string; siteId?: string; sensorId?: string } = {}) { return request<SensorHealthData[]>(`/api/intelligence/sensor-health?${intelligenceQuery(params)}`) }
export function getIntelligenceInsights(params: { hours?: number; countryId?: string; siteId?: string; sensorId?: string } = {}) { return request<{ generatedAt: string; hours: number; insights: IntelligenceInsight[]; methodology: string }>(`/api/intelligence/insights?${intelligenceQuery(params)}`) }
export function getAlertContext(id: string) { return request<AlertContext>(`/api/intelligence/alert-context/${encodeURIComponent(id)}`) }
