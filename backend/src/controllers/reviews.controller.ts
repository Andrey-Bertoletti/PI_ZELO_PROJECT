import { Request, Response, NextFunction } from 'express';
import { createReview, listReviewsByProvider } from '../services/reviews.service';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const r = await createReview(req.user!.sub, req.body);
    res.status(201).json(r);
  } catch (e) { next(e); }
}

export async function byProvider(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await listReviewsByProvider(req.params.id);
    res.json({ items });
  } catch (e) { next(e); }
}
