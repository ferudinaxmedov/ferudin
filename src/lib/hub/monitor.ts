import { connect } from 'node:tls';
import { createServiceClient } from '@/lib/supabase';
import type { Signal } from './signals';

/**
 * Site monitor (hub F5): every public site gets an HTTPS request (status + response time) and a TLS handshake
 * (certificate expiry). Run from pg_cron every 5 minutes (mode "monitor"); results in my_monitor.
 * Signals: down (2 checks in a row via the alert tick's confirm rule), slow > 4 s, SSL < 14 days.
 */

export const SITES: { host: string; project: string; path?: string }[] = [
  { host: 'dentaflow.uz', project: 'dentaflow' },
  { host: 'console.dentaflow.uz', project: 'dentaflow' },
  { host: 'seedbee.uz', project: 'seedbee' },
  { host: 'crm.firstcosmetics.uz', project: 'seedbee' },
  { host: 'firstcosmetics.uz', project: 'seedbee' },
  { host: 'link.seedbee.uz', project: 'seedbee' },
  { host: 'skyplus.uz', project: 'skyplus' },
  { host: 'crm.skyplus.uz', project: 'skyplus' },
  { host: 'student.skyplus.uz', project: 'skyplus' },
  { host: 'community.ferudin.uz', project: 'aiblok' },
  { host: 'hongsam.uz', project: 'hongsam' },
  { host: 'ferudin.uz', project: 'ferudin' },
  { host: 'my.ferudin.uz', project: 'ferudin', path: '/my/login' },
];

export type MonitorRow = { site: string; ok: boolean; status: number | null; ms: number | null; ssl_expires: string | null; error: string | null; checked_at: string };

const SLOW_MS = 4000;
const SSL_WARN_DAYS = 14;

function certExpiry(host: string): Promise<string | null> {
  return new Promise((resolve) => {
    const sock = connect({ host, port: 443, servername: host, timeout: 8000 }, () => {
      const cert = sock.getPeerCertificate();
      sock.end();
      resolve(cert?.valid_to ? new Date(cert.valid_to).toISOString() : null);
    });
    sock.on('error', () => resolve(null));
    sock.on('timeout', () => { sock.destroy(); resolve(null); });
  });
}

async function check(site: (typeof SITES)[number]) {
  const started = Date.now();
  let status: number | null = null;
  let error: string | null = null;
  try {
    const res = await fetch(`https://${site.host}${site.path ?? '/'}`, {
      redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(15_000),
      headers: { 'user-agent': 'my-ferudin-monitor/1.0' },
    });
    status = res.status;
    await res.body?.cancel().catch(() => undefined);
  } catch (e) {
    error = e instanceof Error ? (e.name === 'TimeoutError' ? 'javob 15 s ichida kelmadi' : e.message).slice(0, 200) : 'xato';
  }
  const ms = Date.now() - started;
  const ssl = await certExpiry(site.host);
  const ok = status !== null && status < 500;
  return { site: site.host, ok, status, ms: status === null ? null : ms, ssl_expires: ssl, error: ok ? null : error ?? `HTTP ${status}`, checked_at: new Date().toISOString() };
}

export async function runMonitor() {
  const rows = await Promise.all(SITES.map(check));
  const { error } = await createServiceClient().from('my_monitor').upsert(rows);
  return { ok: !error, checked: rows.length, down: rows.filter((r) => !r.ok).map((r) => r.site), reason: error?.message };
}

export async function getMonitor(): Promise<MonitorRow[]> {
  const { data } = await createServiceClient().from('my_monitor').select('*').order('site');
  return (data ?? []) as MonitorRow[];
}

export const sslDaysLeft = (iso: string | null) => (iso ? Math.floor((Date.parse(iso) - Date.now()) / 86_400_000) : null);

/** Signals for the alert tick / overview. Stale rows (> 30 min old) are ignored: the monitor itself may be down. */
export function monitorSignals(rows: MonitorRow[]): Signal[] {
  const out: Signal[] = [];
  const fresh = rows.filter((r) => Date.now() - Date.parse(r.checked_at) < 30 * 60_000);
  for (const r of fresh) {
    if (!r.ok) {
      out.push({ key: `site:${r.site}`, tone: 'bad', title: `${r.site} ochilmayapti`, text: r.error ?? 'Sayt javob bermadi', href: '/my/holat', confirm: true });
    } else if (r.ms !== null && r.ms > SLOW_MS) {
      out.push({ key: `slow:${r.site}`, tone: 'warn', title: `${r.site} sekin`, text: `Javob ${(r.ms / 1000).toFixed(1)} s`, href: '/my/holat', confirm: true });
    }
    const days = sslDaysLeft(r.ssl_expires);
    if (days !== null && days < SSL_WARN_DAYS) {
      out.push({ key: `ssl:${r.site}`, tone: days < 3 ? 'bad' : 'warn', title: `${r.site} SSL sertifikati tugayapti`, text: `${days} kun qoldi`, href: '/my/holat' });
    }
  }
  return out;
}
