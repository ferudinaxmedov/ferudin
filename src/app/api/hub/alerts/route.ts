import { timingSafeEqual } from 'node:crypto';
import { runDigest, runTick, sendTelegram } from '@/lib/hub/alerts';
import { runMonitor } from '@/lib/hub/monitor';
import { migrateLegacySecrets } from '@/lib/hub/secrets';
import { createServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Called by pg_cron in the DentaFlow Supabase (pg_net) with a Bearer token, see authorized().
// Body: { "mode": "tick" | "digest" | "test" | "monitor" | "migrate-secrets" }.

// pg_cron sends the Vault secret 'hub_cron_secret' (generated inside the DB, never leaves it);
// my_cron_check() compares it server-side. HUB_CRON_SECRET env stays as a manual/test key.
async function authorized(req: Request) {
  const got = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (got.length < 32 || got.length > 200) return false;
  const env = process.env.HUB_CRON_SECRET;
  if (env && env.length >= 32) {
    const a = Buffer.from(got);
    const b = Buffer.from(env);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  const { data } = await createServiceClient().rpc('my_cron_check', { token: got });
  return data === true;
}

export async function POST(req: Request) {
  if (!(await authorized(req))) return Response.json({ ok: false }, { status: 401 });
  let mode = 'tick';
  try {
    mode = ((await req.json()) as { mode?: string }).mode ?? 'tick';
  } catch { /* empty body = tick */ }

  const result =
    mode === 'digest' ? await runDigest()
    : mode === 'test' ? await sendTelegram('✅ <b>my.ferudin.uz</b> ogohlantirish boti ulandi. Muammo yoki yangi buyurtma bo‘lsa shu yerga yozaman, har kuni 09:00 da qisqa hisobot keladi.')
    : mode === 'monitor' ? await runMonitor()
    : mode === 'migrate-secrets' ? { ok: true, ...(await migrateLegacySecrets()) }
    : await runTick();
  return Response.json(result, { status: result.ok ? 200 : 500 });
}
