import { Request, Response, NextFunction } from 'express';
import {
  changePassword,
  requestPasswordReset,
  resetPasswordWithToken,
  updateOwnProfile,
} from '../services/users.service';

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await updateOwnProfile(req.user!.sub, req.body);
    res.json({ user });
  } catch (e) { next(e); }
}

export async function changeMyPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await changePassword(req.user!.sub, req.body.currentPassword, req.body.newPassword);
    res.status(204).end();
  } catch (e) { next(e); }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = await requestPasswordReset(req.body.email);
    // Em produção, o token seria enviado por e-mail. Aqui retornamos um boolean por padrão
    // e em ambiente não-produção devolvemos o token para facilitar o desenvolvimento.
    if (process.env.NODE_ENV === 'production') {
      res.status(202).json({ ok: true });
    } else {
      res.status(202).json({ ok: true, devToken: token });
    }
  } catch (e) { next(e); }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await resetPasswordWithToken(req.body.token, req.body.newPassword);
    res.status(204).end();
  } catch (e) { next(e); }
}
