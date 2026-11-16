/** Claude prices per 1M tokens (USD); cache write = 1.25x input. Unknown model -> Opus price (safe side). */
const PRICES: Record<string, { in: number; out: number; read: number }> = {
  haiku: { in: 0.1, out: 0.5, read: 0.01 },
  sonnet: { in: 2, out: 10, read: 0.1 },
  opus: { in: 4, out: 20, read: 0.2 },
};
const priceOf = (model: string) => PRICES[Object.keys(PRICES).find((k) => model.includes(k)) ?? 'opus'];

/** USD cost of one call from the token meta we store (model, input, output, cache_read, cache_write). */
export function usdOf(meta: Record<string, unknown> | null | undefined): number {
  const p = priceOf(String(meta?.model ?? ''));
  const n = (k: string) => Number(meta?.[k]) || 0;
  return (n('input') * p.in + n('output') * p.out + n('cache_read') * p.read + n('cache_write') * p.in * 1.25) / 1e6;
}
