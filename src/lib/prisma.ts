import { PrismaClient } from '@prisma/client'
import { copyFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { isDemo } from './demo'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// The demo deployment has a read-only filesystem except /tmp, so the database
// seeded at build time is copied there on first use.
function demoDatabaseUrl() {
  const target = '/tmp/boardly-demo.db'
  if (!existsSync(target)) {
    copyFileSync(path.join(process.cwd(), 'prisma', 'demo.db'), target)
  }
  return `file:${target}`
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(isDemo ? { datasources: { db: { url: demoDatabaseUrl() } } } : undefined)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
