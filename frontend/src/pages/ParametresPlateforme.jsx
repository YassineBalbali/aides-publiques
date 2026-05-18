import { useState } from 'react'
import { SidebarLayout, IconFolder, IconList, IconUsers, IconLink, IconChart, IconSettings, IconUser } from './SidebarLayout'

const ADMIN_NAV = [
  { to: '/admin/dossiers', label: 'Dossiers', Icon: IconFolder },
  { to: '/admin/aides', label: 'Gestion Aides', Icon: IconList },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', Icon: IconUsers },
  { to: '/admin/affectations', label: 'Affectations', Icon: IconLink },
  { to: '/admin/dashboard', label: 'Dashboard', Icon: IconChart },
  { to: '/admin/parametres', label: 'Paramètres', Icon: IconSettings },
  { to: '/profil', label: 'Profil', Icon: IconUser },
]

const ONGLETS = [
  { id: 'general', label: '⚙ Général' },
  { id: 'mentions', label: '📄 Mentions légales' },
  { id: 'notifications', label: '🔔 Notifications' },
]

function Toggle({ checked, onChange }) {
  return (
    <button
      className="toggle"
      style={{ background: checked ? '#2563eb' : '#e2e8f0' }}
      onClick={() => onChange(!checked)}>
      <span className="toggle-thumb" style={{ left: checked ? 22 : 3 }} />
    </button>
  )
}

function ParametresPlateforme() {
  const [message, setMessage] = useState('')
  const [onglet, setOnglet] = useState('general')

  const [general, setGeneral] = useState({
    nom_plateforme: localStorage.getItem('plateforme_nom') || 'Aides Publiques',
    description: "Plateforme de gestion des aides publiques.",
    email_contact: 'contact@aides-publiques.fr',
    telephone: '01 23 45 67 89',
    adresse: '12 rue de la République, 75001 Paris',
    logo: localStorage.getItem('plateforme_logo') || '',
  })

  const [mentions, setMentions] = useState({
    mentions_legales: "Les présentes mentions légales régissent l'utilisation de la plateforme.",
    politique_confidentialite: "Vos données personnelles sont traitées conformément au RGPD.",
    accessibilite: "Cette plateforme respecte les normes d'accessibilité RGAA.",
  })

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    notification_depot: true,
    notification_statut: true,
    notification_decision: true,
  })

  const token = localStorage.getItem('token')
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null

  const sauvegarder = (section) => {
    if (onglet === 'general') {
      localStorage.setItem('plateforme_nom', general.nom_plateforme)
      if (general.logo) localStorage.setItem('plateforme_logo', general.logo)
    }
    setMessage(`${section} sauvegardés avec succès !`)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <SidebarLayout navItems={ADMIN_NAV} role="admin" prenom={payload?.prenom || ''} nom={payload?.nom || ''}>
      <div className="page-header">
        <h1 className="page-title">Paramètres</h1>
        <p className="page-subtitle">Configurez les informations et préférences de la plateforme</p>
      </div>

      {message && <div className="alert-success">✓ {message}</div>}

      <div className="tab-bar">
        {ONGLETS.map(o => (
          <button key={o.id} className={`tab-btn${onglet === o.id ? ' active' : ''}`} onClick={() => setOnglet(o.id)}>
            {o.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 24 }}>
        {onglet === 'general' && (
          <>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Informations générales</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Nom de la plateforme</label>
                <input className="form-input" value={general.nom_plateforme} onChange={e => setGeneral({ ...general, nom_plateforme: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input form-textarea" rows={3} value={general.description} onChange={e => setGeneral({ ...general, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Email de contact</label>
                  <input className="form-input" value={general.email_contact} onChange={e => setGeneral({ ...general, email_contact: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className="form-input" value={general.telephone} onChange={e => setGeneral({ ...general, telephone: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Adresse</label>
                <input className="form-input" value={general.adresse} onChange={e => setGeneral({ ...general, adresse: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Logo</label>
                {general.logo && (
                  <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={general.logo} alt="Logo" style={{ width: 52, height: 52, objectFit: 'contain', border: '1px solid #e8ecf4', borderRadius: 10, padding: 6, display: 'block' }} />
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Supprimer le logo et revenir au logo par défaut "AP" ?')) {
                          localStorage.removeItem('plateforme_logo')
                          setGeneral({ ...general, logo: '' })
                          setMessage('Logo supprimé — retour au logo par défaut')
                          setTimeout(() => setMessage(''), 3000)
                        }
                      }}
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
              <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => sauvegarder('Paramètres généraux')}>
                Sauvegarder
              </button>
            </div>
          </>
        )}

        {onglet === 'mentions' && (
          <>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Mentions légales et confidentialité</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Mentions légales</label>
                <textarea className="form-input form-textarea" rows={4} value={mentions.mentions_legales} onChange={e => setMentions({ ...mentions, mentions_legales: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Politique de confidentialité</label>
                <textarea className="form-input form-textarea" rows={4} value={mentions.politique_confidentialite} onChange={e => setMentions({ ...mentions, politique_confidentialite: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Accessibilité</label>
                <textarea className="form-input form-textarea" rows={3} value={mentions.accessibilite} onChange={e => setMentions({ ...mentions, accessibilite: e.target.value })} />
              </div>
              <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => sauvegarder('Mentions légales')}>
                Sauvegarder
              </button>
            </div>
          </>
        )}

        {onglet === 'notifications' && (
          <>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Paramètres de notifications</p>
            <div>
              {[
                { key: 'email_notifications', label: 'Activer les notifications email', desc: 'Envoyer des emails automatiques aux demandeurs' },
                { key: 'notification_depot', label: 'Notification à la dépose', desc: 'Email envoyé quand un dossier est déposé' },
                { key: 'notification_statut', label: 'Changement de statut', desc: 'Email à chaque changement de statut' },
                { key: 'notification_decision', label: 'Décision finale', desc: 'Email lors de l\'acceptation ou du refus' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>{item.desc}</p>
                  </div>
                  <Toggle
                    checked={notifications[item.key]}
                    onChange={val => setNotifications({ ...notifications, [item.key]: val })}
                  />
                </div>
              ))}
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => sauvegarder('Notifications')}>
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