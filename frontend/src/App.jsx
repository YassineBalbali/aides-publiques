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
    <nav style={{backgroundColor: '#1a2744'}} className="px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-white font-bold text-xl">
        <span>🏛️</span>
        <span>AidesPubliques</span>
      </div>
      <div className="flex items-center gap-8 text-white">
        <a href="/aides" className="hover:text-yellow-400 transition-colors">Catalogue</a>
        <a href="/deposer" className="hover:text-yellow-400 transition-colors">Déposer</a>
        {estConnecte && !estAdmin && !estInstructeur && (
          <>
            <a href="/mon-espace" className="hover:text-yellow-400 transition-colors">Mes dossiers</a>
            <a href="/mon-espace/dashboard" className="hover:text-yellow-400 transition-colors">Dashboard</a>
          </>
        )}
        {estInstructeur && (
          <>
            <a href="/instructeur" className="hover:text-yellow-400 transition-colors">Mes dossiers</a>
            <a href="/instructeur/dashboard" className="hover:text-yellow-400 transition-colors">Dashboard</a>
          </>
        )}
        {estAdmin && (
          <>
            <a href="/admin" className="hover:text-yellow-400 transition-colors">Dossiers</a>
            <a href="/admin/aides" className="hover:text-yellow-400 transition-colors">Gestion Aides</a>
            <a href="/admin/utilisateurs" className="hover:text-yellow-400 transition-colors">Utilisateurs</a>
            <a href="/admin/affectations" className="hover:text-yellow-400 transition-colors">Affectations</a>
            <a href="/dashboard" className="hover:text-yellow-400 transition-colors">Dashboard</a>
          </>
        )}
        {estConnecte && (
          <a href="/profil" className="hover:text-yellow-400 transition-colors">👤 Profil</a>
        )}
      </div>
      {estConnecte ? (
        <button
          onClick={() => { localStorage.removeItem('token'); navigate('/') }}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors">
          Se déconnecter
        </button>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-2 rounded-lg transition-colors">
          Se connecter
        </button>
      )}
    </nav>
  )
}

function Hero() {
  const navigate = useNavigate()
  return (
    <div style={{backgroundColor: '#1a2744', minHeight: '90vh'}} className="px-12 py-20 flex flex-col justify-center">
      <div className="inline-flex items-center gap-2 border border-gray-500 rounded-full px-4 py-2 text-white text-sm mb-8 w-fit">
        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
        <span className="font-semibold">Plateforme officielle de gestion des aides</span>
      </div>
      <h1 className="text-6xl font-serif text-white mb-6 leading-tight max-w-3xl">
        Accédez aux aides publiques en toute simplicité
      </h1>
      <p className="text-gray-300 text-lg mb-10 max-w-2xl leading-relaxed">
        Déposez, suivez et gérez vos demandes d'aides publiques depuis une plateforme unique.
        Un catalogue complet pour trouver les dispositifs adaptés à vos besoins.
      </p>
      <div className="flex gap-4 mb-16">
        <button
          onClick={() => navigate('/aides')}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-4 rounded-lg text-lg transition-colors flex items-center gap-2">
          Consulter le catalogue →
        </button>
        <button
          onClick={() => navigate('/deposer')}
          className="border border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 rounded-lg text-lg transition-colors">
          Déposer une demande
        </button>
      </div>
      <div className="flex gap-16 border-t border-gray-600 pt-8">
        <div>
          <div className="text-white text-3xl font-bold">335+</div>
          <div className="text-gray-400 text-sm mt-1">Aides disponibles</div>
        </div>
        <div className="border-l border-gray-600 pl-16">
          <div className="text-white text-3xl font-bold">12 000+</div>
          <div className="text-gray-400 text-sm mt-1">Dossiers traités</div>
        </div>
        <div className="border-l border-gray-600 pl-16">
          <div className="text-white text-3xl font-bold">98%</div>
          <div className="text-gray-400 text-sm mt-1">Taux de satisfaction</div>
        </div>
      </div>
    </div>
  )
}

