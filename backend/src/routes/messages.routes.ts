import { Router } from 'express';
import * as ctrl from '../controllers/messages.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { messageSchema, uuidParam } from '../validators/common';

const r = Router();
r.use(authenticate);

r.get('/', ctrl.conversations);
r.get('/:id', validate({ params: uuidParam }), ctrl.thread);
r.post('/', validate(messageSchema as never), ctrl.send);

export default r;
