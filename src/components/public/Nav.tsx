'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const langs = [
  { code: 'uz', label: "O'z" },
  { code: 'ru', label: 'Ru' },
  { code: 'en', label: 'En' },
];

export default function Nav() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const switchLocale = (code: string) => {
    const segments = pathname.split('/');
    const locales = ['uz', 'ru', 'en'];
    if (locales.includes(segments[1])) {
      segments[1] = code;
    } else {
      segments.splice(1, 0, code);
    }
    router.push(segments.join('/') || '/');
  };

  const links = [
    { href: '#services', label: t('services') },
    { href: '#work', label: t('work') },
    { href: '#about', label: t('about') },
    { href: '#contact', label: t('contact') },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#080808]/90 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="font-black text-xl tracking-tight">
            Ferudin<span className="text-[var(--g)]">.</span>
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8 list-none">
            {links.map(l => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm text-[var(--text-sub)] hover:text-white transition-colors duration-200"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Lang switcher */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/8 rounded-full p-1">
              {langs.map(l => (
                <button
                  key={l.code}
                  onClick={() => switchLocale(l.code)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    locale === l.code
                      ? 'bg-[var(--g)] text-black'
                      : 'text-[var(--text-sub)] hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Contact CTA */}
            <a
              href="#contact"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-[var(--g)] text-black text-sm font-bold rounded-full hover:bg-[#4ade80] transition-colors duration-200"
            >
              {t('contact')}
            </a>

            {/* Hamburger */}
            <button
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px]"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <span
                className={`block w-5 h-[1.5px] bg-white transition-all duration-300 ${open ? 'translate-y-[6.5px] rotate-45' : ''}`}
              />
              <span
                className={`block w-5 h-[1.5px] bg-white transition-all duration-300 ${open ? 'opacity-0' : ''}`}
              />
              <span
                className={`block w-5 h-[1.5px] bg-white transition-all duration-300 ${open ? '-translate-y-[6.5px] -rotate-45' : ''}`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-[#080808]/98 backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-400 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ul className="flex flex-col items-center gap-6 list-none">
          {links.map(l => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-4xl font-bold text-white/80 hover:text-[var(--g)] transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
