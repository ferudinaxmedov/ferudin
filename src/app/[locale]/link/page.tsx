import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight, BookOpen, Megaphone, Phone, Send } from 'lucide-react';
import { getC, tgLink, TG, IG } from '@/content/site';
import LangSwitch from '@/components/site/LangSwitch';
import LinkFx from '@/components/site/LinkFx';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const c = getC((await params).locale);
  return { title: { absolute: c.link.title }, description: c.link.tagline };
}

const SITE = 'https://ferudin.uz';
const FAN = ['dentaflow-m', 'hongsam-m', 'skyplus-m'];
const NAMES = ['SeedBee', 'DentaFlow', 'SkyPlus', 'Hongsam', 'AI Blok', 'First Cosmetics', 'Airbnb bot'];

export default async function LinkPage({ params }: { params: Params }) {
  const { locale } = await params;
  const c = getC(locale);
  const base = locale === 'uz' ? SITE : `${SITE}/${locale}`;
  const it = Object.fromEntries(c.link.items.map(x => [x.key, x]));
  const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
  const ladder = c.steps.filter(s => ['bot', 'sotuv', 'tizim'].includes(s.id));
  let n = 0;
  const d = () => ({ ['--i' as string]: n++ });

  return (
    <main className="lk">
      <LinkFx />
      <div className="lk-sky" aria-hidden>
        <i className="b1" /><i className="b2" /><i className="b3" />
      </div>
      <div className="lk-grain" aria-hidden />

      <div className="lk-in">
        <div className="lk-top lk-up" style={d()}>
          <span className="lk-badge"><i aria-hidden />{c.link.badge}</span>
          <LangSwitch locale={locale} label={c.ui.lang} />
        </div>

        <div className="lk-me lk-up" style={d()}>
          <svg className="lk-ring" viewBox="0 0 200 200" aria-hidden>
            <defs><path id="lk-circle" d="M100,100 m-86,0 a86,86 0 1,1 172,0 a86,86 0 1,1 -172,0" /></defs>
            <text><textPath href="#lk-circle" textLength="536">{c.link.ring}</textPath></text>
          </svg>
          <div className="lk-ph">
            <Image src="/ferudin-portrait.webp" alt="Ferudin Ahmedov" fill unoptimized priority />
          </div>
        </div>

        <h1 className="lk-name lk-up" style={d()}>Ferudin <span>Ahmedov</span></h1>
        <p className="lk-tag lk-up" style={d()}>{c.link.tagline}</p>

        <dl className="lk-stats lk-up" style={d()}>
          {c.stats.slice(0, 3).map((s, i) => (
            <div key={s.label}>
              <dt><span data-count={s.n}>0</span>{s.suffix}</dt>
              <dd>{c.link.stats[i]}</dd>
            </div>
          ))}
        </dl>

        <nav className="lk-grid" aria-label={c.link.title}>
          <a href={base} {...ext} className="lk-t lk-site lk-up" style={d()}>
            <span className="lk-shine" aria-hidden />
            <span className="lk-copy">
              <span className="lk-k">{c.link.siteKicker}</span>
              <b>{it.site.t}</b>
              <span className="lk-d">{it.site.d}</span>
              <span className="lk-go">{c.link.open} <ArrowUpRight aria-hidden /></span>
            </span>
            <span className="lk-fan" aria-hidden>
              {FAN.map(f => (
                <span key={f}><Image src={`/work/shots/${f}.webp`} alt="" width={156} height={338} /></span>
              ))}
            </span>
          </a>

          <a href={tgLink(c.link.hello)} {...ext} className="lk-t lk-tg lk-up" style={d()}>
            <span className="lk-ic"><Send aria-hidden /></span>
            <b>{it.tg.t}</b>
            <span className="lk-d">{it.tg.d}</span>
            <ArrowUpRight className="lk-ar" aria-hidden />
          </a>

          <a href="tel:+998932450625" className="lk-t lk-up" style={d()}>
            <span className="lk-ic"><Phone aria-hidden /></span>
            <b>{it.tel.t}</b>
            <span className="lk-d lk-mono">{it.tel.d}</span>
            <ArrowUpRight className="lk-ar" aria-hidden />
          </a>

          <a href={`${base}/xizmatlar`} {...ext} className="lk-t lk-price lk-up" style={d()}>
            <span className="lk-copy">
              <b>{it.prices.t}</b>
              <span className="lk-d">{it.prices.d}</span>
            </span>
            <span className="lk-bars" aria-hidden>
              {ladder.map(s => (
                <span key={s.id} style={{ ['--h' as string]: `${s.bar}%` }}>
                  <i />
                  <em>{s.price}</em>
                </span>
              ))}
            </span>
            <ArrowUpRight className="lk-ar" aria-hidden />
          </a>

          <a href="https://t.me/FERUDIN_AIBLOK" {...ext} className="lk-t lk-up" style={d()}>
            <span className="lk-ic"><Megaphone aria-hidden /></span>
            <b>{it.ch.t}</b>
            <span className="lk-d">{it.ch.d}</span>
            <ArrowUpRight className="lk-ar" aria-hidden />
          </a>

          <a href="https://community.ferudin.uz" {...ext} className="lk-t lk-up" style={d()}>
            <span className="lk-ic"><BookOpen aria-hidden /></span>
            <b>{it.cm.t}</b>
            <span className="lk-d">{it.cm.d}</span>
            <ArrowUpRight className="lk-ar" aria-hidden />
          </a>
        </nav>

        <div className="lk-mq lk-up" style={d()} aria-label={c.link.built}>
          <span className="lk-mq-k">{c.link.built}</span>
          <div className="lk-mq-row">
            <div>
              {[...NAMES, ...NAMES].map((x, i) => <span key={i}>{x}</span>)}
            </div>
          </div>
        </div>

        <p className="lk-foot lk-up" style={d()}>
          <a href={TG} {...ext}>@ferudin_ahmedov</a>
          <i aria-hidden />
          <a href={IG} {...ext}>@ferudinahmedov</a>
        </p>
      </div>
    </main>
  );
}
