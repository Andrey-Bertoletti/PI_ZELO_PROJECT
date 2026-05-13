import { Request, Response, NextFunction } from 'express';
import {
  buildPixPayload,
  confirmPayment,
  createPaymentForBooking,
  getPaymentByBooking,
} from '../services/payments.service';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const payment = await createPaymentForBooking(req.user!.sub, req.body);
    const pix = payment.method === 'pix' ? buildPixPayload(payment.amount, payment.externalId ?? payment.id) : undefined;
    res.status(201).json({ payment, pix });
  } catch (e) { next(e); }
}

export async function confirm(req: Request, res: Response, next: NextFunction) {
  try {
    const payment = await confirmPayment(req.user!.sub, req.params.bookingId);
    res.json({ payment });
  } catch (e) { next(e); }
}

export async function getByBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const payment = await getPaymentByBooking(req.user!.sub, req.params.bookingId);
    res.json({ payment });
  } catch (e) { next(e); }
}
