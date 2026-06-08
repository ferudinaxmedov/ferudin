'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';

export async function addRegistration(formData: FormData) {
  const sb = createServiceClient();

  const aptEntryRaw  = formData.get('apt_entry_date') as string;
  const depRaw       = formData.get('departure_date') as string;
  const uzbekRaw     = formData.get('uzbek_entry_date') as string;

  const aptEntry  = aptEntryRaw  ? new Date(aptEntryRaw)  : null;
  const dep       = depRaw       ? new Date(depRaw)       : null;
  const regEnd    = dep ? new Date(dep.getTime() + 86400000) : null;

  await sb.from('bnb_registrations').insert({
    guest_name:       formData.get('guest_name') as string,
    passport_id:      (formData.get('passport_id') as string) || null,
    nationality:      (formData.get('nationality') as string) || null,
    dob:              (formData.get('dob') as string) || null,
    uzbek_entry_date: uzbekRaw || null,
    apt_entry_date:   aptEntryRaw || null,
    departure_date:   depRaw || null,
    reg_start_date:   aptEntry ? aptEntry.toISOString().split('T')[0] : null,
    reg_end_date:     regEnd ? regEnd.toISOString().split('T')[0] : null,
    apartment:        (formData.get('apartment') as string) || null,
    room:             (formData.get('room') as string) || null,
    payment_by:       (formData.get('payment_by') as string) || 'direct',
    payment_amount:   (formData.get('payment_amount') as string) || null,
  });

  revalidatePath('/workspace/family/mehmonlar');
}

export async function deleteRegistration(id: string) {
  const sb = createServiceClient();
  await sb.from('bnb_registrations').delete().eq('id', id);
  revalidatePath('/workspace/family/mehmonlar');
}

export async function editRegistration(id: string, formData: FormData) {
  const sb = createServiceClient();

  const aptEntryRaw = formData.get('apt_entry_date') as string;
  const depRaw      = formData.get('departure_date') as string;
  const aptEntry    = aptEntryRaw ? new Date(aptEntryRaw) : null;
  const dep         = depRaw ? new Date(depRaw) : null;
  const regEnd      = dep ? new Date(dep.getTime() + 86400000) : null;

  await sb.from('bnb_registrations').update({
    guest_name:       formData.get('guest_name') as string,
    passport_id:      (formData.get('passport_id') as string) || null,
    nationality:      (formData.get('nationality') as string) || null,
    dob:              (formData.get('dob') as string) || null,
    uzbek_entry_date: (formData.get('uzbek_entry_date') as string) || null,
    apt_entry_date:   aptEntryRaw || null,
    departure_date:   depRaw || null,
    reg_start_date:   aptEntry ? aptEntry.toISOString().split('T')[0] : null,
    reg_end_date:     regEnd ? regEnd.toISOString().split('T')[0] : null,
    apartment:        (formData.get('apartment') as string) || null,
    room:             (formData.get('room') as string) || null,
    payment_by:       (formData.get('payment_by') as string) || 'direct',
    payment_amount:   (formData.get('payment_amount') as string) || null,
  }).eq('id', id);

  revalidatePath('/workspace/family/mehmonlar');
}
