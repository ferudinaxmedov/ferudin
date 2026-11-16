'use client';

import { useState, useTransition } from 'react';
import { Pencil, Target } from 'lucide-react';
import { saveGoal } from './actions';

export function GoalButton({ project, name, current }: { project: string; name: string; current: number | null }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(form: FormData) {
    setError(null);
    start(async () => {
      const r = await saveGoal(form);
      if (r.error) setError(r.error); else setOpen(false);
    });
  }

  return (
    <>
      {current
        ? <button className="icon-btn" onClick={() => setOpen(true)} aria-label={`${name} maqsadini o'zgartirish`} title="Maqsadni o'zgartirish"><Pencil size={13} /></button>
        : <button className="btn btn-ghost small" onClick={() => setOpen(true)}><Target size={14} /> Maqsad qo&apos;yish</button>}
      {open && (
        <div className="modal-back" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby={`goal-${project}`} style={{ maxWidth: 420 }}>
            <h2 id={`goal-${project}`}>{name}: shu oy maqsadi</h2>
            <form action={submit}>
              <input type="hidden" name="project" value={project} />
              <label className="field"><span>Tushum maqsadi (so&apos;m)</span>
                <input name="target" defaultValue={current ?? ''} inputMode="numeric" className="input mono" autoFocus placeholder="masalan 50 000 000" />
              </label>
              <p className="faint small">Bo&apos;sh qoldirsangiz maqsad olib tashlanadi.</p>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="modal-actions">
                <div />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Bekor qilish</button>
                  <button className="btn btn-primary" disabled={pending}>{pending ? 'Saqlanmoqda…' : 'Saqlash'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
