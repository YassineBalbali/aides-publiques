import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function EspaceInstructeur() {
  const [dossiers, setDossiers] = useState([])
  const [chargement, setChargement] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('')
  const [rechercheNom, setRechercheNom] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const instructeurId = payload.sub // ID de l'instructeur connecté

      fetch('http://127.0.0.1:8000/dossiers/')
        .then(r => r.json())
        .then(data => {
          // Filtrer uniquement les dossiers affectés à cet instructeur
          const mesDossiers = data.filter(d => d.instructeur_id === instructeurId)
          setDossiers(mesDossiers)
          setChargement(false)
        })
        .catch(() => setChargement(false))
    } catch {
      navigate('/login')
    }
  }, [])

  const changerStatut = async (dossierId, nouveauStatut) => {
    const response = await fetch(
      `http://127.0.0.1:8000/dossiers/${dossierId}/statut?statut=${nouveauStatut}`,
      { method: 'PATCH' }
    )
    if (response.ok) {
      setDossiers(prev => prev.map(d =>
        d.id === dossierId ? { ...d, statut: nouveauStatut } : d
      ))
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

  const dossiersFiltres = dossiers.filter(d => {
    const nomComplet = `${d.demandeur?.prenom || ''} ${d.demandeur?.nom || ''} ${d.demandeur?.email || ''}`.toLowerCase()
    const matchNom = nomComplet.includes(rechercheNom.toLowerCase())
    const matchStatut = filtreStatut ? d.statut === filtreStatut : true
    return matchNom && matchStatut
  })

  return (
    <div style={{backgroundColor: '#0f172a', minHeight: '100vh'}}>
      {/* Navbar */}
      <nav style={{backgroundColor: '#1e293b'}} className="px-8 py-4 flex items-center justify-between border-b border-slate-700">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <span>🏛️</span><span>AidesPubliques</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <Link to="/instructeur" className="text-indigo-400 font-semibold">📁 Mes dossiers</Link>
          <Link to="/instructeur/dashboard" className="hover:text-white transition-colors">📊 Dashboard</Link>
        </div>
        <button
          onClick={() => { localStorage.removeItem('token'); navigate('/') }}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          Se déconnecter
        </button>
      </nav>

      <div className="px-10 py-8">
        <h1 className="text-3xl font-bold text-white mb-1">Espace Instructeur</h1>
        <p className="text-slate-400 mb-8">Traitez les dossiers qui vous sont affectés</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: dossiers.length, color: 'text-white', icon: '📁' },
            { label: 'En attente', value: dossiers.filter(d => d.statut === 'depose').length, color: 'text-blue-400', icon: '⏳' },
            { label: 'En instruction', value: dossiers.filter(d => d.statut === 'en_instruction').length, color: 'text-yellow-400', icon: '📋' },
            { label: 'Traités', value: dossiers.filter(d => d.statut === 'accepte' || d.statut === 'refuse').length, color: 'text-green-400', icon: '✅' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span>{stat.icon}</span>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom ou email..."
            value={rechercheNom}
            onChange={e => setRechercheNom(e.target.value)}
            className="flex-1 bg-white rounded-xl px-5 py-3 text-gray-800 focus:outline-none shadow-lg"
          />
          <select
            value={filtreStatut}
            onChange={e => setFiltreStatut(e.target.value)}
            className="bg-white rounded-xl px-5 py-3 text-gray-800 focus:outline-none shadow-lg"
          >
            <option value="">Tous les statuts</option>
            <option value="depose">Déposé</option>
            <option value="en_instruction">En instruction</option>
            <option value="accepte">Accepté</option>
            <option value="refuse">Refusé</option>
          </select>
        </div>

        <p className="text-slate-400 text-sm mb-4">{dossiersFiltres.length} dossier(s) trouvé(s)</p>

        {/* Tableau */}
        <div style={{backgroundColor: '#1e293b'}} className="rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-white font-bold text-lg">Mes dossiers affectés</h2>
          </div>

          {chargement ? (
            <p className="text-slate-400 p-6 text-center">Chargement...</p>
          ) : dossiersFiltres.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400 text-lg mb-2">Aucun dossier affecté</p>
              <p className="text-slate-500 text-sm">L'administrateur doit vous affecter des dossiers depuis la page Affectations</p>
            </div>
          ) : (
            <table className="w-full">
              <thead style={{backgroundColor: '#0f172a'}}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Demandeur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Commentaire</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {dossiersFiltres.map(dossier => (
                  <tr key={dossier.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-indigo-400 font-mono font-semibold text-sm">{dossier.numero}</td>
                    <td className="px-6 py-4">
                      <p className="text-white font-semibold text-sm">{dossier.demandeur?.prenom} {dossier.demandeur?.nom}</p>
                      <p className="text-slate-400 text-xs">{dossier.demandeur?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm max-w-xs truncate">{dossier.commentaire || '—'}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(dossier.cree_le).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">{badgeStatut(dossier.statut)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => changerStatut(dossier.id, 'accepte')}
                          className="bg-green-900/50 hover:bg-green-800 text-green-400 text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
                          ✓ Accepter
                        </button>
                        <button
                          onClick={() => changerStatut(dossier.id, 'refuse')}
                          className="bg-red-900/50 hover:bg-red-800 text-red-400 text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
                          ✗ Refuser
                        </button>
                        <button
                          onClick={() => changerStatut(dossier.id, 'en_instruction')}
                          className="bg-yellow-900/50 hover:bg-yellow-800 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
                          📋 Instruire
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

export default EspaceInstructeur