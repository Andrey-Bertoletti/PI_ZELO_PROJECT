import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { BadRequest, Forbidden, NotFound } from '../utils/errors';

interface CreatePaymentInput {
  bookingId: string;
  method: 'pix' | 'card';
}

export async function createPaymentForBooking(userId: string, input: CreatePaymentInput) {
  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { payment: true, provider: true },
  });
  if (!booking) throw NotFound('Agendamento não encontrado');
  if (booking.clientId !== userId) throw Forbidden('Apenas o contratante pode pagar');
  if (!['COMPLETED', 'IN_PROGRESS', 'ACCEPTED'].includes(booking.status)) {
    throw BadRequest('Este agendamento ainda não está pronto para pagamento');
  }
  const amount = booking.priceFinal ?? booking.priceEstimate;
  if (!amount || amount <= 0) throw BadRequest('Valor do agendamento ainda não definido');

  if (booking.payment) {
    if (booking.payment.status === 'PAID') {
      throw BadRequest('Pagamento já efetuado');
    }
    // Reaproveita o registro existente caso seja PENDING/FAILED
    return prisma.payment.update({
      where: { id: booking.payment.id },
      data: {
        amount,
        method: input.method,
        status: 'PENDING',
        externalId: pseudoExternalId(input.method),
      },
    });
  }

  return prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount,
      currency: 'BRL',
      method: input.method,
      status: 'PENDING',
      externalId: pseudoExternalId(input.method),
    },
  });
}

export async function confirmPayment(userId: string, bookingId: string) {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: { booking: true },
  });
  if (!payment) throw NotFound('Pagamento não encontrado');
  if (payment.booking.clientId !== userId) throw Forbidden('Acesso negado');
  if (payment.status === 'PAID') return payment;

  return prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'PAID' },
  });
}

export async function getPaymentByBooking(userId: string, bookingId: string) {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: { booking: true },
  });
  if (!payment) return null;
  if (payment.booking.clientId !== userId) {
    const isProvider = await prisma.providerProfile.findFirst({
      where: { id: payment.booking.providerId, userId },
    });
    if (!isProvider) throw Forbidden('Acesso negado');
  }
  return payment;
}

function pseudoExternalId(method: string) {
  return `${method}_${crypto.randomBytes(8).toString('hex')}`;
}

/** PIX copia-e-cola simulado. Em produção viria do gateway. */
export function buildPixPayload(amount: number, externalId: string) {
  const payload = `00020126${externalId}5204000053039865802BR5910ZERO LTDA6009Sao Paulo62070503${externalId}6304`;
  return {
    qrCode: payload,
    qrCopyPaste: payload,
    expiresInSec: 600,
    amount,
    currency: 'BRL',
  };
}
