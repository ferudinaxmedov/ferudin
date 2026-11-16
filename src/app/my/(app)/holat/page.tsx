import { HeartPulse, ShieldCheck } from 'lucide-react';
import { requireHub } from '@/lib/hub/guard';
import { getMonitor, SITES, sslDaysLeft } from '@/lib/hub/monitor';
import { PROJECTS } from '@/lib/hub/projects';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Saytlar holati' };

const ago = (iso: string) => {
  const m = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  return m < 1 ? 'hozirgina' : m < 60 ? `${m} daq oldin` : `${Math.round(m / 60)} soat oldin`;
};

export default async function HealthPage() {
  await requireHub();
  const rows = await getMonitor();
  const byHost = new Map(rows.map((r) => [r.site, r]));
  const down = rows.filter((r) => !r.ok).length;
  const slow = rows.filter((r) => r.ok && (r.ms ?? 0) > 4000).length;
  const sslSoon = rows.filter((r) => (sslDaysLeft(r.ssl_expires) ?? 999) < 14).length;

  return (
    <section className="screen">
      <header className="head rise">
        <div>
          <h1>Saytlar holati</h1>
          <p>Har 5 daqiqada tekshiriladi: ochilishi, tezligi, SSL sertifikati · muammo bo&apos;lsa Telegram&apos;ga xabar keladi</p>
        </div>
      </header>

      <div className={`callout rise ${down ? 'bad' : ''}`}>
        {down || slow || sslSoon ? <HeartPulse size={18} /> : <ShieldCheck size={18} />}
        <div>
          <b>{!rows.length ? 'Hali tekshirilmagan' : down ? `${down} ta sayt ochilmayapti` : slow || sslSoon ? 'Diqqat talab qiladi' : `Hammasi joyida: ${rows.length} ta sayt`}</b>
          <p>{[slow ? `${slow} ta sekin` : '', sslSoon ? `${sslSoon} ta SSL 14 kundan kam` : ''].filter(Boolean).join(' · ') || 'Javob vaqti 4 soniyadan kam, sertifikatlar amal qiladi.'}</p>
        </div>
      </div>

      <div className="mon-grid">
        {SITES.map((s, i) => {
          const r = byHost.get(s.host);
          const days = sslDaysLeft(r?.ssl_expires ?? null);
          const tone = !r ? '' : !r.ok ? 'bad' : (r.ms ?? 0) > 4000 || (days ?? 999) < 14 ? 'warn' : '';
          const p = PROJECTS.find((x) => x.key === s.project);
          return (
            <a key={s.host} className={`card mon lift rise ${tone}`} href={`https://${s.host}${s.path ?? ''}`} target="_blank" rel="noreferrer" style={{ '--d': `${i * 30}ms` } as React.CSSProperties}>
              <b>{s.host}</b>
              <span className="small faint"><span className="swatch" style={{ '--c': p?.color, display: 'inline-block', marginRight: 6 } as React.CSSProperties} />{p?.name ?? s.project}</span>
              {r ? (
                <>
                  <div className="mon-row"><span>{r.ok ? `HTTP ${r.status}` : r.error ?? 'Ochilmadi'}</span><span className="mono">{r.ms !== null ? `${(r.ms / 1000).toFixed(2)} s` : '—'}</span></div>
                  <div className="mon-row"><span>SSL</span><span className={`mono ${(days ?? 999) < 14 ? 'warn' : ''}`}>{days === null ? '—' : `${days} kun`}</span></div>
                  <div className="mon-row"><span>Tekshirildi</span><span>{ago(r.checked_at)}</span></div>
                </>
              ) : <div className="mon-row"><span>Hali tekshirilmagan</span></div>}
            </a>
          );
        })}
      </div>
    </section>
  );
}
