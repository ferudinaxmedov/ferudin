import { Coins, Cpu, MapPin, Package, PlugZap, ShoppingBag, TrendingUp, Users, Wallet } from 'lucide-react';
import { requireHub } from '@/lib/hub/guard';
import { compactSom, delta, getSeedbee, getSettings, som, uzMonth } from '@/lib/hub/data';
import { CountUp } from '../CountUp';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'SeedBee' };

const GOLD = '#F5B83D';
const SOURCE: Record<string, string> = { website: 'Sayt', telegram: 'Telegram', instagram: 'Instagram', app: 'Ilova', manual: "Qo'lda", crm: 'CRM' };
const METHOD: Record<string, string> = { click: 'Click', payme: 'Payme', cash: 'Naqd', card: 'Karta', transfer: "O'tkazma", cod: 'Yetkazganda' };
const STATUS: Record<string, string> = { new: 'Yangi', paid: "To'langan", confirmed: 'Tasdiqlangan', shipped: "Yo'lda", delivered: 'Yetkazilgan', cancelled: 'Bekor' };
const FEATURE: Record<string, string> = {
  assistant: 'Guruhdagi AI yordamchi', drafts: 'Javob qoralamalari', chats: 'Telegram suhbat tahlili', tagging: 'Xabarlarni teglash',
  learning: "Uslubni o'rganish", reports: 'Hisobotdagi AI tahlil', digest: 'Kunlik xulosa', weekly: 'Haftalik xulosa', learn: "Uslubni o'rganish",
  post_insight: 'Post tahlili', translate: 'Mahsulot tarjimasi', media: 'Rasm tavsifi',
};
const MODEL: Record<string, string> = { 'claude-haiku-5-5': 'Haiku', 'claude-sonnet-5-5': 'Sonnet', 'claude-opus-5-5': 'Opus' };
const PALETTE = ['#F5B83D', '#60a5fa', '#c084fc', '#34d399', '#f472b6', '#94a3b8'];

function Change({ now, prev }: { now: number; prev: number }) {
  const d = delta(now, prev);
  if (d === null) return <>o&apos;tgan 30 kun: {compactSom(prev)}</>;
  return <span className={d >= 0 ? 'up' : 'down'}>{d >= 0 ? '▲' : '▼'} {Math.abs(d)}% o&apos;tgan 30 kunga nisbatan</span>;
}

