import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

function ProfilAdmin() {
  const [profil, setProfil] = useState(null)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '' })
  const [mdpForm, setMdpForm] = useState({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmer: '' })
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(true)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null
  const userId = payload?.sub

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    api.get(`/auth/profil/${userId}`)
      .then(r => { setProfil(r.data); setForm({ nom: r.data.nom || '', prenom: r.data.prenom || '', email: r.data.email || '' }); setChargement(false) })
      .catch(() => setChargement(false))
  }, [])

  const showMsg = (msg, isErr = false) => {
    if (isErr) { setErreur(msg); setMessage('') } else { setMessage(msg); setErreur('') }
    setTimeout(() => { setMessage(''); setErreur('') }, 3000)
  }

  const sauvegarderProfil = async () => {
    try { await api.put(`/auth/profil/${userId}`, form); showMsg('Profil mis à jour !') }
    catch (err) { showMsg(err.response?.data?.detail || 'Erreur', true) }
  }

  const changerMotDePasse = async () => {
    if (mdpForm.nouveau_mot_de_passe !== mdpForm.confirmer) { showMsg('Les mots de passe ne correspondent pas', true); return }
    try {
      await api.put(`/auth/profil/${userId}`, { ancien_mot_de_passe: mdpForm.ancien_mot_de_passe, nouveau_mot_de_passe: mdpForm.nouveau_mot_de_passe })
      showMsg('Mot de passe changé !')
      setMdpForm({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmer: '' })
    } catch (err) { showMsg(err.response?.data?.detail || 'Erreur', true) }
  }

  const uploadPhoto = async (e) => {
    const file = e.target.files[0]; if (!file) return
    const formData = new FormData(); formData.append('file', file)
    try {
      const res = await api.post(`/auth/profil/${userId}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setProfil(prev => ({ ...prev, photo: res.data.photo }))
      showMsg('Photo mise à jour !')
    } catch { showMsg('Erreur upload photo', true) }
  }

  if (chargement) return (
    <SidebarLayout navItems={ADMIN_NAV} role="admin" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#94a3b8' }}>Chargement...</div>
    </SidebarLayout>
  )

  return (
    <SidebarLayout navItems={ADMIN_NAV} role="admin" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div className="page-header">
        <h1 className="page-title">Mon profil</h1>
        <p className="page-subtitle">Gérez vos informations personnelles</p>
      </div>

      {message && <div className="alert-success">✓ {message}</div>}
      {erreur && <div className="alert-error">✕ {erreur}</div>}

      {/* Avatar card */}
      <div className="card" style={{ padding: 20, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {profil?.photo
              ? <img src={profil.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>{(profil?.prenom?.[0] || '?').toUpperCase()}</span>
            }
          </div>
          <label style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: '50%', background: '#2563eb', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ color: '#fff', fontSize: 10 }}>✎</span>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadPhoto} />
          </label>
        </div>
        <div>
          <p style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{profil?.prenom} {profil?.nom}</p>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{profil?.email}</p>
          <span className="badge" style={{ background: '#fef2f2', color: '#dc2626', marginTop: 6 }}>Administrateur</span>
        </div>

        {/* Stats inline */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 24 }}>
          {[
            { label: 'Rôle', value: 'Admin' },
            { label: 'Membre depuis', value: profil?.cree_le ? new Date(profil.cree_le).toLocaleDateString('fr-FR') : '—' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Infos */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Informations personnelles</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group"><label className="form-label">Prénom</label><input className="form-input" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Nom</label><input className="form-input" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <button className="btn btn-primary" onClick={sauvegarderProfil}>Sauvegarder</button>
          </div>
        </div>

        {/* Mot de passe */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Changer le mot de passe</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Mot de passe actuel', key: 'ancien_mot_de_passe' },
              { label: 'Nouveau mot de passe', key: 'nouveau_mot_de_passe' },
              { label: 'Confirmer', key: 'confirmer' },
            ].map(({ label, key }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input type="password" className="form-input" placeholder="••••••••" value={mdpForm[key]} onChange={e => setMdpForm({ ...mdpForm, [key]: e.target.value })} />
              </div>
            ))}
            <button className="btn btn-secondary" onClick={changerMotDePasse}>Changer le mot de passe</button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default ProfilAdmin