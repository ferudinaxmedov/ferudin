export const dynamic = 'force-dynamic';

import { createServiceClient } from '@/lib/supabase';
import { HisobClient } from './HisobClient';

export default async function HisobPage() {
  const sb = createServiceClient();

  const [txRes, qarzRes, catRes] = await Promise.all([
    sb.from('family_transactions')
      .select('id,type,date,owner,category,payment_method,amount_usd,amount_uzs,note,created_at')
      .order('created_at', { ascending: false })
      .limit(200),
    sb.from('family_qarz')
      .select('id,number,type,person,amount_usd,amount_uzs,date,deadline,status,note,returned_date')
      .order('created_at', { ascending: false }),
    sb.from('family_categories').select('kind,name').order('sort_order'),
  ]);

  const txAll = txRes.data ?? [];
  let balUsd = 0, balUzs = 0;
  for (const r of txAll) {
    const sign = r.type === 'KIRIM' ? 1 : -1;
    balUsd += sign * (r.amount_usd ?? 0);
    balUzs += sign * (r.amount_uzs ?? 0);
  }

  const cats = catRes.data ?? [];
  const chiqimCats = cats.filter(c => c.kind === 'chiqim').map(c => c.name);
  const kirimCats = cats.filter(c => c.kind === 'kirim').map(c => c.name);

  return (
    <HisobClient
      transactions={txAll}
      qarzlar={qarzRes.data ?? []}
      balUsd={Math.round(balUsd * 100) / 100}
      balUzs={Math.round(balUzs)}
      chiqimCats={chiqimCats}
      kirimCats={kirimCats}
    />
  );
}
