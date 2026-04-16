import Link from 'next/link'

export default function LandingPage() {
  return (
    <div>
      {/* ---- Navigation ---- */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-logo">🔔</div>
          <span className="brand-name">Alertify</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link href="/register" className="btn btn-gradient btn-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="landing-hero">
        <div style={{ maxWidth: 760, position: 'relative', zIndex: 1 }}>
          <div className="landing-hero-badge">
            <span>🚀</span> Free forever · No credit card needed
          </div>

          <h1 className="landing-h1">
            Never miss a{' '}
            <span className="gradient-text">price drop</span>{' '}
            or{' '}
            <span className="gradient-text">restock</span>{' '}
            again
          </h1>

          <p className="landing-sub">
            Alertify monitors Amazon, Flipkart, Amul, Myntra and more — and sends you an instant email the moment your condition is met.
          </p>

          <div className="landing-ctas">
            <Link href="/register" className="btn btn-gradient btn-lg">
              Start Tracking for Free →
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, marginTop: 56, flexWrap: 'wrap' }}>
            {[
              { value: '₹0', label: 'Monthly cost' },
              { value: '5+', label: 'Sites supported' },
              { value: '<1hr', label: 'Check interval' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>{s.value}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section style={{ padding: '100px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 className="section-title-lg">Everything you need</h2>
          <p className="section-sub-lg">Set it once. Let Alertify do the work.</p>
        </div>
        <div className="features-grid">
          {[
            { icon: '📦', bg: 'rgba(245,158,11,0.1)', title: "Amazon & Flipkart", desc: "Track price drops across India's biggest e-commerce platforms. Get alerts when prices hit your target." },
            { icon: '🥛', bg: 'rgba(16,185,129,0.1)', title: "Amul Stock Alerts", desc: "Know the instant Amul protein, butter or any product is back in stock before it sells out again." },
            { icon: '👗', bg: 'rgba(236,72,153,0.1)', title: "Myntra & Meesho", desc: "Track fashion deals and wait for the right price. Never overpay for a sale item again." },
            { icon: '📧', bg: 'rgba(59,130,246,0.1)', title: "Instant Email Alerts", desc: "Beautiful email notifications via Resend. Delivered within minutes of a condition being met." },
            { icon: '🛡️', bg: 'rgba(139,92,246,0.1)', title: "Secure by Default", desc: "Supabase Auth + Row-Level Security ensures your alerts are 100% private to you." },
            { icon: '⚡', bg: 'rgba(59,130,246,0.1)', title: "Zero Configuration", desc: "Paste a URL, set a condition, done. No complex setup. Works in under 60 seconds." },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" style={{ background: f.bg }}>
                {f.icon}
              </div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className="how-it-works" style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 className="section-title-lg">How it works</h2>
          <p className="section-sub-lg">Three steps to never-miss-a-deal zen.</p>
        </div>
        <div className="steps-grid">
          {[
            {
              num: '01',
              title: 'Paste your URL',
              desc: 'Copy the product URL from Amazon, Flipkart, Amul, Myntra or any supported site and paste it into Alertify.',
            },
            {
              num: '02',
              title: 'Set your condition',
              desc: 'Choose "stock alert" to know when it\'s available, or "price alert" with a target price range.',
            },
            {
              num: '03',
              title: 'Get your email',
              desc: 'Alertify checks every hour. The moment your condition is met, you get an email with a direct buy link.',
            },
          ].map(s => (
            <div key={s.num} className="how-step">
              <div className="how-step-num">{s.num}</div>
              <div className="how-step-title">{s.title}</div>
              <div className="how-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA Footer ---- */}
      <section style={{
        padding: '80px 48px', textAlign: 'center',
        borderTop: '1px solid var(--border)',
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 70%)',
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, marginBottom: 12 }}>
          Start tracking. It&apos;s free.
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-2)', marginBottom: 36 }}>
          Join and start saving money today.
        </p>
        <Link href="/register" className="btn btn-gradient btn-lg">
          Create Free Account →
        </Link>
        <div style={{ marginTop: 40, fontSize: 12, color: 'var(--text-3)' }}>
          © {new Date().getFullYear()} Alertify · Built with ❤️ · 100% free
        </div>
      </section>
    </div>
  )
}
