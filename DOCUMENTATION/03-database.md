# Database & Schema

Engine: **SQLite** (file-based, zero install)
ORM: **Prisma**
Location: `server/prisma/prisma/dev.db` (auto-created, gitignored)

---

## Schema

File: [`server/prisma/schema.prisma`](../server/prisma/schema.prisma)

### User

| Column | Type | Notes |
|--------|------|-------|
| `id` | Int | PK, auto-increment |
| `name` | String | |
| `email` | String | unique |
| `password` | String | plain text — POC only |
| `isAdmin` | Boolean | default `false` — true only when `role = 'admin'` |
| `role` | String | `'user'` \| `'manager'` \| `'admin'` — default `'user'` |
| `createdAt` | DateTime | default now |

### Event

| Column | Type | Notes |
|--------|------|-------|
| `id` | Int | PK, auto-increment |
| `title` | String | |
| `description` | String | |
| `date` | DateTime | |
| `capacity` | Int | max registrations allowed |
| `createdAt` | DateTime | default now |

### Registration

| Column | Type | Notes |
|--------|------|-------|
| `id` | Int | PK, auto-increment |
| `userId` | Int | FK → User |
| `eventId` | Int | FK → Event |
| `registeredAt` | DateTime | default now |

Unique constraint: `(userId, eventId)` — one registration per user per event.

---

## Common Prisma commands

All commands must be run from the `server/` directory.

```bash
# Apply schema changes and create a migration file
npx prisma migrate dev --name <description>

# Re-run the seed (create default admin + manager + user accounts)
npx prisma db seed

# Open visual DB browser
npx prisma studio

# Regenerate the Prisma client after schema changes (migrate dev does this automatically)
npx prisma generate

# Reset the entire database and re-seed (WARNING: deletes all data)
npx prisma migrate reset
```

---

## Seed

File: [`server/prisma/seed.ts`](../server/prisma/seed.ts)

Creates three default accounts using `upsert` (safe to re-run):

| Name | Email | Password | role |
|------|-------|----------|------|
| Admin | `admin@local.dev` | `admin` | `admin` |
| Manager | `manager@local.dev` | `manager` | `manager` |
| User | `user@local.dev` | `user` | `user` |

The seed runs automatically at the end of `prisma migrate dev`. To change a user's role via the UI, log in as admin and use the User Management table on the Admin Dashboard page. To change it directly, use Prisma Studio → `User` table → set `role` and (if admin) `isAdmin = true`.

---

## Migrations

Migration files live in `server/prisma/migrations/` and are committed to git. Each migration is a plain SQL file that Prisma applies in order.

To create a new migration after editing `schema.prisma`:

```bash
cd server
npx prisma migrate dev --name describe-your-change
```

Prisma will diff the schema, generate the SQL, apply it to `dev.db`, and regenerate the client.
