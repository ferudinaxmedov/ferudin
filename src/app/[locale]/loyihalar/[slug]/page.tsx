import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Send } from 'lucide-react';
import { fill, getC, href, slugs, tgLink } from '@/content/site';
import { Browser, CtaBlock, Pairs, ProjectVisual, SiteFooter, SiteHeader } from '@/components/site/parts';
import Brief from '@/components/site/Brief';
import { routing } from '@/i18n/routing';

type Params = Promise<{ locale: string; slug: string }>;

export function generateStaticParams() {
  return routing.locales.flatMap(locale => slugs.map(slug => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = getC(locale).projects.find(x => x.slug === slug);
  if (!p) return {};
  return { title: `${p.name}: ${p.result}`, description: p.summary };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const c = getC(locale);
  const idx = c.projects.findIndex(x => x.slug === slug);
  if (idx < 0) notFound();
  const p = c.projects[idx];
  const next = c.projects[(idx + 1) % c.projects.length];
  const t = c.proj;

  return (
    <>
      <SiteHeader c={c} current="work" />
      <main style={{ ['--tone' as string]: p.tone }}>
        <section className="wrap page-hero">
          <span className="crumb">
            <Link href={href(locale, '/') + '#loyihalar'}>{t.crumb}</Link>
            <span aria-hidden>/</span>
            <span>{p.name}</span>
          </span>
          <h1 className="h1" style={{ fontSize: 'clamp(34px, 5vw, 66px)' }}>{p.result}</h1>
          <p className="lead">{p.summary}</p>
          <dl className="facts">
            <div><dt>{t.fProject}</dt><dd>{p.name}</dd></div>
            <div><dt>{t.fKind}</dt><dd>{p.kind}</dd></div>
            <div><dt>{t.fRole}</dt><dd>{p.role}</dd></div>
            {p.url && (
              <div>
                <dt>{t.fLive}</dt>
                <dd>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="link">
                    {p.urlLabel} <ArrowUpRight aria-hidden />
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section className="wrap" style={{ paddingBlock: '24px 0' }}>
          <div className={`shots ${p.shot ? 'duo' : 'chatv'}`}>
            <ProjectVisual p={p} c={c} priority phone />
          </div>
        </section>

        <section className="sec" style={{ paddingBottom: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow rv">{t.winEyebrow}</span>
              <h2 className="h2 rv">{t.winH2}</h2>
            </div>
            <dl className="wins big">
              {p.wins.map(w => (
                <div key={w.l} className="rv">
                  <dt>{w.n}</dt>
                  <dd>{w.l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="sec">
          <div className="wrap two">
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">{t.probEyebrow}</span>
              <h2 className="h2" style={{ fontSize: 'clamp(26px, 3vw, 38px)' }}>{t.probH2}</h2>
            </div>
            <p className="lead" style={{ color: 'var(--ink)' }}>{p.problem}</p>
          </div>
        </section>

        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">{t.builtEyebrow}</span>
              <h2 className="h2">{t.builtH2}</h2>
            </div>
            <Pairs pairs={p.pairs} cols />
          </div>
        </section>

        {p.crm && p.screens && (
          <section className="sec" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="sec-head">
                <span className="eyebrow rv">{t.insideEyebrow}</span>
                <h2 className="h2 rv">{t.insideH2}</h2>
              </div>
              <div className="inside">
                {p.crm.map((f, i) => (
                  <figure key={f} className="rv">
                    <div className="browser">
                      <div className="browser-bar" aria-hidden><i /><i /><i /><span>{p.crmUrl}</span></div>
                      <Image src={`/work/crm/${f}.webp`} alt={p.screens![i]} width={1568} height={727} sizes="(min-width: 1240px) 1160px, 94vw" />
                    </div>
                    <figcaption>{p.screens![i]}</figcaption>
                  </figure>
                ))}
              </div>
              {p.slug !== 'dentaflow' && <p className="small" style={{ marginTop: 16 }}>{t.insideNote}</p>}
            </div>
          </section>
        )}

        {p.shot2 && p.shot2Label && (
          <section className="sec" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="shots">
                <Browser shot={p.shot2} url={p.shot2Label.split(':')[0]} alt={p.shot2Label} />
              </div>
              <p className="small" style={{ marginTop: 12 }}>{p.shot2Label}</p>
            </div>
          </section>
        )}

        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap two">
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">{t.stackEyebrow}</span>
              <h2 className="h2" style={{ fontSize: 'clamp(26px, 3vw, 38px)' }}>{t.stackH2}</h2>
            </div>
            <div className="chips" style={{ alignContent: 'flex-start' }}>
              {p.stack.map(s => (
                <span key={s} className="chip" style={{ fontSize: 14, padding: '8px 14px', background: 'var(--card)' }}>{s}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sim rv">
              <div className="sec-head" style={{ marginBottom: 0 }}>
                <span className="eyebrow">{t.simEyebrow}</span>
                <h2 className="h2" style={{ fontSize: 'clamp(26px, 3.2vw, 40px)' }}>{t.simH2}</h2>
                <div className="hero-cta">
                  <a href={tgLink(fill(c.ui.askSimilar, p.name))} target="_blank" rel="noopener noreferrer" className="btn btn-p">
                    {c.hero.cta1} <Send aria-hidden />
                  </a>
                  <Link href={href(locale, '/xizmatlar')} className="btn btn-g">
                    {c.ui.allPrices} <ArrowRight aria-hidden />
                  </Link>
                </div>
              </div>
              <ul>
                {p.similar.map(s => (
                  <li key={s.label}>
                    <span>{s.label}</span>
                    <b>{s.price}</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="wrap">
          <Link href={href(locale, `/loyihalar/${next.slug}`)} className="next">
            <span>
              <span className="eyebrow">{t.next}</span>
              <span className="h2" style={{ display: 'block', marginTop: 8 }}>{next.name}</span>
            </span>
            <ArrowRight aria-hidden />
          </Link>
        </section>

        <CtaBlock c={c}>
          <Brief b={c.brief} topic={p.name} />
        </CtaBlock>
      </main>
      <SiteFooter c={c} />
    </>
  );
}
