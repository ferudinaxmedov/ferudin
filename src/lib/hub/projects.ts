/** Everything the owner runs. `live` = its stats are wired into the hub; the rest come in phase 2. */
export type ProjectKey = 'dentaflow' | 'seedbee' | 'skyplus' | 'aiblok' | 'hongsam' | 'ferudin' | 'kontent' | 'umumiy';

export type Project = {
  key: ProjectKey;
  name: string;
  what: string;
  color: string;
  url?: string;
  admin?: string;
  live: boolean;
};

export const PROJECTS: Project[] = [
  { key: 'dentaflow', name: 'DentaFlow', what: 'Stomatologiya klinikalari uchun CRM', color: '#3ECFB2', url: 'https://dentaflow.uz', admin: 'https://console.dentaflow.uz', live: true },
  { key: 'seedbee', name: 'SeedBee', what: "Kosmetika do'koni + CRM", color: '#F5B83D', url: 'https://seedbee.uz', admin: 'https://crm.firstcosmetics.uz', live: true },
  { key: 'skyplus', name: 'SkyPlus', what: "O'quv markaz + CRM", color: '#8B9CFF', url: 'https://skyplus.uz', admin: 'https://crm.skyplus.uz', live: true },
  { key: 'aiblok', name: 'AI Blok', what: 'Kanal, bot, community', color: '#C084FC', url: 'https://community.ferudin.uz', admin: 'https://community.ferudin.uz/admin', live: true },
  { key: 'hongsam', name: 'Hongsam', what: 'Qizil jenshen savdosi', color: '#F87171', url: 'https://hongsam.uz', live: true },
  { key: 'ferudin', name: 'ferudin.uz', what: 'Shaxsiy sayt', color: '#4C8DFF', url: 'https://ferudin.uz', live: false },
];

/** Cost buckets that are not a product. */
export const EXTRA_BUCKETS: { key: ProjectKey; name: string; color: string }[] = [
  { key: 'kontent', name: 'Kontent', color: '#F472B6' },
  { key: 'umumiy', name: 'Umumiy', color: '#94A3B8' },
];

export const BUCKETS = [...PROJECTS.map(({ key, name, color }) => ({ key, name, color })), ...EXTRA_BUCKETS];
export const bucketOf = (k: string) => BUCKETS.find((b) => b.key === k) ?? EXTRA_BUCKETS[1];
