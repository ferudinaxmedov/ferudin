'use client';

import { useState } from 'react';
import { updateClinicPlan, toggleClinicActive } from './actions';

type Clinic = {
  id: string;
  name: string;
  slug: string;
  owner_email: string;
  phone: string | null;
  city: string | null;
  plan: string;
  is_active: boolean;
  trial_ends_at: string | null;
  created_at: string;
};

const planColors: Record<string, string> = {
  enterprise: '#f59e0b',
  pro: '#22c55e',
  starter: 'rgba(255,255,255,0.4)',
};

const plans = ['starter', 'pro', 'enterprise'];

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span style={{
      padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      background: `${planColors[plan] ?? '#888'}20`,
      color: planColors[plan] ?? '#888',
      border: `1px solid ${planColors[plan] ?? '#888'}40`,
    }}>
      {plan}
    </span>
  );
}

function TrialBadge({ date }: { date: string }) {
  const daysLeft = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  const expired = daysLeft <= 0;
  return (
    <span style={{
      padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
      background: expired ? 'rgba(239,68,68,0.1)' : 'rgba(14,165,233,0.1)',
      color: expired ? '#ef4444' : '#0ea5e9',
      border: `1px solid ${expired ? '#ef444440' : '#0ea5e940'}`,
    }}>
      {expired ? 'Tugagan' : `${daysLeft}k trial`}
    </span>
  );
}

export function ClinicsClient({ clinics }: { clinics: Clinic[] }) {
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = clinics.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.owner_email.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === 'all' || c.plan === filterPlan;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? c.is_active : !c.is_active);
    return matchSearch && matchPlan && matchStatus;
  });

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '1.75rem', margin: 0 }}>Klinikalar</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginTop: '4px' }}>{clinics.length} ta klinika</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Qidirish..."
          style={{
            flex: 1, minWidth: '200px', padding: '8px 14px', borderRadius: '10px',
            background: '#161616', border: '1px solid rgba(255,255,255,0.07)',
            color: '#fff', fontSize: '13px', outline: 'none',
          }}
        />
        <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', background: '#161616', border: '1px solid rgba(255,255,255,0.07)', color: '#fff', fontSize: '13px', outline: 'none' }}>
          <option value="all">Barcha tariflar</option>
          {plans.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', background: '#161616', border: '1px solid rgba(255,255,255,0.07)', color: '#fff', fontSize: '13px', outline: 'none' }}>
          <option value="all">Barcha statuslar</option>
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Head */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr auto', gap: '0', padding: '10px 16px', background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {['Klinika', 'Owner', 'Tarif', 'Trial', 'Status', ''].map(h => (
            <span key={h} style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
          ))}
        </div>

        {filtered.map((c, i) => (
          <div
            key={c.id}
            style={{
              display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr auto',
              alignItems: 'center', gap: '0', padding: '12px 16px',
              background: i % 2 === 0 ? '#111' : '#0e0e0e',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined,
            }}
          >
            {/* Name */}
            <div>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '13px', margin: 0 }}>{c.name}</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '2px 0 0' }}>{c.slug}{c.city ? ` · ${c.city}` : ''}</p>
            </div>

            {/* Owner */}
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.owner_email}</p>

            {/* Plan selector */}
            <form action={async (fd) => { await updateClinicPlan(c.id, fd.get('plan') as string); }}>
              <select
                name="plan"
                defaultValue={c.plan}
                onChange={e => e.currentTarget.form?.requestSubmit()}
                style={{
                  padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                  background: `${planColors[c.plan] ?? '#888'}15`,
                  border: `1px solid ${planColors[c.plan] ?? '#888'}40`,
                  color: planColors[c.plan] ?? '#888',
                  cursor: 'pointer', outline: 'none',
                }}
              >
                {plans.map(p => <option key={p} value={p} style={{ background: '#1a1a1a', color: '#fff' }}>{p}</option>)}
              </select>
            </form>

            {/* Trial */}
            <div>{c.trial_ends_at ? <TrialBadge date={c.trial_ends_at} /> : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>—</span>}</div>

            {/* Status */}
            <div>
              <span style={{
                padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                background: c.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                color: c.is_active ? '#22c55e' : '#ef4444',
              }}>
                {c.is_active ? 'Faol' : 'Nofaol'}
              </span>
            </div>

            {/* Toggle action */}
            <form action={async () => { await toggleClinicActive(c.id, c.is_active); }}>
              <button
                type="submit"
                title={c.is_active ? 'O\'chirish' : 'Yoqish'}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                  color: c.is_active ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.5)',
                }}
              >
                {c.is_active ? (
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
            Klinika topilmadi
          </div>
        )}
      </div>
    </div>
  );
}
