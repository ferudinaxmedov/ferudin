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

type Keyed = { key: string; orders: number; revenue: number };

/** Shape of SeedBee's /api/hub/stats (seedbee.uz). Sums in so'm; no customer names or phones. */
export type SeedbeeStats = {
  generatedAt: string;
  orders: { today: number; week: number; month: number; toProcess: number; unpaid: number; byStatus: Record<string, number> };
  revenue: { today: number; week: number; month: number; trend: { key: string; revenue: number; orders: number }[] };
  last30: {
    totals: { orders: number; revenue: number; paid_orders: number; cancelled: number; new_customers: number; repeat_rate: number; customers_total: number };
    prev: { orders: number; revenue: number; paid_orders: number; new_customers: number };
    daily: { day: string; orders: number; revenue: number }[];
    bySource: Keyed[]; byMethod: Keyed[]; byRegion: Keyed[];
    topProducts: { key: string; qty: number; revenue: number }[];
  };
  customers: { total: number; week: number };
  cashback: {
    liability: { available: number; pending: number; customers: number };
    period: { earned: number; pending: number; voided: number; spent: number; reserved: number; adjust_plus: number; adjust_minus: number };
  };
};

type Pair = { UZS: number; USD: number };
type Month = { key: string; in: Pair; out: Pair; inUzs: number; outUzs: number };

/** Shape of SkyPlus CRM's /api/hub/stats (crm.skyplus.uz). */
export type SkyplusStats = {
  generatedAt: string;
  fx: { usdUzs: number; day: string | null };
  money: { month: Month; prev: Month; trend: Month[]; bySpace: Record<string, Pair & { uzs: number }> };
  debts: Pair & { count: number; uzs: number };
  academy: {
    students: number; newThisMonth: number;
    groups: Record<string, number>; enrollments: Record<string, number>;
    attendance30d: { marked: number; present: number; pct: number | null };
  };
  leads: { total: number; open: number; newThisMonth: number; byStatus: Record<string, number>; bySource: Record<string, number> };
  consulting: { openCases: number; byStage: Record<string, number>; byProgram: Record<string, number> };
  health: { notifyPending: number; notifyFailed: number; fxDay: string | null };
};

/** Every project exposes the same read-only Bearer endpoint; the hub pulls it fresh on each view. */
async function fetchStats<T>(name: string, tokenEnv: string, url: string): Promise<Fetched<T>> {
  const token = process.env[tokenEnv];
  if (!token) return { ok: false, reason: `${tokenEnv} o'rnatilmagan` };
  try {
    const res = await fetch(url, { headers: { authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return { ok: false, reason: `${name} javobi: ${res.status}` };
    return { ok: true, data: (await res.json()) as T };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'ulanib bo‘lmadi' };
  }
}

export const getDentaflow = () =>
  fetchStats<DentaflowStats>('DentaFlow', 'DENTAFLOW_HUB_TOKEN', process.env.DENTAFLOW_STATS_URL ?? 'https://dentaflow.uz/api/hub/stats');
export const getSeedbee = () =>
  fetchStats<SeedbeeStats>('SeedBee', 'SEEDBEE_HUB_TOKEN', process.env.SEEDBEE_STATS_URL ?? 'https://seedbee.uz/api/hub/stats');
export const getSkyplus = () =>
  fetchStats<SkyplusStats>('SkyPlus', 'SKYPLUS_HUB_TOKEN', process.env.SKYPLUS_STATS_URL ?? 'https://crm.skyplus.uz/api/hub/stats');

const UZ_MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'];
/** 'YYYY-MM' → short Uzbek month name. */
export const uzMonth = (key: string) => UZ_MONTHS[Number(key.slice(5, 7)) - 1] ?? key;
/** Change vs previous period in %, null when there is nothing to compare with. */
export const delta = (now: number, prev: number) => (prev > 0 ? Math.round(((now - prev) / prev) * 100) : null);

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
