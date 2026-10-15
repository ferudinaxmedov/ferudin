'use client';

import { useTranslations } from 'next-intl';

const icons = [
  // Design
  <path key="a" d="M12 3l2.4 5.2L20 9l-4 4 1 5.6-5-2.8-5 2.8L8 13 4 9l5.6-.8L12 3z" />,
  // CRM
  <g key="b"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 9h18M8 14h3M8 17h6" /></g>,
  // Code
  <path key="c" d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14" />,
  // UI/UX
  <g key="d"><circle cx="9" cy="9" r="5" /><circle cx="15" cy="15" r="5" /></g>,
];
const accents = ['#6ee7b7', '#60a5fa', '#c4b5fd', '#f9a8d4'];

export default function Services() {
  const t = useTranslations('services');
  const items = [1, 2, 3, 4].map(n => ({ title: t(`s${n}_title`), desc: t(`s${n}_desc`) }));

  return (
    <section id="services" className="relative py-24 md:py-32 px-5 scroll-mt-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 max-w-xl">
          <p className="reveal eyebrow mb-3">{t('label')}</p>
          <h2 className="reveal d1 font-extrabold tracking-tight leading-[1.05] mb-4" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>
            {t('heading')}
          </h2>
          <p className="reveal d2 text-[var(--ink-2)] text-lg">{t('sub')}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((s, i) => (
            <div key={s.title} className={`reveal d${i + 1}`}>
              <div
                className="glass spot tilt rounded-3xl p-6 h-full min-h-[240px] flex flex-col"
                style={{ ['--spot' as string]: `${accents[i]}30`, ['--spot-strong' as string]: accents[i] }}
              >
                <div
                  className="relative z-[1] w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-white/15"
                  style={{ background: `linear-gradient(145deg, ${accents[i]}38, ${accents[i]}10)`, color: accents[i] }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {icons[i]}
                  </svg>
                </div>
                <h3 className="relative z-[1] text-xl font-bold mb-2">{s.title}</h3>
                <p className="relative z-[1] text-[15px] leading-relaxed text-[var(--ink-2)]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
