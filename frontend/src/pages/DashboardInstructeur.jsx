import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SidebarLayout, IconFolder, IconChart } from './SidebarLayout'
import api from '../api'

const INSTRUCTEUR_NAV = [
  { to: '/instructeur', label: 'Mes dossiers', Icon: IconFolder },
  { to: '/instructeur/dashboard', label: 'Dashboard', Icon: IconChart },
]

function BarH({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
        <span style={{ color: '#64748b' }}>{label}</span>
        <span style={{ color: '#0f172a', fontWeight: 700 }}>{value} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ background: '#f1f5f9', borderRadius: 100, height: 6 }}>
        <div style={{ width: `${pct}%`, height: 6, borderRadius: 100, background: color, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
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

  const enAttente = dossiers.filter(d => d.statut === 'depose' || d.statut === 'brouillon')
  const enInstruction = dossiers.filter(d => d.statut === 'en_instruction')
  const traites = dossiers.filter(d => d.statut === 'accepte' || d.statut === 'refuse')
  const prioritaires = [...enAttente].sort((a, b) => new Date(a.cree_le) - new Date(b.cree_le)).slice(0, 5)
  const tauxTraitement = dossiers.length ? Math.round(traites.length / dossiers.length * 100) : 0
  const joursAttente = (date) => Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))

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

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { label: 'En attente', value: enAttente.length, sub: 'À traiter', color: '#2563eb' },
          { label: 'En instruction', value: enInstruction.length, sub: 'En cours', color: '#d97706' },
          { label: 'Traités', value: traites.length, sub: `${dossiers.filter(d => d.statut === 'accepte').length} acc. · ${dossiers.filter(d => d.statut === 'refuse').length} ref.`, color: '#059669' },
          { label: 'Taux traitement', value: `${tauxTraitement}%`, sub: `Sur ${dossiers.length} dossiers`, color: '#7c3aed' },
        ].map((kpi, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14, width: '100%' }}>
        {/* Prioritaires */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Dossiers prioritaires</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Les plus anciens</span>
          </div>
          {prioritaires.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">✅</div>Aucun dossier en attente</div>
          ) : prioritaires.map((d, i) => {
            const jours = joursAttente(d.cree_le)
            const joursColor = jours > 10 ? '#dc2626' : jours > 5 ? '#d97706' : '#059669'
            const joursBg = jours > 10 ? '#fef2f2' : jours > 5 ? '#fffbeb' : '#ecfdf5'
            return (
              <div key={d.id} style={{ padding: '12px 16px', borderBottom: i < prioritaires.length - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb' }}>{d.numero}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{d.demandeur?.prenom} {d.demandeur?.nom}</div>
                </div>
                <span className="badge" style={{ background: joursBg, color: joursColor }}>{jours}j</span>
              </div>
            )
          })}
        </div>

        {/* Statistiques */}
        <div className="card" style={{ padding: 20 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>Statistiques</div>
          {[
            { label: 'Acceptés', value: dossiers.filter(d => d.statut === 'accepte').length, color: '#10b981' },
            { label: 'Refusés', value: dossiers.filter(d => d.statut === 'refuse').length, color: '#ef4444' },
            { label: 'En instruction', value: enInstruction.length, color: '#f59e0b' },
            { label: 'En attente', value: enAttente.length, color: '#3b82f6' },
          ].map((s, i) => <BarH key={i} {...s} max={Math.max(dossiers.length, 1)} />)}
        </div>
      </div>

      {/* Tableau en attente */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Tous les dossiers en attente</span>
          <span className="count-badge">{enAttente.length}</span>
        </div>
        {enAttente.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">✅</div>Aucun dossier en attente</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {['Numéro', 'Demandeur', 'Date dépôt', 'Ancienneté', 'Statut'].map(col => <th key={col}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {enAttente.sort((a, b) => new Date(a.cree_le) - new Date(b.cree_le)).map((d) => {
                const jours = joursAttente(d.cree_le)
                const joursColor = jours > 10 ? '#dc2626' : jours > 5 ? '#d97706' : '#059669'
                const joursBg = jours > 10 ? '#fef2f2' : jours > 5 ? '#fffbeb' : '#ecfdf5'
                return (
                  <tr key={d.id}>
                    <td><span style={{ fontWeight: 700, color: '#2563eb', fontSize: 13 }}>{d.numero}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{d.demandeur?.prenom} {d.demandeur?.nom}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{d.demandeur?.email}</div>
                    </td>
                    <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(d.cree_le).toLocaleDateString('fr-FR')}</td>
                    <td><span className="badge" style={{ background: joursBg, color: joursColor }}>{jours}j</span></td>
                    <td><span className="badge" style={{ background: '#eff6ff', color: '#2563eb' }}>{d.statut}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </SidebarLayout>
  )
}

export default DashboardInstructeur