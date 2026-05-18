import { useState, useEffect } from 'react'
import { SidebarLayout, IconFolder, IconList, IconUsers, IconLink, IconChart, IconSettings, IconUser } from './SidebarLayout'
import api from '../api'

const ADMIN_NAV = [
  { to: '/admin/dossiers', label: 'Dossiers', Icon: IconFolder },
  { to: '/admin/aides', label: 'Gestion Aides', Icon: IconList },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', Icon: IconUsers },
  { to: '/admin/affectations', label: 'Affectations', Icon: IconLink },
  { to: '/admin/dashboard', label: 'Dashboard', Icon: IconChart },
  { to: '/admin/parametres', label: 'Paramètres', Icon: IconSettings },
  { to: '/profil', label: 'Profil', Icon: IconUser },
]

const ROLE_COLORS = {
  admin: { bg: '#fef2f2', color: '#dc2626', label: 'Admin' },
  instructeur: { bg: '#eff6ff', color: '#2563eb', label: 'Instructeur' },
  demandeur: { bg: '#ecfdf5', color: '#059669', label: 'Demandeur' },
}

// SVG Donut Chart
function DonutChart({ data, size = 140 }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <div style={{ width: size, height: size, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#94a3b8' }}>Vide</div>

  const cx = size / 2, cy = size / 2, r = size / 2 - 12, innerR = size / 2 - 30
  let cumAngle = -Math.PI / 2

  const arcs = data.filter(d => d.value > 0).map(d => {
    const angle = (d.value / total) * 2 * Math.PI
    const x1 = cx + r * Math.cos(cumAngle), y1 = cy + r * Math.sin(cumAngle)
    cumAngle += angle
    const x2 = cx + r * Math.cos(cumAngle), y2 = cy + r * Math.sin(cumAngle)
    const ix1 = cx + innerR * Math.cos(cumAngle - angle), iy1 = cy + innerR * Math.sin(cumAngle - angle)
    const ix2 = cx + innerR * Math.cos(cumAngle), iy2 = cy + innerR * Math.sin(cumAngle)
    const large = angle > Math.PI ? 1 : 0
    return { ...d, path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z` }
  })

  return (
    <svg width={size} height={size}>
      {arcs.map((arc, i) => (
        <path key={i} d={arc.path} fill={arc.color} opacity={0.9} />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="800" fill="#0f172a" fontFamily="Plus Jakarta Sans, sans-serif">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="Plus Jakarta Sans, sans-serif">total</text>
    </svg>
  )
}

// Bar Chart SVG
function BarChart({ data, height = 100 }) {
  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: height + 32, paddingBottom: 20, position: 'relative' }}>
      {data.map((item, i) => {
        const barH = item.value > 0 ? Math.max((item.value / max) * height, 6) : 4
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative' }}>
            {item.value > 0 && (
              <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600, marginBottom: 2 }}>{item.value}</span>
            )}
            <div style={{ width: '100%', height: barH, borderRadius: '3px 3px 0 0', background: item.value > 0 ? '#2563eb' : '#e8ecf4', opacity: item.value > 0 ? 0.85 : 1 }} />
            <span style={{ fontSize: 9, color: '#94a3b8', marginTop: 4, whiteSpace: 'nowrap' }}>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function Dashboard() {
  const [dossiers, setDossiers] = useState([])
  const [aides, setAides] = useState([])
  const [utilisateurs, setUtilisateurs] = useState([])
  const [chargement, setChargement] = useState(true)

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null

  useEffect(() => {
    Promise.all([api.get('/dossiers/'), api.get('/aides/'), api.get('/auth/utilisateurs')])
      .then(([d, a, u]) => { setDossiers(d.data); setAides(a.data); setUtilisateurs(u.data); setChargement(false) })
      .catch(() => setChargement(false))
  }, [])

  const tauxAcceptation = dossiers.length ? Math.round(dossiers.filter(d => d.statut === 'accepte').length / dossiers.length * 100) : 0

  const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  const dataMois = mois.map((label, i) => ({
    label,
    value: dossiers.filter(d => new Date(d.cree_le).getMonth() === i).length
  }))

  const donutStatuts = [
    { label: 'Brouillon', value: dossiers.filter(d => d.statut === 'brouillon').length, color: '#e2e8f0' },
    { label: 'Déposé', value: dossiers.filter(d => d.statut === 'depose').length, color: '#3b82f6' },
    { label: 'En instruction', value: dossiers.filter(d => d.statut === 'en_instruction').length, color: '#f59e0b' },
    { label: 'Accepté', value: dossiers.filter(d => d.statut === 'accepte').length, color: '#10b981' },
    { label: 'Refusé', value: dossiers.filter(d => d.statut === 'refuse').length, color: '#ef4444' },
  ]

  const donutRoles = [
    { label: 'Admins', value: utilisateurs.filter(u => u.role === 'admin').length, color: '#ef4444' },
    { label: 'Instructeurs', value: utilisateurs.filter(u => u.role === 'instructeur').length, color: '#6366f1' },
    { label: 'Demandeurs', value: utilisateurs.filter(u => u.role === 'demandeur').length, color: '#10b981' },
  ]

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
          { label: 'Total Dossiers', value: dossiers.length, sub: `${dossiers.filter(d => d.statut === 'depose').length} en attente`, color: '#2563eb' },
          { label: 'Aides Actives', value: aides.filter(a => a.statut === 'active').length, sub: `${aides.length} au total`, color: '#059669' },
          { label: 'Utilisateurs', value: utilisateurs.length, sub: `${utilisateurs.filter(u => u.role === 'demandeur').length} demandeurs`, color: '#7c3aed' },
          { label: 'Taux Acceptation', value: `${tauxAcceptation}%`, sub: `${dossiers.filter(d => d.statut === 'accepte').length} acceptés`, color: '#d97706' },
        ].map((kpi, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14, width: '100%' }}>
        {/* Statuts donut */}
        <div className="card" style={{ padding: 20 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>Dossiers par statut</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <DonutChart data={donutStatuts} size={140} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {donutStatuts.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#64748b', flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dossiers par mois bars */}
        <div className="card" style={{ padding: 20 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>Dossiers déposés par mois</div>
          <BarChart data={dataMois} height={100} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14, width: '100%' }}>
        {/* Rôles donut */}
        <div className="card" style={{ padding: 20 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>Répartition des utilisateurs</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <DonutChart data={donutRoles} size={120} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {donutRoles.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: r.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#64748b', flex: 1 }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aides par type */}
        <div className="card" style={{ padding: 20 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>Aides par type</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Subventions', key: 'subvention', color: '#3b82f6' },
              { label: 'Prêts', key: 'pret', color: '#8b5cf6' },
              { label: 'Exonérations', key: 'exoneration', color: '#10b981' },
              { label: 'Formations', key: 'formation', color: '#f59e0b' },
            ].map(t => {
              const count = aides.filter(a => a.type_aide === t.key).length
              const pct = aides.length ? Math.round(count / aides.length * 100) : 0
              return (
                <div key={t.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#64748b' }}>{t.label}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{count} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: 100, height: 6 }}>
                    <div style={{ width: `${pct}%`, height: 6, borderRadius: 100, background: t.color, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Derniers utilisateurs */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Derniers utilisateurs inscrits</span>
          <span className="count-badge">{utilisateurs.length}</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              {['Nom', 'Email', 'Rôle', 'Inscription'].map(col => <th key={col}>{col}</th>)}
            </tr>
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