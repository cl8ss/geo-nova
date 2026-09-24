import { PrismaClient, SensorStatus, SensorType } from '@prisma/client'

const prisma = new PrismaClient()

const countries = [
  { id: 'country-om', name: 'Oman', iso2: 'OM', iso3: 'OMN', latitude: 21.4735, longitude: 55.9754 },
  { id: 'country-sa', name: 'Saudi Arabia', iso2: 'SA', iso3: 'SAU', latitude: 23.8859, longitude: 45.0792 },
  { id: 'country-ae', name: 'United Arab Emirates', iso2: 'AE', iso3: 'ARE', latitude: 23.4241, longitude: 53.8478 },
  { id: 'country-qa', name: 'Qatar', iso2: 'QA', iso3: 'QAT', latitude: 25.3548, longitude: 51.1839 },
  { id: 'country-kw', name: 'Kuwait', iso2: 'KW', iso3: 'KWT', latitude: 29.3117, longitude: 47.4818 },
  { id: 'country-bh', name: 'Bahrain', iso2: 'BH', iso3: 'BHR', latitude: 26.0667, longitude: 50.5577 },
  { id: 'country-us', name: 'United States', iso2: 'US', iso3: 'USA', latitude: 37.0902, longitude: -95.7129 },
  { id: 'country-gb', name: 'United Kingdom', iso2: 'GB', iso3: 'GBR', latitude: 55.3781, longitude: -3.4360 },
  { id: 'country-de', name: 'Germany', iso2: 'DE', iso3: 'DEU', latitude: 51.1657, longitude: 10.4515 },
  { id: 'country-jp', name: 'Japan', iso2: 'JP', iso3: 'JPN', latitude: 36.2048, longitude: 138.2529 },
]

const sites = [
  { id: 'site-north', name: 'North Processing Zone', description: 'Demo processing and utilities area', latitude: 31.98, longitude: 35.91, countryId: 'country-om' },
  { id: 'site-central', name: 'Central Storage Zone', description: 'Demo storage and transfer area', latitude: 31.975, longitude: 35.925, countryId: 'country-om' },
  { id: 'site-south', name: 'South Loading Zone', description: 'Demo loading and dispatch area', latitude: 31.965, longitude: 35.918, countryId: 'country-om' },
]

const sensorDefinitions = [
  ['sensor-001', 'North air station', 'North gate', SensorType.AIR_QUALITY, 'site-north'],
  ['sensor-002', 'North gas monitor', 'Process line 1', SensorType.MULTI_GAS, 'site-north'],
  ['sensor-003', 'North climate node', 'Cooling tower', SensorType.TEMPERATURE, 'site-north'],
  ['sensor-004', 'Central air station', 'Storage aisle A', SensorType.AIR_QUALITY, 'site-central'],
  ['sensor-005', 'Central gas monitor', 'Tank farm east', SensorType.MULTI_GAS, 'site-central'],
  ['sensor-006', 'Central climate node', 'Control building', SensorType.HUMIDITY, 'site-central'],
  ['sensor-007', 'South air station', 'Loading bay 2', SensorType.AIR_QUALITY, 'site-south'],
  ['sensor-008', 'South gas monitor', 'Dispatch road', SensorType.MULTI_GAS, 'site-south'],
] as const

function readingValues(index: number) {
  return { temperature: 22 + (index % 3), humidity: 48 + (index % 5), pm25: 12 + (index % 7), pm10: 24 + (index % 9), aqi: 34 + (index % 12), co: 8 + (index % 6), h2s: 2 + (index % 3), voc: 110 + (index % 30) }
}

async function main() {
  for (const country of countries) await prisma.country.upsert({ where: { id: country.id }, update: country, create: { ...country, demo: true } })
  for (const site of sites) await prisma.site.upsert({ where: { id: site.id }, update: site, create: { ...site, isDemo: true } })

  for (let index = 0; index < sensorDefinitions.length; index += 1) {
    const [id, name, location, type, siteId] = sensorDefinitions[index]
    const timestamp = new Date(Date.now() - 5 * 60 * 1000)
    await prisma.sensor.upsert({ where: { id }, update: { name, location, type, siteId, status: SensorStatus.ONLINE, batteryLevel: 92 - index * 2, lastSeenAt: timestamp }, create: { id, name, location, type, siteId, status: SensorStatus.ONLINE, batteryLevel: 92 - index * 2, lastSeenAt: timestamp } })
    const existing = await prisma.reading.findFirst({ where: { sensorId: id }, orderBy: { timestamp: 'desc' } })
    if (!existing) await prisma.reading.create({ data: { ...readingValues(index), timestamp, isDemo: true, siteId, sensorId: id } })
  }

  console.log(`Ensured ${countries.length} demo countries, ${sites.length} demo sites, and ${sensorDefinitions.length} demo sensors.`)
}

main().catch((error) => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())
