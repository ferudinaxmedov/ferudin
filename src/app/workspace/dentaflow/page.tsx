import { createServiceClient } from '@/lib/supabase';

function StatCard({ label, value, sub, color = '#22c55e' }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</p>
      <p style={{ color, fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '4px' }}>{sub}</p>}
    </div>
  );
}

export default async function DentaFlowDashboard() {
  const sb = createServiceClient();

  const [clinics, users, patients, appointments] = await Promise.all([
    sb.from('clinics').select('id,is_active,plan,trial_ends_at'),
    sb.from('staff_users').select('id,role,is_active'),
    sb.from('patients').select('id', { count: 'exact', head: true }),
    sb.from('appointments').select('id,status', { count: 'exact', head: false }),
  ]);

  const allClinics = clinics.data ?? [];
  const allUsers = users.data ?? [];
  const allAppts = appointments.data ?? [];

  const activeClinics = allClinics.filter(c => c.is_active).length;
  const trialClinics = allClinics.filter(c => c.trial_ends_at && new Date(c.trial_ends_at) > new Date()).length;
  const plans = { starter: 0, pro: 0, enterprise: 0 };
  allClinics.forEach(c => { if (c.plan in plans) plans[c.plan as keyof typeof plans]++; });

  const activeUsers = allUsers.filter(u => u.is_active).length;
  const roles = { super_admin: 0, admin: 0, doctor: 0, registrator: 0 };
  allUsers.forEach(u => { if (u.role in roles) roles[u.role as keyof typeof roles]++; });

  const todayAppts = allAppts.filter(a => {
    // appointments doesn't have date column in head:false - just count total
    return true;
  }).length;

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>DentaFlow CRM</p>
        </div>
        <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '1.75rem', margin: 0 }}>Superadmin Dashboard</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <StatCard label="Jami klinikalar" value={allClinics.length} sub={`${activeClinics} faol`} />
        <StatCard label="Foydalanuvchilar" value={allUsers.length} sub={`${activeUsers} faol`} color="#0ea5e9" />
        <StatCard label="Bemorlar" value={patients.count ?? 0} color="#a855f7" />
        <StatCard label="Uchrashuvlar" value={allAppts.length} color="#f59e0b" />
      </div>

      {/* Plans + Roles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Plans breakdown */}
        <div style={{ padding: '20px', borderRadius: '16px', background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Tariflar</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Enterprise', count: plans.enterprise, color: '#f59e0b' },
              { label: 'Pro', count: plans.pro, color: '#22c55e' },
              { label: 'Starter', count: plans.starter, color: 'rgba(255,255,255,0.3)' },
              { label: 'Trial', count: trialClinics, color: '#0ea5e9' },
            ].map(p => (
              <div key={p.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.color }} />
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{p.label}</span>
                </div>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Roles breakdown */}
        <div style={{ padding: '20px', borderRadius: '16px', background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Rollar</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Super Admin', count: roles.super_admin, color: '#f59e0b' },
              { label: 'Admin', count: roles.admin, color: '#22c55e' },
              { label: 'Doctor', count: roles.doctor, color: '#0ea5e9' },
              { label: 'Registrator', count: roles.registrator, color: 'rgba(255,255,255,0.3)' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.color }} />
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{r.label}</span>
                </div>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
