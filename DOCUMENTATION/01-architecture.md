# Architecture & Code Guide

## Overview

Monorepo with two npm workspaces: `client/` and `server/`. Both run in dev mode simultaneously via `concurrently` from the root.

```
npm run dev
  ├── server: ts-node-dev src/index.ts   → http://localhost:3001
  └── client: vite                        → http://localhost:5173
```

---

## Frontend (`client/`)

### Tech

| Tool | Purpose |
|------|---------|
| Vite | Dev server and bundler |
| React 18 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| react-router-dom v6 | Client-side routing |

### Source layout

```
client/src/
├── main.tsx              Entry point — mounts <App /> into #root
├── App.tsx               Router, route guards, layout wrapper
├── index.css             Tailwind directives (@tailwind base/components/utilities)
├── api/
│   └── client.ts         Fetch wrapper — injects X-User-Id header on every request
├── context/
│   └── AuthContext.tsx   Auth state (read/write localStorage key "cc_user")
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── EventsPage.tsx
│   └── AdminPage.tsx
├── components/
│   ├── Navbar.tsx
│   ├── EventCard.tsx
│   ├── EventForm.tsx          Shared create/edit form
│   └── RegistrationButton.tsx
└── types/
    └── index.ts          Shared TS interfaces: User, Event, Registration
```

### Routing & guards

| Route | Guard | Component |
|-------|-------|-----------|
| `/login` | public | `LoginPage` |
| `/register` | public | `RegisterPage` |
| `/events` | must be logged in | `EventsPage` |
| `/admin` | must be logged in + `isAdmin` | `AdminPage` |
| `/*` | — | redirect to `/events` |

### Roles

| Role | Can do |
|------|--------|
| `user` | Browse events, register/cancel for events |
| `manager` | Everything a user can + edit events (PUT) |
| `admin` | Everything a manager can + create events, delete events, manage user roles |

Roles are stored in the `User.role` column. `isAdmin` is kept in sync (`true` only when `role = 'admin'`).

### Auth flow (POC)

1. Login/register → server returns `{ id, name, email, isAdmin }`.
2. Client stores the object as JSON in `localStorage` under key `cc_user`.
3. `AuthContext` hydrates from localStorage on first render.
4. `api/client.ts` reads `cc_user` on every request and injects `X-User-Id: <id>` header.
5. Logout clears localStorage and resets context.

> **Security note:** The `X-User-Id` header can be spoofed. This is intentional for a local POC — do not use this auth model in production.

---

## Backend (`server/`)

### Tech

| Tool | Purpose |
|------|---------|
| Express | HTTP server |
| TypeScript | Type safety |
| ts-node-dev | Hot-reload dev runner |
| Prisma | ORM + migrations |
| SQLite | Local file-based database |

### Source layout

```
server/src/
├── index.ts              Express bootstrap — CORS, JSON body parser, route mounting
├── lib/
│   └── prisma.ts         Singleton PrismaClient instance
├── middleware/
│   └── resolveUser.ts    resolveUser: reads X-User-Id, attaches req.user
│                         requireAdmin: checks req.user.isAdmin, returns 403 otherwise
├── routes/
│   ├── users.ts          POST /register, POST /login, GET /me
│   ├── events.ts         CRUD for events (create/update/delete require admin)
│   └── registrations.ts  Register/cancel/list (all require auth via resolveUser)
└── types.d.ts            Extends Express Request with `user?: User`
```

### Request lifecycle

```
Request
  → CORS middleware
  → express.json()
  → route handler
      → resolveUser (reads X-User-Id → prisma.user.findUnique → req.user)
      → requireAdmin (optional, checks req.user.isAdmin)
      → business logic + Prisma query
  → JSON response
```

---

## Environment variables

**`server/.env`**
```
DATABASE_URL="file:./prisma/dev.db"
PORT=3001
```

**`client/.env`**
```
VITE_API_URL=http://localhost:3001
```

---

## Adding a new feature — checklist

1. Add/update Prisma model in `server/prisma/schema.prisma`
2. Run `cd server && npx prisma migrate dev --name <name>`
3. Add/update types in `client/src/types/index.ts`
4. Add Express route in `server/src/routes/`
5. Mount it in `server/src/index.ts`
6. Add API calls in `client/src/api/client.ts` or inline in the page
7. Add/update React page or component
