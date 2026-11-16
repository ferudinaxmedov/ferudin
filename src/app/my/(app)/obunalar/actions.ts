'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';
import { audit, requireHub } from '@/lib/hub/guard';
import { BUCKETS } from '@/lib/hub/projects';

const str = (v: FormDataEntryValue | null) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 500) : null);

export async function saveSub(form: FormData): Promise<{ error?: string }> {
  await requireHub();
  const name = str(form.get('name'));
  if (!name) return { error: 'Nomini kiriting' };
  const rawAmount = str(form.get('amount'));
  const amount = rawAmount === null ? null : Number(rawAmount.replace(/\s/g, '').replace(',', '.'));
  if (amount !== null && (!Number.isFinite(amount) || amount < 0)) return { error: "Narx noto'g'ri" };
  const project = String(form.get('project') ?? 'umumiy');
  const row = {
    name,
    vendor: str(form.get('vendor')),
    kind: form.get('kind') === 'usage' ? 'usage' : 'fixed',
    amount,
    currency: form.get('currency') === 'UZS' ? 'UZS' : 'USD',
    period: form.get('period') === 'year' ? 'year' : 'month',
    next_charge: str(form.get('next_charge')),
    project: BUCKETS.some((b) => b.key === project) ? project : 'umumiy',
    url: str(form.get('url')),
    notes: str(form.get('notes')),
    active: form.get('active') === 'on',
    updated_at: new Date().toISOString(),
  };
  const id = str(form.get('id'));
  const db = createServiceClient();
  const { error } = id ? await db.from('my_subscriptions').update(row).eq('id', id) : await db.from('my_subscriptions').insert(row);
  if (error) return { error: error.message };
  await audit(id ? 'sub_update' : 'sub_create', { name });
  revalidatePath('/my', 'layout');
  return {};
}

export async function deleteSub(id: string): Promise<void> {
  await requireHub();
  await createServiceClient().from('my_subscriptions').delete().eq('id', id);
  await audit('sub_delete', { id });
  revalidatePath('/my', 'layout');
}

export async function saveRate(form: FormData): Promise<{ error?: string }> {
  await requireHub();
  const rate = Number(String(form.get('usd_rate') ?? '').replace(/\s/g, ''));
  if (!Number.isFinite(rate) || rate < 1000 || rate > 100_000) return { error: "Kurs noto'g'ri" };
  await createServiceClient().from('my_settings').update({ usd_rate: rate, usd_rate_source: 'manual', updated_at: new Date().toISOString() }).eq('id', 1);
  await audit('usd_rate', { rate });
  revalidatePath('/my', 'layout');
  return {};
}
