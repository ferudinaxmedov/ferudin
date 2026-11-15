'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/* Sahifa effektlari: skrollda chiqish, sanagichlar, parallaks, progress chizig'i, kursor nuri.
   Markup server tomonda qoladi; bu faqat klasslar va CSS o'zgaruvchilarini boshqaradi. */
export default function Fx() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.classList.add('js');

    // 1) Skrollda chiqish, qo'shnilar orasida ketma-ketlik
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('rv')) : [];
          el.style.setProperty('--d', `${Math.min(sibs.indexOf(el), 6) * 90}ms`);
          el.classList.add('in');
          io.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    document.querySelectorAll('.rv').forEach(el => io.observe(el));

    // 2) Sanagichlar
    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        cio.unobserve(el);
        const to = Number(el.dataset.count);
        const fmt = (v: number) => v.toLocaleString('ru-RU');
        if (reduce) { el.textContent = fmt(to); return; }
        const t0 = performance.now();
        const dur = 1400;
        const tick = (t: number) => {
          const k = Math.min((t - t0) / dur, 1);
          el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 4))));
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

    // 3) Progress chizig'i + parallaks
    const bar = document.getElementById('scrollbar');
    const pars = [...document.querySelectorAll<HTMLElement>('[data-par]')];
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = root.scrollHeight - window.innerHeight;
        if (bar) bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        root.classList.toggle('scrolled', window.scrollY > 12);
        if (reduce) return;
        const vh = window.innerHeight;
        pars.forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -100 || r.top > vh + 100) return;
          const mid = (r.top + r.height / 2 - vh / 2) / vh;
          el.style.setProperty('--py', `${(mid * Number(el.dataset.par)).toFixed(1)}px`);
        });
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // 4) Kursor nuri (qora blok va kartalar)
    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('.glow');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    if (!reduce) window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      io.disconnect();
      cio.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onMove);
    };
  }, [pathname]);

  return <div id="scrollbar" aria-hidden />;
}
