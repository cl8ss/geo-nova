export type Theme = 'light' | 'dark'
export type Severity = 'info' | 'warning' | 'critical'

export interface Metric {
  label: string
  value: string
  unit?: string
  change: string
  trend: 'up' | 'down' | 'steady'
  tone: 'cyan' | 'green' | 'amber' | 'red'
}

export interface EnvironmentPoint {
  time: string
  aqi: number
  pm25: number
  temperature: number
  humidity: number
}

export interface AlertItem {
  id: string
  title: string
  detail: string
  time: string
  severity: Severity
}

export interface GasReading {
  name: string
  value: number
  unit: string
  status: 'Normal' | 'Watch' | 'Elevated'
  tone: 'green' | 'amber' | 'red'
}
