import { requireHub } from '@/lib/hub/guard';
import { getSettings, getSubs } from '@/lib/hub/data';
import { SubsClient } from './SubsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Obunalar' };

export default async function SubsPage() {
  await requireHub();
  const [subs, { usdRate }] = await Promise.all([getSubs(), getSettings()]);
  const token = process.env.HUB_CALENDAR_TOKEN;
  const calendarUrl = token ? `https://my.ferudin.uz/api/hub/calendar?k=${token}` : null;
  return <SubsClient subs={subs} usdRate={usdRate} calendarUrl={calendarUrl} />;
}
