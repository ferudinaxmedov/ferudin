'use server';

import { requireHub } from '@/lib/hub/guard';
import { decide, type Proposal } from '@/lib/hub/actions';
import { ask, resetChat, toHtml } from '@/lib/hub/assistant';

export type Reply = { ok: boolean; html: string; model?: string; usd?: number; proposals?: Proposal[] };

export async function sendMessage(text: string): Promise<Reply> {
  await requireHub();
  const a = await ask('web', String(text ?? ''));
  return { ok: a.ok, html: toHtml(a.text), model: a.model, usd: a.usd, proposals: a.proposals };
}

export async function newChat(): Promise<void> {
  await requireHub();
  await resetChat('web');
}

/** F4: the owner's ✅/❌ on a proposal card. */
export async function decideAction(id: string, yes: boolean): Promise<Proposal | { error: string }> {
  await requireHub();
  return decide(String(id ?? ''), Boolean(yes), 'web');
}
