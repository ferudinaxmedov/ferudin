import { createServiceClient } from '@/lib/supabase';
import { decrypt, encrypt } from './crypto';

/**
 * Hub password vault (replaces the old /workspace/secrets, which stored passwords in plain text).
 * Password and notes are AES-256-GCM encrypted with HUB_ENC_KEY; the list never decrypts.
 * Claude has NO tool for this table on purpose.
 */

export type SecretRow = { id: string; title: string; username: string | null; url: string | null; category: string; hasSecret: boolean; hasNotes: boolean; updated_at: string };

export async function listSecrets(): Promise<SecretRow[]> {
  const { data } = await createServiceClient().from('my_secrets')
    .select('id, title, username, url, category, secret_enc, notes_enc, updated_at').order('category').order('title');
  return (data ?? []).map(({ secret_enc, notes_enc, ...r }) => ({ ...r, hasSecret: Boolean(secret_enc), hasNotes: Boolean(notes_enc) }));
}

export async function readSecret(id: string): Promise<{ secret: string | null; notes: string | null } | null> {
  const { data } = await createServiceClient().from('my_secrets').select('secret_enc, notes_enc').eq('id', id).maybeSingle();
  if (!data) return null;
  return { secret: data.secret_enc ? decrypt(data.secret_enc) : null, notes: data.notes_enc ? decrypt(data.notes_enc) : null };
}

export async function writeSecret(input: { id?: string | null; title: string; username?: string | null; url?: string | null; category?: string | null; secret?: string | null; notes?: string | null }) {
  const row: Record<string, unknown> = {
    title: input.title,
    username: input.username || null,
    url: input.url || null,
    category: input.category || 'Umumiy',
    updated_at: new Date().toISOString(),
  };
  // Empty password/notes on edit = keep the stored value.
  if (input.secret) row.secret_enc = encrypt(input.secret);
  if (input.notes) row.notes_enc = encrypt(input.notes);
  const db = createServiceClient();
  return input.id ? db.from('my_secrets').update(row).eq('id', input.id) : db.from('my_secrets').insert(row);
}

/**
 * One-time move from the old plain-text ws_secrets into my_secrets (encrypted), then the old rows are deleted.
 * Idempotent through legacy_id. Never returns or logs any secret value.
 */
export async function migrateLegacySecrets(): Promise<{ moved: number; deleted: number; left: number }> {
  const db = createServiceClient();
  const { data: old, error } = await db.from('ws_secrets').select('id, title, username, password, url, notes, category, created_at');
  if (error || !old?.length) return { moved: 0, deleted: 0, left: 0 };
  let moved = 0;
  for (const r of old) {
    const { error: e } = await db.from('my_secrets').upsert({
      legacy_id: r.id,
      title: r.title || 'Nomsiz',
      username: r.username,
      url: r.url,
      category: r.category || 'Umumiy',
      secret_enc: r.password ? encrypt(r.password) : null,
      notes_enc: r.notes ? encrypt(r.notes) : null,
      created_at: r.created_at,
    }, { onConflict: 'legacy_id' });
    if (!e) moved++;
  }
  // Delete only the rows whose encrypted copy is confirmed to exist.
  const { data: copies } = await db.from('my_secrets').select('legacy_id').in('legacy_id', old.map((r) => r.id));
  const safe = (copies ?? []).map((c) => c.legacy_id as string);
  if (safe.length) await db.from('ws_secrets').delete().in('id', safe);
  return { moved, deleted: safe.length, left: old.length - safe.length };
}
