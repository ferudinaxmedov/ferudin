import { createServiceClient } from '@/lib/supabase';
import { getAiblok, getHongsam } from './aiblok-hongsam';
import { monthChatUsd } from './assistant';
import { getDentaflow, getSeedbee, getSettings, getSkyplus, getSubs, monthlySom } from './data';

/**
 * Monthly P&L per project (hub F5): revenue − (subscriptions + API + the project's own expenses) = profit.
 *  - Revenue comes from each project's stats endpoint (same numbers as its hub page).
 *  - Subscriptions: monthly equivalent of active subscriptions in that project's bucket (yearly / 12).
 *    "umumiy" and "kontent" buckets are shared costs, shown on their own row.
 *  - API: DentaFlow measured cost, SeedBee Claude, Hongsam search, hub chat (shared).
 *  - Own expenses: only SkyPlus records them (its CRM "chiqim").
 * null = not readable / not measured; the UI says so instead of showing 0.
 */

export type PnlRow = {
  key: string;
  name: string;
  revenue: number | null;
  revenuePrev: number | null;
  subs: number;
  subsMissing: number;
  api: number | null;
  own: number | null;
  profit: number | null;
  goal: number | null;
  forecast: number | null;
};

export type Pnl = {
  month: string; // YYYY-MM (Tashkent)
  day: number;
  daysInMonth: number;
  usdRate: number;
  rows: PnlRow[];
  shared: { subs: number; subsMissing: number; api: number };
  totals: { revenue: number; costs: number; profit: number; revenuePrev: number };
  trend: { key: string; byProject: Record<string, number> }[];
};

const NAMES: Record<string, string> = { dentaflow: 'DentaFlow', seedbee: 'SeedBee', skyplus: 'SkyPlus', hongsam: 'Hongsam', aiblok: 'AI Blok', ferudin: 'ferudin.uz' };

export function tashkentMonth(offset = 0) {
  const t = new Date(Date.now() + 5 * 3_600_000);
  const d = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + offset, 1));
  return d.toISOString().slice(0, 7);
}

export async function getGoals(month = tashkentMonth()): Promise<Record<string, number>> {
  const { data } = await createServiceClient().from('my_goals').select('project, target').eq('month', `${month}-01`);
  return Object.fromEntries((data ?? []).map((g) => [g.project, Number(g.target)]));
}

export async function getPnl(): Promise<Pnl> {
  const [subs, { usdRate }, df, sb, sp, ab, hs, chatUsd, goals] = await Promise.all([
    getSubs(), getSettings(), getDentaflow(), getSeedbee(), getSkyplus(), getAiblok(), getHongsam(), monthChatUsd(), getGoals(),
  ]);
  void ab;
  const month = tashkentMonth();
  const prevKey = tashkentMonth(-1);
  const t = new Date(Date.now() + 5 * 3_600_000);
  const day = t.getUTCDate();
  const daysInMonth = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();

  const subsOf = (bucket: string) => {
    const list = subs.filter((s) => s.active && s.project === bucket);
    return { sum: list.reduce((a, s) => a + (monthlySom(s, usdRate) ?? 0), 0), missing: list.filter((s) => s.amount === null).length };
  };

  const base: Omit<PnlRow, 'subs' | 'subsMissing' | 'profit' | 'goal' | 'forecast'>[] = [
    {
      key: 'dentaflow', name: NAMES.dentaflow,
      revenue: df.ok ? df.data.revenue.month : null,
      revenuePrev: df.ok ? df.data.revenue.trend.find((x) => x.key === prevKey)?.amount ?? null : null,
      api: df.ok ? df.data.costs.total.month : null,
      own: null,
    },
    {
      key: 'seedbee', name: NAMES.seedbee,
      revenue: sb.ok ? sb.data.revenue.month : null,
      revenuePrev: sb.ok ? sb.data.revenue.trend.find((x) => x.key === prevKey)?.revenue ?? null : null,
      api: sb.ok && sb.data.ai ? sb.data.ai.usd.month * usdRate : null,
      own: null,
    },
    {
      key: 'skyplus', name: NAMES.skyplus,
      revenue: sp.ok ? sp.data.money.month.inUzs : null,
      revenuePrev: sp.ok ? sp.data.money.prev.inUzs : null,
      api: null,
      own: sp.ok ? sp.data.money.month.outUzs : null,
    },
    {
      key: 'hongsam', name: NAMES.hongsam,
      revenue: hs.ok ? hs.data.orders.sumMonth : null,
      revenuePrev: hs.ok ? hs.data.orders.prevSum : null,
      api: hs.ok ? hs.data.search.usdMonth * usdRate : null,
      own: null,
    },
    { key: 'aiblok', name: NAMES.aiblok, revenue: 0, revenuePrev: 0, api: null, own: null },
    { key: 'ferudin', name: NAMES.ferudin, revenue: 0, revenuePrev: 0, api: null, own: null },
  ];

  const rows: PnlRow[] = base.map((r) => {
    const s = subsOf(r.key);
    const costs = s.sum + (r.api ?? 0) + (r.own ?? 0);
    const goal = goals[r.key] ?? null;
    return {
      ...r,
      subs: s.sum,
      subsMissing: s.missing,
      profit: r.revenue === null ? null : r.revenue - costs,
      goal,
      forecast: r.revenue === null || day < 3 ? null : Math.round((r.revenue / day) * daysInMonth),
    };
  }).filter((r) => r.revenue !== 0 || r.subs > 0 || r.goal !== null || r.key === 'dentaflow' || r.key === 'seedbee' || r.key === 'skyplus' || r.key === 'hongsam');

  const shared = (() => {
    const u = subsOf('umumiy');
    const k = subsOf('kontent');
    return { subs: u.sum + k.sum, subsMissing: u.missing + k.missing, api: chatUsd * usdRate };
  })();

  const revenue = rows.reduce((a, r) => a + (r.revenue ?? 0), 0);
  const costs = rows.reduce((a, r) => a + r.subs + (r.api ?? 0) + (r.own ?? 0), 0) + shared.subs + shared.api;

  // Revenue trend (last 6 months) from whichever projects publish monthly series.
  const keys = Array.from({ length: 6 }, (_, i) => tashkentMonth(i - 5));
  const trend = keys.map((key) => {
    const byProject: Record<string, number> = {};
    if (df.ok) byProject.dentaflow = df.data.revenue.trend.find((x) => x.key === key)?.amount ?? 0;
    if (sb.ok) byProject.seedbee = sb.data.revenue.trend.find((x) => x.key === key)?.revenue ?? 0;
    if (sp.ok) byProject.skyplus = sp.data.money.trend.find((x) => x.key === key)?.inUzs ?? 0;
    if (hs.ok && key === month) byProject.hongsam = hs.data.orders.sumMonth;
    if (hs.ok && key === prevKey) byProject.hongsam = hs.data.orders.prevSum;
    return { key, byProject };
  });

  return {
    month, day, daysInMonth, usdRate, rows, shared,
    totals: { revenue, costs, profit: revenue - costs, revenuePrev: rows.reduce((a, r) => a + (r.revenuePrev ?? 0), 0) },
    trend,
  };
}
