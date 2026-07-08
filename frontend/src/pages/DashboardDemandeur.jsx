import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import NavbarShared from '../components/NavbarShared'
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler,
} from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler)

const STATUT = {
  brouillon:      { label: 'Brouillon',      cls: 'bg-gray-100 text-gray-500 border border-gray-200' },
  depose:         { label: 'Déposé',         cls: 'bg-blue-50 text-blue-700 border border-blue-100' },
  en_instruction: { label: 'En instruction', cls: 'bg-amber-50 text-amber-700 border border-amber-100' },
  accepte:        { label: 'Accepté',        cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  refuse:         { label: 'Refusé',         cls: 'bg-red-50 text-red-600 border border-red-100' },
}

const STATUT_COLORS = {
  brouillon:      '#e2e8f0',
  depose:         '#6366f1',
  en_instruction: '#f59e0b',
  accepte:        '#10b981',
  refuse:         '#ef4444',
}

function getLast6Months() {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    months.push({ label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), year: d.getFullYear(), month: d.getMonth() })
  }
  return months
}

const CHART_FONT = { family: 'Inter, sans-serif', size: 12 }

export default function DashboardDemandeur() {
  const [dossiers, setDossiers] = useState([])
  const [aides, setAides]       = useState([])
  const [chargement, setChargement] = useState(true)
  const navigate = useNavigate()

  const token   = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const prenom  = payload?.prenom || ''

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

  const acceptes      = dossiers.filter(d => d.statut === 'accepte').length
  const refuses       = dossiers.filter(d => d.statut === 'refuse').length
  const enInstruction = dossiers.filter(d => d.statut === 'en_instruction').length
  const enAttente     = dossiers.filter(d => d.statut === 'depose').length
  const brouillons    = dossiers.filter(d => d.statut === 'brouillon').length

  // --- Donut statuts ---
  const statutLabels = ['Brouillon', 'Déposé', 'En instruction', 'Accepté', 'Refusé']
  const statutValues = [brouillons, enAttente, enInstruction, acceptes, refuses]
  const donutData = {
    labels: statutLabels,
    datasets: [{
      data: statutValues,
      backgroundColor: Object.values(STATUT_COLORS),
      borderColor: '#fff',
      borderWidth: 3,
      hoverOffset: 6,
    }],
  }
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 12, font: CHART_FONT, usePointStyle: true } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label} : ${ctx.parsed} dossier${ctx.parsed > 1 ? 's' : ''}` } },
    },
  }

  // --- Line évolution 6 mois ---
  const months = getLast6Months()
  const lineData = {
    labels: months.map(m => m.label),
    datasets: [
      {
        label: 'Dossiers déposés',
        data: months.map(m => dossiers.filter(d => {
          const dt = new Date(d.cree_le)
          return dt.getFullYear() === m.year && dt.getMonth() === m.month
        }).length),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.10)',
        fill: true,
        tension: 0.42,
        pointRadius: 5,
        pointBackgroundColor: '#6366f1',
      },
      {
        label: 'Acceptés',
        data: months.map(m => dossiers.filter(d => {
          const dt = new Date(d.cree_le)
          return d.statut === 'accepte' && dt.getFullYear() === m.year && dt.getMonth() === m.month
        }).length),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        fill: true,
        tension: 0.42,
        pointRadius: 5,
        pointBackgroundColor: '#10b981',
      },
    ],
  }
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { padding: 14, font: CHART_FONT, usePointStyle: true } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: CHART_FONT } },
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1, font: CHART_FONT } },
    },
  }

  if (chargement) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f7ff' }}>
      <NavbarShared />
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#f8f7ff' }}>
      <NavbarShared />

      {/* Header */}
      <div className="px-6 py-7" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #f5f3ff 100%)', borderBottom: '1px solid #ede9fe' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{salut}, {prenom} 👋</h1>
            <p className="text-sm text-gray-400 mt-1">Suivi de vos demandes d'aides publiques</p>
          </div>
          <Link to="/deposer" className="btn-gradient px-4 py-2 text-sm font-semibold rounded-lg no-underline"
            style={{ color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 8, fontFamily: 'inherit' }}>
            + Nouvelle demande
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total dossiers',  value: dossiers.length, color: '#6366f1' },
            { label: 'En instruction',  value: enInstruction,   color: '#f59e0b' },
            { label: 'Acceptés',        value: acceptes,        color: '#10b981' },
            { label: 'Refusés',         value: refuses,         color: '#ef4444' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4"
              style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)', borderTop: `3px solid ${s.color}` }}>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">{s.label}</p>
              <p className="text-3xl font-extrabold tracking-tight" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-2 gap-5 mb-6">

          {/* Donut répartition */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
            <p className="text-sm font-bold text-gray-900 mb-1">Répartition de vos dossiers</p>
            <p className="text-xs text-gray-400 mb-4">{dossiers.length} dossier{dossiers.length > 1 ? 's' : ''} au total</p>
            <div style={{ height: 220 }}>
              {dossiers.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">Aucun dossier</div>
              ) : (
                <Doughnut data={donutData} options={donutOptions} />
              )}
            </div>
          </div>

          {/* Line évolution */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
            <p className="text-sm font-bold text-gray-900 mb-1">Évolution de vos dossiers</p>
            <p className="text-xs text-gray-400 mb-4">6 derniers mois</p>
            <div style={{ height: 220 }}>
              <Line data={lineData} options={lineOptions} />
            </div>
          </div>
        </div>

        {/* Dossiers récents + Aides */}
        <div className="grid grid-cols-2 gap-5">

          {/* Dossiers récents */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Dossiers récents</span>
              <Link to="/mon-espace" className="text-xs font-semibold no-underline hover:underline" style={{ color: '#6366f1' }}>Voir tout →</Link>
            </div>
            {dossiers.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-3xl mb-3">📋</div>
                <p className="text-sm text-gray-400 mb-4">Aucun dossier déposé</p>
                <Link to="/deposer" className="btn-gradient px-3 py-1.5 text-xs font-semibold rounded-lg no-underline"
                  style={{ color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 8, fontFamily: 'inherit' }}>
                  Déposer une demande
                </Link>
              </div>
            ) : dossiers.slice(0, 5).map((d, i) => {
              const s = STATUT[d.statut] || STATUT.brouillon
              return (
                <div key={d.id} className={`px-5 py-3.5 flex items-center justify-between ${i < Math.min(4, dossiers.length - 1) ? 'border-b border-gray-50' : ''}`}>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#6366f1' }}>{d.numero}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(d.cree_le).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                </div>
              )
            })}
          </div>

          {/* Aides recommandées */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Aides recommandées</span>
              <Link to="/catalogue" className="text-xs font-semibold no-underline hover:underline" style={{ color: '#6366f1' }}>Voir tout →</Link>
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
                <Link to="/deposer" className="text-xs font-semibold no-underline hover:underline" style={{ color: '#6366f1' }}>Faire une demande →</Link>
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
