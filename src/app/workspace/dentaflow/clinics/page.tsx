import { createServiceClient } from '@/lib/supabase';
import { ClinicsClient } from './ClinicsClient';

export default async function ClinicsPage() {
  const sb = createServiceClient();
  const { data: clinics } = await sb
    .from('clinics')
    .select('id,name,slug,owner_email,phone,city,plan,is_active,trial_ends_at,created_at')
    .order('created_at', { ascending: false });

  return <ClinicsClient clinics={clinics ?? []} />;
}
