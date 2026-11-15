'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { tgLink } from '@/content/links';
import type { Texts } from '@/content/site';

export default function Brief({ b, topic }: { b: Texts['brief']; topic?: string }) {
  const [a, setA] = useState<number[]>(b.defaults);
  const pick = (g: number) => b.groups[g].opts[a[g]];

  const text =
    `${b.tpl.hello}\n` +
    (topic ? `${b.tpl.topic}: ${topic}\n` : '') +
    `${b.tpl.biz}: ${pick(0)}\n${b.tpl.now}: ${pick(1)}\n${b.tpl.need}: ${pick(2)}`;

  return (
    <form className="brief" onSubmit={e => e.preventDefault()}>
      {b.groups.map((g, gi) => (
        <fieldset key={g.q}>
          <legend>{g.q}</legend>
          <div className="opts">
            {g.opts.map((o, oi) => (
              <button
                key={o}
                type="button"
                className="opt"
                aria-pressed={a[gi] === oi}
                onClick={() => setA(prev => prev.map((v, k) => (k === gi ? oi : v)))}
              >
                {o}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <a href={tgLink(text)} target="_blank" rel="noopener noreferrer" className="btn btn-w">
        {b.send} <Send aria-hidden />
      </a>
      <p className="hint">{b.hint}</p>
    </form>
  );
}
