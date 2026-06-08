'use client';

import { useState, useEffect } from 'react';

const DAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

export function FloatingBar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const timeStr = `${h}:${m}:${s}`;
  const dateStr = `${now.getDate()} ${MONTHS[now.getMonth()]}`;
  const dayStr = DAYS[now.getDay()];

  return (
    <div
      aria-label="Joriy vaqt"
      style={{
        position: 'fixed',
        top: '16px',
        right: '24px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(14,14,14,0.6)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '9px 18px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.04em' }}>
          {dayStr}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', fontWeight: 500 }}>
          {dateStr}
        </span>
      </div>
      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.08)' }} />
      <span style={{
        color: '#e8e8e8',
        fontSize: '16px',
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.03em',
        lineHeight: 1,
      }}>
        {timeStr}
      </span>
      <div style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: '#22c55e',
        boxShadow: '0 0 8px rgba(34,197,94,0.6)',
        animation: 'pulse-green 2s ease-in-out infinite',
      }} />
    </div>
  );
}
