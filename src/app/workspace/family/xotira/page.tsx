export const dynamic = 'force-dynamic';

import { createServiceClient } from '@/lib/supabase';
import { XotiraClient } from './XotiraClient';

export default async function XotiraPage() {
  const sb = createServiceClient();
  const { data } = await sb.from('family_memory')
    .select('id,key,value,owner,date')
    .order('date', { ascending: false });

  return <XotiraClient entries={data ?? []} />;
}
