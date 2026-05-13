import { Request, Response, NextFunction } from 'express';
import {
  authenticateUser,
  registerUser,
  revokeRefreshToken,
  rotateRefreshToken,
  publicUserSelect,
} from '../services/auth.service';
import { prisma } from '../config/prisma';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ user });
  } catch (e) { next(e); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const meta = { ip: req.ip, ua: req.headers['user-agent'] };
    const tokens = await authenticateUser(req.body.email, req.body.password, meta);
    const user = await prisma.user.findUnique({ where: { email: req.body.email }, select: publicUserSelect });
    res.json({ ...tokens, user });
  } catch (e) { next(e); }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const meta = { ip: req.ip, ua: req.headers['user-agent'] };
    const tokens = await rotateRefreshToken(req.body.refreshToken, meta);
    res.json(tokens);
  } catch (e) { next(e); }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await revokeRefreshToken(req.body.refreshToken);
    res.status(204).end();
  } catch (e) { next(e); }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { ...publicUserSelect, providerProfile: true },
    });
    res.json({ user });
  } catch (e) { next(e); }
}
