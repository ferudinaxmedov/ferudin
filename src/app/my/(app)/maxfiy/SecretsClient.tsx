'use client';

import { useEffect, useState, useTransition } from 'react';
import { Copy, Eye, EyeOff, ExternalLink, KeyRound, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import type { SecretRow } from '@/lib/hub/secrets';
import { removeSecret, reveal, saveSecret } from './actions';

type Shown = { secret: string | null; notes: string | null };

export function SecretsClient({ rows }: { rows: SecretRow[] }) {
  const [open, setOpen] = useState<Record<string, Shown>>({});
  const [editing, setEditing] = useState<Partial<SecretRow> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [pending, start] = useTransition();

  // Revealed values disappear after 60 s and when the tab is hidden.
  useEffect(() => {
    if (!Object.keys(open).length) return;
    const t = setTimeout(() => setOpen({}), 60_000);
    const hide = () => { if (document.hidden) setOpen({}); };
    document.addEventListener('visibilitychange', hide);
    return () => { clearTimeout(t); document.removeEventListener('visibilitychange', hide); };
  }, [open]);

  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setEditing(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing]);

  function toggle(id: string) {
    if (open[id]) { setOpen(({ [id]: _, ...rest }) => rest); return; }
    start(async () => {
      const r = await reveal(id);
      if ('error' in r) setError(r.error);
      else setOpen((o) => ({ ...o, [id]: r }));
    });
  }

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* clipboard blocked */ }
  }

  function submit(form: FormData) {
    setError(null);
    start(async () => {
      const r = await saveSecret(form);
      if (r.error) setError(r.error); else setEditing(null);
    });
  }

  const shown = rows.filter((r) => !q || `${r.title} ${r.username ?? ''} ${r.category} ${r.url ?? ''}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <section className="screen">
      <header className="head rise">
        <div>
          <h1>Maxfiy</h1>
          <p>Parollar va kirish ma&apos;lumotlari · shifrlangan (AES-256) · har bir ochish jurnalga yoziladi</p>
        </div>
        <div className="head-actions">
          <button className="btn btn-primary" onClick={() => setEditing({ category: 'Umumiy' })}><Plus size={16} /> Qo&apos;shish</button>
        </div>
      </header>

      <div className="callout rise">
        <ShieldCheck size={18} />
        <div><b>Claude bu bo&apos;limni ko&apos;rmaydi</b><p>Chatdagi yordamchida maxfiy ma&apos;lumotlarga asbob yo&apos;q. Ochilgan parol 60 soniyadan keyin yoki boshqa tabga o&apos;tganda yopiladi.</p></div>
      </div>

      <div className="card rise">
        <div className="card-h">
          <input className="input" placeholder="Qidirish…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Qidirish" style={{ maxWidth: 320 }} />
        </div>
        <div className="secret-list">
          {shown.map((r) => {
            const s = open[r.id];
            return (
              <div key={r.id} className="secret">
                <span className="secret-ico"><KeyRound size={16} /></span>
                <div className="secret-main">
                  <b>{r.title}</b>
                  <small>{[r.category, r.username].filter(Boolean).join(' · ')}</small>
                  {s && (
                    <div className="secret-open">
                      {s.secret !== null && (
                        <span className="mono secret-val">{s.secret}
                          <button className="icon-btn" onClick={() => copy(r.id, s.secret!)} aria-label="Parolni nusxalash" title="Nusxalash"><Copy size={13} /></button>
                          {copied === r.id && <span className="small muted"> nusxa olindi</span>}
                        </span>
                      )}
                      {s.notes && <p className="small">{s.notes}</p>}
                      {s.secret === null && !s.notes && <span className="small faint">Parol saqlanmagan</span>}
                    </div>
                  )}
                </div>
                <div className="secret-actions">
                  {r.url && <a className="icon-btn" href={r.url} target="_blank" rel="noreferrer" aria-label="Saytni ochish" title="Saytni ochish"><ExternalLink size={14} /></a>}
                  {r.username && <button className="icon-btn" onClick={() => copy(`${r.id}:u`, r.username!)} aria-label="Loginni nusxalash" title="Loginni nusxalash"><Copy size={14} /></button>}
                  {(r.hasSecret || r.hasNotes) && (
                    <button className="icon-btn" onClick={() => toggle(r.id)} disabled={pending} aria-label={s ? 'Yopish' : 'Ko‘rsatish'} title={s ? 'Yopish' : 'Ko‘rsatish'}>
                      {s ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                  <button className="icon-btn" onClick={() => setEditing(r)} aria-label={`${r.title}ni tahrirlash`} title="Tahrirlash"><Pencil size={14} /></button>
                </div>
              </div>
            );
          })}
          {!shown.length && <p className="empty">{rows.length ? 'Hech narsa topilmadi' : 'Hali hech narsa saqlanmagan'}</p>}
        </div>
      </div>

      {editing && (
        <div className="modal-back" onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="sec-title">
            <h2 id="sec-title">{editing.id ? 'Tahrirlash' : 'Yangi yozuv'}</h2>
            <form action={submit}>
              {editing.id && <input type="hidden" name="id" value={editing.id} />}
              <div className="form-grid">
                <label className="field wide"><span>Nomi</span><input name="title" defaultValue={editing.title ?? ''} required className="input" autoFocus /></label>
                <label className="field"><span>Login</span><input name="username" defaultValue={editing.username ?? ''} className="input" autoComplete="off" /></label>
                <label className="field"><span>Bo&apos;lim</span><input name="category" defaultValue={editing.category ?? 'Umumiy'} className="input" /></label>
                <label className="field wide"><span>Parol {editing.id && <em className="faint">(bo&apos;sh qoldirsangiz eskisi qoladi)</em>}</span>
                  <input name="secret" type="password" className="input mono" autoComplete="new-password" />
                </label>
                <label className="field wide"><span>Sayt</span><input name="url" type="url" defaultValue={editing.url ?? ''} className="input" placeholder="https://" /></label>
                <label className="field wide"><span>Izoh {editing.id && <em className="faint">(bo&apos;sh = eskisi qoladi)</em>}</span><textarea name="notes" className="input" /></label>
              </div>
              {error && <p className="form-error" role="alert" style={{ marginTop: 12 }}>{error}</p>}
              <div className="modal-actions">
                <div>
                  {editing.id && (
                    <button type="button" className="btn btn-danger" disabled={pending}
                      onClick={() => { if (confirm(`"${editing.title}" butunlay o'chirilsinmi? Qaytarib bo'lmaydi.`)) start(async () => { await removeSecret(editing.id!); setEditing(null); }); }}>
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
