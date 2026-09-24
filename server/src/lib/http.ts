import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: unknown, request, reply) => {
    request.log.error(error)
    const candidate = error as { statusCode?: number; message?: string }
    const statusCode = error instanceof ZodError ? 400 : candidate.statusCode && candidate.statusCode >= 400 ? candidate.statusCode : 500
    reply.status(statusCode).send({ error: statusCode === 400 ? 'Invalid request' : statusCode === 500 ? 'Internal server error' : candidate.message ?? 'Request failed' })
  })
}
