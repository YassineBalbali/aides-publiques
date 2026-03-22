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

  useEffect(() => { chargerUtilisateurs() }, [])

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
    if (response.ok) { setShowForm(false); chargerUtilisateurs() }
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
    const labels = { admin: '🔴 Admin', instructeur: '🔵 Instructeur', demandeur: '🟢 Demandeur' }
    return <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[role] || 'bg-gray-100'}`}>{labels[role] || role}</span>
  }

  const utilisateursFiltres = utilisateurs.filter(u => {
    const txt = `${u.prenom || ''} ${u.nom || ''} ${u.email}`.toLowerCase()
    return txt.includes(recherche.toLowerCase())
  })

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
          <Link to="/" className="hover:text-blue-900">Accueil</Link>
          <Link to="/aides" className="hover:text-blue-900">Catalogue des aides</Link>
          <Link to="/admin" className="hover:text-blue-900">Espace admin</Link>
          <Link to="/admin/aides" className="hover:text-blue-900">Gestion des aides</Link>
          <Link to="/admin/utilisateurs" className="font-semibold text-blue-900 border-b-2 border-blue-900 pb-1">Utilisateurs</Link>
        </div>
      </div>

      {/* Header */}
      <div style={{backgroundColor: '#1a2b5e'}} className="px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">👥</span>
            <h1 className="text-3xl font-bold text-white">Gestion des Utilisateurs</h1>
          </div>
          <p className="text-blue-200">Gérez les comptes et les rôles des utilisateurs</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total utilisateurs', value: utilisateurs.length, color: 'text-blue-900', bg: 'bg-blue-50', border: 'border-blue-200' },
            { label: 'Admins', value: utilisateurs.filter(u => u.role === 'admin').length, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
            { label: 'Instructeurs', value: utilisateurs.filter(u => u.role === 'instructeur').length, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
            { label: 'Demandeurs', value: utilisateurs.filter(u => u.role === 'demandeur').length, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} border ${stat.border} rounded-lg p-5 shadow-sm`}>
              <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom ou email..."
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500"
          />
          <p className="text-gray-400 text-sm mt-3">{utilisateursFiltres.length} utilisateur(s)</p>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Liste des utilisateurs</h2>
          </div>
          {chargement ? (
            <p className="text-gray-400 p-8 text-center">Chargement...</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscription</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {utilisateursFiltres.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-900 font-bold text-sm">
                          {(u.prenom?.[0] || u.email[0]).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{u.prenom} {u.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">{roleBadge(u.role)}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {u.cree_le ? new Date(u.cree_le).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => ouvrirFormulaire(u)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors">
                          ✏️ Modifier
                        </button>
                        <button onClick={() => supprimerUser(u.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded transition-colors">
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

        {/* Footer */}
        <footer className="border-t border-gray-200 mt-12 pt-10">
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
              </div>
            </div>
            <div>
              <h3 className="text-gray-700 font-semibold text-sm mb-3">Administration</h3>
              <div className="flex flex-col gap-2">
                <Link to="/admin" className="text-gray-400 hover:text-gray-700 text-xs">Espace admin</Link>
                <Link to="/admin/aides" className="text-gray-400 hover:text-gray-700 text-xs">Gestion des aides</Link>
                <Link to="/admin/utilisateurs" className="text-gray-400 hover:text-gray-700 text-xs">Utilisateurs</Link>
              </div>
            </div>
            <div>
              <h3 className="text-gray-700 font-semibold text-sm mb-3">Informations</h3>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-400 hover:text-gray-700 text-xs">Mentions légales</a>
                <a href="#" className="text-gray-400 hover:text-gray-700 text-xs">Accessibilité</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-gray-400 text-xs">© 2026 Plateforme Aides Publiques — Tous droits réservés</p>
          </div>
        </footer>
      </div>

      {/* Modal édition */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">✏️ Modifier l'utilisateur</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input placeholder="Prénom" value={form.prenom}
                  onChange={e => setForm({...form, prenom: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input placeholder="Nom" value={form.nom}
                  onChange={e => setForm({...form, nom: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input placeholder="Email" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500">
                  <option value="demandeur">🟢 Demandeur</option>
                  <option value="instructeur">🔵 Instructeur</option>
                  <option value="admin">🔴 Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={sauvegarder}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded transition-colors">
                ✓ Sauvegarder
              </button>
              <button onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionUtilisateurs