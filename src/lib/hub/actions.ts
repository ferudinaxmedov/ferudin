import type Anthropic from '@anthropic-ai/sdk';
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';
import { getSettings, getSubs, type Sub } from './data';
import { BUCKETS } from './projects';

/**
 * Hub F4: confirm-then-act. Claude never writes directly: a propose_* tool validates the input, stores a
 * pending row in my_actions and returns a summary. Only the owner's ✅ (web card or Telegram button) runs it.
 * Scope (owner decision 2026-11-17): hub-internal data only (subscriptions, reminders, signal mutes, USD rate).
 */

export type Via = 'web' | 'tg';
export type Proposal = { id: string; summary: string; status: string; result: string | null };
const TTL_MIN = 30;

const db = () => createServiceClient();
const s = (v: unknown, max = 300) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const fmtAmount = (x: Pick<Sub, 'amount' | 'currency' | 'period'>) =>
  x.amount === null || x.amount === undefined
    ? 'narxsiz'
    : `${x.currency === 'USD' ? `$${x.amount}` : `${Number(x.amount).toLocaleString('ru-RU').replace(/,/g, ' ')} so‘m`} / ${x.period === 'year' ? 'yil' : 'oy'}`;
const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat('uz-UZ', { timeZone: 'Asia/Tashkent', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
const bucketName = (k: string) => BUCKETS.find((b) => b.key === k)?.name ?? k;

export const ACTION_TOOLS: Anthropic.Tool[] = [
  {
    name: 'reminders_and_mutes',
    description: "Faol eslatmalar (hali yuborilmagan) va vaqtincha o'chirilgan signallar ro'yxati. Eslatmani bekor qilish yoki signalni qayta yoqishdan oldin id/kalitni shu yerdan ol.",
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'propose_subscription',
    description: "Obuna qo'shish yoki o'zgartirishni TAKLIF qilish (bajarmaydi). O'zgartirishda id ni subscriptions asbobidan ol va faqat o'zgaradigan maydonlarni ber.",
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: "Mavjud obuna id si (o'zgartirish uchun). Yangi obunada berilmaydi." },
        name: { type: 'string' },
        vendor: { type: 'string' },
        amount: { type: ['number', 'null'], description: 'Narx (valyutada). null = narxsiz' },
        currency: { type: 'string', enum: ['USD', 'UZS'] },
        period: { type: 'string', enum: ['month', 'year'] },
        kind: { type: 'string', enum: ['fixed', 'usage'] },
        next_charge: { type: ['string', 'null'], description: 'Keyingi to‘lov sanasi YYYY-MM-DD' },
        project: { type: 'string', enum: BUCKETS.map((b) => b.key) },
        notes: { type: 'string' },
        active: { type: 'boolean' },
      },
    },
  },
  {
    name: 'propose_subscription_off',
    description: "Obunani o'chirib qo'yishni (active=false, o'chirib yuborilmaydi) TAKLIF qilish.",
    input_schema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
  },
  {
    name: 'propose_reminder',
    description: "Eslatma qo'shishni TAKLIF qilish. Belgilangan vaqtda Telegram'ga keladi (15 daqiqagacha kechikish bilan).",
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Eslatma matni' },
        due_at: { type: 'string', description: "Vaqt, ISO 8601, Toshkent zonasi bilan, masalan 2026-11-18T09:00:00+05:00" },
      },
      required: ['text', 'due_at'],
    },
  },
  {
    name: 'propose_reminder_cancel',
    description: 'Hali yuborilmagan eslatmani bekor qilishni TAKLIF qilish.',
    input_schema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
  },
  {
    name: 'propose_mute',
    description: "Signalni Telegram ogohlantirishlari va ertalabki hisobotdan vaqtincha o'chirishni TAKLIF qilish. Kalitni hub_overview signallaridan ol (masalan sp:leads, sub:<id>, down:seedbee). hours=0 bo'lsa qayta yoqiladi.",
    input_schema: {
      type: 'object',
      properties: { key: { type: 'string' }, hours: { type: 'integer', minimum: 0, maximum: 720 } },
      required: ['key', 'hours'],
    },
  },
  {
    name: 'propose_usd_rate',
    description: "Hubdagi dollar kursini (so'm) qo'lda o'zgartirishni TAKLIF qilish. Odatda kerak emas: kurs Markaziy bankdan har kuni avtomatik olinadi, qo'lda qiymat keyingi yangilanishgacha turadi.",
    input_schema: { type: 'object', properties: { rate: { type: 'number' } }, required: ['rate'] },
  },
];

export const isActionTool = (name: string) => ACTION_TOOLS.some((t) => t.name === name);

