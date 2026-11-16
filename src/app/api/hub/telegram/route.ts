import { timingSafeEqual } from 'node:crypto';
import { after } from 'next/server';
import { decide, STATUS_LABEL, type Proposal } from '@/lib/hub/actions';
import { ask, resetChat, toHtml } from '@/lib/hub/assistant';
import { transcribe, type Voice } from '@/lib/hub/voice';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// @Ferudinbot webhook (hub F3/F4). Telegram signs every call with X-Telegram-Bot-Api-Secret-Token = HUB_TG_WEBHOOK_SECRET.
// Only the owner's chat (HUB_ALERT_CHAT_ID) is answered; everyone else gets one polite line.
// F4: each proposal Claude makes arrives as its own message with ✅/❌ buttons (callback data "a:<uuid>:y|n").

type Update = {
  message?: { chat: { id: number; type: string }; text?: string; message_id: number; voice?: Voice; audio?: Voice };
  callback_query?: { id: string; from: { id: number }; data?: string; message?: { chat: { id: number }; message_id: number } };
};

function signed(req: Request) {
  const secret = process.env.HUB_TG_WEBHOOK_SECRET;
  const got = req.headers.get('x-telegram-bot-api-secret-token') ?? '';
  if (!secret || secret.length < 32) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function tg(method: string, body: Record<string, unknown>) {
  const token = process.env.HUB_ALERT_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => undefined);
}

/** Telegram caps a message at 4096 chars: split on paragraph boundaries. */
function chunks(html: string, size = 3800) {
  const out: string[] = [];
  let cur = '';
  for (const part of html.split('\n\n')) {
    if (cur && cur.length + part.length + 2 > size) { out.push(cur); cur = ''; }
    cur = cur ? `${cur}\n\n${part}` : part;
    while (cur.length > size) { out.push(cur.slice(0, size)); cur = cur.slice(size); }
  }
  if (cur) out.push(cur);
  return out;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ICON: Record<string, string> = { pending: '📝', done: '✅', rejected: '❌', expired: '⌛', failed: '⚠️' };
const card = (p: Proposal) =>
  `${ICON[p.status] ?? '📝'} <b>${p.status === 'pending' ? 'Taklif' : STATUS_LABEL[p.status] ?? p.status}</b>\n${esc(p.summary)}${p.result && p.status !== 'done' ? `\n<i>${esc(p.result)}</i>` : ''}`;

const HELP = [
  '<b>Salom! Men hubdagi Claude yordamchingizman.</b>',
  'Loyihalaringiz bo‘yicha istalgan savolni yozing: tushum, buyurtmalar, lidlar, xarajatlar, signallar. Raqamlarni jonli hub ma’lumotidan olaman.',
  'Amal ham taklif qila olaman: obuna, eslatma, signalni o‘chirish, oylik maqsad, SkyPlus lid statusi, SeedBee buyurtma statusi, AI Blok savoliga javob. Har biri ✅ bosganingizdan keyingina bajariladi.',
  '• Chuqur tahlil (Opus): savolni <code>chuqur:</code> bilan boshlang',
  '• Ovozli xabar ham yuborishingiz mumkin: matnga aylantirib javob beraman',
  '• /yangi: yangi suhbat (oldingisini unutadi)',
  'Ogohlantirishlar, eslatmalar va 09:00 hisobot ham shu yerga keladi.',
].join('\n\n');

export async function POST(req: Request) {
  if (!signed(req)) return new Response('forbidden', { status: 401 });
  const upd = (await req.json().catch(() => ({}))) as Update;
  const owner = process.env.HUB_ALERT_CHAT_ID;

  const cb = upd.callback_query;
  if (cb) {
    const m = /^a:([0-9a-f-]{36}):(y|n)$/i.exec(cb.data ?? '');
    if (String(cb.from.id) !== owner || !m || !cb.message) {
      after(() => tg('answerCallbackQuery', { callback_query_id: cb.id }));
      return Response.json({ ok: true });
    }
    const msg = cb.message;
    after(async () => {
      const r = await decide(m[1], m[2] === 'y', 'tg');
      if ('error' in r) {
        await tg('answerCallbackQuery', { callback_query_id: cb.id, text: r.error });
        return;
      }
      await tg('answerCallbackQuery', { callback_query_id: cb.id, text: r.result ?? STATUS_LABEL[r.status] });
      await tg('editMessageText', { chat_id: msg.chat.id, message_id: msg.message_id, text: card(r), parse_mode: 'HTML' });
    });
    return Response.json({ ok: true });
  }

  const m = upd.message;
  if (!m) return Response.json({ ok: true });

  const chat = m.chat.id;
  if (String(chat) !== owner) {
    if (m.chat.type === 'private') after(() => tg('sendMessage', { chat_id: chat, text: 'Bu shaxsiy bot.' }));
    return Response.json({ ok: true });
  }

  const text = (m.text ?? '').trim();
  const send = (html: string, extra: Record<string, unknown> = {}) =>
    tg('sendMessage', { chat_id: chat, text: html, parse_mode: 'HTML', link_preview_options: { is_disabled: true }, ...extra });
  const answer = async (question: string) => {
    await tg('sendChatAction', { chat_id: chat, action: 'typing' });
    const typing = setInterval(() => void tg('sendChatAction', { chat_id: chat, action: 'typing' }), 4500);
    try {
      const a = await ask('tg', question);
      for (const part of chunks(toHtml(a.text))) await send(part);
      for (const p of a.proposals ?? []) {
        await send(card(p), {
          reply_markup: { inline_keyboard: [[{ text: '✅ Tasdiqlash', callback_data: `a:${p.id}:y` }, { text: '❌ Bekor', callback_data: `a:${p.id}:n` }]] },
        });
      }
    } finally {
      clearInterval(typing);
    }
  };

  const voice = m.voice ?? m.audio;
  if (!text && !voice) {
    after(() => send('Matn yoki ovozli xabar yuboring.'));
  } else if (!text && voice) {
    after(async () => {
      await tg('sendChatAction', { chat_id: chat, action: 'typing' });
      const t = await transcribe(voice);
      if ('error' in t) {
        await send(esc(t.error));
        return;
      }
      await send(`🎙 <i>${esc(t.text)}</i>`);
      await answer(t.text);
    });
  } else if (/^\/(start|help|yordam)\b/i.test(text)) {
    after(() => send(HELP));
  } else if (/^\/(yangi|new|reset)\b/i.test(text)) {
    after(async () => {
      await resetChat('tg');
      await send('Yangi suhbat boshlandi. Savolingizni yozing.');
    });
  } else {
    after(() => answer(text));
  }
  return Response.json({ ok: true });
}
