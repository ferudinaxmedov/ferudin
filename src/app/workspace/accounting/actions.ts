'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';

export async function addTransaction(formData: FormData) {
  const supabase = createServiceClient();
  await supabase.from('ws_transactions').insert({
    type: formData.get('type'),
    amount: parseFloat(formData.get('amount') as string),
    currency: formData.get('currency') || 'UZS',
    description: formData.get('description'),
    category: formData.get('category') || 'General',
    date: formData.get('date') || new Date().toISOString().split('T')[0],
  });
  revalidatePath('/workspace/accounting');
}

export async function deleteTransaction(id: string) {
  const supabase = createServiceClient();
  await supabase.from('ws_transactions').delete().eq('id', id);
  revalidatePath('/workspace/accounting');
}
