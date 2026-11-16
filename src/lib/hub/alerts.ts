import { createServiceClient } from '@/lib/supabase';
import { activeMutes, dueReminders, markRemindersSent } from './actions';
import { getAiblok, getHongsam } from './aiblok-hongsam';
import { getDentaflow, getSeedbee, getSettings, getSkyplus, getSubs, som } from './data';
import { buildSignals, type HubData, type Signal } from './signals';

/**
 * Owner alert bot (hub F2). Two entry points, both called by pg_cron through POST /api/hub/alerts:
 *  - tick (every 15 min): pushes only what is NEW since the last tick (state in my_alert_state);
 *    at night (23:00-08:00 Tashkent) only red alerts go out, the rest wait for the morning.
 *  - digest (09:00): month revenue, API spend and every open signal in one message.
 * F4: signals muted in my_mutes are skipped (their state is kept, so no false "resolved"), and due
 * reminders (my_reminders) go out on the tick, day or night: the owner picked that time.
 */

type State = { key: string; tone: string; title: string; count: number | null; sent: boolean };

const HUB = 'https://my.ferudin.uz';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const link = (href?: string) => (!href ? '' : href.startsWith('/my') ? `${HUB}${href.slice(3) || '/'}` : href);
const ICON: Record<string, string> = { bad: '🔴', warn: '🟠', info: '🔵', ok: '🟢' };

function line(s: Signal, prefix = ICON[s.tone]) {
  const url = link(s.href);
  const title = url ? `<a href="${esc(url)}">${esc(s.title)}</a>` : esc(s.title);
  return `${prefix} <b>${title}</b>\n${esc(s.text)}`;
}

const tashkentHour = () => (new Date().getUTCHours() + 5) % 24;
/** Tashkent calendar date (YYYY-MM-DD), offset in days. */
const tashkentDay = (plus = 0) => new Date(Date.now() + 5 * 3_600_000 + plus * 86_400_000).toISOString().slice(0, 10);
const subPrice = (s: { amount: number | null; currency: string; period: string }) =>
  s.amount === null || s.amount === undefined
    ? 'narx kiritilmagan'
    : `${s.currency === 'USD' ? `$${s.amount}` : som(Number(s.amount))} / ${s.period === 'year' ? 'yil' : 'oy'}`;

export async function loadHub(): Promise<HubData> {
  const [subs, df, sb, sp, ab, hs] = await Promise.all([getSubs(), getDentaflow(), getSeedbee(), getSkyplus(), getAiblok(), getHongsam()]);
  return { subs, df, sb, sp, ab, hs };
}

export async function sendTelegram(html: string): Promise<{ ok: boolean; reason?: string }> {
  const token = process.env.HUB_ALERT_BOT_TOKEN;
  const chat = process.env.HUB_ALERT_CHAT_ID;
  if (!token || !chat) return { ok: false, reason: 'HUB_ALERT_BOT_TOKEN yoki HUB_ALERT_CHAT_ID yo‘q' };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: html.slice(0, 4000), parse_mode: 'HTML', link_preview_options: { is_disabled: true } }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? { ok: true } : { ok: false, reason: `Telegram ${res.status}` };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'Telegram xatosi' };
  }
}

