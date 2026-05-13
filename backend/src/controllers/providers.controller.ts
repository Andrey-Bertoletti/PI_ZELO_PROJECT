import { Request, Response, NextFunction } from 'express';
import { getProviderById, listProviders } from '../services/providers.service';
import { prisma } from '../config/prisma';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as Record<string, string>;
    const result = await listProviders({
      category: q.category,
      city: q.city,
      q: q.q,
      sort: (q.sort as 'rating' | 'price' | 'distance') ?? 'rating',
      verified: q.verified === 'true',
      page: Number(q.page) || 1,
      perPage: Number(q.perPage) || 20,
    });
    res.json(result);
  } catch (e) { next(e); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const provider = await getProviderById(req.params.id);
    res.json(provider);
  } catch (e) { next(e); }
}

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await prisma.category.findMany({ orderBy: { order: 'asc' } });
    res.json({ items });
  } catch (e) { next(e); }
}
