import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, Navigate, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Catalogue from './pages/Catalogue'
import DeposerDossier from './pages/DeposerDossier'
import EspaceAdmin from './pages/EspaceAdmin'
import MonEspace from './pages/MonEspace'
import GestionAides from './pages/GestionAides'
import Dashboard from './pages/Dashboard'
import ChatbotAI from './pages/ChatbotAI'
import Notifications from './pages/Notifications'
import DetailDossier from './pages/DetailDossier.jsx'
import DossierInstructeur from './pages/DetailDossierInstructeur.jsx'
import DashboardDemandeur from './pages/DashboardDemandeur'
import DashboardInstructeur from './pages/DashboardInstructeur'
import EspaceInstructeur from './pages/EspaceInstructeur'
import GestionUtilisateurs from './pages/GestionUtilisateurs'
import AffectationDossiers from './pages/AffectationDossiers'
import Profil from './pages/Profil'
import ProfilAdmin from './pages/ProfilAdmin'
import ParametresPlateforme from './pages/ParametresPlateforme'
import AccueilAdmin from './pages/AccueilAdmin'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import DetailAide from './pages/DetailAide'
import DetailDossierAdmin from './pages/DetailDossierAdmin'

function ProtectedAdmin({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" />
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.role !== 'admin') return <Navigate to="/" />
  } catch { return <Navigate to="/login" /> }
  return children
}

