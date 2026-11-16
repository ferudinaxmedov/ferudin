'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, CreditCard, GraduationCap, HeartPulse, KeyRound, LayoutGrid, Leaf, MessageCircle, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';

const MAIN = [
  { href: '/my', label: 'Umumiy', icon: LayoutGrid },
  { href: '/my/foyda', label: 'Foyda', icon: TrendingUp },
  { href: '/my/chat', label: 'Claude', icon: MessageCircle },
  { href: '/my/dentaflow', label: 'DentaFlow', icon: Activity },
  { href: '/my/seedbee', label: 'SeedBee', icon: ShoppingBag },
  { href: '/my/skyplus', label: 'SkyPlus', icon: GraduationCap },
  { href: '/my/aiblok', label: 'AI Blok', icon: Sparkles },
  { href: '/my/hongsam', label: 'Hongsam', icon: Leaf },
];

const TOOLS = [
  { href: '/my/holat', label: 'Saytlar holati', icon: HeartPulse },
  { href: '/my/obunalar', label: 'Obunalar', icon: CreditCard },
  { href: '/my/maxfiy', label: 'Maxfiy', icon: KeyRound },
];

export function HubNav() {
  const path = usePathname();
  const active = (href: string) => (href === '/my' ? path === '/my' : path.startsWith(href));
  const link = ({ href, label, icon: Icon }: (typeof MAIN)[number]) => (
    <Link key={href} href={href} className={`nav-link${active(href) ? ' on' : ''}`} aria-current={active(href) ? 'page' : undefined}>
      <Icon size={16} /> {label}
    </Link>
  );
  return (
    <nav className="nav" aria-label="Bo'limlar">
      {MAIN.map(link)}
      <p className="nav-label">Boshqaruv</p>
      {TOOLS.map(link)}
    </nav>
  );
}