function TypesAides() {
  return (
    <div className="bg-gray-50 py-24 px-12">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-serif text-gray-900 mb-4">Types d'aides disponibles</h2>
        <p className="text-gray-500 text-lg">Un catalogue riche couvrant tous les dispositifs d'aide publique.</p>
      </div>
      <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
        {[
          { nombre: '150+', titre: 'Subventions', desc: 'Aides financières directes pour vos projets', tags: ['Agriculture', 'Industrie', 'Commerce'], color: 'text-blue-700' },
          { nombre: '80+', titre: 'Prêts bonifiés', desc: 'Prêts à taux réduits pour le développement', tags: ['Innovation', 'Énergie', 'Numérique'], color: 'text-blue-700', featured: true },
          { nombre: '60+', titre: 'Exonérations', desc: 'Allègements fiscaux et charges sociales', tags: ['Emploi', 'Zones franches', 'R&D'], color: 'text-blue-700' },
          { nombre: '45+', titre: 'Formations', desc: "Programmes de formation et d'accompagnement", tags: ['Reconversion', 'Création', 'Export'], color: 'text-blue-700' },
        ].map((type, i) => (
          <div key={i} className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all hover:shadow-md ${type.featured ? 'border-blue-200' : 'border-gray-100'}`}>
            <div className={`text-4xl font-bold ${type.color} mb-2`}>{type.nombre}</div>
            <div className="text-gray-900 font-bold text-lg mb-2">{type.titre}</div>
            <div className="text-gray-500 text-sm mb-4">{type.desc}</div>
            <div className="flex flex-wrap gap-2">
              {type.tags.map((tag, j) => (
                <span key={j} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlateformeComplete() {
  return (
    <div className="bg-white py-24 px-12">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-serif text-gray-900 mb-4">Une plateforme complète</h2>
        <p className="text-gray-500 text-lg">Simplifiez chaque étape, du dépôt de dossier au suivi des décisions.</p>
      </div>
      <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[
          { icon: '📄', titre: 'Catalogue centralisé', desc: 'Retrouvez toutes les aides publiques disponibles en un seul endroit, classées par type et secteur.' },
          { icon: '🔍', titre: 'Recherche intelligente', desc: "Filtrez les aides selon vos critères : type de bénéficiaire, secteur d'activité, territoire." },
          { icon: '👥', titre: 'Espaces dédiés', desc: "Chaque profil dispose d'un espace adapté : demandeur, instructeur ou administrateur." },
          { icon: '⏱️', titre: 'Suivi en temps réel', desc: "Suivez l'avancement de vos dossiers avec un historique complet et des notifications." },
          { icon: '🛡️', titre: 'Sécurité & traçabilité', desc: 'Toutes les décisions sont tracées. Vos données sont protégées et sécurisées.' },
          { icon: '📊', titre: 'Tableaux de bord', desc: "Statistiques et indicateurs clés pour piloter efficacement l'activité." },
        ].map((feature, i) => (
          <div key={i} className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4">
              {feature.icon}
            </div>
            <div className="font-bold text-gray-900 text-lg mb-2">{feature.titre}</div>
            <div className="text-gray-500 text-sm leading-relaxed">{feature.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CommentCaMarche() {
  return (
    <div className="bg-gray-50 py-24 px-12">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-serif text-gray-900 mb-4">Comment ça marche ?</h2>
        <p className="text-gray-500 text-lg">Un processus simple en 4 étapes pour accéder aux aides publiques.</p>
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
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
                {etape.num}
              </span>
            </div>
            <div className="font-bold text-gray-900 text-lg mb-2">{etape.titre}</div>
            <div className="text-gray-500 text-sm leading-relaxed">{etape.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CTA() {
  const navigate = useNavigate()
  return (
    <div>
      <div style={{backgroundColor: '#1a2744'}} className="py-24 px-12 text-center">
        <h2 className="text-4xl font-serif text-white mb-4">Prêt à démarrer ?</h2>
        <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
          Créez votre compte gratuitement et accédez à l'ensemble des aides publiques disponibles.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/register')}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-4 rounded-lg text-lg transition-colors">
            Créer un compte →
          </button>
          <button
            onClick={() => navigate('/aides')}
            className="border border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 rounded-lg text-lg transition-colors">
            En savoir plus
          </button>
        </div>
      </div>
      <footer style={{backgroundColor: '#0f172a'}} className="py-12 px-12">
        <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <span>🏛️</span><span>AidesPubliques</span>
            </div>
            <p className="text-gray-400 text-sm">Plateforme digitale de gestion et suivi des dossiers d'aides publiques.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Liens utiles</h3>
            <div className="flex flex-col gap-2">
              <a href="/aides" className="text-gray-400 hover:text-white text-sm transition-colors">Catalogue des aides</a>
              <a href="/deposer" className="text-gray-400 hover:text-white text-sm transition-colors">Déposer un dossier</a>
              <a href="/mon-espace" className="text-gray-400 hover:text-white text-sm transition-colors">Suivre ma demande</a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Informations</h3>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Mentions légales</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Politique de confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center">
          <p className="text-gray-500 text-sm">© 2026 AidesPubliques. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div>
            <Navbar />
            <Hero />
            <TypesAides />
            <PlateformeComplete />
            <CommentCaMarche />
            <CTA />
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/aides" element={<Catalogue />} />
        <Route path="/deposer" element={<DeposerDossier />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/admin" element={
          <ProtectedAdmin>
            <EspaceAdmin />
          </ProtectedAdmin>
        } />
        <Route path="/admin/aides" element={
          <ProtectedAdmin>
            <GestionAides />
          </ProtectedAdmin>
        } />
        <Route path="/admin/utilisateurs" element={
          <ProtectedAdmin>
            <GestionUtilisateurs />
          </ProtectedAdmin>
        } />
        <Route path="/admin/affectations" element={
          <ProtectedAdmin>
            <AffectationDossiers />
          </ProtectedAdmin>
        } />
        <Route path="/dashboard" element={
          <ProtectedAdmin>
            <Dashboard />
          </ProtectedAdmin>
        } />
        <Route path="/mon-espace" element={<MonEspace />} />
        <Route path="/mon-espace/dashboard" element={<DashboardDemandeur />} />
        <Route path="/instructeur" element={<EspaceInstructeur />} />
        <Route path="/instructeur/dashboard" element={<DashboardInstructeur />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App