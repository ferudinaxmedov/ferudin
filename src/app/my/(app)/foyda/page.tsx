import { TrendingDown, TrendingUp, Wallet, Receipt } from 'lucide-react';
import { requireHub } from '@/lib/hub/guard';
import { getPnl } from '@/lib/hub/pnl';
import { monthCosts } from '@/lib/hub/costs';
import { PROJECTS } from '@/lib/hub/projects';
import { CountUp } from '../CountUp';
import { GoalButton } from './GoalButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Foyda' };

const fmt = (n: number) => `${Math.round(n).toLocaleString('ru-RU').replace(/\s/g, ' ')} so‘m`;
const compact = (n: number) => {
  const a = Math.abs(n);
  const s = a >= 1e9 ? `${(a / 1e9).toFixed(1)} mlrd` : a >= 1e6 ? `${(a / 1e6).toFixed(1)} mln` : a >= 1e3 ? `${Math.round(a / 1e3)} ming` : `${Math.round(a)}`;
  return `${n < 0 ? '−' : ''}${s}`;
};
const color = (k: string) => PROJECTS.find((p) => p.key === k)?.color ?? '#94A3B8';
const MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'];
const monthLabel = (key: string) => `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(2, 4)}`;

export default async function ProfitPage() {
  await requireHub();
  const [p, billed] = await Promise.all([getPnl(), monthCosts()]);
  const anth = billed.find((b) => b.provider === 'anthropic');
  const delta = p.totals.revenuePrev ? ((p.totals.revenue - p.totals.revenuePrev) / p.totals.revenuePrev) * 100 : null;
  const trendMax = Math.max(1, ...p.trend.map((t) => Object.values(t.byProject).reduce((a, b) => a + b, 0)));
  const missing = p.rows.reduce((a, r) => a + r.subsMissing, 0) + p.shared.subsMissing;

  return (
    <section className="screen">
      <header className="head rise">
        <div>
          <h1>Foyda</h1>
          <p>{monthLabel(p.month)} · {p.day}/{p.daysInMonth} kun · tushum − xarajat = sof foyda</p>
        </div>
      </header>

      <div className="grid kpis">
        <div className="card kpi lift rise" style={{ '--glow': '#34d399' } as React.CSSProperties}>
          <span className="kpi-label"><TrendingUp size={15} /> Tushum (bu oy)</span>
          <div className="kpi-value"><CountUp value={Math.round(p.totals.revenue)} /><small>so‘m</small></div>
          <div className="kpi-sub">{delta === null ? 'O‘tgan oy bilan solishtirib bo‘lmadi' : `O‘tgan oy: ${compact(p.totals.revenuePrev)} (${delta >= 0 ? '+' : ''}${delta.toFixed(0)}%, oy hali tugamagan)`}</div>
        </div>
        <div className="card kpi lift rise" style={{ '--glow': '#f87171', '--d': '60ms' } as React.CSSProperties}>
          <span className="kpi-label"><Receipt size={15} /> Xarajat</span>
          <div className="kpi-value"><CountUp value={Math.round(p.totals.costs)} /><small>so‘m</small></div>
          <div className="kpi-sub">Obunalar + API + SkyPlus chiqimi{missing ? ` · ${missing} ta obuna narxsiz` : ''}</div>
        </div>
        <div className="card kpi lift rise" style={{ '--glow': p.totals.profit >= 0 ? '#34d399' : '#f87171', '--d': '120ms' } as React.CSSProperties}>
          <span className="kpi-label">{p.totals.profit >= 0 ? <Wallet size={15} /> : <TrendingDown size={15} />} Sof foyda</span>
          <div className={`kpi-value ${p.totals.profit >= 0 ? 'pos' : 'neg'}`}><CountUp value={Math.round(p.totals.profit)} /><small>so‘m</small></div>
          <div className="kpi-sub">Marja: {p.totals.revenue ? `${((p.totals.profit / p.totals.revenue) * 100).toFixed(0)}%` : '—'}</div>
        </div>
      </div>

      <div className="card rise" style={{ '--d': '160ms' } as React.CSSProperties}>
        <div className="card-h"><h2>Loyihalar kesimida</h2><span className="faint small">Maqsad bo‘yicha bashorat = hozirgi sur’at × oy kunlari</span></div>
        <div className="table-wrap">
          <table className="table pnl">
            <thead>
              <tr><th>Loyiha</th><th className="num">Tushum</th><th className="num">Obunalar</th><th className="num">API</th><th className="num">Boshqa</th><th className="num">Foyda</th><th>Oylik maqsad</th></tr>
            </thead>
            <tbody>
              {p.rows.map((r) => {
                const pct = r.goal && r.revenue !== null ? Math.min(100, (r.revenue / r.goal) * 100) : null;
                const onTrack = r.goal && r.forecast !== null ? r.forecast >= r.goal : null;
                return (
                  <tr key={r.key}>
                    <td className="name"><b><span className="swatch" style={{ '--c': color(r.key) } as React.CSSProperties} /> {r.name}</b>
                      <small>{r.revenuePrev !== null && r.revenuePrev > 0 ? `O‘tgan oy: ${compact(r.revenuePrev)}` : r.revenue === null ? 'Ma’lumot o‘qilmadi' : ''}</small></td>
                    <td className="num">{r.revenue === null ? '—' : compact(r.revenue)}</td>
                    <td className="num">{r.subs ? compact(r.subs) : '—'}{r.subsMissing ? <span className="missing" title="Narxsiz obunalar"> +{r.subsMissing}?</span> : null}</td>
                    <td className="num">{r.api === null ? '—' : compact(r.api)}</td>
                    <td className="num">{r.own === null ? '—' : compact(r.own)}</td>
                    <td className={`num ${r.profit === null ? '' : r.profit >= 0 ? 'pos' : 'neg'}`}><b>{r.profit === null ? '—' : compact(r.profit)}</b></td>
                    <td className="goal-cell">
                      {r.goal ? (
                        <div className="goal">
                          <div className="goal-top"><span className="mono small">{Math.round(pct ?? 0)}% · {compact(r.goal)}</span><GoalButton project={r.key} name={r.name} current={r.goal} /></div>
                          <span className="bar-track"><span className="bar-fill" style={{ '--c': onTrack === false ? 'var(--warn)' : color(r.key), '--w': `${pct ?? 0}%`, display: 'block' } as React.CSSProperties} /></span>
                          {r.forecast !== null && <small className={onTrack ? 'pos' : 'warn'}>Bashorat: {compact(r.forecast)} {onTrack ? '✓' : '· sur’at yetmayapti'}</small>}
                        </div>
                      ) : r.revenue !== null && r.key !== 'aiblok' && r.key !== 'ferudin' ? <GoalButton project={r.key} name={r.name} current={null} /> : <span className="faint small">—</span>}
                    </td>
                  </tr>
                );
              })}
              <tr className="shared">
                <td className="name"><b>Umumiy xarajat</b><small>Umumiy + Kontent obunalari, hub chat</small></td>
                <td className="num">—</td>
                <td className="num">{compact(p.shared.subs)}{p.shared.subsMissing ? <span className="missing"> +{p.shared.subsMissing}?</span> : null}</td>
                <td className="num">{p.shared.api ? compact(p.shared.api) : '—'}</td>
                <td className="num">—</td>
                <td className="num neg"><b>{compact(-(p.shared.subs + p.shared.api))}</b></td>
                <td />
              </tr>
            </tbody>
            <tfoot>
              <tr><td><b>Jami</b></td><td className="num"><b>{fmt(p.totals.revenue)}</b></td><td colSpan={3} className="num faint">xarajat {fmt(p.totals.costs)}</td><td className={`num ${p.totals.profit >= 0 ? 'pos' : 'neg'}`}><b>{fmt(p.totals.profit)}</b></td><td /></tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="card rise" style={{ '--d': '220ms' } as React.CSSProperties}>
        <div className="card-h"><h2>Tushum, oxirgi 6 oy</h2><span className="faint small">Loyihalar ustma-ust</span></div>
        <div className="stack-chart" role="img" aria-label="Oxirgi 6 oy tushumi loyihalar bo'yicha">
          {p.trend.map((t, i) => {
            const total = Object.values(t.byProject).reduce((a, b) => a + b, 0);
            return (
              <div key={t.key} className="stack-col" title={`${monthLabel(t.key)}: ${fmt(total)}`}>
                <span className="mono small">{total ? compact(total) : ''}</span>
                <div className="stack-bar" style={{ '--h': `${(total / trendMax) * 100}%`, '--d': `${i * 70}ms` } as React.CSSProperties}>
                  {Object.entries(t.byProject).filter(([, v]) => v > 0).map(([k, v]) => (
                    <span key={k} style={{ background: color(k), flexGrow: v }} title={`${k}: ${fmt(v)}`} />
                  ))}
                </div>
                <span className="small faint">{monthLabel(t.key)}</span>
              </div>
            );
          })}
        </div>
        <p className="faint small" style={{ margin: '10px 0 0' }}>{anth
          ? <>Anthropic hisobi (haqiqiy, bu oy): <b>${anth.usd.toFixed(2)}</b> ≈ {compact(anth.usd * p.usdRate)} so‘m{anth.refreshed_at ? ` · ma’lumot ${new Date(anth.refreshed_at).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} holatiga` : ''}. Jadvaldagi API ustuni loyihalarning o‘z hisobi. </>
          : <>Anthropic’ning haqiqiy hisobini ko‘rish uchun Vercel’ga ANTHROPIC_ADMIN_KEY qo‘shing. </>}
          Hongsam faqat bu va o‘tgan oy uchun bor. Xarajatlarning oyma-oy tarixi hali saqlanmaydi, shuning uchun grafik faqat tushumni ko‘rsatadi. Kurs: {p.usdRate.toLocaleString('ru-RU')} so‘m.</p>
      </div>
    </section>
  );
}
