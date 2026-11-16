import { BookOpen, Bot, Cpu, MapPin, PlugZap, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import { requireHub } from '@/lib/hub/guard';
import { compactSom, delta, getSettings, som } from '@/lib/hub/data';
import { getHongsam } from '@/lib/hub/aiblok-hongsam';
import { CountUp } from '../CountUp';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Hongsam' };

const RED = '#F87171';
const VIA: Record<string, string> = { site: 'Sayt', miniapp: 'Telegram Mini App' };
const FROM: Record<string, string> = { site: 'Saytdagi tugma', command: 'Bot buyrugʻi' };

export default async function HongsamPage() {
  await requireHub();
  const [r, { usdRate }] = await Promise.all([getHongsam(), getSettings()]);

  if (!r.ok) {
    return (
      <section className="screen">
        <header className="head rise"><div><h1>Hongsam</h1><p>Buyurtmalar, qo&apos;llanma va AI qidiruv</p></div></header>
        <div className="callout rise"><PlugZap size={18} /><div><b>Hongsam hodisalari o&apos;qilmadi</b><p>{r.reason}</p></div></div>
      </section>
    );
  }

  const d = r.data;
  const o = d.orders;
  const ch = delta(o.sumMonth, o.prevSum);
  const dayMax = Math.max(1, ...d.daily.map((x) => x.sum));
  const viaMax = Math.max(1, ...d.byVia.map((v) => v.count));
  const since = d.since
    ? new Intl.DateTimeFormat('uz-UZ', { timeZone: 'Asia/Tashkent', day: 'numeric', month: 'long' }).format(new Date(d.since))
    : null;

  return (
    <>
      <section className="screen fit">
        <header className="head rise">
          <div>
            <h1>Hongsam</h1>
            <p>{since ? `${since} dan yig'ilmoqda` : "Hali hodisa kelmagan"} · buyurtma summasi = savatdagi narx (to&apos;lov tasdiqlanishi bu yerda ko&apos;rinmaydi)</p>
          </div>
          <div className="head-actions">
            <a className="btn btn-ghost small" href="https://hongsam.uz" target="_blank" rel="noreferrer">Sayt ↗</a>
            <a className="btn btn-ghost small" href="https://t.me/hongsamuzbot" target="_blank" rel="noreferrer">Bot ↗</a>
          </div>
        </header>

        {!d.since && (
          <div className="callout rise">
            <PlugZap size={18} />
            <div>
              <b>Hongsam hali hodisa yubormagan</b>
              <p>hongsam.uz Vercel&apos;ida <span className="mono">HUB_EVENT_TOKEN</span>, bu yerda <span className="mono">HONGSAM_HUB_TOKEN</span> bir xil qiymat bilan bo&apos;lishi va sayt deploy qilinishi kerak. Shundan keyingi buyurtmalar sanaladi.</p>
            </div>
          </div>
        )}

        <div className="grid kpis">
          <div className="card kpi lift rise" style={{ '--glow': RED, '--d': '40ms' } as React.CSSProperties}>
            <div className="kpi-label"><Wallet size={15} /> Bu oy buyurtma summasi</div>
            <div className="kpi-value"><CountUp value={Math.round(o.sumMonth)} /><small>so&apos;m</small></div>
            <div className="kpi-sub">
              {ch === null ? `7 kun ${compactSom(o.sumWeek)}` : <span className={ch >= 0 ? 'up' : 'down'}>{ch >= 0 ? '▲' : '▼'} {Math.abs(ch)}% o&apos;tgan oyga nisbatan</span>}
            </div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#F5B83D', '--d': '90ms' } as React.CSSProperties}>
            <div className="kpi-label"><ShoppingBag size={15} /> Buyurtmalar (bu oy)</div>
            <div className="kpi-value"><CountUp value={o.month} /><small>ta</small></div>
            <div className="kpi-sub">Bugun {o.today} · 7 kun {o.week} · {o.qtyMonth} dona</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#34d399', '--d': '140ms' } as React.CSSProperties}>
            <div className="kpi-label"><BookOpen size={15} /> Qo&apos;llanma olganlar</div>
            <div className="kpi-value"><CountUp value={d.guides.month} /></div>
            <div className="kpi-sub">Bu oy · jami {d.guides.total} · botni ochgan {d.starts.month}</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#60a5fa', '--d': '190ms' } as React.CSSProperties}>
            <div className="kpi-label"><TrendingUp size={15} /> O&apos;rtacha chek</div>
            <div className="kpi-value"><CountUp value={Math.round(o.avg)} /><small>so&apos;m</small></div>
            <div className="kpi-sub">O&apos;tgan oy: {o.prevMonth} ta · {compactSom(o.prevSum)}</div>
          </div>
        </div>

        <div className="grid two">
          <div className="card rise" style={{ '--d': '240ms' } as React.CSSProperties}>
            <div className="card-h"><h2><TrendingUp size={16} /> Kunlik buyurtma summasi, 30 kun</h2><span className="chip">eng ko&apos;p: {compactSom(dayMax)}</span></div>
            <div className="cols dense">
              {d.daily.map((x, i) => (
                <div key={x.day} className="col" title={`${x.day}: ${x.orders} ta · ${som(x.sum)} · qo'llanma ${x.guides}`}>
                  <span className="col-bar" style={{ '--c': RED, '--h': `${(x.sum / dayMax) * 100}%`, '--d': `${i * 15}ms` } as React.CSSProperties} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }} className="faint small mono">
              <span>{d.daily[0]?.day}</span><span>{d.daily[d.daily.length - 1]?.day}</span>
            </div>
          </div>
          <div className="card rise" style={{ '--d': '290ms' } as React.CSSProperties}>
            <div className="card-h"><h2><ShoppingBag size={16} /> Buyurtma qayerdan</h2><span className="chip">bu oy</span></div>
            {d.byVia.map((v, i) => (
              <div key={v.key} className="bar-row">
                <span>{VIA[v.key] ?? v.key}</span>
                <span className="bar-track"><span className="bar-fill" style={{ '--c': i ? '#60a5fa' : RED, '--w': `${(v.count / viaMax) * 100}%`, '--d': `${i * 70}ms`, display: 'block' } as React.CSSProperties} /></span>
                <span className="mono">{v.count} ta · {compactSom(v.sum)}</span>
              </div>
            ))}
            {!d.byVia.length && <p className="empty">Bu oy buyurtma yo&apos;q</p>}
            {d.byLang.length > 0 && <p className="faint small" style={{ margin: '10px 0 0' }}>Til: {d.byLang.map((l) => `${l.key.toUpperCase()} ${l.count}`).join(' · ')}</p>}
          </div>
        </div>
      </section>

      <section className="screen">
        <h2 className="screen-title">Viloyatlar, qo&apos;llanma va AI qidiruv</h2>
        <div className="grid two">
          <div className="card rise">
            <div className="card-h"><h2><MapPin size={16} /> Viloyatlar</h2><span className="chip">bu oy</span></div>
            <div className="list">
              {d.byRegion.map((x) => (
                <div key={x.key} className="row"><span className="row-main"><b>{x.key}</b></span><span className="row-end"><b>{x.count} ta</b><small>{compactSom(x.sum)} so&apos;m</small></span></div>
              ))}
              {!d.byRegion.length && <p className="empty">Bu oy buyurtma yo&apos;q</p>}
            </div>
          </div>
          <div className="grid" style={{ alignContent: 'start' }}>
            <div className="card rise" style={{ '--d': '80ms' } as React.CSSProperties}>
              <div className="card-h"><h2><Bot size={16} /> Qo&apos;llanma voronkasi</h2><span className="chip">bu oy</span></div>
              <div className="list">
                {d.guides.byFrom.map((g) => (
                  <div key={g.key} className="row"><span className="row-main"><b>{FROM[g.key] ?? g.key}</b></span><span className="row-end"><b>{g.count}</b></span></div>
                ))}
                <div className="row">
                  <span className="row-main"><b>Buyurtma / qo&apos;llanma</b><small>taxminiy: buyurtma bergan har kim qo&apos;llanma olgan bo&apos;lishi shart emas</small></span>
                  <span className="row-end"><b>{d.conv === null ? '—' : `${d.conv}%`}</b></span>
                </div>
              </div>
            </div>
            <div className="card rise" style={{ '--d': '120ms' } as React.CSSProperties}>
              <div className="card-h"><h2><Cpu size={16} /> AI qidiruv (Claude)</h2><span className="chip">bu oy {d.search.month} ta</span></div>
              <div className="list">
                <div className="row">
                  <span className="row-main"><b>Bu oy xarajat</b><small>token bo&apos;yicha hisob · jami {som(d.search.usdTotal * usdRate)}</small></span>
                  <span className="row-end"><b>{som(d.search.usdMonth * usdRate)}</b><small>${d.search.usdMonth.toFixed(2)}</small></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
