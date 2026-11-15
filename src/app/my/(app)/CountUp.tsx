'use client';

import { useEffect, useRef, useState } from 'react';

/** Animated number (easeOutCubic, 900 ms). Renders the final value at once for reduced motion. */
export function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [shown, setShown] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const dur = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900;
    const start = performance.now();
    const tick = (t: number) => {
      const p = dur ? Math.min(1, (t - start) / dur) : 1;
      setShown(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  const text = shown.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).replace(/ /g, ' ');
  return <span className="mono">{text}</span>;
}
