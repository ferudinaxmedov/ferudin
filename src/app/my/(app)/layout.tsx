import { requireHub } from '@/lib/hub/guard';
import { logout } from '../login/actions';
import { HubNav } from './HubNav';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

export default async function HubAppLayout({ children }: { children: React.ReactNode }) {
  await requireHub();
  return (
    <div className="shell">
      <aside className="side">
        <Link href="/my" className="brand">
          <span className="brand-dot" aria-hidden />
          <span>
            <b>my.ferudin</b>
            <small>boshqaruv markazi</small>
          </span>
        </Link>
        <HubNav />
        <div className="side-foot">
          <div className="me">
            <b>Ferudin Ahmedov</b>
            <small>egasi · 2FA yoqilgan</small>
          </div>
          <form action={logout}>
            <button className="icon-btn" aria-label="Chiqish" title="Chiqish"><LogOut size={16} /></button>
          </form>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
