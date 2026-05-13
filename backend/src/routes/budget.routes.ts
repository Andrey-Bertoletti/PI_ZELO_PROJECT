import { Router } from 'express';
import * as ctrl from '../controllers/budget.controller';
import { optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { budgetSchema } from '../validators/common';

const r = Router();

r.post('/estimate', optionalAuth, validate(budgetSchema as never), ctrl.estimate);

export default r;
