import { createServiceClient } from '@/lib/supabase';
import { ResourcesPageClient } from './ResourcesClient';

export default async function ResourcesPage() {
  const supabase = createServiceClient();
  const { data: resources } = await supabase
    .from('ws_resources')
    .select('*')
    .order('category')
    .order('title');

  return <ResourcesPageClient resources={resources ?? []} />;
}
