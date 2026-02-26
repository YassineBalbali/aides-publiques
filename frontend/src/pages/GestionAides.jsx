import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function GestionAides() {
  const [aides, setAides] = useState([])
  const [chargement, setChargement] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [aideEnEdition, setAideEnEdition] = useState(null)
  const [form, setForm] = useState({
    titre: '', description: '', type_aide: 'subvention',
    montant_min: '', montant_max: '', organisme_financeur: '', statut: 'active'
  })

  useEffect(() => {
    chargerAides()
  }, [])

  const chargerAides = () => {
    fetch('http://127.0.0.1:8000/aides/')
      .then(res => res.json())
      .then(data => { setAides(data); setChargement(false) })
      .catch(() => setChargement(false))
  }

  const ouvrirFormulaire = (aide = null) => {
    if (aide) {
      setForm({
        titre: aide.titre,
        description: aide.description || '',
        type_aide: aide.type_aide,
        montant_min: aide.montant_min || '',
        montant_max: aide.montant_max || '',
        organisme_financeur: aide.organisme_financeur || '',
        statut: aide.statut
      })
      setAideEnEdition(aide)
    } else {
      setForm({ titre: '', description: '', type_aide: 'subvention', montant_min: '', montant_max: '', organisme_financeur: '', statut: 'active' })
      setAideEnEdition(null)
    }
    setShowForm(true)
  }

  const sauvegarder = async () => {
    const url = aideEnEdition
      ? `http://127.0.0.1:8000/aides/${aideEnEdition.id}`
      : 'http://127.0.0.1:8000/aides/'
    const method = aideEnEdition ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        montant_min: form.montant_min ? parseFloat(form.montant_min) : null,
        montant_max: form.montant_max ? parseFloat(form.montant_max) : null,
      })
    })

    if (response.ok) {
      setShowForm(false)
      chargerAides()
    }
  }

  const supprimerAide = async (id) => {
    if (!confirm('Supprimer cette aide ?')) return
    await fetch(`http://127.0.0.1:8000/aides/${id}`, { method: 'DELETE' })
    chargerAides()
  }

  const badgeType = (type) => {
    const styles = {
      subvention: 'bg-blue-100 text-blue-700',
      pret: 'bg-purple-100 text-purple-700',
      exoneration: 'bg-green-100 text-green-700',
      formation: 'bg-orange-100 text-orange-700',
    }
    return <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[type] || 'bg-gray-100 text-gray-600'}`}>{type}</span>
  }

  return (
    <div style={{ backgroundColor: '#1a2744', minHeight: '100vh' }}>
      <nav className="px-8 py-4 flex items-center justify-between border-b border-blue-800">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <span>🏛️</span><span>AidesPubliques</span>
        </Link>
        <div className="flex items-center gap-8 text-white">
          <Link to="/admin" className="hover:text-yellow-400">Dossiers</Link>
          <Link to="/admin/aides" className="text-yellow-400 font-semibold">Gestion Aides</Link>
        </div>
      </nav>

      <div className="px-12 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestion des Aides</h1>
            <p className="text-gray-400">Créez, modifiez et supprimez les aides disponibles</p>
          </div>
          <button
            onClick={() => ouvrirFormulaire()}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-xl transition-colors">
            + Nouvelle aide
          </button>
        </div>

        {/* Modal formulaire */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {aideEnEdition ? 'Modifier une aide' : 'Nouvelle aide'}
              </h2>
              <div className="space-y-4">
                <input
                  placeholder="Titre de l'aide"
                  value={form.titre}
                  onChange={e => setForm({ ...form, titre: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={form.type_aide}
                    onChange={e => setForm({ ...form, type_aide: e.target.value })}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none">
                    <option value="subvention">Subvention</option>
                    <option value="pret">Prêt</option>
                    <option value="exoneration">Exonération</option>
                    <option value="formation">Formation</option>
                  </select>
                  <select
                    value={form.statut}
                    onChange={e => setForm({ ...form, statut: e.target.value })}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="Montant min (€)"
                    type="number"
                    value={form.montant_min}
                    onChange={e => setForm({ ...form, montant_min: e.target.value })}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none"
                  />
                  <input
                    placeholder="Montant max (€)"
                    type="number"
                    value={form.montant_max}
                    onChange={e => setForm({ ...form, montant_max: e.target.value })}
                    className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none"
                  />
                </div>
                <input
                  placeholder="Organisme financeur"
                  value={form.organisme_financeur}
                  onChange={e => setForm({ ...form, organisme_financeur: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={sauvegarder}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
                  {aideEnEdition ? '✓ Modifier' : '+ Créer'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tableau des aides */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">{aides.length} aides disponibles</h2>
          </div>
          {chargement ? (
            <p className="text-gray-400 p-6">Chargement...</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Titre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Organisme</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {aides.map(aide => (
                  <tr key={aide.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-800 max-w-xs truncate">{aide.titre}</td>
                    <td className="px-6 py-4">{badgeType(aide.type_aide)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {aide.montant_min && aide.montant_max
                        ? `${aide.montant_min}€ - ${aide.montant_max}€`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{aide.organisme_financeur || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${aide.statut === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {aide.statut === 'active' ? '✅ Active' : '⏸ Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => ouvrirFormulaire(aide)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => supprimerAide(aide.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-3 py-1 rounded-lg transition-colors">
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

export default GestionAides