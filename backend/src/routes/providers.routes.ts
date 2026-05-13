import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/providers.controller';
import * as self from '../controllers/providerSelf.controller';
import { validate } from '../middleware/validate';
import { proListQuery, uuidParam } from '../validators/common';
import { authenticate, requireRole } from '../middleware/auth';

const profileUpdateSchema = z.object({
  body: z.object({
    bio: z.string().trim().max(2000).optional().or(z.literal('')),
    yearsExp: z.number().int().min(0).max(80).optional(),
    priceFrom: z.number().int().min(0).max(1_000_000).optional(),
    available: z.boolean().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    categoryIds: z.array(z.string().min(1).max(40)).max(20).optional(),
  }),
});

const serviceCreateSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().max(2000).optional(),
    categoryId: z.string().min(1).max(40),
    priceMin: z.number().int().min(0).max(1_000_000),
    priceMax: z.number().int().min(0).max(1_000_000).optional(),
    unit: z.string().trim().min(1).max(40).optional(),
  }),
});

const serviceUpdateSchema = z.object({
  body: serviceCreateSchema.shape.body.partial(),
  params: uuidParam,
});

const r = Router();

// Públicos
r.get('/categories', ctrl.listCategories);
r.get('/',           validate({ query: proListQuery }), ctrl.list);

// Auto-gestão do profissional autenticado — DEVE vir antes de /:id
r.get   ('/me',                authenticate, requireRole('PROVIDER'), self.getMe);
r.patch ('/me',                authenticate, requireRole('PROVIDER'), validate(profileUpdateSchema as never), self.updateMe);
r.post  ('/me/services',       authenticate, requireRole('PROVIDER'), validate(serviceCreateSchema as never), self.addService);
r.patch ('/me/services/:id',   authenticate, requireRole('PROVIDER'), validate(serviceUpdateSchema as never), self.editService);
r.delete('/me/services/:id',   authenticate, requireRole('PROVIDER'), validate({ params: uuidParam }),         self.removeService);

// Detalhe público — depois das rotas /me para não capturar "me"
r.get('/:id', validate({ params: uuidParam }), ctrl.getById);

export default r;
