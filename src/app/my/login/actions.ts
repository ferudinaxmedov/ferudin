'use server';

import { createHash, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { createServiceClient } from '@/lib/supabase';
import { audit, clientIp } from '@/lib/hub/guard';
import { decrypt, encrypt } from '@/lib/hub/crypto';
import { newTotpSecret, otpauthUrl, verifyTotp } from '@/lib/hub/totp';
import {
  ENROLL_COOKIE, SESSION_COOKIE, SESSION_TTL_MS, STEP_COOKIE, STEP_TTL_MS, cookieOptions, issueToken, verifyToken,
} from '@/lib/hub/session';

export type LoginState =
  | { stage: 'password'; error?: string }
  | { stage: 'totp'; error?: string }
  | { stage: 'enroll'; qr: string; secret: string; error?: string };

const MAX_FAILS = 6;
const WINDOW_MS = 15 * 60 * 1000;

const db = () => createServiceClient();

async function tooManyFails(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count } = await db().from('my_login_attempts').select('id', { count: 'exact', head: true })
    .eq('ip', ip).eq('ok', false).gte('at', since);
  return (count ?? 0) >= MAX_FAILS;
}

async function record(ip: string, stage: string, ok: boolean) {
  await db().from('my_login_attempts').insert({ ip, stage, ok });
}

function passwordMatches(input: string): boolean {
  const want = process.env.HUB_PASSWORD || process.env.WORKSPACE_PASSWORD;
  if (!want || !input) return false;
  const a = createHash('sha256').update(input).digest();
  const b = createHash('sha256').update(want).digest();
  return timingSafeEqual(a, b);
}

async function storedSecret(): Promise<string | null> {
  const { data } = await db().from('my_settings').select('totp_secret_enc').eq('id', 1).maybeSingle();
  return data?.totp_secret_enc ? decrypt(data.totp_secret_enc) : null;
}

const LOCKED = "Juda ko'p noto'g'ri urinish. 15 daqiqadan keyin qayta urinib ko'ring.";

/** One action for both steps so the client keeps a single state (the QR survives a wrong code). */
export async function loginStep(prev: LoginState, form: FormData): Promise<LoginState> {
  return form.get('step') === 'code' ? submitCode(prev, form) : submitPassword(prev, form);
}

async function submitPassword(_: LoginState, form: FormData): Promise<LoginState> {
  const ip = await clientIp();
  if (await tooManyFails(ip)) return { stage: 'password', error: LOCKED };

  if (!passwordMatches(String(form.get('password') ?? ''))) {
    await record(ip, 'password', false);
    return { stage: 'password', error: "Parol noto'g'ri" };
  }
  await record(ip, 'password', true);

  const jar = await cookies();
  jar.set(STEP_COOKIE, issueToken('step', STEP_TTL_MS), cookieOptions(STEP_TTL_MS));

  if (await storedSecret()) return { stage: 'totp' };

  // First login: enrol an authenticator. The pending seed lives only in an encrypted, short-lived cookie.
  const secret = newTotpSecret();
  jar.set(ENROLL_COOKIE, encrypt(secret), cookieOptions(STEP_TTL_MS));
  const qr = await QRCode.toDataURL(otpauthUrl(secret), { margin: 1, width: 220, color: { dark: '#0A0C10', light: '#FFFFFF' } });
  return { stage: 'enroll', qr, secret };
}

async function submitCode(prev: LoginState, form: FormData): Promise<LoginState> {
  const ip = await clientIp();
  const jar = await cookies();
  if (!verifyToken(jar.get(STEP_COOKIE)?.value, 'step')) return { stage: 'password', error: 'Vaqt tugadi, parolni qayta kiriting' };
  if (await tooManyFails(ip)) return { ...prev, error: LOCKED };

  const code = String(form.get('code') ?? '');
  const existing = await storedSecret();
  let ok = false;

  if (existing) {
    ok = verifyTotp(existing, code);
  } else {
    const pending = jar.get(ENROLL_COOKIE)?.value;
    if (!pending) return { stage: 'password', error: 'Vaqt tugadi, parolni qayta kiriting' };
    const secret = decrypt(pending);
    ok = verifyTotp(secret, code);
    if (ok) {
      await db().from('my_settings').update({ totp_secret_enc: encrypt(secret), updated_at: new Date().toISOString() }).eq('id', 1);
      await audit('totp_enrolled');
    }
  }

  await record(ip, 'totp', ok);
  if (!ok) return { ...prev, error: "Kod noto'g'ri yoki eskirgan" };

  jar.delete(STEP_COOKIE);
  jar.delete(ENROLL_COOKIE);
  jar.set(SESSION_COOKIE, issueToken('session', SESSION_TTL_MS), cookieOptions(SESSION_TTL_MS));
  await audit('login');

  const from = String(form.get('from') ?? '');
  redirect(from.startsWith('/my') ? from : '/my');
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect('/my/login');
}
