'use client';

import { useTranslations } from 'next-intl';
import { useRef, useCallback } from 'react';

const tools = [
  { name: 'Figma', color: '#F24E1E' },
  { name: 'React', color: '#61DAFB' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'Tailwind', color: '#06B6D4' },
  { name: 'Framer', color: '#0055FF' },
  { name: 'Supabase', color: '#3ECF8E' },
  { name: 'Vercel', color: '#ffffff' },
];

export default function About() {
  const t = useTranslations('about');
  const toolsLabel = useTranslations()('tools');

  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!sceneRef.current || !cardRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const rect = sceneRef.current!.getBoundingClientRect();
      // Normalize -1 to 1
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      // Card: subtle tilt + translate
      const rotY = nx * 6;
      const rotX = -ny * 6;
      const tx = nx * 10;
      const ty = ny * 6;
      cardRef.current!.style.transform =
        `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate(${tx}px, ${ty}px)`;

      // Glow follows cursor
      if (glowRef.current) {
        glowRef.current.style.left = `${((nx + 1) / 2) * 100}%`;
        glowRef.current.style.top = `${((ny + 1) / 2) * 100}%`;
        glowRef.current.style.opacity = '1';
      }

      // Shadow moves opposite
      if (shadowRef.current) {
        shadowRef.current.style.transform = `translate(${-tx * 0.6}px, ${Math.abs(ty) * 0.4 + 16}px) scaleX(${1 - Math.abs(nx) * 0.15})`;
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1)';
    cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translate(0px, 0px)';
    if (glowRef.current) glowRef.current.style.opacity = '0';
    if (shadowRef.current) shadowRef.current.style.transform = 'translate(0, 16px) scaleX(0.85)';
    setTimeout(() => {
      if (cardRef.current) cardRef.current.style.transition = '';
    }, 700);
  }, []);

  return (
    <section id="about" className="py-28 px-6 relative overflow-hidden">
      {/* Bg glow */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full animate-glow"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — Floating Visual */}
          <div className="reveal relative order-2 lg:order-1 flex items-center justify-center py-8">

            {/* Mouse-aware scene container */}
            <div
              ref={sceneRef}
              className="relative w-full flex items-center justify-center"
              style={{ minHeight: '480px' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Ambient background glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl animate-glow"
                style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(34,197,94,0.07) 0%, transparent 65%)' }}
                aria-hidden
              />

              {/* Decorative ring behind card */}
              <div
                className="pointer-events-none absolute rounded-full border animate-float"
                style={{
                  width: '320px', height: '320px',
                  borderColor: 'rgba(34,197,94,0.08)',
                  animationDelay: '0.5s',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute rounded-full border"
                style={{
                  width: '420px', height: '420px',
                  borderColor: 'rgba(34,197,94,0.04)',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                aria-hidden
              />

              {/* Floating dot decorations */}
              {[
                { size: 6, color: 'var(--g)', top: '12%', left: '10%', delay: '0s' },
                { size: 4, color: 'rgba(34,197,94,0.5)', top: '20%', right: '12%', delay: '1s' },
                { size: 5, color: 'rgba(168,85,247,0.6)', bottom: '18%', left: '8%', delay: '1.5s' },
                { size: 3, color: 'rgba(34,197,94,0.4)', bottom: '25%', right: '15%', delay: '0.7s' },
              ].map((d, i) => (
                <div
                  key={i}
                  className="pointer-events-none absolute rounded-full animate-float"
                  style={{
                    width: d.size, height: d.size,
                    background: d.color,
                    top: d.top, left: (d as { left?: string }).left,
                    right: (d as { right?: string }).right,
                    bottom: d.bottom,
                    animationDelay: d.delay,
                    boxShadow: `0 0 ${d.size * 3}px ${d.color}`,
                  }}
                  aria-hidden
                />
              ))}

              {/* Ground shadow */}
              <div
                ref={shadowRef}
                className="pointer-events-none absolute bottom-4 left-1/2 rounded-full"
                style={{
                  width: '200px', height: '20px',
                  background: 'radial-gradient(ellipse, rgba(34,197,94,0.18) 0%, transparent 70%)',
                  transform: 'translate(-50%, 0) translateX(-50%) scaleX(0.85)',
                  filter: 'blur(8px)',
                  transition: 'transform 0.4s ease',
                  marginLeft: '100px',
                }}
                aria-hidden
              />

              {/* THE CARD */}
              <div
                ref={cardRef}
                className="relative animate-float"
                style={{
                  width: '240px',
                  willChange: 'transform',
                  transformStyle: 'preserve-3d',
                  animationDuration: '5s',
                }}
              >
                {/* Card */}
                <div
                  className="relative rounded-3xl border overflow-hidden"
                  style={{
                    borderColor: 'rgba(34,197,94,0.2)',
                    background: 'var(--surface)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.08)',
                  }}
                >
                  {/* Cursor-following inner glow */}
                  <div
                    ref={glowRef}
                    className="pointer-events-none absolute w-32 h-32 rounded-full -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)',
                      opacity: 0,
                      filter: 'blur(16px)',
                      zIndex: 10,
                    }}
                    aria-hidden
                  />

                  {/* Photo */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                    <img
                      src="/ferudin-about.jpg"
                      alt="Ferudin Axmedov"
                      className="w-full h-full object-cover object-center"
                      draggable={false}
                    />
                    {/* Bottom gradient */}
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(8,8,8,0.9) 100%)' }}
                      aria-hidden
                    />
                    {/* Green top line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ background: 'linear-gradient(90deg, var(--g), rgba(34,197,94,0.3))' }}
                      aria-hidden
                    />

                    {/* Name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-black text-base leading-none">Ferudin</p>
                      <p className="text-[var(--g)] text-[11px] font-semibold tracking-widest uppercase mt-1">
                        Web Designer & Dev
                      </p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    {[
                      { n: '1', l: t('years') },
                      { n: '3+', l: t('projects') },
                      { n: '5+', l: t('clients') },
                    ].map((s, i) => (
                      <div
                        key={s.l}
                        className={`flex flex-col items-center py-3 ${i < 2 ? 'border-r' : ''}`}
                        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                      >
                        <span className="font-black text-sm" style={{ color: 'var(--g)' }}>{s.n}</span>
                        <span className="text-[var(--text-sub)] text-[9px] mt-0.5 text-center leading-tight">{s.l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating badge — top right */}
                <div
                  className="absolute -top-3 -right-4 px-3 py-1.5 rounded-full border text-[10px] font-bold animate-float"
                  style={{
                    borderColor: 'rgba(168,85,247,0.35)',
                    background: 'rgba(168,85,247,0.12)',
                    color: '#a855f7',
                    animationDelay: '1s',
                    animationDuration: '4.5s',
                    boxShadow: '0 4px 20px rgba(168,85,247,0.2)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {t('badge_vibe')}
                </div>

                {/* Floating badge — bottom left */}
                <div
                  className="absolute -bottom-3 -left-5 px-3 py-1.5 rounded-full border text-[10px] font-bold animate-float"
                  style={{
                    borderColor: 'rgba(34,197,94,0.3)',
                    background: 'rgba(8,8,8,0.85)',
                    color: 'var(--g)',
                    animationDelay: '2s',
                    animationDuration: '6s',
                    boxShadow: '0 4px 20px rgba(34,197,94,0.15)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {t('badge_location')}
                </div>
              </div>

            </div>
          </div>

          {/* Right — Text */}
          <div className="order-1 lg:order-2">
            <p className="reveal text-[var(--g)] text-xs font-semibold tracking-[0.14em] uppercase mb-4">
              {t('label')}
            </p>
            <h2
              className="reveal d1 font-black text-white leading-tight mb-6"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              {t('heading')}
            </h2>

            <div className="reveal d2 w-10 h-[2px] mb-6" style={{ background: 'var(--g)' }} aria-hidden />

            <p className="reveal d2 text-[var(--text-sub)] text-base leading-relaxed mb-8">
              {t('bio')}
            </p>

            {/* Skills */}
            <div className="reveal d3">
              <p className="text-[var(--text-sub)] text-xs tracking-widest uppercase mb-4">
                {toolsLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {tools.map(tool => (
                  <span
                    key={tool.name}
                    className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 cursor-default"
                    style={{
                      borderColor: 'var(--b)',
                      background: 'var(--surface)',
                      color: tool.color,
                    }}
                  >
                    {tool.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
