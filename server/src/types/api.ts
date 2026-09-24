import type { AlertSeverity, AlertStatus, SensorStatus, SensorType } from '@prisma/client'

export type ApiSensor = {
  id: string
  siteId: string
  name: string
  location: string
  type: SensorType
  status: SensorStatus
  batteryLevel: number
  lastSeenAt: string | null
  site?: { id: string; name: string }
}

export type ApiAlert = {
  id: string
  siteId: string
  sensorId: string
  metric: string
  title: string
  description: string
  severity: AlertSeverity
  status: AlertStatus
  value: number
  threshold: number
  createdAt: string
  sensor?: { name: string; location: string }
  site?: { name: string }
}
