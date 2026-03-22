import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

function EspaceAdmin() {
  const [dossiers, setDossiers] = useState([])
  const [chargement, setChargement] = useState(true)
  const [rechercheNom, setRechercheNom] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
  api.get('/dossiers/')
    .then(r => { setDossiers(r.data); setChargement(false) })
    .catch(() => setChargement(false))
}, [])

  const badgeStatut = (statut) => {
    const styles = {
      brouillon: 'bg-gray-100 text-gray-600',
      depose: 'bg-blue-100 text-blue-700',
      en_instruction: 'bg-yellow-100 text-yellow-700',
      accepte: 'bg-green-100 text-green-700',
      refuse: 'bg-red-100 text-red-600',
      complement_demande: 'bg-orange-100 text-orange-700',
    }
    const labels = {
      brouillon: 'Brouillon', depose: 'Déposé',
      en_instruction: 'En instruction', accepte: 'Accepté',
      refuse: 'Refusé', complement_demande: 'Complément demandé',
    }
    return <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[statut]}`}>{labels[statut]}</span>
  }

  const changerStatut = async (dossierId, nouveauStatut) => {
  try {
    await api.patch(`/dossiers/${dossierId}/statut?statut=${nouveauStatut}`)
    setDossiers(prev => prev.map(d => d.id === dossierId ? { ...d, statut: nouveauStatut } : d))
  } catch (err) { console.error(err) }
}

  const exporterCSV = () => window.open('http://127.0.0.1:8000/dossiers/export/csv', '_blank')

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
        <div className="ml-auto flex items-center gap-4 text-white text-sm">
          <button onClick={() => { localStorage.removeItem('token'); navigate('/') }} className="hover:underline">
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
          <Link to="/admin" className="font-semibold text-blue-900 border-b-2 border-blue-900 pb-1">Espace admin</Link>
          <Link to="/admin/aides" className="hover:text-blue-900">Gestion des aides</Link>
        </div>
      </div>

      {/* Header */}
      <div style={{backgroundColor: '#1a2b5e'}} className="px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📋</span>
            <h1 className="text-3xl font-bold text-white">Espace Administrateur</h1>
          </div>
          <p className="text-blue-200">Gérez et instruisez les dossiers déposés par les demandeurs</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total dossiers', value: dossiers.length, color: 'text-blue-900', bg: 'bg-blue-50', border: 'border-blue-200' },
            { label: 'Brouillons', value: dossiers.filter(d => d.statut === 'brouillon').length, color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
            { label: 'En instruction', value: dossiers.filter(d => d.statut === 'en_instruction').length, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
            { label: 'Acceptés', value: dossiers.filter(d => d.statut === 'accepte').length, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
            { label: 'Refusés', value: dossiers.filter(d => d.statut === 'refuse').length, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} border ${stat.border} rounded-lg p-5 shadow-sm`}>
              <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="🔍 Rechercher par nom ou email..."
              value={rechercheNom}
              onChange={(e) => setRechercheNom(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500"
            />
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="border border-gray-300 rounded px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="depose">Déposé</option>
              <option value="en_instruction">En instruction</option>
              <option value="accepte">Accepté</option>
              <option value="refuse">Refusé</option>
              <option value="complement_demande">Complément demandé</option>
            </select>
            <button
              onClick={exporterCSV}
              className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded transition-colors flex items-center gap-2">
              📥 Exporter CSV
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-3">{dossiersFiltres.length} dossier(s) trouvé(s)</p>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Liste des dossiers</h2>
          </div>

          {chargement ? (
            <p className="text-gray-400 p-8 text-center">Chargement...</p>
          ) : dossiersFiltres.length === 0 ? (
            <p className="text-gray-400 p-8 text-center">Aucun dossier trouvé</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Demandeur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Commentaire</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dossiersFiltres.map(dossier => (
                  <tr key={dossier.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-blue-700 font-semibold">{dossier.numero}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-gray-900">
                        {dossier.demandeur?.prenom} {dossier.demandeur?.nom}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{dossier.demandeur?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{dossier.commentaire || '—'}</td>
                    <td className="px-6 py-4">{badgeStatut(dossier.statut)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => changerStatut(dossier.id, 'accepte')}
                          className="bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors">
                          ✅ Accepter
                        </button>
                        <button onClick={() => changerStatut(dossier.id, 'refuse')}
                          className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded transition-colors">
                          ❌ Refuser
                        </button>
                        <button onClick={() => changerStatut(dossier.id, 'en_instruction')}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors">
                          🔍 Instruire
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

export default EspaceAdmin