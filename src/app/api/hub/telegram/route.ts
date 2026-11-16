import { timingSafeEqual } from 'node:crypto';
import { after } from 'next/server';
import { ask, resetChat, toHtml } from '@/lib/hub/assistant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// @Ferudinbot webhook (hub F3). Telegram signs every call with X-Telegram-Bot-Api-Secret-Token = HUB_TG_WEBHOOK_SECRET.
// Only the owner's chat (HUB_ALERT_CHAT_ID) is answered; everyone else gets one polite line.

type Update = { message?: { chat: { id: number; type: string }; text?: string; message_id: number } };

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

const HELP = [
  '<b>Salom! Men hubdagi Claude yordamchingizman.</b>',
  'Loyihalaringiz bo‘yicha istalgan savolni yozing: tushum, buyurtmalar, lidlar, xarajatlar, signallar. Raqamlarni jonli hub ma’lumotidan olaman, hech narsani o‘zgartirmayman.',
  '• Chuqur tahlil (Opus): savolni <code>chuqur:</code> bilan boshlang',
  '• /yangi: yangi suhbat (oldingisini unutadi)',
  'Ogohlantirishlar va 09:00 hisobot ham shu yerga keladi.',
].join('\n\n');

export async function POST(req: Request) {
  if (!signed(req)) return new Response('forbidden', { status: 401 });
  const upd = (await req.json().catch(() => ({}))) as Update;
  const m = upd.message;
  if (!m) return Response.json({ ok: true });

  const chat = m.chat.id;
  if (String(chat) !== process.env.HUB_ALERT_CHAT_ID) {
    if (m.chat.type === 'private') after(() => tg('sendMessage', { chat_id: chat, text: 'Bu shaxsiy bot.' }));
    return Response.json({ ok: true });
  }

  const text = (m.text ?? '').trim();
  const send = (html: string) => tg('sendMessage', { chat_id: chat, text: html, parse_mode: 'HTML', link_preview_options: { is_disabled: true } });

  if (!text) {
    after(() => send('Hozircha faqat matnli savollarni tushunaman.'));
  } else if (/^\/(start|help|yordam)\b/i.test(text)) {
    after(() => send(HELP));
  } else if (/^\/(yangi|new|reset)\b/i.test(text)) {
    after(async () => {
      await resetChat('tg');
      await send('Yangi suhbat boshlandi. Savolingizni yozing.');
    });
  } else {
    after(async () => {
      await tg('sendChatAction', { chat_id: chat, action: 'typing' });
      const typing = setInterval(() => void tg('sendChatAction', { chat_id: chat, action: 'typing' }), 4500);
      try {
        const a = await ask('tg', text);
        for (const part of chunks(toHtml(a.text))) await send(part);
      } finally {
        clearInterval(typing);
      }
    });
  }
  return Response.json({ ok: true });
}
