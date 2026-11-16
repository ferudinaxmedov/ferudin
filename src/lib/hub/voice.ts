/**
 * Telegram voice questions (hub F5): the owner's voice note -> Gemini speech-to-text -> the same ask() as text.
 * Needs GEMINI_API_KEY in this project's env (model: HUB_STT_MODEL, default gemini-2.5-flash).
 * The audio is not stored; only the transcript goes into my_chat as the user's message.
 */

const MAX_SECONDS = 180;
const MAX_BYTES = 5 * 1024 * 1024;

export type Voice = { file_id: string; duration?: number; file_size?: number; mime_type?: string };

export async function transcribe(v: Voice): Promise<{ text: string } | { error: string }> {
  const key = process.env.GEMINI_API_KEY;
  const bot = process.env.HUB_ALERT_BOT_TOKEN;
  if (!key) return { error: 'Ovozli savol uchun GEMINI_API_KEY qo‘shilmagan. Hozircha matn bilan yozing.' };
  if (!bot) return { error: 'Bot tokeni yo‘q' };
  if ((v.duration ?? 0) > MAX_SECONDS) return { error: 'Ovozli xabar 3 daqiqadan uzun. Qisqaroq yuboring.' };
  if ((v.file_size ?? 0) > MAX_BYTES) return { error: 'Fayl juda katta (5 MB dan ko‘p).' };

  try {
    const meta = (await (await fetch(`https://api.telegram.org/bot${bot}/getFile?file_id=${encodeURIComponent(v.file_id)}`, { signal: AbortSignal.timeout(10_000) })).json()) as { ok: boolean; result?: { file_path?: string } };
    if (!meta.ok || !meta.result?.file_path) return { error: 'Ovozli faylni olib bo‘lmadi' };
    const audio = await fetch(`https://api.telegram.org/file/bot${bot}/${meta.result.file_path}`, { signal: AbortSignal.timeout(20_000) });
    const buf = Buffer.from(await audio.arrayBuffer());
    if (buf.length > MAX_BYTES) return { error: 'Fayl juda katta (5 MB dan ko‘p).' };

    const model = process.env.HUB_STT_MODEL || 'gemini-2.5-flash';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Bu ovozli xabarni so'zma-so'z matnga aylantir. Til odatda o'zbekcha (lotin yozuvida yoz), rus yoki ingliz so'zlari bo'lsa o'z holicha qoldir. Faqat matnni qaytar, izoh qo'shma. Nutq bo'lmasa bo'sh qaytar." },
            { inline_data: { mime_type: v.mime_type || 'audio/ogg', data: buf.toString('base64') } },
          ],
        }],
        generationConfig: { temperature: 0 },
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) return { error: `Ovozni matnga aylantirib bo‘lmadi (Gemini ${res.status})` };
    const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = (json.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('').trim();
    return text ? { text } : { error: 'Ovozda gap eshitilmadi.' };
  } catch (e) {
    return { error: `Ovozni o‘qib bo‘lmadi: ${e instanceof Error ? e.message : 'xato'}` };
  }
}
