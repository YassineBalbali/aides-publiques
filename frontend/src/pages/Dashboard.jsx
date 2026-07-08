import { useState, useEffect } from 'react'
import { SidebarLayout, IconFolder, IconList, IconUsers, IconLink, IconChart, IconSettings, IconUser } from './SidebarLayout'
import api from '../api'
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler,
} from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler)

const ADMIN_NAV = [
  { to: '/admin/dossiers',      label: 'Dossiers',        Icon: IconFolder },
  { to: '/admin/aides',         label: 'Gestion Aides',   Icon: IconList },
  { to: '/admin/utilisateurs',  label: 'Utilisateurs',    Icon: IconUsers },
  { to: '/admin/affectations',  label: 'Affectations',    Icon: IconLink },
  { to: '/admin/dashboard',     label: 'Dashboard',       Icon: IconChart },
  { to: '/admin/parametres',    label: 'Paramètres',      Icon: IconSettings },
  { to: '/profil',              label: 'Profil',           Icon: IconUser },
]

const ROLE_COLORS = {
  admin:       { bg: '#fef2f2', color: '#dc2626', label: 'Admin' },
  instructeur: { bg: '#eff6ff', color: '#2563eb', label: 'Instructeur' },
  demandeur:   { bg: '#ecfdf5', color: '#059669', label: 'Demandeur' },
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
const GRID_COLOR = '#f1f5f9'

function Dashboard() {
  const [dossiers, setDossiers]       = useState([])
  const [aides, setAides]             = useState([])
  const [utilisateurs, setUtilisateurs] = useState([])
  const [chargement, setChargement]   = useState(true)

  const token   = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null

  useEffect(() => {
    Promise.all([api.get('/dossiers/'), api.get('/aides/'), api.get('/auth/utilisateurs')])
      .then(([d, a, u]) => { setDossiers(d.data); setAides(a.data); setUtilisateurs(u.data); setChargement(false) })
      .catch(() => setChargement(false))
  }, [])

  const acceptes       = dossiers.filter(d => d.statut === 'accepte').length
  const refuses        = dossiers.filter(d => d.statut === 'refuse').length
  const enInstruction  = dossiers.filter(d => d.statut === 'en_instruction').length
  const enAttente      = dossiers.filter(d => d.statut === 'depose').length
  const brouillons     = dossiers.filter(d => d.statut === 'brouillon').length
  const tauxAcceptation = dossiers.length ? Math.round(acceptes / dossiers.length * 100) : 0

  const months = getLast6Months()

  // --- Donut : statuts ---
  const donutStatutsData = {
    labels: ['Brouillon', 'Déposé', 'En instruction', 'Accepté', 'Refusé'],
    datasets: [{
      data: [brouillons, enAttente, enInstruction, acceptes, refuses],
      backgroundColor: ['#e2e8f0', '#6366f1', '#f59e0b', '#10b981', '#ef4444'],
      borderColor: '#fff',
      borderWidth: 3,
      hoverOffset: 6,
    }],
  }

  // --- Donut : rôles utilisateurs ---
  const donutRolesData = {
    labels: ['Admins', 'Instructeurs', 'Demandeurs'],
    datasets: [{
      data: [
        utilisateurs.filter(u => u.role === 'admin').length,
        utilisateurs.filter(u => u.role === 'instructeur').length,
        utilisateurs.filter(u => u.role === 'demandeur').length,
      ],
      backgroundColor: ['#ef4444', '#6366f1', '#10b981'],
      borderColor: '#fff',
      borderWidth: 3,
      hoverOffset: 6,
    }],
  }

  const donutOptions = (total, label) => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 14, font: CHART_FONT, usePointStyle: true } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label} : ${ctx.parsed}` } },
    },
  })

  // --- Line : évolution 6 mois ---
  const lineData = {
    labels: months.map(m => m.label),
    datasets: [
      {
        label: 'Déposés',
        data: months.map(m => dossiers.filter(d => {
          const dt = new Date(d.cree_le)
          return dt.getFullYear() === m.year && dt.getMonth() === m.month
        }).length),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.10)',
        fill: true,
        tension: 0.42,
        pointRadius: 4,
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
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
      },
      {
        label: 'Refusés',
        data: months.map(m => dossiers.filter(d => {
          const dt = new Date(d.cree_le)
          return d.statut === 'refuse' && dt.getFullYear() === m.year && dt.getMonth() === m.month
        }).length),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.07)',
        fill: true,
        tension: 0.42,
        pointRadius: 4,
        pointBackgroundColor: '#ef4444',
      },
    ],
  }
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { padding: 16, font: CHART_FONT, usePointStyle: true } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: CHART_FONT } },
      y: { beginAtZero: true, grid: { color: GRID_COLOR }, ticks: { stepSize: 1, font: CHART_FONT } },
    },
  }

  // --- Bar horizontal : aides par type ---
  const aidesTypes = [
    { label: 'Subvention',  key: 'subvention',  color: 'rgba(99,102,241,0.75)' },
    { label: 'Prêt',        key: 'pret',         color: 'rgba(139,92,246,0.75)' },
    { label: 'Exonération', key: 'exoneration',  color: 'rgba(16,185,129,0.75)' },
    { label: 'Formation',   key: 'formation',    color: 'rgba(245,158,11,0.75)' },
  ]
  const barAidesData = {
    labels: aidesTypes.map(t => t.label),
    datasets: [{
      label: 'Nombre d\'aides',
      data: aidesTypes.map(t => aides.filter(a => a.type_aide === t.key).length),
      backgroundColor: aidesTypes.map(t => t.color),
      borderRadius: 7,
      barPercentage: 0.6,
    }],
  }
  const barAidesOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { beginAtZero: true, grid: { color: GRID_COLOR }, ticks: { stepSize: 1, font: CHART_FONT } },
      y: { grid: { display: false }, ticks: { font: CHART_FONT } },
    },
  }

  if (chargement) return (
    <SidebarLayout navItems={ADMIN_NAV} role="admin" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#94a3b8', fontSize: 14 }}>Chargement...</div>
    </SidebarLayout>
  )

  return (
    <SidebarLayout navItems={ADMIN_NAV} role="admin" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Vue d'ensemble analytique de la plateforme</p>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { label: 'Total Dossiers',    value: dossiers.length,                                sub: `${enAttente} en attente`,                           color: '#6366f1' },
          { label: 'Aides Actives',     value: aides.filter(a => a.statut === 'active').length, sub: `${aides.length} au total`,                          color: '#10b981' },
          { label: 'Utilisateurs',      value: utilisateurs.length,                             sub: `${utilisateurs.filter(u=>u.role==='demandeur').length} demandeurs`, color: '#7c3aed' },
          { label: 'Taux Acceptation',  value: `${tauxAcceptation}%`,                          sub: `${acceptes} acceptés`,                              color: '#f59e0b' },
        ].map((kpi, i) => (
          <div className="kpi-card" key={i} style={{ borderTop: `3px solid ${kpi.color}` }}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Ligne 1 : Donut statuts + Line évolution */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, marginBottom: 14 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="card-title" style={{ marginBottom: 4 }}>Dossiers par statut</div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14 }}>{dossiers.length} dossiers au total</p>
          <div style={{ height: 220 }}>
            {dossiers.length === 0
              ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1', fontSize: 13 }}>Aucune donnée</div>
              : <Doughnut data={donutStatutsData} options={donutOptions(dossiers.length, 'dossiers')} />
            }
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div className="card-title" style={{ marginBottom: 4 }}>Évolution des dossiers</div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14 }}>6 derniers mois</p>
          <div style={{ height: 220 }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>

      {/* Ligne 2 : Donut rôles + Bar aides par type */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, marginBottom: 14 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="card-title" style={{ marginBottom: 4 }}>Répartition utilisateurs</div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14 }}>{utilisateurs.length} comptes au total</p>
          <div style={{ height: 220 }}>
            {utilisateurs.length === 0
              ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1', fontSize: 13 }}>Aucune donnée</div>
              : <Doughnut data={donutRolesData} options={donutOptions(utilisateurs.length, 'utilisateurs')} />
            }
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div className="card-title" style={{ marginBottom: 4 }}>Aides par type</div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14 }}>{aides.length} aides enregistrées</p>
          <div style={{ height: 220 }}>
            {aides.length === 0
              ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1', fontSize: 13 }}>Aucune donnée</div>
              : <Bar data={barAidesData} options={barAidesOptions} />
            }
          </div>
        </div>
      </div>

      {/* Table : derniers utilisateurs */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Derniers utilisateurs inscrits</span>
          <span className="count-badge">{utilisateurs.length}</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>{['Nom', 'Email', 'Rôle', 'Inscription'].map(col => <th key={col}>{col}</th>)}</tr>
          </thead>
          <tbody>
            {utilisateurs.slice(0, 8).map((u, i) => {
              const rc = ROLE_COLORS[u.role] || { bg: '#f1f5f9', color: '#64748b', label: u.role }
              return (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div className="avatar" style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', fontSize: 10 }}>
                        {(u.prenom?.[0] || u.email[0]).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{u.prenom} {u.nom}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{u.email}</td>
                  <td><span className="badge" style={{ background: rc.bg, color: rc.color }}>{rc.label}</span></td>
                  <td style={{ fontSize: 12, color: '#94a3b8' }}>{u.cree_le ? new Date(u.cree_le).toLocaleDateString('fr-FR') : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </SidebarLayout>
  )
}

export default Dashboard
