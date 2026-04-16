import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import AlertCard from '@/components/AlertCard'
import type { Alert, Notification } from '@/lib/types'

export const metadata = {
  title: 'Dashboard — Alertify',
  description: 'Manage and monitor all your price and stock alerts.',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch alerts
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch recent notifications (last 10)
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(10)

  const allAlerts: Alert[] = alerts || []
  const allNotifs: Notification[] = notifications || []

  const activeCount = allAlerts.filter(a => a.status === 'active').length
  const triggeredCount = allAlerts.filter(a => a.status === 'triggered').length
  const totalCount = allAlerts.length

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="app-layout">
      <Sidebar userEmail={user.email} />

      <main className="main-content">
        {/* Page Header */}
        <header className="page-header">
          <div>
            <div className="page-title">Dashboard</div>
            <div className="page-subtitle">Monitor all your alerts in one place</div>
          </div>
          <Link href="/alerts/new" className="btn btn-gradient" id="create-alert-btn">
            ➕ New Alert
          </Link>
        </header>

        <div className="page-body">
          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-card-accent" />
              <div className="stat-label">📋 Total Alerts</div>
              <div className="stat-value">{totalCount}</div>
              <div className="stat-sub">All time</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-accent" />
              <div className="stat-label">🟢 Active</div>
              <div className="stat-value" style={{ color: 'var(--green)' }}>{activeCount}</div>
              <div className="stat-sub">Monitoring now</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-accent" />
              <div className="stat-label">⚡ Triggered</div>
              <div className="stat-value" style={{ color: 'var(--amber)' }}>{triggeredCount}</div>
              <div className="stat-sub">Conditions met</div>
            </div>
          </div>

          {/* Alerts List */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div>
                <div className="card-title">Your Alerts</div>
                <div className="card-sub">{activeCount} active • {totalCount} total</div>
              </div>
              <Link href="/alerts/new" className="btn btn-primary btn-sm">+ New</Link>
            </div>
            <div className="card-body">
              {allAlerts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔔</div>
                  <div className="empty-title">No alerts yet</div>
                  <div className="empty-sub">
                    Create your first alert to start tracking prices and stock levels.
                  </div>
                  <Link href="/alerts/new" className="btn btn-gradient">
                    Create Your First Alert
                  </Link>
                </div>
              ) : (
                <div className="alerts-list">
                  {allAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notification History */}
          {allNotifs.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Recent Notifications</div>
                  <div className="card-sub">Emails sent by Alertify</div>
                </div>
              </div>
              <div className="card-body">
                <div className="notif-list">
                  {allNotifs.map(n => (
                    <div key={n.id} className="notif-row">
                      <span className="notif-icon">📧</span>
                      <div className="notif-info">
                        <div className="notif-subject">
                          Alert triggered — {n.trigger_value || 'Condition met'}
                        </div>
                        <div className="notif-meta">Alert ID: {n.alert_id.slice(0, 8)}...</div>
                      </div>
                      <div className="notif-time">{timeAgo(n.sent_at)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
