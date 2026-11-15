'use client';

import { usePathname, useRouter } from 'next/navigation';

const LANGS = ['uz', 'ru', 'en'];

export default function LangSwitch({ locale, label }: { locale: string; label: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const go = (code: string) => {
    const seg = pathname.split('/');
    if (LANGS.includes(seg[1])) seg.splice(1, 1);
    const rest = seg.join('/') || '/';
    // Tanlov eslab qolinadi, aks holda brauzer tili bo'yicha qayta yo'naltiradi
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; samesite=lax`;
    router.push(code === 'uz' ? rest : `/${code}${rest === '/' ? '' : rest}`);
  };

  return (
    <select className="lang" aria-label={label} value={locale} onChange={e => go(e.target.value)}>
      {LANGS.map(l => (
        <option key={l} value={l}>{l.toUpperCase()}</option>
      ))}
    </select>
  );
}
