# API Reference

Base URL: `http://localhost:3001`

All endpoints that require authentication expect the header:
```
X-User-Id: <user id>
```

All request and response bodies are JSON. All endpoints return `{ error: string }` on failure.

---

## Users

### POST /api/users/register

Create a new user account.

**Body**
```json
{ "name": "Alice", "email": "alice@example.com", "password": "secret" }
```

**Response** `201`
```json
{ "id": 3, "name": "Alice", "email": "alice@example.com", "isAdmin": false, "createdAt": "..." }
```

**Errors**
- `400` — missing required fields
- `409` — email already in use

---

### POST /api/users/login

Validate credentials and return the user object.

**Body**
```json
{ "email": "alice@example.com", "password": "secret" }
```

**Response** `200`
```json
{ "id": 3, "name": "Alice", "email": "alice@example.com", "isAdmin": false, "createdAt": "..." }
```

**Errors**
- `401` — invalid email or password

---

### GET /api/users

List all users (admin only). Returns array of user objects without passwords.

**Headers:** `X-User-Id` required (admin)

**Response** `200` — array of User objects (see schema above, includes `role` field).

**Errors**
- `401` / `403`

---

### PUT /api/users/:id/role

Set a user's role (admin only). Also updates `isAdmin` automatically.

**Headers:** `X-User-Id` required (admin)

**Body**
```json
{ "role": "manager" }
```
Valid values: `"user"` · `"manager"` · `"admin"`

**Response** `200` — updated user object.

**Errors**
- `400` — invalid role value
- `401` / `403`
- `404` — user not found

---

### GET /api/users/me

Return the currently authenticated user.

**Headers:** `X-User-Id` required

**Response** `200`
```json
{ "id": 3, "name": "Alice", "email": "alice@example.com", "isAdmin": false, "createdAt": "..." }
```

---

## Events

### GET /api/events

List all events sorted by date ascending. Includes registration count.

**Response** `200`
```json
[
  {
    "id": 1,
    "title": "Yoga Class",
    "description": "Morning yoga for all levels",
    "date": "2026-07-01T08:00:00.000Z",
    "capacity": 20,
    "createdAt": "...",
    "_count": { "registrations": 5 }
  }
]
```

---

### GET /api/events/:id

Get a single event by ID.

**Response** `200` — same shape as above.
**Errors**
- `404` — event not found

---

### POST /api/events

Create a new event.

**Headers:** `X-User-Id` required (admin only)

**Body**
```json
{
  "title": "Yoga Class",
  "description": "Morning yoga for all levels",
  "date": "2026-07-01T08:00:00.000Z",
  "capacity": 20
}
```

**Response** `201` — created event object (without `_count`).

**Errors**
- `400` — missing required fields
- `401` — unauthenticated
- `403` — user is not admin

---

### PUT /api/events/:id

Update an existing event. All fields are optional.

**Headers:** `X-User-Id` required (admin or manager)

**Body** — any subset of create fields:
```json
{ "capacity": 30 }
```

**Response** `200` — updated event object.

**Errors**
- `401` / `403` — as above

---

### DELETE /api/events/:id

Delete an event and all its registrations.

**Headers:** `X-User-Id` required (admin only)

**Response** `200`
```json
{ "success": true }
```

---

## Registrations

All registration endpoints require `X-User-Id`.

### POST /api/registrations

Register the current user for an event.

**Body**
```json
{ "eventId": 1 }
```

**Response** `201`
```json
{ "id": 7, "userId": 3, "eventId": 1, "registeredAt": "..." }
```

**Errors**
- `400` — missing eventId
- `404` — event not found
- `409` — event is full, or user already registered

---

### DELETE /api/registrations/:eventId

Cancel the current user's registration for an event.

**Response** `200`
```json
{ "success": true }
```

---

### GET /api/registrations/my

List all events the current user is registered for.

**Response** `200`
```json
[
  {
    "id": 7,
    "userId": 3,
    "eventId": 1,
    "registeredAt": "...",
    "event": { "id": 1, "title": "Yoga Class", ... }
  }
]
```
