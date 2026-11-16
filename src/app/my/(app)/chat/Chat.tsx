'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { ArrowUp, Bot, Brain, PlugZap, RotateCcw } from 'lucide-react';
import { newChat, sendMessage } from './actions';

type Msg = { role: 'user' | 'assistant'; text: string; html: string | null; model?: string; usd?: number; error?: boolean };

const SUGGEST = [
  'Bugun nimaga e’tibor berishim kerak?',
  'Bu oy jami tushum qancha, qaysi loyiha yetakchi?',
  'Qaysi obunalar yaqinda to‘lanadi?',
  'chuqur: SeedBee savdosini o‘tgan oy bilan solishtirib tahlil qil',
];

const modelName = (m?: string) => (m?.includes('opus') ? 'Opus' : m?.includes('sonnet') ? 'Sonnet' : '');

export function Chat({ initial, spent, budget, ready }: { initial: Msg[]; spent: number; budget: number; ready: boolean }) {
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [text, setText] = useState('');
  const [used, setUsed] = useState(spent);
  const [pending, start] = useTransition();
  const list = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  const deep = /^chuqur\s*:/i.test(text.trim());

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, pending]);

  function send(q = text) {
    const question = q.trim();
    if (!question || pending) return;
    setText('');
    setMsgs((m) => [...m, { role: 'user', text: question, html: null }]);
    start(async () => {
      try {
        const r = await sendMessage(question);
        setMsgs((m) => [...m, { role: 'assistant', text: '', html: r.html, model: r.model, usd: r.usd, error: !r.ok }]);
        if (r.usd) setUsed((u) => u + r.usd!);
      } catch {
        setMsgs((m) => [...m, { role: 'assistant', text: '', html: 'Javob kelmadi (tarmoq yoki vaqt tugadi). Qayta yuboring.', error: true }]);
      }
      box.current?.focus();
    });
  }

  function reset() {
    if (pending) return;
    start(async () => {
      await newChat();
      setMsgs([]);
    });
  }

  return (
    <section className="chat">
      <header className="head rise">
        <div>
          <h1>Claude</h1>
          <p>Loyihalaringiz bo&apos;yicha savol bering · faqat o&apos;qiydi · bu oy ${used.toFixed(2)} / ${budget}</p>
        </div>
        <div className="head-actions">
          <button className="btn btn-ghost small" onClick={reset} disabled={pending || !msgs.length}>
            <RotateCcw size={14} /> Yangi suhbat
          </button>
        </div>
      </header>

      {!ready && (
        <div className="callout rise">
          <PlugZap size={18} />
          <div><b>Claude kaliti ulanmagan</b><p>Vercel&apos;da <span className="mono">ANTHROPIC_API_KEY</span> qo&apos;shilgach chat ishlaydi.</p></div>
        </div>
      )}

      <div className="card chat-card">
        <div className="chat-list" ref={list} aria-live="polite">
          {!msgs.length && (
            <div className="chat-empty">
              <span className="chat-empty-ico"><Bot size={22} /></span>
              <b>Nima bilmoqchisiz?</b>
              <p>Tushum, buyurtmalar, lidlar, xarajatlar va signallar: hammasini hubdagi jonli raqamlardan oladi. Chuqur tahlil uchun savolni <span className="mono">chuqur:</span> bilan boshlang.</p>
              <div className="chat-suggest">
                {SUGGEST.map((s) => (
                  <button key={s} className="chip-btn" onClick={() => send(s)} disabled={pending || !ready}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="bubble me">{m.text}</div>
            ) : (
              <div key={i} className={`bubble ai${m.error ? ' err' : ''}`}>
                <div dangerouslySetInnerHTML={{ __html: m.html ?? '' }} />
                {m.model && (
                  <small className="bubble-meta">
                    {modelName(m.model) === 'Opus' ? <Brain size={12} /> : <Bot size={12} />} {modelName(m.model)}
                    {m.usd !== undefined && ` · $${m.usd.toFixed(3)}`}
                  </small>
                )}
              </div>
            ),
          )}
          {pending && msgs[msgs.length - 1]?.role === 'user' && (
            <div className="bubble ai typing" aria-label="Javob yozilmoqda"><span /><span /><span /></div>
          )}
        </div>

        <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <textarea
            ref={box}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={ready ? 'Savol yozing… (Enter: yuborish, Shift+Enter: yangi qator)' : 'Kalit ulanmagan'}
            rows={1}
            maxLength={4000}
            disabled={!ready}
            aria-label="Savol"
          />
          {deep && <span className="deep-tag" title="Opus 5.5 javob beradi"><Brain size={12} /> Opus</span>}
          <button className="send" type="submit" disabled={pending || !text.trim() || !ready} aria-label="Yuborish">
            <ArrowUp size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}
