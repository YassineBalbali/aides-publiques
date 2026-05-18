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

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#2563eb', '#059669', '#d97706', '#dc2626']

function GestionUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [chargement, setChargement] = useState(true)
  const [recherche, setRecherche] = useState('')
  const [filtreRole, setFiltreRole] = useState('')
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', mot_de_passe: '' })
  const [creationEnCours, setCreationEnCours] = useState(false)

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null

  useEffect(() => { chargerUtilisateurs() }, [])

  const chargerUtilisateurs = () => {
    api.get('/auth/utilisateurs').then(r => { setUtilisateurs(r.data); setChargement(false) }).catch(() => setChargement(false))
  }

  const showMsg = (msg, isErr = false) => {
    if (isErr) { setErreur(msg); setMessage('') } else { setMessage(msg); setErreur('') }
    setTimeout(() => { setMessage(''); setErreur('') }, 3000)
  }

  const changerRole = async (id, role) => {
    try {
      await api.put(`/auth/utilisateurs/${id}`, { role })
      setUtilisateurs(prev => prev.map(u => u.id === id ? { ...u, role } : u))
      showMsg('Rôle mis à jour !')
    } catch { showMsg('Erreur lors de la mise à jour', true) }
  }

  const supprimerUtilisateur = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try { await api.delete(`/auth/utilisateurs/${id}`); chargerUtilisateurs() }
    catch { showMsg('Erreur lors de la suppression', true) }
  }

  const creerInstructeur = async () => {
    if (!form.prenom || !form.nom || !form.email || !form.mot_de_passe) { showMsg('Tous les champs sont obligatoires', true); return }
    setCreationEnCours(true)
    try {
      const res = await api.post('/auth/register', { ...form })
      await api.put(`/auth/utilisateurs/${res.data.id}`, { role: 'instructeur' })
      showMsg('Instructeur créé avec succès !')
      setShowForm(false)
      setForm({ prenom: '', nom: '', email: '', mot_de_passe: '' })
      chargerUtilisateurs()
    } catch (err) { showMsg(err.response?.data?.detail || 'Erreur', true) }
    finally { setCreationEnCours(false) }
  }

  const utilisateursFiltres = utilisateurs.filter(u => {
    const nom = `${u.prenom || ''} ${u.nom || ''} ${u.email}`.toLowerCase()
    return nom.includes(recherche.toLowerCase()) && (filtreRole ? u.role === filtreRole : true)
  })

  return (
    <SidebarLayout navItems={ADMIN_NAV} role="admin" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">Gérez les comptes et les rôles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Créer un instructeur</button>
      </div>

      {message && <div className="alert-success">✓ {message}</div>}
      {erreur && <div className="alert-error">✕ {erreur}</div>}

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { label: 'Total', value: utilisateurs.length, color: '#2563eb' },
          { label: 'Admins', value: utilisateurs.filter(u => u.role === 'admin').length, color: '#dc2626' },
          { label: 'Instructeurs', value: utilisateurs.filter(u => u.role === 'instructeur').length, color: '#7c3aed' },
          { label: 'Demandeurs', value: utilisateurs.filter(u => u.role === 'demandeur').length, color: '#059669' },
        ].map((s, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <input className="search-input" type="text" placeholder="Rechercher un utilisateur..." value={recherche} onChange={e => setRecherche(e.target.value)} />
        <select className="select-input" value={filtreRole} onChange={e => setFiltreRole(e.target.value)}>
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="instructeur">Instructeur</option>
          <option value="demandeur">Demandeur</option>
        </select>
        <span className="count-badge">{utilisateursFiltres.length} utilisateur(s)</span>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              {['Utilisateur', 'Email', 'Rôle', 'Inscription', 'Actions'].map(col => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {chargement ? (
              <tr><td colSpan={5} className="empty-state">Chargement...</td></tr>
            ) : utilisateursFiltres.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon">👥</div>Aucun utilisateur trouvé</div></td></tr>
            ) : utilisateursFiltres.map((u, i) => {
              const rc = ROLE_COLORS[u.role] || { bg: '#f1f5f9', color: '#64748b', label: u.role }
              const avatarColor = AVATAR_COLORS[u.id % AVATAR_COLORS.length]
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 32, height: 32, background: avatarColor, fontSize: 12 }}>
                        {(u.prenom?.[0] || u.email[0]).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{u.prenom} {u.nom}</span>
                    </div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{u.email}</td>
                  <td><span className="badge" style={{ background: rc.bg, color: rc.color }}>{rc.label}</span></td>
                  <td style={{ fontSize: 12, color: '#94a3b8' }}>{u.cree_le ? new Date(u.cree_le).toLocaleDateString('fr-FR') : '—'}</td>
                  <td>
                    <div className="action-row">
                      <select
                        value={u.role}
                        onChange={e => changerRole(u.id, e.target.value)}
                        style={{ padding: '5px 8px', borderRadius: 6, fontSize: 12, border: '1px solid #e8ecf4', background: '#fff', color: '#374151', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <option value="demandeur">Demandeur</option>
                        <option value="instructeur">Instructeur</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button className="btn btn-sm btn-danger-sm" onClick={() => supprimerUtilisateur(u.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <h2 className="modal-title">Créer un instructeur</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20, marginTop: -12 }}>Le compte sera automatiquement configuré avec le rôle Instructeur.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group"><label className="form-label">Prénom</label><input className="form-input" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Nom</label><input className="form-input" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
              </div>
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Mot de passe</label><input type="password" className="form-input" placeholder="••••••••" value={form.mot_de_passe} onChange={e => setForm({ ...form, mot_de_passe: e.target.value })} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Annuler</button>
              <button className="btn btn-primary" style={{ flex: 1, opacity: creationEnCours ? 0.7 : 1 }} onClick={creerInstructeur} disabled={creationEnCours}>
                {creationEnCours ? 'Création...' : 'Créer le compte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}

export default GestionUtilisateurs