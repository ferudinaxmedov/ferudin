'use client';

import { useState } from 'react';
import { CalendarDays, Check, Copy } from 'lucide-react';

/** Subscribe-by-URL calendar feed (Google / Apple / Outlook). The URL holds a secret: shown only behind 2FA. */
export function CalendarCard({ url }: { url: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!url) {
    return (
      <div className="callout rise">
        <CalendarDays size={18} />
        <div><b>Kalendar ulanmagan</b><p>Vercel&apos;da <span className="mono">HUB_CALENDAR_TOKEN</span> qo&apos;shilgach havola chiqadi.</p></div>
      </div>
    );
  }
  const webcal = url.replace(/^https:/, 'webcal:');
  const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(url!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked: the field below is selectable */ }
  }
  return (
    <div className="card rise cal-card" style={{ '--d': '40ms' } as React.CSSProperties}>
      <div className="cal-head">
        <span className="cal-ico"><CalendarDays size={18} /></span>
        <div>
          <b>Kalendarga ulash</b>
          <p className="small muted">Har bir to&apos;lov sanasi kalendaringizda turadi (kalendar o&apos;zi 1 kun oldin eslatadi). Telegram&apos;ga ham to&apos;lovdan bir kun oldin 09:00 da xabar keladi. Havola maxfiy: hech kimga bermang.</p>
        </div>
      </div>
      <div className="cal-actions">
        <a className="btn btn-primary small" href={google} target="_blank" rel="noreferrer">Google Calendar</a>
        <a className="btn btn-ghost small" href={webcal}>iPhone / Mac</a>
        <button className="btn btn-ghost small" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Nusxa olindi' : 'Havolani nusxalash'}</button>
      </div>
      <input className="input mono small cal-url" readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Kalendar havolasi" />
    </div>
  );
}
