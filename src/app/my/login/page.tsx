import { LoginClient } from './LoginClient';

export const metadata = { title: 'Kirish' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  return <LoginClient from={from ?? '/my'} />;
}
