import { Request, Response, NextFunction } from 'express';
import {
  createBooking,
  getBookingById,
  listUserBookings,
  updateBookingStatus,
} from '../services/bookings.service';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await createBooking({ ...req.body, clientId: req.user!.sub });
    res.status(201).json(booking);
  } catch (e) { next(e); }
}

export async function mine(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await listUserBookings(req.user!.sub, req.user!.role);
    res.json({ items });
  } catch (e) { next(e); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await getBookingById(req.params.id, req.user!.sub, req.user!.role);
    res.json(item);
  } catch (e) { next(e); }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await updateBookingStatus(
      req.params.id,
      req.user!.sub,
      req.user!.role,
      req.body.status,
      req.body.priceFinal,
    );
    res.json(item);
  } catch (e) { next(e); }
}
