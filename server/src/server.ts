import { buildApp } from './app'
import { config } from './config'
import { prisma } from './db'
import { startSimulator, stopSimulator } from './simulator'

const app = await buildApp()

try {
  await app.listen({ host: '127.0.0.1', port: config.port })
  startSimulator()
  app.log.info(`Geo Nova API listening on http://127.0.0.1:${config.port}`)
} catch (error) {
  app.log.error(error)
  await prisma.$disconnect()
  process.exit(1)
}

async function shutdown() {
  stopSimulator()
  await app.close()
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
