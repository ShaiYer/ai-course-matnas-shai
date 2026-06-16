import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export async function resolveUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    res.status(401).json({ error: 'Unauthenticated' });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }
  req.user = user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

// Managers and admins can edit events
export function requireManager(req: Request, res: Response, next: NextFunction) {
  const role = req.user?.role;
  if (role !== 'manager' && role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}
