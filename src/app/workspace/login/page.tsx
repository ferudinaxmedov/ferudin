'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: '#080808', fontFamily: 'Inter, sans-serif' }}
    >
      <div className="w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="#22c55e" strokeWidth="1.8" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-white font-black text-2xl">Workspace</h1>
          <p className="text-white/40 text-sm mt-1">ferudin.uz · Shaxsiy panel</p>
        </div>

        {/* Form */}
        <form action={action} className="space-y-4">
          <input
            name="password"
            type="password"
            placeholder="Parol"
            autoFocus
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 text-sm outline-none"
            style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)' }}
          />

          {state?.error && (
            <p className="text-red-400 text-sm text-center">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-xl font-bold text-sm text-black transition-opacity disabled:opacity-60"
            style={{ background: '#22c55e' }}
          >
            {pending ? 'Kirish...' : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  );
}
