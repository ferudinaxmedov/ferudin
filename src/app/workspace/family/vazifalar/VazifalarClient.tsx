'use client';

import { useState } from 'react';
import { addTask, markTaskDone, markTaskSkipped, deleteTask } from './actions';

type Task = {
  id: string;
  text: string;
  owner: string;
  status: string;
  scheduled_at: string | null;
  created_date: string | null;
};

const OWNERS = ['FERUDIN', 'GULOYIM'];

function fmtDt(s: string | null) {
  if (!s) return '';
  try {
    return new Date(s).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return s; }
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

const STATUS_COLOR: Record<string, string> = {
  FAOL: '#3b82f6',
  BAJARILDI: '#22c55e',
  OTKAZILDI: 'rgba(255,255,255,0.25)',
};

const STATUS_LABEL: Record<string, string> = {
  FAOL: 'Faol',
  BAJARILDI: 'Bajarildi',
  OTKAZILDI: "O'tkazildi",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: '14px' }}><label style={s.label}>{label}</label>{children}</div>;
}

export function VazifalarClient({ tasks }: { tasks: Task[] }) {
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState<'FAOL' | 'BAJARILDI' | 'ALL'>('FAOL');

  const active = tasks.filter(t => t.status === 'FAOL');
  const done = tasks.filter(t => t.status === 'BAJARILDI');
  const shown = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  const now = new Date();
  const localDt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '24px', margin: '0 0 4px 0' }}>Vazifalar</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', margin: 0 }}>{active.length} faol · {done.length} bajarilgan</p>
        </div>
        <button onClick={() => setModal(true)} style={s.btnPrimary}>+ Vazifa qo&apos;shish</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[['Faol', active.length, '#3b82f6'], ['Bajarildi', done.length, '#22c55e'], ['Jami', tasks.length, '#fff']].map(([l, c, col]) => (
          <div key={l as string} style={s.card}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>{l}</p>
            <p style={{ color: col as string, fontWeight: 700, fontSize: '24px', margin: 0 }}>{c}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {[['FAOL', 'Faol'], ['BAJARILDI', 'Bajarildi'], ['ALL', 'Barchasi']].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k as 'FAOL' | 'BAJARILDI' | 'ALL')} style={{
            background: filter === k ? '#1f1f1f' : 'transparent',
            border: filter === k ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
            color: filter === k ? '#fff' : 'rgba(255,255,255,0.4)',
            borderRadius: '7px', padding: '7px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
          }}>{l}</button>
        ))}
      </div>

      {/* Tasks list */}
      <div style={s.card}>
        {shown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px', margin: 0 }}>Vazifalar yo&apos;q</p>
          </div>
        ) : shown.map(task => (
          <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ flex: 1, marginRight: '16px' }}>
              <p style={{
                color: task.status === 'FAOL' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
                fontSize: '13px', fontWeight: 500, margin: '0 0 4px 0',
                textDecoration: task.status === 'BAJARILDI' ? 'line-through' : 'none',
              }}>{task.text}</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>{task.owner}</span>
                {task.scheduled_at && (
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>· {fmtDt(task.scheduled_at)}</span>
                )}
                <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: `${STATUS_COLOR[task.status]}22`, color: STATUS_COLOR[task.status] }}>
                  {STATUS_LABEL[task.status] ?? task.status}
                </span>
              </div>
            </div>
            {task.status === 'FAOL' && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <form action={async () => { await markTaskDone(task.id); }}>
                  <button type="submit" title="Bajarildi" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '7px', padding: '6px 8px', cursor: 'pointer', color: '#22c55e' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </form>
                <form action={async () => { await markTaskSkipped(task.id); }}>
                  <button type="submit" title="O'tkazish" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '7px', padding: '6px 8px', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </form>
              </div>
            )}
            <form action={async () => { await deleteTask(task.id); }} style={{ marginLeft: '6px' }}>
              <button type="submit" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.12)', cursor: 'pointer', padding: '4px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '16px', margin: 0 }}>Yangi vazifa</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <form action={async (fd) => { await addTask(fd); setModal(false); }}>
              <Field label="Vazifa matni">
                <textarea name="text" required placeholder="Vazifa nima?" rows={3}
                  style={{ ...s.input, resize: 'vertical' as const }} />
              </Field>
              <Field label="Egasi">
                <select name="owner" required style={{ ...s.input, appearance: 'none' }}>
                  {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Vaqt (ixtiyoriy)">
                <input name="scheduled_at" type="datetime-local" defaultValue={localDt} style={s.input} />
              </Field>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setModal(false)} style={{ ...s.btnSecondary, flex: 1 }}>Bekor</button>
                <button type="submit" style={{ ...s.btnPrimary, flex: 1 }}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
