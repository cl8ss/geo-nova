import { prisma } from './db'
import { sensorHealthThresholds } from './config'
import { getRiskData } from './analytics'

export type IntelligenceMetric = 'aqi' | 'pm25' | 'pm10' | 'co' | 'h2s' | 'voc'
export type TrendDirection = 'Increasing' | 'Stable' | 'Decreasing' | 'Insufficient data'

const metricUnits: Record<IntelligenceMetric, string> = { aqi: 'AQI', pm25: 'µg/m³', pm10: 'µg/m³', co: 'ppm', h2s: 'ppm', voc: 'ppb' }
const metricLabels: Record<IntelligenceMetric, string> = { aqi: 'AQI', pm25: 'PM2.5', pm10: 'PM10', co: 'CO', h2s: 'H₂S', voc: 'VOC' }
const metrics = Object.keys(metricUnits) as IntelligenceMetric[]
const metricThresholds: Partial<Record<IntelligenceMetric, boolean>> = { aqi: true, pm25: true, pm10: true, co: true, h2s: true, voc: true }

type ReadingRow = { id: string; sensorId: string; siteId: string; timestamp: Date; aqi: number; pm25: number; pm10: number; co: number; h2s: number; voc: number }
type SensorRow = { id: string; name: string; status: string; batteryLevel: number; lastSeenAt: Date | null; site: { id: string; name: string; country: { id: string; name: string } | null }; readings: ReadingRow[]; alerts: Array<{ id: string; metric: string; severity: string; status: string; createdAt: Date }> }

function round(value: number, digits = 1) { return Number(value.toFixed(digits)) }
function average(values: number[]) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0 }
function standardDeviation(values: number[], mean = average(values)) { return values.length ? Math.sqrt(average(values.map((value) => (value - mean) ** 2))) : 0 }
function valueOf(reading: ReadingRow, metric: IntelligenceMetric) { return reading[metric] }
function trendFor(values: number[]): { direction: TrendDirection; explanation: string; change: number | null } {
  if (values.length < 6) return { direction: 'Insufficient data', explanation: 'At least six observations are required for a trend comparison.', change: null }
  const split = Math.floor(values.length / 2)
  const previous = average(values.slice(0, split))
  const recent = average(values.slice(split))
  const change = previous ? ((recent - previous) / Math.abs(previous)) * 100 : 0
  const direction: TrendDirection = Math.abs(change) < 5 ? 'Stable' : change > 0 ? 'Increasing' : 'Decreasing'
  return { direction, explanation: `Recent observations are ${round(Math.abs(change), 1)}% ${change >= 0 ? 'above' : 'below'} the preceding observation window.`, change: round(change) }
}

async function loadSensors({ hours = 24, countryId, siteId, sensorId, readingTake = 500 }: { hours?: number; countryId?: string; siteId?: string; sensorId?: string; readingTake?: number } = {}) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  const sensors = await prisma.sensor.findMany({ where: { ...(sensorId ? { id: sensorId } : {}), ...(siteId ? { siteId } : {}), ...(countryId ? { site: { countryId } } : {}) }, include: { site: { select: { id: true, name: true, country: { select: { id: true, name: true } } } }, readings: { where: { timestamp: { gte: since } }, orderBy: { timestamp: 'desc' }, take: readingTake }, alerts: { where: { status: { in: ['ACTIVE', 'ACKNOWLEDGED'] } }, select: { id: true, metric: true, severity: true, status: true, createdAt: true } } }, orderBy: { name: 'asc' } }) as unknown as SensorRow[]
  return sensors.map((sensor) => ({ ...sensor, readings: [...sensor.readings].reverse() }))
}

