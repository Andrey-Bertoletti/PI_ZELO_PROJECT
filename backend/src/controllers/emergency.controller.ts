import { Request, Response, NextFunction } from 'express';
import { findEmergencyMatch } from '../services/emergency.service';
import { prisma } from '../config/prisma';

export async function match(req: Request, res: Response, next: NextFunction) {
  try {
    let city = req.body.city as string | undefined;
    let neighborhood = req.body.neighborhood as string | undefined;
    if (!city || !neighborhood) {
      const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
      city = city ?? user?.city ?? undefined;
      neighborhood = neighborhood ?? user?.neighborhood ?? undefined;
    }
    const result = await findEmergencyMatch({
      categoryId: req.body.categoryId,
      city,
      neighborhood,
    });
    res.json(result);
  } catch (e) { next(e); }
}
