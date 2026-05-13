import bcrypt from 'bcryptjs';
import { env } from '../config/env';

const MIN_LENGTH = 8;

export function validatePasswordStrength(password: string): { ok: boolean; reason?: string } {
  if (password.length < MIN_LENGTH) return { ok: false, reason: `A senha deve ter no mínimo ${MIN_LENGTH} caracteres.` };
  if (!/[A-Z]/.test(password))      return { ok: false, reason: 'A senha deve conter ao menos uma letra maiúscula.' };
  if (!/[a-z]/.test(password))      return { ok: false, reason: 'A senha deve conter ao menos uma letra minúscula.' };
  if (!/[0-9]/.test(password))      return { ok: false, reason: 'A senha deve conter ao menos um número.' };
  return { ok: true };
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
