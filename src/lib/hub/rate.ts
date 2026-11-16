import { createServiceClient } from '@/lib/supabase';

/**
 * USD → UZS rate from the Central Bank of Uzbekistan (cbu.uz): official, free, no key, set once a day.
 * The 15-minute alert tick calls syncUsdRate(); it only hits cbu.uz when the last check is older than 3 hours.
 * A manual rate (Obunalar page / Claude F4) stays until the next CBU sync overwrites it.
 */

const CBU_URL = 'https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/';
const EVERY_MS = 3 * 3_600_000;

type CbuRow = { Ccy: string; Rate: string; Date: string; Nominal?: string };

export async function fetchCbuUsd(): Promise<{ rate: number; date: string } | null> {
  try {
    const res = await fetch(CBU_URL, { signal: AbortSignal.timeout(8000), cache: 'no-store' });
    if (!res.ok) return null;
    const rows = (await res.json()) as CbuRow[];
    const usd = rows.find((r) => r.Ccy === 'USD');
    if (!usd) return null;
    const rate = Number(usd.Rate) / (Number(usd.Nominal) || 1);
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(usd.Date);
    if (!Number.isFinite(rate) || rate < 5_000 || rate > 50_000 || !m) return null; // sanity: never store garbage
    return { rate: Math.round(rate * 100) / 100, date: `${m[3]}-${m[2]}-${m[1]}` };
  } catch {
    return null;
  }
}

export async function syncUsdRate(force = false): Promise<{ ok: boolean; rate?: number; date?: string; skipped?: boolean }> {
  const db = createServiceClient();
  if (!force) {
    const { data } = await db.from('my_settings').select('usd_rate_checked_at').eq('id', 1).maybeSingle();
    const last = data?.usd_rate_checked_at ? Date.parse(data.usd_rate_checked_at) : 0;
    if (Date.now() - last < EVERY_MS) return { ok: true, skipped: true };
  }
  const cbu = await fetchCbuUsd();
  const now = new Date().toISOString();
  if (!cbu) {
    await db.from('my_settings').update({ usd_rate_checked_at: now }).eq('id', 1); // retry in 3 hours, keep the old rate
    return { ok: false };
  }
  await db.from('my_settings').update({
    usd_rate: cbu.rate, usd_rate_date: cbu.date, usd_rate_source: 'cbu', usd_rate_checked_at: now, updated_at: now,
  }).eq('id', 1);
  return { ok: true, ...cbu };
}
