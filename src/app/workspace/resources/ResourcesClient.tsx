'use client';

import { useState } from 'react';
import { addResource, deleteResource } from './actions';

type Resource = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string;
};

function AddModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Yangi Resource</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <form action={async (fd) => { await addResource(fd); onClose(); }} className="space-y-3">
          {[
            { name: 'title', placeholder: 'Nomi *', required: true },
            { name: 'url', placeholder: 'URL (https://...) *', required: true },
            { name: 'description', placeholder: 'Tavsif' },
            { name: 'category', placeholder: 'Kategoriya', defaultValue: 'General' },
          ].map(f => (
            <input
              key={f.name}
              name={f.name}
              type="text"
              placeholder={f.placeholder}
              required={f.required}
              defaultValue={f.defaultValue}
              className="w-full px-4 py-2.5 rounded-xl text-white placeholder-white/30 text-sm outline-none"
              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}
            />
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-white/50" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
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

function ResourceCard({ r }: { r: Resource }) {
  const domain = (() => { try { return new URL(r.url).hostname; } catch { return r.url; } })();
  return (
    <div className="p-4 rounded-2xl group flex items-start gap-3" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: '#1a1a1a' }}>
        <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} alt="" className="w-4 h-4 rounded" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-green-500/70">{r.category}</span>
            <h3 className="text-white font-semibold text-sm truncate">{r.title}</h3>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-white/30 text-xs hover:text-green-400 transition-colors truncate block">{domain}</a>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/70 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M15 3h6v6M10 14 21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <form action={async () => { await deleteResource(r.id); }}>
              <button type="submit" className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </div>
        </div>
        {r.description && <p className="text-white/30 text-xs mt-1.5">{r.description}</p>}
      </div>
    </div>
  );
}

export function ResourcesPageClient({ resources }: { resources: Resource[] }) {
  const [open, setOpen] = useState(false);

  const grouped = resources.reduce<Record<string, Resource[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  return (
    <>
      {open && <AddModal onClose={() => setOpen(false)} />}
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white font-black text-2xl">Resources</h1>
            <p className="text-white/40 text-sm mt-1">Linklar, resurslar va bookmarklar</p>
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

        {resources.length === 0 ? (
          <div className="text-center py-20 text-white/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3">
              <path d="M4 6h16M4 10h16M4 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-sm">Hali resource yo'q</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <h2 className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-3">{cat}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map(r => <ResourceCard key={r.id} r={r} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
