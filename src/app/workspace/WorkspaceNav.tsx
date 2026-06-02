'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const nav = [
  {
    href: '/workspace/secrets',
    label: 'Secrets',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/workspace/resources',
    label: 'Resources',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16M4 10h16M4 14h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="19" cy="17" r="3" stroke="currentColor" strokeWidth="1.7" />
        <path d="M21.5 19.5l1.5 1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/workspace/accounting',
    label: 'Accounting',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function WorkspaceNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 space-y-1">
      {nav.map(item => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: active ? 'rgba(34,197,94,0.1)' : 'transparent',
              color: active ? '#22c55e' : 'rgba(255,255,255,0.45)',
            }}
          >
            <span style={{ color: active ? '#22c55e' : 'rgba(255,255,255,0.3)' }}>
              {item.icon as ReactNode}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
