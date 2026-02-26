import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function DashboardInstructeur() {
  const [dossiers, setDossiers] = useState([])
  const [chargement, setChargement] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    fetch('http://127.0.0.1:8000/dossiers/')
      .then(r => r.json())
      .then(data => { setDossiers(data); setChargement(false) })
      .catch(() => setChargement(false))
  }, [])

  const enAttente = dossiers.filter(d => d.statut === 'depose' || d.statut === 'brouillon')
  const enInstruction = dossiers.filter(d => d.statut === 'en_instruction')
  const traites = dossiers.filter(d => d.statut === 'accepte' || d.statut === 'refuse')

  // Dossiers prioritaires — les plus anciens en attente
  const prioritaires = [...enAttente].sort((a, b) =>
    new Date(a.cree_le) - new Date(b.cree_le)
  ).slice(0, 5)

  const joursAttente = (date) => {
    const diff = new Date() - new Date(date)
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const tauxTraitement = dossiers.length
    ? Math.round(traites.length / dossiers.length * 100)
    : 0

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

  const urgenceBadge = (jours) => {
    if (jours > 10) return <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">🔴 Urgent {jours}j</span>
    if (jours > 5) return <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">🟠 {jours}j</span>
    return <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">🟢 {jours}j</span>
  }

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
          <Link to="/instructeur" className="hover:text-white transition-colors">📁 Mes dossiers</Link>
          <Link to="/instructeur/dashboard" className="text-indigo-400 font-semibold">📊 Dashboard</Link>
        </div>
        <button
          onClick={() => { localStorage.removeItem('token'); navigate('/') }}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          Se déconnecter
        </button>
      </nav>

      <div className="px-10 py-8">
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard Instructeur</h1>
        <p className="text-slate-400 mb-8">Suivi et traitement des dossiers en cours</p>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            {
              label: 'En attente',
              value: enAttente.length,
              icon: '⏳',
              color: 'from-blue-600 to-blue-800',
              sub: 'Dossiers à traiter'
            },
            {
              label: 'En instruction',
              value: enInstruction.length,
              icon: '📋',
              color: 'from-yellow-500 to-yellow-700',
              sub: 'En cours de traitement'
            },
            {
              label: 'Traités',
              value: traites.length,
              icon: '✅',
              color: 'from-emerald-600 to-emerald-800',
              sub: `${dossiers.filter(d => d.statut === 'accepte').length} acceptés · ${dossiers.filter(d => d.statut === 'refuse').length} refusés`
            },
            {
              label: 'Taux traitement',
              value: `${tauxTraitement}%`,
              icon: '📈',
              color: 'from-violet-600 to-violet-800',
              sub: `Sur ${dossiers.length} dossiers total`
            },
          ].map((kpi, i) => (
            <div key={i} className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{kpi.icon}</span>
                <span className="text-white/60 text-xs bg-white/10 px-3 py-1 rounded-full">Live</span>
              </div>
              <p className="text-4xl font-bold text-white mb-1">{kpi.value}</p>
              <p className="text-white/70 font-semibold text-sm mb-1">{kpi.label}</p>
              <p className="text-white/50 text-xs">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Dossiers prioritaires */}
          <div style={{backgroundColor: '#1e293b'}} className="rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <h2 className="text-white font-bold text-lg">Dossiers prioritaires</h2>
              </div>
              <span className="text-slate-400 text-xs bg-slate-700 px-3 py-1 rounded-full">Les plus anciens</span>
            </div>
            {prioritaires.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-4xl mb-3">🎉</p>
                <p className="text-slate-400">Aucun dossier en attente !</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {prioritaires.map(d => (
                  <div key={d.id} className="px-6 py-4 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-mono font-semibold text-sm">{d.numero}</span>
                      {urgenceBadge(joursAttente(d.cree_le))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">
                        {d.demandeur?.prenom} {d.demandeur?.nom}
                      </span>
                      {badgeStatut(d.statut)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Statistiques traitement */}
          <div style={{backgroundColor: '#1e293b'}} className="rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h2 className="text-white font-bold text-lg">Statistiques de traitement</h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {[
                { label: 'Dossiers acceptés', value: dossiers.filter(d => d.statut === 'accepte').length, total: dossiers.length, color: 'bg-emerald-500' },
                { label: 'Dossiers refusés', value: dossiers.filter(d => d.statut === 'refuse').length, total: dossiers.length, color: 'bg-red-500' },
                { label: 'En instruction', value: enInstruction.length, total: dossiers.length, color: 'bg-yellow-500' },
                { label: 'En attente', value: enAttente.length, total: dossiers.length, color: 'bg-blue-500' },
              ].map((stat, i) => {
                const pct = dossiers.length ? Math.round(stat.value / dossiers.length * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 text-sm">{stat.label}</span>
                      <span className="text-white font-bold text-sm">{stat.value} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`${stat.color} h-2 rounded-full transition-all`}
                        style={{width: `${pct}%`}}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Derniers dossiers traités */}
        <div style={{backgroundColor: '#1e293b'}} className="rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xl">📁</span>
              <h2 className="text-white font-bold text-lg">Tous les dossiers en attente</h2>
            </div>
          </div>
          {enAttente.length === 0 ? (
            <p className="text-slate-400 p-6 text-center">Aucun dossier en attente 🎉</p>
          ) : (
            <table className="w-full">
              <thead style={{backgroundColor: '#0f172a'}}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Demandeur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Date dépôt</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Ancienneté</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {enAttente.sort((a, b) => new Date(a.cree_le) - new Date(b.cree_le)).map(d => (
                  <tr key={d.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-indigo-400 font-mono font-semibold text-sm">{d.numero}</td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-semibold">{d.demandeur?.prenom} {d.demandeur?.nom}</p>
                      <p className="text-slate-400 text-xs">{d.demandeur?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(d.cree_le).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">{urgenceBadge(joursAttente(d.cree_le))}</td>
                    <td className="px-6 py-4">{badgeStatut(d.statut)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardInstructeur