import { createServiceClient } from '@/lib/supabase';
import { UsersClient } from './UsersClient';

export default async function UsersPage() {
  const sb = createServiceClient();
  const { data: users } = await sb
    .from('staff_users')
    .select('id,email,full_name,role,is_active,created_at,clinic:clinic_id(name)')
    .order('created_at', { ascending: false });

  return <UsersClient users={(users as any) ?? []} />;
}
