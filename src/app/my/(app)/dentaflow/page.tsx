import { Activity, AlertTriangle, BadgeCheck, Cpu, Hospital, PlugZap, TrendingUp, Wallet } from 'lucide-react';
import { requireHub } from '@/lib/hub/guard';
import { compactSom, getDentaflow, som } from '@/lib/hub/data';
import { CountUp } from '../CountUp';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'DentaFlow' };

const PROVIDER: Record<string, { name: string; color: string }> = {
  anthropic: { name: 'Anthropic (Claude)', color: '#e8956b' },
  gemini: { name: 'Gemini (Sofiya)', color: '#60a5fa' },
  eskiz: { name: 'Eskiz SMS', color: '#34d399' },
  resend: { name: 'Resend email', color: '#c084fc' },
};
const TEAL = '#3ECFB2';
const UZ_MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'];

/** The trend is the last N calendar months ending with the current one; DentaFlow's own labels are Russian. */
function monthLabel(t: { key?: string }, i: number, n: number): string {
  if (t.key) return UZ_MONTHS[Number(t.key.slice(5, 7)) - 1] ?? t.key;
  const now = new Date(Date.now() + 5 * 3_600_000);
  return UZ_MONTHS[(now.getUTCMonth() - (n - 1 - i) + 120) % 12];
}

