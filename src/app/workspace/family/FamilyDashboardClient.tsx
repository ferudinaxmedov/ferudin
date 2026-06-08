'use client';

import Link from 'next/link';

type Tx = {
  id: string;
  type: string;
  date: string;
  owner: string;
  category: string;
  amount_usd: number | null;
  amount_uzs: number | null;
  note: string | null;
};

type Props = {
  balUsd: number;
  balUzs: number;
  taskCount: number;
  qarzCount: number;
  namozToday: Record<string, string> | null;
  recent: Tx[];
};

const NAMOZ_NAMES = ['bomdod', 'peshin', 'asr', 'shom', 'xufton'];
const NAMOZ_LABELS: Record<string, string> = {
  bomdod: 'Bomdod', peshin: 'Peshin', asr: 'Asr', shom: 'Shom', xufton: 'Xufton',
};

function fmtUzs(n: number) {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  return new Intl.NumberFormat('uz-UZ').format(Math.round(n));
}
function fmtDate(s: string) {
  if (!s) return '';
  try { return new Date(s).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit' }); }
  catch { return s; }
}

const card = {
  background: '#141414',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '16px',
  padding: '20px 24px',
} as const;

const quickLinks = [
  { href: '/workspace/family/hisob', label: 'Hisob', desc: 'Tranzaksiyalar va qarzlar', color: '#22c55e' },
  { href: '/workspace/family/vazifalar', label: 'Vazifalar', desc: 'Faol topshiriqlar', color: '#3b82f6' },
  { href: '/workspace/family/xotira', label: 'Xotira', desc: 'Eslatmalar va kalitlar', color: '#a855f7' },
  { href: '/workspace/family/namoz', label: 'Namoz', desc: "Vaqtlar va hisoboti", color: '#f59e0b' },
  { href: '/workspace/family/mehmonlar', label: 'Mehmonlar', desc: "BnB ro'yxati", color: '#ec4899' },
];

export function FamilyDashboardClient({ balUsd, balUzs, taskCount, qarzCount, namozToday, recent }: Props) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });

  return (
    <div style={{ padding: '32px', maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '26px', margin: '0 0 4px 0' }}>Oila boshqaruvi</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', margin: 0 }}>{dateStr} · {timeStr}</p>
      </div>

      {/* Balance cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={card}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>Balans USD</p>
          <p style={{ color: balUsd >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: '22px', margin: 0 }}>
            {balUsd >= 0 ? '+' : ''}{balUsd.toFixed(2)} $
          </p>
        </div>
        <div style={card}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>Balans UZS</p>
          <p style={{ color: balUzs >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: '22px', margin: 0 }}>
            {balUzs >= 0 ? '+' : ''}{fmtUzs(balUzs)} so&apos;m
          </p>
        </div>
        <div style={{ ...card, cursor: 'pointer' }}>
          <Link href="/workspace/family/vazifalar" style={{ textDecoration: 'none' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>Faol vazifalar</p>
            <p style={{ color: taskCount > 0 ? '#3b82f6' : 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '22px', margin: 0 }}>{taskCount}</p>
          </Link>
        </div>
        <div style={card}>
          <Link href="/workspace/family/hisob" style={{ textDecoration: 'none' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>Aktiv qarzlar</p>
            <p style={{ color: qarzCount > 0 ? '#f59e0b' : 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '22px', margin: 0 }}>{qarzCount}</p>
          </Link>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Today's namoz */}
        <div style={card}>
          <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', margin: '0 0 16px 0' }}>Bugungi namoz vaqtlari</p>
          {namozToday ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {NAMOZ_NAMES.map(n => (
                <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>{NAMOZ_LABELS[n]}</span>
                  <span style={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>{namozToday[n] || '—'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', margin: 0 }}>
              Bugun uchun vaqtlar yuklanmagan
            </p>
          )}
        </div>

        {/* Recent transactions */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', margin: 0 }}>So&apos;nggi tranzaksiyalar</p>
            <Link href="/workspace/family/hisob" style={{ color: '#22c55e', fontSize: '12px', textDecoration: 'none' }}>Barchasi</Link>
          </div>
          {recent.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', margin: 0 }}>Tranzaksiyalar yo&apos;q</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recent.map(tx => {
                const isIncome = tx.type === 'KIRIM';
                const amt = tx.amount_usd ? `${isIncome ? '+' : '-'}${tx.amount_usd}$` : tx.amount_uzs ? `${isIncome ? '+' : '-'}${fmtUzs(tx.amount_uzs)} s` : '';
                return (
                  <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 2px 0' }}>{tx.category}</p>
                      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', margin: 0 }}>{fmtDate(tx.date)} · {tx.owner}</p>
                    </div>
                    <span style={{ color: isIncome ? '#22c55e' : '#ef4444', fontSize: '13px', fontWeight: 600 }}>{amt}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        {quickLinks.map(l => (
          <Link key={l.href} href={l.href} style={{ textDecoration: 'none' }}>
            <div style={{
              ...card,
              padding: '16px 18px',
              transition: 'border-color 0.15s',
              borderColor: 'rgba(255,255,255,0.06)',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color, marginBottom: '10px' }} />
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '13px', margin: '0 0 4px 0' }}>{l.label}</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