function anomalyFor(sensor: SensorRow, metric: IntelligenceMetric) {
  const values = sensor.readings.map((reading: ReadingRow) => valueOf(reading, metric))
  if (values.length < 8) return { status: 'Insufficient data', current: values.at(-1) ?? null, baseline: null, deviation: null, zScore: null, explanation: 'At least eight observations are required for anomaly detection.', method: 'Rolling mean and standard deviation' }
  const current = values.at(-1) as number
  const baselineValues = values.slice(-25, -1)
  const baseline = average(baselineValues)
  const deviation = standardDeviation(baselineValues, baseline)
  const zScore = deviation ? (current - baseline) / deviation : 0
  const status = Math.abs(zScore) >= 3 ? 'Anomaly' : Math.abs(zScore) >= 2 ? 'Unusual' : 'Normal'
  return { status, current: round(current), baseline: round(baseline), deviation: round(current - baseline), zScore: round(zScore, 2), explanation: status === 'Normal' ? 'The latest simulated reading is consistent with this sensor’s recent pattern.' : `The latest simulated ${metricLabels[metric]} reading differs from this sensor’s recent historical pattern.`, method: 'Rolling mean and standard deviation (z-score)' }
}

function healthFor(sensor: SensorRow) {
  const ageSeconds = sensor.lastSeenAt ? (Date.now() - sensor.lastSeenAt.getTime()) / 1000 : Infinity
  const values = sensor.readings.slice(-20).map((reading) => reading.aqi)
  const variability = values.length > 4 && average(values) ? standardDeviation(values) / Math.abs(average(values)) : 0
  const ageMs = ageSeconds * 1000
  const status = sensor.status !== 'ONLINE' || ageMs > sensorHealthThresholds.offlineMs ? 'Offline' : ageMs > sensorHealthThresholds.delayedMs ? 'Delayed' : variability > 0.65 ? 'Unstable' : 'Healthy'
  const explanation = status === 'Offline' ? 'The sensor status or last-reading age indicates that no current simulated update is available.' : status === 'Delayed' ? `The last simulated update was ${Math.round(ageSeconds)} seconds ago.` : status === 'Unstable' ? 'Recent AQI observations vary substantially relative to their recent average.' : 'The sensor is reporting within the expected simulated update window.'
  return { status, lastSeenAt: sensor.lastSeenAt?.toISOString() ?? null, ageSeconds: Number.isFinite(ageSeconds) ? Math.round(ageSeconds) : null, readingCount: sensor.readings.length, variability: round(variability, 2), batteryLevel: sensor.batteryLevel, explanation }
}

function aggregateForecastReadings(readings: ReadingRow[]) {
  const buckets = new Map<number, ReadingRow[]>()
  for (const reading of readings) {
    const bucket = Math.floor(reading.timestamp.getTime() / 60000) * 60000
    const values = buckets.get(bucket) ?? []
    values.push(reading)
    buckets.set(bucket, values)
  }
  return [...buckets.entries()].sort(([left], [right]) => left - right).map(([timestamp, rows]) => ({ ...rows[0], timestamp: new Date(timestamp), aqi: average(rows.map((row) => row.aqi)), pm25: average(rows.map((row) => row.pm25)), pm10: average(rows.map((row) => row.pm10)), co: average(rows.map((row) => row.co)), h2s: average(rows.map((row) => row.h2s)), voc: average(rows.map((row) => row.voc)) }))
}

export async function getForecastData({ hours = 24, metric, horizon, countryId, siteId, sensorId }: { hours?: number; metric: IntelligenceMetric; horizon: number; countryId?: string; siteId?: string; sensorId?: string }) {
  const sensors = await loadSensors({ hours, countryId, siteId, sensorId })
  const rawReadings = sensors.flatMap((sensor) => sensor.readings).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  const readings = sensorId ? rawReadings : aggregateForecastReadings(rawReadings)
  const scope = sensorId ? 'Selected sensor' : siteId ? 'Selected site aggregate' : countryId ? 'Selected country aggregate' : 'Global demo aggregate'
  const values = readings.map((reading) => valueOf(reading, metric))
  const trend = trendFor(values)
  const history = readings.slice(-48).map((reading) => ({ time: reading.timestamp.toISOString(), value: round(valueOf(reading, metric)) }))
  if (values.length < 12) return { available: false, metric, label: metricLabels[metric], unit: metricUnits[metric], horizon, scope, method: 'Weighted linear trend using actual observation timestamps', trend, historical: history, forecast: [], explanation: 'More historical observations are required before an experimental forecast can be calculated.' }
  const recentReadings = readings.slice(-24)
  const recentValues = recentReadings.map((reading) => valueOf(reading, metric))
  const first = average(recentValues.slice(0, Math.max(3, Math.floor(recentValues.length / 3))))
  const last = average(recentValues.slice(-Math.max(3, Math.floor(recentValues.length / 3))))
  const firstTime = recentReadings[0].timestamp.getTime()
  const lastTime = recentReadings.at(-1)!.timestamp.getTime()
  const elapsedHours = Math.max(1 / 60, (lastTime - firstTime) / 3600000)
  const perHour = (last - first) / elapsedHours
  const latest = values.at(-1) as number
  const forecast = Array.from({ length: horizon }, (_, index) => ({ time: new Date(lastTime + (index + 1) * 60 * 60 * 1000).toISOString(), value: round(Math.max(0, latest + perHour * (index + 1))) }))
  return { available: true, metric, label: metricLabels[metric], unit: metricUnits[metric], horizon, scope, method: 'Weighted linear trend using actual observation timestamps', trend, historical: history, forecast, observations: values.length, explanation: 'Experimental forecast based on simulated data. Forecast values are estimates, not operational predictions.' }
}

