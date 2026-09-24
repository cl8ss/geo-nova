import cors from '@fastify/cors'
import Fastify from 'fastify'
import { z } from 'zod'
import { demoThresholds, sensorHealthThresholds } from './config'
import { prisma } from './db'
import { registerErrorHandler } from './lib/http'
import { serializeDates } from './lib/serializers'
import { generateReadings, simulatorStatus } from './simulator'
import { getComparisonData, getInsightData, getReportData, getRiskData, getTrendData, type AnalyticsMetric } from './analytics'
import { getAlertContext, getAnomalyData, getForecastData, getInsightData as getIntelligenceInsights, getIntelligenceSummary, getSensorHealthData, type IntelligenceMetric } from './intelligence'

const idParams = z.object({ id: z.string().min(1) })
const historyQuery = z.object({ sensorId: z.string().optional(), hours: z.coerce.number().int().min(1).max(168).default(24) })
const activeAlertStatuses = { in: ['ACTIVE', 'ACKNOWLEDGED'] as ('ACTIVE' | 'ACKNOWLEDGED')[] }
const analyticsQuery = z.object({ hours: z.coerce.number().int().min(1).max(168).default(24), metric: z.enum(['aqi', 'pm25', 'temperature', 'humidity', 'pm10', 'co', 'h2s', 'voc']).default('aqi'), siteId: z.string().min(1).optional(), sensorId: z.string().min(1).optional() })
const comparisonQuery = z.object({ hours: z.coerce.number().int().min(1).max(168).default(24), siteIds: z.string().optional() })
const riskQuery = z.object({ scope: z.enum(['global', 'site', 'sensor']).default('global'), siteId: z.string().min(1).optional(), sensorId: z.string().min(1).optional() }).superRefine((query, context) => {
  if (query.scope === 'global' && (query.siteId || query.sensorId)) context.addIssue({ code: 'custom', message: 'Global risk cannot include siteId or sensorId', path: ['scope'] })
  if (query.scope === 'site' && (!query.siteId || query.sensorId)) context.addIssue({ code: 'custom', message: 'Site risk requires siteId and cannot include sensorId', path: ['siteId'] })
  if (query.scope === 'sensor' && (!query.sensorId || query.siteId)) context.addIssue({ code: 'custom', message: 'Sensor risk requires sensorId and cannot include siteId', path: ['sensorId'] })
})
const intelligenceQuery = z.object({ hours: z.coerce.number().int().min(1).max(168).default(24), countryId: z.string().min(1).optional(), siteId: z.string().min(1).optional(), sensorId: z.string().min(1).optional() })
const intelligenceMetric = z.enum(['aqi', 'pm25', 'pm10', 'co', 'h2s', 'voc'])
const forecastQuery = intelligenceQuery.extend({ metric: intelligenceMetric.default('aqi'), horizon: z.coerce.number().int().refine((value) => [1, 3, 6].includes(value), 'Horizon must be 1, 3, or 6 hours').default(1) })
const anomalyQuery = intelligenceQuery.extend({ metric: intelligenceMetric.optional() })

function liveStatus(sensor: { status: string; lastSeenAt: Date | null; readings: Array<{ timestamp: Date }>; alerts: Array<{ severity: string }> }) {
  const reading = sensor.readings[0]
  if (sensor.status !== 'ONLINE' || !sensor.lastSeenAt || Date.now() - sensor.lastSeenAt.getTime() > sensorHealthThresholds.offlineMs || !reading) return 'offline'
  if (sensor.alerts.some((alert) => alert.severity === 'CRITICAL')) return 'critical'
  if (sensor.alerts.some((alert) => alert.severity === 'WARNING')) return 'warning'
  return 'normal'
}

