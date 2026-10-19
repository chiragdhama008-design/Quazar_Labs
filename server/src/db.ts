import { PrismaClient } from '@prisma/client';
import { PGlite } from '@electric-sql/pglite';
import { PrismaPGlite } from 'pglite-prisma-adapter';
import path from 'path';
import fs from 'fs';

let prismaInstance: PrismaClient | null = null;

const SCHEMA_DDL = `
DO $$ BEGIN
  CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "LearningPath" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "learningObjectives" TEXT,
    "planetTheme" TEXT NOT NULL DEFAULT 'purple-gas-giant',
    "accentColor" TEXT NOT NULL DEFAULT '#8B5CF6',
    "coverImageUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Workshop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "learningPathId" TEXT NOT NULL REFERENCES "LearningPath"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "learningObjectives" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'Beginner',
    "estimatedDuration" TEXT DEFAULT '4 Weeks',
    "thumbnailUrl" TEXT,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Week" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workshopId" TEXT NOT NULL REFERENCES "Workshop"("id") ON DELETE CASCADE,
    "weekNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekId" TEXT NOT NULL REFERENCES "Week"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "youtubeUrl" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" TEXT,
    "lessonNotes" TEXT,
    "topics" TEXT,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT REFERENCES "Session"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL DEFAULT 'LINK',
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SiteSetting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "heroHeading" TEXT NOT NULL DEFAULT 'Your Next Mission Starts Here.',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Explore the universe of technology with hands-on coding workshops, live mission-critical sessions, and deep-space software engineering.',
    "aboutText" TEXT NOT NULL DEFAULT 'Quazar Labs is an immersive technology education venture crafting next-generation developers, engineers, and creators through real-world experimentation, orbital workshops, and deep-space coding challenges.',
    "contactEmail" TEXT NOT NULL DEFAULT 'missions@quazarlabs.space',
    "githubUrl" TEXT NOT NULL DEFAULT 'https://github.com/quazar-labs',
    "discordUrl" TEXT NOT NULL DEFAULT 'https://discord.gg/quazarlabs',
    "youtubeUrl" TEXT NOT NULL DEFAULT 'https://youtube.com/@quazarlabs',
    "footerText" TEXT NOT NULL DEFAULT 'Crafted for cosmos explorers. Knowledge beyond orbit.',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AdminSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "LearningPath_publicationStatus_idx" ON "LearningPath"("publicationStatus");
CREATE INDEX IF NOT EXISTS "LearningPath_displayOrder_idx" ON "LearningPath"("displayOrder");
CREATE INDEX IF NOT EXISTS "Workshop_learningPathId_idx" ON "Workshop"("learningPathId");
CREATE INDEX IF NOT EXISTS "Workshop_publicationStatus_idx" ON "Workshop"("publicationStatus");
CREATE INDEX IF NOT EXISTS "Workshop_displayOrder_idx" ON "Workshop"("displayOrder");
CREATE INDEX IF NOT EXISTS "Week_workshopId_idx" ON "Week"("workshopId");
CREATE INDEX IF NOT EXISTS "Week_displayOrder_idx" ON "Week"("displayOrder");
CREATE INDEX IF NOT EXISTS "Session_weekId_idx" ON "Session"("weekId");
CREATE INDEX IF NOT EXISTS "Session_publicationStatus_idx" ON "Session"("publicationStatus");
CREATE INDEX IF NOT EXISTS "Session_displayOrder_idx" ON "Session"("displayOrder");
CREATE INDEX IF NOT EXISTS "Resource_sessionId_idx" ON "Resource"("sessionId");
CREATE INDEX IF NOT EXISTS "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");
`;

export async function getPrismaClient(): Promise<PrismaClient> {
  if (prismaInstance) {
    return prismaInstance;
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
    console.log('[Database] Connecting to PostgreSQL database via connection string...');
    prismaInstance = new PrismaClient({
      datasourceUrl: databaseUrl,
    });
    await prismaInstance.$connect();
    console.log('[Database] Connected to external PostgreSQL successfully.');
  } else {
    console.log('[Database] Using embedded persistent PostgreSQL (PGlite)...');
    const dataDir = path.resolve(process.cwd(), 'data', 'postgres');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const pglite = new PGlite(dataDir);
    await pglite.exec(SCHEMA_DDL);
    const adapter = new PrismaPGlite(pglite);
    prismaInstance = new PrismaClient({ adapter });
    await prismaInstance.$connect();
    console.log('[Database] Connected to embedded persistent PostgreSQL successfully.');
  }

  return prismaInstance;
}

// Proxied prisma export for direct usage across modules
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!prismaInstance) {
      throw new Error('Database not initialized. Call initDb() or await getPrismaClient() before accessing prisma.');
    }
    return (prismaInstance as any)[prop];
  }
});
