import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

function GestionAides() {
  const [aides, setAides] = useState([])
  const [chargement, setChargement] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [aideEnEdition, setAideEnEdition] = useState(null)
  const [form, setForm] = useState({
    titre: '', description: '', type_aide: 'subvention',
    montant_min: '', montant_max: '', organisme_financeur: '',
    statut: 'active', beneficiaires: '', date_ouverture: '',
    date_fermeture: '', documents_requis: '', criteres_eligibilite: '',
    lien_externe: ''
  })
  const navigate = useNavigate()

  useEffect(() => { chargerAides() }, [])

  const chargerAides = () => {
  api.get('/aides/')
    .then(r => { setAides(r.data); setChargement(false) })
    .catch(() => setChargement(false))
}

  const ouvrirFormulaire = (aide = null) => {
    if (aide) {
      setForm({
        titre: aide.titre || '', description: aide.description || '',
        type_aide: aide.type_aide || 'subvention', montant_min: aide.montant_min || '',
        montant_max: aide.montant_max || '', organisme_financeur: aide.organisme_financeur || '',
        statut: aide.statut || 'active', beneficiaires: aide.beneficiaires || '',
        date_ouverture: aide.date_ouverture || '', date_fermeture: aide.date_fermeture || '',
        documents_requis: aide.documents_requis || '', criteres_eligibilite: aide.criteres_eligibilite || '',
        lien_externe: aide.lien_externe || ''
      })
      setAideEnEdition(aide)
    } else {
      setForm({
        titre: '', description: '', type_aide: 'subvention',
        montant_min: '', montant_max: '', organisme_financeur: '',
        statut: 'active', beneficiaires: '', date_ouverture: '',
        date_fermeture: '', documents_requis: '', criteres_eligibilite: '', lien_externe: ''
      })
      setAideEnEdition(null)
    }
    setShowForm(true)
  }

  const sauvegarder = async () => {
  const data = {
    ...form,
    montant_min: form.montant_min ? parseFloat(form.montant_min) : null,
    montant_max: form.montant_max ? parseFloat(form.montant_max) : null,
    date_ouverture: form.date_ouverture || null,
    date_fermeture: form.date_fermeture || null,
  }
  if (aideEnEdition) {
    await api.put(`/aides/${aideEnEdition.id}`, data)
  } else {
    await api.post('/aides/', data)
  }
  setShowForm(false)
  chargerAides()
}

  const supprimerAide = async (id) => {
  if (!confirm('Supprimer cette aide ?')) return
  await api.delete(`/aides/${id}`)
  chargerAides()
}

  const badgeType = (type) => {
    const styles = {
      subvention: 'bg-blue-100 text-blue-700', pret: 'bg-purple-100 text-purple-700',
      exoneration: 'bg-green-100 text-green-700', formation: 'bg-orange-100 text-orange-700',
    }
    const labels = { subvention: 'Subvention', pret: 'Prêt', exoneration: 'Exonération', formation: 'Formation' }
    return <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[type] || 'bg-gray-100'}`}>{labels[type] || type}</span>
  }

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
          <Link to="/admin/aides" className="font-semibold text-blue-900 border-b-2 border-blue-900 pb-1">Gestion des aides</Link>
        </div>
      </div>

      {/* Header */}
      <div style={{backgroundColor: '#1a2b5e'}} className="px-8 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🗂️</span>
              <h1 className="text-3xl font-bold text-white">Gestion des Aides</h1>
            </div>
            <p className="text-blue-200">Créez, modifiez et supprimez les aides disponibles</p>
          </div>
          <button onClick={() => ouvrirFormulaire()}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded transition-colors flex items-center gap-2">
            + Nouvelle aide
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total aides', value: aides.length, color: 'text-blue-900', bg: 'bg-blue-50', border: 'border-blue-200' },
            { label: 'Actives', value: aides.filter(a => a.statut === 'active').length, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
            { label: 'À venir', value: aides.filter(a => a.statut === 'a_venir').length, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
            { label: 'Clôturées', value: aides.filter(a => a.statut === 'cloturee').length, color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} border ${stat.border} rounded-lg p-5 shadow-sm`}>
              <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">{aides.length} aide(s) disponible(s)</h2>
          </div>
          {chargement ? (
            <p className="text-gray-400 p-8 text-center">Chargement...</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Titre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bénéficiaires</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {aides.map(aide => (
                  <tr key={aide.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 max-w-xs truncate">{aide.titre}</p>
                      {aide.organisme_financeur && <p className="text-xs text-gray-400 mt-0.5">{aide.organisme_financeur}</p>}
                    </td>
                    <td className="px-6 py-4">{badgeType(aide.type_aide)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{aide.beneficiaires || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {aide.montant_min && aide.montant_max ? `${aide.montant_min}€ — ${aide.montant_max}€` : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {aide.date_ouverture ? (
                        <div>
                          <p>📅 {new Date(aide.date_ouverture).toLocaleDateString('fr-FR')}</p>
                          {aide.date_fermeture && <p>🔚 {new Date(aide.date_fermeture).toLocaleDateString('fr-FR')}</p>}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        aide.statut === 'active' ? 'bg-green-100 text-green-700' :
                        aide.statut === 'a_venir' ? 'bg-blue-100 text-blue-700' :
                        aide.statut === 'cloturee' ? 'bg-gray-100 text-gray-500' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {aide.statut === 'active' ? '✅ Active' :
                         aide.statut === 'a_venir' ? '🕐 À venir' :
                         aide.statut === 'cloturee' ? '🔒 Clôturée' : '⏸ Suspendue'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => ouvrirFormulaire(aide)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors">
                          ✏️ Modifier
                        </button>
                        <button onClick={() => supprimerAide(aide.id)}
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

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 py-8 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl shadow-2xl mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              {aideEnEdition ? '✏️ Modifier une aide' : '➕ Nouvelle aide'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input placeholder="Ex: Aide à la transition écologique des PME"
                  value={form.titre} onChange={e => setForm({...form, titre: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea placeholder="Description détaillée de l'aide..."
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500 h-24 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type d'aide</label>
                  <select value={form.type_aide} onChange={e => setForm({...form, type_aide: e.target.value})}
                    className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500">
                    <option value="subvention">Subvention</option>
                    <option value="pret">Prêt</option>
                    <option value="exoneration">Exonération</option>
                    <option value="formation">Formation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select value={form.statut} onChange={e => setForm({...form, statut: e.target.value})}
                    className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500">
                    <option value="active">Active</option>
                    <option value="a_venir">À venir</option>
                    <option value="cloturee">Clôturée</option>
                    <option value="suspendue">Suspendue</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaires éligibles</label>
                <div className="flex gap-4">
                  {['Particuliers', 'Entreprises', 'Associations'].map(b => (
                    <label key={b} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox"
                        checked={form.beneficiaires.includes(b)}
                        onChange={e => {
                          const list = form.beneficiaires ? form.beneficiaires.split(',').map(s => s.trim()).filter(Boolean) : []
                          if (e.target.checked) list.push(b)
                          else list.splice(list.indexOf(b), 1)
                          setForm({...form, beneficiaires: list.join(', ')})
                        }}
                        className="accent-blue-600" />
                      <span className="text-sm text-gray-700">{b}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant minimum (€)</label>
                  <input type="number" placeholder="0" value={form.montant_min}
                    onChange={e => setForm({...form, montant_min: e.target.value})}
                    className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant maximum (€)</label>
                  <input type="number" placeholder="100000" value={form.montant_max}
                    onChange={e => setForm({...form, montant_max: e.target.value})}
                    className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'ouverture</label>
                  <input type="date" value={form.date_ouverture}
                    onChange={e => setForm({...form, date_ouverture: e.target.value})}
                    className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fermeture</label>
                  <input type="date" value={form.date_fermeture}
                    onChange={e => setForm({...form, date_fermeture: e.target.value})}
                    className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organisme financeur</label>
                <input placeholder="Ex: Ministère de l'Économie" value={form.organisme_financeur}
                  onChange={e => setForm({...form, organisme_financeur: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Documents requis</label>
                <textarea placeholder="Ex: Pièce d'identité, RIB, Kbis..." value={form.documents_requis}
                  onChange={e => setForm({...form, documents_requis: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500 h-20 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Critères d'éligibilité</label>
                <textarea placeholder="Ex: Être une PME de moins de 50 salariés..." value={form.criteres_eligibilite}
                  onChange={e => setForm({...form, criteres_eligibilite: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500 h-20 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lien externe</label>
                <input placeholder="https://www.gouvernement.fr/aide/..." value={form.lien_externe}
                  onChange={e => setForm({...form, lien_externe: e.target.value})}
                  className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={sauvegarder}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded transition-colors">
                {aideEnEdition ? '✓ Modifier' : '+ Créer'}
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

export default GestionAides