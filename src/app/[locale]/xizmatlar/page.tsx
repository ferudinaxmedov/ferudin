import type { Metadata } from 'next';
import { Send } from 'lucide-react';
import { fill, getC, tgLink, type C, type Step } from '@/content/site';
import { CtaBlock, Pairs, Price, SiteFooter, SiteHeader, Words } from '@/components/site/parts';
import Brief from '@/components/site/Brief';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const c = getC((await params).locale);
  return { title: c.meta.pricesTitle, description: c.meta.pricesDesc };
}

function Tier({ s, c, hot, badge, plus }: { s: Step; c: C; hot?: boolean; badge?: string; plus?: string }) {
  return (
    <article className={`tier rv ${hot ? 'hot' : ''}`}>
      <div className="tier-top">
        <span className="tier-name">{s.name}</span>
        {badge && <span className="badge">{badge}</span>}
      </div>
      <div className="price-big">
        <Price price={s.price} from={s.from} c={c} />
      </div>
      <p className="res">{s.result}</p>
      {plus && <p className="plus">{plus}</p>}
      <Pairs pairs={s.pairs} />
      <div className="tier-foot">
        <span className="small mono">{c.ui.time}: {s.time}</span>
        {s.note && <span className="small">{s.note}</span>}
        <a href={tgLink(fill(c.ui.ask, s.name))} target="_blank" rel="noopener noreferrer" className={`btn ${hot ? 'btn-p' : 'btn-g'}`}>
          {c.ui.writeAbout} <Send aria-hidden />
        </a>
      </div>
    </article>
  );
}

export default async function Prices({ params }: { params: Params }) {
  const { locale } = await params;
  const c = getC(locale);
  const p = c.prices;
  const by = (id: string) => c.steps.find(s => s.id === id)!;

  return (
    <>
      <SiteHeader c={c} current="prices" />
      <main>
        <section className="wrap page-hero">
          <span className="eyebrow hero-a">{p.hero.eyebrow}</span>
          <h1 className="h1">
            <Words text={p.hero.h1} mark={p.hero.mark} />
          </h1>
          <p className="lead hero-a" style={{ animationDelay: '600ms' }}>{p.hero.lead}</p>
        </section>

        <section className="sec">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">{p.web.eyebrow}</span>
              <h2 className="h2">{p.web.h2}</h2>
            </div>
            <div className="tiers">
              <Tier s={by('tizim')} c={c} hot badge={p.badges.tizim} plus={p.plus.tizim} />
              <Tier s={by('sotuv')} c={c} badge={p.badges.sotuv} plus={p.plus.sotuv} />
              <Tier s={by('katalog')} c={c} />
            </div>
          </div>
        </section>

        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow rv">{p.tg.eyebrow}</span>
              <h2 className="h2 rv">{p.tg.h2}</h2>
              <p className="lead rv">{p.tg.lead}</p>
            </div>
            <div className="tiers">
              <Tier s={by('miniapp')} c={c} hot badge={p.badges.miniapp} plus={p.plus.miniapp} />
              <Tier s={by('bot')} c={c} />
            </div>
          </div>
        </section>

        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow rv">{p.app.eyebrow}</span>
              <h2 className="h2 rv">{p.app.h2}</h2>
              <p className="lead rv">{p.app.lead}</p>
            </div>
            <div className="tbl rv">
              <table>
                <thead>
                  <tr>{p.app.head.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {p.app.rows.map((a, i) => (
                    <tr key={a.name} className={i === 2 ? 'hl' : undefined}>
                      <td>{a.name}<span className="sub">{a.sub}</span></td>
                      <td className="num">{a.onTop}</td>
                      <td className="num">{a.scratch}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small" style={{ marginTop: 16 }}>{p.app.note}</p>
          </div>
        </section>

        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow rv">{p.extra.eyebrow}</span>
              <h2 className="h2 rv">{p.extra.h2}</h2>
            </div>
            <div className="tbl rv">
              <table>
                <thead>
                  <tr>{p.extra.head.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {p.extra.rows.map(e => (
                    <tr key={e.name}>
                      <td>{e.name}<span className="sub">{e.sub}</span></td>
                      <td>{e.gives}</td>
                      <td className="num">{e.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow rv">{p.support.eyebrow}</span>
              <h2 className="h2 rv">{p.support.h2}</h2>
              <p className="lead rv">{p.support.lead}</p>
            </div>
            <div className="tbl rv">
              <table>
                <thead>
                  <tr>{p.support.head.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {p.support.rows.map(s => (
                    <tr key={s.name}>
                      <td>{s.name}</td>
                      <td className="num">{s.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="sec" id="jarayon" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow rv">{p.process.eyebrow}</span>
              <h2 className="h2 rv">{p.process.h2}</h2>
            </div>
            <ol className="steps">
              {p.process.steps.map(s => (
                <li key={s.t} className="rv">
                  <h3 className="h3">{s.t}</h3>
                  <p>{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="sec" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow rv">{p.terms.eyebrow}</span>
              <h2 className="h2 rv">{p.terms.h2}</h2>
            </div>
            <ul className="terms">
              {p.terms.rows.map(t => (
                <li key={t.t} className="rv">
                  <b>{t.t}</b>
                  <span>{t.d}</span>
                </li>
              ))}
            </ul>
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
