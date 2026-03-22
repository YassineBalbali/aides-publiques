import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

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
      const instructeurId = payload.sub
      api.get('/dossiers/')
        .then(r => {
          setDossiers(r.data.filter(d => d.instructeur_id === instructeurId))
          setChargement(false)
        })
        .catch(() => setChargement(false))
    } catch {
      navigate('/login')
    }
  }, [])

  const changerStatut = async (dossierId, nouveauStatut) => {
    try {
      await api.patch(`/dossiers/${dossierId}/statut?statut=${nouveauStatut}`)
      setDossiers(prev => prev.map(d =>
        d.id === dossierId ? { ...d, statut: nouveauStatut } : d
      ))
    } catch (err) { console.error(err) }
  }

  const badgeStatut = (statut) => {
    const styles = {
      brouillon: 'bg-gray-100 text-gray-600',
      depose: 'bg-blue-100 text-blue-800',
      en_instruction: 'bg-yellow-100 text-yellow-800',
      accepte: 'bg-green-100 text-green-800',
      refuse: 'bg-red-100 text-red-800',
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
          <Link to="/instructeur" className="text-blue-900 font-semibold border-b-2 border-blue-900 pb-1">Mes dossiers</Link>
          <Link to="/instructeur/dashboard" className="hover:text-blue-900">Dashboard</Link>
        </div>
      </div>

      {/* Header */}
      <div style={{backgroundColor: '#1a2b5e'}} className="px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Espace Instructeur</h1>
          <p className="text-blue-200">Traitez les dossiers qui vous sont affectés</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total dossiers', value: dossiers.length, color: 'text-blue-900', bg: 'bg-blue-50 border-blue-200', icon: '📁' },
            { label: 'En attente', value: dossiers.filter(d => d.statut === 'depose').length, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: '⏳' },
            { label: 'En instruction', value: dossiers.filter(d => d.statut === 'en_instruction').length, color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: '📋' },
            { label: 'Traités', value: dossiers.filter(d => d.statut === 'accepte' || d.statut === 'refuse').length, color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: '✅' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} border rounded-xl p-5`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{stat.icon}</span>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom ou email..."
            value={rechercheNom}
            onChange={e => setRechercheNom(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-900 text-sm"
          />
          <select
            value={filtreStatut}
            onChange={e => setFiltreStatut(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="depose">Déposé</option>
            <option value="en_instruction">En instruction</option>
            <option value="accepte">Accepté</option>
            <option value="refuse">Refusé</option>
          </select>
        </div>

        <p className="text-gray-500 text-sm mb-4">{dossiersFiltres.length} dossier(s) trouvé(s)</p>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-gray-900 font-bold text-lg">Mes dossiers affectés</h2>
          </div>

          {chargement ? (
            <p className="text-gray-400 p-6 text-center">Chargement...</p>
          ) : dossiersFiltres.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-lg mb-2">Aucun dossier affecté</p>
              <p className="text-gray-400 text-sm">L'administrateur doit vous affecter des dossiers</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Demandeur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Commentaire</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dossiersFiltres.map(dossier => (
                  <tr key={dossier.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-blue-700 font-mono font-semibold text-sm">{dossier.numero}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-semibold text-sm">{dossier.demandeur?.prenom} {dossier.demandeur?.nom}</p>
                      <p className="text-gray-400 text-xs">{dossier.demandeur?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">{dossier.commentaire || '—'}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(dossier.cree_le).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">{badgeStatut(dossier.statut)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => changerStatut(dossier.id, 'accepte')}
                          className="bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
                          ✓ Accepter
                        </button>
                        <button onClick={() => changerStatut(dossier.id, 'refuse')}
                          className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
                          ✗ Refuser
                        </button>
                        <button onClick={() => changerStatut(dossier.id, 'en_instruction')}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
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

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-10 mt-10">
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
              <h3 className="text-gray-700 font-semibold text-sm mb-3">Espace instructeur</h3>
              <div className="flex flex-col gap-2">
                <Link to="/instructeur" className="text-gray-400 hover:text-gray-700 text-xs">Mes dossiers</Link>
                <Link to="/instructeur/dashboard" className="text-gray-400 hover:text-gray-700 text-xs">Dashboard</Link>
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
    </div>
  )
}

export default EspaceInstructeur
