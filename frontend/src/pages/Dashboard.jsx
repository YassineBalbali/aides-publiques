import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

function Dashboard() {
  const [dossiers, setDossiers] = useState([])
  const [aides, setAides] = useState([])
  const [utilisateurs, setUtilisateurs] = useState([])
  const [chargement, setChargement] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/dossiers/').then(r => r.json()),
      fetch('http://127.0.0.1:8000/aides/').then(r => r.json()),
      fetch('http://127.0.0.1:8000/auth/utilisateurs').then(r => r.json()),
    ]).then(([d, a, u]) => {
      setDossiers(d); setAides(a); setUtilisateurs(u); setChargement(false)
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
      backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
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
      backgroundColor: ['#1e3a8a', '#7c3aed', '#059669', '#d97706'],
      borderRadius: 6,
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
      backgroundColor: '#1e3a8a',
      borderRadius: 6,
      borderSkipped: false,
    }]
  }

  const tauxAcceptation = dossiers.length
    ? Math.round(dossiers.filter(d => d.statut === 'accepte').length / dossiers.length * 100)
    : 0

  const roleLabels = { admin: '🔴 Admin', demandeur: '🟢 Demandeur', instructeur: '🔵 Instructeur' }

  if (chargement) return (
    <div style={{backgroundColor: '#f5f5f5', minHeight: '100vh'}} className="flex items-center justify-center">
      <p className="text-gray-500 text-xl">Chargement du dashboard...</p>
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
          <Link to="/admin" className="hover:text-blue-900">Espace admin</Link>
          <Link to="/admin/aides" className="hover:text-blue-900">Gestion des aides</Link>
          <Link to="/admin/utilisateurs" className="hover:text-blue-900">Utilisateurs</Link>
          <Link to="/dashboard" className="font-semibold text-blue-900 border-b-2 border-blue-900 pb-1">Dashboard</Link>
        </div>
      </div>

      {/* Header */}
      <div style={{backgroundColor: '#1a2b5e'}} className="px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📊</span>
            <h1 className="text-3xl font-bold text-white">Dashboard Administrateur</h1>
          </div>
          <p className="text-blue-200">Vue d'ensemble en temps réel de la plateforme</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Dossiers', value: dossiers.length, color: 'text-blue-900', bg: 'bg-blue-50', border: 'border-blue-200', sub: `${dossiers.filter(d => d.statut === 'depose').length} en attente` },
            { label: 'Aides Actives', value: aides.filter(a => a.statut === 'active').length, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', sub: `${aides.length} aides au total` },
            { label: 'Utilisateurs', value: utilisateurs.length, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', sub: `${utilisateurs.filter(u => u.role === 'demandeur').length} demandeurs` },
            { label: 'Taux Acceptation', value: `${tauxAcceptation}%`, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', sub: `${dossiers.filter(d => d.statut === 'accepte').length} acceptés` },
          ].map((kpi, i) => (
            <div key={i} className={`${kpi.bg} border ${kpi.border} rounded-lg p-6 shadow-sm`}>
              <p className="text-gray-500 text-sm mb-1">{kpi.label}</p>
              <p className={`text-4xl font-bold ${kpi.color} mb-1`}>{kpi.value}</p>
              <p className="text-gray-400 text-xs">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Graphiques ligne 1 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-gray-900 font-bold text-lg mb-6 flex items-center gap-2">
              <span>🥧</span> Dossiers par statut
            </h2>
            <div style={{height: '260px'}} className="flex items-center justify-center">
              <Pie data={dataStatut} options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#6b7280', padding: 15, font: { size: 12 } }
                  }
                }
              }} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-gray-900 font-bold text-lg mb-6 flex items-center gap-2">
              <span>🏷️</span> Aides par type
            </h2>
            <div style={{height: '260px'}}>
              <Bar data={dataTypes} options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#6b7280' }, grid: { color: '#f3f4f6' } },
                  y: { ticks: { color: '#6b7280', stepSize: 1 }, grid: { color: '#f3f4f6' }, beginAtZero: true }
                }
              }} />
            </div>
          </div>
        </div>

        {/* Graphique par mois */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-gray-900 font-bold text-lg mb-6 flex items-center gap-2">
            <span>📅</span> Dossiers déposés par mois
          </h2>
          <div style={{height: '220px'}}>
            <Bar data={dataMois} options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: '#6b7280' }, grid: { color: '#f3f4f6' } },
                y: { ticks: { color: '#6b7280', stepSize: 1 }, grid: { color: '#f3f4f6' }, beginAtZero: true }
              }
            }} />
          </div>
        </div>

        {/* Tableau utilisateurs */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
              <span>👥</span> Utilisateurs inscrits
            </h2>
            <span className="text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">{utilisateurs.length} total</span>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {utilisateurs.map((u, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-900 font-bold text-sm">
                        {(u.prenom?.[0] || u.email[0]).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900">{u.prenom} {u.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      u.role === 'admin' ? 'bg-red-100 text-red-600' :
                      u.role === 'instructeur' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {roleLabels[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {u.cree_le ? new Date(u.cree_le).toLocaleDateString('fr-FR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <h3 className="text-gray-700 font-semibold text-sm mb-3">Administration</h3>
              <div className="flex flex-col gap-2">
                <Link to="/admin" className="text-gray-400 hover:text-gray-700 text-xs">Espace admin</Link>
                <Link to="/admin/aides" className="text-gray-400 hover:text-gray-700 text-xs">Gestion des aides</Link>
                <Link to="/admin/utilisateurs" className="text-gray-400 hover:text-gray-700 text-xs">Utilisateurs</Link>
                <Link to="/dashboard" className="text-gray-400 hover:text-gray-700 text-xs">Dashboard</Link>
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

export default Dashboard