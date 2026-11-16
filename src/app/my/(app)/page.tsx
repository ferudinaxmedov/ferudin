import Link from 'next/link';
import {
  AlertTriangle, BadgeCheck, CalendarClock, CircleDollarSign, Cpu, Hospital, Info, ShieldAlert, TrendingUp,
} from 'lucide-react';
import { requireHub } from '@/lib/hub/guard';
import { compactSom, daysUntil, getDentaflow, getSeedbee, getSettings, getSkyplus, getSubs, money, monthlySom, som } from '@/lib/hub/data';
import { getAiblok, getHongsam } from '@/lib/hub/aiblok-hongsam';
import { BUCKETS, PROJECTS, bucketOf } from '@/lib/hub/projects';
import { CountUp } from './CountUp';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Umumiy' };

type Tone = 'ok' | 'warn' | 'bad' | 'info';
type Signal = { tone: Tone; title: string; text: string; href?: string };
const ICON: Record<Tone, typeof Info> = { ok: BadgeCheck, warn: AlertTriangle, bad: ShieldAlert, info: Info };

export default async function Overview() {
  await requireHub();
  const [subs, { usdRate }, df, sb, sp, ab, hs] = await Promise.all([getSubs(), getSettings(), getDentaflow(), getSeedbee(), getSkyplus(), getAiblok(), getHongsam()]);
  const liveOk: Record<string, boolean> = { dentaflow: df.ok, seedbee: sb.ok, skyplus: sp.ok, aiblok: ab.ok, hongsam: hs.ok };
  const revenue = [
    { name: 'DentaFlow', ok: df.ok, som: df.ok ? df.data.revenue.month : 0 },
    { name: 'SeedBee', ok: sb.ok, som: sb.ok ? sb.data.revenue.month : 0 },
    { name: 'SkyPlus', ok: sp.ok, som: sp.ok ? sp.data.money.month.inUzs : 0 },
    // Hongsam: savatdagi buyurtma summasi (to'lov tasdig'i hubga kelmaydi)
    { name: 'Hongsam', ok: hs.ok, som: hs.ok ? hs.data.orders.sumMonth : 0 },
  ];
  const revenueTotal = revenue.reduce((s, r) => s + r.som, 0);

  const active = subs.filter((s) => s.active);
  const priced = active.filter((s) => s.amount !== null);
  const missing = active.filter((s) => s.amount === null);
  const subsMonthly = priced.reduce((sum, s) => sum + (monthlySom(s, usdRate) ?? 0), 0);
  const dfCost = df.ok ? df.data.costs.total.month : 0;
  const sbAi = sb.ok && sb.data.ai ? sb.data.ai.usd.month * usdRate : 0;
  const hsAi = hs.ok ? hs.data.search.usdMonth * usdRate : 0;
  const apiCost = dfCost + sbAi + hsAi;
  const totalMonthly = subsMonthly + apiCost;

  // Cost map: subscriptions by bucket + DentaFlow's measured API spend.
  const perBucket = new Map<string, { subs: number; api: number }>();
  for (const s of priced) {
    const b = perBucket.get(s.project) ?? { subs: 0, api: 0 };
    b.subs += monthlySom(s, usdRate) ?? 0;
    perBucket.set(s.project, b);
  }
  for (const [key, api] of [['dentaflow', dfCost], ['seedbee', sbAi], ['hongsam', hsAi]] as const) {
    if (!api) continue;
    const b = perBucket.get(key) ?? { subs: 0, api: 0 };
    b.api += api;
    perBucket.set(key, b);
  }
  const costRows = BUCKETS.map((b) => ({ ...b, ...(perBucket.get(b.key) ?? { subs: 0, api: 0 }) }))
    .map((b) => ({ ...b, total: b.subs + b.api }))
    .sort((a, b) => b.total - a.total);
  const costMax = Math.max(1, ...costRows.map((r) => r.total));

  const upcoming = active
    .filter((s) => s.next_charge)
    .map((s) => ({ ...s, days: daysUntil(s.next_charge!) }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  const signals: Signal[] = [];
  if (!df.ok) signals.push({ tone: 'bad', title: 'DentaFlow ulanmagan', text: df.reason, href: '/my/dentaflow' });
  if (!sb.ok) signals.push({ tone: 'bad', title: 'SeedBee ulanmagan', text: sb.reason, href: '/my/seedbee' });
  if (!sp.ok) signals.push({ tone: 'bad', title: 'SkyPlus ulanmagan', text: sp.reason, href: '/my/skyplus' });
  if (!ab.ok) signals.push({ tone: 'bad', title: 'AI Blok o‘qilmadi', text: ab.reason, href: '/my/aiblok' });
  if (!hs.ok) signals.push({ tone: 'bad', title: 'Hongsam o‘qilmadi', text: hs.reason, href: '/my/hongsam' });
  if (ab.ok && ab.data.questions.open) signals.push({ tone: 'info', title: `AI Blok: ${ab.data.questions.open} ta savol javob kutmoqda`, text: 'Mini App admin → Savollar', href: 'https://community.ferudin.uz/admin' });
  if (hs.ok && hs.data.orders.today) signals.push({ tone: 'info', title: `Hongsam: bugun ${hs.data.orders.today} ta buyurtma`, text: 'Telegram guruhida tafsilotlar', href: '/my/hongsam' });
  if (sb.ok && sb.data.orders.toProcess) signals.push({ tone: 'info', title: `SeedBee: ${sb.data.orders.toProcess} ta buyurtma ishlov kutmoqda`, text: sb.data.orders.unpaid ? `${sb.data.orders.unpaid} tasi hali to'lanmagan` : "CRM'da ko'rib chiqing", href: 'https://crm.firstcosmetics.uz' });
  if (sp.ok && sp.data.health.notifyFailed) signals.push({ tone: 'warn', title: `SkyPlus: ${sp.data.health.notifyFailed} ta Telegram xabari ketmadi`, text: 'Bot yoki chat ulanishini tekshiring', href: '/my/skyplus' });
  if (sp.ok && sp.data.debts.count) signals.push({ tone: 'info', title: `SkyPlus: ${sp.data.debts.count} ta qarzdor`, text: som(sp.data.debts.uzs), href: '/my/skyplus' });
  if (sp.ok && sp.data.leads.open) signals.push({ tone: 'info', title: `SkyPlus: ${sp.data.leads.open} ta lid javob kutmoqda`, text: 'Tez javob = ko‘proq yozilish', href: 'https://crm.skyplus.uz' });
  if (df.ok && df.data.health) {
    const h = df.data.health;
    if (h.missingEnv.length) signals.push({ tone: 'bad', title: 'DentaFlow: kalitlar yetishmaydi', text: h.missingEnv.join(', '), href: '/my/dentaflow' });
    if (h.eskizLow) signals.push({ tone: 'bad', title: 'Eskiz balansi kam', text: `Qoldiq: ${som(h.eskizBalance ?? 0)}. SMS to'xtab qolmasin`, href: 'https://my.eskiz.uz' });
    if (h.lateCrons.length) signals.push({ tone: 'warn', title: `${h.lateCrons.length} ta cron vaqtida ishlamadi`, text: h.lateCrons.join(', '), href: '/my/dentaflow' });
    if (h.botStale) signals.push({ tone: 'warn', title: 'DentaFlow Telegram boti jim', text: "Railway'ni tekshiring", href: '/my/dentaflow' });
  }
  if (df.ok && df.data.revenue.pendingCount) {
    signals.push({ tone: 'info', title: `${df.data.revenue.pendingCount} ta to'lov tasdiq kutmoqda`, text: som(df.data.revenue.pendingAmount), href: 'https://console.dentaflow.uz/superadmin/payments' });
  }
  for (const s of upcoming.filter((u) => u.days <= 3)) {
    signals.push({ tone: s.days < 0 ? 'bad' : 'warn', title: `${s.name}: ${s.days < 0 ? "to'lov o'tib ketgan" : s.days === 0 ? "bugun to'lov" : `${s.days} kunda to'lov`}`, text: s.amount !== null ? money(s.amount, s.currency) : 'narx kiritilmagan', href: '/my/obunalar' });
  }
  if (missing.length) signals.push({ tone: 'warn', title: `${missing.length} ta obunaning narxi kiritilmagan`, text: 'Oylik jami to‘liq chiqishi uchun narxlarni kiriting', href: '/my/obunalar' });
  if (!signals.length) signals.push({ tone: 'ok', title: 'Hammasi joyida', text: 'Diqqat talab qiladigan narsa yo‘q' });

  const today = new Intl.DateTimeFormat('uz-UZ', { timeZone: 'Asia/Tashkent', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  return (
    <>
      <section className="screen fit">
        <header className="head rise">
          <div>
            <h1>Assalomu alaykum, Ferudin</h1>
            <p>{today} · barcha tizimlaringiz bir joyda</p>
          </div>
        </header>

        <div className="grid kpis">
          <div className="card kpi lift rise" style={{ '--glow': '#4c8dff', '--d': '40ms' } as React.CSSProperties}>
            <div className="kpi-label"><CircleDollarSign size={15} /> Oylik xarajat</div>
            <div className="kpi-value"><CountUp value={Math.round(totalMonthly)} /><small>so&apos;m</small></div>
            <div className="kpi-sub">≈ ${Math.round(totalMonthly / usdRate).toLocaleString('en-US')} · obunalar + API{missing.length ? ` · ${missing.length} ta narxsiz` : ''}</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#f472b6', '--d': '90ms' } as React.CSSProperties}>
            <div className="kpi-label"><Cpu size={15} /> API xarajati (bu oy)</div>
            <div className="kpi-value"><CountUp value={Math.round(apiCost)} /><small>so&apos;m</small></div>
            <div className="kpi-sub">DentaFlow {df.ok ? compactSom(dfCost) : '—'} · SeedBee {sb.ok && sb.data.ai ? compactSom(sbAi) : '—'} · Hongsam {hs.ok ? compactSom(hsAi) : '—'}</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#34d399', '--d': '140ms' } as React.CSSProperties}>
            <div className="kpi-label"><TrendingUp size={15} /> Tushum (bu oy)</div>
            <div className="kpi-value"><CountUp value={Math.round(revenueTotal)} /><small>so&apos;m</small></div>
            <div className="kpi-sub">{revenue.map((r) => `${r.name} ${r.ok ? compactSom(r.som) : '—'}`).join(' · ')}</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#3ecfb2', '--d': '190ms' } as React.CSSProperties}>
            <div className="kpi-label"><Hospital size={15} /> Klinikalar</div>
            <div className="kpi-value">{df.ok ? <><CountUp value={df.data.clinics.paying} /><small>to&apos;lovchi</small></> : <span className="faint">—</span>}</div>
            <div className="kpi-sub">{df.ok ? `${df.data.clinics.trial} sinovda · jami ${df.data.clinics.total} · bu oy +${df.data.clinics.newThisMonth}` : '—'}</div>
          </div>
        </div>

        <div className="grid two">
          <div className="card rise" style={{ '--d': '240ms' } as React.CSSProperties}>
            <div className="card-h"><h2><ShieldAlert size={16} /> Diqqat talab qiladi</h2></div>
            <div className="list">
              {signals.slice(0, 5).map((s, i) => {
                const Icon = ICON[s.tone];
                const body = (<><span className="signal-ico"><Icon size={15} /></span><span><b>{s.title}</b><small>{s.text}</small></span></>);
                return s.href
                  ? <Link key={i} href={s.href} className={`signal ${s.tone}`}>{body}</Link>
                  : <div key={i} className={`signal ${s.tone}`}>{body}</div>;
              })}
            </div>
          </div>

          <div className="card rise" style={{ '--d': '290ms' } as React.CSSProperties}>
            <div className="card-h"><h2><CalendarClock size={16} /> Yaqin to&apos;lovlar</h2><Link href="/my/obunalar">Hammasi</Link></div>
            {upcoming.length ? (
              <div className="list">
                {upcoming.map((s) => (
                  <div key={s.id} className="row">
                    <span className="swatch" style={{ '--c': bucketOf(s.project).color } as React.CSSProperties} />
                    <span className="row-main"><b>{s.name}</b><small>{bucketOf(s.project).name}</small></span>
                    <span className="row-end">
                      <b>{s.amount !== null ? money(s.amount, s.currency) : '—'}</b>
                      <small className={s.days <= 3 ? 'missing' : ''}>{s.days < 0 ? `${-s.days} kun o'tdi` : s.days === 0 ? 'bugun' : `${s.days} kundan keyin`}</small>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty">Hali to&apos;lov sanalari yo&apos;q. <Link href="/my/obunalar" className="faint">Obunalar</Link> bo&apos;limida &quot;keyingi to&apos;lov&quot; sanasini kiriting.</p>
            )}
          </div>
        </div>
      </section>

      <section className="screen">
        <h2 className="screen-title">Loyihalar va xarajat xaritasi</h2>
        <div className="grid two">
          <div className="card rise">
            <div className="card-h"><h2><CircleDollarSign size={16} /> Oyiga qayerga qancha ketadi</h2><span className="chip">so&apos;m / oy</span></div>
            {costRows.map((r, i) => (
              <div key={r.key} className="bar-row" title={`Obunalar ${som(r.subs)} · API ${som(r.api)}`}>
                <span><span className="swatch" style={{ '--c': r.color } as React.CSSProperties} />{r.name}</span>
                <span className="bar-track"><span className="bar-fill" style={{ '--c': r.color, '--w': `${(r.total / costMax) * 100}%`, '--d': `${i * 60}ms`, display: 'block' } as React.CSSProperties} /></span>
                <span className="mono">{r.total ? compactSom(r.total) : '—'}</span>
              </div>
            ))}
            <p className="faint small" style={{ margin: '10px 0 0' }}>Dollar kursi: {usdRate.toLocaleString('ru-RU')} so&apos;m. Narxi kiritilmagan obunalar hisobga kirmagan.</p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            {PROJECTS.map((p, i) => (
              <div key={p.key} className="card tile lift rise" style={{ '--c': p.color, '--d': `${i * 50}ms` } as React.CSSProperties}>
                <div className="tile-top">
                  <span className="tile-dot" />
                  <b>{p.name}</b>
                  {p.live ? <span className={`chip ${liveOk[p.key] ? 'ok' : 'bad'}`}>{liveOk[p.key] ? 'jonli' : 'xato'}</span> : <span className="chip">keyingi faza</span>}
                </div>
                <p>{p.what}</p>
                {p.key === 'dentaflow' && df.ok ? (
                  <div className="tile-stats">
                    <span><b>{df.data.clinics.paying}/{df.data.clinics.total}</b><small>to&apos;lovchi</small></span>
                    <span><b>{compactSom(df.data.revenue.mrr)}</b><small>MRR</small></span>
                    <span><b>{compactSom(dfCost)}</b><small>API</small></span>
                  </div>
                ) : p.key === 'seedbee' && sb.ok ? (
                  <div className="tile-stats">
                    <span><b>{compactSom(sb.data.revenue.month)}</b><small>bu oy</small></span>
                    <span><b>{sb.data.orders.month}</b><small>buyurtma</small></span>
                    <span><b>{sb.data.customers.total.toLocaleString('ru-RU')}</b><small>mijoz</small></span>
                  </div>
                ) : p.key === 'skyplus' && sp.ok ? (
                  <div className="tile-stats">
                    <span><b>{compactSom(sp.data.money.month.inUzs)}</b><small>bu oy</small></span>
                    <span><b>{(sp.data.academy.enrollments.active ?? 0) + (sp.data.academy.enrollments.trial ?? 0)}</b><small>o&apos;quvchi</small></span>
                    <span><b>{sp.data.consulting.openCases}</b><small>ariza</small></span>
                  </div>
                ) : p.key === 'aiblok' && ab.ok ? (
                  <div className="tile-stats">
                    <span><b>{ab.data.members.total}</b><small>a&apos;zo</small></span>
                    <span><b>{ab.data.engagement30.reads}</b><small>o&apos;qish / 30k</small></span>
                    <span><b>{ab.data.questions.open}</b><small>savol</small></span>
                  </div>
                ) : p.key === 'hongsam' && hs.ok ? (
                  <div className="tile-stats">
                    <span><b>{compactSom(hs.data.orders.sumMonth)}</b><small>bu oy</small></span>
                    <span><b>{hs.data.orders.month}</b><small>buyurtma</small></span>
                    <span><b>{hs.data.guides.month}</b><small>qo&apos;llanma</small></span>
                  </div>
                ) : (
                  <div className="tile-stats"><span><b>{perBucket.get(p.key) ? compactSom((perBucket.get(p.key)!.subs)) : '—'}</b><small>obunalar / oy</small></span></div>
                )}
                <div className="tile-links">
                  {p.live && <Link href={`/my/${p.key}`}>Batafsil</Link>}
                  {p.admin && <a href={p.admin} target="_blank" rel="noreferrer">Admin ↗</a>}
                  {p.url && <a href={p.url} target="_blank" rel="noreferrer">Sayt ↗</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