export async function runTick() {
  const db = createServiceClient();
  const [hub, { data: rows, error }, muted, due] = await Promise.all([
    loadHub(), db.from('my_alert_state').select('key, tone, title, count, sent'), activeMutes(), dueReminders(),
  ]);
  if (error) return { ok: false, reason: error.message };

  const state = new Map((rows as State[]).map((r) => [r.key, r]));
  const seeded = state.has('_seeded');
  const night = tashkentHour() >= 23 || tashkentHour() < 8;
  const live = buildSignals(hub).filter((s) => !s.digestOnly && !muted.has(s.key));
  const upserts: State[] = [];
  const lines: string[] = due.map((r) => `⏰ <b>Eslatma</b>\n${esc(r.text)}`);
  const say = (s: Signal, prefix?: string) => { if (seeded) lines.push(line(s, prefix)); };

  for (const s of live) {
    const st = state.get(s.key);
    const quiet = night && s.tone !== 'bad';
    const save = (sent: boolean) => upserts.push({ key: s.key, tone: s.tone, title: s.title, count: s.count ?? null, sent });

    if (s.tone === 'bad' || s.tone === 'warn') {
      if (!st && s.confirm && seeded) save(false); // first sighting: wait one more tick
      else if (!st || !st.sent || st.title !== s.title) {
        if (quiet) continue; // try again after 08:00
        say(s);
        save(true);
      }
    } else if (s.count !== undefined) {
      const prev = st?.count ?? 0;
      if (s.count > prev) {
        if (quiet) continue;
        say(s, '🆕');
        save(true);
      } else if (s.count < prev || st?.title !== s.title) save(true);
    }
  }

  const liveKeys = new Set(live.map((s) => s.key));
  const gone = [...state.values()].filter((st) => !st.key.startsWith('_') && !liveKeys.has(st.key) && !muted.has(st.key));
  for (const st of gone) {
    if (seeded && st.sent && (st.tone === 'bad' || st.tone === 'warn')) lines.push(`✅ <b>Hal bo‘ldi:</b> ${esc(st.title)}`);
  }
  // Subscription charge / domain expiry: one push the day before (from 09:00), or on the day if that was missed.
  const today = tashkentDay(0);
  const tomorrow = tashkentDay(1);
  for (const sub of hub.subs) {
    const d = sub.next_charge?.slice(0, 10);
    if (!sub.active || !d) continue;
    const isTomorrow = d === tomorrow && tashkentHour() >= 9;
    if (!isTomorrow && d !== today) continue;
    const key = `_due:${sub.id}:${d}`;
    if (state.has(key)) continue;
    lines.push(`⏳ <b>${isTomorrow ? 'Ertaga' : 'Bugun'} to‘lov: ${esc(sub.name)}</b>\n${esc(subPrice(sub))}${sub.notes ? `\n${esc(sub.notes)}` : ''}\n<a href="${HUB}/my/obunalar">Obunalar</a>`);
    upserts.push({ key, tone: 'info', title: sub.name, count: null, sent: true });
  }

  if (!seeded) upserts.push({ key: '_seeded', tone: 'ok', title: 'first tick', count: null, sent: true });

  let sent: { ok: boolean; reason?: string } = { ok: true };
  if (lines.length) {
    sent = await sendTelegram(lines.join('\n\n'));
    if (!sent.ok) return { ok: false, reason: sent.reason }; // keep state, retry next tick
    await markRemindersSent(due.map((r) => r.id));
  }
  if (upserts.length) {
    const { error: e } = await db.from('my_alert_state').upsert(upserts.map((u) => ({ ...u, at: new Date().toISOString() })));
    if (e) return { ok: false, reason: e.message };
  }
  if (gone.length) await db.from('my_alert_state').delete().in('key', gone.map((g) => g.key));
  return { ok: true, sent: lines.length, seeded: !seeded ? 'first run, state saved silently' : undefined };
}

export async function runDigest() {
  const [hub, { usdRate }] = await Promise.all([loadHub(), getSettings()]);
  const { df, sb, sp, hs } = hub;
  const rev = [
    ['DentaFlow', df.ok ? df.data.revenue.month : null],
    ['SeedBee', sb.ok ? sb.data.revenue.month : null],
    ['SkyPlus', sp.ok ? sp.data.money.month.inUzs : null],
    ['Hongsam', hs.ok ? hs.data.orders.sumMonth : null],
  ] as const;
  const total = rev.reduce((s, [, v]) => s + (v ?? 0), 0);
  const api = (df.ok ? df.data.costs.total.month : 0)
    + (sb.ok && sb.data.ai ? sb.data.ai.usd.month * usdRate : 0)
    + (hs.ok ? hs.data.search.usdMonth * usdRate : 0);

  const day = new Intl.DateTimeFormat('uz-UZ', { timeZone: 'Asia/Tashkent', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const muted = await activeMutes();
  const signals = buildSignals(hub).filter((s) => !muted.has(s.key));
  const parts = [
    `☀️ <b>Ertalabki hisobot</b> · ${esc(day)}`,
    `<b>Bu oy tushum: ${esc(som(total))}</b>\n${rev.map(([n, v]) => `• ${n}: ${v === null ? 'o‘qilmadi' : esc(som(v))}`).join('\n')}`,
    `API xarajati (bu oy): ${esc(som(api))}`,
    signals.length ? `<b>Diqqat (${signals.length})</b>\n\n${signals.map((s) => line(s)).join('\n\n')}` : '🟢 Diqqat talab qiladigan narsa yo‘q',
    `<a href="${HUB}">my.ferudin.uz</a>`,
  ];
  const r = await sendTelegram(parts.join('\n\n'));
  return { ok: r.ok, reason: r.reason, signals: signals.length };
}
