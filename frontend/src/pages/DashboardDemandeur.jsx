import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

function DashboardDemandeur() {
  const [dossiers, setDossiers] = useState([])
  const [aides, setAides] = useState([])
  const [chargement, setChargement] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    const payload = JSON.parse(atob(token.split('.')[1]))
    Promise.all([
      api.get('/dossiers/'),
      api.get('/aides/'),
    ]).then(([d, a]) => {
      setDossiers(d.data.filter(dos => dos.demandeur_id === payload.sub))
      setAides(a.data.filter(a => a.statut === 'active').slice(0, 3))
      setChargement(false)
    }).catch(() => setChargement(false))
  }, [])

  const badgeStatut = (statut) => {
    const styles = {
      brouillon: 'bg-gray-100 text-gray-600',
      depose: 'bg-blue-100 text-blue-800',
      en_instruction: 'bg-yellow-100 text-yellow-800',
      accepte: 'bg-green-100 text-green-800',
      refuse: 'bg-red-100 text-red-800',
    }
    const labels = {
      brouillon: 'Brouillon',
      depose: 'Déposé',
      en_instruction: 'En instruction',
      accepte: 'Accepté',
      refuse: 'Refusé',
    }
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[statut] || 'bg-gray-100'}`}>
        {labels[statut] || statut}
      </span>
    )
  }

  if (chargement) return (
    <div style={{backgroundColor: '#f5f5f5', minHeight: '100vh'}} className="flex items-center justify-center">
      <p className="text-gray-500 text-xl">Chargement...</p>
    </div>
  )

  return (
    <div style={{backgroundColor: '#f5f5f5', minHeight: '100vh'}}>

      {/* Bandeau RF */}
      <div style={{backgroundColor: '#1a2b5e'}} className="px-8 py-2 flex items-center gap-3">
        <div className="bg-red-600 text-white font-bold text-sm px-2 py-1 rounded">RF</div>
        <span className="text-white text-sm font-semibold">RÉPUBLIQUE FRANÇAISE</span>
        <span className="text-blue-300 text-xs">Liberté · Égalité · Fraternité</span>
        <div className="ml-auto">
          <button onClick={() => { localStorage.removeItem('token'); navigate('/') }}
            className="text-white text-sm hover:underline">← Se déconnecter</button>
        </div>
      </div>

      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <Link to="/" className="text-blue-900 font-bold text-xl">Aides Publiques</Link>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-900">Accueil</Link>
          <Link to="/aides" className="hover:text-blue-900">Catalogue des aides</Link>
          <Link to="/deposer" className="hover:text-blue-900">Déposer un dossier</Link>
          <Link to="/mon-espace" className="hover:text-blue-900">Mes dossiers</Link>
          <Link to="/mon-espace/dashboard" className="text-blue-900 font-semibold border-b-2 border-blue-900 pb-1">Dashboard</Link>
        </div>
      </div>

      {/* Header */}
      <div style={{backgroundColor: '#1a2b5e'}} className="px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Mon Dashboard</h1>
          <p className="text-blue-200">Suivi de vos demandes d'aides publiques</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total dossiers', value: dossiers.length, color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200', icon: '📁' },
            { label: 'En instruction', value: dossiers.filter(d => d.statut === 'en_instruction').length, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: '📋' },
            { label: 'Acceptés', value: dossiers.filter(d => d.statut === 'accepte').length, color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: '✅' },
            { label: 'Refusés', value: dossiers.filter(d => d.statut === 'refuse').length, color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: '❌' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} border rounded-lg p-6 shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{stat.icon}</span>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
              <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">

          {/* Derniers dossiers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-gray-900 font-bold text-lg">📁 Derniers dossiers</h2>
              <Link to="/mon-espace" className="text-blue-700 text-sm hover:underline">Voir tout →</Link>
            </div>
            {dossiers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-3xl mb-3">📭</p>
                <p className="text-gray-400 mb-4">Aucun dossier déposé</p>
                <Link to="/deposer" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded text-sm">
                  Déposer une demande
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {dossiers.slice(0, 4).map(d => (
                  <div key={d.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-blue-700 font-mono font-semibold text-sm">{d.numero}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(d.cree_le).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {badgeStatut(d.statut)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aides recommandées */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-gray-900 font-bold text-lg">💡 Aides recommandées</h2>
              <Link to="/aides" className="text-blue-700 text-sm hover:underline">Voir tout →</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {aides.map((a, i) => (
                <div key={i} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-900 font-semibold text-sm">{a.titre}</p>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{a.type_aide}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">{a.description}</p>
                  <Link to="/deposer" className="text-blue-700 text-xs font-semibold hover:underline">
                    Faire une demande →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-10 mt-10">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-red-600 text-white font-bold text-xs px-1 py-1 rounded">RF</div>
                <span className="text-gray-700 font-semibold text-sm">RÉPUBLIQUE FRANÇAISE</span>
              </div>
              <p className="text-gray-400 text-xs">Plateforme de gestion et suivi des aides publiques.</p>
            </div>
            <div>
              <h3 className="text-gray-700 font-semibold text-sm mb-3">Navigation</h3>
              <div className="flex flex-col gap-2">
                <Link to="/aides" className="text-gray-400 hover:text-gray-700 text-xs">Catalogue des aides</Link>
                <Link to="/deposer" className="text-gray-400 hover:text-gray-700 text-xs">Déposer un dossier</Link>
                <Link to="/mon-espace" className="text-gray-400 hover:text-gray-700 text-xs">Suivre mon dossier</Link>
              </div>
            </div>
            <div>
              <h3 className="text-gray-700 font-semibold text-sm mb-3">Espace pro</h3>
              <div className="flex flex-col gap-2">
                <Link to="/instructeur" className="text-gray-400 hover:text-gray-700 text-xs">Espace instructeur</Link>
                <Link to="/admin" className="text-gray-400 hover:text-gray-700 text-xs">Administration</Link>
              </div>
            </div>
            <div>
              <h3 className="text-gray-700 font-semibold text-sm mb-3">Informations</h3>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-400 hover:text-gray-700 text-xs">Mentions légales</a>
                <a href="#" className="text-gray-400 hover:text-gray-700 text-xs">Accessibilité</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-gray-400 text-xs">© 2026 Plateforme Aides Publiques — Tous droits réservés</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default DashboardDemandeur
