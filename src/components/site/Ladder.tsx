'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Send } from 'lucide-react';
import { fill, tgLink } from '@/content/links';
import type { Step } from '@/content/site';

type Props = {
  steps: Step[];
  pricesHref: string;
  from: { word: string; before: boolean };
  t: { aria: string; time: string; writeAbout: string; allPrices: string; ask: string };
};

export default function Ladder({ steps, pricesHref, from, t }: Props) {
  const [i, setI] = useState(4);
  const s = steps[i];

  return (
    <div className="ladder rv">
      <div className="bars" role="tablist" aria-label={t.aria}>
        {steps.map((st, n) => (
          <button
            key={st.id}
            id={`tab-${st.id}`}
            role="tab"
            aria-selected={n === i}
            aria-controls="ladder-panel"
            className="bar"
            style={{ ['--h' as string]: `${st.bar}%` }}
            onClick={() => setI(n)}
          >
            <span className="p">{st.price}</span>
            <span className="n">{st.name}</span>
          </button>
        ))}
      </div>
      <div className="ladder-body" id="ladder-panel" role="tabpanel" aria-labelledby={`tab-${s.id}`}>
        <div className="ladder-main swap" key={s.id}>
          <span className="eyebrow">{s.name}</span>
          <h3 className="h3">{s.result}</h3>
          <div className="price-big">
            {s.from && from.before && <small className="pre">{from.word}</small>}
            {s.price}
            {s.from && !from.before && <small>{from.word}</small>}
          </div>
          <div className="meta-row">
            <span>{t.time}: {s.time}</span>
          </div>
          {s.note && <p className="small">{s.note}</p>}
          <div className="hero-cta" style={{ marginTop: 8 }}>
            <a href={tgLink(fill(t.ask, s.name))} target="_blank" rel="noopener noreferrer" className="btn btn-p">
              {t.writeAbout} <Send aria-hidden />
            </a>
            <Link href={pricesHref} className="btn btn-g">
              {t.allPrices} <ArrowRight aria-hidden />
            </Link>
          </div>
        </div>
        <ul className="pairs swap" key={`p-${s.id}`}>
          {s.pairs.map(p => (
            <li key={p.benefit}>
              <b>{p.benefit}</b>
              <span>{p.feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
