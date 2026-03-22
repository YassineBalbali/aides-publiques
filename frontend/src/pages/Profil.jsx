import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Profil() {
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
  const role = payload?.role

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetch(`http://127.0.0.1:8000/auth/profil/${userId}`)
      .then(r => r.json())
      .then(data => {
        setProfil(data)
        setForm({ nom: data.nom || '', prenom: data.prenom || '', email: data.email || '' })
        setChargement(false)
      })
      .catch(() => setChargement(false))
  }, [])

  const sauvegarderProfil = async () => {
    setMessage(''); setErreur('')
    const response = await fetch(`http://127.0.0.1:8000/auth/profil/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (response.ok) {
      setMessage('Profil mis à jour avec succès !')
      setTimeout(() => setMessage(''), 3000)
    } else {
      setErreur('Erreur lors de la mise à jour')
    }
  }

  const changerMotDePasse = async () => {
    setMessage(''); setErreur('')
    if (mdpForm.nouveau_mot_de_passe !== mdpForm.confirmer) {
      setErreur('Les mots de passe ne correspondent pas')
      return
    }
    if (mdpForm.nouveau_mot_de_passe.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    const response = await fetch(`http://127.0.0.1:8000/auth/profil/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ancien_mot_de_passe: mdpForm.ancien_mot_de_passe,
        nouveau_mot_de_passe: mdpForm.nouveau_mot_de_passe
      })
    })
    if (response.ok) {
      setMessage('Mot de passe changé avec succès !')
      setMdpForm({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmer: '' })
      setTimeout(() => setMessage(''), 3000)
    } else {
      const data = await response.json()
      setErreur(data.detail || 'Erreur lors du changement de mot de passe')
    }
  }

  const uploadPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`http://127.0.0.1:8000/auth/profil/${userId}/photo`, {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    if (data.photo) {
      setProfil(prev => ({ ...prev, photo: data.photo }))
      setMessage('Photo mise à jour avec succès !')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const roleLabel = { admin: 'Administrateur', instructeur: 'Instructeur', demandeur: 'Demandeur' }
  const roleBadge = { admin: 'bg-red-100 text-red-700', instructeur: 'bg-blue-100 text-blue-700', demandeur: 'bg-green-100 text-green-700' }
  const lienRetour = role === 'admin' ? '/admin' : role === 'instructeur' ? '/instructeur' : '/mon-espace'

  if (chargement) return (
    <div style={{backgroundColor: '#f5f5f5', minHeight: '100vh'}} className="flex items-center justify-center">
      <p className="text-gray-500 text-xl">Chargement...</p>
    </div>
  )

  return (
    <div style={{backgroundColor: '#f5f5f5', minHeight: '100vh'}}>
      {/* Bandeau RF */}
      <div style={{backgroundColor: '#1a2b5e'}} className="px-8 py-2 flex items-center gap-3">
        <div className="bg-red-600 text-white font-bold text-sm px-2 py-1 rounded">RF</div>
        <span className="text-white text-sm font-semibold">RÉPUBLIQUE FRANÇAISE</span>
        <span className="text-blue-300 text-xs">Liberté · Égalité · Fraternité</span>
        <div className="ml-auto flex items-center gap-4 text-white text-sm">
          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/') }}
            className="hover:underline">
            ← Se déconnecter
          </button>
        </div>
      </div>

      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <Link to="/" className="text-blue-900 font-bold text-xl">Aides Publiques</Link>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-900">Accueil</Link>
          <Link to="/aides" className="hover:text-blue-900">Catalogue des aides</Link>
          <Link to="/deposer" className="hover:text-blue-900">Déposer un dossier</Link>
          <Link to={lienRetour} className="hover:text-blue-900">Mon espace</Link>
          <Link to="/profil" className="bg-blue-900 text-white px-4 py-2 rounded font-semibold">Mon profil</Link>
        </div>
      </div>

      {/* Header avec photo */}
      <div style={{backgroundColor: '#1a2b5e'}} className="px-8 py-10">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          
          {/* Photo de profil */}
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold text-3xl shadow-lg overflow-hidden">
              {profil?.photo ? (
                <img src={profil.photo} alt="Photo de profil" className="w-full h-full object-cover" />
              ) : (
                (profil?.prenom?.[0] || profil?.email?.[0] || '?').toUpperCase()
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-yellow-400 hover:bg-yellow-500 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow-md transition-colors">
              <span className="text-sm">📷</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={uploadPhoto}
              />
            </label>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">{profil?.prenom} {profil?.nom}</h1>
            <p className="text-blue-200 mt-1">{profil?.email}</p>
            <span className={`mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full ${roleBadge[role]}`}>
              {roleLabel[role] || role}
            </span>
            <p className="text-blue-300 text-xs mt-2">📷 Cliquez sur l'icône pour changer votre photo</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-10 px-4">
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span>✅</span> {message}
          </div>
        )}
        {erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span>❌</span> {erreur}
          </div>
        )}

        {/* Informations personnelles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📝</span> Informations personnelles
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})}
                className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder="Votre prénom" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
                className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder="Votre nom" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="Votre email" />
          </div>
          <button onClick={sauvegarderProfil}
            className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded transition-colors">
            💾 Sauvegarder les modifications
          </button>
        </div>

        {/* Changer mot de passe */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>🔐</span> Changer le mot de passe
          </h2>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ancien mot de passe</label>
              <input type="password" value={mdpForm.ancien_mot_de_passe}
                onChange={e => setMdpForm({...mdpForm, ancien_mot_de_passe: e.target.value})}
                className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <input type="password" value={mdpForm.nouveau_mot_de_passe}
                onChange={e => setMdpForm({...mdpForm, nouveau_mot_de_passe: e.target.value})}
                className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input type="password" value={mdpForm.confirmer}
                onChange={e => setMdpForm({...mdpForm, confirmer: e.target.value})}
                className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder="••••••••" />
            </div>
          </div>
          <button onClick={changerMotDePasse}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded transition-colors">
            🔐 Changer le mot de passe
          </button>
        </div>

        {/* Infos compte */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>ℹ️</span> Informations du compte
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-1">Rôle</p>
              <p className="font-semibold text-gray-800">{roleLabel[role] || role}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-1">Identifiant</p>
              <p className="font-mono text-gray-600 text-xs truncate">{userId}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-10">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-red-600 text-white font-bold text-xs px-1 py-1 rounded">RF</div>
                <span className="text-gray-700 font-semibold text-sm">RÉPUBLIQUE FRANÇAISE</span>
              </div>
              <p className="text-gray-400 text-xs">Plateforme de gestion et suivi des aides publiques.</p>
            </div>
            <div>
              <h3 className="text-gray-700 font-semibold text-sm mb-3">Navigation</h3>
              <div className="flex flex-col gap-2">
                <Link to="/aides" className="text-gray-400 hover:text-gray-700 text-xs">Catalogue des aides</Link>
                <Link to="/deposer" className="text-gray-400 hover:text-gray-700 text-xs">Déposer un dossier</Link>
                <Link to="/mon-espace" className="text-gray-400 hover:text-gray-700 text-xs">Suivre mon dossier</Link>
              </div>
            </div>
            <div>
              <h3 className="text-gray-700 font-semibold text-sm mb-3">Espace pro</h3>
              <div className="flex flex-col gap-2">
                <Link to="/instructeur" className="text-gray-400 hover:text-gray-700 text-xs">Espace instructeur</Link>
                <Link to="/admin" className="text-gray-400 hover:text-gray-700 text-xs">Administration</Link>
              </div>
            </div>
            <div>
              <h3 className="text-gray-700 font-semibold text-sm mb-3">Informations</h3>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-400 hover:text-gray-700 text-xs">Mentions légales</a>
                <a href="#" className="text-gray-400 hover:text-gray-700 text-xs">Politique de confidentialité</a>
                <a href="#" className="text-gray-400 hover:text-gray-700 text-xs">Accessibilité</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-gray-400 text-xs">© 2026 Plateforme Aides Publiques — Tous droits réservés</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Profil