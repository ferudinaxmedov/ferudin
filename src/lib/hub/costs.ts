import { createServiceClient } from '@/lib/supabase';

/**
 * Real provider bills pulled from their own APIs (hub F5). Today: Anthropic, through the Usage and Cost
 * Analytics API (GET /v1/organizations/analytics/cost). Needs an Admin API key (sk-ant-admin…) in
 * ANTHROPIC_ADMIN_KEY — a normal API key is rejected. Data lands 4–24 h late, so this is "billed so far",
 * not today's spend. Synced from the alert tick at most every 6 hours into my_costs.
 */

const EVERY_MS = 6 * 3_600_000;

function monthStartUtc() {
  const t = new Date(Date.now() + 5 * 3_600_000);
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), 1));
}

async function anthropicMonthUsd(): Promise<{ usd: number; refreshed: string | null } | { error: string }> {
  const key = process.env.ANTHROPIC_ADMIN_KEY;
  if (!key) return { error: 'ANTHROPIC_ADMIN_KEY yo‘q' };
  const params = new URLSearchParams({ starting_at: monthStartUtc().toISOString(), limit: '1000' });
  let usdCents = 0;
  let refreshed: string | null = null;
  let page: string | null = null;
  for (let i = 0; i < 10; i++) {
    if (page) params.set('page', page);
    const res = await fetch(`https://api.anthropic.com/v1/organizations/analytics/cost?${params}`, {
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-beta': 'analytics-usage-cost-2026-08-24' },
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return { error: `Anthropic ${res.status}` };
    const body = (await res.json()) as { data?: { amount?: string }[]; has_more?: boolean; next_page?: string | null; data_refreshed_at?: string | null };
    for (const row of body.data ?? []) usdCents += Number(row.amount) || 0;
    refreshed = body.data_refreshed_at ?? refreshed;
    if (!body.has_more || !body.next_page) break;
    page = body.next_page;
  }
  return { usd: usdCents / 100, refreshed };
}

export async function syncCosts(force = false) {
  if (!process.env.ANTHROPIC_ADMIN_KEY) return { ok: true, skipped: 'no admin key' };
  const db = createServiceClient();
  const month = monthStartUtc().toISOString().slice(0, 10);
  if (!force) {
    const { data } = await db.from('my_costs').select('synced_at').eq('provider', 'anthropic').eq('month', month).maybeSingle();
    if (data && Date.now() - Date.parse(data.synced_at) < EVERY_MS) return { ok: true, skipped: 'fresh' };
  }
  const r = await anthropicMonthUsd();
  if ('error' in r) return { ok: false, reason: r.error };
  await db.from('my_costs').upsert({ provider: 'anthropic', month, usd: r.usd, refreshed_at: r.refreshed, synced_at: new Date().toISOString() });
  return { ok: true, usd: r.usd };
}

export type ProviderCost = { provider: string; usd: number; refreshed_at: string | null };

export async function monthCosts(): Promise<ProviderCost[]> {
  const { data } = await createServiceClient().from('my_costs').select('provider, usd, refreshed_at').eq('month', monthStartUtc().toISOString().slice(0, 10));
  return (data ?? []).map((r) => ({ provider: r.provider, usd: Number(r.usd), refreshed_at: r.refreshed_at }));
}
