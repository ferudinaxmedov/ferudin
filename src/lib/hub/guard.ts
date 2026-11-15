import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase';
import { SESSION_COOKIE, verifyToken } from './session';

/** Server components and server actions call this first; the proxy check alone is not enough for actions. */
export async function requireHub(): Promise<void> {
  const jar = await cookies();
  if (!verifyToken(jar.get(SESSION_COOKIE)?.value, 'session')) redirect('/my/login');
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
}

export async function audit(action: string, details?: Record<string, unknown>): Promise<void> {
  await createServiceClient().from('my_audit').insert({ action, ip: await clientIp(), details: details ?? null });
}
