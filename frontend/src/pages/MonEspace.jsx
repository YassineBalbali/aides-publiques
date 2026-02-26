import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function MonEspace() {
  const [dossiers, setDossiers] = useState([])
  const [chargement, setChargement] = useState(true)
  const [utilisateur, setUtilisateur] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const payload = JSON.parse(atob(token.split('.')[1]))
    setUtilisateur(payload)

    fetch('http://127.0.0.1:8000/dossiers/')
      .then(res => res.json())
      .then(data => {
        const mesDossiers = data.filter(d => d.demandeur_id === payload.sub)
        setDossiers(mesDossiers)
        setChargement(false)
      })
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
      brouillon: '⏳ Brouillon',
      depose: '📤 Déposé',
      en_instruction: '📋 En instruction',
      accepte: '✅ Accepté',
      refuse: '❌ Refusé',
      complement_demande: '📎 Complément requis',
    }
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[statut] || 'bg-gray-100 text-gray-600'}`}>
        {labels[statut] || statut}
      </span>
    )
  }

  return (
    <div style={{ backgroundColor: '#1a2744', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="px-8 py-4 flex items-center justify-between border-b border-blue-800">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
          <span>🏛️</span><span>AidesPubliques</span>
        </Link>
        <div className="flex items-center gap-8 text-white">
          <Link to="/aides" className="hover:text-yellow-400">Catalogue</Link>
          <Link to="/deposer" className="hover:text-yellow-400">Déposer</Link>
          <Link to="/mon-espace" className="text-yellow-400 font-semibold">Mon Espace</Link>
        </div>
        <button
          onClick={() => { localStorage.removeItem('token'); navigate('/login') }}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm">
          Se déconnecter
        </button>
      </nav>

      <div className="px-12 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">Mon Espace</h1>
        <p className="text-gray-400 mb-8">Suivez l'avancement de vos demandes d'aides</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total dossiers', value: dossiers.length, color: 'text-white', icon: '📁' },
            { label: 'En cours', value: dossiers.filter(d => d.statut === 'en_instruction').length, color: 'text-yellow-400', icon: '📋' },
            { label: 'Acceptés', value: dossiers.filter(d => d.statut === 'accepte').length, color: 'text-green-400', icon: '✅' },
            { label: 'Refusés', value: dossiers.filter(d => d.statut === 'refuse').length, color: 'text-red-400', icon: '❌' },
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

        {/* Liste dossiers */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Mes dossiers</h2>
            <Link to="/deposer"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              + Nouvelle demande
            </Link>
          </div>

          {chargement ? (
            <p className="text-gray-400 p-8 text-center">Chargement...</p>
          ) : dossiers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-gray-500 font-semibold mb-2">Aucun dossier pour le moment</p>
              <Link to="/deposer" className="text-blue-600 hover:underline text-sm">
                Déposer ma première demande →
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Commentaire</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dossiers.map(dossier => (
                  <tr key={dossier.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-blue-600 font-bold">{dossier.numero}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dossier.commentaire || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(dossier.cree_le).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">{badgeStatut(dossier.statut)}</td>
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

export default MonEspace