type Built = { kind: string; input: Record<string, unknown>; summary: string } | { error: string };

async function build(name: string, raw: Record<string, unknown>): Promise<Built> {
  switch (name) {
    case 'propose_subscription': {
      const subs = await getSubs();
      const id = s(raw.id, 64);
      const cur = id ? subs.find((x) => x.id === id) : null;
      if (id && !cur) return { error: `Obuna topilmadi: ${id}` };
      const patch: Record<string, unknown> = {};
      const name_ = s(raw.name, 120);
      if (name_) patch.name = name_;
      if (raw.vendor !== undefined) patch.vendor = s(raw.vendor, 120);
      if (raw.notes !== undefined) patch.notes = s(raw.notes, 500);
      if (raw.amount !== undefined) {
        if (raw.amount === null) patch.amount = null;
        else {
          const a = Number(raw.amount);
          if (!Number.isFinite(a) || a < 0 || a > 1e10) return { error: "Narx noto'g'ri" };
          patch.amount = a;
        }
      }
      if (raw.currency !== undefined) {
        if (raw.currency !== 'USD' && raw.currency !== 'UZS') return { error: 'Valyuta USD yoki UZS' };
        patch.currency = raw.currency;
      }
      if (raw.period !== undefined) {
        if (raw.period !== 'month' && raw.period !== 'year') return { error: 'Davr month yoki year' };
        patch.period = raw.period;
      }
      if (raw.kind !== undefined) patch.kind = raw.kind === 'usage' ? 'usage' : 'fixed';
      if (raw.next_charge !== undefined) {
        const d = s(raw.next_charge, 10);
        if (d && (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(Date.parse(d)))) return { error: 'Sana YYYY-MM-DD bo‘lsin' };
        patch.next_charge = d;
      }
      if (raw.project !== undefined) {
        if (!BUCKETS.some((b) => b.key === raw.project)) return { error: `Noma'lum loyiha: ${String(raw.project)}` };
        patch.project = raw.project;
      }
      if (raw.active !== undefined) patch.active = Boolean(raw.active);

      if (!cur) {
        if (!patch.name) return { error: 'Yangi obuna uchun nom kerak' };
        const row = { kind: 'fixed', amount: null, currency: 'USD', period: 'month', project: 'umumiy', active: true, ...patch } as Sub;
        const bits = [fmtAmount(row), bucketName(row.project), row.next_charge ? `keyingi to‘lov ${row.next_charge}` : null].filter(Boolean);
        return { kind: 'sub_create', input: row as unknown as Record<string, unknown>, summary: `Yangi obuna: ${row.name} (${bits.join(', ')})` };
      }
      const changes: string[] = [];
      const after = { ...cur, ...patch } as Sub;
      if ('amount' in patch || 'currency' in patch || 'period' in patch) {
        if (fmtAmount(cur) !== fmtAmount(after)) changes.push(`narx: ${fmtAmount(cur)} → ${fmtAmount(after)}`);
      }
      for (const [k, label] of [['name', 'nom'], ['vendor', 'sotuvchi'], ['next_charge', 'keyingi to‘lov'], ['notes', 'izoh'], ['kind', 'turi']] as const) {
        if (k in patch && (cur[k] ?? null) !== (patch[k] ?? null)) changes.push(`${label}: ${cur[k] ?? '—'} → ${(patch[k] as string | null) ?? '—'}`);
      }
      if ('project' in patch && cur.project !== patch.project) changes.push(`loyiha: ${bucketName(cur.project)} → ${bucketName(String(patch.project))}`);
      if ('active' in patch && cur.active !== patch.active) changes.push(patch.active ? 'yoqiladi' : 'o‘chiriladi');
      if (!changes.length) return { error: "O'zgarish yo'q: qiymatlar hozirgisi bilan bir xil" };
      return { kind: 'sub_update', input: { id: cur.id, patch }, summary: `${cur.name}: ${changes.join('; ')}` };
    }
    case 'propose_subscription_off': {
      const cur = (await getSubs()).find((x) => x.id === s(raw.id, 64));
      if (!cur) return { error: 'Obuna topilmadi' };
      if (!cur.active) return { error: 'Bu obuna allaqachon o‘chirilgan' };
      return { kind: 'sub_update', input: { id: cur.id, patch: { active: false } }, summary: `${cur.name} obunasini o‘chirib qo‘yish (${fmtAmount(cur)})` };
    }
    case 'propose_reminder': {
      const text = s(raw.text, 500);
      const due = Date.parse(String(raw.due_at ?? ''));
      if (!text) return { error: 'Eslatma matni bo‘sh' };
      if (!Number.isFinite(due)) return { error: 'Vaqt noto‘g‘ri (ISO 8601 kerak)' };
      if (due < Date.now() - 60_000) return { error: 'Bu vaqt o‘tib ketgan' };
      if (due > Date.now() + 400 * 86_400_000) return { error: 'Juda uzoq sana (13 oydan ko‘p)' };
      const iso = new Date(due).toISOString();
      return { kind: 'reminder_add', input: { text, due_at: iso }, summary: `Eslatma ${fmtTime(iso)}: ${text}` };
    }
    case 'propose_reminder_cancel': {
      const { data } = await db().from('my_reminders').select('id, text, due_at, sent_at, cancelled_at').eq('id', s(raw.id, 64) ?? '').maybeSingle();
      if (!data || data.sent_at || data.cancelled_at) return { error: 'Faol eslatma topilmadi' };
      return { kind: 'reminder_cancel', input: { id: data.id }, summary: `Eslatmani bekor qilish: ${fmtTime(data.due_at)} · ${data.text}` };
    }
    case 'propose_mute': {
      const key = s(raw.key, 120);
      const hours = Math.round(Number(raw.hours));
      if (!key || !/^[a-z]+:[\w.-]+$/i.test(key)) return { error: 'Signal kaliti noto‘g‘ri' };
      if (!Number.isFinite(hours) || hours < 0 || hours > 720) return { error: 'Soat 0–720 oralig‘ida' };
      if (hours === 0) return { kind: 'unmute', input: { key }, summary: `Signalni qayta yoqish: ${key}` };
      const until = new Date(Date.now() + hours * 3_600_000).toISOString();
      return { kind: 'mute', input: { key, until }, summary: `Signalni o‘chirish: ${key}, ${fmtTime(until)} gacha` };
    }
    case 'propose_usd_rate': {
      const rate = Math.round(Number(raw.rate));
      if (!Number.isFinite(rate) || rate < 1000 || rate > 100_000) return { error: "Kurs noto'g'ri" };
      const { usdRate } = await getSettings();
      if (rate === usdRate) return { error: 'Kurs allaqachon shu' };
      return { kind: 'usd_rate', input: { rate }, summary: `Dollar kursi: ${usdRate} → ${rate} so‘m` };
    }
    default:
      return { error: `Noma'lum amal: ${name}` };
  }
}

