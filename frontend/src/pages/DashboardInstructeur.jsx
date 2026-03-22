import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

function DashboardInstructeur() {
  const [dossiers, setDossiers] = useState([])
  const [chargement, setChargement] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    const payload = JSON.parse(atob(token.split('.')[1]))
    const instructeurId = payload.sub
    api.get('/dossiers/')
      .then(r => {
        setDossiers(r.data.filter(d => d.instructeur_id === instructeurId))
        setChargement(false)
      })
      .catch(() => setChargement(false))
  }, [])

  const enAttente = dossiers.filter(d => d.statut === 'depose' || d.statut === 'brouillon')
  const enInstruction = dossiers.filter(d => d.statut === 'en_instruction')
  const traites = dossiers.filter(d => d.statut === 'accepte' || d.statut === 'refuse')

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

  const urgenceBadge = (jours) => {
    if (jours > 10) return <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full">Urgent {jours}j</span>
    if (jours > 5) return <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-1 rounded-full">{jours}j</span>
    return <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-full">{jours}j</span>
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
          <Link to="/instructeur" className="hover:text-blue-900">Mes dossiers</Link>
          <Link to="/instructeur/dashboard" className="text-blue-900 font-semibold border-b-2 border-blue-900 pb-1">Dashboard</Link>
        </div>
      </div>

      {/* Header */}
      <div style={{backgroundColor: '#1a2b5e'}} className="px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Instructeur</h1>
          <p className="text-blue-200">Suivi et traitement des dossiers en cours</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'En attente', value: enAttente.length, color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200', sub: 'Dossiers à traiter', icon: '⏳' },
            { label: 'En instruction', value: enInstruction.length, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', sub: 'En cours', icon: '📋' },
            { label: 'Traités', value: traites.length, color: 'text-green-700', bg: 'bg-green-50 border-green-200', sub: `${dossiers.filter(d => d.statut === 'accepte').length} acceptés · ${dossiers.filter(d => d.statut === 'refuse').length} refusés`, icon: '✅' },
            { label: 'Taux traitement', value: `${tauxTraitement}%`, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', sub: `Sur ${dossiers.length} dossiers`, icon: '📈' },
          ].map((kpi, i) => (
            <div key={i} className={`${kpi.bg} border rounded-lg p-6 shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{kpi.icon}</span>
                <p className="text-gray-500 text-sm">{kpi.label}</p>
              </div>
              <p className={`text-4xl font-bold ${kpi.color} mb-1`}>{kpi.value}</p>
              <p className="text-gray-400 text-xs">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">

          {/* Dossiers prioritaires */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
                <span>🚨</span> Dossiers prioritaires
              </h2>
              <span className="text-gray-400 text-xs bg-gray-100 px-3 py-1 rounded-full">Les plus anciens</span>
            </div>
            {prioritaires.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-3xl mb-3">🎉</p>
                <p className="text-gray-400">Aucun dossier en attente !</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {prioritaires.map(d => (
                  <div key={d.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-700 font-mono font-semibold text-sm">{d.numero}</span>
                      {urgenceBadge(joursAttente(d.cree_le))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
                <span>📊</span> Statistiques de traitement
              </h2>
            </div>
            <div className="p-6 space-y-5">
              {[
                { label: 'Dossiers acceptés', value: dossiers.filter(d => d.statut === 'accepte').length, color: 'bg-green-500' },
                { label: 'Dossiers refusés', value: dossiers.filter(d => d.statut === 'refuse').length, color: 'bg-red-500' },
                { label: 'En instruction', value: enInstruction.length, color: 'bg-yellow-500' },
                { label: 'En attente', value: enAttente.length, color: 'bg-blue-500' },
              ].map((stat, i) => {
                const pct = dossiers.length ? Math.round(stat.value / dossiers.length * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 text-sm">{stat.label}</span>
                      <span className="text-gray-900 font-bold text-sm">{stat.value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`${stat.color} h-2 rounded-full transition-all`} style={{width: `${pct}%`}} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tableau dossiers en attente */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
              <span>📁</span> Tous les dossiers en attente
            </h2>
          </div>
          {enAttente.length === 0 ? (
            <p className="text-gray-400 p-6 text-center">Aucun dossier en attente 🎉</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Demandeur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date dépôt</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ancienneté</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enAttente.sort((a, b) => new Date(a.cree_le) - new Date(b.cree_le)).map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-blue-700 font-mono font-semibold text-sm">{d.numero}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-semibold text-sm">{d.demandeur?.prenom} {d.demandeur?.nom}</p>
                      <p className="text-gray-400 text-xs">{d.demandeur?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
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

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-10">
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
              </div>
            </div>
            <div>
              <h3 className="text-gray-700 font-semibold text-sm mb-3">Espace instructeur</h3>
              <div className="flex flex-col gap-2">
                <Link to="/instructeur" className="text-gray-400 hover:text-gray-700 text-xs">Mes dossiers</Link>
                <Link to="/instructeur/dashboard" className="text-gray-400 hover:text-gray-700 text-xs">Dashboard</Link>
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

export default DashboardInstructeur