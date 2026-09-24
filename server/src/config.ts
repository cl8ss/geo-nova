import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT ?? process.env.API_PORT ?? 3001),
  simulatorIntervalMs: Number(process.env.SIMULATOR_INTERVAL_MS ?? 10000),
}

export const demoThresholds = {
  aqi: { warning: 80, critical: 150 },
  pm25: { warning: 35, critical: 55 },
  pm10: { warning: 80, critical: 150 },
  co: { warning: 35, critical: 70 },
  h2s: { warning: 8, critical: 18 },
  voc: { warning: 400, critical: 800 },
} as const

export type ThresholdMetric = keyof typeof demoThresholds
export const sensorHealthThresholds = { delayedMs: 15000, offlineMs: 30000 } as const
