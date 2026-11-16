import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '@/lib/supabase';
import { getAiblok, getHongsam } from './aiblok-hongsam';
import { sendTelegram } from './alerts';
import { usdOf } from './claude-cost';
import { getDentaflow, getSeedbee, getSettings, getSkyplus, getSubs, monthlySom } from './data';
import { buildSignals } from './signals';

/**
 * Hub F3: the owner's own Claude, read-only. One brain for the web chat (/my/chat) and Telegram (@Ferudinbot).
 *  - Sonnet 5.5 by default; a message starting with "chuqur:" goes to Opus 5.5.
 *  - Tools only READ hub data (the same loaders the pages use). Writes come in F4 (propose -> confirm).
 *  - History is stored as plain text turns (my_chat); thinking blocks never leave a single request,
 *    so switching Sonnet <-> Opus between turns is safe.
 *  - Monthly budget (HUB_CHAT_BUDGET_USD, default $20): when spent, the chat stops and the owner gets one Telegram note.
 */

export type Channel = 'web' | 'tg';
export const MODELS = { fast: 'claude-sonnet-5-5', deep: 'claude-opus-5-5' } as const;
const BUDGET_USD = Number(process.env.HUB_CHAT_BUDGET_USD) || 20;
const HISTORY = 20;
const MAX_STEPS = 8;

const SYSTEM = `Sen Ferudinning shaxsiy yordamchisisan, uning my.ferudin.uz boshqaruv markazi ichida ishlaysan.
Ferudin bir nechta loyihani yuritadi:
- DentaFlow: stomatologiya klinikalari uchun CRM (SaaS, obuna bilan).
- SeedBee: kosmetika do'koni + CRM (amakisining biznesi, tizimni Ferudin qurgan).
- SkyPlus: o'quv markaz (IELTS, TOPIK) + CRM.
- AI Blok: Telegram kanal, bot va community Mini App.
- Hongsam: qizil jenshen savdosi (hongsam.uz + Telegram bot). Hongsam summasi = savatdagi narx, to'lov tasdig'i emas.
Hubda yana obunalar (servislar to'lovi) va API xarajatlari bor.

Qoidalar:
- Faqat o'zbek tilida (lotin), qisqa va aniq javob ber. Avval javob, keyin kerak bo'lsa 2-3 qator izoh.
- Raqamlarni faqat asboblardan ol. Taxmin qilma, to'qima. Ma'lumot yo'q yoki o'qilmagan bo'lsa, shuni ochiq ayt.
- Pul: so'mda, minglar orasida bo'sh joy bilan (masalan 1 250 000 so'm). Dollar xarajatlarni $ bilan.
- Sen faqat o'qiysan: hech narsani o'zgartira, yubora yoki o'chira olmaysan. So'rashsa, buni qayerda qilish mumkinligini ayt (CRM, admin panel) va bu imkoniyat keyingi bosqichda (F4) qo'shilishini eslat.
- Vaqt Toshkent bo'yicha. Har bir xabar boshida [Hozir: ...] belgisi bor, "bugun", "bu oy" shunga qarab.
- Format: oddiy matn, **qalin**, "- " ro'yxat. Jadval va sarlavha (#) ishlatma: javob Telegramda ham ko'rinadi.
- Maslahat so'ralsa, raqamlarga tayanib aniq qadam taklif qil; noaniq bo'lsa, qaysi raqam yetishmayotganini ayt.`;

const PROJECT_KEYS = ['dentaflow', 'seedbee', 'skyplus', 'aiblok', 'hongsam'] as const;
type ProjectKey = (typeof PROJECT_KEYS)[number];

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'hub_overview',
    description: "Umumiy holat: shu oy loyihalar bo'yicha tushum (so'm), API xarajati, obunalarning oylik jami va diqqat talab qiladigan signallar. Umumiy savollarda birinchi shuni chaqir.",
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'project_stats',
    description: "Bitta loyihaning to'liq statistikasi (hubdagi loyiha sahifasi bilan bir xil ma'lumot): tushum, buyurtmalar, mijozlar, oylar kesimi, xarajatlar va h.k.",
    input_schema: {
      type: 'object',
      properties: { project: { type: 'string', enum: [...PROJECT_KEYS], description: 'Loyiha kaliti' } },
      required: ['project'],
    },
  },
  {
    name: 'subscriptions',
    description: "Barcha obunalar (servis to'lovlari): narx, valyuta, davr, loyiha, keyingi to'lov sanasi, oylik so'mdagi qiymati.",
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'hongsam_events',
    description: "Hongsam'ning oxirgi hodisalari ro'yxati (buyurtma, qo'llanma, /start, AI qidiruv) vaqti bilan. Kunlar kesimida yoki alohida buyurtmalar kerak bo'lsa ishlat. Ism/telefon saqlanmaydi.",
    input_schema: {
      type: 'object',
      properties: { days: { type: 'integer', minimum: 1, maximum: 70, description: "Necha kunlik (1-70), standart 7" } },
    },
  },
];

