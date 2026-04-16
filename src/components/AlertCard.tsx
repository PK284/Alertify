import Link from 'next/link'
import type { Alert } from '@/lib/types'
import { SITE_CONFIG } from '@/lib/types'

interface AlertCardProps {
  alert: Alert
}

function StatusBadge({ status }: { status: Alert['status'] }) {
  const config = {
    active: { cls: 'badge-active', label: 'Active' },
    triggered: { cls: 'badge-triggered', label: 'Triggered' },
    paused: { cls: 'badge-paused', label: 'Paused' },
    error: { cls: 'badge-error', label: 'Error' },
  }
  const c = config[status] || config.active
  return (
    <span className={`badge ${c.cls}`}>
      <span className="badge-dot" />
      {c.label}
    </span>
  )
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

export default function AlertCard({ alert }: AlertCardProps) {
  const site = SITE_CONFIG[alert.site] || SITE_CONFIG.other
  const condition =
    alert.alert_type === 'stock'
      ? 'Back in stock'
      : alert.min_price
      ? `Below ₹${alert.min_price.toLocaleString('en-IN')}`
      : 'Price alert'

  return (
    <Link href={`/alerts/${alert.id}`} style={{ textDecoration: 'none' }}>
      <div className="alert-card">
        <div className="alert-card-left">
          <div className="site-icon" style={{ background: site.color }}>
            {site.emoji}
          </div>
          <div>
            <div className="alert-name">
              {alert.product_name || new URL(alert.url).hostname.replace('www.', '')}
            </div>
            <div className="alert-meta">
              <span>{site.label}</span>
              <span>·</span>
              <span>{condition}</span>
              <span>·</span>
              <span>checked {timeAgo(alert.last_checked_at)}</span>
            </div>
          </div>
        </div>
        <div className="alert-card-right">
          {alert.current_price && alert.alert_type === 'price' && (
            <span className="alert-price">
              ₹{alert.current_price.toLocaleString('en-IN')}
            </span>
          )}
          <StatusBadge status={alert.status} />
        </div>
      </div>
    </Link>
  )
}
