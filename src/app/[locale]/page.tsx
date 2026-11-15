import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, Send } from 'lucide-react';
import { getC, href, tgLink } from '@/content/site';
import { Browser, CtaBlock, Marquee, ProjectVisual, SiteFooter, SiteHeader, Words } from '@/components/site/parts';
import Ladder from '@/components/site/Ladder';
import Brief from '@/components/site/Brief';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const c = getC(locale);
  const own = c.projects.filter(p => p.own);
  const client = c.projects.filter(p => !p.own);

  return (
    <>
      <SiteHeader c={c} />
      <main>
        {/* Hero: avval inson va natija */}
        <section className="hero">
          <div className="hero-bg" aria-hidden />
          <div className="wrap hero-grid">
            <div className="hero-txt">
              <span className="eyebrow hero-a" style={{ animationDelay: '0ms' }}>{c.hero.eyebrow}</span>
              <h1 className="h1">
                <Words text={c.hero.h1} mark={c.hero.mark} />
              </h1>
              <p className="lead hero-a" style={{ animationDelay: '700ms' }}>{c.hero.lead}</p>
              <div className="hero-cta hero-a" style={{ animationDelay: '820ms' }}>
                <a href={tgLink(c.ui.hello)} target="_blank" rel="noopener noreferrer" className="btn btn-p">
                  {c.hero.cta1} <Send aria-hidden />
                </a>
                <a href="#loyihalar" className="btn btn-g">
                  {c.hero.cta2} <ArrowDown aria-hidden />
                </a>
              </div>
              <ul className="socials hero-a" style={{ animationDelay: '940ms' }}>
                {c.channels.slice(0, 3).map(ch => (
                  <li key={ch.key}>
                    <a href={ch.url} target="_blank" rel="noopener noreferrer">
                      <span>{ch.name}</span>
                      <b>{ch.handle}</b>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="portrait" data-par="-36">
              <div className="portrait-img">
                <Image src="/ferudin-portrait.webp" alt="Ferudin Ahmedov" fill unoptimized priority />
              </div>
              <span className="float f1">{c.hero.f1}</span>
              <span className="float f2">{c.hero.f2}</span>
              <span className="float f3"><i aria-hidden />{c.hero.f3}</span>
            </div>
          </div>
        </section>

        {/* Raqamlar */}
        <section className="wrap">
          <dl className="stats">
            {c.stats.map(s => (
              <div key={s.label} className="rv">
                <dd><span data-count={s.n}>{s.n.toLocaleString('ru-RU')}</span>{s.suffix}</dd>
                <dt>{s.label}</dt>
              </div>
            ))}
          </dl>
        </section>

        <Marquee items={c.projects.filter(p => p.shot).map(p => ({ shot: p.shot!, url: p.urlLabel! }))} />

        {/* Sizga nima beradi */}
        <section className="sec" id="foyda" style={{ paddingBottom: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow rv">{c.gainsHead.eyebrow}</span>
              <h2 className="h2 rv">{c.gainsHead.h2}</h2>
              <p className="lead rv">{c.gainsHead.lead}</p>
            </div>
            <ul className="gains">
              {c.gains.map((g, i) => (
                <li key={g.benefit} className="gain rv">
                  <i>0{i + 1}</i>
                  <b>{g.benefit}</b>
                  <span>{g.feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Men kimman */}
        <section className="sec" id="men">
          <div className="wrap split">
            <div className="split-head">
              <span className="eyebrow rv">{c.about.eyebrow}</span>
              <h2 className="h2 rv">{c.about.h2}</h2>
            </div>
            <div className="story">
              {c.about.story.map(t => (
                <p key={t.slice(0, 24)} className="rv">{t}</p>
              ))}
            </div>
          </div>
          <div className="wrap">
            <ul className="roles">
              {c.roles.map((r, i) => (
                <li key={r.t} className="role glow rv">
                  <span className="role-n mono">0{i + 1}</span>
                  <h3 className="h3">{r.t}</h3>
                  <p>{r.d}</p>
                  <span className="chip">{r.tag}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* O'z bizneslarim */}
        <section className="sec" id="loyihalar" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow rv">{c.ownHead.eyebrow}</span>
              <h2 className="h2 rv">{c.ownHead.h2}</h2>
            </div>
            <div className="owns">
              {own.map(p => (
                <article key={p.slug} className="own rv" style={{ ['--tone' as string]: p.tone }}>
                  <div className="own-vis">
                    <Browser shot={p.shot!} url={p.urlLabel!} alt={`${p.name}, ${c.ui.desktopAlt}`} />
                  </div>
                  <div className="own-txt">
                    <div className="case-name"><i aria-hidden />{p.name}</div>
                    <span className="small mono">{p.kind}</span>
                    <p className="own-res">{p.result}</p>
                    <dl className="wins">
                      {p.wins.slice(0, 2).map(w => (
                        <div key={w.l}><dt>{w.n}</dt><dd>{w.l}</dd></div>
                      ))}
                    </dl>
                    <Link href={href(locale, `/loyihalar/${p.slug}`)} className="link">
                      {c.ui.more} <ArrowUpRight aria-hidden />
                      <span className="cover" aria-hidden />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Mijozlar uchun */}
        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow rv">{c.clientHead.eyebrow}</span>
              <h2 className="h2 rv">{c.clientHead.h2}</h2>
              <p className="lead rv">{c.clientHead.lead}</p>
            </div>
            <div className="cases">
              {client.map((p, n) => (
                <article key={p.slug} className="case" style={{ ['--tone' as string]: p.tone, ['--i' as string]: n }}>
                  <div className="case-txt">
                    <div className="case-name"><i aria-hidden />{p.name}</div>
                    <span className="small mono">{p.kind}</span>
                    <h3 className="h3">{p.result}</h3>
                    <dl className="wins">
                      {p.wins.map(w => (
                        <div key={w.l}><dt>{w.n}</dt><dd>{w.l}</dd></div>
                      ))}
                    </dl>
                    <Link href={href(locale, `/loyihalar/${p.slug}`)} className="link">
                      {c.ui.moreSee} <ArrowUpRight aria-hidden />
                      <span className="cover" aria-hidden />
                    </Link>
                  </div>
                  <div className={`case-vis ${p.shot ? '' : 'chatv'}`}>
                    <ProjectVisual p={p} c={c} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Sahifalarim */}
        <section className="sec" id="sahifalar" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow rv">{c.chanHead.eyebrow}</span>
              <h2 className="h2 rv">{c.chanHead.h2}</h2>
            </div>
            <ul className="chans">
              {c.channels.map(ch => (
                <li key={ch.key} className="rv">
                  <a href={ch.url} target="_blank" rel="noopener noreferrer" className="chan">
                    <span className="chan-n">{ch.name}</span>
                    <span className="chan-h mono">{ch.handle}</span>
                    <span className="chan-d">{ch.d}</span>
                    <ArrowUpRight aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Xizmatlar */}
        <section className="sec" id="xizmatlar" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow rv">{c.svcHead.eyebrow}</span>
              <h2 className="h2 rv">{c.svcHead.h2}</h2>
              <p className="lead rv">
                {c.svcHead.lead}{' '}
                <Link href={href(locale, '/xizmatlar')} className="link">{c.svcHead.all} <ArrowRight aria-hidden /></Link>
              </p>
            </div>
            <Ladder
              steps={c.steps}
              pricesHref={href(locale, '/xizmatlar')}
              from={c.from}
              t={{ aria: c.svcHead.aria, time: c.ui.time, writeAbout: c.ui.writeAbout, allPrices: c.ui.allPrices, ask: c.ui.ask }}
            />
          </div>
        </section>

        <CtaBlock c={c}>
          <Brief b={c.brief} />
        </CtaBlock>
      </main>
      <SiteFooter c={c} />
    </>
  );
}
