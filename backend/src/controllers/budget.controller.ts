import { Request, Response, NextFunction } from 'express';
import { estimateBudget } from '../services/budget.service';

export async function estimate(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await estimateBudget(req.user?.sub, req.body.categoryId, req.body.answers);
    res.json(result);
  } catch (e) { next(e); }
}
