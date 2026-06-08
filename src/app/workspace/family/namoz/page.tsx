export const dynamic = 'force-dynamic';

import { createServiceClient } from '@/lib/supabase';
import { NamozClient } from './NamozClient';

export default async function NamozPage() {
  const sb = createServiceClient();
  const today = new Date();

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekAgoIso = weekAgo.toISOString().split('T')[0];
  const todayIso = today.toISOString().split('T')[0];

  const [timesRes, logRes] = await Promise.all([
    sb.from('family_namoz_times')
      .select('day,bomdod,peshin,asr,shom,xufton')
      .eq('year', today.getFullYear())
      .eq('month', today.getMonth() + 1)
      .order('day'),
    sb.from('family_namoz_log')
      .select('date,owner,bomdod,peshin,asr,shom,xufton')
      .gte('date', weekAgoIso)
      .lte('date', todayIso)
      .order('date', { ascending: false }),
  ]);

  const todayTimes = (timesRes.data ?? []).find(r => r.day === today.getDate()) ?? null;

  return (
    <NamozClient
      todayTimes={todayTimes}
      monthTimes={timesRes.data ?? []}
      weekLog={logRes.data ?? []}
      todayDate={todayIso}
    />
  );
}
