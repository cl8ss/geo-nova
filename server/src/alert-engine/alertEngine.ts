import { AlertSeverity, AlertStatus } from '@prisma/client'
import { demoThresholds, type ThresholdMetric } from '../config'
import { prisma } from '../db'

const labels: Record<ThresholdMetric, string> = { aqi: 'AQI', pm25: 'PM2.5', pm10: 'PM10', co: 'Carbon monoxide', h2s: 'Hydrogen sulfide', voc: 'Volatile compounds' }

function severityFor(metric: ThresholdMetric, value: number): AlertSeverity | null {
  const threshold = demoThresholds[metric]
  if (value >= threshold.critical) return AlertSeverity.CRITICAL
  if (value >= threshold.warning) return AlertSeverity.WARNING
  return null
}

export async function evaluateReading(reading: { id: string; siteId: string; sensorId: string; aqi: number; pm25: number; pm10: number; co: number; h2s: number; voc: number }) {
  const candidates = Object.entries({ aqi: reading.aqi, pm25: reading.pm25, pm10: reading.pm10, co: reading.co, h2s: reading.h2s, voc: reading.voc }) as Array<[ThresholdMetric, number]>
  const created = []
  for (const [metric, value] of candidates) {
    const severity = severityFor(metric, value)
    if (!severity) continue
    const openAlert = await prisma.alert.findFirst({ where: { sensorId: reading.sensorId, metric, status: { in: [AlertStatus.ACTIVE, AlertStatus.ACKNOWLEDGED] } } })
    if (openAlert) continue
    const threshold = demoThresholds[metric][severity === AlertSeverity.CRITICAL ? 'critical' : 'warning']
    const alert = await prisma.alert.create({ data: { siteId: reading.siteId, sensorId: reading.sensorId, metric, title: `${labels[metric]} threshold crossed`, description: `Demo reading exceeded the configured ${severity.toLowerCase()} threshold. This is simulated data, not an official safety limit.`, severity, value, threshold, isDemo: true } })
    created.push(alert)
  }
  return created
}
