'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const navItems = [
  { href: '/', label: 'Overview', icon: 'O' },
  { href: '/analytics', label: 'Analytics', icon: 'A' },
  { href: '/content', label: 'Content', icon: 'C' },
  { href: '/calendar', label: 'Calendar', icon: 'D' },
  { href: '/reports', label: 'Reports', icon: 'R' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="ZPF home">
          <span className="brand-mark">.5</span>
          <span>Zero Point Five<small>Command Center</small></span>
        </Link>

        <nav>
          {navItems.map((item) => (
            <Link className={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) ? 'active' : ''} href={item.href} key={item.href}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <Link href="/settings"><span className="nav-icon">S</span>Settings</Link>
          <div className="profile">
            <span className="avatar">F</span>
            <span>Founder<small>Owner</small></span>
            <b>...</b>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <Link className="mobile-brand" href="/" aria-label="Home">.5</Link>
          <div className="scope"><span className="status-dot" />All channels <b>v</b></div>
          <div className="top-actions">
            <span className="local-badge">Local workspace</span>
            <Link className="primary-button" href="/content/new">+ Create content</Link>
          </div>
        </header>
        {children}
      </section>
    </main>
  )
}
