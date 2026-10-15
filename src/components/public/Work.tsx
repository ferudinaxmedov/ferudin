'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

type Project = {
  key: 'dentaflow' | 'seedbee' | 'skyplus' | 'mk';
  title: string;
  url: string;
  host: string;
  accent: string;
  span: string;
  tags: string[];
  visual: ReactNode;
};

const Tile = ({ src, alt }: { src: string; alt: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} width={72} height={72} className="w-[72px] h-[72px] rounded-[22px] bg-white p-2 object-contain shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)]" />
);

function DentaVisual() {
  const bars = [38, 62, 48, 80, 58, 92, 70];
  return (
    <div className="absolute inset-x-5 md:inset-x-8 top-1/2 -translate-y-1/2 grid grid-cols-5 gap-3 md:gap-4 items-start" aria-hidden>
      <div className="glass col-span-3 rounded-2xl p-4 flex flex-col gap-2.5">
        <div className="flex gap-1.5 mb-1">
          {[0, 1, 2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-white/25" />)}
        </div>
        {['09:00', '10:30', '12:00', '14:15', '15:40', '17:00'].map((time, i) => (
          <div key={time} className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-3.5">
            <span className="text-[11px] font-bold text-sky-300 tabular-nums">{time}</span>
            <span className="h-2 rounded-full bg-white/20" style={{ width: `${64 - i * 9}%` }} />
            <span className="ml-auto w-2 h-2 rounded-full" style={{ background: ['#4ade80', '#38bdf8', '#fbbf24', '#4ade80', '#38bdf8', '#4ade80'][i] }} />
          </div>
        ))}
      </div>
      <div className="col-span-2 flex flex-col gap-3">
        <div className="glass rounded-2xl p-3.5">
          <div className="grid grid-cols-8 gap-1.5">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className="aspect-square rounded-[6px]" style={{ background: [3, 7, 12].includes(i) ? '#38bdf8' : [5, 10].includes(i) ? '#fbbf24' : 'rgba(255,255,255,0.14)' }} />
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-3.5 flex items-end gap-1.5 h-[150px]">
          {bars.map((h, i) => (
            <span key={i} className="flex-1 rounded-md" style={{ height: `${h}%`, background: 'linear-gradient(to top, #0ea5e9, #7dd3fc)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SeedbeeVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-between px-6" aria-hidden>
      <Tile src="/work/seedbee-mark.png" alt="Seedbee" />
      <div className="flex items-end gap-2.5">
        {[
          ['#a5b4fc', 56], ['#7c9cff', 72], ['#c4b5fd', 48],
        ].map(([c, h], i) => (
          <span
            key={i}
            className="w-9 rounded-t-[14px] rounded-b-lg border border-white/30 shadow-[inset_0_2px_0_rgba(255,255,255,0.5)] floaty"
            style={{ height: h as number, background: `linear-gradient(160deg, ${c}, ${c}66)`, animationDelay: `${-i * 1.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function SkyVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-between px-6" aria-hidden>
      <Tile src="/work/skyplus.webp" alt="SkyPlus" />
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: i < 4 ? '#34d399' : 'rgba(255,255,255,0.25)', boxShadow: i < 4 ? '0 0 10px #34d399' : 'none' }} />
            {i < 6 && <span className="w-3 h-px bg-white/25" />}
          </span>
        ))}
      </div>
    </div>
  );
}

function MkVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-6" aria-hidden>
      {[
        ['#f472b6', '0s'], ['#60a5fa', '-1.4s'], ['#f9a8d4', '-2.8s'], ['#93c5fd', '-4.2s'],
      ].map(([c, d], i) => (
        <span
          key={i}
          className="floaty block w-12 h-14 rounded-[50%_50%_48%_48%/58%_58%_42%_42%] border border-white/40 shadow-[inset_-6px_-8px_14px_rgba(0,0,0,0.18),inset_5px_6px_10px_rgba(255,255,255,0.55)]"
          style={{ background: `radial-gradient(circle at 32% 28%, #fff9, ${c} 55%)`, animationDelay: d, marginTop: i % 2 ? 18 : 0 }}
        />
      ))}
    </div>
  );
}

export default function Work() {
  const t = useTranslations('work');

  const projects: Project[] = [
    { key: 'dentaflow', title: 'DentaFlow', url: 'https://dentaflow.uz', host: 'dentaflow.uz', accent: '#38bdf8', span: 'md:col-span-4 md:row-span-2', tags: ['Next.js', 'Supabase', 'AI', 'Click · Payme'], visual: <DentaVisual /> },
    { key: 'seedbee', title: 'Seedbee UZB', url: 'https://seedbee.uz', host: 'seedbee.uz', accent: '#7c9cff', span: 'md:col-span-2', tags: ['E-commerce', 'UZ · RU'], visual: <SeedbeeVisual /> },
    { key: 'skyplus', title: 'SkyPlus', url: 'https://skyplus.uz', host: 'skyplus.uz', accent: '#34d399', span: 'md:col-span-2', tags: ['UZ · RU · EN', 'Next.js'], visual: <SkyVisual /> },
    { key: 'mk', title: 'Men kimman?', url: 'https://men-kimman.uz', host: 'men-kimman.uz', accent: '#f472b6', span: 'md:col-span-6', tags: ['Interactive', 'UZ · RU'], visual: <MkVisual /> },
  ];

  return (
    <section id="work" className="relative py-24 md:py-32 px-5 scroll-mt-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 max-w-xl">
          <p className="reveal eyebrow mb-3">{t('label')}</p>
          <h2 className="reveal d1 font-extrabold tracking-tight leading-[1.05] mb-4" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>
            {t('heading')}
          </h2>
          <p className="reveal d2 text-[var(--ink-2)] text-lg">{t('sub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {projects.map((p, i) => {
            const wide = p.key === 'mk';
            const big = p.key === 'dentaflow';
            return (
              <div key={p.key} className={`reveal d${(i % 4) + 1} ${p.span} flex`}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${p.title}: ${t('visit')}`}
                  className={`group glass spot sheen tilt flex-1 rounded-[28px] flex ${wide ? 'flex-col md:flex-row' : 'flex-col'}`}
                  style={{ ['--spot' as string]: `${p.accent}38`, ['--spot-strong' as string]: p.accent }}
                >
                  {/* Visual */}
                  <div
                    className={`relative overflow-hidden ${big ? 'min-h-[300px] md:min-h-0 md:flex-1' : wide ? 'h-40 md:h-auto md:w-[42%]' : 'h-40'} rounded-t-[27px] ${wide ? 'md:rounded-tr-none md:rounded-l-[27px]' : ''}`}
                    style={{ background: `radial-gradient(90% 100% at 20% 0%, ${p.accent}40, transparent 70%), linear-gradient(160deg, ${p.accent}1f, transparent)` }}
                  >
                    {p.visual}
                  </div>

                  {/* Body */}
                  <div className={`relative z-[1] p-6 md:p-7 flex flex-col ${wide ? 'md:flex-1 justify-center' : ''}`}>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="inline-flex items-center gap-2 chip" style={{ color: p.accent, borderColor: `${p.accent}45`, background: `${p.accent}14` }}>
                        <span className="live-dot" />
                        {p.host}
                      </span>
                      <span className="w-10 h-10 rounded-full glass flex items-center justify-center transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110" aria-hidden>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 11L11 3M5 3h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                    </div>
                    <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-1.5" style={{ color: p.accent }}>
                      {t(`${p.key}_cat`)}
                    </p>
                    <h3 className={`font-extrabold tracking-tight mb-2 ${big ? 'text-3xl' : 'text-2xl'}`}>{p.title}</h3>
                    <p className="text-[15px] leading-relaxed text-[var(--ink-2)] mb-4">{t(`${p.key}_desc`)}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-auto">
                      <span className="chip font-bold text-white/90">{t(`${p.key}_role`)}</span>
                      {p.tags.map(tag => (
                        <span key={tag} className="chip">{tag}</span>
                      ))}
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
