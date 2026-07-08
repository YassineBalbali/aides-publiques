import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SidebarLayout, IconFolder, IconChart } from './SidebarLayout'
import api from '../api'
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const INSTRUCTEUR_NAV = [
  { to: '/instructeur', label: 'Mes dossiers', Icon: IconFolder },
  { to: '/instructeur/dashboard', label: 'Dashboard', Icon: IconChart },
]

function KpiCard({ label, value, sub, color, bg }) {
  return (
    <div className="kpi-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color }}>{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  )
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

function DashboardInstructeur() {
  const [dossiers, setDossiers] = useState([])
  const [chargement, setChargement] = useState(true)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    api.get('/dossiers/')
      .then(r => { setDossiers(r.data.filter(d => d.instructeur_id === payload.sub)); setChargement(false) })
      .catch(() => setChargement(false))
  }, [])

  const acceptes    = dossiers.filter(d => d.statut === 'accepte').length
  const refuses     = dossiers.filter(d => d.statut === 'refuse').length
  const enInstr     = dossiers.filter(d => d.statut === 'en_instruction').length
  const enAttente   = dossiers.filter(d => d.statut === 'depose' || d.statut === 'brouillon')
  const traites     = acceptes + refuses
  const tauxTraitement = dossiers.length ? Math.round(traites / dossiers.length * 100) : 0
  const joursAttente = (date) => Math.floor((new Date() - new Date(date)) / 86400000)
  const months = getLast6Months()

  // --- Chart 3 : Décisions par mois (empilé acceptés / refusés) ---
  const decisionsData = {
    labels: months.map(m => m.label),
    datasets: [
      {
        label: 'Acceptés',
        data: months.map(m => dossiers.filter(d => {
          const dt = new Date(d.cree_le)
          return d.statut === 'accepte' && dt.getFullYear() === m.year && dt.getMonth() === m.month
        }).length),
        backgroundColor: 'rgba(16,185,129,0.82)',
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: 'Refusés',
        data: months.map(m => dossiers.filter(d => {
          const dt = new Date(d.cree_le)
          return d.statut === 'refuse' && dt.getFullYear() === m.year && dt.getMonth() === m.month
        }).length),
        backgroundColor: 'rgba(239,68,68,0.78)',
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: 'Compléments',
        data: months.map(m => dossiers.filter(d => {
          const dt = new Date(d.cree_le)
          return d.statut === 'complement_demande' && dt.getFullYear() === m.year && dt.getMonth() === m.month
        }).length),
        backgroundColor: 'rgba(245,158,11,0.78)',
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  }
  const decisionsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { padding: 14, font: { size: 12, family: 'Inter' }, usePointStyle: true } },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { size: 12, family: 'Inter' } } },
      y: { stacked: true, beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1, font: { size: 12, family: 'Inter' } } },
    },
  }

  // --- Chart 4 : Taux d'acceptation par aide ---
  const aidesMap = {}
  dossiers.forEach(d => {
    const t = d.aide?.titre || 'Non spécifiée'
    if (!aidesMap[t]) aidesMap[t] = { acc: 0, ref: 0 }
    if (d.statut === 'accepte') aidesMap[t].acc++
    if (d.statut === 'refuse')  aidesMap[t].ref++
  })
  const aidesEntries = Object.entries(aidesMap)
    .filter(([, v]) => v.acc + v.ref > 0)
    .sort((a, b) => (b[1].acc + b[1].ref) - (a[1].acc + a[1].ref))
    .slice(0, 6)
  const tauxAideData = {
    labels: aidesEntries.map(([t]) => t.length > 28 ? t.slice(0, 25) + '…' : t),
    datasets: [
      {
        label: 'Acceptés',
        data: aidesEntries.map(([, v]) => v.acc),
        backgroundColor: 'rgba(16,185,129,0.82)',
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: 'Refusés',
        data: aidesEntries.map(([, v]) => v.ref),
        backgroundColor: 'rgba(239,68,68,0.78)',
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  }
  const tauxAideOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { padding: 14, font: { size: 12, family: 'Inter' }, usePointStyle: true } },
    },
    scales: {
      x: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1, font: { size: 12, family: 'Inter' } } },
      y: { grid: { display: false }, ticks: { font: { size: 11, family: 'Inter' } } },
    },
  }

  // --- Donut data ---
  const donutData = {
    labels: ['Acceptés', 'Refusés', 'En instruction', 'En attente'],
    datasets: [{
      data: [acceptes, refuses, enInstr, enAttente.length],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6366f1'],
      borderColor: ['#fff', '#fff', '#fff', '#fff'],
      borderWidth: 3,
      hoverOffset: 6,
    }],
  }
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 14, font: { size: 12, family: 'Inter' }, usePointStyle: true } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label} : ${ctx.parsed} dossier${ctx.parsed > 1 ? 's' : ''}` } },
    },
  }

  // --- Bar data (évolution 6 derniers mois) ---
  const barData = {
    labels: months.map(m => m.label),
    datasets: [
      {
        label: 'Déposés',
        data: months.map(m => dossiers.filter(d => {
          const dt = new Date(d.cree_le)
          return dt.getFullYear() === m.year && dt.getMonth() === m.month
        }).length),
        backgroundColor: 'rgba(99,102,241,0.75)',
        borderRadius: 7,
        barPercentage: 0.55,
      },
      {
        label: 'Acceptés',
        data: months.map(m => dossiers.filter(d => {
          const dt = new Date(d.cree_le)
          return d.statut === 'accepte' && dt.getFullYear() === m.year && dt.getMonth() === m.month
        }).length),
        backgroundColor: 'rgba(16,185,129,0.75)',
        borderRadius: 7,
        barPercentage: 0.55,
      },
    ],
  }
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { padding: 14, font: { size: 12, family: 'Inter' }, usePointStyle: true } },
      title: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 12, family: 'Inter' } } },
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1, font: { size: 12, family: 'Inter' } } },
    },
  }

  if (chargement) return (
    <SidebarLayout navItems={INSTRUCTEUR_NAV} role="instructeur" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#94a3b8', fontSize: 14 }}>Chargement...</div>
    </SidebarLayout>
  )

  return (
    <SidebarLayout navItems={INSTRUCTEUR_NAV} role="instructeur" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Suivi et traitement de vos dossiers</p>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <KpiCard label="En attente" value={enAttente.length} sub="À traiter" color="#6366f1" />
        <KpiCard label="En instruction" value={enInstr} sub="En cours" color="#f59e0b" />
        <KpiCard label="Traités" value={traites} sub={`${acceptes} acc. · ${refuses} ref.`} color="#10b981" />
        <KpiCard label="Taux traitement" value={`${tauxTraitement}%`} sub={`Sur ${dossiers.length} dossiers`} color="#7c3aed" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 14, marginBottom: 14 }}>

        {/* Donut — répartition statuts */}
        <div className="card" style={{ padding: 22 }}>
          <div className="card-title" style={{ marginBottom: 4 }}>Répartition des statuts</div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>{dossiers.length} dossiers au total</p>
          <div style={{ height: 240 }}>
            {dossiers.length === 0
              ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1', fontSize: 13 }}>Aucune donnée</div>
              : <Doughnut data={donutData} options={donutOptions} />
            }
          </div>
          {/* Centre label */}
          {dossiers.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Taux de traitement : </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>{tauxTraitement}%</span>
            </div>
          )}
        </div>

        {/* Bar — évolution mensuelle */}
        <div className="card" style={{ padding: 22 }}>
          <div className="card-title" style={{ marginBottom: 4 }}>Évolution mensuelle</div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>6 derniers mois</p>
          <div style={{ height: 240 }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Décisions par mois + taux par aide */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Décisions mensuelles empilées */}
        <div className="card" style={{ padding: 22 }}>
          <div className="card-title" style={{ marginBottom: 4 }}>Décisions par mois</div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>Acceptés · Refusés · Compléments — 6 derniers mois</p>
          <div style={{ height: 220 }}>
            {dossiers.length === 0
              ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1', fontSize: 13 }}>Aucune donnée</div>
              : <Bar data={decisionsData} options={decisionsOptions} />
            }
          </div>
        </div>

        {/* Taux acceptation / refus par aide */}
        <div className="card" style={{ padding: 22 }}>
          <div className="card-title" style={{ marginBottom: 4 }}>Acceptation / Refus par aide</div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>Dossiers traités par type d'aide</p>
          <div style={{ height: 220 }}>
            {aidesEntries.length === 0
              ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1', fontSize: 13 }}>Aucune décision enregistrée</div>
              : <Bar data={tauxAideData} options={tauxAideOptions} />
            }
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default DashboardInstructeur
