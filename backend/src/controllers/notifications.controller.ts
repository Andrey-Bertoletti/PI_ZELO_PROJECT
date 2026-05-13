import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.notification.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ items });
  } catch (e) { next(e); }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.sub, id: req.params.id, readAt: null },
      data: { readAt: new Date() },
    });
    res.status(204).end();
  } catch (e) { next(e); }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.sub, readAt: null },
      data: { readAt: new Date() },
    });
    res.status(204).end();
  } catch (e) { next(e); }
}
