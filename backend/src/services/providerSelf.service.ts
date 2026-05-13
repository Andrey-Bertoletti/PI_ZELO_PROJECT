import { prisma } from '../config/prisma';
import { BadRequest, Forbidden, NotFound } from '../utils/errors';

async function ensureProviderProfile(userId: string) {
  const profile = await prisma.providerProfile.findUnique({ where: { userId } });
  if (!profile) throw Forbidden('Apenas profissionais podem acessar este recurso');
  return profile;
}

interface UpdateProfileInput {
  bio?: string | null;
  yearsExp?: number;
  priceFrom?: number;
  available?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  categoryIds?: string[];
}

export async function getMyProviderProfile(userId: string) {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
    include: {
      categories: { include: { category: true } },
      services: { orderBy: { createdAt: 'asc' } },
      portfolio: true,
    },
  });
  if (!profile) throw NotFound('Perfil profissional não encontrado');
  return profile;
}

export async function updateMyProviderProfile(userId: string, input: UpdateProfileInput) {
  const profile = await ensureProviderProfile(userId);

  const data: Record<string, unknown> = {};
  if (input.bio !== undefined)       data.bio       = input.bio || null;
  if (input.yearsExp !== undefined)  data.yearsExp  = input.yearsExp;
  if (input.priceFrom !== undefined) data.priceFrom = input.priceFrom;
  if (input.available !== undefined) data.available = input.available;
  if (input.latitude !== undefined)  data.latitude  = input.latitude;
  if (input.longitude !== undefined) data.longitude = input.longitude;

  if (input.categoryIds) {
    await prisma.providerCategory.deleteMany({ where: { providerId: profile.id } });
    if (input.categoryIds.length > 0) {
      await prisma.providerCategory.createMany({
        data: input.categoryIds.map((categoryId) => ({ providerId: profile.id, categoryId })),
      });
    }
  }

  if (Object.keys(data).length === 0 && !input.categoryIds) {
    throw BadRequest('Nenhum campo enviado para atualização');
  }

  return prisma.providerProfile.update({
    where: { id: profile.id },
    data,
    include: {
      categories: { include: { category: true } },
      services: { orderBy: { createdAt: 'asc' } },
    },
  });
}

interface ServiceInput {
  title: string;
  description?: string;
  categoryId: string;
  priceMin: number;
  priceMax?: number;
  unit?: string;
}

export async function createService(userId: string, input: ServiceInput) {
  const profile = await ensureProviderProfile(userId);
  return prisma.providerService.create({
    data: {
      providerId: profile.id,
      categoryId: input.categoryId,
      title: input.title,
      description: input.description,
      priceMin: input.priceMin,
      priceMax: input.priceMax,
      unit: input.unit ?? 'servico',
    },
  });
}

export async function updateService(userId: string, serviceId: string, input: Partial<ServiceInput>) {
  const profile = await ensureProviderProfile(userId);
  const existing = await prisma.providerService.findUnique({ where: { id: serviceId } });
  if (!existing || existing.providerId !== profile.id) throw NotFound('Serviço não encontrado');

  const data: Record<string, unknown> = {};
  if (input.title !== undefined)       data.title       = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.categoryId !== undefined)  data.categoryId  = input.categoryId;
  if (input.priceMin !== undefined)    data.priceMin    = input.priceMin;
  if (input.priceMax !== undefined)    data.priceMax    = input.priceMax;
  if (input.unit !== undefined)        data.unit        = input.unit;

  return prisma.providerService.update({ where: { id: serviceId }, data });
}

export async function deleteService(userId: string, serviceId: string) {
  const profile = await ensureProviderProfile(userId);
  const existing = await prisma.providerService.findUnique({ where: { id: serviceId } });
  if (!existing || existing.providerId !== profile.id) throw NotFound('Serviço não encontrado');
  await prisma.providerService.delete({ where: { id: serviceId } });
}
