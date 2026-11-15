import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

/** AES-256-GCM for hub secrets at rest (TOTP seed). Key = sha256(HUB_ENC_KEY). Output: v1.<iv>.<tag>.<data> (base64url). */
function key(): Buffer {
  const raw = process.env.HUB_ENC_KEY;
  if (!raw || raw.length < 32) throw new Error('HUB_ENC_KEY is not set (32+ chars)');
  return createHash('sha256').update(raw).digest();
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return ['v1', iv.toString('base64url'), c.getAuthTag().toString('base64url'), data.toString('base64url')].join('.');
}

export function decrypt(box: string): string {
  const [v, iv, tag, data] = box.split('.');
  if (v !== 'v1' || !iv || !tag || !data) throw new Error('bad ciphertext');
  const d = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64url'));
  d.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([d.update(Buffer.from(data, 'base64url')), d.final()]).toString('utf8');
}
