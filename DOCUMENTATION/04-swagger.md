# Swagger / OpenAPI

## Live URL

Start the server (`npm run dev` or `cd server && npm run dev`) then open:

```
http://localhost:3001/api-docs
```

Swagger UI loads with all endpoints documented, interactive request forms, and response schemas.

---

## How it works

- **`swagger-jsdoc`** scans all `@openapi` JSDoc comment blocks in `server/src/routes/*.ts` and assembles an OpenAPI 3.0 spec at startup.
- **`swagger-ui-express`** serves the resulting spec as an interactive HTML page at `/api-docs`.
- The spec object is defined in `server/src/swagger.ts`.

---

## Adding a new endpoint to the spec

1. Add your route handler in the appropriate file under `server/src/routes/`.
2. Add an `@openapi` JSDoc block directly above the handler:

```ts
/**
 * @openapi
 * /api/your-resource:
 *   post:
 *     summary: Short description
 *     tags: [YourTag]
 *     parameters:
 *       - $ref: '#/components/parameters/XUserId'   # if auth required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [field1]
 *             properties:
 *               field1: { type: string }
 *     responses:
 *       201:
 *         description: Resource created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/YourSchema' }
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', async (req, res) => { ... });
```

3. To add a new reusable schema, edit the `components.schemas` block in `server/src/swagger.ts`.
4. Restart the server — the spec is regenerated on startup.

---

## Existing reusable components

| Ref | Description |
|-----|-------------|
| `#/components/schemas/User` | User object (no password) |
| `#/components/schemas/Event` | Event with optional `_count.registrations` |
| `#/components/schemas/Registration` | Registration row |
| `#/components/schemas/Error` | `{ error: string }` |
| `#/components/parameters/XUserId` | `X-User-Id` header parameter |

---

## Running E2E tests (Playwright)

Playwright smoke tests require **both dev servers running** before you execute them.

```bash
# Terminal 1 — start both servers
npm run dev

# Terminal 2 — run E2E smoke tests
npm run test:e2e
```

On first use, install the Chromium browser (one-time):
```bash
npx playwright install chromium
```

Test files live in `playwright/smoke.spec.ts`. Screenshots on failure are saved to `playwright-report/`.

---

## Running unit / integration tests

```bash
# All tests (server + client)
npm test

# Server only
npm run test -w server

# Client only
npm run test -w client

# Watch mode (server)
npm run test:watch -w server
```
