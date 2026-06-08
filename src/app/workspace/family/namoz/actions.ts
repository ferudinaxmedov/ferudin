'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';

export async function toggleNamoz(date: string, owner: string, prayer: string, current: string | null) {
  const sb = createServiceClient();
  const next = current === "O'QILDI" ? "O'QILMADI" : "O'QILDI";

  const { data: existing } = await sb
    .from('family_namoz_log')
    .select('id')
    .eq('date', date)
    .eq('owner', owner)
    .single();

  if (existing) {
    await sb.from('family_namoz_log').update({ [prayer]: next }).eq('id', existing.id);
  } else {
    const row: Record<string, string> = { date, owner, [prayer]: next };
    await sb.from('family_namoz_log').insert(row);
  }

  revalidatePath('/workspace/family/namoz');
  revalidatePath('/workspace/family');
}
