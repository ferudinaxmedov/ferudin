import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Signed, expiring tokens for the owner's hub (my.ferudin.uz).
 * Format: `<purpose>.<expMs>.<nonce>.<hmac>`; HMAC-SHA256 with HUB_SESSION_SECRET.
 * Rotating HUB_SESSION_SECRET logs out every device at once.
 */
export const SESSION_COOKIE = 'hub_s';
export const STEP_COOKIE = 'hub_pw';
export const ENROLL_COOKIE = 'hub_enroll';

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const STEP_TTL_MS = 5 * 60 * 1000;

type Purpose = 'session' | 'step';

function secret(): string | null {
  const s = process.env.HUB_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

function sign(body: string, key: string): string {
  return createHmac('sha256', key).update(body).digest('base64url');
}

export function issueToken(purpose: Purpose, ttlMs: number): string {
  const key = secret();
  if (!key) throw new Error('HUB_SESSION_SECRET is not set (32+ chars)');
  const body = `${purpose}.${Date.now() + ttlMs}.${randomBytes(12).toString('base64url')}`;
  return `${body}.${sign(body, key)}`;
}

/** True when the token is ours, for this purpose, and not expired. Fails closed without a secret. */
export function verifyToken(token: string | undefined, purpose: Purpose): boolean {
  const key = secret();
  if (!key || !token) return false;
  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== purpose) return false;
  const body = parts.slice(0, 3).join('.');
  const got = Buffer.from(parts[3]);
  const want = Buffer.from(sign(body, key));
  if (got.length !== want.length || !timingSafeEqual(got, want)) return false;
  return Number(parts[1]) > Date.now();
}

export function cookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}
