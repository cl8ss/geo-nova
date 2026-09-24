import { demoThresholds } from './config'
import { prisma } from './db'

export type AnalyticsMetric = 'aqi' | 'pm25' | 'temperature' | 'humidity' | 'pm10' | 'co' | 'h2s' | 'voc'

const metricUnits: Record<AnalyticsMetric, string> = { aqi: 'AQI', pm25: 'µg/m³', temperature: '°C', humidity: '%', pm10: 'µg/m³', co: 'ppm', h2s: 'ppm', voc: 'ppb' }
const metricLabels: Record<AnalyticsMetric, string> = { aqi: 'Air quality index', pm25: 'PM2.5', temperature: 'Temperature', humidity: 'Humidity', pm10: 'PM10', co: 'CO', h2s: 'H₂S', voc: 'VOC' }

function metricValue(reading: Record<string, unknown>, metric: AnalyticsMetric) { return Number(reading[metric] ?? 0) }
function round(value: number, digits = 1) { return Number(value.toFixed(digits)) }
function average(values: number[]) { return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0 }

export async function getTrendData({ hours, metric, siteId, sensorId }: { hours: number; metric: AnalyticsMetric; siteId?: string; sensorId?: string }) {
  const readings = (await prisma.reading.findMany({ where: { ...(siteId ? { siteId } : {}), ...(sensorId ? { sensorId } : {}), timestamp: { gte: new Date(Date.now() - hours * 60 * 60 * 1000) } }, orderBy: { timestamp: 'desc' }, take: 500 })).reverse()
  const stride = Math.max(1, Math.ceil(readings.length / 48))
  const points = readings.filter((_, index) => index % stride === 0).map((reading) => ({ time: reading.timestamp.toISOString(), value: round(metricValue(reading as unknown as Record<string, unknown>, metric), metric === 'aqi' ? 0 : 1) }))
  const values = readings.map((reading) => metricValue(reading as unknown as Record<string, unknown>, metric))
  return { metric, label: metricLabels[metric], unit: metricUnits[metric], hours, points, summary: { current: values.length ? round(values[values.length - 1], metric === 'aqi' ? 0 : 1) : null, average: values.length ? round(average(values), metric === 'aqi' ? 0 : 1) : null, minimum: values.length ? round(Math.min(...values), metric === 'aqi' ? 0 : 1) : null, maximum: values.length ? round(Math.max(...values), metric === 'aqi' ? 0 : 1) : null, records: readings.length } }
}

async function loadSites(hours: number, siteIds?: string[]) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  return prisma.site.findMany({ where: siteIds?.length ? { id: { in: siteIds } } : undefined, orderBy: { name: 'asc' }, include: { sensors: { include: { readings: { where: { timestamp: { gte: since } }, orderBy: { timestamp: 'desc' }, take: 120 }, alerts: { where: { status: { in: ['ACTIVE', 'ACKNOWLEDGED'] } } } } } } })
}

export async function getComparisonData(hours: number, siteIds?: string[]) {
  const sites = await loadSites(hours, siteIds)
  return sites.map((site) => {
    const readings = site.sensors.flatMap((sensor) => sensor.readings)
    const latest = site.sensors.map((sensor) => sensor.readings[0]).filter(Boolean)
    return { id: site.id, name: site.name, country: null, sensors: site.sensors.length, records: readings.length, averageAqi: latest.length ? round(average(latest.map((reading) => reading.aqi)), 0) : null, averagePm25: latest.length ? round(average(latest.map((reading) => reading.pm25))) : null, averageTemperature: latest.length ? round(average(latest.map((reading) => reading.temperature))) : null, activeAlerts: site.sensors.reduce((total, sensor) => total + sensor.alerts.length, 0), lastReading: readings[0]?.timestamp.toISOString() ?? null }
  })
}

