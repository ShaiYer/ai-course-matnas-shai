import { Router } from 'express';
import prisma from '../lib/prisma';
import { resolveUser } from '../middleware/resolveUser';

const router = Router();

router.use(resolveUser);

/**
 * @openapi
 * /api/registrations/my:
 *   get:
 *     summary: List all registrations for the current user
 *     tags: [Registrations]
 *     parameters:
 *       - $ref: '#/components/parameters/XUserId'
 *     responses:
 *       200:
 *         description: List of registrations with nested event data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Registration'
 *                   - type: object
 *                     properties:
 *                       event: { $ref: '#/components/schemas/Event' }
 *       401:
 *         description: Unauthenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/my', async (req, res) => {
  const registrations = await prisma.registration.findMany({
    where: { userId: req.user!.id },
    include: { event: true },
    orderBy: { registeredAt: 'desc' },
  });
  res.json(registrations);
});

/**
 * @openapi
 * /api/registrations:
 *   post:
 *     summary: Register the current user for an event
 *     tags: [Registrations]
 *     parameters:
 *       - $ref: '#/components/parameters/XUserId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId]
 *             properties:
 *               eventId: { type: integer }
 *     responses:
 *       201:
 *         description: Registration created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Registration' }
 *       400:
 *         description: Missing eventId
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Unauthenticated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Event is full or user already registered
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) { res.status(400).json({ error: 'eventId is required' }); return; }

  const event = await prisma.event.findUnique({ where: { id: Number(eventId) } });
  if (!event) { res.status(404).json({ error: 'Event not found' }); return; }

  const count = await prisma.registration.count({ where: { eventId: Number(eventId) } });
  if (count >= event.capacity) {
    res.status(409).json({ error: 'Event is full' });
    return;
  }

  const registration = await prisma.registration.create({
    data: { userId: req.user!.id, eventId: Number(eventId) },
  });
  res.status(201).json(registration);
});

/**
 * @openapi
 * /api/registrations/{eventId}:
 *   delete:
 *     summary: Cancel the current user's registration for an event
 *     tags: [Registrations]
 *     parameters:
 *       - $ref: '#/components/parameters/XUserId'
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Registration cancelled (no-op if not registered)
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
 */
router.delete('/:eventId', async (req, res) => {
  await prisma.registration.deleteMany({
    where: { userId: req.user!.id, eventId: Number(req.params.eventId) },
  });
  res.json({ success: true });
});

export default router;
