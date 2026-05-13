import { prisma } from '../config/prisma';
import { BadRequest, Conflict, Forbidden, NotFound } from '../utils/errors';

export async function createReview(
  authorId: string,
  input: { bookingId: string; rating: number; comment?: string },
) {
  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { provider: { include: { user: true } } },
  });
  if (!booking) throw NotFound('Agendamento não encontrado');
  if (booking.clientId !== authorId) throw Forbidden('Apenas o contratante pode avaliar');
  if (booking.status !== 'COMPLETED') throw BadRequest('Avaliação só após conclusão');

  const existing = await prisma.review.findUnique({ where: { bookingId: input.bookingId } });
  if (existing) throw Conflict('Esta contratação já foi avaliada');

  const targetUserId = booking.provider.userId;

  const [review] = await prisma.$transaction([
    prisma.review.create({
      data: {
        bookingId: input.bookingId,
        authorId,
        targetId: targetUserId,
        rating: input.rating,
        comment: input.comment,
      },
    }),
    prisma.providerProfile.update({
      where: { id: booking.providerId },
      data: {
        ratingAvg: {
          set: await recalcAverage(booking.providerId, input.rating),
        },
        ratingCount: { increment: 1 },
      },
    }),
  ]);

  return review;
}

async function recalcAverage(providerId: string, newRating: number): Promise<number> {
  const profile = await prisma.providerProfile.findUnique({ where: { id: providerId } });
  if (!profile) return newRating;
  const total = profile.ratingAvg * profile.ratingCount + newRating;
  const count = profile.ratingCount + 1;
  return Number((total / count).toFixed(2));
}

export async function listReviewsByProvider(providerId: string) {
  const provider = await prisma.providerProfile.findUnique({ where: { id: providerId } });
  if (!provider) throw NotFound('Profissional não encontrado');

  return prisma.review.findMany({
    where: { targetId: provider.userId },
    include: { author: { select: { id: true, name: true, avatarHue: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}
