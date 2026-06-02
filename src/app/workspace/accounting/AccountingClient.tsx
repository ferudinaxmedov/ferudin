'use client';

import { useState } from 'react';
import { addTransaction, deleteTransaction } from './actions';

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
};

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' ' + currency;
}

function AddModal({ onClose }: { onClose: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Yangi tranzaksiya</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <form action={async (fd) => { await addTransaction(fd); onClose(); }} className="space-y-3">
          <select name="type" className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
            <option value="income">Kirim (Income)</option>
            <option value="expense">Chiqim (Expense)</option>
          </select>
          <div className="flex gap-2">
            <input name="amount" type="number" step="any" placeholder="Miqdor *" required className="flex-1 px-4 py-2.5 rounded-xl text-white placeholder-white/30 text-sm outline-none" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }} />
            <select name="currency" className="w-24 px-3 py-2.5 rounded-xl text-white text-sm outline-none" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
              <option>UZS</option>
              <option>USD</option>
              <option>RUB</option>
            </select>
          </div>
          <input name="description" type="text" placeholder="Tavsif *" required className="w-full px-4 py-2.5 rounded-xl text-white placeholder-white/30 text-sm outline-none" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }} />
          <input name="category" type="text" placeholder="Kategoriya" defaultValue="General" className="w-full px-4 py-2.5 rounded-xl text-white placeholder-white/30 text-sm outline-none" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }} />
          <input name="date" type="date" defaultValue={today} className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }} />
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

export function AccountingPageClient({ transactions }: { transactions: Transaction[] }) {
  const [open, setOpen] = useState(false);

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;
  const currency = transactions[0]?.currency ?? 'UZS';

  return (
    <>
      {open && <AddModal onClose={() => setOpen(false)} />}
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white font-black text-2xl">Accounting</h1>
            <p className="text-white/40 text-sm mt-1">Kirim va chiqim hisobi</p>
          </div>
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black" style={{ background: '#22c55e' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Qo'shish
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Kirim', value: fmt(income, currency), color: '#22c55e' },
            { label: 'Chiqim', value: fmt(expense, currency), color: '#ef4444' },
            { label: 'Balans', value: fmt(balance, currency), color: balance >= 0 ? '#22c55e' : '#ef4444' },
          ].map(card => (
            <div key={card.label} className="p-5 rounded-2xl" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-2">{card.label}</p>
              <p className="font-black text-xl" style={{ color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Transactions */}
        {transactions.length === 0 ? (
          <div className="text-center py-20 text-white/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-sm">Hali tranzaksiya yo'q</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            {transactions.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center gap-4 px-5 py-4 group hover:bg-white/[0.02] transition-colors"
                style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: t.type === 'income' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d={t.type === 'income' ? 'M12 19V5M5 12l7-7 7 7' : 'M12 5v14M5 12l7 7 7-7'} stroke={t.type === 'income' ? '#22c55e' : '#ef4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{t.description}</p>
                  <p className="text-white/30 text-xs">{t.category} · {t.date}</p>
                </div>
                <p className="font-bold text-sm flex-shrink-0" style={{ color: t.type === 'income' ? '#22c55e' : '#ef4444' }}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount, t.currency)}
                </p>
                <form action={async () => { await deleteTransaction(t.id); }}>
                  <button type="submit" className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
