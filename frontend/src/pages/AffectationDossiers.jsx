import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function AffectationDossiers() {
  const [dossiers, setDossiers] = useState([])
  const [instructeurs, setInstructeurs] = useState([])
  const [chargement, setChargement] = useState(true)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/dossiers/').then(r => r.json()),
      fetch('http://127.0.0.1:8000/auth/utilisateurs').then(r => r.json()),
    ]).then(([d, u]) => {
      setDossiers(d)
      setInstructeurs(u.filter(u => u.role === 'instructeur'))
      setChargement(false)
    })
  }, [])

  const affecter = async (dossierId, instructeurId) => {
    if (!instructeurId) return
    const response = await fetch(
      `http://127.0.0.1:8000/dossiers/${dossierId}/affecter?instructeur_id=${instructeurId}`,
      { method: 'PATCH' }
    )
    if (response.ok) {
      const updated = await response.json()
      setDossiers(prev => prev.map(d => d.id === dossierId ? updated : d))
      setMessage('✅ Dossier affecté avec succès !')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const badgeStatut = (statut) => {
    const styles = {
      brouillon: 'bg-gray-100 text-gray-600',
      depose: 'bg-blue-100 text-blue-700',
      en_instruction: 'bg-yellow-100 text-yellow-700',
      accepte: 'bg-green-100 text-green-700',
      refuse: 'bg-red-100 text-red-600',
    }
    const labels = {
      brouillon: 'Brouillon',
      depose: 'Déposé',
      en_instruction: 'En instruction',
      accepte: 'Accepté',
      refuse: 'Refusé',
    }
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[statut] || 'bg-gray-100'}`}>
        {labels[statut] || statut}
      </span>
    )
  }

  const dossiersSansInstructeur = dossiers.filter(d => !d.instructeur_id)
  const dossiersAvecInstructeur = dossiers.filter(d => d.instructeur_id)

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
          <Link to="/admin/utilisateurs" className="hover:text-yellow-400">Utilisateurs</Link>
          <Link to="/admin/affectations" className="text-yellow-400 font-semibold">Affectations</Link>
          <Link to="/dashboard" className="hover:text-yellow-400">Dashboard</Link>
        </div>
        <button
          onClick={() => { localStorage.removeItem('token'); navigate('/') }}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm">
          Se déconnecter
        </button>
      </nav>

      <div className="px-12 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">Affectation des dossiers</h1>
        <p className="text-gray-400 mb-8">Assignez les dossiers aux instructeurs</p>

        {message && (
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl mb-6 font-semibold">
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total dossiers', value: dossiers.length, icon: '📁', color: 'text-white' },
            { label: 'Non affectés', value: dossiersSansInstructeur.length, icon: '⏳', color: 'text-red-400' },
            { label: 'Affectés', value: dossiersAvecInstructeur.length, icon: '✅', color: 'text-green-400' },
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

        {instructeurs.length === 0 && (
          <div className="bg-yellow-900/50 border border-yellow-600 text-yellow-300 px-6 py-4 rounded-xl mb-6">
            ⚠️ Aucun instructeur trouvé. Créez d'abord un compte avec le rôle <strong>instructeur</strong> dans Gestion Utilisateurs.
          </div>
        )}

        {/* Dossiers non affectés */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <span className="text-red-500 text-xl">⏳</span>
            <h2 className="text-lg font-bold text-gray-800">Dossiers non affectés ({dossiersSansInstructeur.length})</h2>
          </div>
          {chargement ? (
            <p className="text-gray-400 p-6 text-center">Chargement...</p>
          ) : dossiersSansInstructeur.length === 0 ? (
            <p className="text-gray-400 p-6 text-center">🎉 Tous les dossiers sont affectés !</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Demandeur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Affecter à</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dossiersSansInstructeur.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-indigo-600 font-mono font-semibold text-sm">{d.numero}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-800 font-semibold text-sm">{d.demandeur?.prenom} {d.demandeur?.nom}</p>
                      <p className="text-gray-400 text-xs">{d.demandeur?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(d.cree_le).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">{badgeStatut(d.statut)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center">
                        <select
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          defaultValue=""
                          onChange={e => affecter(d.id, e.target.value)}
                        >
                          <option value="" disabled>Choisir instructeur...</option>
                          {instructeurs.map(i => (
                            <option key={i.id} value={i.id}>
                              {i.prenom} {i.nom}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Dossiers affectés */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <span className="text-green-500 text-xl">✅</span>
            <h2 className="text-lg font-bold text-gray-800">Dossiers affectés ({dossiersAvecInstructeur.length})</h2>
          </div>
          {dossiersAvecInstructeur.length === 0 ? (
            <p className="text-gray-400 p-6 text-center">Aucun dossier affecté pour le moment</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Demandeur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Instructeur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Réaffecter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dossiersAvecInstructeur.map(d => {
                  const instructeurActuel = instructeurs.find(i => i.id === d.instructeur_id)
                  return (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-indigo-600 font-mono font-semibold text-sm">{d.numero}</td>
                      <td className="px-6 py-4">
                        <p className="text-gray-800 font-semibold text-sm">{d.demandeur?.prenom} {d.demandeur?.nom}</p>
                        <p className="text-gray-400 text-xs">{d.demandeur?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                          🔵 {instructeurActuel ? `${instructeurActuel.prenom} ${instructeurActuel.nom}` : 'Inconnu'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{badgeStatut(d.statut)}</td>
                      <td className="px-6 py-4">
                        <select
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                          defaultValue=""
                          onChange={e => affecter(d.id, e.target.value)}
                        >
                          <option value="" disabled>Changer...</option>
                          {instructeurs.map(i => (
                            <option key={i.id} value={i.id}>
                              {i.prenom} {i.nom}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default AffectationDossiers