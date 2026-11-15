// Ochiq sayt kontenti: umumiy (tilga bog'liq bo'lmagan) qism shu yerda,
// matnlar uz.ts / ru.ts / en.ts da. getC(locale) ikkalasini birlashtiradi.
import { uz, type Texts } from './uz';
import { ru } from './ru';
import { en } from './en';

import { TG, IG } from './links';

export { TG, IG, TG_USER, tgLink, fill, href } from './links';

export type Pair = { benefit: string; feature: string };
export type Chat = { who: string; text: string; file?: string }[];

/* ---------- Umumiy ma'lumot ---------- */

const STEPS = [
  { id: 'bot', price: '$150', from: true, bar: 22 },
  { id: 'katalog', price: '$200', from: true, bar: 30 },
  { id: 'miniapp', price: '$350', from: true, bar: 42 },
  { id: 'sotuv', price: '$700', from: true, bar: 60 },
  { id: 'tizim', price: '$1 800', from: true, bar: 82 },
  { id: 'ilova', price: '+$1 000', from: false, bar: 100 },
] as const;

const PROJECTS = [
  { slug: 'seedbee', own: false, url: 'https://seedbee.uz', urlLabel: 'seedbee.uz', shot: 'seedbee', shot2: 'firstcosmetics', tone: '#3B63F6', crm: ['seedbee-customers', 'seedbee-products'], crmUrl: 'crm.firstcosmetics.uz',
    stack: ['Next.js', 'Supabase', 'Vercel', 'Click', 'Payme', 'Eskiz SMS', 'Telegram Bot API', 'Claude AI', 'Expo / React Native'] },
  { slug: 'dentaflow', own: true, url: 'https://dentaflow.uz', urlLabel: 'dentaflow.uz', shot: 'dentaflow', tone: '#C8472B', crm: ['dentaflow-dashboard', 'dentaflow-patient'], crmUrl: 'dentaflow.uz/admin',
    stack: ['Next.js', 'Supabase', 'Vercel', 'Click', 'Payme', 'Eskiz SMS', 'Telegram Bot API', 'Gemini Live', 'Claude AI'] },
  { slug: 'skyplus', own: false, url: 'https://skyplus.uz', urlLabel: 'skyplus.uz', shot: 'skyplus', tone: '#2F6BFF', crm: ['skyplus-mocks'], crmUrl: 'crm.skyplus.uz',
    stack: ['Next.js', 'Supabase', 'Vercel', 'next-intl'] },
  { slug: 'hongsam', own: true, url: 'https://hongsam.uz', urlLabel: 'hongsam.uz', shot: 'hongsam', tone: '#A3261F',
    stack: ['Next.js', 'Vercel', 'Telegram Bot API', 'Mini App'] },
  { slug: 'ai-blok', own: true, url: 'https://community.ferudin.uz', urlLabel: 'community.ferudin.uz', shot: 'aiblok', tone: '#D9723F',
    stack: ['Next.js', 'Supabase', 'Telegram Bot API', 'Mini App'] },
  { slug: 'airbnb-bot', own: false, tone: '#1F8A70', stack: ['Telegram Bot API', 'Node.js', 'PDF', 'Railway'] },
] as const;

export const slugs = PROJECTS.map(p => p.slug);
type Slug = (typeof PROJECTS)[number]['slug'];
type StepId = (typeof STEPS)[number]['id'];

const CHANNELS = [
  { key: 'tg', handle: '@ferudin_ahmedov', url: TG },
  { key: 'ig', handle: '@ferudinahmedov', url: IG },
  { key: 'ch', handle: '@FERUDIN_AIBLOK', url: 'https://t.me/FERUDIN_AIBLOK' },
  { key: 'cm', handle: 'community.ferudin.uz', url: 'https://community.ferudin.uz' },
] as const;

const STATS = [6, 3, 3300, 106];
const STAT_SUFFIX = ['', '', '+', ''];

/* ---------- Birlashtirish ---------- */

export type Step = { id: StepId; price: string; from: boolean; bar: number; name: string; result: string; time: string; note?: string; pairs: Pair[] };

export type Project = {
  slug: Slug; own: boolean; url?: string; urlLabel?: string; shot?: string; shot2?: string; crm?: readonly string[]; crmUrl?: string; tone: string; stack: readonly string[];
  name: string; kind: string; role: string; result: string; summary: string; problem: string; shot2Label?: string;
  wins: { n: string; l: string }[]; pairs: Pair[]; similar: { label: string; price: string }[]; chat?: Chat; screens?: string[];
};

const TEXTS: Record<string, Texts> = { uz, ru, en };

export function getC(locale: string) {
  const t = TEXTS[locale] ?? uz;
  const steps: Step[] = STEPS.map(s => ({ ...s, ...t.steps[s.id] }));
  const projects: Project[] = PROJECTS.map(p => ({ ...p, ...t.projects[p.slug] }));
  const channels = CHANNELS.map((c, i) => ({ ...c, ...t.channels[i] }));
  const stats = STATS.map((n, i) => ({ n, suffix: STAT_SUFFIX[i], label: t.stats[i] }));
  return { ...t, steps, projects, channels, stats, locale: TEXTS[locale] ? locale : 'uz' };
}

export type C = ReturnType<typeof getC>;
export type { Texts };
