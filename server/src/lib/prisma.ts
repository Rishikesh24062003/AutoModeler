import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * 
 * This ensures we don't create multiple instances of PrismaClient,
 * which could exhaust database connections.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
