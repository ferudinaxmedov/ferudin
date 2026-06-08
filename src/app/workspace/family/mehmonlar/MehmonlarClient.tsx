'use client';

import { useState } from 'react';
import { addRegistration, deleteRegistration, editRegistration } from './actions';

type Reg = {
  id: string;
  passport_id: string | null;
  guest_name: string | null;
  nationality: string | null;
  dob: string | null;
  uzbek_entry_date: string | null;
  apt_entry_date: string | null;
  departure_date: string | null;
  reg_start_date: string | null;
  reg_end_date: string | null;
  apartment: string | null;
  room: string | null;
  payment_amount: string | null;
  payment_by: string | null;
  created_at: string;
};

const APT_LIST = ['23', '28', '68', '80', '84', '88', '701'];

function fmtDate(s: string | null) {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit' }); }
  catch { return s; }
}
function fmtDt(s: string | null) {
  if (!s) return '—';
  try { return new Date(s).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); }
  catch { return s; }
}

const card = { background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px 24px' } as const;
const inp = { background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', padding: '9px 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' as const, outline: 'none' };
const lbl = { color: 'rgba(255,255,255,0.4)', fontSize: '12px', display: 'block', marginBottom: '4px' };
const btnPrimary = { background: '#22c55e', color: '#000', fontWeight: 600, fontSize: '13px', border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer' };
const btnSecondary = { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer' };

function PayBadge({ by }: { by: string | null }) {
  const isAirbnb = by === 'airbnb';
  return (
    <span style={{
      fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px',
      background: isAirbnb ? 'rgba(255,90,90,0.15)' : 'rgba(34,197,94,0.1)',
      color: isAirbnb ? '#ff5a5a' : '#22c55e',
    }}>
      {isAirbnb ? 'AirBnB' : 'Mehmon'}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: '12px' }}><label style={lbl}>{label}</label>{children}</div>;
}

function RegForm({ onSubmit, defaultValues }: {
  onSubmit: (fd: FormData) => Promise<void>;
  defaultValues?: Reg;
}) {
  const today = new Date().toISOString().split('T')[0];
  return (
    <form action={async (fd) => { await onSubmit(fd); }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <Field label="Ism *">
          <input name="guest_name" required defaultValue={defaultValues?.guest_name ?? ''} style={inp} placeholder="To'liq ism" />
        </Field>
        <Field label="Pasport ID">
          <input name="passport_id" defaultValue={defaultValues?.passport_id ?? ''} style={inp} placeholder="AA1234567" />
        </Field>
        <Field label="Fuqaroligi">
          <input name="nationality" defaultValue={defaultValues?.nationality ?? ''} style={inp} placeholder="Россия" />
        </Field>
        <Field label="Tug'ilgan sana">
          <input name="dob" type="date" defaultValue={defaultValues?.dob ?? ''} style={inp} />
        </Field>
        <Field label="O'zbekistonga kirish">
          <input name="uzbek_entry_date" type="date" defaultValue={defaultValues?.uzbek_entry_date ?? ''} style={inp} />
        </Field>
        <Field label="Apartamentga kirish *">
          <input name="apt_entry_date" type="date" required defaultValue={defaultValues?.apt_entry_date ?? today} style={inp} />
        </Field>
        <Field label="Ketish sanasi *">
          <input name="departure_date" type="date" required defaultValue={defaultValues?.departure_date ?? ''} style={inp} />
        </Field>
        <Field label="Kvartira">
          <select name="apartment" defaultValue={defaultValues?.apartment ?? '28'} style={{ ...inp, appearance: 'none' }}>
            {APT_LIST.map(a => <option key={a} value={a}>#{a}</option>)}
          </select>
        </Field>
        <Field label="Xona raqami">
          <input name="room" defaultValue={defaultValues?.room ?? ''} style={inp} placeholder="Ixtiyoriy" />
        </Field>
        <Field label="To'lov turi">
          <select name="payment_by" defaultValue={defaultValues?.payment_by ?? 'direct'} style={{ ...inp, appearance: 'none' }}>
            <option value="direct">To&apos;g&apos;ridan-to&apos;g&apos;ri</option>
            <option value="airbnb">AirBnB</option>
          </select>
        </Field>
      </div>
      <Field label="To'lov miqdori">
        <input name="payment_amount" defaultValue={defaultValues?.payment_amount ?? ''} style={inp} placeholder="Masalan: 50$ yoki 500 000 so'm" />
      </Field>
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button type="submit" style={{ ...btnPrimary, flex: 1 }}>Saqlash</button>
      </div>
    </form>
  );
}

export function MehmonlarClient({ registrations }: { registrations: Reg[] }) {
  const [selected, setSelected] = useState<Reg | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [editReg, setEditReg] = useState<Reg | null>(null);
  const [search, setSearch] = useState('');
  const [delConfirm, setDelConfirm] = useState<string | null>(null);

  const filtered = search
    ? registrations.filter(r =>
        (r.guest_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.passport_id ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.nationality ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.apartment ?? '').includes(search)
      )
    : registrations;

  const apartments = [...new Set(registrations.map(r => r.apartment).filter(Boolean))].sort();
  const overlay = { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const modal = { background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', width: '600px', maxWidth: '92vw', maxHeight: '85vh', overflowY: 'auto' as const };

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '24px', margin: '0 0 4px 0' }}>Mehmonlar</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', margin: 0 }}>BnB ro&apos;yxati — {registrations.length} ta mehmon</p>
        </div>
        <button onClick={() => setAddModal(true)} style={btnPrimary}>+ Mehmon qo&apos;shish</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={card}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>Jami</p>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '22px', margin: 0 }}>{registrations.length}</p>
        </div>
        <div style={card}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>AirBnB</p>
          <p style={{ color: '#ff5a5a', fontWeight: 700, fontSize: '22px', margin: 0 }}>{registrations.filter(r => r.payment_by === 'airbnb').length}</p>
        </div>
        <div style={card}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>To&apos;g&apos;ridan</p>
          <p style={{ color: '#22c55e', fontWeight: 700, fontSize: '22px', margin: 0 }}>{registrations.filter(r => r.payment_by !== 'airbnb').length}</p>
        </div>
        <div style={card}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>Apartamentlar</p>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '22px', margin: 0 }}>{apartments.length}</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ position: 'relative', maxWidth: '300px', flex: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }}>
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ism, pasport, kvartira..."
            style={{ ...inp, padding: '9px 12px 9px 36px' }}
          />
        </div>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>{filtered.length} ta natija</span>
      </div>

      {/* Table */}
      <div style={card}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px', margin: 0 }}>Mehmonlar topilmadi</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  {['Ism', 'Pasport', 'Fuqaroligi', 'Apt.', 'Kirish', 'Chiqish', "To'lov", '', ''].map((h, i) => (
                    <th key={i} style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 500, textAlign: 'left', padding: '0 8px 12px 0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: 'rgba(255,255,255,0.8)', padding: '10px 8px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => setSelected(r)}>{r.guest_name || '—'}</td>
                    <td style={{ color: 'rgba(255,255,255,0.4)', padding: '10px 8px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>{r.passport_id || '—'}</td>
                    <td style={{ color: 'rgba(255,255,255,0.4)', padding: '10px 8px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.nationality || '—'}</td>
                    <td style={{ color: '#fff', padding: '10px 8px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 600 }}>
                      {r.apartment ? `#${r.apartment}${r.room ? `/${r.room}` : ''}` : '—'}
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.5)', padding: '10px 8px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>{fmtDate(r.apt_entry_date)}</td>
                    <td style={{ color: 'rgba(255,255,255,0.5)', padding: '10px 8px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>{fmtDate(r.departure_date)}</td>
                    <td style={{ padding: '10px 8px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}><PayBadge by={r.payment_by} /></td>
                    <td style={{ padding: '10px 4px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <button onClick={() => setEditReg(r)} title="Tahrirlash"
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '4px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </td>
                    <td style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {delConfirm === r.id ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <form action={async () => { await deleteRegistration(r.id); setDelConfirm(null); }}>
                            <button type="submit" style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '5px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Ha</button>
                          </form>
                          <button onClick={() => setDelConfirm(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', borderRadius: '5px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}>Yo&apos;q</button>
                        </div>
                      ) : (
                        <button onClick={() => setDelConfirm(r.id)} title="O'chirish"
                          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.15)', cursor: 'pointer', padding: '4px' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={overlay} onClick={() => setSelected(null)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '16px', margin: 0 }}>{selected.guest_name || 'Mehmon ma\'lumotlari'}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {([
                ['Pasport ID', selected.passport_id],
                ['Ism', selected.guest_name],
                ['Fuqaroligi', selected.nationality],
                ["Tug'ilgan", fmtDate(selected.dob)],
                ["O'zbekistonga", fmtDate(selected.uzbek_entry_date)],
                ['Kirish', fmtDate(selected.apt_entry_date)],
                ['Ketish', fmtDate(selected.departure_date)],
                ['Reg. boshlanish', fmtDate(selected.reg_start_date)],
                ['Reg. tugash', fmtDate(selected.reg_end_date)],
                ['Kvartira', selected.apartment ? `#${selected.apartment}` : null],
                ['Xona', selected.room],
                ["To'lov miqdori", selected.payment_amount],
              ] as [string, string | null][]).map(([label, value]) => (
                <div key={label}>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '0 0 3px 0' }}>{label}</p>
                  <p style={{ color: value ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)', fontSize: '13px', fontWeight: 500, margin: 0 }}>{value || '—'}</p>
                </div>
              ))}
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '0 0 3px 0' }}>To&apos;lov usuli</p>
                <PayBadge by={selected.payment_by} />
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '0 0 3px 0' }}>Saqlangan</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>{fmtDt(selected.created_at)}</p>
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button onClick={() => { setEditReg(selected); setSelected(null); }} style={{ ...btnSecondary, flex: 1 }}>Tahrirlash</button>
              <button onClick={() => setSelected(null)} style={{ ...btnPrimary, flex: 1 }}>Yopish</button>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {addModal && (
        <div style={overlay} onClick={() => setAddModal(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '16px', margin: 0 }}>Yangi mehmon qo&apos;shish</h3>
              <button onClick={() => setAddModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <RegForm onSubmit={async (fd) => { await addRegistration(fd); setAddModal(false); }} />
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editReg && (
        <div style={overlay} onClick={() => setEditReg(null)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '16px', margin: 0 }}>Mehmonni tahrirlash</h3>
              <button onClick={() => setEditReg(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <RegForm
              defaultValues={editReg}
              onSubmit={async (fd) => { await editRegistration(editReg.id, fd); setEditReg(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
