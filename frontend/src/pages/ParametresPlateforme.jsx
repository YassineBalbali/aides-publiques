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

function ParametresPlateforme() {
  const [message, setMessage] = useState('')
  const [chargement, setChargement] = useState(true)

  const [general, setGeneral] = useState({
    nom_plateforme: 'Aides Publiques',
    logo: '',
    mentions_legales: '',
  })

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null

  useEffect(() => {
    api.get('/parametres/')
      .then(r => {
        setGeneral({
          nom_plateforme: r.data.nom_plateforme || 'Aides Publiques',
          logo: r.data.logo_url || '',
          mentions_legales: r.data.mentions_legales || '',
        })
        setChargement(false)
      })
      .catch(() => setChargement(false))
  }, [])

  const sauvegarder = async () => {
    try {
      await api.put('/parametres/', {
        nom_plateforme: general.nom_plateforme,
        logo_url: general.logo,
        mentions_legales: general.mentions_legales,
      })
      setMessage('Paramètres sauvegardés avec succès !')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Erreur lors de la sauvegarde')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const supprimerLogo = async () => {
    if (!window.confirm('Supprimer le logo et revenir au logo par défaut "AP" ?')) return
    try {
      await api.put('/parametres/', { logo_url: null })
      setGeneral({ ...general, logo: '' })
      setMessage('Logo supprimé — retour au logo par défaut')
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('Erreur lors de la suppression du logo')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <SidebarLayout navItems={ADMIN_NAV} role="admin" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div className="page-header">
        <h1 className="page-title">Paramètres</h1>
        <p className="page-subtitle">Configurez les informations et préférences de la plateforme</p>
      </div>

      {message && <div className="alert-success">✓ {message}</div>}

      <div className="card" style={{ padding: 24 }}>
        {chargement ? (
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Chargement...</p>
        ) : (
          <>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>⚙ Informations générales</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Nom de la plateforme</label>
                <input className="form-input" value={general.nom_plateforme} onChange={e => setGeneral({ ...general, nom_plateforme: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Logo</label>
                {general.logo && (
                  <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={general.logo} alt="Logo" style={{ width: 52, height: 52, objectFit: 'contain', border: '1px solid #e8ecf4', borderRadius: 10, padding: 6, display: 'block' }} />
                    <button
                      type="button"
                      onClick={supprimerLogo}
                      style={{
                        padding: '7px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        cursor: 'pointer',
                        fontFamily: 'inherit'
                      }}>
                      🗑 Supprimer
                    </button>
                  </div>
                )}
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                  📷 {general.logo ? 'Changer le logo' : 'Choisir un logo'}
                  <input type="file" accept=".png,.jpg,.jpeg" style={{ display: 'none' }} onChange={e => {
                    const file = e.target.files[0]
                    if (file) { const reader = new FileReader(); reader.onload = () => setGeneral({ ...general, logo: reader.result }); reader.readAsDataURL(file) }
                  }} />
                </label>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e8ecf4', margin: '8px 0' }} />

              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>📄 Mentions légales</p>
              <div className="form-group">
                <label className="form-label">Mentions légales</label>
                <textarea className="form-input form-textarea" rows={6} value={general.mentions_legales} onChange={e => setGeneral({ ...general, mentions_legales: e.target.value })} />
              </div>

              <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={sauvegarder}>
                Sauvegarder
              </button>
            </div>
          </>
        )}
      </div>
    </SidebarLayout>
  )
}

export default ParametresPlateforme