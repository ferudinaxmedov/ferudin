import type { DentaflowStats, Fetched, SeedbeeStats, SkyplusStats, Sub } from './data';
import { daysUntil, money, som } from './data';
import type { AiblokStats, HongsamStats } from './aiblok-hongsam';

export type Tone = 'ok' | 'warn' | 'bad' | 'info';

/**
 * One thing that needs the owner's attention. Shared by the overview page and the alert bot.
 *  - key: stable id, the bot remembers what it already told the owner by this key.
 *  - count: for "something new arrived" signals (orders, leads, questions): the bot pings when it grows.
 *  - digestOnly: shown on the page and in the morning report, never pushed on its own.
 *  - confirm: must be seen on two ticks in a row before a push (a single failed fetch is not an outage).
 */
export type Signal = {
  key: string; tone: Tone; title: string; text: string; href?: string;
  count?: number; digestOnly?: boolean; confirm?: boolean;
};

export type HubData = {
  subs: Sub[];
  df: Fetched<DentaflowStats>;
  sb: Fetched<SeedbeeStats>;
  sp: Fetched<SkyplusStats>;
  ab: Fetched<AiblokStats>;
  hs: Fetched<HongsamStats>;
};

export function buildSignals({ subs, df, sb, sp, ab, hs }: HubData): Signal[] {
  const out: Signal[] = [];
  const down = (key: string, title: string, reason: string, href: string) =>
    out.push({ key: `down:${key}`, tone: 'bad', title, text: reason, href, confirm: true });

  if (!df.ok) down('dentaflow', 'DentaFlow ulanmagan', df.reason, '/my/dentaflow');
  if (!sb.ok) down('seedbee', 'SeedBee ulanmagan', sb.reason, '/my/seedbee');
  if (!sp.ok) down('skyplus', 'SkyPlus ulanmagan', sp.reason, '/my/skyplus');
  if (!ab.ok) down('aiblok', 'AI Blok o‘qilmadi', ab.reason, '/my/aiblok');
  if (!hs.ok) down('hongsam', 'Hongsam o‘qilmadi', hs.reason, '/my/hongsam');

  if (ab.ok && ab.data.questions.open) {
    const n = ab.data.questions.open;
    out.push({ key: 'ab:questions', tone: 'info', count: n, title: `AI Blok: ${n} ta savol javob kutmoqda`, text: 'Mini App admin → Savollar', href: 'https://community.ferudin.uz/admin' });
  }
  if (hs.ok && hs.data.orders.today) {
    const n = hs.data.orders.today;
    out.push({ key: 'hs:orders', tone: 'info', count: n, title: `Hongsam: bugun ${n} ta buyurtma`, text: 'Telegram guruhida tafsilotlar', href: '/my/hongsam' });
  }
  if (sb.ok && sb.data.orders.toProcess) {
    const o = sb.data.orders;
    out.push({ key: 'sb:toProcess', tone: 'info', count: o.toProcess, title: `SeedBee: ${o.toProcess} ta buyurtma ishlov kutmoqda`, text: o.unpaid ? `${o.unpaid} tasi hali to'lanmagan` : "CRM'da ko'rib chiqing", href: 'https://crm.firstcosmetics.uz' });
  }
  if (sp.ok && sp.data.health.notifyFailed) {
    out.push({ key: 'sp:notifyFailed', tone: 'warn', title: `SkyPlus: ${sp.data.health.notifyFailed} ta Telegram xabari ketmadi`, text: 'Bot yoki chat ulanishini tekshiring', href: '/my/skyplus' });
  }
  if (sp.ok && sp.data.debts.count) {
    out.push({ key: 'sp:debts', tone: 'info', digestOnly: true, title: `SkyPlus: ${sp.data.debts.count} ta qarzdor`, text: som(sp.data.debts.uzs), href: '/my/skyplus' });
  }
  if (sp.ok && sp.data.leads.open) {
    const n = sp.data.leads.open;
    out.push({ key: 'sp:leads', tone: 'info', count: n, title: `SkyPlus: ${n} ta lid javob kutmoqda`, text: 'Tez javob = ko‘proq yozilish', href: 'https://crm.skyplus.uz' });
  }
  if (df.ok && df.data.health) {
    const h = df.data.health;
    if (h.missingEnv.length) out.push({ key: 'df:env', tone: 'bad', title: 'DentaFlow: kalitlar yetishmaydi', text: h.missingEnv.join(', '), href: '/my/dentaflow' });
    if (h.eskizLow) out.push({ key: 'df:eskiz', tone: 'bad', title: 'Eskiz balansi kam', text: `Qoldiq: ${som(h.eskizBalance ?? 0)}. SMS to'xtab qolmasin`, href: 'https://my.eskiz.uz' });
    if (h.lateCrons.length) out.push({ key: 'df:crons', tone: 'warn', title: `${h.lateCrons.length} ta cron vaqtida ishlamadi`, text: h.lateCrons.join(', '), href: '/my/dentaflow' });
    if (h.botStale) out.push({ key: 'df:bot', tone: 'warn', title: 'DentaFlow Telegram boti jim', text: "Railway'ni tekshiring", href: '/my/dentaflow' });
  }
  if (df.ok && df.data.revenue.pendingCount) {
    const n = df.data.revenue.pendingCount;
    out.push({ key: 'df:pending', tone: 'info', count: n, title: `DentaFlow: ${n} ta to'lov tasdiq kutmoqda`, text: som(df.data.revenue.pendingAmount), href: 'https://console.dentaflow.uz/superadmin/payments' });
  }

  const active = subs.filter((s) => s.active);
  const due = active
    .filter((s) => s.next_charge)
    .map((s) => ({ ...s, days: daysUntil(s.next_charge!) }))
    .filter((s) => s.days <= 3)
    .sort((a, b) => a.days - b.days);
  for (const s of due) {
    out.push({
      key: `sub:${s.id}`, tone: s.days < 0 ? 'bad' : 'warn', digestOnly: true,
      title: `${s.name}: ${s.days < 0 ? "to'lov o'tib ketgan" : s.days === 0 ? "bugun to'lov" : `${s.days} kunda to'lov`}`,
      text: s.amount !== null ? money(s.amount, s.currency) : 'narx kiritilmagan', href: '/my/obunalar',
    });
  }
  const missing = active.filter((s) => s.amount === null).length;
  if (missing) out.push({ key: 'subs:missing', tone: 'warn', digestOnly: true, title: `${missing} ta obunaning narxi kiritilmagan`, text: 'Oylik jami to‘liq chiqishi uchun narxlarni kiriting', href: '/my/obunalar' });

  return out;
}
