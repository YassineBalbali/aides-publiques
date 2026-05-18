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
}

// Bug fix: LigneDossier retourne directement les <td>, pas un <tr> imbriqué dans un <tr>
function LigneDossier({ dossier, instructeurs, onAffecter }) {
  const [selectVal, setSelectVal] = useState(dossier.instructeur_id || '')
  const s = STATUT[dossier.statut] || STATUT.brouillon

  const instructeurActuel = instructeurs.find(i => i.id === dossier.instructeur_id)

  return (
    <>
      <td style={{ padding: '12px 16px' }}>
        <span style={{ fontWeight: 700, color: '#2563eb', fontSize: 13 }}>{dossier.numero}</span>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div className="avatar" style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', fontSize: 11 }}>
            {(dossier.demandeur?.prenom?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{dossier.demandeur?.prenom} {dossier.demandeur?.nom}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{dossier.demandeur?.email}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
      </td>
      <td style={{ padding: '12px 16px' }}>
        {instructeurActuel ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div className="avatar" style={{ width: 24, height: 24, background: '#2563eb', fontSize: 10 }}>
              {instructeurActuel.prenom?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>{instructeurActuel.prenom} {instructeurActuel.nom}</span>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>Non affecté</span>
        )}
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div className="action-row">
          <select
            value={selectVal}
            onChange={e => setSelectVal(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 7, fontSize: 12, border: '1px solid #e8ecf4', background: '#f8fafc', color: '#374151', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
            <option value="">Choisir un instructeur...</option>
            {instructeurs.map(i => <option key={i.id} value={i.id}>{i.prenom} {i.nom}</option>)}
          </select>
          <button
            onClick={() => selectVal && onAffecter(dossier.id, selectVal)}
            disabled={!selectVal}
            className="btn btn-sm"
            style={{ background: selectVal ? '#2563eb' : '#f1f5f9', color: selectVal ? '#fff' : '#94a3b8', cursor: selectVal ? 'pointer' : 'not-allowed' }}>
            Affecter
          </button>
        </div>
      </td>
    </>
  )
}

function AffectationDossiers() {
  const [dossiers, setDossiers] = useState([])
  const [instructeurs, setInstructeurs] = useState([])
  const [chargement, setChargement] = useState(true)
  const [message, setMessage] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null

  useEffect(() => {
    Promise.all([api.get('/dossiers/'), api.get('/auth/utilisateurs')])
      .then(([d, u]) => {
        setDossiers(d.data)
        setInstructeurs(u.data.filter(u => u.role === 'instructeur'))
        setChargement(false)
      }).catch(() => setChargement(false))
  }, [])

  const affecter = async (dossierId, instructeurId) => {
    try {
      await api.patch(`/dossiers/${dossierId}/affecter?instructeur_id=${instructeurId}`)
      setDossiers(prev => prev.map(d => d.id === dossierId ? { ...d, instructeur_id: parseInt(instructeurId), statut: 'en_instruction' } : d))
      setMessage('Dossier affecté avec succès !')
      setTimeout(() => setMessage(''), 3000)
    } catch { setMessage('Erreur lors de l\'affectation'); setTimeout(() => setMessage(''), 3000) }
  }

  const dossiersFiltres = dossiers.filter(d => filtreStatut ? d.statut === filtreStatut : true)
  const nonAffectes = dossiers.filter(d => !d.instructeur_id).length

  return (
    <SidebarLayout navItems={ADMIN_NAV} role="admin" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div className="page-header">
        <h1 className="page-title">Affectations</h1>
        <p className="page-subtitle">Assignez les dossiers aux instructeurs</p>
      </div>

      {message && <div className="alert-success">✓ {message}</div>}

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {[
          { label: 'Total dossiers', value: dossiers.length, color: '#2563eb' },
          { label: 'Non affectés', value: nonAffectes, color: nonAffectes > 0 ? '#d97706' : '#059669' },
          { label: 'Instructeurs', value: instructeurs.length, color: '#7c3aed' },
        ].map((s, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <select className="select-input" value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="depose">Déposé</option>
          <option value="en_instruction">En instruction</option>
          <option value="accepte">Accepté</option>
          <option value="refuse">Refusé</option>
        </select>
        {filtreStatut && (
          <button className="btn btn-sm btn-danger-sm" onClick={() => setFiltreStatut('')}>✕ Réinitialiser</button>
        )}
        <span className="count-badge" style={{ marginLeft: 'auto' }}>{dossiersFiltres.length} dossier(s)</span>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              {['Numéro', 'Demandeur', 'Statut', 'Instructeur actuel', 'Affecter'].map(col => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {chargement ? (
              <tr><td colSpan={5} className="empty-state">Chargement...</td></tr>
            ) : dossiersFiltres.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon">🔗</div>Aucun dossier trouvé</div></td></tr>
            ) : dossiersFiltres.map((d) => (
              <tr key={d.id}>
                <LigneDossier dossier={d} instructeurs={instructeurs} onAffecter={affecter} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SidebarLayout>
  )
}

export default AffectationDossiers