'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import type { Alert, Notification } from '@/lib/types'
import { SITE_CONFIG } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AlertDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [alert, setAlert] = useState<Alert | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [error, setError] = useState('')
  const [alertId, setAlertId] = useState('')

  useEffect(() => {
    params.then(p => {
      setAlertId(p.id)
    })
  }, [params])

  useEffect(() => {
    if (!alertId) return
    fetch(`/api/alerts/${alertId}`)
      .then(r => r.json())
      .then(d => {
        setAlert(d.alert)
        setNotifications(d.notifications || [])
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load alert')
        setLoading(false)
      })
  }, [alertId])

  async function updateStatus(status: string) {
    setActionLoading(status)
    await fetch(`/api/alerts/${alertId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await fetch(`/api/alerts/${alertId}`).then(r => r.json())
    setAlert(data.alert)
    setActionLoading('')
  }

  async function handleDelete() {
    if (!confirm('Delete this alert? This cannot be undone.')) return
    setActionLoading('delete')
    await fetch(`/api/alerts/${alertId}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  function timeAgo(dateStr: string | null): string {
    if (!dateStr) return 'Never'
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header"><div className="page-title loading-shimmer" style={{ width: 200, height: 22, borderRadius: 6 }} /></div>
          <div className="page-body">
            {[1, 2].map(i => (
              <div key={i} className="loading-shimmer" style={{ height: 100, borderRadius: 14, marginBottom: 16 }} />
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error || !alert) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-body">
            <div className="empty-state">
              <div className="empty-icon">❌</div>
              <div className="empty-title">Alert not found</div>
              <Link href="/dashboard" className="btn btn-secondary">← Back to Dashboard</Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const site = SITE_CONFIG[alert.site] || SITE_CONFIG.other
  const statusConfig = {
    active: { cls: 'badge-active', label: 'Active' },
    triggered: { cls: 'badge-triggered', label: 'Triggered' },
    paused: { cls: 'badge-paused', label: 'Paused' },
    error: { cls: 'badge-error', label: 'Error' },
  }
  const sc = statusConfig[alert.status] || statusConfig.active

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <div>
            <div className="page-title">Alert Detail</div>
            <div className="page-subtitle">
              <Link href="/dashboard" style={{ color: 'var(--blue)' }}>Dashboard</Link> → {alert.product_name || 'Alert'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {alert.status === 'active' && (
              <button className="btn btn-secondary btn-sm" onClick={() => updateStatus('paused')} disabled={!!actionLoading}>
                {actionLoading === 'paused' ? '...' : '⏸ Pause'}
              </button>
            )}
            {(alert.status === 'paused' || alert.status === 'triggered' || alert.status === 'error') && (
              <button className="btn btn-success btn-sm" onClick={() => updateStatus('active')} disabled={!!actionLoading}>
                {actionLoading === 'active' ? '...' : '▶ Re-arm'}
              </button>
            )}
            <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={!!actionLoading}>
              {actionLoading === 'delete' ? '...' : '🗑 Delete'}
            </button>
          </div>
        </header>

        <div className="page-body">
          {/* Detail Header Card */}
          <div className="detail-header" style={{ marginBottom: 20 }}>
            <div className="detail-site-icon" style={{ background: site.color }}>
              {site.emoji}
            </div>
            <div className="detail-info">
              <div className="detail-name">
                {alert.product_name || `${site.label} Product`}
              </div>
              <div className="detail-url">{alert.url}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`badge ${sc.cls}`}>
                  <span className="badge-dot" /> {sc.label}
                </span>
                <span className="badge badge-blue">
                  {alert.alert_type === 'stock' ? '📦 Stock Alert' : '💰 Price Alert'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  Last checked: {timeAgo(alert.last_checked_at)}
                </span>
              </div>
            </div>
            <a href={alert.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
              View →
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {/* Current Price / Stock */}
            <div className="price-display">
              <div className="price-label">
                {alert.alert_type === 'stock' ? 'Stock Status' : 'Current Price'}
              </div>
              {alert.alert_type === 'stock' ? (
                <div className="price-value" style={{ color: alert.status === 'triggered' ? 'var(--green)' : 'var(--text-2)' }}>
                  {alert.status === 'triggered' ? '✅ In Stock' : '❌ Out of Stock'}
                </div>
              ) : (
                <div className="price-value">
                  {alert.current_price ? `₹${alert.current_price.toLocaleString('en-IN')}` : '—'}
                </div>
              )}
              <div className="price-sub">Updated {timeAgo(alert.last_checked_at)}</div>
            </div>

            {/* Condition */}
            <div className="card" style={{ padding: 24 }}>
              <div className="price-label">Alert Condition</div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 14 }}>
                  <span style={{ color: 'var(--text-2)' }}>Type:</span>{' '}
                  <strong>{alert.alert_type === 'stock' ? 'Back in Stock' : 'Price Drop'}</strong>
                </div>
                {alert.alert_type === 'price' && (
                  <>
                    {alert.min_price && (
                      <div style={{ fontSize: 14 }}>
                        <span style={{ color: 'var(--text-2)' }}>Alert when price ≤</span>{' '}
                        <strong style={{ color: 'var(--blue)' }}>₹{alert.min_price.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    {alert.max_price && (
                      <div style={{ fontSize: 14 }}>
                        <span style={{ color: 'var(--text-2)' }}>Upper limit:</span>{' '}
                        <strong>₹{alert.max_price.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                  </>
                )}
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                  Created {new Date(alert.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          {/* Notification History */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Notification History</div>
              <div className="card-sub">{notifications.length} emails sent</div>
            </div>
            <div className="card-body">
              {notifications.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 24px' }}>
                  <div className="empty-icon" style={{ fontSize: 32 }}>📧</div>
                  <div className="empty-title" style={{ fontSize: 14 }}>No notifications yet</div>
                  <div className="empty-sub" style={{ fontSize: 12.5 }}>
                    You'll receive an email here when this alert triggers.
                  </div>
                </div>
              ) : (
                <div className="notif-list">
                  {notifications.map(n => (
                    <div key={n.id} className="notif-row">
                      <span className="notif-icon">📧</span>
                      <div className="notif-info">
                        <div className="notif-subject">{n.trigger_value || 'Alert triggered'}</div>
                        <div className="notif-meta">Email sent</div>
                      </div>
                      <div className="notif-time">{timeAgo(n.sent_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
