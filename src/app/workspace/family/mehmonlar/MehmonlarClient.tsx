'use client';

import { useState } from 'react';

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

export function MehmonlarClient({ registrations }: { registrations: Reg[] }) {
  const [selected, setSelected] = useState<Reg | null>(null);
  const [search, setSearch] = useState('');

  const filtered = search
    ? registrations.filter(r =>
        (r.guest_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.passport_id ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.nationality ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.apartment ?? '').includes(search)
      )
    : registrations;

  const apartments = [...new Set(registrations.map(r => r.apartment).filter(Boolean))].sort();

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '24px', margin: '0 0 4px 0' }}>Mehmonlar</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', margin: 0 }}>BnB ro&apos;yxati — {registrations.length} ta mehmon</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={card}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>Jami mehmonlar</p>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '22px', margin: 0 }}>{registrations.length}</p>
        </div>
        <div style={card}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>AirBnB</p>
          <p style={{ color: '#ff5a5a', fontWeight: 700, fontSize: '22px', margin: 0 }}>{registrations.filter(r => r.payment_by === 'airbnb').length}</p>
        </div>
        <div style={card}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>To&apos;g&apos;ridan-to&apos;g&apos;ri</p>
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
            style={{ background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', padding: '9px 12px 9px 36px', fontSize: '13px', width: '100%', boxSizing: 'border-box', outline: 'none' }}
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
                  {['Ism', 'Pasport', 'Fuqaroligi', 'Apt.', 'Kirish', 'Chiqish', "To'lov", 'Sana'].map(h => (
                    <th key={h} style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 500, textAlign: 'left', padding: '0 12px 12px 0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} onClick={() => setSelected(r)} style={{ cursor: 'pointer' }}>
                    <td style={{ color: 'rgba(255,255,255,0.8)', padding: '10px 12px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 500 }}>
                      {r.guest_name || '—'}
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.4)', padding: '10px 12px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>{r.passport_id || '—'}</td>
                    <td style={{ color: 'rgba(255,255,255,0.4)', padding: '10px 12px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.nationality || '—'}</td>
                    <td style={{ color: '#fff', padding: '10px 12px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 600 }}>
                      {r.apartment ? `#${r.apartment}${r.room ? `/${r.room}` : ''}` : '—'}
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.5)', padding: '10px 12px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>{fmtDate(r.apt_entry_date)}</td>
                    <td style={{ color: 'rgba(255,255,255,0.5)', padding: '10px 12px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>{fmtDate(r.departure_date)}</td>
                    <td style={{ padding: '10px 12px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <PayBadge by={r.payment_by} />
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.25)', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '11px' }}>{fmtDt(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setSelected(null)}>
          <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', width: '480px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '16px', margin: 0 }}>{selected.guest_name || 'Mehmon ma\'lumotlari'}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                ['Pasport ID', selected.passport_id],
                ['Ism', selected.guest_name],
                ['Fuqaroligi', selected.nationality],
                ["Tug'ilgan sana", fmtDate(selected.dob)],
                ["O'zbekistonga kirish", fmtDate(selected.uzbek_entry_date)],
                ['Apartamentga kirish', fmtDate(selected.apt_entry_date)],
                ['Ketish sanasi', fmtDate(selected.departure_date)],
                ['Reg. boshlanish', fmtDate(selected.reg_start_date)],
                ['Reg. tugash', fmtDate(selected.reg_end_date)],
                ['Kvartira', selected.apartment ? `#${selected.apartment}` : null],
                ['Xona', selected.room],
                ["To'lov miqdori", selected.payment_amount],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '0 0 3px 0' }}>{label}</p>
                  <p style={{ color: value ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)', fontSize: '13px', fontWeight: 500, margin: 0 }}>{value || '—'}</p>
                </div>
              ))}
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '0 0 3px 0' }}>To&apos;lov usuli</p>
                <PayBadge by={selected.payment_by} />
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '0 0 3px 0' }}>Saqlangan vaqt</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>{fmtDt(selected.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
