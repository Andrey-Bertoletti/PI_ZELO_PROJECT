import { Request, Response, NextFunction } from 'express';
import { listConversations, listThread, markAsRead, sendMessage } from '../services/messages.service';

export async function send(req: Request, res: Response, next: NextFunction) {
  try {
    const m = await sendMessage(req.user!.sub, req.body);
    res.status(201).json(m);
  } catch (e) { next(e); }
}

export async function conversations(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await listConversations(req.user!.sub);
    res.json({ items });
  } catch (e) { next(e); }
}

export async function thread(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await listThread(req.user!.sub, req.params.id);
    await markAsRead(req.user!.sub, req.params.id);
    res.json({ items });
  } catch (e) { next(e); }
}
