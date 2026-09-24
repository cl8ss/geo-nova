import type { ApiAlert, ApiReading, DashboardCountry, DashboardSite } from '../../services/api'

export type LiveStatus = 'normal' | 'warning' | 'critical' | 'offline'
export type MonitoringScope = 'global' | 'country' | 'site' | 'sensor'

export type LiveSensor = {
  id: string
  name: string
  location: string
  type: string
  status: string
  batteryLevel: number
  lastSeenAt: string | null
  site: DashboardSite
  liveStatus: LiveStatus
  reading?: ApiReading
  alerts: ApiAlert[]
}

export type SiteStats = DashboardSite & {
  sensorCount: number
  onlineCount: number
  warningCount: number
  criticalCount: number
  offlineCount: number
  latestAqi?: number
  latestTemperature?: number
  activeAlerts: number
  lastSync: string | null
}

export type CountryStats = DashboardCountry & {
  siteCount: number
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

