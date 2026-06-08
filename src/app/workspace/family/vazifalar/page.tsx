export const dynamic = 'force-dynamic';

import { createServiceClient } from '@/lib/supabase';
import { VazifalarClient } from './VazifalarClient';

export default async function VazifalarPage() {
  const sb = createServiceClient();

  const { data } = await sb.from('family_tasks')
    .select('id,text,owner,status,scheduled_at,created_date')
    .order('scheduled_at', { ascending: true });

  return <VazifalarClient tasks={data ?? []} />;
}
