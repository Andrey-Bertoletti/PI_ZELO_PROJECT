import { prisma } from '../config/prisma';
import { publicUserSelect } from './auth.service';
import { hashPassword, validatePasswordStrength, verifyPassword } from '../utils/password';
import { BadRequest, NotFound, Unauthorized } from '../utils/errors';
import crypto from 'crypto';

interface UpdateProfileInput {
  name?: string;
  phone?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  avatarHue?: number;
}

export async function updateOwnProfile(userId: string, input: UpdateProfileInput) {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined)         data.name         = input.name;
  if (input.phone !== undefined)        data.phone        = input.phone || null;
  if (input.city !== undefined)         data.city         = input.city || null;
  if (input.neighborhood !== undefined) data.neighborhood = input.neighborhood || null;
  if (input.avatarHue !== undefined)    data.avatarHue    = input.avatarHue;

  if (Object.keys(data).length === 0) {
    throw BadRequest('Nenhum campo enviado para atualização');
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: publicUserSelect,
  });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const strength = validatePasswordStrength(newPassword);
  if (!strength.ok) throw BadRequest(strength.reason!);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw NotFound('Usuário não encontrado');

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) throw Unauthorized('Senha atual incorreta');

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

const RESET_TOKEN_TTL_MIN = 30;

export async function requestPasswordReset(email: string): Promise<{ token: string | null }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { token: null };

  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetTokenHash: hash,
      passwordResetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MIN * 60_000),
    },
  });

  return { token: raw };
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const strength = validatePasswordStrength(newPassword);
  if (!strength.ok) throw BadRequest(strength.reason!);

  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({
    where: {
      passwordResetTokenHash: hash,
      passwordResetExpiresAt: { gt: new Date() },
    },
  });
  if (!user) throw BadRequest('Token inválido ou expirado');

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetTokenHash: null, passwordResetExpiresAt: null, failedLogins: 0, lockedUntil: null },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}