export default async function SeedbeePage() {
  await requireHub();
  const [sb, { usdRate }] = await Promise.all([getSeedbee(), getSettings()]);

  if (!sb.ok) {
    return (
      <section className="screen">
        <header className="head rise"><div><h1>SeedBee</h1><p>Buyurtmalar, tushum, mijozlar va cashback</p></div></header>
        <div className="callout rise">
          <PlugZap size={18} />
          <div>
            <b>SeedBee hali ulanmagan</b>
            <p>{sb.reason}. seedbee.uz Vercel&apos;ida <span className="mono">HUB_STATS_TOKEN</span>, bu yerda <span className="mono">SEEDBEE_HUB_TOKEN</span> bir xil qiymat bilan o&apos;rnatilishi va sayt deploy qilinishi kerak.</p>
          </div>
        </div>
      </section>
    );
  }

  const d = sb.data;
  const t = d.last30.totals;
  const ai = d.ai ?? null;
  const aiMax = Math.max(1e-9, ...(ai?.byFeature ?? []).map((f) => f.usd));
  const p = d.last30.prev;
  const trendMax = Math.max(1, ...d.revenue.trend.map((x) => x.revenue));
  const daily = d.last30.daily;
  const dayMax = Math.max(1, ...daily.map((x) => x.revenue));
  const W = 600, H = 110;
  const pts = daily.map((x, i) => [(i / Math.max(1, daily.length - 1)) * W, H - 8 - (x.revenue / dayMax) * (H - 20)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;
  const srcMax = Math.max(1, ...d.last30.bySource.map((s) => s.orders));
  const statuses = Object.entries(d.orders.byStatus).sort((a, b) => b[1] - a[1]);
  const statusTotal = Math.max(1, statuses.reduce((s, [, n]) => s + n, 0));
  const updated = new Intl.DateTimeFormat('uz-UZ', { timeZone: 'Asia/Tashkent', hour: '2-digit', minute: '2-digit' }).format(new Date(d.generatedAt));

  return (
    <>
      <section className="screen fit">
        <header className="head rise">
          <div>
            <h1>SeedBee</h1>
            <p>Jonli ma&apos;lumot · {updated} da yangilandi · test buyurtmalar hisobga kirmaydi</p>
          </div>
          <div className="head-actions">
            <a className="btn btn-ghost small" href="https://crm.firstcosmetics.uz" target="_blank" rel="noreferrer">CRM ↗</a>
            <a className="btn btn-ghost small" href="https://seedbee.uz" target="_blank" rel="noreferrer">Sayt ↗</a>
          </div>
        </header>

        <div className="grid kpis">
          <div className="card kpi lift rise" style={{ '--glow': GOLD, '--d': '40ms' } as React.CSSProperties}>
            <div className="kpi-label"><Wallet size={15} /> Bu oy tushum</div>
            <div className="kpi-value"><CountUp value={Math.round(d.revenue.month)} /><small>so&apos;m</small></div>
            <div className="kpi-sub">Bugun {compactSom(d.revenue.today)} · 7 kun {compactSom(d.revenue.week)}</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#60a5fa', '--d': '90ms' } as React.CSSProperties}>
            <div className="kpi-label"><ShoppingBag size={15} /> Buyurtmalar (bu oy)</div>
            <div className="kpi-value"><CountUp value={d.orders.month} /><small>ta</small></div>
            <div className="kpi-sub">{d.orders.toProcess} ta ishlov kutmoqda · {d.orders.unpaid} ta to&apos;lanmagan</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#34d399', '--d': '140ms' } as React.CSSProperties}>
            <div className="kpi-label"><Users size={15} /> Mijozlar</div>
            <div className="kpi-value"><CountUp value={d.customers.total} /></div>
            <div className="kpi-sub">7 kunda +{d.customers.week} · qayta xarid {t.repeat_rate}%</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#c084fc', '--d': '190ms' } as React.CSSProperties}>
            <div className="kpi-label"><Coins size={15} /> Cashback qarzi</div>
            <div className="kpi-value"><CountUp value={Math.round(d.cashback.liability.available)} /><small>so&apos;m</small></div>
            <div className="kpi-sub">{d.cashback.liability.customers} mijozda · kutilmoqda {compactSom(d.cashback.liability.pending)}</div>
          </div>
        </div>

        <div className="grid two">
          <div className="card rise" style={{ '--d': '240ms' } as React.CSSProperties}>
            <div className="card-h"><h2><TrendingUp size={16} /> Tushum, oxirgi 6 oy</h2><span className="chip">to&apos;langan buyurtmalar</span></div>
            <div className="cols">
              {d.revenue.trend.map((m, i) => (
                <div key={m.key} className="col" title={`${m.orders} ta buyurtma · ${som(m.revenue)}`}>
                  <span className="mono">{m.revenue ? compactSom(m.revenue) : '0'}</span>
                  <span className="col-bar" style={{ '--c': GOLD, '--h': `${(m.revenue / trendMax) * 100}%`, '--d': `${i * 70}ms` } as React.CSSProperties} />
                  <small>{uzMonth(m.key)}</small>
                </div>
              ))}
            </div>
          </div>
          <div className="card rise" style={{ '--d': '290ms' } as React.CSSProperties}>
            <div className="card-h"><h2><ShoppingBag size={16} /> Oxirgi 30 kun</h2><span className="chip">oldingi 30 kunga nisbatan</span></div>
            <div className="list">
              <div className="row"><span className="row-main"><b>Tushum</b><small><Change now={t.revenue} prev={p.revenue} /></small></span><span className="row-end"><b>{som(t.revenue)}</b></span></div>
              <div className="row"><span className="row-main"><b>Buyurtmalar</b><small>{t.paid_orders} ta to&apos;langan · {t.cancelled} ta bekor</small></span><span className="row-end"><b>{t.orders} ta</b></span></div>
              <div className="row"><span className="row-main"><b>Yangi mijozlar</b><small>oldin: {p.new_customers}</small></span><span className="row-end"><b>+{t.new_customers}</b></span></div>
              <div className="row"><span className="row-main"><b>O&apos;rtacha chek</b><small>to&apos;langan buyurtma bo&apos;yicha</small></span><span className="row-end"><b>{t.paid_orders ? som(t.revenue / t.paid_orders) : '—'}</b></span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="screen">
        <h2 className="screen-title">Qayerdan keladi va nima sotiladi</h2>
        <div className="grid two">
          <div className="grid" style={{ alignContent: 'start' }}>
            <div className="card rise">
              <div className="card-h"><h2><TrendingUp size={16} /> Kunlik tushum, 30 kun</h2><span className="chip">eng ko&apos;p: {compactSom(dayMax)}</span></div>
              <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="30 kunlik tushum grafigi">
                <defs>
                  <linearGradient id="sbFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={GOLD} stopOpacity="0.35" />
                    <stop offset="1" stopColor={GOLD} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#sbFill)" />
                <path className="line" d={line} fill="none" stroke={GOLD} strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between' }} className="faint small mono">
                <span>{daily[0]?.day}</span><span>{daily[daily.length - 1]?.day}</span>
              </div>
            </div>
            <div className="card rise" style={{ '--d': '80ms' } as React.CSSProperties}>
              <div className="card-h"><h2>Buyurtma manbasi va to&apos;lov usuli</h2><span className="chip">30 kun</span></div>
              {d.last30.bySource.map((s, i) => (
                <div key={s.key} className="bar-row" title={som(s.revenue)}>
                  <span><span className="swatch" style={{ '--c': PALETTE[i % PALETTE.length] } as React.CSSProperties} />{SOURCE[s.key] ?? s.key}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ '--c': PALETTE[i % PALETTE.length], '--w': `${(s.orders / srcMax) * 100}%`, '--d': `${i * 70}ms`, display: 'block' } as React.CSSProperties} /></span>
                  <span className="mono">{s.orders} ta · {compactSom(s.revenue)}</span>
                </div>
              ))}
              {!d.last30.bySource.length && <p className="empty">30 kunda buyurtma yo&apos;q</p>}
              {d.last30.byMethod.length > 0 && (
                <p className="faint small" style={{ margin: '10px 0 0' }}>
                  To&apos;lov: {d.last30.byMethod.map((m) => `${METHOD[m.key] ?? m.key} ${m.orders}`).join(' · ')}
                </p>
              )}
            </div>
          </div>

          <div className="grid" style={{ alignContent: 'start' }}>
            <div className="card rise" style={{ '--d': '120ms' } as React.CSSProperties}>
              <div className="card-h"><h2><Package size={16} /> Eng ko&apos;p sotilgan</h2><span className="chip">30 kun</span></div>
              <div className="list">
                {d.last30.topProducts.slice(0, 5).map((x) => (
                  <div key={x.key} className="row">
                    <span className="row-main"><b>{x.key}</b></span>
                    <span className="row-end"><b>{x.qty} dona</b><small>{compactSom(x.revenue)} so&apos;m</small></span>
                  </div>
                ))}
                {!d.last30.topProducts.length && <p className="empty">30 kunda sotuv yo&apos;q</p>}
              </div>
            </div>
            <div className="card rise" style={{ '--d': '140ms' } as React.CSSProperties}>
              <div className="card-h">
                <h2><Cpu size={16} /> AI (Claude) xarajati</h2>
                <span className="chip">{ai ? `bu oy ${ai.calls} chaqiruv` : "o'lchanmayapti"}</span>
              </div>
              {ai ? (
                <>
                  <div className="list">
                    <div className="row">
                      <span className="row-main"><b>Bu oy</b><small>bugun {som(ai.usd.today * usdRate)} · o&apos;tgan oy {som(ai.usd.prev * usdRate)}</small></span>
                      <span className="row-end"><b>{som(ai.usd.month * usdRate)}</b><small>${ai.usd.month.toFixed(2)}</small></span>
                    </div>
                  </div>
                  {ai.byFeature.slice(0, 5).map((f, i) => (
                    <div key={f.key} className="bar-row" title={`${f.calls} chaqiruv · $${f.usd.toFixed(3)}`}>
                      <span>{FEATURE[f.key] ?? f.key}</span>
                      <span className="bar-track"><span className="bar-fill" style={{ '--c': '#f472b6', '--w': `${(f.usd / aiMax) * 100}%`, '--d': `${i * 60}ms`, display: 'block' } as React.CSSProperties} /></span>
                      <span className="mono">{compactSom(f.usd * usdRate)}</span>
                    </div>
                  ))}
                  {!ai.byFeature.length && <p className="empty">Bu oy hali AI chaqirilmagan</p>}
                  <p className="faint small" style={{ margin: '8px 0 0' }}>
                    {ai.since} dan o&apos;lchanadi, token bo&apos;yicha hisob · {ai.byModel.map((m) => `${MODEL[m.key] ?? m.key} ${m.calls}`).join(' · ') || '—'}
                  </p>
                </>
              ) : <p className="empty">SeedBee&apos;da ai_usage o&apos;qilmadi</p>}
            </div>
            <div className="card rise" style={{ '--d': '160ms' } as React.CSSProperties}>
              <div className="card-h"><h2>Buyurtmalar holati</h2><span className="chip">hammasi</span></div>
              {statuses.map(([k, n], i) => (
                <div key={k} className="bar-row">
                  <span>{STATUS[k] ?? k}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ '--c': k === 'cancelled' ? '#f87171' : GOLD, '--w': `${(n / statusTotal) * 100}%`, '--d': `${i * 60}ms`, display: 'block' } as React.CSSProperties} /></span>
                  <span className="mono">{n}</span>
                </div>
              ))}
              {d.last30.byRegion.length > 0 && (
                <p className="faint small" style={{ margin: '10px 0 0' }}>
                  <MapPin size={12} style={{ verticalAlign: '-2px' }} /> {d.last30.byRegion.slice(0, 4).map((r) => `${r.key} ${r.orders}`).join(' · ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
