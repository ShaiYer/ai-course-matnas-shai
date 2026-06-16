import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@local.dev' },
    update: { role: 'admin', isAdmin: true },
    create: { name: 'Admin', email: 'admin@local.dev', password: 'admin', isAdmin: true, role: 'admin' },
  });

  await prisma.user.upsert({
    where: { email: 'manager@local.dev' },
    update: { role: 'manager' },
    create: { name: 'Manager', email: 'manager@local.dev', password: 'manager', isAdmin: false, role: 'manager' },
  });

  await prisma.user.upsert({
    where: { email: 'user@local.dev' },
    update: { role: 'user' },
    create: { name: 'User', email: 'user@local.dev', password: 'user', isAdmin: false, role: 'user' },
  });

  await prisma.event.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'Community Meetup',
      description: 'Monthly community gathering open to all members.',
      date: new Date('2028-03-15T10:00:00Z'),
      capacity: 50,
    },
  });

  await prisma.event.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      title: 'Yoga for Beginners',
      description: 'A gentle introduction to yoga for all fitness levels.',
      date: new Date('2028-04-01T09:00:00Z'),
      capacity: 20,
    },
  });

  console.log('Seed complete:');
  console.log('  admin@local.dev   / admin   (role: admin)');
  console.log('  manager@local.dev / manager (role: manager)');
  console.log('  user@local.dev    / user    (role: user)');
  console.log('  2 sample events created');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
