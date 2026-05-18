import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { NotificationIcon } from './Notifications'

const STATUT = {
  brouillon: { label: 'Brouillon', cls: 'bg-gray-100 text-gray-500 border border-gray-200' },
  depose: { label: 'Déposé', cls: 'bg-blue-50 text-blue-700 border border-blue-100' },
  en_instruction: { label: 'En instruction', cls: 'bg-amber-50 text-amber-700 border border-amber-100' },
  accepte: { label: 'Accepté', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  refuse: { label: 'Refusé', cls: 'bg-red-50 text-red-600 border border-red-100' },
}

function Navbar({ prenom, nom }) {
  const navigate = useNavigate()
  const nomPlateforme = localStorage.getItem('plateforme_nom') || 'Aides Publiques'
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-white font-bold text-xs">AP</span></div>
          <span className="font-bold text-gray-900 text-sm">{nomPlateforme}</span>
        </Link>
        <div className="flex items-center gap-0.5">
          {[{ to: '/', l: 'Accueil' }, { to: '/catalogue', l: 'Catalogue' }, { to: '/deposer', l: 'Déposer' }, { to: '/mon-espace', l: 'Mon espace' }, { to: '/profil', l: 'Profil' }].map(({ to, l }) => (
            <Link key={to} to={to} className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 no-underline transition-colors">{l}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-emerald-700 font-semibold">{prenom} {nom}</span>
          </div>
          <NotificationIcon />
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login') }} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer">Déconnexion</button>
        </div>
      </div>
    </nav>
  )
}

export default function DashboardDemandeur() {
  const [dossiers, setDossiers] = useState([])
  const [aides, setAides] = useState([])
  const [chargement, setChargement] = useState(true)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const prenom = payload?.prenom || ''
  const nom = payload?.nom || ''

  const heure = new Date().getHours()
  const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir'

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    Promise.all([api.get('/dossiers/'), api.get('/aides/')])
      .then(([d, a]) => {
        setDossiers(d.data.filter(dos => dos.demandeur_id === payload.sub))
        setAides(a.data.filter(aide => aide.statut === 'active').slice(0, 3))
        setChargement(false)
      }).catch(() => setChargement(false))
  }, [])

  if (chargement) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Navbar prenom={prenom} nom={nom} />
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar prenom={prenom} nom={nom} />

      <div className="bg-white border-b border-gray-100 px-6 py-7">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{salut}, {prenom} 👋</h1>
            <p className="text-sm text-gray-400 mt-1">Suivi de vos demandes d'aides publiques</p>
          </div>
          <Link to="/deposer" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg no-underline hover:bg-blue-700">+ Nouvelle demande</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total dossiers', value: dossiers.length, color: 'text-blue-600' },
            { label: 'En instruction', value: dossiers.filter(d => d.statut === 'en_instruction').length, color: 'text-amber-600' },
            { label: 'Acceptés', value: dossiers.filter(d => d.statut === 'accepte').length, color: 'text-emerald-600' },
            { label: 'Refusés', value: dossiers.filter(d => d.statut === 'refuse').length, color: 'text-red-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">{s.label}</p>
              <p className={`text-3xl font-extrabold tracking-tight ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Dossiers récents */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Dossiers récents</span>
              <Link to="/mon-espace" className="text-xs font-semibold text-blue-600 no-underline hover:underline">Voir tout →</Link>
            </div>
            {dossiers.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-3xl mb-3">📋</div>
                <p className="text-sm text-gray-400 mb-4">Aucun dossier déposé</p>
                <Link to="/deposer" className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg no-underline hover:bg-blue-700">Déposer une demande</Link>
              </div>
            ) : dossiers.slice(0, 5).map((d, i) => {
              const s = STATUT[d.statut] || STATUT.brouillon
              return (
                <div key={d.id} className={`px-5 py-3.5 flex items-center justify-between ${i < Math.min(4, dossiers.length - 1) ? 'border-b border-gray-50' : ''}`}>
                  <div>
                    <p className="text-sm font-bold text-blue-600">{d.numero}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(d.cree_le).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                </div>
              )
            })}
          </div>

          {/* Aides recommandées */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Aides recommandées</span>
              <Link to="/catalogue" className="text-xs font-semibold text-blue-600 no-underline hover:underline">Voir tout →</Link>
            </div>
            {aides.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">Aucune aide disponible</div>
            ) : aides.map((a, i) => (
              <div key={i} className={`px-5 py-4 ${i < aides.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-start justify-between mb-1.5">
                  <p className="text-sm font-bold text-gray-900">{a.titre}</p>
                  <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full ml-2 whitespace-nowrap">{a.type_aide}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">{a.description}</p>
                <Link to="/deposer" className="text-xs font-semibold text-blue-600 no-underline hover:underline">Faire une demande →</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <footer className="border-t border-gray-100 py-5 text-center mt-8">
        <p className="text-xs text-gray-400">© 2026 Plateforme Aides Publiques</p>
      </footer>
    </div>
  )
}