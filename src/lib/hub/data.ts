import { createServiceClient } from '@/lib/supabase';

export type Sub = {
  id: string; name: string; vendor: string | null; kind: 'fixed' | 'usage';
  amount: number | null; currency: 'USD' | 'UZS'; period: 'month' | 'year';
  next_charge: string | null; project: string; url: string | null; notes: string | null; active: boolean;
};

/** Shape of DentaFlow's /api/hub/stats. */
export type DentaflowStats = {
  generatedAt: string;
  clinics: { total: number; paying: number; trial: number; stopped: number; newThisMonth: number; plans: { plan: string; count: number }[] };
  revenue: { mrr: number; month: number; total: number; pendingCount: number; pendingAmount: number; trend: { label: string; key?: string; amount: number }[] };
  costs: {
    usdRate: number; budget: number; total: { today: number; month: number; prev: number };
    providers: { provider: string; month: number; prev: number; units: number; unitLabel: string; estimate: boolean }[];
    daily: { day: string; som: number }[];
    features: { provider: string; feature: string; count: number; som: number }[];
  };
  health: null | {
    lateCrons: string[]; cronCount: number; botStale: boolean; botLastAt: string | null;
    eskizBalance: number | null; eskizLow: boolean; issues7d: number; missingEnv: string[]; dbMs: number;
  };
};

export type Fetched<T> = { ok: true; data: T } | { ok: false; reason: string };

export async function getSettings(): Promise<{ usdRate: number }> {
  const { data } = await createServiceClient().from('my_settings').select('usd_rate').eq('id', 1).maybeSingle();
  return { usdRate: Number(data?.usd_rate) || 12_800 };
}

export async function getSubs(): Promise<Sub[]> {
  const { data } = await createServiceClient().from('my_subscriptions').select('*').order('project').order('name');
  return (data ?? []) as Sub[];
}

/** One subscription in so'm per month; null while the price is not entered. */
export function monthlySom(s: Sub, usdRate: number): number | null {
  if (s.amount === null || s.amount === undefined) return null;
  const som = s.currency === 'USD' ? Number(s.amount) * usdRate : Number(s.amount);
  return s.period === 'year' ? som / 12 : som;
}

export async function getDentaflow(): Promise<Fetched<DentaflowStats>> {
  const token = process.env.DENTAFLOW_HUB_TOKEN;
  if (!token) return { ok: false, reason: "DENTAFLOW_HUB_TOKEN o'rnatilmagan" };
  const url = process.env.DENTAFLOW_STATS_URL ?? 'https://dentaflow.uz/api/hub/stats';
  try {
    const res = await fetch(url, { headers: { authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return { ok: false, reason: `DentaFlow javobi: ${res.status}` };
    return { ok: true, data: (await res.json()) as DentaflowStats };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'ulanib bo‘lmadi' };
  }
}

export const som = (n: number) => `${Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ')} so'm`;
export const compactSom = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)} mln` : n >= 1000 ? `${Math.round(n / 1000)} ming` : `${Math.round(n)}`;
export const money = (amount: number, cur: 'USD' | 'UZS') =>
  cur === 'USD' ? `$${Number(amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : som(Number(amount));

/** Days from today (Tashkent) to an ISO date; negative = overdue. */
export function daysUntil(date: string): number {
  const today = new Date(Date.now() + 5 * 3_600_000).toISOString().slice(0, 10);
  return Math.round((Date.parse(date) - Date.parse(today)) / 86_400_000);
}
