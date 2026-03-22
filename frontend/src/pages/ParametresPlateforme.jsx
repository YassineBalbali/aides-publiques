import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function ParametresPlateforme() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [onglet, setOnglet] = useState('general')

  const [general, setGeneral] = useState({
    nom_plateforme: 'Aides Publiques',
    description: 'Plateforme de gestion et suivi des dossiers d\'aides publiques.',
    email_contact: 'contact@aides-publiques.fr',
    telephone: '01 23 45 67 89',
    adresse: '12 rue de la République, 75001 Paris',
  })

  const [mentions, setMentions] = useState({
    mentions_legales: 'Les présentes mentions légales régissent l\'utilisation de la plateforme AidesPubliques. Éditeur : République Française. Hébergeur : Ministère de l\'Économie.',
    politique_confidentialite: 'Vos données personnelles sont traitées conformément au RGPD. Elles sont utilisées uniquement dans le cadre de la gestion de vos demandes d\'aides publiques.',
    accessibilite: 'Cette plateforme s\'engage à respecter les normes d\'accessibilité numérique RGAA. Pour tout problème d\'accessibilité, contactez-nous.',
  })

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    notification_depot: true,
    notification_statut: true,
    notification_decision: true,
  })

  const sauvegarder = (section) => {
    setMessage(`✅ ${section} sauvegardés avec succès !`)
    setTimeout(() => setMessage(''), 3000)
  }

  const onglets = [
    { id: 'general', label: '⚙️ Général', },
    { id: 'mentions', label: '📄 Mentions légales', },
    { id: 'notifications', label: '🔔 Notifications', },
  ]

  return (
    <div style={{backgroundColor: '#f5f5f5', minHeight: '100vh'}}>

      {/* Bandeau RF */}
      <div style={{backgroundColor: '#1a2b5e'}} className="px-8 py-2 flex items-center gap-3">
        <div className="bg-red-600 text-white font-bold text-sm px-2 py-1 rounded">RF</div>
        <span className="text-white text-sm font-semibold">RÉPUBLIQUE FRANÇAISE</span>
        <span className="text-blue-300 text-xs">Liberté · Égalité · Fraternité</span>
        <div className="ml-auto">
          <button onClick={() => { localStorage.removeItem('token'); navigate('/') }}
            className="text-white text-sm hover:underline">← Se déconnecter</button>
        </div>
      </div>

      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <Link to="/" className="text-blue-900 font-bold text-xl">Aides Publiques</Link>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <Link to="/admin" className="hover:text-blue-900">Dossiers</Link>
          <Link to="/admin/aides" className="hover:text-blue-900">Gestion Aides</Link>
          <Link to="/admin/utilisateurs" className="hover:text-blue-900">Utilisateurs</Link>
          <Link to="/admin/affectations" className="hover:text-blue-900">Affectations</Link>
          <Link to="/dashboard" className="hover:text-blue-900">Dashboard</Link>
          <Link to="/admin/parametres" className="text-blue-900 font-semibold border-b-2 border-blue-900 pb-1">Paramètres</Link>
        </div>
      </div>

      {/* Header */}
      <div style={{backgroundColor: '#1a2b5e'}} className="px-8 py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Paramètres de la plateforme</h1>
          <p className="text-blue-200">Configurez les informations et préférences de la plateforme</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-lg mb-6 flex items-center gap-2">
            {message}
          </div>
        )}

        {/* Onglets */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {onglets.map(o => (
            <button key={o.id}
              onClick={() => setOnglet(o.id)}
              className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px
                ${onglet === o.id
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-blue-900'}`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* Onglet Général */}
        {onglet === 'general' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">⚙️ Informations générales</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la plateforme</label>
                <input
                  value={general.nom_plateforme}
                  onChange={e => setGeneral({...general, nom_plateforme: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={general.description}
                  onChange={e => setGeneral({...general, description: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500 text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                  <input
                    value={general.email_contact}
                    onChange={e => setGeneral({...general, email_contact: e.target.value})}
                    className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    value={general.telephone}
                    onChange={e => setGeneral({...general, telephone: e.target.value})}
                    className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  value={general.adresse}
                  onChange={e => setGeneral({...general, adresse: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo de la plateforme</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <div className="text-3xl mb-2">🖼️</div>
                  <p className="text-gray-500 text-sm mb-3">Glissez votre logo ici</p>
                  <p className="text-gray-400 text-xs mb-3">PNG, JPG — 2 Mo max</p>
                  <label className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded cursor-pointer hover:bg-gray-50 text-sm">
                    📁 Parcourir
                    <input type="file" accept=".png,.jpg,.jpeg" className="hidden" />
                  </label>
                </div>
              </div>
            </div>
            <button
              onClick={() => sauvegarder('Paramètres généraux')}
              className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded transition-colors">
              💾 Sauvegarder
            </button>
          </div>
        )}

        {/* Onglet Mentions légales */}
        {onglet === 'mentions' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">📄 Mentions légales et confidentialité</h2>
            <div className="space-y-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mentions légales</label>
                <textarea
                  value={mentions.mentions_legales}
                  onChange={e => setMentions({...mentions, mentions_legales: e.target.value})}
                  rows={5}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Politique de confidentialité</label>
                <textarea
                  value={mentions.politique_confidentialite}
                  onChange={e => setMentions({...mentions, politique_confidentialite: e.target.value})}
                  rows={5}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accessibilité</label>
                <textarea
                  value={mentions.accessibilite}
                  onChange={e => setMentions({...mentions, accessibilite: e.target.value})}
                  rows={4}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500 text-sm resize-none"
                />
              </div>
            </div>
            <button
              onClick={() => sauvegarder('Mentions légales')}
              className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded transition-colors">
              💾 Sauvegarder
            </button>
          </div>
        )}

        {/* Onglet Notifications */}
        {onglet === 'notifications' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">🔔 Paramètres de notifications</h2>
            <div className="space-y-4 mb-6">
              {[
                { key: 'email_notifications', label: 'Activer les notifications email', desc: 'Envoyer des emails automatiques aux demandeurs' },
                { key: 'notification_depot', label: 'Notification à la dépose', desc: 'Email envoyé quand un dossier est déposé' },
                { key: 'notification_statut', label: 'Notification de changement de statut', desc: 'Email envoyé à chaque changement de statut' },
                { key: 'notification_decision', label: 'Notification de décision finale', desc: 'Email envoyé lors de l\'acceptation ou refus' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                    <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
                  </div>
                  <button
                  onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key]})}
                  className={`relative inline-flex w-12 h-6 rounded-full transition-colors flex-shrink-0 ${notifications[item.key] ? 'bg-blue-900' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${notifications[item.key] ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => sauvegarder('Paramètres de notifications')}
              className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded transition-colors">
              💾 Sauvegarder
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-10 mt-10">
          <div className="text-center">
            <p className="text-gray-400 text-xs">© 2026 Plateforme Aides Publiques — Tous droits réservés</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default ParametresPlateforme