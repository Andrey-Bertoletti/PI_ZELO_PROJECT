import { BookingStatus, Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { BadRequest, Forbidden, NotFound } from '../utils/errors';

interface CreateBookingInput {
  clientId: string;
  providerId: string;
  categoryId: string;
  title: string;
  description?: string;
  address: string;
  scheduledAt?: string;
  urgency: 'EMERGENCY' | 'TODAY' | 'THIS_WEEK' | 'FLEXIBLE';
  priceEstimate?: number;
}

export async function createBooking(input: CreateBookingInput) {
  const [provider, category] = await Promise.all([
    prisma.providerProfile.findUnique({ where: { id: input.providerId } }),
    prisma.category.findUnique({ where: { id: input.categoryId } }),
  ]);
  if (!provider) throw NotFound('Profissional não encontrado');
  if (!category) throw NotFound('Categoria não encontrada');
  if (!provider.available) throw BadRequest('Profissional indisponível no momento');

  return prisma.booking.create({
    data: {
      clientId: input.clientId,
      providerId: input.providerId,
      categoryId: input.categoryId,
      title: input.title,
      description: input.description,
      address: input.address,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      urgency: input.urgency,
      priceEstimate: input.priceEstimate,
    },
  });
}

export async function listUserBookings(userId: string, role: Role) {
  const where =
    role === 'PROVIDER'
      ? { provider: { userId } }
      : { clientId: userId };

  return prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      provider: { include: { user: { select: { id: true, name: true, avatarHue: true } } } },
      client: { select: { id: true, name: true, avatarHue: true } },
      category: true,
      review: true,
    },
  });
}

export async function updateBookingStatus(
  bookingId: string,
  userId: string,
  role: Role,
  status: 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
  priceFinal?: number,
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { provider: true },
  });
  if (!booking) throw NotFound('Agendamento não encontrado');

  const isClient   = booking.clientId === userId;
  const isProvider = booking.provider.userId === userId;
  if (!isClient && !isProvider && role !== 'ADMIN') {
    throw Forbidden('Você não tem acesso a este agendamento');
  }

  const allowedByRole: Record<string, BookingStatus[]> = {
    PROVIDER: ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    CLIENT:   ['CANCELLED'],
    ADMIN:    ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  };

  const list = allowedByRole[role] ?? [];
  if (!list.includes(status as BookingStatus)) {
    throw Forbidden('Você não pode aplicar essa transição');
  }

  const completedAt = status === 'COMPLETED' ? new Date() : booking.completedAt;

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status, priceFinal, completedAt },
  });

  if (status === 'COMPLETED') {
    await prisma.providerProfile.update({
      where: { id: booking.providerId },
      data: { jobsDone: { increment: 1 } },
    });
  }

  return updated;
}

export async function getBookingById(id: string, userId: string, role: Role) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      provider: { include: { user: { select: { id: true, name: true, avatarHue: true } } } },
      client:   { select: { id: true, name: true, avatarHue: true } },
      category: true,
      review:   true,
      payment:  true,
    },
  });
  if (!booking) throw NotFound('Agendamento não encontrado');
  if (booking.clientId !== userId && booking.provider.userId !== userId && role !== 'ADMIN') {
    throw Forbidden('Acesso negado');
  }
  return booking;
}
