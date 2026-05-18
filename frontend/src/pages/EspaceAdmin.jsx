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

const STATUT = {
  brouillon: { label: 'Brouillon', bg: '#f1f5f9', color: '#64748b' },
  depose: { label: 'Déposé', bg: '#eff6ff', color: '#2563eb' },
  en_instruction: { label: 'En instruction', bg: '#fffbeb', color: '#d97706' },
  accepte: { label: 'Accepté', bg: '#ecfdf5', color: '#059669' },
  refuse: { label: 'Refusé', bg: '#fef2f2', color: '#dc2626' },
  complement_demande: { label: 'Complément', bg: '#fff7ed', color: '#ea580c' },
}

function EspaceAdmin() {
  const [dossiers, setDossiers] = useState([])
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null

  useEffect(() => {
    api.get('/dossiers/')
      .then(r => { setDossiers(r.data); setChargement(false) })
      .catch(() => setChargement(false))
  }, [])

  const changerStatut = async (id, statut) => {
    try {
      await api.patch(`/dossiers/${id}/statut?statut=${statut}`)
      setDossiers(prev => prev.map(d => d.id === id ? { ...d, statut } : d))
    } catch (err) { console.error(err) }
  }

  const dossiersFiltres = dossiers.filter(d => {
    const nom = `${d.demandeur?.prenom || ''} ${d.demandeur?.nom || ''} ${d.demandeur?.email || ''}`.toLowerCase()
    return nom.includes(recherche.toLowerCase()) && (filtreStatut ? d.statut === filtreStatut : true)
  })

  const kpis = [
    { label: 'Total', value: dossiers.length, color: '#2563eb' },
    { label: 'Déposés', value: dossiers.filter(d => d.statut === 'depose').length, color: '#7c3aed' },
    { label: 'En instruction', value: dossiers.filter(d => d.statut === 'en_instruction').length, color: '#d97706' },
    { label: 'Acceptés', value: dossiers.filter(d => d.statut === 'accepte').length, color: '#059669' },
    { label: 'Refusés', value: dossiers.filter(d => d.statut === 'refuse').length, color: '#dc2626' },
  ]

  return (
    <SidebarLayout navItems={ADMIN_NAV} role="admin" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div className="page-header">
        <h1 className="page-title">Gestion des dossiers</h1>
        <p className="page-subtitle">Instruisez et suivez les dossiers déposés</p>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        {kpis.map((s, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <input className="search-input" type="text" placeholder="Rechercher par nom ou email..." value={recherche} onChange={e => setRecherche(e.target.value)} />
        <select className="select-input" value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="depose">Déposé</option>
          <option value="en_instruction">En instruction</option>
          <option value="accepte">Accepté</option>
          <option value="refuse">Refusé</option>
        </select>
        <button className="btn btn-secondary btn-sm" onClick={() => window.open('http://127.0.0.1:8000/dossiers/export/csv', '_blank')}>⬇ CSV</button>
        <button className="btn btn-secondary btn-sm" onClick={() => window.open('http://127.0.0.1:8000/dossiers/export/json', '_blank')}>⬇ JSON</button>
        <span className="count-badge">{dossiersFiltres.length} dossier(s)</span>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              {['Numéro', 'Demandeur', 'Commentaire', 'Statut', 'Actions'].map(col => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chargement ? (
              <tr><td colSpan={5} className="empty-state">Chargement...</td></tr>
            ) : dossiersFiltres.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon">📭</div>Aucun dossier trouvé</div></td></tr>
            ) : dossiersFiltres.map((d) => {
              const s = STATUT[d.statut] || STATUT.brouillon
              return (
                <tr key={d.id}>
                  <td><span style={{ fontWeight: 700, color: '#2563eb', fontSize: 13 }}>{d.numero}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div className="avatar" style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', fontSize: 11 }}>
                        {(d.demandeur?.prenom?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{d.demandeur?.prenom} {d.demandeur?.nom}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{d.demandeur?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 12, color: '#64748b' }}>
                      {d.commentaire || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </td>
                  <td>
                    <div className="action-row">
                      <button className="btn btn-sm btn-success-sm" onClick={() => changerStatut(d.id, 'accepte')}>✓ Accepter</button>
                      <button className="btn btn-sm btn-danger-sm" onClick={() => changerStatut(d.id, 'refuse')}>✕ Refuser</button>
                      <button className="btn btn-sm btn-warning-sm" onClick={() => changerStatut(d.id, 'en_instruction')}>⟳ Instruire</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </SidebarLayout>
  )
}

export default EspaceAdmin