/** Read-only helper tool plus every propose_* tool. Returns the tool_result text and, for proposals, the new row. */
export async function runActionTool(name: string, raw: Record<string, unknown>, channel: Via): Promise<{ text: string; proposal?: Proposal }> {
  if (name === 'reminders_and_mutes') {
    const [r, m] = await Promise.all([
      db().from('my_reminders').select('id, text, due_at').is('sent_at', null).is('cancelled_at', null).order('due_at').limit(50),
      db().from('my_mutes').select('key, until').gt('until', new Date().toISOString()),
    ]);
    return { text: JSON.stringify({ reminders: (r.data ?? []).map((x) => ({ ...x, due: fmtTime(x.due_at) })), mutes: m.data ?? [] }) };
  }
  const b = await build(name, raw);
  if ('error' in b) return { text: JSON.stringify({ error: b.error }) };
  const { data, error } = await db().from('my_actions').insert({ channel, kind: b.kind, input: b.input, summary: b.summary }).select('id').single();
  if (error || !data) return { text: JSON.stringify({ error: error?.message ?? 'saqlanmadi' }) };
  return {
    text: JSON.stringify({
      proposal_id: data.id,
      summary: b.summary,
      note: `Taklif saqlandi, lekin HALI BAJARILMADI. Foydalanuvchi ✅ bosgandagina bajariladi (${TTL_MIN} daqiqa ichida). "Bajarildi" dema; taklifni qisqa tushuntir va tasdiqlashni so'ra.`,
    }),
    proposal: { id: data.id, summary: b.summary, status: 'pending', result: null },
  };
}

