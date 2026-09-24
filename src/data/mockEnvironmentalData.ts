import type { AlertItem, EnvironmentPoint, GasReading, Metric } from '../types/environment'

export const metrics: Metric[] = [
  { label: 'Air quality index', value: '42', unit: 'AQI', change: '8.4% better', trend: 'down', tone: 'green' },
  { label: 'Active sensors', value: '24', unit: '/ 24', change: 'All reporting', trend: 'steady', tone: 'cyan' },
  { label: 'Temperature', value: '24.8', unit: '°C', change: '1.2° from yesterday', trend: 'up', tone: 'amber' },
  { label: 'Open alerts', value: '02', change: '1 needs review', trend: 'up', tone: 'red' },
]

export const environmentHistory: EnvironmentPoint[] = [
  { time: '06:00', aqi: 58, pm25: 32, temperature: 19, humidity: 68 },
  { time: '08:00', aqi: 52, pm25: 28, temperature: 21, humidity: 64 },
  { time: '10:00', aqi: 46, pm25: 24, temperature: 23, humidity: 58 },
  { time: '12:00', aqi: 39, pm25: 20, temperature: 25, humidity: 52 },
  { time: '14:00', aqi: 42, pm25: 22, temperature: 26, humidity: 49 },
  { time: '16:00', aqi: 38, pm25: 18, temperature: 25, humidity: 51 },
  { time: '18:00', aqi: 44, pm25: 21, temperature: 23, humidity: 58 },
  { time: '20:00', aqi: 41, pm25: 19, temperature: 21, humidity: 63 },
]

export const gasReadings: GasReading[] = [
  { name: 'Carbon monoxide', value: 18, unit: 'ppm', status: 'Normal', tone: 'green' },
  { name: 'Hydrogen sulfide', value: 4, unit: 'ppm', status: 'Watch', tone: 'amber' },
  { name: 'Volatile compounds', value: 12, unit: 'ppb', status: 'Normal', tone: 'green' },
  { name: 'Nitrogen dioxide', value: 8, unit: 'ppb', status: 'Normal', tone: 'green' },
]

export const alerts: AlertItem[] = [
  { id: 'AL-2048', title: 'H₂S concentration rising', detail: 'Zone B · Sensor GN-018', time: '12 min ago', severity: 'warning' },
  { id: 'AL-2047', title: 'Sensor maintenance due', detail: 'North stack · Sensor GN-004', time: '1 hr ago', severity: 'info' },
  { id: 'AL-2046', title: 'PM2.5 peak detected', detail: 'Zone A · Sensor GN-011', time: '3 hrs ago', severity: 'critical' },
]

export const sensorZones = [
  { name: 'North processing', sensors: 8, status: 'Stable', color: 'green' },
  { name: 'Central storage', sensors: 10, status: 'Stable', color: 'green' },
  { name: 'South loading', sensors: 6, status: 'Watch', color: 'amber' },
]
