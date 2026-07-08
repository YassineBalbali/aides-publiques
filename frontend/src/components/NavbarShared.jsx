import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { NotificationIcon } from '../pages/Notifications'

export default function NavbarShared() {
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const estConnecte = !!token
  const role = payload?.role
  const nomPlateforme = localStorage.getItem('plateforme_nom') || 'Aides Publiques'
  const logoSauvegarde = localStorage.getItem('plateforme_logo')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: '/', l: 'Accueil' },
    { to: '/catalogue', l: 'Catalogue' },
    ...(estConnecte && role !== 'admin' && role !== 'instructeur'
      ? [{ to: '/deposer', l: 'Déposer' }, { to: '/mon-espace', l: 'Mon espace' }, { to: '/dashboard', l: 'Dashboard' }]
      : []),
    ...(role === 'instructeur'
      ? [{ to: '/instructeur', l: 'Mes dossiers' }, { to: '/instructeur/dashboard', l: 'Dashboard' }]
      : []),
    ...(estConnecte ? [{ to: '/profil', l: 'Profil' }] : []),
  ]

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: scrolled ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: scrolled ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(0,0,0,0.04)',
      boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.07)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          {logoSauvegarde ? (
            <img src={logoSauvegarde} alt="Logo" style={{ width: 34, height: 34, objectFit: 'contain', borderRadius: 9 }} />
          ) : (
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.35)', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 12 }}>AP</span>
            </div>
          )}
          <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', letterSpacing: '-0.01em' }}>{nomPlateforme}</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {links.map(({ to, l }) => (
            <Link key={to} to={to} style={{
              padding: '6px 13px', borderRadius: 8, fontSize: 13.5, fontWeight: isActive(to) ? 600 : 500,
              color: isActive(to) ? '#6366f1' : '#4b5563',
              background: isActive(to) ? '#eef2ff' : 'transparent',
              textDecoration: 'none', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (!isActive(to)) { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827' } }}
              onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4b5563' } }}>
              {l}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {estConnecte ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '5px 12px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
                <span style={{ fontSize: 12.5, color: '#6366f1', fontWeight: 600 }}>{payload?.prenom} {payload?.nom}</span>
              </div>
              <NotificationIcon />
              <button onClick={() => { localStorage.removeItem('token'); navigate('/login') }}
                style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13.5, fontWeight: 500, background: '#fff', border: '1px solid #e5e7eb', color: '#374151', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#fafbff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff' }}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')}
                style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13.5, fontWeight: 500, background: '#fff', border: '1px solid #e5e7eb', color: '#374151', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d2fe' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb' }}>
                Connexion
              </button>
              <button onClick={() => navigate('/register')} className="btn-gradient"
                style={{ padding: '6px 16px', borderRadius: 8, fontSize: 13.5, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                S'inscrire
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
