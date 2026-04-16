'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import type { AlertType, Site } from '@/lib/types'
import { SITE_CONFIG } from '@/lib/types'

const SITES: { key: Site; scrapeNote?: string }[] = [
  { key: 'amul', scrapeNote: 'Stock detection' },
  { key: 'amazon', scrapeNote: 'Price via JSON-LD' },
  { key: 'flipkart', scrapeNote: 'Price via CSS' },
  { key: 'myntra', scrapeNote: 'Price via JSON-LD' },
  { key: 'meesho', scrapeNote: 'Best effort' },
  { key: 'other', scrapeNote: 'Generic scraper' },
]

interface ScrapePreview {
  productName?: string
  price?: number | null
  inStock?: boolean | null
  error?: string
}

export default function NewAlertPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [alertType, setAlertType] = useState<AlertType | ''>('')
  const [site, setSite] = useState<Site | ''>('')
  const [url, setUrl] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [preview, setPreview] = useState<ScrapePreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Auto-detect site from URL
  function detectSite(rawUrl: string): Site | '' {
    const lower = rawUrl.toLowerCase()
    if (lower.includes('amul')) return 'amul'
    if (lower.includes('amazon')) return 'amazon'
    if (lower.includes('flipkart')) return 'flipkart'
    if (lower.includes('myntra')) return 'myntra'
    if (lower.includes('meesho')) return 'meesho'
    return ''
  }

  function handleUrlChange(value: string) {
    setUrl(value)
    if (!site) {
      const detected = detectSite(value)
      if (detected) setSite(detected)
    }
    setPreview(null)
  }

  async function testScrape() {
    if (!url || !site) return
    setPreviewLoading(true)
    setError('')
    try {
      const res = await fetch('/api/scrape/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, site }),
      })
      const data = await res.json()
      setPreview(data)
    } catch {
      setPreview({ error: 'Failed to test URL. Please check the URL and try again.' })
    } finally {
      setPreviewLoading(false)
    }
  }

  async function handleCreate() {
    if (!alertType || !site || !url) return
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          site,
          alert_type: alertType,
          min_price: minPrice ? parseFloat(minPrice) : null,
          max_price: maxPrice ? parseFloat(maxPrice) : null,
          product_name: preview?.productName || null,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to create alert')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (e: any) {
      setError(e.message)
      setSaving(false)
    }
  }

  const canGoNext1 = alertType !== ''
  const canGoNext2 = site !== '' && url.startsWith('http')
  const canSave = canGoNext2 && (alertType === 'stock' || minPrice)

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <div>
            <div className="page-title">New Alert</div>
            <div className="page-subtitle">Set up your tracking conditions</div>
          </div>
        </header>

        <div className="page-body">
          <div className="wizard-wrapper">
            {/* Step Indicators */}
            <div className="wizard-steps">
              {['Alert Type', 'Product URL', 'Condition'].map((label, i) => {
                const num = i + 1
                const isDone = step > num
                const isActive = step === num
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', flex: num < 3 ? 1 : 'unset' }}>
                    <div className="wizard-step-item">
                      <div className={`step-num ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                        {isDone ? '✓' : num}
                      </div>
                      <div className={`step-label ${isActive ? 'active' : ''}`}>{label}</div>
                    </div>
                    {num < 3 && <div className={`step-connector ${isDone ? 'done' : ''}`} />}
                  </div>
                )
              })}
            </div>

            {/* ---- Step 1: Alert Type ---- */}
            {step === 1 && (
              <div className="wizard-card anim-in">
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>What do you want to track?</h2>
                <p style={{ color: 'var(--text-2)', fontSize: 13.5, marginBottom: 24, lineHeight: 1.6 }}>
                  Choose the type of condition you want to be alerted about.
                </p>
                <div className="type-grid">
                  <button
                    id="type-stock"
                    type="button"
                    className={`type-card ${alertType === 'stock' ? 'sel' : ''}`}
                    onClick={() => setAlertType('stock')}
                  >
                    <div className="type-card-glow" />
                    <div className="type-card-icon">📦</div>
                    <div className="type-card-title">Stock Alert</div>
                    <div className="type-card-desc">
                      Get notified when a product comes back in stock. Perfect for Amul protein, limited editions, etc.
                    </div>
                  </button>
                  <button
                    id="type-price"
                    type="button"
                    className={`type-card ${alertType === 'price' ? 'sel' : ''}`}
                    onClick={() => setAlertType('price')}
                  >
                    <div className="type-card-glow" />
                    <div className="type-card-icon">💰</div>
                    <div className="type-card-title">Price Alert</div>
                    <div className="type-card-desc">
                      Get notified when the price drops below your target. Works for Amazon, Flipkart, Myntra and more.
                    </div>
                  </button>
                </div>
                <div className="wizard-actions">
                  <div />
                  <button
                    id="step1-next"
                    className="btn btn-gradient"
                    onClick={() => setStep(2)}
                    disabled={!canGoNext1}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* ---- Step 2: Site + URL ---- */}
            {step === 2 && (
              <div className="wizard-card anim-in">
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Select site & paste URL</h2>
                <p style={{ color: 'var(--text-2)', fontSize: 13.5, marginBottom: 24, lineHeight: 1.6 }}>
                  Select the e-commerce platform and paste the product page URL.
                </p>

                <div className="form-group">
                  <label className="form-label">Platform</label>
                  <div className="site-grid">
                    {SITES.map(s => {
                      const cfg = SITE_CONFIG[s.key]
                      return (
                        <button
                          id={`site-${s.key}`}
                          key={s.key}
                          type="button"
                          className={`site-card ${site === s.key ? 'sel' : ''}`}
                          onClick={() => setSite(s.key)}
                        >
                          <div className="site-card-emoji">{cfg.emoji}</div>
                          <div className="site-card-name">{cfg.label}</div>
                          {s.scrapeNote && (
                            <div className="site-card-badge">{s.scrapeNote}</div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 20 }}>
                  <label className="form-label" htmlFor="product-url">Product URL</label>
                  <input
                    id="product-url"
                    className="input input-lg"
                    type="url"
                    placeholder="https://www.amazon.in/dp/..."
                    value={url}
                    onChange={e => handleUrlChange(e.target.value)}
                  />
                  <div className="form-hint">
                    Paste the full URL including https://
                  </div>
                </div>

                {/* Test Scrape */}
                {url.startsWith('http') && site && (
                  <div style={{ marginTop: 16 }}>
                    <button
                      id="test-scrape-btn"
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={testScrape}
                      disabled={previewLoading}
                    >
                      {previewLoading ? '🔄 Checking...' : '🔍 Test — Preview current value'}
                    </button>

                    {preview && (
                      <div className="scrape-preview" style={{ marginTop: 12 }}>
                        {preview.error ? (
                          <>
                            <div className="scrape-preview-icon">⚠️</div>
                            <div>
                              <div className="scrape-preview-name" style={{ color: 'var(--amber)' }}>Could not fetch</div>
                              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{preview.error}</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="scrape-preview-icon">✅</div>
                            <div>
                              <div className="scrape-preview-name">{preview.productName || 'Product found'}</div>
                              <div className="scrape-preview-price">
                                {preview.price ? `₹${preview.price.toLocaleString('en-IN')}` : ''}
                                {preview.inStock !== null && preview.inStock !== undefined
                                  ? preview.inStock ? ' · In Stock' : ' · Out of Stock'
                                  : ''}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="wizard-actions">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button
                    id="step2-next"
                    className="btn btn-gradient"
                    onClick={() => setStep(3)}
                    disabled={!canGoNext2}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* ---- Step 3: Condition ---- */}
            {step === 3 && (
              <div className="wizard-card anim-in">
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Set your condition</h2>
                <p style={{ color: 'var(--text-2)', fontSize: 13.5, marginBottom: 24, lineHeight: 1.6 }}>
                  {alertType === 'stock'
                    ? "You'll get an email the moment this product comes back in stock."
                    : "You'll get an email when the price drops into your target range."}
                </p>

                {alertType === 'stock' ? (
                  <div style={{
                    background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
                    borderRadius: 'var(--radius-lg)', padding: '20px 22px',
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>📦</div>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Stock Alert Active</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                      Alertify will monitor this URL and send you an email the moment it detects the product is in stock.
                      No additional configuration needed.
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="min-price">
                        Alert me when price drops to or below (₹)
                      </label>
                      <input
                        id="min-price"
                        className="input input-lg"
                        type="number"
                        placeholder="e.g. 1500"
                        value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                        min={1}
                      />
                      <div className="form-hint">
                        Required — you'll get an alert when price ≤ this value
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="max-price">
                        Upper price limit (₹) — Optional
                      </label>
                      <input
                        id="max-price"
                        className="input"
                        type="number"
                        placeholder="e.g. 2000 (leave blank to ignore)"
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        min={1}
                      />
                      <div className="form-hint">
                        Optional — only alert when price is between min and this value
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Preview */}
                <div style={{
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '14px 16px', marginTop: 20,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-3)', marginBottom: 10 }}>
                    Alert Summary
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13.5 }}>
                    <div><span style={{ color: 'var(--text-2)' }}>Site:</span> {SITE_CONFIG[site as Site]?.label || site}</div>
                    <div><span style={{ color: 'var(--text-2)' }}>Type:</span> {alertType === 'stock' ? '📦 Back in Stock' : '💰 Price Drop'}</div>
                    {alertType === 'price' && minPrice && (
                      <div><span style={{ color: 'var(--text-2)' }}>Trigger when price:</span> ≤ ₹{parseFloat(minPrice).toLocaleString('en-IN')}</div>
                    )}
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)', wordBreak: 'break-all', marginTop: 4 }}>
                      {url}
                    </div>
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 'var(--radius)', padding: '10px 14px',
                    color: 'var(--red)', fontSize: 13, marginTop: 16,
                  }}>
                    {error}
                  </div>
                )}

                <div className="wizard-actions">
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                  <button
                    id="create-alert-submit"
                    className="btn btn-gradient btn-lg"
                    onClick={handleCreate}
                    disabled={!canSave || saving}
                  >
                    {saving ? 'Creating...' : '🎯 Create Alert'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
