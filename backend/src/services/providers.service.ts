import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { NotFound } from '../utils/errors';

interface ListOpts {
  category?: string;
  city?: string;
  verified?: boolean;
  sort?: 'rating' | 'price' | 'distance';
  q?: string;
  page: number;
  perPage: number;
}

export async function listProviders(opts: ListOpts) {
  const q = opts.q?.trim();
  const where: Prisma.ProviderProfileWhereInput = {
    user: {
      isActive: true,
      ...(opts.city && { city: opts.city }),
      ...(q && { name: { contains: q, mode: 'insensitive' } }),
    },
    ...(opts.verified && { kycStatus: 'VERIFIED' }),
    ...(opts.category && { categories: { some: { categoryId: opts.category } } }),
    ...(q && !opts.category && {
      OR: [
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { bio: { contains: q, mode: 'insensitive' } },
        { categories: { some: { category: { name: { contains: q, mode: 'insensitive' } } } } },
        { services: { some: { title: { contains: q, mode: 'insensitive' } } } },
      ],
    }),
  };

  const orderBy: Prisma.ProviderProfileOrderByWithRelationInput =
    opts.sort === 'price' ? { priceFrom: 'asc' } : { ratingAvg: 'desc' };

  const [items, total] = await Promise.all([
    prisma.providerProfile.findMany({
      where,
      orderBy,
      skip: (opts.page - 1) * opts.perPage,
      take: opts.perPage,
      include: {
        user: { select: { id: true, name: true, avatarHue: true, city: true, neighborhood: true } },
        categories: { include: { category: true } },
      },
    }),
    prisma.providerProfile.count({ where }),
  ]);

  return { items: items.map(serializeProvider), total, page: opts.page, perPage: opts.perPage };
}

export async function getProviderById(id: string) {
  const provider = await prisma.providerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, avatarHue: true, city: true, neighborhood: true } },
      categories: { include: { category: true } },
      services: true,
      portfolio: true,
    },
  });
  if (!provider) throw NotFound('Profissional não encontrado');
  return serializeProvider(provider);
}

type ProviderRow = Prisma.ProviderProfileGetPayload<{
  include: {
    user: { select: { id: true; name: true; avatarHue: true; city: true; neighborhood: true } };
    categories: { include: { category: true } };
  };
}> & {
  services?: Prisma.ProviderServiceGetPayload<true>[];
  portfolio?: Prisma.PortfolioItemGetPayload<true>[];
};

function serializeProvider(p: ProviderRow) {
  return {
    id: p.id,
    userId: p.userId,
    name: p.user.name,
    avatarHue: p.user.avatarHue,
    city: p.user.city,
    neighborhood: p.user.neighborhood,
    bio: p.bio,
    yearsExp: p.yearsExp,
    jobsDone: p.jobsDone,
    rating: p.ratingAvg,
    reviews: p.ratingCount,
    verified: p.kycStatus === 'VERIFIED',
    available: p.available,
    priceFrom: p.priceFrom,
    categories: p.categories.map((c) => c.category),
    services: p.services,
    portfolio: p.portfolio,
  };
}
