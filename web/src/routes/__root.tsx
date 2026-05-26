import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(16px)',
          background: 'rgba(248, 250, 252, 0.92)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: 900 }}>
            DoCoDeGo Survey Builder
          </Link>

          <nav style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/" style={navLinkStyle}>
              Home
            </Link>
            <Link to="/builder" search={{ surveyId: undefined }} style={navLinkStyle}>
              Builder
            </Link>
            <Link to="/dashboard" style={navLinkStyle}>
              Dashboard
            </Link>
            <Link to="/signin" style={navLinkStyle}>
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  )
}

const navLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#1e293b',
  fontWeight: 700,
}
