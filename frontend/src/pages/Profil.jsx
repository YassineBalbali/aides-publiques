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
    setMessage('')
    setErreur('')
    const response = await fetch(`http://127.0.0.1:8000/auth/profil/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (response.ok) {
      setMessage('✅ Profil mis à jour avec succès !')
      setTimeout(() => setMessage(''), 3000)
    } else {
      setErreur('❌ Erreur lors de la mise à jour')
    }
  }

  const changerMotDePasse = async () => {
    setMessage('')
    setErreur('')
    if (mdpForm.nouveau_mot_de_passe !== mdpForm.confirmer) {
      setErreur('❌ Les mots de passe ne correspondent pas')
      return
    }
    if (mdpForm.nouveau_mot_de_passe.length < 6) {
      setErreur('❌ Le mot de passe doit contenir au moins 6 caractères')
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
      setMessage('✅ Mot de passe changé avec succès !')
      setMdpForm({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmer: '' })
      setTimeout(() => setMessage(''), 3000)
    } else {
      const data = await response.json()
      setErreur(`❌ ${data.detail || 'Erreur lors du changement de mot de passe'}`)
    }
  }

  const roleLabel = { admin: '🔴 Admin', instructeur: '🔵 Instructeur', demandeur: '🟢 Demandeur' }

  const lienRetour = role === 'admin' ? '/admin' : role === 'instructeur' ? '/instructeur' : '/mon-espace'

  if (chargement) return (
    <div style={{backgroundColor: '#1a2744', minHeight: '100vh'}} className="flex items-center justify-center">
      <p className="text-white text-xl">Chargement...</p>
    </div>
  )

  return (
    <div style={{backgroundColor: '#1a2744', minHeight: '100vh'}}>
      {/* Navbar */}
      <nav className="px-8 py-4 flex items-center justify-between border-b border-blue-800">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <span>🏛️</span><span>AidesPubliques</span>
        </Link>
        <div className="flex items-center gap-6 text-white text-sm">
          <Link to={lienRetour} className="hover:text-yellow-400">← Retour</Link>
        </div>
        <button
          onClick={() => { localStorage.removeItem('token'); navigate('/') }}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">
          Se déconnecter
        </button>
      </nav>

      <div className="px-12 py-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Mon Profil</h1>
        <p className="text-gray-400 mb-8">Gérez vos informations personnelles</p>

        {message && (
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl mb-6 font-semibold">
            {message}
          </div>
        )}
        {erreur && (
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl mb-6 font-semibold">
            {erreur}
          </div>
        )}

        {/* Avatar + infos */}
        <div className="bg-blue-900 rounded-2xl p-8 border border-blue-700 mb-6 flex items-center gap-8">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-4xl shadow-lg">
            {(profil?.prenom?.[0] || profil?.email?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profil?.prenom} {profil?.nom}</h2>
            <p className="text-gray-400">{profil?.email}</p>
            <span className="mt-2 inline-block text-sm font-semibold px-3 py-1 rounded-full bg-blue-800 text-blue-200">
              {roleLabel[role] || role}
            </span>
          </div>
        </div>

        {/* Modifier infos */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">📝 Informations personnelles</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-600 text-sm font-semibold mb-1 block">Prénom</label>
              <input
                value={form.prenom}
                onChange={e => setForm({ ...form, prenom: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Votre prénom"
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm font-semibold mb-1 block">Nom</label>
              <input
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Votre nom"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="text-gray-600 text-sm font-semibold mb-1 block">Email</label>
            <input
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Votre email"
            />
          </div>
          <button
            onClick={sauvegarderProfil}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
            💾 Sauvegarder
          </button>
        </div>

        {/* Changer mot de passe */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6">🔐 Changer le mot de passe</h2>
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-gray-600 text-sm font-semibold mb-1 block">Ancien mot de passe</label>
              <input
                type="password"
                value={mdpForm.ancien_mot_de_passe}
                onChange={e => setMdpForm({ ...mdpForm, ancien_mot_de_passe: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm font-semibold mb-1 block">Nouveau mot de passe</label>
              <input
                type="password"
                value={mdpForm.nouveau_mot_de_passe}
                onChange={e => setMdpForm({ ...mdpForm, nouveau_mot_de_passe: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm font-semibold mb-1 block">Confirmer le mot de passe</label>
              <input
                type="password"
                value={mdpForm.confirmer}
                onChange={e => setMdpForm({ ...mdpForm, confirmer: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            onClick={changerMotDePasse}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
            🔐 Changer le mot de passe
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profil