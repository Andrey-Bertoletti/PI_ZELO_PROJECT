import { Router } from 'express';
import * as ctrl from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators/auth';
import { authLimiter } from '../middleware/rateLimit';

const r = Router();

r.patch('/me',                authenticate, validate(updateProfileSchema as never),  ctrl.updateMe);
r.post ('/me/change-password', authenticate, validate(changePasswordSchema as never), ctrl.changeMyPassword);
r.post ('/forgot-password',   authLimiter, validate(forgotPasswordSchema as never),  ctrl.forgotPassword);
r.post ('/reset-password',    authLimiter, validate(resetPasswordSchema as never),   ctrl.resetPassword);

export default r;