export async function getAnomalyData({ hours = 24, metric, countryId, siteId, sensorId }: { hours?: number; metric?: IntelligenceMetric; countryId?: string; siteId?: string; sensorId?: string } = {}) {
  const sensors = await loadSensors({ hours, countryId, siteId, sensorId })
  return sensors.flatMap((sensor) => (metric ? [metric] : metrics).map((selectedMetric) => {
    const result = anomalyFor(sensor, selectedMetric)
    return {
      id: `${sensor.id}-${selectedMetric}`,
      sensorId: sensor.id,
      sensor: sensor.name,
      siteId: sensor.site.id,
      site: sensor.site.name,
      countryId: sensor.site.country?.id ?? null,
      country: sensor.site.country?.name ?? 'Demo country',
      metric: selectedMetric,
      label: metricLabels[selectedMetric],
      unit: metricUnits[selectedMetric],
      timestamp: sensor.readings.at(-1)?.timestamp.toISOString() ?? null,
      ...result,
    }
  })).filter((item) => item.status !== 'Insufficient data')
}

export async function getSensorHealthData({ hours = 24, countryId, siteId, sensorId }: { hours?: number; countryId?: string; siteId?: string; sensorId?: string } = {}) {
  const sensors = await loadSensors({ hours, countryId, siteId, sensorId, readingTake: 60 })
  return sensors.map((sensor) => ({ id: sensor.id, sensor: sensor.name, siteId: sensor.site.id, site: sensor.site.name, countryId: sensor.site.country?.id ?? null, country: sensor.site.country?.name ?? 'Demo country', ...healthFor(sensor) }))
}

