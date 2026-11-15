'use client';

import { useEffect } from 'react';

/* Havolalar sahifasi: kartalar ustida barmoq/kursor ortidan yuradigan nur va yengil og'ish. */
export default function LinkFx() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = [...document.querySelectorAll<HTMLElement>('.lk-t')];
    const offs: (() => void)[] = [];
    cards.forEach(el => {
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${x * 100}%`);
        el.style.setProperty('--my', `${y * 100}%`);
        if (!reduce && e.pointerType === 'mouse') {
          el.style.setProperty('--rx', `${(0.5 - y) * 6}deg`);
          el.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
        }
      };
      const leave = () => {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerdown', move);
      el.addEventListener('pointerleave', leave);
      offs.push(() => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerdown', move);
        el.removeEventListener('pointerleave', leave);
      });
    });
    document.documentElement.classList.add('lk-ready');
    return () => offs.forEach(f => f());
  }, []);
  return null;
}
