import { prisma } from '../config/prisma';
import { Forbidden, NotFound } from '../utils/errors';

export async function sendMessage(
  senderId: string,
  input: { receiverId: string; bookingId?: string; content: string },
) {
  if (input.receiverId === senderId) throw Forbidden('Não é possível enviar mensagem para você mesmo');

  const receiver = await prisma.user.findUnique({ where: { id: input.receiverId } });
  if (!receiver) throw NotFound('Destinatário não encontrado');

  if (input.bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
      include: { provider: true },
    });
    if (!booking) throw NotFound('Agendamento não encontrado');
    const participants = [booking.clientId, booking.provider.userId];
    if (!participants.includes(senderId) || !participants.includes(input.receiverId)) {
      throw Forbidden('Você não participa deste agendamento');
    }
  }

  return prisma.message.create({
    data: {
      senderId,
      receiverId: input.receiverId,
      bookingId: input.bookingId,
      content: input.content,
    },
  });
}

export async function listThread(userId: string, otherUserId: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });
}

export async function listConversations(userId: string) {
  const rows = await prisma.$queryRaw<Array<{
    other_id: string;
    last_at: Date;
    last_content: string;
    unread: bigint;
  }>>`
    SELECT
      CASE WHEN "senderId" = ${userId}::uuid THEN "receiverId" ELSE "senderId" END AS other_id,
      MAX("createdAt") AS last_at,
      (ARRAY_AGG(content ORDER BY "createdAt" DESC))[1] AS last_content,
      SUM(CASE WHEN "receiverId" = ${userId}::uuid AND "readAt" IS NULL THEN 1 ELSE 0 END) AS unread
    FROM "Message"
    WHERE "senderId" = ${userId}::uuid OR "receiverId" = ${userId}::uuid
    GROUP BY other_id
    ORDER BY last_at DESC
    LIMIT 50;
  `;

  const otherIds = rows.map((r) => r.other_id);
  const users = await prisma.user.findMany({
    where: { id: { in: otherIds } },
    select: { id: true, name: true, avatarHue: true, role: true },
  });
  const map = new Map(users.map((u) => [u.id, u]));

  return rows.map((r) => ({
    user: map.get(r.other_id),
    lastAt: r.last_at,
    lastContent: r.last_content,
    unread: Number(r.unread),
  }));
}

export async function markAsRead(userId: string, otherUserId: string) {
  await prisma.message.updateMany({
    where: { senderId: otherUserId, receiverId: userId, readAt: null },
    data: { readAt: new Date() },
  });
}
