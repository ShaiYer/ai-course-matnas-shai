import { PrismaClient } from '@prisma/client';
import { afterAll } from 'vitest';

let counter = 0;

export const prisma = new PrismaClient();

afterAll(async () => {
  await prisma.$disconnect();
});

export async function resetDb() {
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
}

export async function createTestUser(isAdmin = false) {
  return prisma.user.create({
    data: {
      name: isAdmin ? 'Test Admin' : 'Test User',
      email: isAdmin ? `admin-${Date.now()}-${++counter}@test.com` : `user-${Date.now()}-${++counter}@test.com`,
      password: 'testpass',
      isAdmin,
      role: isAdmin ? 'admin' : 'user',
    },
  });
}

export async function createTestEvent(adminId: number) {
  return prisma.event.create({
    data: {
      title: 'Test Event',
      description: 'A test event',
      date: new Date('2027-01-01T10:00:00Z'),
      capacity: 5,
    },
  });
}

export function getAuthHeader(userId: number) {
  return { 'X-User-Id': String(userId) };
}
