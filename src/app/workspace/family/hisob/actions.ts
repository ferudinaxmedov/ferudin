'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';

export async function addTransaction(formData: FormData) {
  const sb = createServiceClient();
  const amtUsd = formData.get('amount_usd') as string;
  const amtUzs = formData.get('amount_uzs') as string;

  await sb.from('family_transactions').insert({
    type: formData.get('type') as string,
    date: formData.get('date') as string,
    owner: formData.get('owner') as string,
    category: formData.get('category') as string,
    payment_method: formData.get('payment_method') as string,
    amount_usd: amtUsd ? parseFloat(amtUsd) : null,
    amount_uzs: amtUzs ? parseFloat(amtUzs) : null,
    note: (formData.get('note') as string) || null,
  });
  revalidatePath('/workspace/family/hisob');
  revalidatePath('/workspace/family');
}

export async function deleteTransaction(id: string) {
  const sb = createServiceClient();
  await sb.from('family_transactions').delete().eq('id', id);
  revalidatePath('/workspace/family/hisob');
  revalidatePath('/workspace/family');
}

export async function addQarz(formData: FormData) {
  const sb = createServiceClient();
  const amtUsd = formData.get('amount_usd') as string;
  const amtUzs = formData.get('amount_uzs') as string;

  const { data: cnt } = await sb.from('family_qarz').select('id', { count: 'exact', head: false });
  const number = cnt?.length ?? 0;

  await sb.from('family_qarz').insert({
    number,
    type: formData.get('type') as string,
    person: formData.get('person') as string,
    amount_usd: amtUsd ? parseFloat(amtUsd) : null,
    amount_uzs: amtUzs ? parseFloat(amtUzs) : null,
    date: formData.get('date') as string,
    deadline: (formData.get('deadline') as string) || null,
    status: 'AKTIV',
    note: (formData.get('note') as string) || null,
  });
  revalidatePath('/workspace/family/hisob');
}

export async function closeQarz(id: string) {
  const sb = createServiceClient();
  const today = new Date().toISOString().split('T')[0];
  await sb.from('family_qarz').update({ status: 'TUGADI', returned_date: today }).eq('id', id);
  revalidatePath('/workspace/family/hisob');
}
