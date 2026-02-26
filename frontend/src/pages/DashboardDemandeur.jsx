import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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
      fetch('http://127.0.0.1:8000/dossiers/').then(r => r.json()),
      fetch('http://127.0.0.1:8000/aides/').then(r => r.json()),
    ]).then(([d, a]) => {
      setDossiers(d.filter(dos => dos.demandeur_id === payload.sub))
      setAides(a.filter(a => a.statut === 'active').slice(0, 3))
      setChargement(false)
    }).catch(() => setChargement(false))
  }, [])

  const badgeStatut = (statut) => {
    const styles = {
      brouillon: 'bg-gray-100 text-gray-600',
      depose: 'bg-blue-100 text-blue-700',
      en_instruction: 'bg-yellow-100 text-yellow-700',
      accepte: 'bg-green-100 text-green-700',
      refuse: 'bg-red-100 text-red-600',
    }
    const labels = {
      brouillon: '⏳ Brouillon',
      depose: '📤 Déposé',
      en_instruction: '📋 En instruction',
      accepte: '✅ Accepté',
      refuse: '❌ Refusé',
    }
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[statut] || 'bg-gray-100'}`}>
        {labels[statut] || statut}
      </span>
    )
  }

  const stats = [
    { label: 'Total', value: dossiers.length, color: 'from-blue-600 to-blue-800', icon: '📁' },
    { label: 'En instruction', value: dossiers.filter(d => d.statut === 'en_instruction').length, color: 'from-yellow-500 to-yellow-700', icon: '📋' },
    { label: 'Acceptés', value: dossiers.filter(d => d.statut === 'accepte').length, color: 'from-emerald-600 to-emerald-800', icon: '✅' },
    { label: 'Refusés', value: dossiers.filter(d => d.statut === 'refuse').length, color: 'from-red-600 to-red-800', icon: '❌' },
  ]

  if (chargement) return (
    <div style={{backgroundColor: '#0f172a', minHeight: '100vh'}} className="flex items-center justify-center">
      <p className="text-white text-xl">Chargement...</p>
    </div>
  )

  return (
    <div style={{backgroundColor: '#0f172a', minHeight: '100vh'}}>
      {/* Navbar */}
      <nav style={{backgroundColor: '#1e293b'}} className="px-8 py-4 flex items-center justify-between border-b border-slate-700">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <span>🏛️</span><span>AidesPubliques</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <Link to="/aides" className="hover:text-white transition-colors">Catalogue</Link>
          <Link to="/deposer" className="hover:text-white transition-colors">Déposer</Link>
          <Link to="/mon-espace" className="hover:text-white transition-colors">Mes dossiers</Link>
          <Link to="/mon-espace/dashboard" className="text-indigo-400 font-semibold">Dashboard</Link>
        </div>
        <button
          onClick={() => { localStorage.removeItem('token'); navigate('/') }}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          Se déconnecter
        </button>
      </nav>

      <div className="px-10 py-8">
        <h1 className="text-3xl font-bold text-white mb-1">Mon Dashboard</h1>
        <p className="text-slate-400 mb-8">Suivi de vos demandes d'aides publiques</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {stats.map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{s.icon}</span>
              </div>
              <p className="text-4xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-white/70 font-semibold text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Derniers dossiers */}
          <div style={{backgroundColor: '#1e293b'}} className="rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">📁 Derniers dossiers</h2>
              <Link to="/mon-espace" className="text-indigo-400 text-sm hover:underline">Voir tout →</Link>
            </div>
            {dossiers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-slate-400 mb-4">Aucun dossier déposé</p>
                <Link to="/deposer" className="bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm">
                  Déposer une demande
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {dossiers.slice(0, 4).map(d => (
                  <div key={d.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
                    <div>
                      <p className="text-white font-mono font-semibold text-sm">{d.numero}</p>
                      <p className="text-slate-400 text-xs mt-1">
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
          <div style={{backgroundColor: '#1e293b'}} className="rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">💡 Aides recommandées</h2>
              <Link to="/aides" className="text-indigo-400 text-sm hover:underline">Voir tout →</Link>
            </div>
            <div className="divide-y divide-slate-700">
              {aides.map((a, i) => (
                <div key={i} className="px-6 py-4 hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-semibold text-sm">{a.titre}</p>
                    <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-1 rounded-full">{a.type_aide}</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-3 line-clamp-2">{a.description}</p>
                  <Link to="/deposer" className="text-yellow-400 text-xs font-semibold hover:underline">
                    Faire une demande →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardDemandeur