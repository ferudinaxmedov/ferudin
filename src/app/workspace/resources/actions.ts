'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';

export async function addResource(formData: FormData) {
  const supabase = createServiceClient();
  await supabase.from('ws_resources').insert({
    title: formData.get('title'),
    url: formData.get('url'),
    description: formData.get('description') || null,
    category: formData.get('category') || 'General',
  });
  revalidatePath('/workspace/resources');
}

export async function deleteResource(id: string) {
  const supabase = createServiceClient();
  await supabase.from('ws_resources').delete().eq('id', id);
  revalidatePath('/workspace/resources');
}
