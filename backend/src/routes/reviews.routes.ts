import { Router } from 'express';
import * as ctrl from '../controllers/reviews.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { reviewSchema, uuidParam } from '../validators/common';

const r = Router();

r.get('/provider/:id', validate({ params: uuidParam }), ctrl.byProvider);
r.post('/', authenticate, validate(reviewSchema as never), ctrl.create);

export default r;
