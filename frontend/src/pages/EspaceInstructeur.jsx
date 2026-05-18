import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SidebarLayout, IconFolder, IconChart } from './SidebarLayout'
import api from '../api'

const INSTRUCTEUR_NAV = [
  { to: '/instructeur', label: 'Mes dossiers', Icon: IconFolder },
  { to: '/instructeur/dashboard', label: 'Dashboard', Icon: IconChart },
]

const STATUT = {
  brouillon: { label: 'Brouillon', bg: '#f1f5f9', color: '#64748b' },
  depose: { label: 'Déposé', bg: '#eff6ff', color: '#2563eb' },
  en_instruction: { label: 'En instruction', bg: '#fffbeb', color: '#d97706' },
  accepte: { label: 'Accepté', bg: '#ecfdf5', color: '#059669' },
  refuse: { label: 'Refusé', bg: '#fef2f2', color: '#dc2626' },
  complement_demande: { label: 'Complément', bg: '#fff7ed', color: '#ea580c' },
}

function EspaceInstructeur() {
  const [dossiers, setDossiers] = useState([])
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [filtreDate, setFiltreDate] = useState('')
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    api.get('/dossiers/')
      .then(r => { setDossiers(r.data.filter(d => d.instructeur_id === payload.sub)); setChargement(false) })
      .catch(() => setChargement(false))
  }, [])

  const dossiersFiltres = dossiers.filter(d => {
    const nom = `${d.demandeur?.prenom || ''} ${d.demandeur?.nom || ''} ${d.numero || ''}`.toLowerCase()
    const matchRecherche = nom.includes(recherche.toLowerCase())
    const matchStatut = filtreStatut ? d.statut === filtreStatut : true
    const matchDate = filtreDate ? new Date(d.cree_le).toISOString().split('T')[0] >= filtreDate : true
    return matchRecherche && matchStatut && matchDate
  })

  const hasFilters = filtreStatut || filtreDate || recherche

  return (
    <SidebarLayout navItems={INSTRUCTEUR_NAV} role="instructeur" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div className="page-header">
        <h1 className="page-title">Mes dossiers</h1>
        <p className="page-subtitle">Dossiers qui vous sont affectés</p>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { label: 'Total', value: dossiers.length, color: '#2563eb' },
          { label: 'En attente', value: dossiers.filter(d => d.statut === 'depose').length, color: '#d97706' },
          { label: 'En instruction', value: dossiers.filter(d => d.statut === 'en_instruction').length, color: '#7c3aed' },
          { label: 'Traités', value: dossiers.filter(d => d.statut === 'accepte' || d.statut === 'refuse').length, color: '#059669' },
        ].map((s, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <input className="search-input" type="text" placeholder="Rechercher par nom ou numéro..." value={recherche} onChange={e => setRecherche(e.target.value)} />
        <select className="select-input" value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="depose">Déposé</option>
          <option value="en_instruction">En instruction</option>
          <option value="accepte">Accepté</option>
          <option value="refuse">Refusé</option>
        </select>
        <input type="date" value={filtreDate} onChange={e => setFiltreDate(e.target.value)} className="select-input" />
        {hasFilters && (
          <button className="btn btn-sm btn-danger-sm" onClick={() => { setRecherche(''); setFiltreStatut(''); setFiltreDate('') }}>
            ✕ Réinitialiser
          </button>
        )}
        <span className="count-badge">{dossiersFiltres.length} dossier(s)</span>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              {['Numéro', 'Demandeur', 'Date dépôt', 'Statut', 'Action'].map(col => (
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
              const jours = Math.floor((new Date() - new Date(d.cree_le)) / (1000 * 60 * 60 * 24))
              const joursColor = jours > 10 ? '#dc2626' : jours > 5 ? '#d97706' : '#059669'
              const joursBg = jours > 10 ? '#fef2f2' : jours > 5 ? '#fffbeb' : '#ecfdf5'
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
                  <td>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{new Date(d.cree_le).toLocaleDateString('fr-FR')}</div>
                    <span className="badge" style={{ background: joursBg, color: joursColor, marginTop: 3 }}>{jours}j</span>
                  </td>
                  <td><span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span></td>
                  <td>
                    <Link to={`/instructeur/dossier/${d.id}`} className="btn btn-sm btn-blue-sm" style={{ textDecoration: 'none' }}>
                      Traiter →
                    </Link>
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

export default EspaceInstructeur