const clip = (v: unknown) => {
  const s = JSON.stringify(v);
  return s.length > 40_000 ? `${s.slice(0, 40_000)}… (qisqartirildi)` : s;
};
const unwrap = (r: { ok: true; data: unknown } | { ok: false; reason: string }) => (r.ok ? r.data : { error: r.reason });

async function runTool(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'hub_overview': {
      const [subs, { usdRate }, df, sb, sp, ab, hs, chatUsd] = await Promise.all([
        getSubs(), getSettings(), getDentaflow(), getSeedbee(), getSkyplus(), getAiblok(), getHongsam(), monthChatUsd(),
      ]);
      const active = subs.filter((s) => s.active);
      return clip({
        revenueMonthSom: {
          dentaflow: df.ok ? df.data.revenue.month : 'o‘qilmadi',
          seedbee: sb.ok ? sb.data.revenue.month : 'o‘qilmadi',
          skyplus: sp.ok ? sp.data.money.month.inUzs : 'o‘qilmadi',
          hongsam: hs.ok ? hs.data.orders.sumMonth : 'o‘qilmadi',
        },
        apiCostMonthSom: {
          dentaflow: df.ok ? df.data.costs.total.month : null,
          seedbeeAi: sb.ok && sb.data.ai ? Math.round(sb.data.ai.usd.month * usdRate) : null,
          hongsamSearch: hs.ok ? Math.round(hs.data.search.usdMonth * usdRate) : null,
          hubChat: Math.round(chatUsd * usdRate),
        },
        usdRate,
        subscriptions: {
          active: active.length,
          monthlySomPriced: Math.round(active.reduce((s, x) => s + (monthlySom(x, usdRate) ?? 0), 0)),
          withoutPrice: active.filter((s) => s.amount === null).length,
        },
        signals: buildSignals({ subs, df, sb, sp, ab, hs }).map(({ tone, title, text }) => ({ tone, title, text })),
      });
    }
    case 'project_stats': {
      const p = String(input.project) as ProjectKey;
      if (!PROJECT_KEYS.includes(p)) return clip({ error: `Noma'lum loyiha: ${p}` });
      const load = { dentaflow: getDentaflow, seedbee: getSeedbee, skyplus: getSkyplus, aiblok: getAiblok, hongsam: getHongsam }[p];
      return clip(unwrap(await load()));
    }
    case 'subscriptions': {
      const [subs, { usdRate }] = await Promise.all([getSubs(), getSettings()]);
      return clip(subs.map((s) => ({ ...s, monthlySom: monthlySom(s, usdRate) })));
    }
    case 'hongsam_events': {
      const days = Math.min(70, Math.max(1, Math.round(Number(input.days) || 7)));
      const { data, error } = await createServiceClient()
        .from('my_events').select('kind, amount, meta, at')
        .eq('project', 'hongsam').gte('at', new Date(Date.now() - days * 86_400_000).toISOString())
        .order('at', { ascending: false }).limit(300);
      return clip(error ? { error: error.message } : data);
    }
    default:
      return clip({ error: `Noma'lum asbob: ${name}` });
  }
}

/** First day of the current month in Tashkent, as ISO. */
function monthStartIso() {
  const t = new Date(Date.now() + 5 * 3_600_000);
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), 1) - 5 * 3_600_000).toISOString();
}

export async function monthChatUsd(): Promise<number> {
  const { data } = await createServiceClient().from('my_chat').select('usd').eq('role', 'assistant').gte('at', monthStartIso());
  return (data ?? []).reduce((s, r) => s + (Number(r.usd) || 0), 0);
}

export type ChatRow = { role: 'user' | 'assistant'; text: string; model: string | null; at: string };

/** Turns after the last /yangi (reset), oldest first. */
export async function history(channel: Channel, limit = HISTORY): Promise<ChatRow[]> {
  const { data } = await createServiceClient()
    .from('my_chat').select('role, text, model, at').eq('channel', channel)
    .order('id', { ascending: false }).limit(limit + 1);
  const rows: ChatRow[] = [];
  for (const r of data ?? []) {
    if (r.role === 'reset') break;
    rows.push(r as ChatRow);
  }
  return rows.slice(0, limit).reverse();
}

export async function resetChat(channel: Channel) {
  await createServiceClient().from('my_chat').insert({ channel, role: 'reset', text: '' });
}

