'use client';

import { useState } from 'react';
import { saveMemory, deleteMemory } from './actions';

type Entry = { id: string; key: string; value: string; owner: string | null; date: string | null; };

const OWNERS = ['FERUDIN', 'GULOYIM'];

function fmtDate(s: string | null) {
  if (!s) return '';
  try { return new Date(s).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit' }); }
  catch { return s; }
}

const s = {
  card: { background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px 24px' },
  input: { background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', padding: '9px 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' as const, outline: 'none' },
  label: { color: 'rgba(255,255,255,0.4)', fontSize: '12px', display: 'block', marginBottom: '4px' },
  btnPrimary: { background: '#22c55e', color: '#000', fontWeight: 600, fontSize: '13px', border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer' },
  btnSecondary: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer' },
  overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', width: '400px', maxWidth: '90vw' },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: '14px' }}><label style={s.label}>{label}</label>{children}</div>;
}

export function XotiraClient({ entries }: { entries: Entry[] }) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [search, setSearch] = useState('');

  const filtered = search
    ? entries.filter(e => e.key.toLowerCase().includes(search.toLowerCase()) || e.value.toLowerCase().includes(search.toLowerCase()))
    : entries;

  function openEdit(e: Entry) { setEditing(e); setModal(true); }
  function closeModal() { setModal(false); setEditing(null); }

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '24px', margin: '0 0 4px 0' }}>Xotira</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', margin: 0 }}>{entries.length} ta yozuv</p>
        </div>
        <button onClick={() => { setEditing(null); setModal(true); }} style={s.btnPrimary}>+ Yozuv qo&apos;shish</button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '320px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }}>
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Qidirish..."
            style={{ ...s.input, paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ ...s.card, textAlign: 'center', padding: '48px' }}>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px', margin: 0 }}>
              {search ? "Hech narsa topilmadi" : "Yozuvlar yo'q"}
            </p>
          </div>
        ) : filtered.map(e => (
          <div key={e.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ color: '#a855f7', fontWeight: 600, fontSize: '12px', background: 'rgba(168,85,247,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{e.key}</span>
                {e.owner && <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>{e.owner}</span>}
                {e.date && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>{fmtDate(e.date)}</span>}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' as const }}>{e.value}</p>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginLeft: '16px', flexShrink: 0 }}>
              <button onClick={() => openEdit(e)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '7px', padding: '6px 8px', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <form action={async () => { await deleteMemory(e.id); }}>
                <button type="submit" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.12)', cursor: 'pointer', padding: '6px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={s.modal} onClick={ev => ev.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '16px', margin: 0 }}>{editing ? 'Yozuvni tahrirlash' : 'Yangi yozuv'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <form action={async (fd) => { await saveMemory(fd); closeModal(); }}>
              <Field label="Kalit (so'z)">
                <input name="key" type="text" required defaultValue={editing?.key ?? ''} placeholder="masalan: wifi_parol" style={s.input} />
              </Field>
              <Field label="Qiymat">
                <textarea name="value" required rows={4} defaultValue={editing?.value ?? ''} placeholder="Ma'lumot..." style={{ ...s.input, resize: 'vertical' as const }} />
              </Field>
              <Field label="Egasi">
                <select name="owner" style={{ ...s.input, appearance: 'none' }} defaultValue={editing?.owner ?? 'FERUDIN'}>
                  {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={closeModal} style={{ ...s.btnSecondary, flex: 1 }}>Bekor</button>
                <button type="submit" style={{ ...s.btnPrimary, flex: 1 }}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
