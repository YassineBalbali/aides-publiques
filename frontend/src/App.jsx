import { useState } from 'react'
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
  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const estConnecte = !!token
  const estInstructeur = payload?.role === 'instructeur'
  const nomSauvegarde = localStorage.getItem('plateforme_nom') || 'Aides Publiques'
  const logoSauvegarde = localStorage.getItem('plateforme_logo')

  const scrollToSection = (e) => {
    e.preventDefault()
    document.getElementById('comment-ca-marche')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          {logoSauvegarde ? (
            <img src={logoSauvegarde} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 8 }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>AP</span>
            </div>
          )}
          <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>{nomSauvegarde}</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link to="/catalogue" style={{ padding: '6px 14px', borderRadius: 6, fontSize: 14, color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => e.target.style.background = '#f3f4f6'}
            onMouseLeave={e => e.target.style.background = 'none'}>
            Catalogue
          </Link>
          {!estConnecte && (
            <a href="#comment-ca-marche" onClick={scrollToSection}
              style={{ padding: '6px 14px', borderRadius: 6, fontSize: 14, color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>
              Comment ça marche ?
            </a>
          )}
          {estConnecte && !estInstructeur && payload?.role !== 'admin' && (
            <Link to="/mon-espace" style={{ padding: '6px 14px', borderRadius: 6, fontSize: 14, color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>
              Mon espace
            </Link>
          )}
          {estInstructeur && (
            <>
              <Link to="/instructeur" style={{ padding: '6px 14px', borderRadius: 6, fontSize: 14, color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>Mes dossiers</Link>
              <Link to="/instructeur/dashboard" style={{ padding: '6px 14px', borderRadius: 6, fontSize: 14, color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
            </>
          )}
          {estConnecte && (
            <Link to="/profil" style={{ padding: '6px 14px', borderRadius: 6, fontSize: 14, color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>Profil</Link>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {estConnecte ? (
            <button onClick={() => { localStorage.removeItem('token'); navigate('/login') }}
              style={{ padding: '7px 16px', borderRadius: 6, fontSize: 14, fontWeight: 500, background: '#fff', border: '1px solid #e5e7eb', color: '#374151', cursor: 'pointer' }}>
              Déconnexion
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')}
                style={{ padding: '7px 16px', borderRadius: 6, fontSize: 14, fontWeight: 500, background: '#fff', border: '1px solid #e5e7eb', color: '#374151', cursor: 'pointer' }}>
                Connexion
              </button>
              <button onClick={() => navigate('/register')}
                style={{ padding: '7px 16px', borderRadius: 6, fontSize: 14, fontWeight: 600, background: '#2563eb', border: 'none', color: '#fff', cursor: 'pointer' }}>
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

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '80px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1600&q=80&auto=format)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.08 }}></div>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 100, padding: '4px 14px', marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb' }}></div>
            <span style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 500 }}>Plateforme officielle des aides publiques</span>
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 700, color: '#111827', lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Trouvez les aides publiques<br />
            <span style={{ color: '#2563eb' }}>auxquelles vous avez droit</span>
          </h1>
          <p style={{ fontSize: 18, color: '#6b7280', lineHeight: 1.6, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
            Recherchez, consultez et déposez vos demandes d'aides publiques en quelques clics.
          </p>
          <div style={{ display: 'flex', gap: 0, maxWidth: 560, margin: '0 auto', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <input type="text" value={recherche} onChange={e => setRecherche(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (recherche.trim() ? navigate(`/catalogue?q=${encodeURIComponent(recherche)}`) : navigate('/catalogue'))}
              placeholder="Rechercher une aide (rénovation, bourse, emploi...)"
              style={{ flex: 1, padding: '12px 16px', border: 'none', outline: 'none', fontSize: 14, color: '#111827', background: 'transparent' }} />
            <button onClick={() => recherche.trim() ? navigate(`/catalogue?q=${encodeURIComponent(recherche)}`) : navigate('/catalogue')}
              style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
          {[
            { val: '127', label: 'Aides disponibles' },
            { val: '3 240', label: 'Bénéficiaires' },
            { val: '8 500+', label: 'Dossiers traités' },
            { val: '45', label: 'Partenaires' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '8px 0', borderRight: i < 3 ? '1px solid #e5e7eb' : 'none' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb', letterSpacing: '-0.02em' }}>{s.val}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '72px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Fonctionnalités</p>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 12 }}>Une plateforme complète</h2>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto' }}>Simplifiez vos démarches administratives grâce à des outils pensés pour vous.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[
            { icon: '📚', titre: 'Catalogue', desc: "Consultez toutes les aides disponibles avec filtres avancés par type, secteur et territoire." },
            { icon: '📝', titre: 'Dépôt simplifié', desc: "Formulaire adapté à chaque aide avec upload de documents et validation automatique." },
            { icon: '🔔', titre: 'Suivi temps réel', desc: "Notifications à chaque étape et messagerie directe avec votre instructeur." },
            { icon: '🔒', titre: 'Sécurisé', desc: "Authentification JWT, données chiffrées, conforme RGPD." },
          ].map((f, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '24px 20px' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#bfdbfe'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 8 }}>{f.titre}</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div id="comment-ca-marche" style={{ background: '#fff', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '72px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Processus</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Comment ça marche ?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32, position: 'relative' }}>
            {[
              { n: '01', t: 'Explorez', d: "Parcourez le catalogue et trouvez l'aide adaptée à votre profil." },
              { n: '02', t: 'Préparez', d: 'Remplissez le formulaire et joignez vos pièces justificatives.' },
              { n: '03', t: 'Déposez', d: 'Soumettez votre dossier et recevez un numéro de suivi.' },
              { n: '04', t: 'Suivez', d: "Consultez l'état de votre dossier et échangez avec l'instructeur." },
            ].map((e, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 700, fontSize: 15, color: '#2563eb' }}>
                  {e.n}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 8 }}>{e.t}</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{e.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 12 }}>Prêt à démarrer ?</h2>
          <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 32 }}>Créez votre compte gratuitement et accédez à toutes les aides disponibles.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate('/register')}
              style={{ padding: '12px 28px', borderRadius: 8, fontWeight: 600, fontSize: 15, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Créer un compte
            </button>
            <button onClick={() => navigate('/catalogue')}
              style={{ padding: '12px 28px', borderRadius: 8, fontWeight: 600, fontSize: 15, background: '#fff', color: '#374151', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
              Voir les aides
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#111827', padding: '48px 24px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 11 }}>AP</span>
                </div>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Aides Publiques</span>
              </div>
              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>Plateforme officielle de gestion et suivi des dossiers d'aides publiques.</p>
            </div>
            {[
              { title: 'Navigation', links: [{ to: '/catalogue', label: 'Catalogue' }, { to: '/deposer', label: 'Déposer' }, { to: '/mon-espace', label: 'Mon espace' }] },
              { title: 'Légal', links: [{ to: '#', label: 'Mentions légales' }, { to: '#', label: 'Confidentialité' }, { to: '#', label: 'Accessibilité' }] },
              { title: 'Contact', links: [{ to: '#', label: 'contact@aides-publiques.fr' }, { to: '#', label: '01 23 45 67 89' }] },
            ].map((col, i) => (
              <div key={i}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{col.title}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {col.links.map((l, j) => (
                    <Link key={j} to={l.to} style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none' }}>{l.label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #1f2937', paddingTop: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#4b5563' }}>© 2026 Plateforme Aides Publiques — Tous droits réservés</p>
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

        {/* ✅ Admin routes */}
        <Route path="/admin" element={<ProtectedAdmin><AccueilAdmin /></ProtectedAdmin>} />
        <Route path="/admin/dossiers" element={<ProtectedAdmin><EspaceAdmin /></ProtectedAdmin>} />
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