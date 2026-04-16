'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  userEmail?: string
}

const NAV_LINKS = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/alerts/new', icon: '➕', label: 'New Alert' },
]

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = userEmail ? userEmail[0].toUpperCase() : '?'

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">🔔</div>
        <div>
          <div className="brand-name">Alertify</div>
          <div className="brand-tagline">Price & Stock Monitor</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link ${pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href)) ? 'active' : ''}`}
          >
            <span className="nav-link-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-row" onClick={handleSignOut} title="Click to sign out">
          <div className="user-avatar">{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div className="user-email">{userEmail || 'User'}</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>Sign out</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
