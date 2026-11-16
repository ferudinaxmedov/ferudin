import { createServiceClient } from '@/lib/supabase';
import type { Fetched } from './data';
import { usdOf } from './claude-cost';

// AI Blok jadvallari hub bilan bitta (DentaFlow) bazada turibdi: to'g'ridan-to'g'ri o'qiymiz, faqat yig'ma raqamlar.
// Supabase Pro'ga ko'chganda bu fayl AI Blok'ning o'z /api/hub/stats manziliga almashtiriladi.

const DAY = 86_400_000;
const tashDay = (iso: string) => new Date(Date.parse(iso) + 5 * 3_600_000).toISOString().slice(0, 10);
const monthStart = () => {
  const t = new Date(Date.now() + 5 * 3_600_000).toISOString().slice(0, 7);
  return new Date(`${t}-01T00:00:00+05:00`).toISOString();
};
/** Last n Tashkent days, oldest first, each with a zero count. */
const lastDays = (n: number) =>
  Array.from({ length: n }, (_, i) => tashDay(new Date(Date.now() - (n - 1 - i) * DAY).toISOString()));

export type AiblokStats = {
  members: { total: number; subscribed: number; botStarted: number; newMonth: number; active7d: number; daily: { day: string; count: number }[] };
  posts: { live: number; queued: number; lastAt: string | null };
  engagement30: { reads: number; readers: number; likes: number; saves: number; comments: number };
  topPosts: { title: string; reads: number }[];
  questions: { open: number; total: number };
  waitlist: { product: string; count: number }[];
  links: { name: string; clicks: number; joins: number }[];
  announcements: { sent: number; reach: number };
};

export async function getAiblok(): Promise<Fetched<AiblokStats>> {
  try {
    const db = createServiceClient();
    const since30 = new Date(Date.now() - 30 * DAY).toISOString();
    const since7 = new Date(Date.now() - 7 * DAY).toISOString();
    const nowIso = new Date().toISOString();
    const count = (q: PromiseLike<{ count: number | null; error: unknown }>) =>
      Promise.resolve(q).then((r) => {
        if (r.error) throw r.error;
        return r.count ?? 0;
      });
    const rows = <T,>(q: PromiseLike<{ data: T[] | null; error: unknown }>) =>
      Promise.resolve(q).then((r) => {
        if (r.error) throw r.error;
        return r.data ?? [];
      });
    const head = { count: 'exact' as const, head: true };

    const [total, subscribed, botStarted, newMonth, active7d, joined30, live, queued, last, reads, likes, saves, comments, openQ, totalQ, waits, links, clicks, joins, ann] =
      await Promise.all([
        count(db.from('aiblok_profiles').select('tg_id', head)),
        count(db.from('aiblok_profiles').select('tg_id', head).eq('subscribed', true)),
        count(db.from('aiblok_profiles').select('tg_id', head).eq('bot_started', true)),
        count(db.from('aiblok_profiles').select('tg_id', head).gte('created_at', monthStart())),
        count(db.from('aiblok_profiles').select('tg_id', head).gte('last_seen_at', since7)),
        rows<{ created_at: string }>(db.from('aiblok_profiles').select('created_at').gte('created_at', since30).limit(5000)),
        count(db.from('aiblok_posts').select('id', head).eq('published', true).eq('owner_only', false).lte('published_at', nowIso)),
        count(db.from('aiblok_posts').select('id', head).or(`published.eq.false,owner_only.eq.true,published_at.gt.${nowIso}`)),
        rows<{ published_at: string }>(
          db.from('aiblok_posts').select('published_at').eq('published', true).eq('owner_only', false).lte('published_at', nowIso).order('published_at', { ascending: false }).limit(1),
        ),
        rows<{ post_id: string; tg_id: number }>(db.from('aiblok_post_reads').select('post_id, tg_id').gte('first_read_at', since30).limit(20000)),
        count(db.from('aiblok_likes').select('post_id', head).gte('created_at', since30)),
        count(db.from('aiblok_saves').select('post_id', head).gte('created_at', since30)),
        count(db.from('aiblok_comments').select('id', head).gte('created_at', since30)),
        count(db.from('aiblok_questions').select('id', head).is('answered_at', null)),
        count(db.from('aiblok_questions').select('id', head)),
        rows<{ product: string }>(db.from('aiblok_waitlist').select('product').limit(5000)),
        rows<{ id: string; name: string }>(db.from('aiblok_links').select('id, name').eq('archived', false)),
        rows<{ link_id: string }>(db.from('aiblok_link_clicks').select('link_id').gte('created_at', since30).limit(20000)),
        rows<{ link_id: string }>(db.from('aiblok_link_joins').select('link_id').gte('joined_at', since30).limit(20000)),
        rows<{ sent_count: number | null }>(db.from('aiblok_announcements').select('sent_count').not('broadcast_done_at', 'is', null)),
      ]);

    const byDay = new Map(lastDays(30).map((d) => [d, 0]));
    for (const r of joined30) {
      const d = tashDay(r.created_at);
      if (byDay.has(d)) byDay.set(d, byDay.get(d)! + 1);
    }

    const perPost = new Map<string, number>();
    for (const r of reads) perPost.set(r.post_id, (perPost.get(r.post_id) ?? 0) + 1);
    const topIds = [...perPost.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const titles = topIds.length
      ? await rows<{ id: string; title: string }>(db.from('aiblok_posts').select('id, title').in('id', topIds.map(([id]) => id)))
      : [];

    const tally = <T,>(list: T[], key: (x: T) => string) => {
      const m = new Map<string, number>();
      for (const x of list) m.set(key(x), (m.get(key(x)) ?? 0) + 1);
      return m;
    };
    const wl = tally(waits, (w) => w.product || '—');
    const cl = tally(clicks, (c) => c.link_id);
    const jn = tally(joins, (j) => j.link_id);

    return {
      ok: true,
      data: {
        members: { total, subscribed, botStarted, newMonth, active7d, daily: [...byDay.entries()].map(([day, c]) => ({ day, count: c })) },
        posts: { live, queued, lastAt: last[0]?.published_at ?? null },
        engagement30: { reads: reads.length, readers: new Set(reads.map((r) => r.tg_id)).size, likes, saves, comments },
        topPosts: topIds.map(([id, n]) => ({ title: titles.find((t) => t.id === id)?.title ?? '—', reads: n })),
        questions: { open: openQ, total: totalQ },
        waitlist: [...wl.entries()].map(([product, c]) => ({ product, count: c })).sort((a, b) => b.count - a.count),
        links: links
          .map((l) => ({ name: l.name, clicks: cl.get(l.id) ?? 0, joins: jn.get(l.id) ?? 0 }))
          .filter((l) => l.clicks || l.joins)
          .sort((a, b) => b.clicks - a.clicks),
        announcements: { sent: ann.length, reach: ann.reduce((s, a) => s + (a.sent_count ?? 0), 0) },
      },
    };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "AI Blok jadvallarini o'qib bo'lmadi" };
  }
}

