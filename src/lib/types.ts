// Shared types for the Alertify app

export type AlertType = 'stock' | 'price'
export type AlertStatus = 'active' | 'triggered' | 'paused' | 'error'
export type Site = 'amul' | 'amazon' | 'flipkart' | 'myntra' | 'meesho' | 'other'

export interface Alert {
  id: string
  user_id: string
  url: string
  site: Site
  alert_type: AlertType
  min_price: number | null
  max_price: number | null
  status: AlertStatus
  product_name: string | null
  product_image: string | null
  current_price: number | null
  last_checked_at: string | null
  created_at: string
}

export interface Notification {
  id: string
  alert_id: string
  user_id: string
  sent_at: string
  trigger_value: string | null
}

export interface ScrapeResult {
  success: boolean
  productName?: string
  price?: number | null
  inStock?: boolean | null
  error?: string
}

export const SITE_CONFIG: Record<Site, { label: string; emoji: string; color: string }> = {
  amul: { label: 'Amul', emoji: '🥛', color: 'rgba(16,185,129,0.1)' },
  amazon: { label: 'Amazon', emoji: '📦', color: 'rgba(245,158,11,0.1)' },
  flipkart: { label: 'Flipkart', emoji: '⚡', color: 'rgba(59,130,246,0.1)' },
  myntra: { label: 'Myntra', emoji: '👗', color: 'rgba(236,72,153,0.1)' },
  meesho: { label: 'Meesho', emoji: '🛍️', color: 'rgba(139,92,246,0.1)' },
  other: { label: 'Other', emoji: '🌐', color: 'rgba(100,116,139,0.1)' },
}
