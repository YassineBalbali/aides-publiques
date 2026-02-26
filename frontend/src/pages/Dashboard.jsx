import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

function Dashboard() {
  const [dossiers, setDossiers] = useState([])
  const [aides, setAides] = useState([])
  const [utilisateurs, setUtilisateurs] = useState([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/dossiers/').then(r => r.json()),
      fetch('http://127.0.0.1:8000/aides/').then(r => r.json()),
      fetch('http://127.0.0.1:8000/auth/utilisateurs').then(r => r.json()),
    ]).then(([d, a, u]) => {
      setDossiers(d)
      setAides(a)
      setUtilisateurs(u)
      setChargement(false)
    }).catch(() => setChargement(false))
  }, [])

  const dataStatut = {
    labels: ['Brouillon', 'Déposé', 'En instruction', 'Accepté', 'Refusé'],
    datasets: [{
      data: [
        dossiers.filter(d => d.statut === 'brouillon').length,
        dossiers.filter(d => d.statut === 'depose').length,
        dossiers.filter(d => d.statut === 'en_instruction').length,
        dossiers.filter(d => d.statut === 'accepte').length,
        dossiers.filter(d => d.statut === 'refuse').length,
      ],
      backgroundColor: ['#64748b', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
      borderWidth: 0,
    }]
  }

  const dataTypes = {
    labels: ['Subvention', 'Prêt', 'Exonération', 'Formation'],
    datasets: [{
      label: "Nombre d'aides",
      data: [
        aides.filter(a => a.type_aide === 'subvention').length,
        aides.filter(a => a.type_aide === 'pret').length,
        aides.filter(a => a.type_aide === 'exoneration').length,
        aides.filter(a => a.type_aide === 'formation').length,
      ],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
      borderRadius: 10,
      borderSkipped: false,
    }]
  }

  const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  const dossierParMois = mois.map((_, i) =>
    dossiers.filter(d => new Date(d.cree_le).getMonth() === i).length
  )

  const dataMois = {
    labels: mois,
    datasets: [{
      label: 'Dossiers déposés',
      data: dossierParMois,
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 10,
      borderSkipped: false,
    }]
  }

  const tauxAcceptation = dossiers.length
    ? Math.round(dossiers.filter(d => d.statut === 'accepte').length / dossiers.length * 100)
    : 0

  const roleLabels = { admin: '🔴 Admin', demandeur: '🟢 Demandeur', instructeur: '🔵 Instructeur' }

  if (chargement) return (
    <div style={{backgroundColor: '#0f172a', minHeight: '100vh'}} className="flex items-center justify-center">
      <div className="text-white text-xl">Chargement du dashboard...</div>
    </div>
  )

  return (
    <div style={{backgroundColor: '#0f172a', minHeight: '100vh'}}>
      {/* Navbar */}
      <nav style={{backgroundColor: '#1e293b'}} className="px-8 py-4 flex items-center justify-between border-b border-slate-700">
        <Link to="/" className="flex items-center gap-3 text-white font-bold text-xl">
          <span className="text-2xl">🏛️</span>
          <span>AidesPubliques</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/admin" className="text-slate-400 hover:text-white transition-colors">📁 Dossiers</Link>
          <Link to="/admin/aides" className="text-slate-400 hover:text-white transition-colors">🏷️ Gestion Aides</Link>
          <Link to="/dashboard" className="text-indigo-400 font-semibold">📊 Dashboard</Link>
        </div>
      </nav>

      <div className="px-10 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard Administrateur</h1>
          <p className="text-slate-400">Vue d'ensemble en temps réel de la plateforme</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            {
              label: 'Total Dossiers',
              value: dossiers.length,
              icon: '📁',
              color: 'from-blue-600 to-blue-800',
              sub: `${dossiers.filter(d => d.statut === 'depose').length} en attente de traitement`
            },
            {
              label: 'Aides Actives',
              value: aides.filter(a => a.statut === 'active').length,
              icon: '✅',
              color: 'from-emerald-600 to-emerald-800',
              sub: `${aides.length} aides au total`
            },
            {
              label: 'Utilisateurs',
              value: utilisateurs.length,
              icon: '👥',
              color: 'from-violet-600 to-violet-800',
              sub: `${utilisateurs.filter(u => u.role === 'demandeur').length} demandeurs`
            },
            {
              label: 'Taux Acceptation',
              value: `${tauxAcceptation}%`,
              icon: '📈',
              color: 'from-amber-500 to-amber-700',
              sub: `${dossiers.filter(d => d.statut === 'accepte').length} dossiers acceptés`
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

        {/* Graphiques ligne 1 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div style={{backgroundColor: '#1e293b'}} className="rounded-2xl p-6 shadow-xl border border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">🥧</span>
              <h2 className="text-white font-bold text-lg">Dossiers par statut</h2>
            </div>
            <div style={{height: '260px'}} className="flex items-center justify-center">
              <Pie data={dataStatut} options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', padding: 15, font: { size: 12 } }
                  }
                }
              }} />
            </div>
          </div>

          <div style={{backgroundColor: '#1e293b'}} className="rounded-2xl p-6 shadow-xl border border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">🏷️</span>
              <h2 className="text-white font-bold text-lg">Aides par type</h2>
            </div>
            <div style={{height: '260px'}}>
              <Bar data={dataTypes} options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                  y: { ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: '#334155' }, beginAtZero: true }
                }
              }} />
            </div>
          </div>
        </div>

        {/* Graphique dossiers par mois */}
        <div style={{backgroundColor: '#1e293b'}} className="rounded-2xl p-6 shadow-xl border border-slate-700 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">📅</span>
            <h2 className="text-white font-bold text-lg">Dossiers déposés par mois</h2>
          </div>
          <div style={{height: '220px'}}>
            <Bar data={dataMois} options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                y: { ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: '#334155' }, beginAtZero: true }
              }
            }} />
          </div>
        </div>

        {/* Liste utilisateurs */}
        <div style={{backgroundColor: '#1e293b'}} className="rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <h2 className="text-white font-bold text-lg">Utilisateurs inscrits</h2>
            </div>
            <span className="text-slate-400 text-sm bg-slate-700 px-3 py-1 rounded-full">{utilisateurs.length} total</span>
          </div>
          <table className="w-full">
            <thead style={{backgroundColor: '#0f172a'}}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {utilisateurs.map((u, i) => (
                <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 text-white font-semibold">{u.prenom} {u.nom}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      u.role === 'admin' ? 'bg-red-900/50 text-red-400' :
                      u.role === 'instructeur' ? 'bg-blue-900/50 text-blue-400' :
                      'bg-emerald-900/50 text-emerald-400'
                    }`}>
                      {roleLabels[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(u.cree_le).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard