import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main style={{ padding: '40px 20px 72px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 24 }}>
        <section
          style={{
            background: 'linear-gradient(135deg, #0f172a, #2563eb)',
            color: 'white',
            borderRadius: 30,
            padding: '38px 32px',
          }}
        >
          <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Branded survey builder
          </p>
          <h1 style={{ margin: '12px 0 14px', fontSize: 'clamp(2rem, 3vw, 2.8rem)' }}>
            Create polished surveys, brand them, and share them in minutes.
          </h1>
          <p style={{ margin: 0, maxWidth: 760, lineHeight: 1.7 }}>
            This demo delivers the core flow from the README: sign in, build surveys with multiple
            question types, customize the brand, publish a public URL, and review anonymous
            responses from your dashboard.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <Link
              to="/builder"
              search={{ surveyId: undefined }}
              style={{
                textDecoration: 'none',
                background: 'white',
                color: '#0f172a',
                borderRadius: 999,
                padding: '12px 18px',
                fontWeight: 800,
              }}
            >
              Start building
            </Link>
            <Link
              to="/signin"
              style={{
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.6)',
                color: 'white',
                borderRadius: 999,
                padding: '12px 18px',
                fontWeight: 800,
              }}
            >
              Sign in
            </Link>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 18,
          }}
        >
          {mvpHighlights.map((item) => (
            <article
              key={item.title}
              style={{
                background: 'white',
                borderRadius: 24,
                padding: 22,
                boxShadow: '0 18px 60px rgba(15, 23, 42, 0.08)',
              }}
            >
              <p style={{ fontSize: 28, margin: 0 }}>{item.emoji}</p>
              <h2 style={{ margin: '12px 0 8px' }}>{item.title}</h2>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>{item.description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}

const mvpHighlights = [
  {
    emoji: '🎨',
    title: 'Branding',
    description:
      'Set a primary color and logo URL for each survey so every public page feels on-brand.',
  },
  {
    emoji: '🧱',
    title: 'Builder UI',
    description:
      'Reorder, remove, and add short text, long text, multiple choice, and rating questions.',
  },
  {
    emoji: '🔗',
    title: 'Public share link',
    description: 'Every survey gets a public URL that anyone can open without logging in.',
  },
  {
    emoji: '📊',
    title: 'Response dashboard',
    description: 'Review saved responses in one place and keep your survey program organized.',
  },
]
