import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // If a hosted PostgreSQL / Supabase connection string is provided, use it directly
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  // Detect Vercel serverless environment or AWS Lambda
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const tmpDbPath = '/tmp/dev.db';
    const bundledDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    // Copy bundled seed database to /tmp so serverless functions can read & write
    try {
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
      }
    } catch (err) {
      console.warn('Notice: Could not copy seed database to /tmp:', err);
    }

    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  // Local development: resolve absolute path to prisma/dev.db
  const localDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  return `file:${localDbPath}`;
}

const activeDbUrl = resolveDatabaseUrl();
process.env.DATABASE_URL = activeDbUrl;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: activeDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
