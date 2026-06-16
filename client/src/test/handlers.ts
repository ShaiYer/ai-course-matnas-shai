import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3001';

export const mockUser = { id: 1, name: 'Test User', email: 'user@test.com', isAdmin: false, role: 'user' as const };
export const mockAdmin = { id: 2, name: 'Test Admin', email: 'admin@test.com', isAdmin: true, role: 'admin' as const };
export const mockManager = { id: 3, name: 'Test Manager', email: 'manager@test.com', isAdmin: false, role: 'manager' as const };
export const mockEvent = {
  id: 1,
  title: 'Test Event',
  description: 'A test event',
  date: '2027-01-01T10:00:00.000Z',
  capacity: 10,
  createdAt: '2026-01-01T00:00:00.000Z',
  _count: { registrations: 2 },
};
export const mockRegistration = {
  id: 1,
  userId: 1,
  eventId: 1,
  registeredAt: '2026-01-01T00:00:00.000Z',
  event: mockEvent,
};

export const handlers = [
  http.post(`${BASE}/api/users/login`, () => HttpResponse.json(mockUser)),
  http.post(`${BASE}/api/users/register`, () => HttpResponse.json(mockUser, { status: 201 })),
  http.get(`${BASE}/api/users/me`, () => HttpResponse.json(mockUser)),
  http.get(`${BASE}/api/users`, () => HttpResponse.json([mockUser, mockAdmin, mockManager])),
  http.put(`${BASE}/api/users/:id/role`, () => HttpResponse.json(mockUser)),

  http.get(`${BASE}/api/events`, () => HttpResponse.json([mockEvent])),
  http.get(`${BASE}/api/events/:id`, () => HttpResponse.json(mockEvent)),
  http.post(`${BASE}/api/events`, () => HttpResponse.json(mockEvent, { status: 201 })),
  http.put(`${BASE}/api/events/:id`, () => HttpResponse.json(mockEvent)),
  http.delete(`${BASE}/api/events/:id`, () => HttpResponse.json({ success: true })),

  http.get(`${BASE}/api/registrations/my`, () => HttpResponse.json([mockRegistration])),
  http.post(`${BASE}/api/registrations`, () =>
    HttpResponse.json({ id: 2, userId: 1, eventId: 1, registeredAt: new Date().toISOString() }, { status: 201 })
  ),
  http.delete(`${BASE}/api/registrations/:eventId`, () => HttpResponse.json({ success: true })),
];
