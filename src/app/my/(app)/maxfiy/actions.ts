'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';
import { audit, requireHub } from '@/lib/hub/guard';
import { readSecret, writeSecret } from '@/lib/hub/secrets';

const str = (v: FormDataEntryValue | null, max = 500) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

/** Decrypts one entry for the owner. Every reveal is written to the audit log. */
export async function reveal(id: string): Promise<{ secret: string | null; notes: string | null } | { error: string }> {
  await requireHub();
  const r = await readSecret(String(id));
  if (!r) return { error: 'Topilmadi' };
  await audit('secret_reveal', { id });
  return r;
}

export async function saveSecret(form: FormData): Promise<{ error?: string }> {
  await requireHub();
  const title = str(form.get('title'), 120);
  if (!title) return { error: 'Nomini kiriting' };
  const id = str(form.get('id'), 64);
  const { error } = await writeSecret({
    id,
    title,
    username: str(form.get('username'), 200),
    url: str(form.get('url'), 500),
    category: str(form.get('category'), 60),
    secret: typeof form.get('secret') === 'string' ? (form.get('secret') as string).slice(0, 2000) : null,
    notes: str(form.get('notes'), 4000),
  });
  if (error) return { error: error.message };
  await audit(id ? 'secret_update' : 'secret_create', { title });
  revalidatePath('/my/maxfiy');
  return {};
}

export async function removeSecret(id: string): Promise<void> {
  await requireHub();
  await createServiceClient().from('my_secrets').delete().eq('id', String(id));
  await audit('secret_delete', { id });
  revalidatePath('/my/maxfiy');
}
