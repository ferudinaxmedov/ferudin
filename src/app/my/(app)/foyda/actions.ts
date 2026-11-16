'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';
import { audit, requireHub } from '@/lib/hub/guard';
import { tashkentMonth } from '@/lib/hub/pnl';
import { PROJECTS } from '@/lib/hub/projects';

export async function saveGoal(form: FormData): Promise<{ error?: string }> {
  await requireHub();
  const project = String(form.get('project') ?? '');
  if (!PROJECTS.some((p) => p.key === project)) return { error: 'Noma’lum loyiha' };
  const raw = String(form.get('target') ?? '').replace(/[\s,]/g, '');
  const month = `${tashkentMonth()}-01`;
  const db = createServiceClient();
  if (!raw) {
    await db.from('my_goals').delete().eq('project', project).eq('month', month);
  } else {
    const target = Number(raw);
    if (!Number.isFinite(target) || target <= 0 || target > 1e13) return { error: 'Summa noto‘g‘ri' };
    const { error } = await db.from('my_goals').upsert({ project, month, target }, { onConflict: 'project,month' });
    if (error) return { error: error.message };
  }
  await audit('goal_set', { project, month, target: raw || null });
  revalidatePath('/my', 'layout');
  return {};
}