type Ev = { kind: string; amount: number | null; meta: Record<string, string | number | boolean>; at: string };

export type HongsamStats = {
  since: string | null;
  orders: { today: number; week: number; month: number; sumMonth: number; sumWeek: number; prevMonth: number; prevSum: number; avg: number; qtyMonth: number };
  byVia: { key: string; count: number; sum: number }[];
  byRegion: { key: string; count: number; sum: number }[];
  byLang: { key: string; count: number }[];
  guides: { month: number; total: number; byFrom: { key: string; count: number }[] };
  starts: { month: number };
  search: { month: number; usdMonth: number; usdTotal: number };
  daily: { day: string; orders: number; sum: number; guides: number }[];
  /** Guide takers → orders this month, rough funnel (different people may overlap). */
  conv: number | null;
};

export async function getHongsam(): Promise<Fetched<HongsamStats>> {
  try {
    const { data, error } = await createServiceClient()
      .from('my_events')
      .select('kind, amount, meta, at')
      .eq('project', 'hongsam')
      .gte('at', new Date(Date.now() - 70 * DAY).toISOString())
      .order('at')
      .limit(20000);
    if (error) throw error;
    const ev = (data ?? []) as Ev[];
    const { data: first } = await createServiceClient().from('my_events').select('at').eq('project', 'hongsam').order('at').limit(1);

    const today = tashDay(new Date().toISOString());
    const month = today.slice(0, 7);
    const prevMonth = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7) - 2, 1)).toISOString().slice(0, 7);
    const weekAgo = Date.now() - 7 * DAY;
    const inMonth = (e: Ev) => tashDay(e.at).startsWith(month);

    const orders = ev.filter((e) => e.kind === 'order');
    const om = orders.filter(inMonth);
    const op = orders.filter((e) => tashDay(e.at).startsWith(prevMonth));
    const ow = orders.filter((e) => Date.parse(e.at) >= weekAgo);
    const sum = (l: Ev[]) => l.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const group = (l: Ev[], key: string) => {
      const m = new Map<string, { count: number; sum: number }>();
      for (const e of l) {
        const k = String(e.meta?.[key] ?? '—');
        const g = m.get(k) ?? { count: 0, sum: 0 };
        g.count++;
        g.sum += Number(e.amount) || 0;
        m.set(k, g);
      }
      return [...m.entries()].map(([k, v]) => ({ key: k, ...v })).sort((a, b) => b.count - a.count);
    };

    const guides = ev.filter((e) => e.kind === 'guide');
    const gm = guides.filter(inMonth);
    const searches = ev.filter((e) => e.kind === 'search');
    const usd = (e: Ev) => usdOf(e.meta);

    const days = new Map(lastDays(30).map((d) => [d, { orders: 0, sum: 0, guides: 0 }]));
    for (const e of ev) {
      const d = days.get(tashDay(e.at));
      if (!d) continue;
      if (e.kind === 'order') {
        d.orders++;
        d.sum += Number(e.amount) || 0;
      } else if (e.kind === 'guide') d.guides++;
    }

    return {
      ok: true,
      data: {
        since: first?.[0]?.at ?? null,
        orders: {
          today: orders.filter((e) => tashDay(e.at) === today).length,
          week: ow.length,
          month: om.length,
          sumMonth: sum(om),
          sumWeek: sum(ow),
          prevMonth: op.length,
          prevSum: sum(op),
          avg: om.length ? sum(om) / om.length : 0,
          qtyMonth: om.reduce((s, e) => s + (Number(e.meta?.qty) || 0), 0),
        },
        byVia: group(om, 'via'),
        byRegion: group(om, 'region').slice(0, 8),
        byLang: group(om, 'lang').map(({ key, count }) => ({ key, count })),
        guides: { month: gm.length, total: guides.length, byFrom: group(gm, 'from').map(({ key, count }) => ({ key, count })) },
        starts: { month: ev.filter((e) => e.kind === 'start' && inMonth(e)).length },
        search: { month: searches.filter(inMonth).length, usdMonth: searches.filter(inMonth).reduce((s, e) => s + usd(e), 0), usdTotal: searches.reduce((s, e) => s + usd(e), 0) },
        daily: [...days.entries()].map(([day, v]) => ({ day, ...v })),
        conv: gm.length ? Math.round((om.length / gm.length) * 100) : null,
      },
    };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "Hongsam hodisalarini o'qib bo'lmadi" };
  }
}
