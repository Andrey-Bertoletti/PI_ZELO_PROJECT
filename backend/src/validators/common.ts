import { z } from 'zod';

export const uuidParam = z.object({
  id: z.string().uuid('ID inválido'),
});

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
});

export const proListQuery = z.object({
  category: z.string().min(1).max(40).optional(),
  city: z.string().min(1).max(80).optional(),
  q: z.string().trim().min(1).max(80).optional(),
  sort: z.enum(['rating', 'distance', 'price']).default('rating'),
  verified: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(50).default(20),
});

export const bookingCreateSchema = z.object({
  body: z.object({
    providerId: z.string().uuid(),
    categoryId: z.string().min(1).max(40),
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().max(2000).optional(),
    address: z.string().trim().min(3).max(240),
    scheduledAt: z.string().datetime().optional(),
    urgency: z.enum(['EMERGENCY', 'TODAY', 'THIS_WEEK', 'FLEXIBLE']).default('FLEXIBLE'),
    priceEstimate: z.number().int().min(0).max(1_000_000).optional(),
  }),
});

export const bookingUpdateStatus = z.object({
  body: z.object({
    status: z.enum(['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    priceFinal: z.number().int().min(0).max(1_000_000).optional(),
  }),
  params: uuidParam,
});

export const reviewSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().max(1000).optional(),
  }),
});

export const messageSchema = z.object({
  body: z.object({
    receiverId: z.string().uuid(),
    bookingId: z.string().uuid().optional(),
    content: z.string().trim().min(1).max(2000),
  }),
});

export const budgetSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1).max(40),
    answers: z.record(z.string().min(1)),
  }),
});
