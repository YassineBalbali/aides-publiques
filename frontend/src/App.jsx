import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Catalogue from './pages/Catalogue'
import DeposerDossier from './pages/DeposerDossier'
import EspaceAdmin from './pages/EspaceAdmin'
import MonEspace from './pages/MonEspace'
import GestionAides from './pages/GestionAides'
import Dashboard from './pages/Dashboard'
import DashboardDemandeur from './pages/DashboardDemandeur'
import DashboardInstructeur from './pages/DashboardInstructeur'
import EspaceInstructeur from './pages/EspaceInstructeur'
import GestionUtilisateurs from './pages/GestionUtilisateurs'
import AffectationDossiers from './pages/AffectationDossiers'
import Profil from './pages/Profil'
import ParametresPlateforme from './pages/ParametresPlateforme'

function ProtectedAdmin({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" />
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.role !== 'admin') return <Navigate to="/" />
  } catch {
    return <Navigate to="/login" />
  }
  return children
}

function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const estConnecte = !!token
  const estAdmin = payload?.role === 'admin'
  const estInstructeur = payload?.role === 'instructeur'

  return (
    <div>
      {/* Bandeau RF */}
      <div style={{backgroundColor: '#1f2d6e'}} className="px-8 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white font-bold text-sm px-2 py-1">RF</div>
          <div className="text-white text-xs">
            <div className="font-bold">RÉPUBLIQUE FRANÇAISE</div>
            <div className="text-blue-200">Liberté · Égalité · Fraternité</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {estConnecte ? (
            <button
              onClick={() => { localStorage.removeItem('token'); navigate('/') }}
              className="text-white text-sm hover:underline flex items-center gap-1">
              → Se déconnecter
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1 text-white text-sm hover:underline">
                → Connexion
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded transition-colors">
                S'inscrire
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navbar principale */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between shadow-sm">
        <a href="/" className="text-blue-900 font-bold text-xl">Aides Publiques</a>
        <div className="flex items-center gap-8 text-sm">
          <a href="/" className="text-blue-900 font-semibold border-b-2 border-blue-900 pb-1">Accueil</a>
          <a href="/aides" className="text-gray-700 hover:text-blue-900 transition-colors">Catalogue des aides</a>
          <a href="/deposer" className="text-gray-700 hover:text-blue-900 transition-colors">Déposer un dossier</a>
          {estConnecte && !estAdmin && !estInstructeur && (
            <>
            <a href="/mon-espace" className="text-gray-700 hover:text-blue-900 transition-colors">Mes dossiers</a>
            <a href="/mon-espace/dashboard" className="text-gray-700 hover:text-blue-900 transition-colors">Dashboard</a>
            </>
)}
          {estInstructeur && (
            <>
              <a href="/instructeur" className="text-gray-700 hover:text-blue-900 transition-colors">Mes dossiers</a>
              <a href="/instructeur/dashboard" className="text-gray-700 hover:text-blue-900 transition-colors">Dashboard</a>
            </>
          )}
          {estAdmin && (
            <>
              <a href="/admin" className="text-gray-700 hover:text-blue-900 transition-colors">Dossiers</a>
              <a href="/admin/aides" className="text-gray-700 hover:text-blue-900 transition-colors">Aides</a>
              <a href="/admin/utilisateurs" className="text-gray-700 hover:text-blue-900 transition-colors">Utilisateurs</a>
              <a href="/admin/affectations" className="text-gray-700 hover:text-blue-900 transition-colors">Affectations</a>
              <a href="/dashboard" className="text-gray-700 hover:text-blue-900 transition-colors">Dashboard</a>
              <a href="/admin/parametres" className="text-gray-700 hover:text-blue-900 transition-colors">Paramètres</a>
            </>
          )}
          {estConnecte && (
            <a href="/profil" className="text-gray-700 hover:text-blue-900 transition-colors">👤 Profil</a>
          )}
        </div>
      </div>
    </div>
  )
}

function Hero() {
  const navigate = useNavigate()
  return (
    <div>
      {/* Hero */}
      <div style={{backgroundColor: '#1f2d6e'}} className="px-12 py-16">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Trouvez et demandez vos aides publiques en toute simplicité
          </h1>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            La plateforme dématérialisée pour consulter le catalogue des aides, déposer vos demandes et suivre l'instruction de vos dossiers.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/aides')}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded transition-colors flex items-center gap-2">
              🔍 Explorer les aides
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-white hover:bg-gray-100 text-blue-900 font-semibold px-6 py-3 rounded transition-colors">
              Créer un compte
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white py-10 px-12 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
          {[
            { valeur: '1 250+', label: 'Aides référencées' },
            { valeur: '8 400+', label: 'Dossiers traités' },
            { valeur: '15', label: 'Organismes partenaires' },
            { valeur: '98%', label: 'Taux de satisfaction' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-blue-900 mb-1">{stat.valeur}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plateforme complète */}
      <div className="bg-gray-50 py-20 px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Une plateforme complète</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Simplifiez vos démarches administratives grâce à des outils pensés pour les usagers et les agents publics.</p>
        </div>
        <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { icon: '🔍', titre: 'Catalogue des aides', desc: "Consultez l'ensemble des aides publiques disponibles, filtrez par type, secteur et territoire." },
            { icon: '📄', titre: 'Dépôt simplifié', desc: "Déposez vos demandes en ligne avec un formulaire adapté à chaque type d'aide." },
            { icon: '📊', titre: 'Suivi en temps réel', desc: "Suivez l'avancement de vos dossiers et recevez des notifications à chaque étape." },
            { icon: '🛡️', titre: 'Instruction sécurisée', desc: 'Workflow d\'instruction structuré avec traçabilité complète des décisions.' },
          ].map((feature, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4 mx-auto">
                {feature.icon}
              </div>
              <div className="font-bold text-gray-900 text-lg mb-2">{feature.titre}</div>
              <div className="text-gray-500 text-sm leading-relaxed">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Comment ça marche */}
      <div className="bg-white py-20 px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Comment ça marche ?</h2>
          <p className="text-gray-500">Un processus simple en 4 étapes pour accéder aux aides publiques.</p>
        </div>
        <div className="grid grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { num: '01', icon: '🔍', titre: 'Explorez le catalogue', desc: 'Parcourez les aides disponibles et identifiez celles qui correspondent à votre profil.' },
            { num: '02', icon: '📋', titre: 'Préparez votre dossier', desc: 'Remplissez le formulaire adapté et joignez vos pièces justificatives.' },
            { num: '03', icon: '📤', titre: 'Déposez votre demande', desc: 'Soumettez votre dossier en ligne et recevez un numéro de suivi.' },
            { num: '04', icon: '✅', titre: "Suivez l'avancement", desc: "Consultez l'état de votre dossier et échangez avec l'instructeur." },
          ].map((etape, i) => (
            <div key={i} className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-3xl mx-auto">
                  {etape.icon}
                </div>
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
                  {etape.num}
                </span>
              </div>
              <div className="font-bold text-gray-900 text-lg mb-2">{etape.titre}</div>
              <div className="text-gray-500 text-sm leading-relaxed">{etape.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{backgroundColor: '#1f2d6e'}} className="py-16 px-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Prêt à démarrer ?</h2>
        <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
          Créez votre compte gratuitement et accédez à l'ensemble des aides publiques disponibles.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/register')}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded transition-colors">
            Créer un compte →
          </button>
          <button
            onClick={() => navigate('/aides')}
            className="border border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8 py-3 rounded transition-colors">
            En savoir plus
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 px-12">
        <div className="grid grid-cols-4 gap-8 max-w-6xl mx-auto mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-red-600 text-white font-bold text-sm px-2 py-1">RF</div>
              <span className="font-bold text-gray-900 text-sm">RÉPUBLIQUE FRANÇAISE</span>
            </div>
            <p className="text-gray-500 text-sm">Plateforme de gestion et suivi des aides publiques.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Navigation</h3>
            <div className="flex flex-col gap-2">
              <a href="/aides" className="text-gray-500 hover:text-blue-900 text-sm">Catalogue des aides</a>
              <a href="/deposer" className="text-gray-500 hover:text-blue-900 text-sm">Déposer un dossier</a>
              <a href="/mon-espace" className="text-gray-500 hover:text-blue-900 text-sm">Suivre mon dossier</a>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Espace pro</h3>
            <div className="flex flex-col gap-2">
              <a href="/instructeur" className="text-gray-500 hover:text-blue-900 text-sm">Espace instructeur</a>
              <a href="/admin" className="text-gray-500 hover:text-blue-900 text-sm">Administration</a>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Informations</h3>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-gray-500 hover:text-blue-900 text-sm">Mentions légales</a>
              <a href="#" className="text-gray-500 hover:text-blue-900 text-sm">Politique de confidentialité</a>
              <a href="#" className="text-gray-500 hover:text-blue-900 text-sm">Accessibilité</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-gray-400 text-sm">© 2026 Plateforme Aides Publiques — Tous droits réservés</p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div><Navbar /><Hero /></div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/aides" element={<Catalogue />} />
        <Route path="/deposer" element={<DeposerDossier />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/admin" element={<ProtectedAdmin><EspaceAdmin /></ProtectedAdmin>} />
        <Route path="/admin/aides" element={<ProtectedAdmin><GestionAides /></ProtectedAdmin>} />
        <Route path="/admin/utilisateurs" element={<ProtectedAdmin><GestionUtilisateurs /></ProtectedAdmin>} />
        <Route path="/admin/affectations" element={<ProtectedAdmin><AffectationDossiers /></ProtectedAdmin>} />
        <Route path="/dashboard" element={<ProtectedAdmin><Dashboard /></ProtectedAdmin>} />
        <Route path="/mon-espace" element={<MonEspace />} />
        <Route path="/mon-espace/dashboard" element={<DashboardDemandeur />} />
        <Route path="/instructeur" element={<EspaceInstructeur />} />
        <Route path="/instructeur/dashboard" element={<DashboardInstructeur />} />
        <Route path="/admin/parametres" element={<ProtectedAdmin><ParametresPlateforme /></ProtectedAdmin>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
