'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

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
  const [active, setActive] = useState('');
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const links = [
    { id: 'work', label: t('work') },
    { id: 'services', label: t('services') },
    { id: 'about', label: t('about') },
    { id: 'contact', label: t('contact') },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll-spy
  useEffect(() => {
    const ids = ['services', 'work', 'about', 'contact'];
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const onTop = () => {
      if (window.scrollY < 200) setActive('');
    };
    window.addEventListener('scroll', onTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onTop);
    };
  }, []);

  const measure = useCallback(() => {
    const ul = listRef.current;
    if (!ul) return;
    const a = ul.querySelector<HTMLElement>(`[data-id="${active}"]`);
    setPill(a ? { x: a.offsetLeft, w: a.offsetWidth } : null);
  }, [active]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, locale]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const switchLocale = (code: string) => {
    const segments = pathname.split('/');
    if (['uz', 'ru', 'en'].includes(segments[1])) segments[1] = code;
    else segments.splice(1, 0, code);
    router.push(segments.join('/') || '/');
  };

  return (
    <>
      <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-4 pointer-events-none">
        <nav
          aria-label="Main"
          className={`pointer-events-auto mx-auto flex items-center justify-between gap-2 rounded-full pl-5 pr-2 h-14 max-w-[880px] transition-all duration-500 glass ${
            scrolled ? 'glass-strong shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]' : ''
          }`}
        >
          <a href="#" className="font-extrabold text-lg tracking-tight shrink-0" aria-label="Ferudin">
            Ferudin<span className="text-[var(--a1)]">.</span>
          </a>

          {/* Desktop links with liquid indicator */}
          <ul ref={listRef} className="relative hidden md:flex items-center list-none">
            <span
              aria-hidden
              className="absolute top-0 bottom-0 rounded-full bg-white/12 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-500"
              style={{
                transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)',
                left: pill?.x ?? 0,
                width: pill?.w ?? 0,
                opacity: pill ? 1 : 0,
              }}
            />
            {links.map(l => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  data-id={l.id}
                  className={`relative block px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                    active === l.id ? 'text-white' : 'text-[var(--ink-2)] hover:text-white'
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-full p-1 bg-black/25 border border-white/10" role="group" aria-label="Language">
              {langs.map(l => (
                <button
                  key={l.code}
                  onClick={() => switchLocale(l.code)}
                  aria-pressed={locale === l.code}
                  className={`px-3 h-8 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                    locale === l.code
                      ? 'bg-white/90 text-[#0b1020] shadow-[0_2px_10px_rgba(255,255,255,0.25)]'
                      : 'text-[var(--ink-2)] hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button
              className="md:hidden w-11 h-11 rounded-full flex flex-col items-center justify-center gap-[5px] cursor-pointer"
              onClick={() => setOpen(!open)}
              aria-label={t('menu')}
              aria-expanded={open}
            >
              <span className={`block w-5 h-[1.5px] bg-white transition-all duration-300 ${open ? 'translate-y-[6.5px] rotate-45' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-white transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-[1.5px] bg-white transition-all duration-300 ${open ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile sheet */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center backdrop-blur-2xl bg-[#05060c]/70 transition-all duration-500 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        <ul className="flex flex-col items-center gap-3 list-none">
          {links.map((l, i) => (
            <li
              key={l.id}
              style={{ transitionDelay: open ? `${80 + i * 60}ms` : '0ms' }}
              className={`transition-all duration-500 ${open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            >
              <a
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className="glass block rounded-full px-10 py-3.5 text-2xl font-bold"
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
