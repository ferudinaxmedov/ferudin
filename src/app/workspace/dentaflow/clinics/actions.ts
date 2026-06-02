'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';

export async function updateClinicPlan(id: string, plan: string) {
  const sb = createServiceClient();
  await sb.from('clinics').update({ plan }).eq('id', id);
  revalidatePath('/workspace/dentaflow/clinics');
}

export async function toggleClinicActive(id: string, current: boolean) {
  const sb = createServiceClient();
  const update = current
    ? { is_active: false, archived_at: new Date().toISOString() }
    : { is_active: true, archived_at: null };
  await sb.from('clinics').update(update).eq('id', id);
  revalidatePath('/workspace/dentaflow/clinics');
}
