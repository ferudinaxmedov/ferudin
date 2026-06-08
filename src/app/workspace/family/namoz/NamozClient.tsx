'use client';

import { useState, useTransition } from 'react';
import { toggleNamoz } from './actions';

const NAMOZ = ['bomdod', 'peshin', 'asr', 'shom', 'xufton'] as const;
const NAMOZ_LABEL: Record<string, string> = { bomdod: 'Bomdod', peshin: 'Peshin', asr: 'Asr', shom: 'Shom', xufton: 'Xufton' };

type Times = { day: number; bomdod: string | null; peshin: string | null; asr: string | null; shom: string | null; xufton: string | null };
type LogRow = { date: string; owner: string; bomdod: string | null; peshin: string | null; asr: string | null; shom: string | null; xufton: string | null };

type Props = {
  todayTimes: Times | null;
  monthTimes: Times[];
  weekLog: LogRow[];
  todayDate: string;
};

function fmtDate(s: string) {
  try { return new Date(s).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' }); }
  catch { return s; }
}

const card = { background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px 24px' } as const;

function statusStyle(val: string | null): { color: string; bg: string; border: string } {
  if (val === "O'QILDI")   return { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)' };
  if (val === "O'QILMADI") return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)' };
  return { color: 'rgba(255,255,255,0.2)', bg: 'transparent', border: 'rgba(255,255,255,0.08)' };
}

function ToggleBtn({ date, owner, prayer, value }: { date: string; owner: string; prayer: string; value: string | null }) {
  const [pending, startTransition] = useTransition();
  const st = statusStyle(value);

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => toggleNamoz(date, owner, prayer, value))}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '28px', height: '28px', borderRadius: '7px',
        background: st.bg,
        border: `1px solid ${st.border}`,
        color: st.color,
        cursor: pending ? 'default' : 'pointer',
        fontSize: '13px', fontWeight: 700,
        transition: 'all 0.15s',
        opacity: pending ? 0.5 : 1,
      }}
      title={value === "O'QILDI" ? "O'qilmadiga o'zgartirish" : "O'qildiga belgilash"}
    >
      {pending ? '·' : value === "O'QILDI" ? '✓' : value === "O'QILMADI" ? '✗' : '–'}
    </button>
  );
}

