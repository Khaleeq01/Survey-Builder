import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { login } from '../lib/api'
import { setSession } from '../lib/storage'

export const Route = createFileRoute('/signin')({
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = email.trim()

    if (!trimmed.includes('@')) {
      setError('Enter a valid email address to create your demo account.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await login(trimmed)
      setSession(response.session)
      navigate({ to: '/dashboard' })
    } catch (error_) {
      const message = error_ instanceof Error ? error_.message : 'Could not sign in.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main
      style={{
        minHeight: 'calc(100vh - 72px)',
        padding: '48px 20px',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div
        style={{
          width: 'min(100%, 560px)',
          background: 'white',
          borderRadius: 24,
          padding: 32,
          boxShadow: '0 18px 60px rgba(15, 23, 42, 0.08)',
        }}
      >
        <p style={{ color: '#475569', marginTop: 0 }}>Demo sign-in</p>
        <h1 style={{ marginTop: 8, marginBottom: 12 }}>Create your workspace</h1>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          This demo uses a lightweight email-based login so you can create surveys, brand them, and
          view anonymous responses.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, marginTop: 24 }}>
          <label style={{ display: 'grid', gap: 8, fontWeight: 700 }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              style={{
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                padding: '12px 14px',
                fontSize: 16,
              }}
            />
          </label>

          {error ? <p style={{ color: '#b42318', margin: 0 }}>{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: '#0f172a',
              color: 'white',
              border: 0,
              borderRadius: 999,
              padding: '12px 18px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isSubmitting ? 'Signing in…' : 'Continue'}
          </button>
        </form>
      </div>
    </main>
  )
}
