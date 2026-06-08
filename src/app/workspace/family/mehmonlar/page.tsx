export const dynamic = 'force-dynamic';

import { createServiceClient } from '@/lib/supabase';
import { MehmonlarClient } from './MehmonlarClient';

export default async function MehmonlarPage() {
  const sb = createServiceClient();

  const { data } = await sb.from('family_bnb_registrations')
    .select('id,passport_id,guest_name,nationality,dob,uzbek_entry_date,apt_entry_date,departure_date,reg_start_date,reg_end_date,apartment,room,payment_amount,payment_by,created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  return <MehmonlarClient registrations={data ?? []} />;
}
