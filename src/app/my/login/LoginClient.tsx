'use client';

import { useActionState, useState } from 'react';
import { KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { loginStep, type LoginState } from './actions';

export function LoginClient({ from }: { from: string }) {
  const [stage, action, pending] = useActionState<LoginState, FormData>(loginStep, { stage: 'password' });
  const [copied, setCopied] = useState(false);
  const atCode = stage.stage !== 'password';

  return (
    <main className="login">
      <div className="login-card rise">
        <div className="login-mark"><Lock size={18} /></div>
        <h1>my.ferudin.uz</h1>
        <p className="muted">Shaxsiy boshqaruv markazi. Faqat egasi uchun.</p>

        {!atCode && (
          <form action={action} className="login-form">
            <label className="field">
              <span>Parol</span>
              <input name="password" type="password" autoComplete="current-password" autoFocus required className="input" />
            </label>
            {stage.error && <p className="form-error" role="alert">{stage.error}</p>}
            <button className="btn btn-primary" disabled={pending}>{pending ? 'Tekshirilmoqda…' : 'Davom etish'}</button>
          </form>
        )}

        {atCode && (
          <form action={action} className="login-form">
            <input type="hidden" name="step" value="code" />
            {stage.stage === 'enroll' && (
              <div className="enroll">
                <p className="enroll-title"><ShieldCheck size={16} /> Ikki bosqichli himoyani yoqing</p>
                <p className="muted small">Authenticator ilovasida (Google Authenticator, 2FAS, Bitwarden) QR kodni skanerlang va 6 xonali kodni kiriting. Bu faqat bir marta so&apos;raladi.</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={stage.qr} alt="TOTP QR kod" width={180} height={180} className="qr" />
                <button
                  type="button" className="btn btn-ghost small mono"
                  onClick={() => { navigator.clipboard.writeText(stage.secret); setCopied(true); }}
                >
                  <KeyRound size={14} /> {copied ? 'Nusxalandi ✓' : 'Kalitni qo‘lda kiritish uchun nusxalash'}
                </button>
              </div>
            )}
            <input type="hidden" name="from" value={from} />
            <label className="field">
              <span>Authenticator kodi</span>
              <input name="code" inputMode="numeric" pattern="[0-9 ]{6,7}" maxLength={7} autoComplete="one-time-code" autoFocus required className="input mono code" placeholder="000 000" />
            </label>
            {stage.error && <p className="form-error" role="alert">{stage.error}</p>}
            <button className="btn btn-primary" disabled={pending}>{pending ? 'Tekshirilmoqda…' : 'Kirish'}</button>
          </form>
        )}
      </div>
    </main>
  );
}
