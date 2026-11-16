'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, CreditCard, GraduationCap, KeyRound, LayoutGrid, Leaf, ShoppingBag, Sparkles, Wallet, Users } from 'lucide-react';

const MAIN = [
  { href: '/my', label: 'Umumiy', icon: LayoutGrid },
  { href: '/my/dentaflow', label: 'DentaFlow', icon: Activity },
  { href: '/my/seedbee', label: 'SeedBee', icon: ShoppingBag },
  { href: '/my/skyplus', label: 'SkyPlus', icon: GraduationCap },
  { href: '/my/aiblok', label: 'AI Blok', icon: Sparkles },
  { href: '/my/hongsam', label: 'Hongsam', icon: Leaf },
  { href: '/my/obunalar', label: 'Obunalar', icon: CreditCard },
];

// The June workspace pages, now behind the same 2FA session.
const LEGACY = [
  { href: '/workspace/secrets', label: 'Parollar', icon: KeyRound },
  { href: '/workspace/accounting', label: 'Buxgalteriya', icon: Wallet },
  { href: '/workspace/family', label: 'Oila', icon: Users },
];

export function HubNav() {
  const path = usePathname();
  const active = (href: string) => (href === '/my' ? path === '/my' : path.startsWith(href));
  return (
    <nav className="nav" aria-label="Bo'limlar">
      {MAIN.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className={`nav-link${active(href) ? ' on' : ''}`} aria-current={active(href) ? 'page' : undefined}>
          <Icon size={16} /> {label}
        </Link>
      ))}
      <p className="nav-label">Eski workspace</p>
      {LEGACY.map(({ href, label, icon: Icon }) => (
        <a key={href} href={href} className="nav-link">
          <Icon size={16} /> {label}
        </a>
      ))}
    </nav>
  );
}
