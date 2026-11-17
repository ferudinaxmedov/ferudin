import { timingSafeEqual } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Loyihalar (Hongsam hodisalari, SkyPlus Claude sarfi) hubga hodisa yuboradi: POST, Authorization: Bearer <token>.
// Ism, telefon, manzil qabul qilinmaydi: faqat tur, summa va bir nechta qisqa belgilar.

const SOURCES: Record<string, { tokenEnv: string; kinds: string[]; keys: string[] }> = {
  hongsam: {
    tokenEnv: 'HONGSAM_HUB_TOKEN',
    kinds: ['order', 'guide', 'start', 'search'],
    keys: ['id', 'qty', 'region', 'via', 'lang', 'contact', 'from', 'model', 'input', 'output', 'cache_read', 'cache_write'],
  },
  // SkyPlus CRM: one "ai" event per Claude call (tokens only), so the hub can price SkyPlus's Claude spend.
  skyplus: {
    tokenEnv: 'SKYPLUS_HUB_TOKEN',
    kinds: ['ai'],
    keys: ['feature', 'model', 'input', 'output', 'cache_read', 'cache_write'],
  },
};

function ok(got: string, token: string | undefined) {
  if (!token || token.length < 32) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Keeps only allow-listed keys with flat, short values, so nothing personal or large slips in. */
function clean(meta: unknown, keys: string[]) {
  const out: Record<string, string | number | boolean> = {};
  if (!meta || typeof meta !== 'object') return out;
  for (const [k, v] of Object.entries(meta).slice(0, 20)) {
    if (!keys.includes(k)) continue;
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'string') out[k] = v.slice(0, 60);
  }
  return out;
}

export async function POST(req: Request) {
  let body: { project?: string; kind?: string; amount?: number; meta?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const src = SOURCES[body.project ?? ''];
  const got = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!src || !ok(got, process.env[src.tokenEnv])) return Response.json({ ok: false }, { status: 401 });
  if (!src.kinds.includes(body.kind ?? '')) return Response.json({ ok: false }, { status: 400 });

  const amount = typeof body.amount === 'number' && Number.isFinite(body.amount) ? body.amount : null;
  const { error } = await createServiceClient()
    .from('my_events')
    .insert({ project: body.project, kind: body.kind, amount, meta: clean(body.meta, src.keys) });
  if (error) return Response.json({ ok: false }, { status: 500 });
  return Response.json({ ok: true });
}
