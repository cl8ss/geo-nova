import { SensorStatus } from '@prisma/client'
import { config } from '../config'
import { prisma } from '../db'
import { evaluateReading } from '../alert-engine/alertEngine'

let timer: NodeJS.Timeout | undefined
let lastRunAt: Date | null = null
let lastGeneratedCount = 0

function bounded(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)) }
function readingFor(index: number, forceAlert = false) {
  const anomaly = forceAlert || Math.random() < 0.035
  const temperature = bounded(22 + Math.sin(Date.now() / 360000) * 3 + (Math.random() - .5) * 2, 15, 36)
  const humidity = bounded(52 + (Math.random() - .5) * 10, 25, 80)
  const pm25 = anomaly ? 62 + Math.random() * 15 : 14 + Math.random() * 16
  const pm10 = anomaly ? 118 + Math.random() * 32 : 26 + Math.random() * 32
  const aqi = anomaly ? 158 + Math.random() * 35 : 32 + Math.random() * 30
  const co = anomaly ? 76 + Math.random() * 16 : 8 + Math.random() * 17
  const h2s = anomaly ? 20 + Math.random() * 6 : 1 + Math.random() * 5
  const voc = anomaly ? 830 + Math.random() * 80 : 100 + Math.random() * 170
  return { temperature, humidity, pm25, pm10, aqi: Math.round(aqi), co, h2s, voc }
}

export async function generateReadings(forceAlert = false) {
  const sensors = await prisma.sensor.findMany({ where: { status: SensorStatus.ONLINE } })
  let generated = 0
  for (let index = 0; index < sensors.length; index += 1) {
    const sensor = sensors[index]
    const values = readingFor(index, forceAlert && index === 0)
    const timestamp = new Date()
    const reading = await prisma.reading.create({ data: { siteId: sensor.siteId, sensorId: sensor.id, ...values, isDemo: true } })
    await prisma.sensor.update({ where: { id: sensor.id }, data: { lastSeenAt: timestamp, batteryLevel: bounded(sensor.batteryLevel - (Math.random() < .1 ? 1 : 0), 10, 100) } })
    await evaluateReading(reading)
    generated += 1
  }
  lastRunAt = new Date()
  lastGeneratedCount = generated
  return { generated, lastRunAt }
}

export function startSimulator() {
  if (timer) return
  void generateReadings()
  timer = setInterval(() => { void generateReadings() }, config.simulatorIntervalMs)
}

export function stopSimulator() {
  if (timer) clearInterval(timer)
  timer = undefined
}

export function simulatorStatus() { return { running: Boolean(timer), intervalMs: config.simulatorIntervalMs, lastRunAt, lastGeneratedCount, dataType: 'simulated demo sensor data' } }
