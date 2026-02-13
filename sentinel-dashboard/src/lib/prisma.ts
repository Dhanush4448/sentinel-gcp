import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Only initialize Prisma if DATABASE_URL is available and valid
const hasDatabase = process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '';

let prismaInstance: PrismaClient | null = null;

if (hasDatabase) {
  try {
    const connectionString = process.env.DATABASE_URL!;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    const prismaClientSingleton = () => {
      return new PrismaClient({ adapter });
    };

    const globalForPrisma = global as unknown as { prisma: ReturnType<typeof prismaClientSingleton> };

    prismaInstance = globalForPrisma.prisma || prismaClientSingleton();

    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance;
  } catch (error) {
    console.warn('Failed to initialize Prisma with database adapter:', error);
    prismaInstance = null;
  }
} else {
  // Silent mode - don't show warning in production, only in development
  if (process.env.NODE_ENV === 'development') {
    console.info('ℹ️  DATABASE_URL not set - using JWT sessions (database features unavailable)');
  }
}

// Export prisma with safe access
export const prisma = prismaInstance as PrismaClient;
