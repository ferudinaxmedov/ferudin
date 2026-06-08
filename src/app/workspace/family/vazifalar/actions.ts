'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';

export async function addTask(formData: FormData) {
  const sb = createServiceClient();
  const dateTime = formData.get('scheduled_at') as string;

  await sb.from('family_tasks').insert({
    text: formData.get('text') as string,
    owner: formData.get('owner') as string,
    status: 'FAOL',
    created_date: new Date().toISOString().split('T')[0],
    scheduled_at: dateTime ? new Date(dateTime).toISOString() : null,
    chat_id: null,
  });
  revalidatePath('/workspace/family/vazifalar');
  revalidatePath('/workspace/family');
}

export async function markTaskDone(id: string) {
  const sb = createServiceClient();
  await sb.from('family_tasks').update({ status: 'BAJARILDI' }).eq('id', id);
  revalidatePath('/workspace/family/vazifalar');
  revalidatePath('/workspace/family');
}

export async function markTaskSkipped(id: string) {
  const sb = createServiceClient();
  await sb.from('family_tasks').update({ status: 'OTKAZILDI' }).eq('id', id);
  revalidatePath('/workspace/family/vazifalar');
}

export async function deleteTask(id: string) {
  const sb = createServiceClient();
  await sb.from('family_tasks').delete().eq('id', id);
  revalidatePath('/workspace/family/vazifalar');
  revalidatePath('/workspace/family');
}
