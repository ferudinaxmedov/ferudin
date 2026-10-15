'use client';

import { useEffect, useRef } from 'react';

/**
 * Global glass effects, one listener for the whole page:
 *  - .spot  : cursor spotlight + gradient border (sets --mx / --my)
 *  - .tilt  : subtle 3D tilt (sets --rx / --ry)
 *  - liquid lens that trails the pointer and swells over links
 *  - scroll reveal (.reveal -> .visible)
 */
export default function Effects() {
  const lens = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;

    // Reveal on scroll
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    if (!fine) return () => io.disconnect();

    let tx = -100, ty = -100, x = -100, y = -100, raf = 0;
    let active: HTMLElement | null = null;
    const el = lens.current;

    const resetTilt = (n: HTMLElement | null) => {
      if (!n) return;
      n.style.setProperty('--rx', '0deg');
      n.style.setProperty('--ry', '0deg');
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (el) {
        el.classList.add('on');
        const t = e.target as Element | null;
        el.classList.toggle('link', !!t?.closest?.('a,button'));
      }
      const spot = (e.target as Element | null)?.closest?.('.spot') as HTMLElement | null;
      if (spot !== active) {
        resetTilt(active);
        active = spot;
      }
      if (spot) {
        const r = spot.getBoundingClientRect();
        const px = e.clientX - r.left;
        const py = e.clientY - r.top;
        spot.style.setProperty('--mx', `${px}px`);
        spot.style.setProperty('--my', `${py}px`);
        if (!reduced && spot.classList.contains('tilt')) {
          spot.style.setProperty('--ry', `${(px / r.width - 0.5) * 7}deg`);
          spot.style.setProperty('--rx', `${-(py / r.height - 0.5) * 7}deg`);
        }
      }
    };
    const onLeave = () => {
      resetTilt(active);
      active = null;
      el?.classList.remove('on');
    };

    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    if (!reduced) raf = requestAnimationFrame(loop);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <>
      {/* Gooey filter for the hero blobs */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g" />
            <feComposite in="SourceGraphic" in2="g" operator="atop" />
          </filter>
        </defs>
      </svg>
      <div ref={lens} className="liquid-cursor" aria-hidden />
    </>
  );
}
