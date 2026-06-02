import type { ReactNode } from 'react';
import Link from 'next/link';
import { logoutAction } from './login/actions';
import { WorkspaceNav } from './WorkspaceNav';
import '../globals.css';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Workspace · Ferudin</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ margin: 0, background: '#080808' }}>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#080808' }}>
          {/* Sidebar */}
          <aside style={{
            width: '224px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            background: '#0d0d0d',
            position: 'sticky',
            top: 0,
            height: '100vh',
            padding: '24px 0',
          }}>
            {/* Brand */}
            <div style={{ padding: '0 20px', marginBottom: '32px' }}>
              <Link href="/workspace/secrets" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="#22c55e" strokeWidth="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: 0, lineHeight: 1 }}>Workspace</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', margin: '3px 0 0 0' }}>ferudin.uz</p>
                </div>
              </Link>
            </div>

            {/* Nav */}
            <WorkspaceNav />

            {/* Logout */}
            <div style={{ padding: '16px 12px 0', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
              <form action={logoutAction}>
                <button
                  type="submit"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '8px', background: 'none', border: 'none',
                    color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '14px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Chiqish
                </button>
              </form>
            </div>
          </aside>

          {/* Main content */}
          <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
