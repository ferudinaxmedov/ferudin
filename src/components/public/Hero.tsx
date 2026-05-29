'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

export default function Hero() {
  const t = useTranslations('hero');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.querySelectorAll<HTMLElement>('[data-delay]').forEach(child => {
      const d = parseInt(child.dataset.delay || '0');
      setTimeout(() => {
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      }, d);
    });
  }, []);

  const anim = (delay: number): React.CSSProperties => ({
    opacity: 0,
    transform: 'translateY(18px)',
    transition: 'opacity .7s ease, transform .7s ease',
  });

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full animate-glow"
        style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.10) 0%, transparent 70%)' }}
        aria-hidden
      />
      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10 w-full" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-0 items-center min-h-[82vh]">

          {/* Left — Text */}
          <div className="flex flex-col items-start justify-center py-20 lg:py-0">

            {/* Badges row */}
            <div
              data-delay="200"
              className="flex items-center gap-3 mb-7"
              style={anim(200)}
            >
              <span
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold tracking-widest uppercase"
                style={{ borderColor: 'var(--g-border)', background: 'var(--g-dim)', color: 'var(--g)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--g)] animate-pulse" />
                {t('badge_exp')}
              </span>
              <span
                className="flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-semibold"
                style={{ borderColor: 'rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.08)', color: '#a855f7' }}
              >
                ⚡ {t('badge_vibe')}
              </span>
            </div>

            {/* Name */}
            <div data-delay="380" style={anim(380)}>
              <p className="text-[var(--text-sub)] text-lg mb-1">{t('greeting')}</p>
              <h1
                className="font-black leading-none tracking-tighter mb-4"
                style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)' }}
              >
                <span className="gradient-text">Ferudin</span>
              </h1>
              <p
                className="font-medium text-white/50 text-sm tracking-[0.1em] uppercase mb-5"
              >
                {t('role')}
              </p>
            </div>

            {/* Tagline */}
            <p
              data-delay="560"
              className="text-xl md:text-2xl font-light text-white/70 mb-4 leading-snug"
              style={anim(560)}
            >
              {t('tagline')}
            </p>

            {/* Sub */}
            <p
              data-delay="700"
              className="text-[var(--text-sub)] text-base leading-relaxed mb-8 max-w-[440px]"
              style={anim(700)}
            >
              {t('sub')}
            </p>

            {/* CTAs */}
            <div data-delay="850" className="flex flex-wrap items-center gap-4 mb-8" style={anim(850)}>
              <a
                href="#work"
                className="flex items-center gap-2 px-6 py-3 bg-[var(--g)] text-black font-bold text-sm rounded-full hover:bg-[#4ade80] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(34,197,94,0.4)]"
              >
                {t('cta_work')}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7h10M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#contact"
                className="flex items-center gap-2 px-6 py-3 border text-white text-sm font-semibold rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--g)] hover:text-[var(--g)]"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              >
                {t('cta_contact')}
              </a>
            </div>

            {/* Social pills */}
            <div data-delay="1000" className="flex items-center gap-3" style={anim(1000)}>
              <a
                href="https://t.me/ferudin_ahmedov"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium text-[var(--text-sub)] hover:text-white hover:border-white/20 transition-all duration-200"
                style={{ borderColor: 'var(--b)', background: 'var(--surface)' }}
              >
                <TelegramIcon />
                @ferudin_ahmedov
              </a>
              <a
                href="https://instagram.com/ferudin.ibnsamad"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium text-[var(--text-sub)] hover:text-white hover:border-white/20 transition-all duration-200"
                style={{ borderColor: 'var(--b)', background: 'var(--surface)' }}
              >
                <InstagramIcon />
                @ferudin.ibnsamad
              </a>
            </div>
          </div>

          {/* Right — Visual card */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div
              className="absolute w-[420px] h-[420px] rounded-full animate-glow"
              style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)' }}
              aria-hidden
            />

            <div
              data-delay="600"
              className="relative z-10 w-[300px] rounded-3xl border overflow-hidden animate-float"
              style={{ borderColor: 'var(--b)', background: 'var(--surface)', ...anim(600) }}
            >
              {/* Card top glow */}
              <div
                className="absolute top-0 left-0 right-0 h-32 opacity-50"
                style={{ background: 'linear-gradient(to bottom, rgba(34,197,94,0.08), transparent)' }}
                aria-hidden
              />

              {/* Profile area */}
              <div className="relative z-10 p-6 flex flex-col items-center text-center">
                <div
                  className="w-24 h-24 rounded-full border-2 overflow-hidden mb-4"
                  style={{ borderColor: 'var(--g-border)' }}
                >
                  <img
                    src="/ferudin-profile.jpg"
                    alt="Ferudin Ahmedov"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <p className="text-white font-bold text-lg leading-none">Ferudin</p>
                <p className="text-[var(--g)] text-[11px] font-semibold tracking-widest uppercase mt-1.5 mb-4">
                  {t('card_surname')}
                </p>

                {/* Service chips */}
                <div className="flex flex-wrap gap-2 justify-center mb-5">
                  {t('card_chips').split(' · ').map(s => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold border"
                      style={{ borderColor: 'var(--b)', background: 'var(--surface2)', color: 'rgba(255,255,255,0.6)' }}
                    >
                      {s}
                    </span>
                  ))}
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-semibold border"
                    style={{ borderColor: 'rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.08)', color: '#a855f7' }}
                  >
                    {t('card_vibe')}
                  </span>
                </div>

                {/* Contact mini */}
                <a
                  href="https://t.me/ferudin_ahmedov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl font-bold text-sm text-black bg-[var(--g)] hover:bg-[#4ade80] transition-colors duration-200"
                >
                  {t('card_connect')}
                </a>
              </div>

              {/* Stats row */}
              <div
                className="flex border-t"
                style={{ borderColor: 'var(--b)' }}
              >
                {[
                  { n: '3+', l: t('stat_projects') },
                  { n: '1', l: t('stat_years') },
                  { n: '100%', l: t('stat_quality') },
                ].map((s, i) => (
                  <div
                    key={s.l}
                    className={`flex-1 flex flex-col items-center py-3.5 ${i < 2 ? 'border-r' : ''}`}
                    style={{ borderColor: 'var(--b)' }}
                  >
                    <span className="text-[var(--g)] font-black text-sm">{s.n}</span>
                    <span className="text-[var(--text-sub)] text-[10px] mt-0.5">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-glow" aria-hidden>
        <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-[var(--text-sub)]">scroll</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-[var(--g)] to-transparent" />
      </div>
    </section>
  );
}

function TelegramIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.94z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
