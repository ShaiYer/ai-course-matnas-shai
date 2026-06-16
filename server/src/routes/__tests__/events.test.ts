import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../index';
import { resetDb, createTestUser, createTestEvent, getAuthHeader, prisma } from '../../test/helpers';

beforeEach(resetDb);

describe('GET /api/events', () => {
  it('returns empty array when no events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns events with _count.registrations', async () => {
    const admin = await createTestUser(true);
    await createTestEvent(admin.id);

    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]._count.registrations).toBe(0);
  });

  it('returns events sorted by date ascending', async () => {
    const admin = await createTestUser(true);
    await prisma.event.create({ data: { title: 'Later', description: 'd', date: new Date('2027-06-01'), capacity: 5 } });
    await prisma.event.create({ data: { title: 'Earlier', description: 'd', date: new Date('2027-01-01'), capacity: 5 } });

    const res = await request(app).get('/api/events');
    expect(res.body[0].title).toBe('Earlier');
    expect(res.body[1].title).toBe('Later');
  });
});

describe('GET /api/events/:id', () => {
  it('returns event by id', async () => {
    const admin = await createTestUser(true);
    const event = await createTestEvent(admin.id);

    const res = await request(app).get(`/api/events/${event.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(event.id);
  });

  it('returns 404 for unknown event', async () => {
    const res = await request(app).get('/api/events/99999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/events', () => {
  it('admin can create an event', async () => {
    const admin = await createTestUser(true);

    const res = await request(app)
      .post('/api/events')
      .set(getAuthHeader(admin.id))
      .send({ title: 'New Event', description: 'Desc', date: '2027-03-01T10:00:00Z', capacity: 10 });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New Event');
    expect(res.body.capacity).toBe(10);
  });

  it('returns 403 for non-admin', async () => {
    const user = await createTestUser(false);

    const res = await request(app)
      .post('/api/events')
      .set(getAuthHeader(user.id))
      .send({ title: 'New Event', description: 'Desc', date: '2027-03-01T10:00:00Z', capacity: 10 });

    expect(res.status).toBe(403);
  });

  it('returns 401 without auth header', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ title: 'New Event', description: 'Desc', date: '2027-03-01T10:00:00Z', capacity: 10 });

    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const admin = await createTestUser(true);

    const res = await request(app)
      .post('/api/events')
      .set(getAuthHeader(admin.id))
      .send({ title: 'Only Title' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/events/:id', () => {
  it('admin can update an event field', async () => {
    const admin = await createTestUser(true);
    const event = await createTestEvent(admin.id);

    const res = await request(app)
      .put(`/api/events/${event.id}`)
      .set(getAuthHeader(admin.id))
      .send({ capacity: 99 });

    expect(res.status).toBe(200);
    expect(res.body.capacity).toBe(99);
  });

  it('returns 403 for non-admin', async () => {
    const admin = await createTestUser(true);
    const user = await createTestUser(false);
    const event = await createTestEvent(admin.id);

    const res = await request(app)
      .put(`/api/events/${event.id}`)
      .set(getAuthHeader(user.id))
      .send({ capacity: 99 });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/events/:id', () => {
  it('admin can delete an event', async () => {
    const admin = await createTestUser(true);
    const event = await createTestEvent(admin.id);

    const res = await request(app)
      .delete(`/api/events/${event.id}`)
      .set(getAuthHeader(admin.id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const found = await prisma.event.findUnique({ where: { id: event.id } });
    expect(found).toBeNull();
  });

  it('cascades and deletes registrations', async () => {
    const admin = await createTestUser(true);
    const user = await createTestUser(false);
    const event = await createTestEvent(admin.id);
    await prisma.registration.create({ data: { userId: user.id, eventId: event.id } });

    await request(app)
      .delete(`/api/events/${event.id}`)
      .set(getAuthHeader(admin.id));

    const regs = await prisma.registration.findMany({ where: { eventId: event.id } });
    expect(regs).toHaveLength(0);
  });

  it('returns 403 for non-admin', async () => {
    const admin = await createTestUser(true);
    const user = await createTestUser(false);
    const event = await createTestEvent(admin.id);

    const res = await request(app)
      .delete(`/api/events/${event.id}`)
      .set(getAuthHeader(user.id));

    expect(res.status).toBe(403);
  });
});
