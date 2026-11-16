import { BookOpen, Heart, Link2, ListChecks, MessageCircleQuestion, Megaphone, PlugZap, Send, Users } from 'lucide-react';
import { requireHub } from '@/lib/hub/guard';
import { getAiblok } from '@/lib/hub/aiblok-hongsam';
import { CountUp } from '../CountUp';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'AI Blok' };

const VIOLET = '#C084FC';
const PALETTE = ['#C084FC', '#60a5fa', '#34d399', '#F5B83D', '#f472b6', '#94a3b8'];
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export default async function AiblokPage() {
  await requireHub();
  const r = await getAiblok();

  if (!r.ok) {
    return (
      <section className="screen">
        <header className="head rise"><div><h1>AI Blok</h1><p>Kanal, bot va community</p></div></header>
        <div className="callout rise"><PlugZap size={18} /><div><b>AI Blok jadvallari o&apos;qilmadi</b><p>{r.reason}</p></div></div>
      </section>
    );
  }

  const d = r.data;
  const m = d.members;
  const e = d.engagement30;
  const dayMax = Math.max(1, ...m.daily.map((x) => x.count));
  const linkMax = Math.max(1, ...d.links.map((l) => l.clicks));
  const lastPost = d.posts.lastAt
    ? new Intl.DateTimeFormat('uz-UZ', { timeZone: 'Asia/Tashkent', day: 'numeric', month: 'short' }).format(new Date(d.posts.lastAt))
    : '—';

  return (
    <>
      <section className="screen fit">
        <header className="head rise">
          <div>
            <h1>AI Blok</h1>
            <p>Jonli ma&apos;lumot · Mini App a&apos;zolari, maqolalar, savollar va havolalar</p>
          </div>
          <div className="head-actions">
            <a className="btn btn-ghost small" href="https://community.ferudin.uz/admin" target="_blank" rel="noreferrer">Admin ↗</a>
            <a className="btn btn-ghost small" href="https://community.ferudin.uz" target="_blank" rel="noreferrer">Mini App ↗</a>
          </div>
        </header>

        <div className="grid kpis">
          <div className="card kpi lift rise" style={{ '--glow': VIOLET, '--d': '40ms' } as React.CSSProperties}>
            <div className="kpi-label"><Users size={15} /> A&apos;zolar</div>
            <div className="kpi-value"><CountUp value={m.total} /></div>
            <div className="kpi-sub">Bu oy +{m.newMonth} · 7 kunda faol {m.active7d}</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#60a5fa', '--d': '90ms' } as React.CSSProperties}>
            <div className="kpi-label"><Send size={15} /> Kanalga obuna</div>
            <div className="kpi-value"><CountUp value={m.subscribed} /><small>{pct(m.subscribed, m.total)}%</small></div>
            <div className="kpi-sub">Botni ochgan: {m.botStarted} ({pct(m.botStarted, m.total)}%)</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#34d399', '--d': '140ms' } as React.CSSProperties}>
            <div className="kpi-label"><BookOpen size={15} /> O&apos;qishlar (30 kun)</div>
            <div className="kpi-value"><CountUp value={e.reads} /></div>
            <div className="kpi-sub">{e.readers} kishi · {d.posts.live} ta maqola ochiq</div>
          </div>
          <div className="card kpi lift rise" style={{ '--glow': '#F5B83D', '--d': '190ms' } as React.CSSProperties}>
            <div className="kpi-label"><MessageCircleQuestion size={15} /> Javobsiz savollar</div>
            <div className="kpi-value"><CountUp value={d.questions.open} /></div>
            <div className="kpi-sub">Jami {d.questions.total} ta savol kelgan</div>
          </div>
        </div>

        <div className="grid two">
          <div className="card rise" style={{ '--d': '240ms' } as React.CSSProperties}>
            <div className="card-h"><h2><Users size={16} /> Yangi a&apos;zolar, 30 kun</h2><span className="chip">kuniga eng ko&apos;p: {dayMax}</span></div>
            <div className="cols dense">
              {m.daily.map((x, i) => (
                <div key={x.day} className="col" title={`${x.day}: ${x.count}`}>
                  <span className="col-bar" style={{ '--c': VIOLET, '--h': `${(x.count / dayMax) * 100}%`, '--d': `${i * 15}ms` } as React.CSSProperties} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }} className="faint small mono">
              <span>{m.daily[0]?.day}</span><span>{m.daily[m.daily.length - 1]?.day}</span>
            </div>
          </div>
          <div className="card rise" style={{ '--d': '290ms' } as React.CSSProperties}>
            <div className="card-h"><h2><Heart size={16} /> Qiziqish, 30 kun</h2><span className="chip">oxirgi maqola: {lastPost}</span></div>
            <div className="list">
              <div className="row"><span className="row-main"><b>Layklar</b></span><span className="row-end"><b>{e.likes}</b></span></div>
              <div className="row"><span className="row-main"><b>Saqlashlar</b></span><span className="row-end"><b>{e.saves}</b></span></div>
              <div className="row"><span className="row-main"><b>Izohlar</b></span><span className="row-end"><b>{e.comments}</b></span></div>
              <div className="row"><span className="row-main"><b>Navbatda / qoralama</b><small>egasigina ko&apos;radi yoki vaqti kelmagan</small></span><span className="row-end"><b>{d.posts.queued}</b></span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="screen">
        <h2 className="screen-title">Nima o&apos;qiladi va qayerdan keladi</h2>
        <div className="grid two">
          <div className="grid" style={{ alignContent: 'start' }}>
            <div className="card rise">
              <div className="card-h"><h2><BookOpen size={16} /> Eng ko&apos;p o&apos;qilgan</h2><span className="chip">30 kun</span></div>
              <div className="list">
                {d.topPosts.map((p) => (
                  <div key={p.title} className="row"><span className="row-main"><b>{p.title}</b></span><span className="row-end"><b>{p.reads}</b><small>o&apos;qish</small></span></div>
                ))}
                {!d.topPosts.length && <p className="empty">30 kunda o&apos;qish yo&apos;q</p>}
              </div>
            </div>
            <div className="card rise" style={{ '--d': '80ms' } as React.CSSProperties}>
              <div className="card-h"><h2><ListChecks size={16} /> Kutish ro&apos;yxati</h2><span className="chip">mahsulot bo&apos;yicha</span></div>
              <div className="list">
                {d.waitlist.map((w) => (
                  <div key={w.product} className="row"><span className="row-main"><b>{w.product}</b></span><span className="row-end"><b>{w.count}</b><small>kishi</small></span></div>
                ))}
                {!d.waitlist.length && <p className="empty">Hali hech kim yozilmagan</p>}
              </div>
            </div>
          </div>
          <div className="grid" style={{ alignContent: 'start' }}>
            <div className="card rise" style={{ '--d': '120ms' } as React.CSSProperties}>
              <div className="card-h"><h2><Link2 size={16} /> Kuzatuv havolalari</h2><span className="chip">30 kun · bosish → qo&apos;shilish</span></div>
              {d.links.map((l, i) => (
                <div key={l.name} className="bar-row">
                  <span><span className="swatch" style={{ '--c': PALETTE[i % PALETTE.length] } as React.CSSProperties} />{l.name}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ '--c': PALETTE[i % PALETTE.length], '--w': `${(l.clicks / linkMax) * 100}%`, '--d': `${i * 70}ms`, display: 'block' } as React.CSSProperties} /></span>
                  <span className="mono">{l.clicks} → {l.joins}</span>
                </div>
              ))}
              {!d.links.length && <p className="empty">30 kunda havola bosilmagan</p>}
            </div>
            <div className="card rise" style={{ '--d': '160ms' } as React.CSSProperties}>
              <div className="card-h"><h2><Megaphone size={16} /> Bot e&apos;lonlari</h2><span className="chip">hammasi</span></div>
              <div className="list">
                <div className="row"><span className="row-main"><b>Yuborilgan e&apos;lonlar</b><small>bot orqali tarqatilgan</small></span><span className="row-end"><b>{d.announcements.sent}</b></span></div>
                <div className="row"><span className="row-main"><b>Yetib borgan xabarlar</b><small>jami yuborilgan nusxa</small></span><span className="row-end"><b>{d.announcements.reach}</b></span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