function Navbar() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const estConnecte = !!token
  const estInstructeur = payload?.role === 'instructeur'
  const nomSauvegarde = localStorage.getItem('plateforme_nom') || 'Aides Publiques'
  const logoSauvegarde = localStorage.getItem('plateforme_logo')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToSection = (e) => {
    e.preventDefault()
    document.getElementById('comment-ca-marche')?.scrollIntoView({ behavior: 'smooth' })
  }

  const linkStyle = {
    padding: '7px 14px', borderRadius: 8, fontSize: 14, color: '#374151',
    textDecoration: 'none', fontWeight: 500, transition: 'all 0.2s',
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: scrolled ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: scrolled ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(255,255,255,0.3)',
      boxShadow: scrolled ? '0 4px 28px rgba(0,0,0,0.08)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          {logoSauvegarde ? (
            <img src={logoSauvegarde} alt="Logo" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 10 }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99,102,241,0.4)', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 13 }}>AP</span>
            </div>
          )}
          <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', letterSpacing: '-0.01em' }}>{nomSauvegarde}</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/catalogue" style={linkStyle}
            onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151' }}>
            Catalogue
          </Link>
          {!estConnecte && (
            <a href="#comment-ca-marche" onClick={scrollToSection} style={linkStyle}
              onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151' }}>
              Comment ça marche ?
            </a>
          )}
          {estConnecte && !estInstructeur && payload?.role !== 'admin' && (
            <Link to="/mon-espace" style={linkStyle}
              onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#111827' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151' }}>
              Mon espace
            </Link>
          )}
          {estInstructeur && (
            <>
              <Link to="/instructeur" style={linkStyle}
                onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>Mes dossiers</Link>
              <Link to="/instructeur/dashboard" style={linkStyle}
                onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>Dashboard</Link>
            </>
          )}
          {estConnecte && (
            <Link to="/profil" style={linkStyle}
              onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>Profil</Link>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {estConnecte ? (
            <button onClick={() => { localStorage.removeItem('token'); navigate('/login') }}
              style={{ padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, background: '#fff', border: '1px solid #e5e7eb', color: '#374151', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#fafbff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff' }}>
              Déconnexion
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')}
                style={{ padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, background: '#fff', border: '1px solid #e5e7eb', color: '#374151', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#fafbff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff' }}>
                Connexion
              </button>
              <button onClick={() => navigate('/register')} className="btn-gradient"
                style={{ padding: '8px 20px', borderRadius: 8, fontSize: 14, color: '#fff', border: 'none', fontFamily: 'inherit' }}>
                S'inscrire
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  const navigate = useNavigate()
  const [recherche, setRecherche] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <div style={{ background: '#fafbff' }}>

      {/* ===== DARK HERO ===== */}
      <div className="bg-hero-mesh" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Animated blobs */}
        <div className="anim-blob" style={{ position: 'absolute', top: '8%', left: '3%', width: 480, height: 480, background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)', filter: 'blur(45px)', pointerEvents: 'none', animationDuration: '14s' }} />
        <div className="anim-blob" style={{ position: 'absolute', bottom: '12%', right: '5%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', animationDuration: '19s', animationDelay: '-6s' }} />
        <div className="anim-blob" style={{ position: 'absolute', top: '55%', left: '45%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', filter: 'blur(35px)', pointerEvents: 'none', animationDuration: '24s', animationDelay: '-11s' }} />

        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px 80px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 760 }}>

            {/* Badge */}
            <div className="anim-fadeInUp" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, padding: '6px 18px', marginBottom: 36 }}>
              <span style={{ width: 7, height: 7, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px rgba(34,197,94,0.8)', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', fontWeight: 500 }}>Plateforme officielle des aides publiques</span>
            </div>

            {/* Heading */}
            <h1 className="anim-fadeInUp d2" style={{ fontSize: 58, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em' }}>
              Trouvez les aides publiques<br />
              <span className="text-gradient">auxquelles vous avez droit</span>
            </h1>

            {/* Subtitle */}
            <p className="anim-fadeInUp d3" style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 44, maxWidth: 580, margin: '0 auto 44px' }}>
              Recherchez, consultez et déposez vos demandes d'aides publiques en quelques clics.
            </p>

            {/* Search bar */}
            <div className="anim-fadeInUp d4" style={{ display: 'flex', maxWidth: 600, margin: '0 auto 52px', borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: searchFocused ? '1px solid rgba(99,102,241,0.7)' : '1px solid rgba(255,255,255,0.18)', boxShadow: searchFocused ? '0 0 0 3px rgba(99,102,241,0.25), 0 20px 60px rgba(0,0,0,0.35)' : '0 20px 60px rgba(0,0,0,0.3)', transition: 'all 0.25s' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <input
                type="text" value={recherche}
                onChange={e => setRecherche(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={e => e.key === 'Enter' && (recherche.trim() ? navigate(`/catalogue?q=${encodeURIComponent(recherche)}`) : navigate('/catalogue'))}
                placeholder="Rechercher une aide (rénovation, bourse, emploi...)"
                className="input-dark"
                style={{ flex: 1, padding: '16px 0', border: 'none', outline: 'none', fontSize: 14, background: 'transparent', fontFamily: 'inherit' }}
              />
              <button onClick={() => recherche.trim() ? navigate(`/catalogue?q=${encodeURIComponent(recherche)}`) : navigate('/catalogue')}
                className="btn-gradient"
                style={{ padding: '14px 28px', fontSize: 14, borderRadius: 0, fontFamily: 'inherit', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Rechercher
              </button>
            </div>

            {/* Stat pills */}
            <div className="anim-fadeInUp d5" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { val: '127', label: 'Aides actives' },
                { val: '3 240', label: 'Bénéficiaires' },
                { val: '8 500+', label: 'Dossiers traités' },
                { val: '45', label: 'Partenaires' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, padding: '8px 20px' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{s.val}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="anim-float" style={{ textAlign: 'center', paddingBottom: 48, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 500 }}>
            <span>Découvrir</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <div style={{ background: '#fff', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: '#eef2ff', borderRadius: 100, padding: '4px 14px', marginBottom: 16, border: '1px solid #e0e7ff' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fonctionnalités</span>
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 14 }}>Une plateforme complète</h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 500, margin: '0 auto' }}>Simplifiez vos démarches administratives grâce à des outils pensés pour vous.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {[
              { icon: '📚', titre: 'Catalogue complet', desc: 'Consultez toutes les aides disponibles avec filtres avancés par type, secteur et territoire.', color: '#6366f1' },
              { icon: '📝', titre: 'Dépôt simplifié', desc: 'Formulaire adapté à chaque aide avec upload de documents et validation automatique.', color: '#8b5cf6' },
              { icon: '🔔', titre: 'Suivi temps réel', desc: 'Notifications à chaque étape et messagerie directe avec votre instructeur.', color: '#06b6d4' },
              { icon: '🔒', titre: 'Sécurisé & conforme', desc: 'Authentification JWT, données chiffrées, conforme RGPD.', color: '#10b981' },
            ].map((f, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e8ecf4', borderRadius: 16, padding: '28px 24px', cursor: 'default', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#fafbff'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8ecf4'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 10 }}>{f.titre}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== HOW IT WORKS ===== */}
      <div id="comment-ca-marche" style={{ background: '#fafbff', padding: '96px 24px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: '#eef2ff', borderRadius: 100, padding: '4px 14px', marginBottom: 16, border: '1px solid #e0e7ff' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Processus</span>
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>Comment ça marche ?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 26, left: '12.5%', right: '12.5%', height: 1, background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)', opacity: 0.25 }} />
            {[
              { n: '01', t: 'Explorez', d: "Parcourez le catalogue et trouvez l'aide adaptée à votre profil.", icon: '🔍' },
              { n: '02', t: 'Préparez', d: 'Remplissez le formulaire et joignez vos pièces justificatives.', icon: '📋' },
              { n: '03', t: 'Déposez', d: 'Soumettez votre dossier et recevez un numéro de suivi.', icon: '📤' },
              { n: '04', t: 'Suivez', d: "Consultez l'état de votre dossier et échangez avec l'instructeur.", icon: '📊' },
            ].map((e, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(99,102,241,0.3)', position: 'relative', zIndex: 1 }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{e.n}</span>
                </div>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{e.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 8 }}>{e.t}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>{e.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CTA ===== */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #0e7490 100%)', padding: '96px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div style={{ maxWidth: 540, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16 }}>Prêt à démarrer ?</h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.72)', marginBottom: 36, lineHeight: 1.6 }}>Créez votre compte gratuitement et accédez à toutes les aides disponibles.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')}
              style={{ padding: '13px 30px', borderRadius: 10, fontWeight: 700, fontSize: 15, background: '#fff', color: '#4f46e5', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', transition: 'all 0.25s', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}>
              Créer un compte
            </button>
            <button onClick={() => navigate('/catalogue')}
              style={{ padding: '13px 30px', borderRadius: 10, fontWeight: 600, fontSize: 15, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.25s', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}>
              Voir les aides →
            </button>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: '#080612', padding: '56px 24px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 12 }}>AP</span>
                </div>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Aides Publiques</span>
              </div>
              <p style={{ fontSize: 13, color: '#4b5567', lineHeight: 1.7, maxWidth: 260 }}>Plateforme officielle de gestion et suivi des dossiers d'aides publiques.</p>
            </div>
            {[
              { title: 'Navigation', links: [{ to: '/catalogue', label: 'Catalogue' }, { to: '/deposer', label: 'Déposer' }, { to: '/mon-espace', label: 'Mon espace' }] },
              { title: 'Légal', links: [{ to: '#', label: 'Mentions légales' }, { to: '#', label: 'Confidentialité' }, { to: '#', label: 'Accessibilité' }] },
              { title: 'Contact', links: [{ to: '#', label: 'contact@aides-publiques.fr' }, { to: '#', label: '01 23 45 67 89' }] },
            ].map((col, i) => (
              <div key={i}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>{col.title}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map((l, j) => (
                    <Link key={j} to={l.to} style={{ fontSize: 13, color: '#4b5567', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#818cf8'}
                      onMouseLeave={e => e.currentTarget.style.color = '#4b5567'}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #111827', paddingTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#374151' }}>© 2026 Plateforme Aides Publiques — Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function AccueilRoute() {
  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  if (payload?.role === 'admin') return <AccueilAdmin />
  return <><Navbar /><Hero /></>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AccueilRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/catalogue/:id" element={<DetailAide />} />
        <Route path="/aides" element={<Navigate to="/catalogue" replace />} />
        <Route path="/deposer" element={<DeposerDossier />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/admin/profil" element={<ProtectedAdmin><ProfilAdmin /></ProtectedAdmin>} />
        <Route path="/mon-espace" element={<MonEspace />} />
        <Route path="/mon-espace/dossier/:id" element={<DetailDossier />} />
        <Route path="/dashboard" element={<DashboardDemandeur />} />
        <Route path="/mon-espace/dashboard" element={<DashboardDemandeur />} />
        <Route path="/instructeur" element={<EspaceInstructeur />} />
        <Route path="/instructeur/dashboard" element={<DashboardInstructeur />} />
        <Route path="/instructeur/dossier/:id" element={<DossierInstructeur />} />

        <Route path="/admin" element={<ProtectedAdmin><AccueilAdmin /></ProtectedAdmin>} />
        <Route path="/admin/dossiers" element={<ProtectedAdmin><EspaceAdmin /></ProtectedAdmin>} />
        <Route path="/admin/dossier/:id" element={<ProtectedAdmin><DetailDossierAdmin /></ProtectedAdmin>} />
        <Route path="/admin/aides" element={<ProtectedAdmin><GestionAides /></ProtectedAdmin>} />
        <Route path="/admin/utilisateurs" element={<ProtectedAdmin><GestionUtilisateurs /></ProtectedAdmin>} />
        <Route path="/admin/affectations" element={<ProtectedAdmin><AffectationDossiers /></ProtectedAdmin>} />
        <Route path="/admin/dashboard" element={<ProtectedAdmin><Dashboard /></ProtectedAdmin>} />
        <Route path="/admin/parametres" element={<ProtectedAdmin><ParametresPlateforme /></ProtectedAdmin>} />
      </Routes>
      <ChatbotAI />
      <Notifications />
    </BrowserRouter>
  )
}

export default App
