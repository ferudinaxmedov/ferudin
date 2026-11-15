import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, FileText, Send } from 'lucide-react';
import { IG, TG, fill, href, tgLink, type C, type Chat, type Pair, type Project } from '@/content/site';
import LangSwitch from './LangSwitch';

export function SiteHeader({ c, current }: { c: C; current?: 'work' | 'prices' }) {
  const l = c.locale;
  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <Link href={href(l, '/')} className="logo" aria-label={c.ui.home}>
          Ferudin<i aria-hidden />
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href={href(l, '/') + '#men'} className="nav-x">{c.ui.navAbout}</Link>
          <Link href={href(l, '/') + '#loyihalar'} className="nav-m" aria-current={current === 'work' ? 'page' : undefined}>
            {c.ui.navWork}
          </Link>
          <Link href={href(l, '/xizmatlar')} aria-current={current === 'prices' ? 'page' : undefined}>
            {c.ui.navServices}
          </Link>
        </nav>
        <div className="hdr-r">
          <LangSwitch locale={l} label={c.ui.lang} />
          <a href={tgLink(fill(c.ui.ask, c.ui.askProject))} target="_blank" rel="noopener noreferrer" className="btn btn-p btn-sm" aria-label={c.ui.contactAria}>
            <span className="long">{c.ui.contact}</span>
            <Send aria-hidden />
          </a>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ c }: { c: C }) {
  return (
    <footer className="ftr">
      <div className="wrap ftr-in">
        <span>© {new Date().getFullYear()} Ferudin Ahmedov</span>
        <div className="ftr-links">
          <Link href={href(c.locale, '/xizmatlar')}>{c.ui.footPrices}</Link>
          <a href={TG} target="_blank" rel="noopener noreferrer">Telegram: @ferudin_ahmedov</a>
          <a href={IG} target="_blank" rel="noopener noreferrer">Instagram: @ferudinahmedov</a>
          <a href="mailto:ferudinaxmedov@gmail.com">ferudinaxmedov@gmail.com</a>
        </div>
      </div>
    </footer>
  );
}

export function Browser({ shot, url, alt, className = '', priority = false }: { shot: string; url: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div className={`browser ${className}`}>
      <div className="browser-bar" aria-hidden>
        <i /><i /><i />
        <span>{url}</span>
      </div>
      <Image src={`/work/shots/${shot}-d.webp`} alt={alt} width={1440} height={900} sizes="(min-width: 1000px) 640px, 92vw" priority={priority} />
    </div>
  );
}

export function Phone({ shot, alt, className = '' }: { shot: string; alt: string; className?: string }) {
  return (
    <div className={`phone ${className}`}>
      <Image src={`/work/shots/${shot}-m.webp`} alt={alt} width={780} height={1688} sizes="(min-width: 1000px) 220px, 30vw" />
    </div>
  );
}

export function ChatMock({ chat, title, c }: { chat: Chat; title: string; c: C }) {
  return (
    <div className="chat" role="img" aria-label={`${title}: ${c.ui.chatAria}`}>
      <div className="chat-top"><span>{title}</span><span>{c.ui.sample}</span></div>
      {chat.map((m, i) => (
        <div key={i} className={`bub ${m.who}`}>
          {m.text}
          {m.file && (
            <span className="file"><FileText aria-hidden />{m.file}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function Pairs({ pairs, cols = false }: { pairs: Pair[]; cols?: boolean }) {
  return (
    <ul className={`pairs ${cols ? 'cols' : ''}`}>
      {pairs.map(p => (
        <li key={p.benefit}>
          <b>{p.benefit}</b>
          <span>{p.feature}</span>
        </li>
      ))}
    </ul>
  );
}

export function ProjectVisual({ p, c, priority = false, phone = false }: { p: Project; c: C; priority?: boolean; phone?: boolean }) {
  if (p.shot) {
    return (
      <>
        <Browser shot={p.shot} url={p.urlLabel ?? p.name} alt={`${p.name}, ${c.ui.desktopAlt}`} priority={priority} />
        {phone && <Phone shot={p.shot} alt={`${p.name}, ${c.ui.phoneAlt}`} />}
      </>
    );
  }
  return p.chat ? <ChatMock chat={p.chat} title={p.name} c={c} /> : null;
}

/* Sarlavha so'zlari pastdan birma-bir chiqadi. mark: sariq marker ostiga olinadigan so'zlar. */
export function Words({ text, mark = '' }: { text: string; mark?: string }) {
  const marked = mark.split(' ').filter(Boolean);
  const start = marked.length ? text.split(' ').findIndex((_, i, a) => a.slice(i, i + marked.length).join(' ') === mark) : -1;
  return (
    <>
      {text.split(' ').map((w, i) => {
        const on = start >= 0 && i >= start && i < start + marked.length;
        return (
          <Fragment key={i}>
            <span className="w">
              <span style={{ animationDelay: `${120 + i * 70}ms` }} className={on ? 'mk' : undefined}>{w}</span>
            </span>{' '}
          </Fragment>
        );
      })}
    </>
  );
}

export function Marquee({ items }: { items: { shot: string; url: string }[] }) {
  const row = [...items, ...items];
  return (
    <div className="mq" aria-hidden>
      <div className="mq-track">
        {row.map((it, i) => (
          <div key={i} className="browser mq-item">
            <div className="browser-bar"><i /><i /><i /><span>{it.url}</span></div>
            <Image src={`/work/shots/${it.shot}-d.webp`} alt="" width={1440} height={900} sizes="420px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CtaBlock({ c, children }: { c: C; children: React.ReactNode }) {
  return (
    <section className="sec" id="tahlil">
      <div className="wrap">
        <div className="cta glow rv">
          <div className="cta-txt">
            <span className="eyebrow">{c.cta.eyebrow}</span>
            <h2 className="h2">{c.cta.h2}</h2>
            <p className="lead">{c.cta.lead}</p>
            <ul className="cta-list">
              {c.cta.list.map(t => (
                <li key={t}><Check aria-hidden />{t}</li>
              ))}
            </ul>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

/* Narx: "$150 dan" (uz) yoki "от $150" (ru) / "from $150" (en) */
export function Price({ price, from, c }: { price: string; from: boolean; c: C }) {
  if (!from) return <>{price}</>;
  return c.from.before ? <><small className="pre">{c.from.word}</small>{price}</> : <>{price}<small>{c.from.word}</small></>;
}
