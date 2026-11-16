import { timingSafeEqual } from 'node:crypto';
import { runDigest, runTick, sendTelegram } from '@/lib/hub/alerts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Called by pg_cron in the DentaFlow Supabase (pg_net), Bearer HUB_CRON_SECRET (stored in Supabase Vault).
// Body: { "mode": "tick" | "digest" | "test" }.

function authorized(req: Request) {
  const token = process.env.HUB_CRON_SECRET;
  if (!token || token.length < 32) return false;
  const a = Buffer.from((req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, ''));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ ok: false }, { status: 401 });
  let mode = 'tick';
  try {
    mode = ((await req.json()) as { mode?: string }).mode ?? 'tick';
  } catch { /* empty body = tick */ }

  const result =
    mode === 'digest' ? await runDigest()
    : mode === 'test' ? await sendTelegram('✅ <b>my.ferudin.uz</b> ogohlantirish boti ulandi. Muammo yoki yangi buyurtma bo‘lsa shu yerga yozaman, har kuni 09:00 da qisqa hisobot keladi.')
    : await runTick();
  return Response.json(result, { status: result.ok ? 200 : 500 });
}
