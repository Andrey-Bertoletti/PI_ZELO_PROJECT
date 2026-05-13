import { Router } from 'express';
import * as ctrl from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uuidParam } from '../validators/common';

const r = Router();
r.use(authenticate);

r.get('/', ctrl.list);
r.post('/read-all', ctrl.markAllRead);
r.post('/:id/read', validate({ params: uuidParam }), ctrl.markRead);

export default r;
