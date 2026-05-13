import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { loginSchema, refreshSchema, registerSchema, logoutSchema } from '../validators/auth';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const r = Router();

r.post('/register', authLimiter, validate(registerSchema as never), ctrl.register);
r.post('/login',    authLimiter, validate(loginSchema as never),    ctrl.login);
r.post('/refresh',  validate(refreshSchema as never),               ctrl.refresh);
r.post('/logout',   validate(logoutSchema as never),                ctrl.logout);
r.get ('/me',       authenticate,                                   ctrl.me);

export default r;