function riskFor(readings: Array<Record<string, unknown>>, alertCount: number) {
  if (!readings.length) return { score: 0, band: 'No data', reasons: ['No simulated readings were available for this scope.'], dataAvailable: false }
  const ratios = (Object.keys(demoThresholds) as Array<keyof typeof demoThresholds>).map((metric) => average(readings.map((reading) => Number(reading[metric] ?? 0) / demoThresholds[metric].critical)))
  const highest = Math.max(...ratios, 0)
  const score = Math.min(100, Math.round(highest * 70 + Math.min(alertCount, 5) * 6))
  const band = score >= 70 ? 'High' : score >= 35 ? 'Moderate' : 'Low'
  const reasons = [`Highest aggregate threshold ratio: ${round(highest * 100, 0)}% of a demo critical threshold.`, `${alertCount} active or acknowledged demo alert${alertCount === 1 ? '' : 's'} contributed ${Math.min(alertCount, 5) * 6} points.`, 'The score is deterministic and intended only to explain this software demonstration.']
  return { score, band, reasons, dataAvailable: true }
}

export async function getRiskData(scope: 'global' | 'site' | 'sensor', siteId?: string, sensorId?: string) {
  const sensors = await prisma.sensor.findMany({ where: { ...(siteId ? { siteId } : {}), ...(sensorId ? { id: sensorId } : {}) }, include: { site: true, readings: { orderBy: { timestamp: 'desc' }, take: 1 }, alerts: { where: { status: { in: ['ACTIVE', 'ACKNOWLEDGED'] } } } } })
  const readingRows = sensors.flatMap((sensor) => sensor.readings)
  const risk = riskFor(readingRows as unknown as Array<Record<string, unknown>>, sensors.reduce((total, sensor) => total + sensor.alerts.length, 0))
  const contributors = sensors.map((sensor) => { const reading = sensor.readings[0]; const sensorRisk = riskFor(sensor.readings as unknown as Array<Record<string, unknown>>, sensor.alerts.length); return { id: sensor.id, name: sensor.name, site: sensor.site.name, band: sensorRisk.band, score: sensorRisk.score, latestAqi: reading?.aqi ?? null, activeAlerts: sensor.alerts.length } }).sort((a, b) => b.score - a.score)
  return { scope, ...risk, contributors: contributors.slice(0, 12), thresholds: demoThresholds }
}

export async function getInsightData(hours: number) {
  const [trend, comparison, risk] = await Promise.all([getTrendData({ hours, metric: 'aqi' }), getComparisonData(hours), getRiskData('global')])
  const insights: Array<{ title: string; detail: string; tone: 'info' | 'warning' | 'critical' }> = []
  if (trend.summary.current !== null && trend.summary.average !== null && trend.summary.current > trend.summary.average * 1.15) insights.push({ title: 'AQI is above its period average', detail: `The latest AQI is ${trend.summary.current}, compared with a ${trend.summary.average} average across the selected demo period.`, tone: 'warning' })
  const highest = comparison.filter((site) => site.averageAqi !== null).sort((a, b) => (b.averageAqi ?? 0) - (a.averageAqi ?? 0))[0]
  if (highest) insights.push({ title: `${highest.name} has the highest demo AQI average`, detail: `Its latest-sensor average is ${highest.averageAqi} AQI with ${highest.activeAlerts} active or acknowledged alert${highest.activeAlerts === 1 ? '' : 's'}.`, tone: highest.activeAlerts ? 'warning' : 'info' })
  if (risk.band === 'High' || risk.band === 'Moderate') insights.push({ title: 'Review the highest contributing sensors', detail: `${risk.band} deterministic demo risk is driven by threshold ratios and current alert states, not a predictive model.`, tone: risk.band === 'High' ? 'critical' : 'warning' })
  if (!insights.length) insights.push({ title: 'Demo network is stable for this period', detail: 'No rule-based pattern exceeded the configured demonstration conditions.', tone: 'info' })
  return { hours, generatedAt: new Date().toISOString(), insights, methodology: 'Rule-based observations from simulated readings, demo thresholds, and active alert records; not machine learning or official guidance.' }
}

export async function getReportData(hours: number) {
  const [trend, comparison, risk, insights, alerts] = await Promise.all([getTrendData({ hours, metric: 'aqi' }), getComparisonData(hours), getRiskData('global'), getInsightData(hours), prisma.alert.findMany({ where: { createdAt: { gte: new Date(Date.now() - hours * 60 * 60 * 1000) } }, include: { sensor: { select: { name: true } }, site: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 100 })])
  return { generatedAt: new Date().toISOString(), hours, trend, comparison, risk, insights, alerts }
}
