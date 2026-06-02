'use client';

import { useState } from 'react';
import { toggleUserActive, updateUserRole } from './actions';

type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  clinic: { name: string } | null;
};

const roleColors: Record<string, string> = {
  super_admin: '#f59e0b',
  admin: '#22c55e',
  doctor: '#0ea5e9',
  registrator: 'rgba(255,255,255,0.4)',
};

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  doctor: 'Doctor',
  registrator: 'Registrator',
};

const roles = ['super_admin', 'admin', 'doctor', 'registrator'];

export function UsersClient({ users }: { users: User[] }) {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = users.filter(u => {
    const matchSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.clinic?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? u.is_active : !u.is_active);
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '1.75rem', margin: 0 }}>Foydalanuvchilar</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginTop: '4px' }}>{users.length} ta foydalanuvchi</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Qidirish (ism, email, klinika)..."
          style={{
            flex: 1, minWidth: '220px', padding: '8px 14px', borderRadius: '10px',
            background: '#161616', border: '1px solid rgba(255,255,255,0.07)',
            color: '#fff', fontSize: '13px', outline: 'none',
          }}
        />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', background: '#161616', border: '1px solid rgba(255,255,255,0.07)', color: '#fff', fontSize: '13px', outline: 'none' }}>
          <option value="all">Barcha rollar</option>
          {roles.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', background: '#161616', border: '1px solid rgba(255,255,255,0.07)', color: '#fff', fontSize: '13px', outline: 'none' }}>
          <option value="all">Barcha statuslar</option>
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr auto', padding: '10px 16px', background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {['Ism', 'Email', 'Rol', 'Klinika', 'Status', ''].map(h => (
            <span key={h} style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
          ))}
        </div>

        {filtered.map((u, i) => (
          <div
            key={u.id}
            style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr auto',
              alignItems: 'center', padding: '12px 16px',
              background: i % 2 === 0 ? '#111' : '#0e0e0e',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
            }}
          >
            {/* Name */}
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '13px', margin: 0 }}>{u.full_name}</p>

            {/* Email */}
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>

            {/* Role selector */}
            <form action={async (fd) => { await updateUserRole(u.id, fd.get('role') as string); }}>
              <select
                name="role"
                defaultValue={u.role}
                onChange={e => e.currentTarget.form?.requestSubmit()}
                style={{
                  padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                  background: `${roleColors[u.role] ?? '#888'}15`,
                  border: `1px solid ${roleColors[u.role] ?? '#888'}40`,
                  color: roleColors[u.role] ?? '#888',
                  cursor: 'pointer', outline: 'none',
                }}
              >
                {roles.map(r => <option key={r} value={r} style={{ background: '#1a1a1a', color: '#fff' }}>{roleLabels[r]}</option>)}
              </select>
            </form>

            {/* Clinic */}
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {u.clinic?.name ?? <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}
            </p>

            {/* Status */}
            <div>
              <span style={{
                padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                background: u.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                color: u.is_active ? '#22c55e' : '#ef4444',
              }}>
                {u.is_active ? 'Faol' : 'Nofaol'}
              </span>
            </div>

            {/* Toggle */}
            <form action={async () => { await toggleUserActive(u.id, u.is_active); }}>
              <button type="submit" title={u.is_active ? 'O\'chirish' : 'Yoqish'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: u.is_active ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.5)' }}>
                {u.is_active ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
            Foydalanuvchi topilmadi
          </div>
        )}
      </div>
    </div>
  );
}
