import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

/** RFC 6238 TOTP (SHA-1, 6 digits, 30 s), compatible with Google Authenticator, 2FAS, Authy, Bitwarden. */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Buffer): string {
  let bits = 0, value = 0, out = '';
  for (const byte of buf) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { out += ALPHABET[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(s: string): Buffer {
  const clean = s.replace(/=+$/, '').replace(/\s+/g, '').toUpperCase();
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const i = ALPHABET.indexOf(ch);
    if (i < 0) throw new Error('bad base32');
    value = (value << 5) | i; bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

export function newTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

function codeAt(secret: Buffer, counter: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac('sha1', secret).update(msg).digest();
  const off = h[h.length - 1] & 15;
  const n = ((h[off] & 127) << 24) | (h[off + 1] << 16) | (h[off + 2] << 8) | h[off + 3];
  return String(n % 1_000_000).padStart(6, '0');
}

/** Accepts the current 30 s step and one step either side (clock drift). */
export function verifyTotp(secretB32: string, code: string): boolean {
  const clean = code.replace(/\D/g, '');
  if (clean.length !== 6) return false;
  const key = base32Decode(secretB32);
  const step = Math.floor(Date.now() / 30_000);
  for (const d of [-1, 0, 1]) {
    const want = Buffer.from(codeAt(key, step + d));
    if (timingSafeEqual(want, Buffer.from(clean))) return true;
  }
  return false;
}

export function otpauthUrl(secretB32: string): string {
  const label = encodeURIComponent('my.ferudin.uz:Ferudin');
  return `otpauth://totp/${label}?secret=${secretB32}&issuer=${encodeURIComponent('my.ferudin.uz')}&algorithm=SHA1&digits=6&period=30`;
}
