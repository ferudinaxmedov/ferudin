'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';

export async function saveMemory(formData: FormData) {
  const sb = createServiceClient();
  const key = (formData.get('key') as string).trim().toLowerCase();
  const value = formData.get('value') as string;
  const owner = formData.get('owner') as string;
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await sb.from('family_memory')
    .select('id').ilike('key', key).limit(1);

  if (existing && existing.length > 0) {
    await sb.from('family_memory').update({ value, owner, date: today }).eq('id', existing[0].id);
  } else {
    await sb.from('family_memory').insert({ key, value, owner, date: today });
  }
  revalidatePath('/workspace/family/xotira');
}

export async function deleteMemory(id: string) {
  const sb = createServiceClient();
  await sb.from('family_memory').delete().eq('id', id);
  revalidatePath('/workspace/family/xotira');
}