export default async function DentaflowPage() {
  await requireHub();
  const df = await getDentaflow();

  if (!df.ok) {
    return (
      <section className="screen">
        <header className="head rise"><div><h1>DentaFlow</h1><p>Klinikalar, tushum, API xarajati va platforma holati</p></div></header>
        <div className="callout rise">
          <PlugZap size={18} />
          <div>
            <b>DentaFlow hali ulanmagan</b>
            <p>{df.reason}. DentaFlow Vercel&apos;ida <span className="mono">HUB_STATS_TOKEN</span>, bu yerda <span className="mono">DENTAFLOW_HUB_TOKEN</span> bir xil qiymat bilan o&apos;rnatilishi kerak.</p>
          </div>
        </div>
      </section>
    );
  }

  const d = df.data;
  const trendMax = Math.max(1, ...d.revenue.trend.map((t) => t.amount));
  const provMax = Math.max(1, ...d.costs.providers.map((p) => p.month));
  const daily = d.costs.daily;
  const dayMax = Math.max(1, ...daily.map((x) => x.som));
  const W = 600, H = 110;
  const pts = daily.map((x, i) => [(i / Math.max(1, daily.length - 1)) * W, H - 8 - (x.som / dayMax) * (H - 20)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;
  const h = d.health;
  const updated = new Intl.DateTimeFormat('uz-UZ', { timeZone: 'Asia/Tashkent', hour: '2-digit', minute: '2-digit' }).format(new Date(d.generatedAt));
  const budgetPct = d.costs.budget > 0 ? Math.round((d.costs.total.month / d.costs.budget) * 100) : null;

  const checks = h ? [
    { ok: !h.missingEnv.length, label: 'Server kalitlari', text: h.missingEnv.length ? `Yo'q: ${h.missingEnv.join(', ')}` : 'Hammasi joyida' },
    { ok: !h.lateCrons.length, label: 'Cron vazifalar', text: h.lateCrons.length ? `Kechikdi: ${h.lateCrons.join(', ')}` : `${h.cronCount} tasi vaqtida` },
    { ok: !h.botStale, label: 'Telegram bot (Railway)', text: h.botStale ? 'Signal kelmayapti' : 'Ishlayapti' },
    { ok: !h.eskizLow, label: 'Eskiz balansi', text: h.eskizBalance === null ? "O'qilmadi" : som(h.eskizBalance) },
    { ok: h.issues7d === 0, label: 'Xatolar (oxirgi yozuvlar)', text: h.issues7d ? `${h.issues7d} ta ogohlantirish/xato` : "Yo'q" },
  ] : [];

  return (
    <>
      <section className="screen fit">
        <header className="head rise">
          <div>
            <h1>DentaFlow</h1>
            <p>Jonli ma&apos;lumot · {updated} da yangilandi</p>
          </div>
          <div className="head-actions">
            <a className="btn btn-ghost small" href="https://console.dentaflow.uz/superadmin/dashboard" target="_blank" rel="noreferrer">Console ↗</a>
            <a className="btn btn-ghost small" href="https://dentaflow.uz" target="_blank" rel="noreferrer">Sayt ↗</a>
          </div>
        </header>

        <div className="grid kpis">
          <div className="card kpi lift rise" style={{ '--glow': TEAL, '--d': '40ms' } as React.CSSProperties}>
            <div className="kpi-label"><Hospital size={15} /> To&apos;lovchi klinikalar</div>
            <div className="kpi-value"><CountUp value={d.clinics.paying} /><small>/ {d.clinics.total}</small></div>
            <div className="kpi-sub">{d.clinics.trial} sinovda · {d.clinics.stopped} to&apos;xtagan · bu oy +{d.clinics.newThisMonth}</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#34d399', '--d': '90ms' } as React.CSSProperties}>
            <div className="kpi-label"><TrendingUp size={15} /> MRR</div>
            <div className="kpi-value"><CountUp value={d.revenue.mrr} /><small>so&apos;m</small></div>
            <div className="kpi-sub">Har oy takrorlanadigan tushum</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#fbbf24', '--d': '140ms' } as React.CSSProperties}>
            <div className="kpi-label"><Wallet size={15} /> Bu oy tushum</div>
            <div className="kpi-value"><CountUp value={d.revenue.month} /><small>so&apos;m</small></div>
            <div className="kpi-sub">Jami: {compactSom(d.revenue.total)} so&apos;m{d.revenue.pendingCount ? ` · ${d.revenue.pendingCount} ta kutmoqda` : ''}</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#f472b6', '--d': '190ms' } as React.CSSProperties}>
            <div className="kpi-label"><Cpu size={15} /> API xarajati (bu oy)</div>
            <div className="kpi-value"><CountUp value={Math.round(d.costs.total.month)} /><small>so&apos;m</small></div>
            <div className="kpi-sub">
              Bugun {compactSom(d.costs.total.today)} · o&apos;tgan oy {compactSom(d.costs.total.prev)}
              {budgetPct !== null ? ` · byudjetning ${budgetPct}%` : ''}
            </div>
          </div>
        </div>

        <div className="grid two">
          <div className="card rise" style={{ '--d': '240ms' } as React.CSSProperties}>
            <div className="card-h"><h2><TrendingUp size={16} /> Tushum, oxirgi 6 oy</h2><span className="chip">so&apos;m</span></div>
            <div className="cols">
              {d.revenue.trend.map((t, i) => (
                <div key={t.label + i} className="col">
                  <span className="mono">{t.amount ? compactSom(t.amount) : '0'}</span>
                  <span className="col-bar" style={{ '--c': TEAL, '--h': `${(t.amount / trendMax) * 100}%`, '--d': `${i * 70}ms` } as React.CSSProperties} />
                  <small>{monthLabel(t, i, d.revenue.trend.length)}</small>
                </div>
              ))}
            </div>
          </div>
          <div className="card rise" style={{ '--d': '290ms' } as React.CSSProperties}>
            <div className="card-h"><h2><Cpu size={16} /> API xarajati: kim qancha</h2><span className="chip">bu oy</span></div>
            {d.costs.providers.map((p, i) => {
              const meta = PROVIDER[p.provider] ?? { name: p.provider, color: '#94a3b8' };
              return (
                <div key={p.provider} className="bar-row" title={`${p.units} ${p.unitLabel}${p.estimate ? ' · taxminiy' : ''} · o'tgan oy ${som(p.prev)}`}>
                  <span><span className="swatch" style={{ '--c': meta.color } as React.CSSProperties} />{meta.name}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ '--c': meta.color, '--w': `${(p.month / provMax) * 100}%`, '--d': `${i * 70}ms`, display: 'block' } as React.CSSProperties} /></span>
                  <span className="mono">{compactSom(p.month)} · {p.units} {p.unitLabel}</span>
                </div>
              );
            })}
            <p className="faint small" style={{ margin: '8px 0 0' }}>Claude va Gemini summalari token/daqiqa bo&apos;yicha taxminiy hisob.</p>
          </div>
        </div>
      </section>

      <section className="screen">
        <h2 className="screen-title">Sarf dinamikasi va platforma holati</h2>
        <div className="grid two">
          <div className="grid" style={{ alignContent: 'start' }}>
            <div className="card rise">
              <div className="card-h"><h2><Activity size={16} /> Kunlik API xarajati, 30 kun</h2><span className="chip">eng ko&apos;p: {compactSom(dayMax)}</span></div>
              <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="30 kunlik API xarajati grafigi">
                <defs>
                  <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f472b6" stopOpacity="0.35" />
                    <stop offset="1" stopColor="#f472b6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#sparkFill)" />
                <path className="line" d={line} fill="none" stroke="#f472b6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between' }} className="faint small mono">
                <span>{daily[0]?.day}</span><span>{daily[daily.length - 1]?.day}</span>
              </div>
            </div>
            <div className="card rise" style={{ '--d': '80ms' } as React.CSSProperties}>
              <div className="card-h"><h2>Eng ko&apos;p sarflagan funksiyalar</h2></div>
              <div className="list">
                {d.costs.features.slice(0, 5).map((f) => (
                  <div key={f.provider + f.feature} className="row">
                    <span className="swatch" style={{ '--c': PROVIDER[f.provider]?.color } as React.CSSProperties} />
                    <span className="row-main"><b className="mono">{f.feature}</b><small>{PROVIDER[f.provider]?.name ?? f.provider} · {f.count} marta</small></span>
                    <span className="row-end"><b>{som(f.som)}</b></span>
                  </div>
                ))}
                {!d.costs.features.length && <p className="empty">Bu oy hali sarf yo&apos;q</p>}
              </div>
            </div>
          </div>

          <div className="card rise" style={{ '--d': '120ms' } as React.CSSProperties}>
            <div className="card-h"><h2><BadgeCheck size={16} /> Platforma holati</h2><a href="https://console.dentaflow.uz/superadmin/health" target="_blank" rel="noreferrer">Batafsil ↗</a></div>
            {h ? (
              <div className="list">
                {checks.map((c) => (
                  <div key={c.label} className={`signal ${c.ok ? 'ok' : 'warn'}`}>
                    <span className="signal-ico">{c.ok ? <BadgeCheck size={15} /> : <AlertTriangle size={15} />}</span>
                    <span><b>{c.label}</b><small>{c.text}</small></span>
                  </div>
                ))}
                <div className="row"><span className="row-main"><small>Baza javob vaqti</small></span><span className="row-end"><b>{h.dbMs} ms</b></span></div>
              </div>
            ) : <p className="empty">Holat ma&apos;lumoti o&apos;qilmadi</p>}
            <div className="card-h" style={{ marginTop: 14 }}><h2>Tariflar</h2></div>
            {d.clinics.plans.map((p) => (
              <div key={p.plan} className="bar-row">
                <span style={{ textTransform: 'capitalize' }}>{p.plan}</span>
                <span className="bar-track"><span className="bar-fill" style={{ '--c': TEAL, '--w': `${(p.count / Math.max(1, d.clinics.total)) * 100}%`, display: 'block' } as React.CSSProperties} /></span>
                <span className="mono">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
