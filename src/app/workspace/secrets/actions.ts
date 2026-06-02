'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';

export async function addSecret(formData: FormData) {
  const supabase = createServiceClient();
  await supabase.from('ws_secrets').insert({
    title: formData.get('title'),
    username: formData.get('username') || null,
    password: formData.get('password') || null,
    url: formData.get('url') || null,
    notes: formData.get('notes') || null,
    category: formData.get('category') || 'General',
  });
  revalidatePath('/workspace/secrets');
}

export async function deleteSecret(id: string) {
  const supabase = createServiceClient();
  await supabase.from('ws_secrets').delete().eq('id', id);
  revalidatePath('/workspace/secrets');
}