async function getCountrySummary(countryId: string) {
  const country = await prisma.country.findUnique({
    where: { id: countryId },
    include: {
      sites: {
        orderBy: { name: 'asc' },
        include: {
          sensors: {
            include: {
              readings: { orderBy: { timestamp: 'desc' }, take: 1, select: { timestamp: true, aqi: true, temperature: true } },
              alerts: { where: { status: activeAlertStatuses }, select: { severity: true } },
            },
          },
          alerts: { where: { status: activeAlertStatuses }, select: { id: true } },
        },
      },
    },
  })
  if (!country) return null
  const sensors = country.sites.flatMap((site) => site.sensors)
  const readings = sensors.map((sensor) => sensor.readings[0]).filter((reading): reading is NonNullable<typeof reading> => Boolean(reading))
  const statuses = sensors.map((sensor) => liveStatus(sensor))
  const average = (key: 'aqi' | 'temperature') => readings.length ? readings.reduce((total, reading) => total + reading[key], 0) / readings.length : undefined
  return {
    id: country.id,
    name: country.name,
    iso2: country.iso2,
    iso3: country.iso3,
    latitude: country.latitude,
    longitude: country.longitude,
    demo: country.demo,
    siteCount: country.sites.length,
    sites: country.sites.map((site) => ({ id: site.id, name: site.name, description: site.description, latitude: site.latitude, longitude: site.longitude, sensorCount: site.sensors.length, onlineCount: site.sensors.filter((sensor) => liveStatus(sensor) !== 'offline').length, warningCount: site.sensors.filter((sensor) => liveStatus(sensor) === 'warning').length, criticalCount: site.sensors.filter((sensor) => liveStatus(sensor) === 'critical').length, offlineCount: site.sensors.filter((sensor) => liveStatus(sensor) === 'offline').length, activeAlerts: site.alerts.length, latestAqi: site.sensors.map((sensor) => sensor.readings[0]).filter((reading): reading is NonNullable<typeof reading> => Boolean(reading)).length ? Math.round(site.sensors.map((sensor) => sensor.readings[0]).filter((reading): reading is NonNullable<typeof reading> => Boolean(reading)).reduce((total, reading) => total + reading.aqi, 0) / site.sensors.map((sensor) => sensor.readings[0]).filter((reading): reading is NonNullable<typeof reading> => Boolean(reading)).length) : undefined, latestTemperature: site.sensors.map((sensor) => sensor.readings[0]).filter((reading): reading is NonNullable<typeof reading> => Boolean(reading)).length ? Number((site.sensors.map((sensor) => sensor.readings[0]).filter((reading): reading is NonNullable<typeof reading> => Boolean(reading)).reduce((total, reading) => total + reading.temperature, 0) / site.sensors.map((sensor) => sensor.readings[0]).filter((reading): reading is NonNullable<typeof reading> => Boolean(reading)).length).toFixed(1)) : undefined, lastSync: site.sensors.map((sensor) => sensor.readings[0]?.timestamp).filter((timestamp): timestamp is Date => Boolean(timestamp)).sort((a, b) => b.getTime() - a.getTime())[0]?.toISOString() ?? null })),
    sensorCount: sensors.length,
    onlineCount: statuses.filter((status) => status !== 'offline').length,
    warningCount: statuses.filter((status) => status === 'warning').length,
    criticalCount: statuses.filter((status) => status === 'critical').length,
    offlineCount: statuses.filter((status) => status === 'offline').length,
    activeAlerts: country.sites.reduce((total, site) => total + site.alerts.length, 0),
    latestAqi: average('aqi') === undefined ? undefined : Math.round(average('aqi') as number),
    latestTemperature: average('temperature') === undefined ? undefined : Number((average('temperature') as number).toFixed(1)),
    lastSync: readings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]?.timestamp.toISOString() ?? null,
  }
}

