import { getPrismaClient } from '../server/src/db.js';
import { seedDatabase } from '../server/src/seed.js';

async function seed() {
  console.log('[Seed] Initializing database...');
  const prisma = await getPrismaClient();

  console.log('[Seed] Clearing existing demo data...');
  await prisma.resource.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.week.deleteMany({});
  await prisma.workshop.deleteMany({});
  await prisma.learningPath.deleteMany({});
  await prisma.siteSetting.deleteMany({});

  console.log('[Seed] Creating default site settings and curriculum...');
  await seedDatabase(prisma);

  console.log('[Seed] Database seeded successfully!');
}

seed().catch(err => {
  console.error('[Seed] Error seeding database:', err);
  process.exit(1);
});
