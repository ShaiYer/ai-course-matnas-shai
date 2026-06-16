import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../index';
import { resetDb, createTestUser, createTestEvent, getAuthHeader, prisma } from '../../test/helpers';

beforeEach(resetDb);

describe('POST /api/registrations', () => {
  it('registers a user for an event', async () => {
    const user = await createTestUser();
    const admin = await createTestUser(true);
    const event = await createTestEvent(admin.id);

    const res = await request(app)
      .post('/api/registrations')
      .set(getAuthHeader(user.id))
      .send({ eventId: event.id });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBe(user.id);
    expect(res.body.eventId).toBe(event.id);
  });

  it('returns 400 when eventId is missing', async () => {
    const user = await createTestUser();

    const res = await request(app)
      .post('/api/registrations')
      .set(getAuthHeader(user.id))
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown event', async () => {
    const user = await createTestUser();

    const res = await request(app)
      .post('/api/registrations')
      .set(getAuthHeader(user.id))
      .send({ eventId: 99999 });

    expect(res.status).toBe(404);
  });

  it('returns 409 when event is full', async () => {
    const admin = await createTestUser(true);
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const event = await prisma.event.create({
      data: { title: 'Full', description: 'd', date: new Date('2027-01-01'), capacity: 1 },
    });

    await prisma.registration.create({ data: { userId: user1.id, eventId: event.id } });

    const res = await request(app)
      .post('/api/registrations')
      .set(getAuthHeader(user2.id))
      .send({ eventId: event.id });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/full/i);
  });

  it('returns 401 without auth header', async () => {
    const admin = await createTestUser(true);
    const event = await createTestEvent(admin.id);

    const res = await request(app)
      .post('/api/registrations')
      .send({ eventId: event.id });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/registrations/:eventId', () => {
  it('cancels a registration', async () => {
    const user = await createTestUser();
    const admin = await createTestUser(true);
    const event = await createTestEvent(admin.id);
    await prisma.registration.create({ data: { userId: user.id, eventId: event.id } });

    const res = await request(app)
      .delete(`/api/registrations/${event.id}`)
      .set(getAuthHeader(user.id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const reg = await prisma.registration.findFirst({ where: { userId: user.id, eventId: event.id } });
    expect(reg).toBeNull();
  });

  it('is a no-op when no registration exists', async () => {
    const user = await createTestUser();
    const admin = await createTestUser(true);
    const event = await createTestEvent(admin.id);

    const res = await request(app)
      .delete(`/api/registrations/${event.id}`)
      .set(getAuthHeader(user.id));

    expect(res.status).toBe(200);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/registrations/1');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/registrations/my', () => {
  it('returns empty array when user has no registrations', async () => {
    const user = await createTestUser();

    const res = await request(app)
      .get('/api/registrations/my')
      .set(getAuthHeader(user.id));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns only the current user's registrations with nested event", async () => {
    const user = await createTestUser();
    const other = await createTestUser();
    const admin = await createTestUser(true);
    const event = await createTestEvent(admin.id);
    await prisma.registration.create({ data: { userId: user.id, eventId: event.id } });
    await prisma.registration.create({ data: { userId: other.id, eventId: event.id } });

    const res = await request(app)
      .get('/api/registrations/my')
      .set(getAuthHeader(user.id));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].userId).toBe(user.id);
    expect(res.body[0].event).toBeDefined();
    expect(res.body[0].event.title).toBe('Test Event');
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/registrations/my');
    expect(res.status).toBe(401);
  });
});
