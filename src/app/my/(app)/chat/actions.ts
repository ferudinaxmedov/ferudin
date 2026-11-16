'use server';

import { requireHub } from '@/lib/hub/guard';
import { ask, resetChat, toHtml } from '@/lib/hub/assistant';

export type Reply = { ok: boolean; html: string; model?: string; usd?: number };

export async function sendMessage(text: string): Promise<Reply> {
  await requireHub();
  const a = await ask('web', String(text ?? ''));
  return { ok: a.ok, html: toHtml(a.text), model: a.model, usd: a.usd };
}

export async function newChat(): Promise<void> {
  await requireHub();
  await resetChat('web');
}
