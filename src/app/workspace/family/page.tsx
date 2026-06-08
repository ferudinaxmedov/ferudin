export const dynamic = 'force-dynamic';

import { createServiceClient } from '@/lib/supabase';
import { FamilyDashboardClient } from './FamilyDashboardClient';

export default async function FamilyPage() {
  const sb = createServiceClient();
  const today = new Date();

  const [txRes, taskRes, qarzRes, namozRes, recentRes] = await Promise.all([
    sb.from('family_transactions').select('type,amount_usd,amount_uzs'),
    sb.from('family_tasks').select('*', { count: 'exact', head: true }).eq('status', 'FAOL'),
    sb.from('family_qarz').select('*', { count: 'exact', head: true }).eq('status', 'AKTIV'),
    sb.from('family_namoz_times')
      .select('bomdod,peshin,asr,shom,xufton')
      .eq('year', today.getFullYear())
      .eq('month', today.getMonth() + 1)
      .eq('day', today.getDate())
      .maybeSingle(),
    sb.from('family_transactions')
      .select('id,type,date,owner,category,amount_usd,amount_uzs,note')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  let balUsd = 0, balUzs = 0;
  for (const r of txRes.data ?? []) {
    const sign = r.type === 'KIRIM' ? 1 : -1;
    balUsd += sign * (r.amount_usd ?? 0);
    balUzs += sign * (r.amount_uzs ?? 0);
  }

  return (
    <FamilyDashboardClient
      balUsd={Math.round(balUsd * 100) / 100}
      balUzs={Math.round(balUzs)}
      taskCount={taskRes.count ?? 0}
      qarzCount={qarzRes.count ?? 0}
      namozToday={(namozRes.data as Record<string, string> | null) ?? null}
      recent={recentRes.data ?? []}
    />
  );
}
