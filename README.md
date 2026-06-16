# Community Center — POC

A local proof-of-concept web app for a community center: users register and sign up for events; admins create and manage events.

**Stack:** React + TypeScript + Vite + Tailwind (frontend) · Express + TypeScript (backend) · SQLite + Prisma (database)

---

## Quick Start (daily use)

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| App (frontend) | http://localhost:5173 |
| API (backend) | http://localhost:3001 |

**Default accounts — no registration needed:**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@local.dev` | `admin` |
| Manager | `manager@local.dev` | `manager` |
| User | `user@local.dev` | `user` |

---

## First-Time Setup

**Requirements:** Node.js 18+, npm 9+

```bash
# 1. Install all dependencies
npm install

# 2. Create the database and seed default users
cd server && npx prisma migrate dev --name init && cd ..
```

That's it — then run `npm run dev` from the root.

---

## Running Tests

```bash
# Unit + integration tests (server + client)
npm test

# E2E smoke tests (requires dev servers running in another terminal)
npm run test:e2e
```

**Swagger UI** (live API docs, requires server running): http://localhost:3001/api-docs

---

## Common Tasks

**Inspect / edit the database visually:**
```bash
cd server && npx prisma studio
```

**Re-seed default users** (if DB was wiped):
```bash
cd server && npx prisma db seed
```

**Add a new database migration** (after editing `server/prisma/schema.prisma`):
```bash
cd server && npx prisma migrate dev --name describe-your-change
```

---

## Installation from Scratch

```bash
git clone <repo-url>
cd ai-course-matnas-shai
npm install
cd server && npx prisma migrate dev --name init && cd ..
npm run dev
```

---

## Project Structure

```
├── client/          React + Vite + Tailwind frontend
├── server/          Express + Prisma backend
│   └── prisma/      Schema, migrations, seed script
└── package.json     Monorepo root (npm workspaces)
```

---

## Documentation

- [Architecture & Code Guide](DOCUMENTATION/01-architecture.md)
- [API Reference](DOCUMENTATION/02-api-reference.md)
- [Database & Schema](DOCUMENTATION/03-database.md)
- [Swagger & Testing](DOCUMENTATION/04-swagger.md)
