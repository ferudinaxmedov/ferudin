import { createServiceClient } from '@/lib/supabase';
import { AccountingPageClient } from './AccountingClient';

export default async function AccountingPage() {
  const supabase = createServiceClient();
  const { data: transactions } = await supabase
    .from('ws_transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  return <AccountingPageClient transactions={transactions ?? []} />;
}
