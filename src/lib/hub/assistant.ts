import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '@/lib/supabase';
import { ACTION_TOOLS, isActionTool, linkProposals, proposalsForChats, runActionTool, STATUS_LABEL, type Proposal } from './actions';
import { getAiblok, getHongsam } from './aiblok-hongsam';
import { sendTelegram } from './alerts';
import { usdOf } from './claude-cost';
import { getDentaflow, getSeedbee, getSettings, getSkyplus, getSubs, monthlySom } from './data';
import { buildSignals } from './signals';
import { getPnl } from './pnl';
import { getMonitor, monitorSignals, sslDaysLeft } from './monitor';
import { monthCosts } from './costs';

/**
 * Hub F3/F4: the owner's own Claude. One brain for the web chat (/my/chat) and Telegram (@Ferudinbot).
 *  - Sonnet 5.5 by default; a message starting with "chuqur:" goes to Opus 5.5.
 *  - Read tools use the same loaders as the pages. Writes (F4, hub data only) are propose_* tools:
 *    they store a pending my_actions row; the owner's ✅ runs it (see actions.ts).
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
- Yozish faqat taklif orqali (propose_* asboblari): hub ichida obunalar, eslatmalar, signalni vaqtincha o'chirish, dollar kursi, oylik maqsad; tashqarida SkyPlus lid statusi/izohi, SeedBee buyurtma statusi, AI Blok savoliga javob. Taklif saqlanadi, Ferudin ✅ bosgandagina bajariladi: hech qachon "bajarildi" dema, "tasdiqlang" de. So'ralmagan amalni taklif qilma.
- Boshqa yozishlar (DentaFlow, Hongsam, boshqa maydonlar) imkoning yo'q: buni qayerda qilish mumkinligini ayt (o'sha CRM yoki admin panel).
- Foyda/zarar, maqsad va bashorat savollarida profit_and_loss ni chaqir. Saytlar ishlayaptimi, SSL savollarida site_health ni.
- Eslatma vaqti Toshkent bo'yicha, ISO formatda +05:00 bilan. "Ertaga ertalab" kabi noaniq vaqtda 09:00 ni ol va javobda vaqtni aniq ayt.
- Tarixdagi [Taklif: ...] qatorlari avvalgi takliflarning natijasi.
- Vaqt Toshkent bo'yicha. Har bir xabar boshida [Hozir: ...] belgisi bor, "bugun", "bu oy" shunga qarab.
- Format: oddiy matn, **qalin**, "- " ro'yxat. Jadval va sarlavha (#) ishlatma: javob Telegramda ham ko'rinadi.
- Maslahat so'ralsa, raqamlarga tayanib aniq qadam taklif qil; noaniq bo'lsa, qaysi raqam yetishmayotganini ayt.`;

const PROJECT_KEYS = ['dentaflow', 'seedbee', 'skyplus', 'aiblok', 'hongsam'] as const;
type ProjectKey = (typeof PROJECT_KEYS)[number];

const READ_TOOLS: Anthropic.Tool[] = [
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
  {
    name: 'profit_and_loss',
    description: "Shu oy foyda va zarar loyihalar kesimida: tushum, obunalar, API, boshqa chiqim, sof foyda, oylik maqsad va bashorat, o'tgan oy, 6 oylik tushum trendi; Anthropic'ning haqiqiy hisobi (bo'lsa).",
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'site_health',
    description: "Barcha saytlarning holati (har 5 daqiqada tekshiriladi): ochilyaptimi, javob vaqti, SSL necha kunda tugaydi.",
    input_schema: { type: 'object', properties: {} },
  },
];

const TOOLS: Anthropic.Tool[] = [...READ_TOOLS, ...ACTION_TOOLS];

const clip = (v: unknown) => {
  const s = JSON.stringify(v);
  return s.length > 40_000 ? `${s.slice(0, 40_000)}… (qisqartirildi)` : s;
};
const unwrap = (r: { ok: true; data: unknown } | { ok: false; reason: string }) => (r.ok ? r.data : { error: r.reason });

async function runTool(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'hub_overview': {
      const [subs, { usdRate }, df, sb, sp, ab, hs, chatUsd, spUsd] = await Promise.all([
        getSubs(), getSettings(), getDentaflow(), getSeedbee(), getSkyplus(), getAiblok(), getHongsam(), monthChatUsd(),
        import('./pnl').then((m) => m.skyplusClaudeUsd()),
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
          skyplusAi: Math.round(spUsd * usdRate),
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
    case 'profit_and_loss': {
      const [pnl, billed] = await Promise.all([getPnl(), monthCosts()]);
      return clip({ ...pnl, billedByProviderUsd: billed });
    }
    case 'site_health': {
      const rows = await getMonitor();
      return clip({
        sites: rows.map((r) => ({ site: r.site, ok: r.ok, status: r.status, seconds: r.ms === null ? null : r.ms / 1000, sslDaysLeft: sslDaysLeft(r.ssl_expires), error: r.error, checked_at: r.checked_at })),
        problems: monitorSignals(rows).map(({ tone, title, text }) => ({ tone, title, text })),
      });
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

export type ChatRow = { id: number; role: 'user' | 'assistant'; text: string; model: string | null; at: string; proposals: Proposal[] };

/** Turns after the last /yangi (reset), oldest first, with the proposals each answer made. */
export async function history(channel: Channel, limit = HISTORY): Promise<ChatRow[]> {
  const { data } = await createServiceClient()
    .from('my_chat').select('id, role, text, model, at').eq('channel', channel)
    .order('id', { ascending: false }).limit(limit + 1);
  const rows: ChatRow[] = [];
  for (const r of data ?? []) {
    if (r.role === 'reset') break;
    rows.push({ ...(r as Omit<ChatRow, 'proposals'>), proposals: [] });
  }
  const out = rows.slice(0, limit).reverse();
  const props = await proposalsForChats(out.filter((r) => r.role === 'assistant').map((r) => r.id));
  for (const r of out) r.proposals = props.get(r.id) ?? [];
  return out;
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

export type Answer = { ok: boolean; text: string; model?: string; usd?: number; proposals?: Proposal[] };

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
    const body = r.proposals.length
      ? `${r.text}\n\n${r.proposals.map((p) => `[Taklif: ${p.summary} — ${STATUS_LABEL[p.status] ?? p.status}${p.result ? `: ${p.result}` : ''}]`).join('\n')}`
      : r.text;
    const last = messages[messages.length - 1];
    if (last && last.role === r.role) last.content = `${last.content as string}\n\n${body}`;
    else if (messages.length || r.role === 'user') messages.push({ role: r.role, content: body });
  }
  if (messages[messages.length - 1]?.role === 'user') messages.pop(); // unanswered turn: drop, the new one replaces it
  messages.push({ role: 'user', content: `[Hozir: ${nowLabel()}, Toshkent]\n${question}` });

  const client = new Anthropic();
  const usage = { input: 0, output: 0, cache_read: 0, cache_write: 0 };
  let final: Anthropic.Message | null = null;
  const proposals: Proposal[] = [];
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
            const input = (c.input ?? {}) as Record<string, unknown>;
            if (isActionTool(c.name)) {
              const r = await runActionTool(c.name, input, channel);
              if (r.proposal) proposals.push(r.proposal);
              return { type: 'tool_result' as const, tool_use_id: c.id, content: r.text };
            }
            return { type: 'tool_result' as const, tool_use_id: c.id, content: await runTool(c.name, input) };
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
  const { data: saved } = await createServiceClient().from('my_chat').insert([
    { channel, role: 'user', text },
    { channel, role: 'assistant', text: answer, model, usd },
  ]).select('id, role');
  const aid = saved?.find((r) => r.role === 'assistant')?.id;
  if (aid) await linkProposals(proposals.map((p) => p.id), aid);
  return { ok: true, text: answer, model, usd, proposals };
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

