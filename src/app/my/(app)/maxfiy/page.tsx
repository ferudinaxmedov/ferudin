import { requireHub } from '@/lib/hub/guard';
import { listSecrets } from '@/lib/hub/secrets';
import { SecretsClient } from './SecretsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Maxfiy' };

export default async function SecretsPage() {
  await requireHub();
  return <SecretsClient rows={await listSecrets()} />;
}
