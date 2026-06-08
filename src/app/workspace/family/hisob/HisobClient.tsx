'use client';

import { useState } from 'react';
import { addTransaction, deleteTransaction, editTransaction, addQarz, closeQarz } from './actions';

type Tx = {
  id: string; type: string; date: string; owner: string; category: string;
  payment_method: string; amount_usd: number | null; amount_uzs: number | null;
  note: string | null;
};
type Qarz = {
  id: string; number: number; type: string; person: string;
  amount_usd: number | null; amount_uzs: number | null;
  date: string; deadline: string | null; status: string; note: string | null;
};
type Props = {
  transactions: Tx[];
  qarzlar: Qarz[];
  balUsd: number;
  balUzs: number;
  chiqimCats: string[];
  kirimCats: string[];
};

const OWNERS = ['FERUDIN', 'GULOYIM'];
const PAYMENTS = ['NAQD', 'KARTA', 'KARTA2'];

function fmtUzs(n: number) {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  return new Intl.NumberFormat('uz-UZ').format(Math.round(n));
}
function fmtDate(s: string | null) {
  if (!s) return '';
  try { return new Date(s).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit' }); }
  catch { return s; }
}
function txAmt(tx: Tx) {
  const sign = tx.type === 'KIRIM' ? '+' : '-';
  if (tx.amount_usd) return `${sign}${tx.amount_usd}$`;
  if (tx.amount_uzs) return `${sign}${fmtUzs(tx.amount_uzs)}`;
  return '';
}
function qarzAmt(q: Qarz) {
  if (q.amount_usd) return `${q.amount_usd}$`;
  if (q.amount_uzs) return `${fmtUzs(q.amount_uzs)} s`;
  return '';
}

const s = {
  card: { background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px 24px' },
  input: { background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', padding: '9px 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' as const, outline: 'none' },
  label: { color: 'rgba(255,255,255,0.4)', fontSize: '12px', display: 'block', marginBottom: '4px' },
  btnPrimary: { background: '#22c55e', color: '#000', fontWeight: 600, fontSize: '13px', border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer' },
  btnSecondary: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer' },
  overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', width: '420px', maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto' as const },
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '16px', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: '14px' }}><label style={s.label}>{label}</label>{children}</div>;
}

function TxForm({
  txType, setTxType, cats, onSubmit, defaultValues, today,
}: {
  txType: 'CHIQIM' | 'KIRIM';
  setTxType: (t: 'CHIQIM' | 'KIRIM') => void;
  cats: string[];
  onSubmit: (fd: FormData) => Promise<void>;
  defaultValues?: Tx;
  today: string;
}) {
  const allCats = txType === 'KIRIM'
    ? cats
    : cats;

  return (
    <form action={async (fd) => { await onSubmit(fd); }}>
      <Field label="Tur">
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['CHIQIM', 'KIRIM'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTxType(t)} style={{
              flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid',
              borderColor: txType === t ? (t === 'KIRIM' ? '#22c55e' : '#ef4444') : 'rgba(255,255,255,0.08)',
              background: txType === t ? (t === 'KIRIM' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)') : 'transparent',
              color: txType === t ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            }}>{t}</button>
          ))}
        </div>
        <input type="hidden" name="type" value={txType} />
      </Field>
      <Field label="Kategoriya">
        <select name="category" required defaultValue={defaultValues?.category} style={{ ...s.input, appearance: 'none' }}>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Field label="Egasi">
          <select name="owner" required defaultValue={defaultValues?.owner} style={{ ...s.input, appearance: 'none' }}>
            {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="To'lov usuli">
          <select name="payment_method" required defaultValue={defaultValues?.payment_method} style={{ ...s.input, appearance: 'none' }}>
            {PAYMENTS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Field label="Summa USD"><input name="amount_usd" type="number" step="0.01" placeholder="0.00" defaultValue={defaultValues?.amount_usd ?? ''} style={s.input} /></Field>
        <Field label="Summa UZS"><input name="amount_uzs" type="number" placeholder="0" defaultValue={defaultValues?.amount_uzs ?? ''} style={s.input} /></Field>
      </div>
      <Field label="Sana"><input name="date" type="date" defaultValue={defaultValues?.date ?? today} required style={s.input} /></Field>
      <Field label="Izoh"><input name="note" type="text" placeholder="Ixtiyoriy..." defaultValue={defaultValues?.note ?? ''} style={s.input} /></Field>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button type="submit" style={{ ...s.btnPrimary, flex: 1 }}>Saqlash</button>
      </div>
    </form>
  );
}

