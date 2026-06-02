'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';

export async function toggleUserActive(id: string, current: boolean) {
  const sb = createServiceClient();
  await sb.from('staff_users').update({ is_active: !current }).eq('id', id);
  revalidatePath('/workspace/dentaflow/users');
}

export async function updateUserRole(id: string, role: string) {
  const sb = createServiceClient();
  await sb.from('staff_users').update({ role }).eq('id', id);
  revalidatePath('/workspace/dentaflow/users');
}
