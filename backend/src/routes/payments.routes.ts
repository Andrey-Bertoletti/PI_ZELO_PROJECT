import { Router } from 'express';
import * as ctrl from '../controllers/payments.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const paymentCreateSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid(),
    method: z.enum(['pix', 'card']),
  }),
});

const bookingIdParam = z.object({
  bookingId: z.string().uuid(),
});

const r = Router();
r.use(authenticate);

r.post('/',                          validate(paymentCreateSchema as never),                ctrl.create);
r.post('/:bookingId/confirm',        validate({ params: bookingIdParam }),                  ctrl.confirm);
r.get ('/:bookingId',                validate({ params: bookingIdParam }),                  ctrl.getByBooking);

export default r;
