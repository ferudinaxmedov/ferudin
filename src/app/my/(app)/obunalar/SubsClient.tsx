'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Sub } from '@/lib/hub/data';
import { BUCKETS, bucketOf } from '@/lib/hub/projects';
import { deleteSub, saveRate, saveSub } from './actions';
import { CalendarCard } from './CalendarCard';

const fmtSom = (n: number) => `${Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ')} so'm`;
const fmtMoney = (a: number, c: 'USD' | 'UZS') => (c === 'USD' ? `$${a.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : fmtSom(a));
const monthly = (s: Sub, rate: number) => {
  if (s.amount === null) return null;
  const v = s.currency === 'USD' ? s.amount * rate : s.amount;
  return s.period === 'year' ? v / 12 : v;
};

export function SubsClient({ subs, usdRate, calendarUrl }: { subs: Sub[]; usdRate: number; calendarUrl: string | null }) {
  const [editing, setEditing] = useState<Partial<Sub> | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [rateMsg, setRateMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setEditing(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing]);

  const shown = useMemo(() => (filter === 'all' ? subs : subs.filter((s) => s.project === filter)), [subs, filter]);
  const active = subs.filter((s) => s.active);
  const total = active.reduce((sum, s) => sum + (monthly(s, usdRate) ?? 0), 0);
  const missing = active.filter((s) => s.amount === null).length;

  function submit(form: FormData) {
    setError(null);
    start(async () => {
      const r = await saveSub(form);
      if (r.error) setError(r.error); else setEditing(null);
    });
  }

  return (
    <section className="screen">
      <header className="head rise">
        <div>
          <h1>Obunalar</h1>
          <p>
            Faol: {active.length} ta · oyiga <b className="mono">{fmtSom(total)}</b> (≈ ${Math.round(total / usdRate).toLocaleString('en-US')})
            {missing ? <span className="missing"> · {missing} tasining narxi yo&apos;q</span> : null}
          </p>
        </div>
        <div className="head-actions">
          <form
            action={(f) => start(async () => { const r = await saveRate(f); setRateMsg(r.error ?? 'Saqlandi ✓'); })}
            style={{ display: 'flex', gap: 6, alignItems: 'center' }}
          >
            <label className="small muted" htmlFor="usd_rate">$1 =</label>
            <input id="usd_rate" name="usd_rate" defaultValue={usdRate} className="input mono" style={{ width: 96, height: 34 }} inputMode="numeric" />
            <button className="btn btn-ghost small" disabled={pending}>Kurs</button>
            {rateMsg && <span className="small muted" role="status">{rateMsg}</span>}
          </form>
          <button className="btn btn-primary" onClick={() => setEditing({ active: true, kind: 'fixed', currency: 'USD', period: 'month', project: 'umumiy' })}>
            <Plus size={16} /> Qo&apos;shish
          </button>
        </div>
      </header>

      <CalendarCard url={calendarUrl} />

      <div className="card rise" style={{ '--d': '60ms' } as React.CSSProperties}>
        <div className="card-h" style={{ flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} role="tablist" aria-label="Loyiha bo'yicha">
            {[{ key: 'all', name: 'Hammasi', color: '' }, ...BUCKETS].map((b) => (
              <button key={b.key} role="tab" aria-selected={filter === b.key} onClick={() => setFilter(b.key)}
                className={`btn small ${filter === b.key ? 'btn-primary' : 'btn-ghost'}`}>
                {b.color && <span className="swatch" style={{ '--c': b.color } as React.CSSProperties} />}{b.name}
              </button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Xizmat</th><th>Loyiha</th><th>Turi</th><th style={{ textAlign: 'right' }}>Narx</th><th style={{ textAlign: 'right' }}>Oyiga</th><th>Keyingi to&apos;lov</th><th aria-label="Amallar" /></tr>
            </thead>
            <tbody>
              {shown.map((s) => {
                const m = monthly(s, usdRate);
                const b = bucketOf(s.project);
                return (
                  <tr key={s.id} className={s.active ? '' : 'off'}>
                    <td className="name"><b>{s.name}</b><small>{s.notes ?? s.vendor ?? ''}</small></td>
                    <td><span className="chip"><span className="swatch" style={{ '--c': b.color } as React.CSSProperties} />{b.name}</span></td>
                    <td><span className={`chip ${s.kind === 'usage' ? 'info' : ''}`}>{s.kind === 'usage' ? 'sarfga qarab' : s.period === 'year' ? 'yillik' : 'oylik'}</span></td>
                    <td className="num">{s.amount === null ? <span className="missing">kiritilmagan</span> : fmtMoney(s.amount, s.currency)}</td>
                    <td className="num">{m === null ? '—' : fmtSom(m)}</td>
                    <td className="mono small">{s.next_charge ?? <span className="faint">—</span>}</td>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                      {s.url && <a className="icon-btn" href={s.url} target="_blank" rel="noreferrer" aria-label="Billing sahifasi" title="Billing sahifasi"><ExternalLink size={14} /></a>}{' '}
                      <button className="icon-btn" onClick={() => setEditing(s)} aria-label={`${s.name}ni tahrirlash`} title="Tahrirlash"><Pencil size={14} /></button>
                    </td>
                  </tr>
                );
              })}
              {!shown.length && <tr><td colSpan={7} className="empty">{filter === 'all' ? 'Hali obuna qo‘shilmagan' : 'Bu loyihada obuna yo‘q'}</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="faint small" style={{ margin: '12px 0 0' }}>
          &quot;Sarfga qarab&quot; xizmatlarda faqat DentaFlow&apos;dan tashqari qismini kiriting: DentaFlow API xarajati avtomatik o&apos;lchanadi va alohida qo&apos;shiladi.
        </p>
      </div>

      {editing && (
        <div className="modal-back" onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="sub-title">
            <h2 id="sub-title">{editing.id ? 'Obunani tahrirlash' : 'Yangi obuna'}</h2>
            <form action={submit}>
              {editing.id && <input type="hidden" name="id" value={editing.id} />}
              <div className="form-grid">
                <label className="field wide"><span>Nomi</span><input name="name" defaultValue={editing.name ?? ''} required className="input" autoFocus /></label>
                <label className="field"><span>Kompaniya</span><input name="vendor" defaultValue={editing.vendor ?? ''} className="input" /></label>
                <label className="field"><span>Loyiha</span>
                  <select name="project" defaultValue={editing.project ?? 'umumiy'} className="input">
                    {BUCKETS.map((b) => <option key={b.key} value={b.key}>{b.name}</option>)}
                  </select>
                </label>
                <label className="field"><span>Narx</span><input name="amount" defaultValue={editing.amount ?? ''} inputMode="decimal" placeholder="bo'sh = noma'lum" className="input mono" /></label>
                <label className="field"><span>Valyuta</span>
                  <select name="currency" defaultValue={editing.currency ?? 'USD'} className="input"><option value="USD">Dollar ($)</option><option value="UZS">So&apos;m</option></select>
                </label>
                <label className="field"><span>Davr</span>
                  <select name="period" defaultValue={editing.period ?? 'month'} className="input"><option value="month">Har oy</option><option value="year">Har yil</option></select>
                </label>
                <label className="field"><span>Turi</span>
                  <select name="kind" defaultValue={editing.kind ?? 'fixed'} className="input"><option value="fixed">Qat&apos;iy narx</option><option value="usage">Sarfga qarab</option></select>
                </label>
                <label className="field"><span>Keyingi to&apos;lov sanasi</span><input name="next_charge" type="date" defaultValue={editing.next_charge ?? ''} className="input mono" /></label>
                <label className="field"><span>Billing havolasi</span><input name="url" type="url" defaultValue={editing.url ?? ''} className="input" placeholder="https://" /></label>
                <label className="field wide"><span>Izoh</span><textarea name="notes" defaultValue={editing.notes ?? ''} className="input" /></label>
                <label className="check wide"><input type="checkbox" name="active" defaultChecked={editing.active ?? true} /> Faol (oylik jamiga kiradi)</label>
              </div>
              {error && <p className="form-error" role="alert" style={{ marginTop: 12 }}>{error}</p>}
              <div className="modal-actions">
                <div>
                  {editing.id && (
                    <button type="button" className="btn btn-danger" disabled={pending}
                      onClick={() => { if (confirm(`"${editing.name}" o'chirilsinmi?`)) start(async () => { await deleteSub(editing.id!); setEditing(null); }); }}>
                      <Trash2 size={15} /> O&apos;chirish
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Bekor qilish</button>
                  <button className="btn btn-primary" disabled={pending}>{pending ? 'Saqlanmoqda…' : 'Saqlash'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
