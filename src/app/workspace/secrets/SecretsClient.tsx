'use client';

import { useState } from 'react';
import { addSecret, deleteSecret } from './actions';

type Secret = {
  id: string;
  title: string;
  username: string | null;
  password: string | null;
  url: string | null;
  notes: string | null;
  category: string;
};

export function AddSecretModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Yangi Secret</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <form
          action={async (fd) => { await addSecret(fd); onClose(); }}
          className="space-y-3"
        >
          {[
            { name: 'title', placeholder: 'Nomi *', required: true },
            { name: 'username', placeholder: 'Login / Email' },
            { name: 'password', placeholder: 'Parol', type: 'text' },
            { name: 'url', placeholder: 'URL (https://...)' },
            { name: 'category', placeholder: 'Kategoriya', defaultValue: 'General' },
          ].map(f => (
            <input
              key={f.name}
              name={f.name}
              type={f.type ?? 'text'}
              placeholder={f.placeholder}
              required={f.required}
              defaultValue={f.defaultValue}
              className="w-full px-4 py-2.5 rounded-xl text-white placeholder-white/30 text-sm outline-none"
              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
            />
          ))}
          <textarea
            name="notes"
            placeholder="Eslatmalar"
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl text-white placeholder-white/30 text-sm outline-none resize-none"
            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
          />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 hover:text-white transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              Bekor
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black" style={{ background: '#22c55e' }}>
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SecretCard({ s }: { s: Secret }) {
  const [showPass, setShowPass] = useState(false);
  const [copied, setCopied] = useState('');

  function copy(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 1500);
  }

  return (
    <div className="p-4 rounded-2xl group" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-green-500/70">{s.category}</span>
          <h3 className="text-white font-bold text-base mt-0.5">{s.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {s.url && (
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/70 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M15 3h6v6M10 14 21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
          <form action={async () => { await deleteSecret(s.id); }}>
            <button type="submit" className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {s.username && (
          <div className="flex items-center justify-between">
            <span className="text-white/40">Login</span>
            <div className="flex items-center gap-2">
              <span className="text-white/80 font-mono text-xs">{s.username}</span>
              <button onClick={() => copy(s.username!, 'user')} className="text-white/30 hover:text-green-400 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke={copied === 'user' ? '#22c55e' : 'currentColor'} strokeWidth="1.8" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke={copied === 'user' ? '#22c55e' : 'currentColor'} strokeWidth="1.8" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {s.password && (
          <div className="flex items-center justify-between">
            <span className="text-white/40">Parol</span>
            <div className="flex items-center gap-2">
              <span className="text-white/80 font-mono text-xs">{showPass ? s.password : '••••••••'}</span>
              <button onClick={() => setShowPass(v => !v)} className="text-white/30 hover:text-white/60 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  {showPass
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" /></>
                  }
                </svg>
              </button>
              <button onClick={() => copy(s.password!, 'pass')} className="text-white/30 hover:text-green-400 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke={copied === 'pass' ? '#22c55e' : 'currentColor'} strokeWidth="1.8" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke={copied === 'pass' ? '#22c55e' : 'currentColor'} strokeWidth="1.8" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {s.notes && (
          <p className="text-white/30 text-xs mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>{s.notes}</p>
        )}
      </div>
    </div>
  );
}

export function SecretsPageClient({ secrets }: { secrets: Secret[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <AddSecretModal onClose={() => setOpen(false)} />}
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white font-black text-2xl">Secrets</h1>
            <p className="text-white/40 text-sm mt-1">Parollar va kirish ma'lumotlari</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black"
            style={{ background: '#22c55e' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Qo'shish
          </button>
        </div>

        {secrets.length === 0 ? (
          <div className="text-center py-20 text-white/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-sm">Hali secret yo'q</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {secrets.map(s => <SecretCard key={s.id} s={s} />)}
          </div>
        )}
      </div>
    </>
  );
}
