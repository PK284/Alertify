'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card anim-in">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🔔</div>
          <div>
            <div className="auth-logo-name">Alertify</div>
          </div>
        </div>

        <h1 className="auth-tagline">Welcome back</h1>
        <p className="auth-sub">Sign in to manage your price & stock alerts.</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              className="input input-lg"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input input-lg"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={6}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius)', padding: '10px 14px',
              color: 'var(--red)', fontSize: 13, marginBottom: 18,
            }}>
              {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-gradient btn-lg btn-full"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--blue)', fontWeight: 600 }}>
            Create one free
          </Link>
        </div>
      </div>
    </div>
  )
}