export async function getInsightData({ hours = 24, countryId, siteId, sensorId }: { hours?: number; countryId?: string; siteId?: string; sensorId?: string } = {}) {
  const [sensors, anomalies, health] = await Promise.all([loadSensors({ hours, countryId, siteId, sensorId }), getAnomalyData({ hours, countryId, siteId, sensorId }), getSensorHealthData({ hours, countryId, siteId, sensorId })])
  const insights: Array<{ id: string; title: string; type: string; severity: 'info' | 'warning' | 'critical'; sensorId?: string; sensor?: string; site?: string; country?: string; metric?: string; explanation: string; recommendedAction: string; timestamp: string }> = []
  for (const sensor of sensors) {
    for (const metric of metrics) { const trend = trendFor(sensor.readings.map((reading: ReadingRow) => valueOf(reading, metric))); if (trend.direction === 'Increasing') insights.push({ id: `trend-${sensor.id}-${metric}`, title: `${metricLabels[metric]} trend is increasing`, type: 'trend', severity: 'warning', sensorId: sensor.id, sensor: sensor.name, site: sensor.site.name, country: sensor.site.country?.name, metric, explanation: `Recent ${metricLabels[metric]} observations are ${Math.abs(trend.change ?? 0)}% above the preceding window.`, recommendedAction: 'Continue monitoring the next simulated observation window.', timestamp: sensor.readings.at(-1)?.timestamp.toISOString() ?? new Date().toISOString() }) }
    const healthResult = health.find((item) => item.id === sensor.id)
    if (healthResult && healthResult.status !== 'Healthy') insights.push({ id: `health-${sensor.id}`, title: `${sensor.name} needs data-quality attention`, type: 'sensor-health', severity: healthResult.status === 'Offline' ? 'critical' : 'warning', sensorId: sensor.id, sensor: sensor.name, site: sensor.site.name, country: sensor.site.country?.name, explanation: healthResult.explanation, recommendedAction: 'Review the existing live-monitoring sensor details.', timestamp: healthResult.lastSeenAt ?? new Date().toISOString() })
  }
  for (const anomaly of anomalies.filter((item) => item.status === 'Anomaly' || item.status === 'Unusual').slice(0, 20)) insights.push({ id: `anomaly-${anomaly.id}`, title: `${anomaly.label} pattern is ${anomaly.status.toLowerCase()}`, type: 'anomaly', severity: anomaly.status === 'Anomaly' ? 'critical' : 'warning', sensorId: anomaly.sensorId, sensor: anomaly.sensor, site: anomaly.site, country: anomaly.country, metric: anomaly.metric, explanation: anomaly.explanation, recommendedAction: 'Review the sensor history and surrounding alert context.', timestamp: anomaly.timestamp ?? new Date().toISOString() })
  if (!insights.length) insights.push({ id: 'stable-demo-network', title: 'Recent simulated conditions are stable', type: 'stability', severity: 'info', explanation: 'No rule-based trend, anomaly, or sensor-health pattern requires additional review in this scope.', recommendedAction: 'Continue observing the simulated network.', timestamp: new Date().toISOString() })
  return { generatedAt: new Date().toISOString(), hours, insights: insights.slice(0, 40), methodology: 'Rule-based demo intelligence using simulated readings, rolling statistics, existing sensor timestamps, and configured demonstration thresholds. No validated production ML model is included.' }
}

export async function getIntelligenceSummary() {
  const [health, anomalies, insights, risk, alerts] = await Promise.all([getSensorHealthData(), getAnomalyData(), getInsightData(), getRiskData('global'), prisma.alert.findMany({ where: { status: 'ACTIVE', severity: 'CRITICAL' }, select: { id: true } })])
  return { risk: { score: risk.score, band: risk.band }, activeAnomalies: anomalies.filter((item) => item.status === 'Anomaly').length, sensorsRequiringAttention: health.filter((item) => item.status !== 'Healthy').length, activeCriticalAlerts: alerts.length, increasingTrends: insights.insights.filter((item) => item.type === 'trend').length, predictionAvailable: (await getForecastData({ metric: 'aqi', horizon: 1 })).available, healthCounts: { Healthy: health.filter((item) => item.status === 'Healthy').length, Delayed: health.filter((item) => item.status === 'Delayed').length, Unstable: health.filter((item) => item.status === 'Unstable').length, Offline: health.filter((item) => item.status === 'Offline').length }, generatedAt: new Date().toISOString() }
}

export async function getAlertContext(alertId: string) {
  const alert = await prisma.alert.findUnique({ where: { id: alertId }, include: { sensor: { include: { site: { include: { country: true } } } }, site: true } })
  if (!alert) return null
  const [sensor] = await loadSensors({ sensorId: alert.sensorId, hours: 24 })
  const metric = (metricThresholds[alert.metric as IntelligenceMetric] ? alert.metric : 'aqi') as IntelligenceMetric
  const anomaly = anomalyFor(sensor, metric)
  const health = healthFor(sensor)
  const trend = trendFor(sensor.readings.map((reading: ReadingRow) => valueOf(reading, metric)))
  const relatedAlerts = await prisma.alert.findMany({ where: { sensorId: alert.sensorId, id: { not: alert.id } }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, title: true, metric: true, severity: true, status: true, createdAt: true } })
  const risk = await getRiskData('sensor', undefined, alert.sensorId)
  return { alert, trend: { metric, direction: trend.direction, explanation: trend.explanation }, anomaly, health, risk: { score: risk.score, band: risk.band }, relatedAlerts, recentReadings: sensor.readings.slice(-12) }
}
