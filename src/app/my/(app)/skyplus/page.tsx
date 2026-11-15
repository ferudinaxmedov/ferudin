import { AlertTriangle, BadgeCheck, Briefcase, CalendarCheck, GraduationCap, Megaphone, PlugZap, TrendingUp, Wallet } from 'lucide-react';
import { requireHub } from '@/lib/hub/guard';
import { compactSom, delta, getSkyplus, som, uzMonth } from '@/lib/hub/data';
import { CountUp } from '../CountUp';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'SkyPlus' };

const VIOLET = '#8B9CFF';
const SPACE: Record<string, { name: string; color: string }> = {
  academy: { name: "O'quv markaz", color: VIOLET },
  consulting: { name: 'Konsalting', color: '#34d399' },
  shared: { name: 'Umumiy', color: '#94a3b8' },
};
const LEAD_SRC: Record<string, string> = { site: 'Sayt', telegram: 'Telegram', instagram: 'Instagram', call: "Qo'ng'iroq", referral: 'Tavsiya', walkin: "O'zi keldi", other: 'Boshqa' };
const STAGE: Record<string, string> = {
  consult: 'Maslahat', contract: 'Shartnoma', documents: 'Hujjatlar', translation: 'Tarjima', applied: 'Topshirildi', admission: 'Qabul',
  tuition: "Kontrakt to'lovi", bank: 'Bank', visa_submitted: 'Viza topshirildi', visa_result: 'Viza javobi', flight: 'Parvoz', arrived: 'Yetib keldi',
};
const GROUP: Record<string, string> = { forming: "Yig'ilmoqda", active: 'Faol', finished: 'Tugagan' };
const ENROLL: Record<string, string> = { trial: 'Sinov', active: 'Faol', paused: "To'xtatilgan", left: 'Ketgan' };

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const pairText = (p: { UZS: number; USD: number }) => [p.UZS ? som(p.UZS) : '', p.USD ? usd(p.USD) : ''].filter(Boolean).join(' + ') || '0';
const tallyText = (o: Record<string, number>, names: Record<string, string>) =>
  Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${names[k] ?? k} ${n}`).join(' · ') || '—';

export default async function SkyplusPage() {
  await requireHub();
  const sp = await getSkyplus();

  if (!sp.ok) {
    return (
      <section className="screen">
        <header className="head rise"><div><h1>SkyPlus</h1><p>O&apos;quv markaz, konsalting, tushum va qarzlar</p></div></header>
        <div className="callout rise">
          <PlugZap size={18} />
          <div>
            <b>SkyPlus hali ulanmagan</b>
            <p>{sp.reason}. crm.skyplus.uz Vercel&apos;ida <span className="mono">HUB_STATS_TOKEN</span>, bu yerda <span className="mono">SKYPLUS_HUB_TOKEN</span> bir xil qiymat bilan o&apos;rnatilishi va CRM deploy qilinishi kerak.</p>
          </div>
        </div>
      </section>
    );
  }

  const d = sp.data;
  const m = d.money.month;
  const trendMax = Math.max(1, ...d.money.trend.map((x) => Math.max(x.inUzs, x.outUzs)));
  const change = delta(m.inUzs, d.money.prev.inUzs);
  const spaces = Object.entries(d.money.bySpace).sort((a, b) => b[1].uzs - a[1].uzs);
  const spaceMax = Math.max(1, ...spaces.map(([, v]) => v.uzs));
  const activeStudents = (d.academy.enrollments.active ?? 0) + (d.academy.enrollments.trial ?? 0);
  const activeGroups = (d.academy.groups.active ?? 0) + (d.academy.groups.forming ?? 0);
  const stages = Object.entries(d.consulting.byStage).sort((a, b) => b[1] - a[1]);
  const stageMax = Math.max(1, ...stages.map(([, n]) => n));
  const updated = new Intl.DateTimeFormat('uz-UZ', { timeZone: 'Asia/Tashkent', hour: '2-digit', minute: '2-digit' }).format(new Date(d.generatedAt));
  const att = d.academy.attendance30d;

  const checks = [
    { ok: d.health.notifyFailed === 0, label: 'Telegram xabarlari', text: d.health.notifyFailed ? `${d.health.notifyFailed} tasi yuborilmadi` : d.health.notifyPending ? `${d.health.notifyPending} tasi navbatda` : 'Hammasi yuborilgan' },
    { ok: d.debts.count === 0, label: 'Qarzdorlar', text: d.debts.count ? `${d.debts.count} ta · ${pairText(d.debts)}` : "Qarz yo'q" },
    { ok: d.leads.open === 0, label: 'Javob kutayotgan lidlar', text: d.leads.open ? `${d.leads.open} ta ochiq lid` : "Ochiq lid yo'q" },
    { ok: !!d.fx.day, label: 'Dollar kursi', text: d.fx.day ? `${d.fx.usdUzs.toLocaleString('ru-RU')} so'm · ${d.fx.day}` : "Kurs o'qilmadi" },
  ];

  return (
    <>
      <section className="screen fit">
        <header className="head rise">
          <div>
            <h1>SkyPlus</h1>
            <p>Jonli ma&apos;lumot · {updated} da yangilandi · dollar summalar {d.fx.usdUzs.toLocaleString('ru-RU')} kurs bilan so&apos;mga o&apos;girilgan</p>
          </div>
          <div className="head-actions">
            <a className="btn btn-ghost small" href="https://crm.skyplus.uz" target="_blank" rel="noreferrer">CRM ↗</a>
            <a className="btn btn-ghost small" href="https://skyplus.uz" target="_blank" rel="noreferrer">Sayt ↗</a>
          </div>
        </header>

        <div className="grid kpis">
          <div className="card kpi lift rise" style={{ '--glow': VIOLET, '--d': '40ms' } as React.CSSProperties}>
            <div className="kpi-label"><Wallet size={15} /> Bu oy kirim</div>
            <div className="kpi-value"><CountUp value={m.inUzs} /><small>so&apos;m</small></div>
            <div className="kpi-sub">
              {pairText(m.in)}
              {change !== null && <> · <span className={change >= 0 ? 'up' : 'down'}>{change >= 0 ? '▲' : '▼'} {Math.abs(change)}%</span></>}
            </div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#34d399', '--d': '90ms' } as React.CSSProperties}>
            <div className="kpi-label"><GraduationCap size={15} /> Faol o&apos;quvchilar</div>
            <div className="kpi-value"><CountUp value={activeStudents} /></div>
            <div className="kpi-sub">{activeGroups} guruh · bazada {d.academy.students} kishi · bu oy +{d.academy.newThisMonth}</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#f87171', '--d': '140ms' } as React.CSSProperties}>
            <div className="kpi-label"><AlertTriangle size={15} /> Qarzlar</div>
            <div className="kpi-value"><CountUp value={d.debts.uzs} /><small>so&apos;m</small></div>
            <div className="kpi-sub">{d.debts.count} ta o&apos;quvchi · o&apos;quv markaz to&apos;lovlari</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#fbbf24', '--d': '190ms' } as React.CSSProperties}>
            <div className="kpi-label"><Briefcase size={15} /> Konsalting arizalari</div>
            <div className="kpi-value"><CountUp value={d.consulting.openCases} /><small>ochiq</small></div>
            <div className="kpi-sub">{d.leads.open} ta ochiq lid · bu oy +{d.leads.newThisMonth} lid</div>
          </div>
        </div>

        <div className="grid two">
          <div className="card rise" style={{ '--d': '240ms' } as React.CSSProperties}>
            <div className="card-h"><h2><TrendingUp size={16} /> Kirim va chiqim, 6 oy</h2><span className="chip">so&apos;m</span></div>
            <div className="cols">
              {d.money.trend.map((x, i) => (
                <div key={x.key} className="col" title={`Kirim ${pairText(x.in)} · chiqim ${pairText(x.out)}`}>
                  <span className="mono">{x.inUzs ? compactSom(x.inUzs) : '0'}</span>
                  <span className="col-bar" style={{ '--c': VIOLET, '--h': `${(x.inUzs / trendMax) * 100}%`, '--d': `${i * 70}ms` } as React.CSSProperties} />
                  <small>{uzMonth(x.key)}</small>
                </div>
              ))}
            </div>
            <p className="faint small" style={{ margin: '8px 0 0' }}>Bu oy chiqim (qaytarish, xarajat): {pairText(m.out)}</p>
          </div>
          <div className="card rise" style={{ '--d': '290ms' } as React.CSSProperties}>
            <div className="card-h"><h2><Wallet size={16} /> Bu oy kirim: qaysi bo&apos;limdan</h2></div>
            {spaces.map(([k, v], i) => {
              const meta = SPACE[k] ?? { name: k, color: '#94a3b8' };
              return (
                <div key={k} className="bar-row" title={pairText(v)}>
                  <span><span className="swatch" style={{ '--c': meta.color } as React.CSSProperties} />{meta.name}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ '--c': meta.color, '--w': `${(v.uzs / spaceMax) * 100}%`, '--d': `${i * 70}ms`, display: 'block' } as React.CSSProperties} /></span>
                  <span className="mono">{compactSom(v.uzs)}</span>
                </div>
              );
            })}
            {!spaces.length && <p className="empty">Bu oy hali kirim yo&apos;q</p>}
            <p className="faint small" style={{ margin: '8px 0 0' }}>Guruhlar: {tallyText(d.academy.groups, GROUP)}</p>
            <p className="faint small" style={{ margin: '4px 0 0' }}>O&apos;quvchilar: {tallyText(d.academy.enrollments, ENROLL)}</p>
          </div>
        </div>
      </section>

      <section className="screen">
        <h2 className="screen-title">Lidlar, arizalar va markaz holati</h2>
        <div className="grid two">
          <div className="grid" style={{ alignContent: 'start' }}>
            <div className="card rise">
              <div className="card-h"><h2><Briefcase size={16} /> Konsalting arizalari bosqichlari</h2><span className="chip">ochiq</span></div>
              {stages.map(([k, n], i) => (
                <div key={k} className="bar-row">
                  <span>{STAGE[k] ?? k}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ '--c': '#34d399', '--w': `${(n / stageMax) * 100}%`, '--d': `${i * 60}ms`, display: 'block' } as React.CSSProperties} /></span>
                  <span className="mono">{n}</span>
                </div>
              ))}
              {!stages.length && <p className="empty">Ochiq ariza yo&apos;q</p>}
            </div>
            <div className="card rise" style={{ '--d': '80ms' } as React.CSSProperties}>
              <div className="card-h"><h2><Megaphone size={16} /> Lidlar</h2><span className="chip">jami {d.leads.total}</span></div>
              <div className="list">
                <div className="row"><span className="row-main"><b>Manba</b><small>{tallyText(d.leads.bySource, LEAD_SRC)}</small></span></div>
                <div className="row"><span className="row-main"><b>Holat</b><small>{tallyText(d.leads.byStatus, { new: 'Yangi', contacted: "Bog'lanildi", consult: 'Maslahat', converted: 'Mijoz bo‘ldi', lost: "Yo'qotildi" })}</small></span></div>
              </div>
            </div>
          </div>

          <div className="card rise" style={{ '--d': '120ms' } as React.CSSProperties}>
            <div className="card-h"><h2><BadgeCheck size={16} /> Markaz holati</h2><a href="https://crm.skyplus.uz" target="_blank" rel="noreferrer">CRM ↗</a></div>
            <div className="list">
              {checks.map((c) => (
                <div key={c.label} className={`signal ${c.ok ? 'ok' : 'warn'}`}>
                  <span className="signal-ico">{c.ok ? <BadgeCheck size={15} /> : <AlertTriangle size={15} />}</span>
                  <span><b>{c.label}</b><small>{c.text}</small></span>
                </div>
              ))}
              <div className="row">
                <span className="row-main"><b><CalendarCheck size={14} style={{ verticalAlign: '-2px' }} /> Davomat, 30 kun</b><small>{att.marked ? `${att.marked} ta belgi` : 'Hali belgilanmagan'}</small></span>
                <span className="row-end"><b>{att.pct !== null ? `${att.pct}%` : '—'}</b></span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
