'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="auth-bg">
        <div className="auth-card anim-in" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>📧</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Check your email</h1>
          <p style={{ color: 'var(--text-2)', marginBottom: 28, lineHeight: 1.6 }}>
            We've sent a confirmation link to <strong style={{ color: 'var(--text)' }}>{email}</strong>.
            Click the link to activate your account.
          </p>
          <Link href="/login" className="btn btn-secondary btn-full">← Back to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-bg">
      <div className="auth-card anim-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">🔔</div>
          <div>
            <div className="auth-logo-name">Alertify</div>
          </div>
        </div>

        <h1 className="auth-tagline">Create your account</h1>
        <p className="auth-sub">Free forever. No credit card required.</p>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
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
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="input input-lg"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm password</label>
            <input
              id="reg-confirm"
              className="input input-lg"
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
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
            id="register-submit"
            type="submit"
            className="btn btn-gradient btn-lg btn-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Free Account →'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
