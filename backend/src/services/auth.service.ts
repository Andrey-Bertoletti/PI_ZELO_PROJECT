import { prisma } from '../config/prisma';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/password';
import { generateRefreshToken, hashRefreshToken, parseDurationToMs, signAccessToken } from '../utils/tokens';
import { env } from '../config/env';
import { BadRequest, Conflict, Forbidden, Unauthorized } from '../utils/errors';
import type { Role } from '@prisma/client';

const MAX_FAILED_LOGINS = 6;
const LOCK_MINUTES = 15;

interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'CLIENT' | 'PROVIDER';
  city?: string;
  neighborhood?: string;
}

export async function registerUser(input: RegisterInput) {
  const strength = validatePasswordStrength(input.password);
  if (!strength.ok) throw BadRequest(strength.reason!);

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw Conflict('E-mail já cadastrado');

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: input.role as Role,
      city: input.city,
      neighborhood: input.neighborhood,
      avatarHue: Math.floor(Math.random() * 360),
      ...(input.role === 'PROVIDER' && {
        providerProfile: { create: {} },
      }),
    },
    select: publicUserSelect,
  });

  return user;
}

export async function authenticateUser(email: string, password: string, meta: { ip?: string; ua?: string }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Unauthorized('Credenciais inválidas');

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw Forbidden('Conta bloqueada temporariamente. Tente novamente em alguns minutos.');
  }
  if (!user.isActive) throw Forbidden('Conta desativada');

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    const failed = user.failedLogins + 1;
    const shouldLock = failed >= MAX_FAILED_LOGINS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLogins: shouldLock ? 0 : failed,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCK_MINUTES * 60_000) : user.lockedUntil,
      },
    });
    throw Unauthorized('Credenciais inválidas');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLogins: 0, lockedUntil: null },
  });

  return issueTokens(user.id, user.role, user.email, meta);
}

export async function issueTokens(
  userId: string,
  role: Role,
  email: string,
  meta: { ip?: string; ua?: string },
) {
  const accessToken = signAccessToken({ sub: userId, role, email });

  const { token: refreshToken, hash } = generateRefreshToken();
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({
    data: { userId, tokenHash: hash, expiresAt, ip: meta.ip, userAgent: meta.ua },
  });

  return { accessToken, refreshToken, expiresAt };
}

export async function rotateRefreshToken(rawToken: string, meta: { ip?: string; ua?: string }) {
  const tokenHash = hashRefreshToken(rawToken);
  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    if (record && !record.revokedAt) {
      // Reuso ou expirado — revoga toda a árvore por segurança
      await prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    throw Unauthorized('Refresh token inválido ou expirado');
  }

  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  });

  return issueTokens(record.userId, record.user.role, record.user.email, meta);
}

export async function revokeRefreshToken(rawToken: string) {
  const tokenHash = hashRefreshToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export const publicUserSelect = {
  id: true,
  email: true,
  phone: true,
  name: true,
  role: true,
  avatarHue: true,
  city: true,
  neighborhood: true,
  emailVerified: true,
  createdAt: true,
} as const;
