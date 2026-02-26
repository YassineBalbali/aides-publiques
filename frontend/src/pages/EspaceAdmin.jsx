import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function EspaceAdmin() {
  const [dossiers, setDossiers] = useState([])
  const [chargement, setChargement] = useState(true)
  const [rechercheNom, setRechercheNom] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/dossiers/')
      .then(res => res.json())
      .then(data => { setDossiers(data); setChargement(false) })
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
      brouillon: 'Brouillon',
      depose: 'Déposé',
      en_instruction: 'En instruction',
      accepte: 'Accepté',
      refuse: 'Refusé',
      complement_demande: 'Complément demandé',
    }
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[statut]}`}>
        {labels[statut]}
      </span>
    )
  }

  const changerStatut = async (dossierId, nouveauStatut) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/dossiers/${dossierId}/statut?statut=${nouveauStatut}`,
        { method: 'PATCH' }
      )
      if (response.ok) {
        setDossiers(prev => prev.map(d =>
          d.id === dossierId ? { ...d, statut: nouveauStatut } : d
        ))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const exporterCSV = () => {
    window.open('http://127.0.0.1:8000/dossiers/export/csv', '_blank')
  }

  const dossiersFiltres = dossiers.filter(d => {
    const nomComplet = `${d.demandeur?.prenom || ''} ${d.demandeur?.nom || ''} ${d.demandeur?.email || ''}`.toLowerCase()
    const matchNom = nomComplet.includes(rechercheNom.toLowerCase())
    const matchStatut = filtreStatut ? d.statut === filtreStatut : true
    return matchNom && matchStatut
  })

  return (
    <div style={{backgroundColor: '#1a2744', minHeight: '100vh'}}>
      <nav className="px-8 py-4 flex items-center justify-between border-b border-blue-800">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <span>🏛️</span><span>AidesPubliques</span>
        </Link>
        <div className="flex items-center gap-8 text-white">
          <Link to="/aides" className="hover:text-yellow-400">Catalogue</Link>
          <Link to="/deposer" className="hover:text-yellow-400">Déposer</Link>
          <Link to="/admin" className="text-yellow-400 font-semibold">Admin</Link>
        </div>
      </nav>

      <div className="px-12 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">Espace Administrateur</h1>
        <p className="text-gray-400 mb-8">Gérez les dossiers déposés par les demandeurs</p>

        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total dossiers', value: dossiers.length, color: 'text-white' },
            { label: 'Brouillons', value: dossiers.filter(d => d.statut === 'brouillon').length, color: 'text-gray-400' },
            { label: 'En instruction', value: dossiers.filter(d => d.statut === 'en_instruction').length, color: 'text-yellow-400' },
            { label: 'Acceptés', value: dossiers.filter(d => d.statut === 'accepte').length, color: 'text-green-400' },
            { label: 'Refusés', value: dossiers.filter(d => d.statut === 'refuse').length, color: 'text-red-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-blue-900 rounded-xl p-5">
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={rechercheNom}
            onChange={(e) => setRechercheNom(e.target.value)}
            className="flex-1 bg-white rounded-xl px-5 py-3 text-gray-800 focus:outline-none shadow-lg"
          />
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="bg-white rounded-xl px-5 py-3 text-gray-800 focus:outline-none shadow-lg"
          >
            <option value="">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="depose">Déposé</option>
            <option value="en_instruction">En instruction</option>
            <option value="accepte">Accepté</option>
            <option value="refuse">Refusé</option>
            <option value="complement_demande">Complément demandé</option>
          </select>
        </div>

        <p className="text-gray-400 text-sm mb-4">{dossiersFiltres.length} dossier(s) trouvé(s)</p>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Liste des dossiers</h2>
            <button
              onClick={exporterCSV}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              Exporter CSV
            </button>
          </div>

          {chargement ? (
            <p className="text-gray-400 p-6">Chargement...</p>
          ) : dossiersFiltres.length === 0 ? (
            <p className="text-gray-400 p-6 text-center">Aucun dossier trouvé</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Demandeur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Commentaire</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dossiersFiltres.map(dossier => (
                  <tr key={dossier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm text-blue-600 font-semibold">{dossier.numero}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="font-semibold text-gray-800">
                        {dossier.demandeur?.prenom} {dossier.demandeur?.nom}
                      </div>
                      <div className="text-xs text-gray-400">{dossier.demandeur?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{dossier.commentaire || '-'}</td>
                    <td className="px-6 py-4">{badgeStatut(dossier.statut)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => changerStatut(dossier.id, 'accepte')}
                          className="bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
                          Accepter
                        </button>
                        <button
                          onClick={() => changerStatut(dossier.id, 'refuse')}
                          className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
                          Refuser
                        </button>
                        <button
                          onClick={() => changerStatut(dossier.id, 'en_instruction')}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
                          Instruire
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

export default EspaceAdmin