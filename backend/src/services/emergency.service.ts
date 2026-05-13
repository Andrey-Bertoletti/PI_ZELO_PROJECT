import { prisma } from '../config/prisma';
import { NotFound } from '../utils/errors';

interface MatchInput {
  categoryId: string;
  city?: string;
  neighborhood?: string;
}

/**
 * Encontra o profissional verificado disponível mais bem avaliado
 * para uma emergência. Em produção também levaríamos em conta distância real
 * (PostGIS) e tempo de resposta. Aqui usamos cidade/bairro como proxy.
 */
export async function findEmergencyMatch(opts: MatchInput) {
  const candidates = await prisma.providerProfile.findMany({
    where: {
      kycStatus: 'VERIFIED',
      available: true,
      categories: { some: { categoryId: opts.categoryId } },
      user: {
        isActive: true,
        ...(opts.city && { city: opts.city }),
      },
    },
    orderBy: [{ ratingAvg: 'desc' }, { jobsDone: 'desc' }],
    take: 5,
    include: {
      user: { select: { id: true, name: true, avatarHue: true, city: true, neighborhood: true } },
      categories: { include: { category: true } },
    },
  });

  if (candidates.length === 0) {
    throw NotFound('Sem profissionais disponíveis para emergência no momento');
  }

  let best = candidates[0];
  if (opts.neighborhood) {
    const hit = candidates.find((p) => p.user.neighborhood === opts.neighborhood);
    if (hit) best = hit;
  }

  const etaMin = 12 + Math.floor(Math.random() * 20);
  const distanceKm = Number((1 + Math.random() * 4).toFixed(1));

  return {
    provider: {
      id: best.id,
      userId: best.user.id,
      name: best.user.name,
      avatarHue: best.user.avatarHue,
      neighborhood: best.user.neighborhood,
      rating: best.ratingAvg,
      jobsDone: best.jobsDone,
      priceFrom: best.priceFrom,
      categories: best.categories.map((c) => c.category),
      verified: true,
    },
    etaMin,
    distanceKm,
    nearbyCount: candidates.length,
  };
}