export async function buildApp() {
  const app = Fastify({ logger: true })
  await app.register(cors, { origin: true })
  registerErrorHandler(app)

  app.get('/health', async () => ({ status: 'ok', service: 'geo-nova-api', dataType: 'simulated demo sensor data' }))

  app.get('/api/countries', async () => {
    const countries = await prisma.country.findMany({ orderBy: { name: 'asc' } })
    const summaries = await Promise.all(countries.map((country) => getCountrySummary(country.id)))
    return serializeDates(summaries.filter((summary): summary is NonNullable<typeof summary> => Boolean(summary)))
  })
  app.get('/api/countries/:id/summary', async (request, reply) => {
    const { id } = idParams.parse(request.params)
    const summary = await getCountrySummary(id)
    if (!summary) return reply.code(404).send({ error: 'Country not found' })
    return serializeDates(summary)
  })
  app.get('/api/countries/:id/sites', async (request, reply) => {
    const { id } = idParams.parse(request.params)
    const summary = await getCountrySummary(id)
    if (!summary) return reply.code(404).send({ error: 'Country not found' })
    return serializeDates(summary.sites)
  })

  app.get('/api/sites', async () => serializeDates(await prisma.site.findMany({ include: { country: true, _count: { select: { sensors: true, alerts: true } }, sensors: { select: { status: true } } }, orderBy: { name: 'asc' } })))
  app.get('/api/sites/:id', async (request, reply) => {
    const { id } = idParams.parse(request.params)
    const site = await prisma.site.findUnique({ where: { id }, include: { sensors: true, alerts: { where: { status: { in: ['ACTIVE', 'ACKNOWLEDGED'] } }, orderBy: { createdAt: 'desc' } } } })
    if (!site) return reply.code(404).send({ error: 'Site not found' })
    return serializeDates(site)
  })

  app.get('/api/sensors', async () => serializeDates(await prisma.sensor.findMany({ include: { site: { select: { id: true, name: true } } }, orderBy: { name: 'asc' } })))
  app.get('/api/sensors/:id', async (request, reply) => {
    const { id } = idParams.parse(request.params)
    const sensor = await prisma.sensor.findUnique({ where: { id }, include: { site: true, readings: { orderBy: { timestamp: 'desc' }, take: 24 }, alerts: { orderBy: { createdAt: 'desc' }, take: 10 } } })
    if (!sensor) return reply.code(404).send({ error: 'Sensor not found' })
    return serializeDates(sensor)
  })

  app.get('/api/readings/latest', async () => {
    const readings = await prisma.reading.findMany({ orderBy: { timestamp: 'desc' }, take: 200, include: { sensor: { select: { name: true, location: true } }, site: { select: { name: true } } } })
    const latest = [...new Map(readings.map((reading) => [reading.sensorId, reading])).values()]
    return serializeDates(latest)
  })
  app.get('/api/readings/history', async (request) => {
    const query = historyQuery.parse(request.query)
    const readings = (await prisma.reading.findMany({ where: { ...(query.sensorId ? { sensorId: query.sensorId } : {}), timestamp: { gte: new Date(Date.now() - query.hours * 60 * 60 * 1000) } }, orderBy: { timestamp: 'desc' }, take: 1000 })).reverse()
    return serializeDates(readings)
  })

  app.get('/api/analytics/trends', async (request) => {
    const query = analyticsQuery.parse(request.query)
    return serializeDates(await getTrendData({ hours: query.hours, metric: query.metric as AnalyticsMetric, siteId: query.siteId, sensorId: query.sensorId }))
  })
  app.get('/api/analytics/comparison', async (request) => {
    const query = comparisonQuery.parse(request.query)
    return serializeDates(await getComparisonData(query.hours, query.siteIds?.split(',').filter(Boolean)))
  })
  app.get('/api/analytics/risk', async (request) => {
    const query = riskQuery.parse(request.query)
    return serializeDates(await getRiskData(query.scope, query.siteId, query.sensorId))
  })
  app.get('/api/analytics/insights', async (request) => {
    const query = z.object({ hours: z.coerce.number().int().min(1).max(168).default(24) }).parse(request.query)
    return serializeDates(await getInsightData(query.hours))
  })
  app.get('/api/reports/summary', async (request) => {
    const query = z.object({ hours: z.coerce.number().int().min(1).max(168).default(24) }).parse(request.query)
    return serializeDates(await getReportData(query.hours))
  })

  app.get('/api/intelligence/summary', async () => serializeDates(await getIntelligenceSummary()))
  app.get('/api/intelligence/forecast', async (request) => {
    const query = forecastQuery.parse(request.query)
    return serializeDates(await getForecastData({ ...query, metric: query.metric as IntelligenceMetric }))
  })
  app.get('/api/intelligence/anomalies', async (request) => {
    const query = anomalyQuery.parse(request.query)
    return serializeDates(await getAnomalyData({ ...query, metric: query.metric as IntelligenceMetric | undefined }))
  })
  app.get('/api/intelligence/sensor-health', async (request) => {
    const query = intelligenceQuery.parse(request.query)
    return serializeDates(await getSensorHealthData(query))
  })
  app.get('/api/intelligence/insights', async (request) => {
    const query = intelligenceQuery.parse(request.query)
    return serializeDates(await getIntelligenceInsights(query))
  })
  app.get('/api/intelligence/alert-context/:id', async (request, reply) => {
    const { id } = idParams.parse(request.params)
    const context = await getAlertContext(id)
    if (!context) return reply.code(404).send({ error: 'Alert not found' })
    return serializeDates(context)
  })

  app.get('/api/alerts', async (request) => {
    const query = z.object({ status: z.enum(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED']).optional() }).parse(request.query)
    return serializeDates(await prisma.alert.findMany({ where: query.status ? { status: query.status } : undefined, include: { sensor: { select: { name: true, location: true } }, site: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }))
  })
  app.post('/api/alerts/:id/acknowledge', async (request, reply) => {
    const { id } = idParams.parse(request.params)
    const alert = await prisma.alert.findUnique({ where: { id } })
    if (!alert) return reply.code(404).send({ error: 'Alert not found' })
    if (alert.status !== 'ACTIVE') return reply.code(409).send({ error: 'Only active alerts can be acknowledged' })
    const updated = await prisma.alert.update({ where: { id }, data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() }, include: { sensor: { select: { name: true, location: true } } } })
    return serializeDates(updated)
  })

  app.get('/api/simulator/status', async () => simulatorStatus())
  app.post('/api/simulator/demo-alert', async () => {
    const result = await generateReadings(true)
    return { ...result, message: 'A simulated anomaly was generated for local demonstration.', thresholds: demoThresholds }
  })

  app.get('/api/dashboard/summary', async () => {
    const [sites, sensors, alerts, latest, history, countries] = await Promise.all([
      prisma.site.findMany({ include: { country: true }, orderBy: { name: 'asc' } }),
      prisma.sensor.findMany({ include: { site: { select: { id: true, name: true, latitude: true, longitude: true, country: true } } }, orderBy: { name: 'asc' } }),
      prisma.alert.findMany({ where: { status: { in: ['ACTIVE', 'ACKNOWLEDGED'] } }, include: { sensor: { select: { name: true, location: true } }, site: { select: { id: true, name: true, country: true } } }, orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.reading.findMany({ orderBy: { timestamp: 'desc' }, take: 200, include: { sensor: { select: { name: true, location: true } }, site: { select: { name: true } } } }),
      prisma.reading.findMany({ where: { timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, orderBy: { timestamp: 'desc' }, take: 500 }),
      prisma.country.findMany({ orderBy: { name: 'asc' } }),
    ])
    const latestBySensor = [...new Map(latest.map((reading) => [reading.sensorId, reading])).values()]
    const average = (key: 'aqi' | 'temperature' | 'humidity' | 'pm25') => latestBySensor.length ? latestBySensor.reduce((sum, value) => sum + value[key], 0) / latestBySensor.length : 0
    const activeCount = sensors.filter((sensor) => sensor.status === 'ONLINE').length
    const mapPoint = (reading: typeof history[number]) => ({ time: reading.timestamp.toISOString(), aqi: reading.aqi, pm25: reading.pm25, temperature: reading.temperature, humidity: reading.humidity })
    return serializeDates({ dataType: 'simulated demo sensor data', demoThresholds, countries, sites, sensors, alerts, latestReadings: latestBySensor, history: history.slice().reverse().filter((_, index) => index % Math.max(1, Math.floor(history.length / 40)) === 0).map(mapPoint), metrics: { aqi: Math.round(average('aqi')), temperature: Number(average('temperature').toFixed(1)), humidity: Math.round(average('humidity')), pm25: Number(average('pm25').toFixed(1)), activeSensors: activeCount, totalSensors: sensors.length, openAlerts: alerts.length } })
  })

  return app
}