async function budgetNote(spent: number) {
  const key = `_budget:${monthStartIso().slice(0, 7)}`;
  const db = createServiceClient();
  const { data } = await db.from('my_alert_state').select('key').eq('key', key).maybeSingle();
  if (data) return;
  await db.from('my_alert_state').insert({ key, tone: 'warn', title: 'chat budget reached', sent: true });
  await sendTelegram(`🟠 <b>Hub chat oylik byudjeti tugadi</b>\nSarflandi: $${spent.toFixed(2)} / $${BUDGET_USD}. Chat keyingi oy boshigacha to‘xtadi (chegarani <code>HUB_CHAT_BUDGET_USD</code> bilan o‘zgartirish mumkin).`);
}

const nowLabel = () =>
  new Intl.DateTimeFormat('uz-UZ', { timeZone: 'Asia/Tashkent', dateStyle: 'full', timeStyle: 'short' }).format(new Date());

export type Answer = { ok: boolean; text: string; model?: string; usd?: number };

export async function ask(channel: Channel, raw: string): Promise<Answer> {
  const text = raw.trim().slice(0, 4000);
  if (!text) return { ok: false, text: 'Savol bo‘sh.' };
  if (!process.env.ANTHROPIC_API_KEY) return { ok: false, text: 'ANTHROPIC_API_KEY qo‘shilmagan, chat hali ishlamaydi.' };

  const spent = await monthChatUsd();
  if (spent >= BUDGET_USD) {
    await budgetNote(spent);
    return { ok: false, text: `Bu oy chat byudjeti tugadi ($${spent.toFixed(2)} / $${BUDGET_USD}). Keyingi oy boshida yana ishlaydi.` };
  }

  const deep = /^chuqur\s*:/i.test(text);
  const model = deep ? MODELS.deep : MODELS.fast;
  const question = deep ? text.replace(/^chuqur\s*:\s*/i, '') : text;

  const past = await history(channel);
  const messages: Anthropic.MessageParam[] = [];
  for (const r of past) {
    const last = messages[messages.length - 1];
    if (last && last.role === r.role) last.content = `${last.content as string}\n\n${r.text}`;
    else if (messages.length || r.role === 'user') messages.push({ role: r.role, content: r.text });
  }
  if (messages[messages.length - 1]?.role === 'user') messages.pop(); // unanswered turn: drop, the new one replaces it
  messages.push({ role: 'user', content: `[Hozir: ${nowLabel()}, Toshkent]\n${question}` });

  const client = new Anthropic();
  const usage = { input: 0, output: 0, cache_read: 0, cache_write: 0 };
  let final: Anthropic.Message | null = null;
  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const res = await client.messages.create({
        model,
        max_tokens: 8000,
        system: SYSTEM,
        tools: TOOLS,
        messages,
        cache_control: { type: 'ephemeral' },
      });
      usage.input += res.usage.input_tokens;
      usage.output += res.usage.output_tokens;
      usage.cache_read += res.usage.cache_read_input_tokens ?? 0;
      usage.cache_write += res.usage.cache_creation_input_tokens ?? 0;
      final = res;

      if (res.stop_reason === 'pause_turn') {
        messages.push({ role: 'assistant', content: res.content });
        continue;
      }
      const calls = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
      if (res.stop_reason !== 'tool_use' || !calls.length) break;

      messages.push({ role: 'assistant', content: res.content });
      const results: Anthropic.ToolResultBlockParam[] = await Promise.all(
        calls.map(async (c) => {
          try {
            return { type: 'tool_result' as const, tool_use_id: c.id, content: await runTool(c.name, (c.input ?? {}) as Record<string, unknown>) };
          } catch (e) {
            return { type: 'tool_result' as const, tool_use_id: c.id, is_error: true, content: e instanceof Error ? e.message : 'xato' };
          }
        }),
      );
      messages.push({ role: 'user', content: results });
    }
  } catch (e) {
    const msg = e instanceof Anthropic.APIError ? `Claude xatosi (${e.status ?? '—'})` : 'Claude bilan bog‘lanib bo‘lmadi';
    return { ok: false, text: `${msg}. Birozdan keyin qayta urinib ko‘ring.` };
  }

  let answer = (final?.content ?? []).filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('\n').trim();
  if (final?.stop_reason === 'refusal') answer = answer || 'Bu savolga javob bera olmayman.';
  if (final?.stop_reason === 'tool_use') answer = answer || 'Savol juda ko‘p qadam talab qildi. Aniqroq qilib so‘rab ko‘ring.';
  if (!answer) answer = 'Javob bo‘sh qaytdi. Qayta so‘rab ko‘ring.';

  const usd = usdOf({ model, ...usage });
  await createServiceClient().from('my_chat').insert([
    { channel, role: 'user', text },
    { channel, role: 'assistant', text: answer, model, usd },
  ]);
  return { ok: true, text: answer, model, usd };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Claude's light markdown -> safe HTML (Telegram HTML and the web chat). Input is escaped first. */
export function toHtml(md: string): string {
  return esc(md)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/^#{1,6}\s+(.+)$/gm, '<b>$1</b>')
    .replace(/^\s*[-*]\s+/gm, '• ');
}
