import { createServiceClient } from '@/lib/supabase';
import { SecretsPageClient } from './SecretsClient';

export default async function SecretsPage() {
  const supabase = createServiceClient();
  const { data: secrets } = await supabase
    .from('ws_secrets')
    .select('*')
    .order('category')
    .order('title');

  return <SecretsPageClient secrets={secrets ?? []} />;
}
