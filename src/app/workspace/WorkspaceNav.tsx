'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const nav = [
  {
    group: 'Workspace',
    items: [
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
    ],
  },
  {
    group: 'DentaFlow',
    items: [
      {
        href: '/workspace/dentaflow',
        label: 'Dashboard',
        exact: true,
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
          </svg>
        ),
      },
      {
        href: '/workspace/dentaflow/clinics',
        label: 'Klinikalar',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        href: '/workspace/dentaflow/users',
        label: 'Foydalanuvchilar',
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        ),
      },
    ],
  },
];

export function WorkspaceNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 space-y-5 overflow-y-auto">
      {nav.map(group => (
        <div key={group.group}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 12px', marginBottom: '4px' }}>
            {group.group}
          </p>
          <div className="space-y-0.5">
            {group.items.map(item => {
              const active = (item as { exact?: boolean }).exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: '8px', textDecoration: 'none',
                    fontSize: '13px', fontWeight: 500, transition: 'all 0.15s',
                    background: active ? 'rgba(34,197,94,0.1)' : 'transparent',
                    color: active ? '#22c55e' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  <span style={{ color: active ? '#22c55e' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                    {item.icon as ReactNode}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
