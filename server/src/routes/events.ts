import { Router } from 'express';
import prisma from '../lib/prisma';
import { resolveUser, requireAdmin, requireManager } from '../middleware/resolveUser';

const router = Router();

/**
 * @openapi
 * /api/events:
 *   get:
 *     summary: List all events sorted by date ascending
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Array of events with registration counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Event' }
 */
router.get('/', async (_req, res) => {
  const events = await prisma.event.findMany({
    include: { _count: { select: { registrations: true } } },
    orderBy: { date: 'asc' },
  });
  res.json(events);
});

/**
 * @openapi
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Event found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Event' }
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: Number(req.params.id) },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(event);
});

/**
 * @openapi
 * /api/events:
 *   post:
 *     summary: Create a new event (admin or manager)
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/XUserId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, date, capacity]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               date: { type: string, format: date-time }
 *               capacity: { type: integer, minimum: 1 }
 *     responses:
 *       201:
 *         description: Event created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Event' }
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Unauthenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Not an admin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', resolveUser, requireManager, async (req, res) => {
  const { title, description, date, capacity } = req.body;
  if (!title || !description || !date || capacity == null) {
    res.status(400).json({ error: 'title, description, date and capacity are required' });
    return;
  }
  const event = await prisma.event.create({
    data: { title, description, date: new Date(date), capacity: Number(capacity) },
  });
  res.status(201).json(event);
});

/**
 * @openapi
 * /api/events/{id}:
 *   put:
 *     summary: Update an event (admin or manager)
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/XUserId'
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               date: { type: string, format: date-time }
 *               capacity: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Event updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Event' }
 *       401:
 *         description: Unauthenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Not an admin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/:id', resolveUser, requireManager, async (req, res) => {
  const { title, description, date, capacity } = req.body;
  const event = await prisma.event.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(date && { date: new Date(date) }),
      ...(capacity != null && { capacity: Number(capacity) }),
    },
  });
  res.json(event);
});

/**
 * @openapi
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event and all its registrations (admin or manager)
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/XUserId'
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Event deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *       401:
 *         description: Unauthenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Not an admin
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', resolveUser, requireManager, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) { res.status(404).json({ error: 'Event not found' }); return; }
  await prisma.registration.deleteMany({ where: { eventId: id } });
  await prisma.event.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