async function execute(kind: string, input: Record<string, unknown>): Promise<string> {
  const now = new Date().toISOString();
  const must = <T extends { error: { message: string } | null }>(r: T) => {
    if (r.error) throw new Error(r.error.message);
    return r;
  };
  switch (kind) {
    case 'sub_create':
      must(await db().from('my_subscriptions').insert({ ...input, updated_at: now }));
      return 'Obuna qo‘shildi';
    case 'sub_update':
      must(await db().from('my_subscriptions').update({ ...(input.patch as object), updated_at: now }).eq('id', String(input.id)));
      return 'Obuna yangilandi';
    case 'reminder_add':
      must(await db().from('my_reminders').insert({ text: input.text, due_at: input.due_at }));
      return 'Eslatma qo‘yildi';
    case 'reminder_cancel':
      must(await db().from('my_reminders').update({ cancelled_at: now }).eq('id', String(input.id)).is('sent_at', null));
      return 'Eslatma bekor qilindi';
    case 'mute':
      must(await db().from('my_mutes').upsert({ key: input.key, until: input.until }));
      return 'Signal vaqtincha o‘chirildi';
    case 'unmute':
      must(await db().from('my_mutes').delete().eq('key', String(input.key)));
      return 'Signal qayta yoqildi';
    case 'usd_rate':
      must(await db().from('my_settings').update({ usd_rate: input.rate, usd_rate_source: 'manual', updated_at: now }).eq('id', 1));
      return 'Kurs yangilandi';
    default:
      throw new Error(`Noma'lum amal turi: ${kind}`);
  }
}

/** The owner's ✅/❌. Claims the row atomically (pending + not expired), so a double click runs it once. */
export async function decide(id: string, yes: boolean, via: Via): Promise<Proposal | { error: string }> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: 'Noto‘g‘ri id' };
  const fresh = new Date(Date.now() - TTL_MIN * 60_000).toISOString();
  const { data: row } = await db()
    .from('my_actions')
    .update({ status: yes ? 'done' : 'rejected', decided_at: new Date().toISOString(), decided_via: via })
    .eq('id', id).eq('status', 'pending').gte('created_at', fresh)
    .select('id, kind, input, summary').maybeSingle();

  if (!row) {
    const { data: old } = await db().from('my_actions').select('id, summary, status, result, created_at').eq('id', id).maybeSingle();
    if (!old) return { error: 'Taklif topilmadi' };
    if (old.status === 'pending') {
      await db().from('my_actions').update({ status: 'expired' }).eq('id', id).eq('status', 'pending');
      return { id, summary: old.summary, status: 'expired', result: `${TTL_MIN} daqiqadan o‘tdi, qaytadan so‘rang` };
    }
    return { id, summary: old.summary, status: old.status, result: old.result };
  }

  let status = yes ? 'done' : 'rejected';
  let result = yes ? '' : 'Bekor qilindi';
  if (yes) {
    try {
      result = await execute(row.kind, row.input as Record<string, unknown>);
    } catch (e) {
      status = 'failed';
      result = `Xato: ${e instanceof Error ? e.message : 'noma’lum'}`;
    }
  }
  await db().from('my_actions').update({ status, result }).eq('id', id);
  await db().from('my_audit').insert({ action: `f4:${row.kind}:${status}`, ip: via === 'tg' ? 'telegram' : 'web', details: { id, summary: row.summary } });
  if (status === 'done') {
    try { revalidatePath('/my', 'layout'); } catch { /* outside a request scope */ }
  }
  return { id, summary: row.summary, status, result };
}

export async function proposalsForChats(chatIds: number[]): Promise<Map<number, Proposal[]>> {
  const out = new Map<number, Proposal[]>();
  if (!chatIds.length) return out;
  const { data } = await db().from('my_actions').select('id, summary, status, result, chat_id, created_at').in('chat_id', chatIds).order('created_at');
  const stale = Date.now() - TTL_MIN * 60_000;
  for (const r of data ?? []) {
    const status = r.status === 'pending' && Date.parse(r.created_at) < stale ? 'expired' : r.status;
    const list = out.get(r.chat_id) ?? [];
    list.push({ id: r.id, summary: r.summary, status, result: r.result });
    out.set(r.chat_id, list);
  }
  return out;
}

export async function linkProposals(ids: string[], chatId: number) {
  if (ids.length) await db().from('my_actions').update({ chat_id: chatId }).in('id', ids);
}

export const STATUS_LABEL: Record<string, string> = {
  pending: 'Tasdiq kutilmoqda', done: 'Bajarildi', rejected: 'Bekor qilindi', expired: 'Muddati o‘tdi', failed: 'Xato',
};

/** Reminders due now (called from the 15-minute alert tick). */
export async function dueReminders() {
  const { data } = await db().from('my_reminders').select('id, text, due_at')
    .is('sent_at', null).is('cancelled_at', null).lte('due_at', new Date().toISOString()).order('due_at').limit(20);
  return data ?? [];
}

export async function markRemindersSent(ids: string[]) {
  if (ids.length) await db().from('my_reminders').update({ sent_at: new Date().toISOString() }).in('id', ids);
}

export async function activeMutes(): Promise<Set<string>> {
  const { data } = await db().from('my_mutes').select('key').gt('until', new Date().toISOString());
  return new Set((data ?? []).map((r) => r.key));
}