export function NamozClient({ todayTimes, monthTimes, weekLog, todayDate }: Props) {
  const [tab, setTab] = useState<'log' | 'month' | 'stats'>('log');

  const uniqueDates = [...new Set(weekLog.map(r => r.date))].sort((a, b) => b.localeCompare(a));

  // Statistics calculations
  function ownerStats(owner: string) {
    const rows = weekLog.filter(r => r.owner === owner);
    const total = rows.reduce((sum, r) => sum + NAMOZ.filter(n => r[n] === "O'QILDI").length, 0);
    const possible = rows.length * 5;
    const pct = possible > 0 ? Math.round((total / possible) * 100) : 0;
    const byPrayer = NAMOZ.map(n => ({
      name: n,
      ok: rows.filter(r => r[n] === "O'QILDI").length,
      total: rows.length,
    }));
    return { total, possible, pct, byPrayer, days: rows.length };
  }

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '24px', margin: '0 0 4px 0' }}>Namoz</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', margin: 0 }}>Vaqtlar, hisobot va statistika</p>
      </div>

      {/* Today prayer times */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0' }}>Bugungi vaqtlar</p>
        {todayTimes ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            {NAMOZ.map(n => (
              <div key={n} style={{ ...card, padding: '16px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px 0' }}>{NAMOZ_LABEL[n]}</p>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: '18px', margin: 0 }}>{todayTimes[n] || '—'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ ...card, textAlign: 'center', padding: '28px' }}>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', margin: 0 }}>Bugun uchun vaqtlar yo&apos;q. Telegram bot orqali foto yuboring.</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {([['log', '7 kunlik hisobot'], ['stats', 'Statistika'], ['month', 'Oy vaqtlari']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            background: tab === k ? '#1f1f1f' : 'transparent',
            border: tab === k ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
            color: tab === k ? '#fff' : 'rgba(255,255,255,0.4)',
            borderRadius: '7px', padding: '7px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
          }}>{l}</button>
        ))}
      </div>

      {/* Weekly log with toggle buttons */}
      {tab === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(['FERUDIN', 'GULOYIM'] as const).map(owner => {
            const ownerLog = weekLog.filter(r => r.owner === owner);
            const logByDate = Object.fromEntries(ownerLog.map(r => [r.date, r]));
            const totalOk = ownerLog.reduce((sum, r) => sum + NAMOZ.filter(n => r[n] === "O'QILDI").length, 0);
            const totalPossible = ownerLog.length * 5;

            return (
              <div key={owner} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', margin: 0 }}>{owner}</p>
                  <span style={{
                    color: totalOk >= totalPossible * 0.8 ? '#22c55e' : totalOk >= totalPossible * 0.5 ? '#f59e0b' : '#ef4444',
                    fontSize: '13px', fontWeight: 600,
                  }}>
                    {totalOk}/{totalPossible} ({totalPossible > 0 ? Math.round(totalOk / totalPossible * 100) : 0}%)
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 500, textAlign: 'left', padding: '4px 8px 8px 0', fontSize: '11px' }}>Sana</th>
                        {NAMOZ.map(n => (
                          <th key={n} style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 500, textAlign: 'center', padding: '4px 6px 8px', fontSize: '11px' }}>{NAMOZ_LABEL[n]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {uniqueDates.map(date => {
                        const row = logByDate[date];
                        return (
                          <tr key={date}>
                            <td style={{
                              color: date === todayDate ? '#22c55e' : 'rgba(255,255,255,0.5)',
                              padding: '5px 8px 5px 0', fontSize: '12px',
                              fontWeight: date === todayDate ? 600 : 400,
                              whiteSpace: 'nowrap',
                            }}>
                              {fmtDate(date)}
                            </td>
                            {NAMOZ.map(n => (
                              <td key={n} style={{ textAlign: 'center', padding: '5px 6px' }}>
                                <ToggleBtn
                                  date={date}
                                  owner={owner}
                                  prayer={n}
                                  value={row ? row[n] : null}
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Statistics tab */}
      {tab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {(['FERUDIN', 'GULOYIM'] as const).map(owner => {
            const { total, possible, pct, byPrayer, days } = ownerStats(owner);
            const pctColor = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

            return (
              <div key={owner} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: '15px', margin: '0 0 3px 0' }}>{owner}</p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>So'nggi {days} kun</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: pctColor, fontWeight: 700, fontSize: '28px', margin: '0 0 1px 0', lineHeight: 1 }}>{pct}%</p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>{total}/{possible} namoz</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '6px', marginBottom: '20px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '4px',
                    background: pctColor,
                    width: `${pct}%`,
                    transition: 'width 0.3s ease',
                  }} />
                </div>

                {/* Per-prayer stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                  {byPrayer.map(({ name, ok, total: t }) => {
                    const p = t > 0 ? Math.round(ok / t * 100) : 0;
                    const c = p >= 80 ? '#22c55e' : p >= 50 ? '#f59e0b' : '#ef4444';
                    return (
                      <div key={name} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 8px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px 0' }}>{NAMOZ_LABEL[name]}</p>
                        <p style={{ color: c, fontWeight: 700, fontSize: '18px', margin: '0 0 2px 0', lineHeight: 1 }}>{p}%</p>
                        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', margin: 0 }}>{ok}/{t}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Month times table */}
      {tab === 'month' && (
        <div style={card}>
          <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', margin: '0 0 16px 0' }}>Bu oy vaqtlari</p>
          {monthTimes.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', margin: 0 }}>Vaqtlar yuklanmagan</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 500, textAlign: 'left', padding: '4px 12px 10px 0', fontSize: '11px' }}>Kun</th>
                    {NAMOZ.map(n => (
                      <th key={n} style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 500, textAlign: 'center', padding: '4px 8px 10px', fontSize: '11px' }}>{NAMOZ_LABEL[n]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthTimes.map(row => (
                    <tr key={row.day} style={{ background: row.day === new Date().getDate() ? 'rgba(34,197,94,0.04)' : 'transparent' }}>
                      <td style={{ color: row.day === new Date().getDate() ? '#22c55e' : 'rgba(255,255,255,0.5)', padding: '7px 12px 7px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontWeight: row.day === new Date().getDate() ? 600 : 400 }}>{row.day}</td>
                      {NAMOZ.map(n => (
                        <td key={n} style={{ color: '#fff', textAlign: 'center', padding: '7px 8px', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '12px' }}>
                          {row[n] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
