'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(_: unknown, formData: FormData) {
  const password = formData.get('password') as string;

  if (!password || password !== process.env.WORKSPACE_PASSWORD) {
    return { error: 'Noto\'g\'ri parol' };
  }

  const jar = await cookies();
  jar.set('ws_session', process.env.WORKSPACE_SESSION_TOKEN!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  redirect('/workspace/secrets');
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete('ws_session');
  redirect('/workspace/login');
}
