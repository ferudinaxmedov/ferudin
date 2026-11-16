import type { Sub } from './data';

/**
 * iCalendar feed of the hub (Google / Apple / Outlook subscribe to it by URL).
 *  - every active subscription with a next charge date = all-day event, repeating by its period,
 *    with the calendar's own reminder one day before;
 *  - every pending reminder (my_reminders) = 15-minute event at its time.
 * The Telegram push 24h before a charge is separate (alerts.ts runTick).
 */

type Reminder = { id: string; text: string; due_at: string };

const HUB = 'https://my.ferudin.uz';
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const day = (iso: string) => iso.slice(0, 10).replace(/-/g, '');
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const nextDay = (iso: string) => {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};
const money = (s: Sub) =>
  s.amount === null || s.amount === undefined
    ? 'narx kiritilmagan'
    : s.currency === 'USD'
      ? `$${s.amount}`
      : `${Math.round(Number(s.amount)).toLocaleString('ru-RU').replace(/\s/g, ' ')} so‘m`;

/** RFC 5545: lines longer than 75 octets are folded with CRLF + space (never splitting a UTF-8 character). */
function fold(line: string): string {
  const out: string[] = [];
  let cur = '';
  let bytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch);
    if (bytes + b > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = '';
      bytes = 0;
    }
    cur += ch;
    bytes += b;
  }
  out.push(cur);
  return out.join('\r\n ');
}

export function buildIcs(subs: Sub[], reminders: Reminder[]): string {
  const now = stamp(new Date());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//my.ferudin.uz//hub//UZ',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:my.ferudin.uz · Obunalar',
    'X-WR-TIMEZONE:Asia/Tashkent',
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
  ];

  for (const s of subs) {
    if (!s.active || !s.next_charge) continue;
    lines.push(
      'BEGIN:VEVENT',
      `UID:sub-${s.id}@my.ferudin.uz`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${day(s.next_charge)}`,
      `DTEND;VALUE=DATE:${day(nextDay(s.next_charge))}`,
      `RRULE:FREQ=${s.period === 'year' ? 'YEARLY' : 'MONTHLY'}`,
      `SUMMARY:${esc(`💳 ${s.name} · ${money(s)}`)}`,
      `DESCRIPTION:${esc([`To‘lov: ${money(s)} / ${s.period === 'year' ? 'yil' : 'oy'}`, s.vendor ? `Xizmat: ${s.vendor}` : '', s.notes ?? '', `${HUB}/my/obunalar`].filter(Boolean).join('\n'))}`,
      `URL:${HUB}/my/obunalar`,
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${esc(`Ertaga to‘lov: ${s.name}`)}`,
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT',
    );
  }

  for (const r of reminders) {
    const start = new Date(r.due_at);
    lines.push(
      'BEGIN:VEVENT',
      `UID:rem-${r.id}@my.ferudin.uz`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(new Date(start.getTime() + 15 * 60_000))}`,
      `SUMMARY:${esc(`⏰ ${r.text}`)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${esc(r.text)}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return `${lines.map(fold).join('\r\n')}\r\n`;
}
