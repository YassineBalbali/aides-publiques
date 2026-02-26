import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function GestionUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [chargement, setChargement] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [userEnEdition, setUserEnEdition] = useState(null)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', role: 'demandeur' })
  const [recherche, setRecherche] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    chargerUtilisateurs()
  }, [])

  const chargerUtilisateurs = () => {
    fetch('http://127.0.0.1:8000/auth/utilisateurs')
      .then(r => r.json())
      .then(data => { setUtilisateurs(data); setChargement(false) })
      .catch(() => setChargement(false))
  }

  const ouvrirFormulaire = (user) => {
    setUserEnEdition(user)
    setForm({ nom: user.nom || '', prenom: user.prenom || '', email: user.email, role: user.role })
    setShowForm(true)
  }

  const sauvegarder = async () => {
    const response = await fetch(`http://127.0.0.1:8000/auth/utilisateurs/${userEnEdition.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (response.ok) {
      setShowForm(false)
      chargerUtilisateurs()
    }
  }

  const supprimerUser = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    await fetch(`http://127.0.0.1:8000/auth/utilisateurs/${id}`, { method: 'DELETE' })
    chargerUtilisateurs()
  }

  const roleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 text-red-600',
      instructeur: 'bg-blue-100 text-blue-700',
      demandeur: 'bg-green-100 text-green-700',
    }
    const icons = { admin: '🔴', instructeur: '🔵', demandeur: '🟢' }
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[role] || 'bg-gray-100'}`}>
        {icons[role]} {role}
      </span>
    )
  }

  const utilisateursFiltres = utilisateurs.filter(u => {
    const txt = `${u.prenom || ''} ${u.nom || ''} ${u.email}`.toLowerCase()
    return txt.includes(recherche.toLowerCase())
  })

  return (
    <div style={{backgroundColor: '#1a2744', minHeight: '100vh'}}>
      {/* Navbar */}
      <nav className="px-8 py-4 flex items-center justify-between border-b border-blue-800">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <span>🏛️</span><span>AidesPubliques</span>
        </Link>
        <div className="flex items-center gap-6 text-white text-sm">
          <Link to="/admin" className="hover:text-yellow-400">Dossiers</Link>
          <Link to="/admin/aides" className="hover:text-yellow-400">Gestion Aides</Link>
          <Link to="/admin/utilisateurs" className="text-yellow-400 font-semibold">Utilisateurs</Link>
          <Link to="/dashboard" className="hover:text-yellow-400">Dashboard</Link>
        </div>
        <button
          onClick={() => { localStorage.removeItem('token'); navigate('/') }}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">
          Se déconnecter
        </button>
      </nav>

      <div className="px-12 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">Gestion des Utilisateurs</h1>
        <p className="text-gray-400 mb-8">Gérez les comptes et les rôles des utilisateurs</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', value: utilisateurs.length, icon: '👥', color: 'text-white' },
            { label: 'Instructeurs', value: utilisateurs.filter(u => u.role === 'instructeur').length, icon: '🔵', color: 'text-blue-400' },
            { label: 'Demandeurs', value: utilisateurs.filter(u => u.role === 'demandeur').length, icon: '🟢', color: 'text-green-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-blue-900 rounded-xl p-5 border border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <span>{stat.icon}</span>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recherche */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom ou email..."
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="w-full bg-white rounded-xl px-5 py-3 text-gray-800 focus:outline-none shadow-lg"
          />
        </div>

        <p className="text-gray-400 text-sm mb-4">{utilisateursFiltres.length} utilisateur(s)</p>

        {/* Modal édition */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Modifier l'utilisateur</h2>
              <div className="space-y-4">
                <input
                  placeholder="Prénom"
                  value={form.prenom}
                  onChange={e => setForm({ ...form, prenom: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  placeholder="Nom"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  placeholder="Email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none">
                  <option value="demandeur">🟢 Demandeur</option>
                  <option value="instructeur">🔵 Instructeur</option>
                  <option value="admin">🔴 Admin</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={sauvegarder}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl">
                  ✓ Sauvegarder
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tableau */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Liste des utilisateurs</h2>
          </div>
          {chargement ? (
            <p className="text-gray-400 p-6 text-center">Chargement...</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Inscription</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {utilisateursFiltres.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                          {(u.prenom?.[0] || u.email[0]).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">{u.prenom} {u.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">{roleBadge(u.role)}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(u.cree_le).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => ouvrirFormulaire(u)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-lg">
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => supprimerUser(u.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-3 py-1 rounded-lg">
                          🗑️ Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default GestionUtilisateurs