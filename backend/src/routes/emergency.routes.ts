import { Router } from 'express';
import * as ctrl from '../controllers/emergency.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const matchSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1).max(40),
    city: z.string().trim().max(80).optional(),
    neighborhood: z.string().trim().max(80).optional(),
  }),
});

const r = Router();
r.use(authenticate);

r.post('/match', validate(matchSchema as never), ctrl.match);

export default r;