/**
 * Morning digest advice (hub F5): one Sonnet call, no tools, over the numbers the digest already loaded.
 * Counts toward the monthly chat budget (stored as a channel='system' assistant row, hidden from chats).
 */
export async function briefing(facts: unknown): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if ((await monthChatUsd()) >= BUDGET_USD) return null;
  try {
    const model = MODELS.fast;
    const res = await new Anthropic().messages.create({
      model,
      max_tokens: 600,
      system: `Sen Ferudinning boshqaruv markazidagi yordamchisisan. Ertalabki hisobot uchun ma'lumot beriladi.
O'zbek tilida (lotin) 3-4 ta qisqa qator yoz: bugun nimaga e'tibor berish kerak va bitta aniq qadam.
Qoidalar: faqat berilgan raqamlarga tayan, to'qima. Maqsaddan orqada qolayotgan loyiha, ochilmayotgan sayt, yaqin to'lov, javobsiz savol yoki lid bo'lsa shularni birinchi ayt.
Har qator "- " bilan boshlansin. Sarlavha, salomlashish, xulosa yozma. Oddiy matn, markdown belgilarisiz.`,
      messages: [{ role: 'user', content: `[Bugun: ${nowLabel()}]\n${JSON.stringify(facts).slice(0, 30_000)}` }],
    });
    const text = res.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('\n').trim();
    const usd = usdOf({ model, input: res.usage.input_tokens, output: res.usage.output_tokens });
    await createServiceClient().from('my_chat').insert({ channel: 'system', role: 'assistant', text: `[digest] ${text}`, model, usd });
    return text || null;
  } catch {
    return null;
  }
}
