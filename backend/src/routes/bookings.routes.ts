import { Router } from 'express';
import * as ctrl from '../controllers/bookings.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { bookingCreateSchema, bookingUpdateStatus, uuidParam } from '../validators/common';

const r = Router();
r.use(authenticate);

r.get('/mine', ctrl.mine);
r.post('/', validate(bookingCreateSchema as never), ctrl.create);
r.get('/:id', validate({ params: uuidParam }), ctrl.getById);
r.patch('/:id/status', validate(bookingUpdateStatus as never), ctrl.updateStatus);

export default r;
