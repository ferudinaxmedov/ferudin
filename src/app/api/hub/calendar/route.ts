import { timingSafeEqual } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase';
import { buildIcs } from '@/lib/hub/calendar';
import { getSubs } from '@/lib/hub/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Hub iCalendar feed. Calendar apps cannot log in, so the URL carries a long secret (?k=HUB_CALENDAR_TOKEN).
// Only subscription names, prices, dates and reminder texts are in it: no customer data.

function allowed(k: string | null) {
  const secret = process.env.HUB_CALENDAR_TOKEN;
  if (!secret || secret.length < 32 || !k) return false;
  const a = Buffer.from(k);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!allowed(new URL(req.url).searchParams.get('k'))) return new Response('not found', { status: 404 });
  const [subs, { data: reminders }] = await Promise.all([
    getSubs(),
    createServiceClient().from('my_reminders').select('id, text, due_at').is('sent_at', null).is('cancelled_at', null).order('due_at').limit(200),
  ]);
  return new Response(buildIcs(subs, reminders ?? []), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="my-ferudin-obunalar.ics"',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
