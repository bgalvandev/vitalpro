import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

export function createPrismaClientFromEnvironment(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}
