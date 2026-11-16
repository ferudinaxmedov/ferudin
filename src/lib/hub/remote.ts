/**
 * Write APIs of the other projects (hub F5). Each project exposes POST /api/hub/action with its own Bearer
 * token; the hub calls the write actions only from decide() after the owner's ✅ (F4).
 *  - SkyPlus  crm.skyplus.uz      leads_list, lead_update            (SKYPLUS_HUB_TOKEN)
 *  - SeedBee  seedbee.uz          orders_list, order_status          (SEEDBEE_HUB_TOKEN)
 *  - AI Blok  community.ferudin.uz question_answer (bot delivers it)  (AIBLOK_HUB_TOKEN)
 */

type Target = { name: string; env: string; url: string };
const T = {
  skyplus: { name: 'SkyPlus', env: 'SKYPLUS_HUB_TOKEN', url: process.env.SKYPLUS_ACTION_URL ?? 'https://crm.skyplus.uz/api/hub/action' },
  seedbee: { name: 'SeedBee', env: 'SEEDBEE_HUB_TOKEN', url: process.env.SEEDBEE_ACTION_URL ?? 'https://seedbee.uz/api/hub/action' },
  aiblok: { name: 'AI Blok', env: 'AIBLOK_HUB_TOKEN', url: process.env.AIBLOK_ACTION_URL ?? 'https://community.ferudin.uz/api/hub/action' },
} satisfies Record<string, Target>;

export type Remote = keyof typeof T;

export async function callRemote<R = Record<string, unknown>>(target: Remote, body: Record<string, unknown>): Promise<R & { ok: boolean; error?: string }> {
  const t = T[target];
  const token = process.env[t.env];
  if (!token) return { ok: false, error: `${t.env} sozlanmagan` } as R & { ok: boolean; error?: string };
  try {
    const res = await fetch(t.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });
    const json = (await res.json().catch(() => ({}))) as R & { ok?: boolean; error?: string };
    if (!res.ok || json.ok === false) return { ...json, ok: false, error: json.error ?? `${t.name} ${res.status}` };
    return { ...json, ok: true };
  } catch (e) {
    return { ok: false, error: `${t.name}: ${e instanceof Error ? e.message : 'ulanmadi'}` } as R & { ok: boolean; error?: string };
  }
}

export const LEAD_STATUS: Record<string, string> = {
  new: 'Yangi', contacted: 'Bog‘lanildi', consult: 'Konsultatsiya', trial: 'Sinov darsida', converted: 'Mijozga aylandi', lost: 'Rad etdi',
};
export const ORDER_STATUS: Record<string, string> = {
  new: 'Yangi', confirmed: 'Tasdiqlangan', paid: 'Yig‘ishga tayyor', shipped: 'Yuborilgan', delivered: 'Yetkazilgan', cancelled: 'Bekor qilingan',
};

export type Lead = { id: string; label?: string; status: string; status_label?: string; interest_label?: string; source_label?: string; created_at: string };
export type Order = { id: string; number: number | string; status: string; payment_status?: string; total?: number; items?: number; created_at: string };