export function HisobClient({ transactions, qarzlar, balUsd, balUzs, chiqimCats, kirimCats }: Props) {
  const [tab, setTab] = useState<'tx' | 'qarz'>('tx');
  const [txModal, setTxModal] = useState(false);
  const [qarzModal, setQarzModal] = useState(false);
  const [editTx, setEditTx] = useState<Tx | null>(null);
  const [txType, setTxType] = useState<'CHIQIM' | 'KIRIM'>('CHIQIM');
  const [editTxType, setEditTxType] = useState<'CHIQIM' | 'KIRIM'>('CHIQIM');
  const [filter, setFilter] = useState('');

  const cats = txType === 'CHIQIM' ? chiqimCats : kirimCats;
  const editCats = editTxType === 'CHIQIM' ? chiqimCats : kirimCats;
  const filteredTx = filter
    ? transactions.filter(tx => tx.category.toLowerCase().includes(filter.toLowerCase()) || tx.owner.toLowerCase().includes(filter.toLowerCase()) || (tx.note ?? '').toLowerCase().includes(filter.toLowerCase()))
    : transactions;
  const activeQarz = qarzlar.filter(q => q.status === 'AKTIV');
  const closedQarz = qarzlar.filter(q => q.status === 'TUGADI');

  const today = new Date().toISOString().split('T')[0];

  function openEdit(tx: Tx) {
    setEditTx(tx);
    setEditTxType(tx.type as 'CHIQIM' | 'KIRIM');
  }

  return (
    <div style={{ padding: '32px', maxWidth: '960px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '24px', margin: '0 0 4px 0' }}>Hisob</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', margin: 0 }}>Oila moliyaviy harakatlari</p>
        </div>
        <button onClick={() => tab === 'tx' ? setTxModal(true) : setQarzModal(true)} style={s.btnPrimary}>
          + {tab === 'tx' ? 'Tranzaksiya' : 'Qarz'} qo&apos;shish
        </button>
      </div>

      {/* Balance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={s.card}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>Balans USD</p>
          <p style={{ color: balUsd >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: '24px', margin: 0 }}>{balUsd >= 0 ? '+' : ''}{balUsd.toFixed(2)} $</p>
        </div>
        <div style={s.card}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>Balans UZS</p>
          <p style={{ color: balUzs >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: '24px', margin: 0 }}>{balUzs >= 0 ? '+' : ''}{fmtUzs(balUzs)} so&apos;m</p>
        </div>
        <div style={s.card}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>Jami yozuvlar</p>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '24px', margin: 0 }}>{transactions.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {[['tx', 'Tranzaksiyalar'], ['qarz', 'Qarzlar']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as 'tx' | 'qarz')} style={{
            background: tab === k ? '#1f1f1f' : 'transparent',
            border: tab === k ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
            color: tab === k ? '#fff' : 'rgba(255,255,255,0.4)',
            borderRadius: '7px', padding: '7px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
          }}>{l}</button>
        ))}
      </div>

      {/* Transactions */}
      {tab === 'tx' && (
        <div style={s.card}>
          <div style={{ marginBottom: '16px' }}>
            <input
              placeholder="Qidirish: kategoriya, egasi, izoh..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ ...s.input, width: '280px' }}
            />
          </div>
          {filteredTx.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px', margin: 0 }}>Tranzaksiyalar topilmadi</p>
            </div>
          ) : (
            <div>
              {filteredTx.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                      background: tx.type === 'KIRIM' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        {tx.type === 'KIRIM'
                          ? <path d="M12 19V5M5 12l7-7 7 7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          : <path d="M12 5v14M5 12l7 7 7-7" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        }
                      </svg>
                    </div>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500, margin: '0 0 2px 0' }}>{tx.category}</p>
                      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', margin: 0 }}>
                        {fmtDate(tx.date)} · {tx.owner} · {tx.payment_method}
                        {tx.note && <span> · {tx.note}</span>}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: tx.type === 'KIRIM' ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: '14px', marginRight: '8px' }}>{txAmt(tx)}</span>
                    <button type="button" onClick={() => openEdit(tx)} title="Tahrirlash"
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <form action={async () => { await deleteTransaction(tx.id); }}>
                      <button type="submit" title="O'chirish"
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.15)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Qarz tab */}
      {tab === 'qarz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={s.card}>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', margin: '0 0 16px 0' }}>Aktiv qarzlar ({activeQarz.length})</p>
            {activeQarz.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', margin: 0 }}>Aktiv qarz yo&apos;q</p>
            ) : activeQarz.map(q => (
              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500, margin: '0 0 2px 0' }}>
                    <span style={{ color: q.type === 'BERDI' ? '#ef4444' : '#22c55e', marginRight: '6px' }}>{q.type === 'BERDI' ? 'Berdik' : 'Oldik'}</span>
                    {q.person}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', margin: 0 }}>
                    {fmtDate(q.date)}{q.deadline && ` · muddat: ${fmtDate(q.deadline)}`}
                    {q.note && ` · ${q.note}`}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{qarzAmt(q)}</span>
                  <form action={async () => { await closeQarz(q.id); }}>
                    <button type="submit" style={{ ...s.btnSecondary, fontSize: '12px', padding: '6px 12px' }}>Yopish</button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {closedQarz.length > 0 && (
            <div style={{ ...s.card, opacity: 0.6 }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '13px', margin: '0 0 12px 0' }}>Yopilgan qarzlar ({closedQarz.length})</p>
              {closedQarz.map(q => (
                <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 2px 0' }}>{q.person}</p>
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', margin: 0 }}>{fmtDate(q.date)}</p>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textDecoration: 'line-through' }}>{qarzAmt(q)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Transaction Modal */}
      {txModal && (
        <Modal title="Yangi tranzaksiya" onClose={() => setTxModal(false)}>
          <TxForm
            txType={txType}
            setTxType={setTxType}
            cats={cats}
            today={today}
            onSubmit={async (fd) => { await addTransaction(fd); setTxModal(false); }}
          />
        </Modal>
      )}

      {/* Edit Transaction Modal */}
      {editTx && (
        <Modal title="Tranzaksiyani tahrirlash" onClose={() => setEditTx(null)}>
          <TxForm
            txType={editTxType}
            setTxType={setEditTxType}
            cats={editCats}
            today={today}
            defaultValues={editTx}
            onSubmit={async (fd) => { await editTransaction(editTx.id, fd); setEditTx(null); }}
          />
        </Modal>
      )}

      {/* Add Qarz Modal */}
      {qarzModal && (
        <Modal title="Yangi qarz" onClose={() => setQarzModal(false)}>
          <form action={async (fd) => { await addQarz(fd); setQarzModal(false); }}>
            <Field label="Tur">
              <select name="type" required style={{ ...s.input, appearance: 'none' }}>
                <option value="BERDI">BERDI — biz berdik</option>
                <option value="OLDI">OLDI — biz oldik</option>
              </select>
            </Field>
            <Field label="Kim"><input name="person" type="text" placeholder="Ism yoki kompaniya" required style={s.input} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Summa USD"><input name="amount_usd" type="number" step="0.01" placeholder="0.00" style={s.input} /></Field>
              <Field label="Summa UZS"><input name="amount_uzs" type="number" placeholder="0" style={s.input} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Sana"><input name="date" type="date" defaultValue={today} required style={s.input} /></Field>
              <Field label="Muddat"><input name="deadline" type="date" style={s.input} /></Field>
            </div>
            <Field label="Izoh"><input name="note" type="text" placeholder="Ixtiyoriy..." style={s.input} /></Field>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="button" onClick={() => setQarzModal(false)} style={{ ...s.btnSecondary, flex: 1 }}>Bekor</button>
              <button type="submit" style={{ ...s.btnPrimary, flex: 1 }}>Saqlash</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
