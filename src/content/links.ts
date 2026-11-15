// Havolalar va kichik yordamchilar. Client komponentlar shu fayldan oladi
// (site.ts uchala til matnini tortib keladi, brauzerga yuklamaslik uchun ajratilgan).

export const TG_USER = 'ferudin_ahmedov';
export const TG = `https://t.me/${TG_USER}`;
export const IG = 'https://instagram.com/ferudinahmedov';
export const tgLink = (text: string) => `${TG}?text=${encodeURIComponent(text)}`;
export const fill = (tpl: string, x: string) => tpl.replace('{x}', x);

export const href = (locale: string, path: string) =>
  locale === 'uz' ? path : `/${locale}${path === '/' ? '' : path}`;
