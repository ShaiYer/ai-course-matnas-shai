import request from 'supertest';
import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../../index';
import { resetDb, createTestUser, prisma } from '../../test/helpers';

beforeEach(resetDb);

describe('POST /api/users/register', () => {
  it('creates a user and returns safe fields', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'pass' });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('alice@test.com');
    expect(res.body.password).toBeUndefined();
    expect(res.body.isAdmin).toBe(false);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ email: 'alice@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 409 on duplicate email', async () => {
    await createTestUser();
    const user = await prisma.user.findFirst();

    const res = await request(app)
      .post('/api/users/register')
      .send({ name: 'Bob', email: user!.email, password: 'pass' });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/users/login', () => {
  it('returns user on valid credentials', async () => {
    await request(app)
      .post('/api/users/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'pass123' });

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'alice@test.com', password: 'pass123' });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('alice@test.com');
    expect(res.body.password).toBeUndefined();
  });

  it('returns 401 on wrong password', async () => {
    await request(app)
      .post('/api/users/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'correct' });

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'alice@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'nobody@test.com', password: 'pass' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/me', () => {
  it('returns current user without password', async () => {
    const user = await createTestUser();

    const res = await request(app)
      .get('/api/users/me')
      .set('X-User-Id', String(user.id));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(user.id);
    expect(res.body.password).toBeUndefined();
  });

  it('returns 401 when header is missing', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 for unknown user id', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('X-User-Id', '99999');

    expect(res.status).toBe(401);
  });
});
